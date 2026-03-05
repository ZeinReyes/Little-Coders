import React from "react";
import { Spinner } from "react-bootstrap";

export default function AIReviewPanel({
  loading,
  error,
  errorReset,
  aiReviewData,
  aiReviewStep,
  setAiReviewStep,
  aiReviewRevealedHints,
  setAiReviewRevealedHints,
  aiRecommendation,
  onStartActivity,
  onStartAssessment,
  onBackToActivity,
  onSkip,
}) {
  // ── Loading ──
  if (loading) {
    return (
      <CenterCard>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🤖</div>
        <h3 style={{ color: "#667eea", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          Getting your lesson ready...
        </h3>
        <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Working on: <strong>{aiRecommendation?.missingTypes?.join(", ")}</strong>
        </p>
        <Spinner animation="border" variant="primary" />
      </CenterCard>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <CenterCard>
        <div style={{ fontSize: "3rem" }}>😕</div>
        <h3 style={{ color: "#e53935", fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</h3>
        <Btn gradient="linear-gradient(135deg, #667eea, #764ba2)" onClick={errorReset}>
          Go Back
        </Btn>
      </CenterCard>
    );
  }

  const { reviewContent, currentLessonTitle, missingTypes: reviewMissingTypes } = aiReviewData || {};
  const { lessonMaterial, activity, assessmentQuestions } = reviewContent || {};

  // ── Step: Lesson ──
  if (aiReviewStep === "lesson") {
    return (
      <Wrap>
        {/* Header */}
        <Header gradient="linear-gradient(135deg, #667eea, #764ba2)" icon="📚">
          <Chip>AI Review</Chip>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>{lessonMaterial?.title}</h2>
        </Header>

        {/* Topic pill */}
        <Pill color="#5c35cc" bg="#ede9ff">
          🎯 Practising: <strong>{reviewMissingTypes?.join(", ")}</strong>
        </Pill>

        {/* Overview */}
        <Card>
          <SectionLabel color="#667eea">📖 What we'll learn</SectionLabel>
          <OverviewBox>{lessonMaterial?.overview}</OverviewBox>
        </Card>

        {/* Content paragraphs — max 2, keep them short */}
        {lessonMaterial?.contents?.slice(0, 2).map((para, i) => (
          <Card key={i} style={{ padding: "1rem 1.25rem" }}>
            <p style={{ margin: 0, color: "#444", lineHeight: "1.65", fontSize: "0.95rem" }}>
              {para}
            </p>
          </Card>
        ))}

        {/* What's next */}
        <Pill color="#2e7d32" bg="#e8f5e9">
          ✅ Next: 1 practice activity + 1 quick quiz
        </Pill>

        <Btn gradient="linear-gradient(135deg, #667eea, #764ba2)" onClick={() => setAiReviewStep("activity")} full>
          Let's Practice! 🚀
        </Btn>
        <Btn ghost onClick={onBackToActivity} full>
          ← Back to Activity
        </Btn>
      </Wrap>
    );
  }

  // ── Step: Activity Preview ──
  if (aiReviewStep === "activity") {
    return (
      <Wrap>
        <Header gradient="linear-gradient(135deg, #4CAF50, #66BB6A)" icon="🏋️">
          <Chip>Practice Time</Chip>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>{activity?.name}</h2>
        </Header>

        {/* Mission */}
        <Card>
          <SectionLabel color="#4CAF50">📋 Your Mission</SectionLabel>
          <MissionBox>{activity?.instructions}</MissionBox>

          {activity?.expectedOutput && (
            <div style={{ marginTop: "0.75rem" }}>
              <SectionLabel color="#e65100">🎯 Expected Output</SectionLabel>
              <pre style={preStyle}>{activity.expectedOutput}</pre>
            </div>
          )}

          {activity?.dataTypesRequired?.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <SectionLabel color="#5c6bc0">🧩 Blocks you'll need</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.4rem" }}>
                {activity.dataTypesRequired.map((b, i) => (
                  <BlockTag key={i}>{b}</BlockTag>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Hints */}
        {activity?.hints?.length > 0 && (
          <Card style={{ background: "#f0fff4", border: "2px solid #a5d6a7" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <SectionLabel color="#2e7d32" style={{ margin: 0 }}>
                💡 Hints ({aiReviewRevealedHints}/{activity.hints.length})
              </SectionLabel>
              {aiReviewRevealedHints < activity.hints.length && (
                <HintBtn onClick={() => setAiReviewRevealedHints(p => Math.min(p + 1, activity.hints.length))}>
                  Show hint
                </HintBtn>
              )}
            </div>
            {aiReviewRevealedHints > 0 && (
              <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {activity.hints.slice(0, aiReviewRevealedHints).map((hint, i) => (
                  <HintItem key={i} num={i + 1}>{hint}</HintItem>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Pill color="#f57f17" bg="#fff8e1">
          ⏱️ Time: {Math.floor((activity?.timeLimit || 180) / 60)} minutes
        </Pill>

        <Btn gradient="linear-gradient(135deg, #4CAF50, #66BB6A)" onClick={() => { setAiReviewRevealedHints(0); onStartActivity(); }} full>
          Start Activity! 🎯
        </Btn>
      </Wrap>
    );
  }

  // ── Step: Assessment ──
  return (
    <Wrap>
      <Header gradient="linear-gradient(135deg, #f093fb, #f5576c)" icon="📝">
        <Chip>Mini Quiz</Chip>
        <h2 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>Time to show what you know!</h2>
      </Header>

      <Card>
        <SectionLabel color="#f5576c">🎯 Quick Quiz</SectionLabel>
        <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: "1rem" }}>
          <strong>{assessmentQuestions?.length} questions</strong> about{" "}
          {reviewMissingTypes?.join(", ")}. You've got this! 💪
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {assessmentQuestions?.map((q, i) => (
            <QuizCard key={i} num={i + 1} difficulty={q.difficulty} text={q.instructions} />
          ))}
        </div>
      </Card>

      <Btn gradient="linear-gradient(135deg, #f093fb, #f5576c)" onClick={onStartAssessment} full>
        Start Quiz! 📝
      </Btn>
      <Btn ghost onClick={onSkip} full>
        Skip & go back
      </Btn>
    </Wrap>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QuizCard({ num, difficulty, text }) {
  const diffColor = difficulty === "Easy" ? "#4caf50" : difficulty === "Medium" ? "#ff9800" : "#f44336";
  return (
    <div style={{ background: "#f8f9ff", border: "2px solid #e3f2fd", borderRadius: "12px", padding: "0.7rem 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.3rem" }}>
        <span style={{ background: "#f093fb", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.75rem", flexShrink: 0 }}>{num}</span>
        <span style={{ background: diffColor + "22", color: diffColor, borderRadius: "20px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: "700" }}>{difficulty}</span>
      </div>
      <p style={{ margin: 0, fontSize: "0.88rem", color: "#555" }}>{text?.slice(0, 90)}{text?.length > 90 ? "..." : ""}</p>
    </div>
  );
}

function HintItem({ num, children }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", background: "#fff", borderRadius: "8px", padding: "0.5rem 0.75rem", borderLeft: "4px solid #4CAF50", marginBottom: "0.4rem" }}>
      <span style={{ background: "#4CAF50", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.75rem", flexShrink: 0, marginTop: "1px" }}>{num}</span>
      <span style={{ color: "#333", fontSize: "0.9rem" }}>{children}</span>
    </li>
  );
}

// ── Layout primitives ─────────────────────────────────────────────────────────

const fontFamily = "'Comic Sans MS', cursive";

function Wrap({ children }) {
  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1.25rem", fontFamily }}>
      {children}
    </div>
  );
}

function CenterCard({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily }}>
      <div style={{ background: "#fff", borderRadius: "24px", padding: "2.5rem", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: "440px" }}>
        {children}
      </div>
    </div>
  );
}

function Header({ gradient, icon, children }) {
  return (
    <div style={{ background: gradient, borderRadius: "18px", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.85rem" }}>
      <span style={{ fontSize: "1.8rem" }}>{icon}</span>
      <div>{children}</div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{ background: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: "20px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: "700", display: "inline-block", marginBottom: "4px" }}>
      {children}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: "0.85rem", ...style }}>
      {children}
    </div>
  );
}

function Pill({ children, color, bg }) {
  return (
    <div style={{ background: bg || "#ede9ff", border: `2px solid ${color}33`, borderRadius: "10px", padding: "0.6rem 1rem", fontSize: "0.88rem", color, marginBottom: "0.85rem", fontWeight: "600" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, color, style = {} }) {
  return (
    <p style={{ margin: "0 0 0.4rem", fontWeight: "700", fontSize: "0.85rem", color, textTransform: "uppercase", letterSpacing: "0.04em", ...style }}>
      {children}
    </p>
  );
}

function OverviewBox({ children }) {
  return (
    <div style={{ background: "#e8f5e9", borderRadius: "10px", padding: "0.75rem 1rem", border: "2px dashed #4CAF50", color: "#333", fontSize: "0.95rem", lineHeight: "1.6" }}>
      {children}
    </div>
  );
}

function MissionBox({ children }) {
  return (
    <div style={{ background: "#fff9e6", borderRadius: "10px", padding: "0.75rem 1rem", border: "3px dashed #FFC107", color: "#333", fontSize: "0.95rem", lineHeight: "1.6" }}>
      {children}
    </div>
  );
}

function BlockTag({ children }) {
  return (
    <span style={{ background: "#e3f2fd", border: "2px solid #90caf9", borderRadius: "20px", padding: "3px 12px", fontSize: "0.82rem", color: "#1565c0", fontWeight: "700" }}>
      {children}
    </span>
  );
}

function HintBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: "linear-gradient(135deg, #4CAF50, #66BB6A)", color: "#fff", border: "none", borderRadius: "20px", padding: "5px 12px", cursor: "pointer", fontFamily, fontWeight: "700", fontSize: "0.82rem" }}>
      {children}
    </button>
  );
}

function Btn({ children, gradient, onClick, full, ghost }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ghost ? "transparent" : (gradient || "#eee"),
        color: ghost ? "#999" : (gradient ? "#fff" : "#666"),
        border: ghost ? "2px solid #ddd" : "none",
        borderRadius: "22px",
        padding: "0.8rem 1.75rem",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "0.95rem",
        fontFamily,
        width: full ? "100%" : "auto",
        marginBottom: "0.6rem",
        display: "block",
      }}
    >
      {children}
    </button>
  );
}

const preStyle = {
  background: "#f4f4f4",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "2px dashed #FF9800",
  fontSize: "0.88rem",
  fontFamily: "monospace",
  color: "#333",
  margin: 0,
};