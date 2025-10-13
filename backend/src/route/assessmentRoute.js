import express from "express";
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getAssessmentsByLesson,
  getAssessmentByLessonAndId,
  checkUserCode, // ✅ For validating user’s code using regex/operators
} from "../controller/assessmentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* ===========================================================
   📘 LESSON-BASED ROUTES
   =========================================================== */

// ✅ Get all assessments for a specific lesson
router.get("/lesson/:lessonId", getAssessmentsByLesson);

// ✅ Get a specific assessment within a lesson
router.get("/lesson/:lessonId/:assessmentId", getAssessmentByLessonAndId);

/* ===========================================================
   🧩 GENERAL ASSESSMENT ROUTES
   =========================================================== */

// ✅ Create new assessment (requires authentication)
router.post("/", verifyToken, createAssessment);

// ✅ Get all assessments (admin/overview)
router.get("/", getAllAssessments);

// ✅ Get one assessment by its global ID
router.get("/:id", getAssessmentById);

// ✅ Update assessment (requires authentication)
router.put("/:id", verifyToken, updateAssessment);

// ✅ Delete assessment (requires authentication)
router.delete("/:id", verifyToken, deleteAssessment);

/* ===========================================================
   🔍 CODE VALIDATION ROUTE
   =========================================================== */

// ✅ Validate user-submitted code using regex & operator checks
router.post("/:id/check", verifyToken, checkUserCode);

export default router;
