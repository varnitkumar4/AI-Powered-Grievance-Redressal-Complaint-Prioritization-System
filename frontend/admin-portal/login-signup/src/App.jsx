import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute"; // ✅ ADD THIS
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import './index.css';
import Dashboard from "./components/Dashboard";
import { useState } from "react";
import GrievanceDashboard from "./components/GrievancesDashboard";
import Announcements from "./components/Announcements";
import DepartmentGrievance from "./components/department/DepartmentGrievance"; 

// 👉 (you must have this component)
import DepartmentDashboard from "./components/department/DepartmentDashboard"; 

function App() {
  const [isAuthenticated, setAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Signup />} />

        <Route
          path="/admin/login"
          element={<Login setAuthenticated={setAuthenticated} />}
        />

        <Route path="/admin/signup" element={<Signup />} />

        {/* 🔐 Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/grievances"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <GrievanceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard/announcements"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Announcements />
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW: Department Dashboard (Role Based) */}
        <Route
          path="/department-dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RoleRoute allowedRoles={["department_head", "department_officer"]}>
                <DepartmentDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ✅ Department Grievances Route */}
        <Route
          path="/admin/department/grievances"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <RoleRoute allowedRoles={["department_head", "department_officer"]}>
                <DepartmentGrievance />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;