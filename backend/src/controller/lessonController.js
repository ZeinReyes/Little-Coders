import Lesson from "../model/Lesson.js";
import LessonActivity from "../model/LessonActivity.js";
import LessonMaterial from "../model/LessonMaterial.js";

// -------------------------------------------------------
// CREATE LESSON WITH ORDER
// -------------------------------------------------------
export const createLesson = async (req, res) => {
  try {
    const { title, description, topic, position } = req.body; // optional position to insert

    // Fetch existing lessons for this topic
    const lessons = await Lesson.find({ topic }).sort({ order: 1 });

    let newOrder;
    if (position != null && position >= 0 && position <= lessons.length) {
      // Insert at specific position
      lessons.splice(position, 0, { title, description }); // placeholder
      lessons.forEach((l, index) => {
        if (l._id) l.order = index;
      });

      await Promise.all(
        lessons.filter(l => l._id).map(l => Lesson.findByIdAndUpdate(l._id, { order: l.order }))
      );

      newOrder = position;
    } else {
      // Append at the end
      newOrder = lessons.length;
    }

    const lesson = new Lesson({ title, description, topic, order: newOrder });
    await lesson.save();

    res.status(201).json({ message: "Lesson added successfully", lesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -------------------------------------------------------
// GET ALL LESSONS — SORTED BY ORDER
// -------------------------------------------------------
export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------
// GET LESSON BY ID
// -------------------------------------------------------
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------
// UPDATE LESSON
// -------------------------------------------------------
export const updateLesson = async (req, res) => {
  try {
    const { title, description, topic } = req.body;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { title, description, topic },
      { new: true }
    );

    if (!updatedLesson) return res.status(404).json({ message: "Lesson not found" });

    res.json({ message: "Lesson updated successfully", updatedLesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -------------------------------------------------------
// DELETE LESSON — AUTO REINDEX ORDER
// -------------------------------------------------------
export const deleteLesson = async (req, res) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!deletedLesson) return res.status(404).json({ message: "Lesson not found" });

    // Reindex remaining lessons in the same topic
    const lessons = await Lesson.find({ topic: deletedLesson.topic }).sort({ order: 1 });
    for (let i = 0; i < lessons.length; i++) {
      if (lessons[i].order !== i) {
        lessons[i].order = i;
        await lessons[i].save();
      }
    }

    res.json({ message: "Lesson deleted and order reindexed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------
// REORDER LESSON CONTENT (ACTIVITIES & MATERIALS)
// -------------------------------------------------------
export const reorderLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid items payload" });
    }

    // Normalize order to sequential integers
    items.sort((a, b) => a.order - b.order);
    await Promise.all(
      items.map((item, index) => {
        const updateData = { order: index };
        if (item.type === "material") {
          return LessonMaterial.findOneAndUpdate({ _id: item.id, lessonId }, updateData);
        } else if (item.type === "activity") {
          return LessonActivity.findOneAndUpdate({ _id: item.id, lessonId }, updateData);
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
