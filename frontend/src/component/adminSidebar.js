import React from "react";
import { NavLink } from "react-router-dom";

// Import Inter font from Google Fonts
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

function Sidebar() {
  return (
    <div
      className="sidebar px-3"
      style={{
        width: "230px",
        minHeight: "100vh",
        backgroundColor: "white",
        borderRight: "1px solid #ddd",
        fontFamily: "'Inter', sans-serif", // 👈 Apply Inter font here
      }}
    >
      <ul className="nav flex-column mt-3">
        {/* Dashboard */}
        <li className="nav-item mb-3 fs-5">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `nav-link text-dark d-flex align-items-center gap-2 ${
                isActive ? "fw-semibold bg-light rounded px-2" : ""
              }`
            }
          >
            <i className="bi bi-speedometer2"></i> Dashboard
          </NavLink>
        </li>

        {/* Manage Users */}
        <li className="nav-item mb-3 fs-5">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `nav-link text-dark d-flex align-items-center gap-2 ${
                isActive ? "fw-semibold bg-light rounded px-2" : ""
              }`
            }
          >
            <i className="bi bi-people"></i> Manage Users
          </NavLink>
        </li>

        {/* Module Section */}
        <li className="nav-item fs-5">
          <a
            className="nav-link text-dark d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            href="#sidebarModuleMenu"
            role="button"
            aria-expanded="false"
            aria-controls="sidebarModuleMenu"
          >
            <span className="d-flex align-items-center gap-2">
              <i className="bi bi-journal-text"></i> Module
            </span>
            <span className="ms-2">&#9662;</span>
          </a>

          <div className="collapse" id="sidebarModuleMenu">
            <ul className="nav flex-column ms-3 mt-2">
              {/* Lessons */}
              <li className="mb-2">
                <NavLink
                  to="/admin/lessons"
                  className={({ isActive }) =>
                    `nav-link text-dark d-flex align-items-center gap-2 ${
                      isActive ? "fw-semibold bg-light rounded px-2" : ""
                    }`
                  }
                >
                  <i className="bi bi-book"></i> Lessons
                </NavLink>
              </li>

              {/* Assessments */}
              <li>
                <NavLink
                  to="/admin/manage-assessment"
                  className={({ isActive }) =>
                    `nav-link text-dark d-flex align-items-center gap-2 ${
                      isActive ? "fw-semibold bg-light rounded px-2" : ""
                    }`
                  }
                >
                  <i className="bi bi-clipboard-check"></i> Assessments
                </NavLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
