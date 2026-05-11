import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarComponent from "../../component/userNavbar";
import "./moduleList.css";
import UserFooter from "../../component/userFooter";
import TutorialModal from "../../component/TutorialModal";
import { AuthContext } from "../../context/authContext";
import LoadingScreen from "../../component/LoadingScreen";
import { playLessonListSound, stopLessonListSound } from "../../utils/sfx";

// Island/world themes
const MODULE_THEMES = [
  {
    bg: "linear-gradient(135deg, #F4C56A 0%, #E8A020 100%)",
    badge: "#B8780A",
    glow: "rgba(240,180,50,0.5)",
    label: "World 1",
  },
  {
    bg: "linear-gradient(135deg, #E07070 0%, #B03030 100%)",
    badge: "#7A1A1A",
    glow: "rgba(200,60,60,0.5)",
    label: "World 2",
  },
  {
    bg: "linear-gradient(135deg, #7ABCE8 0%, #3A8AC0 100%)",
    badge: "#1A5C8A",
    glow: "rgba(60,140,200,0.5)",
    label: "World 3",
  },
  {
    bg: "linear-gradient(135deg, #6EC97A 0%, #2E8C40 100%)",
    badge: "#1A5C28",
    glow: "rgba(50,160,70,0.5)",
    label: "World 4",
  },
  {
    bg: "linear-gradient(135deg, #9B7AE8 0%, #5A2EC0 100%)",
    badge: "#3A1A8A",
    glow: "rgba(130,70,210,0.5)",
    label: "World 5",
  },
];

const MODULE_IMAGES = [
  "/assets/images/img.png",
  "/assets/images/module1.png",
  "/assets/images/module2.png",
  "/assets/images/module3.png",
  "/assets/images/module4.png",
];

// Dotted trail connector between islands
function TrailConnector({ completed }) {
  return (
    <div className={`island-arrow ${completed ? "arrow-done" : ""}`}>
      <div className="arrow-trail">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="trail-dot" />
        ))}
      </div>
    </div>
  );
}

// Individual island/module node
function IslandNode({ module, index, isLocked, isCompleted, onClick }) {
  const theme = MODULE_THEMES[index % MODULE_THEMES.length];
  const [bouncing, setBouncing] = useState(false);

  const handleClick = () => {
    if (!isLocked) {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 600);
      onClick(module);
    }
  };

  return (
    <div
      className={`island-node
        ${isLocked ? "island-locked" : "island-unlocked"}
        ${isCompleted ? "island-completed" : ""}
        ${bouncing ? "island-bounce" : ""}
      `}
      onClick={handleClick}
      style={{ "--glow": theme.glow }}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={`${theme.label}: ${module.title}${isLocked ? " (locked)" : isCompleted ? " (completed)" : ""}`}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* World label pill */}
      <div className="island-world-label" style={{ background: theme.badge }}>
        {theme.label}
      </div>

      {/* Island platform — blob shape */}
      <div className="island-platform" style={{ background: theme.bg }}>
        {isLocked && (
          <div className="island-lock-overlay">
            <div className="island-lock-icon">🔒</div>
            <span>LOCKED</span>
          </div>
        )}

        {isCompleted && (
          <div className="island-completed-stamp">✓</div>
        )}

        <div className="island-img-frame">
          <img
            src={MODULE_IMAGES[index % MODULE_IMAGES.length]}
            alt={module.title}
            style={{ opacity: isLocked ? 0.35 : 1 }}
          />
        </div>
      </div>

      {/* Parchment info card */}
      <div className="island-info">
        <h3 className="island-title">{module.title}</h3>
        <p className="island-desc">
          {module.description || "Unlock a new coding adventure!"}
        </p>
        <button
          className={`island-btn ${
            isLocked ? "btn-locked" : isCompleted ? "btn-replay" : "btn-start"
          }`}
          disabled={isLocked}
        >
          {isLocked ? "🔒 Locked" : isCompleted ? "↺ Replay" : "▶ Start!"}
        </button>
      </div>

      {/* Star rating */}
      {!isLocked && (
        <div
          className="island-stars-row"
          aria-label={isCompleted ? "Completed" : "Not yet completed"}
        >
          <span className={isCompleted ? "star-lit" : "star-dim"}>⭐</span>
          <span className={isCompleted ? "star-lit" : "star-dim"}>⭐</span>
          <span className={isCompleted ? "star-lit" : "star-dim"}>⭐</span>
        </div>
      )}
    </div>
  );
}

