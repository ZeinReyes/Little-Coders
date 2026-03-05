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
 *
 * During each phase only the modal relevant to that phase is rendered.
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
      {/* ══════════════════════════════════════════════════
          Each modal is conditionally rendered only when
          its own show-flag is true, so only the modal
          relevant to the current phase appears at a time.
         ══════════════════════════════════════════════════ */}

      {/* ── Lesson Modal ── */}
      {isLesson && showLessonModal && (
        <Modal
          style={{ position: "fixed", top: "70px" }}
          show={showLessonModal}
          backdrop="static"
          size="lg"
        >
          <Modal.Header className="lmjsx-header-lesson">
            <Modal.Title className="lmjsx-title">
              <span className="lmjsx-spin-star">⭐</span>
              {lesson.title}
              <span className="lmjsx-spin-star">⭐</span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            key={lesson.currentContentIndex}
            className="lmjsx-body-lesson"
          >
            <div className="lmjsx-content-card">
              <div className="typing-container">{renderLessonContent()}</div>
            </div>

          </Modal.Body>

          <Modal.Footer className="lmjsx-footer-lesson d-flex justify-content-between">
            <Button
              className="lmjsx-btn lmjsx-btn-blue"
              onClick={onPreviousContent}
              disabled={lesson.currentContentIndex === 0}
            >
              ◀ Back
            </Button>
            <Button className="lmjsx-btn lmjsx-btn-orange" onClick={onNextContent}>
              {lesson.currentContentIndex >= lesson.contents.length
                ? "🏁 Finish!"
                : "Next ▶"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Activity Intro Modal ── */}
      {showActivityModal && (
        <Modal
          show={showActivityModal}
          style={{ position: "fixed", top: "140px" }}
          backdrop="static"
          size="lg"
        >
          <Modal.Header className="lmjsx-header-activity">
            <Modal.Title className="lmjsx-title">
              <span className="lmjsx-bounce-icon">🎯</span>
              Activity Time!
              <span className="lmjsx-bounce-icon">✏️</span>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="lmjsx-body-activity">
            <div className="lmjsx-speech-bubble">
              <span className="lmjsx-thought-icon">
                {activitySlide === 0 ? "🤔" : "💡"}
              </span>
              <p className="lmjsx-speech-text typing-line">{activityText}</p>
            </div>
            {activitySlide === 0 && (
              <div className="lmjsx-deco-row">
                {["🌟", "📚", "🧠", "📚", "🌟"].map((e, i) => (
                  <span
                    key={i}
                    className="lmjsx-deco-emoji"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="lmjsx-footer-activity">
            <Button className="lmjsx-btn lmjsx-btn-purple" onClick={onActivityNext}>
              {activitySlide === 0 ? "Next ▶" : "Let's Go! 🚀"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Congrats Modal ── */}
      {showCongratsModal && (
        <Modal
          style={{ position: "fixed", top: "40px" }}
          show={showCongratsModal}
          backdrop="static"
          size="lg"
        >
          <Modal.Header className="lmjsx-header-congrats">
            <Modal.Title className="lmjsx-title lmjsx-title-center">
              🎉 Congratulations! 🎉
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="lmjsx-body-congrats">
            <div className="lmjsx-confetti-row">
              {["🎊", "🌈", "⭐", "🎈", "🏆", "🎈", "⭐", "🌈", "🎊"].map(
                (e, i) => (
                  <span
                    key={i}
                    className="lmjsx-confetti"
                    style={{ animationDelay: `${i * 0.13}s` }}
                  >
                    {e}
                  </span>
                )
              )}
            </div>
            <div className="lmjsx-congrats-card">
              <h3 className="lmjsx-congrats-heading">🎉 Well Done!</h3>
              <p className="lmjsx-congrats-text">
                You completed this{" "}
                {lesson?.type === "assessment" ? "assessment" : "activity"}{" "}
                successfully!
              </p>
              {lesson?.isAIReview && lesson?.type === "activity" && (
                <p className="lmjsx-ai-msg lmjsx-ai-activity">
                  🌟 Great job on the review activity! Now let's test what you learned!
                </p>
              )}
              {lesson?.isAIReview && lesson?.type === "assessment" && (
                <p className="lmjsx-ai-msg lmjsx-ai-assessment">
                  🌟 Amazing! You've completed your AI review session! Ready to go back and try again?
                </p>
              )}
            </div>
            <div className="lmjsx-stars-row">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="lmjsx-big-star"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer className="lmjsx-footer-congrats">
            <Button
              className="lmjsx-btn lmjsx-btn-green lmjsx-btn-pulse"
              onClick={onCongratsClose}
            >
              {lesson?.isAIReview && lesson?.type === "activity"
                ? "Continue to Assessment! 📝"
                : lesson?.isAIReview && lesson?.type === "assessment"
                ? "Back to Lesson! 🏠"
                : "Continue 🚀"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Answer Modal ── */}
      {showAnswerModal && (
        <Modal show={showAnswerModal} backdrop="static" size="lg" style={{ top: "100px" }}>
          <Modal.Header className="lmjsx-header-answer">
            <Modal.Title className="lmjsx-title">
              🔍 Correct Answer
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="lmjsx-body-answer">
            <h5 className="lmjsx-answer-section-title">🗂️ Required Data Types:</h5>
            <ul className="lmjsx-answer-list">
              {assessmentAnswer.dataTypesRequired?.map((dt, i) => (
                <li key={i} className="lmjsx-answer-item">
                  <span className="lmjsx-answer-bullet">🔹</span> {dt}
                </li>
              ))}
            </ul>
            {assessmentAnswer.expectedOutput && (
              <>
                <h5 className="lmjsx-answer-section-title">💻 Expected Output:</h5>
                <pre className="lmjsx-answer-pre">
                  {assessmentAnswer.expectedOutput}
                </pre>
              </>
            )}
          </Modal.Body>

          <Modal.Footer className="lmjsx-footer-answer">
            <Button className="lmjsx-btn lmjsx-btn-teal" onClick={onAnswerClose}>
              Continue 👍
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* ── Floating character ── */}
      {(showLessonModal || showActivityModal || showCongratsModal) &&
        lesson?.type !== "assessment" && (
          <CharacterBubble src={characterImg} />
        )}

      {showCongratsModal && lesson?.type === "assessment" && (
        <CharacterBubble src={characterImg} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

        /* ── Shared title ── */
        .lmjsx-title {
          font-family: 'Fredoka One', 'Comic Sans MS', cursive;
          font-size: 1.55rem;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .lmjsx-title-center { justify-content: center; }

        /* ── Shared buttons ── */
        .lmjsx-btn {
          font-family: 'Fredoka One', 'Comic Sans MS', cursive !important;
          font-size: 1.05rem !important;
          border-radius: 50px !important;
          padding: 8px 28px !important;
          border: 3px solid transparent !important;
          box-shadow: 0 5px 0 rgba(0,0,0,0.18) !important;
          color: #fff !important;
          transition: transform 0.1s, box-shadow 0.1s !important;
          cursor: pointer !important;
        }
        .lmjsx-btn:active {
          transform: translateY(3px) !important;
          box-shadow: 0 2px 0 rgba(0,0,0,0.15) !important;
        }
        .lmjsx-btn:disabled {
          background: #dee2e6 !important;
          border-color: #adb5bd !important;
          color: #868e96 !important;
          box-shadow: none !important;
        }
        .lmjsx-btn-orange {
          background: linear-gradient(135deg, #ff6b6b, #ffa94d) !important;
          border-color: #e85d04 !important;
        }
        .lmjsx-btn-blue {
          background: linear-gradient(135deg, #74c0fc, #4dabf7) !important;
          border-color: #228be6 !important;
        }
        .lmjsx-btn-purple {
          background: linear-gradient(135deg, #cc5de8, #f783ac) !important;
          border-color: #ae3ec9 !important;
        }
        .lmjsx-btn-green {
          background: linear-gradient(135deg, #51cf66, #38d9a9) !important;
          border-color: #2f9e44 !important;
        }
        .lmjsx-btn-teal {
          background: linear-gradient(135deg, #20c997, #4dabf7) !important;
          border-color: #0ca678 !important;
        }
        .lmjsx-btn-pulse {
          animation: lmjsxPulse 1.6s ease-in-out infinite !important;
        }
        @keyframes lmjsxPulse {
          0%,100% { box-shadow: 0 5px 0 rgba(0,0,0,0.18); }
          50%      { box-shadow: 0 5px 22px rgba(56,217,169,0.55); }
        }

        /* ── Modal shape ── */
        .modal-content {
          border-radius: 20px !important;
          border: 4px solid #fff !important;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18) !important;
        }

        /* ════ LESSON ════ */
        .lmjsx-header-lesson {
          background: linear-gradient(135deg, #74c0fc 0%, #a9e34b 100%);
          border-bottom: none !important;
          padding: 14px 20px !important;
        }
        .lmjsx-body-lesson {
          max-height: 65vh;
          overflow-y: auto;
          padding: 1.5rem;
          background: #FFF8F2;
          font-family: 'Comic Sans MS', cursive;
        }
        .lmjsx-content-card {
          position: relative;
          background: #fff;
          border: 4px solid #ffa94d;
          border-radius: 18px;
          padding: 20px 18px 16px;
          box-shadow: 5px 5px 0 #ffd8a8;
        }
        .lmjsx-footer-lesson {
          background: #fff9f0 !important;
          border-top: none !important;
          padding: 12px 20px !important;
        }

        /* ════ ACTIVITY ════ */
        .lmjsx-header-activity {
          background: linear-gradient(135deg, #da77f2 0%, #ff8787 100%);
          border-bottom: none !important;
          padding: 14px 20px !important;
        }
        .lmjsx-body-activity {
          max-height: 65vh;
          overflow-y: auto;
          padding: 1.8rem;
          text-align: center;
          background: #fff0f6;
          font-family: 'Comic Sans MS', cursive;
        }
        .lmjsx-speech-bubble {
          position: relative;
          background: #fff;
          border: 4px solid #da77f2;
          border-radius: 22px;
          padding: 22px 24px 18px;
          max-width: 88%;
          margin: 0 auto 24px;
          box-shadow: 5px 5px 0 #f3d9fa;
        }
        .lmjsx-speech-bubble::after {
          content: "";
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 14px 11px 0;
          border-style: solid;
          border-color: #da77f2 transparent transparent;
        }
        .lmjsx-thought-icon {
          font-size: 2.6rem;
          display: block;
          margin-bottom: 10px;
          animation: bounce 1.8s infinite ease-in-out;
        }
        .lmjsx-speech-text {
          font-size: 1.1rem;
          color: #5f3dc4;
          font-weight: bold;
          margin: 0;
        }
        .lmjsx-deco-row {
          display: flex;
          justify-content: center;
          gap: 16px;
          font-size: 1.7rem;
          margin-top: 10px;
        }
        .lmjsx-deco-emoji {
          display: inline-block;
          animation: bounce 2s infinite ease-in-out;
        }
        .lmjsx-footer-activity {
          background: #fff0f6 !important;
          border-top: none !important;
          padding: 12px 20px !important;
          justify-content: flex-end;
        }

        /* ════ CONGRATS ════ */
        .lmjsx-header-congrats {
          background: linear-gradient(135deg, #ffd43b 0%, #ff6b6b 100%);
          border-bottom: none !important;
          padding: 14px 20px !important;
        }
        .lmjsx-body-congrats {
          max-height: 65vh;
          overflow-y: auto;
          padding: 1.5rem;
          text-align: center;
          background: #fffbe6;
          font-family: 'Comic Sans MS', cursive;
        }
        .lmjsx-confetti-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 1.8rem;
          margin-bottom: 16px;
        }
        .lmjsx-confetti {
          display: inline-block;
          animation: lmjsxConfetti 1.2s ease-in-out infinite alternate;
        }
        @keyframes lmjsxConfetti {
          from { transform: translateY(0) rotate(-10deg); }
          to   { transform: translateY(-13px) rotate(10deg); }
        }
        .lmjsx-congrats-card {
          background: #fff;
          border: 4px solid #ffd43b;
          border-radius: 20px;
          padding: 20px 24px;
          max-width: 88%;
          margin: 0 auto 16px;
          box-shadow: 5px 5px 0 #ffe066;
        }
        .lmjsx-congrats-heading {
          font-family: 'Fredoka One', 'Comic Sans MS', cursive;
          font-size: 1.8rem;
          color: #e67700;
          margin-bottom: 8px;
        }
        .lmjsx-congrats-text { font-size: 1.05rem; color: #5c5c5c; margin: 0 0 6px; }
        .lmjsx-ai-msg {
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: bold;
          margin-top: 10px;
          font-size: 0.97rem;
        }
        .lmjsx-ai-activity  { background: #e7f5ff; color: #1971c2; border: 2px dashed #74c0fc; }
        .lmjsx-ai-assessment{ background: #ebfbee; color: #2f9e44; border: 2px dashed #69db7c; }
        .lmjsx-stars-row {
          display: flex;
          justify-content: center;
          gap: 14px;
          font-size: 2.2rem;
        }
        .lmjsx-big-star {
          display: inline-block;
          animation: lmjsxStarPop 0.9s ease-in-out infinite alternate;
        }
        @keyframes lmjsxStarPop {
          from { transform: scale(1) rotate(-12deg); }
          to   { transform: scale(1.35) rotate(12deg); }
        }
        .lmjsx-footer-congrats {
          background: #fffbe6 !important;
          border-top: none !important;
          padding: 12px 20px !important;
          justify-content: flex-end;
        }

        /* ════ ANSWER ════ */
        .lmjsx-header-answer {
          background: linear-gradient(135deg, #63e6be 0%, #74c0fc 100%);
          border-bottom: none !important;
          padding: 14px 20px !important;
        }
        .lmjsx-body-answer {
          max-height: 65vh;
          overflow-y: auto;
          padding: 1.5rem;
          text-align: center;
          background: #f0fff4;
          font-family: 'Comic Sans MS', cursive;
        }
        .lmjsx-answer-section-title {
          font-family: 'Fredoka One', 'Comic Sans MS', cursive;
          font-size: 1.15rem;
          color: #087f5b;
          margin-bottom: 10px;
        }
        .lmjsx-answer-list {
          list-style: none;
          padding: 0;
          display: inline-block;
          text-align: left;
          margin-bottom: 14px;
        }
        .lmjsx-answer-item {
          font-size: 1rem;
          padding: 6px 14px;
          margin-bottom: 6px;
          background: #fff;
          border: 2px solid #63e6be;
          border-radius: 30px;
          box-shadow: 2px 2px 0 #b2f2e0;
        }
        .lmjsx-answer-pre {
          background: #fff;
          border: 3px dashed #63e6be;
          border-radius: 14px;
          padding: 14px;
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
          color: #087f5b;
          text-align: left;
          box-shadow: 3px 3px 0 #b2f2e0;
        }
        .lmjsx-footer-answer {
          background: #f0fff4 !important;
          border-top: none !important;
          padding: 12px 20px !important;
          justify-content: flex-end;
        }

        /* ── Decorative icons & bounce ── */
        .lmjsx-spin-star {
          display: inline-block;
          animation: lmjsxSpinStar 3s linear infinite;
        }
        @keyframes lmjsxSpinStar {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .lmjsx-bounce-icon {
          display: inline-block;
          animation: bounce 1.5s infinite ease-in-out;
        }

        /* ── Typing animations (kept from original) ── */
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
          animation: typingDown 1.2s steps(40, end), blink 0.8s step-end infinite;
        }
        .typing-line {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid #333;
          animation: typingShort 1s steps(35, end), blink 0.8s step-end infinite;
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