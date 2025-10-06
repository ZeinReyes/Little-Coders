// src/pages/LessonList.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Spinner, ListGroup, ProgressBar } from "react-bootstrap";
import { CheckCircleFill, Circle } from "react-bootstrap-icons";

function LessonList() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
        type: "material",
        overview: m.overview || "",
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

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
          style={{
            fontWeight: "bold",
            borderRadius: "20px",
            fontSize: "0.9rem",
          }}
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
          {module.title}
        </div>
      </header>

      <div className="p-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h5
          className="mb-3"
          style={{
            fontFamily: "'Comic Sans MS', cursive",
            color: "#FF6F61",
          }}
        >
          Lessons & Activities
        </h5>

        <ListGroup>
          {items.map((item) => (
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
              onClick={() => navigate(`/ide/${item._id}`)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="d-flex align-items-center">
                {item.type === "material" ? (
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
                  {item.type === "material" ? item.title : item.name}
                </div>
              </div>
              {item.type === "activity" && (
                <Button size="sm" variant="primary">
                  Explore
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}

export default LessonList;
