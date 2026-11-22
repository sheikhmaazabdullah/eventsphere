const mongoose = require('mongoose');

/**
 * Session Schema
 * Represents a scheduled talk / workshop / panel within an Expo.
 */
const sessionSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    title:       { type: String, required: true, trim: true },
    speaker:     { type: String, required: true },
    speakerBio:  { type: String },
    description: { type: String },
    startTime:   { type: Date, required: true },
    endTime:     { type: Date, required: true },
    venue:       { type: String },           // hall / room name
    capacity:    { type: Number, default: 100 },
    tags:        [{ type: String }],
    registeredAttendees: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
  },
  { timestamps: true }
);

/* Virtual: available seats */
sessionSchema.virtual('seatsLeft').get(function () {
  return this.capacity - this.registeredAttendees.length;
});

module.exports = mongoose.model('Session', sessionSchema);
