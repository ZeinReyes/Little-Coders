import mongoose from "mongoose";

const LessonMaterialSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    contents: [
      {
        type: String,
        required: true,
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("LessonMaterial", LessonMaterialSchema);
