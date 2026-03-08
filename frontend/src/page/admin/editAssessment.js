import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const dataTypeOptions = [
  "print", "variable", "multiply", "add", "subtract", "divide",
  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while", "do-while", "for",
];

const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-page{max-width:900px;margin:0 auto;}
.ds-back{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-family:'DM Mono',monospace;color:#64748b;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s;}
.ds-back:hover{color:#0f172a;}
.ds-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;}
.ds-header h1{font-size:1.45rem;font-weight:700;letter-spacing:-.03em;color:#0f172a;}
.ds-header p{font-size:.78rem;color:#94a3b8;margin-top:3px;}
.ds-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:1rem;}
.ds-panel-head{padding:1.1rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;}
.ds-panel-head-left{display:flex;align-items:center;gap:10px;}
.ds-panel-head-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;}
.ds-panel-head span{font-size:.82rem;font-weight:600;color:#0f172a;}
.ds-panel-body{padding:1.5rem;}
.ds-section{margin-bottom:1.5rem;}
.ds-label{font-size:.72rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#94a3b8;font-family:'DM Mono',monospace;margin-bottom:.5rem;display:block;}
.ds-input,.ds-textarea,.ds-select{width:100%;padding:.6rem .9rem;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;outline:none;transition:border-color .15s,box-shadow .15s;resize:vertical;}
.ds-input::placeholder,.ds-textarea::placeholder{color:#c1c8d4;}
.ds-input:focus,.ds-textarea:focus,.ds-select:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
.ds-input-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
@media(max-width:600px){.ds-input-row{grid-template-columns:1fr;}}
.ds-hint-row{display:flex;gap:8px;margin-bottom:8px;align-items:center;}
.ds-hint-row .ds-input{flex:1;}
.ds-remove-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:1.5px solid #fecaca;border-radius:8px;color:#dc2626;cursor:pointer;font-size:14px;flex-shrink:0;transition:all .15s;}
.ds-remove-btn:hover{background:#fef2f2;}
.ds-add-btn{display:inline-flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:.72rem;color:#2563eb;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:5px 12px;cursor:pointer;transition:all .15s;margin-top:4px;}
.ds-add-btn:hover{background:#dbeafe;}
.ds-chip-grid{display:flex;flex-wrap:wrap;gap:8px;}
.ds-chip{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;cursor:pointer;transition:all .15s;user-select:none;}
.ds-chip.active{background:#eff6ff;border-color:#93c5fd;}
.ds-chip input[type=checkbox]{accent-color:#2563eb;width:13px;height:13px;cursor:pointer;}
.ds-chip-label{font-size:.75rem;font-family:'DM Mono',monospace;color:#64748b;}
.ds-chip.active .ds-chip-label{color:#1d4ed8;}
.ds-chip-min{display:flex;align-items:center;gap:4px;border-left:1px solid #bfdbfe;padding-left:8px;margin-left:2px;}
.ds-chip-min span{font-size:.65rem;color:#64748b;}
.ds-chip-min input{width:42px;padding:2px 5px;font-size:.72rem;border:1px solid #cbd5e1;border-radius:5px;text-align:center;outline:none;font-family:'DM Mono',monospace;}
.ds-diff-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.ds-diff-card{padding:.65rem;border:1.5px solid #e2e8f0;border-radius:9px;text-align:center;cursor:pointer;transition:all .15s;font-size:.76rem;font-weight:500;}
.ds-diff-card.Easy,.ds-diff-card.easy{border-color:#a7f3d0;background:#ecfdf5;color:#059669;}
.ds-diff-card.Medium,.ds-diff-card.medium{border-color:#fde68a;background:#fffbeb;color:#d97706;}
.ds-diff-card.Hard,.ds-diff-card.hard{border-color:#fca5a5;background:#fef2f2;color:#dc2626;}
.ds-footer{display:flex;justify-content:flex-end;gap:.75rem;padding:1.1rem 1.5rem;border-top:1px solid #f1f5f9;background:#fafbfc;}
.ds-btn{font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.4rem;border-radius:9px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
.ds-btn-ghost{background:transparent;border:1.5px solid #d1d5db;color:#64748b;}
.ds-btn-ghost:hover{background:#f1f5f9;color:#374151;}
.ds-btn-primary{background:#1e293b;color:#fff;border:1.5px solid transparent;}
.ds-btn-primary:hover:not(:disabled){background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);transform:translateY(-1px);}
.ds-btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.ds-btn-outline-danger{background:transparent;border:1.5px solid #fecaca;color:#dc2626;font-size:.75rem;padding:.35rem .9rem;border-radius:8px;}
.ds-btn-outline-danger:hover{background:#fef2f2;}
.ds-btn-danger{background:#dc2626;color:#fff;border:1.5px solid transparent;font-size:.75rem;padding:.35rem .9rem;border-radius:8px;}
.ds-alert{padding:.8rem 1.1rem;border-radius:10px;font-size:.8rem;font-weight:500;margin-bottom:1.25rem;display:flex;align-items:center;gap:8px;}
.ds-alert-success{background:#ecfdf5;border:1px solid #a7f3d0;color:#059669;}
.ds-alert-error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;}
.ds-q-header{background:#1e293b;color:#fff;padding:.9rem 1.2rem;display:flex;justify-content:space-between;align-items:center;cursor:pointer;border-radius:12px 12px 0 0;}
.ds-q-body{padding:1.25rem;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;}
.ds-q-collapsed .ds-q-body{display:none;}
.ds-q-wrap{border-radius:12px;overflow:hidden;margin-bottom:.75rem;border:1px solid #e2e8f0;}
.ds-divider{height:1px;background:#f1f5f9;margin:1.25rem 0;}
`;

export default function EditAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: "", lessonId: "", timeLimit: 30, questions: [] });
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://little-coders-production.up.railway.app/api/lessons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(res.data);
      } catch (err) { console.error(err); }
    };
    fetchLessons();
  }, []);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://little-coders-production.up.railway.app/api/assessments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const a = res.data?.data || res.data || {};
        const normalizedQuestions = (Array.isArray(a.questions) ? a.questions : []).map((q) => ({
          ...q,
          dataTypesRequired: (q.dataTypesRequired || []).map((d) =>
            typeof d === "string" ? { type: d, min: 1 } : d
          ),
        }));
        setFormData({ title: a.title || "", lessonId: a.lessonId?._id || a.lessonId || "", timeLimit: a.timeLimit || 30, questions: normalizedQuestions });
        setExpandedQuestions(normalizedQuestions.map((_, i) => i));
      } catch { setMessage("❌ Failed to load assessment."); }
    };
    if (id) fetchAssessment();
  }, [id]);

  const handleDataTypeToggle = (qIndex, type) => {
    const updated = [...formData.questions];
    const current = updated[qIndex].dataTypesRequired;
    const exists = current.find((d) => d.type === type);
    updated[qIndex].dataTypesRequired = exists ? current.filter((d) => d.type !== type) : [...current, { type, min: 1 }];
    setFormData({ ...formData, questions: updated });
  };

  const handleMinChange = (qIndex, type, value) => {
    const updated = [...formData.questions];
    updated[qIndex].dataTypesRequired = updated[qIndex].dataTypesRequired.map((d) =>
      d.type === type ? { ...d, min: Math.max(1, parseInt(value) || 1) } : d
    );
    setFormData({ ...formData, questions: updated });
  };

  const addQuestion = () => {
    const newQ = { instructions: "", hints: [""], expectedOutput: "", difficulty: "Easy", dataTypesRequired: [] };
    const newQs = [...formData.questions, newQ];
    setFormData({ ...formData, questions: newQs });
    setExpandedQuestions([...expandedQuestions, newQs.length - 1]);
  };

  const deleteQuestion = (index) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });
    setExpandedQuestions(expandedQuestions.filter((i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.timeLimit < 30) { setMessage("❌ Time limit must be at least 30 seconds."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`https://little-coders-production.up.railway.app/api/assessments/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`✅ ${res.data.message || "Assessment updated successfully!"}`);
      setTimeout(() => navigate("/admin/manage-assessment"), 1500);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || "Failed to update."}`);
      setSaving(false);
    }
  };

  return (
    <>
      <style>{DS}</style>
      <div className="ds-root">
        <div className="ds-page">
          <button className="ds-back" onClick={() => navigate("/admin/manage-assessment")}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
            </svg>
            Back to Assessments
          </button>

          <div className="ds-header">
            <div>
              <h1>Edit Assessment</h1>
              <p>Update questions and assessment settings</p>
            </div>
          </div>

          {message && (
            <div className={`ds-alert ${message.startsWith("✅") ? "ds-alert-success" : "ds-alert-error"}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Meta panel */}
            <div className="ds-panel">
              <div className="ds-panel-head">
                <div className="ds-panel-head-left">
                  <div className="ds-panel-head-icon" style={{background:"#fef2f2"}}>📋</div>
                  <span>Assessment Info</span>
                </div>
              </div>
              <div className="ds-panel-body">
                <div className="ds-input-row ds-section">
                  <div>
                    <label className="ds-label">Title</label>
                    <input className="ds-input" type="text" value={formData.title} required
                      onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Assessment title"/>
                  </div>
                  <div>
                    <label className="ds-label">Time Limit (seconds)</label>
                    <input className="ds-input" type="number" min={30} value={formData.timeLimit} required
                      onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}/>
                  </div>
                </div>
                <div className="ds-section">
                  <label className="ds-label">Lesson</label>
                  <select className="ds-select" value={formData.lessonId} required
                    onChange={(e) => setFormData({...formData, lessonId: e.target.value})}>
                    <option value="">Select a lesson</option>
                    {lessons.map((l) => <option key={l._id} value={l._id}>{l.title}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div style={{margin:"1.5rem 0 .75rem",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:".82rem",fontWeight:600,color:"#0f172a"}}>
                Questions <span style={{fontFamily:"'DM Mono',monospace",fontSize:".72rem",color:"#94a3b8",marginLeft:6}}>{formData.questions.length} total</span>
              </span>
              <button type="button" className="ds-add-btn" onClick={addQuestion}>+ Add Question</button>
            </div>

            {formData.questions.map((question, qIndex) => {
              const isExpanded = expandedQuestions.includes(qIndex);
              return (
                <div key={qIndex} className="ds-q-wrap">
                  <div className="ds-q-header" onClick={() => setExpandedQuestions((prev) =>
                    prev.includes(qIndex) ? prev.filter((i) => i !== qIndex) : [...prev, qIndex]
                  )}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:".7rem",color:"#94a3b8"}}>Q{qIndex+1}</span>
                      <span style={{fontSize:".82rem",fontWeight:500}}>
                        {question.instructions ? question.instructions.slice(0,60)+"…" : "New Question"}
                      </span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <button type="button" className="ds-btn-outline-danger"
                        onClick={(e) => { e.stopPropagation(); deleteQuestion(qIndex); }}>Delete</button>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                        style={{transform: isExpanded ? "rotate(180deg)" : "none", transition:"transform .2s", color:"#94a3b8"}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ds-q-body">
                      <div className="ds-section">
                        <label className="ds-label">Instructions</label>
                        <textarea className="ds-textarea" rows={2} value={question.instructions} required
                          onChange={(e) => {
                            const updated = [...formData.questions]; updated[qIndex].instructions = e.target.value;
                            setFormData({...formData, questions: updated});
                          }}/>
                      </div>

                      <div className="ds-section">
                        <label className="ds-label">Hints</label>
                        {question.hints.map((hint, hIndex) => (
                          <div key={hIndex} className="ds-hint-row">
                            <input className="ds-input" type="text" value={hint} placeholder={`Hint ${hIndex+1}`}
                              onChange={(e) => {
                                const updated = [...formData.questions]; updated[qIndex].hints[hIndex] = e.target.value;
                                setFormData({...formData, questions: updated});
                              }}/>
                            <button type="button" className="ds-remove-btn"
                              onClick={() => {
                                const updated = [...formData.questions]; updated[qIndex].hints.splice(hIndex, 1);
                                setFormData({...formData, questions: updated});
                              }}>✕</button>
                          </div>
                        ))}
                        <button type="button" className="ds-add-btn"
                          onClick={() => {
                            const updated = [...formData.questions]; updated[qIndex].hints.push("");
                            setFormData({...formData, questions: updated});
                          }}>+ Add Hint</button>
                      </div>

                      <div className="ds-section">
                        <label className="ds-label">Expected Output</label>
                        <textarea className="ds-textarea" rows={2} value={question.expectedOutput}
                          onChange={(e) => {
                            const updated = [...formData.questions]; updated[qIndex].expectedOutput = e.target.value;
                            setFormData({...formData, questions: updated});
                          }}/>
                      </div>

                      <div className="ds-section">
                        <label className="ds-label">Difficulty</label>
                        <div className="ds-diff-grid">
                          {["Easy","Medium","Hard"].map((d) => (
                            <div key={d} className={`ds-diff-card ${question.difficulty === d ? d : ""}`}
                              onClick={() => {
                                const updated = [...formData.questions]; updated[qIndex].difficulty = d;
                                setFormData({...formData, questions: updated});
                              }}>
                              {d === "Easy" ? "🟢" : d === "Medium" ? "🟡" : "🔴"} {d}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="ds-divider"/>

                      <div className="ds-section">
                        <label className="ds-label">Required Data Types</label>
                        <div className="ds-chip-grid">
                          {dataTypeOptions.map((type) => {
                            const entry = question.dataTypesRequired.find((d) => d.type === type);
                            const isChecked = !!entry;
                            return (
                              <div key={type} className={`ds-chip ${isChecked ? "active" : ""}`}
                                onClick={() => handleDataTypeToggle(qIndex, type)}>
                                <input type="checkbox" checked={isChecked} onChange={() => {}} onClick={(e) => e.stopPropagation()}/>
                                <span className="ds-chip-label">{type}</span>
                                {isChecked && (
                                  <div className="ds-chip-min" onClick={(e) => e.stopPropagation()}>
                                    <span>min</span>
                                    <input type="number" min={1} value={entry.min}
                                      onChange={(e) => handleMinChange(qIndex, type, e.target.value)}/>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="ds-panel" style={{marginTop:"1rem"}}>
              <div className="ds-footer">
                <button type="button" className="ds-btn ds-btn-ghost" onClick={() => navigate("/admin/manage-assessment")}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : (
                    <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                    </svg>Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}