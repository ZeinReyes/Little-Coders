import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  hasCompletedOnboarding: { type: Boolean, default: false },

  // ── Email verification ──
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpiry: Date,

}, { timestamps: true });

export default mongoose.model('users', UserSchema);