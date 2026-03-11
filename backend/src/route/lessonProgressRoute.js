import express from "express";
import {
  checkItemUnlocked,
  getUnlockedItems,
  markMaterialCompleted,
  markActivityCompleted,
  markAssessmentCompleted,
  markAssessmentAttempt,
  markActivityAttempt,
  getLessonProgress,
  getAllProgressByChild
} from "../controller/lessonProgressController.js";

const router = express.Router();

// ── Query-based unlock check (childId passed as query param) ─────────────────
// GET /api/progress/check-unlock?userId=&childId=&itemType=&itemId=&lessonId=&materialId=
router.get("/check-unlock", checkItemUnlocked);

// ── Get all unlocked items for a child in a lesson ───────────────────────────
// GET /api/progress/:userId/:childId/:lessonId/unlocked
router.get("/:userId/:childId/:lessonId/unlocked", getUnlockedItems);
router.get("/:userId/:childId", getAllProgressByChild);
// ── Get progress for a child in a lesson ─────────────────────────────────────
// GET /api/progress/:userId/:childId/:lessonId
router.get("/:userId/:childId/:lessonId", getLessonProgress);
// ── Mark completions (childId in body) ───────────────────────────────────────
router.post("/material",            markMaterialCompleted);
router.post("/activity",            markActivityCompleted);
router.post("/assessment",          markAssessmentCompleted);
router.post("/assessment-attempt",  markAssessmentAttempt);
router.post("/activity-attempt",    markActivityAttempt);

export default router;