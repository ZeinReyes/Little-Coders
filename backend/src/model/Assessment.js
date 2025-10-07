// backend/src/model/Assessment.js
import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    hints: { type: [String], default: [] },
    expectedOutput: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson", // ✅ references Lesson model
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);
