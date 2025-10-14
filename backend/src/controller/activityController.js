import LessonActivity from "../model/LessonActivity.js";

export const createActivity = async (req, res) => {
  try {
    const { materialId } = req.params; // now materialId refers to LessonMaterial
    let { name, instructions, hints, expectedOutput, difficulty, dataTypesRequired } = req.body;

    if (!Array.isArray(hints)) hints = hints ? [hints] : [];

    const validDataTypes = [
      "print", "variable", "multiple", "add", "subtract", "divide",
      "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
      "if", "elif", "else", "while"
    ];
    if (dataTypesRequired && !dataTypesRequired.every(dt => validDataTypes.includes(dt))) {
      return res.status(400).json({ message: "Invalid data type selected." });
    }

    const activity = new LessonActivity({
      materialId,
      name,
      instructions,
      hints,
      expectedOutput: expectedOutput || "",
      difficulty: difficulty || "easy",
      dataTypesRequired: dataTypesRequired || [],
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error creating activity", error: err.message });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await LessonActivity.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getActivitiesByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params; // materialId is now LessonMaterial
    const activities = await LessonActivity.find({ materialId }).sort({ order: 1, createdAt: 1 });

    const normalized = activities.map((a) => ({
      ...a.toObject(),
      hints: Array.isArray(a.hints) ? a.hints : a.hints ? [a.hints] : [],
      expectedOutput: a.expectedOutput || "",
    }));

    res.status(200).json(normalized);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activities", error: err });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, instructions, hints, expectedOutput, difficulty, materialId, dataTypesRequired } = req.body;

    if (!materialId) {
      const existing = await LessonActivity.findById(id);
      if (!existing) return res.status(404).json({ message: "Activity not found" });
      materialId = existing.materialId;
    }

    if (!Array.isArray(hints)) hints = hints ? [hints] : [];

    const validDataTypes = [
      "print", "variable", "multiple", "add", "subtract", "divide",
      "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
      "if", "elif", "else", "while"
    ];
    if (dataTypesRequired && !dataTypesRequired.every(dt => validDataTypes.includes(dt))) {
      return res.status(400).json({ message: "Invalid data type selected." });
    }

    const updated = await LessonActivity.findByIdAndUpdate(
      id,
      {
        materialId,
        name,
        instructions,
        hints,
        expectedOutput: expectedOutput || "",
        difficulty: difficulty || "easy",
        dataTypesRequired: dataTypesRequired || [],
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Activity not found" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating activity", error: err.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LessonActivity.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Activity not found" });
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
