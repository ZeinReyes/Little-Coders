import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://little-coders-production.up.railway.app/api";

const DATA_TYPES = [
  "print","variable","multiple","add","subtract","divide",
  "equal","equalto","notequal","less","lessequal","greater","greaterequal",
  "if","elif","else","while","do-while","for",
];
const DIFF_STYLE = {
  Easy:   { bg: "#ecfdf5", border: "#6ee7b7", color: "#059669" },
  Medium: { bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  Hard:   { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" },
};

const emptyQuestion = () => ({
  instructions: "", hints: [""], expectedOutput: "", difficulty: "Easy", dataTypesRequired: [],
});

export default function AddAssessment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", lessonId: "", timeLimit: 60, questions: [emptyQuestion()] });
  const [lessons, setLessons]           = useState([]);
  const [expanded, setExpanded]         = useState([0]);
  const [message, setMessage]           = useState({ type: "", text: "" });
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/lessons`, { headers: { Authorization: `Bearer ${token}` } });
        setLessons(res.data);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const setTop = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const setQ = (qi, k, v) => {
    const qs = [...form.questions]; qs[qi] = { ...qs[qi], [k]: v };
    setTop("questions", qs);
  };
  const addQ = () => {
    const qs = [...form.questions, emptyQuestion()];
    setTop("questions", qs);
    setExpanded([...expanded, qs.length - 1]);
  };
  const delQ = (qi) => {
    setTop("questions", form.questions.filter((_, i) => i !== qi));
    setExpanded(expanded.filter((i) => i !== qi));
  };
  const toggleQ = (qi) => setExpanded((p) => p.includes(qi) ? p.filter((i) => i !== qi) : [...p, qi]);

  const addHint  = (qi) => { const q = { ...form.questions[qi], hints: [...form.questions[qi].hints, ""] }; const qs = [...form.questions]; qs[qi] = q; setTop("questions", qs); };
  const delHint  = (qi, hi) => { const q = { ...form.questions[qi], hints: form.questions[qi].hints.filter((_, i) => i !== hi) }; const qs = [...form.questions]; qs[qi] = q; setTop("questions", qs); };
  const setHint  = (qi, hi, v) => { const hints = [...form.questions[qi].hints]; hints[hi] = v; setQ(qi, "hints", hints); };

  const toggleType = (qi, type) => {
    const cur = form.questions[qi].dataTypesRequired;
    const ex  = cur.find((d) => d.type === type);
    setQ(qi, "dataTypesRequired", ex ? cur.filter((d) => d.type !== type) : [...cur, { type, min: 1 }]);
  };
  const setMin = (qi, type, val) => {
    setQ(qi, "dataTypesRequired", form.questions[qi].dataTypesRequired.map((d) => d.type === type ? { ...d, min: Math.max(1, parseInt(val) || 1) } : d));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.timeLimit < 30) { setMessage({ type: "error", text: "Time limit must be at least 30 seconds." }); return; }
    setMessage({ type: "", text: "" }); setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/assessments`, form, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ type: "success", text: res.data.message || "Assessment added successfully!" });
      setForm({ title: "", lessonId: "", timeLimit: 60, questions: [emptyQuestion()] });
      setExpanded([0]);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to add assessment." });
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
        .pg-inner { max-width: 860px; margin: 0 auto; }
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
        .pg-textarea { resize: vertical; min-height: 80px; font-family: 'DM Mono', monospace; font-size: 0.8rem; }
        .pg-form-group { margin-bottom: 1.25rem; }
        .pg-grid-3 { display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 1rem; }
        @media (max-width: 640px) { .pg-grid-3 { grid-template-columns: 1fr; } }
        .pg-error-banner { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 0.75rem 1rem; color: #dc2626; font-size: 0.8rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }
        .pg-success-banner { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.75rem 1rem; color: #15803d; font-size: 0.8rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }
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
        .q-block { border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 0.85rem; overflow: hidden; }
        .q-head { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.1rem; background: #f8fafc; cursor: pointer; transition: background 0.15s; }
        .q-head:hover { background: #f1f5f9; }
        .q-title { font-size: 0.8rem; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
        .q-chevron { transition: transform 0.2s; color: #94a3b8; }
        .q-chevron.open { transform: rotate(180deg); }
        .q-body { padding: 1.25rem; border-top: 1px solid #f1f5f9; }
        .q-section { margin-bottom: 1.1rem; }
        .q-section:last-child { margin-bottom: 0; }
        .hint-row { display: flex; align-items: center; gap: 8px; margin-bottom: 0.6rem; }
        .hint-row .pg-input { flex: 1; }
        .dtype-grid { display: flex; flex-wrap: wrap; gap: 7px; }
        .dtype-chip { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 7px; cursor: pointer; font-size: 0.73rem; font-family: 'DM Mono', monospace; border: 1.5px solid #e2e8f0; background: #f8fafc; transition: all 0.12s; user-select: none; color: #475569; }
        .dtype-chip.on { background: #eff6ff; border-color: #93c5fd; color: #1d4ed8; }
        .dtype-min { display: flex; align-items: center; gap: 3px; margin-left: 4px; }
        .dtype-min span { font-size: 0.6rem; color: #64748b; }
        .dtype-min input { width: 38px; padding: 1px 4px; font-size: 0.7rem; text-align: center; border: 1px solid #bfdbfe; border-radius: 4px; font-family: 'DM Mono', monospace; background: #fff; outline: none; color: #1d4ed8; }
        .diff-row { display: flex; gap: 0.6rem; }
        .diff-pill { flex: 1; display: flex; align-items: center; justify-content: center; padding: 7px 10px; border-radius: 8px; border: 1.5px solid #e2e8f0; cursor: pointer; font-size: 0.75rem; font-weight: 500; font-family: 'DM Mono', monospace; transition: all 0.15s; background: #f8fafc; color: #64748b; user-select: none; }
        .diff-pill input { display: none; }
        .q-number { font-family: 'DM Mono', monospace; font-size: 0.65rem; background: #e2e8f0; color: #64748b; padding: 2px 7px; border-radius: 99px; }
      `}</style>
      <div className="pg-root">
        <div className="pg-inner">
          <button className="pg-back" onClick={() => navigate(-1)}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
            Back
          </button>
          <div className="pg-heading">
            <h1>Add Assessment</h1>
            <p>Build a multi-question assessment for a lesson</p>
          </div>

          {message.text && (
            <div className={message.type === "success" ? "pg-success-banner" : "pg-error-banner"}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {message.type === "success"
                  ? <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  : <path strokeLinecap="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.5-12.946c.866-1.5 3.032-1.5 3.898 0l6.314 10.938ZM12 15.75h.007v.008H12v-.008Z"/>}
              </svg>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Header info */}
            <div className="pg-panel">
              <div className="pg-panel-head"><span className="pg-panel-title">Assessment Details</span></div>
              <div className="pg-panel-body">
                <div className="pg-grid-3">
                  <div className="pg-form-group">
                    <label className="pg-label">Title</label>
                    <input className="pg-input" type="text" placeholder="e.g. Variables Quiz" value={form.title} onChange={(e) => setTop("title", e.target.value)} required />
                  </div>
                  <div className="pg-form-group">
                    <label className="pg-label">Lesson</label>
                    <select className="pg-select" value={form.lessonId} onChange={(e) => setTop("lessonId", e.target.value)} required>
                      <option value="">Select a lesson…</option>
                      {lessons.map((l) => <option key={l._id} value={l._id}>{l.title}</option>)}
                    </select>
                  </div>
                  <div className="pg-form-group">
                    <label className="pg-label">Time (sec)</label>
                    <input className="pg-input" type="number" min={30} value={form.timeLimit} onChange={(e) => setTop("timeLimit", parseInt(e.target.value))} required />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="pg-panel">
              <div className="pg-panel-head">
                <span className="pg-panel-title">Questions <span style={{ fontFamily: "'DM Mono'", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 400 }}>{form.questions.length} total</span></span>
                <button type="button" className="pg-btn pg-btn-ghost pg-btn-sm" onClick={addQ}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                  Add Question
                </button>
              </div>
              <div className="pg-panel-body">
                {form.questions.map((q, qi) => (
                  <div key={qi} className="q-block">
                    <div className="q-head" onClick={() => toggleQ(qi)}>
                      <span className="q-title">
                        <span className="q-number">Q{qi + 1}</span>
                        {q.instructions ? q.instructions.replace(/<[^>]+>/g, "").slice(0, 50) + (q.instructions.length > 50 ? "…" : "") : "New Question"}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {form.questions.length > 1 && (
                          <button type="button" className="pg-btn pg-btn-danger pg-btn-sm" onClick={(e) => { e.stopPropagation(); delQ(qi); }}>
                            Delete
                          </button>
                        )}
                        <svg className={`q-chevron ${expanded.includes(qi) ? "open" : ""}`} width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                      </div>
                    </div>

                    {expanded.includes(qi) && (
                      <div className="q-body">
                        {/* Instructions */}
                        <div className="q-section">
                          <label className="pg-label">Instructions</label>
                          <textarea className="pg-textarea" placeholder="What should the student do?" value={q.instructions} onChange={(e) => setQ(qi, "instructions", e.target.value)} required />
                        </div>

                        {/* Expected output */}
                        <div className="q-section">
                          <label className="pg-label">Expected Output</label>
                          <textarea className="pg-textarea" placeholder="Expected program output…" value={q.expectedOutput} onChange={(e) => setQ(qi, "expectedOutput", e.target.value)} style={{ minHeight: 65 }} />
                        </div>

                        {/* Difficulty */}
                        <div className="q-section">
                          <label className="pg-label">Difficulty</label>
                          <div className="diff-row">
                            {["Easy","Medium","Hard"].map((d) => {
                              const s = DIFF_STYLE[d];
                              const active = q.difficulty === d;
                              return (
                                <label key={d} className="diff-pill" style={active ? { background: s.bg, borderColor: s.border, color: s.color } : {}} onClick={() => setQ(qi, "difficulty", d)}>
                                  <input type="radio" name={`diff-${qi}`} value={d} checked={active} onChange={() => setQ(qi, "difficulty", d)} />
                                  {d}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Hints */}
                        <div className="q-section">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <label className="pg-label" style={{ marginBottom: 0 }}>Hints</label>
                            <button type="button" className="pg-btn pg-btn-ghost pg-btn-sm" onClick={() => addHint(qi)}>
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                              Add
                            </button>
                          </div>
                          {q.hints.map((h, hi) => (
                            <div key={hi} className="hint-row">
                              <input className="pg-input" type="text" placeholder={`Hint ${hi + 1}`} value={h} onChange={(e) => setHint(qi, hi, e.target.value)} />
                              {q.hints.length > 1 && (
                                <button type="button" className="pg-btn pg-btn-danger pg-btn-sm" onClick={() => delHint(qi, hi)}>
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12"/></svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Data types */}
                        <div className="q-section">
                          <label className="pg-label">Data Types Required</label>
                          <div className="dtype-grid">
                            {DATA_TYPES.map((type) => {
                              const entry = q.dataTypesRequired.find((d) => d.type === type);
                              const on = !!entry;
                              return (
                                <div key={type} className={`dtype-chip ${on ? "on" : ""}`} onClick={() => toggleType(qi, type)}>
                                  <input type="checkbox" checked={on} onChange={() => toggleType(qi, type)} onClick={(e) => e.stopPropagation()} />
                                  {type}
                                  {on && (
                                    <div className="dtype-min" onClick={(e) => e.stopPropagation()}>
                                      <span>min</span>
                                      <input type="number" min={1} value={entry.min} onChange={(e) => setMin(qi, type, e.target.value)} />
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
                ))}
              </div>
            </div>

            <div className="pg-panel">
              <div className="pg-footer">
                <button type="button" className="pg-btn pg-btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="pg-btn pg-btn-primary" disabled={saving}>
                  {saving ? <><span className="pg-spinner" /> Saving…</> : <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="m4.5 12.75 6 6 9-13.5"/></svg>
                    Submit Assessment
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