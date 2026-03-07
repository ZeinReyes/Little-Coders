import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Shared design-system styles ─────────────────────────────────────────────
export const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-page{max-width:780px;margin:0 auto;}
.ds-back{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-family:'DM Mono',monospace;color:#64748b;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s;}
.ds-back:hover{color:#0f172a;}
.ds-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;flex-wrap:wrap;gap:.75rem;}
.ds-header h1{font-size:1.45rem;font-weight:700;letter-spacing:-.03em;color:#0f172a;}
.ds-header p{font-size:.78rem;color:#94a3b8;margin-top:3px;}
.ds-panel{background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;}
.ds-panel-head{padding:1.1rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;gap:10px;}
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
.ds-footer{display:flex;justify-content:flex-end;gap:.75rem;padding:1.1rem 1.5rem;border-top:1px solid #f1f5f9;background:#fafbfc;}
.ds-btn{font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.4rem;border-radius:9px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;line-height:1.4;}
.ds-btn-ghost{background:transparent;border:1.5px solid #d1d5db;color:#64748b;}
.ds-btn-ghost:hover{background:#f1f5f9;color:#374151;}
.ds-btn-primary{background:#1e293b;color:#fff;border:1.5px solid transparent;}
.ds-btn-primary:hover:not(:disabled){background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);transform:translateY(-1px);}
.ds-btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.ds-btn-success{background:#059669;color:#fff;border:1.5px solid transparent;}
.ds-btn-success:hover{background:#047857;box-shadow:0 4px 12px rgba(5,150,105,.25);}
.ds-radio-grid{display:flex;flex-wrap:wrap;gap:8px;}
.ds-radio-card{padding:.65rem 1rem;border:1.5px solid #e2e8f0;border-radius:10px;cursor:pointer;font-size:.8rem;font-weight:500;transition:all .15s;display:flex;align-items:center;gap:8px;color:#64748b;}
.ds-radio-card.selected{border-color:#2563eb;background:#eff6ff;color:#1d4ed8;}
.ds-radio-card input{accent-color:#2563eb;}
.ds-error{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:.8rem 1.1rem;color:#dc2626;font-size:.78rem;display:flex;align-items:center;gap:8px;margin-bottom:1rem;}
.ds-skeleton{height:40px;border-radius:9px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
`;

// ─── EditLesson ───────────────────────────────────────────────────────────────
export function EditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const topicKeys = ["variables", "operators", "conditionals", "loops", "overview"];

  const [lesson, setLesson] = useState({ title: "", description: "", topic: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://little-coders-production.up.railway.app/api/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const selectedTopic = topicKeys.find((k) => res.data.topics?.[k]) || "";
        setLesson({ title: res.data.title || "", description: res.data.description || "", topic: selectedTopic });
      } catch { setError("Failed to load lesson."); }
      finally { setLoading(false); }
    };
    fetchLesson();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const topics = topicKeys.reduce((acc, k) => { acc[k] = k === lesson.topic; return acc; }, {});
      await axios.put(`https://little-coders-production.up.railway.app/api/lessons/${id}`,
        { ...lesson, topics }, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/admin/lessons");
    } catch { setError("Failed to update lesson."); setSaving(false); }
  };

  const topicIcons = { variables: "📦", operators: "⚙️", conditionals: "🔀", loops: "🔁", overview: "📖" };

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
              <h1>Edit Lesson</h1>
              <p>Update lesson title, description and topic</p>
            </div>
            <button className="ds-btn ds-btn-success"
              onClick={() => navigate(`/admin/lessons/${id}/manage`)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"/>
              </svg>
              Manage Lesson
            </button>
          </div>

          {loading ? (
            <div className="ds-panel" style={{padding:"1.5rem",display:"flex",flexDirection:"column",gap:12}}>
              {[...Array(4)].map((_,i) => <div key={i} className="ds-skeleton"/>)}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="ds-panel">
                <div className="ds-panel-head">
                  <div className="ds-panel-head-icon" style={{background:"#fffbeb"}}>📘</div>
                  <span>Lesson Details</span>
                </div>
                <div className="ds-panel-body">
                  {error && <div className="ds-error">{error}</div>}

                  <div className="ds-section">
                    <label className="ds-label">Lesson Title</label>
                    <input className="ds-input" type="text" value={lesson.title} required
                      onChange={(e) => setLesson({...lesson, title: e.target.value})} placeholder="Enter lesson title"/>
                  </div>

                  <div className="ds-section">
                    <label className="ds-label">Description</label>
                    <textarea className="ds-textarea" rows={3} value={lesson.description} required
                      onChange={(e) => setLesson({...lesson, description: e.target.value})} placeholder="Brief description of this lesson…"/>
                  </div>

                  <div className="ds-section">
                    <label className="ds-label">Topic</label>
                    <div className="ds-radio-grid">
                      {topicKeys.map((t) => (
                        <label key={t} className={`ds-radio-card ${lesson.topic === t ? "selected" : ""}`}>
                          <input type="radio" name="topic" value={t} checked={lesson.topic === t}
                            onChange={() => setLesson({...lesson, topic: t})} style={{display:"none"}}/>
                          <span>{topicIcons[t]}</span>
                          <span>{t.charAt(0).toUpperCase()+t.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ds-footer">
                  <button type="button" className="ds-btn ds-btn-ghost" onClick={() => navigate("/admin/lessons")}>Cancel</button>
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
          )}
        </div>
      </div>
    </>
  );
}

export default EditLesson;