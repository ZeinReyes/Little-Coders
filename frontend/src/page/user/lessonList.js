// src/pages/LessonList.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Spinner, ListGroup } from "react-bootstrap";
import { CheckCircleFill, Circle } from "react-bootstrap-icons";

function LessonList() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [items, setItems] = useState([]); // combined lessons + activities
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [moduleId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [materialsRes, activitiesRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/materials/lessons/${moduleId}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:5000/api/activities/lessons/${moduleId}/activities`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

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
      console.error("Error fetching lessons/activities:", err);
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
    <div className="p-4">
      <Button
        variant="outline-light"
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      {module && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title className="text-primary">{module.title}</Card.Title>
            <Card.Text>{module.description}</Card.Text>
          </Card.Body>
        </Card>
      )}

      <h5 className="text-white mb-3">Lessons & Activities</h5>

      <ListGroup>
        {items.map((item) => (
          <ListGroup.Item
  key={item._id}
  className="d-flex align-items-center"
  style={{
    backgroundColor: item.type === "activity" ? "#f8f9fa" : "white",
    marginLeft: item.type === "activity" ? "2rem" : 0,
    cursor: "pointer",
  }}
  onClick={() => navigate(`/ide/${item._id}`)}   // <-- navigate to IDE
>
  {item.type === "material" ? (
    <>
      <CheckCircleFill color="green" className="me-2" />
      {item.title}
    </>
  ) : (
    <>
      <Circle color="gray" className="me-2" />
      {item.name}
    </>
  )}
</ListGroup.Item>

        ))}
      </ListGroup>
    </div>
  );
}

export default LessonList;
