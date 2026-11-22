// ── backend/models/Review.js ─────────────────────────────────────────────
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expo:    { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
}, { timestamps: true });

// One review per user per expo
reviewSchema.index({ user: 1, expo: 1 }, { unique: true });
module.exports = mongoose.model('Review', reviewSchema);
