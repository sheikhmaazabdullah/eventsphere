const express = require('express');
const Expo = require('../models/Expo');
const Booth = require('../models/Booth');
const Registration = require('../models/Registration');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('exhibitor'));

/* ─── Register for an expo ─── */
router.post('/register/:expoId', async (req, res) => {
  try {
    const { company, interests } = req.body;
    const existing = await Registration.findOne({ user: req.user._id, expo: req.params.expoId, role: 'exhibitor' });
    if (existing) return res.status(400).json({ success: false, message: 'Already registered for this expo' });

    const reg = await Registration.create({
      user: req.user._id,
      expo: req.params.expoId,
      role: 'exhibitor',
      company: company || req.user.company,
      interests,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── My registrations ─── */
router.get('/my-registrations', async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user._id, role: 'exhibitor' })
      .populate('expo', 'title startDate endDate location status')
      .populate('booth', 'boothNumber size status position');
    res.json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Browse available booths ─── */
router.get('/booths/:expoId', async (req, res) => {
  try {
    const booths = await Booth.find({ expo: req.params.expoId }).populate('exhibitor', 'name company');
    res.json({ success: true, data: booths });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Reserve a booth ─── */
router.put('/booths/reserve/:boothId', async (req, res) => {
  try {
    // Verify exhibitor has an approved registration
    const booth = await Booth.findById(req.params.boothId);
    if (!booth) return res.status(404).json({ success: false, message: 'Booth not found' });
    if (booth.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Booth is not available' });
    }

    const reg = await Registration.findOne({ user: req.user._id, expo: booth.expo, role: 'exhibitor', status: 'approved' });
    if (!reg) return res.status(403).json({ success: false, message: 'You must be an approved exhibitor for this expo' });

    booth.status = 'reserved';
    booth.exhibitor = req.user._id;
    await booth.save();

    reg.booth = booth._id;
    await reg.save();

    req.io.to(`expo-${booth.expo}`).emit('booth-status-changed', { boothId: booth._id, status: 'reserved', exhibitor: req.user.name });
    res.json({ success: true, data: booth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─── Update booth details ─── */
router.put('/booths/update/:boothId', async (req, res) => {
  try {
    const booth = await Booth.findOne({ _id: req.params.boothId, exhibitor: req.user._id });
    if (!booth) return res.status(404).json({ success: false, message: 'Booth not found or not yours' });
    const { products, services, description, tags, category } = req.body;
    Object.assign(booth, { products, services, description, tags, category });
    await booth.save();
    req.io.to(`expo-${booth.expo}`).emit('booth-updated', booth);
    res.json({ success: true, data: booth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
