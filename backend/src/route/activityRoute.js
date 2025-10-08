import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createActivity,
  getActivitiesByLesson,
  getActivityById,
  deleteActivity,
  updateActivity,
} from "../controller/activityController.js";

const router = express.Router();

router.post("/lessons/:lessonId/activities", verifyToken, createActivity);
router.get("/lessons/:lessonId/activities", getActivitiesByLesson);
router.get("/lessons/:lessonId/activities/:activityId", getActivityById);
router.put("/:id", verifyToken, updateActivity);
router.delete("/:id", verifyToken, deleteActivity);

export default router;
