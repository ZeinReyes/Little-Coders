import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form } from "react-bootstrap";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while", "do-while", "for",
];

function EditActivity() {
  const { lessonId, id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState({
    name: "",
    instructions: "",
    timeLimit: 30,
    hints: [""],
    expectedOutput: "",
    difficulty: "easy",
    // ✅ Array of { type, min } objects
    dataTypesRequired: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      // ✅ Normalize dataTypesRequired — handle old string[] format from DB gracefully
      const normalized = (data.dataTypesRequired || []).map((d) =>
        typeof d === "string" ? { type: d, min: 1 } : d
      );

      setActivity({
        name: data.name || "",
        instructions: data.instructions || "",
        hints: Array.isArray(data.hints) ? data.hints : [data.hints || ""],
        expectedOutput: data.expectedOutput || "",
        difficulty: data.difficulty || "easy",
        dataTypesRequired: normalized,
        timeLimit: data.timeLimit || 30,
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
    setActivity({ ...activity, hints: activity.hints.filter((_, i) => i !== index) });
  };

  // ✅ Toggle type — adds { type, min: 1 } or removes
  const handleDataTypeToggle = (type) => {
    const current = [...activity.dataTypesRequired];
    const exists = current.find((d) => d.type === type);
    if (exists) {
      setActivity({ ...activity, dataTypesRequired: current.filter((d) => d.type !== type) });
    } else {
      setActivity({ ...activity, dataTypesRequired: [...current, { type, min: 1 }] });
    }
  };

  // ✅ Update min for a type
  const handleMinChange = (type, value) => {
    const updated = activity.dataTypesRequired.map((d) =>
      d.type === type ? { ...d, min: Math.max(1, parseInt(value) || 1) } : d
    );
    setActivity({ ...activity, dataTypesRequired: updated });
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
            <Form.Control type="text" name="name" value={activity.name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control as="textarea" rows={3} name="instructions" value={activity.instructions} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hints</Form.Label>
            {activity.hints.map((hint, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <Form.Control type="text" value={hint} onChange={(e) => handleHintChange(index, e.target.value)} />
                <Button variant="outline-danger" onClick={() => removeHint(index)}>✕</Button>
              </div>
            ))}
            <Button variant="outline-primary" size="sm" onClick={addHint}>+ Add Hint</Button>
          </Form.Group>

          {/* Time Limit */}
          <div className="mb-3">
            <label className="form-label">Time Limit (seconds)</label>
            <input
              type="number"
              name="timeLimit"
              className="form-control"
              value={activity.timeLimit}
              min={30}
              required
              onChange={(e) => setActivity({ ...activity, timeLimit: parseInt(e.target.value) })}
            />
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Expected Output</Form.Label>
            <Form.Control as="textarea" rows={3} name="expectedOutput" value={activity.expectedOutput} onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Difficulty</Form.Label>
            <Form.Select name="difficulty" value={activity.difficulty} onChange={handleChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Form.Select>
          </Form.Group>

          {/* ✅ Data Types Required with min inputs */}
          <Form.Group className="mb-3">
            <Form.Label>Required Data Types</Form.Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {dataTypeOptions.map((type) => {
                const entry = activity.dataTypesRequired.find((d) => d.type === type);
                const isChecked = !!entry;
                return (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: isChecked ? "#e8f4ff" : "#f8f9fa",
                      border: isChecked ? "1px solid #90c8ff" : "1px solid #dee2e6",
                      borderRadius: "8px",
                      padding: "4px 10px",
                    }}
                  >
                    <Form.Check
                      type="checkbox"
                      label={type}
                      checked={isChecked}
                      onChange={() => handleDataTypeToggle(type)}
                    />
                    {isChecked && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#555" }}>min:</span>
                        <input
                          type="number"
                          min={1}
                          value={entry.min}
                          onChange={(e) => handleMinChange(type, e.target.value)}
                          style={{ width: "48px", padding: "2px 4px", fontSize: "13px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={() => navigate("/admin/lessons")}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default EditActivity;