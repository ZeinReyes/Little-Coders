// src/component/DragBoardLesson.js
import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "../context/authContext";

// ── Hooks ──
import { useLessonData, getRandomImage } from "../hooks/useLessonData";
import { useTimer } from "../hooks/useTimer";
import { useAIReview } from "../hooks/useAIReview";
import { useAssessmentLogic } from "../hooks/useAssessmentLogic";
import { useProgressTracking } from "../hooks/useProgressTracking";

// ── Components ──
import AIPromptModal from "../component/AIPromptModal";
import AIReviewPanel from "../component/AIReviewPanel";
import InstructionsPanel from "../component/InstructionsPanel";
import LessonModals from "../component/LessonModals";
import Workspace from "../component/Workspace";

// ── Utils ──
import { initDragAndDrop } from "../utils/dragAndDrop";
import { updateCode } from "../utils/codeGen";
import { updateVariableState } from "../utils/state";
import { codeChecker } from "../utils/codeChecker";
import {
  playLessonSound,
  stopLessonSound,
  playActivitySound,
  stopActivitySound,
  playSuccessSound,
  playErrorSound,
} from "../utils/sfx";

import "../component/DragBoard.css";

// ── Constants ──────────────────────────────────────────────────────────────────
const congratsImages = [
  "/assets/images/congrats.png",
  "/assets/images/congrats1.png",
  "/assets/images/congrats2.png",
  "/assets/images/congrats3.png",
  "/assets/images/congrats4.png",
];

const randomActivityText = (slide) => {
  const thinking = [
    "Let's see how we can apply what we just learned!",
    "Can you figure out how to use what we discussed?",
    "Try to think about how this concept can be used here!",
  ];
  const solving = [
    "Now it's your turn — good luck!",
    "Use the code blocks to finish the activity.",
    "Let's test your skills in this activity!",
  ];
  return slide === 0
    ? thinking[Math.floor(Math.random() * thinking.length)]
    : solving[Math.floor(Math.random() * solving.length)];
};

// ── Session persistence helpers ────────────────────────────────────────────────
const SESSION_KEY_PREFIX = "dragboard_session_";

const saveAssessmentSession = (lessonId, itemId, data) => {
  try {
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${lessonId}_${itemId}`, JSON.stringify(data));
  } catch (_) {}
};
const loadAssessmentSession = (lessonId, itemId) => {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${lessonId}_${itemId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};
const clearAssessmentSession = (lessonId, itemId) => {
  try {
    sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${lessonId}_${itemId}`);
  } catch (_) {}
};

const ACTIVITY_KEY = (lessonId, itemId) =>
  `${SESSION_KEY_PREFIX}activity_${lessonId}_${itemId}`;

const saveActivitySession = (lessonId, itemId, data) => {
  try {
    sessionStorage.setItem(ACTIVITY_KEY(lessonId, itemId), JSON.stringify(data));
  } catch (_) {}
};
const loadActivitySession = (lessonId, itemId) => {
  try {
    const raw = sessionStorage.getItem(ACTIVITY_KEY(lessonId, itemId));
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};
const clearActivitySession = (lessonId, itemId) => {
  try {
    sessionStorage.removeItem(ACTIVITY_KEY(lessonId, itemId));
  } catch (_) {}
};

// ── Whiteboard clear helper ────────────────────────────────────────────────────
const clearWhiteboard = () => {
  const wb   = document.getElementById("whiteboard");
  const out  = document.getElementById("outputArea");
  const code = document.getElementById("codeArea");
  if (wb)   wb.querySelectorAll("[data-type]").forEach((b) => b.remove());
  if (out)  out.textContent  = "/* Results will appear here */";
  if (code) code.textContent = "/* Build expressions on the whiteboard */";
};

// ── Backend base URL ───────────────────────────────────────────────────────────
const API_BASE = "https://little-coders-backend.onrender.com";

// ── TTS: strip HTML to plain readable text ────────────────────────────────────
/**
 * Converts HTML content to plain text safe for speech synthesis.
 * Inserts spaces after block elements so words do not run together.
 */
const htmlToPlainText = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  tmp.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, br, div").forEach((el) => {
    el.insertAdjacentText("afterend", " ");
  });
  return (tmp.innerText || tmp.textContent || "").replace(/\s+/g, " ").trim();
};

