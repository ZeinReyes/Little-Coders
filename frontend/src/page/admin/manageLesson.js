import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function ManageLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // merged list (materials + activities)
  const [reorderedItems, setReorderedItems] = useState([]);
  const [changed, setChanged] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

      const materials = materialsRes.data.map((m) => ({
        ...m,
        type: "material",
      }));
      const activities = activitiesRes.data.map((a) => ({
        ...a,
        type: "activity",
      }));

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
      });

      fetchData();
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  return (
    <div className="p-3">
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
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm mt-3">
        <h5 className="mb-3">Lesson Content</h5>

        {reorderedItems.length === 0 && (
          <p className="text-muted">No materials or activities added yet.</p>
        )}

        {reorderedItems.length > 0 && (
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
                            {item.type === "material" ? "📘 " : "🎯 "}
                            {item.title || item.name}
                          </span>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="info"
                              onClick={() =>
                                navigate(
                                  item.type === "material"
                                    ? `/materials/${item._id}`
                                    : `/activities/${item._id}`
                                )
                              }
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() =>
                                navigate(
                                  item.type === "material"
                                    ? `/materials/${item._id}/edit`
                                    : `/activities/${item._id}/edit`
                                )
                              }
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Delete {selectedItem?.type === "material" ? "Material" : "Activity"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{selectedItem?.title || selectedItem?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageLesson;
