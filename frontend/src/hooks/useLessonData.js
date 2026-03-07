import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const lessonImages = ["/assets/images/lesson.png", "/assets/images/lesson1.png"];
const congratsImages = [
  "/assets/images/congrats.png",
  "/assets/images/congrats1.png",
  "/assets/images/congrats2.png",
  "/assets/images/congrats3.png",
  "/assets/images/congrats4.png",
];

export const getRandomImage = (images) => images[Math.floor(Math.random() * images.length)];

/**
 * useLessonData
 * Responsible for:
 *  - Reading navigation state (assessment / aiActivity / aiAssessment)
 *  - Fetching lesson / activity / assessment from the API when needed
 *  - Exposing `lesson`, `setLesson`, `loading`, and `characterImg`
 */
export function useLessonData({ lessonId, itemId }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [characterImg, setCharacterImg] = useState("");

  const location = useLocation();
  const { assessment, questions, aiActivity, isAIReview, aiAssessment } =
    location.state || {};

  // ── AI Activity from navigation state ──
  useEffect(() => {
    if (aiActivity && isAIReview) {
      setLesson({ ...aiActivity, type: "activity", isAIReview: true });
      setLoading(false);
    }
  }, [aiActivity, isAIReview]);

  // ── AI Assessment from navigation state ──
  useEffect(() => {
    if (aiAssessment && isAIReview) {
      const qs = aiAssessment.questions || [];
      const pool = [...qs];
      const firstQuestion = pool.splice(0, 1)[0];
      setLesson({
        ...aiAssessment,
        type: "assessment",
        questionsPool: pool,
        currentQuestion: firstQuestion,
        answered: [],
        totalQuestions: qs.length,
        isAIReview: true,
      });
      setLoading(false);
    }
  }, [aiAssessment, isAIReview]);

  // ── Assessment passed via navigation state ──
  useEffect(() => {
    if (assessment && questions) {
      const allQuestions = [...questions];
      const easyQuestions = allQuestions.filter(
        (q) => (q.difficulty || "easy").toLowerCase() === "easy"
      );
      const startPool = easyQuestions.length > 0 ? easyQuestions : allQuestions;
      const firstQuestion = startPool[Math.floor(Math.random() * startPool.length)];
      const remainingPool = allQuestions.filter((q) => q._id !== firstQuestion._id);

      setLesson({
        ...assessment,
        type: "assessment",
        questionsPool: remainingPool,
        currentQuestion: firstQuestion,
        answered: [],
        totalQuestions: 5,
      });
      setLoading(false);
    }
  }, [assessment, questions]);

  // ── Fetch from API ──
  useEffect(() => {
    const fetchLessonOrActivity = async () => {
      if (aiActivity || aiAssessment || (assessment && questions)) return;

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios
          .get(
            `https://little-coders-production.up.railway.app/api/materials/lessons/${lessonId}/materials/${itemId}`,
            { headers }
          )
          .then((r) => ({ ...r.data, type: "lesson" }))
          .catch(async () =>
            axios
              .get(
                `https://little-coders-production.up.railway.app/api/assessments/lessons/${lessonId}/assessments/${itemId}`,
                { headers }
              )
              .then((r) => {
                const a = { ...r.data, _id: r.data.id, type: "assessment" };
                if (a.questions?.length > 0) {
                  const allQ = [...a.questions];
                  const easy = allQ.filter(
                    (q) => (q.difficulty || "easy").toLowerCase() === "easy"
                  );
                  const pool = easy.length > 0 ? easy : allQ;
                  const first = pool[Math.floor(Math.random() * pool.length)];
                  a.questionsPool = allQ.filter((q) => q._id !== first._id);
                  a.currentQuestion = first;
                  a.answered = [];
                  a.totalQuestions = 5;
                  delete a.questions;
                }
                return a;
              })
              .catch(() =>
                axios
                  .get(
                    `https://little-coders-production.up.railway.app/api/activities/lessons/${lessonId}/activities/${itemId}`,
                    { headers }
                  )
                  .then((r) => ({ ...r.data, type: "activity" }))
              )
          );

        setLesson({ ...res, currentContentIndex: res.type === "lesson" ? 0 : null });
        if (res.type === "lesson") setCharacterImg(getRandomImage(lessonImages));
      } catch (err) {
        console.error("❌ Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonOrActivity();
  }, [itemId, lessonId]);

  return {
    lesson,
    setLesson,
    loading,
    characterImg,
    setCharacterImg,
    congratsImages,
    lessonImages,
  };
}