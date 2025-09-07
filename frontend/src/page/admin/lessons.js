import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLessonId, setDeleteLessonId] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonContents, setLessonContents] = useState([]);

  const navigate = useNavigate();

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
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/lessons/${deleteLessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLessons(lessons.filter((lesson) => lesson._id !== deleteLessonId));
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting lesson:", err);
    }
  };

  const handleView = async (lesson) => {
    setSelectedLesson(lesson);

    try {
      const token = localStorage.getItem("token");
      const [materialsRes, activitiesRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/materials/lessons/${lesson._id}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:5000/api/activities/lessons/${lesson._id}/activities`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const merged = [
        ...materialsRes.data.map((m) => ({ ...m, type: "material" })),
        ...activitiesRes.data.map((a) => ({ ...a, type: "activity" })),
      ].sort(
        (a, b) => a.order - b.order || new Date(a.createdAt) - new Date(b.createdAt)
      );

      setLessonContents(merged);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching lesson details:", err);
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
              <th>Topics</th>
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
                    {Object.entries(lesson.topics)
                      .filter(([_, val]) => val)
                      .map(([key]) => key)
                      .join(", ") || "None"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info me-1"
                      onClick={() => handleView(lesson)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-warning me-1"
                      onClick={() =>
                        navigate(`/admin/lessons/edit/${lesson._id}`)
                      }
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
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
                <td colSpan="5" className="text-center">
                  No lessons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
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
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
        centered
      >
        {selectedLesson && (
          <>
            <Modal.Header closeButton className="bg-primary text-white">
              <Modal.Title>
                <i className="bi bi-journal-text me-2"></i>
                {selectedLesson.title}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
              <div className="mb-4">
                <h6 className="text-uppercase text-muted fw-bold mb-2">Description</h6>
                <p className="mb-0">{selectedLesson.description}</p>
              </div>

              <div>
                <h6 className="text-uppercase text-muted fw-bold mb-3">
                  Lesson Contents
                </h6>

                {lessonContents.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {lessonContents.map((item, idx) => (
                      <div
                        key={item._id}
                        className="list-group-item border rounded mb-3 shadow-sm"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 fw-bold">
                            {idx + 1}.{" "}
                            {item.type === "material"
                              ? `Material: ${item.title}`
                              : `Activity: ${item.name}`}
                          </h6>
                          {item.type === "activity" && (
                            <span
                              className={`badge ${
                                item.difficulty === "easy"
                                  ? "bg-success"
                                  : item.difficulty === "medium"
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          )}
                        </div>

                        {item.type === "material" ? (
                          <ul className="mt-2 mb-0 ps-3">
                            {item.contents.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 mb-0">
                            <strong>Instructions:</strong> {item.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No materials or activities yet.</p>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="outline-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
}

export default LessonsList;
