const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const Expo = require('../models/Expo');
const Booth = require('../models/Booth');
const Session = require('../models/Session');
const Registration = require('../models/Registration');
const { recommendExhibitors } = require('../utils/aiRecommender');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('attendee'));

/* ─── Browse published expos ─── */
router.get('/expos', async (req, res) => {
  try {
    const expos = await Expo.find({ status: { $in: ['published', 'ongoing'] } })
      .populate('organizer', 'name')
      .sort({ startDate: 1 });
    res.json({ success: true, data: expos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Register for an expo + generate QR badge ─── */
router.post('/register/:expoId', async (req, res) => {
  try {
    const existing = await Registration.findOne({ user: req.user._id, expo: req.params.expoId, role: 'attendee' });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered' });

    const expo = await Expo.findById(req.params.expoId);
    if (!expo) return res.status(404).json({ success: false, message: 'Expo not found' });

    // Generate unique badge ID and QR code
    const badgeId = `EVT-${uuidv4().split('-')[0].toUpperCase()}`;
    const qrData = JSON.stringify({
      badgeId,
      attendee: req.user.name,
      expo: expo.title,
      expoId: expo._id,
      userId: req.user._id,
    });
    const qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });

    const reg = await Registration.create({
      user: req.user._id,
      expo: req.params.expoId,
      role: 'attendee',
      status: 'approved',
      badgeId,
      qrCode,
      interests: req.body.interests || req.user.interests || [],
    });

    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── My registrations ─── */
router.get('/my-registrations', async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user._id, role: 'attendee' })
      .populate('expo', 'title startDate endDate location status bannerColor')
      .populate('sessions', 'title startTime speaker');
    res.json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Get QR badge ─── */
router.get('/badge/:expoId', async (req, res) => {
  try {
    const reg = await Registration.findOne({ user: req.user._id, expo: req.params.expoId, role: 'attendee' })
      .populate('expo', 'title startDate endDate location');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, data: { badge: reg, user: req.user } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Browse sessions for an expo ─── */
router.get('/sessions/:expoId', async (req, res) => {
  try {
    const sessions = await Session.find({ expo: req.params.expoId }).sort('startTime');
    const userId = req.user._id.toString();
    const enriched = sessions.map((s) => ({
      ...s.toObject(),
      isRegistered: s.registeredAttendees.map(String).includes(userId),
      seatsLeft: s.capacity - s.registeredAttendees.length,
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Book / unbook a session ─── */
router.put('/sessions/:sessionId/book', async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const userId = req.user._id;
    const alreadyBooked = session.registeredAttendees.includes(userId);

    if (alreadyBooked) {
      session.registeredAttendees.pull(userId);
    } else {
      if (session.registeredAttendees.length >= session.capacity) {
        return res.status(400).json({ success: false, message: 'Session is fully booked' });
      }
      session.registeredAttendees.push(userId);
    }

    await session.save();

    // Sync with registration
    await Registration.findOneAndUpdate(
      { user: userId, expo: session.expo, role: 'attendee' },
      alreadyBooked
        ? { $pull: { sessions: session._id } }
        : { $addToSet: { sessions: session._id } }
    );

    req.io.to(`expo-${session.expo}`).emit('session-updated', {
      sessionId: session._id,
      seats: session.capacity - session.registeredAttendees.length,
    });

    res.json({ success: true, data: { booked: !alreadyBooked, session } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── AI Recommendations ─── */
router.get('/recommendations/:expoId', async (req, res) => {
  try {
    const reg = await Registration.findOne({ user: req.user._id, expo: req.params.expoId, role: 'attendee' });
    const interests = reg?.interests?.length ? reg.interests : req.user.interests || [];

    // Get all exhibitor booths for this expo with tags
    const booths = await Booth.find({ expo: req.params.expoId, status: { $ne: 'available' } })
      .populate('exhibitor', 'name company bio');

    const exhibitorData = booths.map((b) => ({
      _id: b._id,
      name: b.exhibitor?.name || 'Unknown',
      company: b.exhibitor?.company || '',
      boothNumber: b.boothNumber,
      tags: b.tags,
      category: b.category,
      products: b.products,
      services: b.services,
      description: b.description,
      exhibitorId: b.exhibitor?._id,
    }));

    const recommendations = recommendExhibitors(interests, exhibitorData);
    res.json({ success: true, data: recommendations, interests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Floor plan (public view) ─── */
router.get('/floor/:expoId', async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.expoId).select('floorPlan title');
    const booths = await Booth.find({ expo: req.params.expoId }).populate('exhibitor', 'name company');
    res.json({ success: true, data: { floorPlan: expo.floorPlan, booths } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
