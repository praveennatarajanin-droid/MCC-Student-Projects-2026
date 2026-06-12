'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';
import ClientOnly from '@/components/ClientOnly';
import { 
  Search, GraduationCap, Code, Brain, Globe, ArrowRight, 
  ExternalLink, Layers, Sparkles, Moon, Sun, Award, CheckCircle2,
  BookOpen, Users, Briefcase, Bookmark, ChevronRight, Loader2
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const MccCrestLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <img src="/mcc-logo.png" alt="MCC Logo" className={`${className} object-contain`} />
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 16 }
  }
};

interface SearchResult {
  id: string;
  name: string;
  email: string;
  departmentName: string;
  headline: string;
  bio: string;
  skills: string;
  usernameSlug: string;
  theme: string;
}

export default function Home() {
  const { user, logout } = useAuth();
  const { theme, mode, setMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [featuredTags, setFeaturedTags] = useState(['Next.js', 'React', 'ASP.NET Core', 'PostgreSQL', 'Python']);

  // Fetch all approved students initially
  useEffect(() => {
    handleSearch('');
  }, []);

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const response = await api.get(`/api/public/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Failed to search portfolios', err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(tag);
  };

  const content = (
    <div className="min-h-screen bg-page-bg text-text-main transition-colors duration-500 relative overflow-hidden flex flex-col font-sans antialiased">
      {/* Decorative background grid and blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-hover)_0%,_transparent_45%)] opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Sleek Apple-Inspired Navbar */}
      <header className="sticky top-0 z-50 w-full glass border-b border-card-border/60 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 active:scale-[0.99] transition-all">
            <MccCrestLogo className="h-10 sm:h-12 w-auto invert dark:invert-0 transition-all duration-300" />
            <div className="h-6 w-[1.5px] bg-card-border/80 self-center hidden sm:block" />
            <span className="text-sm font-black tracking-tight text-text-main leading-none hidden sm:block">
              Portfolios
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-lg border border-card-border/50 hover:bg-primary/5 transition-all text-text-muted hover:text-text-main cursor-pointer"
              title="Toggle theme mode"
            >
              {mode === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === 'SuperAdmin' || user.role === 'Admin' ? '/admin' : '/student'}
                  className="text-[11px] font-bold py-1.5 px-3 sm:px-3.5 rounded-xl bg-primary text-white hover:opacity-90 hover:shadow-sm transition-all active:scale-[0.98]"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-[11px] font-semibold py-1.5 px-3 rounded-xl border border-card-border hover:bg-red-500/5 hover:border-red-500/20 hover:text-red-500 transition-all cursor-pointer hidden sm:block"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-[11px] font-semibold py-1.5 px-2.5 sm:px-3 rounded-xl border border-card-border hover:bg-primary/5 transition-all text-text-muted hover:text-text-main"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-[11px] font-bold py-1.5 px-3 sm:px-3.5 rounded-xl bg-primary text-white hover:opacity-90 hover:shadow-sm transition-all active:scale-[0.98] hidden sm:block"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 sm:py-24 flex flex-col gap-24 relative z-10">
        
        {/* Apple-Style Hero Section */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto flex flex-col items-center gap-5 sm:gap-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-card-border bg-page-bg/50 text-text-muted text-[9px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span>Redesigned Placement Portal</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5.5xl font-extrabold tracking-tight leading-[1.08] text-text-main">
            Designed for <span className="text-primary font-black">Academic Excellence</span>.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-sm sm:text-base text-text-muted max-w-xl leading-relaxed">
            A premium, minimalist showcase of certified portfolios, student research, and verified competencies at Madras Christian College.
          </motion.p>

          {/* Minimalist Search Box */}
          <motion.div variants={itemVariants} className="w-full max-w-xl mt-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
              <input
                type="text"
                placeholder="Search by student, skills (e.g. Next.js), or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl border border-card-border/80 bg-page-bg/40 text-text-main placeholder-text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs sm:text-sm"
              />
              <Search className="absolute left-4 w-4.5 h-4.5 text-text-muted/60 group-focus-within:text-primary transition-colors" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 rounded-xl bg-primary text-white text-[11px] font-bold hover:opacity-90 hover:shadow-sm transition-all cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Popular Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
              <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-wider mr-1">Popular:</span>
              {featuredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-300 font-semibold cursor-pointer ${
                    searchQuery === tag
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-card-border/60 bg-page-bg/20 text-text-muted hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Student Portfolios Showcase Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-card-border/60 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-text-main tracking-tight flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-primary" />
                <span>Student Directory</span>
              </h2>
              <p className="text-[10px] text-text-muted mt-0.5">Explore portfolios approved by the placement cell</p>
            </div>
            {searchResults.length > 0 && (
              <span className="text-[9px] font-bold text-text-muted bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {searchResults.length} {searchResults.length === 1 ? 'student' : 'students'}
              </span>
            )}
          </div>

          {searching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-48 border border-card-border/60 bg-page-bg/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center max-w-sm mx-auto flex flex-col items-center gap-3">
              <Globe className="w-10 h-10 text-text-muted/40" />
              <div>
                <h3 className="text-sm font-bold text-text-main">No approved profiles found</h3>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Try adjusting your search criteria or register a student account.
                </p>
              </div>
              <Link
                href="/register"
                className="mt-1 text-[10px] font-bold py-1.5 px-3.5 rounded-xl bg-primary text-white hover:opacity-95 transition-all"
              >
                Create a Profile
              </Link>
            </div>
          ) : (
            <motion.div 
              layout 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {searchResults.map((student) => (
                  <motion.div
                    key={student.id}
                    variants={itemVariants}
                    layout
                    className="h-full flex"
                  >
                    <Link
                      href={`/student/${student.usernameSlug}`}
                      className="group relative glass rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col justify-between overflow-hidden w-full h-full"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <span className="text-[8px] px-1.5 py-0.5 rounded-md border border-card-border bg-page-bg/80 text-text-muted font-semibold uppercase tracking-wider">
                          {student.theme}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>

                      <div>
                        {/* Department tag */}
                        <span className="inline-block text-[8px] font-bold text-primary uppercase tracking-wider bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md mb-3.5">
                          {student.departmentName}
                        </span>

                        {/* Name */}
                        <h3 className="text-sm font-extrabold text-text-main group-hover:text-primary transition-colors flex items-center gap-1">
                          <span>{student.name}</span>
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                        </h3>

                        {/* Headline */}
                        <p className="text-[9px] font-bold text-text-muted mt-1 line-clamp-1 uppercase tracking-wider">
                          {student.headline || 'MCC Student'}
                        </p>

                        {/* Bio */}
                        <p className="text-[11px] text-text-muted/80 mt-2.5 line-clamp-3 leading-relaxed">
                          {student.bio || 'This student has not written a bio yet.'}
                        </p>
                      </div>

                      {/* Skills tags */}
                      <div className="mt-5 pt-3 border-t border-card-border/50">
                        <div className="flex flex-wrap gap-1">
                          {student.skills ? (
                            student.skills.split(';').slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-[9px] font-semibold bg-primary/5 text-primary/80 px-2 py-0.5 rounded-md"
                              >
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-text-muted/50 italic">No skills listed</span>
                          )}
                          {student.skills && student.skills.split(';').length > 3 && (
                            <span className="text-[9px] font-semibold bg-primary/5 text-primary px-1.5 py-0.5 rounded-md">
                              +{student.skills.split(';').length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>

        {/* Apple-style Columns section */}
        <section className="flex flex-col gap-10 border-t border-card-border/60 pt-16">
          <div className="max-w-lg mx-auto text-center flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
              Built for Professional Placements.
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Designed as a premium bridge between academic metrics, placement cell oversight, and student readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-main">Dynamic Customization</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Seamlessly swap themes (Academic, Corporate, Creative, or the new Apple Minimal) with absolute clarity, supporting customized styling on verified profile layouts.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-main">Career Readiness AI</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Generate highly tailored Statements of Purpose, extract resume metrics, and check compatibility rankings against internship requirements in real-time.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/8 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-text-main">Institutional Verification</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every record submitted undergoes placement cell review. Approved student profiles receive dynamic QR cards and live public timeline layouts.
              </p>
            </div>
          </div>
        </section>

        {/* Platforms stack overview */}
        <section className="glass rounded-[24px] p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-secondary" />
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
              MCC Portfolio Architecture
            </h2>
            <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed max-w-xl">
              Engineered with ASP.NET Core API backend, Next.js app client, and PostgreSQL database. Core tracking systems map to relational schemas to guarantee verifiable profile records.
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-card-border bg-page-bg/30">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>PostgreSQL DB</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-card-border bg-page-bg/30">
                <Code className="w-3.5 h-3.5 text-secondary" />
                <span>ASP.NET Core Web API</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-card-border bg-page-bg/30">
                <Layers className="w-3.5 h-3.5 text-green-500" />
                <span>Next.js App Client</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="/register"
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <span>Build Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-card-border/60 bg-page-bg/40 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-text-muted font-medium">
              © {new Date().getFullYear()} Madras Christian College. Redesigned Placement &amp; Portfolio Portal.
            </p>
          </div>
          <div className="flex items-center gap-3.5 text-[10px] font-bold text-text-muted/70">
            <a href="#" className="hover:text-primary transition-all">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-all">Terms</a>
            <span>•</span>
            <Link href="/login" className="hover:text-primary transition-all">Admin Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );

  return <ClientOnly fallback={<div suppressHydrationWarning className="min-h-screen bg-page-bg flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>{content}</ClientOnly>;
}
