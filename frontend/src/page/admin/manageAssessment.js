import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://little-coders-production.up.railway.app/api/assessments";
const LESSON_API = "https://little-coders-production.up.railway.app/api/lessons";

const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.75rem;gap:1rem;flex-wrap:wrap;}
.ds-topbar h1{font-size:1.45rem;font-weight:700;letter-spacing:-.03em;color:#0f172a;}
.ds-topbar p{font-size:.78rem;color:#94a3b8;margin-top:2px;}
.ds-search-wrap{display:flex;align-items:center;gap:.75rem;}
.ds-search{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;transition:border-color .15s;min-width:280px;}
.ds-search:focus-within{border-color:#2563eb;}
.ds-search svg{flex-shrink:0;color:#94a3b8;}
.ds-search input{border:none;outline:none;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:transparent;width:100%;}
.ds-search input::placeholder{color:#c1c8d4;}
.ds-btn-add{display:inline-flex;align-items:center;gap:6px;background:#1e293b;color:#fff;font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.2rem;border-radius:9px;border:none;cursor:pointer;text-decoration:none;transition:all .15s;}
.ds-btn-add:hover{background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);color:#fff;}
.ds-lesson-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:.75rem;overflow:hidden;transition:box-shadow .2s;}
.ds-lesson-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06);}
.ds-lesson-header{padding:.9rem 1.25rem;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;border-left:4px solid #dc2626;}
.ds-lesson-title{font-size:.88rem;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:8px;}
.ds-chevron{transition:transform .2s;color:#94a3b8;}
.ds-lesson-body{padding:1rem 1.25rem;border-top:1px solid #f1f5f9;}
.ds-body-label{font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;font-family:'DM Mono',monospace;margin-bottom:.75rem;display:flex;align-items:center;gap:6px;}
.ds-assessment-block{margin-bottom:1.25rem;}
.ds-assessment-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.65rem;}
.ds-assessment-id{font-size:.7rem;font-family:'DM Mono',monospace;color:#94a3b8;}
.ds-btn-edit{display:inline-flex;align-items:center;gap:5px;background:#fff;border:1.5px solid #e2e8f0;color:#374151;font-family:'Sora',sans-serif;font-size:.75rem;font-weight:500;padding:.35rem .9rem;border-radius:8px;cursor:pointer;transition:all .15s;}
.ds-btn-edit:hover{border-color:#2563eb;color:#2563eb;background:#eff6ff;}
.ds-q-row{display:flex;align-items:center;justify-content:space-between;background:#f8fafc;border:1px solid #f1f5f9;border-radius:9px;padding:.65rem 1rem;margin-bottom:4px;}
.ds-q-text{font-size:.8rem;color:#334155;line-height:1.4;flex:1;margin-right:1rem;}
.ds-diff-badge{font-size:.62rem;padding:2px 9px;border-radius:99px;font-family:'DM Mono',monospace;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;}
.ds-diff-easy{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;}
.ds-diff-medium{background:#fffbeb;color:#d97706;border:1px solid #fde68a;}
.ds-diff-hard{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;}
.ds-diff-na{background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0;}
.ds-empty{text-align:center;padding:1.5rem;color:#94a3b8;font-size:.78rem;}
.ds-spinner{width:32px;height:32px;border:2.5px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite;margin:2rem auto;}
@keyframes spin{to{transform:rotate(360deg)}}
`;

export default function ManageAssessment() {
  const [assessments, setAssessments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchLessons(); fetchAssessments(); }, []);

  const fetchLessons = async () => {
    try {
      const res = await axios.get(LESSON_API);
      setLessons(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setAssessments(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getAssessmentsForLesson = (lessonId) =>
    assessments.filter((a) => a.lessonId?._id === lessonId || a.lessonId === lessonId);

  const filteredLessons = lessons.filter((l) =>
    l.title?.toLowerCase().includes(search.toLowerCase())
  );

  const diffClass = (d) => {
    const v = d?.toLowerCase();
    if (v === "easy") return "ds-diff-easy";
    if (v === "medium") return "ds-diff-medium";
    if (v === "hard") return "ds-diff-hard";
    return "ds-diff-na";
  };

  return (
    <>
      <style>{DS}</style>
      <div className="ds-root">
        <div className="ds-topbar">
          <div>
            <h1>Assessments</h1>
            <p>{assessments.length} assessments across {lessons.length} lessons</p>
          </div>
          <div className="ds-search-wrap">
            <div className="ds-search">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
              </svg>
              <input type="text" placeholder="Search lessons…" value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>
            <button className="ds-btn-add" onClick={() => navigate("/admin/add-assessment")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Add Assessment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ds-spinner"/>
        ) : (
          filteredLessons.map((lesson, index) => {
            const lessonAssessments = getAssessmentsForLesson(lesson._id);
            const isExpanded = expandedLesson === index;
            return (
              <div key={lesson._id} className="ds-lesson-card">
                <div className="ds-lesson-header" onClick={() => setExpandedLesson(isExpanded ? null : index)}>
                  <div className="ds-lesson-title">
                    <span>✅</span>
                    {lesson.title}
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:".68rem",color:"#94a3b8",fontWeight:400}}>
                      {lessonAssessments.length} assessment{lessonAssessments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <svg className="ds-chevron" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
                    viewBox="0 0 24 24" style={{transform: isExpanded ? "rotate(180deg)" : "none"}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                  </svg>
                </div>

                {isExpanded && (
                  <div className="ds-lesson-body">
                    <div className="ds-body-label"><span>📋</span> Question Bank</div>

                    {lessonAssessments.length > 0 ? (
                      lessonAssessments.map((a) => (
                        <div key={a._id} className="ds-assessment-block">
                          <div className="ds-assessment-head">
                            <span className="ds-assessment-id">ID: {a._id}</span>
                            <button className="ds-btn-edit" onClick={() => navigate(`/admin/edit-assessment/${a._id || a.id}`)}>
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"/>
                              </svg>
                              Edit Assessment
                            </button>
                          </div>

                          {a.questions?.length > 0 ? (
                            a.questions.map((q, qIndex) => (
                              <div key={`${a._id}-${qIndex}`} className="ds-q-row">
                                <div className="ds-q-text">
                                  {q.instructions ? q.instructions.slice(0, 90) + (q.instructions.length > 90 ? "…" : "") : "Untitled Question"}
                                </div>
                                <span className={`ds-diff-badge ${diffClass(q.difficulty)}`}>
                                  {q.difficulty || "N/A"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="ds-empty">No questions in this assessment.</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="ds-empty">No assessments for this lesson yet.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}