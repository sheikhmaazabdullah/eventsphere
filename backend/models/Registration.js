const mongoose = require('mongoose');

/**
 * Registration Schema
 * Links a user (exhibitor or attendee) to an Expo.
 * Stores QR code data URL for badge generation.
 */
const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    role: {
      type: String,
      enum: ['exhibitor', 'attendee'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    badgeId:   { type: String, unique: true },  // UUID-based unique badge
    qrCode:    { type: String },                 // base-64 data URL
    booth:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booth', default: null },
    sessions:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
    /* Exhibitor-specific */
    company:   { type: String },
    documents: [{ type: String }],   // future: file URLs
    /* Attendee-specific */
    interests: [{ type: String }],
    checkedIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user can only register once per expo per role
registrationSchema.index({ user: 1, expo: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
