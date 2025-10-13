import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DeleteConfirmModal from "../../component/deleteConfirmModal";
import ViewModal from "../../component/viewModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function ManageLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [reorderedItems, setReorderedItems] = useState([]);
  const [changed, setChanged] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    overview: "",
    contents: [""],
    name: "",
    instructions: "",
    hints: [""],
    expectedOutput: "",
    difficulty: "easy",
  });

  const countWords = (text) => {
    const plain = (text || "").replace(/<[^>]+>/g, "").trim();
    return plain ? plain.split(/\s+/).length : 0;
  };

  const isEditInvalid =
    (selectedItem?.type === "material" &&
      (countWords(editForm.overview ?? "") > 70 ||
        (editForm.contents || []).some((c) => countWords(c) > 70))) ||
    (selectedItem?.type === "activity" &&
      (countWords(editForm.instructions ?? "") > 70 ||
        (editForm.hints || []).some((h) => countWords(h) > 70))) ||
    (selectedItem?.type === "assessment" &&
      (countWords(editForm.instructions ?? "") > 70 ||
        (editForm.hints || []).some((h) => countWords(h) > 70)));

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [materialsRes, activitiesRes, assessmentsRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/materials/lessons/${id}/materials`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `http://localhost:5000/api/activities/lessons/${id}/activities`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`http://localhost:5000/api/assessments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
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

      const assessments = assessmentsRes.data.data
        .filter((a) => a.lessonId?._id === id)
        .map((a) => ({
          ...a,
          type: "assessment",
        }));

      const merged = [...materials, ...activities, ...assessments].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          new Date(a.createdAt) - new Date(b.createdAt)
      );

      setItems(merged);
      setReorderedItems(merged);
      setChanged(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(reorderedItems);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setReorderedItems(reordered);
    setChanged(true);
  };

  const handleCancel = () => {
    setReorderedItems(items);
    setChanged(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/lessons/${id}/reorder`,
        {
          items: reorderedItems.map((item, index) => ({
            id: item._id,
            type: item.type,
            order: index,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(reorderedItems);
      setChanged(false);
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setEditForm({
      title: item.title || "",
      overview: item.overview || "",
      contents: item.contents?.length ? item.contents : [""],
      name: item.name || "",
      instructions: item.instructions || "",
      hints: item.hints?.length ? item.hints : [],
      expectedOutput: item.expectedOutput || "",
      difficulty: item.difficulty || "easy",
    });
    setShowEditModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      const token = localStorage.getItem("token");
      let endpoint = "";

      if (selectedItem.type === "material")
        endpoint = `http://localhost:5000/api/materials/${selectedItem._id}`;
      else if (selectedItem.type === "activity")
        endpoint = `http://localhost:5000/api/activities/${selectedItem._id}`;
      else
        endpoint = `http://localhost:5000/api/assessments/${selectedItem._id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchData();
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("❌ Delete failed:", err.response?.data || err.message);
      alert("Failed to delete item. Check console for details.");
    }
  };

  const handleUpdate = async () => {
    try {
      if (isEditInvalid) return;
      const token = localStorage.getItem("token");

      let payload = {};
      let endpoint = "";

      if (selectedItem.type === "material") {
        endpoint = `http://localhost:5000/api/materials/${selectedItem._id}`;
        payload = {
          title: editForm.title,
          overview: editForm.overview,
          contents: editForm.contents,
        };
      } else if (selectedItem.type === "activity") {
        endpoint = `http://localhost:5000/api/activities/${selectedItem._id}`;
        payload = {
          name: editForm.name,
          instructions: editForm.instructions,
          hints: editForm.hints,
          expectedOutput: editForm.expectedOutput,
          difficulty: editForm.difficulty,
          lessonId: id,
        };
      } else {
        endpoint = `http://localhost:5000/api/assessments/${selectedItem._id}`;
        payload = {
          title: editForm.title,
          instructions: editForm.instructions,
          hints: editForm.hints,
          expectedOutput: editForm.expectedOutput,
          difficulty: editForm.difficulty,
          lessonId: id,
        };
      }

      await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchData();
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err.message);
      alert("Failed to update item. Check console for details.");
    }
  };

  const removeContentBox = (index) => {
    const newContents = (editForm.contents || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, contents: newContents });
  };

  const removeHintBox = (index) => {
    const newHints = (editForm.hints || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, hints: newHints });
  };

  return (
  <div className="p-3">
    {/* HEADER */}
    <div className="bg-primary text-white p-4 rounded d-flex justify-content-between align-items-center">
      <h3 className="mb-0">Manage Lesson</h3>
      <div className="d-flex gap-2">
        <Button
          variant="light"
          onClick={() => navigate(`/admin/lessons/${id}/add-material`)}
        >
          + Add Material
        </Button>
        <Button
          variant="success"
          onClick={() => navigate(`/admin/lessons/${id}/add-activity`)}
        >
          + Add Activity
        </Button>
        <Button
          variant="dark"
          onClick={() => navigate(`/admin/add-assessment`)}
        >
          + Add Assessment
        </Button>
      </div>
    </div>

    {/* LIST */}
    <div className="bg-white p-4 rounded shadow-sm mt-3">
      <h5 className="mb-3">Lesson Content</h5>

      {reorderedItems?.length === 0 && (
        <p className="text-muted">
          No materials, activities, or assessments yet.
        </p>
      )}

      {reorderedItems?.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lesson-items">
            {(provided) => (
              <ul
                className="list-group"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {reorderedItems.map((item, index) => (
                  <Draggable key={item._id} draggableId={item._id} index={index}>
                    {(provided) => (
                      <li
                        className="list-group-item d-flex justify-content-between align-items-center"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <span>
                          {item.type === "material"
                            ? "📘 "
                            : item.type === "activity"
                            ? "🎯 "
                            : "🧩 "}
                          {item.title || item.name}
                        </span>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => handleView(item)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {changed && reorderedItems?.length > 1 && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="outline-secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Order
          </Button>
        </div>
      )}
    </div>

    {/* DELETE MODAL */}
    <DeleteConfirmModal
      show={showDeleteModal}
      onHide={() => setShowDeleteModal(false)}
      onConfirm={confirmDelete}
      title={`Delete ${selectedItem?.type}`}
      message={`Are you sure you want to delete "${
        selectedItem?.title || selectedItem?.name
      }"?`}
    />

    {/* VIEW MODAL */}
    <ViewModal
      show={showViewModal}
      onHide={() => setShowViewModal(false)}
      title={selectedItem?.title || selectedItem?.name}
    >
      {selectedItem?.type === "material" ? (
        <>
          <h6 className="fw-bold">Overview</h6>
          <div
            dangerouslySetInnerHTML={{ __html: selectedItem?.overview || "" }}
          />
          <h6 className="fw-bold mt-3">Contents</h6>
          {(selectedItem?.contents || []).map((c, i) => (
            <div key={i} className="mb-3">
              <div dangerouslySetInnerHTML={{ __html: c }} />
            </div>
          ))}
        </>
      ) : selectedItem?.type === "activity" ? (
        <>
          <h6 className="fw-bold">Instructions</h6>
          <div
            dangerouslySetInnerHTML={{
              __html: selectedItem?.instructions || "",
            }}
          />
          <h6 className="fw-bold mt-3">Hints</h6>
          {(selectedItem?.hints || []).map((h, i) => (
            <div key={i} className="mb-2">
              <div dangerouslySetInnerHTML={{ __html: h }} />
            </div>
          ))}
          <h6 className="fw-bold mt-3">Expected Output</h6>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {selectedItem?.expectedOutput}
          </div>
          <h6 className="fw-bold mt-3">Difficulty</h6>
          <span className="badge bg-secondary">
            {selectedItem?.difficulty}
          </span>
        </>
      ) : (
        <>
          <h6 className="fw-bold">Instructions</h6>
          <div
            dangerouslySetInnerHTML={{
              __html: selectedItem?.instructions || "",
            }}
          />
          <h6 className="fw-bold mt-3">Hints</h6>
          {(selectedItem?.hints || []).map((h, i) => (
            <div key={i} className="mb-2">
              <div dangerouslySetInnerHTML={{ __html: h }} />
            </div>
          ))}
          <h6 className="fw-bold mt-3">Expected Output</h6>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {selectedItem?.expectedOutput}
          </div>
          <h6 className="fw-bold mt-3">Difficulty</h6>
          <span className="badge bg-info">{selectedItem?.difficulty}</span>
        </>
      )}
    </ViewModal>

    {/* EDIT MODAL */}
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Edit {selectedItem?.type}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* MATERIAL */}
          {selectedItem?.type === "material" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Overview</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={editForm.overview}
                  onChange={(val) =>
                    setEditForm((p) => ({ ...p, overview: val }))
                  }
                />
              </Form.Group>
              <Form.Label>Contents</Form.Label>
              {(editForm.contents || []).map((c, i) => (
                <div key={i} className="mb-3">
                  <ReactQuill
                    theme="snow"
                    value={c}
                    onChange={(val) =>
                      setEditForm((p) => {
                        const newContents = [...(p.contents || [])];
                        newContents[i] = val;
                        return { ...p, contents: newContents };
                      })
                    }
                  />
                </div>
              ))}
            </>
          )}

          {/* ACTIVITY */}
          {selectedItem?.type === "activity" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Instructions</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={editForm.instructions}
                  onChange={(val) =>
                    setEditForm((p) => ({ ...p, instructions: val }))
                  }
                />
              </Form.Group>
            </>
          )}

          {/* ASSESSMENT */}
          {selectedItem?.type === "assessment" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Instructions</Form.Label>
                <ReactQuill
                  theme="snow"
                  value={editForm.instructions}
                  onChange={(val) =>
                    setEditForm((p) => ({ ...p, instructions: val }))
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Hints</Form.Label>
                {(editForm.hints || []).map((h, i) => (
                  <div key={i} className="mb-3">
                    <ReactQuill
                      theme="snow"
                      value={h}
                      onChange={(val) =>
                        setEditForm((p) => {
                          const newHints = [...(p.hints || [])];
                          newHints[i] = val;
                          return { ...p, hints: newHints };
                        })
                      }
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeHintBox(i)}
                    >
                      Remove Hint
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setEditForm((p) => ({
                      ...p,
                      hints: [...(p.hints || []), ""],
                    }))
                  }
                >
                  + Add Hint
                </Button>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Expected Output</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editForm.expectedOutput}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      expectedOutput: e.target.value,
                    }))
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Difficulty</Form.Label>
                <Form.Select
                  value={editForm.difficulty}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      difficulty: e.target.value,
                    }))
                  }
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={isEditInvalid}
          onClick={handleUpdate}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  </div>
);
}
export default ManageLesson;
