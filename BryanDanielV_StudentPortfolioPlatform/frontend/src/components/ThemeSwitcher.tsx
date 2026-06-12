"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
        border border-slate-200 dark:border-slate-700
        bg-slate-100/80 dark:bg-slate-800/80
        backdrop-blur-sm
        hover:border-mcc-gold/50 dark:hover:border-mcc-gold/40
        transition-all duration-300 cursor-pointer group
        ${className}`}
    >
      {/* Track */}
      <div className="relative w-8 h-4.5 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 overflow-hidden">
        {/* Sliding thumb */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 700, damping: 35 }}
          className={`absolute top-0.5 w-3.5 h-3.5 rounded-full shadow-sm transition-colors duration-300
            ${isDark
              ? "right-0.5 bg-mcc-gold"
              : "left-0.5 bg-mcc-maroon"
            }`}
        />
      </div>

      {/* Icon */}
      <div className="w-4 h-4 flex items-center justify-center overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-mcc-gold absolute"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-amber-500 absolute"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>

      {/* Label */}
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline-block transition-colors duration-300 group-hover:text-mcc-gold">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
