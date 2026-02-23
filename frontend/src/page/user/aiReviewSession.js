// src/pages/AIReviewSession.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../../context/authContext";

export default function AIReviewSession() {
  const { lessonId } = useParams(); // current lesson user was struggling in
  const location = useLocation();
  const { missingTypes, currentFailures } = location.state || {};
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState("lesson"); // "lesson" | "activity" | "assessment"
  const [revealedHints, setRevealedHints] = useState(0);

  // ── Fetch AI-generated review content ──
  useEffect(() => {
    const fetchReview = async () => {
      if (!missingTypes || !missingTypes.length) {
        setError("No missing blocks identified. Returning to lesson...");
        setTimeout(() => navigate(`/lessons/${lessonId}`), 2000);
        return;
      }

      try {
        const userId = user?._id || user?.id;
        const token  = localStorage.getItem("token");
        
        console.log("🎓 Generating review for:", missingTypes);
        
        const res = await axios.post(
          `http://localhost:5000/api/ai/generate-review`,
          { userId, lessonId, missingTypes },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setReview(res.data);
        console.log("✅ Review content loaded");
      } catch (err) {
        console.error("Failed to load review:", err);
        setError("Couldn't create your review lesson. Let's try again!");
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [lessonId, missingTypes, user]);

  // ── Loading ──
  if (loading) return (
    <div style={styles.center}>
      <div style={styles.loadingCard}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
        <h3 style={{ color: "#667eea", fontFamily: "Comic Sans MS, cursive" }}>
          AI is creating your personalized lesson...
        </h3>
        <p style={{ color: "#888" }}>Teaching you about: {missingTypes?.join(", ")} ✨</p>
        <Spinner animation="border" variant="primary" />
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={styles.center}>
      <div style={styles.loadingCard}>
        <div style={{ fontSize: "3rem" }}>😕</div>
        <h3 style={{ color: "#e53935" }}>{error}</h3>
        <button style={styles.primaryBtn} onClick={() => navigate(`/lessons/${lessonId}`)}>
          Go Back to Lesson
        </button>
      </div>
    </div>
  );

  const { reviewContent, currentLessonTitle, missingTypes: reviewMissingTypes } = review;
  const { lessonMaterial, activity, assessmentQuestions } = reviewContent;

  // ── STEP 1: Lesson Material ──
  if (currentStep === "lesson") return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={{ fontSize: "2rem" }}>📚</span>
        <div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
            AI Review Session
          </p>
          <h2 style={{ margin: 0, color: "#fff", fontFamily: "Comic Sans MS, cursive" }}>
            {lessonMaterial.title}
          </h2>
        </div>
      </div>

      <div style={styles.badge}>
        🎯 Reviewing blocks: <strong>{reviewMissingTypes?.join(", ")}</strong>
        &nbsp;·&nbsp; From {currentLessonTitle}
      </div>

      <div style={styles.card}>
        <h3 style={{ color: "#667eea", marginBottom: "1rem" }}>
          📖 Let's Learn Together!
        </h3>
        <div style={styles.overviewBox}>
          <p style={{ margin: 0, fontWeight: "600", color: "#555" }}>
            {lessonMaterial.overview}
          </p>
        </div>
        <div style={{ marginTop: "1rem" }}>
          {lessonMaterial.contents.map((para, i) => (
            <div key={i} style={styles.contentPara}>
              {para}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.previewCard}>
        <h4 style={{ color: "#555", marginBottom: "0.5rem" }}>📝 What's next:</h4>
        <p style={{ color: "#777", margin: 0 }}>
          1 practice activity + 1 mini assessment to test your understanding!
        </p>
      </div>

      <button style={styles.primaryBtn} onClick={() => setCurrentStep("activity")}>
        Let's Practice! 🚀
      </button>
    </div>
  );

  // ── STEP 2: Activity (shows instructions, then navigates to DragBoard) ──
  if (currentStep === "activity") return (
    <div style={styles.page}>
      <div style={{ ...styles.header, background: "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)" }}>
        <span style={{ fontSize: "2rem" }}>🏋️</span>
        <div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
            Practice Activity
          </p>
          <h2 style={{ margin: 0, color: "#fff", fontFamily: "Comic Sans MS, cursive" }}>
            {activity.name}
          </h2>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={{ color: "#4CAF50", marginBottom: "0.75rem" }}>📋 Your Mission</h4>
        <div style={styles.instructionBox}>
          <p style={{ margin: 0 }}>{activity.instructions}</p>
        </div>

        {activity.expectedOutput && (
          <div style={{ marginTop: "1rem" }}>
            <h5 style={{ color: "#E65100" }}>🎯 Expected Output:</h5>
            <pre style={styles.codeBlock}>{activity.expectedOutput}</pre>
          </div>
        )}

        {activity.dataTypesRequired?.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h5 style={{ color: "#5c6bc0" }}>🧩 Blocks you'll need:</h5>
            <div style={styles.blockTags}>
              {activity.dataTypesRequired.map((block, i) => (
                <span key={i} style={styles.blockTag}>{block}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {activity.hints?.length > 0 && (
        <div style={styles.hintsCard}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <h5 style={{ margin: 0, color: "#2E7D32" }}>
              💚 Hints ({revealedHints}/{activity.hints.length} unlocked)
            </h5>
            {revealedHints < activity.hints.length && (
              <button
                style={styles.hintBtn}
                onClick={() => setRevealedHints((p) => Math.min(p + 1, activity.hints.length))}
              >
                Unlock Hint!
              </button>
            )}
          </div>
          {revealedHints > 0 && (
            <ul style={{ paddingLeft: 0, listStyle: "none", marginTop: "0.75rem", marginBottom: 0 }}>
              {activity.hints.slice(0, revealedHints).map((hint, i) => (
                <li key={i} style={styles.hintItem}>
                  <span style={styles.hintNumber}>{i + 1}</span>
                  {hint}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ ...styles.infoBox, marginBottom: "1rem" }}>
        ⏱️ <strong>Time limit:</strong> {activity.timeLimit} seconds ({Math.floor(activity.timeLimit / 60)} minutes)
      </div>

      <button 
        style={styles.primaryBtn}
        onClick={() => {
          // ✅ Store activity data in localStorage so DragBoard can load it
          localStorage.setItem('ai-review-activity', JSON.stringify(activity));
          navigate(`/ai-activity/${lessonId}/review-activity`);
        }}
      >
        Start Activity! 🎯
      </button>
    </div>
  );

  // ── STEP 3: Assessment (shows instructions, then navigates to DragBoard) ──
  return (
    <div style={styles.page}>
      <div style={{ ...styles.header, background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
        <span style={{ fontSize: "2rem" }}>📝</span>
        <div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
            Mini Assessment
          </p>
          <h2 style={{ margin: 0, color: "#fff", fontFamily: "Comic Sans MS, cursive" }}>
            Let's Test Your Knowledge!
          </h2>
        </div>
      </div>

      <div style={styles.card}>
        <h4 style={{ color: "#f5576c", marginBottom: "1rem" }}>
          🎯 Ready to show what you learned?
        </h4>
        <p style={{ color: "#555", marginBottom: "1rem" }}>
          You'll get <strong>{assessmentQuestions.length} questions</strong> to test your understanding of {reviewMissingTypes?.join(", ")}.
        </p>
        <div style={styles.assessmentPreview}>
          {assessmentQuestions.map((q, i) => (
            <div key={i} style={styles.questionCard}>
              <div style={styles.questionBadge}>Question {i + 1} - {q.difficulty}</div>
              <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "#555" }}>
                {q.instructions.slice(0, 80)}...
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        style={styles.primaryBtn}
        onClick={() => {
          // ✅ Store assessment data in localStorage
          localStorage.setItem('ai-review-assessment', JSON.stringify({
            title: "Review Assessment",
            questions: assessmentQuestions,
            timeLimit: 300 // 5 minutes total
          }));
          navigate(`/ai-assessment/${lessonId}/review-assessment`);
        }}
      >
        Start Assessment! 📝
      </button>

      <button
        style={styles.secondaryBtn}
        onClick={() => navigate(`/lessons/${lessonId}`)}
      >
        Skip Assessment & Go Back
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════
const styles = {
  page: {
    maxWidth: "760px", margin: "0 auto", padding: "1.5rem",
    fontFamily: "'Comic Sans MS', cursive",
  },
  center: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", padding: "1rem",
  },
  loadingCard: {
    background: "#fff", borderRadius: "24px", padding: "3rem",
    textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px", padding: "1.5rem",
    display: "flex", alignItems: "center", gap: "1rem",
    marginBottom: "1rem", color: "#fff",
  },
  badge: {
    background: "#FFF3E0", border: "2px solid #FFE0B2",
    borderRadius: "12px", padding: "0.75rem 1rem",
    fontSize: "0.9rem", color: "#E65100", marginBottom: "1rem",
  },
  card: {
    background: "#fff", borderRadius: "20px", padding: "1.5rem",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)", marginBottom: "1rem",
  },
  overviewBox: {
    background: "#E8F5E9", borderRadius: "12px", padding: "1rem",
    border: "2px dashed #4CAF50",
  },
  contentPara: {
    background: "#F8F9FF", borderRadius: "12px", padding: "1rem",
    marginBottom: "0.75rem", border: "2px solid #E3F2FD",
    lineHeight: "1.7", color: "#333",
  },
  instructionBox: {
    background: "#FFF9E6", borderRadius: "12px", padding: "1rem",
    border: "3px dashed #FFC107", color: "#333",
  },
  codeBlock: {
    background: "#f4f4f4", padding: "12px", borderRadius: "8px",
    border: "2px dashed #FF9800", fontSize: "0.9rem",
    fontFamily: "monospace", color: "#333", overflowX: "auto",
  },
  blockTags: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "0.5rem" },
  blockTag: {
    background: "#E3F2FD", border: "2px solid #90CAF9",
    borderRadius: "20px", padding: "4px 14px",
    fontSize: "0.85rem", color: "#1565C0", fontWeight: "600",
  },
  hintsCard: {
    background: "#E8F5E9", border: "3px solid #4CAF50",
    borderRadius: "16px", padding: "1rem", marginBottom: "1rem",
  },
  hintBtn: {
    background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
    color: "#fff", border: "none", borderRadius: "20px",
    padding: "6px 14px", cursor: "pointer",
    fontFamily: "Comic Sans MS, cursive", fontWeight: "700", fontSize: "0.85rem",
  },
  hintItem: {
    background: "#fff", borderRadius: "8px", padding: "0.6rem 0.8rem",
    borderLeft: "4px solid #4CAF50", marginBottom: "0.5rem",
    display: "flex", alignItems: "center", gap: "0.75rem", color: "#333",
  },
  hintNumber: {
    background: "#4CAF50", color: "#fff", borderRadius: "50%",
    width: "22px", height: "22px", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: "bold", fontSize: "0.8rem", flexShrink: 0,
  },
  previewCard: {
    background: "#E8F5E9", border: "2px solid #A5D6A7",
    borderRadius: "16px", padding: "1rem", marginBottom: "1.5rem",
  },
  infoBox: {
    background: "#FFF8E1", border: "2px solid #FFE082",
    borderRadius: "12px", padding: "0.75rem",
    fontSize: "0.9rem", color: "#F57F17",
  },
  assessmentPreview: {
    display: "flex", flexDirection: "column", gap: "0.75rem",
  },
  questionCard: {
    background: "#F8F9FF", border: "2px solid #E3F2FD",
    borderRadius: "12px", padding: "0.75rem",
  },
  questionBadge: {
    display: "inline-block",
    background: "#f093fb", color: "#fff",
    borderRadius: "20px", padding: "4px 12px",
    fontSize: "0.75rem", fontWeight: "bold",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff", border: "none", borderRadius: "24px",
    padding: "0.9rem 2rem", fontWeight: "bold", cursor: "pointer",
    fontSize: "1rem", fontFamily: "Comic Sans MS, cursive",
    boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
    width: "100%", marginBottom: "0.75rem",
  },
  secondaryBtn: {
    background: "#eee", color: "#666", border: "2px solid #ccc",
    borderRadius: "24px", padding: "0.9rem 1.5rem",
    fontWeight: "bold", cursor: "pointer",
    fontSize: "0.95rem", fontFamily: "Comic Sans MS, cursive",
    width: "100%",
  },
};