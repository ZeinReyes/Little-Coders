import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

function EditMaterial() {
  const { lessonId, id } = useParams()
  const navigate = useNavigate();

  const [material, setMaterial] = useState({
    title: "",
    overview: "",
    contents: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMaterial();
  }, []);

  const API_BASE = "http://localhost:5000/api";

  const fetchMaterial = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/materials/lessons/${lessonId}/materials/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMaterial({
        title: res.data.title || "",
        overview: res.data.overview || "",
        contents: res.data.contents || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching material:", err);
      setError("Failed to load material.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({ ...material, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/materials/${id}`,
        material,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/admin/lessons`);
    } catch (err) {
      console.error("Error updating material:", err);
      setError("Failed to update material.");
    }
  };

  if (loading) return <p className="p-3">Loading material...</p>;
  if (error) return <p className="p-3 text-danger">{error}</p>;

  return (
    <div className="p-3">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-white">Edit Material</h3>
        </div>

        <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={material.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Overview</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="overview"
              value={material.overview}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contents</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              name="contents"
              value={material.contents}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/admin/lessons")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default EditMaterial;
