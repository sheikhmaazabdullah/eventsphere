const mongoose = require('mongoose');

/**
 * Expo Schema
 * Represents a trade show / expo event created by an admin/organizer.
 */
const expoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expo title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, maxlength: 2000 },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    location:  { type: String, required: true },
    theme:     { type: String },
    category:  { type: String, default: 'General' },
    bannerColor: { type: String, default: '#6366f1' },
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /* Floor plan: a 2-D grid where each cell = { id, type, label }   *
     * type: 'booth' | 'aisle' | 'entrance' | 'empty'                */
    floorPlan: {
      rows: { type: Number, default: 6 },
      cols: { type: Number, default: 8 },
      cells: [
        {
          row:   Number,
          col:   Number,
          type:  { type: String, enum: ['booth','aisle','entrance','empty'], default: 'empty' },
          label: String,
        },
      ],
    },
    maxBooths: { type: Number, default: 24 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expo', expoSchema);
