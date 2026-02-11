import UserLessonProgress from "../model/UserLessonProgress.js";
import LessonMaterial from "../model/LessonMaterial.js";
import LessonActivity from "../model/LessonActivity.js";
import Assessment from "../model/Assessment.js";
import Lesson from "../model/Lesson.js";

// --- Check if an item is unlocked (prerequisite system) ---
export const checkItemUnlocked = async (req, res) => {
  try {
    const { userId, itemType, itemId, lessonId, materialId } = req.query;

    if (!userId || !itemType || !itemId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let isUnlocked = false;

    // --- Check if a lesson is unlocked ---
if (itemType === "lesson") {
  const allLessons = await Lesson.find().sort({ order: 1 });

  // Ensure IDs are strings for comparison
  const lessonIds = allLessons.map(l => l._id.toString());
  const currentIndex = lessonIds.indexOf(itemId.toString());

  // ✅ First lesson always unlocked
  if (currentIndex === 0) {
    isUnlocked = true;
  } else if (currentIndex > 0) {
    const previousLessonId = lessonIds[currentIndex - 1];
    const previousProgress = await UserLessonProgress.findOne({
      userId,
      lessonId: previousLessonId,
    });

    isUnlocked = previousProgress?.isLessonCompleted || false;
  }

  return res.status(200).json({ isUnlocked });
}

    // 2️⃣ CHECK IF MATERIAL IS UNLOCKED
    if (itemType === "material") {
      if (!lessonId) {
        return res.status(400).json({ message: "lessonId is required for materials" });
      }

      const allMaterials = await LessonMaterial.find({ lessonId }).sort({ order: 1 });
      const currentMaterialIndex = allMaterials.findIndex(m => m._id.toString() === itemId);

      if (currentMaterialIndex === 0) {
        // First material is always unlocked
        isUnlocked = true;
      } else if (currentMaterialIndex > 0) {
        // Check if previous material AND all its activities are completed
        const previousMaterial = allMaterials[currentMaterialIndex - 1];
        const progress = await UserLessonProgress.findOne({ userId, lessonId });

        if (!progress) {
          isUnlocked = false;
        } else {
          // Check if previous material is completed
          const materialCompleted = progress.completedMaterials.some(
            m => m.toString() === previousMaterial._id.toString()
          );

          // Check if all activities of previous material are completed
          const previousMaterialActivities = await LessonActivity.find({
            materialId: previousMaterial._id,
          }).sort({ order: 1 });

          const allActivitiesCompleted = previousMaterialActivities.every(activity =>
            progress.completedActivities.some(
              a => a.toString() === activity._id.toString()
            )
          );

          isUnlocked = materialCompleted && (previousMaterialActivities.length === 0 || allActivitiesCompleted);
        }
      }

      return res.status(200).json({ isUnlocked });
    }

    // 3️⃣ CHECK IF ACTIVITY IS UNLOCKED
    if (itemType === "activity") {
      if (!materialId) {
        return res.status(400).json({ message: "materialId is required for activities" });
      }

      const progress = await UserLessonProgress.findOne({ userId, lessonId });

      // Check if parent material is completed
      const materialCompleted = progress?.completedMaterials.some(
        m => m.toString() === materialId.toString()
      );

      if (!materialCompleted) {
        isUnlocked = false;
      } else {
        // Get all activities for this material
        const allActivities = await LessonActivity.find({ materialId }).sort({ order: 1 });
        const currentActivityIndex = allActivities.findIndex(a => a._id.toString() === itemId);

        if (currentActivityIndex === 0) {
          // First activity is unlocked if material is completed
          isUnlocked = true;
        } else if (currentActivityIndex > 0) {
          // Check if previous activity is completed correctly
          const previousActivity = allActivities[currentActivityIndex - 1];
          
          // Check if previous activity was completed correctly
          const previousActivityAttempt = progress?.activityAttempts.find(
            a => a.activityId.toString() === previousActivity._id.toString()
          );

          isUnlocked = previousActivityAttempt?.correct || false;
        }
      }

      return res.status(200).json({ isUnlocked });
    }

    // 4️⃣ CHECK IF ASSESSMENT IS UNLOCKED
    if (itemType === "assessment") {
      if (!lessonId) {
        return res.status(400).json({ message: "lessonId is required for assessments" });
      }

      // Check if all materials and activities in the lesson are completed
      const allMaterials = await LessonMaterial.find({ lessonId });
      const progress = await UserLessonProgress.findOne({ userId, lessonId });

      if (!progress) {
        isUnlocked = false;
      } else {
        // Check all materials completed
        const allMaterialsCompleted = allMaterials.every(material =>
          progress.completedMaterials.some(
            m => m.toString() === material._id.toString()
          )
        );

        // Check all activities completed correctly
        const allActivities = await LessonActivity.find({
          materialId: { $in: allMaterials.map(m => m._id) },
        });

        const allActivitiesCompleted = allActivities.every(activity =>
          progress.activityAttempts.some(
            a => a.activityId.toString() === activity._id.toString() && a.correct
          )
        );

        isUnlocked = allMaterialsCompleted && allActivitiesCompleted;
      }

      return res.status(200).json({ isUnlocked });
    }

    res.status(400).json({ message: "Invalid itemType" });
  } catch (err) {
    console.error("Error checking item unlock status:", err);
    res.status(500).json({ message: "Error checking unlock status", error: err.message });
  }
};

// --- Get all unlocked items for a user in a lesson ---
export const getUnlockedItems = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    if (!userId || !lessonId) {
      return res.status(400).json({ message: "Missing userId or lessonId" });
    }

    const progress = await UserLessonProgress.findOne({ userId, lessonId });
    const allMaterials = await LessonMaterial.find({ lessonId }).sort({ order: 1 });
    
    const unlockedMaterials = [];
    const unlockedActivities = [];

    for (let i = 0; i < allMaterials.length; i++) {
      const material = allMaterials[i];
      
      // Check if material is unlocked
      if (i === 0) {
        unlockedMaterials.push(material._id);
      } else {
        const previousMaterial = allMaterials[i - 1];
        const materialCompleted = progress?.completedMaterials.some(
          m => m.toString() === previousMaterial._id.toString()
        );

        const previousActivities = await LessonActivity.find({ materialId: previousMaterial._id });
        const allPreviousActivitiesCompleted = previousActivities.every(activity =>
          progress?.activityAttempts.some(
            a => a.activityId.toString() === activity._id.toString() && a.correct
          )
        );

        if (materialCompleted && (previousActivities.length === 0 || allPreviousActivitiesCompleted)) {
          unlockedMaterials.push(material._id);
        }
      }

      // Check activities for this material
      const materialActivities = await LessonActivity.find({ materialId: material._id }).sort({ order: 1 });
      const materialCompleted = progress?.completedMaterials.some(
        m => m.toString() === material._id.toString()
      );

      if (materialCompleted) {
        for (let j = 0; j < materialActivities.length; j++) {
          const activity = materialActivities[j];
          
          if (j === 0) {
            unlockedActivities.push(activity._id);
          } else {
            const previousActivity = materialActivities[j - 1];
            const previousCorrect = progress?.activityAttempts.some(
              a => a.activityId.toString() === previousActivity._id.toString() && a.correct
            );

            if (previousCorrect) {
              unlockedActivities.push(activity._id);
            }
          }
        }
      }
    }

    res.status(200).json({
      unlockedMaterials,
      unlockedActivities,
    });
  } catch (err) {
    console.error("Error fetching unlocked items:", err);
    res.status(500).json({ message: "Error fetching unlocked items", error: err.message });
  }
};

