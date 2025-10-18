import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import NavbarComponent from "../../component/userNavbar";
import "./moduleList.css";
import UserFooter from "../../component/userFooter";
import TutorialModal from "../../component/TutorialModal";
import { AuthContext } from "../../context/authContext";

function ModuleList() {
  const { user, refreshUser, loading: userLoading } = useContext(AuthContext); // ✅ renamed
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  // ✅ Show tutorial only if user hasn't completed onboarding
  useEffect(() => {
    if (!userLoading && user && user.hasCompletedOnboarding === false) {
      setShowTutorial(true);
    }
  }, [user, userLoading]);

  // ✅ Fetch modules
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

  const operatorPositions = [
    { src: "/assets/images/add.png", top: "10%", left: "8%", rotate: "-10deg" },
    { src: "/assets/images/subtract.png", top: "25%", left: "20%", rotate: "5deg" },
    { src: "/assets/images/divide.png", top: "60%", left: "10%", rotate: "15deg" },
    { src: "/assets/images/multiply.png", top: "15%", left: "80%", rotate: "-10deg" },
    { src: "/assets/images/greaterthan.png", top: "60%", left: "85%", rotate: "15deg" },
    { src: "/assets/images/lessthan.png", top: "30%", left: "65%", rotate: "-5deg" },
    { src: "/assets/images/!.png", top: "62%", left: "50%", rotate: "8deg" },
    { src: "/assets/images/diamond.png", top: "40%", left: "35%", rotate: "20deg" },
  ];

  if (loadingModules) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <>
      <NavbarComponent />

      {/* ✅ Tutorial modal controlled by MongoDB flag */}
      {showTutorial && (
        <TutorialModal
          show={showTutorial}
          onClose={async () => {
            setShowTutorial(false);
            if (user?._id) await refreshUser(user._id);
          }}
        />
      )}

      <div className="modules-container py-4">
        {/* ✅ HEADER */}
        <div className="modules-header position-relative d-flex justify-content-center align-items-center">
          {operatorPositions.map((op, index) => (
            <img
              key={index}
              src={op.src}
              alt="operator"
              style={{
                position: "absolute",
                top: op.top,
                left: op.left,
                width: "45px",
                opacity: 0.3,
                transform: `rotate(${op.rotate})`,
                filter: "drop-shadow(2px 2px 5px rgba(0,0,0,0.2))",
                zIndex: 1,
                userSelect: "none",
              }}
            />
          ))}
          <h1
            className="position-relative"
            style={{
              zIndex: 5,
              fontFamily: "'Poppins', sans-serif",
              color: "white",
              fontWeight: "300",
              fontSize: "80px",
            }}
          >
            Fun Learning For You
          </h1>
        </div>

        <div className="modules-list">
          {modules.map((module, index) => (
            <div
              key={module._id}
              className={`module-card ${index % 2 === 0 ? "down" : "up"}`}
              onClick={() => navigate(`/lessons/${module._id}`)}
            >
              <h3 className="module-header">{module.title}</h3>
              <button className="explore-btn">Explore</button>
            </div>
          ))}
        </div>
      </div>
      <UserFooter />
    </>
  );
}

export default ModuleList;
