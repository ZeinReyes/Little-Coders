import { Outlet } from "react-router-dom";
import Navbar from "../../component/adminNavbar";
import Sidebar from "../../component/adminSidebar";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); 
    if (user && user.name) {
      setAdminName(user.name);
    } else {
      setAdminName("Admin");
    }
  }, []);

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar adminName={adminName} />

      <div className="d-flex flex-grow-1">
        <Sidebar />
        <div className="flex-grow-1 p-4 adminContent me-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
