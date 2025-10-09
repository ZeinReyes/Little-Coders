import Assessment from "../model/Assessment.js";

// ✅ Create Assessment
export const createAssessment = async (req, res) => {
  try {
    const { title, instructions, hints, expectedOutput, difficulty, lessonId } = req.body;

    if (!title || !instructions || !expectedOutput || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty value.",
      });
    }

    const newAssessment = new Assessment({
      title,
      instructions,
      hints,
      expectedOutput,
      difficulty,
      lessonId,
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
    const assessments = await Assessment.find().populate("lessonId", "title");

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
    if (!assessment) return res.status(404).json({ message: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assessment", error: err.message });

  }
};


// ✅ Update Assessment
export const updateAssessment = async (req, res) => {
  try {
    const { title, instructions, hints, expectedOutput, difficulty, lessonId } = req.body;

    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty value.",
      });
    }

    // ✅ Build only the fields that exist (avoid overwriting with undefined)
    const updateFields = {};
    if (title) updateFields.title = title;
    if (instructions) updateFields.instructions = instructions;
    if (hints) updateFields.hints = hints;
    if (expectedOutput) updateFields.expectedOutput = expectedOutput;
    if (difficulty) updateFields.difficulty = difficulty;
    if (lessonId) updateFields.lessonId = lessonId;

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


// ✅ Delete Assessment
export const deleteAssessment = async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!deletedAssessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting assessment.",
    });
  }
};
