import axios from "axios";

const SESSION_KEY_PREFIX = "dragboard_session_";

const clearAllSessions = (lessonId, itemId) => {
  try {
    sessionStorage.removeItem(`${SESSION_KEY_PREFIX}assessment_${lessonId}_${itemId}`);
    sessionStorage.removeItem(`${SESSION_KEY_PREFIX}activity_${lessonId}_${itemId}`);
  } catch (_) {}
};

/**
 * useProgressTracking
 * Thin wrappers around the progress API endpoints.
 * Keeps all axios progress calls in one place.
 */
export function useProgressTracking({ lessonId, itemId, user }) {

  // ── Mark lesson / activity / assessment completed ──
  const markCompleted = async ({ lessonType, lessonStartTime, assessmentId }) => {
    if (!user?._id) return;

    try {
      const token = localStorage.getItem("token");
      const payload = { userId: user._id, lessonId };
      let endpoint = "";

      if (lessonType === "lesson") {
        endpoint = "complete-material";
        payload.materialId = itemId;
        payload.timeSeconds = Math.floor((Date.now() - lessonStartTime) / 1000);
      } else if (lessonType === "activity") {
        endpoint = "complete-activity";
        payload.activityId = itemId;
      } else if (lessonType === "assessment") {
        endpoint = "complete-assessment";
        payload.assessmentId = assessmentId || itemId;
      }

      if (!endpoint) return;

      await axios.post(
        `https://little-coders-production.up.railway.app/api/progress/${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Clear persisted session so reopening starts fresh
      clearAllSessions(lessonId, itemId);
    } catch (err) {
      console.error("❌ Error marking item completed:", err);
    }
  };

  // ── Record a single assessment attempt ──
  const recordAssessmentAttempt = async ({
    assessmentId,
    questionId,
    timeTaken,
    totalAttempts,
    correct,
    difficulty,
    isAIReview,
  }) => {
    if (isAIReview) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://little-coders-production.up.railway.app/api/progress/mark-assessment-attempt`,
        {
          assessmentId,
          lessonId,
          questionId,
          userId: user._id || user.id,
          timeSeconds: timeTaken,
          totalAttempts,
          correct,
          difficulty,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Failed to submit assessment attempt:", err);
    }
  };

  // ── Record a single activity attempt ──
  const recordActivityAttempt = async ({
    activityId,
    timeTaken,
    totalAttempts,
    correct,
    isAIReview,
  }) => {
    if (isAIReview) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://little-coders-production.up.railway.app/api/progress/mark-activity-attempt`,
        {
          activityId,
          lessonId,
          userId: user._id || user.id,
          timeSeconds: timeTaken,
          totalAttempts,
          correct,
          attemptTime: Date.now(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch((err) =>
        console.error("❌ Failed to save attempt:", err.response?.data || err.message)
      );
    } catch (err) {
      console.error("❌ Failed to save activity attempt:", err);
    }
  };

  return { markCompleted, recordAssessmentAttempt, recordActivityAttempt };
}