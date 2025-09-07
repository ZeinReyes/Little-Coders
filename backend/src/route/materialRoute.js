import express from "express";
import {
  createMaterial,
  getMaterialsByLesson,
  reorderMaterials,
  deleteMaterial,
  updateMaterial,
} from "../controller/materialController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/lessons/:lessonId/materials", verifyToken, createMaterial);
router.get("/lessons/:lessonId/materials", verifyToken, getMaterialsByLesson);
router.put("/lessons/:lessonId/materials/reorder", verifyToken, reorderMaterials);
router.delete("/:id", verifyToken, deleteMaterial);
router.put("/:id", verifyToken, updateMaterial);

export default router;
