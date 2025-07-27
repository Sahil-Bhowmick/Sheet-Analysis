import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import History from "./pages/History";
import SavedCharts from "./pages/SavedCharts";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

            {/* ✅ Auth-related routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/register" element={<Navigate to="/auth" replace />} />

            {/* ✅ Protected user routes */}
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRole="user">
                  <UserDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <RoleProtectedRoute allowedRole="user">
                  <History />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <RoleProtectedRoute allowedRole="user">
                  <SavedCharts />
                </RoleProtectedRoute>
              }
            />

            {/* ✅ Admin route */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* ✅ 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />

        <ToastContainer
          position="top-right"
          autoClose={2500}
          theme="colored"
          pauseOnHover
          closeOnClick
        />
      </div>
    </Router>
  );
}

export default App;
