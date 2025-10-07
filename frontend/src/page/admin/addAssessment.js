import React, { useState, useEffect } from "react";
import axios from "axios";

const AddAssessment = () => {
  const [formData, setFormData] = useState({
    title: "",
    instructions: "",
    hints: [""],
    expectedOutput: "",
    difficulty: "Easy",
    lessonId: "",
  });

  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ Fetch lessons to populate dropdown
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ match ManageLesson
        const res = await axios.get("http://localhost:5000/api/lessons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(res.data);
      } catch (err) {
        console.error("Error fetching lessons:", err.response?.data || err);
      }
    };
    fetchLessons();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle hint field changes
  const handleHintChange = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  const addHintField = () => {
    setFormData({ ...formData, hints: [...formData.hints, ""] });
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/assessments",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ ${res.data.message || "Assessment added successfully!"}`);

      // Reset form
      setFormData({
        title: "",
        instructions: "",
        hints: [""],
        expectedOutput: "",
        difficulty: "Easy",
        lessonId: "",
      });
    } catch (err) {
      console.error(err);
      setMessage(
        `❌ ${err.response?.data?.message || "Failed to add assessment."}`
      );
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Add New Assessment
      </h2>

      {message && (
        <p
          style={{
            textAlign: "center",
            color: message.startsWith("✅") ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          background: "#f9f9f9",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Title */}
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>

        {/* Instructions */}
        <div>
          <label>Instructions:</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="3"
            required
            className="form-control"
          />
        </div>

        {/* Hints */}
        <div>
          <label>Hints:</label>
          {formData.hints.map((hint, index) => (
            <input
              key={index}
              type="text"
              value={hint}
              onChange={(e) => handleHintChange(index, e.target.value)}
              placeholder={`Hint ${index + 1}`}
              className="form-control"
              style={{ marginBottom: "8px" }}
            />
          ))}
          <button
            type="button"
            onClick={addHintField}
            className="btn btn-secondary btn-sm"
          >
            ➕ Add Hint
          </button>
        </div>

        {/* Expected Output */}
        <div>
          <label>Expected Output:</label>
          <textarea
            name="expectedOutput"
            value={formData.expectedOutput}
            onChange={handleChange}
            rows="3"
            required
            className="form-control"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label>Difficulty:</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Lesson Dropdown */}
        <div>
          <label>Lesson:</label>
          <select
            name="lessonId"
            value={formData.lessonId}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Select a lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: "15px" }}
        >
          Submit Assessment
        </button>
      </form>
    </div>
  );
};

export default AddAssessment;
