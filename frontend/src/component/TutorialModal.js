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
  "/assets/images/toolbox.png",
  "/assets/images/blackboard.png",
  "/assets/images/run.png",
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
     {/* === Tutorial Modal === */}
<Modal
  style={{ position: "fixed", top: "80px" }}
  show={show}
  backdrop="static"
  size="lg"
  className="fun-modal"
>
  <Modal.Header className="fun-header">
    <Modal.Title className="fun-title">
      {slides[slideIndex].title}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body
    key={slideIndex}
    className="fun-body"
  >
    <div className="typing-container">
      <p>{slides[slideIndex].text}</p>
    </div>
  </Modal.Body>

  <Modal.Footer className="fun-footer">
    <Button
      className="fun-btn fun-btn-back"
      onClick={handlePrev}
      disabled={slideIndex === 0}
    >
      ← Back
    </Button>
    <Button
      className="fun-btn fun-btn-next"
      onClick={handleNext}
    >
      {isLastSlide ? "Start your journey →" : "Next →"}
    </Button>
  </Modal.Footer>
</Modal>

{/* === Styling + Animation === */}
<style>{`
  /* 🎨 Fun modal theme */
  .fun-modal .modal-content {
    border-radius: 25px;
    border: 4px solid #FFD580;
    background: linear-gradient(180deg, #FFF7E5 0%, #FFF0D5 100%);
    box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
    font-family: 'Comic Sans MS', cursive;
    transition: all 0.3s ease-in-out;
    overflow: hidden;
  }

  .fun-header {
    background: linear-gradient(90deg, #FFB6C1, #FFD580);
    border-bottom: none;
    border-radius: 25px 25px 0 0;
    padding: 1rem 1.5rem;
  }

  .fun-title {
    font-size: 1.6rem;
    color: #4A2E05;
    text-shadow: 1px 1px 0px #FFF;
  }

  .fun-body {
    background-color: #FFF8F2;
    color: #5A3D1E;
    font-size: 1.1rem;
    padding: 2rem;
    border-top: 3px dashed #FFD580;
    border-bottom: 3px dashed #FFD580;
    animation: fadeIn 0.8s ease-in;
  }

  .fun-footer {
    background: #FFF3CD;
    border-top: 3px solid #FFD580;
    border-radius: 0 0 25px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
  }

  /* 🎈 Buttons */
  .fun-btn {
    border: none;
    font-size: 1.1rem;
    font-weight: bold;
    padding: 0.7rem 1.5rem;
    border-radius: 50px;
    transition: transform 0.2s, background-color 0.3s;
  }

 .fun-btn-back {
  background-color: #FFD580 !important; /* yellow-brown base */
  color: #5A3D1E !important;
  border: none !important;
  box-shadow: none !important;
  transition: transform 0.2s, background-color 0.3s !important;
}

.fun-btn-back:hover {
  background-color:#ffab02 !important; /* light blue on hover */
  color: #fff !important;
  transform: scale(1.08);
}

.fun-btn-back:focus,
.fun-btn-back:active {
  background-color: #FFD580 !important; /* keep yellow-brown when focused or active */
  color: #5A3D1E !important;
  outline: none !important;
  box-shadow: none !important;
}

  .fun-btn-next {
    background-color: #FFB6C1;
    color: #4A2E05;
  }

  .fun-btn:hover {
    transform: scale(1.08);
    filter: brightness(1.05);
    background-color:rgb(248, 42, 128);
  }

  /* ✨ Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  /* Typing effect stays */
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


      {show && (() => {
  // Default values
  let charZIndex = zIndexConfig.modal;
  let charWidth = 420;
  let charLeft = 20;
  let charTop = 0;

  // 🧩 Group-based full control
  if (homeImages.includes(currentImage)) {
    // 🏠 Home images (2 images)
    charZIndex = zIndexConfig.modal;

    if (currentImage === "/assets/images/cheerful.png") {
      // cheerful.png
      charWidth = 400;
      charLeft = 5;
      charTop = 50;
    } else if (currentImage === "/assets/images/confident.png") {
      // confident.png
      charWidth = 600;
      charLeft = -60;
      charTop = 200;
    }

  } else if (lessonImages.includes(currentImage)) {
    // 📘 Lesson images
    charZIndex = zIndexConfig.modal;
    charWidth = 900;
    charLeft = -300;
    charTop = 50;

  } else if (moduleImages.includes(currentImage)) {
    // 📦 Module images
    charZIndex = zIndexConfig.modal;
    charWidth = 900;
    charLeft = -320;
    charTop = 60;

 
  } else {
    // 🎨 Other slides (Whiteboard, Code area, etc.)
    switch (slideIndex) {
      case 0: // Intro
        charZIndex = zIndexConfig.modal;
        charWidth = 900;
        charLeft = -275;
        charTop = 90;
        break;
      case 1: // Toolbox
        charZIndex = zIndexConfig.elementsPanel + 20;
        charWidth = 300;
        charLeft = 70;
        charTop = -7;
        break;
      case 2: // Whiteboard
        charZIndex = zIndexConfig.whiteboard + 20;
        charWidth = 400;
        charLeft = 20;
        charTop = 50;
        break;
      case 3: // Code area
        charZIndex = zIndexConfig.codeArea;
        charWidth = 390;
        charLeft = -50;
        charTop = 60;
        break;
      default:
        charZIndex = zIndexConfig.modal;
        charWidth = 420;
        charLeft = 20;
        charTop = 0;
        break;
    }
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
          position: "relative",
          top: `${charTop}px`,
          left: `${charLeft}px`,
          width: `${charWidth}px`,
          height: "auto",
          userSelect: "none",
          pointerEvents: "none",
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
