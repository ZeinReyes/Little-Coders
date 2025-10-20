import UserLessonProgress from "../model/UserLessonProgress.js";
import LessonMaterial from "../model/LessonMaterial.js";
import LessonActivity from "../model/LessonActivity.js";
import Assessment from "../model/Assessment.js";

// --- Mark material completed ---
export const markMaterialCompleted = async (req, res) => {
  try {
    const { userId, lessonId, materialId } = req.body;
    if (!userId || !lessonId || !materialId)
      return res.status(400).json({ message: "Missing required fields" });

    const progress = await UserLessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { $addToSet: { completedMaterials: materialId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const completedCount = progress.completedMaterials.length;
    progress.progressPercentage = totalMaterials > 0 ? Math.min((completedCount / totalMaterials) * 100, 100) : 0;
    progress.isLessonCompleted = progress.progressPercentage === 100;
    await progress.save();

    res.status(200).json({ message: "Material marked as completed", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating progress", error: err.message });
  }
};

// --- Mark activity completed ---
export const markActivityCompleted = async (req, res) => {
  try {
    const { userId, lessonId, activityId } = req.body;
    if (!userId || !lessonId || !activityId)
      return res.status(400).json({ message: "Missing required fields" });

    const progress = await UserLessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { $addToSet: { completedActivities: activityId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const totalActivities = await LessonActivity.countDocuments({ lessonId });
    const totalItems = totalMaterials + totalActivities;
    const completedCount = progress.completedMaterials.length + progress.completedActivities.length;

    progress.progressPercentage = totalItems > 0 ? Math.min((completedCount / totalItems) * 100, 100) : 0;
    progress.isLessonCompleted = progress.progressPercentage === 100;
    await progress.save();

    res.status(200).json({ message: "Activity marked as completed", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating activity progress", error: err.message });
  }
};

// --- Mark assessment completed ---
export const markAssessmentCompleted = async (req, res) => {
  try {
    const { userId, lessonId, assessmentId } = req.body;
    if (!userId || !lessonId || !assessmentId)
      return res.status(400).json({ message: "Missing required fields" });

    const progress = await UserLessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { $addToSet: { completedAssessments: assessmentId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const totalActivities = await LessonActivity.countDocuments({ lessonId });
    const totalAssessments = await Assessment.countDocuments({ lessonId });
    const totalItems = totalMaterials + totalActivities + totalAssessments;
    const completedCount = progress.completedMaterials.length + progress.completedActivities.length + progress.completedAssessments.length;

    progress.progressPercentage = totalItems > 0 ? Math.min((completedCount / totalItems) * 100, 100) : 0;
    progress.isLessonCompleted = progress.progressPercentage === 100;
    await progress.save();

    res.status(200).json({ message: "Assessment marked as completed", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating assessment progress", error: err.message });
  }
};

export const markAssessmentAttempt = async (req, res) => {
  try {
    const { userId, lessonId, assessmentId, questionId, timeSeconds, totalAttempts, correct } = req.body;

    if (!userId || !lessonId || !assessmentId || !questionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Find existing progress or create a new one
    let progress = await UserLessonProgress.findOne({ userId, lessonId });
    if (!progress) {
      progress = new UserLessonProgress({ userId, lessonId });
    }

    // ✅ Check if this question already exists in attempts
    const existingIndex = progress.assessmentAttempts.findIndex(
      (a) =>
        a.assessmentId.toString() === assessmentId &&
        a.questionId.toString() === questionId
    );

    const attemptData = {
      assessmentId,
      questionId,
      timeSeconds: timeSeconds ?? 0,
      totalAttempts: totalAttempts ?? 1,
      correct: correct ?? false,
      attemptedAt: new Date(),
    };

    if (existingIndex >= 0) {
      // ✅ Update existing attempt instead of replacing
      const existingAttempt = progress.assessmentAttempts[existingIndex];
      existingAttempt.totalAttempts += 1; // add to total attempts
      existingAttempt.timeSeconds += attemptData.timeSeconds; // add time spent
      existingAttempt.correct = correct ? true : existingAttempt.correct; // stay true if once correct
      existingAttempt.attemptedAt = new Date(); // update last attempt time
    } else {
      // 🆕 First attempt on this question
      progress.assessmentAttempts.push(attemptData);
    }

    await progress.save();

    res.status(200).json({
      message: "Assessment attempt updated successfully",
      progress,
    });
  } catch (err) {
    console.error("❌ Error recording assessment attempt:", err);
    res.status(500).json({
      message: "Error recording assessment attempt",
      error: err.message,
    });
  }
};

export const markActivityAttempt = async (req, res) => {
  try {
    const { userId, lessonId, activityId, timeSeconds, totalAttempts, correct } = req.body;

    if (!userId || !lessonId || !activityId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Ensure IDs are treated consistently as strings
    const userIdStr = userId.toString();
    const lessonIdStr = lessonId.toString();
    const activityIdStr = activityId.toString();

    // ✅ Find or create progress for this user + lesson
    let progress = await UserLessonProgress.findOne({ userId: userIdStr, lessonId: lessonIdStr });

    if (!progress) {
      progress = new UserLessonProgress({ userId: userIdStr, lessonId: lessonIdStr, activityAttempts: [] });
    }

    // ✅ Check if this activity already exists
    const existingIndex = progress.activityAttempts.findIndex(
      (a) => a.activityId.toString() === activityIdStr
    );

    const attemptData = {
      activityId: activityIdStr,
      timeSeconds: timeSeconds ?? 0,
      totalAttempts: totalAttempts ?? 1,
      correct: correct ?? false,
      attemptedAt: new Date(),
    };

    if (existingIndex >= 0) {
      // ✅ Update existing attempt instead of duplicating
      const existingAttempt = progress.activityAttempts[existingIndex];
      existingAttempt.totalAttempts += 1; // increment attempts
      existingAttempt.timeSeconds += attemptData.timeSeconds; // accumulate time
      existingAttempt.correct = existingAttempt.correct || correct; // once correct, stays correct
      existingAttempt.attemptedAt = new Date();
    } else {
      // 🆕 First time attempting this activity
      progress.activityAttempts.push(attemptData);
    }

    await progress.save();

    res.status(200).json({
      message: "Activity attempt updated successfully",
      progress,
    });
  } catch (err) {
    console.error("❌ Error recording activity attempt:", err);
    res.status(500).json({
      message: "Error recording activity attempt",
      error: err.message,
    });
  }
};


// --- Get lesson progress ---
export const getLessonProgress = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    if (!userId || !lessonId)
      return res.status(400).json({ message: "Missing userId or lessonId" });

    const progress = await UserLessonProgress.findOne({ userId, lessonId })
      .populate("completedMaterials", "title order")
      .populate("completedActivities", "name order")
      .populate("completedAssessments", "title difficulty");

    if (!progress) return res.status(200).json({ message: "No progress yet", progress: null });
    res.status(200).json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
};
