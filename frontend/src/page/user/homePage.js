// ✅ src/page/user/homePage.js
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";
import TutorialModal from "../../component/TutorialModal";
import LoadingScreen from "../../component/LoadingScreen"; // ✅ Added loading screen

function HomePage() {
  const { user, refreshUser, loading: authLoading, isOnboardingIncomplete } =
    useContext(AuthContext);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  // ✅ LoadingScreen states
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // ✅ Run loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 800); // fade duration
    }, 1200); // show loading for 1.2s
    return () => clearTimeout(timer);
  }, []);

  // ✅ Handle tutorial popup
  useEffect(() => {
    if (!authLoading && isOnboardingIncomplete) setShowTutorial(true);
  }, [authLoading, isOnboardingIncomplete]);

  const handleGetStarted = () => {
    navigate(user ? "/module-list" : "/register");
  };

  // ---------- STYLES ----------
  const pageStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100vh",
    width: "100%",
    overflowX: "hidden",
  };

  const combinedHero = {
    width: "100%",
    minHeight: "93.5vh",
    marginTop: "70px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "50px 20px",
    backgroundColor: "#FFF2CC",
    overflow: "hidden",
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
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "30px",
    position: "relative",
    zIndex: 5,
    width: "100%",
  };

  const imageContainer = {
    position: "relative",
    width: "300px",
    maxWidth: "40vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const blobStyle = {
    position: "absolute",
    width: "120%",
    height: "120%",
    zIndex: 1,
  };

  const leftKidStyle = {
    position: "relative",
    width: "105%",
    height: "auto",
    borderRadius: "65%",
    zIndex: 2,
    top: "-40px",
  };

  const rightKidStyle = {
    width: "105%",
    height: "auto",
    borderRadius: "20%",
    zIndex: 2,
  };

  const textContainer = {
    textAlign: "center",
    maxWidth: "700px",
    flex: "1 1 300px",
    marginTop: "-115px",
  };

  const learningTitleStyle = {
    fontSize: "56px",
    fontWeight: "bold",
    color: "#222",
    marginBottom: "20px",
  };

  const learningSubtitleStyle = {
    fontSize: "1rem",
    color: "#444",
    marginBottom: "30px",
    lineHeight: 1.6,
  };

  const getStartedButton = {
    backgroundColor: "#ffdd57",
    color: "#111",
    border: "none",
    padding: "15px 30px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1rem",
  };

  const whySection = {
    backgroundColor: "#94fa92",
    textAlign: "center",
    padding: "70px 20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "93.5vh",
  };

  const whyTitle = {
    fontSize: "2.5rem",
    color: "#222",
    marginBottom: "20px",
    fontWeight: "700",
  };

  const whySubtitle = {
    color: "#444",
    fontSize: "1.3rem",
    marginBottom: "50px",
  };

  const cardsContainer = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "100px",
    flexWrap: "wrap",
  };

  const baseCard = {
    borderRadius: "10px",
    boxShadow: "5px 5px black",
    width: "380px",
    maxWidth: "90vw",
    padding: "20px",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const cardImage = {
    width: "100%",
    height: "150px",
    objectFit: "contain",
    borderRadius: "15px",
    marginBottom: "15px",
    backgroundColor: "white",
    padding: "10px",
  };

  const cardTitle = { fontSize: "1.2rem", color: "#222", marginBottom: "8px" };
  const cardText = { fontSize: "1rem", color: "#333", lineHeight: 1.4 };
  const lowerCard = { marginTop: "20px" };
  const higherCard = { marginTop: "0px" };

  return (
    <>
      {/* ✅ LoadingScreen rendered safely without breaking Hook rules */}
      {loading ? (
        <LoadingScreen fadeOut={fadeOut} />
      ) : (
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

              {/* Floating icons */}
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
                    <path
                      d="M100 30 C150 0 250 0 290 60 C320 100 300 200 220 240 C150 250 70 240 10 160 C0 110 40 70 100 30 Z"
                      fill="#F0597E"
                    />
                  </svg>
                  <img src="/assets/images/kid2.jpg" alt="Left kid" style={leftKidStyle} />
                </div>

                <div style={textContainer}>
                  <h1 style={learningTitleStyle}>Learn to Code the Fun Way with Little Coders!</h1>
                  <p style={learningSubtitleStyle}>
                    At Little Coders, children explore programming through colorful illustrations,
                    interactive activities, and playful lessons designed to make learning fun and spark creativity.
                  </p>
                  <button style={getStartedButton} onClick={handleGetStarted}>
                    Get Started
                  </button>
                </div>

                <div style={imageContainer}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 300" style={blobStyle}>
                    <path
                      d="M100 30 C150 0 250 0 290 60 C320 120 300 200 220 240 C150 280 60 250 30 190 C0 120 40 70 100 30 Z"
                      fill="#F0597E"
                    />
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
                  {
                    img: "creativity.png",
                    title: "Boosts Creativity",
                    text: "Programming helps children express imagination by building games and apps.",
                    bg: "#b3e5fc",
                    border: "#0288d1",
                  },
                  {
                    img: "crit.png",
                    title: "Improves Problem-Solving",
                    text: "Kids learn to think logically and solve real-world problems step by step.",
                    bg: "#fff9c4",
                    border: "#fbc02d",
                  },
                  {
                    img: "understanding1.png",
                    title: "Prepares for the Future",
                    text: "Learning to code gives children valuable skills for future careers.",
                    bg: "#e1bee7",
                    border: "#7b1fa2",
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...baseCard,
                      backgroundColor: card.bg,
                      borderTop: `3px dashed ${card.border}`,
                      borderLeft: `3px dashed ${card.border}`,
                      marginTop: idx % 2 === 0 ? lowerCard.marginTop : higherCard.marginTop,
                    }}
                  >
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
      )}
    </>
  );
}

export default HomePage;
