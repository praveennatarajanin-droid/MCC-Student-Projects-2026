"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useInstitutionConfig } from "@/context/InstitutionConfigContext";

export default function PublicPortfolioPage() {
  const { user } = useAuth();
  const { config: institutionConfig } = useInstitutionConfig();
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [theme, setTheme] = useState("academic");
  const [layoutSettings, setLayoutSettings] = useState<any>({});

  // Recruiter Connect states
  const [companyName, setCompanyName] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setConnecting(true);
      setConnectError(null);
      await api.post(`/student/portfolio/${slug}/connect`, {
        companyName,
        recruiterName,
        recruiterEmail,
        message,
      });
      setConnectSuccess("Connection request successfully delivered.");
      setCompanyName("");
      setRecruiterName("");
      setRecruiterEmail("");
      setMessage("");
    } catch (err: any) {
      setConnectError(err.message || "Failed to submit connection inquiry.");
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    async function loadPortfolio() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.get<any>(`/student/portfolio/${slug}`);
        setData(res);
        
        try {
          const settings = JSON.parse(res.layoutSettingsJson || "{}");
          setTheme(settings.theme || "academic");
          setLayoutSettings(settings);
        } catch {
          setTheme("academic");
          setLayoutSettings({});
        }
      } catch (err: any) {
        setError(err.message || "Could not load this student's portfolio.");
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 border-4 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin" />
        <p className="text-sm">Assembling portfolio canvas...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Portfolio Unavailable</h2>
        <p className="text-sm text-slate-400 max-w-md">{error || "This portfolio could not be retrieved."}</p>
        <a href="/" className="mt-8 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300">
          Back to Homepage
        </a>
      </div>
    );
  }

  const { student, projects, certifications, publications, achievements, communityServices } = data;
  const conferencePresentations = data.conferencePresentations || [];
  const scienceFairEntries = data.scienceFairEntries || [];

  // Parse active sections, ensuring conferences and scienceFairs are rendered
  const activeSections = (() => {
    const active = layoutSettings.visibleSections || [
      "about",
      "projects",
      "publications",
      "certifications",
      "achievements",
      "community"
    ];
    const finalActive = [...active];
    if (!finalActive.includes("conferences")) finalActive.push("conferences");
    if (!finalActive.includes("scienceFairs")) finalActive.push("scienceFairs");
    return finalActive;
  })();

  // Theme helper classes mapping
  const themeStyles: Record<string, { bg: string; text: string; accent: string; card: string; header: string; border: string; sectionTitle: string; badge: string; divider: string }> = {
    academic: {
      bg: "bg-[#faf7f2] text-stone-900",
      text: "text-stone-800",
      accent: "text-[#800020]",
      card: "bg-white border-stone-300 shadow-sm",
      header: "bg-[#800020] text-amber-50 border-b-4 border-amber-500",
      border: "border-stone-300",
      sectionTitle: "text-[#800020] font-serif font-extrabold tracking-wide",
      badge: "bg-amber-50 border-amber-300 text-amber-800",
      divider: "border-stone-300",
    },
    corporate: {
      bg: "bg-slate-50 text-slate-900",
      text: "text-slate-800",
      accent: "text-blue-700",
      card: "bg-white border-l-4 border-l-blue-700 border-slate-200 shadow-md",
      header: "bg-slate-900 text-slate-100 border-b-2 border-blue-600",
      border: "border-slate-300",
      sectionTitle: "text-slate-900 font-extrabold uppercase tracking-widest text-sm",
      badge: "bg-blue-50 border-blue-200 text-blue-700",
      divider: "border-slate-300",
    },
    startup: {
      bg: "bg-zinc-950 text-zinc-100",
      text: "text-zinc-300",
      accent: "text-orange-500",
      card: "bg-zinc-900 border-zinc-800 border shadow-xl",
      header: "bg-gradient-to-r from-zinc-900 to-zinc-950 text-zinc-100 border-b-2 border-orange-500",
      border: "border-zinc-700",
      sectionTitle: "text-orange-400 font-extrabold uppercase tracking-widest text-sm",
      badge: "bg-orange-950 border-orange-800 text-orange-300",
      divider: "border-orange-900/40",
    },
    creative: {
      bg: "bg-[#0b0c10] text-[#c5c6c7]",
      text: "text-[#c5c6c7]",
      accent: "text-[#66fcf1]",
      card: "bg-[#1f2833] border-[#66fcf1]/20 shadow-[0_0_20px_rgba(102,252,241,0.08)]",
      header: "bg-[#1f2833] text-[#66fcf1] border-b-2 border-[#66fcf1]",
      border: "border-[#66fcf1]/30",
      sectionTitle: "text-[#66fcf1] font-bold uppercase tracking-widest text-sm",
      badge: "bg-[#66fcf1]/10 border-[#66fcf1]/30 text-[#66fcf1]",
      divider: "border-[#66fcf1]/20",
    },
    futuristic: {
      bg: "bg-[#060a14] text-slate-100",
      text: "text-slate-300",
      accent: "text-amber-400",
      card: "bg-white/5 border-white/10 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.4)]",
      header: "bg-transparent border-b border-amber-400/30 text-slate-100",
      border: "border-amber-400/20",
      sectionTitle: "text-amber-400 font-extrabold uppercase tracking-widest text-sm",
      badge: "bg-amber-400/10 border-amber-400/30 text-amber-300",
      divider: "border-amber-400/20",
    },
  };

  const fontStyles: Record<string, string> = {
    sans: "font-sans-dynamic",
    serif: "font-serif-dynamic",
    mono: "font-mono-dynamic",
    display: "font-display-dynamic",
  };
  const currentFontClass = fontStyles[layoutSettings.fontFamily] || "font-sans-dynamic";

  const getCardClass = (baseClass: string) => {
    if (layoutSettings.cardStyle === "glass") return "card-glass";
    if (layoutSettings.cardStyle === "neo") {
      const isDark = theme === "startup" || theme === "creative" || theme === "futuristic";
      return isDark ? "card-neo-dark text-white" : "card-neo text-black";
    }
    if (layoutSettings.cardStyle === "glow") return `${baseClass} card-glow`;
    return baseClass;
  };

  const currentStyle = themeStyles[theme] || themeStyles.academic;

  const renderProfileCard = () => {
    return (
      <div className={`p-6 rounded-xl border ${getCardClass(currentStyle.card)} flex flex-col items-center text-center gap-4`}>
        <div
          className="w-28 h-28 rounded-full border-2 overflow-hidden bg-slate-900"
          style={{ borderColor: layoutSettings.accentColor || undefined }}
        >
          {student.avatarUrl ? (
            <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-mcc-gold bg-mcc-maroon">
              {student.firstName?.[0]}{student.lastName?.[0]}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold">{student.firstName} {student.lastName}</h2>
          <span className="text-xs opacity-60 block mt-1">{student.department}</span>
          <span className="text-xs opacity-50 block">{student.batchYear}</span>
        </div>
        
        <p className="text-xs leading-relaxed opacity-85 my-2 border-t border-b border-slate-800/20 py-3 w-full">
          {student.bio || "Student of Madras Christian College."}
        </p>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium">
          {student.githubUsername && (
            <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              GitHub
            </a>
          )}
          {student.behanceUsername && (
            <a href={`https://behance.net/${student.behanceUsername}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              Behance
            </a>
          )}
          {layoutSettings.linkedinUrl && (
            <a href={layoutSettings.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: layoutSettings.accentColor || undefined }}>
              LinkedIn
            </a>
          )}
          {layoutSettings.leetcodeUrl && (
            <a href={layoutSettings.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: layoutSettings.accentColor || undefined }}>
              LeetCode
            </a>
          )}
          {layoutSettings.blogUrl && (
            <a href={layoutSettings.blogUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: layoutSettings.accentColor || undefined }}>
              Blog
            </a>
          )}
        </div>

        {/* Export Resume Button */}
        <button
          onClick={() => window.print()}
          className="w-full mt-2 py-2 px-4 bg-mcc-maroon hover:bg-mcc-maroon-light text-slate-100 font-bold rounded-lg text-xs transition-all border border-mcc-gold/30 flex items-center justify-center gap-1.5 shadow"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Export Resume (PDF / Print)
        </button>

        {/* QR Verification Badge Button */}
        <button
          onClick={() => setQrModalOpen(true)}
          className="w-full mt-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 hover:border-mcc-gold/30 text-slate-200 font-bold rounded-lg text-xs transition-all border border-slate-800 flex items-center justify-center gap-1.5 shadow"
        >
          <span>🔍</span>
          Verify Profile via QR Code
        </button>
      </div>
    );
  };

  const renderObjectiveCard = () => {
    if (!data.statementOfPurpose) return null;
    return (
      <div className={`p-6 rounded-xl border ${getCardClass(currentStyle.card)} flex flex-col gap-3`}>
        <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Objective Statement</h3>
        <p className="text-xs leading-relaxed italic opacity-85">
          "{data.statementOfPurpose}"
        </p>
      </div>
    );
  };

  const renderRecruiterCard = () => {
    const isOwner = user?.studentId === student.id || user?.slug === slug;
    const isStudent = user?.role === "Student";

    return (
      <div className={`p-6 rounded-xl border ${getCardClass(currentStyle.card)} flex flex-col gap-4 no-print`}>
        <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Recruiter Connection</h3>
        
        {isStudent ? (
          <div className="flex flex-col gap-2.5 py-2">
            <p className="text-[11px] opacity-80 leading-relaxed">
              This card allows visiting recruiters to send connection requests directly to the student's dashboard.
            </p>
            <div className="p-3 py-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              {isOwner 
                ? "🔒 Recruiter connection form is disabled for your own portfolio."
                : "🔒 Recruiter connection form is disabled for student profiles."}
            </div>
          </div>
        ) : (
          <>
            <p className="text-[11px] opacity-80 leading-relaxed">
              Interested in hiring? Leave your details below, and it will be sent directly to this student's placement dashboard.
            </p>
            {connectSuccess ? (
              <div className="p-3.5 rounded bg-green-950/20 border border-green-800 text-[11px] text-green-400">
                ✓ {connectSuccess}
              </div>
            ) : (
              <form onSubmit={handleConnect} className="flex flex-col gap-3">
                {connectError && (
                  <span className="text-[10px] text-red-500 font-medium">{connectError}</span>
                )}
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-65 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zoho Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-8 px-3 rounded bg-black/10 border border-slate-700/40 text-[11px] focus:outline-none focus:border-mcc-gold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-65 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full h-8 px-3 rounded bg-black/10 border border-slate-700/40 text-[11px] focus:outline-none focus:border-mcc-gold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-65 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@zoho.com"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    className="w-full h-8 px-3 rounded bg-black/10 border border-slate-700/40 text-[11px] focus:outline-none focus:border-mcc-gold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase opacity-65 mb-1">Inquiry / Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="We are interested in scheduling an interview..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 rounded bg-black/10 border border-slate-700/40 text-[11px] focus:outline-none focus:border-mcc-gold resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={connecting}
                  className="w-full h-8 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-[11px] font-bold text-mcc-gold rounded transition-all"
                >
                  {connecting ? "Sending Connection..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCorporateHeaderBanner = () => {
    return (
      <div className={`col-span-12 p-8 rounded-xl border ${getCardClass(currentStyle.card)} flex flex-col md:flex-row items-center md:items-start gap-8 mb-4`}>
        <div
          className="w-32 h-32 rounded-full border-4 overflow-hidden bg-slate-900 shadow-md shrink-0"
          style={{ borderColor: layoutSettings.accentColor || "#1d4ed8" }}
        >
          {student.avatarUrl ? (
            <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-mcc-gold bg-mcc-maroon">
              {student.firstName?.[0]}{student.lastName?.[0]}
            </div>
          )}
        </div>
        <div className="flex-1 text-center md:text-left flex flex-col gap-2">
          <div className="flex flex-col md:flex-row items-center md:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{student.firstName} {student.lastName}</h2>
              <span className="text-xs uppercase font-bold tracking-widest text-blue-700 block mt-1">
                {student.department} &bull; {institutionConfig.institutionName}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                Batch {student.batchYear}
              </span>
              <span className="text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Verified Profile
              </span>
            </div>
          </div>
          
          <p className="text-sm leading-relaxed opacity-85 mt-2 border-t border-slate-200/80 pt-3">
            {student.bio || "Student of Madras Christian College."}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mt-4 text-xs font-semibold">
            {student.githubUsername && (
              <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-slate-700 hover:text-black">
                <span>💻</span> GitHub
              </a>
            )}
            {student.behanceUsername && (
              <a href={`https://behance.net/${student.behanceUsername}`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-slate-700 hover:text-black">
                <span>🎨</span> Behance
              </a>
            )}
            {layoutSettings.linkedinUrl && (
              <a href={layoutSettings.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: layoutSettings.accentColor || "#1d4ed8" }}>
                <span>🔗</span> LinkedIn
              </a>
            )}
            {layoutSettings.leetcodeUrl && (
              <a href={layoutSettings.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: layoutSettings.accentColor || "#1d4ed8" }}>
                <span>⚡</span> LeetCode
              </a>
            )}
            {layoutSettings.blogUrl && (
              <a href={layoutSettings.blogUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1" style={{ color: layoutSettings.accentColor || "#1d4ed8" }}>
                <span>✍️</span> Blog
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCorporateSidebar = () => {
    return (
      <div className="flex flex-col gap-6 sticky top-6">
        {renderObjectiveCard()}
        {renderRecruiterCard()}
        <div className={`p-6 rounded-xl border ${getCardClass(currentStyle.card)} flex flex-col gap-3`}>
          <h3 className="font-bold text-xs uppercase tracking-wider opacity-60">Verification Hub</h3>
          <button
            onClick={() => window.print()}
            className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold rounded-lg text-xs transition-all border border-slate-700 flex items-center justify-center gap-1.5 shadow"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Export Resume (PDF)
          </button>
          <button
            onClick={() => setQrModalOpen(true)}
            className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-all border border-blue-600 flex items-center justify-center gap-1.5 shadow"
          >
            <span>🔍</span> Verify via QR Code
          </button>
        </div>
      </div>
    );
  };

  const renderCreativeIntro = () => {
    return (
      <div className="col-span-12 py-10 px-4 md:px-8 flex flex-col md:flex-row items-center gap-10 border-b border-[#66fcf1]/20 mb-8">
        <div className="relative shrink-0">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#66fcf1] to-purple-600 opacity-60 blur-md animate-pulse" />
          <div
            className="relative w-36 h-36 rounded-2xl border-2 overflow-hidden bg-slate-900 transition-all duration-500 hover:rotate-2 hover:scale-105"
            style={{ borderColor: "#66fcf1" }}
          >
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-extrabold text-4xl text-[#66fcf1] bg-[#1f2833]">
                {student.firstName?.[0]}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 text-center md:text-left flex flex-col gap-3">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase select-none">
            {student.firstName} <span className="text-[#66fcf1]">{student.lastName}</span>
          </h2>
          <span className="text-xs uppercase tracking-widest text-[#66fcf1] font-mono">
            {student.department} &bull; {institutionConfig.institutionName}
          </span>
          <p className="text-sm leading-relaxed text-[#c5c6c7] max-w-2xl mt-1 italic">
            "{student.bio || "Crafting digital experiences, shaping ideas into reality."}"
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3 text-[11px] font-mono">
            {student.githubUsername && (
              <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1f2833] border border-[#66fcf1]/20 rounded-full hover:border-[#66fcf1] transition-all text-[#c5c6c7]">
                github: {student.githubUsername}
              </a>
            )}
            {student.behanceUsername && (
              <a href={`https://behance.net/${student.behanceUsername}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1f2833] border border-[#66fcf1]/20 rounded-full hover:border-[#66fcf1] transition-all text-[#c5c6c7]">
                behance: {student.behanceUsername}
              </a>
            )}
            {layoutSettings.linkedinUrl && (
              <a href={layoutSettings.linkedinUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1f2833] border border-[#66fcf1]/20 rounded-full hover:border-[#66fcf1] transition-all text-[#66fcf1]">
                linkedin
              </a>
            )}
            {layoutSettings.leetcodeUrl && (
              <a href={layoutSettings.leetcodeUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1f2833] border border-[#66fcf1]/20 rounded-full hover:border-[#66fcf1] transition-all text-[#66fcf1]">
                leetcode
              </a>
            )}
            {layoutSettings.blogUrl && (
              <a href={layoutSettings.blogUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-[#1f2833] border border-[#66fcf1]/20 rounded-full hover:border-[#66fcf1] transition-all text-[#66fcf1]">
                blog
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getCreativeColumns = () => {
    const leftSections = activeSections.filter((key: string) => ["about", "projects", "community", "conferences"].includes(key));
    const rightSections = activeSections.filter((key: string) => ["publications", "certifications", "achievements", "scienceFairs"].includes(key));
    return { leftSections, rightSections };
  };

  const renderFuturisticHud = () => {
    return (
      <div className="col-span-12 p-4 rounded-lg border border-amber-400/20 bg-black/40 backdrop-blur-md flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono tracking-widest text-slate-400 select-none mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-amber-400 font-bold">SYSTEM ACTIVE</span>
          <span className="opacity-30">|</span>
          <span>PORTFOLIO_ID: <span className="text-white">{slug.toUpperCase()}</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span>PROJECTS_NODES: <span className="text-white">{projects.length}</span></span>
          <span className="opacity-30">|</span>
          <span>CERT_REGISTRY: <span className="text-white">{certifications.length}</span></span>
          <span className="opacity-30">|</span>
          <span className="text-green-400">STATUS: SECURE_STUB</span>
        </div>
      </div>
    );
  };

  const renderFuturisticLeftPanel = () => {
    return (
      <div className="flex flex-col gap-6 sticky top-6">
        {/* Profile module */}
        <div className="p-6 rounded-xl border border-amber-400/25 bg-black/40 backdrop-blur-md flex flex-col items-center text-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-400" />

          {/* Glowing scanner avatar frame */}
          <div className="relative">
            <div className="absolute -inset-1.5 rounded-full border border-amber-400/40 animate-spin" style={{ animationDuration: "12s" }} />
            <div className="w-28 h-28 rounded-full border-2 border-amber-400 overflow-hidden bg-slate-900 relative z-10">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-3xl text-amber-400 bg-slate-900">
                  {student.firstName?.[0]}{student.lastName?.[0]}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 font-mono">
            <h2 className="text-xl font-bold tracking-wide uppercase text-white">{student.firstName} {student.lastName}</h2>
            <span className="text-[10px] text-amber-400 uppercase font-bold block tracking-widest mt-1">
              // {student.department}
            </span>
            <span className="text-[9px] text-slate-500 block uppercase tracking-wider mt-0.5">
              MCC PORTFOLIO CORE // BATCH_{student.batchYear}
            </span>
          </div>
          
          <p className="text-[11px] font-mono leading-relaxed text-slate-300 border-t border-b border-amber-400/10 py-3 w-full text-justify">
            {student.bio || "Student data stream active on MCC nodes."}
          </p>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-mono text-slate-400">
            {student.githubUsername && (
              <a href={`https://github.com/${student.githubUsername}`} target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                [GITHUB]
              </a>
            )}
            {student.behanceUsername && (
              <a href={`https://behance.net/${student.behanceUsername}`} target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                [BEHANCE]
              </a>
            )}
            {layoutSettings.linkedinUrl && (
              <a href={layoutSettings.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                [LINKEDIN]
              </a>
            )}
            {layoutSettings.leetcodeUrl && (
              <a href={layoutSettings.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                [LEETCODE]
              </a>
            )}
          </div>
        </div>

        {renderObjectiveCard()}
        {renderRecruiterCard()}

        {/* Action center */}
        <div className="p-4 rounded-lg border border-amber-400/20 bg-black/40 backdrop-blur-md flex flex-col gap-2 font-mono text-[10px] no-print">
          <span className="text-amber-400 uppercase tracking-wider font-bold">// SECURE HUB ACTIONS</span>
          <button
            onClick={() => window.print()}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded border border-amber-400/20 hover:border-amber-400 transition-all flex items-center justify-center gap-1"
          >
            EXPORT_SYSTEM_DATA_DECK (PDF)
          </button>
          <button
            onClick={() => setQrModalOpen(true)}
            className="w-full py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-bold rounded border border-amber-400/30 transition-all flex items-center justify-center gap-1"
          >
            REQUEST_QR_DECRYPT_KEY
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "about":
        return data.storyContent ? (
          <section key="about" className="flex flex-col gap-4 animate-fade-in">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic"
                ? `[SYS_DECK: ${(data.storyTitle || "Personal Story").toUpperCase()}]`
                : (data.storyTitle || "Personal Story")}
            </h3>
            <p className="text-xs leading-relaxed opacity-90 whitespace-pre-line">
              {data.storyContent}
            </p>
          </section>
        ) : null;
      case "projects":
        return (
          <section key="projects" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[CORE_NODE: TECHNICAL_PROJECTS]" : "Technical Projects"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <span className="text-xs opacity-50 italic">No project uploads logged.</span>
              ) : (
                projects.map((proj: any) => (
                  <div
                    key={proj.id}
                    className={`p-4 rounded-lg border ${getCardClass(currentStyle.card)} project-card flex flex-col justify-between gap-3 relative overflow-hidden transition-all duration-300 ${
                      proj.liveUrl ? "cursor-pointer hover:scale-[1.01] hover:shadow-md" : ""
                    }`}
                    onClick={() => {
                      if (proj.liveUrl) {
                        window.open(proj.liveUrl, "_blank", "noreferrer");
                      }
                    }}
                  >
                    {theme === "futuristic" && (
                      <>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-400" />
                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-400" />
                      </>
                    )}
                    <div>
                      {proj.imageUrl && (
                        <div className="h-32 w-full rounded-md overflow-hidden mb-3 border border-slate-800/10">
                          <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm">{proj.title}</h4>
                        {proj.projectType && (
                          <span className="text-[8px] px-1.5 py-0.5 bg-slate-500/10 dark:bg-slate-400/10 border border-slate-500/20 text-slate-700 dark:text-slate-350 rounded font-semibold shrink-0 uppercase tracking-wider">
                            {proj.projectType}
                          </span>
                        )}
                      </div>
                      {proj.technologiesUsed && (
                        <span className="text-[9px] font-mono text-amber-500 opacity-80 block mt-1">
                          {theme === "futuristic" ? `// TECH: ` : ""}{proj.technologiesUsed}
                        </span>
                      )}
                      <p className="text-[11px] opacity-75 mt-1.5 leading-relaxed line-clamp-3">{proj.description}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800/10 pt-3 mt-2">
                      <div className="flex gap-2">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {theme === "futuristic" ? "[CODE]" : "Code"}
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold hover:underline"
                            style={{ color: layoutSettings.accentColor || undefined }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {theme === "futuristic" ? "[LIVE_DEMO]" : "Live Demo"}
                          </a>
                        )}
                        {proj.demoVideoUrl && (
                          <a
                            href={proj.demoVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold hover:underline flex items-center gap-0.5"
                            style={{ color: layoutSettings.accentColor || undefined }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {theme === "futuristic" ? "[VIDEO_DEMO]" : "🎥 Video Demo"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case "publications":
        return (
          <section key="publications" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[ARCHIVE_NODE: RESEARCH_&_INNOVATION]" : "Research & Innovation"}
            </h3>
            <div className="flex flex-col gap-3">
              {publications.length === 0 ? (
                <span className="text-xs opacity-50 italic">No publications indexed.</span>
              ) : (
                publications.map((pub: any) => (
                  <div key={pub.id} className={`p-4 rounded-lg border ${getCardClass(currentStyle.card)} flex flex-col gap-2 relative overflow-hidden`}>
                    {theme === "futuristic" && (
                      <>
                        <div className="absolute top-0 right-0 text-[8px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 border-b border-l border-amber-400/20">
                          PUB_VERIFIED
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-amber-400" />
                      </>
                    )}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm">{pub.title}</h4>
                          {pub.publicationType && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded font-semibold uppercase tracking-wider">
                              {pub.publicationType}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] opacity-60 block mt-0.5">
                          {pub.journalOrConference} &bull; {new Date(pub.publishDate).getFullYear()}
                          {pub.doiOrIsbn && ` &bull; DOI/ISBN: ${pub.doiOrIsbn}`}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] opacity-75 leading-relaxed bg-black/5 p-3 rounded border border-slate-800/5">
                      <strong>Abstract Summary:</strong> {pub.abstract}
                    </p>
                    <span className="text-[10px] opacity-50 font-medium">Authors: {pub.authors}</span>
                    {pub.paperUrl && (
                      <a
                        href={pub.paperUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold hover:underline mt-1 w-fit"
                        style={{ color: layoutSettings.accentColor || undefined }}
                      >
                        {theme === "futuristic" ? "DECRYPT_PAPER_DATA &rarr;" : "Read Full Paper &rarr;"}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case "conferences":
        return (
          <section key="conferences" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[REGISTRY: CONFERENCE_PRESENTATIONS]" : "Conference Presentations"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {(!conferencePresentations || conferencePresentations.length === 0) ? (
                <span className="text-xs opacity-50 italic">No conference presentations logged.</span>
              ) : (
                conferencePresentations.map((conf: any) => (
                  <div key={conf.id} className={`p-4 rounded-lg border ${getCardClass(currentStyle.card)} flex flex-col gap-1.5 relative overflow-hidden`}>
                    {theme === "futuristic" && (
                      <>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-400" />
                      </>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs">{conf.title}</h4>
                      {conf.isVerified && (
                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5 shrink-0 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title="Verified by Coordinator">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] opacity-50 font-bold uppercase">{conf.conferenceName} &bull; {conf.role}</span>
                    <span className="text-[9px] opacity-60 block">{conf.location} &bull; {new Date(conf.presentationDate).toLocaleDateString()}</span>
                    {conf.abstractUrl && (
                      <a
                        href={conf.abstractUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold hover:underline mt-1 w-fit"
                        style={{ color: layoutSettings.accentColor || undefined }}
                      >
                        {theme === "futuristic" ? "DECRYPT_ABSTRACT &rarr;" : "View Abstract &rarr;"}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case "scienceFairs":
        return (
          <section key="scienceFairs" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[REGISTRY: SCIENCE_FAIRS]" : "Science Fair Participation"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {(!scienceFairEntries || scienceFairEntries.length === 0) ? (
                <span className="text-xs opacity-50 italic">No science fair entries logged.</span>
              ) : (
                scienceFairEntries.map((fair: any) => (
                  <div key={fair.id} className={`p-4 rounded-lg border ${getCardClass(currentStyle.card)} flex flex-col gap-1.5 relative overflow-hidden`}>
                    {theme === "futuristic" && (
                      <>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-400" />
                      </>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs">{fair.projectTitle}</h4>
                      {fair.isVerified && (
                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5 shrink-0 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title="Verified by Coordinator">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] opacity-50 font-bold uppercase">{fair.fairName} &bull; {fair.level}</span>
                    <p className="text-[11px] opacity-75 leading-relaxed">{fair.description}</p>
                    {fair.awardReceived && (
                      <span className="text-[10px] text-amber-500 font-semibold mt-1">🏆 Award: {fair.awardReceived}</span>
                    )}
                    <span className="text-[9px] opacity-60 block mt-1">{new Date(fair.fairDate).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case "certifications":
        return (
          <section key="certifications" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[REGISTRY: PROFESSIONAL_CERTIFICATIONS]" : "Professional Certifications"}
            </h3>
            <div className="flex flex-col gap-2.5">
              {certifications.length === 0 ? (
                <span className="text-xs opacity-50 italic">No certifications logged.</span>
              ) : (
                certifications.map((cert: any) => (
                  <div key={cert.id} className={`p-3.5 rounded-lg border ${getCardClass(currentStyle.card)} flex items-center justify-between gap-4 relative overflow-hidden`}>
                    {theme === "futuristic" && (
                      <>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-400" />
                      </>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded bg-slate-900 border flex items-center justify-center font-bold text-[10px]"
                        style={{
                          color: layoutSettings.accentColor || undefined,
                          borderColor: layoutSettings.accentColor || undefined
                        }}
                      >
                        {theme === "futuristic" ? "ID" : "C"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{cert.name}</h4>
                        <span className="text-[10px] opacity-60 block">{cert.issuingOrganization} &bull; Issued {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold hover:underline"
                        style={{ color: layoutSettings.accentColor || undefined }}
                      >
                        {theme === "futuristic" ? "ACCESS_LEDGER" : "Verify Certification"}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case "achievements":
        return (
          <section key="achievements" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[REGISTRY: AWARDS_&_CONTESTS]" : "Awards & Contests"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {achievements.length === 0 ? (
                <span className="text-xs opacity-50 italic">No achievements reported.</span>
              ) : (
                achievements.map((ach: any) => (
                  <div key={ach.id} className={`p-4 rounded-lg border ${getCardClass(currentStyle.card)} flex flex-col gap-1.5 relative overflow-hidden`}>
                    {theme === "futuristic" && (
                      <>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-amber-400" />
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-amber-400" />
                      </>
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs">{ach.title}</h4>
                      {ach.isVerified && (
                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5 shrink-0 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title={`Verified by: ${ach.verifiedBy}. Remarks: ${ach.verificationRemarks}`}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] opacity-50 font-bold uppercase">{ach.category} &bull; {new Date(ach.dateEarned).toLocaleDateString()}</span>
                    <p className="text-[11px] opacity-75 leading-relaxed">{ach.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      case "community":
        return (
          <section key="community" className="flex flex-col gap-4">
            <h3 className={`pb-2 border-b ${currentStyle.sectionTitle} ${currentStyle.divider}`}>
              {theme === "futuristic" ? "[OUTREACH: COMMUNITY_OUTREACH]" : "Community Outreach"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {communityServices.length === 0 ? (
                <span className="text-xs opacity-50 italic">No service records registered.</span>
              ) : (
                communityServices.map((service: any) => (
                  <div key={service.id} className={`p-4 rounded-lg border ${getCardClass(currentStyle.card)} flex flex-col gap-1.5`}>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs">{service.organization}</h4>
                      {service.isVerified && (
                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5 shrink-0 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20" title={`Verified by: ${service.verifiedBy}. Remarks: ${service.verificationRemarks}`}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] opacity-50 font-bold uppercase">{service.role}</span>
                    <p className="text-[11px] opacity-75 leading-relaxed">{service.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen ${currentStyle.bg} ${currentStyle.text} ${currentFontClass} theme-${theme} transition-colors duration-500 flex flex-col justify-between`}
      style={{
        "--accent-glow-color": `${layoutSettings.accentColor || "#d4af37"}40`,
        "--accent-glow-border": layoutSettings.accentColor || "#d4af37",
      } as React.CSSProperties}
    >
      {/* Dynamic font loading & theme style overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Fira+Code:wght@300..700&family=Inter:wght@100..900&family=Source+Serif+4:ital,wght@0,200..900;1,200..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,100..900&family=Space+Grotesk:wght@300..700&display=swap');

        .font-sans-dynamic { font-family: 'Inter', sans-serif !important; }
        .font-serif-dynamic { font-family: 'Playfair Display', serif !important; }
        .font-mono-dynamic { font-family: 'Fira Code', monospace !important; }
        .font-display-dynamic { font-family: 'Outfit', sans-serif !important; }

        /* ==================== ACADEMIC THEME ==================== */
        .theme-academic {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23800020' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
        }
        .theme-academic h1, .theme-academic h2, .theme-academic h3, .theme-academic h4 {
          font-family: 'Source Serif 4', 'Playfair Display', Georgia, serif !important;
        }
        .theme-academic .section-badge {
          background-color: #800020; color: #f5f0e8;
          padding: 2px 8px; border-radius: 4px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        }

        /* ==================== CORPORATE THEME ==================== */
        .theme-corporate {
          font-family: 'DM Sans', sans-serif !important;
        }
        .theme-corporate header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%) !important;
          border-bottom: 3px solid #2563eb !important;
        }
        .theme-corporate h1, .theme-corporate h2 {
          letter-spacing: 0.05em !important;
          font-weight: 900 !important;
        }
        .theme-corporate section h3 {
          border-left: 4px solid #2563eb;
          padding-left: 12px;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #1e293b;
        }

        /* ==================== STARTUP THEME ==================== */
        .theme-startup {
          font-family: 'Space Grotesk', sans-serif !important;
          background-image: radial-gradient(ellipse at 20% 50%, rgba(249, 115, 22, 0.06) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 20%, rgba(234, 179, 8, 0.04) 0%, transparent 50%) !important;
        }
        .theme-startup header {
          position: relative;
          overflow: hidden;
        }
        .theme-startup header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f97316, #eab308, transparent);
        }
        .theme-startup h1, .theme-startup h2, .theme-startup h3 {
          font-family: 'Space Grotesk', sans-serif !important;
          font-weight: 800 !important;
        }
        .theme-startup section h3::before {
          content: '// ';
          color: #f97316;
          font-family: 'Fira Code', monospace;
          font-size: 12px;
        }

        /* ==================== CREATIVE THEME ==================== */
        .theme-creative {
          font-family: 'Outfit', sans-serif !important;
          background-image:
            radial-gradient(ellipse at 10% 90%, rgba(102, 252, 241, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 10%, rgba(102, 252, 241, 0.05) 0%, transparent 40%) !important;
        }
        .theme-creative header {
          position: relative;
        }
        .theme-creative header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1f2833 0%, #0b0c10 100%);
          z-index: 0;
        }
        .theme-creative header > * { position: relative; z-index: 1; }
        .theme-creative section h3 {
          position: relative;
          display: inline-block;
          color: #66fcf1 !important;
          text-shadow: 0 0 20px rgba(102, 252, 241, 0.4);
        }
        .theme-creative .project-card, .theme-creative .cert-card {
          transition: box-shadow 0.3s ease, transform 0.2s ease;
        }
        .theme-creative .project-card:hover {
          box-shadow: 0 0 30px rgba(102, 252, 241, 0.15) !important;
          transform: translateY(-2px);
        }

        /* ==================== AI FUTURISTIC THEME ==================== */
        .theme-futuristic {
          font-family: 'Inter', sans-serif !important;
          background-image:
            radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.12) 0%, transparent 60%),
            linear-gradient(180deg, #060a14 0%, #0c1221 100%) !important;
          position: relative;
        }
        .theme-futuristic::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
        .theme-futuristic > * { position: relative; z-index: 1; }
        .theme-futuristic header {
          background: rgba(6, 10, 20, 0.85) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(212, 175, 55, 0.4) !important;
          box-shadow: 0 4px 40px rgba(212, 175, 55, 0.06) !important;
        }
        .theme-futuristic section h3 {
          color: #d4af37 !important;
          text-shadow: 0 0 24px rgba(212, 175, 55, 0.35);
          position: relative;
        }
        .theme-futuristic section h3::after {
          content: '';
          position: absolute;
          bottom: -6px; left: 0;
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #d4af37, transparent);
          border-radius: 2px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.04) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.06) !important;
        }

        /* ==================== CARD GLOBAL OVERRIDES ==================== */
        .card-glass {
          background: rgba(15, 23, 42, 0.45) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3) !important;
        }
        .card-neo {
          background: #ffffff !important;
          color: #000000 !important;
          border: 3px solid #000000 !important;
          box-shadow: 6px 6px 0px 0px #000000 !important;
          border-radius: 8px !important;
        }
        .card-neo-dark {
          background: #18181b !important;
          color: #ffffff !important;
          border: 3px solid #ffffff !important;
          box-shadow: 6px 6px 0px 0px #ffffff !important;
          border-radius: 8px !important;
        }
        .card-glow {
          box-shadow: 0 0 15px var(--accent-glow-color, rgba(212, 175, 55, 0.25)) !important;
          border: 1px solid var(--accent-glow-border, #d4af37) !important;
        }

        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #main-portfolio-container {
            display: none !important;
          }
          #printable-resume {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}} />

      <div id="main-portfolio-container" className="flex flex-col justify-between flex-1">
        {/* Portfolio Header Banner */}
        <header
          className={`py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 ${currentStyle.header}`}
          style={{
            backgroundColor: layoutSettings.headerBg || undefined,
            borderBottomColor: layoutSettings.accentColor || undefined,
          }}
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src="/mcc_logo.png" alt="Madras Christian College Logo" className="h-10 w-auto object-contain rounded-md shadow-sm border border-white/10 hover:opacity-90 transition-opacity cursor-pointer shrink-0" />
            </Link>
            <div className="text-center md:text-left border-l border-white/20 pl-4 py-0.5">
              <h1 className="font-extrabold text-lg tracking-wide uppercase leading-tight">
                {student.firstName} {student.lastName}
              </h1>
              <span className="text-[10px] tracking-widest uppercase font-bold text-amber-400">
                {student.department} &bull; MCC PORTFOLIO
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>Batch {student.batchYear}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[10px] uppercase bg-green-950 text-green-300 border border-green-800 px-2 py-0.5 rounded">
              Verified Profile
            </span>
          </div>
        </header>

        {/* 1. Academic Theme Layout */}
        {theme === "academic" && (
          <main className="max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex-1 grid md:grid-cols-12 gap-8 items-start">
            {/* Sidebar (Left) */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6 sticky top-6">
              {renderProfileCard()}
              {renderObjectiveCard()}
              {renderRecruiterCard()}
            </div>
            {/* Content (Right) */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-8">
              {activeSections.map((sectionKey: string) => renderSection(sectionKey))}
            </div>
          </main>
        )}

        {/* 2. Corporate Theme Layout */}
        {theme === "corporate" && (
          <main className="max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex-1 grid grid-cols-12 gap-8 items-start">
            {renderCorporateHeaderBanner()}
            {/* Sidebar (Left) */}
            <div className="col-span-12 md:col-span-4">
              {renderCorporateSidebar()}
            </div>
            {/* Content (Right) */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-8">
              {activeSections.map((sectionKey: string) => renderSection(sectionKey))}
            </div>
          </main>
        )}

        {/* 3. Startup Theme Layout */}
        {theme === "startup" && (
          <main className="max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex-1 grid md:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Content (Left) */}
            <div className="order-2 md:order-1 col-span-12 md:col-span-8 flex flex-col gap-8">
              {activeSections.map((sectionKey: string) => renderSection(sectionKey))}
            </div>
            {/* Sidebar (Right) */}
            <div className="order-1 md:order-2 col-span-12 md:col-span-4 flex flex-col gap-6 sticky top-6">
              {renderProfileCard()}
              {renderObjectiveCard()}
              {renderRecruiterCard()}
            </div>
          </main>
        )}

        {/* 4. Creative Theme Layout */}
        {theme === "creative" && (
          <main className="max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex-1 grid grid-cols-12 gap-8 items-start animate-fade-in">
            {renderCreativeIntro()}
            
            {/* Left Column */}
            <div className="col-span-12 md:col-span-7 flex flex-col gap-8">
              {getCreativeColumns().leftSections.map((sectionKey: string) => renderSection(sectionKey))}
            </div>

            {/* Right Column */}
            <div className="col-span-12 md:col-span-5 flex flex-col gap-8">
              {renderObjectiveCard()}
              {getCreativeColumns().rightSections.map((sectionKey: string) => renderSection(sectionKey))}
              {renderRecruiterCard()}
              <div className={`p-6 rounded-xl border ${getCardClass(currentStyle.card)} flex flex-col gap-3 no-print`}>
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#66fcf1]">Verify Digital Credentials</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-slate-900 border border-[#66fcf1]/30 hover:border-[#66fcf1] text-[#c5c6c7] font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow"
                  >
                    PDF Print
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="flex-1 py-2 bg-[#66fcf1]/10 border border-[#66fcf1]/30 hover:bg-[#66fcf1]/20 text-[#66fcf1] font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow"
                  >
                    QR Code
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* 5. AI Futuristic Theme Layout */}
        {theme === "futuristic" && (
          <main className="max-w-6xl mx-auto w-full px-6 py-12 md:py-16 flex-1 grid grid-cols-12 gap-6 items-start animate-fade-in">
            {renderFuturisticHud()}
            
            {/* Left Telemetry Panel */}
            <div className="col-span-12 md:col-span-4">
              {renderFuturisticLeftPanel()}
            </div>

            {/* Right Node List */}
            <div className="col-span-12 md:col-span-8 flex flex-col gap-8">
              {activeSections.map((sectionKey: string) => renderSection(sectionKey))}
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="py-6 px-6 text-center text-[10px] opacity-50 border-t border-slate-900/10 mt-12">
          Madras Christian College Portfolio Ecosystem &bull; verified security stubs
        </footer>
      </div>

      {/* Printable A4 Resume Structure */}
      <div id="printable-resume" className="hidden bg-white text-black p-8 font-sans max-w-4xl mx-auto">
        {/* Name and Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-wide uppercase text-slate-900">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {student.department} &bull; Madras Christian College
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600 mt-2">
            <span>Roll Number: {student.rollNumber}</span>
            <span>&bull;</span>
            <span>Batch: {student.batchYear}</span>
            {student.githubUsername && (
              <>
                <span>&bull;</span>
                <span>GitHub: github.com/{student.githubUsername}</span>
              </>
            )}
            {student.behanceUsername && (
              <>
                <span>&bull;</span>
                <span>Behance: behance.net/{student.behanceUsername}</span>
              </>
            )}
          </div>
        </div>

        {/* SOP / Profile Summary */}
        {data.statementOfPurpose && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Career Objective & Statement of Purpose
            </h3>
            <p className="text-xs leading-relaxed text-slate-700">
              {data.statementOfPurpose}
            </p>
          </div>
        )}

        {/* Journey / Bio Narrative */}
        {data.storyContent && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              {data.storyTitle || "Personal Journey"}
            </h3>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">
              {data.storyContent}
            </p>
          </div>
        )}

        {/* Technical Projects */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3">
            Technical Projects
          </h3>
          {projects.length === 0 ? (
            <p className="text-xs italic text-slate-500">No project uploads logged.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {projects.map((proj: any) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <h4>{proj.title}</h4>
                    {proj.liveUrl && <span className="text-[10px] font-normal text-slate-500">{proj.liveUrl}</span>}
                  </div>
                  {proj.technologiesUsed && (
                    <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                      Technologies: {proj.technologiesUsed}
                    </p>
                  )}
                  <p className="text-slate-700 mt-1 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Research & Publications */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-3">
            Research & Publications
          </h3>
          {publications.length === 0 ? (
            <p className="text-xs italic text-slate-500">No publications indexed.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {publications.map((pub: any) => (
                <div key={pub.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <h4>{pub.title}</h4>
                    <span className="text-[10px] font-normal text-slate-500">
                      {pub.journalOrConference} &bull; {new Date(pub.publishDate).getFullYear()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">Authors: {pub.authors}</p>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    <strong>Abstract:</strong> {pub.abstract}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional Certifications */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            Professional Certifications
          </h3>
          {certifications.length === 0 ? (
            <p className="text-xs italic text-slate-500">No certifications logged.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {certifications.map((cert: any) => (
                <div key={cert.id} className="flex justify-between items-start border-l border-slate-300 pl-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{cert.name}</h4>
                    <p className="text-[10px] text-slate-500">{cert.issuingOrganization}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements & NGO */}
        <div className="grid grid-cols-2 gap-6">
          {/* Achievements */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Awards & Contests
            </h3>
            {achievements.length === 0 ? (
              <p className="text-xs italic text-slate-500">No achievements reported.</p>
            ) : (
              <div className="flex flex-col gap-2 text-xs">
                {achievements.map((ach: any) => (
                  <div key={ach.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <h4>{ach.title}</h4>
                      <span className="text-[9px] font-normal text-slate-500">
                        {new Date(ach.dateEarned).getFullYear()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[10px] leading-relaxed mt-0.5">{ach.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NGO / Outreach */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Community Outreach
            </h3>
            {communityServices.length === 0 ? (
              <p className="text-xs italic text-slate-500">No service records registered.</p>
            ) : (
              <div className="flex flex-col gap-2 text-xs">
                {communityServices.map((service: any) => (
                  <div key={service.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <h4>{service.organization}</h4>
                      <span className="text-[9px] font-normal text-slate-500">{service.role}</span>
                    </div>
                    <p className="text-slate-700 text-[10px] leading-relaxed mt-0.5">{service.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conferences & Science Fairs */}
        <div className="grid grid-cols-2 gap-6 mt-6 border-t border-slate-200 pt-4">
          {/* Conference Presentations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Conference Presentations
            </h3>
            {(!conferencePresentations || conferencePresentations.length === 0) ? (
              <p className="text-xs italic text-slate-500">No conference presentations logged.</p>
            ) : (
              <div className="flex flex-col gap-2 text-xs">
                {conferencePresentations.map((conf: any) => (
                  <div key={conf.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <h4>{conf.title}</h4>
                      <span className="text-[9px] font-normal text-slate-500">
                        {new Date(conf.presentationDate).getFullYear()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[10px] leading-relaxed mt-0.5">{conf.conferenceName} ({conf.role})</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Science Fairs */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              Science Fairs
            </h3>
            {(!scienceFairEntries || scienceFairEntries.length === 0) ? (
              <p className="text-xs italic text-slate-500">No science fair entries logged.</p>
            ) : (
              <div className="flex flex-col gap-2 text-xs">
                {scienceFairEntries.map((fair: any) => (
                  <div key={fair.id}>
                    <div className="flex justify-between font-bold text-slate-900">
                      <h4>{fair.projectTitle}</h4>
                      <span className="text-[9px] font-normal text-slate-500">
                        {new Date(fair.fairDate).getFullYear()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[10px] leading-relaxed mt-0.5">{fair.fairName} ({fair.level})</p>
                    {fair.awardReceived && <p className="text-amber-600 text-[9px] font-semibold">Award: {fair.awardReceived}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Verification Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full flex flex-col items-center gap-4 text-center">
            <h3 className="text-base font-bold text-slate-200">Verify Profile QR Code</h3>
            <p className="text-xs text-slate-400">
              Scan this QR code with any mobile device to verify this student's official Madras Christian College credentials and portfolio.
            </p>
            
            <div className="w-44 h-44 bg-white p-2.5 rounded-xl border border-slate-700 flex items-center justify-center shadow-lg my-2">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.href : ""
                )}`}
                alt="Verification QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            
            <span className="text-[10px] text-mcc-gold font-mono tracking-wider uppercase font-bold">Official MCC Verification Hub</span>
            
            <div className="flex gap-2 w-full mt-4">
              <button
                type="button"
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;
                  fetch(qrUrl)
                    .then(r => r.blob())
                    .then(blob => {
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${slug}-verification-qr.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    });
                }}
                className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-semibold text-slate-350 border border-slate-800 rounded-lg transition-all"
              >
                Download QR
              </button>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="flex-1 py-2 bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-xs font-bold text-slate-200 rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
