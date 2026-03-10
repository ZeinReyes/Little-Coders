// ✅ src/page/user/homePage.js
import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import NavbarComponent from "../../component/userNavbar";
import UserFooter from "../../component/userFooter";
import TutorialModal from "../../component/TutorialModal";
import LoadingScreen from "../../component/LoadingScreen";
import { playHomePageSound, stopHomePageSound } from "../../utils/sfx";
import { Blocks, Code2, BookOpen, MessageCircle } from "lucide-react";

// ---- Code Block decorative component ----
function CodeBlock({ color, text, icon, style = {} }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: color,
      borderRadius: "12px",
      padding: "10px 18px",
      fontFamily: "'Fredoka One', cursive",
      fontSize: "1rem",
      color: "#fff",
      boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
      border: "2px solid rgba(255,255,255,0.4)",
      userSelect: "none",
      cursor: "grab",
      ...style,
    }}>
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      {text}
    </div>
  );
}



// ---- Step Card ----
function StepCard({ number, icon, title, desc, color, borderColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: color,
        border: `3px dashed ${borderColor}`,
        borderRadius: "24px",
        padding: "32px 24px",
        width: "260px",
        maxWidth: "85vw",
        textAlign: "center",
        boxShadow: hovered ? `0 12px 0 ${borderColor}` : `0 6px 0 ${borderColor}`,
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.25s ease",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute",
        top: "-20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: borderColor,
        color: "#fff",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Fredoka One', cursive",
        fontSize: "1.2rem",
        boxShadow: "0 3px 0 rgba(0,0,0,0.2)",
      }}>
        {number}
      </div>
      <div style={{ fontSize: "3rem", marginBottom: "12px", marginTop: "8px" }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: "1.3rem",
        color: "#333",
        marginBottom: "8px",
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: "0.95rem",
        color: "#555",
        lineHeight: 1.5,
      }}>{desc}</p>
    </div>
  );
}

// ---- Feature Card ----
function FeatureCard({ Icon, title, desc, bg, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: bg,
        borderRadius: "20px",
        padding: "28px",
        width: "300px",
        maxWidth: "90vw",
        boxShadow: hovered ? `0 10px 0 ${accent}` : `0 5px 0 ${accent}`,
        transform: hovered ? "translateY(-5px) rotate(-1deg)" : "translateY(0) rotate(0)",
        transition: "all 0.3s ease",
        border: `2px solid ${accent}`,
        cursor: "default",
      }}
    >
      <div style={{
        width: "64px", height: "64px",
        backgroundColor: accent,
        borderRadius: "16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "16px",
        boxShadow: "0 3px 0 rgba(0,0,0,0.15)",
      }}>
        <Icon size={30} color="#fff" strokeWidth={2} />
      </div>
      <h3 style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: "1.25rem",
        color: "#222",
        marginBottom: "8px",
      }}>{title}</h3>
      <p style={{
        fontFamily: "'Nunito', sans-serif",
        fontSize: "0.9rem",
        color: "#444",
        lineHeight: 1.6,
      }}>{desc}</p>
    </div>
  );
}

