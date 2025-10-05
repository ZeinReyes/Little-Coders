// src/pages/ModuleList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Spinner, Row, Col } from "react-bootstrap";

function ModuleList() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lessons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModules(res.data);
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-white mb-4">📚 Modules</h3>

      <Row xs={1} md={2} lg={3} className="g-4">
        {modules.map((module) => (
          <Col key={module._id}>
            <Card
              className="shadow-sm h-100"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/lessons/${module._id}`)}
            >
              <Card.Body>
                <Card.Title className="text-primary">{module.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Topic: {module.topic.charAt(0).toUpperCase() + module.topic.slice(1)}
                </Card.Subtitle>
                <Card.Text>{module.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="text-end">
                <Button variant="outline-primary" size="sm">
                  View Lessons →
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ModuleList;
