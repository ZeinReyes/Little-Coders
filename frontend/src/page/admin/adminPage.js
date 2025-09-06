import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

function AdminPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
            <h1>Admin Dashboard</h1>
            <p>Name: {user?.name}</p>
            <p>Role: {user?.role}</p>

            <button className="sign-in_btn mt-3" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default AdminPage;
