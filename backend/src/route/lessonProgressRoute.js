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

// ── Static/named routes FIRST ─────────────────────────────────────────────────
router.get("/check-unlock", checkItemUnlocked);

router.post("/material",           markMaterialCompleted);
router.post("/activity",           markActivityCompleted);
router.post("/assessment",         markAssessmentCompleted);
router.post("/assessment-attempt", markAssessmentAttempt);
router.post("/activity-attempt",   markActivityAttempt);

// ── Param routes LAST ─────────────────────────────────────────────────────────
router.get("/:userId/:childId/:lessonId/unlocked", getUnlockedItems);
router.get("/:userId/:childId/:lessonId",          getLessonProgress);
router.get("/:userId/:childId",                    getAllProgressByChild);

export default router;