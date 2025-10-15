import React from "react";

const LoadingScreen = () => {
  const letters = [
    { char: "L", color: "#e53935" },
    { char: "i", color: "#43a047" },
    { char: "t", color: "#1e88e5" },
    { char: "t", color: "#fb8c00" },
    { char: "l", color: "#8e24aa" },
    { char: "e", color: "#fdd835" },
    { char: " ", color: "transparent" },
    { char: "C", color: "#3949ab" },
    { char: "o", color: "#43a047" },
    { char: "d", color: "#f4511e" },
    { char: "e", color: "#1e88e5" },
    { char: "r", color: "#8e24aa" },
    { char: "s", color: "#f4b400" },
  ];

  const containerStyle = {
    height: "100vh",
    width: "100%",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    fontFamily: "'Poppins', sans-serif",
  };

  const textContainerStyle = {
    display: "flex",
    gap: "3px",
    fontSize: "40px",
    fontWeight: "800",
  };

  const letterStyle = {
    display: "inline-block",
    animation: "wave 1.5s ease-in-out infinite",
  };

  const textStyle = {
    marginTop: "20px",
    fontSize: "16px",
    color: "#333",
    letterSpacing: "1px",
  };

  return (
    <div style={containerStyle}>
      <div style={textContainerStyle}>
        {letters.map((letter, index) => (
          <span
            key={index}
            style={{
              ...letterStyle,
              color: letter.color,
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {letter.char}
          </span>
        ))}
      </div>
      <p style={textStyle}>Loading, please wait...</p>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
