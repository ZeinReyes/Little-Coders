import express from "express";
import {
  markMaterialCompleted,
  markActivityCompleted,
  markAssessmentCompleted,
  markAssessmentAttempt,
  markActivityAttempt,
  getLessonProgress,
  checkItemUnlocked, // <-- add this import
} from "../controller/lessonProgressController.js";

const router = express.Router();

// Existing routes
router.post("/complete-material", markMaterialCompleted);
router.post("/complete-activity", markActivityCompleted);
router.post("/complete-assessment", markAssessmentCompleted);
router.post("/mark-assessment-attempt", markAssessmentAttempt);
router.post("/mark-activity-attempt", markActivityAttempt);
router.get("/:userId/:lessonId", getLessonProgress);

// ✅ New route to check unlock status
router.get("/check-unlock", checkItemUnlocked);

export default router;
