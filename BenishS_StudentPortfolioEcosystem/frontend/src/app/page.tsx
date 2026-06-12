'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, GraduationCap, Sparkles, BookOpen, Users, TrendingUp } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { portfolioApi } from '@/lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const [searchUsername, setSearchUsername] = useState('');
  const [inst, setInst] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    portfolioApi.getInstitution()
      .then(data => setInst(data))
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    router.push(`/student/${searchUsername.trim().toLowerCase()}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-15%] right-[-8%] w-[650px] h-[650px] rounded-full bg-theme-primary/10 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute bottom-[-15%] left-[-8%] w-[550px] h-[550px] rounded-full bg-theme-accent/10 blur-[160px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-theme-accent/8 blur-[100px] pointer-events-none"
      />

      {/* =========== HEADER =========== */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 w-full z-50 glass border-b border-theme-border/50 py-3.5 px-5 md:px-10 flex justify-between items-center"
      >
        <Link href="/" className="flex items-center gap-3 md:gap-3.5 group shrink-0">
          {inst?.logoUrl ? (
            <img src={inst.logoUrl} alt="Logo" className="w-9 h-9 md:w-12 md:h-12 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform duration-200 border border-theme-border/30 shrink-0" />
          ) : (
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-md shadow-theme-primary/20 group-hover:scale-110 transition-transform duration-200 shrink-0">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-bold text-xs md:text-sm tracking-tight block leading-tight uppercase max-w-[140px] sm:max-w-sm truncate">{inst?.name || 'MADRAS CHRISTIAN COLLEGE'}</span>
            <span className="text-[9px] md:text-[10px] text-theme-fg/50 tracking-widest font-bold uppercase block mt-0.5">Portfolio Platform</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden md:block text-sm font-semibold text-theme-fg/70 hover:text-theme-primary transition-colors px-3 py-2 rounded-xl hover:bg-theme-primary/5"
          >
            Sign In
          </Link>
          <Link
            href="/login?register=true"
            className="px-4 py-2 rounded-xl text-sm font-bold bg-theme-primary text-white hover:bg-theme-primary-hover transition-all shadow-md shadow-theme-primary/15 hover:shadow-theme-primary/25"
          >
            Get Started
          </Link>
        </nav>
      </motion.header>

      {/* =========== HERO =========== */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-12 pb-8 md:pt-20 md:pb-12 max-w-5xl mx-auto w-full z-10 relative">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="text-center max-w-3xl w-full space-y-7"
        >
          {/* Pill badge */}
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-bold text-theme-primary bg-theme-primary/5 border-theme-border/40 shadow-sm">
              <Sparkles size={13} />
              AI-Powered Student Portfolio Ecosystem · {inst?.shortName || 'MCC'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-[3.6rem] font-extrabold tracking-tight leading-[1.1] font-display text-balance"
          >
            Showcase Your{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-move_4s_linear_infinite]">
                Academic Journey
              </span>
            </span>
            {' '}to the World
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base md:text-lg text-theme-fg/65 max-w-2xl mx-auto leading-relaxed"
          >
            Build your digital identity in minutes. Curate projects, research publications,
            certifications, and extracurriculars — powered by AI insights.
          </motion.p>

          {/* Search Box */}
          <motion.form variants={fadeUp} custom={3} onSubmit={handleSearch} className="max-w-md mx-auto w-full">
            <div className="relative flex items-center group">
              <div className="absolute left-4 text-theme-fg/35 group-focus-within:text-theme-primary transition-colors">
                <Search size={17} />
              </div>
              <input
                id="portfolio-search"
                type="text"
                placeholder="Search student portfolio by username…"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="w-full pl-11 pr-28 py-4 rounded-2xl glass outline-none text-sm font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="absolute right-2 px-4 py-2.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Search
              </motion.button>
            </div>
          </motion.form>
        </motion.div>

        {/* =========== STATS STRIP =========== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="w-full mt-10 glass py-5 px-6 md:px-10 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center"
        >
          {[
            { value: '2,500+', label: 'Active Portfolios', icon: <Users size={14} /> },
            { value: '85%', label: 'Placement Ready', icon: <TrendingUp size={14} /> },
            { value: '500+', label: 'Research Papers', icon: <BookOpen size={14} /> },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.95 + i * 0.1 }}
              className={`py-2 ${i < 2 ? 'sm:border-r border-theme-border/30' : ''}`}
            >
              <span className="block text-2xl md:text-3xl font-extrabold text-theme-primary">{stat.value}</span>
              <span className="flex items-center justify-center gap-1.5 text-[10px] text-theme-fg/55 font-semibold uppercase tracking-wider mt-0.5">
                {stat.icon}
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* =========== FOOTER =========== */}
      <footer className="glass border-t border-theme-border/30 py-5 px-6 text-center z-10">
        <p className="text-xs text-theme-fg/45">
          &copy; {new Date().getFullYear()} {inst?.name || 'Madras Christian College'} · All rights reserved.
        </p>
        <p className="text-[10px] text-theme-fg/30 mt-0.5">
          Built for NAAC/NIRF Documentation & Student Digital Transformation.
        </p>
      </footer>

      <style jsx global>{`
        @keyframes gradient-move {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
