import { useState, useEffect } from "react";
import axios from "axios";

// ── Config ────────────────────────────────────────────────────────────────────
const API = "https://little-coders-production.up.railway.app/api";
const token = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

// ── Helpers ───────────────────────────────────────────────────────────────────
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AVATAR_EMOJI = {
  bear: "🐻", cat: "🐱", dog: "🐶",
  fox: "🦊", panda: "🐼", rabbit: "🐰",
};

const CHILD_COLORS = [
  { bg: "#eff6ff", text: "#1d4ed8", bar: "#2563eb" },
  { bg: "#ecfdf5", text: "#065f46", bar: "#059669" },
  { bg: "#fffbeb", text: "#92400e", bar: "#d97706" },
  { bg: "#f5f3ff", text: "#4c1d95", bar: "#7c3aed" },
  { bg: "#fef2f2", text: "#991b1b", bar: "#dc2626" },
  { bg: "#fdf2f8", text: "#831843", bar: "#db2777" },
];

// Age group buckets
const AGE_GROUPS = [
  { label: "4–5",   min: 4,  max: 5,  color: "#7c3aed", bg: "#f5f3ff" },
  { label: "6–7",   min: 6,  max: 7,  color: "#2563eb", bg: "#eff6ff" },
  { label: "8–9",   min: 8,  max: 9,  color: "#059669", bg: "#ecfdf5" },
  { label: "10–12", min: 10, max: 12, color: "#d97706", bg: "#fffbeb" },
  { label: "13+",   min: 13, max: 99, color: "#dc2626", bg: "#fef2f2" },
];

function childColor(i) { return CHILD_COLORS[i % CHILD_COLORS.length]; }

function ageGroup(age) {
  return AGE_GROUPS.find(g => age >= g.min && age <= g.max) || AGE_GROUPS[AGE_GROUPS.length - 1];
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtTime(seconds) {
  if (!seconds || seconds === 0) return "—";
  if (seconds < 60)   return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// ── Shared UI components ──────────────────────────────────────────────────────
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
    }}>{initials}</div>
  );
}

function ProgressBar({ value, color = "#2563eb" }) {
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 99, height: 5, width: "100%", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
    </div>
  );
}

