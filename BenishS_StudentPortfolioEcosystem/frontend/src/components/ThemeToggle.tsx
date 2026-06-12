'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    // Briefly disable transitions to prevent flash
    root.classList.add('dark-transition');
    setTimeout(() => root.classList.remove('dark-transition'), 50);

    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // Prevent hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl glass border-theme-border/50 shrink-0 no-print" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-xl glass border-theme-border/50 text-theme-fg/70 hover:text-theme-primary hover:bg-theme-primary/5 transition-all duration-200 cursor-pointer no-print flex items-center justify-center shrink-0 overflow-hidden group"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          darkMode ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
        }`}
      >
        <Sun size={16} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          darkMode ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <Moon size={16} className="group-hover:-rotate-12 transition-transform duration-300" />
      </span>
    </button>
  );
}
