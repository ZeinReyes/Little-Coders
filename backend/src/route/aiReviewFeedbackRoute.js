// ══════════════════════════════════════════════════════════
// route/aiReviewFeedbackRoute.js
// ══════════════════════════════════════════════════════════
import express from "express";
import {
  submitReviewFeedback,
  getAdminFeedbackList,
  getAdminFeedbackSummary,
} from "../controller/aiReviewFeedbackController.js";

// ── Student router ─────────────────────────────────────────
// Mounted at: POST /api/ai/review-feedback
export const studentFeedbackRouter = express.Router();
studentFeedbackRouter.post("/", submitReviewFeedback);

// ── Admin router ───────────────────────────────────────────
// Mounted at: /api/admin/ai-review-feedback  (protected by adminAuth in server.js)
export const adminFeedbackRouter = express.Router();
adminFeedbackRouter.get("/",        getAdminFeedbackList);
adminFeedbackRouter.get("/summary", getAdminFeedbackSummary);