// --- Mark material completed ---
export const markMaterialCompleted = async (req, res) => {
  try {
    const { userId, lessonId, materialId, timeSeconds } = req.body;

    if (!userId || !lessonId || !materialId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userIdStr = userId.toString();
    const lessonIdStr = lessonId.toString();
    const materialIdStr = materialId.toString();

    let progress = await UserLessonProgress.findOne({
      userId: userIdStr,
      lessonId: lessonIdStr,
    });

    if (!progress) {
      progress = new UserLessonProgress({
        userId: userIdStr,
        lessonId: lessonIdStr,
        completedMaterials: [],
        materialTime: [],
      });
    }

    // ✅ Add to completedMaterials
    if (!progress.completedMaterials.some(
      m => m.toString() === materialIdStr
    )) {
      progress.completedMaterials.push(materialIdStr);
    }

    // ✅ Update or Insert Material Time
    const existingTimeIndex = progress.materialTime.findIndex(
      (m) => m.materialId.toString() === materialIdStr
    );

    if (existingTimeIndex >= 0) {
      progress.materialTime[existingTimeIndex].timeSeconds += timeSeconds ?? 0;
      progress.materialTime[existingTimeIndex].updatedAt = new Date();
    } else {
      progress.materialTime.push({
        materialId: materialIdStr,
        timeSeconds: timeSeconds ?? 0,
        updatedAt: new Date(),
      });
    }

    // --- Recalculate Progress ---
    const totalMaterials = await LessonMaterial.countDocuments({ lessonId });
    const totalActivities = await LessonActivity.countDocuments({ lessonId });

    const completedMaterialsCount = progress.completedMaterials.length;
    const completedActivitiesCount = progress.activityAttempts.filter(a => a.correct).length;

    const totalItems = totalMaterials + totalActivities;
    const completedItems = completedMaterialsCount + completedActivitiesCount;

    progress.progressPercentage =
      totalItems > 0
        ? Math.min((completedItems / totalItems) * 100, 100)
        : 0;

    progress.isLessonCompleted =
      completedMaterialsCount === totalMaterials &&
      completedActivitiesCount === totalActivities;

    await progress.save();

    res.status(200).json({
      message: "Material marked as completed and time recorded",
      progress,
    });

  } catch (err) {
    console.error("❌ Error updating material progress:", err);
    res.status(500).json({
      message: "Error updating material progress",
      error: err.message,
    });
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
    const { 
      userId, 
      lessonId, 
      assessmentId, 
      questionId, 
      timeSeconds, 
      totalAttempts, 
      correct, 
      difficulty 
    } = req.body;

    if (!userId || !lessonId || !assessmentId || !questionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let progress = await UserLessonProgress.findOne({ userId, lessonId });
    if (!progress) {
      progress = new UserLessonProgress({ userId, lessonId });
    }

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
      difficulty: difficulty || "easy",
      attemptedAt: new Date(),
    };

    if (existingIndex >= 0) {
      const existingAttempt = progress.assessmentAttempts[existingIndex];
      existingAttempt.totalAttempts += 1;
      existingAttempt.timeSeconds += attemptData.timeSeconds;
      existingAttempt.correct = existingAttempt.correct || correct;
      existingAttempt.difficulty = difficulty || existingAttempt.difficulty;
      existingAttempt.attemptedAt = new Date();
    } else {
      progress.assessmentAttempts.push(attemptData);
    }

    await progress.save();

    res.status(200).json({
      message: "Assessment attempt recorded successfully",
      progress,
      completed: correct === true,
      redirectToLesson: correct === true,
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

    const userIdStr = userId.toString();
    const lessonIdStr = lessonId.toString();
    const activityIdStr = activityId.toString();

    let progress = await UserLessonProgress.findOne({ userId: userIdStr, lessonId: lessonIdStr });

    if (!progress) {
      progress = new UserLessonProgress({ userId: userIdStr, lessonId: lessonIdStr, activityAttempts: [] });
    }

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
      const existingAttempt = progress.activityAttempts[existingIndex];
      existingAttempt.totalAttempts += 1;
      existingAttempt.timeSeconds += attemptData.timeSeconds;
      existingAttempt.correct = existingAttempt.correct || correct;
      existingAttempt.attemptedAt = new Date();
    } else {
      progress.activityAttempts.push(attemptData);
    }

    await progress.save();

    res.status(200).json({
      message: "Activity attempt updated successfully",
      progress,
      completed: correct === true,
      redirectToLesson: correct === true,
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