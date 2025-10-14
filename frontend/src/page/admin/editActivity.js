import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

function EditActivity() {
  const { lessonId, id } = useParams()
  const navigate = useNavigate();

  const [activity, setActivity] = useState({
    name: "",
    instructions: "",
    hints: [""],
    expectedOutput: "",
    difficulty: "easy",
    dataTypesRequired: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const validDataTypes = [
    "print", "variable", "multiple", "add", "subtract", "divide",
    "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
    "if", "elif", "else", "while"
  ];

  useEffect(() => {
    fetchActivity();
  }, []);

  const API_BASE = "http://localhost:5000/api";

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/activities/lessons/${lessonId}/activities/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setActivity({
        name: data.name || "",
        instructions: data.instructions || "",
        hints: Array.isArray(data.hints) ? data.hints : [data.hints || ""],
        expectedOutput: data.expectedOutput || "",
        difficulty: data.difficulty || "easy",
        dataTypesRequired: data.dataTypesRequired || [],
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError("Failed to load activity.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity({ ...activity, [name]: value });
  };

  const handleHintChange = (index, value) => {
    const newHints = [...activity.hints];
    newHints[index] = value;
    setActivity({ ...activity, hints: newHints });
  };

  const addHint = () => setActivity({ ...activity, hints: [...activity.hints, ""] });
  const removeHint = (index) => {
    const newHints = activity.hints.filter((_, i) => i !== index);
    setActivity({ ...activity, hints: newHints });
  };

  const handleDataTypeToggle = (dt) => {
    const newList = activity.dataTypesRequired.includes(dt)
      ? activity.dataTypesRequired.filter((d) => d !== dt)
      : [...activity.dataTypesRequired, dt];
    setActivity({ ...activity, dataTypesRequired: newList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/activities/${id}`,
        activity,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/admin/lessons`);
    } catch (err) {
      console.error("Error updating activity:", err);
      setError("Failed to update activity.");
    }
  };

  if (loading) return <p className="p-3">Loading activity...</p>;
  if (error) return <p className="p-3 text-danger">{error}</p>;

  return (
    <div className="p-3">
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-white">Edit Activity</h3>
        </div>

        <Form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
          <Form.Group className="mb-3">
            <Form.Label>Activity Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={activity.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="instructions"
              value={activity.instructions}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hints</Form.Label>
            {activity.hints.map((hint, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={hint}
                  onChange={(e) => handleHintChange(index, e.target.value)}
                />
                <Button
                  variant="outline-danger"
                  onClick={() => removeHint(index)}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline-primary" size="sm" onClick={addHint}>
              + Add Hint
            </Button>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Expected Output</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="expectedOutput"
              value={activity.expectedOutput}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select
              name="difficulty"
              value={activity.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Required Data Types</Form.Label>
            <div className="d-flex flex-wrap gap-3">
              {validDataTypes.map((dt) => (
                <Form.Check
                  key={dt}
                  type="checkbox"
                  label={dt}
                  checked={activity.dataTypesRequired.includes(dt)}
                  onChange={() => handleDataTypeToggle(dt)}
                />
              ))}
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

export default EditActivity;
