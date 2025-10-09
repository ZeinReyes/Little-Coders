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

        <li className="nav-item mb-3 fs-5">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            href="#sidebarUserMenu"
            role="button"
            aria-expanded="false"
            aria-controls="sidebarUserMenu"
          >
            <span>User</span>
            <span className="ms-2">&#9662;</span>
          </a>
          <div className="collapse" id="sidebarUserMenu">
            <ul className="nav flex-column ms-3">
              <li>
                <NavLink
                  to="/admin/users"
                  end
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  Manage Users
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/users/add"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  Add User
                </NavLink>
              </li>
            </ul>
          </div>
        </li>

        <li className="nav-item fs-5">
          <a
            className="nav-link text-white d-flex justify-content-between align-items-center"
            data-bs-toggle="collapse"
            href="#sidebarLessonMenu"
            role="button"
            aria-expanded="false"
            aria-controls="sidebarLessonMenu"
          >
            <span>Lessons</span>
            <span className="ms-2">&#9662;</span>
          </a>
          <div className="collapse" id="sidebarLessonMenu">
            <ul className="nav flex-column ms-3">
              <li>
                <NavLink
                  to="/admin/lessons"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  View Lessons
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/lessons/add"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  Add Lesson
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/manage-assessment"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  View Assessment
                </NavLink>
                </li>
              <li>
                <NavLink
                  to="/admin/add-assessment"
                  className={({ isActive }) =>
                    `nav-link text-white ${isActive ? "bg-primary text-white rounded px-2" : ""}`
                  }
                >
                  Add Assessment
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
