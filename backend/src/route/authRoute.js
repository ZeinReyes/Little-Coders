import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controller/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);   // ← new

export default router;