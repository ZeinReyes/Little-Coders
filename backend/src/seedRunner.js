/**
 * seedRunner.js
 * Run with: node seedRunner.js
 *
 * Populates:
 *   Lesson → LessonMaterial → LessonActivity
 *                           → Assessment (question bank)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// ── Models (adjust paths to your project) ──────────────────
import Lesson from "../src/model/Lesson.js";
import LessonMaterial from "../src/model/LessonMaterial.js";
import LessonActivity from "../src/model/LessonActivity.js";
import Assessment from "../src/model/Assessment.js";

// ── Seed data ───────────────────────────────────────────────
import {
  lessons,
  lessonMaterials,
  lessonActivities,
  assessments,
} from "./seed.js";

async function seed() {
  try {
    await mongoose.connect("mongodb+srv://zbcreyes:49tpSZzbfeHndHD9@littlecoders.ulziolm.mongodb.net/?retryWrites=true&w=majority&appName=LittleCoders");
    console.log("✅ Connected to MongoDB");

    // ── Wipe existing data ──────────────────────────────────
    await Promise.all([
      Lesson.deleteMany({}),
      LessonMaterial.deleteMany({}),
      LessonActivity.deleteMany({}),
      Assessment.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing seed data");

    // ── Insert Lessons ──────────────────────────────────────
    const insertedLessons = await Lesson.insertMany(lessons);
    const lessonMap = {};
    insertedLessons.forEach((l) => {
      lessonMap[l.title] = l._id;
    });
    console.log(`📚 Inserted ${insertedLessons.length} lessons`);

    // ── Insert LessonMaterials ──────────────────────────────
    const materialsToInsert = lessonMaterials.map(({ lessonKey, ...rest }) => ({
      ...rest,
      lessonId: lessonMap[lessonKey],
    }));
    const insertedMaterials = await LessonMaterial.insertMany(materialsToInsert);

    // Build a map: material title → _id
    const materialMap = {};
    insertedMaterials.forEach((m) => {
      materialMap[m.title] = m._id;
    });
    console.log(`📄 Inserted ${insertedMaterials.length} lesson materials`);

    // ── Insert LessonActivities ─────────────────────────────
    const activitiesToInsert = lessonActivities.map(
      ({ materialKey, ...rest }) => ({
        ...rest,
        materialId: materialMap[materialKey],
      })
    );
    const insertedActivities = await LessonActivity.insertMany(
      activitiesToInsert
    );
    console.log(`🎯 Inserted ${insertedActivities.length} lesson activities`);

    // ── Insert Assessments ──────────────────────────────────
    const assessmentsToInsert = assessments.map(({ lessonKey, ...rest }) => ({
      ...rest,
      lessonId: lessonMap[lessonKey],
    }));
    const insertedAssessments = await Assessment.insertMany(assessmentsToInsert);
    console.log(
      `📝 Inserted ${insertedAssessments.length} assessment question banks`
    );

    // ── Link assessments back to lessons ────────────────────
    for (const assessment of insertedAssessments) {
      await Lesson.findByIdAndUpdate(assessment.lessonId, {
        $push: { assessments: assessment._id },
      });
    }
    console.log("🔗 Linked assessments to lessons");

    console.log("\n✅ Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();