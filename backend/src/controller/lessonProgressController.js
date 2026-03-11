import UserLessonProgress from "../model/UserLessonProgress.js";
import LessonMaterial from "../model/LessonMaterial.js";
import LessonActivity from "../model/LessonActivity.js";
import Assessment from "../model/Assessment.js";
import Lesson from "../model/Lesson.js";

// ── Shared helper: recalculate progress percentages and isLessonCompleted ──────
async function recalculateProgress(progress, lessonId) {
  const totalMaterials   = await LessonMaterial.countDocuments({ lessonId });
  const totalActivities  = await LessonActivity.countDocuments({ lessonId });
  const totalAssessments = await Assessment.countDocuments({ lessonId });

  const completedMaterialsCount = progress.completedMaterials.length;

  // Deduplicate by activityId
  const correctActivityIds = new Set(
    progress.activityAttempts
      .filter(a => a.correct)
      .map(a => a.activityId.toString())
  );
  const completedActivitiesCount = correctActivityIds.size;
  const completedAssessmentsCount = progress.completedAssessments?.length || 0;

  const totalItems     = totalMaterials + totalActivities + totalAssessments;
  const completedItems = completedMaterialsCount + completedActivitiesCount + completedAssessmentsCount;

  progress.progressPercentage = totalItems > 0
    ? Math.min((completedItems / totalItems) * 100, 100)
    : 0;

  // ✅ FIX 4: require totalItems > 0 so an empty lesson is never auto-completed
  progress.isLessonCompleted =
    totalItems > 0 &&
    completedMaterialsCount   === totalMaterials   &&
    completedActivitiesCount  === totalActivities  &&
    completedAssessmentsCount === totalAssessments;

  return progress;
}

