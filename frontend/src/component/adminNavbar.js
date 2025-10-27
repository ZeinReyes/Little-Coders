import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      className="navbar bg-white px-4 py-3 border-bottom"
      style={{
        height: "65px",
        boxShadow: "none",
      }}
    >
      <div className="container-fluid d-flex justify-content-end align-items-center">
        <div className="dropdown">
          <button
  className="btn btn-primary dropdown-toggle"
  type="button"
  id="userMenu"
  data-bs-toggle="dropdown"
  aria-expanded="false"
>
  {user?.name || "Admin"}
</button>
          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="userMenu"
          >
            <li>
              <Link className="dropdown-item" to="/admin/edit-profile">
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
      </div>
    </nav>
  );
}

export default Navbar;