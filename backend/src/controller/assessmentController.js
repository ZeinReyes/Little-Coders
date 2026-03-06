import Assessment from "../model/Assessment.js";

const validDataTypes = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while", "do-while", "for",  // ← add these three
];

const validDifficulties = ["Easy", "Medium", "Hard"];

const validateQuestions = (questions) => {
  for (const q of questions) {
    if (!q.instructions) {
      return "Each question must have instructions.";
    }
    if (q.difficulty && !validDifficulties.includes(q.difficulty)) {
      return "Invalid difficulty value in one of the questions.";
    }
    if (q.dataTypesRequired && !q.dataTypesRequired.every(dt => validDataTypes.includes(dt.type))) {
      return "Invalid data type selected in one of the questions.";
    }
  }
  return null;
};

export const createAssessment = async (req, res) => {
  try {
    const { title, lessonId, questions, timeLimit } = req.body;

    if (!title || !lessonId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, lessonId, and at least one question are required.",
      });
    }

    if (!timeLimit || timeLimit < 30) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be at least 30 seconds.",
      });
    }

    const questionError = validateQuestions(questions);
    if (questionError) {
      return res.status(400).json({ success: false, message: questionError });
    }

    const newAssessment = new Assessment({ title, lessonId, questions, timeLimit });
    await newAssessment.save();

    res.status(201).json({
      success: true,
      message: "Assessment created successfully!",
      data: newAssessment,
    });

  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating assessment.",
    });
  }
};


export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("lessonId", "title");
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ success: false, message: "Server error while fetching assessments." });
  }
};

export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate("lessonId");
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assessment", error: err.message });
  }
};

export const getAssessmentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const assessments = await Assessment.find({ lessonId }).sort({ createdAt: 1 });
    res.status(200).json(assessments);
  } catch (err) {
    console.error("Error fetching assessments by lesson:", err);
    res.status(500).json({ message: "Error fetching assessments by lesson" });
  }
};

export const getAssessmentByLessonAndId = async (req, res) => {
  try {
    const { lessonId, assessmentId } = req.params;
    const assessment = await Assessment.findOne({ _id: assessmentId, lessonId });
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found for this lesson." });
    }
    res.status(200).json(assessment);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assessment.", error: err.message });
  }
};

export const updateAssessment = async (req, res) => {
  try {
    const { title, lessonId, questions, timeLimit } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (lessonId) updateFields.lessonId = lessonId;

    if (timeLimit !== undefined) {
      if (timeLimit < 30) {
        return res.status(400).json({
          success: false,
          message: "Time limit must be at least 30 seconds.",
        });
      }
      updateFields.timeLimit = timeLimit;
    }

    if (questions) {
      const questionError = validateQuestions(questions);
      if (questionError) {
        return res.status(400).json({ success: false, message: questionError });
      }
      updateFields.questions = questions;
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }

    res.status(200).json({
      success: true,
      message: "Assessment updated successfully!",
      data: updatedAssessment,
    });

  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating assessment.",
    });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!deletedAssessment) {
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }
    res.status(200).json({ success: true, message: "Assessment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ success: false, message: "Server error while deleting assessment." });
  }
};