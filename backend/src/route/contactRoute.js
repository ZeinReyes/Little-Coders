// backend/src/route/contactRoute.js
import express from "express";
import { sendContactMessage } from "../controller/contactController.js";

const router = express.Router();

// POST /api/contact
router.post("/", sendContactMessage);

export default router;