// ---- Animated Python snippet preview ----
function LiveCodePreview() {
  const lines = [
    { indent: 0, color: "#e91e8c", text: 'print("Hello World! 🌍")' },
    { indent: 0, color: "#3d5afe", text: 'name = "Little Coder"' },
    { indent: 0, color: "#00bcd4", text: 'for i in range(5):' },
    { indent: 1, color: "#ff6f00", text: 'print("⭐ Star", i)' },
    { indent: 0, color: "#43a047", text: 'if name == "Little Coder":' },
    { indent: 1, color: "#ab47bc", text: "print(\"You're awesome! 🚀\")" },
  ];
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(v => v < lines.length ? v + 1 : 0);
    }, visible === lines.length ? 1500 : 500);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div style={{
      backgroundColor: "#1a1a2e",
      borderRadius: "20px",
      padding: "24px",
      fontFamily: "'Courier New', monospace",
      fontSize: "0.9rem",
      boxShadow: "0 8px 0 #0d0d1a, 0 0 40px rgba(100,100,255,0.2)",
      border: "2px solid #2d2d4e",
      minWidth: "320px",
      maxWidth: "440px",
      width: "100%",
    }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["#ff5f57","#ffbd2e","#28c840"].map(c => (
          <div key={c} style={{ width: "13px", height: "13px", borderRadius: "50%", backgroundColor: c }} />
        ))}
        <span style={{ color: "#555", fontSize: "0.75rem", marginLeft: "8px", fontFamily: "'Nunito', sans-serif" }}>
          my_code.py
        </span>
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
            opacity: i < visible ? 1 : 0,
            transform: i < visible ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.3s ease",
            paddingLeft: `${line.indent * 24}px`,
          }}
        >
          <span style={{ color: "#444", fontSize: "0.7rem", width: "16px", textAlign: "right" }}>{i + 1}</span>
          <span style={{ color: line.color, fontWeight: "bold" }}>{line.text}</span>
        </div>
      ))}
      <div style={{
        display: "inline-block",
        width: "2px",
        height: "18px",
        backgroundColor: "#fff",
        marginLeft: "24px",
        animation: "blink 1s infinite",
      }} />
    </div>
  );
}

