import Lesson from "../model/Lesson.js";
import LessonActivity from "../model/LessonActivity.js"
import LessonMaterial from "../model/LessonMaterial.js"

export const createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json({ message: "Lesson added successfully", lesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedLesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson updated successfully", updatedLesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const deleteLesson = async (req, res) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!deletedLesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reorderLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { items } = req.body;

    await Promise.all(
      items.map((item) => {
        if (item.type === "material") {
          return LessonMaterial.findOneAndUpdate(
            { _id: item.id, lessonId },
            { order: item.order },
            { new: true }
          );
        } else if (item.type === "activity") {
          return LessonActivity.findOneAndUpdate(
            { _id: item.id, lessonId },
            { order: item.order },
            { new: true }
          );
        }
      })
    );

    res.json({ message: "Lesson content reordered successfully" });
  } catch (err) {
    console.error("Error reordering lesson content:", err);
    res
      .status(500)
      .json({ message: "Error reordering lesson content", error: err.message });
  }
};