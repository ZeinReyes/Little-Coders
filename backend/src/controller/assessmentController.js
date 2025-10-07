import Assessment from "../model/Assessment.js";

export const createAssessment = async (req, res) => {
  try {
    const { title, instructions, hints, expectedOutput, difficulty, lessonId } = req.body;

    if (!title || !instructions || !expectedOutput || !lessonId)
      return res.status(400).json({ message: "All required fields must be filled." });

    const validDifficulties = ["Easy", "Medium", "Hard"];
    if (!validDifficulties.includes(difficulty))
      return res.status(400).json({ message: "Invalid difficulty value." });

    const newAssessment = new Assessment({
      title,
      instructions,
      hints,
      expectedOutput,
      difficulty,
      lessonId,
    });

    await newAssessment.save();
    res.status(201).json({ message: "Assessment created successfully!", newAssessment });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({ message: "Server error while creating assessment." });
  }
};


export const getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().populate("lessonId", "title");
    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Server error while fetching assessments." });
  }
};
