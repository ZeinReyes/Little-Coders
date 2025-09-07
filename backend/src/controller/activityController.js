import LessonActivity from "../model/LessonActivity.js";

export const createActivity = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { name, instructions, difficulty } = req.body;

    const activity = new LessonActivity({
      lessonId,
      name,
      instructions,
      difficulty,
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: "Error creating activity", error: err });
  }
};

export const getActivitiesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const activities = await LessonActivity.find({ lessonId }).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json(activities);
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
    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting activity", error: err });
  }
};
