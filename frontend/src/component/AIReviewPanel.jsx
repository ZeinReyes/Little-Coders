import React from "react";
import { Spinner } from "react-bootstrap";

/**
 * AIReviewPanel
 * Full-page panel rendered instead of the main drag-board when the user
 * accepts an AI review session. Walks through three steps:
 *   "lesson"  → read the AI-generated mini lesson
 *   "activity"→ preview the activity before starting it
 *   (default) → assessment overview before starting it
 *
 * Props:
 *  - loading / error / errorReset
 *  - aiReviewData        : { reviewContent, currentLessonTitle, missingTypes }
 *  - aiReviewStep        : "lesson" | "activity" | "assessment"
 *  - setAiReviewStep
 *  - aiReviewRevealedHints / setAiReviewRevealedHints
 *  - aiRecommendation    : { missingTypes }
 *  - onStartActivity()
 *  - onStartAssessment()
 *  - onBackToActivity()
 *  - onSkip()            : navigate back to lesson list
 */
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
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
        <h3 style={{ color: "#667eea" }}>AI is creating your personalized lesson...</h3>
        <p style={{ color: "#888" }}>
          Teaching you about: {aiRecommendation?.missingTypes?.join(", ")} ✨
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
        <h3 style={{ color: "#e53935" }}>{error}</h3>
        <PanelButton
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          onClick={errorReset}
        >
          Go Back
        </PanelButton>
      </CenterCard>
    );
  }

  const { reviewContent, currentLessonTitle, missingTypes: reviewMissingTypes } =
    aiReviewData || {};
  const { lessonMaterial, activity, assessmentQuestions } = reviewContent || {};

  // ── Step: Lesson ──
  if (aiReviewStep === "lesson") {
    return (
      <PanelWrapper>
        <GradientHeader gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" icon="📚">
          <small style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
            AI Review Session
          </small>
          <h2 style={{ margin: 0, color: "#fff" }}>{lessonMaterial?.title}</h2>
        </GradientHeader>

        <InfoBanner color="#E65100" bg="#FFF3E0" border="#FFE0B2">
          🎯 Reviewing blocks: <strong>{reviewMissingTypes?.join(", ")}</strong> · From{" "}
          {currentLessonTitle}
        </InfoBanner>

        <Card>
          <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>📖 Let's Learn Together!</h3>
          <div
            style={{
              background: "#E8F5E9",
              borderRadius: "12px",
              padding: "1rem",
              border: "2px dashed #4CAF50",
              marginBottom: "1rem",
            }}
          >
            <p style={{ margin: 0, fontWeight: "600", color: "#555" }}>
              {lessonMaterial?.overview}
            </p>
          </div>
          {lessonMaterial?.contents?.map((para, i) => (
            <div
              key={i}
              style={{
                background: "#F8F9FF",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "0.75rem",
                border: "2px solid #E3F2FD",
                lineHeight: "1.7",
                color: "#333",
              }}
            >
              {para}
            </div>
          ))}
        </Card>

        <InfoBanner color="#555" bg="#E8F5E9" border="#A5D6A7">
          <h4 style={{ color: "#555", marginBottom: "0.5rem" }}>📝 What's next:</h4>
          <p style={{ color: "#777", margin: 0 }}>
            1 practice activity + 1 mini assessment to test your understanding!
          </p>
        </InfoBanner>

        <PanelButton
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          onClick={() => setAiReviewStep("activity")}
          fullWidth
        >
          Let's Practice! 🚀
        </PanelButton>

        <PanelButton
          style={{ background: "#eee", color: "#666", border: "2px solid #ccc", marginTop: "0.75rem" }}
          onClick={onBackToActivity}
          fullWidth
        >
          Back to Activity
        </PanelButton>
      </PanelWrapper>
    );
  }

  // ── Step: Activity Preview ──
  if (aiReviewStep === "activity") {
    return (
      <PanelWrapper>
        <GradientHeader gradient="linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)" icon="🏋️">
          <small style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
            Practice Activity
          </small>
          <h2 style={{ margin: 0, color: "#fff" }}>{activity?.name}</h2>
        </GradientHeader>

        <Card>
          <h4 style={{ color: "#4CAF50", marginBottom: "0.75rem" }}>📋 Your Mission</h4>
          <div
            style={{
              background: "#FFF9E6",
              borderRadius: "12px",
              padding: "1rem",
              border: "3px dashed #FFC107",
              color: "#333",
              marginBottom: "1rem",
            }}
          >
            <p style={{ margin: 0 }}>{activity?.instructions}</p>
          </div>

          {activity?.expectedOutput && (
            <div style={{ marginBottom: "1rem" }}>
              <h5 style={{ color: "#E65100" }}>🎯 Expected Output:</h5>
              <pre
                style={{
                  background: "#f4f4f4",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "2px dashed #FF9800",
                  fontSize: "0.9rem",
                  fontFamily: "monospace",
                  color: "#333",
                }}
              >
                {activity.expectedOutput}
              </pre>
            </div>
          )}

          {activity?.dataTypesRequired?.length > 0 && (
            <div>
              <h5 style={{ color: "#5c6bc0" }}>🧩 Blocks you'll need:</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "0.5rem" }}>
                {activity.dataTypesRequired.map((block, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#E3F2FD",
                      border: "2px solid #90CAF9",
                      borderRadius: "20px",
                      padding: "4px 14px",
                      fontSize: "0.85rem",
                      color: "#1565C0",
                      fontWeight: "600",
                    }}
                  >
                    {block}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Hints section */}
        {activity?.hints?.length > 0 && (
          <div
            style={{
              background: "#E8F5E9",
              border: "3px solid #4CAF50",
              borderRadius: "16px",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <h5 style={{ margin: 0, color: "#2E7D32" }}>
                💚 Hints ({aiReviewRevealedHints}/{activity.hints.length} unlocked)
              </h5>
              {aiReviewRevealedHints < activity.hints.length && (
                <button
                  style={{
                    background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontFamily: "Comic Sans MS, cursive",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                  }}
                  onClick={() =>
                    setAiReviewRevealedHints((p) => Math.min(p + 1, activity.hints.length))
                  }
                >
                  Unlock Hint!
                </button>
              )}
            </div>
            {aiReviewRevealedHints > 0 && (
              <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 0 }}>
                {activity.hints.slice(0, aiReviewRevealedHints).map((hint, i) => (
                  <li
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "0.6rem 0.8rem",
                      borderLeft: "4px solid #4CAF50",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: "#333",
                    }}
                  >
                    <span
                      style={{
                        background: "#4CAF50",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <InfoBanner color="#F57F17" bg="#FFF8E1" border="#FFE082">
          ⏱️ <strong>Time limit:</strong> {activity?.timeLimit} seconds (
          {Math.floor((activity?.timeLimit || 180) / 60)} minutes)
        </InfoBanner>

        <PanelButton
          gradient="linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)"
          onClick={() => { setAiReviewRevealedHints(0); onStartActivity(); }}
          fullWidth
        >
          Start Activity! 🎯
        </PanelButton>
      </PanelWrapper>
    );
  }

  // ── Step: Assessment overview ──
  return (
    <PanelWrapper>
      <GradientHeader gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" icon="📝">
        <small style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
          Mini Assessment
        </small>
        <h2 style={{ margin: 0, color: "#fff" }}>Let's Test Your Knowledge!</h2>
      </GradientHeader>

      <Card>
        <h4 style={{ color: "#f5576c", marginBottom: "1rem" }}>
          🎯 Ready to show what you learned?
        </h4>
        <p style={{ color: "#555", marginBottom: "1rem" }}>
          You'll get <strong>{assessmentQuestions?.length} questions</strong> to test your
          understanding of {reviewMissingTypes?.join(", ")}.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {assessmentQuestions?.map((q, i) => (
            <div
              key={i}
              style={{
                background: "#F8F9FF",
                border: "2px solid #E3F2FD",
                borderRadius: "12px",
                padding: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "#f093fb",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                }}
              >
                Question {i + 1} - {q.difficulty}
              </div>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#555" }}>
                {q.instructions?.slice(0, 80)}...
              </p>
            </div>
          ))}
        </div>
      </Card>

      <PanelButton
        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        onClick={onStartAssessment}
        fullWidth
      >
        Start Assessment! 📝
      </PanelButton>

      <PanelButton
        style={{ background: "#eee", color: "#666", border: "2px solid #ccc", marginTop: "0.75rem" }}
        onClick={onSkip}
        fullWidth
      >
        Skip & Go Back to Lesson
      </PanelButton>
    </PanelWrapper>
  );
}

// ── Small layout helpers ──────────────────────────────────────────────────────

function PanelWrapper({ children }) {
  return (
    <div
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "1.5rem",
        fontFamily: "Comic Sans MS, cursive",
      }}
    >
      {children}
    </div>
  );
}

function CenterCard({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "Comic Sans MS, cursive",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "3rem",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          maxWidth: "500px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function GradientHeader({ gradient, icon, children }) {
  return (
    <div
      style={{
        background: gradient,
        borderRadius: "20px",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
      }}
    >
      <span style={{ fontSize: "2rem" }}>{icon}</span>
      <div>{children}</div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "1.5rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        marginBottom: "1rem",
      }}
    >
      {children}
    </div>
  );
}

function InfoBanner({ children, color, bg, border }) {
  return (
    <div
      style={{
        background: bg || "#FFF3E0",
        border: `2px solid ${border || "#FFE0B2"}`,
        borderRadius: "12px",
        padding: "0.75rem 1rem",
        fontSize: "0.9rem",
        color: color || "#E65100",
        marginBottom: "1rem",
      }}
    >
      {children}
    </div>
  );
}

function PanelButton({ children, gradient, onClick, fullWidth, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: gradient || "#eee",
        color: gradient ? "#fff" : "#666",
        border: "none",
        borderRadius: "24px",
        padding: "0.9rem 2rem",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "1rem",
        fontFamily: "Comic Sans MS, cursive",
        width: fullWidth ? "100%" : "auto",
        marginBottom: fullWidth ? "0.75rem" : 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}