import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spinner, Card, Collapse, Form, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PencilSquare } from "react-bootstrap-icons";

const API_BASE = "http://localhost:5000/api/assessments";
const LESSON_API = "http://localhost:5000/api/lessons";

const ManageAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
    fetchAssessments();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await axios.get(LESSON_API);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLessons(data);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setLessons([]);
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setAssessments(data);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentsForLesson = (lessonId) => {
    return assessments.filter(
      (a) => a.lessonId?._id === lessonId || a.lessonId === lessonId
    );
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Form.Control
          type="text"
          placeholder="🔍 Search Lesson..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            maxWidth: "600px",
            flexGrow: 1,
            marginRight: "10px",
          }}
        />
        <Button
          variant="primary" // <-- changed from "success" to "primary"
          onClick={() => navigate("/admin/add-assessment")}
          className="px-4 py-2"
          style={{ fontWeight: "500", fontSize: "16px" }}
>
          + Add Assessment
          </Button>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p className="mt-2">Loading Question Bank...</p>
        </div>
      ) : (
        filteredLessons.map((lesson, index) => (
          <Card
            key={lesson._id}
            className="mb-3 border-0 shadow-sm rounded-3 overflow-hidden"
          >
            {/* Lesson Header */}
            <Card.Header
              onClick={() =>
                setExpandedLesson(expandedLesson === index ? null : index)
              }
              aria-controls={`collapse-${index}`}
              aria-expanded={expandedLesson === index}
              className="d-flex justify-content-between align-items-center bg-white border py-3 px-4"
style={{ cursor: "pointer", color: "#333", fontWeight: "600" }}

             
            >
              <strong>{lesson.title}</strong>
            </Card.Header>

            {/* Collapsible Body */}
            <Collapse in={expandedLesson === index}>
              <div id={`collapse-${index}`}>
                <Card.Body className="bg-light">
                  <h6 className="text-secondary fw-bold mb-2">Question Bank</h6>
                  <hr className="mt-1 mb-3" />

                  {getAssessmentsForLesson(lesson._id).length > 0 ? (
                    getAssessmentsForLesson(lesson._id).map((a) => (
                      <div key={a._id} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold text-dark">
                            Assessment ID: {a._id}
                          </h6>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/edit-assessment/${a.id}`)
                            }
                          >
                            <PencilSquare size={16} className="me-1" />
                            Edit Assessment
                          </Button>
                        </div>

                        {a.questions && a.questions.length > 0 ? (
                          a.questions.map((q, qIndex) => (
                            <div
                              key={`${a._id}-${qIndex}`}
                              className="d-flex justify-content-between align-items-center bg-white p-3 mb-2 rounded border"
                            >
                              <div>
                                <strong>
                                  {q.instructions
                                    ? q.instructions.slice(0, 80)
                                    : "Untitled Question"}
                                </strong>
                              </div>
                              <Badge
                                bg={
                                  q.difficulty?.toLowerCase() === "easy"
                                    ? "success"
                                    : q.difficulty?.toLowerCase() === "medium"
                                    ? "warning"
                                    : "danger"
                                }
                              >
                                {q.difficulty || "N/A"}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">
                            No questions available for this assessment.
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No questions yet.</p>
                  )}
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        ))
      )}
    </div>
  );
};

export default ManageAssessment;
