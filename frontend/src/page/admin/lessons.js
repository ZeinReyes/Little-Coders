import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteLessonId, setDeleteLessonId] = useState(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/lessons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(res.data);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteLessonId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/lessons/${deleteLessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(lessons.filter((lesson) => lesson._id !== deleteLessonId));
      setShowModal(false);
    } catch (err) {
      console.error("Error deleting lesson:", err);
    }
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between mb-3">
        <div className="input-group w-75">
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search Lesson..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/admin/lessons/add" className="btn btn-success w-25 ms-3">
          Add +
        </Link>
      </div>

      <div className="table-responsive bg-primary p-3 rounded">
        <table className="table table-striped table-bordered bg-white rounded">
          <thead className="table-light">
            <tr>
              <th>ID #</th>
              <th>Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.length > 0 ? (
              filteredLessons.map((lesson, index) => (
                <tr key={lesson._id}>
                  <td>{index + 1}</td>
                  <td>{lesson.title}</td>
                  <td>{lesson.description}</td>
                  <td>
                    <Link
                      to={`/admin/lessons/edit/${lesson._id}`}
                      className="btn btn-sm btn-warning me-1"
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => confirmDelete(lesson._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No lessons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="text-center p-4">
          <div className="mb-3">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
          </div>
          <h5 className="fw-bold">Are you sure?</h5>
          <p className="text-muted">
            This action cannot be undone. The lesson will be permanently removed.
          </p>
          <div className="d-grid gap-2 mt-4">
            <Button variant="danger" size="lg" onClick={handleDelete}>
              Delete Lesson
            </Button>
            <Button
              variant="outline-secondary"
              size="lg"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LessonsList;
