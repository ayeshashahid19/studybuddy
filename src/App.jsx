import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Navbar from "./components/common/Navbar";
import PrivateRoute from "./components/common/PrivateRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./components/student/StudentDashboard";
import TutorDashboard from "./components/tutor/TutorDashboard";
import TutorProfileSetup from "./components/tutor/TutorProfileSetup";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import TutorManagement from "./components/admin/TutorManagement";
import TutorApproval from "./components/admin/TutorApproval";
import AuditLogs from "./components/admin/AuditLogs";
import TutorSearch from "./components/student/TutorSearch";
import TutorProfile from "./components/student/TutorProfile";
import BookingPage from "./components/student/BookingPage";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route
              path="/tutors"
              element={
                <PrivateRoute>
                  <TutorSearch />
                </PrivateRoute>
              }
            />
            <Route
              path="/tutor/:id"
              element={
                <PrivateRoute>
                  <TutorProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking/:tutorId"
              element={
                <PrivateRoute>
                  <BookingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/student"
              element={
                <PrivateRoute role="student">
                  <StudentDashboard />
                </PrivateRoute>
              }
            />

            {/* Tutor Routes */}
            <Route
              path="/dashboard/tutor"
              element={
                <PrivateRoute role="tutor">
                  <TutorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/tutor/profile-setup"
              element={
                <PrivateRoute role="tutor">
                  <TutorProfileSetup />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute role="admin">
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tutors"
              element={
                <PrivateRoute role="admin">
                  <TutorManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tutor-approval"
              element={
                <PrivateRoute role="admin">
                  <TutorApproval />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <PrivateRoute role="admin">
                  <AuditLogs />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
