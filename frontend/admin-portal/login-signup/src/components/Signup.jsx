import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../index.css";

const API = import.meta.env.VITE_API_URL;

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { value: "department_head", label: "Department Head" },
    { value: "department_officer", label: "Department Officer" },
  ];

  const departments = ["Health", "General", "Transport"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      setForm({
        ...form,
        role: value,
        department: "",
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (form.role === "admin") {
        setMessage("Admin signup is restricted");
        setIsLoading(false);
        return;
      }

      if (
        (form.role === "department_head" ||
          form.role === "department_officer") &&
        !form.department
      ) {
        setMessage("Please select a department");
        setIsLoading(false);
        return;
      }

      await axios.post(`${API}/api/admin/signup`, form);

      setMessage("Signup successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/admin/login");
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const leftPanelVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.6, type: "spring" } }
  };

  const rightPanelVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.6, type: "spring", delay: 0.2 } }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
    >
      {/* LEFT PANEL */}
      <motion.div
        variants={leftPanelVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-col justify-center px-14 bg-gradient-to-br from-[#000080] to-[#000066] text-white relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-white rounded-full"
        />

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.h1 
            className="text-4xl font-bold leading-tight"
            initial={{ letterSpacing: "0px" }}
            animate={{ letterSpacing: "2px" }}
            transition={{ duration: 0.8 }}
          >
            AI-Based Grievance
            <br /> Redressal System
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-gray-200 text-sm max-w-md leading-relaxed"
        >
          A Smart India Hackathon initiative to automate complaint
          prioritization and improve government service delivery using AI.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="flex gap-3 mb-4">
            {["#FF9933", "white", "#138808"].map((color, index) => (
              <motion.span
                key={index}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="h-1 w-12"
                style={{ backgroundColor: color }}
                whileHover={{ scaleX: 1.5, transition: { duration: 0.2 } }}
              />
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-xs uppercase tracking-wider text-gray-300"
          >
            Government of India | SIH Portal
          </motion.p>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        variants={rightPanelVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center px-6 py-12"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-gray-50 to-white border-b px-8 py-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">
              User Registration
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill official details to create access
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={formVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSignup}
            className="px-8 py-6 space-y-5"
          >
            {/* Name + Role */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Full Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Role
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </motion.select>
              </div>
            </motion.div>

            {/* Department */}
            <AnimatePresence>
              {(form.role === "department_head" || form.role === "department_officer") && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Department
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
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
            <motion.div variants={itemVariants}>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Email Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200"
                placeholder="official@example.com"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#000080] focus:border-transparent outline-none transition-all duration-200 pr-10"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

            {/* Password Strength Indicator (Optional) */}
            {form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2"
              >
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: form.password.length > 7 ? "100%" : form.password.length > 5 ? "60%" : "30%"
                    }}
                    className={`h-full ${
                      form.password.length > 7
                        ? "bg-green-500"
                        : form.password.length > 5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.password.length > 7
                    ? "Strong password"
                    : form.password.length > 5
                    ? "Medium password"
                    : "Weak password"}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              variants={itemVariants}
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
                  <span>Registering...</span>
                </motion.div>
              ) : (
                "Register"
              )}
            </motion.button>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-center text-sm p-3 rounded-lg ${
                    message.includes("successful")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.includes("successful") && (
                    <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login link */}
            <motion.div
              variants={itemVariants}
              className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200"
            >
              Already registered?{" "}
              <Link
                to="/admin/login"
                className="text-[#000080] font-medium hover:underline transition-all hover:text-[#000066]"
              >
                Login here
              </Link>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Signup;