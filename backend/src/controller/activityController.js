import LessonActivity from "../model/LessonActivity.js";

export const createActivity = async (req, res) => {
  try {
    const { lessonId } = req.params;
    let { name, instructions, hints, expectedOutput, difficulty } = req.body;

    // ✅ Ensure hints is always an array
    if (!Array.isArray(hints)) {
      hints = hints ? [hints] : [];
    }

    const activity = new LessonActivity({
      lessonId,
      name,
      instructions,
      hints,
      expectedOutput,
      difficulty,
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error creating activity", error: err });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await LessonActivity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(activity);
  } catch (err) {
    console.error("Error fetching activity:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getActivitiesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const activities = await LessonActivity.find({ lessonId }).sort({
      order: 1,
      createdAt: 1,
    });

    // ✅ Normalize before sending response
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

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LessonActivity.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    let { name, instructions, hints, expectedOutput, difficulty, lessonId } = req.body;

    // ✅ Fetch existing if lessonId not sent
    if (!lessonId) {
      const existing = await LessonActivity.findById(id);
      if (!existing) {
        return res.status(404).json({ message: "Activity not found" });
      }
      lessonId = existing.lessonId;
    }

    // ✅ Normalize hints
    if (!Array.isArray(hints)) {
      hints = hints ? [hints] : [];
    }

    const updated = await LessonActivity.findByIdAndUpdate(
      id,
      {
        lessonId,
        name,
        instructions,
        hints,
        expectedOutput: expectedOutput || "",
        difficulty: difficulty || "easy",
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Error updating activity:", err);
    res.status(500).json({
      message: "Error updating activity",
      error: err.message,
    });
  }
};
