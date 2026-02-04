// src/pages/user/LessonList.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner, ProgressBar } from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import TutorialModal from "../../component/TutorialModal";

function LessonList() {
  const { lessonId } = useParams();
  const [module, setModule] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [unlockedItems, setUnlockedItems] = useState(new Set());
  const navigate = useNavigate();

  const { user, loading: userLoading, refreshUser, isOnboardingIncomplete } =
    useContext(AuthContext);

  useEffect(() => {
    if (!userLoading && isOnboardingIncomplete) setShowTutorial(true);
  }, [userLoading, isOnboardingIncomplete]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?._id || user?.id;
      if (!userId) return;

      setLoadingData(true);
      try {
        const token = localStorage.getItem("token");
        const [moduleRes, materialsRes, assessmentsRes, progressRes] =
          await Promise.all([
            axios.get(`http://localhost:5000/api/lessons/${lessonId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(
              `http://localhost:5000/api/materials/lessons/${lessonId}/materials`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              `http://localhost:5000/api/assessments/lessons/${lessonId}/assessments`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              `http://localhost:5000/api/progress/${userId}/${lessonId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);

        setModule(moduleRes.data);
        const progress = progressRes.data || {};
        const completedMaterialIds =
          progress.completedMaterials?.map((m) => m._id) || [];
        const completedActivityIds =
          progress.completedActivities?.map((a) => a._id) || [];
        const completedAssessmentIds =
          progress.completedAssessments?.map((a) => a._id) || [];

        const activitiesByMaterial = {};
        for (const m of materialsRes.data) {
          const res = await axios.get(
            `http://localhost:5000/api/activities/materials/${m._id}/activities`,
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

  // Dynamic unlock calculation
 // Dynamic unlock calculation
useEffect(() => {
  const unlockItems = () => {
    const unlocked = new Set();
    if (!items.length) return;

    const lessons = items.filter(i => i.type === "lesson");
    const activitiesByMaterial = {};
    lessons.forEach(lesson => {
      activitiesByMaterial[lesson._id] = items.filter(a => a.type === "activity" && a.parentId === lesson._id);
    });
    const assessmentsItems = items.filter(i => i.type === "assessment");

    // Unlock first lesson
    if (lessons.length > 0) unlocked.add(lessons[0]._id);

    lessons.forEach((lesson, i) => {
      const activities = activitiesByMaterial[lesson._id] || [];

      // Unlock next lesson only if current lesson is completed
      if (lesson.isCompleted && i + 1 < lessons.length) {
        unlocked.add(lessons[i + 1]._id);
      }

      // Unlock activities only if the parent lesson is completed
      if (lesson.isCompleted) {
        activities.forEach((activity, j) => {
          // Unlock first activity
          if (j === 0) unlocked.add(activity._id);
          // Unlock next activity if previous completed
          else if (activities[j - 1].isCompleted) unlocked.add(activity._id);
        });
      }
    });

    // Unlock assessments if all lessons + activities completed
    const allLessonsCompleted = lessons.every(l => l.isCompleted);
    const allActivitiesCompleted = items.filter(i => i.type === "activity").every(a => a.isCompleted);

    if (allLessonsCompleted && allActivitiesCompleted) {
      assessmentsItems.forEach(a => unlocked.add(a._id));
    }

    setUnlockedItems(unlocked);
  };

  unlockItems();
}, [items]);


  const handleItemClick = async (item) => {
    const itemId = item._id || item.id;
    if (!itemId) return;

    if (item.type === "assessment") {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/assessments/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const assessment = res.data;
      const shuffled = [...assessment.questions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);

      navigate(`/lessons/${lessonId}/${itemId}`, {
        state: { assessment, questions: selected },
      });

    } else {
      navigate(`/lessons/${lessonId}/${itemId}`);
    }
  };

  if (userLoading || loadingData)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.isCompleted).length;
  const progressPercent = totalItems
    ? Math.round((completedItems / totalItems) * 100)
    : 0;

  const icons = {
    lesson: (
      <img
        src="/assets/images/book.png"
        alt="Lesson"
        style={{ width: "40px", height: "40px" }}
      />
    ),
    activity: (
      <img
        src="/assets/images/task.png"
        alt="Activity"
        style={{ width: "40px", height: "40px" }}
      />
    ),
    assessment: (
      <img
        src="/assets/images/assessment.png"
        alt="Assessment"
        style={{ width: "40px", height: "40px" }}
      />
    ),
  };

  const colors = {
    lesson: { bg: "#FFF4C1", border: "#FBC02D", text: "#F57C00" },
    activity: { bg: "#E3F2FD", border: "#42A5F5", text: "#1565C0" },
    assessment: { bg: "#E8F5E9", border: "#81C784", text: "#2E7D32" },
  };

  const lessonsAndActivities = items.filter(
    (i) => i.type === "lesson" || i.type === "activity"
  );
  const assessments = items.filter((i) => i.type === "assessment");

  return (
    <div
      style={{
        minHeight: "100%",
        background: "linear-gradient(180deg, #E0F7FA 0%, #FFF9F0 100%)",
        fontFamily: "'Comic Neue', 'Comic Sans MS', cursive",
        marginBottom: "-30px",
        paddingBottom: "10px"
      }}
    >
      {showTutorial && (
        <TutorialModal
          show={showTutorial}
          onClose={async () => {
            setShowTutorial(false);
            if (user?._id || user?.id)
              await refreshUser(user._id || user.id);
          }}
        />
      )}

      {/* HEADER */}
      <header
        className="d-flex align-items-center justify-content-between"
        style={{
          backgroundColor: "#4B8DF8",
          color: "white",
          padding: "1rem 2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderBottom: "4px solid #FFD54F",
        }}
      >
        <Button
          variant="warning"
          onClick={() => navigate("/module-list")}
          style={{
            fontWeight: "bold",
            borderRadius: "20px",
            background: "#FFD54F",
            border: "none",
            color: "#3C3C3C",
          }}
        >
          Back to Modules
        </Button>
        <div
          style={{
            flexGrow: 1,
            textAlign: "center",
            fontSize: "1.8rem",
            fontWeight: "bold",
          }}
        >
          {module?.title?.replace(/^Module\s*\d+:\s*/i, "")}
        </div>
      </header>

      {/* PROGRESS BAR */}
      <div className="text-center mt-3">
        <span className="fs-4" style={{ fontWeight: "bold", color: "#FF7043" }}>Progress</span>
        <ProgressBar
          now={progressPercent}
          label={`${progressPercent}%`}
          className="mx-auto"
          style={{
            width: "55%",
            height: "1.3rem",
            borderRadius: "10px",
            backgroundColor: "#FFD55C",
          }}
          variant="success"
        />
      </div>

      {/* MAIN CONTAINER */}
      <div
        className="p-4"
        style={{
          maxWidth: "850px",
          margin: "30px auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          border: "3px solid #e0e0e0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >

        {/* LESSONS + ACTIVITIES + ASSESSMENTS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "0",
          }}
        >
          <h3 className="my-3">Lessons</h3>

          {/* LESSONS + ACTIVITIES */}
          {lessonsAndActivities
            .filter((i) => i.type === "lesson")
            .map((lesson) => {
              const lessonStyle = colors.lesson;
              const relatedActivities = lessonsAndActivities.filter(
                (a) => a.type === "activity" && a.parentId === lesson._id
              );
              const isUnlocked = unlockedItems.has(lesson._id);

              return (
                <div
                  key={lesson._id}
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#ffffff",
                    marginBottom: "10px",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* LESSON BOX */}
                  <div
                    onClick={() => isUnlocked && handleItemClick(lesson)}
                    style={{
                      background: lessonStyle.bg,
                      padding: "1rem 1.2rem",
                      display: "flex",
                      alignItems: "center",
                      cursor: isUnlocked ? "pointer" : "not-allowed",
                      opacity: isUnlocked ? 1 : 0.5,
                      pointerEvents: isUnlocked ? "auto" : "none",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => isUnlocked && (e.currentTarget.style.background = "#ffecb3")}
                    onMouseLeave={(e) => e.currentTarget.style.background = lessonStyle.bg}
                  >
                    <div style={{ width: "55px", textAlign: "center", flexShrink: 0 }}>
                      {icons.lesson}
                      {!isUnlocked && <span role="img" aria-label="lock"> 🔒 </span>}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: lessonStyle.text,
                        }}
                      >
                        Lesson: {lesson.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: lesson.isCompleted ? "#4CAF50" : "#9E9E9E",
                        }}
                      >
                        {lesson.isCompleted ? "Completed" : "Tap to begin"}
                      </div>
                    </div>
                  </div>

                  {/* ACTIVITIES */}
                  {relatedActivities.map((activity) => {
                    const actStyle = colors.activity;
                    const isUnlocked = unlockedItems.has(activity._id);

                    return (
                      <div
                        key={activity._id}
                        onClick={() => isUnlocked && handleItemClick(activity)}
                        style={{
                          background: actStyle.bg,
                          padding: "0.9rem 1.2rem 0.9rem 3rem",
                          display: "flex",
                          alignItems: "center",
                          cursor: isUnlocked ? "pointer" : "not-allowed",
                          opacity: isUnlocked ? 1 : 0.5,
                          pointerEvents: isUnlocked ? "auto" : "none",
                          transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => isUnlocked && (e.currentTarget.style.background = "#d0e7ff")}
                        onMouseLeave={(e) => e.currentTarget.style.background = actStyle.bg}
                      >
                        <div style={{ width: "45px", textAlign: "center", flexShrink: 0 }}>
                          {icons.activity}
                          {!isUnlocked && <span role="img" aria-label="lock"> 🔒 </span>}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                              color: actStyle.text,
                            }}
                          >
                            Activity: {activity.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: activity.isCompleted ? "#4CAF50" : "#9E9E9E",
                            }}
                          >
                            {activity.isCompleted ? "Completed" : "Tap to begin"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

          {/* ASSESSMENT SECTION TITLE */}
          {assessments.length > 0 && <h3 className="my-3">Assessment Tasks</h3>}

          {/* ASSESSMENTS */}
          {assessments.map((item) => {
            const style = colors.assessment;
            const isUnlocked = unlockedItems.has(item._id);

            return (
              <div
                key={item._id}
                onClick={() => isUnlocked && handleItemClick(item)}
                style={{
                  background: style.bg,
                  borderRadius: "16px",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  opacity: isUnlocked ? 1 : 0.5,
                  pointerEvents: isUnlocked ? "auto" : "none",
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem 1.2rem",
                  margin: "0",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => isUnlocked && (e.currentTarget.style.background = "#d7f5dc")}
                onMouseLeave={(e) => e.currentTarget.style.background = style.bg}
              >
                <div style={{ width: "50px", textAlign: "center", flexShrink: 0 }}>
                  {icons.assessment}
                  {!isUnlocked && <span role="img" aria-label="lock"> 🔒 </span>}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: style.text,
                    }}
                  >
                    Assessment: {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: item.isCompleted ? "#4CAF50" : "#9E9E9E",
                    }}
                  >
                    {item.isCompleted ? "Completed" : "Tap to begin"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LessonList;
