const express = require('express');
const { body, validationResult } = require('express-validator');
const Expo = require('../models/Expo');
const Booth = require('../models/Booth');
const Session = require('../models/Session');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

/* ══════════════════════════════════════════
   EXPO MANAGEMENT
══════════════════════════════════════════ */

// GET  /api/admin/expos  – list all expos
router.get('/expos', async (req, res) => {
  try {
    const expos = await Expo.find({ organizer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('organizer', 'name email');
    res.json({ success: true, data: expos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET  /api/admin/expos/all  – list ALL expos (for analytics)
router.get('/expos/all', async (req, res) => {
  try {
    const expos = await Expo.find().sort({ createdAt: -1 }).populate('organizer', 'name');
    res.json({ success: true, data: expos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/expos  – create expo
router.post(
  '/expos',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
    body('location').notEmpty().withMessage('Location is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const expo = await Expo.create({ ...req.body, organizer: req.user._id });
      res.status(201).json({ success: true, data: expo });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// PUT /api/admin/expos/:id  – update expo
router.put('/expos/:id', async (req, res) => {
  try {
    const expo = await Expo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expo) return res.status(404).json({ success: false, message: 'Expo not found' });
    req.io.to(`expo-${expo._id}`).emit('expo-updated', expo);
    res.json({ success: true, data: expo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/expos/:id
router.delete('/expos/:id', async (req, res) => {
  try {
    await Expo.findByIdAndDelete(req.params.id);
    await Booth.deleteMany({ expo: req.params.id });
    await Session.deleteMany({ expo: req.params.id });
    await Registration.deleteMany({ expo: req.params.id });
    res.json({ success: true, message: 'Expo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════
   BOOTH MANAGEMENT
══════════════════════════════════════════ */

// GET  /api/admin/booths/:expoId
router.get('/booths/:expoId', async (req, res) => {
  try {
    const booths = await Booth.find({ expo: req.params.expoId }).populate('exhibitor', 'name email company');
    res.json({ success: true, data: booths });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/booths/:expoId  – bulk create booths from floor plan
router.post('/booths/:expoId', async (req, res) => {
  try {
    const { booths } = req.body; // array of booth objects
    const created = await Booth.insertMany(
      booths.map((b) => ({ ...b, expo: req.params.expoId }))
    );
    req.io.to(`expo-${req.params.expoId}`).emit('booths-updated', created);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/booths/assign/:boothId  – assign booth to exhibitor
router.put('/booths/assign/:boothId', async (req, res) => {
  try {
    const { exhibitorId, status } = req.body;
    const booth = await Booth.findByIdAndUpdate(
      req.params.boothId,
      { exhibitor: exhibitorId || null, status: status || 'occupied' },
      { new: true }
    ).populate('exhibitor', 'name email company');
    req.io.to(`expo-${booth.expo}`).emit('booth-status-changed', booth);
    res.json({ success: true, data: booth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════
   SESSION MANAGEMENT
══════════════════════════════════════════ */

// GET  /api/admin/sessions/:expoId
router.get('/sessions/:expoId', async (req, res) => {
  try {
    const sessions = await Session.find({ expo: req.params.expoId }).sort('startTime');
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/sessions/:expoId
router.post('/sessions/:expoId', async (req, res) => {
  try {
    const session = await Session.create({ ...req.body, expo: req.params.expoId });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/sessions/:id
router.put('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/sessions/:id
router.delete('/sessions/:id', async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════
   REGISTRATION / EXHIBITOR MANAGEMENT
══════════════════════════════════════════ */

// GET  /api/admin/registrations/:expoId
router.get('/registrations/:expoId', async (req, res) => {
  try {
    const regs = await Registration.find({ expo: req.params.expoId })
      .populate('user', 'name email phone company')
      .populate('booth', 'boothNumber size')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/registrations/:id/status
router.put('/registrations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const reg = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    req.io.to(`user-${reg.user._id}`).emit('registration-status', { expoId: reg.expo, status });
    res.json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════ */

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const [totalExpos, totalUsers, totalRegistrations, booths] = await Promise.all([
      Expo.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Registration.countDocuments(),
      Booth.find().select('status'),
    ]);

    const boothStats = {
      available: booths.filter((b) => b.status === 'available').length,
      reserved:  booths.filter((b) => b.status === 'reserved').length,
      occupied:  booths.filter((b) => b.status === 'occupied').length,
    };

    const exposByMonth = await Expo.aggregate([
      {
        $group: {
          _id: { month: { $month: '$startDate' }, year: { $year: '$startDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const regsByRole = await Registration.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: { totalExpos, totalUsers, totalRegistrations, boothStats, exposByMonth, regsByRole },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
