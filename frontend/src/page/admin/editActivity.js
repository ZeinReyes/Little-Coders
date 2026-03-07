import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const dataTypeOptions = [
  "print", "variable", "multiple", "add", "subtract", "divide",
  "equal", "equalto", "notequal", "less", "lessequal", "greater", "greaterequal",
  "if", "elif", "else", "while", "do-while", "for",
];

const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-page{max-width:860px;margin:0 auto;}
.ds-back{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-family:'DM Mono',monospace;color:#64748b;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s;}
.ds-back:hover{color:#0f172a;}
.ds-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.75rem;}
.ds-header h1{font-size:1.45rem;font-weight:700;letter-spacing:-.03em;color:#0f172a;}
.ds-header p{font-size:.78rem;color:#94a3b8;margin-top:3px;}
.ds-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;}
.ds-panel-head{padding:1.1rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:10px;}
.ds-panel-head-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;}
.ds-panel-head span{font-size:.82rem;font-weight:600;color:#0f172a;}
.ds-panel-body{padding:1.5rem;}
.ds-section{margin-bottom:1.5rem;}
.ds-label{font-size:.72rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#94a3b8;font-family:'DM Mono',monospace;margin-bottom:.5rem;display:block;}
.ds-input,.ds-textarea,.ds-select{width:100%;padding:.6rem .9rem;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;outline:none;transition:border-color .15s,box-shadow .15s,background .15s;resize:vertical;}
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
.ds-chip-min input:focus{border-color:#2563eb;}
.ds-diff-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.ds-diff-card{padding:.75rem;border:1.5px solid #e2e8f0;border-radius:10px;text-align:center;cursor:pointer;transition:all .15s;font-size:.78rem;font-weight:500;}
.ds-diff-card.easy{border-color:#a7f3d0;background:#ecfdf5;color:#059669;}
.ds-diff-card.medium{border-color:#fde68a;background:#fffbeb;color:#d97706;}
.ds-diff-card.hard{border-color:#fca5a5;background:#fef2f2;color:#dc2626;}
.ds-diff-card:not(.easy):not(.medium):not(.hard){color:#94a3b8;}
.ds-diff-card:hover{border-color:#93c5fd;background:#eff6ff;color:#1d4ed8;}
.ds-footer{display:flex;justify-content:flex-end;gap:.75rem;padding:1.1rem 1.5rem;border-top:1px solid #f1f5f9;background:#fafbfc;}
.ds-btn{font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.4rem;border-radius:9px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
.ds-btn-ghost{background:transparent;border:1.5px solid #d1d5db;color:#64748b;}
.ds-btn-ghost:hover{background:#f1f5f9;color:#374151;}
.ds-btn-primary{background:#1e293b;color:#fff;border:1.5px solid transparent;}
.ds-btn-primary:hover:not(:disabled){background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);transform:translateY(-1px);}
.ds-btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.ds-error{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:.8rem 1.1rem;color:#dc2626;font-size:.78rem;display:flex;align-items:center;gap:8px;margin-bottom:1rem;}
.ds-skeleton{height:40px;border-radius:9px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.ds-divider{height:1px;background:#f1f5f9;margin:1.25rem 0;}
`;

export default function EditActivity() {
  const { lessonId, id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState({
    name: "", instructions: "", timeLimit: 30, hints: [""],
    expectedOutput: "", difficulty: "easy", dataTypesRequired: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "https://little-coders-production.up.railway.app/api";

  useEffect(() => { fetchActivity(); }, []);

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/activities/lessons/${lessonId}/activities/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data;
      const normalized = (data.dataTypesRequired || []).map((d) =>
        typeof d === "string" ? { type: d, min: 1 } : d
      );
      setActivity({
        name: data.name || "", instructions: data.instructions || "",
        hints: Array.isArray(data.hints) ? data.hints : [data.hints || ""],
        expectedOutput: data.expectedOutput || "",
        difficulty: data.difficulty || "easy",
        dataTypesRequired: normalized,
        timeLimit: data.timeLimit || 30,
      });
    } catch { setError("Failed to load activity."); }
    finally { setLoading(false); }
  };

  const handleDataTypeToggle = (type) => {
    const current = [...activity.dataTypesRequired];
    const exists = current.find((d) => d.type === type);
    setActivity({ ...activity, dataTypesRequired: exists
      ? current.filter((d) => d.type !== type)
      : [...current, { type, min: 1 }]
    });
  };

  const handleMinChange = (type, value) => {
    setActivity({ ...activity, dataTypesRequired: activity.dataTypesRequired.map((d) =>
      d.type === type ? { ...d, min: Math.max(1, parseInt(value) || 1) } : d
    )});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/activities/${id}`, activity,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/lessons");
    } catch { setError("Failed to update activity."); setSaving(false); }
  };

  return (
    <>
      <style>{DS}</style>
      <div className="ds-root">
        <div className="ds-page">
          <button className="ds-back" onClick={() => navigate("/admin/lessons")}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
            </svg>
            Back to Lessons
          </button>

          <div className="ds-header">
            <div>
              <h1>Edit Activity</h1>
              <p>Update activity details and requirements</p>
            </div>
          </div>

          {loading ? (
            <div className="ds-panel" style={{padding:"1.5rem",display:"flex",flexDirection:"column",gap:12}}>
              {[...Array(5)].map((_,i) => <div key={i} className="ds-skeleton"/>)}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="ds-panel">
                <div className="ds-panel-head">
                  <div className="ds-panel-head-icon" style={{background:"#eff6ff"}}>🎯</div>
                  <span>Activity Details</span>
                </div>
                <div className="ds-panel-body">
                  {error && (
                    <div className="ds-error">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.051 3.378c.866-1.5 3.032-1.5 3.898 0l6.354 11.0Z"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <div className="ds-input-row ds-section">
                    <div>
                      <label className="ds-label">Activity Name</label>
                      <input className="ds-input" type="text" value={activity.name} required
                        onChange={(e) => setActivity({...activity, name: e.target.value})} placeholder="Enter activity name"/>
                    </div>
                    <div>
                      <label className="ds-label">Time Limit (seconds)</label>
                      <input className="ds-input" type="number" min={30} value={activity.timeLimit} required
                        onChange={(e) => setActivity({...activity, timeLimit: parseInt(e.target.value)})}/>
                    </div>
                  </div>

                  <div className="ds-section">
                    <label className="ds-label">Instructions</label>
                    <textarea className="ds-textarea" rows={3} value={activity.instructions}
                      onChange={(e) => setActivity({...activity, instructions: e.target.value})} placeholder="Describe what the student should do…"/>
                  </div>

                  <div className="ds-section">
                    <label className="ds-label">Expected Output</label>
                    <textarea className="ds-textarea" rows={3} value={activity.expectedOutput}
                      onChange={(e) => setActivity({...activity, expectedOutput: e.target.value})} placeholder="What the correct output looks like…"/>
                  </div>

                  <div className="ds-section">
                    <label className="ds-label">Hints</label>
                    {activity.hints.map((hint, i) => (
                      <div key={i} className="ds-hint-row">
                        <input className="ds-input" type="text" value={hint} placeholder={`Hint ${i+1}`}
                          onChange={(e) => {
                            const h = [...activity.hints]; h[i] = e.target.value;
                            setActivity({...activity, hints: h});
                          }}/>
                        <button type="button" className="ds-remove-btn"
                          onClick={() => setActivity({...activity, hints: activity.hints.filter((_,j) => j!==i)})}>✕</button>
                      </div>
                    ))}
                    <button type="button" className="ds-add-btn"
                      onClick={() => setActivity({...activity, hints: [...activity.hints, ""]})}>
                      + Add Hint
                    </button>
                  </div>

                  <div className="ds-section">
                    <label className="ds-label">Difficulty</label>
                    <div className="ds-diff-grid">
                      {["easy","medium","hard"].map((d) => (
                        <div key={d} className={`ds-diff-card ${activity.difficulty === d ? d : ""}`}
                          onClick={() => setActivity({...activity, difficulty: d})}>
                          {d === "easy" ? "🟢" : d === "medium" ? "🟡" : "🔴"} {d.charAt(0).toUpperCase()+d.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ds-divider"/>

                  <div className="ds-section">
                    <label className="ds-label">Required Data Types</label>
                    <div className="ds-chip-grid">
                      {dataTypeOptions.map((type) => {
                        const entry = activity.dataTypesRequired.find((d) => d.type === type);
                        const isChecked = !!entry;
                        return (
                          <div key={type} className={`ds-chip ${isChecked ? "active" : ""}`}
                            onClick={() => handleDataTypeToggle(type)}>
                            <input type="checkbox" checked={isChecked} onChange={() => {}} onClick={(e) => e.stopPropagation()}/>
                            <span className="ds-chip-label">{type}</span>
                            {isChecked && (
                              <div className="ds-chip-min" onClick={(e) => e.stopPropagation()}>
                                <span>min</span>
                                <input type="number" min={1} value={entry.min}
                                  onChange={(e) => handleMinChange(type, e.target.value)}/>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="ds-footer">
                  <button type="button" className="ds-btn ds-btn-ghost" onClick={() => navigate("/admin/lessons")}>Cancel</button>
                  <button type="submit" className="ds-btn ds-btn-primary" disabled={saving}>
                    {saving ? "Saving…" : (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}