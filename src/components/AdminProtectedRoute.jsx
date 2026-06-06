import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if token is expired
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    if (Date.now() / 1000 > exp) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}