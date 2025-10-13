// backend/src/route/lessonRoute.js
import express from "express";
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessonContent,
} from "../controller/lessonController.js";

import Lesson from "../model/Lesson.js";
import LessonMaterial from "../model/LessonMaterial.js";
import LessonActivity from "../model/LessonActivity.js";
import Assessment from "../model/Assessment.js";
import UserLessonProgress from "../model/UserLessonProgress.js";

const router = express.Router();

// ✅ Existing routes
router.post("/", createLesson);
router.get("/", getLessons);
router.get("/:id", getLessonById);
router.put("/:id", updateLesson);
router.delete("/:id", deleteLesson);
router.put("/:lessonId/reorder", reorderLessonContent);

// 🧠 NEW: Get full lesson content + progress
router.get("/:lessonId/user/:userId/full", async (req, res) => {
  try {
    const { lessonId, userId } = req.params;

    // 1️⃣ Fetch lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // 2️⃣ Fetch related data
    const [materials, activities, assessments, progress] = await Promise.all([
      LessonMaterial.find({ lessonId }).sort({ order: 1 }),
      LessonActivity.find({ lessonId }).sort({ order: 1 }),
      Assessment.find({ lessonId }),
      UserLessonProgress.findOne({ userId, lessonId }),
    ]);

    // 3️⃣ Merge progress flags
    const materialData = materials.map((m) => ({
      ...m.toObject(),
      isCompleted: progress?.completedMaterials?.includes(m._id) || false,
    }));

    const activityData = activities.map((a) => ({
      ...a.toObject(),
      isCompleted: progress?.completedActivities?.includes(a._id) || false,
    }));

    const assessmentData = assessments.map((asmt) => ({
      ...asmt.toObject(),
      isCompleted: progress?.completedAssessments?.includes(asmt._id) || false,
    }));

    // 4️⃣ Return full structure
    res.status(200).json({
      lesson,
      materials: materialData,
      activities: activityData,
      assessments: assessmentData,
      progress: {
        percentage: progress?.progressPercentage || 0,
        isLessonCompleted: progress?.isLessonCompleted || false,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching full lesson data:", error);
    res.status(500).json({ message: "Error fetching lesson", error: error.message });
  }
});

export default router;
