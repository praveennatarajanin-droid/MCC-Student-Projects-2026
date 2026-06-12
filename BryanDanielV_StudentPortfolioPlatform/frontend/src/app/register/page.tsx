"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    rollNumber: "",
    department: "Computer Applications (MCA)",
    batchYear: "2024-2026",
    role: "Student",
    verificationCode: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all account fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => {
    setError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.firstName || !formData.lastName) {
      setError("Please complete all profile details.");
      return;
    }
    if (formData.role === "Student" && (!formData.rollNumber || !formData.batchYear)) {
      setError("Please complete roll number and batch year for student profile.");
      return;
    }
    if (formData.role !== "Student" && !formData.verificationCode) {
      setError("Please complete the Staff Verification Code.");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        rollNumber: formData.role === "Student" ? formData.rollNumber : null,
        department: formData.department,
        batchYear: formData.role === "Student" ? formData.batchYear : null,
        role: formData.role,
        verificationCode: formData.role !== "Student" ? formData.verificationCode : null,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    "Computer Applications (MCA)",
    "Computer Science (B.Sc / M.Sc)",
    "Information Technology",
    "Commerce (B.Com / M.Com)",
    "Economics",
    "English Literature",
    "Physics",
    "Chemistry",
    "Mathematics",
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-mcc-maroon/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-mcc-gold/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center gap-4 mb-6">
          <Link href="/">
            <img src="/mcc_logo.png" alt="Madras Christian College Logo" className="h-16 w-auto object-contain rounded-lg shadow-md border border-slate-200/10 dark:border-white/5 hover:opacity-90 transition-opacity cursor-pointer" />
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-2 text-center">
            {formData.role === "Student" ? "Create Student Profile" : `Create ${formData.role === "Faculty" ? "Faculty" : "Staff"} Profile`}
          </h2>
          {/* Step Progress Tracker */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-mcc-maroon text-white border border-mcc-gold" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>1</span>
            <div className={`w-8 h-0.5 ${step === 2 ? "bg-mcc-gold" : "bg-slate-200 dark:bg-slate-800"}`} />
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-mcc-maroon text-white border border-mcc-gold" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>2</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-300 mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Registration Type
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors appearance-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Faculty">Staff / Professor (Faculty)</option>
                    <option value="PlacementCoordinator">Placement Officer</option>
                    <option value="ResearchCoordinator">Research Coordinator</option>
                    <option value="InnovationCoordinator">Innovation Head</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    MCC Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@mcc.edu.in"
                    className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 6 characters"
                    className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repeat password"
                    className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full h-12 mt-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Profile Details
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="e.g. Bryan"
                      className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="e.g. Manuel"
                      className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                </div>

                {formData.role !== "Student" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {formData.role === "Admin" ? "Admin Verification Code" : "Staff Verification Code"}
                    </label>
                    <input
                      type="text"
                      name="verificationCode"
                      required
                      value={formData.verificationCode}
                      onChange={handleInputChange}
                      placeholder={formData.role === "Admin" ? "Enter Admin Verification Code" : "Enter Staff Verification Code"}
                      className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                )}

                {formData.role === "Student" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      required
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 23-MCA-001"
                      className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                )}

                <div className={formData.role === "Student" ? "grid grid-cols-2 gap-4" : "w-full"}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors appearance-none"
                    >
                      {departments.map((dep, idx) => (
                        <option key={idx} value={dep} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                          {dep}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.role === "Student" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                        Batch Year
                      </label>
                      <input
                        type="text"
                        name="batchYear"
                        required
                        value={formData.batchYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 2024-2026"
                        className="w-full h-11 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition-colors"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-1/3 h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/20 dark:bg-slate-950/20 text-slate-650 dark:text-slate-400 font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-950/60 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 rounded-lg bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light text-slate-100 font-semibold hover:from-mcc-maroon-light hover:to-red-600 focus:outline-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/30 disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Submit Registration"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-mcc-gold hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
