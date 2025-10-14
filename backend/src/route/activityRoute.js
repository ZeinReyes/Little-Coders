import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createActivity,
  getActivitiesByMaterial,
  getActivityById,
  deleteActivity,
  updateActivity,
} from "../controller/activityController.js";

const router = express.Router();

router.post("/materials/:materialId/activities", verifyToken, createActivity);
router.get("/materials/:materialId/activities", getActivitiesByMaterial);
router.get("/lessons/:lessonId/activities/:activityId", getActivityById);
router.put("/:id", verifyToken, updateActivity);
router.delete("/:id", verifyToken, deleteActivity);

export default router;
