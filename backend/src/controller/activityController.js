// 📁 controller/activityController.js
import LessonActivity from "../model/LessonActivity.js";

/* ===========================================================
   🧩 CREATE ACTIVITY
   =========================================================== */
export const createActivity = async (req, res) => {
  try {
    const { name, instructions, hints = [], difficulty, dataTypeChecks = [], expectedOutput = "" } = req.body;

    if (!name?.trim() || !instructions?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    const cleanedHints = hints.filter((h) => h.trim() !== "");
    const cleanedChecks = dataTypeChecks.filter((c) => c.name?.trim() !== "");

    const newActivity = new LessonActivity({
      name: name.trim(),
      instructions: instructions.trim(),
      hints: cleanedHints,
      difficulty: difficulty?.toLowerCase() || "easy",
      dataTypeChecks: cleanedChecks,
      expectedOutput: expectedOutput?.trim() || "",
      createdBy: req.user?.id || null,
    });

    await newActivity.save();

    res.status(201).json({
      success: true,
      message: "Activity created successfully!",
      data: newActivity,
    });
  } catch (error) {
    console.error("❌ Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating activity.",
      error: error.message,
    });
  }
};

/* ===========================================================
   🔍 GET ACTIVITY BY ID
   =========================================================== */
export const getActivityById = async (req, res) => {
  try {
    const activity = await LessonActivity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found." });

    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching activity.", error: error.message });
  }
};

/* ===========================================================
   ✏️ UPDATE ACTIVITY
   =========================================================== */
export const updateActivity = async (req, res) => {
  try {
    const { name, instructions, hints, difficulty, dataTypeChecks, expectedOutput } = req.body;

    const validDifficulties = ["easy", "medium", "hard"];
    if (difficulty && !validDifficulties.includes(difficulty.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid difficulty value." });
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (instructions) updateFields.instructions = instructions.trim();
    if (hints) updateFields.hints = hints.filter((h) => h.trim() !== "");
    if (difficulty) updateFields.difficulty = difficulty.toLowerCase();
    if (expectedOutput !== undefined) updateFields.expectedOutput = expectedOutput.trim();
    if (dataTypeChecks) updateFields.dataTypeChecks = dataTypeChecks.filter((c) => c.name?.trim() !== "");

    const updatedActivity = await LessonActivity.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });

    if (!updatedActivity) return res.status(404).json({ success: false, message: "Activity not found." });

    res.status(200).json({ success: true, message: "Activity updated successfully!", data: updatedActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while updating activity.", error: error.message });
  }
};

/* ===========================================================
   🗑️ DELETE ACTIVITY
   =========================================================== */
export const deleteActivity = async (req, res) => {
  try {
    const deleted = await LessonActivity.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Activity not found." });

    res.status(200).json({ success: true, message: "Activity deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while deleting activity.", error: error.message });
  }
};

/* ===========================================================
   🔍 CODE CHECKER (regex + operator validation)
   =========================================================== */
export const checkUserCode = async (req, res) => {
  try {
    const { code } = req.body;
    const { id } = req.params;

    const activity = await LessonActivity.findById(id);
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found." });

    let results = [];
    let passed = true;

    for (const check of activity.dataTypeChecks || []) {
      const regex = new RegExp(`\\b${check.name}\\b`);
      const ok = regex.test(code);
      if (check.required && !ok) passed = false;

      results.push({ description: `Use of "${check.name}"`, operator: check.name, passed: ok });
    }

    res.status(200).json({
      success: true,
      passed,
      results,
      message: passed ? "✅ Code passed all checks." : "⚠️ Some required elements are missing.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while checking code.", error: error.message });
  }
};
