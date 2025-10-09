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
      ref: "Lesson",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    testCases: [
      {
        input: { type: String },
        output: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Format JSON response
assessmentSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Assessment", assessmentSchema);
