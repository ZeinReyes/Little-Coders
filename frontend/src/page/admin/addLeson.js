import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "react-bootstrap";

function AddLesson() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState({
    variables: false,
    operators: false,
    conditionals: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTopics({ ...topics, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/lessons",
        { title, description, topics },
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
      <div className="bg-primary p-4 rounded">
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
            <label className="form-label">Topics Covered</label>
            <div className="d-flex gap-4 mt-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="variables"
                  name="variables"
                  checked={topics.variables}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="variables" className="form-check-label">
                  Variables
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="operators"
                  name="operators"
                  checked={topics.operators}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="operators" className="form-check-label">
                  Operators
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="conditionals"
                  name="conditionals"
                  checked={topics.conditionals}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="conditionals" className="form-check-label">
                  Conditionals
                </label>
              </div>
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
