"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/utils/api";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function ResearchRepository() {
  const [publications, setPublications] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState<any>(null);

  const departments = [
    { id: "", name: "All Departments" },
    { id: "computer applications (mca)", name: "MCA" },
    { id: "computer science", name: "Computer Science" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "commerce", name: "Commerce" },
  ];

  const loadPublications = async (searchVal = "", deptVal = "") => {
    try {
      setLoading(true);
      let url = "/student/public-publications";
      const params = [];
      if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
      if (deptVal) params.push(`department=${encodeURIComponent(deptVal)}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const data = await api.get<any[]>(url);
      setPublications(data || []);
    } catch (err) {
      console.error("Failed to load publications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPublications(search, selectedDept);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [search, selectedDept]);

  // Statistics calculation
  const totalPublicationsCount = publications.length;
  
  const uniqueDepts = Array.from(
    new Set(publications.map((p) => p.student?.department?.toLowerCase()).filter(Boolean))
  );
  const totalDepartmentsCount = uniqueDepts.length;

  const uniqueJournals = Array.from(
    new Set(publications.map((p) => p.journalOrConference?.toLowerCase()).filter(Boolean))
  );
  const totalJournalsCount = uniqueJournals.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as any },
    },
  };

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-mcc-maroon/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-mcc-gold/10 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <img src="/mcc_logo.png" alt="Madras Christian College Logo" className="h-12 w-auto object-contain rounded-md shadow-sm border border-slate-200/10 dark:border-white/5" />
            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-4 py-1">
              <span className="font-extrabold text-sm tracking-wider text-slate-800 dark:text-slate-100 block leading-tight uppercase">
                Research Registry
              </span>
              <span className="text-[10px] text-mcc-gold tracking-widest uppercase font-bold block mt-0.5">
                Ecosystem
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-650 dark:text-slate-300">
            <Link href="/" className="hover:text-mcc-gold transition-colors">Directory Showcase</Link>
            <Link href="/research" className="text-mcc-gold font-bold">Research Papers</Link>
            <Link href="/login" className="hover:text-mcc-gold transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link href="/login">
              <button className="px-5 py-2 rounded-full border border-mcc-gold/40 text-mcc-gold hover:bg-mcc-gold/10 transition-all font-medium text-sm cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 relative z-10">
        {/* Title Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
          <span className="text-xs text-mcc-gold font-bold tracking-widest uppercase">Scholarly Registry</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-5xl">
            Student Research Repository
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Explore peer-reviewed publications, conference proceedings, and scientific papers published by students at Madras Christian College.
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-mcc-gold/25 transition-all">
            <div className="w-12 h-12 rounded-xl bg-mcc-maroon/10 dark:bg-mcc-maroon/20 flex items-center justify-center border border-mcc-maroon/25 shrink-0">
              <svg className="w-6 h-6 text-mcc-maroon-light dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Publications Indexed</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "..." : totalPublicationsCount}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-mcc-gold/25 transition-all">
            <div className="w-12 h-12 rounded-xl bg-mcc-gold/10 dark:bg-mcc-gold/20 flex items-center justify-center border border-mcc-gold/25 shrink-0">
              <svg className="w-6 h-6 text-mcc-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Contributing Departments</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "..." : totalDepartmentsCount}</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-mcc-gold/25 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/25 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Different Journals & Venues</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? "..." : totalJournalsCount}</span>
            </div>
          </div>
        </div>

        {/* Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl mb-8">
          <div className="relative w-full md:w-96 flex items-center">
            <svg className="absolute left-4 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search papers, journals, authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Department Pills */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedDept === dept.id
                    ? "bg-mcc-gold/15 border-mcc-gold text-mcc-gold shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Publications Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
            <div className="w-10 h-10 border-4 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin" />
            <p className="text-sm">Fetching publication logs...</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="p-20 border border-slate-200 dark:border-slate-900 border-dashed rounded-2xl text-center bg-slate-100/10 dark:bg-slate-950/10 max-w-xl mx-auto">
            <svg className="w-12 h-12 text-slate-400 dark:text-slate-650 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium italic block">No research papers found matching your query.</span>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {publications.map((pub) => (
              <motion.div
                key={pub.id}
                variants={itemVariants}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[300px] border border-slate-200 dark:border-slate-900 hover:border-mcc-gold/30 transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.04)]"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-mcc-maroon/10 dark:bg-mcc-maroon/20 border border-mcc-maroon/20 text-[9px] font-bold text-mcc-maroon-light dark:text-red-300 uppercase tracking-wide truncate max-w-[150px]">
                      {pub.journalOrConference}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{formatDate(pub.publishDate)}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-snug line-clamp-2 hover:text-mcc-gold transition-colors cursor-pointer" onClick={() => setSelectedPub(pub)}>
                    {pub.title}
                  </h3>

                  <div className="text-xs text-slate-500 dark:text-slate-450 italic flex flex-wrap items-center gap-1.5">
                    <span>Authors:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-350">{pub.authors}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4 mt-1">
                    {pub.abstract}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-slate-900/60 mt-4">
                  {/* Student profile reference */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-semibold">Published By:</span>
                    {pub.student?.slug ? (
                      <Link
                        href={`/portfolio/${pub.student.slug}`}
                        target="_blank"
                        className="text-[11px] font-bold text-mcc-gold hover:underline flex items-center gap-1 shrink-0"
                      >
                        {pub.student.firstName} {pub.student.lastName}
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {pub.student?.firstName} {pub.student?.lastName}
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 shrink-0 font-medium uppercase">
                      {pub.student?.department}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <button
                      onClick={() => setSelectedPub(pub)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0"
                    >
                      Read Abstract
                    </button>
                    {pub.paperUrl && (
                      <a
                        href={pub.paperUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light hover:from-mcc-maroon-light hover:to-red-600 text-xs font-bold text-slate-100 border border-mcc-gold/20 flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                      >
                        View Paper
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-900 py-8 bg-slate-100/60 dark:bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Madras Christian College. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-mcc-gold transition-colors">Home Page</Link>
            <a href="#" className="hover:text-mcc-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-mcc-gold transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Abstract Full Dialog Modal */}
      <AnimatePresence>
        {selectedPub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPub(null)}
                className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col gap-4">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-mcc-maroon/15 dark:bg-mcc-maroon/30 border border-mcc-maroon/30 text-[10px] font-bold text-mcc-maroon-light dark:text-red-300 uppercase tracking-wider">
                    {selectedPub.journalOrConference}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Published: {formatDate(selectedPub.publishDate)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-550 font-bold uppercase">
                    {selectedPub.student?.department}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-snug">
                  {selectedPub.title}
                </h2>

                {/* Authors */}
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Authors: <span className="font-semibold text-slate-800 dark:text-slate-300">{selectedPub.authors}</span>
                </div>

                {/* Abstract Text */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2 max-h-[300px] overflow-y-auto pr-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Abstract</h4>
                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                    {selectedPub.abstract}
                  </p>
                </div>

                {/* Footer details & CTAs */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Publisher profile info */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Student Profile:</span>
                    {selectedPub.student?.slug ? (
                      <Link
                        href={`/portfolio/${selectedPub.student.slug}`}
                        target="_blank"
                        onClick={() => setSelectedPub(null)}
                        className="text-xs font-bold text-mcc-gold hover:underline flex items-center gap-1"
                      >
                        {selectedPub.student.firstName} {selectedPub.student.lastName}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {selectedPub.student?.firstName} {selectedPub.student?.lastName}
                      </span>
                    )}
                  </div>

                  {/* Close and View External */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedPub(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-850 cursor-pointer"
                    >
                      Close
                    </button>
                    {selectedPub.paperUrl && (
                      <a
                        href={selectedPub.paperUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2 bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light hover:from-mcc-maroon-light hover:to-red-600 text-xs font-bold text-slate-100 rounded-xl border border-mcc-gold/20 flex items-center justify-center gap-1.5 transition-all shadow"
                      >
                        Open Full Paper Reference
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
