import express from "express";
import {
  checkNeedsReview,
  generateReviewContent,
  getWeakSpots,
} from "../controller/aiPersonalizationController.js";

import { getSuggestedDifficulty } from "../controller/aiDifficultyController.js";

const router = express.Router();

// ✅ RULE-BASED: Check if user needs review (based on failures + missing types)
router.post("/check-review", checkNeedsReview);

// ✅ AI GENERATION: Generate personalized review lesson + activity + assessment
router.post("/generate-review", generateReviewContent);

// Get all weak spots across all lessons for a user
router.get("/weakspots/:userId", getWeakSpots);

router.post("/suggest-difficulty", getSuggestedDifficulty);

export default router;