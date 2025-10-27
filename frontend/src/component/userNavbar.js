// src/components/NavbarComponent.jsx
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const NavbarComponent = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
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

      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Nav Links */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/module-list">Lessons</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/dragboard">Program Now</Link>

        {/* Mobile Profile Links */}
        {user && (
          <div className="mobile-profile">
            <Link
              className="profile-link"
              to={`/edit-profile/${user._id}`}
              onClick={() => setMenuOpen(false)}
            >
              {user.name}
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
        {!user && (
          <div className="mobile-profile">
            <Link className="sign-in" to="/login" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
            <Link className="sign-up" to="/register" onClick={() => setMenuOpen(false)}>
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Right Profile */}
      <div className="nav-right">
        {!user ? (
          <>
            <Link className="sign-in" to="/login">
              Sign in
            </Link>
            <Link className="sign-up" to="/register">
              Sign up
            </Link>
          </>
        ) : (
          <div className="dropdown">
            <button
              style={{ backgroundColor: "#ffdd57", color: "#111" }}
              className="btn dropdown-toggle"
              type="button"
              id="userMenu"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user?.name || "Profile"}
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
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

      {/* CSS */}
      <style>{`
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 70px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    color: #222;
    z-index: 20;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .logo {
    display: flex;
    align-items: center;
    font-weight: 800;
    font-size: 22px;
    font-family: 'Poppins', sans-serif;
  }
  .nav-links {
    display: flex;
    gap: 30px;
  }
  .nav-links a {
    color: #222;
    text-decoration: none;
    font-size: 16px;
    transition: 0.3s;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .sign-in {
    background-color: #ffdd57;
    color: #111;
    border-radius: 6px;
    padding: 8px 18px;
    font-size: 15px;
    text-decoration: none;
    transition: 0.3s;
  }
  .sign-up {
    background-color: transparent;
    color: #222;
    border: 2px solid #ffdd57;
    border-radius: 6px;
    padding: 8px 18px;
    font-size: 15px;
    text-decoration: none;
    transition: 0.3s;
  }
  .hamburger {
    display: none;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
  }
  .hamburger div {
    width: 25px;
    height: 3px;
    background-color: #222;
  }
  /* Mobile profile inside menu */
.mobile-profile {
  display: none;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  padding: 10px 20px;
  margin-top: 10px;
  background-color: #ffdd57; /* full yellow background */
  border-radius: 8px;
}

.mobile-profile .profile-link {
  font-weight: bold;
  text-decoration: none;
  color: #111; /* dark text for contrast */
  font-size: 16px;
}

.mobile-profile .logout-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #111; /* icon color */
  display: flex;
  align-items: center;
  justify-content: center;
}

  /* Responsive */
  @media (max-width: 992px) {
    .nav-links {
      position: absolute;
      top: 70px;
      left: 0;
      right: 0;
      background-color: #fff;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      display: none;
    }
    .nav-links.active {
      display: flex;
    }
    .hamburger {
      display: flex;
    }
    .nav-right {
      display: none;
    }
    .mobile-profile {
      display: flex;
    }
  }
  @media (max-width: 576px) {
    .navbar {
      padding: 0 20px;
    }
    .logo {
      font-size: 18px;
    }
    .nav-links a {
      font-size: 14px;
    }
  }
`}</style>
    </nav>
  );
};

export default NavbarComponent;
