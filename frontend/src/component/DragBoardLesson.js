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
import {
  playLessonSound,
  stopLessonSound,
  playActivitySound,
  stopActivitySound,
  playSuccessSound,
  playErrorSound
} from "../utils/sfx";

// --- Character images ---
const lessonImages = ["/assets/images/lesson.png", "/assets/images/lesson1.png"];
const activityImages = ["/assets/images/activity.png", "/assets/images/activity1.png"];
const congratsImages = [
  "/assets/images/congrats.png",
  "/assets/images/congrats1.png",
  "/assets/images/congrats2.png",
  "/assets/images/congrats3.png",
  "/assets/images/congrats4.png",
];

const getRandomImage = (images) =>
  images[Math.floor(Math.random() * images.length)];

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

  // --- Assessment-specific state ---
  const [assessmentAttempts, setAssessmentAttempts] = useState(0);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [assessmentAnswer, setAssessmentAnswer] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

   const location = useLocation();
  const { assessment, questions } = location.state || {};

  useEffect(() => {
    if (assessment) {
      setLesson({ ...assessment, type: "assessment", questions });
      setCurrentQuestionIndex(0);
    }
  }, [assessment, questions]);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (lesson?.type === "assessment") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex]);

  // --- Handle Lesson Sound ---
  useEffect(() => {
    if (showLessonModal && lesson?.type === "lesson") {
      const startSound = () => {
        playLessonSound();
        document.removeEventListener("click", startSound);
      };
      document.addEventListener("click", startSound, { once: true });
    }
  }, [showLessonModal, lesson]);

  // --- Handle Activity Sound ---
  useEffect(() => {
    if (showActivityModal) {
      const startSound = () => {
        playActivitySound();
        document.removeEventListener("click", startSound);
      };
      document.addEventListener("click", startSound, { once: true });
    }
  }, [showActivityModal]);

  // --- Fetch Lesson / Activity / Assessment ---
  useEffect(() => {
  const fetchLessonOrActivity = async () => {
    try {
      // If assessment is already passed from navigation state, skip fetching
      if (assessment && questions) {
        setLesson({ ...assessment, type: "assessment", questions });
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
                const assessment = { ...r.data, _id: r.data.id, type: "assessment" };

                // Shuffle questions only if not already set
                if (assessment.questions?.length > 0) {
                  assessment.questions = [...assessment.questions].sort(() => Math.random() - 0.5);
                }

                return assessment;
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

      setLesson({
        ...res,
        currentContentIndex: res.type === "lesson" ? 0 : null,
      });

      if (res.type === "lesson") setCharacterImg(getRandomImage(lessonImages));
    } catch (err) {
      console.error("❌ Error fetching content:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchLessonOrActivity();
}, [itemId, lessonId, assessment, questions]);


  // --- Initialize drag & drop ---
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

      const onRun = async () => {
        if (!lesson) return;
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
const attempts = assessmentAttempts + 1; // increment attempts

        const { codeChecker } = await import("../utils/codeChecker");

        // --- Activity ---
        if (lesson.type === "activity") {
          const activityMeta = {
            expectedOutput: lesson.expectedOutput || null,
            dataTypesRequired: lesson.dataTypesRequired || [],
          };
          const result = await codeChecker(whiteboard, codeArea, outputArea, activityMeta);
          outputArea.textContent = result.stdout || result.stderr || "/* No output */";

          if (result.passedAll) {
            stopActivitySound();
            playSuccessSound();
            await markCompleted();
            setCharacterImg(getRandomImage(congratsImages));
            setShowCongratsModal(true);
          } else {
            playErrorSound();
            const notifText = [];
            if (lesson.expectedOutput && !result.passedOutput)
              notifText.push("Output does not match expected.");
            if (!result.passedNodes)
              notifText.push(`Missing objects: ${result.missingNodes.join(", ")}`);
            notification.textContent = notifText.join(" ");
            notification.style.display = "block";
            setTimeout(() => (notification.style.display = "none"), 5000);
          }
        }

        // --- Assessment ---
        if (lesson.type === "assessment") {
          const question = lesson.questions[currentQuestionIndex];
          if (!question) return;

          const questionMeta = {
            expectedOutput: question.expectedOutput || null,
            dataTypesRequired: question.dataTypesRequired || [],
          };

          const result = await codeChecker(whiteboard, codeArea, outputArea, questionMeta);
          outputArea.textContent = result.stdout || result.stderr || "/* No output */";

          const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

          // --- Send attempt to backend ---
          const token = localStorage.getItem("token");
          console.log("Submitting attempt:", {
            assessmentId: lesson._id,
            questionId: question._id,
            userId: user._id,
            timeSeconds: timeTaken,
            correct: result.passedAll,
          });

          await axios.post(
            `http://localhost:5000/api/progress/mark-assessment-attempt`,
            {
              assessmentId: lesson._id,
              lessonId: lessonId,
              questionId: question._id,
              userId: user._id,
              timeSeconds: timeTaken,
               totalAttempts: attempts,
              correct: result.passedAll,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (result.passedAll) {
            playSuccessSound();
            if (currentQuestionIndex + 1 < lesson.questions.length) {
              setCurrentQuestionIndex(currentQuestionIndex + 1);
              setAssessmentAttempts(0);
              setQuestionStartTime(Date.now());
              notification.textContent = "✅ Correct! Proceed to next question.";
              notification.style.display = "block";
              setTimeout(() => (notification.style.display = "none"), 3000);
            } else {
              stopActivitySound();
              playSuccessSound();
              await markCompleted();
              setCharacterImg(getRandomImage(congratsImages));
              setShowCongratsModal(true);
            }
          } else {
            playErrorSound();
            const notifText = [];
            if (question.expectedOutput && !result.passedOutput)
              notifText.push("Output does not match expected.");
            if (!result.passedNodes)
              notifText.push(`Missing objects: ${result.missingNodes.join(", ")}`);
            notification.textContent = notifText.join(" ");
            notification.style.display = "block";
            setTimeout(() => (notification.style.display = "none"), 5000);

            const attempts = assessmentAttempts + 1;
            setAssessmentAttempts(attempts);
            if (attempts >= 3) {
              setAssessmentAnswer({
                expectedOutput: question.expectedOutput,
                dataTypesRequired: question.dataTypesRequired,
              });
              setShowAnswerModal(true);
            }
          }
        }

        // --- Lesson ---
        if (lesson.type === "lesson") {
          await runProgram(codeArea, outputArea);
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
  }, [lesson, assessmentAttempts]);

  // --- Mark Completion ---
  const markCompleted = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("token");
      const payload = { userId: user._id, lessonId };
      let endpoint = "";

      if (lesson?.type === "lesson") {
        endpoint = "complete-material";
        payload.materialId = itemId;
      } else if (lesson?.type === "activity") {
        endpoint = "complete-activity";
        payload.activityId = itemId;
      } else if (lesson?.type === "assessment") {
        endpoint = "complete-assessment";
        payload.assessmentId = itemId;
      }

      if (!endpoint) return;

      await axios.post(`http://localhost:5000/api/progress/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("❌ Error marking item completed:", err);
    }
  };

  // --- Lesson Navigation ---
  const handleNextContent = async () => {
    if (lesson?.type === "lesson" && lesson.currentContentIndex < lesson.contents.length) {
      setLesson((prev) => ({
        ...prev,
        currentContentIndex: prev.currentContentIndex + 1,
      }));
      setCharacterImg(getRandomImage(lessonImages));
      return;
    }

    // ✅ Lesson finished
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
      setLesson((prev) => ({
        ...prev,
        currentContentIndex: prev.currentContentIndex - 1,
      }));
    }
  };

  // --- Activity Transition ---
  const randomActivityText = (slide) => {
    const thinkingTexts = [
      "Let's see how we can apply what we just learned!",
      "Can you figure out how to use what we discussed?",
      "Try to think about how this concept can be used here!",
    ];
    const solvingTexts = [
      "Now it’s your turn — good luck!",
      "Use the code blocks to finish the activity.",
      "Let’s test your skills in this activity!",
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

  // --- Proceed to Activity ---
  const handleProceedToActivity = async () => {
    console.log("🚀 Proceeding to activity:", { user, lessonId, itemId });
    const userId = user?._id || user?.id;
    if (!userId) {
      console.warn("⚠️ No user ID found, aborting proceed.");
      return;
    }

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
        console.warn("⚠️ No activities found, returning to lesson list.");
        setShowActivityModal(false);
        navigate(`/lessons/${lessonId}`);
      }
    } catch (err) {
      console.error("❌ Error fetching activities:", err);
      setShowActivityModal(false);
      navigate(`/lessons/${lessonId}`);
    }
  };

  // --- Render Lesson Content ---
  const renderLessonContent = () => {
    if (!lesson || lesson.type !== "lesson") return null;
    if (lesson.currentContentIndex === 0)
      return <div dangerouslySetInnerHTML={{ __html: lesson.overview }} />;
    const index = lesson.currentContentIndex - 1;
    return (
      <div dangerouslySetInnerHTML={{ __html: lesson.contents[index] || "" }} />
    );
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

  return (
    <div className="dragboard-wrapper">
      {/* === Activity / Assessment Instructions === */}
{lesson.type === "activity" && (
  <div
    className="activity-instructions mb-3 p-3"
    style={{ backgroundColor: "#FFF8F2", borderRadius: "8px" }}
  >
    <h5 style={{ color: "#00796B" }}>Instructions</h5>
    <p dangerouslySetInnerHTML={{ __html: lesson.instructions }} />

    {lesson.hints?.length > 0 && (
      <>
        <h6 style={{ color: "#0288D1" }}>Hints:</h6>
        <ul>
          {lesson.hints.map((hint, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: hint }} />
          ))}
        </ul>
      </>
    )}

    {lesson.expectedOutput && (
      <>
        <h6 style={{ color: "#E65100" }}>Expected Output:</h6>
        <pre
          style={{
            backgroundColor: "#f4f4f4",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          {lesson.expectedOutput}
        </pre>
      </>
    )}
  </div>
)}

{lesson.type === "assessment" && lesson.questions?.length > 0 && (
  <div
    className="assessment-instructions mb-3 p-3"
    style={{ backgroundColor: "#FFF8F2", borderRadius: "8px" }}
  >
    <h5 style={{ color: "#00796B" }}>Assessment: {lesson.title}</h5>
    {lesson.questions[currentQuestionIndex] && (() => {
      const q = lesson.questions[currentQuestionIndex];
      return (
        <div style={{ marginBottom: "1.5rem" }}>
          <h6 style={{ color: "#00796B" }}>Question {currentQuestionIndex + 1}</h6>
          <p dangerouslySetInnerHTML={{ __html: q.instructions }} />
          {q.hints?.length > 0 && (
            <>
              <h6 style={{ color: "#0288D1" }}>Hints:</h6>
              <ul>
                {q.hints.map((hint, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: hint }} />
                ))}
              </ul>
            </>
          )}
          {q.expectedOutput && (
            <>
              <h6 style={{ color: "#E65100" }}>Expected Output:</h6>
              <pre
                style={{
                  backgroundColor: "#f4f4f4",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                {q.expectedOutput}
              </pre>
            </>
          )}
        </div>
      );
    })()}
  </div>
)}
      {/* === Drag & Drop + Workspace === */}
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
            <img src="/assets/images/lessthanequal.png" data-type="lessequal" draggable alt="Less or Equal" />
            <img src="/assets/images/greaterthan.png" data-type="greater" draggable alt="Greater Than" />
            <img src="/assets/images/greaterthanequal.png" data-type="greaterequal" draggable alt="Greater or Equal" />
            <img src="/assets/images/if.png" data-type="if" draggable alt="If" />
            <img src="/assets/images/elif.png" data-type="elif" draggable alt="Elif" />
            <img src="/assets/images/else.png" data-type="else" draggable alt="Else" />
            <img src="/assets/images/while.png" data-type="while" draggable alt="While" />
          </div>
        </div>

        <div className="workspace">
          <div className="whiteboard-wrap">
            <div id="whiteboard" className="whiteboard">
              <div id="trashCan" className="trash-can">🗑️</div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="code-panel">
            <button id="runButton" className="run-button">{actionButtonText}</button>
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
            <div className="typing-container">
              {renderLessonContent()}
            </div>
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
          <p>You completed this activity successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowCongratsModal(false);
              navigate(`/lessons/${lessonId}`);
            }}
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* === Assessment Answer Modal === */}
      <Modal
        show={showAnswerModal}
        backdrop="static"
        size="lg"
        style={{ top: "100px" }}
      >
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
              <pre
                style={{
                  backgroundColor: "#f4f4f4",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
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

      {/* === Character Avatar (Bottom Left) === */}
      {(showLessonModal || showActivityModal || showCongratsModal) && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            left: "20px",
            zIndex: 1055,
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
          }}
        >
          <img
            src={characterImg}
            alt="Character"
            style={{
              top: "90px",
              width: "420px",
              height: "auto",
              userSelect: "none",
              pointerEvents: "none",
              animation: "bounce 2s infinite ease-in-out",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        /* === Typing animation for lesson === */
        .typing-container {
          display: inline-block;
          overflow: hidden;
          white-space: normal;
          border-right: 3px solid #333;
          animation: typingDown 3s steps(40, end), blink 0.8s step-end infinite;
        }

        @keyframes typingDown {
          from {
            clip-path: inset(0 0 100% 0);
          }
          to {
            clip-path: inset(0 0 0 0);
          }
        }

        /* === Typing for activity/congrats short text === */
        .typing-line {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #333;
          animation: typingShort 2.5s steps(35, end), blink 0.8s step-end infinite;
        }

        @keyframes typingShort {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink {
          0%, 50% { border-color: #333; }
          51%, 100% { border-color: transparent; }
        }
      `}</style>
    </div>
  );
}
