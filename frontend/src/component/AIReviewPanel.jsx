import React, { useState } from "react";
import { Spinner } from "react-bootstrap";

// ── Feedback reasons shown when user says "Not helpful"
const NOT_HELPFUL_REASONS = [
  "Too hard to understand 😕",
  "Too easy / I already knew this 😴",
  "Instructions were confusing 🤔",
  "Examples didn't make sense 📖",
  "Hints weren't useful 💡",
  "Activity didn't match the lesson ❌",
  "Something else...",
];

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
  onSubmitFeedback, // (feedbackPayload) => Promise<void>
}) {
  const [feedbackState, setFeedbackState]       = useState("idle"); // idle | helpful | not-helpful | custom | submitted
  const [selectedReasons, setSelectedReasons]   = useState([]);
  const [customReason, setCustomReason]         = useState("");
  const [submitting, setSubmitting]             = useState(false);

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

  // ── Feedback helpers ──
  const toggleReason = (r) =>
    setSelectedReasons(prev =>
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );

  const handleFeedbackSubmit = async (helpful) => {
    setSubmitting(true);
    const reasons = helpful
      ? []
      : selectedReasons.includes("Something else...")
        ? [...selectedReasons.filter(r => r !== "Something else..."), customReason].filter(Boolean)
        : selectedReasons;

    try {
      await onSubmitFeedback?.({
        helpful,
        reasons,
        lessonId:    aiReviewData?.currentLessonId,
        missingTypes: reviewMissingTypes,
        timestamp:   new Date().toISOString(),
      });
      setFeedbackState("submitted");
    } catch {
      setFeedbackState("submitted"); // still dismiss gracefully
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step: Feedback ──
  if (aiReviewStep === "feedback") {
    // Submitted
    if (feedbackState === "submitted") {
      return (
        <CenterCard>
          <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🙏</div>
          <h3 style={{ color: "#667eea", fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            Thanks for your feedback!
          </h3>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            It helps us make lessons better for every student. 💪
          </p>
          <Btn gradient="linear-gradient(135deg, #667eea, #764ba2)" onClick={onBackToActivity} full>
            Back to Lesson 🎓
          </Btn>
        </CenterCard>
      );
    }

    // Not helpful — reason picker
    if (feedbackState === "not-helpful") {
      return (
        <Wrap>
          <Header gradient="linear-gradient(135deg, #ff6b6b, #ee5a24)" icon="💬">
            <Chip>Your Feedback</Chip>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>What went wrong?</h2>
          </Header>

          <Card>
            <SectionLabel color="#ee5a24">🔍 Pick all that apply</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              {NOT_HELPFUL_REASONS.map((reason) => {
                const selected = selectedReasons.includes(reason);
                return (
                  <ReasonChip
                    key={reason}
                    selected={selected}
                    onClick={() => toggleReason(reason)}
                  >
                    {reason}
                  </ReasonChip>
                );
              })}
            </div>

            {selectedReasons.includes("Something else...") && (
              <textarea
                placeholder="Tell us more... (optional)"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                style={textareaStyle}
              />
            )}
          </Card>

          <Btn
            gradient="linear-gradient(135deg, #ee5a24, #ff6b6b)"
            onClick={() => handleFeedbackSubmit(false)}
            full
            disabled={submitting || selectedReasons.length === 0}
          >
            {submitting ? "Sending..." : "Submit Feedback 📨"}
          </Btn>
          <Btn ghost onClick={() => setFeedbackState("idle")} full>
            ← Go back
          </Btn>
        </Wrap>
      );
    }

    // Default feedback prompt
    return (
      <CenterCard>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>💬</div>
        <h3 style={{ color: "#333", fontSize: "1.25rem", marginBottom: "0.4rem", fontFamily }}>
          Was this review helpful?
        </h3>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1.75rem", fontFamily }}>
          Your answer helps us make lessons better! 🌟
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <ThumbBtn
            emoji="👍"
            label="Yes!"
            color="#4CAF50"
            onClick={() => handleFeedbackSubmit(true)}
            disabled={submitting}
          />
          <ThumbBtn
            emoji="👎"
            label="Not really"
            color="#f44336"
            onClick={() => setFeedbackState("not-helpful")}
            disabled={submitting}
          />
        </div>
        <button
          onClick={onBackToActivity}
          style={{ marginTop: "1.25rem", background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: "0.85rem", fontFamily }}
        >
          Skip &amp; go back
        </button>
      </CenterCard>
    );
  }

  // ── Step: Lesson ──
  if (aiReviewStep === "lesson") {
    return (
      <Wrap>
        <Header gradient="linear-gradient(135deg, #667eea, #764ba2)" icon="📚">
          <Chip>AI Review</Chip>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.3rem" }}>{lessonMaterial?.title}</h2>
        </Header>

        <Pill color="#5c35cc" bg="#ede9ff">
          🎯 Practising: <strong>{reviewMissingTypes?.join(", ")}</strong>
        </Pill>

        <Card>
          <SectionLabel color="#667eea">📖 What we'll learn</SectionLabel>
          <OverviewBox>{lessonMaterial?.overview}</OverviewBox>
        </Card>

        {lessonMaterial?.contents?.slice(0, 2).map((para, i) => (
          <Card key={i} style={{ padding: "1rem 1.25rem" }}>
            <p style={{ margin: 0, color: "#444", lineHeight: "1.65", fontSize: "0.95rem" }}>
              {para}
            </p>
          </Card>
        ))}

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
  if (aiReviewStep === "assessment") {
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
        {/* Skip goes to feedback, not directly back */}
        <Btn ghost onClick={() => setAiReviewStep("feedback")} full>
          Skip &amp; give feedback
        </Btn>
      </Wrap>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ThumbBtn({ emoji, label, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: color + "18",
        border: `3px solid ${color}55`,
        borderRadius: "20px",
        padding: "0.85rem 1.75rem",
        cursor: "pointer",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.3rem",
        transition: "transform 0.15s, box-shadow 0.15s",
        minWidth: "110px",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = `0 4px 18px ${color}44`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <span style={{ fontSize: "2.2rem" }}>{emoji}</span>
      <span style={{ color, fontWeight: "700", fontSize: "0.9rem" }}>{label}</span>
    </button>
  );
}

function ReasonChip({ children, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? "#ee5a2418" : "#f8f8f8",
        border: `2px solid ${selected ? "#ee5a24" : "#e0e0e0"}`,
        borderRadius: "12px",
        padding: "0.55rem 1rem",
        textAlign: "left",
        cursor: "pointer",
        fontFamily,
        fontSize: "0.9rem",
        color: selected ? "#ee5a24" : "#555",
        fontWeight: selected ? "700" : "400",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span style={{
        width: "18px", height: "18px", borderRadius: "50%",
        border: `2px solid ${selected ? "#ee5a24" : "#bbb"}`,
        background: selected ? "#ee5a24" : "transparent",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <span style={{ color: "#fff", fontSize: "0.6rem", fontWeight: "900" }}>✓</span>}
      </span>
      {children}
    </button>
  );
}

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

function Btn({ children, gradient, onClick, full, ghost, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: ghost ? "transparent" : (gradient || "#eee"),
        color: ghost ? "#999" : (gradient ? "#fff" : "#666"),
        border: ghost ? "2px solid #ddd" : "none",
        borderRadius: "22px",
        padding: "0.8rem 1.75rem",
        fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
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

const textareaStyle = {
  width: "100%",
  marginTop: "0.75rem",
  padding: "0.75rem",
  borderRadius: "10px",
  border: "2px solid #ee5a2455",
  fontFamily,
  fontSize: "0.9rem",
  color: "#333",
  resize: "vertical",
  minHeight: "80px",
  boxSizing: "border-box",
  outline: "none",
};