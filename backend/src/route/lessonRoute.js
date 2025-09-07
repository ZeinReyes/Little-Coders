import express from "express";
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  reorderLessonContent,
} from "../controller/lessonController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createLesson);   
router.get("/", getLessons);       
router.get("/:id", getLessonById);  
router.put("/:id", updateLesson);     
router.delete("/:id", deleteLesson);  
router.put("/:lessonId/reorder", verifyToken, reorderLessonContent);

export default router;
