import React, { useState, useEffect } from "react";
import axios from "axios";
import { Collapse, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while"
];

const EditAssessment = () => {
  const { id } = useParams(); // from route (assessment id)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    lessonId: "",
    timeLimit: 30, // ✅ added default time limit
    questions: [],
  });

  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState([]); // open questions

  // ✅ Fetch all lessons
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

  // ✅ Fetch assessment to edit
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const a = res.data?.data || res.data || {};
        setFormData({
          title: a.title || "",
          lessonId: a.lessonId?._id || a.lessonId || "",
          timeLimit: a.timeLimit || 30, // ✅ set time limit from backend
          questions: Array.isArray(a.questions) ? a.questions : [],
        });

        // expand all questions by default
        setExpandedQuestions(
          Array.isArray(a.questions) ? a.questions.map((_, i) => i) : []
        );
      } catch (err) {
        console.error("Error fetching assessment:", err.response?.data || err.message);
        setMessage("❌ Failed to load assessment details. Please check your connection or ID.");
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  // ✅ Handle main input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle question field change
  const handleQuestionChange = (index, field, value) => {
    const updated = [...formData.questions];
    updated[index][field] = value;
    setFormData({ ...formData, questions: updated });
  };

  // ✅ Handle hint changes
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
    const newQuestion = {
      instructions: "",
      hints: [""],
      expectedOutput: "",
      difficulty: "Easy",
      dataTypesRequired: [],
    };
    const newQuestions = [...formData.questions, newQuestion];
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

  const handleDataTypeChange = (qIndex, type) => {
    const updated = [...formData.questions];
    const current = updated[qIndex].dataTypesRequired;
    updated[qIndex].dataTypesRequired = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setFormData({ ...formData, questions: updated });
  };

  // ✅ Submit (update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.timeLimit < 30) {
      setMessage("❌ Time limit must be at least 30 seconds.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/assessments/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
        className="p-4 bg-light rounded shadow-sm"
      >
        {/* Assessment Title */}
        <div className="mb-3">
          <label className="form-label">Assessment Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Lesson Dropdown */}
        <div className="mb-3">
          <label className="form-label">Select Lesson</label>
          <select
            name="lessonId"
            value={formData.lessonId}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select a lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson._id} value={lesson._id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>

        {/* Time Limit */}
        <div className="mb-3">
          <label className="form-label">Time Limit (seconds)</label>
          <input
            type="number"
            name="timeLimit"
            className="form-control"
            value={formData.timeLimit}
            min={30}
            onChange={handleChange}
            required
          />
        </div>

        {/* Questions Section */}
        <h5 className="mt-4 mb-3">Questions</h5>

        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="border rounded mb-3 bg-white shadow-sm">
            {/* Header */}
            <div
              className="d-flex justify-content-between align-items-center p-3 bg-primary text-white"
              style={{ cursor: "pointer" }}
              onClick={() => toggleQuestion(qIndex)}
            >
              <strong>Question {qIndex + 1}</strong>
              <Button
                variant="light"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuestion(qIndex);
                }}
              >
                Delete
              </Button>
            </div>

            <Collapse in={expandedQuestions.includes(qIndex)}>
              <div>
                <div className="p-3">
                  {/* Instructions */}
                  <div className="mb-3">
                    <label className="form-label">Instructions</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={question.instructions}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "instructions", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Hints */}
                  <div className="mb-3">
                    <label className="form-label">Hints</label>
                    {question.hints.map((hint, hIndex) => (
                      <div
                        key={hIndex}
                        className="d-flex align-items-center mb-2 gap-2"
                      >
                        <input
                          type="text"
                          className="form-control"
                          value={hint}
                          onChange={(e) =>
                            handleHintChange(qIndex, hIndex, e.target.value)
                          }
                          placeholder={`Hint ${hIndex + 1}`}
                        />
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteHint(qIndex, hIndex)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => addHint(qIndex)}
                    >
                      ➕ Add Hint
                    </button>
                  </div>

                  {/* Expected Output */}
                  <div className="mb-3">
                    <label className="form-label">Expected Output</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={question.expectedOutput}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "expectedOutput", e.target.value)
                      }
                    />
                  </div>

                  {/* Data Types */}
                  <div className="mb-3">
                    <label className="form-label">Data Types Required</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {dataTypeOptions.map((type) => (
                        <label key={type}>
                          <input
                            type="checkbox"
                            checked={question.dataTypesRequired.includes(type)}
                            onChange={() => handleDataTypeChange(qIndex, type)}
                            style={{ marginRight: "5px" }}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="mb-3">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="form-select"
                      value={question.difficulty}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "difficulty", e.target.value)
                      }
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </Collapse>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline-primary mb-4"
          onClick={addQuestion}
        >
          ➕ Add Another Question
        </button>

        <button type="submit" className="btn btn-primary w-100">
          💾 Update Assessment
        </button>
      </form>
    </div>
  );
};

export default EditAssessment;
