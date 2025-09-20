import Lesson from "../model/Lesson.js";
import LessonActivity from "../model/LessonActivity.js"
import LessonMaterial from "../model/LessonMaterial.js"

const topicKeys = ["variables", "operators", "conditionals", "loops", "functions"];

export const createLesson = async (req, res) => {
  try {
    const { title, description, topics = {} } = req.body;

    
    const normalizedTopics = topicKeys.reduce((acc, key) => {
      acc[key] = topics[key] || false;
      return acc;
    }, {});

    const lesson = new Lesson({ title, description, topics: normalizedTopics });
    await lesson.save();

    res.status(201).json({ message: "Lesson added successfully", lesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find();

    const normalized = lessons.map((lesson) => {
      const normalizedTopics = topicKeys.reduce((acc, key) => {
        acc[key] = lesson.topics?.[key] || false;
        return acc;
      }, {});
      return { ...lesson.toObject(), topics: normalizedTopics };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const normalizedTopics = topicKeys.reduce((acc, key) => {
      acc[key] = lesson.topics?.[key] || false;
      return acc;
    }, {});

    res.json({ ...lesson.toObject(), topics: normalizedTopics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateLesson = async (req, res) => {
  try {
    const { title, description, topics = {} } = req.body;

    const normalizedTopics = topicKeys.reduce((acc, key) => {
      acc[key] = topics[key] || false;
      return acc;
    }, {});

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, description, topics: normalizedTopics },
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

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items payload" });
    }

    await Promise.all(
      items.map((item) => {
        if (item.type === "material") {
          return LessonMaterial.findOneAndUpdate(
            { _id: item.id, lessonId },
            { order: item.order }
          );
        } else if (item.type === "activity") {
          return LessonActivity.findOneAndUpdate(
            { _id: item.id, lessonId },
            { order: item.order }
          );
        }
        return null;
      })
    );

    res.json({ message: "Lesson content reordered successfully" });
  } catch (error) {
    console.error("Error reordering lesson content:", error);
    res.status(500).json({ message: "Error reordering content", error: error.message });
  }
};
