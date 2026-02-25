import express from "express";
import {
  checkNeedsReview,
  generateReviewContent,
  getWeakSpots,
} from "../controller/aiPersonalizationController.js";

import {
  getSuggestedDifficulty,
  recordAssessmentSession,
  getAIStatus,
} from "../controller/aiDifficultyController.js";

const router = express.Router();

// ✅ AI MODEL: Check if user needs review (neural network decision)
router.post("/check-review", checkNeedsReview);

// ✅ AI LEARNING: Record whether review was actually needed (trains the review model)

// ✅ AI GENERATION: Generate personalized review lesson + activity + assessment
router.post("/generate-review", generateReviewContent);

// Get all weak spots across all lessons for a user
router.get("/weakspots/:userId", getWeakSpots);

// ✅ AI DIFFICULTY: Suggest next question difficulty
router.post("/suggest-difficulty", getSuggestedDifficulty);

// ✅ AI LEARNING: Record completed assessment session (triggers retraining every 10 sessions)
router.post("/record-session", recordAssessmentSession);

// ✅ AI STATUS: View model version, accuracy, sample count (admin/debug)
router.get("/status", getAIStatus);

export default router;