import express from "express";
import {
  markMaterialCompleted,
  markActivityCompleted,
  markAssessmentCompleted,
  markAssessmentAttempt,
  markActivityAttempt,
  getLessonProgress,
} from "../controller/lessonProgressController.js";

const router = express.Router();

router.post("/complete-material", markMaterialCompleted);
router.post("/complete-activity", markActivityCompleted);
router.post("/complete-assessment", markAssessmentCompleted);
router.post("/mark-assessment-attempt", markAssessmentAttempt);
router.post("/mark-activity-attempt", markActivityAttempt);
router.get("/:userId/:lessonId", getLessonProgress);

export default router;
