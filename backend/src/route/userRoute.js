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
} from '../controller/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', addUser);
router.put('/:id', updateUser);     
router.delete('/:id', deleteUser);

//Onboarding
router.get("/:id/onboarding", getOnboardingStatus);
router.patch("/:id/complete-onboarding", completeOnboarding);
router.patch("/:id/reset-onboarding", resetOnboarding);

export default router;
