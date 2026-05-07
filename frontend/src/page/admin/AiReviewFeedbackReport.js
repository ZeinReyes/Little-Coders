import React, { useEffect, useState, useCallback } from "react";

// ── Palette & fonts ───────────────────────────────────────────────────────────
const C = {
  purple:  "#667eea",
  green:   "#4CAF50",
  red:     "#f44336",
  orange:  "#FF9800",
  pink:    "#f093fb",
  bg:      "#f5f6fa",
  card:    "#ffffff",
  border:  "#e8eaf0",
  text:    "#2d2d3a",
  muted:   "#8888a0",
};
const font = "'Segoe UI', system-ui, sans-serif";

// ── Helpers ───────────────────────────────────────────────────────────────────
const pct = (n, t) => (t ? Math.round((n / t) * 100) : 0);
const fmt  = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ── Mock fetch (replace with real API calls) ──────────────────────────────────
const API_BASE = "/api/admin/ai-review-feedback";

async function fetchSummary(days) {
  const res = await fetch(`${API_BASE}/summary?days=${days}`);
  return res.json();
}

async function fetchList({ page, helpful, lessonId }) {
  const params = new URLSearchParams({ page, limit: 15 });
  if (helpful !== "all") params.set("helpful", helpful);
  if (lessonId) params.set("lessonId", lessonId);
  const res = await fetch(`${API_BASE}?${params}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AIReviewFeedbackReport() {
  const [days,    setDays]    = useState(30);
  const [tab,     setTab]     = useState("overview");   // overview | responses
  const [summary, setSummary] = useState(null);
  const [list,    setList]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ helpful: "all", lessonId: "", page: 1 });

  // Load summary
  useEffect(() => {
    setLoading(true);
    fetchSummary(days)
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [days]);

  // Load list when on Responses tab
  useEffect(() => {
    if (tab !== "responses") return;
    fetchList(filters).then(setList);
  }, [tab, filters]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: font, padding: "2rem" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.55rem", fontWeight: "800", color: C.text }}>
            🤖 AI Review Feedback
          </h1>
          <p style={{ margin: "4px 0 0", color: C.muted, fontSize: "0.9rem" }}>
            How helpful are the AI-generated review sessions?
          </p>
        </div>

        {/* Period picker */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[7, 30, 90].map(d => (
            <PeriodBtn key={d} active={days === d} onClick={() => setDays(d)}>
              {d}d
            </PeriodBtn>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: `2px solid ${C.border}` }}>
        {["overview", "responses"].map(t => (
          <TabBtn key={t} active={tab === t} onClick={() => setTab(t)}>
            {t === "overview" ? "📊 Overview" : "📋 All Responses"}
          </TabBtn>
        ))}
      </div>

      {loading && <LoadingState />}

      {/* ── OVERVIEW ── */}
      {!loading && tab === "overview" && summary && (
        <>
          {/* ── KPI row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <KpiCard icon="📬" label="Total Feedback" value={summary.totalFeedback} color={C.purple} />
            <KpiCard icon="👍" label="Helpful" value={summary.helpfulCount} color={C.green} />
            <KpiCard icon="👎" label="Not Helpful" value={summary.notHelpfulCount} color={C.red} />
            <KpiCard icon="⭐" label="Helpful Rate" value={`${summary.helpfulRate}%`} color={summary.helpfulRate >= 70 ? C.green : C.orange} big />
          </div>

          {/* ── Helpful-rate bar ── */}
          <Section title="Overall Rating">
            <RatingBar helpful={summary.helpfulCount} total={summary.totalFeedback} />
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {/* ── Top reasons ── */}
            <Section title="🔍 Top 'Not Helpful' Reasons">
              {summary.topReasons.length === 0
                ? <Empty>No negative feedback in this period 🎉</Empty>
                : summary.topReasons.map((r, i) => (
                  <ReasonRow key={i} reason={r.reason} count={r.count} max={summary.topReasons[0].count} />
                ))
              }
            </Section>

            {/* ── Problematic blocks ── */}
            <Section title="🧩 Block Types in Poor Reviews">
              {summary.problematicBlocks.length === 0
                ? <Empty>No data yet</Empty>
                : summary.problematicBlocks.map((b, i) => (
                  <BlockRow key={i} block={b.block} count={b.count} max={summary.problematicBlocks[0].count} />
                ))
              }
            </Section>
          </div>

          {/* ── Worst lessons ── */}
          <Section title="📉 Lessons with Most Negative Feedback">
            {summary.worstLessons.length === 0
              ? <Empty>All lessons seem great! 🌟</Empty>
              : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                      {["#", "Lesson", "Not Helpful", "Action"].map(h => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.worstLessons.map((l, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <Td><RankBadge n={i + 1} /></Td>
                        <Td><strong>{l.title || "Unknown lesson"}</strong></Td>
                        <Td><BadgeCount color={C.red}>{l.notHelpfulCount}</BadgeCount></Td>
                        <Td>
                          <LinkBtn onClick={() => { setTab("responses"); setFilters(f => ({ ...f, lessonId: l.lessonId, page: 1 })); }}>
                            View responses →
                          </LinkBtn>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </Section>

          {/* ── Daily trend ── */}
          <Section title="📅 Daily Trend">
            {summary.dailyTrend.length === 0
              ? <Empty>No data for this period</Empty>
              : <DailyChart data={summary.dailyTrend} />
            }
          </Section>
        </>
      )}

      {/* ── RESPONSES ── */}
      {tab === "responses" && (
        <Section title="All Feedback Responses">
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <FilterSelect
              value={filters.helpful}
              onChange={v => setFilters(f => ({ ...f, helpful: v, page: 1 }))}
              options={[
                { value: "all",   label: "All responses" },
                { value: "true",  label: "👍 Helpful only" },
                { value: "false", label: "👎 Not helpful only" },
              ]}
            />
            {filters.lessonId && (
              <ClearBtn onClick={() => setFilters(f => ({ ...f, lessonId: "", page: 1 }))}>
                ✕ Clear lesson filter
              </ClearBtn>
            )}
          </div>

          {!list
            ? <LoadingState />
            : list.items.length === 0
              ? <Empty>No responses match these filters</Empty>
              : (
                <>
                  {list.items.map((item, i) => (
                    <FeedbackRow key={i} item={item} />
                  ))}

                  {/* Pagination */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                    <span style={{ color: C.muted, fontSize: "0.85rem" }}>
                      Page {list.page} of {list.totalPages} · {list.total} total
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <PeriodBtn disabled={filters.page === 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                        ← Prev
                      </PeriodBtn>
                      <PeriodBtn disabled={filters.page >= list.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                        Next →
                      </PeriodBtn>
                    </div>
                  </div>
                </>
              )
          }
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeedbackRow({ item }) {
  const [open, setOpen] = useState(false);
  const isHelpful = item.helpful;
  return (
    <div style={{
      border: `1.5px solid ${isHelpful ? "#c8e6c9" : "#ffcdd2"}`,
      borderRadius: "12px", marginBottom: "0.6rem",
      background: isHelpful ? "#f9fff9" : "#fff9f9",
      overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", cursor: "pointer" }}
      >
        <span style={{ fontSize: "1.25rem" }}>{isHelpful ? "👍" : "👎"}</span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: "0.9rem", color: C.text }}>
            {item.userId?.name || "Unknown student"}
          </strong>
          <span style={{ color: C.muted, fontSize: "0.8rem", marginLeft: "0.5rem" }}>
            · {item.lessonId?.title || "Unknown lesson"}
          </span>
        </div>
        <span style={{ color: C.muted, fontSize: "0.8rem" }}>{fmt(item.createdAt)}</span>
        <span style={{ color: C.muted, fontSize: "0.75rem" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "0.75rem 1rem", background: "#fff" }}>
          {item.missingTypes?.length > 0 && (
            <div style={{ marginBottom: "0.6rem" }}>
              <Label>Block types reviewed</Label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {item.missingTypes.map((t, i) => <BlockPill key={i}>{t}</BlockPill>)}
              </div>
            </div>
          )}
          {!isHelpful && item.reasons?.length > 0 && (
            <div>
              <Label>Reasons given</Label>
              <ul style={{ margin: "6px 0 0", paddingLeft: "1.2rem", color: C.text, fontSize: "0.88rem" }}>
                {item.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {!isHelpful && item.reasons?.length === 0 && (
            <p style={{ color: C.muted, fontSize: "0.85rem", margin: 0 }}>No specific reason given.</p>
          )}
          {isHelpful && (
            <p style={{ color: C.green, fontSize: "0.88rem", margin: 0 }}>Student found this review helpful ✓</p>
          )}
        </div>
      )}
    </div>
  );
}

function RatingBar({ helpful, total }) {
  const h = pct(helpful, total);
  const n = 100 - h;
  return (
    <div>
      <div style={{ display: "flex", borderRadius: "30px", overflow: "hidden", height: "28px", background: "#eee" }}>
        <div style={{ width: `${h}%`, background: `linear-gradient(90deg, #4CAF50, #66BB6A)`, transition: "width 0.6s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {h > 10 && <span style={{ color: "#fff", fontSize: "0.78rem", fontWeight: "700" }}>👍 {h}%</span>}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {n > 10 && <span style={{ color: C.muted, fontSize: "0.78rem", fontWeight: "700" }}>👎 {n}%</span>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "0.8rem", color: C.muted }}>
        <span>{helpful} helpful</span>
        <span>{total - helpful} not helpful</span>
      </div>
    </div>
  );
}

function ReasonRow({ reason, count, max }) {
  const w = pct(count, max);
  return (
    <div style={{ marginBottom: "0.65rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "3px" }}>
        <span style={{ color: C.text }}>{reason}</span>
        <BadgeCount color={C.red}>{count}</BadgeCount>
      </div>
      <div style={{ height: "6px", borderRadius: "10px", background: "#f0f0f0" }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: "10px", background: `linear-gradient(90deg, #f44336, #ff8a80)`, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function BlockRow({ block, count, max }) {
  const w = pct(count, max);
  const colors = {
    "if": "#9c27b0", "while": "#3f51b5", "for": "#009688",
    "print": "#ff5722", "variable": "#795548", "add": "#4caf50",
  };
  const color = colors[block] || C.purple;
  return (
    <div style={{ marginBottom: "0.65rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "3px" }}>
        <span style={{ color: C.text, display: "flex", alignItems: "center", gap: "6px" }}>
          <BlockPill style={{ fontSize: "0.75rem" }}>{block}</BlockPill>
        </span>
        <BadgeCount color={color}>{count}</BadgeCount>
      </div>
      <div style={{ height: "6px", borderRadius: "10px", background: "#f0f0f0" }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: "10px", background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

// Minimal CSS-only daily chart (bar chart via divs)
function DailyChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.helpful + d.notHelpful), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", minWidth: `${data.length * 42}px`, height: "130px", paddingBottom: "24px", position: "relative" }}>
        {data.map((d, i) => {
          const total  = d.helpful + d.notHelpful;
          const hH     = (d.helpful     / maxVal) * 100;
          const nH     = (d.notHelpful  / maxVal) * 100;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1px" }} title={`${d.date}: 👍${d.helpful} 👎${d.notHelpful}`}>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100px" }}>
                <div style={{ width: "100%", height: `${nH}%`, background: "#ffcdd2", borderRadius: "4px 4px 0 0", minHeight: nH > 0 ? 3 : 0 }} />
                <div style={{ width: "100%", height: `${hH}%`, background: "#c8e6c9", borderRadius: "4px 4px 0 0", minHeight: hH > 0 ? 3 : 0 }} />
              </div>
              <span style={{ fontSize: "0.6rem", color: C.muted, whiteSpace: "nowrap", transform: "rotate(-40deg)", transformOrigin: "top left", marginTop: "4px" }}>
                {d.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.78rem", color: C.muted }}>
        <span><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#c8e6c9", borderRadius: "2px", marginRight: "4px" }} />Helpful</span>
        <span><span style={{ display: "inline-block", width: "10px", height: "10px", background: "#ffcdd2", borderRadius: "2px", marginRight: "4px" }} />Not Helpful</span>
      </div>
    </div>
  );
}

// ── Primitive components ──────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ background: C.card, borderRadius: "16px", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: "700", color: C.text }}>{title}</h3>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, color, big }) {
  return (
    <div style={{ background: C.card, borderRadius: "14px", padding: "1.1rem 1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: "1.4rem", marginBottom: "0.3rem" }}>{icon}</div>
      <div style={{ fontSize: big ? "2rem" : "1.6rem", fontWeight: "800", color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: C.muted, marginTop: "4px" }}>{label}</div>
    </div>
  );
}

function PeriodBtn({ active, onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: active ? C.purple : "#fff",
      color:      active ? "#fff" : C.muted,
      border:     `1.5px solid ${active ? C.purple : C.border}`,
      borderRadius: "8px", padding: "0.35rem 0.9rem", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "0.82rem", fontWeight: "600", fontFamily: font, opacity: disabled ? 0.5 : 1,
    }}>
      {children}
    </button>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", borderBottom: active ? `3px solid ${C.purple}` : "3px solid transparent",
      padding: "0.5rem 1.1rem", cursor: "pointer", fontSize: "0.92rem", fontWeight: active ? "700" : "500",
      color: active ? C.purple : C.muted, fontFamily: font, marginBottom: "-2px", transition: "all 0.15s",
    }}>
      {children}
    </button>
  );
}

function BadgeCount({ children, color }) {
  return (
    <span style={{ background: color + "18", color, borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: "700" }}>
      {children}
    </span>
  );
}

function RankBadge({ n }) {
  const colors = ["#f5c518", "#aaa", "#cd7f32"];
  return (
    <span style={{ background: colors[n - 1] || "#e0e0e0", color: "#fff", borderRadius: "50%", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.75rem" }}>
      {n}
    </span>
  );
}

function Th({ children }) {
  return <th style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: C.muted, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: "0.65rem 0.75rem", fontSize: "0.88rem", color: C.text }}>{children}</td>;
}

function BlockPill({ children, style = {} }) {
  return (
    <span style={{ background: "#e3f2fd", border: "1.5px solid #90caf9", borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", color: "#1565c0", fontWeight: "700", ...style }}>
      {children}
    </span>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      border: `1.5px solid ${C.border}`, borderRadius: "8px", padding: "0.35rem 0.75rem",
      fontFamily: font, fontSize: "0.87rem", color: C.text, background: "#fff", cursor: "pointer",
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ClearBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "#fff0f0", border: `1.5px solid #ffcdd2`, borderRadius: "8px",
      padding: "0.35rem 0.75rem", color: C.red, fontSize: "0.85rem", cursor: "pointer", fontFamily: font,
    }}>
      {children}
    </button>
  );
}

function LinkBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: C.purple, fontSize: "0.85rem",
      cursor: "pointer", fontFamily: font, padding: 0, fontWeight: "600",
    }}>
      {children}
    </button>
  );
}

function Label({ children }) {
  return <p style={{ margin: "0 0 4px", fontSize: "0.75rem", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</p>;
}

function Empty({ children }) {
  return <p style={{ color: C.muted, fontSize: "0.9rem", margin: "0.5rem 0", textAlign: "center" }}>{children}</p>;
}

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: C.muted }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
      <p style={{ fontFamily: font }}>Loading data...</p>
    </div>
  );
}