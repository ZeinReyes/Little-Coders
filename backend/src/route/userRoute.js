import express from 'express';
import {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getOnboardingStatus,
  completeOnboarding,
  resetOnboarding,
  forgotPassword,
  resetPassword,
} from '../controller/userController.js';

const router = express.Router();

/* ==============================
   AUTH / PASSWORD ROUTES (FIRST)
============================== */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

/* ==============================
   USER ROUTES
============================== */
router.get('/', getUsers);
router.post('/', addUser);

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

/* ==============================
   ONBOARDING ROUTES
============================== */
router.get("/:id/onboarding", getOnboardingStatus);
router.patch("/:id/complete-onboarding", completeOnboarding);
router.patch("/:id/reset-onboarding", resetOnboarding);

export default router;
