import React, { useState, useEffect } from "react";
import axios from "axios";
import { Collapse, Button } from "react-bootstrap";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while"
];

const AddAssessment = () => {
  const [formData, setFormData] = useState({
    title: "",
    lessonId: "",
    timeLimit: 30,
    questions: [
      {
        instructions: "",
        hints: [""],
        expectedOutput: "",
        difficulty: "Easy",
        // ✅ Array of { type, min } objects
        dataTypesRequired: [],
      },
    ],
  });

  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState([0]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleHintChange = (qIndex, hIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].hints[hIndex] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addHint = (qIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].hints.push("");
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const deleteHint = (qIndex, hIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].hints.splice(hIndex, 1);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestions = [
      ...formData.questions,
      { instructions: "", hints: [""], expectedOutput: "", difficulty: "Easy", dataTypesRequired: [] },
    ];
    setFormData({ ...formData, questions: newQuestions });
    setExpandedQuestions([...expandedQuestions, newQuestions.length - 1]);
  };

  const deleteQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
    setExpandedQuestions(expandedQuestions.filter((i) => i !== index));
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // ✅ Toggle type for a question
  const handleDataTypeToggle = (qIndex, type) => {
    const updatedQuestions = [...formData.questions];
    const current = updatedQuestions[qIndex].dataTypesRequired;
    const exists = current.find((d) => d.type === type);
    updatedQuestions[qIndex].dataTypesRequired = exists
      ? current.filter((d) => d.type !== type)
      : [...current, { type, min: 1 }];
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // ✅ Update min for a type in a question
  const handleMinChange = (qIndex, type, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].dataTypesRequired = updatedQuestions[qIndex].dataTypesRequired.map((d) =>
      d.type === type ? { ...d, min: Math.max(1, parseInt(value) || 1) } : d
    );
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (formData.timeLimit < 30) {
        setMessage("❌ Time limit must be at least 30 seconds.");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/assessments", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ ${res.data.message || "Assessment added successfully!"}`);
      setFormData({
        title: "", lessonId: "", timeLimit: 30,
        questions: [{ instructions: "", hints: [""], expectedOutput: "", difficulty: "Easy", dataTypesRequired: [] }],
      });
      setExpandedQuestions([0]);
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.response?.data?.message || "Failed to add assessment."}`);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2 className="text-center mb-4">Add New Assessment</h2>

      {message && (
        <p style={{ textAlign: "center", color: message.startsWith("✅") ? "green" : "red", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="p-4 bg-light rounded shadow-sm">
        <div className="mb-3">
          <label className="form-label">Assessment Title</label>
          <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Select Lesson</label>
          <select name="lessonId" value={formData.lessonId} onChange={handleChange} className="form-select" required>
            <option value="">Select a lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Time Limit (seconds)</label>
          <input type="number" name="timeLimit" className="form-control" value={formData.timeLimit} min={30} onChange={handleChange} required />
        </div>

        <h5 className="mt-4 mb-3">Questions</h5>

        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="border rounded mb-3 bg-white shadow-sm">
            <div
              className="d-flex justify-content-between align-items-center p-3 bg-primary text-white"
              style={{ cursor: "pointer" }}
              onClick={() => toggleQuestion(qIndex)}
            >
              <strong>Question {qIndex + 1}</strong>
              <Button variant="light" size="sm" onClick={(e) => { e.stopPropagation(); deleteQuestion(qIndex); }}>
                Delete
              </Button>
            </div>

            <Collapse in={expandedQuestions.includes(qIndex)}>
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label">Instructions</label>
                  <textarea className="form-control" rows="2" value={question.instructions}
                    onChange={(e) => handleQuestionChange(qIndex, "instructions", e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Hints</label>
                  {question.hints.map((hint, hIndex) => (
                    <div key={hIndex} className="d-flex align-items-center mb-2 gap-2">
                      <input type="text" className="form-control" value={hint} placeholder={`Hint ${hIndex + 1}`}
                        onChange={(e) => handleHintChange(qIndex, hIndex, e.target.value)} />
                      <Button variant="outline-danger" size="sm" onClick={() => deleteHint(qIndex, hIndex)}>Delete</Button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addHint(qIndex)}>➕ Add Hint</button>
                </div>

                <div className="mb-3">
                  <label className="form-label">Expected Output</label>
                  <textarea className="form-control" rows="2" value={question.expectedOutput}
                    onChange={(e) => handleQuestionChange(qIndex, "expectedOutput", e.target.value)} />
                </div>

                {/* ✅ Data Types with min inputs */}
                <div className="mb-3">
                  <label className="form-label">Data Types Required</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {dataTypeOptions.map((type) => {
                      const entry = question.dataTypesRequired.find((d) => d.type === type);
                      const isChecked = !!entry;
                      return (
                        <div
                          key={type}
                          style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            background: isChecked ? "#e8f4ff" : "#f8f9fa",
                            border: isChecked ? "1px solid #90c8ff" : "1px solid #dee2e6",
                            borderRadius: "8px", padding: "4px 10px",
                          }}
                        >
                          <input type="checkbox" checked={isChecked} onChange={() => handleDataTypeToggle(qIndex, type)} style={{ marginRight: "4px" }} />
                          <span>{type}</span>
                          {isChecked && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "6px" }}>
                              <span style={{ fontSize: "12px", color: "#555" }}>min:</span>
                              <input
                                type="number" min={1} value={entry.min}
                                onChange={(e) => handleMinChange(qIndex, type, e.target.value)}
                                style={{ width: "48px", padding: "2px 4px", fontSize: "13px", borderRadius: "4px", border: "1px solid #ccc" }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Difficulty</label>
                  <select className="form-select" value={question.difficulty}
                    onChange={(e) => handleQuestionChange(qIndex, "difficulty", e.target.value)}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </Collapse>
          </div>
        ))}

        <button type="button" className="btn btn-outline-primary mb-4" onClick={addQuestion}>➕ Add Another Question</button>
        <button type="submit" className="btn btn-primary w-100">Submit Assessment</button>
      </form>
    </div>
  );
};

export default AddAssessment;