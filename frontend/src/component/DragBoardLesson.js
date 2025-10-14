// src/pages/DragBoardLesson.js
import React, { useEffect, useState, useContext } from "react";
import "./DragBoard.css";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

import { initDragAndDrop } from "../utils/dragAndDrop";
import { updateCode } from "../utils/codeGen";
import { updateVariableState } from "../utils/state";
import { runProgram } from "../utils/runner"; // Pyodide runner

export default function DragBoardLesson() {
  const { lessonId, itemId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch lesson/activity/assessment
  useEffect(() => {
    const fetchLessonOrActivity = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let res = await axios
          .get(`http://localhost:5000/api/materials/lessons/${lessonId}/materials/${itemId}`, { headers })
          .then(r => ({ ...r.data, type: "lesson" }))
          .catch(async () =>
            axios
              .get(`http://localhost:5000/api/assessments/lessons/${lessonId}/assessments/${itemId}`, { headers })
              .then(r => ({ ...r.data, type: "assessment" }))
              .catch(() =>
                axios
                  .get(`http://localhost:5000/api/activities/lessons/${lessonId}/activities/${itemId}`, { headers })
                  .then(r => ({ ...r.data, type: "activity" }))
              )
          );

        setLesson({ ...res, currentContentIndex: res.type === "lesson" ? 0 : null });
      } catch (err) {
        console.error("❌ Error fetching lesson/activity/assessment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonOrActivity();
  }, [itemId, lessonId]);

  // Initialize drag and drop & Pyodide runner
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

      if (lesson?.dataTypesRequired) {
        console.log("🔹 Required data types:", lesson.dataTypesRequired);
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

        if (lesson.type === "activity" || lesson.type === "assessment") {
          const activityMeta = {
            expectedOutput: lesson.expectedOutput || null,
            dataTypesRequired: lesson.dataTypesRequired || [],
          };
          const { codeChecker } = await import("../utils/codeChecker");
          const result = await codeChecker(whiteboard, codeArea, outputArea, activityMeta);

          outputArea.textContent = result.stdout || result.stderr || "/* No output */";

          if (result.passedAll) {
            markCompleted();
            setShowCongratsModal(true);
          } else {
            const notifText = [];
            if (lesson.expectedOutput && !result.passedOutput)
              notifText.push("Output does not match expected.");
            if (!result.passedNodes) notifText.push(`Missing objects: ${result.missingNodes.join(", ")}`);
            notification.textContent = notifText.join(" ");
            notification.style.display = "block";
            setTimeout(() => { notification.style.display = "none"; }, 5000);
          }
        } else {
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
  }, [lesson]);

  // Mark item as completed
  const markCompleted = async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      let endpoint = "";
      const payload = { userId: user.id, lessonId };

      switch (lesson?.type) {
        case "lesson":
          endpoint = "complete-material";
          payload.materialId = itemId;
          break;
        case "activity":
          endpoint = "complete-activity";
          payload.activityId = itemId;
          break;
        case "assessment":
          endpoint = "complete-assessment";
          payload.assessmentId = itemId;
          break;
        default:
          return;
      }

      await axios.post(`http://localhost:5000/api/progress/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("❌ Error marking item as completed:", err);
    }
  };

  const handleNextContent = () => {
    if (lesson?.type === "lesson" && lesson.currentContentIndex < lesson.contents.length) {
      setLesson(prev => ({ ...prev, currentContentIndex: prev.currentContentIndex + 1 }));
    }
  };

  const handlePreviousContent = () => {
    if (lesson?.type === "lesson" && lesson.currentContentIndex > 0) {
      setLesson(prev => ({ ...prev, currentContentIndex: prev.currentContentIndex - 1 }));
    }
  };

  const handleContinue = () => {
    setShowCongratsModal(false);
    navigate(-1);
  };

  const renderLessonContent = () => {
    if (!lesson || lesson.type !== "lesson") return null;
    if (lesson.currentContentIndex === 0) return <div dangerouslySetInnerHTML={{ __html: lesson.overview }} />;
    const index = lesson.currentContentIndex - 1;
    return <div dangerouslySetInnerHTML={{ __html: lesson.contents[index] || "" }} />;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center mt-5">Lesson / Activity / Assessment not found.</div>;
  }

  const isLesson = lesson.type === "lesson";
  const actionButtonText = isLesson ? "▶ Run Program" : "Submit";

  return (
    <div className="dragboard-wrapper">
      {/* Instructions for Activity/Assessment */}
      {(lesson.type === "activity" || lesson.type === "assessment") && (
        <div className="activity-instructions mb-3 p-3" style={{ backgroundColor: "#FFF8F2", borderRadius: "8px" }}>
          <h5 style={{ color: "#00796B" }}>Instructions</h5>
          <p dangerouslySetInnerHTML={{ __html: lesson.instructions }} />
          {lesson.hints?.length > 0 && (
            <>
              <h6 style={{ color: "#0288D1" }}>Hints:</h6>
              <ul>{lesson.hints.map((hint, i) => <li key={i} dangerouslySetInnerHTML={{ __html: hint }} />)}</ul>
            </>
          )}
          {lesson.expectedOutput && (
            <>
              <h6 style={{ color: "#E65100" }}>Expected Output:</h6>
              <pre style={{ backgroundColor: "#f4f4f4", padding: "10px", borderRadius: "8px" }}>
                {lesson.expectedOutput}
              </pre>
            </>
          )}
        </div>
      )}

      {/* Drag & Drop + Workspace */}
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

      {/* Lesson Modal */}
      {isLesson && (
        <Modal show backdrop="static" centered size="lg">
          <Modal.Header>
            <Modal.Title>{lesson.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "65vh", overflowY: "auto", padding: "1.5rem", backgroundColor: "#FFF8F2", fontFamily: "'Comic Sans MS', cursive" }}>
            {renderLessonContent()}
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="secondary" onClick={handlePreviousContent} disabled={lesson.currentContentIndex === 0}>← Previous</Button>
            <Button variant="primary" onClick={handleNextContent}>{lesson.currentContentIndex >= lesson.contents.length ? "Finish Lesson" : "Next →"}</Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Congratulatory Modal */}
      <Modal show={showCongratsModal} centered backdrop="static">
        <Modal.Header>
          <Modal.Title>🎉 Congratulations!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You completed the activity successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCongratsModal(false)}>Stay</Button>
          <Button variant="primary" onClick={handleContinue}>Continue</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
