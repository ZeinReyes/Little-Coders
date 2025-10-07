// src/pages/LessonList.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, ListGroup, Modal } from "react-bootstrap";
import { CheckCircleFill, Circle } from "react-bootstrap-icons";

function LessonList() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [moduleRes, materialsRes, activitiesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/lessons/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          `http://localhost:5000/api/materials/lessons/${moduleId}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:5000/api/activities/lessons/${moduleId}/activities`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      setModule(moduleRes.data);

      const materials = materialsRes.data.map((m) => ({
        ...m,
        type: "lesson",
        overview: m.overview || "",
        currentContentIndex: 0,
      }));

      const activities = activitiesRes.data.map((a) => ({
        ...a,
        type: "activity",
      }));

      const merged = [...materials, ...activities].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          new Date(a.createdAt) - new Date(b.createdAt)
      );

      setItems(merged);
    } catch (err) {
      console.error("Error fetching module data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (index) => setSelectedIndex(index);
  const handleClose = () => setSelectedIndex(null);

  const handleNextLesson = () => {
    if (selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else {
      setSelectedIndex(null);
    }
  };

  const handlePrevLesson = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNextContent = () => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === selectedIndex && item.type === "lesson") {
          const nextIndex = (item.currentContentIndex || 0) + 1;
          if (nextIndex > (item.contents?.length || 0)) {
            handleNextLesson();
          }
          return { ...item, currentContentIndex: nextIndex };
        }
        return item;
      })
    );
  };

  const handlePrevContent = () => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === selectedIndex
          ? {
              ...item,
              currentContentIndex: Math.max(
                0,
                (item.currentContentIndex || 0) - 1
              ),
            }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const currentLesson = selectedIndex !== null ? items[selectedIndex] : null;
  const contentIndex = currentLesson?.currentContentIndex || 0;
  const isOverview = contentIndex === 0;
  const totalContents = currentLesson?.contents?.length || 0;
  const isLastContent = contentIndex === totalContents;

  const displayContent =
    currentLesson?.type === "lesson"
      ? isOverview
        ? currentLesson.overview
        : currentLesson.contents?.[contentIndex - 1] || ""
      : "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0" }}>
      <header
        className="d-flex align-items-center justify-content-between"
        style={{
          backgroundColor: "#3C90E2",
          color: "white",
          padding: "1rem 2rem",
          fontFamily: "'Comic Sans MS', cursive",
          boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
        }}
      >
        <Button
          variant="light"
          onClick={() => navigate(-1)}
          style={{ fontWeight: "bold", borderRadius: "20px", fontSize: "0.9rem" }}
        >
          ← Back
        </Button>
        <div
          style={{
            flexGrow: 1,
            textAlign: "center",
            fontSize: "1.6rem",
            fontWeight: "bold",
          }}
        >
          {module?.title}
        </div>
      </header>

      <div className="p-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h5
          className="mb-3"
          style={{ fontFamily: "'Comic Sans MS', cursive", color: "#FF6F61" }}
        >
          Lessons & Activities
        </h5>

        <ListGroup>
          {items.map((item, index) => (
            <ListGroup.Item
              key={item._id}
              className="d-flex align-items-center justify-content-between shadow-sm mb-2 rounded-3"
              style={{
                backgroundColor:
                  item.type === "activity" ? "#E0F7FA" : "#FFF3E0",
                cursor: "pointer",
                padding: "0.8rem 1rem",
                transition: "transform 0.2s",
              }}
              onClick={() => handleLessonClick(index)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="d-flex align-items-center">
                {item.isCompleted ? (
                  <CheckCircleFill color="#4CAF50" className="me-3" size={24} />
                ) : (
                  <Circle color="#9E9E9E" className="me-3" size={24} />
                )}
                <div
                  style={{
                    fontFamily: "'Comic Sans MS', cursive",
                    fontSize: "1rem",
                  }}
                >
                  {item.type === "activity"
                    ? `Act: ${item.name}`
                    : `Lesson: ${item.title}`}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>

      {/* Modal Section */}
      {currentLesson && (
        <Modal show onHide={handleClose} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {currentLesson.type === "activity"
                ? `Activity: ${currentLesson.name}`
                : currentLesson.title}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{
              maxHeight: "65vh",
              overflowY: "auto",
              padding: "1.5rem",
              backgroundColor: "#FAFAFA",
              borderRadius: "10px",
            }}
          >
            {currentLesson.type === "lesson" ? (
              <div
                style={{
                  fontFamily: "'Comic Sans MS', cursive",
                  fontSize: "1.05rem",
                  lineHeight: "1.6",
                }}
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
            ) : (
              <div style={{ fontFamily: "'Comic Sans MS', cursive" }}>
                <h5 style={{ color: "#00796B" }}>Instructions</h5>
                <p
                  dangerouslySetInnerHTML={{
                    __html: currentLesson.instructions,
                  }}
                />

                {currentLesson.hints?.length > 0 && (
                  <>
                    <h6 style={{ color: "#0288D1" }}>Hints:</h6>
                    <ul>
                      {currentLesson.hints.map((hint, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: hint }} />
                      ))}
                    </ul>
                  </>
                )}

                {currentLesson.expectedOutput && (
                  <>
                    <h6 style={{ color: "#E65100" }}>Expected Output:</h6>
                    <pre
                      style={{
                        backgroundColor: "#f4f4f4",
                        padding: "10px",
                        borderRadius: "8px",
                      }}
                    >
                      {currentLesson.expectedOutput}
                    </pre>
                  </>
                )}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between">
  <Button
    variant="secondary"
    onClick={
      currentLesson.type === "lesson"
        ? handlePrevContent
        : handlePrevLesson
    }
    disabled={selectedIndex === 0 && isOverview}
  >
    ← Previous
  </Button>

  <Button
    variant="primary"
    onClick={
      currentLesson.type === "lesson"
        ? isLastContent
          ? handleNextLesson // ✅ move to next item after finishing lesson
          : handleNextContent
        : handleNextLesson
    }
  >
    {currentLesson.type === "lesson"
      ? isLastContent
        ? selectedIndex === items.length - 1
          ? "Finish Module" // ✅ last lesson of module
          : "Finish Lesson" // ✅ last content of lesson
        : "Next →"
      : selectedIndex === items.length - 1
        ? "Finish Module" // ✅ last activity
        : "Finish →"}
  </Button>
</Modal.Footer>

        </Modal>
      )}
    </div>
  );
}

export default LessonList;
