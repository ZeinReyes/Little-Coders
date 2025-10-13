// src/pages/LessonList.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, ListGroup } from "react-bootstrap";
import { CheckCircleFill, Circle } from "react-bootstrap-icons";
import { AuthContext } from "../../context/authContext";

function LessonList() {
  const { lessonId } = useParams();
  const [module, setModule] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [lessonId, user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = user?.id;

      if (!userId) {
        console.warn("⚠️ No user ID found — skipping progress fetch");
        return;
      }

      // ✅ Fetch lessons, activities, assessments, and progress in parallel
      const [moduleRes, materialsRes, activitiesRes, assessmentsRes, progressRes] =
        await Promise.all([
          axios.get(`http://localhost:5000/api/lessons/${lessonId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:5000/api/materials/lessons/${lessonId}/materials`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:5000/api/activities/lessons/${lessonId}/activities`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:5000/api/assessments/lessons/${lessonId}/assessments`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:5000/api/progress/${userId}/${lessonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

      setModule(moduleRes.data);
      const progress = progressRes.data || {};

      // ✅ Completed item IDs
      const completedMaterialIds = progress.completedMaterials?.map((m) => m._id) || [];
      const completedActivityIds = progress.completedActivities?.map((a) => a._id) || [];
      const completedAssessmentIds = progress.completedAssessments?.map((a) => a._id) || [];

      // ✅ Add completion state + type
      const materials = materialsRes.data.map((m) => ({
        ...m,
        type: "lesson",
        isCompleted: completedMaterialIds.includes(m._id),
      }));

      const activities = activitiesRes.data.map((a) => ({
        ...a,
        type: "activity",
        isCompleted: completedActivityIds.includes(a._id),
      }));

      const assessments = assessmentsRes.data.map((a) => ({
        ...a,
        type: "assessment",
        isCompleted: completedAssessmentIds.includes(a._id),
      }));

      // ✅ Merge and sort by order or creation date
      const merged = [...materials, ...activities, ...assessments].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          new Date(a.createdAt) - new Date(b.createdAt)
      );

      setItems(merged);
    } catch (err) {
      console.error("❌ Error fetching lesson data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    navigate(`/lessons/${lessonId}/${item._id || item.id}`);
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
      {/* HEADER */}
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
          {module?.title}
        </div>
      </header>

      {/* LESSONS, ACTIVITIES & ASSESSMENTS */}
      <div className="p-4" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h5
          className="mb-3"
          style={{
            fontFamily: "'Comic Sans MS', cursive",
            color: "#FF6F61",
          }}
        >
          Lessons, Activities & Assessments
        </h5>

        <ListGroup>
          {items.map((item) => (
            <ListGroup.Item
              key={item._id}
              className="d-flex align-items-center justify-content-between shadow-sm mb-2 rounded-3"
              style={{
                backgroundColor:
                  item.type === "activity"
                    ? "#E0F7FA"
                    : item.type === "assessment"
                    ? "#E8F5E9"
                    : "#FFF3E0",
                cursor: "pointer",
                padding: "0.8rem 1rem",
                transition: "transform 0.2s",
              }}
              onClick={() => handleItemClick(item)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
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
                    ? `Activity: ${item.name}`
                    : item.type === "assessment"
                    ? `Assessment: ${item.title}`
                    : `Lesson: ${item.title}`}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}

export default LessonList;
