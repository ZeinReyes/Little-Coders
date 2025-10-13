import React, { useState } from "react";
import axios from "axios";

const AddActivity = () => {
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    hints: [""],
    difficulty: "easy",
    dataTypeChecks: [],
    expectedOutput: "",
  });

  const [message, setMessage] = useState("");

  // ✅ Default operator / keyword options
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

  // ✅ Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Toggle operator/keyword selection
  const toggleCheck = (name) => {
    setFormData((prev) => {
      const exists = prev.dataTypeChecks.find((c) => c.name === name);
      if (exists) {
        return {
          ...prev,
          dataTypeChecks: prev.dataTypeChecks.filter((c) => c.name !== name),
        };
      } else {
        return {
          ...prev,
          dataTypeChecks: [...prev.dataTypeChecks, { name, required: true }],
        };
      }
    });
  };

  // ✅ Toggle required flag for a check
  const toggleRequired = (name) => {
    setFormData((prev) => ({
      ...prev,
      dataTypeChecks: prev.dataTypeChecks.map((c) =>
        c.name === name ? { ...c, required: !c.required } : c
      ),
    }));
  };

  // ✅ Add new hint
  const addHint = () => {
    setFormData({ ...formData, hints: [...formData.hints, ""] });
  };

  // ✅ Update hint
  const updateHint = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  // ✅ Submit activity
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        hints: formData.hints.filter((h) => h.trim() !== ""),
      };

      const res = await axios.post(
        "http://localhost:5000/api/activities",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(`✅ ${res.data.message || "Activity added successfully!"}`);

      // Reset form
      setFormData({
        name: "",
        instructions: "",
        hints: [""],
        difficulty: "easy",
        dataTypeChecks: [],
        expectedOutput: "",
      });
    } catch (err) {
      console.error(err);
      setMessage(
        `❌ ${err.response?.data?.message || "Failed to add activity."}`
      );
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Add New Activity
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
        {/* Name */}
        <div>
          <label>Activity Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
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
              onChange={(e) => updateHint(index, e.target.value)}
              placeholder={`Hint ${index + 1}`}
              className="form-control"
              style={{ marginBottom: "8px" }}
            />
          ))}
          <button type="button" onClick={addHint} className="btn btn-secondary btn-sm">
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
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Operator / Keyword Checks */}
        <div>
          <label>Data Type / Operator Checks:</label>
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
                      style={{ marginRight: "6px" }}
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
          Submit Activity
        </button>
      </form>
    </div>
  );
};

export default AddActivity;
