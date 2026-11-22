// ── backend/routes/reviews.js ────────────────────────────────────────────
const express = require('express');
const Review  = require('../models/Review');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/reviews  — submit a review
router.post('/', protect, async (req, res) => {
  const { expoId, rating, comment } = req.body;
  if (!expoId || !rating) return res.status(400).json({ success:false, message:'expoId and rating required' });
  try {
    const existing = await Review.findOne({ user: req.user._id, expo: expoId });
    if (existing) {
      existing.rating  = rating;
      existing.comment = comment;
      await existing.save();
      return res.json({ success:true, data: existing });
    }
    const review = await Review.create({ user: req.user._id, expo: expoId, rating, comment });
    res.status(201).json({ success:true, data: review });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

// GET /api/reviews/:expoId  — get all reviews for an expo
router.get('/:expoId', async (req, res) => {
  try {
    const reviews = await Review.find({ expo: req.params.expoId })
      .populate('user','name')
      .sort({ createdAt: -1 });
    res.json({ success:true, data: reviews });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

// GET /api/reviews/:expoId/mine  — check if current user reviewed
router.get('/:expoId/mine', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ user: req.user._id, expo: req.params.expoId });
    res.json({ success:true, data: review });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

module.exports = router;


// ── backend/routes/notifications.js ─────────────────────────────────────
const notifRouter     = express.Router();
const Notification    = require('../models/Notification');

// GET /api/notifications
notifRouter.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success:true, data: notifs });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

// PUT /api/notifications/read-all
notifRouter.put('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success:true });
});

// PUT /api/notifications/:id/read
notifRouter.put('/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success:true });
});

module.exports = { reviewRouter: router, notifRouter };
