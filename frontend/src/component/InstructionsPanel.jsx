import React from "react";

/**
 * InstructionsPanel
 * Shows the left/top instruction card for either an activity or assessment question.
 *
 * Props (activity mode):
 *  - lesson        : the full lesson object (type === "activity")
 *  - revealedHints : number
 *  - setRevealedHints
 *
 * Props (assessment mode):
 *  - lesson        : the full lesson object (type === "assessment")
 *  - revealedHints / setRevealedHints
 */
export default function InstructionsPanel({ lesson, revealedHints, setRevealedHints }) {
  if (!lesson) return null;

  if (lesson.type === "activity") {
    return (
      <div
        className="activity-instructions mb-3"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "20px",
          padding: "1.5rem",
          boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
          border: "4px solid #ffffff",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "15px",
            padding: "1rem",
          }}
        >
          {lesson.isAIReview && (
            <AIReviewBadge label="🤖 AI Review Activity" />
          )}

          <h5
            style={{
              color: "#667eea",
              marginBottom: "1rem",
              fontSize: "1.4rem",
              fontWeight: "700",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Your Mission!
          </h5>

          <div
            style={{
              backgroundColor: "#FFF9E6",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1rem",
              border: "3px dashed #FFC107",
              color: "#333",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: lesson.instructions }} />
          </div>

          <HintsSection
            hints={lesson.hints}
            revealedHints={revealedHints}
            setRevealedHints={setRevealedHints}
            accentColor="#4CAF50"
            bgColor="#E8F5E9"
            borderColor="#4CAF50"
            itemBg="#F1F8E9"
            badgeBg="#4CAF50"
            badgeColor="white"
          />

          {lesson.expectedOutput && (
            <ExpectedOutputBox
              output={lesson.expectedOutput}
              labelColor="#E65100"
              borderColor="#FF9800"
              bg="#FFF3E0"
            />
          )}
        </div>
      </div>
    );
  }

  if (lesson.type === "assessment" && lesson.currentQuestion) {
    const q = lesson.currentQuestion;
    return (
      <div
        className="assessment-instructions mb-3"
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          borderRadius: "20px",
          padding: "1.5rem",
          boxShadow: "0 8px 16px rgba(240, 147, 251, 0.3)",
          border: "4px solid #ffffff",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "15px",
            padding: "1rem",
          }}
        >
          {lesson.isAIReview && (
            <AIReviewBadge label="🤖 AI Review Assessment" />
          )}

          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "3px dashed #f5576c",
            }}
          >
            <h5
              style={{
                color: "#f5576c",
                margin: 0,
                fontSize: "1.3rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {lesson.title}
            </h5>
            <div
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                padding: "8px 16px",
                borderRadius: "25px",
                fontSize: "0.9rem",
                fontWeight: "700",
                color: "#ffffff",
              }}
            >
              Question {(lesson.answered?.length || 0) + 1} of {lesson.totalQuestions || 1}
            </div>
          </div>

          {/* Instructions */}
          <div
            style={{
              backgroundColor: "#E3F2FD",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1rem",
              border: "3px dashed #2196F3",
              color: "#333",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: q.instructions }} />
          </div>

          <HintsSection
            hints={q.hints}
            revealedHints={revealedHints}
            setRevealedHints={setRevealedHints}
            accentColor="#FFC107"
            bgColor="#FFF9C4"
            borderColor="#FFC107"
            itemBg="#FFFDE7"
            badgeBg="#FFC107"
            badgeColor="#333"
          />

          {q.expectedOutput && (
            <ExpectedOutputBox
              output={q.expectedOutput}
              labelColor="#01579B"
              borderColor="#03A9F4"
              bg="#E1F5FE"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function AIReviewBadge({ label }) {
  return (
    <div
      style={{
        background: "#FFF3E0",
        border: "2px solid #FF9800",
        borderRadius: "12px",
        padding: "0.5rem 1rem",
        marginBottom: "1rem",
        fontSize: "0.85rem",
        color: "#E65100",
        fontWeight: "600",
      }}
    >
      {label}
    </div>
  );
}

function HintsSection({
  hints,
  revealedHints,
  setRevealedHints,
  accentColor,
  bgColor,
  borderColor,
  itemBg,
  badgeBg,
  badgeColor,
}) {
  if (!hints?.length) return null;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: "1rem",
        borderRadius: "12px",
        marginBottom: "1rem",
        border: `3px solid ${borderColor}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <h6 style={{ color: accentColor, margin: 0, fontSize: "1.1rem", fontWeight: "700" }}>
          Need Help? ({revealedHints}/{hints.length} unlocked)
        </h6>
        {revealedHints < hints.length && (
          <button
            onClick={() => setRevealedHints((prev) => Math.min(prev + 1, hints.length))}
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}BB 100%)`,
              color: badgeColor,
              border: "none",
              borderRadius: "25px",
              padding: "8px 16px",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            Unlock Hint!
          </button>
        )}
      </div>

      {revealedHints > 0 ? (
        <ul style={{ marginBottom: 0, paddingLeft: 0, listStyleType: "none", color: "#333" }}>
          {hints.slice(0, revealedHints).map((hint, i) => (
            <li
              key={i}
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                backgroundColor: itemBg,
                borderRadius: "8px",
                borderLeft: `4px solid ${accentColor}`,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  backgroundColor: badgeBg,
                  color: badgeColor,
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  marginRight: "0.75rem",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: hint }} />
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#666", fontStyle: "italic", marginBottom: 0, textAlign: "center" }}>
          Click "Unlock Hint!" to reveal helpful tips one by one!
        </p>
      )}
    </div>
  );
}

function ExpectedOutputBox({ output, labelColor, borderColor, bg }) {
  return (
    <div
      style={{
        backgroundColor: bg,
        padding: "1rem",
        borderRadius: "12px",
        border: `3px solid ${borderColor}`,
      }}
    >
      <h6
        style={{ color: labelColor, marginBottom: "0.75rem", fontSize: "1.1rem", fontWeight: "700" }}
      >
        What You Should See:
      </h6>
      <pre
        style={{
          backgroundColor: "#ffffff",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: 0,
          border: `2px dashed ${borderColor}`,
          fontSize: "0.9rem",
          fontFamily: "monospace",
          color: "#333",
          overflowX: "auto",
        }}
      >
        {output}
      </pre>
    </div>
  );
}