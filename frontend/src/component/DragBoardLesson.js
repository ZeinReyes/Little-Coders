// src/pages/DragBoardLesson.js
import React, { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import "./DragBoard.css";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

import { initDragAndDrop } from "../utils/dragAndDrop";
import { updateCode } from "../utils/codeGen";
import { updateVariableState } from "../utils/state";
import { runProgram } from "../utils/runner";
import { codeChecker } from "../utils/codeChecker";
import {
  playLessonSound,
  stopLessonSound,
  playActivitySound,
  stopActivitySound,
  playSuccessSound,
  playErrorSound,
} from "../utils/sfx";

const lessonImages = ["/assets/images/lesson.png", "/assets/images/lesson1.png"];
const activityImages = ["/assets/images/activity.png", "/assets/images/activity1.png"];
const congratsImages = [
  "/assets/images/congrats.png",
  "/assets/images/congrats1.png",
  "/assets/images/congrats2.png",
  "/assets/images/congrats3.png",
  "/assets/images/congrats4.png",
];

const getRandomImage = (images) => images[Math.floor(Math.random() * images.length)];

export default function DragBoardLesson() {
  const { lessonId, itemId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [characterImg, setCharacterImg] = useState("");
  const [activityText, setActivityText] = useState("");
  const [activitySlide, setActivitySlide] = useState(0);

  const [assessmentAttempts, setAssessmentAttempts] = useState(0);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [assessmentAnswer, setAssessmentAnswer] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [lessonStartTime, setLessonStartTime] = useState(Date.now());

  const location = useLocation();
  const { assessment, questions, aiActivity, isAIReview, aiAssessment } = location.state || {};

  const [timeLeft, setTimeLeft] = useState(300);
  const [timerStarted, setTimerStarted] = useState(false);

  // ── AI PERSONALIZATION STATE ──
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [currentMissingTypes, setCurrentMissingTypes] = useState([]);
  const [aiCheckPerformed, setAiCheckPerformed] = useState(false);

  // ── AI REVIEW SESSION STATE (inline) ──
  const [aiReviewData, setAiReviewData] = useState(null);
  const [aiReviewStep, setAiReviewStep] = useState("lesson");
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiReviewError, setAiReviewError] = useState(null);
  const [aiReviewRevealedHints, setAiReviewRevealedHints] = useState(0);
  const [showAIReviewPanel, setShowAIReviewPanel] = useState(false);

  const [activityAttempts, setActivityAttempts] = useState(0);
  const [currentActivityStartTime, setCurrentActivityStartTime] = useState(Date.now());
  const [revealedHints, setRevealedHints] = useState(0);

  // ── AI DIFFICULTY STATE ──
  const [questionHistory, setQuestionHistory] = useState([]);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ── Load AI Activity from navigation state ──
  useEffect(() => {
    if (aiActivity && isAIReview) {
      setLesson({ ...aiActivity, type: "activity", isAIReview: true });
      setLoading(false);
      setShowLessonModal(false);
    }
  }, [aiActivity, isAIReview]);

  // ── Load AI Assessment from navigation state ──
  useEffect(() => {
    if (aiAssessment && isAIReview) {
      const qs = aiAssessment.questions || [];
      const pool = [...qs];
      const firstQuestion = pool.splice(0, 1)[0];
      const totalQuestions = qs.length;
      setLesson({
        ...aiAssessment,
        type: "assessment",
        questionsPool: pool,
        currentQuestion: firstQuestion,
        answered: [],
        totalQuestions,
        isAIReview: true,
      });
      setAssessmentAttempts(0);
      setQuestionStartTime(Date.now());
      setLoading(false);
      setShowLessonModal(false);
    }
  }, [aiAssessment, isAIReview]);

  // ── Timer ──
  useEffect(() => {
    if (!lesson) return;
    if (lesson.type === "assessment" && timerStarted) return;

    setTimeLeft(lesson.timeLimit || 300);
    setTimerStarted(true);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lesson?.type, lesson?._id, lesson?.id, itemId]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (lesson?.type === "lesson" && showLessonModal) {
      setLessonStartTime(Date.now());
    }
  }, [lesson?.type, showLessonModal]);

  // ── Initialize assessment from navigation state ──
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

      setAssessmentAttempts(0);
      setQuestionStartTime(Date.now());
      setLoading(false);
    }
  }, [assessment, questions]);

  // ── Reset on new activity ──
  useEffect(() => {
    if (showActivityModal) {
      setCurrentActivityStartTime(Date.now());
      setActivityAttempts(0);
      setRevealedHints(0);
      setAiCheckPerformed(false);
    }
  }, [showActivityModal]);

  // ── Reset on new assessment question ──
  useEffect(() => {
    if (lesson?.type === "assessment" && lesson?.currentQuestion) {
      setRevealedHints(0);
    }
  }, [lesson?.currentQuestion]);

  useEffect(() => {
    if (lesson?.type === "assessment") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, lesson?.currentQuestion]);

  // ── Lesson sound ──
  useEffect(() => {
    if (showLessonModal && lesson?.type === "lesson") {
      const startSound = () => {
        playLessonSound();
        document.removeEventListener("click", startSound);
      };
      document.addEventListener("click", startSound, { once: true });
    }
  }, [showLessonModal, lesson]);

  // ── Activity sound ──
  useEffect(() => {
    if (showActivityModal) {
      const startSound = () => {
        playActivitySound();
        document.removeEventListener("click", startSound);
      };
      document.addEventListener("click", startSound, { once: true });
    }
  }, [showActivityModal]);

  // ── checkIfNeedsReview ──
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
      const data = res.data;
      if (data.needsReview) {
        setAiRecommendation(data);
        setShowAIPrompt(true);
      }
    } catch (err) {
      console.error("Review check error:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // ── AI DIFFICULTY: Ask AI which difficulty to show next ──
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
          `   Reasoning: ${reasoning}\n` +
          `   History (${updatedHistory.length} questions):`,
        updatedHistory
      );

      return suggestedDifficulty;
    } catch (err) {
      console.warn(
        "⚠️ [AI Difficulty] Failed to get suggestion, keeping current difficulty.",
        err.message
      );
      return currentDifficulty;
    }
  };

  // ── Pick next question from full bank by difficulty, avoiding already-answered ones ──
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
        `✅ [AI Difficulty] Picked random "${preferredDifficulty}" question from ${preferred.length} available.`
      );
    } else {
      console.log(
        `⚠️ [AI Difficulty] No "${preferredDifficulty}" questions left — picking random from ${available.length} available.`
      );
    }

    // Pool stays the same (full bank) — answered tracked via answeredIds
    return { question: chosen, remainingPool: pool };
  };

  // ── Handle AI decision ──
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

  // ── Start AI Review Activity ──
  const handleStartAIActivity = () => {
    const activity = aiReviewData?.reviewContent?.activity;
    if (!activity) return;

    const whiteboard = document.getElementById("whiteboard");
    if (whiteboard) {
      const blocks = whiteboard.querySelectorAll("[data-type]");
      blocks.forEach((block) => block.remove());
      const outputArea = document.getElementById("outputArea");
      const codeArea = document.getElementById("codeArea");
      if (outputArea) outputArea.textContent = "/* Results will appear here */";
      if (codeArea) codeArea.textContent = "/* Build expressions on the whiteboard */";
    }

    setShowAIReviewPanel(false);
    setShowCongratsModal(false);
    setShowAnswerModal(false);
    setLesson({ ...activity, type: "activity", isAIReview: true });
    setCurrentActivityStartTime(Date.now());
    setActivityAttempts(0);
    setRevealedHints(0);
    setAiCheckPerformed(false);
  };

  // ── Start AI Review Assessment ──
  const handleStartAIAssessment = () => {
    const qs = aiReviewData?.reviewContent?.assessmentQuestions || [];
    if (!qs.length) return;
    const pool = [...qs];
    const firstQuestion = pool.splice(0, 1)[0];
    const totalQuestions = qs.length;
    setShowAIReviewPanel(false);
    setLesson({
      _id: "ai-review",
      title: "Review Assessment",
      type: "assessment",
      questionsPool: pool,
      currentQuestion: firstQuestion,
      answered: [],
      totalQuestions,
      timeLimit: 300,
      isAIReview: true,
    });
    setAssessmentAttempts(0);
    setQuestionStartTime(Date.now());
  };

  // ── Clear whiteboard when lesson changes ──
  useEffect(() => {
    if (!lesson) return;
    const whiteboard = document.getElementById("whiteboard");
    if (!whiteboard) return;

    const blocks = whiteboard.querySelectorAll("[data-type]");
    blocks.forEach((block) => block.remove());

    const outputArea = document.getElementById("outputArea");
    const codeArea = document.getElementById("codeArea");
    if (outputArea) outputArea.textContent = "/* Results will appear here */";
    if (codeArea) codeArea.textContent = "/* Build expressions on the whiteboard */";
  }, [lesson?._id, lesson?.type, lesson?.isAIReview]);

  // ── Fetch lesson / activity / assessment ──
  useEffect(() => {
    const fetchLessonOrActivity = async () => {
      if (aiActivity || aiAssessment) return;

      try {
        if (assessment && questions) {
          setCurrentQuestionIndex(0);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res =
          (await axios
            .get(
              `http://localhost:5000/api/materials/lessons/${lessonId}/materials/${itemId}`,
              { headers }
            )
            .then((r) => ({ ...r.data, type: "lesson" }))
            .catch(async () =>
              axios
                .get(
                  `http://localhost:5000/api/assessments/lessons/${lessonId}/assessments/${itemId}`,
                  { headers }
                )
                .then((r) => {
                  const assessmentFetched = { ...r.data, _id: r.data.id, type: "assessment" };

                  if (assessmentFetched.questions?.length > 0) {
                    const allQuestions = [...assessmentFetched.questions];

                    const easyQuestions = allQuestions.filter(
                      (q) => (q.difficulty || "easy").toLowerCase() === "easy"
                    );
                    const startPool =
                      easyQuestions.length > 0 ? easyQuestions : allQuestions;
                    const firstQuestion =
                      startPool[Math.floor(Math.random() * startPool.length)];

                    assessmentFetched.questionsPool = allQuestions.filter(
                      (q) => q._id !== firstQuestion._id
                    );
                    assessmentFetched.currentQuestion = firstQuestion;
                    assessmentFetched.answered = [];
                    assessmentFetched.totalQuestions = 5;
                    delete assessmentFetched.questions;
                  }

                  return assessmentFetched;
                })
                .catch(() =>
                  axios
                    .get(
                      `http://localhost:5000/api/activities/lessons/${lessonId}/activities/${itemId}`,
                      { headers }
                    )
                    .then((r) => ({ ...r.data, type: "activity" }))
                )
            )) || null;

        setLesson({ ...res, currentContentIndex: res.type === "lesson" ? 0 : null });
        if (res.type === "lesson") setCharacterImg(getRandomImage(lessonImages));
      } catch (err) {
        console.error("❌ Error fetching content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonOrActivity();
  }, [itemId, lessonId, assessment, questions, aiActivity, aiAssessment]);

  // ── Drag & drop + run logic ──
  useEffect(() => {
    const init = () => {
      const whiteboard = document.getElementById("whiteboard");
      const codeArea = document.getElementById("codeArea");
      const trashCan = document.getElementById("trashCan");
      const notification = document.getElementById("notification");
      const runButton = document.getElementById("runButton");
      const outputArea = document.getElementById("outputArea");

      if (!whiteboard || !codeArea || !trashCan || !notification || !runButton) {
        setTimeout(init, 200);
        return;
      }

      const destroy = initDragAndDrop({
        paletteSelector: ".elements img",
        whiteboard,
        codeArea,
        trashCan,
        notification,
      });

      // ── ASSESSMENT RUN ──
      const handleAssessmentRun = async () => {
        if (!lesson || lesson.type !== "assessment" || !lesson.currentQuestion) return;

        const blocks = whiteboard.querySelectorAll("[data-type]");
        if (blocks.length === 0) {
          notification.textContent = "Add some blocks to the whiteboard first! 🧩";
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 3000);
          return;
        }

        const question = lesson.currentQuestion;
        const token = localStorage.getItem("token");

        const questionMeta = {
          expectedOutput: question.expectedOutput || null,
          dataTypesRequired: question.dataTypesRequired || [],
        };

        const result = await codeChecker(whiteboard, codeArea, outputArea, questionMeta);
        outputArea.textContent = result.stdout || result.stderr || "/* No output */";

        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
        const attempts = assessmentAttempts + 1;
        setAssessmentAttempts(attempts);

        const missingTypes = result.missingNodes || [];
        setCurrentMissingTypes((prev) => [...new Set([...prev, ...missingTypes])]);

        if (!lesson.isAIReview) {
          try {
            await axios.post(
              `http://localhost:5000/api/progress/mark-assessment-attempt`,
              {
                assessmentId: lesson._id || lesson.id,
                lessonId,
                questionId: question._id,
                userId: user._id || user.id,
                timeSeconds: timeTaken,
                totalAttempts: attempts,
                correct: result.passedAll,
                difficulty:
                  question.difficulty?.charAt(0).toUpperCase() +
                    question.difficulty?.slice(1).toLowerCase() || "Easy",
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("❌ Failed to submit assessment attempt:", err);
          }
        }

        if (result.passedAll) {
          playSuccessSound();
          setCurrentMissingTypes([]);

          // ── Record this question in history for AI ──
          const questionDifficulty =
            question.difficulty?.charAt(0).toUpperCase() +
              question.difficulty?.slice(1).toLowerCase() || "Easy";

          const updatedHistory = [
            ...questionHistory,
            {
              questionId: question._id || `q-${Date.now()}`,
              difficulty: questionDifficulty,
              attemptsUsed: attempts,
              solved: true,
              hintsUsed: revealedHints,
            },
          ];
          setQuestionHistory(updatedHistory);

          // ── Track answered and check session limit ──
          const updatedAnswered = [...(lesson.answered || []), question._id];
          const questionsAnsweredCount = updatedAnswered.length;

          if (questionsAnsweredCount < lesson.totalQuestions) {
            // ── Ask AI what difficulty to show next ──
            const suggestedDifficulty = await fetchSuggestedDifficulty(
              updatedHistory,
              questionDifficulty,
              lesson.totalQuestions - questionsAnsweredCount
            );

            // ── Pick next question from full bank ──
            const { question: nextQuestion } = pickNextQuestion(
              lesson.questionsPool,
              suggestedDifficulty,
              updatedAnswered
            );

            if (nextQuestion) {
              setLesson((prev) => ({
                ...prev,
                currentQuestion: nextQuestion,
                // questionsPool stays unchanged — it's the full bank
                answered: updatedAnswered,
              }));
              setAssessmentAttempts(0);
              setRevealedHints(0);
            } else {
              // No more unique questions available — end session early
              setCharacterImg(getRandomImage(congratsImages));
              setShowCongratsModal(true);
              markAssessmentCompleted(lesson._id || lesson.id);
            }
          } else {
            // Reached totalQuestions limit — session complete!
            setCharacterImg(getRandomImage(congratsImages));
            setShowCongratsModal(true);
            markAssessmentCompleted(lesson._id || lesson.id);
          }
        } else {
          // ── Record failed attempt in history (only after max attempts) ──
          if (attempts >= 3) {
            const questionDifficulty =
              question.difficulty?.charAt(0).toUpperCase() +
                question.difficulty?.slice(1).toLowerCase() || "Easy";

            setQuestionHistory((prev) => [
              ...prev,
              {
                questionId: question._id || `q-${Date.now()}`,
                difficulty: questionDifficulty,
                attemptsUsed: attempts,
                solved: false,
                hintsUsed: revealedHints,
              },
            ]);
          }

          playErrorSound();
          const notifText = [];
          if (question.expectedOutput && !result.passedOutput)
            notifText.push("Output does not match expected.");
          if (!result.passedNodes)
            notifText.push(`Missing blocks: ${result.missingNodes?.join(", ")}`);
          notification.textContent = notifText.join(" ");
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 5000);

          if (attempts >= 2 && !lesson.isAIReview) {
            checkIfNeedsReview(attempts, currentMissingTypes.concat(missingTypes));
          }
          if (attempts >= 3) {
            setAssessmentAnswer({
              expectedOutput: question.expectedOutput,
              dataTypesRequired: question.dataTypesRequired,
            });
            setShowAnswerModal(true);
          }
        }
      };

      // ── ACTIVITY RUN ──
      const handleActivityRun = async () => {
        if (!lesson) return;

        const blocks = whiteboard.querySelectorAll("[data-type]");
        if (blocks.length === 0) {
          notification.textContent = "Add some blocks to the whiteboard first! 🧩";
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 3000);
          return;
        }

        const token = localStorage.getItem("token");

        const activityMeta = {
          expectedOutput: lesson.expectedOutput || null,
          dataTypesRequired: lesson.dataTypesRequired || [],
        };

        const result = await codeChecker(whiteboard, codeArea, outputArea, activityMeta);
        outputArea.textContent = result.stdout || result.stderr || "/* No output */";

        const timeTaken = Math.floor((Date.now() - currentActivityStartTime) / 1000);

        setActivityAttempts((prev) => {
          const attempts = prev + 1;
          const missingTypes = result.missingNodes || [];
          setCurrentMissingTypes((prevMissing) => [
            ...new Set([...prevMissing, ...missingTypes]),
          ]);

          const notifText = [];
          if (lesson.expectedOutput && !result.passedOutput)
            notifText.push("Output does not match expected.");
          if (!result.passedNodes)
            notifText.push(`Missing blocks: ${result.missingNodes?.join(", ")}`);
          if (notifText.length) {
            notification.textContent = notifText.join(" ");
            notification.style.display = "block";
            setTimeout(() => (notification.style.display = "none"), 5000);
          }

          if (!lesson.isAIReview && (result.passedAll || attempts >= 3)) {
            axios
              .post(
                `http://localhost:5000/api/progress/mark-activity-attempt`,
                {
                  activityId: lesson._id || lesson.id,
                  lessonId,
                  userId: user._id || user.id,
                  timeSeconds: timeTaken,
                  totalAttempts: attempts,
                  correct: result.passedAll,
                  attemptTime: Date.now(),
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .catch((err) =>
                console.error("❌ Failed to save attempt:", err.response?.data || err.message)
              );
          }

          if (result.passedAll) {
            playSuccessSound();
            if (!lesson.isAIReview) markCompleted();
            stopActivitySound();
            setCharacterImg(getRandomImage(congratsImages));
            setShowCongratsModal(true);
            setCurrentMissingTypes([]);
            return 0;
          }

          if (!result.passedAll && attempts >= 2 && !lesson.isAIReview) {
            checkIfNeedsReview(attempts, currentMissingTypes.concat(missingTypes));
          }

          if (!result.passedAll && attempts >= 3) {
            setAssessmentAnswer({
              expectedOutput: lesson.expectedOutput,
              dataTypesRequired: lesson.dataTypesRequired,
            });
            setShowAnswerModal(true);
          } else {
            playErrorSound();
          }

          return attempts;
        });
      };

      // ── MAIN RUN ──
      const onRun = async () => {
        if (!lesson) return;
        if (lesson.type === "assessment") {
          await handleAssessmentRun();
        } else if (lesson.type === "activity") {
          await handleActivityRun();
        }
      };

      runButton.addEventListener("click", onRun);

      const observer = new MutationObserver(() => {
        updateVariableState(whiteboard);
        updateCode(whiteboard, codeArea);
      });

      observer.observe(whiteboard, { childList: true, subtree: true });
      updateVariableState(whiteboard);
      updateCode(whiteboard, codeArea);

      return () => {
        destroy && destroy();
        runButton.removeEventListener("click", onRun);
        observer.disconnect();
      };
    };

    const cleanup = init();
    return cleanup;
  }, [lesson, assessmentAttempts, activityAttempts, aiCheckPerformed]);

  // ── Mark completion ──
  const markCompleted = async () => {
    if (!user?._id) return;
    if (lesson?.type === "assessment") return;

    try {
      const token = localStorage.getItem("token");
      const payload = { userId: user._id, lessonId };
      let endpoint = "";

      if (lesson?.type === "lesson") {
        endpoint = "complete-material";
        payload.materialId = itemId;
        payload.timeSeconds = Math.floor((Date.now() - lessonStartTime) / 1000);
      } else if (lesson?.type === "activity") {
        endpoint = "complete-activity";
        payload.activityId = itemId;
      }

      if (!endpoint) return;

      await axios.post(`http://localhost:5000/api/progress/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("❌ Error marking item completed:", err);
    }
  };

  // ── Mark assessment as completed ──
  const markAssessmentCompleted = async (assessmentId) => {
    if (!user?._id || lesson?.isAIReview) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/progress/complete-assessment`,
        {
          userId: user._id,
          lessonId,
          assessmentId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Assessment marked as completed");
    } catch (err) {
      console.error("❌ Error marking assessment completed:", err);
    }
  };

  // ── Lesson navigation ──
  const handleNextContent = async () => {
    if (lesson?.type === "lesson" && lesson.currentContentIndex < lesson.contents.length) {
      setLesson((prev) => ({ ...prev, currentContentIndex: prev.currentContentIndex + 1 }));
      setCharacterImg(getRandomImage(lessonImages));
      return;
    }

    await markCompleted();
    stopLessonSound();

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        `http://localhost:5000/api/activities/materials/${itemId}/activities`,
        { headers }
      );

      const activities = Array.isArray(res.data) ? res.data : [];
      if (activities.length > 0) {
        setShowLessonModal(false);
        setActivitySlide(0);
        setCharacterImg("/assets/images/activity.png");
        setActivityText(randomActivityText(0));
        setShowActivityModal(true);
        setTimeout(() => playActivitySound(), 300);
      } else {
        setShowLessonModal(false);
        navigate(`/lessons/${lessonId}`);
      }
    } catch (err) {
      console.error("❌ Error fetching activities:", err);
      setShowLessonModal(false);
      navigate(`/lessons/${lessonId}`);
    }
  };

  const handlePreviousContent = () => {
    if (lesson?.type === "lesson" && lesson.currentContentIndex > 0) {
      setLesson((prev) => ({ ...prev, currentContentIndex: prev.currentContentIndex - 1 }));
    }
  };

  const handleTimeUp = async () => {
    playErrorSound();
    if (lesson.type === "assessment" || lesson.type === "activity") {
      setShowAnswerModal(true);
    }
    stopActivitySound();
  };

  const randomActivityText = (slide) => {
    const thinkingTexts = [
      "Let's see how we can apply what we just learned!",
      "Can you figure out how to use what we discussed?",
      "Try to think about how this concept can be used here!",
    ];
    const solvingTexts = [
      "Now it's your turn — good luck!",
      "Use the code blocks to finish the activity.",
      "Let's test your skills in this activity!",
    ];
    return slide === 0
      ? thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)]
      : solvingTexts[Math.floor(Math.random() * solvingTexts.length)];
  };

  const handleActivityNext = () => {
    if (activitySlide === 0) {
      setActivitySlide(1);
      setActivityText(randomActivityText(1));
      setCharacterImg("/assets/images/activity1.png");
    } else {
      stopActivitySound();
      handleProceedToActivity();
    }
  };

  const handleProceedToActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        `http://localhost:5000/api/activities/materials/${itemId}/activities`,
        { headers }
      );

      const activities = Array.isArray(res.data) ? res.data : [];
      if (activities.length > 0) {
        const firstActivity = activities[0];
        setShowActivityModal(false);
        navigate(`/lessons/${lessonId}/${firstActivity._id}`);
      } else {
        setShowActivityModal(false);
        navigate(`/lessons/${lessonId}`);
      }
    } catch (err) {
      console.error("❌ Error fetching activities:", err);
      setShowActivityModal(false);
      navigate(`/lessons/${lessonId}`);
    }
  };

  const renderLessonContent = () => {
    if (!lesson || lesson.type !== "lesson") return null;
    if (lesson.currentContentIndex === 0)
      return <div dangerouslySetInnerHTML={{ __html: lesson.overview }} />;
    const index = lesson.currentContentIndex - 1;
    return <div dangerouslySetInnerHTML={{ __html: lesson.contents[index] || "" }} />;
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!lesson) return <div className="text-center mt-5">Lesson / Activity not found.</div>;

  const isLesson = lesson.type === "lesson";
  const actionButtonText = isLesson ? "▶ Run Program" : "Submit";

  // ══════════════════════════════════════════════════════════
  // AI REVIEW PANEL
  // ══════════════════════════════════════════════════════════
  if (showAIReviewPanel) {
    if (aiReviewLoading)
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "Comic Sans MS, cursive",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              maxWidth: "500px",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
            <h3 style={{ color: "#667eea" }}>AI is creating your personalized lesson...</h3>
            <p style={{ color: "#888" }}>
              Teaching you about: {aiRecommendation?.missingTypes?.join(", ")} ✨
            </p>
            <Spinner animation="border" variant="primary" />
          </div>
        </div>
      );

    if (aiReviewError)
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "Comic Sans MS, cursive",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              maxWidth: "500px",
            }}
          >
            <div style={{ fontSize: "3rem" }}>😕</div>
            <h3 style={{ color: "#e53935" }}>{aiReviewError}</h3>
            <button
              onClick={() => {
                setShowAIReviewPanel(false);
                setAiReviewError(null);
              }}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "24px",
                padding: "0.9rem 2rem",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1rem",
                fontFamily: "Comic Sans MS, cursive",
                marginTop: "1rem",
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      );

    const { reviewContent, currentLessonTitle, missingTypes: reviewMissingTypes } =
      aiReviewData || {};
    const { lessonMaterial, activity, assessmentQuestions } = reviewContent || {};

    if (aiReviewStep === "lesson")
      return (
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "1.5rem",
            fontFamily: "Comic Sans MS, cursive",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>📚</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                AI Review Session
              </p>
              <h2 style={{ margin: 0, color: "#fff" }}>{lessonMaterial?.title}</h2>
            </div>
          </div>

          <div
            style={{
              background: "#FFF3E0",
              border: "2px solid #FFE0B2",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              fontSize: "0.9rem",
              color: "#E65100",
              marginBottom: "1rem",
            }}
          >
            🎯 Reviewing blocks: <strong>{reviewMissingTypes?.join(", ")}</strong> · From{" "}
            {currentLessonTitle}
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>📖 Let's Learn Together!</h3>
            <div
              style={{
                background: "#E8F5E9",
                borderRadius: "12px",
                padding: "1rem",
                border: "2px dashed #4CAF50",
                marginBottom: "1rem",
              }}
            >
              <p style={{ margin: 0, fontWeight: "600", color: "#555" }}>
                {lessonMaterial?.overview}
              </p>
            </div>
            {lessonMaterial?.contents?.map((para, i) => (
              <div
                key={i}
                style={{
                  background: "#F8F9FF",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  border: "2px solid #E3F2FD",
                  lineHeight: "1.7",
                  color: "#333",
                }}
              >
                {para}
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#E8F5E9",
              border: "2px solid #A5D6A7",
              borderRadius: "16px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <h4 style={{ color: "#555", marginBottom: "0.5rem" }}>📝 What's next:</h4>
            <p style={{ color: "#777", margin: 0 }}>
              1 practice activity + 1 mini assessment to test your understanding!
            </p>
          </div>

          <button
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              padding: "0.9rem 2rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
              fontFamily: "Comic Sans MS, cursive",
              width: "100%",
              marginBottom: "0.75rem",
            }}
            onClick={() => setAiReviewStep("activity")}
          >
            Let's Practice! 🚀
          </button>

          <button
            style={{
              background: "#eee",
              color: "#666",
              border: "2px solid #ccc",
              borderRadius: "24px",
              padding: "0.9rem 1.5rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontFamily: "Comic Sans MS, cursive",
              width: "100%",
            }}
            onClick={() => {
              setShowAIReviewPanel(false);
              setAiReviewData(null);
            }}
          >
            Back to Activity
          </button>
        </div>
      );

    if (aiReviewStep === "activity")
      return (
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "1.5rem",
            fontFamily: "Comic Sans MS, cursive",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
              borderRadius: "20px",
              padding: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🏋️</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                Practice Activity
              </p>
              <h2 style={{ margin: 0, color: "#fff" }}>{activity?.name}</h2>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              marginBottom: "1rem",
            }}
          >
            <h4 style={{ color: "#4CAF50", marginBottom: "0.75rem" }}>📋 Your Mission</h4>
            <div
              style={{
                background: "#FFF9E6",
                borderRadius: "12px",
                padding: "1rem",
                border: "3px dashed #FFC107",
                color: "#333",
                marginBottom: "1rem",
              }}
            >
              <p style={{ margin: 0 }}>{activity?.instructions}</p>
            </div>
            {activity?.expectedOutput && (
              <div style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "#E65100" }}>🎯 Expected Output:</h5>
                <pre
                  style={{
                    background: "#f4f4f4",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px dashed #FF9800",
                    fontSize: "0.9rem",
                    fontFamily: "monospace",
                    color: "#333",
                  }}
                >
                  {activity.expectedOutput}
                </pre>
              </div>
            )}
            {activity?.dataTypesRequired?.length > 0 && (
              <div>
                <h5 style={{ color: "#5c6bc0" }}>🧩 Blocks you'll need:</h5>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "0.5rem" }}
                >
                  {activity.dataTypesRequired.map((block, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#E3F2FD",
                        border: "2px solid #90CAF9",
                        borderRadius: "20px",
                        padding: "4px 14px",
                        fontSize: "0.85rem",
                        color: "#1565C0",
                        fontWeight: "600",
                      }}
                    >
                      {block}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activity?.hints?.length > 0 && (
            <div
              style={{
                background: "#E8F5E9",
                border: "3px solid #4CAF50",
                borderRadius: "16px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.75rem",
                }}
              >
                <h5 style={{ margin: 0, color: "#2E7D32" }}>
                  💚 Hints ({aiReviewRevealedHints}/{activity.hints.length} unlocked)
                </h5>
                {aiReviewRevealedHints < activity.hints.length && (
                  <button
                    style={{
                      background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 14px",
                      cursor: "pointer",
                      fontFamily: "Comic Sans MS, cursive",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                    }}
                    onClick={() =>
                      setAiReviewRevealedHints((p) => Math.min(p + 1, activity.hints.length))
                    }
                  >
                    Unlock Hint!
                  </button>
                )}
              </div>
              {aiReviewRevealedHints > 0 && (
                <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 0 }}>
                  {activity.hints.slice(0, aiReviewRevealedHints).map((hint, i) => (
                    <li
                      key={i}
                      style={{
                        background: "#fff",
                        borderRadius: "8px",
                        padding: "0.6rem 0.8rem",
                        borderLeft: "4px solid #4CAF50",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        color: "#333",
                      }}
                    >
                      <span
                        style={{
                          background: "#4CAF50",
                          color: "#fff",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      {hint}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div
            style={{
              background: "#FFF8E1",
              border: "2px solid #FFE082",
              borderRadius: "12px",
              padding: "0.75rem",
              fontSize: "0.9rem",
              color: "#F57F17",
              marginBottom: "1rem",
            }}
          >
            ⏱️ <strong>Time limit:</strong> {activity?.timeLimit} seconds (
            {Math.floor((activity?.timeLimit || 180) / 60)} minutes)
          </div>

          <button
            style={{
              background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              padding: "0.9rem 2rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
              fontFamily: "Comic Sans MS, cursive",
              width: "100%",
              marginBottom: "0.75rem",
            }}
            onClick={() => {
              setAiReviewRevealedHints(0);
              handleStartAIActivity();
            }}
          >
            Start Activity! 🎯
          </button>
        </div>
      );

    return (
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "1.5rem",
          fontFamily: "Comic Sans MS, cursive",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "20px",
            padding: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "2rem" }}>📝</span>
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
              Mini Assessment
            </p>
            <h2 style={{ margin: 0, color: "#fff" }}>Let's Test Your Knowledge!</h2>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            marginBottom: "1rem",
          }}
        >
          <h4 style={{ color: "#f5576c", marginBottom: "1rem" }}>
            🎯 Ready to show what you learned?
          </h4>
          <p style={{ color: "#555", marginBottom: "1rem" }}>
            You'll get <strong>{assessmentQuestions?.length} questions</strong> to test your
            understanding of {reviewMissingTypes?.join(", ")}.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {assessmentQuestions?.map((q, i) => (
              <div
                key={i}
                style={{
                  background: "#F8F9FF",
                  border: "2px solid #E3F2FD",
                  borderRadius: "12px",
                  padding: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: "#f093fb",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  Question {i + 1} - {q.difficulty}
                </div>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#555" }}>
                  {q.instructions?.slice(0, 80)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "24px",
            padding: "0.9rem 2rem",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "1rem",
            fontFamily: "Comic Sans MS, cursive",
            width: "100%",
            marginBottom: "0.75rem",
          }}
          onClick={handleStartAIAssessment}
        >
          Start Assessment! 📝
        </button>

        <button
          style={{
            background: "#eee",
            color: "#666",
            border: "2px solid #ccc",
            borderRadius: "24px",
            padding: "0.9rem 1.5rem",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontFamily: "Comic Sans MS, cursive",
            width: "100%",
          }}
          onClick={() => navigate(`/lessons/${lessonId}`)}
        >
          Skip & Go Back to Lesson
        </button>
      </div>
    );
  }
  // ══════════════════════════════════════════════════════════
  // END AI REVIEW PANEL
  // ══════════════════════════════════════════════════════════

  return (
    <div className="dragboard-wrapper">
      {/* ══ AI PROMPT MODAL ══ */}
      {showAIPrompt && aiRecommendation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "'Comic Sans MS', cursive",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "2.5rem",
              maxWidth: "550px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              border: "4px solid #FF9800",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>😓</div>
            <h2 style={{ fontWeight: "bold", color: "#E65100", marginBottom: "0.5rem" }}>
              Need some help?
            </h2>
            <p style={{ color: "#555", fontSize: "1.05rem", marginBottom: "1rem" }}>
              {aiRecommendation.message}
            </p>
            <div
              style={{
                background: "#FFF3E0",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
                border: "2px solid #FFE0B2",
              }}
            >
              <p
                style={{ color: "#E65100", fontSize: "0.95rem", margin: 0, fontWeight: "600" }}
              >
                🧩 Blocks you're having trouble with:
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                  marginTop: "0.75rem",
                }}
              >
                {aiRecommendation.missingTypes?.map((type, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#FFE0B2",
                      border: "2px solid #FF9800",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "0.85rem",
                      color: "#E65100",
                      fontWeight: "600",
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p style={{ color: "#777", fontSize: "0.88rem", margin: "0.75rem 0 0" }}>
                Want me to create a quick lesson just for these blocks? 📚✨
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => handleAIDecision("review")}
                style={{
                  background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "24px",
                  padding: "0.9rem 2rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              >
                Yes, help me learn! 🎓
              </button>
              <button
                onClick={() => handleAIDecision("continue")}
                style={{
                  background: "#eee",
                  color: "#555",
                  border: "2px solid #ccc",
                  borderRadius: "24px",
                  padding: "0.9rem 2rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              >
                No, I'll keep trying
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Activity Instructions === */}
      {lesson.type === "activity" && (
        <div
          className="activity-instructions mb-3"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
            border: "4px solid #ffffff",
          }}
        >
          <div
            style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "15px", padding: "1rem" }}
          >
            {lesson.isAIReview && (
              <div
                style={{
                  background: "#FFF3E0",
                  border: "2px solid #FF9800",
                  borderRadius: "12px",
                  padding: "0.5rem 1rem",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                  color: "#E65100",
                  fontWeight: "600",
                }}
              >
                🤖 AI Review Activity
              </div>
            )}
            <h5
              style={{
                color: "#667eea",
                marginBottom: "1rem",
                fontSize: "1.4rem",
                fontWeight: "700",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Your Mission!
            </h5>
            <div
              style={{
                backgroundColor: "#FFF9E6",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem",
                border: "3px dashed #FFC107",
                color: "#333",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: lesson.instructions }} />
            </div>
            {lesson.hints?.length > 0 && (
              <div
                style={{
                  backgroundColor: "#E8F5E9",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                  border: "3px solid #4CAF50",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <h6
                    style={{ color: "#2E7D32", margin: 0, fontSize: "1.1rem", fontWeight: "700" }}
                  >
                    Need Help? ({revealedHints}/{lesson.hints.length} unlocked)
                  </h6>
                  {revealedHints < lesson.hints.length && (
                    <button
                      onClick={() =>
                        setRevealedHints((prev) => Math.min(prev + 1, lesson.hints.length))
                      }
                      style={{
                        background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      Unlock Hint!
                    </button>
                  )}
                </div>
                {revealedHints > 0 ? (
                  <ul
                    style={{
                      marginBottom: 0,
                      paddingLeft: 0,
                      listStyleType: "none",
                      color: "#333",
                    }}
                  >
                    {lesson.hints.slice(0, revealedHints).map((hint, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "0.75rem",
                          padding: "0.75rem",
                          backgroundColor: "#F1F8E9",
                          borderRadius: "8px",
                          borderLeft: "4px solid #4CAF50",
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                            marginRight: "0.75rem",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: hint }} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    style={{
                      color: "#666",
                      fontStyle: "italic",
                      marginBottom: 0,
                      textAlign: "center",
                    }}
                  >
                    Click "Unlock Hint!" to reveal helpful tips one by one!
                  </p>
                )}
              </div>
            )}
            {lesson.expectedOutput && (
              <div
                style={{
                  backgroundColor: "#FFF3E0",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "3px solid #FF9800",
                }}
              >
                <h6
                  style={{
                    color: "#E65100",
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                  }}
                >
                  What You Should See:
                </h6>
                <pre
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: 0,
                    border: "2px dashed #FF9800",
                    fontSize: "0.9rem",
                    fontFamily: "monospace",
                    color: "#333",
                    overflowX: "auto",
                  }}
                >
                  {lesson.expectedOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === Assessment Instructions === */}
      {lesson.type === "assessment" && lesson.currentQuestion && (
        <div
          className="assessment-instructions mb-3"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "0 8px 16px rgba(240, 147, 251, 0.3)",
            border: "4px solid #ffffff",
          }}
        >
          <div
            style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: "15px", padding: "1rem" }}
          >
            {lesson.isAIReview && (
              <div
                style={{
                  background: "#FFF3E0",
                  border: "2px solid #FF9800",
                  borderRadius: "12px",
                  padding: "0.5rem 1rem",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                  color: "#E65100",
                  fontWeight: "600",
                }}
              >
                🤖 AI Review Assessment
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                paddingBottom: "0.75rem",
                borderBottom: "3px dashed #f5576c",
              }}
            >
              <h5
                style={{
                  color: "#f5576c",
                  margin: 0,
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {lesson.title}
              </h5>
              <div
                style={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  padding: "8px 16px",
                  borderRadius: "25px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  color: "#ffffff",
                }}
              >
                Question {(lesson.answered?.length || 0) + 1} of {lesson.totalQuestions || 1}
              </div>
            </div>
            {(() => {
              const q = lesson.currentQuestion;
              return (
                <div>
                  <div
                    style={{
                      backgroundColor: "#E3F2FD",
                      padding: "1rem",
                      borderRadius: "12px",
                      marginBottom: "1rem",
                      border: "3px dashed #2196F3",
                      color: "#333",
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: q.instructions }} />
                  </div>
                  {q.hints?.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#FFF9C4",
                        padding: "1rem",
                        borderRadius: "12px",
                        marginBottom: "1rem",
                        border: "3px solid #FFC107",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <h6
                          style={{
                            color: "#F57F17",
                            margin: 0,
                            fontSize: "1.1rem",
                            fontWeight: "700",
                          }}
                        >
                          Need Help? ({revealedHints}/{q.hints.length} unlocked)
                        </h6>
                        {revealedHints < q.hints.length && (
                          <button
                            onClick={() =>
                              setRevealedHints((prev) => Math.min(prev + 1, q.hints.length))
                            }
                            style={{
                              background: "linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)",
                              color: "#333",
                              border: "none",
                              borderRadius: "25px",
                              padding: "8px 16px",
                              fontSize: "0.9rem",
                              cursor: "pointer",
                              fontWeight: "700",
                            }}
                          >
                            Unlock Hint!
                          </button>
                        )}
                      </div>
                      {revealedHints > 0 ? (
                        <ul
                          style={{
                            marginBottom: 0,
                            paddingLeft: 0,
                            listStyleType: "none",
                            color: "#333",
                          }}
                        >
                          {q.hints.slice(0, revealedHints).map((hint, i) => (
                            <li
                              key={i}
                              style={{
                                marginBottom: "0.75rem",
                                padding: "0.75rem",
                                backgroundColor: "#FFFDE7",
                                borderRadius: "8px",
                                borderLeft: "4px solid #FFC107",
                                display: "flex",
                                alignItems: "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor: "#FFC107",
                                  color: "#333",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontSize: "0.85rem",
                                  marginRight: "0.75rem",
                                  flexShrink: 0,
                                }}
                              >
                                {i + 1}
                              </span>
                              <span dangerouslySetInnerHTML={{ __html: hint }} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p
                          style={{
                            color: "#666",
                            fontStyle: "italic",
                            marginBottom: 0,
                            textAlign: "center",
                          }}
                        >
                          Click "Unlock Hint!" to reveal helpful tips one by one!
                        </p>
                      )}
                    </div>
                  )}
                  {q.expectedOutput && (
                    <div
                      style={{
                        backgroundColor: "#E1F5FE",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: "3px solid #03A9F4",
                      }}
                    >
                      <h6
                        style={{
                          color: "#01579B",
                          marginBottom: "0.75rem",
                          fontSize: "1.1rem",
                          fontWeight: "700",
                        }}
                      >
                        What You Should See:
                      </h6>
                      <pre
                        style={{
                          backgroundColor: "#ffffff",
                          padding: "12px",
                          borderRadius: "8px",
                          marginBottom: 0,
                          border: "2px dashed #03A9F4",
                          fontSize: "0.9rem",
                          fontFamily: "monospace",
                          color: "#333",
                          overflowX: "auto",
                        }}
                      >
                        {q.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* === Workspace === */}
      <div className="main-container">
        <div className="draggable">
          <h3>Elements</h3>
          <div className="elements">
            <img src="/assets/images/print1.png" data-type="print" draggable alt="Print" />
            <img src="/assets/images/container.png" data-type="variable" draggable alt="Variable" />
            <img src="/assets/images/multiply.png" data-type="multiply" draggable alt="Multiply" />
            <img src="/assets/images/add.png" data-type="add" draggable alt="Add" />
            <img src="/assets/images/subtract.png" data-type="subtract" draggable alt="Subtract" />
            <img src="/assets/images/divide.png" data-type="divide" draggable alt="Divide" />
            <img src="/assets/images/equalto.png" data-type="equal" draggable alt="Equal" />
            <img src="/assets/images/notequal.png" data-type="notequal" draggable alt="Not Equal" />
            <img src="/assets/images/lessthan.png" data-type="less" draggable alt="Less Than" />
            <img
              src="/assets/images/lessthanequal.png"
              data-type="lessequal"
              draggable
              alt="Less or Equal"
            />
            <img
              src="/assets/images/greaterthan.png"
              data-type="greater"
              draggable
              alt="Greater Than"
            />
            <img
              src="/assets/images/greaterthanequal.png"
              data-type="greaterequal"
              draggable
              alt="Greater or Equal"
            />
            <img src="/assets/images/if.png" data-type="if" draggable alt="If" />
            <img src="/assets/images/elif.png" data-type="elif" draggable alt="Elif" />
            <img src="/assets/images/else.png" data-type="else" draggable alt="Else" />
            <img src="/assets/images/while.png" data-type="while" draggable alt="While" />
            <img
              src="/assets/images/do_while.png"
              data-type="do-while"
              draggable="true"
              alt="Do While Loop"
            />
            <img src="/assets/images/for.png" data-type="for" draggable="true" alt="For Loop" />
          </div>
        </div>

        <div className="workspace">
          <div className="whiteboard-wrap">
            <div id="whiteboard" className="whiteboard">
              <div id="trashCan" className="trash-can">
                🗑️
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {(lesson.type === "activity" || lesson.type === "assessment") && (
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#e53935",
                marginBottom: "1rem",
                textAlign: "center",
                padding: "0.75rem",
                backgroundColor: "#fff3e0",
                borderRadius: "12px",
                border: "3px solid #ff9800",
              }}
            >
              ⏱ Time Left: {formatTime(timeLeft)}
            </div>
          )}
          <div className="code-panel">
            <button id="runButton" className="run-button">
              {actionButtonText}
            </button>
            <div>Source Code (preview)</div>
            <pre id="codeArea">/* Build expressions on the whiteboard */</pre>
          </div>
          <div className="output">
            <div>Program Output</div>
            <pre id="outputArea">/* Results will appear here */</pre>
          </div>
        </div>
      </div>

      <div id="notification" className="notification" style={{ display: "none" }} />

      {/* === Lesson Modal === */}
      {isLesson && showLessonModal && (
        <Modal
          style={{ position: "fixed", top: "70px" }}
          show={showLessonModal}
          backdrop="static"
          size="lg"
        >
          <Modal.Header>
            <Modal.Title>{lesson.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body
            key={lesson.currentContentIndex}
            style={{
              maxHeight: "65vh",
              overflowY: "auto",
              padding: "1.5rem",
              backgroundColor: "#FFF8F2",
              fontFamily: "'Comic Sans MS', cursive",
            }}
          >
            <div className="typing-container">{renderLessonContent()}</div>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <Button
              variant="secondary"
              onClick={handlePreviousContent}
              disabled={lesson.currentContentIndex === 0}
            >
              ← Previous
            </Button>
            <Button variant="primary" onClick={handleNextContent}>
              {lesson.currentContentIndex >= lesson.contents.length
                ? "Finish Lesson"
                : "Next →"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* === Activity Modal === */}
      <Modal
        show={showActivityModal}
        style={{ position: "fixed", top: "140px" }}
        backdrop="static"
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "#FFF8F2",
            fontFamily: "'Comic Sans MS', cursive",
            textAlign: "center",
          }}
        >
          <p className="typing-line">{activityText}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleActivityNext}>
            {activitySlide === 0 ? "Next →" : "Proceed"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* === Congrats Modal === */}
      <Modal
        style={{ position: "fixed", top: "40px" }}
        show={showCongratsModal}
        backdrop="static"
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>🎉 Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "#FFF8F2",
            fontFamily: "'Comic Sans MS', cursive",
            textAlign: "center",
          }}
        >
          <h3>🎉 Well Done!</h3>
          <p>
            You completed this{" "}
            {lesson?.type === "assessment" ? "assessment" : "activity"} successfully!
          </p>
          {lesson?.isAIReview && lesson?.type === "activity" && (
            <p style={{ color: "#667eea", fontWeight: "bold" }}>
              🌟 Great job on the review activity! Now let's test what you learned!
            </p>
          )}
          {lesson?.isAIReview && lesson?.type === "assessment" && (
            <p style={{ color: "#4CAF50", fontWeight: "bold" }}>
              🌟 Amazing! You've completed your AI review session! Ready to go back and try
              again?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowCongratsModal(false);
              if (
                lesson?.isAIReview &&
                lesson?.type === "activity" &&
                aiReviewData?.reviewContent?.assessmentQuestions
              ) {
                setShowAIReviewPanel(true);
                setAiReviewStep("assessment");
              } else if (lesson?.isAIReview && lesson?.type === "assessment") {
                navigate(`/lessons/${lessonId}`);
              } else {
                navigate(`/lessons/${lessonId}`);
              }
            }}
          >
            {lesson?.isAIReview &&
            lesson?.type === "activity" &&
            aiReviewData?.reviewContent?.assessmentQuestions
              ? "Continue to Assessment! 📝"
              : lesson?.isAIReview && lesson?.type === "assessment"
              ? "Back to Lesson! 🏠"
              : "Continue"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* === Answer Modal === */}
      <Modal show={showAnswerModal} backdrop="static" size="lg" style={{ top: "100px" }}>
        <Modal.Header>
          <Modal.Title>Correct Answer</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "#FFF8F2",
            fontFamily: "'Comic Sans MS', cursive",
            textAlign: "center",
          }}
        >
          <h5>Required Data Types:</h5>
          <ul>
            {assessmentAnswer.dataTypesRequired?.map((dt, i) => (
              <li key={i}>{dt}</li>
            ))}
          </ul>
          {assessmentAnswer.expectedOutput && (
            <>
              <h5>Expected Output:</h5>
              <pre style={{ backgroundColor: "#f4f4f4", padding: "10px", borderRadius: "8px" }}>
                {assessmentAnswer.expectedOutput}
              </pre>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowAnswerModal(false);
              navigate(`/lessons/${lessonId}`);
            }}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* === Character === */}
      {(showLessonModal || showActivityModal || showCongratsModal) &&
        lesson?.type !== "assessment" && (
          <div
            style={{
              position: "fixed",
              bottom: "-50px",
              left: "20px",
              zIndex: 2000,
              pointerEvents: "none",
            }}
          >
            <img
              src={characterImg}
              alt="Character"
              style={{
                width: "420px",
                height: "auto",
                animation: "bounce 2s infinite ease-in-out",
                filter: "drop-shadow(3px 3px 8px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        )}
      {showCongratsModal && lesson?.type === "assessment" && (
        <div
          style={{
            position: "fixed",
            bottom: "-50px",
            left: "20px",
            zIndex: 2000,
            pointerEvents: "none",
          }}
        >
          <img
            src={characterImg}
            alt="Character"
            style={{
              width: "420px",
              height: "auto",
              animation: "bounce 2s infinite ease-in-out",
              filter: "drop-shadow(3px 3px 8px rgba(0,0,0,0.3))",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .typing-container { display: inline-block; overflow: hidden; white-space: normal; border-right: 3px solid #333; animation: typingDown 3s steps(40, end), blink 0.8s step-end infinite; }
        @keyframes typingDown { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0 0); } }
        .typing-line { display: inline-block; overflow: hidden; white-space: nowrap; border-right: 2px solid #333; animation: typingShort 2.5s steps(35, end), blink 0.8s step-end infinite; }
        @keyframes typingShort { from { width: 0; } to { width: 100%; } }
        @keyframes blink { 0%, 50% { border-color: #333; } 51%, 100% { border-color: transparent; } }
      `}</style>
    </div>
  );
}