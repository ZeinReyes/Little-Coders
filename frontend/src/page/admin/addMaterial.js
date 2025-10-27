import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function AddMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [contents, setContents] = useState([""]); // multiple content sections
  const [error, setError] = useState("");

  // ✅ Count words (ignores HTML tags from ReactQuill)
  const countWords = (text) => {
    const plain = text.replace(/<[^>]+>/g, "").trim();
    return plain ? plain.split(/\s+/).length : 0;
  };

  const handleContentChange = (index, value) => {
    const newContents = [...contents];
    newContents[index] = value;
    setContents(newContents);
  };

  const addContentBox = () => {
    setContents([...contents, ""]);
  };

  const removeContentBox = (index) => {
    const newContents = contents.filter((_, i) => i !== index);
    setContents(newContents);
  };

  // ✅ Validation check (disable Save if invalid)
  const isInvalid =
    countWords(overview) > 70 || contents.some((c) => countWords(c) > 70);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/materials/lessons/${id}/materials`,
        { title: title.trim(), overview, contents },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/admin/lessons`);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding material");
      console.error("Error adding material:", err);
    }
  };

  return (
    <div className="p-3">
      <div className="bg-primary p-4 rounded">
        <h3 className="text-white mb-3">Add Lesson</h3>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
          {error && <p className="text-danger">{error}</p>}

          {/* Title */}
          <div className="mb-3">
            <label className="form-label fw-bold">Lesson Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter lesson title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Overview */}
          <div className="mb-3">
            <label className="form-label fw-bold">Overview (max 70 words)</label>
            <ReactQuill value={overview} onChange={setOverview} theme="snow" />
            <small
              className={
                countWords(overview) > 70 ? "text-danger" : "text-muted"
              }
            >
              Word count: {countWords(overview)} / 70
            </small>
            {countWords(overview) > 70 && (
              <div className="text-danger">⚠ Overview must not exceed 70 words.</div>
            )}
          </div>

          {/* Contents */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-bold mb-0">
              Contents (max 70 words each)
            </label>
            <Button variant="outline-primary" size="sm" onClick={addContentBox}>
              + Add Content
            </Button>
          </div>

          {contents.map((content, index) => (
            <div key={index} className="mb-3 border rounded p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Content {index + 1}</span>
                {contents.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeContentBox(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(val) => handleContentChange(index, val)}
              />
              <small
                className={
                  countWords(content) > 70 ? "text-danger" : "text-muted"
                }
              >
                Word count: {countWords(content)} / 70
              </small>
              {countWords(content) > 70 && (
                <div className="text-danger">
                  ⚠ Content {index + 1} must not exceed 70 words.
                </div>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/admin/lessons/`)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isInvalid}>
              Save Lesson
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
