import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './page/authentication/loginPage';
import Register from './page/authentication/registerPage';
import ForgotPassword from './page/authentication/forgotPasswordPage';
import ResetPassword from './page/authentication/resetPasswordPage';
import AdminPage from './page/admin/adminPage';
import HomePage from './page/user/homePage';
import Dashboard from './page/admin/dashboard';
import Users from './page/admin/users';
import AddUser from './page/admin/addUser';
import Lessons from './page/admin/lessons';
import Navbar from "./component/adminNavbar";  
import Sidebar from "./component/adminSidebar"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/home" element={<HomePage />} />

      <Route path="/admin" element={<AdminPage />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/add" element={<AddUser />} />
        <Route path="lessons" element={<Lessons />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
