import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API = "https://little-coders-production.up.railway.app/api";

const countWords = (text) => {
  const plain = text.replace(/<[^>]+>/g, "").trim();
  return plain ? plain.split(/\s+/).length : 0;
};

export default function AddMaterial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle]       = useState("");
  const [overview, setOverview] = useState("");
  const [contents, setContents] = useState([""]);
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);

  const isInvalid = countWords(overview) > 70 || contents.some((c) => countWords(c) > 70);

  const handleContentChange = (i, val) => {
    const n = [...contents]; n[i] = val; setContents(n);
  };
  const addContent    = () => setContents([...contents, ""]);
  const removeContent = (i) => setContents(contents.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (isInvalid)     { setError("Content exceeds 70 words."); return; }
    setError(""); setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API}/materials/lessons/${id}/materials`,
        { title: title.trim(), overview, contents },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/lessons");
    } catch (err) {
      setError(err.response?.data?.message || "Error adding material");
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
        .pg-inner { max-width: 760px; margin: 0 auto; }
        .pg-back { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 0.72rem; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 12px; cursor: pointer; transition: all 0.15s; margin-bottom: 1.5rem; }
        .pg-back:hover { border-color: #cbd5e1; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .pg-heading { margin-bottom: 1.5rem; }
        .pg-heading h1 { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.03em; color: #0f172a; }
        .pg-heading p  { font-size: 0.78rem; color: #94a3b8; margin-top: 4px; }
        .pg-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem; }
        .pg-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem 0.9rem; border-bottom: 1px solid #f1f5f9; }
        .pg-panel-title { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .pg-panel-body  { padding: 1.5rem; }
        .pg-label { display: block; font-size: 0.72rem; font-weight: 600; font-family: 'DM Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
        .pg-input { display: block; width: 100%; padding: 0.6rem 0.85rem; font-family: 'Sora', sans-serif; font-size: 0.845rem; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .pg-input::placeholder { color: #c1c8d4; }
        .pg-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .pg-form-group { margin-bottom: 1.25rem; }
        .pg-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem 1rem; color: #dc2626; font-size: 0.8rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }
        .pg-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; background: #fafbfc; }
        .pg-btn { display: inline-flex; align-items: center; gap: 7px; font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 500; padding: 0.55rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s; line-height: 1.4; }
        .pg-btn-primary { background: #0f172a; color: #fff; }
        .pg-btn-primary:hover:not(:disabled) { background: #1e293b; box-shadow: 0 4px 12px rgba(15,23,42,0.25); transform: translateY(-1px); }
        .pg-btn-ghost { background: transparent; border: 1.5px solid #e2e8f0; color: #64748b; }
        .pg-btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }
        .pg-btn-danger { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; }
        .pg-btn-danger:hover { background: #fee2e2; }
        .pg-btn-sm { padding: 0.35rem 0.85rem; font-size: 0.75rem; }
        .pg-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .pg-spinner { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: pg-spin 0.7s linear infinite; display: inline-block; }
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        .wc { font-size: 0.68rem; font-family: 'DM Mono', monospace; color: #94a3b8; margin-top: 0.35rem; }
        .wc.over { color: #dc2626; }
        .content-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
        .content-block-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .content-block-label { font-size: 0.7rem; font-weight: 600; font-family: 'DM Mono', monospace; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
        /* Quill overrides */
        .ql-toolbar { border-top-left-radius: 7px; border-top-right-radius: 7px; border-color: #e2e8f0 !important; background: #fff; }
        .ql-container { border-bottom-left-radius: 7px; border-bottom-right-radius: 7px; border-color: #e2e8f0 !important; font-family: 'Sora', sans-serif; font-size: 0.84rem; }
        .ql-editor { min-height: 90px; }
      `}</style>
      <div className="pg-root">
        <div className="pg-inner">
          <button className="pg-back" onClick={() => navigate("/admin/lessons")}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
            Back to Lessons
          </button>
          <div className="pg-heading">
            <h1>Add Lesson Material</h1>
            <p>Create lesson content with overview and sections</p>
          </div>

          {error && (
            <div className="pg-error-banner">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.5-12.946c.866-1.5 3.032-1.5 3.898 0l6.314 10.938ZM12 15.75h.007v.008H12v-.008Z"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Material Title</span></div>
              <div className="pg-panel-body">
                <div className="pg-form-group" style={{ marginBottom: 0 }}>
                  <label className="pg-label">Title</label>
                  <input className="pg-input" type="text" placeholder="e.g. What are Variables?" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Overview</span></div>
              <div className="pg-panel-body">
                <label className="pg-label">Overview <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#94a3b8" }}>— max 70 words</span></label>
                <ReactQuill theme="snow" value={overview} onChange={setOverview} />
                <div className={`wc ${countWords(overview) > 70 ? "over" : ""}`}>
                  {countWords(overview)} / 70 words{countWords(overview) > 70 ? " — exceeds limit" : ""}
                </div>
              </div>
            </div>

            {/* Contents */}
            <div className="pg-panel">
              <div className="pg-panel-head">
                <span className="pg-panel-title">Content Sections</span>
                <button type="button" className="pg-btn pg-btn-ghost pg-btn-sm" onClick={addContent}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Add Section
                </button>
              </div>
              <div className="pg-panel-body">
                {contents.map((content, i) => (
                  <div key={i} className="content-block">
                    <div className="content-block-head">
                      <span className="content-block-label">Section {i + 1}</span>
                      {contents.length > 1 && (
                        <button type="button" className="pg-btn pg-btn-danger pg-btn-sm" onClick={() => removeContent(i)}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                          Remove
                        </button>
                      )}
                    </div>
                    <ReactQuill theme="snow" value={content} onChange={(val) => handleContentChange(i, val)} />
                    <div className={`wc ${countWords(content) > 70 ? "over" : ""}`}>
                      {countWords(content)} / 70 words{countWords(content) > 70 ? " — exceeds limit" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pg-panel">
              <div className="pg-footer">
                <button type="button" className="pg-btn pg-btn-ghost" onClick={() => navigate("/admin/lessons")}>Cancel</button>
                <button type="submit" className="pg-btn pg-btn-primary" disabled={saving || isInvalid}>
                  {saving ? <><span className="pg-spinner" /> Saving…</> : <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    Save Material
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