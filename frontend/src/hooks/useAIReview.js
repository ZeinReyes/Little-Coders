import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";

/**
 * useAIReview
 * Manages:
 *  - The "do you need help?" AI prompt
 *  - Fetching & displaying the AI-generated review lesson/activity/assessment
 *  - Handlers to kick off each phase of the review session
 */
export function useAIReview({ lessonId, currentMissingTypes }) {
  const { user } = useContext(AuthContext);

  // ── Prompt state ──
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // ── Review panel state ──
  const [aiReviewData, setAiReviewData] = useState(null);
  const [aiReviewStep, setAiReviewStep] = useState("lesson"); // "lesson" | "activity" | "assessment"
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewError, setAiReviewError] = useState(null);
  const [showAIReviewPanel, setShowAIReviewPanel] = useState(false);
  const [aiReviewRevealedHints, setAiReviewRevealedHints] = useState(0);

  // ── Check if user needs a review ──
  const checkIfNeedsReview = async (currentFailures, missingTypes) => {
    if (showAIPrompt || loadingAI) return;
    const userId = user?._id || user?.id;
    if (!userId) return;

    setLoadingAI(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/ai/check-review`,
        {
          userId,
          lessonId,
          currentFailures,
          missingTypes: [...new Set(missingTypes)],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.needsReview) {
        setAiRecommendation(res.data);
        setShowAIPrompt(true);
      }
    } catch (err) {
      console.error("Review check error:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // ── User clicks "Yes, help me learn!" or "No thanks" ──
  const handleAIDecision = async (choice) => {
    if (choice === "review") {
      setShowAIPrompt(false);
      setShowAIReviewPanel(true);
      setAiReviewStep("lesson");
      setAiReviewLoading(true);
      setAiReviewError(null);

      try {
        const userId = user?._id || user?.id;
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `http://localhost:5000/api/ai/generate-review`,
          {
            userId,
            lessonId,
            missingTypes: aiRecommendation.missingTypes,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAiReviewData(res.data);
      } catch (err) {
        console.error("Failed to generate review:", err);
        setAiReviewError("Couldn't create your review lesson. Sorry!");
      } finally {
        setAiReviewLoading(false);
      }
    } else {
      setShowAIPrompt(false);
      setAiRecommendation(null);
    }
  };

  return {
    // prompt
    aiRecommendation,
    showAIPrompt,
    loadingAI,
    checkIfNeedsReview,
    handleAIDecision,
    // review panel
    aiReviewData,
    setAiReviewData,
    aiReviewStep,
    setAiReviewStep,
    aiReviewLoading,
    aiReviewError,
    setAiReviewError,
    showAIReviewPanel,
    setShowAIReviewPanel,
    aiReviewRevealedHints,
    setAiReviewRevealedHints,
  };
}