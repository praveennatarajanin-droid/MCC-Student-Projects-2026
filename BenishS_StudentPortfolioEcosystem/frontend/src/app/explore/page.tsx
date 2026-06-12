'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, GraduationCap, Filter, ArrowLeftRight, X, ArrowUpDown, 
  BookOpen, Briefcase, Award, Flame, Users, Sparkles, MapPin, 
  ExternalLink, CheckSquare, Square
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { portfolioApi } from '@/lib/api';

export default function ExplorePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [inst, setInst] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // name, projects, certs, research, total
  
  // Compare state (array of usernames)
  const [compareList, setCompareList] = useState<any[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    // Fetch institution info
    portfolioApi.getInstitution()
      .then(data => setInst(data))
      .catch(() => {});

    // Fetch approved student list
    fetch('http://localhost:5113/api/publiclist/students')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setStudents(data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Unique departments for filter
  const departments = ['All', ...Array.from(new Set(students.map(s => s.department).filter(Boolean)))];
  // Unique themes for filter
  const themes = ['All', ...Array.from(new Set(students.map(s => s.theme).filter(Boolean)))];

  // Filtering logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills?.some((tech: string) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === 'All' || student.department === selectedDept;
    const matchesTheme = selectedTheme === 'All' || student.theme === selectedTheme;

    return matchesSearch && matchesDept && matchesTheme;
  });

  // Sorting logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'projects') {
      return b.projectCount - a.projectCount;
    }
    if (sortBy === 'certs') {
      return b.certCount - a.certCount;
    }
    if (sortBy === 'research') {
      return b.researchCount - a.researchCount;
    }
    if (sortBy === 'total') {
      const totalA = a.projectCount + a.certCount + a.researchCount + a.hackathonCount + a.achievementCount;
      const totalB = b.projectCount + b.certCount + b.researchCount + b.hackathonCount + b.achievementCount;
      return totalB - totalA;
    }
    // Default: name A-Z
    return (a.fullName || '').localeCompare(b.fullName || '');
  });

  // Toggle compare selection
  const handleToggleCompare = (student: any) => {
    if (compareList.some(s => s.username === student.username)) {
      setCompareList(compareList.filter(s => s.username !== student.username));
    } else {
      if (compareList.length >= 2) {
        alert('You can compare a maximum of 2 student portfolios.');
        return;
      }
      setCompareList([...compareList, student]);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col bg-theme-bg text-theme-fg">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-theme-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-theme-accent/5 blur-[120px] pointer-events-none" />

      {/* =========== HEADER =========== */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 w-full z-50 glass border-b border-theme-border/50 py-3.5 px-5 md:px-10 flex justify-between items-center"
      >
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          {inst?.logoUrl ? (
            <img src={inst.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform shrink-0 border border-theme-border/20" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-md shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <div>
            <span className="font-extrabold text-sm tracking-tight block leading-tight uppercase truncate max-w-[200px] sm:max-w-sm">{inst?.name || 'MADRAS CHRISTIAN COLLEGE'}</span>
            <span className="text-[10px] text-theme-fg/50 tracking-widest font-bold uppercase block mt-0.5">Explore Portfolios</span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="text-xs font-bold px-3.5 py-2 rounded-xl glass border border-theme-border/40 hover:bg-theme-primary/5 transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-xs font-bold px-4 py-2 rounded-xl bg-theme-primary text-white hover:bg-theme-primary-hover shadow-sm transition-all">
            Dashboard
          </Link>
        </nav>
      </motion.header>

      {/* =========== MAIN CONTENT =========== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8 z-10 relative flex flex-col gap-8">
        
        {/* Title / Info */}
        <div className="text-center md:text-left space-y-2 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass text-[11px] font-bold text-theme-primary bg-theme-primary/5 border-theme-border/30">
            <Users size={12} />
            Student Registry & Showcase Directory
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Discover Talent & Achievements
          </h1>
          <p className="text-sm text-theme-fg/60">
            Search and explore digital student portfolios at {inst?.name || 'Madras Christian College'}. Compare skill metrics, qualifications, and creative assets.
          </p>
        </div>

        {/* Search, Filter & Sort Bar */}
        <div className="glass p-5 rounded-3xl border border-theme-border/30 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute left-3.5 top-3.5 text-theme-fg/40 group-focus-within:text-theme-primary transition-colors">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by student, skill, stacks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl glass border border-theme-border/40 outline-none text-xs font-semibold focus:border-theme-primary/60 transition-all"
            />
          </div>

          {/* Filtering controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 glass px-3.5 py-2.5 rounded-2xl border border-theme-border/40 text-xs font-semibold w-full sm:w-auto">
              <Filter size={13} className="text-theme-primary shrink-0" />
              <span className="text-theme-fg/50 mr-1 shrink-0">Dept:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent outline-none border-none text-xs font-bold text-theme-fg cursor-pointer max-w-[120px]"
              >
                {departments.map(d => (
                  <option key={d} value={d} className="bg-theme-bg text-theme-fg">{d}</option>
                ))}
              </select>
            </div>

            {/* Theme Filter */}
            <div className="flex items-center gap-1.5 glass px-3.5 py-2.5 rounded-2xl border border-theme-border/40 text-xs font-semibold w-full sm:w-auto">
              <Sparkles size={13} className="text-theme-primary shrink-0" />
              <span className="text-theme-fg/50 mr-1 shrink-0">Theme:</span>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="bg-transparent outline-none border-none text-xs font-bold text-theme-fg cursor-pointer max-w-[120px]"
              >
                {themes.map(t => (
                  <option key={t} value={t} className="bg-theme-bg text-theme-fg">{t}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 glass px-3.5 py-2.5 rounded-2xl border border-theme-border/40 text-xs font-semibold w-full sm:w-auto">
              <ArrowUpDown size={13} className="text-theme-primary shrink-0" />
              <span className="text-theme-fg/50 mr-1 shrink-0">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none border-none text-xs font-bold text-theme-fg cursor-pointer"
              >
                <option value="name" className="bg-theme-bg text-theme-fg">Name (A-Z)</option>
                <option value="projects" className="bg-theme-bg text-theme-fg">Most Projects</option>
                <option value="certs" className="bg-theme-bg text-theme-fg">Most Certs</option>
                <option value="research" className="bg-theme-bg text-theme-fg">Publications</option>
                <option value="total" className="bg-theme-bg text-theme-fg">Overall Activity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Results grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-theme-primary border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-theme-fg/50 animate-pulse">Loading portfolios directory…</p>
          </div>
        ) : sortedStudents.length === 0 ? (
          <div className="py-24 text-center glass border border-dashed border-theme-border/40 rounded-3xl flex flex-col items-center justify-center gap-3">
            <Users size={32} className="text-theme-fg/20" />
            <h3 className="font-extrabold text-sm text-theme-fg/75">No Student Portfolios Found</h3>
            <p className="text-xs text-theme-fg/40 max-w-xs mx-auto">
              Try adjusting your search query, selecting another department, or removing theme filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedStudents.map((student) => {
              const isSelected = compareList.some(s => s.username === student.username);
              const totalActivities = 
                student.projectCount + 
                student.certCount + 
                student.researchCount + 
                student.hackathonCount + 
                student.achievementCount + 
                student.communityCount + 
                student.creativeCount;

              return (
                <motion.div
                  key={student.username}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="glass rounded-3xl border border-theme-border/40 overflow-hidden flex flex-col relative group hover:shadow-md hover:border-theme-primary/30 transition-all duration-300"
                >
                  {/* Select for Compare Checkbox (Top Right Overlay) */}
                  <button
                    onClick={() => handleToggleCompare(student)}
                    className={`absolute top-4 right-4 z-20 p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-theme-primary text-white border-theme-primary' 
                        : 'bg-theme-bg/40 text-theme-fg/40 border-theme-border/50 hover:text-theme-primary hover:bg-theme-bg/70'
                    }`}
                    title={isSelected ? "Remove from comparison" : "Compare this student"}
                  >
                    <ArrowLeftRight size={13} />
                  </button>

                  {/* Header Banner Emulator */}
                  <div className="h-16 bg-gradient-to-r from-theme-primary/20 via-theme-accent/15 to-theme-primary/10 relative" />

                  {/* Body Content */}
                  <div className="px-5 pb-5 pt-0 flex-1 flex flex-col relative">
                    {/* Profile avatar overlap */}
                    <div className="relative -mt-8 mb-3 z-10 flex items-end justify-between">
                      <div
                        className="w-16 h-16 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-lg border-2 border-theme-bg shadow-md overflow-hidden shrink-0"
                        style={student.avatarUrl ? { backgroundImage: `url(${student.avatarUrl})`, backgroundSize: 'cover', color: 'transparent' } : {}}
                      >
                        {!student.avatarUrl && student.fullName?.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-theme-border/50 bg-theme-bg text-theme-fg/60">
                        Theme: {student.theme}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-extrabold text-sm text-theme-fg leading-tight block group-hover:text-theme-primary transition-colors">
                        {student.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-theme-fg/50 font-bold uppercase tracking-wider">
                        <GraduationCap size={11} className="text-theme-primary" />
                        <span>{student.department || 'Computer Science'}</span>
                      </div>
                      
                      {student.bio ? (
                        <p className="text-xs text-theme-fg/60 line-clamp-2 pt-1 font-medium leading-relaxed">
                          {student.bio}
                        </p>
                      ) : (
                        <p className="text-xs text-theme-fg/30 italic pt-1">
                          No professional summary written yet.
                        </p>
                      )}
                    </div>

                    {/* Quick Stats list */}
                    <div className="grid grid-cols-4 gap-1 border-t border-b border-theme-border/20 py-2.5 my-4 text-center">
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold text-theme-primary">{student.projectCount}</span>
                        <span className="block text-[8px] font-bold text-theme-fg/45 uppercase tracking-wider">Proj</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold text-theme-primary">{student.certCount}</span>
                        <span className="block text-[8px] font-bold text-theme-fg/45 uppercase tracking-wider">Cert</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold text-theme-primary">{student.researchCount}</span>
                        <span className="block text-[8px] font-bold text-theme-fg/45 uppercase tracking-wider">Pubs</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-extrabold text-theme-primary">{totalActivities}</span>
                        <span className="block text-[8px] font-bold text-theme-fg/45 uppercase tracking-wider">Activity</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 items-center mt-auto">
                      <Link 
                        href={`/student/${student.username}`}
                        className="flex-1 py-2.5 rounded-xl bg-theme-primary/5 hover:bg-theme-primary text-theme-primary hover:text-white text-xs font-bold text-center border border-theme-primary/10 hover:border-transparent transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-theme-primary/5 group/btn"
                      >
                        View Portfolio
                        <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating comparison bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2.5rem)] px-5 py-4 rounded-3xl glass border border-theme-primary/45 shadow-xl shadow-theme-primary/10 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-theme-primary/15 text-theme-primary flex items-center justify-center shrink-0">
                <ArrowLeftRight size={14} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold text-theme-fg/80 leading-tight">Comparison Drawer</span>
                <span className="block text-[10px] text-theme-fg/50 font-semibold truncate">
                  {compareList.map(s => s.fullName).join(' vs ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => setCompareList([])}
                className="p-1.5 rounded-lg hover:bg-theme-fg/10 text-theme-fg/40 hover:text-theme-fg transition-colors"
                title="Clear selected"
              >
                <X size={14} />
              </button>
              
              <button
                disabled={compareList.length < 2}
                onClick={() => {
                  if (compareList.length === 2) {
                    router.push(`/compare?u1=${compareList[0].username}&u2=${compareList[1].username}`);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  compareList.length === 2
                    ? 'bg-theme-primary text-white hover:bg-theme-primary-hover shadow-theme-primary/15 cursor-pointer'
                    : 'bg-theme-border/40 text-theme-fg/30 border border-theme-border/30 cursor-not-allowed'
                }`}
                title={compareList.length < 2 ? "Select one more portfolio to compare" : "Start side-by-side comparison"}
              >
                {compareList.length < 2 ? 'Select 2' : 'Compare'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========== FOOTER =========== */}
      <footer className="glass border-t border-theme-border/30 py-5 px-6 text-center z-10 mt-12">
        <p className="text-xs text-theme-fg/45">
          &copy; {new Date().getFullYear()} {inst?.name || 'Madras Christian College'} · All rights reserved.
        </p>
      </footer>
    </div>
  );
}
