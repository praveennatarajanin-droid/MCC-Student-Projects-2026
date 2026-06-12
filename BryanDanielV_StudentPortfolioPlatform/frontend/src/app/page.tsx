"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/utils/api";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useInstitutionConfig } from "@/context/InstitutionConfigContext";

export default function Home() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const { config } = useInstitutionConfig();

  const departments = [
    { id: "", name: "All Departments" },
    { id: "computer applications (mca)", name: "MCA" },
    { id: "computer science", name: "Computer Science" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "commerce", name: "Commerce" },
  ];

  const loadPortfolios = async (searchVal = "", deptVal = "") => {
    try {
      setLoading(true);
      let url = "/student/public-portfolios";
      const params = [];
      if (searchVal) params.push(`search=${encodeURIComponent(searchVal)}`);
      if (deptVal) params.push(`department=${encodeURIComponent(deptVal)}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      const data = await api.get<any[]>(url);
      setPortfolios(data || []);
    } catch (err) {
      console.error("Failed to load portfolios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPortfolios(search, selectedDept);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [search, selectedDept]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const pillars = [
    {
      title: "Academic & Skill Profiling",
      desc: "Compile academic milestones, automated coding logs, certifications, and leadership roles in one unified profile.",
      icon: (
        <svg className="w-6 h-6 text-mcc-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      details: [
        "Automated CGPA tracking & verification",
        "Integration of verified coding logs (GitHub, Behance)",
        "Verified badges from academic coordinators",
        "Automated resume scorecard scoring"
      ],
      actionText: "Explore Student Showcase",
      action: "showcase"
    },
    {
      title: "Research & Innovation",
      desc: "Promote scholarly visibility through a centralized repository for student publications, projects, and startup ideas.",
      icon: (
        <svg className="w-6 h-6 text-mcc-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      details: [
        "Centralized registry of peer-reviewed student journals",
        "Direct indexing of conference publications",
        "Venture pitch system for student startup prototypes",
        "Evaluation workflows for coordinator reviews"
      ],
      actionText: "Search Research Publications",
      action: "research"
    },
    {
      title: "Placement Readiness",
      desc: "Assess industry readiness with AI feedback on portfolios, dynamic scorecards, and custom resume generation.",
      icon: (
        <svg className="w-6 h-6 text-mcc-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
        </svg>
      ),
      details: [
        "AI-assisted portfolio & statement of purpose writing",
        "Direct connection stubs for recruiter inquiries",
        "Placement drive listings and notifications",
        "One-click PDF resume template export"
      ],
      actionText: "Build Your Profile",
      action: "register"
    },
    {
      title: "Career & Incubator Sync",
      desc: "Gain exposure to recruitment matching, higher studies support, and seed funding for student ventures.",
      icon: (
        <svg className="w-6 h-6 text-mcc-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      details: [
        "Higher studies recommendations matching CGPA & papers",
        "Incubator matching for MVP and prototype ventures",
        "Direct connections with MCC alumni network",
        "Verification workflows by Innovation Cell"
      ],
      actionText: "Sign In to Portal",
      action: "login"
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col justify-between">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-mcc-maroon/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-mcc-gold/10 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/mcc_logo.png" alt="Madras Christian College Logo" className="h-12 w-auto object-contain rounded-md shadow-sm border border-slate-200/10 dark:border-white/5" />
            <div className="hidden sm:block border-l border-slate-200 dark:border-slate-800 pl-4 py-1">
              <span className="font-extrabold text-sm tracking-wider text-slate-800 dark:text-slate-100 block leading-tight uppercase">
                Student Portfolio
              </span>
              <span className="text-[10px] text-mcc-gold tracking-widest uppercase font-bold block mt-0.5">
                Ecosystem
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-650 dark:text-slate-300">
            <a href="#showcase" className="hover:text-mcc-gold transition-colors">Directory Showcase</a>
            <Link href="/research" className="hover:text-mcc-gold transition-colors">Research Repository</Link>
            <a href="#about" className="hover:text-mcc-gold transition-colors">Core Pillars</a>
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
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-12 gap-12 items-center"
          >
            {/* Hero Column */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mcc-maroon/20 border border-mcc-maroon/50 text-xs text-red-300 font-medium tracking-wide w-fit">
                <span className="w-2 h-2 rounded-full bg-mcc-gold animate-pulse" />
                Empowering Students for Global Success
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-800 dark:text-slate-100"
              >
                {config.institutionName} <br />
                <span className="bg-gradient-to-r from-red-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  AI-Powered Portfolio Ecosystem
                </span>
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed"
              >
                Build a world-class digital identity. Showcase your academic excellence, research publications, certifications, and project accomplishments, driven by intelligent career matching and placement recommendation models.
              </motion.p>

              {/* Vision / Mission Quote Block */}
              {(config.vision || config.mission) && (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col gap-3 border-l-2 border-mcc-gold/60 pl-4 mt-1"
                >
                  {config.mission && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                      <span className="font-bold text-mcc-gold not-italic">Mission: </span>
                      {config.mission}
                    </p>
                  )}
                  {config.vision && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                      <span className="font-bold text-mcc-gold not-italic">Vision: </span>
                      {config.vision}
                    </p>
                  )}
                </motion.div>
              )}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/register">
                  <button className="h-12 px-8 rounded-lg bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light text-slate-100 hover:from-mcc-maroon-light hover:to-red-600 transition-all font-semibold shadow-lg shadow-red-950/40 w-full sm:w-auto">
                    Build Your Portfolio
                  </button>
                </Link>
                <a href="#showcase" className="w-full sm:w-auto">
                  <button className="h-12 px-8 rounded-lg border border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition-all font-semibold w-full">
                    Explore Showcase
                  </button>
                </a>
              </motion.div>
            </div>

            {/* Cards Grid Column */}
            <div className="lg:col-span-5 grid sm:grid-cols-2 gap-4">
              {pillars.map((pillar, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  onClick={() => setSelectedPillar(pillar)}
                  className="glass-card p-6 rounded-xl flex flex-col gap-4 cursor-pointer hover:border-mcc-gold/60 active:scale-[0.98] transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner group-hover:border-mcc-gold/40 transition-colors">
                    {pillar.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between gap-1.5">
                      <span>{pillar.title}</span>
                      <span className="text-xs text-mcc-gold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0">→</span>
                    </h3>
                    <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Directory Showcase Section */}
        <section id="showcase" className="border-t border-slate-200 dark:border-slate-900 bg-slate-100/40 dark:bg-slate-950/40 py-16 md:py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col gap-10">
            <div className="text-center md:text-left">
              <span className="text-xs text-mcc-gold font-bold tracking-widest uppercase block">Institutional Registry</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">Student Showcase Directory</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
                Search and explore public portfolios of Madras Christian College students verified by our academic placement cells.
              </p>
            </div>

            {/* Search Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900/25 border border-slate-200 dark:border-slate-900 p-5 rounded-2xl">
              <div className="relative w-full md:w-96 flex items-center">
                <svg className="absolute left-4 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, bio keywords, or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Department Pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedDept === dept.id
                        ? "bg-mcc-gold/15 border-mcc-gold text-mcc-gold shadow"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Showcase Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                <div className="w-10 h-10 border-4 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin" />
                <p className="text-sm">Retrieving showcase directory...</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className="p-16 border border-slate-900 border-dashed rounded-2xl text-center bg-slate-900/5">
                <span className="text-sm text-slate-500 italic block">No approved portfolios found matching your filters.</span>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((port) => (
                  <Link href={`/portfolio/${port.slug}`} key={port.slug} target="_blank">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-6 border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/10 backdrop-blur rounded-2xl flex flex-col justify-between h-[250px] cursor-pointer hover:border-mcc-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.06)] transition-all"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border border-mcc-gold/30 overflow-hidden bg-slate-900 shrink-0">
                            {port.student?.avatarUrl ? (
                              <img src={port.student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-mcc-maroon flex items-center justify-center font-bold text-mcc-gold text-sm">
                                {port.student?.firstName?.[0]}{port.student?.lastName?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm truncate">
                              {port.student?.firstName} {port.student?.lastName}
                            </h4>
                            <span className="text-[10px] text-mcc-gold font-bold block truncate">{port.student?.department}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {port.student?.bio || "Madras Christian College student portfolio."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-900/60 pt-4 mt-2">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">{port.student?.batchYear}</span>
                        <div className="flex gap-2">
                          {port.student?.projectsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-bold text-slate-700 dark:text-slate-300">
                              {port.student.projectsCount} Projects
                            </span>
                          )}
                          {port.student?.publicationsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[9px] font-bold text-mcc-gold">
                              {port.student.publicationsCount} Papers
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-900 py-8 bg-slate-100/60 dark:bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {config.institutionName}{config.establishedYear ? ` (Est. ${config.establishedYear})` : ""}. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-mcc-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-mcc-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-mcc-gold transition-colors">Institutional Transformation</a>
          </div>
        </div>
      </footer>

      {/* Pillar Details Modal */}
      <AnimatePresence>
        {selectedPillar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl relative z-50"
            >
              <button 
                onClick={() => setSelectedPillar(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner shrink-0">
                  {selectedPillar.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 leading-tight">{selectedPillar.title}</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {selectedPillar.desc}
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mb-6">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Ecosystem Offerings</h4>
                <div className="flex flex-col gap-2">
                  {selectedPillar.details.map((detail: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-mcc-gold shrink-0 font-extrabold">•</span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPillar(null)}
                  className="w-1/3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/30 hover:bg-slate-150/40 dark:bg-slate-950/20 dark:hover:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const action = selectedPillar.action;
                    setSelectedPillar(null);
                    if (action === "showcase") {
                      document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
                    } else if (action === "research") {
                      window.location.href = "/research";
                    } else if (action === "register") {
                      window.location.href = "/register";
                    } else if (action === "login") {
                      window.location.href = "/login";
                    }
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light border border-mcc-gold/30 hover:from-mcc-maroon-light hover:to-red-600 text-xs font-bold text-slate-100 rounded-lg transition-all shadow text-center cursor-pointer"
                >
                  {selectedPillar.actionText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
