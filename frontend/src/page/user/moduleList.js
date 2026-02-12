import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarComponent from "../../component/userNavbar";
import "./moduleList.css";
import UserFooter from "../../component/userFooter";
import TutorialModal from "../../component/TutorialModal";
import { AuthContext } from "../../context/authContext";
import LoadingScreen from "../../component/LoadingScreen";

function ModuleList() {
  const { user, refreshUser, loading: userLoading } = useContext(AuthContext);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [unlockedLessons, setUnlockedLessons] = useState(new Set());
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const navigate = useNavigate();

  // Splash fade effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 200);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Show tutorial if user hasn't completed onboarding
  useEffect(() => {
    if (!userLoading && user && user.hasCompletedOnboarding === false) {
      setShowTutorial(true);
    }
  }, [user, userLoading]);

  // Fetch modules from backend
  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (!user?._id) return;
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lessons", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Sort lessons by order
        const sortedModules = res.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setModules(sortedModules);

        // ✅ OPTIMIZED: Check unlock/completion status in parallel
        await checkUnlockAndCompletionStatus(sortedModules, user._id, token);
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchModules();
  }, [user]);

  // ✅ OPTIMIZED: Use Promise.all to make all API calls in parallel
  const checkUnlockAndCompletionStatus = async (lessons, userId, token) => {
    try {
      const unlocked = new Set();
      const completed = new Set();

      // First lesson always unlocked
      if (lessons.length > 0) {
        unlocked.add(lessons[0]._id);
      }

      // ✅ Create all API calls as promises (they execute in parallel)
      const unlockPromises = lessons.map((lesson) =>
        axios
          .get(`http://localhost:5000/api/progress/check-unlock`, {
            params: { userId, itemType: "lesson", itemId: lesson._id },
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => ({ lessonId: lesson._id, isUnlocked: res.data.isUnlocked }))
          .catch((err) => {
            console.error(`Error checking unlock for ${lesson._id}:`, err);
            return { lessonId: lesson._id, isUnlocked: false };
          })
      );

      const progressPromises = lessons.map((lesson) =>
        axios
          .get(`http://localhost:5000/api/progress/${userId}/${lesson._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => ({
            lessonId: lesson._id,
            isCompleted: res.data?.isLessonCompleted || false,
          }))
          .catch((err) => {
            console.error(`Error checking progress for ${lesson._id}:`, err);
            return { lessonId: lesson._id, isCompleted: false };
          })
      );

      // ✅ Wait for all API calls to complete simultaneously
      const [unlockResults, progressResults] = await Promise.all([
        Promise.all(unlockPromises),
        Promise.all(progressPromises),
      ]);

      // Process unlock results
      unlockResults.forEach((result) => {
        if (result.isUnlocked) {
          unlocked.add(result.lessonId);
        }
      });

      // Process completion results
      progressResults.forEach((result) => {
        if (result.isCompleted) {
          completed.add(result.lessonId);
        }
      });

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

      <div className="module-page">
        <div className="floating-operators">
          <img src="/assets/images/add.png" alt="Add" />
          <img src="/assets/images/subtract.png" alt="Subtract" />
          <img src="/assets/images/multiply.png" alt="Multiply" />
          <img src="/assets/images/divide.png" alt="Divide" />
          <img src="/assets/images/greaterthan.png" alt="Greater Than" />
          <img src="/assets/images/lessthan.png" alt="Less Than" />
        </div>

        <h1 className="modules-header">Modules</h1>

        <div className="modules-list-game">
          {modules.map((module, index) => {
            const isLocked = !unlockedLessons.has(module._id);
            const isCompleted = completedLessons.has(module._id);

            return (
              <div
                key={module._id}
                className={`module-card-game ${isLocked ? "locked" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => handleClick(module)}
                style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
              >
                {/* Completion Badge */}
                {isCompleted && (
                  <div className="completion-badge">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>COMPLETED</span>
                  </div>
                )}

                <div className="card-img-wrapper">
                  {isLocked && (
                    <div className="lock-overlay">
                      <i className="bi bi-lock-fill" style={{ fontSize: "3rem", color: "#fff" }}></i>
                    </div>
                  )}
                  <img
                    src={
                      index === 0
                        ? "/assets/images/img.png"
                        : index === 1
                        ? "/assets/images/module1.png"
                        : index === 2
                        ? "/assets/images/module2.png"
                        : index === 3
                        ? "/assets/images/module3.png"
                        : "/assets/images/module4.png"
                    }
                    alt={module.title}
                    style={{ opacity: isLocked ? 0.5 : 1 }}
                  />
                </div>

                <div className="card-content">
                  <h3>{module.title}</h3>
                  <p>
                    {module.description || "Embark on a new coding adventure and unlock your skills!"}
                  </p>
                </div>

                <button
                  className="start-btn"
                  disabled={isLocked}
                  style={{ opacity: isLocked ? 0.6 : 1, cursor: isLocked ? "not-allowed" : "pointer" }}
                >
                  {isLocked ? (
                    <>
                      <i className="bi bi-lock-fill me-2"></i>LOCKED
                    </>
                  ) : isCompleted ? (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>REPLAY
                    </>
                  ) : (
                    "START"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <UserFooter />
    </>
  );
}

export default ModuleList;