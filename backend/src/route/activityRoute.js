// 📁 route/activityRoute.js
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createActivity,
  getActivityById,
  updateActivity,
  deleteActivity,
  checkUserCode
} from "../controller/activityController.js";

const router = express.Router();

/* ===========================================================
   🧩 ACTIVITY ROUTES
   =========================================================== */
router.post("/", verifyToken, createActivity);
router.get("/:id", getActivityById);
router.put("/:id", verifyToken, updateActivity);
router.delete("/:id", verifyToken, deleteActivity);

/* ===========================================================
   🔍 CODE VALIDATION ROUTE
   =========================================================== */
router.post("/:id/check", verifyToken, checkUserCode);

export default router;
