import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar mx-3 px-2">
      <ul className="nav flex-column">
        <li className="nav-item my-3 fs-5">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
            }
          >
            Dashboard
          </NavLink>
        </li>

        {/* Manage Users (no dropdown) */}
        <li className="nav-item mb-3 fs-5">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
            }
          >
            Manage Users
          </NavLink>
        </li>

        {/* Module Dropdown */}
        <li className="nav-item fs-5">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            href="#sidebarModuleMenu"
            role="button"
            aria-expanded="false"
            aria-controls="sidebarModuleMenu"
          >
            <span>Module</span>
            <span className="ms-2">&#9662;</span>
          </a>
          <div className="collapse" id="sidebarModuleMenu">
            <ul className="nav flex-column ms-3">
              <li>
                <NavLink
                  to="/admin/lessons"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  Lessons
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/manage-assessment"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  Assessments
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
