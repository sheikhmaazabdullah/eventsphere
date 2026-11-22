const express = require('express');
const Expo = require('../models/Expo');
const Booth = require('../models/Booth');
const Session = require('../models/Session');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const expoRouter = express.Router();
const messageRouter = express.Router();

/* ═══════════════════════════════
   PUBLIC EXPO ROUTES
═══════════════════════════════ */

// GET /api/expo  – all published expos (public)
expoRouter.get('/', async (req, res) => {
  try {
    const expos = await Expo.find({ status: { $in: ['published', 'ongoing'] } })
      .populate('organizer', 'name')
      .sort({ startDate: 1 });
    res.json({ success: true, data: expos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/expo/:id  – single expo details
expoRouter.get('/:id', async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id).populate('organizer', 'name email');
    if (!expo) return res.status(404).json({ success: false, message: 'Expo not found' });
    const [booths, sessions] = await Promise.all([
      Booth.find({ expo: expo._id }).populate('exhibitor', 'name company'),
      Session.find({ expo: expo._id }).sort('startTime'),
    ]);
    res.json({ success: true, data: { expo, booths, sessions } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ═══════════════════════════════
   MESSAGING ROUTES (authenticated)
═══════════════════════════════ */

messageRouter.use(protect);

// POST /api/messages  – send a message
messageRouter.post('/', async (req, res) => {
  try {
    const { receiverId, expoId, content } = req.body;
    const msg = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      expo: expoId,
      content,
    });
    const populated = await msg.populate('sender', 'name role');
    // Push to receiver's room in real-time
    req.io.to(`user-${receiverId}`).emit('new-message', populated);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/messages/conversation/:userId  – conversation thread
messageRouter.get('/conversation/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/messages/inbox  – all conversations (latest msg per user)
messageRouter.get('/inbox', async (req, res) => {
  try {
    const msgs = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .sort({ createdAt: -1 });

    // Deduplicate by the OTHER user
    const seen = new Set();
    const threads = msgs.filter((m) => {
      const otherId = m.sender._id.toString() === req.user._id.toString()
        ? m.receiver._id.toString()
        : m.sender._id.toString();
      if (seen.has(otherId)) return false;
      seen.add(otherId);
      return true;
    });

    res.json({ success: true, data: threads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { expoRouter, messageRouter };
