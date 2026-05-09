import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  console.log("ProtectedRoute check:", isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

export default ProtectedRoute;