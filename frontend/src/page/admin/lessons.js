import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, Dropdown } from "react-bootstrap";
import DeleteConfirmModal from "../../component/deleteConfirmModal"; 

function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [lessonContents, setLessonContents] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const toggleExpand = async (lessonId) => {
    if (expandedLesson === lessonId) {
      setExpandedLesson(null);
      return;
    }
  
    if (!lessonContents[lessonId]) {
      setLoadingLessons((prev) => ({ ...prev, [lessonId]: true }));
      try {
        const token = localStorage.getItem("token");
  
        // 1️⃣ Fetch all materials for the lesson
        const materialsRes = await axios.get(
          `http://localhost:5000/api/materials/lessons/${lessonId}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const activitiesByMaterial = {};
  
        // 2️⃣ Fetch activities for each material
        await Promise.all(
          materialsRes.data.map(async (material) => {
            const activitiesRes = await axios.get(
              `http://localhost:5000/api/activities/materials/${material._id}/activities`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            activitiesByMaterial[material._id] = activitiesRes.data;
          })
        );
  
        // 3️⃣ Save in state
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            materials: materialsRes.data,
            activitiesByMaterial,
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
  

  const handleAddMaterial = (lessonId) => navigate(`/admin/lessons/${lessonId}/add-material`);
  const handleAddActivity = (materialId) => navigate(`/admin/materials/${materialId}/add-activity`);
  const handleEditActivity = (activityId) => navigate(`/admin/activities/${activityId}/edit`);

  const handleDeleteClick = (type, id, lessonId = null, materialId = null) => {
    setDeleteTarget({ type, id, lessonId, materialId });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const { type, id, lessonId, materialId } = deleteTarget;
    try {
      const token = localStorage.getItem("token");
      if (type === "lesson") {
        await axios.delete(`http://localhost:5000/api/lessons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessons((prev) => prev.filter((l) => l._id !== id));
      } else if (type === "material") {
        await axios.delete(`http://localhost:5000/api/materials/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            materials: prev[lessonId].materials.filter((m) => m._id !== id),
            activitiesByMaterial: Object.fromEntries(
              Object.entries(prev[lessonId].activitiesByMaterial).filter(([key]) => key !== id)
            ),
          },
        }));
      } else if (type === "activity") {
        await axios.delete(`http://localhost:5000/api/activities/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            activitiesByMaterial: {
              ...prev[lessonId].activitiesByMaterial,
              [materialId]: prev[lessonId].activitiesByMaterial[materialId].filter((a) => a._id !== id),
            },
          },
        }));
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete. Check console.");
    }
  };

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3">
      {/* Search + Add Lesson */}
      <div className="d-flex justify-content-between mb-3">
        <div className="input-group w-75">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search Lesson..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/admin/lessons/add" className="btn btn-success w-25 ms-3">Add +</Link>
      </div>

      {filteredLessons.map((lesson) => (
        <div key={lesson._id} className="mb-3 border rounded shadow-sm">
          {/* Lesson Header */}
          <div className="d-flex justify-content-between align-items-center bg-light p-3 cursor-pointer" onClick={() => toggleExpand(lesson._id)}>
            <strong>{lesson.title}</strong>
            <div className="d-flex gap-2">
              <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteClick("lesson", lesson._id); }}>Delete</Button>
              <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleAddMaterial(lesson._id); }}>+ Add Lesson Material</Button>
            </div>
          </div>

          {/* Lesson Content */}
          {expandedLesson === lesson._id && (
            <div className="p-3 bg-white">
              {loadingLessons[lesson._id] ? (
                <div className="text-center my-3"><Spinner animation="border" size="sm" /> Loading contents...</div>
              ) : (
                <>
                  <h6 className="fw-bold mt-2 text-primary">📘 Materials</h6>
                  {lessonContents[lesson._id]?.materials?.length ? (
                    <ul className="list-group mb-3">
                      {lessonContents[lesson._id].materials.map((m) => (
                        <li key={m._id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{m.title}</span>
                            <div className="d-flex gap-2 align-items-center">
                              <Button size="sm" variant="primary" onClick={() => handleAddActivity(m._id)}>+ Add Activity</Button>
                              {/* 3 DOT DROPDOWN */}
                              <Dropdown>
                                <Dropdown.Toggle variant="secondary" size="sm">⋮</Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => navigate(`/admin/materials/${m._id}/edit`)}>Edit</Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleDeleteClick("material", m._id, lesson._id)}>Delete</Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>
                          </div>

                          {/* Activities under this material */}
                          {lessonContents[lesson._id]?.activitiesByMaterial[m._id]?.length ? (
                            <ul className="list-group mt-2 ms-4">
                              {lessonContents[lesson._id].activitiesByMaterial[m._id].map((a) => (
                                <li key={a._id} className="list-group-item d-flex justify-content-between align-items-center">
                                  <span>{a.name}</span>
                                  <div className="d-flex gap-2 align-items-center">
                                    <span className={`badge ${
                                      a.difficulty === "easy"
                                        ? "bg-success"
                                        : a.difficulty === "medium"
                                        ? "bg-warning text-dark"
                                        : "bg-danger"
                                    }`}>{a.difficulty}</span>
                                    <Dropdown>
                                      <Dropdown.Toggle variant="secondary" size="sm">⋮</Dropdown.Toggle>
                                      <Dropdown.Menu>
                                        <Dropdown.Item onClick={() => handleEditActivity(a._id)}>Edit</Dropdown.Item>
                                        <Dropdown.Item onClick={() => handleDeleteClick("activity", a._id, lesson._id, m._id)}>Delete</Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-muted">No materials found.</p>}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
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
