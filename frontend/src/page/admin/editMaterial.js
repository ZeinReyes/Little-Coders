import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-page{max-width:860px;margin:0 auto;}
.ds-back{display:inline-flex;align-items:center;gap:6px;font-size:.75rem;font-family:'DM Mono',monospace;color:#64748b;background:none;border:none;cursor:pointer;padding:0;margin-bottom:1.5rem;transition:color .15s;}
.ds-back:hover{color:#0f172a;}
.ds-header{margin-bottom:1.75rem;}
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
.ds-input{width:100%;padding:.6rem .9rem;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:9px;outline:none;transition:border-color .15s,box-shadow .15s;}
.ds-input::placeholder{color:#c1c8d4;}
.ds-input:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.1);}
.ds-word-count{font-size:.7rem;font-family:'DM Mono',monospace;margin-top:6px;color:#94a3b8;}
.ds-word-count.over{color:#dc2626;}
.ds-word-warn{font-size:.72rem;color:#dc2626;margin-top:4px;display:flex;align-items:center;gap:5px;}
.ds-content-box{border:1.5px solid #e2e8f0;border-radius:10px;padding:1rem;margin-bottom:.75rem;background:#f8fafc;}
.ds-content-box-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.65rem;}
.ds-content-box-head span{font-size:.75rem;font-weight:600;color:#64748b;font-family:'DM Mono',monospace;}
.ds-remove-btn{display:inline-flex;align-items:center;gap:4px;font-size:.72rem;font-family:'DM Mono',monospace;color:#dc2626;background:none;border:1.5px solid #fecaca;border-radius:7px;padding:3px 10px;cursor:pointer;transition:all .15s;}
.ds-remove-btn:hover{background:#fef2f2;}
.ds-add-btn{display:inline-flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:.72rem;color:#2563eb;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;padding:5px 12px;cursor:pointer;transition:all .15s;}
.ds-add-btn:hover{background:#dbeafe;}
.ds-footer{display:flex;justify-content:flex-end;gap:.75rem;padding:1.1rem 1.5rem;border-top:1px solid #f1f5f9;background:#fafbfc;}
.ds-btn{font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.4rem;border-radius:9px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
.ds-btn-ghost{background:transparent;border:1.5px solid #d1d5db;color:#64748b;}
.ds-btn-ghost:hover{background:#f1f5f9;color:#374151;}
.ds-btn-primary{background:#1e293b;color:#fff;border:1.5px solid transparent;}
.ds-btn-primary:hover:not(:disabled){background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);transform:translateY(-1px);}
.ds-btn-primary:disabled{opacity:.6;cursor:not-allowed;}
.ds-error{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:.8rem 1.1rem;color:#dc2626;font-size:.78rem;margin-bottom:1rem;}
.ds-skeleton{height:40px;border-radius:9px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

/* Quill theme override to match design system */
.ds-quill-wrap .ql-container{font-family:'Sora',sans-serif;font-size:.82rem;border-radius:0 0 9px 9px;border:1.5px solid #e2e8f0;border-top:none;}
.ds-quill-wrap .ql-toolbar{border-radius:9px 9px 0 0;border:1.5px solid #e2e8f0;background:#f8fafc;}
.ds-quill-wrap .ql-container:focus-within{border-color:#2563eb;}
`;

export default function EditMaterial() {
  const { lessonId, id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [contents, setContents] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "https://little-coders-production.up.railway.app/api";

  const countWords = (text) => {
    const plain = text.replace(/<[^>]+>/g, "").trim();
    return plain ? plain.split(/\s+/).length : 0;
  };

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/materials/lessons/${lessonId}/materials/${id}`,
          { headers: { Authorization: `Bearer ${token}` } });
        setTitle(res.data.title || "");
        setOverview(res.data.overview || "");
        setContents(Array.isArray(res.data.contents) ? res.data.contents : [res.data.contents || ""]);
      } catch { setError("Failed to load material."); }
      finally { setLoading(false); }
    };
    fetchMaterial();
  }, [lessonId, id]);

  const isInvalid = countWords(overview) > 70 || contents.some((c) => countWords(c) > 70);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE}/materials/${id}`,
        { title: title.trim(), overview, contents },
        { headers: { Authorization: `Bearer ${token}` } });
      navigate("/admin/lessons");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update material.");
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <style>{DS}</style>
      <div className="ds-root">
        <div className="ds-page">
          <div className="ds-panel" style={{padding:"1.5rem",display:"flex",flexDirection:"column",gap:12}}>
            {[...Array(4)].map((_,i) => <div key={i} className="ds-skeleton"/>)}
          </div>
        </div>
      </div>
    </>
  );

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
            <h1>Edit Material</h1>
            <p>Update the lesson material content</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ds-panel">
              <div className="ds-panel-head">
                <div className="ds-panel-head-left">
                  <div className="ds-panel-head-icon" style={{background:"#f5f3ff"}}>📄</div>
                  <span>Material Content</span>
                </div>
              </div>
              <div className="ds-panel-body">
                {error && <div className="ds-error">{error}</div>}

                <div className="ds-section">
                  <label className="ds-label">Material Title</label>
                  <input className="ds-input" type="text" value={title} required
                    onChange={(e) => setTitle(e.target.value)} placeholder="Enter material title"/>
                </div>

                <div className="ds-section">
                  <label className="ds-label">Overview <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:"#94a3b8"}}>(max 70 words)</span></label>
                  <div className="ds-quill-wrap">
                    <ReactQuill value={overview} onChange={setOverview} theme="snow"/>
                  </div>
                  <div className={`ds-word-count ${countWords(overview) > 70 ? "over" : ""}`}>
                    {countWords(overview)} / 70 words
                  </div>
                  {countWords(overview) > 70 && (
                    <div className="ds-word-warn">⚠ Overview must not exceed 70 words.</div>
                  )}
                </div>

                <div className="ds-section">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:".65rem"}}>
                    <label className="ds-label" style={{marginBottom:0}}>Contents <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(max 70 words each)</span></label>
                    <button type="button" className="ds-add-btn"
                      onClick={() => setContents([...contents, ""])}>+ Add Content</button>
                  </div>

                  {contents.map((content, index) => (
                    <div key={index} className="ds-content-box">
                      <div className="ds-content-box-head">
                        <span>Content {index + 1}</span>
                        {contents.length > 1 && (
                          <button type="button" className="ds-remove-btn"
                            onClick={() => setContents(contents.filter((_, i) => i !== index))}>
                            ✕ Remove
                          </button>
                        )}
                      </div>
                      <div className="ds-quill-wrap">
                        <ReactQuill theme="snow" value={content}
                          onChange={(val) => {
                            const nc = [...contents]; nc[index] = val; setContents(nc);
                          }}/>
                      </div>
                      <div className={`ds-word-count ${countWords(content) > 70 ? "over" : ""}`}>
                        {countWords(content)} / 70 words
                      </div>
                      {countWords(content) > 70 && (
                        <div className="ds-word-warn">⚠ Content {index + 1} must not exceed 70 words.</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="ds-footer">
                <button type="button" className="ds-btn ds-btn-ghost" onClick={() => navigate("/admin/lessons")}>Cancel</button>
                <button type="submit" className="ds-btn ds-btn-primary" disabled={isInvalid || saving}>
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