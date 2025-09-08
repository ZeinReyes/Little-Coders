import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState({
    title: "",
    description: "",
    topics: { variables: false, operators: false, conditionals: false },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLesson();
  }, []);

  const fetchLesson = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLesson(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching lesson:", err);
      setError("Failed to load lesson.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setLesson({
        ...lesson,
        topics: { ...lesson.topics, [name]: checked },
      });
    } else {
      setLesson({ ...lesson, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/lessons/${id}`,
        lesson,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/lessons");
    } catch (err) {
      console.error("Error updating lesson:", err);
      setError("Failed to update lesson.");
    }
  };

  if (loading) return <p className="p-3">Loading lesson...</p>;
  if (error) return <p className="p-3 text-danger">{error}</p>;

  return (
    <div className="p-3">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-white">Edit Lesson</h3>
        <Button className="btn btn-success"  onClick={() => navigate(`/admin/lessons/${id}/manage`)}>
            Manage Lesson
        </Button>
        </div>
        <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
          <Form.Group className="mb-3">
            <Form.Label>Lesson Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={lesson.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={lesson.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Topics</Form.Label>
            <div className="form-check">
              <Form.Check
                type="checkbox"
                label="Variables"
                name="variables"
                checked={lesson.topics.variables}
                onChange={handleChange}
              />
            </div>
            <div className="form-check">
              <Form.Check
                type="checkbox"
                label="Operators"
                name="operators"
                checked={lesson.topics.operators}
                onChange={handleChange}
              />
            </div>
            <div className="form-check">
              <Form.Check
                type="checkbox"
                label="Conditionals"
                name="conditionals"
                checked={lesson.topics.conditionals}
                onChange={handleChange}
              />
            </div>
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

export default EditLesson;
