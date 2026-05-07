// ══════════════════════════════════════════════════════════
// model/AIReviewFeedback.js
// ══════════════════════════════════════════════════════════
import mongoose from "mongoose";

const AIReviewFeedbackSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    lessonId:     { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    missingTypes: { type: [String], default: [] },       // e.g. ["if", "while"]
    helpful:      { type: Boolean, required: true },      // thumbs up / down
    reasons:      { type: [String], default: [] },        // only populated when helpful=false
    sessionId:    { type: String },                       // optional: tie to a review session
  },
  { timestamps: true }
);

// Index for fast admin queries
AIReviewFeedbackSchema.index({ lessonId: 1, createdAt: -1 });
AIReviewFeedbackSchema.index({ helpful: 1 });

export default mongoose.model("AIReviewFeedback", AIReviewFeedbackSchema);
