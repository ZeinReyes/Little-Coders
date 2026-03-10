import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";

// Authentication
import Login from "./page/authentication/loginPage";
import Register from "./page/authentication/registerPage";
import ForgotPassword from "./page/authentication/forgotPasswordPage";
import ResetPassword from "./page/authentication/resetPasswordPage";
import VerifyEmail from "./page/authentication/verifyEmailPage";

// User
import HomePage from "./page/user/homePage";
import LessonPlayer from "./page/user/lessonPlayer";
import ModuleList from "./page/user/moduleList";
import LessonList from "./page/user/lessonList";
import DragBoard from "./component/DragBoard";
import DragBoardLesson from "./page/DragBoardLesson";
import ContactPage from "./page/user/contactPage";
import EditProfile from "./page/user/editProfile";
import ChildSelectPage from "./page/user/childSelectPage";

// Admin
import AdminPage from "./page/admin/adminPage";
import Dashboard from "./page/admin/dashboard";
import AdminEditProfile from "./page/admin/editProfile";
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

// ── Protected Route — must be logged in, optional role check ─────────────────
function ProtectedRoute({ element, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/select-profile" replace />;
  }

  return element;
}

// ── Child Route — must be logged in AND have an active child selected ─────────
function ChildRoute({ element }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;

  const activeChild = sessionStorage.getItem("activeChild");
  if (!activeChild) return <Navigate to="/select-profile" replace />;

  return element;
}

// ── Smart default redirect based on auth + child state ───────────────────────
function DefaultRedirect() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  const activeChild = sessionStorage.getItem("activeChild");
  return <Navigate to={activeChild ? "/home" : "/select-profile"} replace />;
}

function App() {
  return (
    <Routes>
      {/* ── Authentication ── */}
      <Route path="/login"                    element={<Login />} />
      <Route path="/register"                 element={<Register />} />
      <Route path="/forgot-password"          element={<ForgotPassword />} />
      <Route path="/reset-password/:token"    element={<ResetPassword />} />
      <Route path="/verify-email/:token"      element={<VerifyEmail />} />

      {/* ── Child profile selector ── */}
      <Route
        path="/select-profile"
        element={<ProtectedRoute element={<ChildSelectPage />} allowedRoles={["user", "admin"]} />}
      />

      {/* ── Public ── */}
      <Route path="/contact"            element={<ContactPage />} />
      <Route path="/edit-profile/:_id"  element={<EditProfile />} />
      <Route path="/dragboard"          element={<DragBoard />} />

      {/* ── Child-gated user routes ── */}
      <Route path="/home"        element={<ChildRoute element={<HomePage />} />} />
      <Route path="/module-list" element={<ChildRoute element={<ModuleList />} />} />
      <Route
        path="/lesson/:id"
        element={<ChildRoute element={<ProtectedRoute element={<LessonPlayer />} allowedRoles={["user", "admin"]} />} />}
      />
      <Route
        path="/lessons/:lessonId"
        element={<ChildRoute element={<ProtectedRoute element={<LessonList />} allowedRoles={["user", "admin"]} />} />}
      />
      <Route
        path="/lessons/:lessonId/:itemId"
        element={<ChildRoute element={<ProtectedRoute element={<DragBoardLesson />} allowedRoles={["user", "admin"]} />} />}
      />

      {/* ── Admin routes ── */}
      <Route
        path="/admin"
        element={<ProtectedRoute element={<AdminPage />} allowedRoles={["admin"]} />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"                             element={<Dashboard />} />
        <Route path="edit-profile"                          element={<AdminEditProfile />} />
        <Route path="users"                                 element={<Users />} />
        <Route path="users/add"                             element={<AddUser />} />
        <Route path="lessons"                               element={<Lessons />} />
        <Route path="lessons/add"                           element={<AddLesson />} />
        <Route path="lessons/edit/:id"                      element={<EditLesson />} />
        <Route path="lessons/:id/add-material"              element={<AddMaterial />} />
        <Route path="lessons/:lessonId/materials/:id"       element={<EditMaterial />} />
        <Route path="materials/:id/add-activity"            element={<AddActivity />} />
        <Route path="lessons/:lessonId/activities/:id"      element={<EditActivity />} />
        <Route path="add-assessment"                        element={<AddAssessment />} />
        <Route path="manage-assessment"                     element={<ManageAssessment />} />
        <Route path="edit-assessment/:id"                   element={<EditAssessment />} />
      </Route>

      {/* ── Catch-all: smart redirect ── */}
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

export default App;