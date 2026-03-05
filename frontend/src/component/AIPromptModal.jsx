import React from "react";

/**
 * AIPromptModal
 * The "Need some help?" overlay that appears after repeated failures.
 * Props:
 *  - aiRecommendation  : { message, missingTypes }
 *  - onDecision(choice): called with "review" or "continue"
 */
export default function AIPromptModal({ aiRecommendation, onDecision }) {
  if (!aiRecommendation) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "'Comic Sans MS', cursive",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "24px",
          padding: "2.5rem",
          maxWidth: "550px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          border: "4px solid #FF9800",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>😓</div>
        <h2 style={{ fontWeight: "bold", color: "#E65100", marginBottom: "0.5rem" }}>
          Need some help?
        </h2>
        <p style={{ color: "#555", fontSize: "1.05rem", marginBottom: "1rem" }}>
          {aiRecommendation.message}
        </p>

        <div
          style={{
            background: "#FFF3E0",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1.5rem",
            border: "2px solid #FFE0B2",
          }}
        >
          <p style={{ color: "#E65100", fontSize: "0.95rem", margin: 0, fontWeight: "600" }}>
            🧩 Blocks you're having trouble with:
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              marginTop: "0.75rem",
            }}
          >
            {aiRecommendation.missingTypes?.map((type, i) => (
              <span
                key={i}
                style={{
                  background: "#FFE0B2",
                  border: "2px solid #FF9800",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "0.85rem",
                  color: "#E65100",
                  fontWeight: "600",
                }}
              >
                {type}
              </span>
            ))}
          </div>
          <p style={{ color: "#777", fontSize: "0.88rem", margin: "0.75rem 0 0" }}>
            Want me to create a quick lesson just for these blocks? 📚✨
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => onDecision("review")}
            style={{
              background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "24px",
              padding: "0.9rem 2rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          >
            Yes, help me learn! 🎓
          </button>
          <button
            onClick={() => onDecision("continue")}
            style={{
              background: "#eee",
              color: "#555",
              border: "2px solid #ccc",
              borderRadius: "24px",
              padding: "0.9rem 2rem",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
              fontFamily: "inherit",
            }}
          >
            No, I'll keep trying
          </button>
        </div>
      </div>
    </div>
  );
}