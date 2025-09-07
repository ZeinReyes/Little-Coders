import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createActivity,
  getActivitiesByLesson,
  deleteActivity,
} from "../controller/activityController.js";

const router = express.Router();

router.post("/lessons/:lessonId/activities", verifyToken, createActivity);
router.get("/lessons/:lessonId/activities", verifyToken, getActivitiesByLesson);
router.delete("/activities/:id", verifyToken, deleteActivity);

export default router;
