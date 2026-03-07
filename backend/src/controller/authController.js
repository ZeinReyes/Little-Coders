import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { MailtrapClient } from 'mailtrap';
import User from '../model/User.js';

// ── Mailtrap Client ──
const client = new MailtrapClient({ token: process.env.MAILTRAP_TOKEN });

const SENDER = {
  email: 'hello@demomailtrap.co',
  name: 'Little Coders',
};

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════════════════════════════
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(400).json({
          message: 'Account exists but is not verified. Please check your email or register again to resend the link.',
        });
      }
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000;

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationExpiry,
    });

    await newUser.save();

    // Send email in a separate try/catch so a failure doesn't block registration
    try {
      const verifyLink = `${process.env.BACKEND_URL || 'https://little-coders-production.up.railway.app'}/api/auth/verify-email/${verificationToken}`;
      await client.send({
        from: SENDER,
        to: [{ email }],
        subject: '📧 Verify your Little Coders account',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FFF8F2; border-radius: 16px; border: 3px solid #FFD580;">
            <h1 style="color: #e53935; text-align: center;">🎉 Welcome to Little Coders!</h1>
            <p style="color: #555; font-size: 1.05rem;">Hi <strong>${name}</strong>!</p>
            <p style="color: #555;">Thanks for signing up. Click the button below to verify your email address and activate your account.</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a
                href="${verifyLink}"
                style="background: linear-gradient(90deg, #FFB6C1, #FFD580); color: #4A2E05; padding: 0.9rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 1.1rem; display: inline-block;"
              >
                ✅ Verify My Email
              </a>
            </div>
            <p style="color: #888; font-size: 0.85rem; text-align: center;">
              This link expires in <strong>24 hours</strong>.<br/>
              If you didn't sign up for Little Coders, you can safely ignore this email.
            </p>
          </div>
        `,
      });
      console.log('✅ Verification email sent to:', email);
    } catch (emailErr) {
      console.error('❌ Email send failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// VERIFY EMAIL — redirects to frontend
// ══════════════════════════════════════════════════════════════════════════════
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const CLIENT_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  console.log('🔍 Token received:', token);
  console.log('🔍 CLIENT_URL:', CLIENT_URL);
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(`${CLIENT_URL}/verify-email/invalid`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpiry = undefined;
    await user.save();

    res.redirect(`${CLIENT_URL}/verify-email/success`);
  } catch (err) {
    console.error('Verify email error:', err);
    res.redirect(`${CLIENT_URL}/verify-email/invalid`);
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN — blocks unverified accounts
// ══════════════════════════════════════════════════════════════════════════════
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not defined in environment');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════════════════
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

    await client.send({
      from: SENDER,
      to: [{ email }],
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #FFF8F2; border-radius: 16px; border: 3px solid #FFD580;">
          <h2 style="color: #e53935;">Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 2rem 0;">
            <a
              href="${resetLink}"
              style="background: linear-gradient(90deg, #FFB6C1, #FFD580); color: #4A2E05; padding: 0.9rem 2rem; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 1.1rem; display: inline-block;"
            >
              🔑 Reset My Password
            </a>
          </div>
          <p style="color: #888; font-size: 0.85rem; text-align: center;">
            This link will expire in <strong>1 hour</strong>.<br/>
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD
// ══════════════════════════════════════════════════════════════════════════════
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};