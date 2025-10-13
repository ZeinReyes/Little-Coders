import Assessment from "../model/Assessment.js";

/* ===========================================================
   🧩 CREATE ASSESSMENT (regex & operator based only)
   =========================================================== */
   export const createAssessment = async (req, res) => {
    try {
      console.log("🟢 [createAssessment] Incoming request body:", req.body);
  
      const {
        title,
        question,
        instructions,
        hints = [],
        difficulty,
        lessonId,
        dataTypeChecks = [], // ✅ no regex now
        category,
      } = req.body;
  
      if (!title?.trim() || !question?.trim() || !instructions?.trim() || !lessonId?.trim()) {
        console.warn("⚠️ Missing required fields");
        return res.status(400).json({ success: false, message: "All required fields must be filled." });
      }
  
      const validDifficulties = ["Easy", "Medium", "Hard"];
      if (difficulty && !validDifficulties.includes(difficulty)) {
        console.warn("⚠️ Invalid difficulty");
        return res.status(400).json({ success: false, message: "Invalid difficulty value." });
      }
  
      // Clean hints and data type list
      const cleanedHints = hints.filter((h) => h.trim() !== "");
      const cleanedChecks = dataTypeChecks.filter((c) => c.name?.trim() !== "");
  
      const newAssessment = new Assessment({
        title,
        question,
        instructions,
        hints: cleanedHints,
        difficulty,
        lessonId,
        dataTypeChecks: cleanedChecks,
        category,
        createdBy: req.user?.id || null,
      });
  
      console.log("💾 Saving assessment to DB...");
      await newAssessment.save();
      console.log("✅ Assessment saved:", newAssessment._id);
  
      res.status(201).json({
        success: true,
        message: "Assessment created successfully!",
        data: newAssessment,
      });
    } catch (error) {
      console.error("❌ Error creating assessment:", error);
      res.status(500).json({
        success: false,
        message: "Server error while creating assessment.",
      });
    }
  };

/* ===========================================================
   📘 GET ALL ASSESSMENTS
   =========================================================== */
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

/* ===========================================================
   🔍 GET ASSESSMENT BY ID
   =========================================================== */
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id).populate("lessonId");
    if (!assessment)
      return res.status(404).json({ success: false, message: "Assessment not found" });
    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching assessment",
      error: err.message,
    });
  }
};

/* ===========================================================
   📗 GET ASSESSMENTS BY LESSON
   =========================================================== */
export const getAssessmentsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const assessments = await Assessment.find({ lessonId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: assessments });
  } catch (err) {
    console.error("Error fetching assessments by lesson:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching assessments by lesson.",
    });
  }
};

/* ===========================================================
   📘 GET ASSESSMENT BY LESSON & ID
   =========================================================== */
export const getAssessmentByLessonAndId = async (req, res) => {
  try {
    const { lessonId, assessmentId } = req.params;
    const assessment = await Assessment.findOne({ _id: assessmentId, lessonId });
    if (!assessment)
      return res.status(404).json({
        success: false,
        message: "Assessment not found for this lesson.",
      });
    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching assessment.",
      error: err.message,
    });
  }
};

/* ===========================================================
   ✏️ UPDATE ASSESSMENT
   =========================================================== */
export const updateAssessment = async (req, res) => {
  try {
    const {
      title,
      question,
      instructions,
      hints,
      difficulty,
      lessonId,
      regexChecks,
      operatorChecks,
      category,
    } = req.body;

    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty value.",
      });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (question) updateFields.question = question;
    if (instructions) updateFields.instructions = instructions;
    if (hints) updateFields.hints = hints.filter((h) => h.trim() !== "");
    if (difficulty) updateFields.difficulty = difficulty;
    if (lessonId) updateFields.lessonId = lessonId;
    if (regexChecks)
      updateFields.regexChecks = regexChecks.filter(
        (r) => r.description?.trim() !== "" && r.pattern?.trim() !== ""
      );
    if (operatorChecks)
      updateFields.operatorChecks = operatorChecks.filter((o) => o.operator?.trim() !== "");
    if (category) updateFields.category = category;

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment)
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });

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

/* ===========================================================
   🗑️ DELETE ASSESSMENT
   =========================================================== */
export const deleteAssessment = async (req, res) => {
  try {
    const deletedAssessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!deletedAssessment)
      return res.status(404).json({
        success: false,
        message: "Assessment not found.",
      });

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

/* ===========================================================
   🔍 CODE CHECKER (regex + operator validation)
   =========================================================== */
export const checkUserCode = async (req, res) => {
  try {
    const { code } = req.body;
    const { id } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment)
      return res.status(404).json({ success: false, message: "Assessment not found" });

    let results = [];
    let passed = true;

    // 🧠 Regex checks
    assessment.regexChecks?.forEach((check) => {
      const regex = new RegExp(check.pattern);
      const ok = regex.test(code);
      if (check.required && !ok) passed = false;
      results.push({
        description: check.description,
        pattern: check.pattern,
        passed: ok,
      });
    });

    // ⚙️ Operator checks
    assessment.operatorChecks?.forEach((check) => {
      const regex = new RegExp(`\\b${check.operator}\\b`);
      const ok = regex.test(code);
      if (check.required && !ok) passed = false;
      results.push({
        description: `Use of operator "${check.operator}"`,
        operator: check.operator,
        passed: ok,
      });
    });

    res.status(200).json({ success: true, passed, results });
  } catch (error) {
    console.error("Error checking code:", error);
    res.status(500).json({
      success: false,
      message: "Error while checking code.",
    });
  }
};
