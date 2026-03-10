import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  age:       { type: Number, required: true },
  gender:    { type: String, enum: ["boy", "girl", "other"], required: true },
  avatar:    { type: String, default: "bear" }, // slug: bear | cat | dog | fox | panda | rabbit
  progress:  { type: mongoose.Schema.Types.Mixed, default: {} }, // flexible per-child progress store
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  resetPasswordToken:  String,
  resetPasswordExpiry: Date,

  role: { type: String, enum: ["admin", "user"], default: "user" },
  hasCompletedOnboarding: { type: Boolean, default: false },

  // ── Email verification ──
  isVerified:        { type: Boolean, default: false },
  verificationToken: String,
  verificationExpiry: Date,

  // ── Children profiles ──
  children: { type: [ChildSchema], default: [] },

}, { timestamps: true });

export default mongoose.model("users", UserSchema);