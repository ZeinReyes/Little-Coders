import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditMaterial() {
  const { lessonId, id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [contents, setContents] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  // ✅ Fetch existing material
  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE}/materials/lessons/${lessonId}/materials/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTitle(res.data.title || "");
        setOverview(res.data.overview || "");
        // Handle both string and array formats for contents
        if (Array.isArray(res.data.contents)) {
          setContents(res.data.contents);
        } else {
          setContents([res.data.contents || ""]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching material:", err);
        setError("Failed to load material.");
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [lessonId, id]);

  // ✅ Count words (ignores HTML tags)
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

  // ✅ Validation check
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
      await axios.put(
        `${API_BASE}/materials/${id}`,
        {
          title: title.trim(),
          overview,
          contents,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/admin/lessons`);
    } catch (err) {
      console.error("Error updating material:", err);
      setError(err.response?.data?.message || "Failed to update material.");
    }
  };

  if (loading) return <p className="p-3">Loading material...</p>;
  if (error && !loading) return <p className="p-3 text-danger">{error}</p>;

  return (
    <div className="p-3">
      <div className="bg-primary p-4 rounded">
        <h3 className="text-white mb-3">Edit Material</h3>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
          {error && <p className="text-danger">{error}</p>}

          {/* Title */}
          <div className="mb-3">
            <label className="form-label fw-bold">Material Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter material title"
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
              <div className="text-danger">
                ⚠ Overview must not exceed 70 words.
              </div>
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
              onClick={() => navigate(`/admin/lessons`)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isInvalid}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
