import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css";

function Login({ setAuthenticated }) {
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "department_head", label: "Department Head" },
    { value: "department_officer", label: "Department Officer" },
  ];

  const departments = ["Health", "General", "Transport"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/api/admin/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        setAuthenticated(true);

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("token", response.data.token);

        localStorage.setItem(
          "user",
          JSON.stringify({
            role: response.data.role,
            department: response.data.department,
          })
        );
        localStorage.setItem("userRole", response.data.role);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("userDepartment", response.data.department);
        localStorage.setItem("department", response.data.department);

        console.log("Stored user info:", {
          role: response.data.role,
          department: response.data.department
        });

        alert(response.data.message || "Login Successful");
        console.log("Login success");

        if (response.data.role === "admin") {
          navigate("/admin/dashboard");
        } else if (
          response.data.role === "department_head" ||
          response.data.role === "department_officer"
        ) {
          navigate("/department-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  const infoVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-[#f2f4f7] to-[#e8eaf0] flex flex-col"
    >
      {/* TOP GOVERNMENT BAR */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gradient-to-r from-[#000080] to-[#000066] text-white px-8 py-4 flex justify-between items-center shadow-lg"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-lg font-semibold tracking-wide">
            AI-Based Grievance Redressal System
          </h1>
          <p className="text-xs text-gray-200 mt-1">
            Government of India | Smart India Hackathon
          </p>
        </motion.div>

        <motion.div
          className="flex gap-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <motion.span
            className="h-1 w-10 bg-[#FF9933]"
            whileHover={{ scaleX: 1.5 }}
          />
          <motion.span
            className="h-1 w-10 bg-white"
            whileHover={{ scaleX: 1.5 }}
          />
          <motion.span
            className="h-1 w-10 bg-[#138808]"
            whileHover={{ scaleX: 1.5 }}
          />
        </motion.div>
      </motion.header>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT INFO PANEL */}
            <motion.div
              variants={infoVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-r"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="mb-6"
              >
                <div className="w-16 h-16 bg-[#000080] rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-800 text-center"
              >
                Authorized Access
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-gray-600 mt-3 leading-relaxed text-center"
              >
                This portal is restricted to authorized administrators and
                departmental officials only. All login activities are monitored
                and recorded for security purposes.
              </motion.p>

              <motion.ul className="mt-6 space-y-3 text-sm text-gray-700">
                {["Secure role-based access", "Department-wise control", "Government audit compliance"].map((item, index) => (
                  <motion.li
                    key={index}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-2"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.span>
                    <span>✔ {item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* RIGHT LOGIN FORM */}
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              className="p-8"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  Administrator Login
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Enter your official credentials
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Role
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </motion.select>
                </motion.div>

                {/* Department */}
                <AnimatePresence>
                  {(role === "department_head" || role === "department_officer") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Department
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </motion.select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Email Address
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#000080] to-[#000066] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    {isLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Logging in...</span>
                      </motion.div>
                    ) : (
                      "Login to Dashboard"
                    )}
                  </motion.button>
                </motion.div>

                {/* Footer Links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-gray-600 flex justify-between pt-2"
                >
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="hover:text-[#000080] cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </motion.span>
                  <motion.span
                    whileHover={{ x: -5 }}
                    className="text-gray-500 hover:text-[#000080] cursor-pointer transition-colors"
                  >
                    Need help? Contact IT Support
                  </motion.span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200"
                >
                  Don't have an account?{" "}
                  <Link
                    to="/admin/signup"
                    className="text-[#000080] font-medium hover:underline transition-all"
                  >
                    Sign up here
                  </Link>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default Login;