const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Represents all three roles: admin, exhibitor, attendee.
 * Passwords are hashed via pre-save hook before storing.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: ['admin', 'exhibitor', 'attendee'],
      default: 'attendee',
    },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },       // for exhibitors
    bio: { type: String, maxlength: 500 },
    interests: [{ type: String }],               // for AI recommendations (attendees)
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ----------  Hooks  ---------- */

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ----------  Methods  ---------- */

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
