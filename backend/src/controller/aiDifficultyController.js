/**
 * aiDifficultyController.js
 * 
 * Uses the custom-trained LittleCoders AI (no external APIs).
 * Drop-in replacement — same request/response shape as before.
 */

import { suggestNextDifficulty, initAI } from "../services/LittleCodersAI.js";

// Pre-train the model when the server starts (takes ~1 second)
initAI();

/**
 * POST /api/ai/suggest-difficulty
 */
export const getSuggestedDifficulty = async (req, res) => {
  try {
    const { history, currentDifficulty, questionsRemaining } = req.body;

    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: "history must be an array of question attempt objects.",
      });
    }

    for (const item of history) {
      if (!["Easy", "Medium", "Hard"].includes(item.difficulty)) {
        return res.status(400).json({
          success: false,
          message: `Invalid difficulty "${item.difficulty}" in history.`,
        });
      }
      if (typeof item.solved !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Each history item must have a boolean 'solved' field.",
        });
      }
      if (typeof item.attemptsUsed !== "number" || item.attemptsUsed < 1 || item.attemptsUsed > 3) {
        return res.status(400).json({
          success: false,
          message: "attemptsUsed must be a number between 1 and 3.",
        });
      }
    }

    // suggestNextDifficulty is now synchronous (no external API calls!)
    const result = suggestNextDifficulty({
      history,
      currentDifficulty: currentDifficulty ?? "Easy",
      questionsRemaining: questionsRemaining ?? null,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("Error getting AI difficulty suggestion:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while getting difficulty suggestion.",
    });
  }
};