// SVG road drawn to exactly fit the islands row width
function MapRoad({ totalWidth, midY }) {
  if (totalWidth <= 0) return null;

  const w = totalWidth;
  const y = midY;
  // Gentle sine-like wave across the full content width
  const cp1 = Math.round(w * 0.2);
  const cp2 = Math.round(w * 0.35);
  const cp3 = Math.round(w * 0.5);
  const cp4 = Math.round(w * 0.65);
  const cp5 = Math.round(w * 0.8);

  const amplitude = 55;
  const d = `M 0 ${y}
    C ${cp1} ${y - amplitude}, ${cp2} ${y + amplitude}, ${cp3} ${y}
    C ${cp4} ${y - amplitude}, ${cp5} ${y + amplitude}, ${w} ${y}`;

  // Milestone x positions spaced along the path
  const milestones = [0, cp1, cp3, cp5, w].map((x) => Math.round(x));

  return (
    <svg
      className="map-road-svg"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }}
      viewBox={`0 0 ${w} ${midY * 2}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <path d={d} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="22" strokeLinecap="round" />
      {/* Main road */}
      <path d={d} fill="none" stroke="#c8a84b" strokeWidth="16" strokeLinecap="round" />
      {/* Centre dashes */}
      <path d={d} fill="none" stroke="#f5e6c8" strokeWidth="4" strokeLinecap="round" strokeDasharray="18 14" opacity="0.6" />
      {/* Milestone dots */}
      {milestones.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={9} fill="#c8a84b" opacity="0.55" />
          <circle cx={x} cy={y} r={5} fill="#f5e6c8" opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

function ModuleList() {
  const { user, refreshUser, loading: userLoading } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [unlockedLessons, setUnlockedLessons] = useState(new Set());
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [rowSize, setRowSize] = useState({ width: 0, height: 0 });
  const rowRef = useRef(null);
  const navigate = useNavigate();

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

  // Measure the islands-row after render so the SVG fits exactly
  useEffect(() => {
    if (!rowRef.current) return;
    const measure = () => {
      if (!rowRef.current) return;

      const rect = rowRef.current.getBoundingClientRect();
      if (!rect) return;

      setRowSize({
        width: Math.round(rect.width || 0),
        height: Math.round(rect.height || 0),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(rowRef.current);
    return () => ro.disconnect();
  }, [modules]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 200);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!userLoading && user && user.hasCompletedOnboarding === false) {
      setShowTutorial(true);
    }
  }, [user, userLoading]);

  const fetchModulesAndStatus = async () => {
    const userId = user?._id;
    const childId = getChildId();
    if (!userId || !childId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://little-coders-backend.onrender.com/api/lessons",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sortedModules = res.data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setModules(sortedModules);
      await checkUnlockAndCompletionStatus(sortedModules, userId, childId, token);
    } catch (err) {
      console.error("Error fetching modules:", err);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => { fetchModulesAndStatus(); }, [user]);

  useEffect(() => {
    const handleFocus = () => fetchModulesAndStatus();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const checkUnlockAndCompletionStatus = async (lessons, userId, childId, token) => {
    try {
      const unlocked = new Set();
      const completed = new Set();

      if (lessons.length > 0) unlocked.add(lessons[0]._id);

      const unlockPromises = lessons.map((lesson) =>
        axios
          .get(`https://little-coders-backend.onrender.com/api/progress/check-unlock`, {
            params: { userId, childId, itemType: "lesson", itemId: lesson._id },
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => ({ lessonId: lesson._id, isUnlocked: res.data.isUnlocked }))
          .catch(() => ({ lessonId: lesson._id, isUnlocked: false }))
      );

      const progressPromises = lessons.map((lesson) =>
        axios
          .get(
            `https://little-coders-backend.onrender.com/api/progress/${userId}/${childId}/${lesson._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => ({ lessonId: lesson._id, isCompleted: res.data?.isLessonCompleted || false }))
          .catch(() => ({ lessonId: lesson._id, isCompleted: false }))
      );

      const [unlockResults, progressResults] = await Promise.all([
        Promise.all(unlockPromises),
        Promise.all(progressPromises),
      ]);

      unlockResults.forEach((r) => { if (r.isUnlocked) unlocked.add(r.lessonId); });
      progressResults.forEach((r) => { if (r.isCompleted) completed.add(r.lessonId); });

      setUnlockedLessons(unlocked);
      setCompletedLessons(completed);
    } catch (err) {
      console.error("Error checking unlock/completion status:", err);
    }
  };

  const handleClick = (module) => {
    if (unlockedLessons.has(module._id)) {
      navigate(`/lessons/${module._id}`);
    }
  };

  if (loading) return <LoadingScreen fadeOut={fadeOut} />;

  const completedCount = modules.filter((m) => completedLessons.has(m._id)).length;
  const totalCount = modules.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // The road mid-Y sits at the vertical centre of the platform (~half the platform height + label + padding)
  const roadMidY = Math.round(rowSize.height * 0.22);

  return (
    <>
      <NavbarComponent />

      {showTutorial && (
        <TutorialModal
          show={showTutorial}
          onClose={async () => {
            setShowTutorial(false);
            if (user?._id) await refreshUser(user._id);
          }}
        />
      )}

      <div className="map-page">
        <div className="map-sky" aria-hidden="true" />
        <div className="map-grid" aria-hidden="true" />

        {/* Header */}
        <div className="map-header-banner">
          <div className="map-header-inner">
            <div className="map-header-left">
              <div className="map-header-icon">🗺️</div>
              <div>
                <h1 className="map-title">World Map</h1>
                <p className="map-subtitle">Choose your adventure</p>
              </div>
            </div>
            <div className="map-header-right">
              <div className="map-progress-box">
                <span className="map-progress-label">
                  ⭐ {completedCount} / {totalCount} Worlds Cleared
                </span>
                <div className="map-progress-bar">
                  <div className="map-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="map-progress-pct">{progressPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map world — scrollable container */}
        <div className="map-world">
          {/* Islands row — road SVG is absolutely inside this */}
          <div className="islands-row" ref={rowRef}>
            {/* Road drawn to fit exactly this row */}
            <MapRoad totalWidth={rowSize.width} midY={roadMidY} />

            {modules.map((module, index) => {
              const isLocked = !unlockedLessons.has(module._id);
              const isCompleted = completedLessons.has(module._id);
              return (
                <React.Fragment key={module._id}>
                  <IslandNode
                    module={module}
                    index={index}
                    isLocked={isLocked}
                    isCompleted={isCompleted}
                    onClick={handleClick}
                  />
                  {index < modules.length - 1 && (
                    <TrailConnector completed={isCompleted} />
                  )}
                </React.Fragment>
              );
            })}

          </div>
        </div>

      </div>

      <UserFooter />
    </>
  );
}

export default ModuleList;