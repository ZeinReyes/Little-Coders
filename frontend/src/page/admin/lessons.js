import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner } from "react-bootstrap";
import DeleteConfirmModal from "../../component/deleteConfirmModal";
import "bootstrap-icons/font/bootstrap-icons.css";

const adminStyles = `
.admin-container {
  font-family: "Arial", "Helvetica", sans-serif;
}

.admin-search-box input {
  border-radius: 8px !important;
}

.lesson-card {
  border: none;
  border-left: 5px solid #007bff;
  background: #ffffff;
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: 0.2s ease-in-out;
  cursor: pointer;
  margin-bottom: 15px;
}

.lesson-card:hover {
  transform: translateY(-3px);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-top: 10px;
  color: #0056b3;
  text-transform: uppercase;
}

.list-group-item {
  border: none !important;
  padding: 12px 10px;
  border-radius: 6px;
  margin-top: 6px;
  background: #f7f9fc;
}

.list-group-item:hover {
  background: #e9f1ff;
}

.admin-menu {
  background: #fff;
  border-radius: 8px;
  padding: 6px;
  border: 1px solid #ccc;
}

.admin-add-btn {
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 14px;
}
`;

function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [lessonContents, setLessonContents] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort lessons by order
      const sortedLessons = res.data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setLessons(sortedLessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const toggleExpand = async (lessonId) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
      return;
    }

    if (!lessonContents[lessonId]) {
      setLoadingLessons((prev) => ({ ...prev, [lessonId]: true }));
      try {
        const token = localStorage.getItem("token");

        const materialsRes = await axios.get(
          `${API_BASE}/materials/lessons/${lessonId}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Sort materials by order
        const sortedMaterials = materialsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));

        const activitiesByMaterial = {};
        await Promise.all(
          sortedMaterials.map(async (material) => {
            try {
              const actRes = await axios.get(
                `${API_BASE}/activities/materials/${material._id}/activities`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              // Sort activities by order
              activitiesByMaterial[material._id] = actRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
            } catch {
              activitiesByMaterial[material._id] = [];
            }
          })
        );

        const assessmentsRes = await axios.get(
          `${API_BASE}/assessments/lessons/${lessonId}/assessments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Sort assessments by order (if they have an order field)
        const sortedAssessments = assessmentsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));

        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            materials: sortedMaterials,
            activitiesByMaterial,
            assessments: sortedAssessments,
          },
        }));
      } catch (err) {
        console.error("Error fetching lesson contents:", err);
      } finally {
        setLoadingLessons((prev) => ({ ...prev, [lessonId]: false }));
      }
    }

    setExpandedLesson(lessonId);
  };

  const handleAddMaterial = (lessonId) => {
    navigate(`/admin/lessons/${lessonId}/add-material`);
  };

  const handleAddActivity = (lessonId, materialId) => {
    navigate(`/admin/materials/${materialId}/add-activity`);
  };

  const handleAddAssessment = (lessonId) => {
    navigate(`/admin/lessons/${lessonId}/add-assessment`);
  };

  const handleDeleteClick = (type, id, lessonId = null, materialId = null) => {
    setDeleteTarget({ type, id, lessonId, materialId });
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const handleConfirmDelete = async () => {
    const { type, id, lessonId, materialId } = deleteTarget || {};
    try {
      const token = localStorage.getItem("token");

      if (type === "lesson") {
        await axios.delete(`${API_BASE}/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons((prev) => prev.filter((l) => l._id !== id));
      } else if (type === "material") {
        await axios.delete(`${API_BASE}/materials/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            materials: prev[lessonId].materials.filter((m) => m._id !== id),
          },
        }));
      } else if (type === "activity") {
        await axios.delete(`${API_BASE}/activities/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            activitiesByMaterial: {
              ...prev[lessonId].activitiesByMaterial,
              [materialId]: prev[lessonId].activitiesByMaterial[materialId].filter(
                (a) => a._id !== id
              ),
            },
          },
        }));
      } else if (type === "assessment") {
        await axios.delete(`${API_BASE}/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            assessments: prev[lessonId].assessments.filter((a) => a._id !== id),
          },
        }));
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete. Check console.");
    }
  };

  const ActionMenu = ({ type, id, lessonId, materialId, title }) =>
    openMenu === id && (
      <div
        className="position-absolute bg-white border rounded shadow-sm p-2"
        style={{ top: "100%", right: 0, zIndex: 10, minWidth: "100px" }}
      >
        <button
          className="btn btn-sm w-100 text-start"
          onClick={() => {
            setOpenMenu(null);
            if (type === "lesson")
              navigate(`/admin/lessons/edit/${id}`);
            else if (type === "material")
              navigate(`/admin/lessons/${lessonId}/materials/${id}`);
            else if (type === "activity")
              navigate(`/admin/lessons/${lessonId}/activities/${id}`);
            else if (type === "assessment")
              navigate(`/admin/edit-assessment/${id}`);
          }}
        >
          <i className="bi bi-pencil me-2"></i>Edit
        </button>

        <button
          className="btn btn-sm w-100 text-start text-danger"
          onClick={() => handleDeleteClick(type, id, lessonId, materialId)}
        >
          <i className="bi bi-trash me-2"></i>Delete
        </button>
      </div>
    );

  const filteredLessons = lessons
    .filter((lesson) => lesson.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.order || 0) - (b.order || 0)); // Ensure filtered lessons are also sorted

  return (
    <div className="p-3 admin-container">
      <style>{adminStyles}</style>

      <div className="d-flex justify-content-between mb-3 admin-search-box">
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

        <Link to="/admin/lessons/add" className="btn btn-primary w-25 ms-3">
          <i className="bi bi-plus-lg me-1"></i>Add
        </Link>
      </div>

      {filteredLessons.map((lesson) => (
        <div key={lesson._id} className="lesson-card">
          <div
            className="d-flex justify-content-between align-items-center"
            onClick={() => toggleExpand(lesson._id)}
          >
            <strong>{lesson.title}</strong>
            <div className="d-flex align-items-center position-relative gap-2">
              <Button
                variant="primary"
                className="admin-add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddMaterial(lesson._id);
                }}
              >
                <i className="bi bi-plus-lg"></i> Add Material
              </Button>

              <i
                className="bi bi-three-dots-vertical fs-5 text-secondary"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === lesson._id ? null : lesson._id);
                }}
              ></i>
              <ActionMenu type="lesson" id={lesson._id} title={lesson.title} />
            </div>
          </div>

          {expandedLesson === lesson._id && (
            <div className="p-3">
              {loadingLessons[lesson._id] ? (
                <div className="text-center my-3">
                  <Spinner animation="border" size="sm" /> Loading contents...
                </div>
              ) : (
                <>
                  <h6 className="section-title">
                    <i className="bi bi-journal-text me-2"></i> Lessons
                  </h6>
                  {lessonContents[lesson._id]?.materials?.length ? (
                    <ul className="list-group mb-3">
                      {lessonContents[lesson._id].materials.map((m) => (
                        <li key={m._id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center position-relative">
                            <span>
                              <i className="bi bi-book me-2"></i>
                              {m.title}
                            </span>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                variant="primary"
                                className="admin-add-btn"
                                onClick={() => handleAddActivity(lesson._id, m._id)}
                              >
                                <i className="bi bi-plus-lg"></i> Add Activity
                              </Button>
                              <i
                                className="bi bi-three-dots-vertical fs-5 text-secondary"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setOpenMenu(openMenu === m._id ? null : m._id)
                                }
                              ></i>
                              <ActionMenu
                                type="material"
                                id={m._id}
                                title={m.title}
                                lessonId={lesson._id}
                              />
                            </div>
                          </div>

                          {lessonContents[lesson._id]?.activitiesByMaterial[m._id]?.length ? (
                            <ul className="list-group mt-2 ms-4">
                              {lessonContents[lesson._id].activitiesByMaterial[m._id].map((a) => (
                                <li
                                  key={a._id}
                                  className="list-group-item d-flex justify-content-between align-items-center position-relative"
                                >
                                  <span>
                                    <i className="bi bi-lightbulb me-2"></i>
                                    {a.name}
                                  </span>
                                  <div className="d-flex align-items-center gap-2">
                                    <span
                                      className={`badge ${
                                        a.difficulty === "easy"
                                          ? "bg-success"
                                          : a.difficulty === "medium"
                                          ? "bg-warning text-dark"
                                          : "bg-danger"
                                      }`}
                                    >
                                      {a.difficulty}
                                    </span>
                                    <i
                                      className="bi bi-three-dots-vertical fs-5 text-secondary"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        setOpenMenu(openMenu === a._id ? null : a._id)
                                      }
                                    ></i>
                                    <ActionMenu
                                      type="activity"
                                      id={a._id}
                                      title={a.name}
                                      difficulty={a.difficulty}
                                      lessonId={lesson._id}
                                      materialId={m._id}
                                    />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No lessons found.</p>
                  )}

                  <h6 className="section-title">
                    <i className="bi bi-clipboard-check me-2"></i> Assessment
                  </h6>
                  {lessonContents[lesson._id]?.assessments?.length ? (
                    <ul className="list-group mb-3">
                      {lessonContents[lesson._id].assessments.map((asmt) => {
                        const assessmentId = asmt._id || asmt.id;
                        return (
                          <li
                            key={assessmentId}
                            className="list-group-item d-flex justify-content-between align-items-center position-relative"
                          >
                            <span>
                              <i className="bi bi-pencil-square me-2"></i>
                              {asmt.title}
                            </span>
                            <div className="d-flex align-items-center gap-2">
                              <i
                                className="bi bi-three-dots-vertical fs-5 text-secondary"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  setOpenMenu(openMenu === assessmentId ? null : assessmentId)
                                }
                              ></i>
                              <ActionMenu
                                type="assessment"
                                id={assessmentId}
                                title={asmt.title}
                                lessonId={lesson._id}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-muted">No assessment found.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this item?"
      />
    </div>
  );
}

export default LessonsList;