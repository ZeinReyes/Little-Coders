import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://little-coders-production.up.railway.app/api";

const TOPICS = ["variables", "operators", "conditionals", "loops", "overview"];
const TOPIC_STYLE = {
  variables:    { color: "#2563eb", bg: "#eff6ff",  border: "#93c5fd" },
  operators:    { color: "#d97706", bg: "#fffbeb",  border: "#fde68a" },
  conditionals: { color: "#7c3aed", bg: "#f5f3ff",  border: "#c4b5fd" },
  loops:        { color: "#dc2626", bg: "#fef2f2",  border: "#fca5a5" },
  overview:     { color: "#059669", bg: "#ecfdf5",  border: "#6ee7b7" },
};

export default function AddLesson() {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic]           = useState("");
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic) { setError("Please select a topic."); return; }
    setError(""); setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/lessons`, { title, description, topic }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/lessons");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pg-root { font-family: 'Sora', sans-serif; background: #f8fafc; min-height: 100vh; color: #1e293b; padding: 2rem; }
        .pg-inner { max-width: 700px; margin: 0 auto; }
        .pg-back { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 0.72rem; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 12px; cursor: pointer; transition: all 0.15s; margin-bottom: 1.5rem; text-decoration: none; }
        .pg-back:hover { border-color: #cbd5e1; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .pg-heading { margin-bottom: 1.5rem; }
        .pg-heading h1 { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.03em; color: #0f172a; }
        .pg-heading p  { font-size: 0.78rem; color: #94a3b8; margin-top: 4px; }
        .pg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem; }
        .pg-panel-head { padding: 1rem 1.5rem 0.9rem; border-bottom: 1px solid #f1f5f9; }
        .pg-panel-title { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .pg-panel-body  { padding: 1.5rem; }
        .pg-label { display: block; font-size: 0.72rem; font-weight: 600; font-family: 'DM Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
        .pg-input, .pg-textarea { display: block; width: 100%; padding: 0.6rem 0.85rem; font-family: 'Sora', sans-serif; font-size: 0.845rem; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .pg-input::placeholder, .pg-textarea::placeholder { color: #c1c8d4; }
        .pg-input:focus, .pg-textarea:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .pg-textarea { resize: vertical; min-height: 90px; }
        .pg-form-group { margin-bottom: 1.25rem; }
        .pg-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem 1rem; color: #dc2626; font-size: 0.8rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }
        .pg-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; background: #fafbfc; }
        .pg-btn { display: inline-flex; align-items: center; gap: 7px; font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 500; padding: 0.55rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s; line-height: 1.4; }
        .pg-btn-primary { background: #0f172a; color: #fff; }
        .pg-btn-primary:hover:not(:disabled) { background: #1e293b; box-shadow: 0 4px 12px rgba(15,23,42,0.25); transform: translateY(-1px); }
        .pg-btn-ghost { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
        .pg-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .pg-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .pg-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: pg-spin 0.7s linear infinite; display: inline-block; }
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        .topic-grid { display: flex; flex-wrap: wrap; gap: 0.65rem; }
        .topic-pill { display: flex; align-items: center; gap: 7px; padding: 7px 16px; border-radius: 99px; border: 1.5px solid #e2e8f0; cursor: pointer; font-size: 0.78rem; font-weight: 500; font-family: 'DM Mono', monospace; letter-spacing: 0.03em; text-transform: capitalize; transition: all 0.15s; user-select: none; background: #f8fafc; color: #64748b; }
        .topic-pill:hover { border-color: #94a3b8; }
        .topic-pill.active { font-weight: 600; }
      `}</style>
      <div className="pg-root">
        <div className="pg-inner">
          <button className="pg-back" onClick={() => navigate("/admin/lessons")}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
            Back to Lessons
          </button>

          <div className="pg-heading">
            <h1>Add New Lesson</h1>
            <p>Create a lesson by filling in the details below</p>
          </div>

          {error && (
            <div className="pg-error-banner">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.5-12.946c.866-1.5 3.032-1.5 3.898 0l6.314 10.938ZM12 15.75h.007v.008H12v-.008Z"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic info */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Lesson Details</span></div>
              <div className="pg-panel-body">
                <div className="pg-form-group">
                  <label className="pg-label">Lesson Title</label>
                  <input className="pg-input" type="text" placeholder="e.g. Introduction to Variables" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="pg-form-group" style={{ marginBottom: 0 }}>
                  <label className="pg-label">Description</label>
                  <textarea className="pg-textarea" placeholder="Brief overview of what this lesson covers…" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Topic */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Topic Covered</span></div>
              <div className="pg-panel-body">
                <div className="topic-grid">
                  {TOPICS.map((t) => {
                    const s = TOPIC_STYLE[t];
                    const active = topic === t;
                    return (
                      <label
                        key={t}
                        className={`topic-pill ${active ? "active" : ""}`}
                        style={active ? { background: s.bg, borderColor: s.border, color: s.color } : {}}
                        onClick={() => setTopic(t)}
                      >
                        <input type="radio" name="topic" value={t} checked={active} onChange={() => setTopic(t)} style={{ display: "none" }} />
                        <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                      </label>
                    );
                  })}
                </div>
                {!topic && <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.65rem", fontFamily: "'DM Mono', monospace" }}>Select one topic above</p>}
              </div>
            </div>

            <div className="pg-panel">
              <div className="pg-footer">
                <button type="button" className="pg-btn pg-btn-ghost" onClick={() => navigate("/admin/lessons")}>Cancel</button>
                <button type="submit" className="pg-btn pg-btn-primary" disabled={saving || !topic}>
                  {saving ? <><span className="pg-spinner" /> Saving…</> : <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    Add Lesson
                  </>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}