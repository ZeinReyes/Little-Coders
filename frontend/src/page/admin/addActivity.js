import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import axios from "axios";

function AddActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    difficulty: "easy",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/activities/lessons/${id}/activities`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/admin/lessons/${id}/manage`);
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  return (
    <div className="p-3">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">Add Activity</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Activity Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter activity name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Enter activity instructions"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Difficulty</Form.Label>
              <Form.Select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/admin/lessons/${id}/manage`)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Activity
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AddActivity;
