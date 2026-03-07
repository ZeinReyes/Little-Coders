import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const DS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.ds-root{font-family:'Sora',sans-serif;background:#f8fafc;min-height:100vh;color:#1e293b;padding:2rem;}
.ds-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.75rem;gap:1rem;flex-wrap:wrap;}
.ds-topbar h1{font-size:1.45rem;font-weight:700;letter-spacing:-.03em;color:#0f172a;}
.ds-topbar p{font-size:.78rem;color:#94a3b8;margin-top:2px;}
.ds-search-wrap{display:flex;align-items:center;gap:.75rem;}
.ds-search{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;padding:.5rem .9rem;transition:border-color .15s;min-width:260px;}
.ds-search:focus-within{border-color:#2563eb;}
.ds-search svg{flex-shrink:0;color:#94a3b8;}
.ds-search input{border:none;outline:none;font-family:'Sora',sans-serif;font-size:.82rem;color:#0f172a;background:transparent;width:100%;}
.ds-search input::placeholder{color:#c1c8d4;}
.ds-btn-add{display:inline-flex;align-items:center;gap:6px;background:#1e293b;color:#fff;font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.55rem 1.2rem;border-radius:9px;border:none;cursor:pointer;text-decoration:none;transition:all .15s;}
.ds-btn-add:hover{background:#0f172a;box-shadow:0 4px 12px rgba(15,23,42,.2);color:#fff;}
.ds-lesson-card{background:#fff;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:12px;margin-bottom:.75rem;overflow:hidden;transition:box-shadow .2s;}
.ds-lesson-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.07);}
.ds-lesson-header{padding:.9rem 1.2rem;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;}
.ds-lesson-title{font-size:.88rem;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:8px;}
.ds-lesson-actions{display:flex;align-items:center;gap:8px;}
.ds-lesson-body{padding:.75rem 1.2rem 1rem;border-top:1px solid #f1f5f9;}
.ds-section-label{font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#94a3b8;font-family:'DM Mono',monospace;margin-bottom:.6rem;margin-top:.75rem;display:flex;align-items:center;gap:6px;}
.ds-section-label:first-child{margin-top:0;}
.ds-item-list{display:flex;flex-direction:column;gap:4px;margin-bottom:.5rem;}
.ds-item{background:#f8fafc;border:1px solid #f1f5f9;border-radius:9px;padding:.6rem 1rem;display:flex;align-items:center;justify-content:space-between;transition:background .15s;}
.ds-item:hover{background:#f1f5f9;}
.ds-item-name{font-size:.8rem;color:#334155;display:flex;align-items:center;gap:7px;}
.ds-item-actions{display:flex;align-items:center;gap:6px;position:relative;}
.ds-activity-item{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:.5rem .9rem;display:flex;align-items:center;justify-content:space-between;margin-left:1.5rem;margin-bottom:3px;}
.ds-activity-name{font-size:.77rem;color:#475569;display:flex;align-items:center;gap:6px;}
.ds-diff-badge{font-size:.62rem;padding:1px 8px;border-radius:99px;font-family:'DM Mono',monospace;letter-spacing:.04em;text-transform:uppercase;}
.ds-diff-easy{background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;}
.ds-diff-medium{background:#fffbeb;color:#d97706;border:1px solid #fde68a;}
.ds-diff-hard{background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;}
.ds-empty-state{text-align:center;padding:1.5rem;color:#94a3b8;font-size:.78rem;}
.ds-menu-btn{width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:7px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;color:#64748b;transition:all .15s;}
.ds-menu-btn:hover{background:#f1f5f9;border-color:#cbd5e1;color:#0f172a;}
.ds-dropdown{position:absolute;top:calc(100% + 4px);right:0;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.1);z-index:20;min-width:130px;overflow:hidden;}
.ds-dropdown-item{display:flex;align-items:center;gap:8px;padding:.65rem 1rem;font-size:.78rem;cursor:pointer;transition:background .15s;color:#374151;}
.ds-dropdown-item:hover{background:#f8fafc;}
.ds-dropdown-item.danger{color:#dc2626;}
.ds-dropdown-item.danger:hover{background:#fef2f2;}
.ds-btn-sm{display:inline-flex;align-items:center;gap:5px;font-family:'Sora',sans-serif;font-size:.73rem;font-weight:500;padding:.35rem .85rem;border-radius:8px;border:none;cursor:pointer;transition:all .15s;}
.ds-btn-primary-sm{background:#2563eb;color:#fff;}
.ds-btn-primary-sm:hover{background:#1d4ed8;}
.ds-spinner{width:14px;height:14px;border:2px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto;}
@keyframes spin{to{transform:rotate(360deg)}}
/* Modal */
.ds-overlay{position:fixed;inset:0;background:rgba(15,23,42,.4);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem;}
.ds-modal{background:#fff;border-radius:16px;width:100%;max-width:420px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:fadeUp .2s ease;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.ds-modal-head{padding:1.1rem 1.5rem;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;}
.ds-modal-head h3{font-size:.92rem;font-weight:600;color:#0f172a;}
.ds-modal-close{width:26px;height:26px;border-radius:7px;border:1.5px solid #e2e8f0;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;}
.ds-modal-body{padding:1.5rem;text-align:center;}
.ds-modal-icon{width:46px;height:46px;border-radius:12px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto .9rem;}
.ds-modal-icon svg{width:22px;height:22px;stroke:#dc2626;}
.ds-modal-text{font-size:.83rem;color:#64748b;line-height:1.6;}
.ds-modal-text strong{display:block;color:#0f172a;font-size:.9rem;margin-bottom:.3rem;}
.ds-modal-foot{padding:.9rem 1.5rem;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem;background:#fafbfc;}
.ds-btn{font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;padding:.5rem 1.2rem;border-radius:9px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s;}
.ds-btn-ghost{background:transparent;border:1.5px solid #d1d5db;color:#64748b;}
.ds-btn-ghost:hover{background:#f1f5f9;}
.ds-btn-danger{background:#dc2626;color:#fff;}
.ds-btn-danger:hover{background:#b91c1c;}
`;

export default function LessonsList() {
  const [lessons, setLessons] = useState([]);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [lessonContents, setLessonContents] = useState({});
  const [loadingLessons, setLoadingLessons] = useState({});
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const navigate = useNavigate();
  const API_BASE = "https://little-coders-production.up.railway.app/api";

  useEffect(() => { fetchLessons(); }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/lessons`, { headers: { Authorization: `Bearer ${token}` } });
      setLessons(res.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) { console.error(err); }
  };

  const toggleExpand = async (lessonId) => {
    if (expandedLesson === lessonId) { setExpandedLesson(null); return; }
    if (!lessonContents[lessonId]) {
      setLoadingLessons((p) => ({ ...p, [lessonId]: true }));
      try {
        const token = localStorage.getItem("token");
        const materialsRes = await axios.get(`${API_BASE}/materials/lessons/${lessonId}/materials`, { headers: { Authorization: `Bearer ${token}` } });
        const sortedMaterials = materialsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        const activitiesByMaterial = {};
        await Promise.all(sortedMaterials.map(async (material) => {
          try {
            const actRes = await axios.get(`${API_BASE}/activities/materials/${material._id}/activities`, { headers: { Authorization: `Bearer ${token}` } });
            activitiesByMaterial[material._id] = actRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
          } catch { activitiesByMaterial[material._id] = []; }
        }));
        const assessmentsRes = await axios.get(`${API_BASE}/assessments/lessons/${lessonId}/assessments`, { headers: { Authorization: `Bearer ${token}` } });
        setLessonContents((p) => ({ ...p, [lessonId]: {
          materials: sortedMaterials,
          activitiesByMaterial,
          assessments: assessmentsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)),
        }}));
      } catch (err) { console.error(err); }
      finally { setLoadingLessons((p) => ({ ...p, [lessonId]: false })); }
    }
    setExpandedLesson(lessonId);
  };

  const handleConfirmDelete = async () => {
    const { type, id, lessonId, materialId } = deleteTarget || {};
    try {
      const token = localStorage.getItem("token");
      if (type === "lesson") {
        await axios.delete(`${API_BASE}/lessons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessons((p) => p.filter((l) => l._id !== id));
      } else if (type === "material") {
        await axios.delete(`${API_BASE}/materials/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessonContents((p) => ({ ...p, [lessonId]: { ...p[lessonId], materials: p[lessonId].materials.filter((m) => m._id !== id) } }));
      } else if (type === "activity") {
        await axios.delete(`${API_BASE}/activities/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessonContents((p) => ({ ...p, [lessonId]: { ...p[lessonId], activitiesByMaterial: { ...p[lessonId].activitiesByMaterial, [materialId]: p[lessonId].activitiesByMaterial[materialId].filter((a) => a._id !== id) } } }));
      } else if (type === "assessment") {
        await axios.delete(`${API_BASE}/assessments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLessonContents((p) => ({ ...p, [lessonId]: { ...p[lessonId], assessments: p[lessonId].assessments.filter((a) => a._id !== id) } }));
      }
      setShowDeleteModal(false);
    } catch (err) { console.error(err); alert("Failed to delete."); }
  };

  const Menu = ({ type, id, lessonId, materialId }) => openMenu === id ? (
    <div className="ds-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="ds-dropdown-item" onClick={() => {
        setOpenMenu(null);
        if (type === "lesson") navigate(`/admin/lessons/edit/${id}`);
        else if (type === "material") navigate(`/admin/lessons/${lessonId}/materials/${id}`);
        else if (type === "activity") navigate(`/admin/lessons/${lessonId}/activities/${id}`);
        else navigate(`/admin/edit-assessment/${id}`);
      }}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"/>
        </svg>
        Edit
      </div>
      <div className="ds-dropdown-item danger" onClick={() => { setDeleteTarget({ type, id, lessonId, materialId }); setShowDeleteModal(true); setOpenMenu(null); }}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916"/>
        </svg>
        Delete
      </div>
    </div>
  ) : null;

  const filtered = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <style>{DS}</style>
      <div className="ds-root">
        <div className="ds-topbar">
          <div>
            <h1>Lessons</h1>
            <p>{lessons.length} lessons configured</p>
          </div>
          <div className="ds-search-wrap">
            <div className="ds-search">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
              </svg>
              <input type="text" placeholder="Search lessons…" value={search} onChange={(e) => setSearch(e.target.value)}/>
            </div>
            <Link to="/admin/lessons/add" className="ds-btn-add">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Add Lesson
            </Link>
          </div>
        </div>

        {filtered.map((lesson) => (
          <div key={lesson._id} className="ds-lesson-card">
            <div className="ds-lesson-header" onClick={() => toggleExpand(lesson._id)}>
              <div className="ds-lesson-title">
                <span>📘</span>
                {lesson.title}
              </div>
              <div className="ds-lesson-actions" onClick={(e) => e.stopPropagation()}>
                <button className="ds-btn-sm ds-btn-primary-sm"
                  onClick={() => navigate(`/admin/lessons/${lesson._id}/add-material`)}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                  </svg>
                  Add Material
                </button>
                <div style={{position:"relative"}}>
                  <button className="ds-menu-btn"
                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === lesson._id ? null : lesson._id); }}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                    </svg>
                  </button>
                  <Menu type="lesson" id={lesson._id}/>
                </div>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  style={{transition:"transform .2s",transform: expandedLesson === lesson._id ? "rotate(180deg)" : "none",color:"#94a3b8"}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>
                </svg>
              </div>
            </div>

            {expandedLesson === lesson._id && (
              <div className="ds-lesson-body">
                {loadingLessons[lesson._id] ? (
                  <div style={{padding:"1rem",textAlign:"center"}}>
                    <div className="ds-spinner"/>
                    <p style={{fontSize:".75rem",color:"#94a3b8",marginTop:8}}>Loading contents…</p>
                  </div>
                ) : (
                  <>
                    <div className="ds-section-label">
                      <span>📄</span> Materials & Activities
                    </div>
                    {lessonContents[lesson._id]?.materials?.length ? (
                      <div className="ds-item-list">
                        {lessonContents[lesson._id].materials.map((m) => (
                          <div key={m._id}>
                            <div className="ds-item">
                              <div className="ds-item-name">
                                <span>📖</span>{m.title}
                              </div>
                              <div className="ds-item-actions">
                                <button className="ds-btn-sm ds-btn-primary-sm"
                                  onClick={() => navigate(`/admin/materials/${m._id}/add-activity`)}>
                                  + Activity
                                </button>
                                <div style={{position:"relative"}}>
                                  <button className="ds-menu-btn"
                                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === m._id ? null : m._id); }}>
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                                    </svg>
                                  </button>
                                  <Menu type="material" id={m._id} lessonId={lesson._id}/>
                                </div>
                              </div>
                            </div>
                            {lessonContents[lesson._id]?.activitiesByMaterial[m._id]?.map((a) => (
                              <div key={a._id} className="ds-activity-item">
                                <div className="ds-activity-name">
                                  <span>⚡</span>{a.name}
                                </div>
                                <div className="ds-item-actions">
                                  <span className={`ds-diff-badge ds-diff-${a.difficulty?.toLowerCase()}`}>{a.difficulty}</span>
                                  <div style={{position:"relative"}}>
                                    <button className="ds-menu-btn"
                                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === a._id ? null : a._id); }}>
                                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                                      </svg>
                                    </button>
                                    <Menu type="activity" id={a._id} lessonId={lesson._id} materialId={m._id}/>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : <p className="ds-empty-state">No materials yet.</p>}

                    <div className="ds-section-label" style={{marginTop:"1rem"}}>
                      <span>✅</span> Assessments
                    </div>
                    {lessonContents[lesson._id]?.assessments?.length ? (
                      <div className="ds-item-list">
                        {lessonContents[lesson._id].assessments.map((asmt) => {
                          const aId = asmt._id || asmt.id;
                          return (
                            <div key={aId} className="ds-item">
                              <div className="ds-item-name"><span>🧩</span>{asmt.title}</div>
                              <div className="ds-item-actions">
                                <div style={{position:"relative"}}>
                                  <button className="ds-menu-btn"
                                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === aId ? null : aId); }}>
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                                    </svg>
                                  </button>
                                  <Menu type="assessment" id={aId} lessonId={lesson._id}/>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <p className="ds-empty-state">No assessments yet.</p>}
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{textAlign:"center",padding:"3rem",color:"#94a3b8",fontSize:".85rem"}}>
            No lessons found.
          </div>
        )}

        {showDeleteModal && (
          <div className="ds-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ds-modal-head">
                <h3>Confirm Delete</h3>
                <button className="ds-modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
              </div>
              <div className="ds-modal-body">
                <div className="ds-modal-icon">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
                  </svg>
                </div>
                <div className="ds-modal-text">
                  <strong>Are you sure?</strong>
                  This action cannot be undone. The item will be permanently deleted.
                </div>
              </div>
              <div className="ds-modal-foot">
                <button className="ds-btn ds-btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="ds-btn ds-btn-danger" onClick={handleConfirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}