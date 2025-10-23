import React, { useState, useEffect, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext";

// --- Character images ---
const homeImages = [
  "/assets/images/cheerful.png",
  "/assets/images/confident.png",
];
const moduleImages = ["/assets/images/curios.png"];
const lessonImages = ["/assets/images/teaching.png"];
const dragboardImages = [
  "/assets/images/excited.png",
  "/assets/images/focus.png",
  "/assets/images/activity1.png",
  "/assets/images/dragboard3.png",
];

function TutorialModal({ show, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useContext(AuthContext);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [imagePool, setImagePool] = useState([]);

  const API_BASE_URL = "http://localhost:5000/api";

  // 🔹 Slide-based z-index config
  const zIndexConfig = {
    modal: 2000,
    backdrop: 1200,
    elementsPanel: 1600,
    whiteboard: 1700,
    codeArea: 1800,
  };

  // 🧭 Slides per route
  useEffect(() => {
    let routeSlides = [];
    let images = [];

    if (location.pathname === "/home") {
      routeSlides = [
        {
          title: "Welcome to your coding journey!",
          text: "Welcome to our coding adventure! This is where you’ll start exploring coding concepts through fun, interactive, drag-and-drop lessons.",
        },
        {
          title: "Learn by doing!",
          text: "You’ll go through lessons that guide you step by step. Each one helps you build something cool and learn new coding ideas along the way!",
        },
      ];
      images = homeImages;
    } else if (location.pathname === "/module-list") {
      routeSlides = [
        {
          title: "Your learning modules!",
          text: "Lessons are grouped into modules, each focused on topics like logic, loops, or events. Finish a module to unlock more coding adventures!",
        },
      ];
      images = moduleImages;
    } else if (location.pathname.match(/^\/lessons\/[^/]+$/)) {
      routeSlides = [
        {
          title: "Inside each module!",
          text: "Each module has several lessons that teach you something new. Every lesson has an activity in the coding area — and at the end, there’s an assessment to show what you’ve learned!",
        },
      ];
      images = lessonImages;
    } else if (
      location.pathname === "/dragboard" ||
      location.pathname.match(/^\/lessons\/[^/]+\/[^/]+$/)
    ) {
      routeSlides = [
        {
          title: "Welcome to the coding area!",
          text: "This is your coding space! Here, you’ll drag, drop, and connect code blocks to bring your ideas to life.",
        },
        {
          title: "The toolbox",
          text: "On the left is your toolbox — full of code blocks you can use to build your program. Drag them into the whiteboard to start coding!",
        },
        {
          title: "The whiteboard",
          text: "The whiteboard is your workspace. Snap blocks together like puzzle pieces to make your code flow and tell the computer what to do.",
        },
        {
          title: "Run your creation!",
          text: "When you’re ready, press the buttons on the right to run, stop, or reset your program. Watch your logic come to life — and experiment freely!",
        },
      ];
      images = dragboardImages;
    }

    setSlides(routeSlides);
    setImagePool(images);
    setSlideIndex(0);
  }, [location.pathname]);

  // 🔹 Navigation
  const handleNext = async () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      if (location.pathname === "/home") {
        navigate("/module-list");
      } else if (location.pathname === "/module-list") {
        navigate("/lessons/68ef18b82d22697e38be5299");
      } else if (location.pathname.match(/^\/lessons\/[^/]+$/)) {
        navigate("/dragboard");
        setSlideIndex(0);
        return;
      } else {
        try {
          if (user?._id) {
            await axios.patch(`${API_BASE_URL}/users/${user._id}/complete-onboarding`);
            if (refreshUser) await refreshUser(user._id);
          }
        } catch (err) {
          console.error("Failed to update onboarding:", err);
        }
        onClose();
        navigate("/home");
      }
    }
  };

  const handlePrev = () => {
    if (slideIndex > 0) setSlideIndex((prev) => prev - 1);
  };

  const currentImage =
    imagePool[slideIndex] || imagePool[imagePool.length - 1] || "";

  // 🔹 Slide-based z-index handling
  useEffect(() => {
    if (!show) return;

    const elementsPanel = document.getElementById("draggable"); // toolbox
    const whiteboard = document.getElementById("whiteboard");
    const codeArea = document.getElementById("right-panel");
    const modal = document.querySelector(".modal");
    const backdrop = document.querySelector(".modal-backdrop");

    switch (slideIndex) {
      case 0: // Intro slide
        if (modal) modal.style.zIndex = zIndexConfig.modal;
        if (backdrop) backdrop.style.zIndex = zIndexConfig.backdrop;
        if (elementsPanel) elementsPanel.style.zIndex = 0;
        if (whiteboard) whiteboard.style.zIndex = 0;
        if (codeArea) codeArea.style.zIndex = 0;
        break;
      case 1: // Toolbox slide
        if (modal) modal.style.zIndex = zIndexConfig.modal;
        if (backdrop) backdrop.style.zIndex = zIndexConfig.backdrop;
        if (elementsPanel) elementsPanel.style.zIndex = zIndexConfig.elementsPanel;
        if (whiteboard) whiteboard.style.zIndex = 0;
        if (codeArea) codeArea.style.zIndex = 0;
        break;
      case 2: // Whiteboard slide
        if (modal) modal.style.zIndex = zIndexConfig.modal;
        if (backdrop) backdrop.style.zIndex = zIndexConfig.backdrop;
        if (elementsPanel) elementsPanel.style.zIndex = 0;
        if (whiteboard) whiteboard.style.zIndex = zIndexConfig.whiteboard;
        if (codeArea) codeArea.style.zIndex = 0;
        break;
      case 3: // Code area slide
        if (modal) modal.style.zIndex = zIndexConfig.modal;
        if (backdrop) backdrop.style.zIndex = zIndexConfig.backdrop;
        if (elementsPanel) elementsPanel.style.zIndex = 0;
        if (whiteboard) whiteboard.style.zIndex = 0;
        if (codeArea) codeArea.style.zIndex = zIndexConfig.codeArea;  
        break;
      default:
        if (modal) modal.style.zIndex = zIndexConfig.modal;
        if (backdrop) backdrop.style.zIndex = zIndexConfig.backdrop;
        if (elementsPanel) elementsPanel.style.zIndex = 1000;
        if (whiteboard) whiteboard.style.zIndex = 1000;
        if (codeArea) codeArea.style.zIndex = 1500;
        break;
    }

    return () => {
      [modal, backdrop, elementsPanel, whiteboard, codeArea].forEach((el) => {
        if (el) el.style.zIndex = "";
      });
    };
  }, [slideIndex, show]);

  if (!slides.length) return null;

  const isLastSlide =
    slideIndex === slides.length - 1 &&
    (location.pathname === "/dragboard" ||
      location.pathname.match(/^\/lessons\/[^/]+\/[^/]+$/));

  return (
    <div>
      {/* === Tutorial Modal === */}
      <Modal
        style={{ position: "fixed", top: "80px" }}
        show={show}
        backdrop="static"
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>{slides[slideIndex].title}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          key={slideIndex}
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "#FFF8F2",
            fontFamily: "'Comic Sans MS', cursive",
          }}
        >
          <div className="typing-container">
            <p>{slides[slideIndex].text}</p>
          </div>
          <div
            style={{
              fontStyle: "italic",
              opacity: 0.7,
              marginTop: "1rem",
              textAlign: "right",
            }}
          >
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={handlePrev}
            disabled={slideIndex === 0}
          >
            ← Back
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {isLastSlide ? "Start your journey →" : "Next →"}
          </Button>
        </Modal.Footer>
      </Modal>

      {show && (() => {
  // Decide which element is highlighted this slide
  let charZIndex = zIndexConfig.modal; // default on top of modal
  switch(slideIndex) {
    case 0: // Intro
      charZIndex = zIndexConfig.modal;
      break;
    case 1: // Toolbox
      charZIndex = zIndexConfig.elementsPanel + 20;
      break;
    case 2: // Whiteboard
      charZIndex = zIndexConfig.whiteboard;
      break;
    case 3: // Code area
      charZIndex = zIndexConfig.codeArea;
      break;
    default:
      charZIndex = zIndexConfig.modal;
      break;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "20px",
        zIndex: charZIndex,
        display: "flex",
        alignItems: "flex-end",
        flexDirection: "column",
      }}
    >
      <img
        src={currentImage}
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
  );
})()}

      {/* === Styling + Animation === */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .typing-container {
          display: inline-block;
          overflow: hidden;
          white-space: normal;
          border-right: 3px solid #333;
          animation: typingDown 3s steps(40, end), blink 0.8s step-end infinite;
        }

        @keyframes typingDown {
          from { clip-path: inset(0 0 100% 0); }
          to { clip-path: inset(0 0 0 0); }
        }

        @keyframes blink {
          0%, 50% { border-color: #333; }
          51%, 100% { border-color: transparent; }
        }
      `}</style>
    </div>
  );
}

export default TutorialModal;
