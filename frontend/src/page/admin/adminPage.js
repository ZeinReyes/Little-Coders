import { Outlet } from "react-router-dom";
import Navbar from "../../component/adminNavbar";
import Sidebar from "../../component/adminSidebar";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [adminName, setAdminName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setAdminName(user?.name || "Admin");
  }, []);

  return (
    <div className="admin-layout d-flex flex-column flex-md-row" style={{ backgroundColor: "white", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className={`sidebar-container ${
          isSidebarOpen ? "d-block" : "d-none d-md-flex"
        } flex-column align-items-center p-3`}
        style={{
          width: "230px",
          backgroundColor: "white",
          borderRight: "1px solid #ddd",
          position: isSidebarOpen ? "absolute" : "relative",
          zIndex: 1000,
          height: "100vh",
        }}
      >
        {/* Little Coders Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            fontWeight: "800",
            fontSize: "22px",
            fontFamily: "'Poppins', sans-serif",
            marginBottom: "40px",
          }}
        >
          <span style={{ color: "#e53935" }}>L</span>
          <span style={{ color: "#43a047" }}>i</span>
          <span style={{ color: "#1e88e5" }}>t</span>
          <span style={{ color: "#fb8c00" }}>t</span>
          <span style={{ color: "#8e24aa" }}>l</span>
          <span style={{ color: "#fdd835" }}>e</span>
          <span style={{ width: "8px" }}></span>
          <span style={{ color: "#3949ab" }}>C</span>
          <span style={{ color: "#43a047" }}>o</span>
          <span style={{ color: "#f4511e" }}>d</span>
          <span style={{ color: "#1e88e5" }}>e</span>
          <span style={{ color: "#8e24aa" }}>r</span>
          <span style={{ color: "#f4b400" }}>s</span>
        </div>

        <Sidebar />
      </div>

      {/* Main Section */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Navbar (always visible, responsive toggle inside) */}
        <Navbar adminName={adminName} />

        {/* Hamburger toggle for sidebar (only visible on small screens) */}
        <div className="d-md-none text-start p-3 border-bottom">
          <button
            className="btn btn-outline-primary"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <i className="bi bi-list"></i> Menu
          </button>
        </div>

        {/* Page content */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: "white", borderTop: "1px solid #ddd" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