// ---- Drag blocks demo ----
function DragBlocksDemo() {
  const blocks = [
    { color: "#e91e8c", text: "print( )", icon: "🖨️" },
    { color: "#3d5afe", text: "for loop", icon: "🔁" },
    { color: "#ff6f00", text: "if / else", icon: "❓" },
    { color: "#00bcd4", text: "variable", icon: "📦" },
    { color: "#43a047", text: "function", icon: "⚙️" },
  ];

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: "20px",
      padding: "24px",
      boxShadow: "0 8px 0 #ddd",
      border: "2px solid #eee",
      maxWidth: "420px",
      width: "100%",
    }}>
      <div style={{
        fontFamily: "'Fredoka One', cursive",
        fontSize: "1rem",
        color: "#888",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        🧩 Drag blocks to build your code!
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        {blocks.map((b, i) => (
          <CodeBlock key={i} color={b.color} text={b.text} icon={b.icon} />
        ))}
      </div>
      <div style={{
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        padding: "16px",
        border: "2px dashed #ccc",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", color: "#bbb", fontSize: "0.85rem", marginBottom: "4px" }}>
          Drop zone ↓
        </div>
        <CodeBlock color="#3d5afe" text="for loop" icon="🔁" style={{ width: "fit-content" }} />
        <div style={{ paddingLeft: "20px" }}>
          <CodeBlock color="#e91e8c" text='print( "Hello!" )' icon="🖨️" style={{ width: "fit-content" }} />
        </div>
      </div>
    </div>
  );
}

// ---- Main Component ----
function HomePage() {
  const { user, refreshUser, loading: authLoading, isOnboardingIncomplete } =
    useContext(AuthContext);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => setHeroVisible(true), 100);
      }, 800);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && isOnboardingIncomplete) setShowTutorial(true);
  }, [authLoading, isOnboardingIncomplete]);

  const handleGetStarted = () => {
    navigate(user ? "/dragboard" : "/register");
  };

  useEffect(() => {
    const unlockAudio = () => {
      playHomePageSound();
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      stopHomePageSound();
    };
  }, []);

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    .bounce { animation: bounce 2s infinite ease-in-out; }

    @keyframes floatUpDown {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-60px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(60px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes rainbowBorder {
      0% { border-color: #ff6b6b; }
      25% { border-color: #ffd93d; }
      50% { border-color: #6bcb77; }
      75% { border-color: #4d96ff; }
      100% { border-color: #ff6b6b; }
    }

    .hero-left { animation: slideInLeft 0.8s 0.1s both ease-out; }
    .hero-right { animation: slideInRight 0.8s 0.2s both ease-out; }
    .hero-text { animation: slideInUp 0.8s 0.3s both ease-out; }

    .cta-button {
      background: linear-gradient(135deg, #ff6b6b, #ffd93d);
      color: #fff;
      border: none;
      padding: 18px 48px;
      border-radius: 50px;
      cursor: pointer;
      font-family: 'Fredoka One', cursive;
      font-size: 1.4rem;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 0 #cc4400;
      transition: all 0.15s ease;
      animation: pulse 2s infinite;
      text-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 9px 0 #cc4400;
      animation: none;
    }
    .cta-button:active {
      transform: translateY(3px);
      box-shadow: 0 3px 0 #cc4400;
    }

    .section-title {
      font-family: 'Fredoka One', cursive;
      font-size: 2.8rem;
      text-align: center;
      margin-bottom: 12px;
    }
    .section-sub {
      font-family: 'Nunito', sans-serif;
      font-size: 1.1rem;
      text-align: center;
      color: #555;
      margin-bottom: 60px;
    }

    .mascot-wiggle {
      animation: wiggle 3s ease-in-out infinite;
      transform-origin: bottom center;
    }

    .rainbow-badge {
      animation: rainbowBorder 3s linear infinite;
    }

    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: #fff9e6; }
    ::-webkit-scrollbar-thumb { background: #ffd93d; border-radius: 10px; }
  `;



  return (
    <>
      {loading ? (
        <LoadingScreen fadeOut={fadeOut} />
      ) : (
        <>
          <style>{globalStyles}</style>

          {showTutorial && (
            <TutorialModal
              show={showTutorial}
              onClose={async () => {
                setShowTutorial(false);
                if (user?._id) await refreshUser(user._id);
              }}
            />
          )}

          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Nunito', sans-serif", overflowX: "hidden" }}>
            <NavbarComponent />

            {/* ====== HERO ====== */}
            <section style={{
              marginTop: "70px",
              minHeight: "100vh",
              background: "linear-gradient(160deg, #fff9e6 0%, #ffe0f0 50%, #e0f4ff 100%)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 24px 80px",
              overflow: "hidden",
            }}>

              {/* Floating operator images (from original homepage) */}
              {[
                { src: "add.png",          top: "1%",  left: "5%",  size: "12%", rotate: 10,  opacity: 0.18 },
                { src: "subtract.png",     top: "15%", left: "25%", size: "14%", rotate: -10, opacity: 0.14 },
                { src: "divide.png",       top: "70%", left: "1%",  size: "12%", rotate: 20,  opacity: 0.13 },
                { src: "multiply.png",     top: "70%", left: "30%", size: "11%", rotate: 0,   opacity: 0.18 },
                { src: "greaterthan.png",  top: "15%", left: "65%", size: "14%", rotate: -10, opacity: 0.18 },
                { src: "lessthan.png",     top: "3%",  left: "87%", size: "12%", rotate: 20,  opacity: 0.14 },
                { src: "!.png",            top: "55%", left: "63%", size: "12%", rotate: -20, opacity: 0.13 },
                { src: "diamond.png",      top: "75%", left: "90%", size: "11%", rotate: 15,  opacity: 0.15 },
              ].map((op, i) => (
                <img
                  key={i}
                  src={`/assets/images/${op.src}`}
                  className="bounce"
                  style={{
                    position: "absolute",
                    top: op.top,
                    left: op.left,
                    width: op.size,
                    transform: `rotate(${op.rotate}deg)`,
                    opacity: op.opacity,
                    zIndex: 1,
                    filter: "drop-shadow(2px 2px 5px rgba(0,0,0,0.2))",
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Big decorative blobs */}
              <div style={{
                position: "absolute", top: "-100px", left: "-100px",
                width: "400px", height: "400px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #ffe0cc 0%, transparent 70%)",
                zIndex: 0,
              }} />
              <div style={{
                position: "absolute", bottom: "-80px", right: "-80px",
                width: "350px", height: "350px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #d0f0ff 0%, transparent 70%)",
                zIndex: 0,
              }} />

              {/* Headline */}
              <h1 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                textAlign: "center",
                lineHeight: 1.15,
                color: "#1a1a2e",
                maxWidth: "800px",
                zIndex: 2,
                marginBottom: "20px",
                animation: "slideInUp 0.7s 0.1s both",
              }}>
                Code is{" "}
                <span style={{
                  background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Fun</span>{" "}
                for{" "}
                <span style={{
                  background: "linear-gradient(135deg, #4d96ff, #6bcb77)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Every Kid!</span>
              </h1>

              <p style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "#555",
                textAlign: "center",
                maxWidth: "580px",
                lineHeight: 1.7,
                zIndex: 2,
                marginBottom: "36px",
                animation: "slideInUp 0.7s 0.2s both",
              }}>
                Snap colorful code blocks together like puzzle pieces — watch them turn into{" "}
                <strong style={{ color: "#3d5afe" }}>real Python code</strong> instantly! No experience needed.
              </p>

              <button className="cta-button" onClick={handleGetStarted} style={{ zIndex: 2 }}>
                🚀 Start Coding Now!
              </button>
            </section>

            {/* ====== HOW IT WORKS ====== */}
            <section style={{
              backgroundColor: "#1a1a2e",
              padding: "90px 24px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative dots grid */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                zIndex: 0,
              }} />

              <div style={{ position: "relative", zIndex: 2 }}>
                <h2 className="section-title" style={{ color: "#fff" }}>
                  How Little Coders Works
                </h2>
                <p className="section-sub" style={{ color: "#aaa" }}>
                  Three easy steps to become a Python programmer!
                </p>

                {/* Blocks preview + Code preview side by side */}
                <div style={{
                  display: "flex",
                  gap: "40px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  marginBottom: "60px",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <div style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: "#ffd93d",
                      fontSize: "1.1rem",
                      marginBottom: "8px",
                    }}>
                      🧩 Your Blocks
                    </div>
                    <DragBlocksDemo />
                  </div>

                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    color: "#ffd93d",
                    fontFamily: "'Fredoka One', cursive",
                    gap: "8px",
                    alignSelf: "center",
                    padding: "0 12px",
                  }}>
                    <span>→</span>
                    <span style={{ fontSize: "0.9rem", color: "#aaa" }}>turns into</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <div style={{
                      fontFamily: "'Fredoka One', cursive",
                      color: "#6bcb77",
                      fontSize: "1.1rem",
                      marginBottom: "8px",
                    }}>
                      🐍 Real Python
                    </div>
                    <LiveCodePreview />
                  </div>
                </div>

                {/* Step cards */}
                <div style={{ display: "flex", gap: "28px", flexWrap: "wrap", justifyContent: "center" }}>
                  <StepCard
                    number="1" icon="🎯"
                    title="Pick a Lesson"
                    desc="Choose from fun, colorful modules. From loops to functions — all made for kids!"
                    color="#fff3cd" borderColor="#ffc107"
                  />
                  <StepCard
                    number="2" icon="🧩"
                    title="Drag & Drop Blocks"
                    desc="Snap code blocks together like Lego. No typing mistakes, just creativity!"
                    color="#d1f7d1" borderColor="#4caf50"
                  />
                  <StepCard
                    number="3" icon="🚀"
                    title="See Real Python!"
                    desc="Watch your blocks become real Python code and run it instantly. You're a coder!"
                    color="#d0e8ff" borderColor="#2196f3"
                  />
                </div>
              </div>
            </section>

            {/* ====== FEATURES ====== */}
            <section style={{
              background: "linear-gradient(160deg, #fff9e6, #e8f5ff)",
              padding: "90px 24px",
            }}>
              <h2 className="section-title" style={{ color: "#1a1a2e" }}>
                Why Kids Love Little Coders
              </h2>
              <p className="section-sub">
                Designed from the ground up to be exciting, encouraging, and educational!
              </p>

              <div style={{
                display: "flex",
                gap: "28px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}>
                <FeatureCard
                  Icon={Blocks} title="Drag & Drop Coding"
                  desc="No scary syntax! Just grab colorful blocks and snap them into place to build real programs."
                  bg="#fff3e0" accent="#ff9800"
                />
                <FeatureCard
                  Icon={Code2} title="Real Python Output"
                  desc="Every block you place generates actual Python code — you'll be writing real programs from day one!"
                  bg="#e8f5e9" accent="#4caf50"
                />
                <FeatureCard
                  Icon={BookOpen} title="Step-by-Step Modules"
                  desc="Guided lessons from super easy to super cool — always at exactly the right pace for you."
                  bg="#e3f2fd" accent="#2196f3"
                />
                <FeatureCard
                  Icon={MessageCircle} title="Kid-Friendly Language"
                  desc="No confusing jargon — everything is explained with simple words, fun examples and clear guides!"
                  bg="#e0f7fa" accent="#00bcd4"
                />
              </div>
            </section>

            {/* ====== CODE BLOCKS SHOWCASE ====== */}
            <section style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "80px 24px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "-60px", left: "-60px",
                width: "300px", height: "300px", borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.05)",
              }} />
              <div style={{
                position: "absolute", bottom: "-80px", right: "-40px",
                width: "400px", height: "400px", borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.05)",
              }} />

              <h2 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "#fff",
                marginBottom: "16px",
                position: "relative", zIndex: 2,
              }}>
                Meet Your Coding Blocks!
              </h2>
              <p style={{
                fontFamily: "'Nunito', sans-serif",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "48px",
                fontSize: "1.1rem",
                position: "relative", zIndex: 2,
              }}>
                Each colorful block is a piece of Python — just drag and snap!
              </p>

              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                justifyContent: "center",
                maxWidth: "700px",
                margin: "0 auto",
                position: "relative", zIndex: 2,
              }}>
                {[
                  { color: "#e91e8c", text: 'print("Hello!")', icon: "🖨️" },
                  { color: "#3d5afe", text: "for loop", icon: "🔁" },
                  { color: "#ff6f00", text: "if / else", icon: "❓" },
                  { color: "#00bcd4", text: "variable", icon: "📦" },
                  { color: "#43a047", text: "function", icon: "⚙️" },
                  { color: "#9c27b0", text: "while loop", icon: "♾️" },
                  { color: "#f44336", text: "list [ ]", icon: "📋" },
                  { color: "#009688", text: "input( )", icon: "⌨️" },
                  { color: "#ff5722", text: "return", icon: "↩️" },
                  { color: "#607d8b", text: "import", icon: "📥" },
                ].map((b, i) => (
                  <CodeBlock key={i} color={b.color} text={b.text} icon={b.icon}
                    style={{ animation: `floatUpDown ${2.5 + (i % 3) * 0.4}s ${i * 0.15}s ease-in-out infinite` }}
                  />
                ))}
              </div>
            </section>

            {/* ====== CTA BANNER ====== */}
            <section style={{
              background: "linear-gradient(135deg, #fff9e6, #ffe0f0)",
              padding: "90px 24px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Mascot (big emoji) */}
              <div className="mascot-wiggle" style={{ fontSize: "6rem", marginBottom: "24px", display: "inline-block" }}>
                🤖
              </div>

              <h2 style={{
                fontFamily: "'Fredoka One', cursive",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#1a1a2e",
                marginBottom: "16px",
                lineHeight: 1.2,
              }}>
                Ready to Start Your<br />
                <span style={{
                  background: "linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Coding Adventure?
                </span>
              </h2>

              <p style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: "1.15rem",
                color: "#555",
                maxWidth: "500px",
                margin: "0 auto 36px",
                lineHeight: 1.7,
              }}>
                Join thousands of young coders building their first Python programs today.
                It's free, it's fun, and it's for YOU!
              </p>

              <button className="cta-button" onClick={handleGetStarted}>
                Let's Go!
              </button>
            </section>

            <UserFooter />
          </div>
        </>
      )}
    </>
  );
}

export default HomePage;