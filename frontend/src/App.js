import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";

// Authentication
import Login from "./page/authentication/loginPage";
import Register from "./page/authentication/registerPage";
import ForgotPassword from "./page/authentication/forgotPasswordPage";
import ResetPassword from "./page/authentication/resetPasswordPage";

// User
import HomePage from "./page/user/homePage";
import LessonPlayer from "./page/user/lessonPlayer";
import ModuleList from "./page/user/moduleList";
import LessonList from "./page/user/lessonList";
import DragBoard from "./component/DragBoard";
import DragBoardLesson from "./component/DragBoardLesson";

// Admin
import AdminPage from "./page/admin/adminPage";
import Dashboard from "./page/admin/dashboard";
import Users from "./page/admin/users";
import AddUser from "./page/admin/addUser";
import Lessons from "./page/admin/lessons";
import AddLesson from "./page/admin/addLeson";
import EditLesson from "./page/admin/editLesson";
import AddMaterial from "./page/admin/addMaterial";
import EditMaterial from "./page/admin/editMaterial";
import AddActivity from "./page/admin/addActivity";
import EditActivity from "./page/admin/editActivity";
import AddAssessment from "./page/admin/addAssessment";
import ManageAssessment from "./page/admin/manageAssessment";
import EditAssessment from "./page/admin/editAssessment";

// Others
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

// ✅ Protected Route Component
function ProtectedRoute({ element, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return element;
}

function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* 🟢 Home is now public — accessible by everyone */}
      <Route path="/home" element={<HomePage />} />

      {/* User-protected routes */}
      <Route
        path="/lesson/:id"
        element={<ProtectedRoute element={<LessonPlayer />} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/module-list"
        element={<ProtectedRoute element={<ModuleList />} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/lessons/:lessonId"
        element={<ProtectedRoute element={<LessonList />} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/lessons/:lessonId/:itemId"
        element={<ProtectedRoute element={<DragBoardLesson />} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/dragboard"
        element={<ProtectedRoute element={<DragBoard />} allowedRoles={["user", "admin"]} />}
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={<ProtectedRoute element={<AdminPage />} allowedRoles={["admin"]} />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/add" element={<AddUser />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="lessons/add" element={<AddLesson />} />
        <Route path="lessons/edit/:id" element={<EditLesson />} />
        <Route path="lessons/:id/add-material" element={<AddMaterial />} />
        <Route path="lessons/:lessonId/materials/:id" element={<EditMaterial />} />
        <Route path="materials/:id/add-activity" element={<AddActivity />} />
        <Route path="lessons/:lessonId/activities/:id" element={<EditActivity />} />
        <Route path="add-assessment" element={<AddAssessment />} />
        <Route path="manage-assessment" element={<ManageAssessment />} />
        <Route path="edit-assessment/:id" element={<EditAssessment />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
