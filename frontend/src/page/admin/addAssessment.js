import React, { useState, useEffect } from "react";
import axios from "axios";

const AddAssessment = () => {
  const [formData, setFormData] = useState({
    title: "",
    question: "",
    instructions: "",
    hints: [""],
    difficulty: "Easy",
    lessonId: "",
    dataTypeChecks: [], // ✅ operators & keywords
    expectedOutput: "",
    category: "Logic and Control Flow",
  });

  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ Default data type/operator options
  const checkOptions = [
    "print",
    "variable",
    "if",
    "elif",
    "else",
    "for",
    "while",
    "+",
    "-",
    "*",
    "/",
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
  ];

  // ✅ Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("token");
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

  // ✅ Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Toggle operator/data type selection (click = required: true)
const toggleCheck = (name) => {
  setFormData((prev) => {
    const exists = prev.dataTypeChecks.find((c) => c.name === name);
    if (exists) {
      // Remove if already selected
      return {
        ...prev,
        dataTypeChecks: prev.dataTypeChecks.filter((c) => c.name !== name),
      };
    } else {
      // Add with required: true
      return { ...prev, dataTypeChecks: [...prev.dataTypeChecks, { name, required: true }] };
    }
  });
};


  // ✅ Toggle required flag for each check
  const toggleRequired = (name) => {
    setFormData((prev) => ({
      ...prev,
      dataTypeChecks: prev.dataTypeChecks.map((c) =>
        c.name === name ? { ...c, required: !c.required } : c
      ),
    }));
  };

  // ✅ Add assessment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        hints: formData.hints.filter((h) => h.trim() !== ""),
      };

      const res = await axios.post("http://localhost:5000/api/assessments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ ${res.data.message || "Assessment added successfully!"}`);

      setFormData({
        title: "",
        question: "",
        instructions: "",
        hints: [""],
        difficulty: "Easy",
        lessonId: "",
        dataTypeChecks: [],
        expectedOutput: "",
        category: "Logic and Control Flow",
      });
    } catch (err) {
      console.error("Error submitting assessment:", err.response?.data || err);
      setMessage(`❌ ${err.response?.data?.message || "Failed to add assessment."}`);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add New Assessment</h2>

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

        {/* Question */}
        <div>
          <label>Question:</label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
            rows="2"
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
              onChange={(e) => {
                const newHints = [...formData.hints];
                newHints[index] = e.target.value;
                setFormData({ ...formData, hints: newHints });
              }}
              placeholder={`Hint ${index + 1}`}
              className="form-control"
              style={{ marginBottom: "8px" }}
            />
          ))}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, hints: [...formData.hints, ""] })}
            className="btn btn-secondary btn-sm"
          >
            ➕ Add Hint
          </button>
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

        {/* Data Type / Operator Checks */}
        <div>
  <label>Data Type & Operator Checks:</label>
  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
    {checkOptions.map((name) => {
      const selected = formData.dataTypeChecks.find((c) => c.name === name);
      return (
        <div
          key={name}
          onClick={() => toggleCheck(name)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            borderRadius: "20px",
            border: selected ? "2px solid #007bff" : "1px solid #ccc",
            backgroundColor: selected ? "#007bff" : "#f2f2f2",
            color: selected ? "white" : "black",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {selected && (
            <input
              type="checkbox"
              checked={selected.required}
              readOnly
              style={{ marginRight: "6px" }} // ✅ move checkbox to left
            />
          )}
          <span>{name}</span>
        </div>
      );
    })}
  </div>
</div>


        {/* Expected Output */}
        <div>
          <label>Expected Output (optional):</label>
          <input
            type="text"
            name="expectedOutput"
            value={formData.expectedOutput}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: "15px" }}>
          Submit Assessment
        </button>
      </form>
    </div>
  );
};

export default AddAssessment;
