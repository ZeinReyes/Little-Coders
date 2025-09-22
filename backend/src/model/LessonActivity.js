import mongoose from "mongoose";

const lessonActivitySchema = new mongoose.Schema(
  {
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    name: { type: String, required: true },
    instructions: { type: String, required: true },
    hints: { type: [String], default: [] },  // ✅ Array of strings
    expectedOutput: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("LessonActivity", lessonActivitySchema);