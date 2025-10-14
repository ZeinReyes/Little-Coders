import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import DeleteConfirmModal from "../../component/deleteConfirmModal";
import "bootstrap-icons/font/bootstrap-icons.css";

function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [lessonContents, setLessonContents] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("[useEffect] component mounted -> fetchLessons()");
    fetchLessons();
  }, []);

  const API_BASE = "http://localhost:5000/api";

  const fetchLessons = async () => {
    console.log("[fetchLessons] start");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[fetchLessons] success — received lessons:", res.data?.length);
      setLessons(res.data);
    } catch (err) {
      console.error("[fetchLessons] error:", err);
    } finally {
      console.log("[fetchLessons] end");
    }
  };

  const toggleExpand = async (lessonId) => {
    console.log(`[toggleExpand] called for lessonId=${lessonId}, expandedLesson=${expandedLesson}`);
    if (expandedLesson === lessonId) {
      console.log(`[toggleExpand] collapsing lesson ${lessonId}`);
      setExpandedLesson(null);
      return;
    }

    if (!lessonContents[lessonId]) {
      console.log(`[toggleExpand] no cached contents for ${lessonId} — fetching materials`);
      setLoadingLessons((prev) => ({ ...prev, [lessonId]: true }));
      try {
        const token = localStorage.getItem("token");
        console.log(`[toggleExpand] fetching materials for lesson ${lessonId}`);
        const materialsRes = await axios.get(
          `${API_BASE}/materials/lessons/${lessonId}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(
          `[toggleExpand] materials fetched for lesson ${lessonId} count=${materialsRes.data.length}`
        );

        const activitiesByMaterial = {};
        await Promise.all(
          materialsRes.data.map(async (material) => {
            console.log(`[toggleExpand] fetching activities for material ${material._id}`);
            try {
              const activitiesRes = await axios.get(
                `${API_BASE}/activities/materials/${material._id}/activities`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              activitiesByMaterial[material._id] = activitiesRes.data;
              console.log(
                `[toggleExpand] activities fetched for material ${material._id} count=${activitiesRes.data.length}`
              );
            } catch (err) {
              console.error(
                `[toggleExpand] error fetching activities for material ${material._id}:`,
                err
              );
              activitiesByMaterial[material._id] = [];
            }
          })
        );

        setLessonContents((prev) => ({
          ...prev,
          [lessonId]: { materials: materialsRes.data, activitiesByMaterial },
        }));
        console.log(`[toggleExpand] lessonContents updated for ${lessonId}`);
      } catch (err) {
        console.error(`[toggleExpand] error fetching lesson contents for ${lessonId}:`, err);
      } finally {
        setLoadingLessons((prev) => ({ ...prev, [lessonId]: false }));
        console.log(`[toggleExpand] finished fetching contents for ${lessonId}`);
      }
    } else {
      console.log(`[toggleExpand] using cached contents for ${lessonId}`);
    }

    setExpandedLesson(lessonId);
    console.log(`[toggleExpand] set expandedLesson=${lessonId}`);
  };

  const handleAddMaterial = (lessonId) => {
    console.log(`[handleAddMaterial] navigate to add material for lesson ${lessonId}`);
    navigate(`/admin/lessons/${lessonId}/add-material`);
  };
  const handleAddActivity = (lessonId, materialId) => {
    console.log(`[handleAddActivity] navigate to add activity for material ${materialId}`);
    navigate(`/admin/materials/${materialId}/add-activity`);
  };

  const handleDeleteClick = (type, id, lessonId = null, materialId = null) => {
    console.log(`[handleDeleteClick] open delete modal for type=${type} id=${id}`);
    setDeleteTarget({ type, id, lessonId, materialId });
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const handleConfirmDelete = async () => {
    console.log("[handleConfirmDelete] start", deleteTarget);
    const { type, id, lessonId, materialId } = deleteTarget || {};
    try {
      const token = localStorage.getItem("token");
      if (type === "lesson") {
        console.log(`[handleConfirmDelete] deleting lesson ${id}`);
        await axios.delete(`${API_BASE}/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons((prev) => prev.filter((l) => l._id !== id));
        console.log(`[handleConfirmDelete] lesson ${id} removed from state`);
      } else if (type === "material") {
        console.log(`[handleConfirmDelete] deleting material ${id}`);
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
        console.log(`[handleConfirmDelete] material ${id} removed from lessonContents[${lessonId}]`);
      } else if (type === "activity") {
        console.log(`[handleConfirmDelete] deleting activity ${id}`);
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
        console.log(
          `[handleConfirmDelete] activity ${id} removed from lessonContents[${lessonId}].activitiesByMaterial[${materialId}]`
        );
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
      console.log("[handleConfirmDelete] success and modal closed");
    } catch (err) {
      console.error("[handleConfirmDelete] error:", err);
      alert("Failed to delete. Check console.");
    }
  };

  // ---------------------- Edit Update Functions ----------------------
  const updateLesson = async (id, title) => {
    console.log(`[updateLesson] start id=${id} title="${title}"`);
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${API_BASE}/lessons/${id}`,
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("[updateLesson] success", res.data);
    return res.data;
  };

  const updateMaterial = async (id, title) => {
    console.log(`[updateMaterial] start id=${id} title="${title}"`);
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${API_BASE}/materials/${id}`,
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("[updateMaterial] success", res.data);
    return res.data;
  };

  const updateActivity = async (id, name, difficulty) => {
    console.log(`[updateActivity] start id=${id} name="${name}" difficulty="${difficulty}"`);
    const token = localStorage.getItem("token");
    const res = await axios.put(
      `${API_BASE}/activities/${id}`,
      { name, difficulty },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("[updateActivity] success", res.data);
    return res.data;
  };

  // ---------------------- Edit Modal ----------------------
  const EditModal = () =>
    editTarget && (
      <Modal show={!!editTarget} onHide={() => { console.log("[EditModal] closed by user"); setEditTarget(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Edit {editTarget.type.charAt(0).toUpperCase() + editTarget.type.slice(1)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title / Name</Form.Label>
              <Form.Control
                type="text"
                value={editTarget.title}
                onChange={(e) => {
                  console.log(`[EditModal] title changed for ${editTarget.type} id=${editTarget.id} -> "${e.target.value}"`);
                  setEditTarget({ ...editTarget, title: e.target.value });
                }}
              />
            </Form.Group>
            {editTarget.type === "activity" && (
              <Form.Group className="mb-3">
                <Form.Label>Difficulty</Form.Label>
                <Form.Select
                  value={editTarget.difficulty || "easy"}
                  onChange={(e) => {
                    console.log(`[EditModal] difficulty changed for activity id=${editTarget.id} -> "${e.target.value}"`);
                    setEditTarget({ ...editTarget, difficulty: e.target.value });
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { console.log("[EditModal] cancel clicked"); setEditTarget(null); }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              console.log("[EditModal] Save Changes clicked", editTarget);
              try {
                const { type, id, title, difficulty } = editTarget;

                if (type === "lesson") {
                  console.log("[EditModal] calling updateLesson");
                  await updateLesson(id, title);
                } else if (type === "material") {
                  console.log("[EditModal] calling updateMaterial");
                  await updateMaterial(id, title);
                } else if (type === "activity") {
                  console.log("[EditModal] calling updateActivity");
                  await updateActivity(id, title, difficulty);
                }

                console.log("[EditModal] update finished, refreshing lessons");
                setEditTarget(null);
                await fetchLessons(); // Refresh data
                console.log("[EditModal] UI refreshed after update");
              } catch (err) {
                console.error("[EditModal] Error updating:", err);
                alert("Update failed. Check console.");
              }
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );

  // small inline edit/delete menu
  const ActionMenu = ({ type, id, lessonId, materialId, title, difficulty }) =>
  openMenu === id && (
    <div
      className="position-absolute bg-white border rounded shadow-sm p-2"
      style={{
        top: "100%",
        right: 0,
        zIndex: 10,
        minWidth: "100px",
      }}
    >
      <button
        className="btn btn-sm w-100 text-start"
        onClick={() => {
          console.log(`[ActionMenu] Edit clicked type=${type} id=${id}`);
          setOpenMenu(null);

          if (type === "lesson") {
            navigate(`/admin/lessons/edit/${id}`);
          } else if (type === "material") {
            navigate(`/admin/lessons/${lessonId}/materials/${id}`);
          } else if (type === "activity") {
            navigate(`/admin/lessons/${lessonId}/activities/${id}`);
          }

        }}
      >
        <i className="bi bi-pencil me-2"></i>Edit
      </button>
      <button
        className="btn btn-sm w-100 text-start text-danger"
        onClick={() => {
          console.log(`[ActionMenu] Delete clicked type=${type} id=${id}`);
          handleDeleteClick(type, id, lessonId, materialId);
        }}
      >
        <i className="bi bi-trash me-2"></i>Delete
      </button>
    </div>
  );


  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3">
      {/* Search + Add Lesson */}
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
            onChange={(e) => {
              console.log(`[search] value changed -> "${e.target.value}"`);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Link
          to="/admin/lessons/add"
          className="btn btn-success w-25 ms-3"
          onClick={() => console.log("[Add Lesson] navigate to /admin/lessons/add")}
        >
          <i className="bi bi-plus-lg me-1"></i>Add
        </Link>
      </div>

      {filteredLessons.map((lesson) => (
        <div key={lesson._id} className="mb-3 border rounded shadow-sm">
          <div
            className="d-flex justify-content-between align-items-center bg-light p-3 cursor-pointer"
            onClick={() => toggleExpand(lesson._id)}
          >
            <strong>{lesson.title}</strong>
            <div className="d-flex align-items-center position-relative gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`[Add Material Button] clicked for lesson ${lesson._id}`);
                  handleAddMaterial(lesson._id);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>Add Lesson Material
              </Button>

              <i
                className="bi bi-three-dots-vertical fs-5 text-secondary"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`[menu toggle] lesson menu toggled for ${lesson._id}`);
                  setOpenMenu(openMenu === lesson._id ? null : lesson._id);
                }}
              ></i>
              <ActionMenu type="lesson" id={lesson._id} title={lesson.title} />
            </div>
          </div>

          {/* Lesson Content */}
          {expandedLesson === lesson._id && (
            <div className="p-3 bg-white">
              {loadingLessons[lesson._id] ? (
                <div className="text-center my-3">
                  <Spinner animation="border" size="sm" /> Loading contents...
                </div>
              ) : (
                <>
                  <h6 className="fw-bold mt-2 text-primary">📘 Materials</h6>
                  {lessonContents[lesson._id]?.materials?.length ? (
                    <ul className="list-group mb-3">
                      {lessonContents[lesson._id].materials.map((m) => (
                        <li key={m._id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center position-relative">
                            <span>{m.title}</span>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  console.log(`[Add Activity Button] clicked for material ${m._id}`);
                                  handleAddActivity(lesson._id, m._id);
                                }}
                              >
                                <i className="bi bi-plus-lg me-1"></i>Add Activity
                              </Button>

                              <i
                                className="bi bi-three-dots-vertical fs-5 text-secondary"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  console.log(`[menu toggle] material menu toggled for ${m._id}`);
                                  setOpenMenu(openMenu === m._id ? null : m._id);
                                }}
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
                                  <span>{a.name}</span>
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
                                      onClick={() => {
                                        console.log(`[menu toggle] activity menu toggled for ${a._id}`);
                                        setOpenMenu(openMenu === a._id ? null : a._id);
                                      }}
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
                          ) : (
                            <p className="text-muted ms-4">No activities yet.</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No materials found.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => {
          console.log("[DeleteConfirmModal] onHide called");
          setShowDeleteModal(false);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this item?"
      />

      <EditModal />
    </div>
  );
}

export default LessonsList;
