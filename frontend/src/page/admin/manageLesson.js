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
    contents: [],
    name: "",
    instructions: "",
    difficulty: "easy",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [materialsRes, activitiesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/materials/lessons/${id}/materials`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/activities/lessons/${id}/activities`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const materials = materialsRes.data.map((m) => ({ ...m, type: "material" }));
      const activities = activitiesRes.data.map((a) => ({ ...a, type: "activity" }));

      const merged = [...materials, ...activities].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt)
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

 const confirmDelete = async () => {
  if (!selectedItem) return;
  try {
    const token = localStorage.getItem("token");
    const endpoint =
      selectedItem.type === "material"
        ? `http://localhost:5000/api/materials/${selectedItem._id}`
        : `http://localhost:5000/api/activities/${selectedItem._id}`;

    await axios.delete(endpoint, {
  headers: { Authorization: `Bearer ${token}` },
  data: { lessonId: id }, 
});
    fetchData();
    setShowDeleteModal(false);
    setSelectedItem(null);
  } catch (err) {
    console.error("Error deleting item:", err.response?.data || err.message);
  }
};

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
   setEditForm(
  item.type === "material"
    ? {
        title: item.title || "",
        contents: typeof item.contents === "string" ? item.contents : (Array.isArray(item.contents) ? item.contents.join("<br/>") : ""),
      }
    : {
        name: item.name || "",
        instructions: item.instructions || "",
        difficulty: item.difficulty || "easy",
      }
);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        selectedItem.type === "material"
          ? `http://localhost:5000/api/materials/${selectedItem._id}`
          : `http://localhost:5000/api/activities/${selectedItem._id}`;

      const payload =
  selectedItem.type === "material"
    ? {
        title: editForm.title?.trim() || "",
        contents: editForm.contents || "", 
      }
          : {
              name: editForm.name?.trim() || "",
              instructions: editForm.instructions?.trim() || "",
              difficulty: editForm.difficulty || "easy",
            };

      await axios.put(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  return (
    <div className="p-3">
      <div className="bg-primary text-white p-4 rounded d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Manage Lesson</h3>
        <div className="d-flex gap-2">
          <Button variant="light" onClick={() => navigate(`/admin/lessons/${id}/add-material`)}>
            + Add Material
          </Button>
          <Button variant="success" onClick={() => navigate(`/admin/lessons/${id}/add-activity`)}>
            + Add Activity
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm mt-3">
        <h5 className="mb-3">Lesson Content</h5>

        {reorderedItems.length === 0 && <p className="text-muted">No materials or activities yet.</p>}

        {reorderedItems.length > 0 && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="lesson-items">
              {(provided) => (
                <ul className="list-group" {...provided.droppableProps} ref={provided.innerRef}>
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
                            {item.type === "material" ? "📘 " : "🎯 "}
                            {item.title || item.name}
                          </span>
                          <div className="d-flex gap-2">
                            <Button size="sm" variant="info" onClick={() => handleView(item)}>
                              View
                            </Button>
                            <Button size="sm" variant="warning" onClick={() => handleEdit(item)}>
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

        {changed && reorderedItems.length > 1 && (
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

      <DeleteConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={`Delete ${selectedItem?.type === "material" ? "Material" : "Activity"}`}
        message={`Are you sure you want to delete "${selectedItem?.title || selectedItem?.name}"?`}
      />

      <ViewModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        title={selectedItem?.type === "material" ? selectedItem?.title : selectedItem?.name}
      >
       {selectedItem?.type === "material" ? (
  <div
  dangerouslySetInnerHTML={{
    __html: selectedItem?.contents || "",
  }}
/>
) : (
  <>
    <div
      dangerouslySetInnerHTML={{
        __html: selectedItem?.instructions || "",
      }}
    />
    <span className="badge bg-secondary">
      Difficulty: {selectedItem?.difficulty}
    </span>
  </>
)}
      </ViewModal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            Edit {selectedItem?.type === "material" ? "Material" : "Activity"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {selectedItem?.type === "material" ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.title ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </Form.Group>

              <Form.Label className="fw-bold">Contents</Form.Label>
<ReactQuill
  theme="snow"
  value={editForm.contents || ""}
  onChange={(value) => setEditForm({ ...editForm, contents: value })}
/>

              </>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.name ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
  <Form.Label className="fw-bold">Instructions</Form.Label>
  <ReactQuill
    theme="snow"
    value={editForm.instructions ?? ""}
    onChange={(value) => setEditForm({ ...editForm, instructions: value })}
  />
</Form.Group>
                <Form.Group>
                  <Form.Label className="fw-bold">Difficulty</Form.Label>
                  <Form.Select
                    value={editForm.difficulty ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
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
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageLesson;
