import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API = "https://little-coders-production.up.railway.app/api";

const DATA_TYPES = [
  "print","variable","multiply","add","subtract","divide",
  "equal","equalto","notequal","less","lessequal","greater","greaterequal",
  "if","elif","else","while","do-while","for",
];
const DIFF_STYLE = {
  easy:   { bg: "#ecfdf5", border: "#6ee7b7", color: "#059669" },
  medium: { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  hard:   { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" },
};

const countWords = (text) => {
  const plain = text.replace(/<[^>]+>/g, "").trim();
  return plain ? plain.split(/\s+/).length : 0;
};

export default function AddActivity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", instructions: "", timeLimit: 60,
    hints: [""], difficulty: "easy", expectedOutput: "", dataTypesRequired: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const isInvalid = countWords(form.instructions) > 70 || form.hints.some((h) => countWords(h) > 70);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleType = (type) => {
    const cur = form.dataTypesRequired;
    const ex  = cur.find((d) => d.type === type);
    setField("dataTypesRequired", ex ? cur.filter((d) => d.type !== type) : [...cur, { type, min: 1 }]);
  };
  const setMin = (type, val) => setField("dataTypesRequired", form.dataTypesRequired.map((d) => d.type === type ? { ...d, min: Math.max(1, parseInt(val) || 1) } : d));

  const addHint    = () => form.hints.length < 3 && setField("hints", [...form.hints, ""]);
  const removeHint = (i) => setField("hints", form.hints.filter((_, j) => j !== i));
  const setHint    = (i, v) => { const h = [...form.hints]; h[i] = v; setField("hints", h); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isInvalid) { setError("Instructions or hints exceed 70 words."); return; }
    setError(""); setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/activities/materials/${id}/activities`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(-1);
    } catch (err) {
      setError("Failed to add activity. Check console for details.");
      console.error(err);
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
        .pg-inner { max-width: 800px; margin: 0 auto; }
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
        .pg-input, .pg-select, .pg-textarea { display: block; width: 100%; padding: 0.6rem 0.85rem; font-family: 'Sora', sans-serif; font-size: 0.845rem; color: #0f172a; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .pg-input::placeholder, .pg-textarea::placeholder { color: #c1c8d4; }
        .pg-input:focus, .pg-select:focus, .pg-textarea:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .pg-textarea { resize: vertical; min-height: 100px; font-family: 'DM Mono', monospace; font-size: 0.8rem; }
        .pg-form-group { margin-bottom: 1.25rem; }
        .pg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 580px) { .pg-grid-2 { grid-template-columns: 1fr; } }
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
        .hint-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
        .hint-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; }
        .hint-label { font-size: 0.7rem; font-weight: 600; font-family: 'DM Mono', monospace; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
        .dtype-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .dtype-chip { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 7px; cursor: pointer; font-size: 0.73rem; font-family: 'DM Mono', monospace; border: 1.5px solid #e2e8f0; background: #f8fafc; transition: all 0.12s; user-select: none; color: #475569; }
        .dtype-chip.on { background: #eff6ff; border-color: #93c5fd; color: #1d4ed8; }
        .dtype-min { display: flex; align-items: center; gap: 3px; margin-left: 4px; }
        .dtype-min span { font-size: 0.6rem; color: #64748b; }
        .dtype-min input { width: 38px; padding: 1px 4px; font-size: 0.7rem; text-align: center; border: 1px solid #bfdbfe; border-radius: 4px; font-family: 'DM Mono', monospace; background: #fff; outline: none; color: #1d4ed8; }
        .diff-row { display: flex; gap: 0.65rem; }
        .diff-pill { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border-radius: 8px; border: 1.5px solid #e2e8f0; cursor: pointer; font-size: 0.78rem; font-weight: 500; font-family: 'DM Mono', monospace; transition: all 0.15s; background: #f8fafc; color: #64748b; user-select: none; }
        .diff-pill input { display: none; }
        .ql-toolbar { border-top-left-radius: 7px; border-top-right-radius: 7px; border-color: #e2e8f0 !important; background: #fff; }
        .ql-container { border-bottom-left-radius: 7px; border-bottom-right-radius: 7px; border-color: #e2e8f0 !important; font-family: 'Sora', sans-serif; font-size: 0.84rem; }
        .ql-editor { min-height: 80px; }
      `}</style>
      <div className="pg-root">
        <div className="pg-inner">
          <button className="pg-back" onClick={() => navigate(-1)}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
            Back
          </button>
          <div className="pg-heading">
            <h1>Add Activity</h1>
            <p>Create a drag-and-drop coding activity</p>
          </div>

          {error && (
            <div className="pg-error-banner">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.5-12.946c.866-1.5 3.032-1.5 3.898 0l6.314 10.938ZM12 15.75h.007v.008H12v-.008Z"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Activity Details</span></div>
              <div className="pg-panel-body">
                <div className="pg-grid-2">
                  <div className="pg-form-group">
                    <label className="pg-label">Activity Name</label>
                    <input className="pg-input" type="text" placeholder="e.g. Variable Swap" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
                  </div>
                  <div className="pg-form-group">
                    <label className="pg-label">Time Limit (seconds)</label>
                    <input className="pg-input" type="number" min={30} value={form.timeLimit} onChange={(e) => setField("timeLimit", parseInt(e.target.value))} required />
                  </div>
                </div>
                <div className="pg-form-group" style={{ marginBottom: 0 }}>
                  <label className="pg-label">Instructions <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#94a3b8" }}>— max 70 words</span></label>
                  <ReactQuill theme="snow" value={form.instructions} onChange={(v) => setField("instructions", v)} />
                  <div className={`wc ${countWords(form.instructions) > 70 ? "over" : ""}`}>{countWords(form.instructions)} / 70 words</div>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Difficulty</span></div>
              <div className="pg-panel-body">
                <div className="diff-row">
                  {["easy","medium","hard"].map((d) => {
                    const s = DIFF_STYLE[d];
                    const active = form.difficulty === d;
                    return (
                      <label key={d} className="diff-pill" style={active ? { background: s.bg, borderColor: s.border, color: s.color } : {}} onClick={() => setField("difficulty", d)}>
                        <input type="radio" name="diff" value={d} checked={active} onChange={() => setField("difficulty", d)} />
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hints */}
            <div className="pg-panel">
              <div className="pg-panel-head">
                <span className="pg-panel-title">Hints</span>
                <button type="button" className="pg-btn pg-btn-ghost pg-btn-sm" onClick={addHint} disabled={form.hints.length >= 3}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Add Hint
                </button>
              </div>
              <div className="pg-panel-body">
                {form.hints.map((hint, i) => (
                  <div key={i} className="hint-block">
                    <div className="hint-head">
                      <span className="hint-label">Hint {i + 1}</span>
                      {form.hints.length > 1 && (
                        <button type="button" className="pg-btn pg-btn-danger pg-btn-sm" onClick={() => removeHint(i)}>Remove</button>
                      )}
                    </div>
                    <ReactQuill theme="snow" value={hint} onChange={(v) => setHint(i, v)} />
                    <div className={`wc ${countWords(hint) > 70 ? "over" : ""}`}>{countWords(hint)} / 70 words</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected output */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Expected Output</span></div>
              <div className="pg-panel-body">
                <textarea
                  className="pg-textarea" placeholder="Enter the expected output…"
                  value={form.expectedOutput}
                  onChange={(e) => setField("expectedOutput", e.target.value)}
                  style={{ minHeight: 120 }}
                />
              </div>
            </div>

            {/* Data types */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Data Types Required</span></div>
              <div className="pg-panel-body">
                <div className="dtype-grid">
                  {DATA_TYPES.map((type) => {
                    const entry = form.dataTypesRequired.find((d) => d.type === type);
                    const on = !!entry;
                    return (
                      <div key={type} className={`dtype-chip ${on ? "on" : ""}`} onClick={() => toggleType(type)}>
                        <input type="checkbox" checked={on} onChange={() => toggleType(type)} onClick={(e) => e.stopPropagation()} />
                        {type}
                        {on && (
                          <div className="dtype-min" onClick={(e) => e.stopPropagation()}>
                            <span>min</span>
                            <input type="number" min={1} value={entry.min} onChange={(e) => setMin(type, e.target.value)} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pg-panel">
              <div className="pg-footer">
                <button type="button" className="pg-btn pg-btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="pg-btn pg-btn-primary" disabled={saving || isInvalid}>
                  {saving ? <><span className="pg-spinner" /> Saving…</> : <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    Save Activity
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