import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spinner, Button } from "react-bootstrap";
import NavbarComponent from "../../component/userNavbar";
import "./moduleList.css";
import UserFooter from "../../component/userFooter";

function ModuleList() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Operator images with fixed positions
  const operatorPositions = [
    { src: "/assets/images/plus (2).png", top: "10%", left: "8%", rotate: "-10deg" },
    { src: "/assets/images/minus (2).png", top: "25%", left: "20%", rotate: "5deg" },
    { src: "/assets/images/division (2).png", top: "60%", left: "10%", rotate: "15deg" },
    { src: "/assets/images/multiply1.png", top: "15%", left: "80%", rotate: "-10deg" },
    { src: "/assets/images/greaterthan.png", top: "60%", left: "85%", rotate: "15deg" },
    { src: "/assets/images/lessthan.png", top: "30%", left: "65%", rotate: "-5deg" },
    { src: "/assets/images/!.png", top: "62%", left: "50%", rotate: "8deg" },
    { src: "/assets/images/diamond.png", top: "40%", left: "35%", rotate: "20deg" },
  ];

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
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <>
      <NavbarComponent />
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
                userSelect: 'none',
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
