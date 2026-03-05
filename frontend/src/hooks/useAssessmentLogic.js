import { useState } from "react";
import axios from "axios";

/**
 * useAssessmentLogic
 * Owns:
 *  - questionHistory (for AI difficulty tracking)
 *  - fetchSuggestedDifficulty  — asks the backend which difficulty to show next
 *  - pickNextQuestion          — selects the next question from the pool
 *  - markAssessmentCompleted   — posts progress to the API
 */
export function useAssessmentLogic({ lessonId, user }) {
  const [questionHistory, setQuestionHistory] = useState([]);

  // ── Ask AI which difficulty to show next ──
  const fetchSuggestedDifficulty = async (updatedHistory, currentDifficulty, remaining) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/ai/suggest-difficulty`,
        {
          history: updatedHistory,
          currentDifficulty,
          questionsRemaining: remaining,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { suggestedDifficulty, confidence, reasoning } = res.data;
      console.log(
        `🎯 [AI Difficulty] Suggested: ${suggestedDifficulty} | Confidence: ${confidence}\n` +
          `   Reasoning: ${reasoning}`
      );
      return suggestedDifficulty;
    } catch (err) {
      console.warn("⚠️ [AI Difficulty] Failed, keeping current difficulty.", err.message);
      return currentDifficulty;
    }
  };

  // ── Pick next question by difficulty, avoiding already-answered IDs ──
  const pickNextQuestion = (pool, preferredDifficulty, answeredIds = []) => {
    if (!pool || pool.length === 0) return { question: null, remainingPool: [] };

    const available = pool.filter((q) => !answeredIds.includes(q._id));
    if (available.length === 0) return { question: null, remainingPool: [] };

    const preferred = available.filter(
      (q) => (q.difficulty || "Easy").toLowerCase() === preferredDifficulty.toLowerCase()
    );

    const chosen =
      preferred.length > 0
        ? preferred[Math.floor(Math.random() * preferred.length)]
        : available[Math.floor(Math.random() * available.length)];

    if (preferred.length > 0) {
      console.log(
        `✅ [AI Difficulty] Picked "${preferredDifficulty}" from ${preferred.length} available.`
      );
    } else {
      console.log(
        `⚠️ [AI Difficulty] No "${preferredDifficulty}" questions — picking randomly.`
      );
    }

    return { question: chosen, remainingPool: pool };
  };

  // ── Mark assessment completed on the server ──
  const markAssessmentCompleted = async (assessmentId, isAIReview, currentHistory) => {
    if (!user?._id || isAIReview) return;
    try {
      const token = localStorage.getItem("token");

      // Record session for AI learning (minimum 2 questions)
      const history = currentHistory || questionHistory;
      if (history.length >= 2) {
        await axios.post(
          `http://localhost:5000/api/ai/record-session`,
          { completedQuestions: history },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("📈 Session recorded for AI learning");
      }

      await axios.post(
        `http://localhost:5000/api/progress/complete-assessment`,
        { userId: user._id, lessonId, assessmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Assessment marked as completed");
    } catch (err) {
      console.error("❌ Error marking assessment completed:", err);
    }
  };

  return {
    questionHistory,
    setQuestionHistory,
    fetchSuggestedDifficulty,
    pickNextQuestion,
    markAssessmentCompleted,
  };
}