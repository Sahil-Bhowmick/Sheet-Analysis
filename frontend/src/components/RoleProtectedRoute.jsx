import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;
  if (role !== allowedRole) return <Navigate to="/" />;

  return children;
};

export default RoleProtectedRoute;
