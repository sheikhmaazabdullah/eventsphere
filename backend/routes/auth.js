const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* ─────────────────────────────────────────
   POST /api/auth/register
   Body: { name, email, password, role, phone?, company?, interests? }
───────────────────────────────────────── */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 characters'),
    body('role').isIn(['admin', 'exhibitor', 'attendee']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, phone, company, interests } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ name, email, password, role, phone, company, interests });

      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          interests: user.interests,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/* ─────────────────────────────────────────
   POST /api/auth/login
   Body: { email, password }
───────────────────────────────────────── */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Select password explicitly since it's hidden by default
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      return res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          interests: user.interests,
          phone: user.phone,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/* ─────────────────────────────────────────
   GET /api/auth/profile   (protected)
───────────────────────────────────────── */
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

/* ─────────────────────────────────────────
   PUT /api/auth/profile   (protected)
   Body: { name?, phone?, company?, bio?, interests? }
───────────────────────────────────────── */
router.put('/profile', protect, async (req, res) => {
  const { name, phone, company, bio, interests } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, phone, company, bio, interests } },
      { new: true, runValidators: true }
    );
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
