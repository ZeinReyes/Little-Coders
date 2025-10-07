import express from "express";
import {
  createAssessment,
  getAllAssessments,
} from "../controller/assessmentController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Routes
router.post("/", verifyToken, createAssessment);
router.get("/", getAllAssessments);

export default router;
