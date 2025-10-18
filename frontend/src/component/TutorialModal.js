import React, { useState, useEffect, useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext";

function TutorialModal({ show, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useContext(AuthContext);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  const API_BASE_URL = "http://localhost:5000/api";

  // 🧭 Slides for each route
  useEffect(() => {
    let routeSlides = [];

    if (location.pathname === "/home") {
      routeSlides = [
        {
          title: "Welcome to your coding journey!",
          text: "Welcome to our coding adventure! This is where you’ll start exploring coding concepts through fun, interactive, drag-and-drop lessons.",
          expression: "😊 Cheerful and welcoming",
        },
        {
          title: "Learn by doing!",
          text: "You’ll go through lessons that guide you step by step. Each one helps you build something cool and learn new coding ideas along the way!",
          expression: "😄 Motivated and confident",
        },
      ];
    } else if (location.pathname === "/module-list") {
      routeSlides = [
        {
          title: "Your learning modules!",
          text: "Lessons are grouped into modules, each focused on topics like logic, loops, or events. Finish a module to unlock more coding adventures!",
          expression: "🧐 Curious and encouraging",
        },
      ];
    } else if (location.pathname.match(/^\/lessons\/[^/]+$/)) {
      routeSlides = [
        {
          title: "Inside each module!",
          text: "Each module has several lessons that teach you something new. Every lesson has an activity in the coding area — and at the end, there’s an assessment to show what you’ve learned!",
          expression: "🤓 Teaching mode",
        },
      ];
    } else if (
      location.pathname === "/dragboard" ||
      location.pathname.match(/^\/lessons\/[^/]+\/[^/]+$/)
    ) {
      routeSlides = [
        {
          title: "Welcome to the coding area!",
          text: "This is your coding space! Here, you’ll drag, drop, and connect code blocks to bring your ideas to life.",
          expression: "😁 Excited and welcoming",
        },
        {
          title: "The toolbox",
          text: "On the left is your toolbox — full of code blocks you can use to build your program. Drag them into the whiteboard to start coding!",
          expression: "💪 Confident and focused",
        },
        {
          title: "The whiteboard",
          text: "The whiteboard is your workspace. Snap blocks together like puzzle pieces to make your code flow and tell the computer what to do.",
          expression: "🧠 Focused and thoughtful",
        },
        {
          title: "Run your creation!",
          text: "When you’re ready, press the buttons on the right to run, stop, or reset your program. Watch your logic come to life — and experiment freely!",
          expression: "😎 Proud and enthusiastic",
        },
      ];
    }

    setSlides(routeSlides);
    setSlideIndex(0);
  }, [location.pathname]);

  const handleNext = async () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      // Move through tutorial sequence
      if (location.pathname === "/home") {
        navigate("/module-list");
      } else if (location.pathname === "/module-list") {
        navigate("/lessons/68ef18b82d22697e38be5299");
      } else if (location.pathname.match(/^\/lessons\/[^/]+$/)) {
        navigate("/dragboard");
        setSlideIndex(0); // Reset slides for IDE
        return; // Keep modal open
      } else {
        // ✅ Last slide: mark onboarding complete
        try {
          if (user?._id) {
            await axios.patch(`${API_BASE_URL}/users/${user._id}/complete-onboarding`);
            if (refreshUser) await refreshUser(user._id);
          }
        } catch (err) {
          console.error("Failed to update onboarding:", err);
        }
        onClose();
        navigate ('/home')
      }
    }
  };

  const handlePrev = () => {
    if (slideIndex > 0) setSlideIndex((prev) => prev - 1);
  };

  if (!slides.length) return null;

  const isLastSlide =
    slideIndex === slides.length - 1 &&
    (location.pathname === "/dragboard" ||
      location.pathname.match(/^\/lessons\/[^/]+\/[^/]+$/));

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{slides[slideIndex].title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          {slides[slideIndex].text}
        </div>
        <div style={{ fontStyle: "italic", opacity: 0.7 }}>
          Character: {slides[slideIndex].expression}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={slideIndex === 0}
        >
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          {isLastSlide ? "Start your journey" : "Next"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TutorialModal;
