"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AmbientBackground from "@/components/AmbientBackground";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* ── Ambient Background ── */}
      <AmbientBackground variant="login" />

      {/* ── Theme Switcher — top right ── */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      {/* ── Decorative rotating ring (top-left) ── */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none opacity-20 dark:opacity-10"
        style={{
          background: "conic-gradient(from 0deg, hsl(var(--mcc-gold)), hsl(var(--mcc-maroon)), transparent, hsl(var(--mcc-gold)))",
          animation: "slow-spin 20s linear infinite",
          filter: "blur(1px)",
        }}
      />

      {/* ── Main Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Outer glow ring */}
        <div
          className="absolute -inset-[1px] rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(var(--mcc-gold)/0.35), hsl(var(--mcc-maroon)/0.25), hsl(var(--mcc-gold)/0.15))",
          }}
        />

        {/* Card surface */}
        <div className="relative glass-panel rounded-3xl p-7 sm:p-9">

          {/* ── Header ── */}
          <div className="flex flex-col items-center gap-5 mb-8">
            {/* University crest */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              {/* Spinning gradient ring */}
              <div
                className="absolute -inset-2 rounded-2xl"
                style={{
                  background: "conic-gradient(from 0deg, hsl(var(--mcc-gold)/0.7), hsl(var(--mcc-maroon)/0.5), transparent, hsl(var(--mcc-gold)/0.7))",
                  animation: "slow-spin 6s linear infinite",
                  borderRadius: "18px",
                }}
              />
              <div
                className="absolute -inset-1.5 rounded-xl"
                style={{ background: "hsl(var(--background))", borderRadius: "16px" }}
              />
              <Link href="/" className="relative block">
                <img
                  src="/mcc_logo.png"
                  alt="Madras Christian College"
                  className="relative h-16 w-auto object-contain rounded-xl"
                />
              </Link>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-center"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight" style={{ fontFamily: "var(--font-playfair, Georgia, serif)" }}>
                Sign in to Ecosystem
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                Madras Christian College • Digital Portfolio Platform
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-mcc-gold/40" />
                <span className="text-[10px] text-mcc-gold font-bold uppercase tracking-[0.2em]">Est. 1837</span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-mcc-gold/40" />
              </div>
            </motion.div>
          </div>

          {/* ── Error Alert ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="mb-5 overflow-hidden"
              >
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-red-600 dark:text-red-300 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@mcc.edu.in"
                  className="input-glass w-full h-12 pl-10 pr-4 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-[11px] text-mcc-gold hover:text-mcc-gold-light hover:underline font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass w-full h-12 pl-10 pr-12 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015, y: loading ? 0 : -1 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full h-12 mt-2 rounded-xl font-semibold text-sm text-white overflow-hidden cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: "linear-gradient(135deg, hsl(var(--mcc-maroon)), hsl(var(--mcc-maroon-light)))",
                boxShadow: "0 6px 20px -6px hsl(var(--mcc-maroon)/0.6)",
              }}
            >
              {/* Shimmer on idle */}
              {!loading && <span className="shimmer absolute inset-0" />}

              {/* Button content */}
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* ── Divider ── */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700/60" />
            </div>
            <span className="relative px-3 bg-transparent text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-semibold" style={{ backdropFilter: "none" }}>
              or continue with
            </span>
          </div>

          {/* ── Social Login ── */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                name: "Google",
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
                action: () => alert("Google Login: Use email: student@mcc.edu.in, password: password123"),
              },
              {
                name: "GitHub",
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                ),
                action: () => alert("GitHub Login: Use email: student@mcc.edu.in, password: password123"),
              },
            ].map((provider) => (
              <motion.button
                key={provider.name}
                onClick={provider.action}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="h-11 glass-card rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
              >
                {provider.icon}
                {provider.name}
              </motion.button>
            ))}
          </div>

          {/* ── Register link ── */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-7">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-mcc-gold hover:text-mcc-gold-light font-semibold hover:underline transition-colors"
            >
              Create Profile
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
