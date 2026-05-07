import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
import authRoute             from "./src/route/authRoute.js";
import userRoute             from "./src/route/userRoute.js";
import lessonRoute           from "./src/route/lessonRoute.js";
import materialRoute         from "./src/route/materialRoute.js";
import activityRoute         from "./src/route/activityRoute.js";
import assessmentRoute       from "./src/route/assessmentRoute.js";
import lessonProgressRoutes  from "./src/route/lessonProgressRoute.js";
import contactRoute          from "./src/route/contactRoute.js";
import aiRoute               from "./src/route/aiRoute.js";

// FIX: was a single shared router mounted on two prefixes — now split into two
// separate routers so student POST and admin GETs are cleanly separated.
import {
  studentFeedbackRouter,
  adminFeedbackRouter,
} from "./src/route/aiReviewFeedbackRoute.js";

// FIX: admin routes need auth protection — import your existing admin middleware.
// Replace this with whatever middleware you already use for admin-only routes.
import { adminAuth } from "./src/middleware/adminAuth.js";

app.use("/api/auth",                    authRoute);
app.use("/api/users",                   userRoute);
app.use("/api/lessons",                 lessonRoute);
app.use("/api/materials",               materialRoute);
app.use("/api/activities",              activityRoute);
app.use("/api/assessments",             assessmentRoute);
app.use("/api/progress",                lessonProgressRoutes);
app.use("/api/contact",                 contactRoute);
app.use("/api/ai",                      aiRoute);

// Student: POST /api/ai/review-feedback
app.use("/api/ai/review-feedback",      studentFeedbackRouter);

// Admin: GET /api/admin/ai-review-feedback  +  GET /api/admin/ai-review-feedback/summary
// Protected by adminAuth — unauthenticated or non-admin requests are rejected before
// they reach the controller.
app.use("/api/admin/ai-review-feedback", adminAuth, adminFeedbackRouter);

// ── MongoDB ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("🔑 OPENROUTER_API_KEY loaded:", process.env.OPENROUTER_API_KEY);