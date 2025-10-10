import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";

function AddLesson() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState(""); // single selected topic
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRadioChange = (e) => {
    setTopic(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/lessons",
        { title, description, topic }, // send single topic
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/admin/lessons");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding lesson");
    }
  };

  return (
    <div className="p-3">
      <div className="p-4">
        <h3 className="text-white mb-3">Add New Lesson</h3>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded shadow-sm"
        >
          {error && <p className="text-danger">{error}</p>}

          <div className="mb-3">
            <label className="form-label">Lesson Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter lesson title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              placeholder="Enter description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Topic Covered</label>
            <div className="d-flex gap-4 mt-2">
              {["variables", "operators", "conditionals", "loops", "overview"].map((t) => (
                <div className="form-check" key={t}>
                  <input
                    type="radio"
                    className="form-check-input"
                    id={t}
                    name="topic"
                    value={t}
                    checked={topic === t}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor={t} className="form-check-label">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/admin/lessons")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Add Lesson
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLesson;
