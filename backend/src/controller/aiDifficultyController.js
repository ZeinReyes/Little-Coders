// controllers/aiDifficultyController.js
import { suggestNextDifficulty, recordSession, getModelStatus } from "../services/LittleCodersAI.js";

// POST /api/ai/suggest-difficulty
export const getSuggestedDifficulty = async (req, res) => {
  try {
    const { history, currentDifficulty, questionsRemaining } = req.body;
    if (!Array.isArray(history)) return res.status(400).json({ success: false, message: "history must be an array." });
    const result = suggestNextDifficulty({ history, currentDifficulty: currentDifficulty ?? "Easy", questionsRemaining: questionsRemaining ?? 0 });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Error in suggest-difficulty:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/ai/record-session
export const recordAssessmentSession = (req, res) => {
  try {
    const { completedQuestions } = req.body;
    if (!Array.isArray(completedQuestions)) return res.status(400).json({ success: false, message: "completedQuestions must be an array." });
    setImmediate(() => recordSession(completedQuestions));
    return res.status(200).json({ success: true, message: "Session recorded." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/ai/status
export const getAIStatus = (_req, res) => {
  return res.status(200).json({ success: true, ...getModelStatus() });
};