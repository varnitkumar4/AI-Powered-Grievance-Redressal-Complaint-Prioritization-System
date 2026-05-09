import { Navigate } from "react-router-dom";

// You can later replace this with context / redux if you want
const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const RoleRoute = ({ children, allowedRoles }) => {
  console.log("RoleRoute check for roles:", allowedRoles);
  const user = getUser();

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // ❌ Role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Allowed
  return children;
};

export default RoleRoute;