function MiniProgressBar({ value, color = "#2563eb", height = 4 }) {
  return (
    <div style={{ background: "#e2e8f0", borderRadius: 99, height, width: "100%", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(Math.max(value, 0), 100)}%`, background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    "not started": { bg: "#f1f5f9", color: "#94a3b8", label: "Not started" },
    "in progress":  { bg: "#fffbeb", color: "#d97706", label: "In progress" },
    "completed":    { bg: "#ecfdf5", color: "#059669", label: "Completed"   },
  };
  const s = map[status] || map["not started"];
  return (
    <span style={{ fontSize: "0.6rem", fontFamily: "'DM Mono',monospace", padding: "1px 6px", borderRadius: 99, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
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
            background: i === safeData.length - 1 ? "linear-gradient(180deg,#2563eb,#1d4ed8)" : "#dbeafe",
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
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
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
  user:       (<svg width="13" height="13" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0"/></svg>),
  lesson:     (<svg width="13" height="13" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>),
  assessment: (<svg width="13" height="13" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>),
  material:   (<svg width="13" height="13" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>),
};

// ══════════════════════════════════════════════════════════════════════════════
// AGE GROUP ANALYTICS
// Summary row per group + lesson heatmap (age group × lesson)
// ══════════════════════════════════════════════════════════════════════════════
function AgeGroupAnalytics({ allChildren, allLessonTitles, fetching, loaded }) {
  const [view, setView] = useState("summary");

  const groupData = AGE_GROUPS.map(group => {
    const kids = allChildren.filter(c => c.age >= group.min && c.age <= group.max);
    if (kids.length === 0) return null;

    const avgPct       = Math.round(kids.reduce((s, c) => s + c.avgPct, 0) / kids.length);
    const avgTime      = Math.round(kids.reduce((s, c) => s + c.totalTimeSeconds, 0) / kids.length);
    const totalAttempts = kids.reduce((s, c) => s + c.totalAttempts, 0);

    const lessonAvgs = {};
    allLessonTitles.forEach(title => {
      const pcts = kids.map(c => c.progress.find(p => p.lesson === title)?.pct ?? 0);
      lessonAvgs[title] = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    });

    const top = [...kids].sort((a, b) => b.avgPct - a.avgPct)[0];
    return { ...group, count: kids.length, avgPct, avgTime, totalAttempts, kids, lessonAvgs, top };
  }).filter(Boolean);

  const maxCount = Math.max(...groupData.map(g => g.count), 1);

  if (!fetching && groupData.length === 0) return null;

  return (
    <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "360ms" }}>
      <div className="db-panel-head">
        <span className="db-panel-title">Analysis by age group</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ key: "summary", label: "Summary" }, { key: "heatmap", label: "Lesson heatmap" }].map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{
              fontSize: "0.6rem", fontFamily: "'DM Mono',monospace",
              padding: "2px 8px", borderRadius: 5, border: "1px solid", cursor: "pointer",
              borderColor: view === v.key ? "#2563eb" : "#e2e8f0",
              background:  view === v.key ? "#eff6ff"  : "transparent",
              color:       view === v.key ? "#2563eb"  : "#94a3b8",
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {fetching ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "1rem 1.25rem" }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} h={44} radius={8} />)}
        </div>
      ) : view === "summary" ? (
        <>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 100px 90px 80px 110px", padding: "0.5rem 1.25rem", borderBottom: "1px solid #f1f5f9", background: "#fafbfc" }}>
            {["Age group", "Avg completion", "Children", "Avg time", "Attempts", "Top performer"].map(h => (
              <div key={h} style={{ fontSize: "0.58rem", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8" }}>{h}</div>
            ))}
          </div>

          {groupData.map((g, i) => (
            <div key={g.label} style={{
              display: "grid", gridTemplateColumns: "90px 1fr 100px 90px 80px 110px",
              padding: "0.8rem 1.25rem", alignItems: "center",
              borderBottom: i < groupData.length - 1 ? "1px solid #f8fafc" : "none",
            }}>
              {/* Pill */}
              <div>
                <span style={{ fontSize: "0.7rem", fontFamily: "'DM Mono',monospace", fontWeight: 500, padding: "2px 9px", borderRadius: 99, background: g.bg, color: g.color }}>
                  {g.label}
                </span>
              </div>

              {/* Avg completion bar */}
              <div style={{ paddingRight: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 99, height: 7, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${g.avgPct}%`, background: g.color, borderRadius: 99, transition: "width 0.9s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontFamily: "'DM Mono',monospace", color: g.color, fontWeight: 600, minWidth: 30 }}>{g.avgPct}%</span>
                </div>
                <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>
                  {g.kids.filter(c => c.completedLessons > 0).length} of {g.count} completed ≥1 lesson
                </div>
              </div>

              {/* Count */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 36, background: "#e2e8f0", borderRadius: 99, height: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(g.count / maxCount) * 100}%`, background: g.color, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontFamily: "'DM Mono',monospace", color: "#0f172a", fontWeight: 500 }}>{g.count}</span>
              </div>

              {/* Avg time */}
              <div style={{ fontSize: "0.72rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{fmtTime(g.avgTime)}</div>

              {/* Attempts */}
              <div style={{ fontSize: "0.72rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{g.totalAttempts}</div>

              {/* Top performer */}
              <div>
                {g.top ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 13 }}>{AVATAR_EMOJI[g.top.avatar] || "🧒"}</span>
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "#0f172a" }}>{g.top.name}</div>
                      <div style={{ fontSize: "0.58rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{g.top.avgPct}%</div>
                    </div>
                  </div>
                ) : <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>—</span>}
              </div>
            </div>
          ))}

          {/* Insight footer */}
          {groupData.length >= 2 && (() => {
            const best  = [...groupData].sort((a, b) => b.avgPct - a.avgPct)[0];
            const worst = [...groupData].sort((a, b) => a.avgPct - b.avgPct)[0];
            return (
              <div style={{ padding: "0.65rem 1.25rem", borderTop: "1px solid #f1f5f9", background: "#fafbfc", fontSize: "0.7rem", color: "#64748b", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span>
                  <span style={{ color: best.color, fontWeight: 500 }}>Age {best.label}</span> leads with{" "}
                  <span style={{ fontFamily: "'DM Mono',monospace", color: "#0f172a" }}>{best.avgPct}%</span> avg completion
                </span>
                <span style={{ color: "#e2e8f0" }}>|</span>
                <span>
                  <span style={{ color: worst.color, fontWeight: 500 }}>Age {worst.label}</span> needs most support —{" "}
                  <span style={{ fontFamily: "'DM Mono',monospace", color: "#0f172a" }}>{worst.avgPct}%</span> avg
                </span>
              </div>
            );
          })()}
        </>
      ) : (
        // Heatmap view
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                <th style={{ fontSize: "0.58rem", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", textAlign: "left", padding: "0.6rem 1.25rem", fontWeight: 400, minWidth: 80 }}>
                  Age group
                </th>
                {allLessonTitles.map(title => (
                  <th key={title} style={{ fontSize: "0.6rem", fontFamily: "'DM Mono',monospace", color: "#64748b", textAlign: "center", padding: "0.6rem 0.5rem", fontWeight: 400, minWidth: 70 }}>
                    {title.length > 11 ? title.slice(0, 11) + "…" : title}
                  </th>
                ))}
                <th style={{ fontSize: "0.58rem", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", textAlign: "center", padding: "0.6rem 1.25rem 0.6rem 0.5rem", fontWeight: 400 }}>
                  Overall
                </th>
              </tr>
            </thead>
            <tbody>
              {groupData.map((g, gi) => (
                <tr key={g.label} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.65rem 1.25rem" }}>
                    <span style={{ fontSize: "0.7rem", fontFamily: "'DM Mono',monospace", fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: g.bg, color: g.color }}>
                      {g.label}
                    </span>
                    <div style={{ fontSize: "0.58rem", color: "#94a3b8", marginTop: 2 }}>{g.count} kids</div>
                  </td>
                  {allLessonTitles.map(title => {
                    const pct   = g.lessonAvgs[title] ?? 0;
                    const alpha = Math.round((pct / 100) * 0.82 * 255).toString(16).padStart(2, "0");
                    const cellBg  = pct === 0 ? "#f8fafc" : `${g.color}${alpha}`;
                    const textCol = pct >= 55 ? "#fff" : pct >= 25 ? g.color : "#94a3b8";
                    return (
                      <td key={title} style={{ padding: "0.45rem 0.4rem", textAlign: "center" }}>
                        <div style={{ background: cellBg, borderRadius: 6, padding: "0.3rem 0.2rem", transition: "background 0.5s ease" }}>
                          <div style={{ fontSize: "0.7rem", fontWeight: 600, fontFamily: "'DM Mono',monospace", color: textCol }}>{pct}%</div>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: "0.45rem 1.25rem 0.45rem 0.4rem", textAlign: "center" }}>
                    <div style={{ background: g.bg, borderRadius: 6, padding: "0.3rem 0.4rem", display: "inline-block" }}>
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, fontFamily: "'DM Mono',monospace", color: g.color }}>{g.avgPct}%</div>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Column averages */}
              <tr style={{ borderTop: "2px solid #e2e8f0", background: "#fafbfc" }}>
                <td style={{ padding: "0.6rem 1.25rem", fontSize: "0.62rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>All ages avg</td>
                {allLessonTitles.map(title => {
                  const allPcts = allChildren.map(c => c.progress.find(p => p.lesson === title)?.pct ?? 0);
                  const avg = allPcts.length ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
                  return (
                    <td key={title} style={{ padding: "0.45rem 0.4rem", textAlign: "center" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "'DM Mono',monospace", color: "#0f172a", fontWeight: 500 }}>{avg}%</span>
                    </td>
                  );
                })}
                <td />
              </tr>
            </tbody>
          </table>
          {/* Legend */}
          <div style={{ padding: "0.6rem 1.25rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>0%</span>
            {[10, 30, 50, 70, 90].map(v => (
              <div key={v} style={{ width: 20, height: 11, borderRadius: 3, background: `rgba(37,99,235,${(v / 100) * 0.82})` }} />
            ))}
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>100%</span>
            <span style={{ fontSize: "0.6rem", color: "#94a3b8", marginLeft: "auto", fontFamily: "'DM Mono',monospace" }}>
              Avg completion % per age group × lesson
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FETCH CHILDREN PROGRESS
// Always fetches ALL lessons per child. No-record → "not started" with pct=0.
// This ensures every child has a progress entry for every lesson, so averages
// are never skewed by missing data.
// ══════════════════════════════════════════════════════════════════════════════
async function fetchChildrenProgress(usersData, lessonsData) {
  const toArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
  const results = [];

  for (const user of usersData) {
    const children = toArray(user.children);
    if (!children.length) continue;

    const parentEntry = { parentName: user.name, parentId: user._id || user.id, children: [] };

    for (const child of children) {
      const childId = child._id;

      const lessonProgressList = await Promise.all(
        lessonsData.map(async (lesson) => {
          const lessonId = lesson._id || lesson.id;
          const notStarted = {
            lesson: lesson.title, lessonId,
            status: "not started", pct: 0, completed: false,
            totalTimeSeconds: 0, activityAttempts: 0, assessmentAttempts: 0,
            completedMaterials: 0, completedActivities: 0, completedAssessments: 0,
          };
          try {
            const res = await axios.get(
              `${API}/progress/${user._id || user.id}/${childId}/${lessonId}`,
              { headers: authHeaders() }
            );
            const prog = res.data?.progress !== undefined ? res.data.progress : res.data;
            if (!prog || prog === null) return notStarted;

            const pct       = Math.round(prog.progressPercentage ?? 0);
            const completed = prog.isLessonCompleted ?? false;
            const status    = completed ? "completed" : pct > 0 ? "in progress" : "not started";
            const totalTimeSeconds = (prog.materialTime ?? []).reduce((s, m) => s + (m.timeSeconds ?? 0), 0);

            return {
              lesson: lesson.title, lessonId, status, pct, completed, totalTimeSeconds,
              activityAttempts:     (prog.activityAttempts    ?? []).length,
              assessmentAttempts:   (prog.assessmentAttempts  ?? []).length,
              completedMaterials:   (prog.completedMaterials  ?? []).length,
              completedActivities:  (prog.completedActivities ?? []).length,
              completedAssessments: (prog.completedAssessments ?? []).length,
            };
          } catch { return notStarted; }
        })
      );

      const completedLessons = lessonProgressList.filter(p => p.completed).length;
      const startedLessons   = lessonProgressList.filter(p => p.status !== "not started").length;
      const avgPct           = Math.round(lessonProgressList.reduce((s, p) => s + p.pct, 0) / (lessonProgressList.length || 1));
      const totalTimeSeconds = lessonProgressList.reduce((s, p) => s + p.totalTimeSeconds, 0);
      const totalAttempts    = lessonProgressList.reduce((s, p) => s + p.activityAttempts + p.assessmentAttempts, 0);

      parentEntry.children.push({
        name: child.name, age: child.age, gender: child.gender,
        avatar: child.avatar || "bear", childId,
        progress: lessonProgressList,
        totalLessons: lessonProgressList.length,
        completedLessons, startedLessons, avgPct, totalTimeSeconds, totalAttempts,
      });
    }

    if (parentEntry.children.length > 0) results.push(parentEntry);
  }

  return results;
}

// ══════════════════════════════════════════════════════════════════════════════
// CHILDREN PROGRESS SECTION
// ══════════════════════════════════════════════════════════════════════════════
function ChildrenProgressSection({ data, fetching, loaded, totalAvailableLessons }) {
  const [expandedParent, setExpandedParent] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  const allChildren = data.flatMap((p, pi) =>
    p.children.map((c, ci) => ({ ...c, parentName: p.parentName, colorIdx: pi * 5 + ci }))
  );

  const sortedChildren = [...allChildren].sort((a, b) => {
    if (sortBy === "progress") return b.avgPct - a.avgPct;
    if (sortBy === "time")     return b.totalTimeSeconds - a.totalTimeSeconds;
    if (sortBy === "attempts") return b.totalAttempts - a.totalAttempts;
    return a.name.localeCompare(b.name);
  });

  const totalChildren        = allChildren.length;
  const activeChildren       = allChildren.filter(c => c.startedLessons > 0).length;
  const notStartedChildren   = totalChildren - activeChildren;
  const avgCompletionPct     = totalChildren > 0
    ? Math.round(allChildren.reduce((s, c) => s + c.avgPct, 0) / totalChildren) : 0;
  const totalCompletedLessons = allChildren.reduce((s, c) => s + c.completedLessons, 0);
  const totalTimeAllChildren  = allChildren.reduce((s, c) => s + c.totalTimeSeconds, 0);
  const totalAttempts         = allChildren.reduce((s, c) => s + c.totalAttempts, 0);

  // Lesson engagement (for right panel)
  const lessonEngagementMap = {};
  allChildren.forEach(child => {
    child.progress.forEach(lp => {
      if (!lessonEngagementMap[lp.lesson]) lessonEngagementMap[lp.lesson] = { stuck: 0, completed: 0, notStarted: 0 };
      if (lp.status === "in progress") lessonEngagementMap[lp.lesson].stuck++;
      if (lp.status === "completed")   lessonEngagementMap[lp.lesson].completed++;
      if (lp.status === "not started") lessonEngagementMap[lp.lesson].notStarted++;
    });
  });
  const lessonEngagement = Object.entries(lessonEngagementMap)
    .map(([lesson, d]) => ({ lesson, ...d }))
    .sort((a, b) => b.stuck - a.stuck);

  // All lesson titles in order (from the first child's progress — always complete)
  const allLessonTitles = allChildren.length > 0 && allChildren[0].progress.length > 0
    ? allChildren[0].progress.map(p => p.lesson)
    : [];

  if (!fetching && data.length === 0) return null;

  return (
    <>
      {/* Heading */}
      <div style={{ marginBottom: "1.25rem", marginTop: "0.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", marginBottom: 2 }}>
          Children & Learning Progress
        </h2>
        <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          All {totalAvailableLessons} lesson{totalAvailableLessons !== 1 ? "s" : ""} counted per child — including not yet started
        </p>
      </div>

      {/* 6 summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
        {[
          { label: "Total children",    value: totalChildren,                  sub: "enrolled",                          icon: "🧒", color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Active learners",   value: activeChildren,                 sub: `${notStartedChildren} not started`,  icon: "▶️",  color: "#2563eb", bg: "#eff6ff" },
          { label: "Avg. completion",   value: `${avgCompletionPct}%`,         sub: `of ${totalAvailableLessons} lessons`, icon: "📊", color: "#d97706", bg: "#fffbeb" },
          { label: "Lessons completed", value: totalCompletedLessons,          sub: "across all children",                icon: "🏅", color: "#059669", bg: "#ecfdf5" },
          { label: "Total time spent",  value: fmtTime(totalTimeAllChildren),  sub: "all children combined",              icon: "⏱️",  color: "#0891b2", bg: "#ecfeff" },
          { label: "Total attempts",    value: totalAttempts.toLocaleString(), sub: "activities + assessments",           icon: "🎯", color: "#dc2626", bg: "#fef2f2" },
        ].map((card, i) => (
          <div key={i} className={`db-stat ${loaded ? "loaded" : ""}`} style={{ transitionDelay: `${i * 40}ms` }}>
            <div className="db-stat-top">
              <div className="db-stat-icon" style={{ background: card.bg }}>{card.icon}</div>
            </div>
            <div className="db-stat-value" style={{ color: card.color }}>
              {fetching ? <Skeleton w={50} h={26} /> : card.value}
            </div>
            <div className="db-stat-label">{card.label}</div>
            <div style={{ fontSize: "0.62rem", color: "#cbd5e1", marginTop: 1 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Children table + Lesson engagement */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1rem", marginBottom: "1rem" }}>

        {/* Children table */}
        <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "160ms" }}>
          <div className="db-panel-head">
            <span className="db-panel-title">All children</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[{ key: "name", label: "Name" }, { key: "progress", label: "Progress" }, { key: "time", label: "Time" }, { key: "attempts", label: "Attempts" }].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)} style={{
                  fontSize: "0.6rem", fontFamily: "'DM Mono',monospace",
                  padding: "2px 7px", borderRadius: 5, border: "1px solid", cursor: "pointer",
                  borderColor: sortBy === s.key ? "#2563eb" : "#e2e8f0",
                  background:  sortBy === s.key ? "#eff6ff"  : "transparent",
                  color:       sortBy === s.key ? "#2563eb"  : "#94a3b8",
                }}>{s.label}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            {fetching ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "1rem 1.25rem" }}>
                {[...Array(5)].map((_, i) => <Skeleton key={i} h={44} radius={8} />)}
              </div>
            ) : sortedChildren.length === 0 ? (
              <div className="db-empty">No children enrolled yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ background: "#fafbfc", borderBottom: "1px solid #f1f5f9" }}>
                    {[
                      { label: "Child",    w: "24%", align: "left",  pad: "0.5rem 1.25rem" },
                      { label: "Status",   w: "13%", align: "left",  pad: "0.5rem 0.5rem"  },
                      { label: "Progress", w: "27%", align: "left",  pad: "0.5rem 0.5rem"  },
                      { label: "Lessons",  w: "12%", align: "right", pad: "0.5rem 0.5rem"  },
                      { label: "Time",     w: "12%", align: "right", pad: "0.5rem 0.5rem"  },
                      { label: "Attempts", w: "12%", align: "right", pad: "0.5rem 1.25rem" },
                    ].map(h => (
                      <th key={h.label} style={{ width: h.w, textAlign: h.align, padding: h.pad, fontSize: "0.58rem", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", fontWeight: 400 }}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedChildren.map((child, i) => {
                    const c  = childColor(child.colorIdx);
                    const ag = ageGroup(child.age);
                    const overallStatus =
                      child.completedLessons === child.totalLessons && child.totalLessons > 0 ? "completed"
                      : child.startedLessons > 0 ? "in progress" : "not started";
                    return (
                      <tr key={`${child.childId}-${i}`} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "0.6rem 1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                              {AVATAR_EMOJI[child.avatar] || "🧒"}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "0.75rem", fontWeight: 500, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{child.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                                <span style={{ fontSize: "0.58rem", color: "#94a3b8" }}>{child.parentName}</span>
                                <span style={{ fontSize: "0.56rem", padding: "0 4px", borderRadius: 3, background: ag.bg, color: ag.color, fontFamily: "'DM Mono',monospace" }}>{child.age}y</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "0.6rem 0.5rem" }}><StatusPill status={overallStatus} /></td>
                        <td style={{ padding: "0.6rem 0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ flex: 1 }}><MiniProgressBar value={child.avgPct} color={c.bar} height={5} /></div>
                            <span style={{ fontSize: "0.65rem", fontFamily: "'DM Mono',monospace", color: c.text, minWidth: 26, textAlign: "right" }}>{child.avgPct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "0.6rem 0.5rem", textAlign: "right" }}>
                          <span style={{ fontSize: "0.7rem", fontFamily: "'DM Mono',monospace", color: "#0f172a" }}>{child.completedLessons}</span>
                          <span style={{ fontSize: "0.62rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>/{child.totalLessons}</span>
                        </td>
                        <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{fmtTime(child.totalTimeSeconds)}</td>
                        <td style={{ padding: "0.6rem 1.25rem", textAlign: "right", fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{child.totalAttempts || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Lesson engagement */}
        <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "220ms" }}>
          <div className="db-panel-head">
            <span className="db-panel-title">Lesson engagement</span>
            <span className="db-panel-link" style={{ color: "#94a3b8" }}>{totalAvailableLessons} lessons</span>
          </div>
          <div className="db-panel-body">
            {fetching ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(5)].map((_, i) => <Skeleton key={i} h={36} radius={6} />)}
              </div>
            ) : lessonEngagement.length === 0 ? (
              <div className="db-empty">No lesson data yet.</div>
            ) : (
              <>
                {lessonEngagement.map((ld, i) => {
                  const total = totalChildren || 1;
                  const completedPct  = Math.round((ld.completed  / total) * 100);
                  const inProgressPct = Math.round((ld.stuck      / total) * 100);
                  const notStartedPct = Math.round((ld.notStarted / total) * 100);
                  return (
                    <div key={i} style={{ marginBottom: i < lessonEngagement.length - 1 ? "0.85rem" : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "baseline" }}>
                        <span style={{ fontSize: "0.72rem", color: "#0f172a", fontWeight: 500 }}>{ld.lesson}</span>
                        <div style={{ display: "flex", gap: 5 }}>
                          {ld.completed  > 0 && <span style={{ fontSize: "0.58rem", color: "#059669", fontFamily: "'DM Mono',monospace" }}>{ld.completed}✓</span>}
                          {ld.stuck      > 0 && <span style={{ fontSize: "0.58rem", color: "#d97706", fontFamily: "'DM Mono',monospace" }}>{ld.stuck}⟳</span>}
                          {ld.notStarted > 0 && <span style={{ fontSize: "0.58rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{ld.notStarted}—</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", height: 7, borderRadius: 99, overflow: "hidden", background: "#f1f5f9" }}>
                        {completedPct  > 0 && <div style={{ width: `${completedPct}%`,  background: "#059669", transition: "width 0.8s ease" }} />}
                        {inProgressPct > 0 && <div style={{ width: `${inProgressPct}%`, background: "#d97706", transition: "width 0.8s ease" }} />}
                        {notStartedPct > 0 && <div style={{ width: `${notStartedPct}%`, background: "#e2e8f0", transition: "width 0.8s ease" }} />}
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "flex", gap: 10, marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9" }}>
                  {[{ color: "#059669", label: "Completed" }, { color: "#d97706", label: "In progress" }, { color: "#e2e8f0", label: "Not started" }].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                      <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Age group analytics */}
      <div style={{ marginBottom: "1rem" }}>
        <AgeGroupAnalytics allChildren={allChildren} allLessonTitles={allLessonTitles} fetching={fetching} loaded={loaded} />
      </div>

      {/* Row 3: Per-family accordion */}
      <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "420ms", marginBottom: "1.5rem" }}>
        <div className="db-panel-head">
          <span className="db-panel-title">Progress by family</span>
          <span className="db-panel-link" style={{ color: "#94a3b8" }}>{data.length} families</span>
        </div>
        <div>
          {fetching ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "1rem 1.25rem" }}>
              {[...Array(3)].map((_, i) => <Skeleton key={i} h={52} radius={8} />)}
            </div>
          ) : data.length === 0 ? (
            <div className="db-empty">No family progress yet.</div>
          ) : data.map((parent, pi) => {
            const isOpen          = expandedParent === pi;
            const hue             = parent.parentName.charCodeAt(0) * 37 % 360;
            const familyCompleted = parent.children.reduce((s, c) => s + c.completedLessons, 0);
            const familyTotal     = parent.children.reduce((s, c) => s + c.totalLessons, 0);
            const familyTime      = parent.children.reduce((s, c) => s + c.totalTimeSeconds, 0);
            const familyAttempts  = parent.children.reduce((s, c) => s + c.totalAttempts, 0);
            const familyAvgPct    = parent.children.length
              ? Math.round(parent.children.reduce((s, c) => s + c.avgPct, 0) / parent.children.length) : 0;

            return (
              <div key={parent.parentId} style={{ borderBottom: pi < data.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                {/* Parent row */}
                <div
                  onClick={() => setExpandedParent(isOpen ? null : pi)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.85rem 1.25rem", cursor: "pointer", background: isOpen ? "#fafbff" : "transparent", transition: "background 0.15s" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${hue},55%,48%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 11, flexShrink: 0 }}>
                    {parent.parentName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "#0f172a" }}>{parent.parentName}</div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>
                      {parent.children.length} child{parent.children.length > 1 ? "ren" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, marginRight: 8 }}>
                    {[
                      { label: "avg",      value: `${familyAvgPct}%` },
                      { label: "done",     value: `${familyCompleted}/${familyTotal}` },
                      { label: "time",     value: fmtTime(familyTime) },
                      { label: "attempts", value: familyAttempts },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 500, fontFamily: "'DM Mono',monospace", color: "#0f172a" }}>{s.value}</div>
                        <div style={{ fontSize: "0.56rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>
                    <path strokeLinecap="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded child detail */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                    {parent.children.map((child, ci) => {
                      const c  = childColor(pi * 5 + ci);
                      const ag = ageGroup(child.age);
                      return (
                        <div key={child.childId} style={{ margin: "0.75rem 1.25rem", border: "1px solid #f1f5f9", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                          {/* Child header */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0.85rem", background: c.bg, borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: 16 }}>{AVATAR_EMOJI[child.avatar] || "🧒"}</div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>{child.name}</span>
                              <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace", marginLeft: 8 }}>age {child.age} · {child.gender}</span>
                              <span style={{ fontSize: "0.6rem", padding: "1px 6px", borderRadius: 3, background: ag.bg, color: ag.color, fontFamily: "'DM Mono',monospace", marginLeft: 6 }}>{ag.label}</span>
                            </div>
                            <div style={{ display: "flex", gap: 14 }}>
                              {[
                                { label: "avg",      value: `${child.avgPct}%`,                               color: c.text    },
                                { label: "done",     value: `${child.completedLessons}/${child.totalLessons}`, color: "#059669" },
                                { label: "time",     value: fmtTime(child.totalTimeSeconds),                  color: "#0891b2" },
                                { label: "attempts", value: child.totalAttempts,                              color: "#7c3aed" },
                              ].map(s => (
                                <div key={s.label} style={{ textAlign: "right" }}>
                                  <div style={{ fontSize: "0.72rem", fontWeight: 600, fontFamily: "'DM Mono',monospace", color: s.color }}>{s.value}</div>
                                  <div style={{ fontSize: "0.55rem", color: "#94a3b8", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Per-lesson table */}
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc" }}>
                                {[
                                  { label: "Lesson",     align: "left",  pad: "0.4rem 0.85rem" },
                                  { label: "Status",     align: "left",  pad: "0.4rem 0.5rem"  },
                                  { label: "Progress",   align: "left",  pad: "0.4rem 0.5rem", w: "26%" },
                                  { label: "Materials",  align: "right", pad: "0.4rem 0.5rem"  },
                                  { label: "Activities", align: "right", pad: "0.4rem 0.5rem"  },
                                  { label: "Attempts",   align: "right", pad: "0.4rem 0.5rem"  },
                                  { label: "Time",       align: "right", pad: "0.4rem 0.85rem" },
                                ].map(h => (
                                  <th key={h.label} style={{ fontSize: "0.56rem", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", textAlign: h.align, padding: h.pad, fontWeight: 400, width: h.w }}>
                                    {h.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {child.progress.map((lp, li) => (
                                <tr key={li} style={{ borderTop: "1px solid #f8fafc" }}>
                                  <td style={{ padding: "0.5rem 0.85rem", fontSize: "0.73rem", color: lp.status === "not started" ? "#cbd5e1" : "#0f172a", fontWeight: 500 }}>{lp.lesson}</td>
                                  <td style={{ padding: "0.5rem 0.5rem" }}><StatusPill status={lp.status} /></td>
                                  <td style={{ padding: "0.5rem 0.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <div style={{ flex: 1 }}>
                                        <MiniProgressBar value={lp.pct} color={lp.completed ? "#059669" : lp.pct > 0 ? c.bar : "#e2e8f0"} height={4} />
                                      </div>
                                      <span style={{ fontSize: "0.6rem", fontFamily: "'DM Mono',monospace", color: "#94a3b8", minWidth: 24, textAlign: "right" }}>{lp.pct}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: "0.5rem 0.5rem", textAlign: "right", fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{lp.completedMaterials || "—"}</td>
                                  <td style={{ padding: "0.5rem 0.5rem", textAlign: "right", fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{lp.completedActivities || "—"}</td>
                                  <td style={{ padding: "0.5rem 0.5rem", textAlign: "right", fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{(lp.activityAttempts + lp.assessmentAttempts) || "—"}</td>
                                  <td style={{ padding: "0.5rem 0.85rem", textAlign: "right", fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#64748b" }}>{fmtTime(lp.totalTimeSeconds)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                    <div style={{ height: "0.75rem" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [loaded, setLoaded]     = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState(null);

  const [users, setUsers]                       = useState([]);
  const [lessons, setLessons]                   = useState([]);
  const [assessments, setAssessments]           = useState([]);
  const [lessonMeta, setLessonMeta]             = useState({});
  const [childrenProgress, setChildrenProgress] = useState([]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setFetching(true);
    setError(null);
    try {
      const [usersRes, lessonsRes] = await Promise.all([
        axios.get(`${API}/users`,   { headers: authHeaders() }),
        axios.get(`${API}/lessons`),                            // sorted by order from getLessons
      ]);

      const toArray = (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      const usersData   = toArray(usersRes.data);
      const lessonsData = toArray(lessonsRes.data);

      setUsers(usersData);
      setLessons(lessonsData);

      if (lessonsData.length > 0) {
        let allAssessments = [];

        const metaEntries = await Promise.all(
          lessonsData.map(async (lesson) => {
            const lessonId = lesson._id || lesson.id;
            try {
              const [matsRes, asmtsRes] = await Promise.all([
                axios.get(`${API}/materials/lessons/${lessonId}/materials`,     { headers: authHeaders() }),
                axios.get(`${API}/assessments/lessons/${lessonId}/assessments`, { headers: authHeaders() }),
              ]);
              const mats  = toArray(matsRes.data);
              const asmts = toArray(asmtsRes.data);
              allAssessments = [...allAssessments, ...asmts];

              const actCounts = await Promise.all(
                mats.map(async (m) => {
                  const mid = m._id || m.id;
                  try {
                    const r = await axios.get(`${API}/activities/materials/${mid}/activities`, { headers: authHeaders() });
                    return toArray(r.data).length;
                  } catch { return 0; }
                })
              );
              return [lessonId, { materials: mats.length, activities: actCounts.reduce((s, c) => s + c, 0), assessments: asmts.length }];
            } catch {
              return [lessonId, { materials: 0, activities: 0, assessments: 0 }];
            }
          })
        );

        setLessonMeta(Object.fromEntries(metaEntries));
        setAssessments(allAssessments);

        // All users with children — regardless of role (admins included)
        const parentUsers = usersData.filter(u => Array.isArray(u.children) && u.children.length > 0);
        const childrenData = await fetchChildrenProgress(parentUsers, lessonsData);
        setChildrenProgress(childrenData);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Check your connection or login status.");
    } finally {
      setFetching(false);
      setTimeout(() => setLoaded(true), 80);
    }
  }

  // Derived
  const totalUsers       = users.length;
  const totalLessons     = lessons.length;
  const totalAssessments = Object.values(lessonMeta).reduce((s, m) => s + (m.assessments || 0), 0);
  const totalMaterials   = Object.values(lessonMeta).reduce((s, m) => s + m.materials,   0);
  const totalActivities  = Object.values(lessonMeta).reduce((s, m) => s + m.activities,  0);
  const verifiedUsers    = users.filter(u => u.isVerified).length;
  const verifiedPct      = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const feedItems = [
    ...users.slice(0, 3).map(u => ({ type: "user",       text: `New user registered: ${u.name}`,  time: u.createdAt })),
    ...lessons.slice(0, 2).map(l => ({ type: "lesson",   text: `Lesson available: ${l.title}`,    time: l.updatedAt || l.createdAt })),
    ...assessments.slice(0, 2).map(a => ({ type: "assessment", text: `Assessment created: ${a.title}`, time: a.createdAt })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 7);

  const lessonsTableData = lessons.map(l => {
    const id = l._id || l.id;
    const meta = lessonMeta[id] || { materials: 0, activities: 0, assessments: 0 };
    return { ...l, id, ...meta, assessmentCount: meta.assessments };
  });

  const weeklyNew = (() => {
    const now = new Date(), monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const counts = Array(7).fill(0);
    users.forEach(u => {
      const diff = Math.floor((new Date(u.createdAt) - monday) / 86400000);
      if (diff >= 0 && diff < 7) counts[diff]++;
    });
    return counts;
  })();

  const onboardedCount = users.filter(u => u.hasCompletedOnboarding).length;

  const statCards = [
    { label: "Total Users",    value: totalUsers.toLocaleString(), icon: "👤", color: "#2563eb", bg: "#eff6ff" },
    { label: "Total Lessons",  value: totalLessons,                icon: "📘", color: "#d97706", bg: "#fffbeb" },
    { label: "Materials",      value: totalMaterials,              icon: "📄", color: "#7c3aed", bg: "#f5f3ff" },
    { label: "Assessments",    value: totalAssessments,            icon: "✅", color: "#dc2626", bg: "#fef2f2" },
    { label: "Activities",     value: totalActivities,             icon: "⚡", color: "#059669", bg: "#ecfdf5" },
    { label: "Verified Users", value: `${verifiedPct}%`,           icon: "🎯", color: "#0891b2", bg: "#ecfeff" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .db-root { font-family: 'Sora', sans-serif; background: #f8fafc; min-height: 100vh; color: #1e293b; }
        .db-main { padding: 2rem; max-width: 1400px; margin: 0 auto; }
        .db-heading { margin-bottom: 1.75rem; opacity: 0; transform: translateY(10px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .db-heading.loaded { opacity: 1; transform: none; }
        .db-heading h1 { font-size: 1.55rem; font-weight: 700; letter-spacing: -0.03em; color: #0f172a; line-height: 1.2; }
        .db-heading p  { font-size: 0.8rem; color: #94a3b8; margin-top: 4px; }
        .db-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 1rem 1.25rem; color: #dc2626; font-size: 0.82rem; display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; }
        .db-stat-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 1rem; margin-bottom: 1.5rem; }
        @media (max-width: 1200px) { .db-stat-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 700px)  { .db-stat-grid { grid-template-columns: repeat(2,1fr); } }
        .db-stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.1rem 1.2rem; opacity: 0; transform: translateY(14px); transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s; }
        .db-stat.loaded { opacity: 1; transform: none; }
        .db-stat:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: #cbd5e1; }
        .db-stat-top   { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; }
        .db-stat-icon  { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; }
        .db-stat-value { font-size: 1.65rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1; margin-bottom: 4px; }
        .db-stat-label { font-size: 0.72rem; color: #94a3b8; font-weight: 400; }
        .db-mid-row { display: grid; grid-template-columns: 1fr 340px; gap: 1rem; margin-bottom: 1.5rem; }
        @media (max-width: 900px) { .db-mid-row { grid-template-columns: 1fr; } }
        .db-panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; opacity: 0; transform: translateY(14px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .db-panel.loaded { opacity: 1; transform: none; }
        .db-panel-head { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem 0.85rem; border-bottom: 1px solid #f1f5f9; }
        .db-panel-title { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
        .db-panel-link  { font-size: 0.7rem; color: #2563eb; font-family: 'DM Mono',monospace; cursor: default; }
        .db-panel-body  { padding: 1rem 1.25rem; }
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th { text-align: left; font-size: 0.65rem; font-family: 'DM Mono',monospace; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; padding: 0 0 0.65rem; border-bottom: 1px solid #f1f5f9; }
        .db-table td { padding: 0.7rem 0; font-size: 0.8rem; border-bottom: 1px solid #f8fafc; color: #64748b; vertical-align: middle; }
        .db-table tr:last-child td { border-bottom: none; }
        .db-table td:first-child { color: #0f172a; font-weight: 500; }
        .db-chip { display: inline-flex; align-items: center; background: #f1f5f9; border-radius: 5px; padding: 2px 8px; font-size: 0.68rem; font-family: 'DM Mono',monospace; color: #64748b; }
        .db-topic-pill { display: inline-flex; align-items: center; border-radius: 99px; padding: 1px 8px; font-size: 0.62rem; font-family: 'DM Mono',monospace; letter-spacing: 0.04em; text-transform: capitalize; font-weight: 500; }
        .db-feed-item { display: flex; align-items: flex-start; gap: 10px; padding: 0.65rem 0; border-bottom: 1px solid #f8fafc; }
        .db-feed-item:last-child { border-bottom: none; }
        .db-feed-icon { width: 26px; height: 26px; border-radius: 7px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .db-feed-text { font-size: 0.78rem; color: #475569; line-height: 1.45; }
        .db-feed-time { font-size: 0.65rem; font-family: 'DM Mono',monospace; color: #94a3b8; margin-top: 2px; }
        .db-empty { text-align: center; padding: 1.5rem; color: #94a3b8; font-size: 0.78rem; }
        .db-bot-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        @media (max-width: 700px) { .db-bot-row { grid-template-columns: 1fr; } }
        .db-user-row { display: flex; align-items: center; gap: 10px; padding: 0.6rem 0; border-bottom: 1px solid #f8fafc; }
        .db-user-row:last-child { border-bottom: none; }
        .db-user-info   { flex: 1; min-width: 0; }
        .db-user-name   { font-size: 0.8rem; font-weight: 500; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .db-user-meta   { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
        .db-user-joined { font-size: 0.62rem; font-family: 'DM Mono',monospace; color: #94a3b8; }
        .db-chart-wrap  { padding: 1rem 1.25rem 1.25rem; }
        .db-chart-stats { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; }
        .db-cs-label { font-size: 0.7rem; color: #94a3b8; margin-bottom: 2px; }
        .db-cs-val   { font-size: 1.2rem; font-weight: 700; color: #0f172a; letter-spacing: -0.03em; }
        .db-cs-val span { font-size: 0.65rem; color: #059669; font-family: 'DM Mono',monospace; margin-left: 5px; font-weight: 400; }
        .db-live-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #059669; animation: livepulse 1.4s infinite; margin-right: 5px; vertical-align: middle; }
        @keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        .db-badge            { font-size: 0.62rem; padding: 2px 8px; border-radius: 99px; font-family: 'DM Mono',monospace; letter-spacing: 0.04em; text-transform: uppercase; }
        .db-badge-admin      { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .db-badge-user       { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .db-badge-verified   { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .db-badge-unverified { background: #fafafa; color: #94a3b8; border: 1px solid #e2e8f0; }
        .db-divider { height: 1px; background: #f1f5f9; margin: 0 1.25rem; }
        .db-section-divider { display: flex; align-items: center; gap: 12px; margin: 2rem 0 1.5rem; }
        .db-section-divider::before, .db-section-divider::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }
        .db-section-divider span { font-size: 0.65rem; font-family: 'DM Mono',monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #cbd5e1; white-space: nowrap; }
        .db-refresh { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono',monospace; font-size: 0.7rem; color: #64748b; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 5px 12px; cursor: pointer; transition: all 0.15s; }
        .db-refresh:hover:not(:disabled) { border-color: #cbd5e1; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .db-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
        .db-refresh svg { transition: transform 0.5s; }
        .db-refresh:hover:not(:disabled) svg { transform: rotate(180deg); }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      <div className="db-root">
        <div className="db-main">

          <div className={`db-heading ${loaded ? "loaded" : ""}`}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h1>Overview</h1>
                <p>
                  <span className="db-live-dot" />
                  {fetching ? "Loading data…" : `${totalUsers} users · ${totalLessons} lessons · ${totalAssessments} assessments`}
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

          {error && (
            <div className="db-error">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="db-section-divider"><span>Platform overview</span></div>

          <div className="db-stat-grid">
            {statCards.map((card, i) => (
              <div key={i} className={`db-stat ${loaded ? "loaded" : ""}`} style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="db-stat-top"><div className="db-stat-icon" style={{ background: card.bg }}>{card.icon}</div></div>
                <div className="db-stat-value" style={{ color: card.color }}>{fetching ? <Skeleton w={60} h={28} /> : card.value}</div>
                <div className="db-stat-label">{card.label}</div>
              </div>
            ))}
          </div>

          <div className="db-mid-row">
            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "420ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">Lessons</span>
                <span className="db-panel-link">{totalLessons} total</span>
              </div>
              <div className="db-panel-body">
                {fetching ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[...Array(4)].map((_, i) => <Skeleton key={i} h={16} />)}</div>
                ) : lessonsTableData.length === 0 ? (
                  <div className="db-empty">No lessons found.</div>
                ) : (
                  <table className="db-table">
                    <thead><tr><th>Title</th><th>Topic</th><th>Materials</th><th>Activities</th><th>Assessments</th></tr></thead>
                    <tbody>
                      {lessonsTableData.map(l => {
                        const tc = topicColor[l.topic] || { color: "#64748b", bg: "#f1f5f9" };
                        return (
                          <tr key={l.id}>
                            <td>{l.title}</td>
                            <td><span className="db-topic-pill" style={{ background: tc.bg, color: tc.color }}>{l.topic}</span></td>
                            <td><span className="db-chip">{l.materials}</span></td>
                            <td><span className="db-chip">{l.activities}</span></td>
                            <td><span style={{ color: "#059669", fontFamily: "'DM Mono',monospace", fontSize: "0.78rem" }}>{l.assessmentCount}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "500ms" }}>
              <div className="db-panel-head"><span className="db-panel-title">Recent Activity</span></div>
              <div className="db-panel-body">
                {fetching ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} h={14} />)}</div>
                ) : feedItems.length === 0 ? (
                  <div className="db-empty">No activity yet.</div>
                ) : feedItems.map((item, i) => (
                  <div key={i} className="db-feed-item">
                    <div className="db-feed-icon">{typeIcon[item.type]}</div>
                    <div>
                      <div className="db-feed-text">{item.text}</div>
                      <div className="db-feed-time">{timeAgo(item.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="db-bot-row">
            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "560ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">Recent Users</span>
                <span className="db-panel-link">{totalUsers} total</span>
              </div>
              <div className="db-panel-body">
                {fetching ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} h={36} radius={8} />)}</div>
                ) : recentUsers.length === 0 ? (
                  <div className="db-empty">No users yet.</div>
                ) : recentUsers.map(u => (
                  <div key={u._id || u.id} className="db-user-row">
                    <Avatar name={u.name} size={34} />
                    <div className="db-user-info">
                      <div className="db-user-name">{u.name}</div>
                      <div className="db-user-meta">
                        <span className={`db-badge db-badge-${u.role}`}>{u.role}</span>
                        <span className={`db-badge db-badge-${u.isVerified ? "verified" : "unverified"}`}>{u.isVerified ? "verified" : "unverified"}</span>
                      </div>
                    </div>
                    <div className="db-user-joined">{timeAgo(u.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`db-panel ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "620ms" }}>
              <div className="db-panel-head">
                <span className="db-panel-title">New Signups This Week</span>
                <span className="db-panel-link" style={{ color: "#94a3b8" }}>Mon – Sun</span>
              </div>
              <div className="db-chart-wrap">
                <div className="db-chart-stats">
                  <div>
                    <div className="db-cs-label">This week</div>
                    <div className="db-cs-val">{weeklyNew.reduce((a, b) => a + b, 0)}<span>signups</span></div>
                  </div>
                  <div>
                    <div className="db-cs-label">Daily avg</div>
                    <div className="db-cs-val">{(weeklyNew.reduce((a, b) => a + b, 0) / 7).toFixed(1)}<span>/ day</span></div>
                  </div>
                  <div>
                    <div className="db-cs-label">Onboarded</div>
                    <div className="db-cs-val">{onboardedCount}<span>users</span></div>
                  </div>
                </div>
                {fetching ? <Skeleton h={56} radius={6} /> : <SparkBar data={weeklyNew} />}
              </div>
              <div className="db-divider" />
              <div style={{ padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.75rem", fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>Content Breakdown</div>
                {[
                  { label: "Lessons",     value: totalLessons,     color: "#d97706" },
                  { label: "Materials",   value: totalMaterials,   color: "#7c3aed" },
                  { label: "Activities",  value: totalActivities,  color: "#059669" },
                  { label: "Assessments", value: totalAssessments, color: "#dc2626" },
                ].map(item => {
                  const total = totalLessons + totalMaterials + totalActivities + totalAssessments || 1;
                  return (
                    <div key={item.label} style={{ marginBottom: "0.65rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.73rem", color: "#64748b" }}>{item.label}</span>
                        <span style={{ fontSize: "0.68rem", fontFamily: "'DM Mono',monospace", color: "#94a3b8" }}>{fetching ? "—" : item.value}</span>
                      </div>
                      <ProgressBar value={(item.value / total) * 100} color={item.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="db-section-divider"><span>Children &amp; learning progress</span></div>

          <ChildrenProgressSection
            data={childrenProgress}
            fetching={fetching}
            loaded={loaded}
            totalAvailableLessons={totalLessons}
          />

        </div>
      </div>
    </>
  );
}