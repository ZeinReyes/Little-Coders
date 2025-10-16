// src/components/LessonModal.js
import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

// --- Character images (randomized for fun) ---
const lessonImages = [
  "/assets/images/lesson.png",
  "/assets/images/lesson1.png",
];
const activityImages = [
  "/assets/images/activity.png",
  "/assets/images/activity1.png",
];
const congratsImages = [
  "/assets/images/congrats.png",
  "/assets/images/congrats1.png",
  "/assets/images/congrats2.png",
  "/assets/images/congrats3.png",
  "/assets/images/congrats4.png",
];

export default function LessonModal({ lesson, show, onContinueToList }) {
  const [phase, setPhase] = useState("lesson"); // lesson → activity → congrats
  const [currentSlide, setCurrentSlide] = useState(0);
  const [characterImg, setCharacterImg] = useState(
    lessonImages[Math.floor(Math.random() * lessonImages.length)]
  );

  if (!lesson) return null;

  // 🔸 Change phase images when switching modal types
  const updateCharacter = (type) => {
    if (type === "lesson") {
      setCharacterImg(
        lessonImages[Math.floor(Math.random() * lessonImages.length)]
      );
    } else if (type === "activity") {
      setCharacterImg(
        activityImages[Math.floor(Math.random() * activityImages.length)]
      );
    } else {
      setCharacterImg(
        congratsImages[Math.floor(Math.random() * congratsImages.length)]
      );
    }
  };

  // 🔸 Lesson content render
  const renderLessonContent = () => {
    if (lesson.currentContentIndex === 0)
      return <div dangerouslySetInnerHTML={{ __html: lesson.overview }} />;
    const index = lesson.currentContentIndex - 1;
    return (
      <div dangerouslySetInnerHTML={{ __html: lesson.contents[index] || "" }} />
    );
  };

  // 🔸 Activity randomized text
  const thinkingTexts = [
    "So this activity will teach you how to do the topic. How do you think we can solve the problem?",
    "Let's use what we learned! Can you figure out how to solve this activity?",
    "Think about what we discussed earlier — how can we apply it here?",
  ];
  const solvingTexts = [
    "We can use the object to finish the activities (hint). Good luck!",
    "Try applying what we learned — I know you can do it!",
    "Use your skills to complete the challenge. Good luck!",
  ];

  // 🔸 Lesson → Activity → Congrats logic
  const handleNext = () => {
    if (phase === "lesson") {
      if (lesson.currentContentIndex < lesson.contents.length) {
        lesson.currentContentIndex += 1;
      } else {
        setPhase("activity");
        updateCharacter("activity");
        setCurrentSlide(0);
      }
    } else if (phase === "activity") {
      if (currentSlide === 0) {
        setCurrentSlide(1);
      } else {
        setPhase("congrats");
        updateCharacter("congrats");
      }
    } else if (phase === "congrats") {
      onContinueToList(); // Now navigate back AFTER congrats
    }
  };

  // 🔸 Modal title & body based on phase
  const getTitle = () => {
    if (phase === "lesson") return lesson.title;
    if (phase === "activity") return "Activity";
    return "🎉 Congratulations!";
  };

  const getBody = () => {
    if (phase === "lesson") return renderLessonContent();
    if (phase === "activity")
      return (
        <div className="text-center py-3">
          <p>
            {currentSlide === 0
              ? thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)]
              : solvingTexts[Math.floor(Math.random() * solvingTexts.length)]}
          </p>
        </div>
      );
    return (
      <div className="text-center py-4">
        <h3>🎉 Congratulations!</h3>
        <p>You completed this lesson successfully!</p>
      </div>
    );
  };

  // 🔸 Button text based on phase
  const getButtonText = () => {
    if (phase === "lesson") {
      return lesson.currentContentIndex >= lesson.contents.length
        ? "Proceed"
        : "Next →";
    }
    if (phase === "activity" && currentSlide === 0) return "Next →";
    if (phase === "activity" && currentSlide === 1) return "Proceed";
    if (phase === "congrats") return "Continue";
  };

  return (
    <>
      <Modal show={show} backdrop="static" centered size="lg">
        <Modal.Header>
          <Modal.Title>{getTitle()}</Modal.Title>
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
          {getBody()}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-end">
          <Button variant="primary" onClick={handleNext}>
            {getButtonText()}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Character at bottom-left corner */}
      {show && (
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
              width: "120px",
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
      `}</style>
    </>
  );
}
