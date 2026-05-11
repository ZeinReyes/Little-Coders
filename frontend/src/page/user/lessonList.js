import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import TutorialModal from "../../component/TutorialModal";
import { playLessonListSound, stopLessonListSound } from "../../utils/sfx";
import "./lessonList.css";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const TYPE_META = {
  lesson: {
    btnClass: "lbtn-lesson",
    labelClass: "label-lesson",
    pillClass: "pill-lesson",
    pillText: "Lesson",
    icon: "📖",
  },
  activity: {
    btnClass: "lbtn-activity",
    labelClass: "label-activity",
    pillClass: "pill-activity",
    pillText: "Activity",
    icon: "🎮",
  },
  assessment: {
    btnClass: "lbtn-assessment",
    labelClass: "label-assessment",
    pillClass: "pill-assessment",
    pillText: "Assessment",
    icon: "⚔️",
  },
};

// Zigzag positions for the level path
const POSITIONS = ["left", "center", "right", "center"];

// ─────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────
function StarRow({ completed }) {
  return (
    <div className="star-row" aria-label={completed ? "Completed" : "Not completed"}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={completed ? "s-lit" : "s-dim"} aria-hidden="true">
          ⭐
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SEQUENTIAL CONNECTOR WITH ARROW
//
// viewBox is 100 × 60 with preserveAspectRatio="none"
// so x values are literal percentages of the container width.
//
// Node centres as % of screen width:
//   left   → padding-left:40px + half button ~42px  ≈  8%
//   center → 50%
//   right  → 100% - 40px - 42px                     ≈ 92%
//
// vectorEffect="non-scaling-stroke" keeps stroke widths
// from being stretched by the non-uniform scaling.
// ─────────────────────────────────────────────
const POS_TO_PCT = { left: 8, center: 50, right: 92 };

function DiagonalConnector({ fromPos, toPos, isDone }) {
  // x in viewBox units = % of width (viewBox width = 100)
  const x1 = POS_TO_PCT[fromPos] ?? 50;
  const x2 = POS_TO_PCT[toPos]   ?? 50;
  // y: start near top, end near bottom of the 60-unit tall box
  const y1 = 4;
  const y2 = 56;

  const color = isDone ? "#FFD700" : "rgba(255,255,255,0.28)";

  return (
  <div className="level-connector" aria-hidden="true">
    <svg
      className="connector-svg"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "60px", display: "block" }}
    >
      {/* Arrow definition */}
      <defs>
        <marker
          id={`arrow-${fromPos}-${toPos}-${isDone}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>

      {/* Glow behind shaft */}
      {isDone && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#FFD700"
          strokeWidth="4"
          strokeDasharray="5,4"
          strokeLinecap="round"
          opacity="0.2"
          vectorEffect="non-scaling-stroke"
          markerEnd={`url(#arrow-${fromPos}-${toPos}-${isDone})`}
        />
      )}

      {/* Main dashed shaft */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="5,4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        markerEnd={`url(#arrow-${fromPos}-${toPos}-${isDone})`}
      />

      {/* Travelling dot */}
      {isDone && (
        <circle
          r="2"
          fill="#FFD700"
          opacity="0.95"
          vectorEffect="non-scaling-stroke"
        >
          <animateMotion
            dur="1.2s"
            repeatCount="indefinite"
            path={`M${x1},${y1} L${x2},${y2}`}
          />
        </circle>
      )}
    </svg>
  </div>
);
}

// ─────────────────────────────────────────────
// SINGLE LEVEL NODE
// ─────────────────────────────────────────────
const LevelNode = React.forwardRef(function LevelNode(
  { item, index, isUnlocked, isCurrent, isAssessment, onClick },
  ref
) {
  const isLocked = !isUnlocked;
  const isDone   = item.isCompleted;
  const meta     = TYPE_META[item.type] || TYPE_META.lesson;

  const handleClick = () => {
    if (isUnlocked) onClick(item);
  };

  const shortNum =
    item.type === "assessment"
      ? "BOSS"
      : item.type === "activity"
      ? `A${index + 1}`
      : `L${index + 1}`;

  return (
    <div
      ref={ref}
      className="level-node"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="level-num-tag">{shortNum}</div>

      <div
        className={`level-btn ${isLocked ? "lbtn-locked" : meta.btnClass} ${isDone ? "done" : ""} ${isCurrent ? "current-level" : ""}`}
        onClick={handleClick}
        role="button"
        tabIndex={isLocked ? -1 : 0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label={`${meta.pillText}: ${item.title || item.name}${isLocked ? " (locked)" : isDone ? " (completed)" : ""}`}
      >
        {isAssessment && !isLocked && (
          <div className="boss-badge">⚔️ BOSS</div>
        )}

        <span className="level-icon" aria-hidden="true">
          {isLocked ? "🔒" : meta.icon}
        </span>

        {isDone && (
          <>
            <div className="done-ring" aria-hidden="true" />
            <div className="done-check" aria-hidden="true">✅</div>
          </>
        )}
      </div>

      <div className={`level-label ${isLocked ? "label-locked" : meta.labelClass}`}>
        {item.title || item.name}
      </div>

      <div className={`type-pill ${isLocked ? "pill-locked" : meta.pillClass}`}>
        {meta.pillText}
      </div>

      {isUnlocked && <StarRow completed={isDone} />}
    </div>
  );
});

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function LessonList() {
  const { lessonId } = useParams();
  const [module, setModule]               = useState(null);
  const [items, setItems]                 = useState([]);
  const [loadingData, setLoadingData]     = useState(true);
  const [showTutorial, setShowTutorial]   = useState(false);
  const [unlockedItems, setUnlockedItems] = useState(new Set());
  const navigate = useNavigate();

  const { user, loading: userLoading, refreshUser, isOnboardingIncomplete } =
    useContext(AuthContext);

  const getChildId = () => {
    try {
      const raw = sessionStorage.getItem("activeChild");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed._id || parsed.id || null;
    } catch {
      return null;
    }
  };

  // ── Audio ──────────────────────────────────
  useEffect(() => {
    const unlockAudio = () => {
      playLessonListSound();
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      stopLessonListSound();
    };
  }, []);

  // ── Tutorial ──────────────────────────────
  useEffect(() => {
    if (!userLoading && isOnboardingIncomplete) setShowTutorial(true);
  }, [userLoading, isOnboardingIncomplete]);

  // ── Fetch data ────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      const userId  = user?._id || user?.id;
      const childId = getChildId();
      if (!userId || !childId) return;

      setLoadingData(true);
      try {
        const token = localStorage.getItem("token");
        const [moduleRes, materialsRes, assessmentsRes, progressRes] = await Promise.all([
          axios.get(`https://little-coders-backend.onrender.com/api/lessons/${lessonId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `https://little-coders-backend.onrender.com/api/materials/lessons/${lessonId}/materials`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://little-coders-backend.onrender.com/api/assessments/lessons/${lessonId}/assessments`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://little-coders-backend.onrender.com/api/progress/${userId}/${childId}/${lessonId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setModule(moduleRes.data);
        const progress = progressRes.data || {};
        const completedMaterialIds   = progress.completedMaterials?.map((m) => m._id) || [];
        const completedActivityIds   = progress.completedActivities?.map((a) => a._id) || [];
        const completedAssessmentIds = progress.completedAssessments?.map((a) => a._id) || [];

        const activitiesByMaterial = {};
        for (const m of materialsRes.data) {
          const res = await axios.get(
            `https://little-coders-backend.onrender.com/api/activities/materials/${m._id}/activities`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          activitiesByMaterial[m._id] = res.data || [];
        }

        const structuredItems = [];
        for (const m of materialsRes.data) {
          structuredItems.push({
            ...m,
            type: "lesson",
            isCompleted: completedMaterialIds.includes(m._id),
          });
          (activitiesByMaterial[m._id] || []).forEach((a) => {
            structuredItems.push({
              ...a,
              type: "activity",
              parentId: m._id,
              isCompleted: completedActivityIds.includes(a._id),
            });
          });
        }

        const assessments = (assessmentsRes.data || []).map((a) => ({
          ...a,
          type: "assessment",
          isCompleted: completedAssessmentIds.includes(a._id),
        }));

        setItems([...structuredItems, ...assessments]);
      } catch (err) {
        console.error("Error fetching lesson data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    if (!userLoading && user) fetchData();
  }, [lessonId, user, userLoading]);

  // ── Dynamic unlock ────────────────────────
  useEffect(() => {
    const unlocked = new Set();
    if (!items.length) return;

    const lessons = items.filter((i) => i.type === "lesson");
    const activitiesByMaterial = {};
    lessons.forEach((lesson) => {
      activitiesByMaterial[lesson._id] = items.filter(
        (a) => a.type === "activity" && a.parentId === lesson._id
      );
    });
    const assessmentsItems = items.filter((i) => i.type === "assessment");

    if (lessons.length > 0) unlocked.add(lessons[0]._id);

    lessons.forEach((lesson, i) => {
      const activities        = activitiesByMaterial[lesson._id] || [];
      const allActivitiesDone =
        activities.length === 0 || activities.every((a) => a.isCompleted);

      if (lesson.isCompleted && allActivitiesDone && i + 1 < lessons.length) {
        unlocked.add(lessons[i + 1]._id);
      }

      if (lesson.isCompleted) {
        activities.forEach((activity, j) => {
          if (j === 0) unlocked.add(activity._id);
          else if (activities[j - 1].isCompleted) unlocked.add(activity._id);
        });
      }
    });

    const allLessonsCompleted    = lessons.every((l) => l.isCompleted);
    const allActivitiesCompleted = items
      .filter((i) => i.type === "activity")
      .every((a) => a.isCompleted);

    if (allLessonsCompleted && allActivitiesCompleted) {
      assessmentsItems.forEach((a) => unlocked.add(a._id));
    }

    setUnlockedItems(unlocked);
  }, [items]);

  // ── Navigation ────────────────────────────
  const handleItemClick = async (item) => {
    const itemId = item._id || item.id;
    if (!itemId) return;

    if (item.type === "assessment") {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://little-coders-backend.onrender.com/api/assessments/${itemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const assessment = res.data;
        navigate(`/lessons/${lessonId}/${itemId}`, {
          state: { assessment, questions: assessment.questions },
        });
      } catch (err) {
        console.error("Failed to load assessment:", err);
      }
    } else {
      navigate(`/lessons/${lessonId}/${itemId}`);
    }
  };

  // ── Loading state ─────────────────────────
  if (userLoading || loadingData) {
    return (
      <div className="level-loading">
        <div className="loading-orb">
          <Spinner animation="border" variant="warning" />
        </div>
        <p className="loading-text">Loading levels…</p>
      </div>
    );
  }

  // ── Derived values ────────────────────────
  const totalItems      = items.length;
  const completedItems  = items.filter((i) => i.isCompleted).length;
  const progressPercent = totalItems
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const currentItemId = items.find(
    (item) => unlockedItems.has(item._id) && !item.isCompleted
  )?._id;

  const assessmentItems = items.filter((i) => i.type === "assessment");
  const nonAssessment   = items.filter((i) => i.type !== "assessment");
  const allLevels       = [...nonAssessment, ...assessmentItems];

  const lessonCounter = { lesson: 0, activity: 0, assessment: 0 };
  const worldName = module?.title?.replace(/^Module\s*\d+:\s*/i, "") || "World";

  return (
    <div className="level-page">
      {/* Starfield */}
      <div className="level-stars" aria-hidden="true">
        {Array.from({ length: 70 }).map((_, i) => (
          <div
            key={i}
            className="star-dot"
            style={{
              width:  `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left:   `${Math.random() * 100}%`,
              top:    `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay:    `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {showTutorial && (
        <TutorialModal
          show={showTutorial}
          onClose={async () => {
            setShowTutorial(false);
            if (user?._id || user?.id) await refreshUser(user._id || user.id);
          }}
        />
      )}

      {/* HEADER */}
      <header className="level-header">
        <button className="level-back-btn" onClick={() => navigate("/module-list")}>
          ← Worlds
        </button>
        <div className="level-header-title">
          <span className="level-header-world">{worldName}</span>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="level-progress-section">
        <div className="level-progress-labels">
          <span>⚡ Level Progress</span>
          <span className="prog-count">{completedItems} / {totalItems} done</span>
        </div>
        <div className="level-progress-track">
          <div className="level-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="level-progress-milestones">
          <span className={`milestone ${progressPercent > 0 ? "reached" : ""}`}>⭐ Start</span>
          <span className={`milestone ${progressPercent >= 25 ? "reached" : ""}`}>⭐ 25%</span>
          <span className={`milestone ${progressPercent >= 50 ? "reached" : ""}`}>🏅 Half</span>
          <span className={`milestone ${progressPercent >= 75 ? "reached" : ""}`}>🏅 75%</span>
          <span className={`milestone ${progressPercent >= 100 ? "reached" : ""}`}>🏆 Done!</span>
        </div>
      </div>

      {/* LEVEL PATH */}
      <div className="level-path" role="list" aria-label="Lesson levels">
        {allLevels.map((item, index) => {
          lessonCounter[item.type] = (lessonCounter[item.type] || 0) + 1;
          const pos     = POSITIONS[index % POSITIONS.length];
          const prevPos = index > 0 ? POSITIONS[(index - 1) % POSITIONS.length] : pos;
          const isUnlocked = unlockedItems.has(item._id);
          const isCurrent  = item._id === currentItemId;
          const prevDone   = index > 0 && allLevels[index - 1].isCompleted;

          return (
            <React.Fragment key={item._id}>
              {index > 0 && (
                <DiagonalConnector
                  fromPos={prevPos}
                  toPos={pos}
                  isDone={prevDone}
                />
              )}

              <div className={`level-row level-row-${pos}`} role="listitem">
                <LevelNode
                  item={item}
                  index={lessonCounter[item.type] - 1}
                  isUnlocked={isUnlocked}
                  isCurrent={isCurrent}
                  isAssessment={item.type === "assessment"}
                  onClick={handleItemClick}
                />
              </div>
            </React.Fragment>
          );
        })}

        {/* Trophy end marker */}
        {allLevels.length > 0 && (
          <>
            <DiagonalConnector
              fromPos={POSITIONS[(allLevels.length - 1) % POSITIONS.length]}
              toPos="center"
              isDone={allLevels[allLevels.length - 1]?.isCompleted}
            />
            <div className="level-row level-row-center" aria-label="World complete!">
              <div className="trophy-end">
                <div className="trophy-glow" aria-hidden="true" />
                <span className="trophy-emoji" aria-hidden="true">🏆</span>
                <span className="trophy-text">WORLD CLEAR!</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* LEGEND */}
      <div className="level-legend" aria-label="Level type legend">
        <div className="leg-item">
          <div className="leg-dot leg-lesson" />
          <span>Lesson</span>
        </div>
        <div className="leg-item">
          <div className="leg-dot leg-activity" />
          <span>Activity</span>
        </div>
        <div className="leg-item">
          <div className="leg-dot leg-assessment" />
          <span>Assessment</span>
        </div>
      </div>
    </div>
  );
}

export default LessonList;