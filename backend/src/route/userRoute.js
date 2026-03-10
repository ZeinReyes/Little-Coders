import express from "express";
import {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  getOnboardingStatus,
  completeOnboarding,
  resetOnboarding,
} from "../controller/userController.js";
import {
  getChildren,
  addChild,
  updateChild,
  deleteChild,
  updateChildProgress,
} from "../controller/childController.js";

const router = express.Router();

// ── User CRUD ────────────────────────────────────────────────────────────────
router.get("/",      getUsers);
router.get("/:id",   getUserById);
router.post("/",     addUser);
router.put("/:id",   updateUser);
router.delete("/:id", deleteUser);

// ── Onboarding ───────────────────────────────────────────────────────────────
router.get("/:id/onboarding",          getOnboardingStatus);
router.patch("/:id/complete-onboarding", completeOnboarding);
router.patch("/:id/reset-onboarding",    resetOnboarding);

// ── Children ─────────────────────────────────────────────────────────────────
router.get("/:id/children",                              getChildren);
router.post("/:id/children",                             addChild);
router.put("/:id/children/:childId",                     updateChild);
router.delete("/:id/children/:childId",                  deleteChild);
router.patch("/:id/children/:childId/progress",          updateChildProgress);

export default router;