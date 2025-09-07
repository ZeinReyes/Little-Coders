import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";

export default function AddMaterial() {
  const { id } = useParams();    
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [contents, setContents] = useState([""]);
  const [error, setError] = useState("");

  const addContentRow = () => setContents([...contents, ""]);
  const removeContentRow = (idx) =>
    setContents(contents.filter((_, i) => i !== idx));
  const handleContentChange = (idx, v) => {
    const copy = [...contents];
    copy[idx] = v;
    setContents(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleaned = contents.map(c => c.trim()).filter(Boolean);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (cleaned.length === 0) {
      setError("Add at least one content item.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/materials/lessons/${id}/materials`,
        { title: title.trim(), contents: cleaned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/admin/lessons/${id}/manage`);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding material");
      console.error("Error adding material:", err);
    }
  };

  return (
    <div className="p-3">
      <div className="bg-primary p-4 rounded">
        <h3 className="text-white mb-3">Add Material</h3>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
          {error && <p className="text-danger">{error}</p>}

          <div className="mb-3">
            <label className="form-label">Material Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter material title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">Content</label>
            <Button type="button" variant="outline-primary" onClick={addContentRow}>
              + Add More Content
            </Button>
          </div>

          {contents.map((c, idx) => (
            <div className="input-group mb-2" key={idx}>
              <textarea
                className="form-control"
                rows={2}
                placeholder={`Content ${idx + 1}`}
                value={c}
                onChange={(e) => handleContentChange(idx, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeContentRow(idx)}
                disabled={contents.length === 1}
                title="Remove"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          ))}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => navigate(`/admin/lessons/${id}/manage`)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save Material
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
