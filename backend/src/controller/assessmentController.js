import Assessment from "../model/Assessment.js";

// ✅ Create Assessment (with multiple embedded questions + order)
export const createAssessment = async (req, res) => {
  try {
    const { title, lessonId, questions } = req.body;

    if (!title || !lessonId || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, lessonId, and at least one question are required.",
      });
    }

    // Validate each question
    const validDifficulties = ["Easy", "Medium", "Hard"];
    const validDataTypes = [
      "print", "variable", "multiple", "add", "subtract", "divide",
      "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
      "if", "elif", "else", "while"
    ];

    for (const q of questions) {
      if (!q.instructions) {
        return res.status(400).json({
          success: false,
          message: "Each question must have instructions.",
        });
      }

      if (q.difficulty && !validDifficulties.includes(q.difficulty)) {
        return res.status(400).json({
          success: false,
          message: "Invalid difficulty value in one of the questions.",
        });
      }

      if (q.dataTypesRequired && !q.dataTypesRequired.every(dt => validDataTypes.includes(dt))) {
        return res.status(400).json({
          success: false,
          message: "Invalid data type selected in one of the questions.",
        });
      }
    }

    // 🔥 Determine next order (always integer, sequential)
    const assessments = await Assessment.find({ lessonId }).sort({ order: 1 });
    const nextOrder = assessments.length;

    const newAssessment = new Assessment({
      title,
      lessonId,
      questions,
      order: nextOrder,
    });

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

// ✅ Get All Assessments
export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("lessonId", "title").sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching assessments.",
    });
  }
};

// ✅ Get one assessment by ID
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate("lessonId");
    if (!assessment)
      return res.status(404).json({ message: "Assessment not found" });

    res.json(assessment);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching assessment",
      error: err.message,
    });
  }
};

// ✅ Get Assessments by Lesson
export const getAssessmentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const assessments = await Assessment.find({ lessonId }).sort({ order: 1 });

    res.status(200).json(assessments);
  } catch (err) {
    console.error("Error fetching assessments by lesson:", err);
    res.status(500).json({ message: "Error fetching assessments by lesson" });
  }
};

// ✅ Get Specific Assessment by Lesson and ID
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

// ✅ Update Assessment (can also update nested questions)
export const updateAssessment = async (req, res) => {
  try {
    const { title, lessonId, questions } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (lessonId) updateFields.lessonId = lessonId;
    if (questions) updateFields.questions = questions;

    // Validate questions if provided
    if (questions) {
      const validDifficulties = ["Easy", "Medium", "Hard"];
      const validDataTypes = [
        "print", "variable", "multiple", "add", "subtract", "divide",
        "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
        "if", "elif", "else", "while"
      ];

      for (const q of questions) {
        if (!q.instructions) {
          return res.status(400).json({
            success: false,
            message: "Each question must have instructions.",
          });
        }

        if (q.difficulty && !validDifficulties.includes(q.difficulty)) {
          return res.status(400).json({
            success: false,
            message: "Invalid difficulty value in one of the questions.",
          });
        }

        if (q.dataTypesRequired && !q.dataTypesRequired.every(dt => validDataTypes.includes(dt))) {
          return res.status(400).json({
            success: false,
            message: "Invalid data type selected in one of the questions.",
          });
        }
      }
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
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

// ✅ Delete Assessment (with robust reindexing)
export const deleteAssessment = async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!deletedAssessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }

    // 🔥 Reindex all remaining assessments in lesson to sequential integers
    const assessments = await Assessment.find({ lessonId: deletedAssessment.lessonId })
      .sort({ order: 1 });

    for (let i = 0; i < assessments.length; i++) {
      if (assessments[i].order !== i) {
        assessments[i].order = i;
        await assessments[i].save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully and order reindexed!",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting assessment.",
    });
  }
};

// ✅ Optional: Reorder assessments manually
export const reorderAssessments = async (req, res) => {
  try {
    const { assessments } = req.body; // array [{ id, order }]
    if (!Array.isArray(assessments)) {
      return res.status(400).json({ message: "Invalid assessments array" });
    }

    await Promise.all(
      assessments.map(a => Assessment.findByIdAndUpdate(a.id, { order: a.order }))
    );

    res.status(200).json({ message: "Assessments reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error reordering assessments", error: err.message });
  }
};
