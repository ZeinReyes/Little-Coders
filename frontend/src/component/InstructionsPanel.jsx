import React, { useEffect, useRef } from "react";

/**
 * InstructionsPanel
 * Shows the left/top instruction card for either an activity or assessment question.
 *
 * TTS props (mirror those used in LessonModals):
 *  ttsEnabled    {boolean}   — whether narration is on
 *  ttsSpeaking   {boolean}   — true while audio is actively playing
 *  onTtsToggle   {function}  — toggle narration on/off
 *  onTtsStop     {function}  — stop current audio immediately
 *  onTtsSpeak    {function}  — (html: string) => void  — start reading a string
 */
export default function InstructionsPanel({
  lesson,
  revealedHints,
  setRevealedHints,
  onBack,
  // TTS
  ttsEnabled  = true,
  ttsSpeaking = false,
  onTtsToggle = () => {},
  onTtsStop   = () => {},
  onTtsSpeak  = () => {},
}) {
  // ── ALL hooks must come before any early return ───────────────────────────

  // Key that changes when the content to be read changes
  const instructionsKey =
    lesson?.type === "assessment"
      ? lesson?.currentQuestion?._id
      : lesson?._id;

  // Auto-speak instructions + expected output when lesson/question changes.
  // 400ms delay prevents the lesson-modal cleanup stop() from racing us.
  useEffect(() => {
    if (!lesson || !ttsEnabled) return;

    let text = "";

    if (lesson.type === "activity") {
      text += lesson.instructions || "";
      if (lesson.expectedOutput)
        text += " The output of what your building should be: " + lesson.expectedOutput;
    } else if (lesson.type === "assessment" && lesson.currentQuestion) {
      const q = lesson.currentQuestion;
      text += q.instructions || "";
      if (q.expectedOutput)
        text += " The output of what your building should be: " + q.expectedOutput;
    }

    if (!text) return;

    const timer = setTimeout(() => { onTtsSpeak(text); }, 400);

    return () => {
      clearTimeout(timer);
      onTtsStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructionsKey, ttsEnabled]);

  // Speak each newly revealed hint
  const prevRevealedRef = useRef(revealedHints);
  useEffect(() => {
    const prev = prevRevealedRef.current;
    prevRevealedRef.current = revealedHints;

    if (!lesson || !ttsEnabled || revealedHints <= prev || revealedHints === 0) return;

    const hints =
      lesson.type === "activity"
        ? lesson.hints
        : lesson.currentQuestion?.hints;

    if (!hints) return;
    const newHint = hints[revealedHints - 1];
    if (newHint) onTtsSpeak(`Hint ${revealedHints}: ${newHint}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedHints]);

  // ── Early return after all hooks ──────────────────────────────────────────
  if (!lesson) return null;

  // ═══════════════════════════════════════════════════════════
  // ACTIVITY PANEL
  // ═══════════════════════════════════════════════════════════
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
          {/* Back + TTS row */}
          <div style={styles.topRow}>
            {onBack && (
              <BackButton onClick={onBack} color="#667eea" borderColor="#667eea" />
            )}
            <TTSBar
              ttsEnabled={ttsEnabled}
              ttsSpeaking={ttsSpeaking}
              onTtsToggle={onTtsToggle}
              onTtsStop={onTtsStop}
            />
          </div>

          {/* TTS status banner */}
          <TTSBanner ttsEnabled={ttsEnabled} ttsSpeaking={ttsSpeaking} />

          {lesson.isAIReview && <AIReviewBadge label="🤖 AI Review Activity" />}

          <h5 style={styles.missionTitle("#667eea")}>Your Mission!</h5>

          <div
            style={{
              backgroundColor: "#FFF9E6",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1rem",
              border: "3px dashed #FFC107",
              color: "#333",
              position: "relative",
            }}
          >
            {ttsSpeaking && <div style={styles.shimmer} />}
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

  // ═══════════════════════════════════════════════════════════
  // ASSESSMENT PANEL
  // ═══════════════════════════════════════════════════════════
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
          {/* Back + TTS row */}
          <div style={styles.topRow}>
            {onBack && (
              <BackButton onClick={onBack} color="#f5576c" borderColor="#f5576c" />
            )}
            <TTSBar
              ttsEnabled={ttsEnabled}
              ttsSpeaking={ttsSpeaking}
              onTtsToggle={onTtsToggle}
              onTtsStop={onTtsStop}
            />
          </div>

          {/* TTS status banner */}
          <TTSBanner ttsEnabled={ttsEnabled} ttsSpeaking={ttsSpeaking} />

          {lesson.isAIReview && <AIReviewBadge label="🤖 AI Review Assessment" />}

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
              Question {(lesson.answered?.length || 0) + 1} of{" "}
              {lesson.totalQuestions || 1}
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
              position: "relative",
            }}
          >
            {ttsSpeaking && <div style={styles.shimmer} />}
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

// ── Shared inline style helpers ───────────────────────────────────────────────

const styles = {
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
    flexWrap: "wrap",
    gap: "6px",
  },
  ttsBar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginLeft: "auto",
  },
  ttsBtn: {
    background: "rgba(255,255,255,0.7)",
    border: "2px solid rgba(0,0,0,0.12)",
    borderRadius: "50px",
    padding: "4px 13px",
    fontSize: "1.1rem",
    cursor: "pointer",
    fontFamily: "'Comic Sans MS', cursive",
    transition: "background 0.2s, transform 0.15s",
    lineHeight: 1,
  },
  ttsBtnOff: {
    opacity: 0.65,
  },
  stopBtn: {
    background: "rgba(255,100,100,0.22)",
    borderColor: "rgba(200,50,50,0.3)",
  },
  speakingBars: {
    display: "flex",
    alignItems: "flex-end",
    gap: "3px",
    height: "22px",
    padding: "2px 6px",
    background: "rgba(255,255,255,0.55)",
    borderRadius: "30px",
    border: "2px solid rgba(0,0,0,0.1)",
  },
  bar: {
    display: "inline-block",
    width: "4px",
    borderRadius: "3px",
    background: "#5f3dc4",
    animation: "ipBarBounce 0.6s ease-in-out infinite alternate",
    height: "12px",
  },
  shimmer: {
    position: "absolute",
    inset: 0,
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,214,100,0.18) 50%, rgba(255,255,255,0) 100%)",
    backgroundSize: "200% 100%",
    animation: "ipShimmer 2s linear infinite",
    pointerEvents: "none",
    zIndex: 1,
  },
  missionTitle: (color) => ({
    color,
    marginBottom: "1rem",
    fontSize: "1.4rem",
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "1px",
  }),
};

// ── TTS control bar ───────────────────────────────────────────────────────────
function TTSBar({ ttsEnabled, ttsSpeaking, onTtsToggle, onTtsStop }) {
  return (
    <div style={styles.ttsBar}>
      {ttsSpeaking && (
        <div style={styles.speakingBars} title="Reading aloud…">
          {[0, 0.15, 0.3, 0.45].map((delay, i) => (
            <span key={i} style={{ ...styles.bar, animationDelay: `${delay}s` }} />
          ))}
        </div>
      )}
      {ttsSpeaking && (
        <button
          style={{ ...styles.ttsBtn, ...styles.stopBtn }}
          onClick={onTtsStop}
          title="Stop reading"
        >
          ⏹
        </button>
      )}
      <button
        style={{ ...styles.ttsBtn, ...(ttsEnabled ? {} : styles.ttsBtnOff) }}
        onClick={onTtsToggle}
        title={ttsEnabled ? "Turn off narration" : "Turn on narration"}
      >
        {ttsEnabled ? "🔊" : "🔇"}
      </button>
    </div>
  );
}

// ── TTS status banner ─────────────────────────────────────────────────────────
function TTSBanner({ ttsEnabled, ttsSpeaking }) {
  if (!ttsEnabled) {
    return (
      <div style={bannerStyle("muted")}>
        <span>🔇</span>
        <span>Narration is off. Press 🔊 to turn it on.</span>
      </div>
    );
  }
  if (ttsSpeaking) {
    return (
      <div style={bannerStyle("active")}>
        <span>🎙️</span>
        <span>Reading aloud… follow along!</span>
      </div>
    );
  }
  return (
    <div style={bannerStyle("idle")}>
      <span>🔊</span>
      <span>Narration is on — reading instructions for you!</span>
    </div>
  );
}

const bannerStyle = (state) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 14px",
  borderRadius: "30px",
  fontSize: "0.8rem",
  fontFamily: "'Comic Sans MS', cursive",
  fontWeight: "bold",
  marginBottom: "10px",
  ...(state === "active"
    ? { background: "#e3f9e5", border: "2px solid #69db7c", color: "#2b8a3e" }
    : state === "idle"
    ? { background: "#e7f5ff", border: "2px dashed #74c0fc", color: "#1971c2" }
    : { background: "#f8f9fa", border: "2px dashed #ced4da", color: "#868e96" }),
});

// ── Shared sub-components ─────────────────────────────────────────────────────

function BackButton({ onClick, color, borderColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "transparent",
        color,
        border: `2px solid ${borderColor}`,
        borderRadius: "50px",
        padding: "5px 16px",
        fontFamily: "'Fredoka One', 'Comic Sans MS', cursive",
        fontSize: "0.9rem",
        fontWeight: "700",
        cursor: "pointer",
        marginBottom: "0",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = color;
      }}
    >
      ◀ Back
    </button>
  );
}

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
        <h6
          style={{
            color: accentColor,
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: "700",
          }}
        >
          Need Help? ({revealedHints}/{hints.length} unlocked)
        </h6>
        {revealedHints < hints.length && (
          <button
            onClick={() =>
              setRevealedHints((prev) => Math.min(prev + 1, hints.length))
            }
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
        <ul
          style={{
            marginBottom: 0,
            paddingLeft: 0,
            listStyleType: "none",
            color: "#333",
          }}
        >
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
        <p
          style={{
            color: "#666",
            fontStyle: "italic",
            marginBottom: 0,
            textAlign: "center",
          }}
        >
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
        style={{
          color: labelColor,
          marginBottom: "0.75rem",
          fontSize: "1.1rem",
          fontWeight: "700",
        }}
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

// ── Keyframe CSS injected once ────────────────────────────────────────────────
const keyframeCSS = `
  @keyframes ipBarBounce {
    from { transform: scaleY(0.4); opacity: 0.7; }
    to   { transform: scaleY(1.2); opacity: 1;   }
  }
  @keyframes ipShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
`;

if (typeof document !== "undefined") {
  const tag = document.getElementById("ip-tts-keyframes");
  if (!tag) {
    const s = document.createElement("style");
    s.id = "ip-tts-keyframes";
    s.textContent = keyframeCSS;
    document.head.appendChild(s);
  }
}