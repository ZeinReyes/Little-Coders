import express from "express";
import {
  submitReviewFeedback,
  getAdminFeedbackList,
  getAdminFeedbackSummary,
} from "../controller/aiReviewFeedbackController.js";

const router = express.Router();

// ── Student: submit feedback after a review session ──
// POST /api/ai/review-feedback
router.post("/", submitReviewFeedback);

// ── Admin: paginated list of all feedback responses ──
// GET /api/admin/ai-review-feedback?page=1&helpful=false&lessonId=...
router.get("/", getAdminFeedbackList);

// ── Admin: aggregated stats for the reports dashboard ──
// GET /api/admin/ai-review-feedback/summary?days=30
router.get("/summary", getAdminFeedbackSummary);

export default router;