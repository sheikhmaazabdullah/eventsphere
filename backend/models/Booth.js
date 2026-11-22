const mongoose = require('mongoose');

/**
 * Booth Schema
 * Each booth belongs to an Expo and can be assigned to an exhibitor.
 * Real-time status changes are broadcast via Socket.IO.
 */
const boothSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    boothNumber: { type: String, required: true },   // e.g. "A1", "B3"
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    position: {
      row: { type: Number, required: true },
      col: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied'],
      default: 'available',
    },
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    price: { type: Number, default: 0 },
    products:    [{ type: String }],
    services:    [{ type: String }],
    description: { type: String, maxlength: 500 },
    tags:        [{ type: String }],
    category:    { type: String, default: 'General' },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate booth numbers per expo
boothSchema.index({ expo: 1, boothNumber: 1 }, { unique: true });

module.exports = mongoose.model('Booth', boothSchema);