// ══════════════════════════════════════════════════════════════════════════════
export default function DragBoardLesson() {
  const { lessonId, itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ── Core lesson data ──
  const {
    lesson,
    setLesson,
    loading,
    characterImg,
    setCharacterImg,
  } = useLessonData({ lessonId, itemId });

  // ── Modal visibility ──
  const [showLessonModal,    setShowLessonModal]    = useState(true);
  const [showActivityModal,  setShowActivityModal]  = useState(false);
  const [showCongratsModal,  setShowCongratsModal]  = useState(false);
  const [showAnswerModal,    setShowAnswerModal]    = useState(false);

  // ── Activity intro slides ──
  const [activityText,  setActivityText]  = useState("");
  const [activitySlide, setActivitySlide] = useState(0);

  // ── Attempts & hints ──
  const [assessmentAttempts,  setAssessmentAttempts]  = useState(0);
  const [activityAttempts,    setActivityAttempts]    = useState(0);
  const [revealedHints,       setRevealedHints]       = useState(0);
  const [assessmentAnswer,    setAssessmentAnswer]    = useState({});
  const [currentMissingTypes, setCurrentMissingTypes] = useState([]);
  const [aiCheckPerformed,    setAiCheckPerformed]    = useState(false);

  // ── Timing ──
  const [lessonStartTime,          setLessonStartTime]          = useState(Date.now());
  const [questionStartTime,        setQuestionStartTime]        = useState(Date.now());
  const [currentActivityStartTime, setCurrentActivityStartTime] = useState(Date.now());

  // ── Persisted timer seconds (restored from sessionStorage on refresh) ──
  const [restoredTimerSeconds, setRestoredTimerSeconds] = useState(null);

  // ── TTS state ──────────────────────────────────────────────────────────────
  // ttsEnabled    : whether the user wants narration on/off
  // ttsSpeaking   : true while audio is actively playing
  // ttsEnabledRef : ref mirror so async callbacks always read current value
  // currentAudioRef : holds the active HTMLAudioElement so we can stop it
  const [ttsEnabled,  setTtsEnabled]  = useState(true);
  const [ttsSpeaking, setTtsSpeaking] = useState(false);
  const ttsEnabledRef   = useRef(true);
  const currentAudioRef = useRef(null);

  // ── Progress tracking ──
  const { markCompleted, recordAssessmentAttempt, recordActivityAttempt } =
    useProgressTracking({ lessonId, itemId, user });

  // ── Assessment AI difficulty ──
  const {
    questionHistory,
    setQuestionHistory,
    fetchSuggestedDifficulty,
    pickNextQuestion,
    markAssessmentCompleted,
  } = useAssessmentLogic({ lessonId, user });

  // ── Timer ──
  const timerResetKey = `${lesson?._id}-${lesson?.currentQuestion?._id}`;
  const { formatted: timerFormatted, stopTimer, remainingSeconds } = useTimer({
    initialSeconds: restoredTimerSeconds ?? (lesson?.timeLimit || 300),
    resetKey:       timerResetKey,
    onTimeUp: () => {
      playErrorSound();
      if (lessonRef.current?.type === "assessment" || lessonRef.current?.type === "activity") {
        clearActivitySession(lessonId, itemId);
        setTimeout(clearWhiteboard, 50);
        setShowAnswerModal(true);
      }
      stopActivitySound();
    },
  });

  // ── AI review ──
  const {
    aiRecommendation,
    showAIPrompt,
    checkIfNeedsReview,
    handleAIDecision,
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
  } = useAIReview({ lessonId, currentMissingTypes, onShowReview: stopTimer });

  // ══════════════════════════════════════════════════════════════════════════════
  // ── Refs ──
  // ══════════════════════════════════════════════════════════════════════════════
  const lessonRef                   = useRef(lesson);
  const assessmentAttemptsRef       = useRef(assessmentAttempts);
  const activityAttemptsRef         = useRef(activityAttempts);
  const revealedHintsRef            = useRef(revealedHints);
  const questionStartTimeRef        = useRef(questionStartTime);
  const currentActivityStartTimeRef = useRef(currentActivityStartTime);
  const currentMissingTypesRef      = useRef(currentMissingTypes);
  const questionHistoryRef          = useRef(questionHistory);
  const lessonStartTimeRef          = useRef(lessonStartTime);
  const remainingSecondsRef         = useRef(remainingSeconds);

  useEffect(() => { lessonRef.current                   = lesson; },               [lesson]);
  useEffect(() => { assessmentAttemptsRef.current       = assessmentAttempts; },   [assessmentAttempts]);
  useEffect(() => { activityAttemptsRef.current         = activityAttempts; },     [activityAttempts]);
  useEffect(() => { revealedHintsRef.current            = revealedHints; },        [revealedHints]);
  useEffect(() => { questionStartTimeRef.current        = questionStartTime; },    [questionStartTime]);
  useEffect(() => { currentActivityStartTimeRef.current = currentActivityStartTime; }, [currentActivityStartTime]);
  useEffect(() => { currentMissingTypesRef.current      = currentMissingTypes; },  [currentMissingTypes]);
  useEffect(() => { questionHistoryRef.current          = questionHistory; },      [questionHistory]);
  useEffect(() => { lessonStartTimeRef.current          = lessonStartTime; },      [lessonStartTime]);
  useEffect(() => { remainingSecondsRef.current         = remainingSeconds; },     [remainingSeconds]);

  // Keep ttsEnabled ref in sync with state so async fetch callbacks read the right value
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  // ══════════════════════════════════════════════════════════════════════════════
  // ── ElevenLabs TTS helpers ────────────────────────────────────────────────────
  //
  //  Voice: "Charlie"  (IKne3meq5aSn9XLyUdCD) — warm, soft, patient male.
  //  The API key is stored in your backend .env as ELEVENLABS_API_KEY.
  //  The backend exposes POST /api/tts which proxies to ElevenLabs and
  //  streams back the audio — see the backend snippet at the bottom of this file.
  //
  //  To change the voice, update ELEVENLABS_VOICE_ID in your backend .env.
  //  Other great options:
  //    Liam   TX3LPaxmHKxFdv7VOQHJ  gentle, clear
  //    Brian  nPczCjzI2devNBz1zQrb  calm, warm, deep
  //    Will   bIHbv24MWmeRgasZH58o  soft, friendly
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Stop whatever is currently playing and clear speaking state.
   */
  const ttsStop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    setTtsSpeaking(false);
  }, []);

  /**
   * Convert HTML to speech via the backend /api/tts proxy.
   * Cancels any currently playing audio first.
   */
  const ttsSpeak = useCallback(async (html) => {
    // Stop anything already playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    setTtsSpeaking(false);

    if (!ttsEnabledRef.current || !html) return;

    const text = htmlToPlainText(html);
    if (!text) return;

    try {
      setTtsSpeaking(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error("TTS request failed:", response.status);
        setTtsSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl  = URL.createObjectURL(audioBlob);
      const audio     = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setTtsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setTtsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      // Guard: user may have toggled off while the fetch was in flight
      if (ttsEnabledRef.current) {
        audio.play().catch((err) => {
          console.warn("TTS autoplay blocked:", err);
          setTtsSpeaking(false);
        });
      } else {
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        setTtsSpeaking(false);
      }
    } catch (err) {
      console.error("TTS error:", err);
      setTtsSpeaking(false);
    }
  }, []);

  /**
   * Toggle narration on/off.
   * Turning off stops audio immediately.
   * Turning on re-reads the current lesson slide.
   */
  const ttsToggle = useCallback(() => {
    const next = !ttsEnabledRef.current;
    ttsEnabledRef.current = next;
    setTtsEnabled(next);

    if (!next) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
        currentAudioRef.current = null;
      }
      setTtsSpeaking(false);
    } else {
      const l = lessonRef.current;
      if (l?.type === "lesson") {
        const html =
          l.currentContentIndex === 0
            ? l.overview || ""
            : l.contents[l.currentContentIndex - 1] || "";
        ttsSpeak(html);
      }
    }
  }, [ttsSpeak]);

  // ── Auto-speak when the lesson slide changes ──────────────────────────────
  useEffect(() => {
    if (!lesson || lesson.type !== "lesson" || !showLessonModal) return;

    const html =
      lesson.currentContentIndex === 0
        ? lesson.overview || ""
        : lesson.contents[lesson.currentContentIndex - 1] || "";

    ttsSpeak(html);

    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
        currentAudioRef.current = null;
      }
      setTtsSpeaking(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.currentContentIndex, showLessonModal, lesson?.type]);

  // ── Stop TTS when the lesson modal closes ─────────────────────────────────
  useEffect(() => {
    if (!showLessonModal) ttsStop();
  }, [showLessonModal, ttsStop]);

  // ── Stop TTS on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
      }
    };
  }, []);

  // ── Restore assessment session ─────────────────────────────────────────────
  useEffect(() => {
    if (!lesson || lesson.type !== "assessment" || lesson.isAIReview) return;

    const saved = loadAssessmentSession(lessonId, itemId);
    if (!saved) return;
    if (saved.assessmentId !== (lesson._id || lesson.id)) return;

    const pool = lesson.questionsPool || [];
    const savedQuestion =
      pool.find((q) => q._id === saved.currentQuestionId) ||
      (lesson.currentQuestion?._id === saved.currentQuestionId ? lesson.currentQuestion : null);
    if (!savedQuestion) return;

    setLesson((prev) => ({ ...prev, currentQuestion: savedQuestion, answered: saved.answered || [] }));
    if (typeof saved.remainingSeconds === "number" && saved.remainingSeconds > 0)
      setRestoredTimerSeconds(saved.remainingSeconds);
    if (Array.isArray(saved.questionHistory))
      setQuestionHistory(saved.questionHistory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?._id, lesson?.type]);

  // ── Persist assessment session ─────────────────────────────────────────────
  useEffect(() => {
    if (!lesson || lesson.type !== "assessment" || lesson.isAIReview || !lesson.currentQuestion) return;
    saveAssessmentSession(lessonId, itemId, {
      assessmentId:      lesson._id || lesson.id,
      currentQuestionId: lesson.currentQuestion._id,
      answered:          lesson.answered || [],
      remainingSeconds:  remainingSecondsRef.current,
      questionHistory:   questionHistoryRef.current,
    });
  }, [lesson?.currentQuestion?._id, lesson?.answered, remainingSeconds, lessonId, itemId]);

  // ── Restore activity timer session ────────────────────────────────────────
  useEffect(() => {
    if (!lesson || lesson.type !== "activity" || lesson.isAIReview) return;
    const saved = loadActivitySession(lessonId, itemId);
    if (!saved) return;
    if (saved.activityId !== (lesson._id || lesson.id)) return;
    if (typeof saved.remainingSeconds === "number" && saved.remainingSeconds > 0)
      setRestoredTimerSeconds(saved.remainingSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?._id, lesson?.type]);

  // ── Persist activity timer every tick ─────────────────────────────────────
  useEffect(() => {
    if (!lesson || lesson.type !== "activity" || lesson.isAIReview) return;
    saveActivitySession(lessonId, itemId, {
      activityId:       lesson._id || lesson.id,
      remainingSeconds: remainingSecondsRef.current,
    });
  }, [remainingSeconds, lesson?._id, lesson?.type, lessonId, itemId]);

  // ── Reset state when a new activity starts ────────────────────────────────
  useEffect(() => {
    if (showActivityModal) {
      setCurrentActivityStartTime(Date.now());
      setActivityAttempts(0);
      activityAttemptsRef.current = 0;
      setRevealedHints(0);
      revealedHintsRef.current = 0;
      setAiCheckPerformed(false);
    }
  }, [showActivityModal]);

  // ── Reset attempts/hints when lesson changes ──────────────────────────────
  useEffect(() => {
    if (!lesson) return;
    setActivityAttempts(0);
    activityAttemptsRef.current = 0;
    setAssessmentAttempts(0);
    assessmentAttemptsRef.current = 0;
    setCurrentMissingTypes([]);
    currentMissingTypesRef.current = [];
  }, [lesson?._id, lesson?.type]);

  // ── Reset hints + attempts on new assessment question ────────────────────
  useEffect(() => {
    if (lesson?.type === "assessment" && lesson?.currentQuestion) {
      setRevealedHints(0);
      revealedHintsRef.current = 0;
      setAssessmentAttempts(0);
      assessmentAttemptsRef.current = 0;
      setQuestionStartTime(Date.now());
      questionStartTimeRef.current = Date.now();
      setTimeout(clearWhiteboard, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.currentQuestion?._id]);

  // ── Track lesson start time ────────────────────────────────────────────────
  useEffect(() => {
    if (lesson?.type === "lesson" && showLessonModal) setLessonStartTime(Date.now());
  }, [lesson?.type, showLessonModal]);

  // ── Clear whiteboard on lesson change ─────────────────────────────────────
  useEffect(() => {
    if (!lesson) return;
    clearWhiteboard();
  }, [lesson?._id, lesson?.type, lesson?.isAIReview]);

  // ── Lesson sound ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (showLessonModal && lesson?.type === "lesson") {
      const start = () => { playLessonSound(); document.removeEventListener("click", start); };
      document.addEventListener("click", start, { once: true });
    }
  }, [showLessonModal, lesson]);

  // ── Activity sound ────────────────────────────────────────────────────────
  useEffect(() => {
    if (showActivityModal) {
      const start = () => { playActivitySound(); document.removeEventListener("click", start); };
      document.addEventListener("click", start, { once: true });
    }
  }, [showActivityModal]);

  // ── Drag & drop + run button wiring ───────────────────────────────────────
  useEffect(() => {
    let cleanup   = null;
    let cancelled = false;

    const init = () => {
      if (cancelled) return;

      const whiteboard   = document.getElementById("whiteboard");
      const codeArea     = document.getElementById("codeArea");
      const trashCan     = document.getElementById("trashCan");
      const notification = document.getElementById("notification");
      const runButton    = document.getElementById("runButton");
      const outputArea   = document.getElementById("outputArea");

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

      // ── Assessment run ──────────────────────────────────────────────────
      const handleAssessmentRun = async () => {
        const currentLesson = lessonRef.current;
        if (!currentLesson?.currentQuestion) return;

        const blocks = whiteboard.querySelectorAll("[data-type]");
        if (blocks.length === 0) {
          notification.textContent = "Add some blocks to the whiteboard first! 🧩";
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 3000);
          return;
        }

        const question = currentLesson.currentQuestion;

        const boardSnapshotArr = Array.from(whiteboard.querySelectorAll("[data-type]"))
          .map((b) => b.getAttribute("data-type"))
          .filter(Boolean);
        const boardSnapshot = new Set(boardSnapshotArr);

        const result = await codeChecker(whiteboard, codeArea, outputArea, {
          expectedOutput:    question.expectedOutput || null,
          dataTypesRequired: question.dataTypesRequired || [],
        }, boardSnapshot);

        const timeTaken = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
        const attempts  = assessmentAttemptsRef.current + 1;
        setAssessmentAttempts(attempts);
        assessmentAttemptsRef.current = attempts;

        const missingTypes   = result.missingNodes || [];
        const updatedMissing = [...new Set([...currentMissingTypesRef.current, ...missingTypes])];
        setCurrentMissingTypes(updatedMissing);
        currentMissingTypesRef.current = updatedMissing;

        const difficulty =
          (question.difficulty?.charAt(0).toUpperCase() +
            question.difficulty?.slice(1).toLowerCase()) || "Easy";

        await recordAssessmentAttempt({
          assessmentId:  currentLesson._id || currentLesson.id,
          questionId:    question._id,
          timeTaken,
          totalAttempts: attempts,
          correct:       result.passedAll,
          difficulty,
          isAIReview:    currentLesson.isAIReview,
        });

        if (result.passedAll) {
          playSuccessSound();
          stopTimer();
          setCurrentMissingTypes([]);
          currentMissingTypesRef.current = [];

          const updatedHistory = [
            ...questionHistoryRef.current,
            {
              questionId:   question._id || `q-${Date.now()}`,
              difficulty,
              attemptsUsed: attempts,
              solved:       true,
              hintsUsed:    revealedHintsRef.current,
            },
          ];
          setQuestionHistory(updatedHistory);
          questionHistoryRef.current = updatedHistory;

          const updatedAnswered = [...(currentLesson.answered || []), question._id];

          if (updatedAnswered.length < currentLesson.totalQuestions) {
            const suggestedDifficulty = await fetchSuggestedDifficulty(
              updatedHistory,
              difficulty,
              currentLesson.totalQuestions - updatedAnswered.length
            );
            const { question: nextQ } = pickNextQuestion(
              currentLesson.questionsPool,
              suggestedDifficulty,
              updatedAnswered
            );
            if (nextQ) {
              setRestoredTimerSeconds(null);
              setLesson((prev) => ({ ...prev, currentQuestion: nextQ, answered: updatedAnswered }));
              setAssessmentAttempts(0);
              assessmentAttemptsRef.current = 0;
              setRevealedHints(0);
              revealedHintsRef.current = 0;
            } else {
              clearAssessmentSession(lessonId, itemId);
              setTimeout(clearWhiteboard, 50);
              setCharacterImg(getRandomImage(congratsImages));
              setShowCongratsModal(true);
              markAssessmentCompleted(currentLesson._id || currentLesson.id, currentLesson.isAIReview, updatedHistory);
              if (!currentLesson.isAIReview)
                await markCompleted({ lessonType: "assessment", assessmentId: currentLesson._id || currentLesson.id });
            }
          } else {
            clearAssessmentSession(lessonId, itemId);
            setTimeout(clearWhiteboard, 50);
            setCharacterImg(getRandomImage(congratsImages));
            setShowCongratsModal(true);
            markAssessmentCompleted(currentLesson._id || currentLesson.id, currentLesson.isAIReview, updatedHistory);
            if (!currentLesson.isAIReview)
              await markCompleted({ lessonType: "assessment", assessmentId: currentLesson._id || currentLesson.id });
          }
        } else {
          if (attempts >= 3) {
            const failedEntry = {
              questionId:   question._id || `q-${Date.now()}`,
              difficulty,
              attemptsUsed: attempts,
              solved:       false,
              hintsUsed:    revealedHintsRef.current,
            };
            const updatedHistory = [...questionHistoryRef.current, failedEntry];
            setQuestionHistory(updatedHistory);
            questionHistoryRef.current = updatedHistory;
          }

          playErrorSound();
          const notifParts = [];
          if (question.expectedOutput && !result.passedOutput)
            notifParts.push("Output does not match expected.");
          if (!result.passedNodes)
            notifParts.push(`Missing blocks: ${result.missingNodes?.join(", ")}`);
          notification.textContent = notifParts.join(" ");
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 5000);

          if (attempts >= 2 && attempts < 3 && !currentLesson.isAIReview)
            checkIfNeedsReview(attempts, updatedMissing);

          if (attempts >= 3) {
            if (!currentLesson.isAIReview) handleAIDecision("yes");

            const required    = question.dataTypesRequired || [];
            const getLabel    = (dt) => typeof dt === "object" ? (dt.type ?? dt.name ?? "") : dt;
            const getMin      = (dt) => typeof dt === "object" ? (dt.min ?? 1) : 1;
            const missingThis = result.missingNodes || [];

            const notEnoughTypes = required.filter((dt) => {
              const label = getLabel(dt); const min = getMin(dt);
              const count = Array.from(whiteboard.querySelectorAll(`[data-type='${label}']`)).length;
              return missingThis.includes(label) && count > 0 && min > 1;
            });
            const neverUsedTypes = required.filter((dt) => {
              const label = getLabel(dt);
              const count = Array.from(whiteboard.querySelectorAll(`[data-type='${label}']`)).length;
              return missingThis.includes(label) && count === 0;
            });
            const usedButWrongTypes = required.filter((dt) => !missingThis.includes(getLabel(dt)));

            setAssessmentAnswer({
              expectedOutput:    question.expectedOutput,
              dataTypesRequired: required,
              usedButWrongTypes,
              notEnoughTypes,
              neverUsedTypes,
              minCountMap: Object.fromEntries(required.map((dt) => [getLabel(dt), getMin(dt)])),
            });
            setTimeout(clearWhiteboard, 10000);
            setShowAnswerModal(true);
          }
        }
      };

      // ── Activity run ────────────────────────────────────────────────────
      const handleActivityRun = async () => {
        const currentLesson = lessonRef.current;
        if (!currentLesson) return;

        const blocks = whiteboard.querySelectorAll("[data-type]");
        if (blocks.length === 0) {
          notification.textContent = "Add some blocks to the whiteboard first! 🧩";
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 3000);
          return;
        }

        const boardSnapshotArr = Array.from(whiteboard.querySelectorAll("[data-type]"))
          .map((b) => b.getAttribute("data-type"))
          .filter(Boolean);
        const boardSnapshot = new Set(boardSnapshotArr);

        const result = await codeChecker(whiteboard, codeArea, outputArea, {
          expectedOutput:    currentLesson.expectedOutput || null,
          dataTypesRequired: currentLesson.dataTypesRequired || [],
        }, boardSnapshot);

        const timeTaken = Math.floor((Date.now() - currentActivityStartTimeRef.current) / 1000);
        const attempts  = activityAttemptsRef.current + 1;
        setActivityAttempts(attempts);
        activityAttemptsRef.current = attempts;

        const missingTypes   = result.missingNodes || [];
        const updatedMissing = [...new Set([...currentMissingTypesRef.current, ...missingTypes])];
        setCurrentMissingTypes(updatedMissing);
        currentMissingTypesRef.current = updatedMissing;

        const notifParts = [];
        if (currentLesson.expectedOutput && !result.passedOutput)
          notifParts.push("Output does not match expected.");
        if (!result.passedNodes)
          notifParts.push(`Missing blocks: ${missingTypes.join(", ")}`);
        if (notifParts.length) {
          notification.textContent = notifParts.join(" ");
          notification.style.display = "block";
          setTimeout(() => (notification.style.display = "none"), 5000);
        }

        if (!currentLesson.isAIReview && (result.passedAll || attempts >= 3)) {
          recordActivityAttempt({
            activityId:    currentLesson._id || currentLesson.id,
            timeTaken,
            totalAttempts: attempts,
            correct:       result.passedAll,
            isAIReview:    currentLesson.isAIReview,
          });
        }

        if (result.passedAll) {
          playSuccessSound();
          stopTimer();
          clearActivitySession(lessonId, itemId);
          setTimeout(clearWhiteboard, 50);
          if (!currentLesson.isAIReview)
            markCompleted({ lessonType: "activity", lessonStartTime: lessonStartTimeRef.current });
          stopActivitySound();
          setCharacterImg(getRandomImage(congratsImages));
          setShowCongratsModal(true);
          setCurrentMissingTypes([]);
          currentMissingTypesRef.current = [];
          return;
        }

        if (attempts >= 2 && attempts < 3 && !currentLesson.isAIReview)
          checkIfNeedsReview(attempts, updatedMissing);

        if (attempts >= 3) {
          if (!currentLesson.isAIReview) handleAIDecision("yes");
          clearActivitySession(lessonId, itemId);

          const required    = currentLesson.dataTypesRequired || [];
          const getLabel    = (dt) => typeof dt === "object" ? (dt.type ?? dt.name ?? "") : dt;
          const getMin      = (dt) => typeof dt === "object" ? (dt.min ?? 1) : 1;
          const missingThis = result.missingNodes || [];

          const notEnoughTypes = required.filter((dt) => {
            const label = getLabel(dt); const min = getMin(dt);
            const count = Array.from(whiteboard.querySelectorAll(`[data-type='${label}']`)).length;
            return missingThis.includes(label) && count > 0 && min > 1;
          });
          const neverUsedTypes = required.filter((dt) => {
            const label = getLabel(dt);
            const count = Array.from(whiteboard.querySelectorAll(`[data-type='${label}']`)).length;
            return missingThis.includes(label) && count === 0;
          });
          const usedButWrongTypes = required.filter((dt) => !missingThis.includes(getLabel(dt)));

          setAssessmentAnswer({
            expectedOutput:    currentLesson.expectedOutput,
            dataTypesRequired: required,
            usedButWrongTypes,
            notEnoughTypes,
            neverUsedTypes,
            minCountMap: Object.fromEntries(required.map((dt) => [getLabel(dt), getMin(dt)])),
          });
          setTimeout(clearWhiteboard, 10000);
          setShowAnswerModal(true);
        } else {
          playErrorSound();
        }
      };

      // ── Main run dispatcher ─────────────────────────────────────────────
      const onRun = async () => {
        const currentLesson = lessonRef.current;
        if (!currentLesson) return;
        if (currentLesson.type === "assessment")    await handleAssessmentRun();
        else if (currentLesson.type === "activity") await handleActivityRun();
      };

      runButton.addEventListener("click", onRun);

      const observer = new MutationObserver(() => {
        updateVariableState(whiteboard);
        updateCode(whiteboard, codeArea);
      });
      observer.observe(whiteboard, { childList: true, subtree: true });
      updateVariableState(whiteboard);
      updateCode(whiteboard, codeArea);

      cleanup = () => {
        destroy && destroy();
        runButton.removeEventListener("click", onRun);
        observer.disconnect();
      };
    };

    init();
    return () => { cancelled = true; if (cleanup) cleanup(); };
  }, [lesson?.type, lesson?._id, lesson?.currentQuestion?._id]);

  // ── Lesson navigation ──────────────────────────────────────────────────────
  const handleNextContent = async () => {
    ttsStop();

    if (lesson?.type === "lesson" && lesson.currentContentIndex < lesson.contents.length) {
      setLesson((prev) => ({ ...prev, currentContentIndex: prev.currentContentIndex + 1 }));
      return;
    }
    await markCompleted({ lessonType: "lesson", lessonStartTime });
    stopLessonSound();

    try {
      const token      = localStorage.getItem("token");
      const res        = await fetch(
        `${API_BASE}/api/activities/materials/${itemId}/activities`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const activities = await res.json();
      if (Array.isArray(activities) && activities.length > 0) {
        setShowLessonModal(false);
        setActivitySlide(0);
        setActivityText(randomActivityText(0));
        setShowActivityModal(true);
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
    ttsStop();
    if (lesson?.type === "lesson" && lesson.currentContentIndex > 0)
      setLesson((prev) => ({ ...prev, currentContentIndex: prev.currentContentIndex - 1 }));
  };

  const handleActivityNext = async () => {
    if (activitySlide === 0) {
      setActivitySlide(1);
      setActivityText(randomActivityText(1));
    } else {
      stopActivitySound();
      try {
        const token      = localStorage.getItem("token");
        const res        = await fetch(
          `${API_BASE}/api/activities/materials/${itemId}/activities`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const activities = await res.json();
        if (Array.isArray(activities) && activities.length > 0) {
          setShowActivityModal(false);
          navigate(`/lessons/${lessonId}/${activities[0]._id}`);
        } else {
          setShowActivityModal(false);
          navigate(`/lessons/${lessonId}`);
        }
      } catch (err) {
        console.error("❌ Error fetching activities:", err);
        setShowActivityModal(false);
        navigate(`/lessons/${lessonId}`);
      }
    }
  };

  // ── AI Review: start activity ──────────────────────────────────────────────
  const handleStartAIActivity = () => {
    const activity = aiReviewData?.reviewContent?.activity;
    if (!activity) return;
    ttsStop();
    clearWhiteboard();
    setShowAIReviewPanel(false);
    setShowCongratsModal(false);
    setShowAnswerModal(false);
    setLesson({ ...activity, type: "activity", isAIReview: true });
    setCurrentActivityStartTime(Date.now());
    setActivityAttempts(0);
    activityAttemptsRef.current = 0;
    setRevealedHints(0);
    revealedHintsRef.current = 0;
    setAiCheckPerformed(false);
  };

  // ── AI Review: start assessment ────────────────────────────────────────────
  const handleStartAIAssessment = () => {
    const qs = aiReviewData?.reviewContent?.assessmentQuestions || [];
    if (!qs.length) return;
    ttsStop();
    const pool          = [...qs];
    const firstQuestion = pool.splice(0, 1)[0];
    setShowAIReviewPanel(false);
    setLesson({
      _id:             "ai-review",
      title:           "Review Assessment",
      type:            "assessment",
      questionsPool:   pool,
      currentQuestion: firstQuestion,
      answered:        [],
      totalQuestions:  qs.length,
      timeLimit:       300,
      isAIReview:      true,
    });
    setAssessmentAttempts(0);
    assessmentAttemptsRef.current = 0;
    setQuestionStartTime(Date.now());
  };

  // ── Submit feedback to the backend ────────────────────────────────────────
  const handleSubmitFeedback = async (payload) => {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${API_BASE}/api/ai/review-feedback`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId:       user?._id || user?.id,
        lessonId:     payload.lessonId || lessonId,
        missingTypes: payload.missingTypes || [],
        helpful:      payload.helpful,
        reasons:      payload.reasons || [],
        sessionId:    payload.sessionId,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit feedback");
    }
    return res.json();
  };

  // ── Congrats close ────────────────────────────────────────────────────────
  const handleCongratsClose = () => {
    setShowCongratsModal(false);

    if (lesson?.isAIReview) {
      setShowAIReviewPanel(true);
      if (lesson?.type === "activity" && aiReviewData?.reviewContent?.assessmentQuestions) {
        setAiReviewStep("assessment");
      } else {
        setAiReviewStep("feedback");
      }
    } else {
      navigate(`/lessons/${lessonId}`);
    }
  };

  // ── Render lesson content ──────────────────────────────────────────────────
  const renderLessonContent = () => {
    if (!lesson || lesson.type !== "lesson") return null;
    if (lesson.currentContentIndex === 0)
      return <div dangerouslySetInnerHTML={{ __html: lesson.overview }} />;
    const index = lesson.currentContentIndex - 1;
    return <div dangerouslySetInnerHTML={{ __html: lesson.contents[index] || "" }} />;
  };

  // ── Guards (AFTER all hooks) ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!lesson)
    return <div className="text-center mt-5">Lesson / Activity not found.</div>;

  // ── AI Review Panel (full-page takeover) ───────────────────────────────────
  if (showAIReviewPanel) {
    return (
      <AIReviewPanel
        loading={aiReviewLoading}
        error={aiReviewError}
        errorReset={() => { setShowAIReviewPanel(false); setAiReviewError(null); }}
        aiReviewData={aiReviewData}
        aiReviewStep={aiReviewStep}
        setAiReviewStep={setAiReviewStep}
        aiReviewRevealedHints={aiReviewRevealedHints}
        setAiReviewRevealedHints={setAiReviewRevealedHints}
        aiRecommendation={aiRecommendation}
        onStartActivity={handleStartAIActivity}
        onStartAssessment={handleStartAIAssessment}
        onBackToActivity={() => { setShowAIReviewPanel(false); setAiReviewData(null); }}
        onSkip={() => navigate(`/lessons/${lessonId}`)}
        onSubmitFeedback={handleSubmitFeedback}
      />
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="dragboard-wrapper">
      {showAIPrompt && aiRecommendation && (
        <AIPromptModal
          aiRecommendation={aiRecommendation}
          onDecision={handleAIDecision}
          attempts={assessmentAttempts || activityAttempts}
        />
      )}

      <InstructionsPanel
        lesson={lesson}
        revealedHints={revealedHints}
        setRevealedHints={setRevealedHints}
        onBack={() => navigate(`/lessons/${lessonId}`)}
      />

      <Workspace
        lessonType={lesson.type}
        timeFormatted={timerFormatted}
        dataTypesRequired={
          lesson.dataTypesRequired || lesson.currentQuestion?.dataTypesRequired || []
        }
      />

      <LessonModals
        showLessonModal={showLessonModal}
        lesson={lesson}
        renderLessonContent={renderLessonContent}
        onPreviousContent={handlePreviousContent}
        onNextContent={handleNextContent}
        showActivityModal={showActivityModal}
        activityText={activityText}
        activitySlide={activitySlide}
        onActivityNext={handleActivityNext}
        showCongratsModal={showCongratsModal}
        onCongratsClose={handleCongratsClose}
        showAnswerModal={showAnswerModal}
        assessmentAnswer={assessmentAnswer}
        onAnswerClose={() => { setShowAnswerModal(false); navigate(`/lessons/${lessonId}`); }}
        characterImg={characterImg}
        // ── TTS props ──
        ttsEnabled={ttsEnabled}
        ttsSpeaking={ttsSpeaking}
        onTtsToggle={ttsToggle}
        onTtsStop={ttsStop}
      />
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  BACKEND ROUTE  —  paste this into your Express backend
//
//  1. Add to your backend .env:
//       ELEVENLABS_API_KEY=your_api_key_here
//       ELEVENLABS_VOICE_ID=IKne3meq5aSn9XLyUdCD
//
//     Voice ID options (all soft male, great for children):
//       IKne3meq5aSn9XLyUdCD  Charlie — warm, patient  ← default
//       TX3LPaxmHKxFdv7VOQHJ  Liam    — gentle, clear
//       nPczCjzI2devNBz1zQrb  Brian   — calm, deep
//       bIHbv24MWmeRgasZH58o  Will    — soft, friendly
//
//  2. Create  routes/tts.js  with the code below and mount it:
//       app.use("/api", require("./routes/tts"));
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
//  const express = require("express");
//  const router  = express.Router();
//  const fetch   = require("node-fetch"); // npm i node-fetch@2  (or use axios)
//  const { verifyToken } = require("../middleware/auth"); // your existing auth middleware
//
//  router.post("/tts", verifyToken, async (req, res) => {
//    const { text } = req.body;
//    if (!text || typeof text !== "string" || !text.trim())
//      return res.status(400).json({ message: "text is required" });
//
//    const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "IKne3meq5aSn9XLyUdCD";
//    const API_KEY  = process.env.ELEVENLABS_API_KEY;
//
//    try {
//      const upstream = await fetch(
//        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
//        {
//          method:  "POST",
//          headers: {
//            "xi-api-key":   API_KEY,
//            "Content-Type": "application/json",
//            "Accept":       "audio/mpeg",
//          },
//          body: JSON.stringify({
//            text: text.trim(),
//            model_id: "eleven_turbo_v2",
//            voice_settings: {
//              stability:         0.75,
//              similarity_boost:  0.85,
//              style:             0.40,
//              use_speaker_boost: true,
//            },
//          }),
//        }
//      );
//
//      if (!upstream.ok) {
//        const err = await upstream.text();
//        console.error("ElevenLabs error:", err);
//        return res.status(502).json({ message: "TTS service error" });
//      }
//
//      res.setHeader("Content-Type", "audio/mpeg");
//      res.setHeader("Cache-Control", "no-store");
//      upstream.body.pipe(res);   // stream audio straight to the browser
//    } catch (err) {
//      console.error("TTS route error:", err);
//      res.status(500).json({ message: "Internal server error" });
//    }
//  });
//
//  module.exports = router;
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━