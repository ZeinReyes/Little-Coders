import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── Avatar map ───────────────────────────────────────────────────────────────
const AVATARS = {
  bear:   { emoji: "🐻", bg: "#FFF0D6", border: "#FFB347" },
  cat:    { emoji: "🐱", bg: "#FFF0F5", border: "#FF9EB5" },
  dog:    { emoji: "🐶", bg: "#F0F8FF", border: "#74B9FF" },
  fox:    { emoji: "🦊", bg: "#FFF4EC", border: "#FF7043" },
  panda:  { emoji: "🐼", bg: "#F5F5F5", border: "#90A4AE" },
  rabbit: { emoji: "🐰", bg: "#FDF0FF", border: "#CE93D8" },
};

const AVATAR_OPTIONS = Object.keys(AVATARS);

const GENDER_COLORS = {
  boy:   { bg: "#E3F2FD", accent: "#1976D2" },
  girl:  { bg: "#FCE4EC", accent: "#C2185B" },
  other: { bg: "#F3E5F5", accent: "#7B1FA2" },
};

const API = "https://little-coders-production.up.railway.app/api";

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  if (!seconds || seconds === 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

// ── Radial progress ring ─────────────────────────────────────────────────────
function RadialProgress({ pct, size = 80, color = "#667eea", trackColor = "#e8e4ff" }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={7} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)" }}
      />
      <text
        x={size/2} y={size/2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        style={{
          transform: `rotate(90deg) translate(0px, -${size}px)`,
          transformOrigin: "center",
          fill: color, fontSize: size * 0.21,
          fontWeight: 800, fontFamily: "'Comic Sans MS', cursive",
        }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 72 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{
            width: "100%", borderRadius: "5px 5px 0 0",
            background: `${color}bb`,
            height: `${Math.max((d.value / max) * 58, d.value > 0 ? 4 : 0)}px`,
            transition: "height 0.7s ease",
          }} title={`${d.label}: ${d.display || d.value}`} />
          <div style={{ fontSize: "0.58rem", color: "#bbb", textAlign: "center" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#fff", borderRadius: 14, padding: "12px 16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)", flex: "1 1 130px",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#2d2d2d", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.72rem", color: "#aaa", fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Per-lesson drill-down ────────────────────────────────────────────────────
function LessonDetail({ p }) {
  if (!p) return null;

  const matTime = p.materialTime?.reduce((s, m) => s + (m.timeSeconds || 0), 0) || 0;
  const actTime = p.activityAttempts?.reduce((s, a) => s + (a.timeSeconds || 0), 0) || 0;
  const totalTime = matTime + actTime;
  const correctActs = p.activityAttempts?.filter(a => a.correct).length || 0;
  const totalActAttempts = p.activityAttempts?.reduce((s, a) => s + (a.totalAttempts || 1), 0) || 0;
  const accuracy = p.activityAttempts?.length > 0 ? Math.round((correctActs / p.activityAttempts.length) * 100) : 0;

  const matBars = (p.materialTime || []).slice(0, 7).map((m, i) => ({
    label: `M${i+1}`, value: Math.round(m.timeSeconds || 0), display: formatTime(m.timeSeconds || 0),
  }));
  const actBars = (p.activityAttempts || []).slice(0, 7).map((a, i) => ({
    label: `A${i+1}`, value: a.totalAttempts || 1,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stat pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <StatPill icon="⏱️" label="Total Time" value={formatTime(totalTime)} color="#667eea" />
        <StatPill icon="🎯" label="Accuracy" value={`${accuracy}%`} color="#43e97b" />
        <StatPill icon="🔁" label="Attempts" value={totalActAttempts} color="#FF7043" />
        <StatPill icon="📋" label="Quizzes" value={p.completedAssessments?.length || 0} color="#FFB347" />
      </div>

      {/* Charts */}
      {(matBars.length > 0 || actBars.length > 0) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {matBars.length > 0 && (
            <div style={{ flex: "1 1 180px", background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#667eea", marginBottom: 8 }}>⏱ Time per Material</div>
              <MiniBar data={matBars} color="#667eea" />
            </div>
          )}
          {actBars.length > 0 && (
            <div style={{ flex: "1 1 180px", background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FF7043", marginBottom: 8 }}>🔁 Attempts per Activity</div>
              <MiniBar data={actBars} color="#FF7043" />
            </div>
          )}
        </div>
      )}

      {/* Assessment rows */}
      {p.assessmentAttempts?.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", marginBottom: 10 }}>📝 Quiz Questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {p.assessmentAttempts.map((a, i) => {
              const dc = a.difficulty === "Hard" ? "#e53935" : a.difficulty === "Medium" ? "#FF9800" : "#43e97b";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#fafafa", borderRadius: 10, padding: "8px 12px",
                  flexWrap: "wrap",
                }}>
                  <span style={{
                    background: `${dc}18`, color: dc, border: `1px solid ${dc}44`,
                    borderRadius: 50, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
                  }}>{a.difficulty || "Easy"}</span>
                  <span style={{ fontSize: "0.75rem", color: "#999" }}>Q{i+1}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: a.correct ? "#43e97b" : "#e53935" }}>
                    {a.correct ? "✅ Correct" : "❌ Wrong"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#bbb" }}>{a.totalAttempts} try{a.totalAttempts !== 1 ? "s" : ""}</span>
                  <span style={{ fontSize: "0.72rem", color: "#bbb" }}>{formatTime(a.timeSeconds)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion mini-stats */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Materials done", value: p.completedMaterials?.length || 0, bg: "#F0FDF4", color: "#22c55e" },
          { label: "Activities done", value: correctActs, bg: "#EFF6FF", color: "#3b82f6" },
          { label: "Assessments", value: p.completedAssessments?.length || 0, bg: "#FFF7ED", color: "#f97316" },
        ].map((s, i) => (
          <div key={i} style={{ flex: "1 1 100px", background: s.bg, borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: s.color, fontWeight: 700, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Progress card for one child ──────────────────────────────────────────────
function ProgressCard({ child, userId, token }) {
  const [progresses, setProgresses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const av = AVATARS[child.avatar] || AVATARS.bear;
  const gc = GENDER_COLORS[child.gender] || GENDER_COLORS.other;

  const load = () => {
    if (progresses !== null) return;
    setLoading(true);
    axios.get(`${API}/progress/${userId}/${child._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const data = res.data;
      setProgresses(Array.isArray(data) ? data : data ? [data] : []);
    }).catch(() => setProgresses([])).finally(() => setLoading(false));
  };

  const toggle = () => {
    if (!expanded) load();
    setExpanded(e => !e);
  };

  const avgPct = progresses?.length > 0
    ? Math.round(progresses.reduce((s, p) => s + (p.progressPercentage || 0), 0) / progresses.length)
    : null;

  const totalTime = progresses?.reduce((s, p) => {
    return s
      + (p.materialTime?.reduce((t, m) => t + (m.timeSeconds || 0), 0) || 0)
      + (p.activityAttempts?.reduce((t, a) => t + (a.timeSeconds || 0), 0) || 0);
  }, 0) || 0;

  const doneLessons = progresses?.filter(p => p.isLessonCompleted).length || 0;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 22,
      border: `2px solid ${expanded ? av.border : "transparent"}`,
      boxShadow: expanded
        ? `0 8px 32px ${av.border}33`
        : "0 3px 14px rgba(0,0,0,0.07)",
      overflow: "hidden",
      transition: "box-shadow 0.3s, border-color 0.3s",
    }}>
      {/* Header */}
      <div
        onClick={toggle}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 20px", cursor: "pointer",
          background: expanded ? `${av.border}0d` : "#fff",
          transition: "background 0.2s",
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          background: av.bg, border: `3px solid ${av.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", flexShrink: 0,
        }}>{av.emoji}</div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "#2d2d2d" }}>{child.name}</div>
          <div style={{ fontSize: "0.75rem", color: "#bbb", fontWeight: 600 }}>
            Age {child.age} · {child.gender}
          </div>
        </div>

        {/* Quick stats (only after loaded) */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
          {avgPct !== null ? (
            <RadialProgress pct={avgPct} size={52} color={av.border} trackColor={`${av.border}22`} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#ccc" }}>—</div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#2d2d2d" }}>{progresses ? doneLessons : "—"}</div>
            <div style={{ fontSize: "0.65rem", color: "#bbb", fontWeight: 600 }}>lessons</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#2d2d2d" }}>{progresses ? formatTime(totalTime) : "—"}</div>
            <div style={{ fontSize: "0.65rem", color: "#bbb", fontWeight: 600 }}>time</div>
          </div>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `${av.border}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", color: av.border,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
          }}>▼</div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 20px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#ccc" }}>
              <div style={{ fontSize: "1.4rem", animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</div>
              <div style={{ fontSize: "0.82rem", marginTop: 8 }}>Loading…</div>
            </div>
          ) : progresses?.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#ccc", fontSize: "0.88rem" }}>
              No lessons started yet 🌱
            </div>
          ) : (
            <>
              {/* Lesson tabs */}
              {progresses.length > 1 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  {progresses.map((p, i) => (
                    <button key={i} onClick={() => setActiveIdx(i)} style={{
                      padding: "5px 14px", borderRadius: 50, border: "2px solid",
                      borderColor: activeIdx === i ? av.border : "#eee",
                      background: activeIdx === i ? `${av.border}18` : "#fafafa",
                      color: activeIdx === i ? av.border : "#aaa",
                      fontWeight: 700, fontSize: "0.75rem", cursor: "pointer",
                      fontFamily: "inherit",
                    }}>
                      Lesson {i+1} {p.isLessonCompleted ? "✅" : `· ${Math.round(p.progressPercentage || 0)}%`}
                    </button>
                  ))}
                </div>
              )}
              <LessonDetail p={progresses[activeIdx]} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ChildSelectPage() {
  const navigate = useNavigate();
  const [user,       setUser]       = useState(null);
  const [children,   setChildren]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("profiles"); // "profiles" | "progress"
  const [showAdd,    setShowAdd]    = useState(false);
  const [showEdit,   setShowEdit]   = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form,       setForm]       = useState({ name: "", age: "", gender: "boy", avatar: "bear" });
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [token,      setToken]      = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const tok    = localStorage.getItem("token");
    if (!stored || !tok) { navigate("/login"); return; }
    const parent = JSON.parse(stored);
    setUser(parent);
    setToken(tok);
    axios.get(`${API}/users/${parent.id || parent._id}/children`, {
      headers: { Authorization: `Bearer ${tok}` },
    })
      .then(res => setChildren(res.data))
      .catch(() => setChildren([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSelect = (child) => {
    sessionStorage.setItem("activeChild", JSON.stringify(child));
    navigate("/home");
  };

  const handleAdd = async () => {
    setError("");
    if (!form.name.trim() || !form.age || !form.gender) { setError("Please fill in all fields."); return; }
    setSaving(true);
    try {
      const res = await axios.post(
        `${API}/users/${user.id || user._id}/children`, form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(prev => [...prev, res.data.child]);
      setShowAdd(false);
      setForm({ name: "", age: "", gender: "boy", avatar: "bear" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add child.");
    } finally { setSaving(false); }
  };

  const openEdit = (child, e) => {
    e.stopPropagation();
    setShowEdit(child);
    setForm({ name: child.name, age: child.age, gender: child.gender, avatar: child.avatar || "bear" });
    setError("");
  };

  const handleEdit = async () => {
    setError(""); setSaving(true);
    try {
      const res = await axios.put(
        `${API}/users/${user.id || user._id}/children/${showEdit._id}`, form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(prev => prev.map(c => c._id === showEdit._id ? res.data.child : c));
      setShowEdit(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update child.");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API}/users/${user.id || user._id}/children/${showDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChildren(prev => prev.filter(c => c._id !== showDelete._id));
      setShowDelete(null);
    } catch { setError("Failed to delete child."); }
  };

  const handleLogout = () => {
    localStorage.clear(); sessionStorage.clear(); navigate("/login");
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .child-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.13) !important; }
        .play-btn:hover { transform: scale(1.05); }
        .add-card:hover { border-color: #667eea !important; background: rgba(102,126,234,0.05) !important; }
        .add-card:hover .add-icon { color: #667eea !important; }
      `}</style>

      <div style={styles.blob1} /><div style={styles.blob2} /><div style={styles.blob3} />

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>Little Coders</span>
        <div style={styles.headerRight}>
          <span style={styles.parentName}>Hi, {user?.name}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={styles.tabBar}>
        {[
          { key: "profiles", label: "👦 Profiles" },
          { key: "progress", label: "📊 Progress" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...styles.tabBtn,
              background: activeTab === tab.key
                ? "linear-gradient(135deg, #667eea, #764ba2)"
                : "rgba(255,255,255,0.7)",
              color: activeTab === tab.key ? "#fff" : "#888",
              boxShadow: activeTab === tab.key
                ? "0 4px 16px rgba(102,126,234,0.35)"
                : "none",
              transform: activeTab === tab.key ? "scale(1.04)" : "scale(1)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILES TAB ── */}
      {activeTab === "profiles" && (
        <>
          <div style={{ ...styles.titleWrap, animation: "fadeUp 0.4s ease" }}>
            <h1 style={styles.title}>Who's playing today?</h1>
            <p style={styles.subtitle}>Pick your profile to start your coding adventure!</p>
          </div>

          <div style={styles.grid}>
            {children.map((child, i) => {
              const av = AVATARS[child.avatar] || AVATARS.bear;
              const gc = GENDER_COLORS[child.gender] || GENDER_COLORS.other;
              return (
                <div
                  key={child._id}
                  className="child-card"
                  style={{
                    ...styles.card, background: gc.bg, borderColor: gc.accent,
                    animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => handleSelect(child)}
                >
                  <div style={styles.cardActions}>
                    <button style={styles.iconBtn} onClick={e => openEdit(child, e)} title="Edit">✏️</button>
                    <button style={{ ...styles.iconBtn, background: "#FFEBEE" }} onClick={e => { e.stopPropagation(); setShowDelete(child); }} title="Delete">🗑️</button>
                  </div>
                  <div style={{ ...styles.avatarCircle, background: av.bg, border: `4px solid ${av.border}` }}>
                    <span style={styles.avatarEmoji}>{av.emoji}</span>
                  </div>
                  <div style={styles.childName}>{child.name}</div>
                  <div style={{ ...styles.childMeta, color: gc.accent }}>
                    Age {child.age} · {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                  </div>
                  <button
                    className="play-btn"
                    style={{ ...styles.playBtn, background: gc.accent, transition: "transform 0.15s" }}
                    onClick={e => { e.stopPropagation(); handleSelect(child); }}
                  >▶ Play</button>
                </div>
              );
            })}

            <div
              className="add-card"
              style={{ ...styles.addCard, transition: "border-color 0.2s, background 0.2s" }}
              onClick={() => { setShowAdd(true); setForm({ name: "", age: "", gender: "boy", avatar: "bear" }); setError(""); }}
            >
              <div className="add-icon" style={styles.addIcon}>＋</div>
              <div style={styles.addLabel}>Add Child</div>
            </div>
          </div>
        </>
      )}

      {/* ── PROGRESS TAB ── */}
      {activeTab === "progress" && (
        <div style={{ width: "100%", maxWidth: 820, animation: "fadeUp 0.4s ease" }}>
          <div style={{ textAlign: "center", margin: "1.5rem 0 2rem" }}>
            <h1 style={{ ...styles.title, fontSize: "clamp(1.5rem,4vw,2.2rem)" }}>Progress Report</h1>
            <p style={styles.subtitle}>See how each child is doing across their lessons</p>
          </div>

          {children.length === 0 ? (
            <div style={{ textAlign: "center", color: "#ccc", padding: "60px 0", fontSize: "0.95rem" }}>
              No child profiles yet 🌱
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {children.map((child, i) => (
                <div key={child._id} style={{ animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
                  <ProgressCard child={child} userId={user?.id || user?._id} token={token} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showAdd && (
        <Modal title="Add a Child Profile" onClose={() => setShowAdd(false)}>
          <ChildForm form={form} setForm={setForm} error={error} />
          <ModalFooter onCancel={() => setShowAdd(false)} onConfirm={handleAdd} confirmLabel={saving ? "Saving…" : "Add Profile 🎉"} disabled={saving} />
        </Modal>
      )}
      {showEdit && (
        <Modal title="Edit Child Profile" onClose={() => setShowEdit(null)}>
          <ChildForm form={form} setForm={setForm} error={error} />
          <ModalFooter onCancel={() => setShowEdit(null)} onConfirm={handleEdit} confirmLabel={saving ? "Saving…" : "Save Changes ✅"} disabled={saving} />
        </Modal>
      )}
      {showDelete && (
        <Modal title="Remove Profile?" onClose={() => setShowDelete(null)}>
          <p style={{ textAlign: "center", color: "#555", fontSize: "1rem" }}>
            Are you sure you want to remove <strong>{showDelete.name}</strong>'s profile?<br />
            <span style={{ color: "#e53935", fontSize: "0.9rem" }}>All their progress will be lost.</span>
          </p>
          <ModalFooter onCancel={() => setShowDelete(null)} onConfirm={handleDelete} confirmLabel="Yes, Remove" danger />
        </Modal>
      )}
    </div>
  );
}

// ── Child Form ────────────────────────────────────────────────────────────────
function ChildForm({ form, setForm, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={styles.label}>Child's Name</label>
        <input style={styles.input} placeholder="e.g. Alex" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label style={styles.label}>Age</label>
        <input style={styles.input} type="number" min={3} max={17} placeholder="e.g. 8" value={form.age}
          onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
      </div>
      <div>
        <label style={styles.label}>Gender</label>
        <div style={{ display: "flex", gap: 10 }}>
          {["boy", "girl", "other"].map(g => (
            <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))} style={{
              flex: 1, padding: "10px", borderRadius: "12px", border: "2px solid", cursor: "pointer",
              fontWeight: 700, fontSize: "0.9rem", fontFamily: "inherit",
              borderColor: form.gender === g ? GENDER_COLORS[g].accent : "#ddd",
              background: form.gender === g ? GENDER_COLORS[g].bg : "#fafafa",
              color: form.gender === g ? GENDER_COLORS[g].accent : "#888",
            }}>
              {g === "boy" ? "👦 Boy" : g === "girl" ? "👧 Girl" : "🧒 Other"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={styles.label}>Choose Avatar</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {Object.entries(AVATARS).map(([key, av]) => (
            <button key={key} onClick={() => setForm(f => ({ ...f, avatar: key }))} style={{
              width: 60, height: 60, borderRadius: "50%",
              border: `3px solid ${form.avatar === key ? av.border : "#ddd"}`,
              background: av.bg, cursor: "pointer", fontSize: "1.8rem",
              transition: "transform 0.15s",
              transform: form.avatar === key ? "scale(1.2)" : "scale(1)",
            }}>{av.emoji}</button>
          ))}
        </div>
      </div>
      {error && <p style={{ color: "#e53935", fontSize: "0.88rem", textAlign: "center", margin: 0 }}>⚠️ {error}</p>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, confirmLabel, disabled, danger }) {
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
      <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      <button style={{
        ...styles.confirmBtn,
        background: danger ? "linear-gradient(135deg,#e53935,#c62828)" : "linear-gradient(135deg,#43e97b,#38f9d7)",
        color: danger ? "#fff" : "#1a5c3a",
        opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer",
      }} onClick={onConfirm} disabled={disabled}>{confirmLabel}</button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ ...styles.page, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}>🎮</div>
      <p style={{ fontFamily: "'Comic Sans MS', cursive", color: "#667eea", marginTop: 12 }}>Loading profiles…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #e0f7fa 0%, #fce4ec 50%, #ede7f6 100%)",
    position: "relative", overflow: "hidden",
    fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "0 1rem 3rem",
  },
  blob1: { position: "absolute", top: "-80px", left: "-80px", width: 320, height: 320, borderRadius: "50%", background: "rgba(255,183,77,0.18)", pointerEvents: "none" },
  blob2: { position: "absolute", bottom: "-60px", right: "-60px", width: 280, height: 280, borderRadius: "50%", background: "rgba(102,126,234,0.15)", pointerEvents: "none" },
  blob3: { position: "absolute", top: "40%", left: "60%", width: 200, height: 200, borderRadius: "50%", background: "rgba(67,233,123,0.1)", pointerEvents: "none" },
  header: { width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 0" },
  headerRight: { display: "flex", alignItems: "center", gap: 14 },
  logo: { fontSize: "1.3rem", fontWeight: 700, color: "#667eea" },
  parentName: { color: "#555", fontSize: "0.95rem" },
  logoutBtn: { background: "transparent", border: "2px solid #ccc", borderRadius: 50, padding: "5px 16px", cursor: "pointer", color: "#888", fontSize: "0.88rem", fontFamily: "inherit" },
  tabBar: { display: "flex", gap: 10, marginTop: "1.2rem", marginBottom: "0.5rem", background: "rgba(255,255,255,0.55)", borderRadius: 50, padding: "6px 8px", backdropFilter: "blur(8px)", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" },
  tabBtn: { border: "none", borderRadius: 50, padding: "9px 26px", fontWeight: 800, fontSize: "0.92rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.22s cubic-bezier(.4,0,.2,1)" },
  titleWrap: { textAlign: "center", margin: "1.5rem 0 2.5rem" },
  title: { fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 700, color: "#3d2c8d", margin: 0, textShadow: "2px 3px 0 rgba(102,126,234,0.15)" },
  subtitle: { color: "#777", fontSize: "1rem", marginTop: 6 },
  grid: { display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", maxWidth: 960, width: "100%" },
  card: { position: "relative", width: 180, minHeight: 240, borderRadius: 24, border: "3px solid", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem 1rem", cursor: "pointer", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.09)" },
  cardActions: { position: "absolute", top: 10, right: 10, display: "flex", gap: 4 },
  iconBtn: { background: "#fff8", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarCircle: { width: 90, height: 90, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: "3rem" },
  childName: { fontSize: "1.15rem", fontWeight: 700, color: "#333", textAlign: "center" },
  childMeta: { fontSize: "0.8rem", fontWeight: 600 },
  playBtn: { marginTop: 6, color: "#fff", border: "none", borderRadius: 50, padding: "8px 24px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem", fontFamily: "inherit", boxShadow: "0 4px 0 rgba(0,0,0,0.15)" },
  addCard: { width: 180, minHeight: 240, borderRadius: 24, border: "3px dashed #bbb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 12, background: "rgba(255,255,255,0.6)" },
  addIcon: { fontSize: "2.5rem", color: "#aaa" },
  addLabel: { fontSize: "1rem", color: "#aaa", fontWeight: 700 },
  label: { display: "block", marginBottom: 6, fontSize: "0.9rem", fontWeight: 700, color: "#555" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid #ddd", fontSize: "1rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" },
  modal: { background: "#fff", borderRadius: 24, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" },
  modalHeader: { background: "linear-gradient(135deg,#667eea,#764ba2)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { color: "#fff", fontWeight: 700, fontSize: "1.15rem" },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: 24 },
  cancelBtn: { background: "#f5f5f5", border: "2px solid #ddd", borderRadius: 50, padding: "8px 20px", cursor: "pointer", color: "#666", fontFamily: "inherit", fontWeight: 700, fontSize: "0.9rem" },
  confirmBtn: { border: "none", borderRadius: 50, padding: "8px 24px", fontWeight: 700, fontSize: "0.9rem", fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,0.12)" },
};