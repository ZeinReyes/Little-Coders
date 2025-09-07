import mongoose from "mongoose";

const LessonActivitySchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const LessonActivity = mongoose.model("LessonActivity", LessonActivitySchema);
export default LessonActivity;
