import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";
import TutorialModal from "../../component/TutorialModal";

function HomePage() {
  const { user, refreshUser, loading, isOnboardingIncomplete } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isOnboardingIncomplete) setShowTutorial(true);
  }, [loading, isOnboardingIncomplete]);

  useEffect(() => {
    const startTimer = setTimeout(() => setAnimate(true), 200);
    const hideTimer = setTimeout(() => setShowSplash(false), 800);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleGetStarted = () => {
    navigate(user ? "/module-list" : "/register");
  };

  // ---------- Styles ----------
  const splashContainer = {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    display: "flex", justifyContent: "center", alignItems: "center",
    backgroundColor: "#fff", zIndex: 9999, overflow: "hidden",
  };

  const snakeImage = {
    height: animate ? "100vh" : "30vh",
    width: "auto",
    transition: "all .1s",
  };

  const pageStyle = {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "flex-start", minHeight: "100vh", width: "100%",
    overflowX: "hidden",
  };

  const combinedHero = {
    width: "100%", minHeight: "100vh", marginTop: "70px",
    position: "relative", display: "flex", justifyContent: "center",
    alignItems: "center", flexWrap: "wrap", padding: "50px 20px",
    backgroundColor: "#fff7ef", overflow: "hidden",
  };

  const operatorStyle = (top, left, size, rotate, opacity) => ({
    position: "absolute",
    top: top,
    left: left,
    width: size,
    transform: `rotate(${rotate}deg)`,
    opacity: opacity,
    zIndex: 1,
    filter: "drop-shadow(2px 2px 5px rgba(0,0,0,0.2))",
  });

  const contentContainer = {
    display: "flex", flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", alignItems: "center", gap: "30px",
    position: "relative", zIndex: 5, width: "100%",
  };

  const imageContainer = {
    position: "relative", width: "300px", maxWidth: "40vw",
    display: "flex", justifyContent: "center", alignItems: "center",
  };

  const blobStyle = {
    position: "absolute", width: "120%", height: "120%", zIndex: 1,
  };

  const leftKidStyle = {
    position: "relative", width: "105%", height: "auto", borderRadius: "65%", zIndex: 2, top: "-40px",
  };

  const rightKidStyle = {
    width: "105%", height: "auto", borderRadius: "20%", zIndex: 2,
  };

  const textContainer = {
    textAlign: "center", maxWidth: "500px", flex: "1 1 300px",
  };

  const learningTitleStyle = {
    fontSize: "2rem", fontWeight: "bold", color: "#222", marginBottom: "20px",
  };

  const learningSubtitleStyle = {
    fontSize: "1rem", color: "#444", marginBottom: "30px", lineHeight: 1.6,
  };

  const getStartedButton = {
    backgroundColor: "#222", color: "#fff", border: "none",
    padding: "15px 30px", borderRadius: "25px", cursor: "pointer", fontSize: "1rem",
  };

  const whySection = {
    backgroundColor: "rgba(148, 250, 146, 0.3)", textAlign: "center",
    padding: "50px 20px", width: "100%", display: "flex", flexDirection: "column",
    alignItems: "center",
  };

  const whyTitle = { fontSize: "2rem", color: "#222", marginBottom: "20px", fontWeight: "700" };
  const whySubtitle = { color: "#444", fontSize: "1rem", marginBottom: "50px" };

  const cardsContainer = {
    display: "flex", justifyContent: "center", alignItems: "flex-start",
    gap: "30px", flexWrap: "wrap",
  };

  const baseCard = {
    borderRadius: "10px", boxShadow: "5px 5px black",
    width: "280px", maxWidth: "90vw", padding: "20px", textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const cardImage = {
    width: "100%", height: "150px", objectFit: "contain",
    borderRadius: "15px", marginBottom: "15px", backgroundColor: "white", padding: "10px",
  };

  const cardTitle = { fontSize: "1.2rem", color: "#222", marginBottom: "8px" };
  const cardText = { fontSize: "1rem", color: "#333", lineHeight: 1.4 };

  const lowerCard = { marginTop: "20px" };
  const higherCard = { marginTop: "0px" };

  return (
    <>
      {showTutorial && (
        <TutorialModal
          show={showTutorial}
          onClose={async () => {
            setShowTutorial(false);
            if (user?._id) await refreshUser(user._id);
          }}
        />
      )}

      {showSplash && (
        <div style={splashContainer}>
          <img
            src="https://t4.ftcdn.net/jpg/14/21/34/09/360_F_1421340903_RFotJFnoo0bduRHcev5f4aLHwonagOxC.jpg"
            alt="Snake"
            style={snakeImage}
          />
        </div>
      )}

      <div style={pageStyle}>
        <NavbarComponent />

        {/* ---------- HERO SECTION ---------- */}
        <div style={combinedHero}>
          <style>
            {`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
              }
              .bounce { animation: bounce 2s infinite ease-in-out; }
            `}
          </style>

          {/* Operators */}
          <img src="/assets/images/add.png" style={operatorStyle("1%", "5%", "12%", 10, 0.15)} className="bounce" />
          <img src="/assets/images/subtract.png" style={operatorStyle("15%", "25%", "14%", -10, 0.12)} className="bounce" />
          <img src="/assets/images/divide.png" style={operatorStyle("70%", "1%", "12%", 20, 0.1)} className="bounce" />
          <img src="/assets/images/multiply.png" style={operatorStyle("70%", "30%", "11%", 0, 0.15)} className="bounce" />
          <img src="/assets/images/greaterthan.png" style={operatorStyle("15%", "65%", "14%", -10, 0.15)} className="bounce" />
          <img src="/assets/images/lessthan.png" style={operatorStyle("3%", "87%", "12%", 20, 0.12)} className="bounce" />
          <img src="/assets/images/!.png" style={operatorStyle("55%", "63%", "12%", -20, 0.1)} className="bounce" />
          <img src="/assets/images/diamond.png" style={operatorStyle("75%", "90%", "11%", 15, 0.12)} className="bounce" />

          {/* Hero content */}
          <div style={contentContainer}>
            <div style={imageContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 300" style={blobStyle}>
                <path d="M100 30 C150 0 250 0 290 60 C320 100 300 200 220 240 C150 250 70 240 10 160 C0 110 40 70 100 30 Z" fill="#F0597E" />
              </svg>
              <img src="/assets/images/kid2.jpg" alt="Left kid" style={leftKidStyle} />
            </div>

            <div style={textContainer}>
              <h1 style={learningTitleStyle}>Learn to Code the Fun Way with Little Coders!</h1>
              <p style={learningSubtitleStyle}>
                At Little Coders, kids explore programming through colorful images, interactive illustrations, and playful activities.
              </p>
              <button style={getStartedButton} onClick={handleGetStarted}>Get Started</button>
            </div>

            <div style={imageContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 300" style={blobStyle}>
                <path d="M100 30 C150 0 250 0 290 60 C320 120 300 200 220 240 C150 280 60 250 30 190 C0 120 40 70 100 30 Z" fill="#F0597E" />
              </svg>
              <img src="/assets/images/kid1.png" alt="Right kid" style={rightKidStyle} />
            </div>
          </div>
        </div>

        {/* ---------- WHY SECTION ---------- */}
        <section style={whySection}>
          <h2 style={whyTitle}>Why Teach Programming to Children</h2>
          <p style={whySubtitle}>Empowering young minds through creativity and logic</p>
          <div style={cardsContainer}>
            {[
              { img: "creativity.png", title: "Boosts Creativity", text: "Programming helps children express their imagination by building games and apps.", bg: "#b3e5fc", border: "#0288d1" },
              { img: "crit.png", title: "Improves Problem-Solving", text: "Kids learn to think logically and solve real-world problems step by step.", bg: "#fff9c4", border: "#fbc02d" },
              { img: "understanding1.png", title: "Prepares for the Future", text: "Learning to code gives children valuable skills that open doors to future careers.", bg: "#e1bee7", border: "#7b1fa2" }
            ].map((card, idx) => (
              <div key={idx} style={{
                ...baseCard,
                backgroundColor: card.bg,
                borderTop: `3px dashed ${card.border}`,
                borderLeft: `3px dashed ${card.border}`,
                marginTop: idx % 2 === 0 ? lowerCard.marginTop : higherCard.marginTop
              }}>
                <img src={`/assets/images/${card.img}`} alt={card.title} style={cardImage} />
                <h3 style={cardTitle}>{card.title}</h3>
                <p style={cardText}>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <UserFooter />
      </div>
    </>
  );
}

export default HomePage;
