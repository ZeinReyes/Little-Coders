import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import NavbarComponent from "../../component/userNavbar";

function HomePage() {
  
  const pageStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100vh",
    backgroundColor: "#f4f9fa",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden",
  };

  // ✅ Combined Hero Section
  const combinedHero = {
    height: "calc(100vh - 70px)",
    width: "100%",
    marginTop: "70px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7ef",
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
    alignItems: "center",
    justifyContent: "center",
    gap: "80px",
    zIndex: 5,
    position: "relative",
  };

  const imageContainer = {
    marginTop: "100px",
    position: "relative",
    width: "360px",
    height: "360px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const blobStyle = {
    position: "absolute",
    width: "360px",
    height: "360px",
    zIndex: 1,
  };

  const leftKidStyle = {
    height: "110%",
    width: "360px",
    position: "relative",
    top: "-75px",
    left: "-7px",
    zIndex: 2,
    borderBottomLeftRadius: "50%",
    borderBottomRightRadius: "50%",
  };

  const rightKidStyle = {
    width: "350px",
    height: "115%",
    position: "relative",
    top: "-70px",
    left: "-10px",
    zIndex: 2,
  };

  const textContainer = {
    textAlign: "center",
    maxWidth: "600px",
  };

  const learningTitleStyle = {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#222",
    marginBottom: "20px",
    fontFamily: "'Poppins', sans-serif",
  };

  const learningSubtitleStyle = {
    fontSize: "18px",
    color: "#444",
    marginBottom: "30px",
    lineHeight: "1.6",
    fontFamily: "'Poppins', sans-serif",
  };

  const getStartedButton = {
    backgroundColor: "#222",
    color: "#fff",
    border: "none",
    padding: "15px 30px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "0.3s ease",
  };

  // ✅ Why Teach Programming Section
  const whySection = {
    backgroundColor: "rgba(148, 250, 146, 0.3)",
    textAlign: "center",
    padding: "25px 20px",
    width: "100%",
    height: "calc(100vh - 70px)",
  };

  const whyTitle = {
    fontSize: "2rem",
    color: "#222",
    marginBottom: "10px",
    fontWeight: "700",
  };

  const whySubtitle = {
    color: "#444",
    fontSize: "1rem",
    marginBottom: "50px",
  };

  const cardsContainer = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "60px",
    flexWrap: "wrap",
  };

  const baseCard = {
    borderRadius: "7px",
    boxShadow: "5px 5px black",
    width: "350px",
    padding: "20px",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    color: "#222",
  };

  const cardBlue = {
    ...baseCard,
    backgroundColor: "#b3e5fc",
    borderTop: "3px dashed #0288d1",
    borderLeft: "3px dashed #0288d1",
  };

  const cardYellow = {
    ...baseCard,
    backgroundColor: "#fff9c4",
    borderTop: "3px dashed #fbc02d",
    borderLeft: "3px dashed #fbc02d",
  };

  const cardPurple = {
    ...baseCard,
    backgroundColor: "#e1bee7",
    borderTop: "3px dashed #7b1fa2",
    borderLeft: "3px dashed #7b1fa2",
  };

  const cardImage = {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "15px",
    marginBottom: "15px",
    backgroundColor: "white",
    padding: "10px",
  };

  const cardTitle = {
    fontSize: "1.2rem",
    color: "#222",
    marginBottom: "8px",
  };

  const cardText = {
    fontSize: "0.95rem",
    color: "#333",
    lineHeight: "1.4",
  };

  const lowerCard = { marginTop: "50px" };
  const higherCard = { marginTop: "0px" };

  // ✅ Footer Style (Bootstrap-like)
  const footerStyle = {
    backgroundColor: "#222",
    color: "#fff",
    padding: "40px 0",
    width: "100%",
    textAlign: "center",
    marginTop: "auto",
  };

  return (
    <div style={pageStyle}>
      <NavbarComponent />

      {/* ---------- HERO SECTION ---------- */}
      <div style={combinedHero}>
      <img src="/assets/images/plus (2).png" style={operatorStyle("1%", "-1%", "160px", "10", 0.15)} />
       <img src="/assets/images/minus (2).png" style={operatorStyle("15%", "25%", "180px", "-10", 0.12)} /> 
       <img src="/assets/images/division (2).png" style={operatorStyle("70%", "1%", "160px", "20", 0.1)} /> 
       <img src="/assets/images/multiply1.png" style={operatorStyle("70%", "30%", "150px", "0", 0.15)} /> 
       <img src="/assets/images/greaterthan.png" style={operatorStyle("15%", "65%", "180px", "-10", 0.15)} /> 
       <img src="/assets/images/lessthan.png" style={operatorStyle("3%", "87%", "160px", "20", 0.12)} /> 
       <img src="/assets/images/!.png" style={operatorStyle("55%", "63%", "160px", "-20", 0.1)} />
       <img src="/assets/images/diamond.png" style={operatorStyle("75%", "90%", "150px", "15", 0.12)} />
        {/* background operator images omitted for brevity */}
        <div style={contentContainer}>
          <div style={imageContainer}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 300" style={blobStyle}>
              <path
                d="M100 30 C150 0 250 0 290 60 C320 120 300 200 220 240 C150 280 70 260 10 160 C0 110 40 70 100 30 Z"
                fill="#F0597E"
              />
            </svg>
            <img src="/assets/images/kid2.jpg" alt="Left kid" style={leftKidStyle} />
          </div>

          <div style={textContainer}>
            <h1 style={learningTitleStyle}>Best Online Learning For Your Kids</h1>
            <p style={learningSubtitleStyle}>
              Discover various fun learning programs for your 5 to 12-year-old
              children with our interactive coding lessons and visual activities.
            </p>
            <button style={getStartedButton}>Get Started</button>
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

      {/* ---------- WHY TEACH PROGRAMMING SECTION ---------- */}
      <section style={whySection}>
        <h2 style={whyTitle}>Why Teach Programming to Children</h2>
        <p style={whySubtitle}>Empowering young minds through creativity and logic</p>
        <div style={cardsContainer}>
          <div style={{ ...cardBlue, ...lowerCard }}>
            <img src="/assets/images/creativity.png" alt="Creativity" style={cardImage} />
            <h3 style={cardTitle}>Boosts Creativity</h3>
            <p style={cardText}>
              Programming helps children express their imagination by building games and apps.
            </p>
          </div>

          <div style={{ ...cardYellow, ...higherCard }}>
            <img src="/assets/images/crit.png" alt="Problem Solving" style={cardImage} />
            <h3 style={cardTitle}>Improves Problem-Solving</h3>
            <p style={cardText}>
              Kids learn to think logically and solve real-world problems step by step.
            </p>
          </div>

          <div style={{ ...cardPurple, ...lowerCard }}>
            <img src="/assets/images/understanding1.png" alt="Future Skills" style={cardImage} />
            <h3 style={cardTitle}>Prepares for the Future</h3>
            <p style={cardText}>
              Learning to code gives children valuable skills that open doors to future careers.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FOOTER (Bootstrap) ---------- */}
      <footer style={footerStyle}>
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5>Little Coders</h5>
              <p>Inspiring young learners to code, create, and explore technology.</p>
            </div>
            <div className="col-md-4 mb-3">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li><Link className="text-white text-decoration-none" to="/">Home</Link></li>
                <li><Link className="text-white text-decoration-none" to="/module-list">Lessons</Link></li>
                <li><Link className="text-white text-decoration-none" to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h5>Follow Us</h5>
              <p>
                <a href="#" className="text-white text-decoration-none me-2">Facebook</a>
                <a href="#" className="text-white text-decoration-none me-2">Instagram</a>
                <a href="#" className="text-white text-decoration-none">YouTube</a>
              </p>
            </div>
          </div>
          <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />
          <p className="mb-0">© {new Date().getFullYear()} Little Coders. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
