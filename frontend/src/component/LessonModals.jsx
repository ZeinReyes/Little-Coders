import React from "react";
import { Modal, Button } from "react-bootstrap";

/**
 * LessonModals
 * Bundles the four Bootstrap modals used in DragBoardLesson:
 *   1. LessonModal       — slides through lesson content
 *   2. ActivityModal     — "thinking / solving" intro before the activity
 *   3. CongratsModal     — shown on success
 *   4. AnswerModal       — reveals the answer after max attempts
 *
 * All open/close state and handlers are passed in as props so this file
 * is purely presentational.
 */
export default function LessonModals({
  // Lesson modal
  showLessonModal,
  lesson,
  renderLessonContent,
  onPreviousContent,
  onNextContent,

  // Activity modal
  showActivityModal,
  activityText,
  activitySlide,
  onActivityNext,

  // Congrats modal
  showCongratsModal,
  onCongratsClose,

  // Answer modal
  showAnswerModal,
  assessmentAnswer,
  onAnswerClose,

  // Character image (shared)
  characterImg,
}) {
  const isLesson = lesson?.type === "lesson";

  return (
    <>
      {/* ── Lesson Modal ── */}
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
              onClick={onPreviousContent}
              disabled={lesson.currentContentIndex === 0}
            >
              ← Previous
            </Button>
            <Button variant="primary" onClick={onNextContent}>
              {lesson.currentContentIndex >= lesson.contents.length
                ? "Finish Lesson"
                : "Next →"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Activity Intro Modal ── */}
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
          <Button variant="primary" onClick={onActivityNext}>
            {activitySlide === 0 ? "Next →" : "Proceed"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Congrats Modal ── */}
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
              🌟 Amazing! You've completed your AI review session! Ready to go back and try again?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={onCongratsClose}>
            {lesson?.isAIReview &&
            lesson?.type === "activity"
              ? "Continue to Assessment! 📝"
              : lesson?.isAIReview && lesson?.type === "assessment"
              ? "Back to Lesson! 🏠"
              : "Continue"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Answer Modal ── */}
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
          <Button variant="primary" onClick={onAnswerClose}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Floating character ── */}
      {(showLessonModal || showActivityModal || showCongratsModal) &&
        lesson?.type !== "assessment" && (
          <CharacterBubble src={characterImg} />
        )}

      {showCongratsModal && lesson?.type === "assessment" && (
        <CharacterBubble src={characterImg} />
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes typingDown {
          from { clip-path: inset(0 0 100% 0); }
          to   { clip-path: inset(0 0 0 0); }
        }
        .typing-container {
          display: inline-block;
          overflow: hidden;
          white-space: normal;
          border-right: 3px solid #333;
          animation: typingDown 3s steps(40, end), blink 0.8s step-end infinite;
        }
        .typing-line {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #333;
          animation: typingShort 2.5s steps(35, end), blink 0.8s step-end infinite;
        }
        @keyframes typingShort { from { width: 0; } to { width: 100%; } }
        @keyframes blink {
          0%, 50%  { border-color: #333; }
          51%, 100%{ border-color: transparent; }
        }
      `}</style>
    </>
  );
}

function CharacterBubble({ src }) {
  return (
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
        src={src}
        alt="Character"
        style={{
          width: "420px",
          height: "auto",
          animation: "bounce 2s infinite ease-in-out",
          filter: "drop-shadow(3px 3px 8px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
}