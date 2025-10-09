import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Alert } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API_BASE = "http://localhost:5000/api/assessments";
const LESSON_API = "http://localhost:5000/api/lessons";

const ManageAssessment = () => {
  const [assessments, setAssessments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");

  // Modals
  const [viewAssessment, setViewAssessment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editForm, setEditForm] = useState({
    _id: "",
    title: "",
    instructions: "",
    hints: [],
    expectedOutput: "",
    difficulty: "Easy",
    lessonId: "",
  });

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch data
  useEffect(() => {
    fetchLessons();
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await axios.get(API_BASE);
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await axios.get(LESSON_API);
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const wordCount = (text) =>
    text ? text.split(/\s+/).filter((w) => w.trim() !== "").length : 0;

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // View
  const handleViewClick = (assessment) => {
    setViewAssessment(assessment);
  };

  // Edit
  const handleEditClick = (assessment) => {
    setEditForm({
      _id: assessment._id || assessment.id,
      title: assessment.title || "",
      instructions: assessment.instructions || "",
      hints: Array.isArray(assessment.hints)
        ? assessment.hints
        : (assessment.hints || "")
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean),
      expectedOutput: assessment.expectedOutput || "",
      difficulty: assessment.difficulty || "Easy",
      lessonId: assessment.lessonId?._id || assessment.lessonId || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateAssessment = async () => {
    const { _id, id, title, instructions, hints, expectedOutput, difficulty, lessonId } =
      editForm;
    const assessmentId = _id || id;

    if (!assessmentId) return;
    if (!title || !instructions || !expectedOutput || !lessonId) return;

    const normalizedDifficulty = (() => {
      if (!difficulty) return "Easy";
      const d = String(difficulty).trim();
      const map = { easy: "Easy", medium: "Medium", hard: "Hard" };
      return map[d.toLowerCase()] || d;
    })();

    const hintsArray = Array.isArray(hints)
      ? hints
      : hints.split(",").map((h) => h.trim()).filter(Boolean);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const payload = {
        title,
        instructions,
        hints: hintsArray,
        expectedOutput,
        difficulty: normalizedDifficulty,
        lessonId,
      };

      const res = await axios.put(`${API_BASE}/${assessmentId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const updated = res.data?.data || res.data;
      const updatedId = updated._id || updated.id;

      setAssessments((prev) =>
        prev.map((a) =>
          (a._id || a.id) === updatedId ? { ...a, ...updated } : a
        )
      );

      // ✅ Removed alert — just close modal silently
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating assessment:", err);
    }
  };

  // Delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found.");

      await axios.delete(`${API_BASE}/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssessments((prev) =>
        prev.filter((a) => (a._id || a.id) !== deleteId)
      );

      // ✅ Removed alert — just close modal silently
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      setDeleteError(error.response?.data?.message || error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAssessments =
    assessments?.filter((a) =>
      a.title?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div
      className="container mt-5 p-4"
      style={{
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <h3 className="mb-4 text-center fw-bold text-primary">Manage Assessments</h3>

      <Form.Control
        type="text"
        placeholder="Search assessments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />

      <Table bordered hover responsive>
        <thead style={{ backgroundColor: "#f8f9fa" }}>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Difficulty</th>
            <th>Lesson</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((a, index) => (
              <tr key={a._id || a.id}>
                <td>{index + 1}</td>
                <td>{a.title}</td>
                <td>{a.difficulty}</td>
                <td>{a.lessonId?.title || "N/A"}</td>
                <td className="text-center">
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleViewClick(a)}
                  >
                    View
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditClick(a)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(a._id || a.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No assessments found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* 🧾 View Modal */}
      <Modal show={!!viewAssessment} onHide={() => setViewAssessment(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>View Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewAssessment ? (
            <>
              <p><strong>Title:</strong> {viewAssessment.title}</p>
              <p><strong>Instructions:</strong> {viewAssessment.instructions}</p>
              <p><strong>Hints:</strong> {(viewAssessment.hints || []).join(", ")}</p>
              <p><strong>Expected Output:</strong> {viewAssessment.expectedOutput}</p>
              <p><strong>Difficulty:</strong> {viewAssessment.difficulty}</p>
              <p><strong>Lesson:</strong> {viewAssessment.lessonId?.title || "N/A"}</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewAssessment(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✏️ Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label><strong>Title</strong></Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Lesson</strong></Form.Label>
              <Form.Select
                name="lessonId"
                value={editForm.lessonId}
                onChange={handleInputChange}
              >
                <option value="">Select a lesson</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Instructions</strong></Form.Label>
              <ReactQuill
                theme="snow"
                value={editForm.instructions}
                onChange={(value) => handleEditorChange("instructions", value)}
              />
              <small className="text-muted">
                Word count: {wordCount(editForm.instructions)}/70
              </small>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Hints (comma-separated)</strong></Form.Label>
              <Form.Control
                as="textarea"
                name="hints"
                rows={2}
                value={Array.isArray(editForm.hints) ? editForm.hints.join(", ") : editForm.hints}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    hints: e.target.value.split(",").map((h) => h.trim()).filter(Boolean),
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Expected Output</strong></Form.Label>
              <Form.Control
                type="text"
                name="expectedOutput"
                value={editForm.expectedOutput}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label><strong>Difficulty</strong></Form.Label>
              <Form.Select
                name="difficulty"
                value={editForm.difficulty}
                onChange={handleInputChange}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateAssessment}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🗑 Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this assessment?</p>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAssessment;
