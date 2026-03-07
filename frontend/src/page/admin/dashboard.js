import { useState, useEffect } from "react";
import axios from "axios";

// ── Config ────────────────────────────────────────────────────────────────────
const API = "https://little-coders-production.up.railway.app/api";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

// ── Helpers ───────────────────────────────────────────────────────────────────
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ name = "?", size = 32 }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = name.charCodeAt(0) * 37 % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `hsl(${hue},55%,48%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 600, fontSize: size * 0.36,
      flexShrink: 0, fontFamily: "'Sora', sans-serif",
    }}>
      {initials}
    </div>
  );
}

function ProgressBar({ value, color = "#2563eb" }) {
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 99, height: 5, width: "100%", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${Math.min(value, 100)}%`,
        background: color, borderRadius: 99, transition: "width 1s ease",
      }} />
    </div>
  );
}

function SparkBar({ data }) {
  const safeData = Array.isArray(data) && data.length === 7 ? data : Array(7).fill(0);
  const max = Math.max(...safeData, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 56 }}>
      {safeData.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", height: `${(v / max) * 44}px`,
            background: i === safeData.length - 1
              ? "linear-gradient(180deg,#2563eb,#1d4ed8)"
              : "#dbeafe",
            borderRadius: "4px 4px 2px 2px", transition: "height 0.6s ease",
          }} />
          <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Skeleton({ w = "100%", h = 14, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

const topicColor = {
  variables:    { color: "#2563eb", bg: "#eff6ff" },
  operators:    { color: "#d97706", bg: "#fffbeb" },
  conditionals: { color: "#7c3aed", bg: "#f5f3ff" },
  loops:        { color: "#dc2626", bg: "#fef2f2" },
  overview:     { color: "#059669", bg: "#ecfdf5" },
};

const typeIcon = {
  user: (
    <svg width="13" height="13" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0"/>
    </svg>
  ),
  lesson: (
    <svg width="13" height="13" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
    </svg>
  ),
  assessment: (
    <svg width="13" height="13" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
    </svg>
  ),
  material: (
    <svg width="13" height="13" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
    </svg>
  ),
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [loaded, setLoaded]     = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState(null);

  const [users, setUsers]             = useState([]);
  const [lessons, setLessons]         = useState([]);
  const [assessments, setAssessments] = useState([]);
  // { [lessonId]: { materials: number, activities: number } }
  const [lessonMeta, setLessonMeta]   = useState({});

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setFetching(true);
    setError(null);
    try {
      const [usersRes, lessonsRes, assessmentsRes] = await Promise.all([
        axios.get(`${API}/users`, { headers: authHeaders() }),
        axios.get(`${API}/lessons`),
        axios.get(`${API}/assessments`),
      ]);

      // Safely extract arrays — APIs may return { data: [] } wrappers or plain arrays
      const toArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);

      const usersData       = toArray(usersRes.data);
      const lessonsData     = toArray(lessonsRes.data);
      const assessmentsData = toArray(assessmentsRes.data);

      setUsers(usersData);
      setLessons(lessonsData);
      setAssessments(assessmentsData);

      // Per-lesson: fetch materials, then per-material fetch activities.
      // Route mount points confirmed from DragBoardLesson.js:
      //   Materials:  GET /api/materials/lessons/:lessonId/materials
      //   Activities: GET /api/activities/materials/:materialId/activities
      if (lessonsData.length > 0) {
        const metaEntries = await Promise.all(
          lessonsData.map(async (lesson) => {
            const lessonId = lesson._id || lesson.id;
            try {
              const matsRes = await axios.get(`${API}/materials/lessons/${lessonId}/materials`);
              const mats    = toArray(matsRes.data);

              const actCounts = await Promise.all(
                mats.map(async (m) => {
                  const mid = m._id || m.id;
                  try {
                    const actsRes = await axios.get(`${API}/activities/materials/${mid}/activities`);
                    return toArray(actsRes.data).length;
                  } catch {
                    return 0;
                  }
                })
              );

              return [lessonId, {
                materials:  mats.length,
                activities: actCounts.reduce((s, c) => s + c, 0),
              }];
            } catch {
              return [lessonId, { materials: 0, activities: 0 }];
            }
          })
        );
        setLessonMeta(Object.fromEntries(metaEntries));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Check your connection or login status.");
    } finally {
      setFetching(false);
      setTimeout(() => setLoaded(true), 80);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const totalUsers       = users.length;
  const totalLessons     = lessons.length;
  const totalAssessments = assessments.length;
  const totalMaterials   = Object.values(lessonMeta).reduce((s, m) => s + m.materials,  0);
  const totalActivities  = Object.values(lessonMeta).reduce((s, m) => s + m.activities, 0);
  const verifiedUsers    = (Array.isArray(users) ? users : []).filter((u) => u.isVerified).length;
  const verifiedPct      = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

  // Recent 5 users by createdAt desc
  const recentUsers = (Array.isArray(users) ? [...users] : [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Synthesised activity feed from real data
  const feedItems = [
    ...(Array.isArray(users)       ? users.slice(0, 3)       : []).map((u) => ({
      type: "user",
      text: `New user registered: ${u.name}`,
      time: u.createdAt,
    })),
    ...(Array.isArray(lessons)     ? lessons.slice(0, 2)     : []).map((l) => ({
      type: "lesson",
      text: `Lesson available: ${l.title}`,
      time: l.updatedAt || l.createdAt,
    })),
    ...(Array.isArray(assessments) ? assessments.slice(0, 2) : []).map((a) => ({
      type: "assessment",
      text: `Assessment created: ${a.title}`,
      time: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 7);

  // Lessons table enriched with per-lesson counts
  const lessonsTableData = (Array.isArray(lessons) ? lessons : []).map((l) => {
    const id   = l._id || l.id;
    const meta = lessonMeta[id] || { materials: 0, activities: 0 };
    const asmtCount = (Array.isArray(assessments) ? assessments : []).filter((a) => {
      const lid = typeof a.lessonId === "object" ? a.lessonId?._id : a.lessonId;
      return String(lid) === String(id);
    }).length;
    return { ...l, id, ...meta, assessmentCount: asmtCount };
  });

  // New signups per day this week (Mon–Sun)
  const weeklyNew = (() => {
    const now    = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const counts = Array(7).fill(0);
    (Array.isArray(users) ? users : []).forEach((u) => {
      const d    = new Date(u.createdAt);
      const diff = Math.floor((d - monday) / 86400000);
      if (diff >= 0 && diff < 7) counts[diff]++;
    });
    return counts;
  })();

  const onboardedCount = (Array.isArray(users) ? users : []).filter((u) => u.hasCompletedOnboarding).length;

  const statCards = [
    { label: "Total Users",    value: totalUsers.toLocaleString(), icon: "👤", color: "#2563eb", bg: "#eff6ff" },
    { label: "Total Lessons",  value: totalLessons,                icon: "📘", color: "#d97706", bg: "#fffbeb" },
    { label: "Materials",      value: totalMaterials,              icon: "📄", color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Assessments",    value: totalAssessments,            icon: "✅", color: "#dc2626", bg: "#fef2f2" },
    { label: "Activities",     value: totalActivities,             icon: "⚡", color: "#059669", bg: "#ecfdf5" },
    { label: "Verified Users", value: `${verifiedPct}%`,           icon: "🎯", color: "#0891b2", bg: "#ecfeff" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          font-family: 'Sora', sans-serif;
          background: #f8fafc;
          min-height: 100vh;
          color: #1e293b;
        }
        .db-main { padding: 2rem; max-width: 1400px; margin: 0 auto; }

        .db-heading {
          margin-bottom: 1.75rem;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .db-heading.loaded { opacity: 1; transform: none; }
        .db-heading h1 { font-size: 1.55rem; font-weight: 700; letter-spacing: -0.03em; color: #0f172a; line-height: 1.2; }
        .db-heading p  { font-size: 0.8rem; color: #94a3b8; margin-top: 4px; }

        .db-error {
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 10px; padding: 1rem 1.25rem;
          color: #dc2626; font-size: 0.82rem;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 1.5rem;
        }

        .db-stat-grid {
          display: grid; grid-template-columns: repeat(6, 1fr);
          gap: 1rem; margin-bottom: 1.5rem;
        }
        @media (max-width: 1200px) { .db-stat-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 700px)  { .db-stat-grid { grid-template-columns: repeat(2,1fr); } }

        .db-stat {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 1.1rem 1.2rem;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s;
        }
        .db-stat.loaded { opacity: 1; transform: none; }
        .db-stat:hover  { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #cbd5e1; }
        .db-stat-top    { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }
        .db-stat-icon   { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
        .db-stat-value  { font-size: 1.65rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 4px; }
        .db-stat-label  { font-size: 0.72rem; color: #94a3b8; font-weight: 400; }

        .db-mid-row {
          display: grid; grid-template-columns: 1fr 340px;
          gap: 1rem; margin-bottom: 1.5rem;
        }
        @media (max-width: 900px) { .db-mid-row { grid-template-columns: 1fr; } }

        .db-panel {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
          overflow: hidden;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .db-panel.loaded { opacity: 1; transform: none; }
        .db-panel-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem 0.85rem; border-bottom: 1px solid #f1f5f9;
        }
        .db-panel-title { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .db-panel-link  { font-size: 0.7rem; color: #2563eb; font-family: 'DM Mono', monospace; cursor: pointer; }
        .db-panel-link:hover { text-decoration: underline; }
        .db-panel-body  { padding: 1rem 1.25rem; }

        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th {
          text-align: left; font-size: 0.65rem;
          font-family: 'DM Mono', monospace; letter-spacing: 0.08em;
          text-transform: uppercase; color: #94a3b8;
          padding: 0 0 0.65rem; border-bottom: 1px solid #f1f5f9;
        }
        .db-table td {
          padding: 0.7rem 0; font-size: 0.8rem;
          border-bottom: 1px solid #f8fafc; color: #64748b; vertical-align: middle;
        }
        .db-table tr:last-child td { border-bottom: none; }
        .db-table td:first-child   { color: #0f172a; font-weight: 500; }
        .db-chip {
          display: inline-flex; align-items: center;
          background: #f1f5f9; border-radius: 5px;
          padding: 2px 8px; font-size: 0.68rem;
          font-family: 'DM Mono', monospace; color: #64748b;
        }
        .db-topic-pill {
          display: inline-flex; align-items: center;
          border-radius: 99px; padding: 1px 8px;
          font-size: 0.62rem; font-family: 'DM Mono', monospace;
          letter-spacing: 0.04em; text-transform: capitalize; font-weight: 500;
        }

        .db-feed-item { display: flex; align-items: flex-start; gap: 10px; padding: 0.65rem 0; border-bottom: 1px solid #f8fafc; }
        .db-feed-item:last-child { border-bottom: none; }
        .db-feed-icon { width: 26px; height: 26px; border-radius: 7px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .db-feed-text { font-size: 0.78rem; color: #475569; line-height: 1.45; }
        .db-feed-time { font-size: 0.65rem; font-family: 'DM Mono', monospace; color: #94a3b8; margin-top: 2px; }

        .db-empty { text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.78rem; }

        .db-bot-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 700px) { .db-bot-row { grid-template-columns: 1fr; } }

        .db-user-row { display: flex; align-items: center; gap: 10px; padding: 0.6rem 0; border-bottom: 1px solid #f8fafc; }
        .db-user-row:last-child { border-bottom: none; }
        .db-user-info   { flex: 1; min-width: 0; }
        .db-user-name   { font-size: 0.8rem; font-weight: 500; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-user-meta   { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .db-user-joined { font-size: 0.62rem; font-family: 'DM Mono', monospace; color: #94a3b8; }

        .db-chart-wrap  { padding: 1rem 1.25rem 1.25rem; }
        .db-chart-stats { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
        .db-cs-label    { font-size: 0.7rem; color: #94a3b8; margin-bottom: 2px; }
        .db-cs-val      { font-size: 1.2rem; font-weight: 700; color: #0f172a; letter-spacing: -0.03em; }
        .db-cs-val span { font-size: 0.65rem; color: #059669; font-family: 'DM Mono', monospace; margin-left: 5px; font-weight: 400; }

        .db-live-dot {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #059669; animation: livepulse 1.4s infinite;
          margin-right: 5px; vertical-align: middle;
        }
        @keyframes livepulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.8); }
        }

        .db-badge           { font-size: 0.62rem; padding: 2px 8px; border-radius: 99px; font-family: 'DM Mono', monospace; letter-spacing: 0.04em; text-transform: uppercase; }
        .db-badge-admin     { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .db-badge-user      { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .db-badge-verified  { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .db-badge-unverified{ background: #fafafa; color: #94a3b8; border: 1px solid #e2e8f0; }

        .db-divider { height: 1px; background: #f1f5f9; margin: 0 1.25rem; }

        .db-refresh {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'DM Mono', monospace; font-size: 0.7rem;
          color: #64748b; background: #fff; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: 5px 12px; cursor: pointer;
          transition: all 0.15s;
        }
        .db-refresh:hover:not(:disabled) { border-color: #cbd5e1; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .db-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .db-refresh svg { transition: transform 0.5s; }
        .db-refresh:hover:not(:disabled) svg { transform: rotate(180deg); }

        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div className="db-root">
        <div className="db-main">

          {/* Heading */}
          <div className={`db-heading ${loaded ? "loaded" : ""}`}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h1>Overview</h1>
                <p>
                  <span className="db-live-dot" />
                  {fetching
                    ? "Loading data…"
                    : `${totalUsers} users · ${totalLessons} lessons · ${totalAssessments} assessments`}
                </p>
              </div>
              <button className="db-refresh" onClick={fetchAll} disabled={fetching}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                {fetching ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="db-error">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Stat cards */}
          <div className="db-stat-grid">
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`db-stat ${loaded ? "loaded" : ""}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="db-stat-top">
                  <div className="db-stat-icon" style={{ background: card.bg }}>{card.icon}</div>
                </div>
                <div className="db-stat-value" style={{ color: card.color }}>
                  {fetching ? <Skeleton w={60} h={28} /> : card.value}
                </div>
                <div className="db-stat-label">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Middle: Lessons table + Activity feed */}
          <div className="db-mid-row">

            {/* Lessons */}
            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "420ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">Lessons</span>
                <span className="db-panel-link">{totalLessons} total</span>
              </div>
              <div className="db-panel-body">
                {fetching ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...Array(4)].map((_, i) => <Skeleton key={i} h={16} />)}
                  </div>
                ) : lessonsTableData.length === 0 ? (
                  <div className="db-empty">No lessons found.</div>
                ) : (
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Topic</th>
                        <th>Materials</th>
                        <th>Activities</th>
                        <th>Assessments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessonsTableData.map((l) => {
                        const tc = topicColor[l.topic] || { color: "#64748b", bg: "#f1f5f9" };
                        return (
                          <tr key={l.id}>
                            <td>{l.title}</td>
                            <td>
                              <span className="db-topic-pill" style={{ background: tc.bg, color: tc.color }}>
                                {l.topic}
                              </span>
                            </td>
                            <td><span className="db-chip">{l.materials}</span></td>
                            <td><span className="db-chip">{l.activities}</span></td>
                            <td>
                              <span style={{ color: "#059669", fontFamily: "'DM Mono',monospace", fontSize: "0.78rem" }}>
                                {l.assessmentCount}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "500ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">Recent Activity</span>
              </div>
              <div className="db-panel-body">
                {fetching ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...Array(5)].map((_, i) => <Skeleton key={i} h={14} />)}
                  </div>
                ) : feedItems.length === 0 ? (
                  <div className="db-empty">No activity yet.</div>
                ) : (
                  feedItems.map((item, i) => (
                    <div key={i} className="db-feed-item">
                      <div className="db-feed-icon">{typeIcon[item.type]}</div>
                      <div>
                        <div className="db-feed-text">{item.text}</div>
                        <div className="db-feed-time">{timeAgo(item.time)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom: Recent users + Weekly signups */}
          <div className="db-bot-row">

            {/* Recent users */}
            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "560ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">Recent Users</span>
                <span className="db-panel-link">{totalUsers} total</span>
              </div>
              <div className="db-panel-body">
                {fetching ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[...Array(5)].map((_, i) => <Skeleton key={i} h={36} radius={8} />)}
                  </div>
                ) : recentUsers.length === 0 ? (
                  <div className="db-empty">No users yet.</div>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u._id || u.id} className="db-user-row">
                      <Avatar name={u.name} size={34} />
                      <div className="db-user-info">
                        <div className="db-user-name">{u.name}</div>
                        <div className="db-user-meta">
                          <span className={`db-badge db-badge-${u.role}`}>{u.role}</span>
                          <span className={`db-badge db-badge-${u.isVerified ? "verified" : "unverified"}`}>
                            {u.isVerified ? "verified" : "unverified"}
                          </span>
                        </div>
                      </div>
                      <div className="db-user-joined">{timeAgo(u.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekly signups + content breakdown */}
            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "620ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">New Signups This Week</span>
                <span className="db-panel-link" style={{ color: "#94a3b8" }}>Mon – Sun</span>
              </div>
              <div className="db-chart-wrap">
                <div className="db-chart-stats">
                  <div>
                    <div className="db-cs-label">This week</div>
                    <div className="db-cs-val">
                      {weeklyNew.reduce((a, b) => a + b, 0)}
                      <span>signups</span>
                    </div>
                  </div>
                  <div>
                    <div className="db-cs-label">Daily avg</div>
                    <div className="db-cs-val">
                      {(weeklyNew.reduce((a, b) => a + b, 0) / 7).toFixed(1)}
                      <span>/ day</span>
                    </div>
                  </div>
                  <div>
                    <div className="db-cs-label">Onboarded</div>
                    <div className="db-cs-val">
                      {onboardedCount}
                      <span>users</span>
                    </div>
                  </div>
                </div>
                {fetching ? <Skeleton h={56} radius={6} /> : <SparkBar data={weeklyNew} />}
              </div>

              <div className="db-divider" />

              <div style={{ padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.75rem", fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Content Breakdown
                </div>
                {[
                  { label: "Lessons",     value: totalLessons,     color: "#d97706" },
                  { label: "Materials",   value: totalMaterials,   color: "#7c3aed" },
                  { label: "Activities",  value: totalActivities,  color: "#059669" },
                  { label: "Assessments", value: totalAssessments, color: "#dc2626" },
                ].map((item) => {
                  const total = totalLessons + totalMaterials + totalActivities + totalAssessments || 1;
                  return (
                    <div key={item.label} style={{ marginBottom: "0.65rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.73rem", color: "#64748b" }}>{item.label}</span>
                        <span style={{ fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#94a3b8" }}>
                          {fetching ? "—" : item.value}
                        </span>
                      </div>
                      <ProgressBar value={(item.value / total) * 100} color={item.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}