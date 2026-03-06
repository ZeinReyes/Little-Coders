import React, { useState, useEffect } from "react";
import axios from "axios";
import { Collapse, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while", "do-while", "for",
];

const EditAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "", lessonId: "", timeLimit: 30, questions: [],
  });

  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://little-coders-backend.onrender.com/api/lessons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(res.data);
      } catch (err) {
        console.error("Error fetching lessons:", err.response?.data || err);
      }
    };
    fetchLessons();
  }, []);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://little-coders-backend.onrender.com/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const a = res.data?.data || res.data || {};

        // ✅ Normalize dataTypesRequired — handle old string[] format from DB gracefully
        const normalizedQuestions = (Array.isArray(a.questions) ? a.questions : []).map((q) => ({
          ...q,
          dataTypesRequired: (q.dataTypesRequired || []).map((d) =>
            typeof d === "string" ? { type: d, min: 1 } : d
          ),
        }));

        setFormData({
          title: a.title || "",
          lessonId: a.lessonId?._id || a.lessonId || "",
          timeLimit: a.timeLimit || 30,
          questions: normalizedQuestions,
        });

        setExpandedQuestions(normalizedQuestions.map((_, i) => i));
      } catch (err) {
        console.error("Error fetching assessment:", err.response?.data || err.message);
        setMessage("❌ Failed to load assessment details.");
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  const handleHintChange = (qIndex, hIndex, value) => {
    const updated = [...formData.questions];
    updated[qIndex].hints[hIndex] = value;
    setFormData({ ...formData, questions: updated });
  };

  const addHint = (qIndex) => {
    const updated = [...formData.questions];
    updated[qIndex].hints.push("");
    setFormData({ ...formData, questions: updated });
  };

  const deleteHint = (qIndex, hIndex) => {
    const updated = [...formData.questions];
    updated[qIndex].hints.splice(hIndex, 1);
    setFormData({ ...formData, questions: updated });
  };

  const addQuestion = () => {
    const newQuestion = { instructions: "", hints: [""], expectedOutput: "", difficulty: "Easy", dataTypesRequired: [] };
    const newQuestions = [...formData.questions, newQuestion];
    setFormData({ ...formData, questions: newQuestions });
    setExpandedQuestions([...expandedQuestions, newQuestions.length - 1]);
  };

  const deleteQuestion = (index) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });
    setExpandedQuestions(expandedQuestions.filter((i) => i !== index));
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // ✅ Toggle type for a question
  const handleDataTypeToggle = (qIndex, type) => {
    const updated = [...formData.questions];
    const current = updated[qIndex].dataTypesRequired;
    const exists = current.find((d) => d.type === type);
    updated[qIndex].dataTypesRequired = exists
      ? current.filter((d) => d.type !== type)
      : [...current, { type, min: 1 }];
    setFormData({ ...formData, questions: updated });
  };

  // ✅ Update min for a type in a question
  const handleMinChange = (qIndex, type, value) => {
    const updated = [...formData.questions];
    updated[qIndex].dataTypesRequired = updated[qIndex].dataTypesRequired.map((d) =>
      d.type === type ? { ...d, min: Math.max(1, parseInt(value) || 1) } : d
    );
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.timeLimit < 30) {
      setMessage("❌ Time limit must be at least 30 seconds.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`https://little-coders-backend.onrender.com/api/assessments/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ ${res.data.message || "Assessment updated successfully!"}`);
      setTimeout(() => navigate("/admin/manage-assessment"), 1500);
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.response?.data?.message || "Failed to update assessment."}`);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2 className="text-center mb-4">Edit Assessment</h2>

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
              <Button variant="light" size="sm" onClick={(e) => { e.stopPropagation(); deleteQuestion(qIndex); }}>Delete</Button>
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
        <button type="submit" className="btn btn-primary w-100">💾 Update Assessment</button>
      </form>
    </div>
  );
};

export default EditAssessment;