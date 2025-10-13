// controllers/lessonProgressController.js
import UserLessonProgress from "../model/UserLessonProgress.js";
import LessonMaterial from "../model/LessonMaterial.js";
import LessonActivity from "../model/LessonActivity.js";
import Assessment from "../model/Assessment.js";

// 📘 Mark a material as completed by a specific user
export const markMaterialCompleted = async (req, res) => {
  try {
    const { userId, lessonId, materialId } = req.body;

    // ✅ Validate required fields
    if (!userId || !lessonId || !materialId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Update or create progress record for the user + lesson
    const progress = await UserLessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { $addToSet: { completedMaterials: materialId } }, // avoids duplicates
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // ✅ Count total materials for that lesson
    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const completedCount = progress.completedMaterials.length;

    // ✅ Compute progress percentage safely
    const percentage =
      totalMaterials > 0
        ? Math.min((completedCount / totalMaterials) * 100, 100)
        : 0;

    progress.progressPercentage = percentage;

    // ✅ Mark lesson completed only if all materials are done
    progress.isLessonCompleted = percentage === 100;

    await progress.save();

    res.status(200).json({
      message: "Material marked as completed",
      progress,
    });
  } catch (err) {
    console.error("❌ Error updating material progress:", err);
    res.status(500).json({ message: "Error updating progress", error: err.message });
  }
};

// 📘 Mark an activity as completed by a specific user
export const markActivityCompleted = async (req, res) => {
  try {
    const { userId, lessonId, activityId } = req.body;

    if (!userId || !lessonId || !activityId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const progress = await UserLessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { $addToSet: { completedActivities: activityId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // ✅ Compute progress (activities + materials)
    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const totalActivities = await LessonActivity.countDocuments({ lessonId });
    const totalItems = totalMaterials + totalActivities;

    const completedCount =
      progress.completedMaterials.length + progress.completedActivities.length;

    progress.progressPercentage =
      totalItems > 0 ? Math.min((completedCount / totalItems) * 100, 100) : 0;

    progress.isLessonCompleted = progress.progressPercentage === 100;
    await progress.save();

    res.status(200).json({
      message: "Activity marked as completed",
      progress,
    });
  } catch (err) {
    console.error("❌ Error updating activity progress:", err);
    res.status(500).json({ message: "Error updating activity progress", error: err.message });
  }
};

// 📘 Mark an assessment as completed by a specific user
export const markAssessmentCompleted = async (req, res) => {
  try {
    const { userId, lessonId, assessmentId } = req.body;

    if (!userId || !lessonId || !assessmentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const progress = await UserLessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { $addToSet: { completedAssessments: assessmentId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // ✅ Progress based on all items (materials + activities + assessments)
    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const totalActivities = await LessonActivity.countDocuments({ lessonId });
    const totalAssessments = await Assessment.countDocuments({ lessonId });
    const totalItems = totalMaterials + totalActivities + totalAssessments;

    const completedCount =
      progress.completedMaterials.length +
      progress.completedActivities.length +
      progress.completedAssessments.length;

    progress.progressPercentage =
      totalItems > 0 ? Math.min((completedCount / totalItems) * 100, 100) : 0;

    progress.isLessonCompleted = progress.progressPercentage === 100;
    await progress.save();

    res.status(200).json({
      message: "Assessment marked as completed",
      progress,
    });
  } catch (err) {
    console.error("❌ Error updating assessment progress:", err);
    res.status(500).json({ message: "Error updating assessment progress", error: err.message });
  }
};

// 📘 Get a user’s lesson progress
export const getLessonProgress = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    if (!userId || !lessonId) {
      return res.status(400).json({ message: "Missing userId or lessonId" });
    }

    const progress = await UserLessonProgress.findOne({ userId, lessonId })
      .populate("completedMaterials", "title order") // only populate what you need
      .populate("completedActivities", "name order")
      .populate("completedAssessments", "title difficulty");

    if (!progress) {
      return res.status(200).json({ message: "No progress yet", progress: null });
    }

    res.status(200).json(progress);
  } catch (err) {
    console.error("❌ Error fetching progress:", err);
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
};
