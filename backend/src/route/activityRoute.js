import express from "express";
import {
  createActivity,
  getActivitiesByLesson,
  deleteActivity,
  updateActivity,
} from "../controller/activityController.js";

const router = express.Router();

// ✅ Create new activity for a lesson
router.post("/lessons/:lessonId/activities", createActivity);

// ✅ Get all activities for a lesson
router.get("/lessons/:lessonId/activities", getActivitiesByLesson);

// ✅ Update a specific activity
router.put("/activities/:id", updateActivity);

// ✅ Delete a specific activity
router.delete("/activities/:id", deleteActivity);

export default router;
