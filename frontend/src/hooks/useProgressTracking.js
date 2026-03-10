import axios from "axios";

const SESSION_KEY_PREFIX = "dragboard_session_";
const API_BASE = "https://little-coders-production.up.railway.app/api/progress";

const clearAllSessions = (lessonId, itemId) => {
  try {
    sessionStorage.removeItem(`${SESSION_KEY_PREFIX}assessment_${lessonId}_${itemId}`);
    sessionStorage.removeItem(`${SESSION_KEY_PREFIX}activity_${lessonId}_${itemId}`);
  } catch (_) {}
};

// ✅ Read the active child from sessionStorage (set by ChildSelectPage)
const getChildId = () => {
  try {
    const raw = sessionStorage.getItem("activeChild");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed._id || parsed.id || null;
  } catch {
    return null;
  }
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

    const childId = getChildId();
    if (!childId) {
      console.warn("⚠️ No active child found in sessionStorage");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        userId:   user._id,
        childId,            // ✅ scopes progress to the selected child
        lessonId,
      };
      let endpoint = "";

      if (lessonType === "lesson") {
        endpoint = "material";                // ✅ was "complete-material"
        payload.materialId  = itemId;
        payload.timeSeconds = Math.floor((Date.now() - lessonStartTime) / 1000);
      } else if (lessonType === "activity") {
        endpoint = "activity";                // ✅ was "complete-activity"
        payload.activityId  = itemId;
      } else if (lessonType === "assessment") {
        endpoint = "assessment";              // ✅ was "complete-assessment"
        payload.assessmentId = assessmentId || itemId;
      }

      if (!endpoint) return;

      await axios.post(
        `${API_BASE}/${endpoint}`,
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

    const childId = getChildId();
    if (!childId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/assessment-attempt`,   // ✅ was "mark-assessment-attempt"
        {
          userId:        user._id || user.id,
          childId,                           // ✅ added
          lessonId,
          assessmentId,
          questionId,
          timeSeconds:   timeTaken,
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

    const childId = getChildId();
    if (!childId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/activity-attempt`,     // ✅ was "mark-activity-attempt"
        {
          userId:      user._id || user.id,
          childId,                           // ✅ added
          lessonId,
          activityId,
          timeSeconds: timeTaken,
          totalAttempts,
          correct,
          attemptTime: Date.now(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Failed to save activity attempt:", err);
    }
  };

  return { markCompleted, recordAssessmentAttempt, recordActivityAttempt };
}