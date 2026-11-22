const mongoose = require('mongoose');

/**
 * Message Schema
 * Supports in-platform messaging between users within an Expo context.
 * New messages are broadcast via Socket.IO to the receiver's room.
 */
const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expo:     { type: mongoose.Schema.Types.ObjectId, ref: 'Expo' },
    content:  { type: String, required: true, maxlength: 2000 },
    read:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
