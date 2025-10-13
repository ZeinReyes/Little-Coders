import mongoose from "mongoose";

const lessonActivitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instructions: { type: String, required: true, trim: true },
    hints: { type: [String], default: [] },
    expectedOutput: { type: String, default: "" },
    dataTypeChecks: [
      {
        name: { type: String, required: true },
        required: { type: Boolean, default: false },
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LessonActivity", lessonActivitySchema);
