import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar adminNavbar m-3">
      <div className="container-fluid d-flex justify-content-between">
        <a className="navbar-brand mx-3 text-white" href="#">
          Little Coders
        </a>

        <div className="dropdown mx-3">
          <button
            className="btn btn-primary dropdown-toggle"
            type="button"
            id="userMenu"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {user?.name}
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
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
