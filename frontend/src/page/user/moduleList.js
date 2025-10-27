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
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!userLoading && user && user.hasCompletedOnboarding === false) {
      setShowTutorial(true);
    }
  }, [user, userLoading]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lessons", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModules(res.data);
      } catch (err) {
        console.error("Error fetching modules:", err);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  const handleClick = (module) => {
    navigate(`/lessons/${module._id}`);
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
        {/* 🎮 Floating Operators */}
        <div className="floating-operators">
          <img src="/assets/images/add.png" alt="Add" />
          <img src="/assets/images/subtract.png" alt="Subtract" />
          <img src="/assets/images/multiply.png" alt="Multiply" />
          <img src="/assets/images/divide.png" alt="Divide" />
          <img src="/assets/images/greaterthan.png" alt="Greater Than" />
          <img src="/assets/images/lessthan.png" alt="Less Than" />
        </div>

        <h1 className="modules-header">Modules</h1>

        {/* 📘 Module Cards */}
        <div className="modules-list-game">
          {modules.map((module, index) => (
            <div
              key={module._id}
              className="module-card-game"
              onClick={() => handleClick(module)}
            >
             <div className="card-img-wrapper">
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
                  />
                </div>

              <div className="card-content">
                <h3>{module.title}</h3>
                <p>
                  {module.description ||
                    "Embark on a new coding adventure and unlock your skills!"}
                </p>
              </div>
              <button className="start-btn">START</button>
            </div>
          ))}
        </div>
      </div>

      <UserFooter />
    </>
  );
}

export default ModuleList;
