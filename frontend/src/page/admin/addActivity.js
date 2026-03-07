import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while", "do-while", "for",
];

function AddActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    timeLimit: 30,
    hints: [""],
    difficulty: "easy",
    expectedOutput: "",
    // ✅ Now an array of { type, min } objects instead of plain strings
    dataTypesRequired: [],
  });

  const countWords = (text) => {
    const plain = text.replace(/<[^>]+>/g, "").trim();
    return plain ? plain.split(/\s+/).length : 0;
  };

  const handleHintChange = (index, value) => {
    const updated = [...formData.hints];
    updated[index] = value;
    setFormData({ ...formData, hints: updated });
  };

  const addHintBox = () => {
    if (formData.hints.length < 3) {
      setFormData({ ...formData, hints: [...formData.hints, ""] });
    }
  };

  const removeHintBox = (index) => {
    setFormData({
      ...formData,
      hints: formData.hints.filter((_, i) => i !== index),
    });
  };

  // ✅ Toggle a data type — adds { type, min: 1 } or removes it
  const handleDataTypeToggle = (type) => {
    const current = [...formData.dataTypesRequired];
    const exists = current.find((d) => d.type === type);
    if (exists) {
      setFormData({ ...formData, dataTypesRequired: current.filter((d) => d.type !== type) });
    } else {
      setFormData({ ...formData, dataTypesRequired: [...current, { type, min: 1 }] });
    }
  };

  // ✅ Update the min value for a specific type
  const handleMinChange = (type, value) => {
    const updated = formData.dataTypesRequired.map((d) =>
      d.type === type ? { ...d, min: Math.max(1, parseInt(value) || 1) } : d
    );
    setFormData({ ...formData, dataTypesRequired: updated });
  };

  const isInvalid =
    countWords(formData.instructions) > 70 ||
    formData.hints.some((h) => countWords(h) > 70);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInvalid) {
      alert("Instructions or hints exceed 70 words.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://little-coders-production.up.railway.app/api/activities/materials/${id}/activities`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(-1);
    } catch (err) {
      console.error("Error adding activity:", err);
      alert("Failed to add activity. Check console for details.");
    }
  };

  return (
    <div className="p-3">
      <Card className="shadow-sm">
        <Card.Body>
          <h3 className="mb-4">Add Activity</h3>
          <Form onSubmit={handleSubmit}>
            {/* Activity Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Activity Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter activity name"
                required
              />
            </Form.Group>

            {/* Instructions */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Instructions (max 70 words)</Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.instructions}
                onChange={(val) => setFormData({ ...formData, instructions: val })}
              />
              <small className={countWords(formData.instructions) > 70 ? "text-danger" : "text-muted"}>
                Word count: {countWords(formData.instructions)} / 70
              </small>
            </Form.Group>

            {/* Time Limit */}
            <div className="mb-3">
              <label className="form-label">Time Limit (seconds)</label>
              <input
                type="number"
                name="timeLimit"
                className="form-control"
                value={formData.timeLimit}
                min={30}
                required
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
              />
            </div>

            {/* Hints */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="fw-bold mb-0">Hints</Form.Label>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addHintBox}
                disabled={formData.hints.length >= 3}
              >
                + Add Hint
              </Button>
            </div>

            {formData.hints.map((hint, index) => (
              <div key={index} className="mb-3 border rounded p-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">Hint {index + 1}</span>
                  {formData.hints.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeHintBox(index)}>
                      Remove
                    </Button>
                  )}
                </div>
                <ReactQuill
                  theme="snow"
                  value={hint}
                  onChange={(val) => handleHintChange(index, val)}
                />
                <small className={countWords(hint) > 70 ? "text-danger" : "text-muted"}>
                  Word count: {countWords(hint)} / 70
                </small>
              </div>
            ))}

            {/* Expected Output */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Expected Output</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={formData.expectedOutput}
                onChange={(e) => setFormData({ ...formData, expectedOutput: e.target.value })}
                placeholder="Enter expected output"
                style={{ fontFamily: "Arial, sans-serif", whiteSpace: "pre-wrap" }}
              />
            </Form.Group>

            {/* Data Types Required */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data Types Required</Form.Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {dataTypeOptions.map((type) => {
                  const entry = formData.dataTypesRequired.find((d) => d.type === type);
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
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleDataTypeToggle(type)}
                        style={{ marginRight: "4px" }}
                      />
                      <span>{type}</span>
                      {/* ✅ Show min input only when checked */}
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

            {/* Difficulty */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Difficulty</Form.Label>
              <Form.Select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Form.Select>
            </Form.Group>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isInvalid}>Save Activity</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AddActivity;