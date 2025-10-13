import React, { useEffect, useState, useContext } from "react";
import "./DragBoard.css";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

import { initDragAndDrop } from "../utils/dragAndDrop";
import { updateCode } from "../utils/codeGen";
import { updateVariableState } from "../utils/state";
import { runProgram } from "../utils/runner";

export default function DragBoardLesson() {
  const { lessonId, itemId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

// ✅ Fetch lesson, activity, or assessment
useEffect(() => {
  const fetchLessonOrActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Try material first
      let res = await axios
        .get(`http://localhost:5000/api/materials/lessons/${lessonId}/materials/${itemId}`, { headers })
        .then((r) => ({ ...r.data, type: "lesson" }))
        .catch(async () => {
          // Try assessment next
          return axios
            .get(`http://localhost:5000/api/assessments/lessons/${lessonId}/assessments/${itemId}`, { headers })
            .then((r) => ({ ...r.data, type: "assessment" }))
            .catch(async () => {
              // Try activity last
              return axios
                .get(`http://localhost:5000/api/activities/lessons/${lessonId}/activities/${itemId}`, { headers })
                .then((r) => ({ ...r.data, type: "activity" }));
            });
        });

      setLesson({ ...res, currentContentIndex: res.type === "lesson" ? 0 : null });
    } catch (err) {
      console.error("❌ Error fetching lesson/activity/assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchLessonOrActivity();
}, [itemId, lessonId]);


  // ✅ Initialize drag and drop
  useEffect(() => {
    const init = () => {
      const whiteboard = document.getElementById("whiteboard");
      const codeArea = document.getElementById("codeArea");
      const trashCan = document.getElementById("trashCan");
      const notification = document.getElementById("notification");
      const runButton = document.getElementById("runButton");
      const outputArea = document.getElementById("outputArea");

      if (!whiteboard || !codeArea || !trashCan || !notification) {
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

      const onRun = () => runProgram(codeArea, outputArea);
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
  }, []);

  // ✅ Mark item as completed (fixed: correctly maps types)
  const markCompleted = async () => {
    if (!user || !user.id) {
      console.warn("⚠️ No user logged in — cannot update progress");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let endpoint = "";
      const payload = { userId: user.id, lessonId };

      // Choose correct endpoint based on type
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
          console.warn("⚠️ Unknown lesson type, skipping completion update");
          return;
      }

      const res = await axios.post(
        `http://localhost:5000/api/progress/${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`✅ ${lesson.type} ${itemId} marked as completed`, res.data);
    } catch (err) {
      console.error("❌ Error marking item as completed:", err);
    }
  };

  // ✅ Navigation logic
  const handleNextContent = () => {
    if (lesson.type === "lesson" && lesson.currentContentIndex < lesson.contents.length) {
      setLesson((prev) => ({
        ...prev,
        currentContentIndex: prev.currentContentIndex + 1,
      }));
    } else {
      markCompleted();
      setShowCompletionModal(true);
    }
  };

  const handlePreviousContent = () => {
    if (lesson.type === "lesson" && lesson.currentContentIndex > 0) {
      setLesson((prev) => ({
        ...prev,
        currentContentIndex: prev.currentContentIndex - 1,
      }));
    }
  };

  const handleContinue = () => {
    setShowCompletionModal(false);
    navigate(-1);
  };

  // ✅ Proper rendering for all types
  const renderLessonContent = () => {
    if (lesson.type === "activity") {
      return (
        <div>
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
      );
    }

    if (lesson.type === "assessment") {
      return (
        <div>
          <h5 style={{ color: "#00796B" }}>{lesson.title}</h5>
          <p dangerouslySetInnerHTML={{ __html: lesson.instructions || "" }} />

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

          {lesson.testCases?.length > 0 && (
            <>
              <h6 style={{ color: "#7B1FA2" }}>Test Cases:</h6>
              <ul>
                {lesson.testCases.map((test, index) => (
                  <li key={index}>
                    <strong>Input:</strong> {test.input} <br />
                    <strong>Expected Output:</strong> {test.output}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      );
    }


    if (lesson.currentContentIndex === 0) {
      return <div dangerouslySetInnerHTML={{ __html: lesson.overview }} />;
    }

    const index = lesson.currentContentIndex - 1;
    return (
      <div dangerouslySetInnerHTML={{ __html: lesson.contents[index] || "" }} />
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center mt-5">
        Lesson / Activity / Assessment not found.
      </div>
    );
  }

  return (
    <div>
      {/* Dragboard */}
      <div className="main-container">
        <div className="draggable">
          <h3>Elements</h3>
          <div className="elements">
            <img src="/assets/images/print1.png" data-type="print" draggable="true" alt="Print" />
            <img src="/assets/images/container.png" data-type="variable" draggable="true" alt="Variable" />
            <img src="/assets/images/multiply.png" data-type="multiply" draggable="true" alt="Multiply" />
            <img src="/assets/images/add.png" data-type="add" draggable="true" alt="Add" />
            <img src="/assets/images/subtract.png" data-type="subtract" draggable="true" alt="Subtract" />
            <img src="/assets/images/divide.png" data-type="divide" draggable="true" alt="Divide" />
            <img src="/assets/images/equalto.png" data-type="equal" draggable="true" alt="Equal ==" />
            <img src="/assets/images/notequal.png" data-type="notequal" draggable="true" alt="Not Equal !=" />
            <img src="/assets/images/lessthan.png" data-type="less" draggable="true" alt="Less Than <" />
            <img src="/assets/images/lessthanequal.png" data-type="lessequal" draggable="true" alt="Less or Equal <=" />
            <img src="/assets/images/greaterthan.png" data-type="greater" draggable="true" alt="Greater Than >" />
            <img src="/assets/images/greaterthanequal.png" data-type="greaterequal" draggable="true" alt="Greater or Equal >=" />
            <img src="/assets/images/if.png" data-type="if" draggable="true" alt="If" />
            <img src="/assets/images/elif.png" data-type="elif" draggable="true" alt="Elif" />
            <img src="/assets/images/else.png" data-type="else" draggable="true" alt="Else" />
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
            <button id="runButton" className="run-button">▶ Run Program</button>
            <div>Source Code (preview)</div>
            <pre id="codeArea">/* Build expressions on the whiteboard */</pre>
          </div>
          <div className="output">
            <div>Program Output</div>
            <pre id="outputArea">/* Results will appear here */</pre>
          </div>
        </div>
      </div>

      <div id="notification" className="notification"></div>

      {/* Lesson Modal */}
      <Modal show backdrop="static" centered size="lg">
        <Modal.Header>
          <Modal.Title>
            {lesson.type === "activity"
              ? `Activity: ${lesson.name}`
              : lesson.type === "assessment"
              ? `Assessment: ${lesson.title}`
              : lesson.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "#FFF8F2",
            fontFamily: "'Comic Sans MS', cursive",
          }}
        >
          {renderLessonContent()}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          {lesson.type === "lesson" && (
            <Button
              variant="secondary"
              onClick={handlePreviousContent}
              disabled={lesson.currentContentIndex === 0}
            >
              ← Previous
            </Button>
          )}
          <Button variant="primary" onClick={handleNextContent}>
            {lesson.type === "activity"
              ? "Finish Activity"
              : lesson.type === "assessment"
              ? "Finish Assessment"
              : lesson.currentContentIndex >= lesson.contents.length
              ? "Finish Lesson"
              : "Next →"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Completion Modal */}
      <Modal show={showCompletionModal} onHide={() => setShowCompletionModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>🎉 Great Job!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center", fontSize: "1.2rem" }}>
          {lesson.type === "activity" ? (
            <p>You’ve completed this activity! Would you like to continue?</p>
          ) : lesson.type === "assessment" ? (
            <p>You’ve finished this assessment! Continue to the next one?</p>
          ) : (
            <p>You’ve finished this lesson! Continue to the next one?</p>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>
            Stay Here
          </Button>
          <Button variant="success" onClick={handleContinue}>
            Continue →
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
