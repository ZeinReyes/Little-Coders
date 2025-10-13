import mongoose from "mongoose";

const UserLessonProgressSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "users", 
      required: true 
    },
    lessonId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Lesson", 
      required: true 
    },

    completedMaterials: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LessonMaterial" }
    ],
    completedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LessonActivity" }
    ],
    completedAssessments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" }
    ],

    isLessonCompleted: { type: Boolean, default: false },
    progressPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("UserLessonProgress", UserLessonProgressSchema);
