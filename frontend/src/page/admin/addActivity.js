import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while"
];

function AddActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    hints: [""],
    difficulty: "easy",
    expectedOutput: "",
    dataTypesRequired: [], // ✅ New field
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

  const isInvalid =
    countWords(formData.instructions) > 70 ||
    formData.hints.some((h) => countWords(h) > 70);

  // ✅ Handle Data Type checkbox toggle
  const handleDataTypeChange = (type) => {
    const current = [...formData.dataTypesRequired];
    if (current.includes(type)) {
      setFormData({
        ...formData,
        dataTypesRequired: current.filter((t) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        dataTypesRequired: [...current, type],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInvalid) return;

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
            {/* Activity Name */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Activity Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter activity name"
                required
              />
            </Form.Group>

            {/* Instructions */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                Instructions (max 70 words)
              </Form.Label>
              <ReactQuill
                theme="snow"
                value={formData.instructions}
                onChange={(val) =>
                  setFormData({ ...formData, instructions: val })
                }
              />
              <small
                className={
                  countWords(formData.instructions) > 70
                    ? "text-danger"
                    : "text-muted"
                }
              >
                Word count: {countWords(formData.instructions)} / 70
              </small>
              {countWords(formData.instructions) > 70 && (
                <div className="text-danger">
                  ⚠ Instructions must not exceed 70 words.
                </div>
              )}
            </Form.Group>

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
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeHintBox(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <ReactQuill
                  theme="snow"
                  value={hint}
                  onChange={(val) => handleHintChange(index, val)}
                />
                <small
                  className={countWords(hint) > 70 ? "text-danger" : "text-muted"}
                >
                  Word count: {countWords(hint)} / 70
                </small>
                {countWords(hint) > 70 && (
                  <div className="text-danger">
                    ⚠ Hint {index + 1} must not exceed 70 words.
                  </div>
                )}
              </div>
            ))}

            {/* Expected Output */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Activity Expected Output</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={formData.expectedOutput}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutput: e.target.value })
                }
                placeholder="Enter the expected output for this activity (can include images/text)"
                style={{ fontFamily: "Arial, sans-serif", whiteSpace: "pre-wrap" }}
              />
              <small className="text-muted">
                Supports paragraphs, spacing, and pasting images directly.
              </small>
            </Form.Group>

            {/* Data Types Required */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Data Type Required</Form.Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {dataTypeOptions.map((type) => (
                  <label key={type} style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={formData.dataTypesRequired.includes(type)}
                      onChange={() => handleDataTypeChange(type)}
                      style={{ marginRight: "5px" }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </Form.Group>

            {/* Difficulty */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Difficulty</Form.Label>
              <Form.Select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Form.Select>
            </Form.Group>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/admin/lessons/${id}/manage`)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isInvalid}>
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