// ══════════════════════════════════════════════════════════════════════════════
// CHECK IF ITEM IS UNLOCKED
// GET /api/progress/check-unlock?userId=&childId=&itemType=&itemId=&lessonId=&materialId=
// ══════════════════════════════════════════════════════════════════════════════
export const checkItemUnlocked = async (req, res) => {
  try {
    const { userId, childId, itemType, itemId, lessonId, materialId } = req.query;

    if (!userId || !childId || !itemType || !itemId) {
      return res.status(400).json({ message: "Missing required fields (userId, childId, itemType, itemId)" });
    }

    const filter = { userId, childId };
    let isUnlocked = false;

    // 1️⃣ LESSON
    if (itemType === "lesson") {
      const allLessons = await Lesson.find().sort({ order: 1 });
      const lessonIds = allLessons.map(l => l._id.toString());
      const currentIndex = lessonIds.indexOf(itemId.toString());

      if (currentIndex === 0) {
        isUnlocked = true;
      } else if (currentIndex > 0) {
        const previousLessonId = lessonIds[currentIndex - 1];
        const previousProgress = await UserLessonProgress.findOne({
          ...filter,
          lessonId: previousLessonId,
        });
        isUnlocked = previousProgress?.isLessonCompleted || false;
      }
      return res.status(200).json({ isUnlocked });
    }

    // 2️⃣ MATERIAL
    if (itemType === "material") {
      if (!lessonId) return res.status(400).json({ message: "lessonId is required for materials" });

      const allMaterials = await LessonMaterial.find({ lessonId }).sort({ order: 1 });
      const currentMaterialIndex = allMaterials.findIndex(m => m._id.toString() === itemId);

      if (currentMaterialIndex === 0) {
        isUnlocked = true;
      } else if (currentMaterialIndex > 0) {
        const previousMaterial = allMaterials[currentMaterialIndex - 1];
        const progress = await UserLessonProgress.findOne({ ...filter, lessonId });

        if (!progress) {
          isUnlocked = false;
        } else {
          const materialCompleted = progress.completedMaterials.some(
            m => m.toString() === previousMaterial._id.toString()
          );
          const previousMaterialActivities = await LessonActivity.find({
            materialId: previousMaterial._id,
          }).sort({ order: 1 });
          const allActivitiesCompleted = previousMaterialActivities.every(activity =>
            progress.activityAttempts.some(
              a => a.activityId.toString() === activity._id.toString() && a.correct
            )
          );
          isUnlocked = materialCompleted &&
            (previousMaterialActivities.length === 0 || allActivitiesCompleted);
        }
      }
      return res.status(200).json({ isUnlocked });
    }

    // 3️⃣ ACTIVITY
    if (itemType === "activity") {
      if (!materialId) return res.status(400).json({ message: "materialId is required for activities" });

      const progress = await UserLessonProgress.findOne({ ...filter, lessonId });
      const materialCompleted = progress?.completedMaterials.some(
        m => m.toString() === materialId.toString()
      );

      if (!materialCompleted) {
        isUnlocked = false;
      } else {
        const allActivities = await LessonActivity.find({ materialId }).sort({ order: 1 });
        const currentActivityIndex = allActivities.findIndex(a => a._id.toString() === itemId);

        if (currentActivityIndex === 0) {
          isUnlocked = true;
        } else if (currentActivityIndex > 0) {
          const previousActivity = allActivities[currentActivityIndex - 1];
          const previousActivityAttempt = progress?.activityAttempts.find(
            a => a.activityId.toString() === previousActivity._id.toString()
          );
          isUnlocked = previousActivityAttempt?.correct || false;
        }
      }
      return res.status(200).json({ isUnlocked });
    }

    // 4️⃣ ASSESSMENT
    if (itemType === "assessment") {
      if (!lessonId) return res.status(400).json({ message: "lessonId is required for assessments" });

      const allMaterials = await LessonMaterial.find({ lessonId });
      const progress = await UserLessonProgress.findOne({ ...filter, lessonId });

      if (!progress) {
        isUnlocked = false;
      } else {
        const allMaterialsCompleted = allMaterials.every(material =>
          progress.completedMaterials.some(m => m.toString() === material._id.toString())
        );
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

// ══════════════════════════════════════════════════════════════════════════════
// GET ALL UNLOCKED ITEMS
// GET /api/progress/:userId/:childId/:lessonId/unlocked
// ══════════════════════════════════════════════════════════════════════════════
export const getUnlockedItems = async (req, res) => {
  try {
    const { userId, childId, lessonId } = req.params;

    if (!userId || !childId || !lessonId) {
      return res.status(400).json({ message: "Missing userId, childId, or lessonId" });
    }

    const progress = await UserLessonProgress.findOne({ userId, childId, lessonId });
    const allMaterials = await LessonMaterial.find({ lessonId }).sort({ order: 1 });

    const unlockedMaterials  = [];
    const unlockedActivities = [];

    for (let i = 0; i < allMaterials.length; i++) {
      const material = allMaterials[i];

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
            if (previousCorrect) unlockedActivities.push(activity._id);
          }
        }
      }
    }

    res.status(200).json({ unlockedMaterials, unlockedActivities });
  } catch (err) {
    console.error("Error fetching unlocked items:", err);
    res.status(500).json({ message: "Error fetching unlocked items", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MARK MATERIAL COMPLETED
// POST /api/progress/material
// body: { userId, childId, lessonId, materialId, timeSeconds }
// ══════════════════════════════════════════════════════════════════════════════
export const markMaterialCompleted = async (req, res) => {
  try {
    const { userId, childId, lessonId, materialId, timeSeconds } = req.body;

    if (!userId || !childId || !lessonId || !materialId) {
      return res.status(400).json({ message: "Missing required fields (userId, childId, lessonId, materialId)" });
    }

    const key = {
      userId:   userId.toString(),
      childId:  childId.toString(),
      lessonId: lessonId.toString(),
    };
    const materialIdStr = materialId.toString();

    // ✅ FIX 1: atomic upsert — eliminates duplicate key race condition
    let progress = await UserLessonProgress.findOneAndUpdate(
      key,
      { $addToSet: { completedMaterials: materialIdStr } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Handle materialTime (needs read-modify-write, safe after upsert)
    const existingTimeIndex = progress.materialTime.findIndex(
      m => m.materialId.toString() === materialIdStr
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

    progress = await recalculateProgress(progress, key.lessonId);
    await progress.save();

    res.status(200).json({ message: "Material marked as completed", progress });
  } catch (err) {
    console.error("❌ Error updating material progress:", err);
    res.status(500).json({ message: "Error updating material progress", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MARK ACTIVITY COMPLETED
// POST /api/progress/activity
// body: { userId, childId, lessonId, activityId }
// ══════════════════════════════════════════════════════════════════════════════
export const markActivityCompleted = async (req, res) => {
  try {
    const { userId, childId, lessonId, activityId } = req.body;
    if (!userId || !childId || !lessonId || !activityId)
      return res.status(400).json({ message: "Missing required fields" });

    let progress = await UserLessonProgress.findOneAndUpdate(
      { userId, childId, lessonId },
      { $addToSet: { completedActivities: activityId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    progress = await recalculateProgress(progress, lessonId);
    await progress.save();

    res.status(200).json({ message: "Activity marked as completed", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating activity progress", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MARK ASSESSMENT COMPLETED
// POST /api/progress/assessment
// body: { userId, childId, lessonId, assessmentId }
// ══════════════════════════════════════════════════════════════════════════════
export const markAssessmentCompleted = async (req, res) => {
  try {
    const { userId, childId, lessonId, assessmentId } = req.body;
    if (!userId || !childId || !lessonId || !assessmentId)
      return res.status(400).json({ message: "Missing required fields" });

    let progress = await UserLessonProgress.findOneAndUpdate(
      { userId, childId, lessonId },
      { $addToSet: { completedAssessments: assessmentId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    progress = await recalculateProgress(progress, lessonId);

    // ✅ FIX 5: only force 100% if the lesson genuinely has no materials or activities
    // (assessment-only lessons). Otherwise trust recalculateProgress.
    if (!progress.isLessonCompleted) {
      const totalMaterials  = await LessonMaterial.countDocuments({ lessonId });
      const totalActivities = await LessonActivity.countDocuments({ lessonId });
      if (totalMaterials === 0 && totalActivities === 0) {
        progress.isLessonCompleted  = true;
        progress.progressPercentage = 100;
      }
    }

    await progress.save();

    res.status(200).json({ message: "Assessment marked as completed", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating assessment progress", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MARK ASSESSMENT ATTEMPT
// POST /api/progress/assessment-attempt
// body: { userId, childId, lessonId, assessmentId, questionId, ... }
// ══════════════════════════════════════════════════════════════════════════════
export const markAssessmentAttempt = async (req, res) => {
  try {
    const {
      userId, childId, lessonId, assessmentId, questionId,
      timeSeconds, totalAttempts, correct, difficulty,
    } = req.body;

    if (!userId || !childId || !lessonId || !assessmentId || !questionId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ FIX 3: atomic upsert — eliminates duplicate key race condition
    let progress = await UserLessonProgress.findOneAndUpdate(
      { userId, childId, lessonId },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const existingIndex = progress.assessmentAttempts.findIndex(
      a => a.assessmentId.toString() === assessmentId && a.questionId.toString() === questionId
    );

    if (existingIndex >= 0) {
      const existing = progress.assessmentAttempts[existingIndex];
      existing.totalAttempts += 1;
      existing.timeSeconds   += timeSeconds ?? 0;
      existing.correct        = existing.correct || correct;
      existing.difficulty     = difficulty || existing.difficulty;
      existing.attemptedAt    = new Date();
    } else {
      progress.assessmentAttempts.push({
        assessmentId,
        questionId,
        timeSeconds:   timeSeconds   ?? 0,
        totalAttempts: totalAttempts ?? 1,
        correct:       correct       ?? false,
        difficulty:    difficulty    || "Easy",
        attemptedAt:   new Date(),
      });
    }

    await progress.save();

    res.status(200).json({
      message:          "Assessment attempt recorded successfully",
      progress,
      completed:        correct === true,
      redirectToLesson: correct === true,
    });
  } catch (err) {
    console.error("❌ Error recording assessment attempt:", err);
    res.status(500).json({ message: "Error recording assessment attempt", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MARK ACTIVITY ATTEMPT
// POST /api/progress/activity-attempt
// body: { userId, childId, lessonId, activityId, timeSeconds, totalAttempts, correct }
// ══════════════════════════════════════════════════════════════════════════════
export const markActivityAttempt = async (req, res) => {
  try {
    const { userId, childId, lessonId, activityId, timeSeconds, totalAttempts, correct } = req.body;

    if (!userId || !childId || !lessonId || !activityId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const key = {
      userId:   userId.toString(),
      childId:  childId.toString(),
      lessonId: lessonId.toString(),
    };
    const activityIdStr = activityId.toString();

    // ✅ FIX 2: atomic upsert — eliminates duplicate key race condition
    let progress = await UserLessonProgress.findOneAndUpdate(
      key,
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const existingIndex = progress.activityAttempts.findIndex(
      a => a.activityId.toString() === activityIdStr
    );

    if (existingIndex >= 0) {
      const existing = progress.activityAttempts[existingIndex];
      existing.totalAttempts += 1;
      existing.timeSeconds   += timeSeconds ?? 0;
      existing.correct        = existing.correct || correct;
      existing.attemptedAt    = new Date();
    } else {
      progress.activityAttempts.push({
        activityId:    activityIdStr,
        timeSeconds:   timeSeconds   ?? 0,
        totalAttempts: totalAttempts ?? 1,
        correct:       correct       ?? false,
        attemptedAt:   new Date(),
      });
    }

    await progress.save();

    res.status(200).json({
      message:          "Activity attempt updated successfully",
      progress,
      completed:        correct === true,
      redirectToLesson: correct === true,
    });
  } catch (err) {
    console.error("❌ Error recording activity attempt:", err);
    res.status(500).json({ message: "Error recording activity attempt", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// GET LESSON PROGRESS
// GET /api/progress/:userId/:childId/:lessonId
// ══════════════════════════════════════════════════════════════════════════════
export const getLessonProgress = async (req, res) => {
  try {
    const { userId, childId, lessonId } = req.params;
    if (!userId || !childId || !lessonId)
      return res.status(400).json({ message: "Missing userId, childId, or lessonId" });

    const progress = await UserLessonProgress.findOne({ userId, childId, lessonId })
      .populate("completedMaterials",   "title order")
      .populate("completedActivities",  "name order")
      .populate("completedAssessments", "title difficulty");

    if (!progress)
      return res.status(200).json({ message: "No progress yet", progress: null });

    res.status(200).json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching progress", error: err.message });
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// GET ALL PROGRESS FOR A CHILD
// GET /api/progress/:userId/:childId
// ══════════════════════════════════════════════════════════════════════════════
export const getAllProgressByChild = async (req, res) => {
  try {
    const { userId, childId } = req.params;
    if (!userId || !childId)
      return res.status(400).json({ message: "Missing userId or childId" });

    const progresses = await UserLessonProgress.find({ userId, childId })
      .populate("completedMaterials",   "title order")
      .populate("completedActivities",  "name order")
      .populate("completedAssessments", "title difficulty");

    res.status(200).json(progresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching child progress", error: err.message });
  }
};