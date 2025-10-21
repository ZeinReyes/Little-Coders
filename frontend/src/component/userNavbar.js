// src/components/NavbarComponent.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const NavbarComponent = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navBarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "70px",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    color: "#222",
    zIndex: 20,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const navCenterStyle = {
    display: "flex",
    gap: "30px",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  };

  const navLinkStyle = {
    color: "#222",
    textDecoration: "none",
    fontSize: "16px",
    transition: "0.3s",
  };

  const navRightStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  };

  const signInButton = {
    backgroundColor: "#222",
    color: "#fff",
    border: "2px solid #222",
    borderRadius: "6px",
    padding: "8px 18px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "0.3s",
    textDecoration: "none",
  };

  const signUpButton = {
    backgroundColor: "transparent",
    color: "#222",
    border: "2px solid #222",
    borderRadius: "6px",
    padding: "8px 18px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "0.3s",
    textDecoration: "none",
  };

  return (
    <nav style={navBarStyle}>
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontWeight: "800",
          fontSize: "22px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <span style={{ color: "#e53935" }}>L</span>
        <span style={{ color: "#43a047" }}>i</span>
        <span style={{ color: "#1e88e5" }}>t</span>
        <span style={{ color: "#fb8c00" }}>t</span>
        <span style={{ color: "#8e24aa" }}>l</span>
        <span style={{ color: "#fdd835" }}>e</span>
        <span style={{ width: "10px" }}></span>
        <span style={{ color: "#3949ab" }}>C</span>
        <span style={{ color: "#43a047" }}>o</span>
        <span style={{ color: "#f4511e" }}>d</span>
        <span style={{ color: "#1e88e5" }}>e</span>
        <span style={{ color: "#8e24aa" }}>r</span>
        <span style={{ color: "#f4b400" }}>s</span>
      </div>

      {/* Center Links */}
      <div style={navCenterStyle}>
        <Link to="/" style={navLinkStyle}>
          Home
        </Link>
        <Link to="/module-list" style={navLinkStyle}>
          Lessons
        </Link>
        <Link to="/contact" style={navLinkStyle}>
          Contact Us
        </Link>
        <Link to="/dragboard" style={navLinkStyle}>
          Program Now
        </Link>
      </div>

      {/* Right Side Buttons */}
      <div style={navRightStyle}>
        {!user ? (
          <>
            <Link to="/login" style={signInButton}>
              Sign in
            </Link>
            <Link to="/signup" style={signUpButton}>
              Sign up
            </Link>
          </>
        ) : (
          <div className="dropdown">
           <button
              style={{ backgroundColor: "#2157b4", color: "#ffffff" }}
              className="btn dropdown-toggle"
              type="button"
              id="userMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
>
              {user?.name || "Profile"}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="userMenu"
            >
              <li>
                <Link className="dropdown-item" to={`/edit-profile/${user._id}`}>
                  Edit Profile
                </Link>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarComponent;
