// backend/src/route/assessmentRoute.js
import express from "express";
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getAssessmentsByLesson,
  getAssessmentByLessonAndId,
} from "../controller/assessmentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Fetch all assessments for a specific lesson
router.get("/lessons/:lessonId/assessments", getAssessmentsByLesson);

// ✅ Fetch a specific assessment within a lesson
router.get("/lessons/:lessonId/assessments/:assessmentId", getAssessmentByLessonAndId);

// ✅ Create a new assessment (requires login)
router.post("/", verifyToken, createAssessment);

// ✅ Fetch all assessments (admin use, optional)
router.get("/", getAllAssessments);

// ✅ Fetch a single assessment by its global ID
router.get("/:id", getAssessmentById);

// ✅ Update assessment
router.put("/:id", verifyToken, updateAssessment);

// ✅ Delete assessment
router.delete("/:id", verifyToken, deleteAssessment);

export default router;
