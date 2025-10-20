import mongoose from "mongoose";

const UserLessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },

    // --- Completion Tracking ---
    completedMaterials: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LessonMaterial" },
    ],
    completedActivities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LessonActivity" },
    ],
    completedAssessments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    ],

    // --- Material Time Tracking ---
    materialTime: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LessonMaterial",
        },
        timeSeconds: { type: Number, default: 0 },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Activity Attempts ---
    activityAttempts: [
      {
        activityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LessonActivity",
        },
        timeSeconds: { type: Number, default: 0 },
        totalAttempts: { type: Number, default: 1 },
        correct: { type: Boolean, default: false },
        attemptedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Assessment Attempts ---
    assessmentAttempts: [
    {
      assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
      },
      questionId: { type: mongoose.Schema.Types.ObjectId },
      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy",
      },
      timeSeconds: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 1 },
      correct: { type: Boolean, default: false },
      attemptedAt: { type: Date, default: Date.now },
    },
  ],

    // --- Progress ---
    isLessonCompleted: { type: Boolean, default: false },
    progressPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Enforce unique progress per (userId + lessonId)
UserLessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

// ✅ Optional: handle duplicate key errors gracefully
UserLessonProgressSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Duplicate progress entry for this lesson and user."));
  } else {
    next(error);
  }
});

export default mongoose.models.UserLessonProgress ||
  mongoose.model("UserLessonProgress", UserLessonProgressSchema);
