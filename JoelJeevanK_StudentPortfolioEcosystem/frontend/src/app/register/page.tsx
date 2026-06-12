"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Building, Users, ShieldAlert, CheckCircle2, ArrowLeft, Sun, Moon } from "lucide-react";
import { MccLogo } from "@/components/MccLogo";
import { motion } from "framer-motion";
import { BACKEND_URL } from "@/utils/api";

const FALLBACK_DEPARTMENTS = [
  "Computer Science",
  "Computer Applications (BCA)",
  "Commerce (B.Com)",
  "Business Administration (BBA)",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English Literature",
  "Economics",
  "History",
  "Visual Communication"
];

export default function RegisterPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    department: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/departments`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setDepartments(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load departments from API, using fallback list.", err);
      }
      setDepartments(FALLBACK_DEPARTMENTS);
    }
    loadDepartments();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password || !formData.gender || !formData.department) {
      setError("Please fill out all required fields.");
      return;
    }

    // Email validation: Madras Christian College usually has mainid e.g. studentname@mcc.edu.in
    // Let's support both standard validation and MCC specific warnings/placeholders
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          department: formData.department
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Try again.");
      }

      setSuccess("Account registered successfully! Redirecting to login...");
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 relative px-4 overflow-hidden">
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleDarkMode}
          type="button"
          className="p-2.5 rounded-xl border border-card-border/40 bg-card-bg/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
          title="Toggle theme"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-mcc-gold" />
          ) : (
            <Moon className="h-4 w-4 text-mcc-crimson" />
          )}
        </button>
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-mcc-crimson/10 blur-3xl dark:bg-mcc-gold/5"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl relative border"
      >
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-mcc-crimson dark:hover:text-mcc-gold transition-colors mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>

        <div className="text-center mb-8">
          <MccLogo className="h-12 w-12 text-mcc-crimson dark:text-mcc-gold mx-auto mb-3" />
          <h2 className="text-2xl font-bold tracking-tight">Create MCC Account</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Madras Christian College Registry</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2 animate-shake">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Joel Augustine"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-mcc-crimson/50 focus:border-mcc-crimson outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Email / College MainID */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">College Email / MainID</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="username@mcc.edu.in"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-mcc-crimson/50 focus:border-mcc-crimson outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-mcc-crimson/50 focus:border-mcc-crimson outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-mcc-crimson/50 focus:border-mcc-crimson outline-none transition-all text-sm appearance-none"
                required
              >
                <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Gender</option>
                <option value="Male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Male</option>
                <option value="Female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Female</option>
                <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-mcc-crimson/50 focus:border-mcc-crimson outline-none transition-all text-sm appearance-none"
                required
              >
                <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Choose Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-bold rounded-xl mt-4 btn-premium transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-xs mt-6 text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-mcc-crimson dark:text-mcc-gold hover:underline">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
