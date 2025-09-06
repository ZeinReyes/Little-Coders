import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './page/authentication/loginPage';
import Register from './page/authentication/registerPage';
import ForgotPassword from './page/authentication/forgotPasswordPage';
import ResetPassword from './page/authentication/resetPasswordPage';
import AdminPage from './page/admin/adminPage';
import HomePage from './page/user/homePage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
