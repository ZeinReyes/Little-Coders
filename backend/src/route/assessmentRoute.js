// backend/src/route/assessmentRoute.js
import express from "express";
import {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
} from "../controller/assessmentController.js";
import { verifyToken } from "../middleware/auth.js";  

const router = express.Router();

router.post("/", verifyToken, createAssessment);

router.get("/", getAllAssessments);

// ✅ Read One
router.get("/:id", getAssessmentById);

// ✅ Update
router.put("/:id", verifyToken, updateAssessment);

// ✅ Delete
router.delete("/:id", verifyToken, deleteAssessment);

export default router;
