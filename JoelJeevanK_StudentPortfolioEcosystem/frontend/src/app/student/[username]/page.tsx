"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap, Mail, Phone, Calendar, BookOpen, Award,
  ExternalLink, Globe, QrCode, Download, Loader2, AlertCircle,
  Sun, Moon, Link as LinkIcon, Microscope, Lightbulb, Cpu,
  Presentation, FlaskConical, Rocket, MapPin, Badge, Zap,
  Code2, Brain, TrendingUp, Building2, Star, CheckCircle2,
} from "lucide-react";
import { MccLogo } from "@/components/MccLogo";

const Github = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Behance = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8.2 7h2.8c1.3 0 2.2.3 2.7.9.4.4.6 1 .6 1.7 0 .9-.4 1.5-1.2 1.8.9.3 1.4.9 1.4 1.9 0 .8-.3 1.5-.8 2-.6.6-1.6.8-3 .8H8.2V7zm2.4 4c.6 0 1-.1 1.2-.3.2-.2.3-.5.3-.8s-.1-.6-.3-.8c-.2-.1-.6-.2-1.2-.2H9.5v2.1h1.1zm.2 4.1c.7 0 1.1-.1 1.3-.3.2-.2.3-.5.3-.9 0-.4-.1-.7-.3-.8-.2-.2-.7-.3-1.3-.3H9.5v2.3h1.3zm8.3-5.2h-3.8v.7h3.8v-.7zm.4 2.8c0-2-1.3-3.2-3.2-3.2-1.9 0-3.3 1.3-3.3 3.3s1.3 3.3 3.3 3.3c1.5 0 2.7-.8 3.1-2.1H18c-.3.5-.8.9-1.5.9-.9 0-1.6-.6-1.7-1.4h4.4v-.8zm-4.4-.7c0-.7.6-1.2 1.5-1.2.8 0 1.4.5 1.5 1.2h-3z" />
  </svg>
);
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { BACKEND_URL, getAuthHeaders } from "@/utils/api";

/* ── Research type config ── */
const RESEARCH_TYPES: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ResearchPaper:           { label: "Research Paper",          icon: Microscope,   color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-500/10" },
  InnovationProject:       { label: "Innovation Project",      icon: Lightbulb,    color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  Prototype:               { label: "Prototype",               icon: Cpu,          color: "text-purple-600 dark:text-purple-400",bg: "bg-purple-500/10" },
  ConferencePresentation:  { label: "Conference Presentation", icon: Presentation, color: "text-green-600 dark:text-green-400",  bg: "bg-green-500/10" },
  ScienceFair:             { label: "Science Fair",            icon: FlaskConical, color: "text-pink-600 dark:text-pink-400",   bg: "bg-pink-500/10" },
  StartupIdea:             { label: "Startup Idea",            icon: Rocket,       color: "text-orange-600 dark:text-orange-400",bg: "bg-orange-500/10" },
};

type ThemeKey = "Academic" | "Corporate" | "Startup" | "Creative" | "AIFuturistic";

/* ── Types ── */
interface PublicPortfolio {
  isApproved: boolean;
  isPreview?: boolean;
  name: string;
  email: string;
  gender: string;
  department: string;
  username: string;
  message?: string;
  profile?: {
    bio: string;
    phone: string;
    personalEmail?: string;
    personalStory: string;
    sop: string;
    profileImageUrl: string;
    skills: string;
    theme?: string;
    gitHubUsername?: string;
    behanceUsername?: string;
  };
  academicRecords: any[];
  certifications: any[];
  activities: any[];
  projects: any[];
  researchInnovations: any[];
}

/* ─────────────────────────── COMPONENT ─────────────────────────── */
export default function StudentPublicPortfolio() {
  const params   = useParams();
  const router   = useRouter();
  const username = params.username as string;

  const [data,        setData]        = useState<PublicPortfolio | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [darkMode,    setDarkMode]    = useState(false);
  const [showQr,      setShowQr]      = useState(false);
  const [pageUrl,     setPageUrl]     = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove("dark");
        if (!savedTheme) {
          localStorage.setItem("theme", "light");
        }
      }
    }
    (async () => {
      try {
        const res    = await fetch(`${BACKEND_URL}/api/publicportfolio/${username}`, {
          headers: getAuthHeaders() as Record<string, string>
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to fetch student profile.");
        setData(result);
      } catch (e: any) {
        setError(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const toggleDark = () => {
    const next = !darkMode;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDarkMode(next);
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <Loader2 className="h-10 w-10 text-mcc-crimson dark:text-mcc-gold animate-spin" />
      <p className="text-slate-500 font-medium text-sm">Generating public student portfolio…</p>
    </div>
  );

  /* ── Error ── */
  if (error || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <AlertCircle className="h-14 w-14 text-red-500 mb-4" />
      <h2 className="text-xl font-bold">Portfolio Not Available</h2>
      <p className="text-slate-500 max-w-sm mt-2">{error || "The requested student profile could not be loaded."}</p>
      <button onClick={() => router.push("/")} className="mt-6 px-5 py-2.5 rounded-xl btn-premium font-bold text-sm cursor-pointer">Return to Hub</button>
    </div>
  );

  /* ── Not approved and not previewing ── */
  if (!data.isApproved && !data.isPreview) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <MccLogo className="h-16 w-16 text-mcc-crimson dark:text-mcc-gold mb-4" />
      <h2 className="text-2xl font-bold text-mcc-crimson dark:text-mcc-gold">Madras Christian College</h2>
      <p className="text-xs uppercase tracking-widest text-slate-500 mt-1 mb-6">Student Registry Office</p>
      <div className="glass-panel p-6 rounded-2xl max-w-md border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-400 text-sm">
        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
        <p className="font-semibold">{data.message}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          MCC policy requires student details to undergo administrative verification before public publication.
        </p>
      </div>
      <button onClick={() => router.push("/")} className="mt-8 px-5 py-2.5 rounded-xl btn-premium font-bold text-sm cursor-pointer">Back to Portal Home</button>
    </div>
  );

  /* ── Theme resolution ── */
  const pImageUrl = data.profile?.profileImageUrl
    ? `${BACKEND_URL}${data.profile.profileImageUrl}`
    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80";

  const resolveTheme = (s: string): ThemeKey => {
    const c = (s || "").trim().toLowerCase().replace(/\s*theme\s*/g, "").replace(/\s+/g, "");
    if (c === "corporate")                    return "Corporate";
    if (c === "startup")                      return "Startup";
    if (c === "creative")                     return "Creative";
    if (c === "aifuturistic" || c === "futuristic") return "AIFuturistic";
    return "Academic";
  };

  const theme = resolveTheme((data?.profile as any)?.theme || "");

  /* ══════════════════════════════════════════════════════════════════
     RENDER BY THEME — each theme is its own complete layout
  ══════════════════════════════════════════════════════════════════ */
  return (
    <>
      {data.isPreview && (
        <div className="no-print fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-amber-500/90 text-slate-950 backdrop-blur-md px-4 py-3 rounded-2xl border border-amber-600/50 shadow-2xl font-semibold text-xs animate-pulse">
          <AlertCircle className="h-5 w-5 text-slate-950 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[11px] uppercase tracking-wider">Preview Mode</span>
            <span className="text-[10px] text-slate-800 font-medium">Pending institutional approval. Visible only to Admins &amp; Staff.</span>
          </div>
        </div>
      )}
      {theme === "Academic"     && <AcademicLayout    data={data} pImageUrl={pImageUrl} username={username} darkMode={darkMode} toggleDark={toggleDark} showQr={showQr} setShowQr={setShowQr} pageUrl={pageUrl} router={router} />}
      {theme === "Corporate"    && <CorporateLayout   data={data} pImageUrl={pImageUrl} username={username} darkMode={darkMode} toggleDark={toggleDark} showQr={showQr} setShowQr={setShowQr} pageUrl={pageUrl} router={router} />}
      {theme === "Startup"      && <StartupLayout     data={data} pImageUrl={pImageUrl} username={username} darkMode={darkMode} toggleDark={toggleDark} showQr={showQr} setShowQr={setShowQr} pageUrl={pageUrl} router={router} />}
      {theme === "Creative"     && <CreativeLayout    data={data} pImageUrl={pImageUrl} username={username} darkMode={darkMode} toggleDark={toggleDark} showQr={showQr} setShowQr={setShowQr} pageUrl={pageUrl} router={router} />}
      {theme === "AIFuturistic" && <AIFuturisticLayout data={data} pImageUrl={pImageUrl} username={username} darkMode={darkMode} toggleDark={toggleDark} showQr={showQr} setShowQr={setShowQr} pageUrl={pageUrl} router={router} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED PROPS TYPE
═══════════════════════════════════════════════════════════════════════════ */
interface LayoutProps {
  data: PublicPortfolio;
  pImageUrl: string;
  username: string;
  darkMode: boolean;
  toggleDark: () => void;
  showQr: boolean;
  setShowQr: (v: boolean) => void;
  pageUrl: string;
  router: any;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. ACADEMIC THEME — Library / University Gazette style
   • Serif font, cream/parchment background, crimson accents
   • Two-column newspaper layout with ruled dividers
   • Avatar in oval frame with gold ring
   • Section dividers as decorative horizontal rules
═══════════════════════════════════════════════════════════════════════════ */
function AcademicLayout({ data, pImageUrl, username, darkMode, toggleDark, showQr, setShowQr, pageUrl, router }: LayoutProps) {
  /* ── inline colour tokens so dark/light are explicit everywhere ── */
  const C = {
    bg:          darkMode ? "#0f0d0a" : "#f9f6f0",
    surface:     darkMode ? "#1c1710" : "#ffffff",
    surfaceAlt:  darkMode ? "#231e14" : "#f4efe6",
    border:      darkMode ? "#3a3020" : "#d6cfc4",
    borderLight: darkMode ? "#2a2318" : "#e8e2d8",
    text:        darkMode ? "#e8e0d0" : "#1c1a17",
    textMuted:   darkMode ? "#9e9480" : "#6b6458",
    textFaint:   darkMode ? "#6b6050" : "#9e9588",
    crimson:     darkMode ? "#c8876a" : "#7a1c1c",
    gold:        darkMode ? "#d4af37" : "#8a6a00",
    rule:        darkMode
      ? "linear-gradient(90deg, transparent, #c8876a60, #d4af3780, #c8876a60, transparent)"
      : "linear-gradient(90deg, transparent, #7a1c1c, #d4af37, #7a1c1c, transparent)",
    thinRule:    darkMode
      ? "linear-gradient(90deg, transparent, #c8876a30, transparent)"
      : "linear-gradient(90deg, transparent, #7a1c1c30, transparent)",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "Georgia, 'Times New Roman', serif", transition: "background 0.3s, color 0.3s" }}>

      {/* ── Inject font + shared rules ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap');
        .ac-h   { font-family: 'Cormorant Garamond', Georgia, serif; }
        .ac-b   { font-family: 'EB Garamond', Georgia, serif; }
        @media print { .no-print { display:none!important; } }
      `}</style>

      {/* ── Header: formal letterhead ── */}
      <header className="no-print sticky top-0 z-50" style={{ backgroundColor: C.surface, borderBottom: `2px solid ${C.crimson}` }}>
        <div style={{ width: "100%", padding: "0 24px" }}>
          {/* Masthead band */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MccLogo style={{ width: 26, height: 26, color: C.crimson }} />
              <div>
                <p className="ac-h" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: C.crimson }}>Madras Christian College</p>
                <p className="ac-b" style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.textFaint }}>Student Portfolio Registry · Est. 1837</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={toggleDark} style={{ padding: 6, border: `1px solid ${C.border}`, borderRadius: 4, background: "transparent", cursor: "pointer", color: C.textMuted }}>
                {darkMode ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
              </button>
              <button onClick={() => setShowQr(true)} style={{ padding: 6, border: `1px solid ${C.border}`, borderRadius: 4, background: "transparent", cursor: "pointer", color: C.textMuted }}>
                <QrCode style={{ width: 14, height: 14 }} />
              </button>
              <button onClick={() => window.print()} style={{ padding: "5px 12px", backgroundColor: C.crimson, color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Download style={{ width: 13, height: 13 }} /> Download PDF
              </button>
            </div>
          </div>
          {/* Ornamental rule */}
          <div style={{ height: 1, background: C.rule, marginBottom: 0 }} />
        </div>
      </header>

      <main style={{ width: "100%", padding: "48px 24px" }}>

        {/* ── Hero: formal CV header block ── */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingBottom: 32, borderBottom: `1px solid ${C.border}`, marginBottom: 32 }}>
            {/* Round avatar with double border ring */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", border: `3px solid ${C.crimson}`, boxShadow: `0 0 0 5px ${C.surfaceAlt}, 0 0 0 7px ${C.gold}40`, flexShrink: 0 }}>
                <img src={pImageUrl} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              {/* Verified stamp */}
              <div style={{ position: "absolute", bottom: -4, right: -4, backgroundColor: C.crimson, color: "#fff", fontSize: 7, fontWeight: 700, padding: "2px 6px", letterSpacing: "0.15em", textTransform: "uppercase" }}>VERIFIED</div>
            </div>

            <h1 className="ac-h" style={{ fontSize: 36, fontWeight: 700, color: C.text, letterSpacing: "0.02em", lineHeight: 1.2 }}>{data.name}</h1>
            <p className="ac-h" style={{ fontSize: 14, fontStyle: "italic", color: C.crimson, marginTop: 4 }}>{data.department}</p>
            <p className="ac-b" style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Madras Christian College &middot; Founded 1837</p>

            {data.profile?.bio && (
              <p className="ac-b" style={{ fontSize: 13, color: C.textMuted, marginTop: 10, maxWidth: 540, lineHeight: 1.7 }}>{data.profile.bio}</p>
            )}

            {/* Contact row */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: 20, marginTop: 14 }}>
              {[{Icon: Mail, val: data.email}, {Icon: Mail, val: data.profile?.personalEmail}, {Icon: Phone, val: data.profile?.phone}, {Icon: Badge, val: data.gender}].filter(c => c.val).map(({Icon, val}, i) => (
                <span key={i} className="ac-b" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textMuted }}>
                  <Icon style={{ width: 12, height: 12, color: C.gold }} />{val}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Skills ── */}
        {data.profile?.skills && (
          <section style={{ marginBottom: 36 }}>
            <AcSectionHead label="Core Competencies" C={C} />
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 12 }}>
              {data.profile.skills.split(",").map(s => s.trim()).filter(Boolean).map((skill, i) => (
                <span key={i} className="ac-b skills-badge" style={{ fontSize: 11, padding: "3px 10px", border: `1px solid ${C.gold}50`, color: C.crimson, letterSpacing: "0.05em" }}>{skill}</span>
              ))}
            </div>
          </section>
        )}

        {/* ── Two-column body ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="ac-grid">
          <style>{`@media(min-width:768px){ .ac-grid{ grid-template-columns: 1fr 280px !important; } }`}</style>

          {/* Left: narrative + projects */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {data.profile?.personalStory && (
              <section>
                <AcSectionHead label="Personal Statement" C={C} />
                <p className="ac-b" style={{ fontSize: 13, lineHeight: 1.95, color: C.textMuted, marginTop: 12, whiteSpace: "pre-line" }}>{data.profile.personalStory}</p>
              </section>
            )}

            {data.profile?.sop && (
              <section>
                <AcSectionHead label="Statement of Purpose" C={C} />
                <p className="ac-b" style={{ fontSize: 13, lineHeight: 1.95, color: C.textMuted, marginTop: 12, whiteSpace: "pre-line" }}>{data.profile.sop}</p>
              </section>
            )}

            {data.projects.length > 0 && (
              <section>
                <AcSectionHead label="Engineering Projects" C={C} />
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 14 }}>
                  {data.projects.map(proj => (
                    <div key={proj.id} style={{ borderLeft: `2px solid ${C.gold}60`, paddingLeft: 14, paddingTop: 4, paddingBottom: 4 }}>
                      <h3 className="ac-h" style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{proj.title}</h3>
                      <p className="ac-b" style={{ fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 1.7 }}>{proj.description}</p>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 5 }}>
                        {(proj.technologiesUsed || "").split(",").map((t: string) => t.trim()).filter(Boolean).map((tech: string, i: number) => (
                          <span key={i} className="ac-b skills-badge" style={{ fontSize: 9, border: `1px solid ${C.border}`, padding: "1px 5px", color: C.textMuted }}>{tech}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 14, marginTop: 5 }} className="no-print">
                        {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="ac-h" style={{ fontSize: 11, color: C.crimson, textDecoration: "none", fontStyle: "italic", display: "flex", alignItems: "center", gap: 3 }}><LinkIcon style={{ width: 11, height: 11 }} />App Link</a>}
                        {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="ac-b" style={{ fontSize: 11, color: C.textMuted, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><Globe style={{ width: 11, height: 11 }} />Source</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.researchInnovations?.length > 0 && (
              <section>
                <AcSectionHead label="Research &amp; Innovation" C={C} />
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                  {data.researchInnovations.map(item => {
                    const ti = RESEARCH_TYPES[item.type] || { label: item.type, icon: Microscope, color: "", bg: "" };
                    const Icon = ti.icon;
                    return (
                      <div key={item.id} style={{ borderLeft: `2px solid ${C.gold}40`, paddingLeft: 14 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: C.gold }}><Icon style={{ width: 9, height: 9, display: "inline", marginRight: 3 }} />{ti.label}</span>
                        <h3 className="ac-h" style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 2 }}>{item.title}</h3>
                        <p className="ac-b" style={{ fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 1.7 }}>{item.description}</p>
                        {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="no-print ac-h" style={{ fontSize: 11, color: C.crimson, fontStyle: "italic", textDecoration: "none", display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}><ExternalLink style={{ width: 11, height: 11 }} />View Link</a>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {data.profile?.gitHubUsername && (
              <section>
                <GithubShowcase githubUsername={data.profile.gitHubUsername} theme="Academic" />
              </section>
            )}

            {data.profile?.behanceUsername && (
              <section>
                <BehanceShowcase behanceUsername={data.profile.behanceUsername} theme="Academic" />
              </section>
            )}
          </div>

          {/* Right: sidebar columns */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 28, borderLeft: `1px solid ${C.border}`, paddingLeft: 28 }}>

            {data.academicRecords.length > 0 && (
              <section>
                <AcSideHead label="Education" Icon={GraduationCap} C={C} />
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
                  {data.academicRecords.map(rec => (
                    <div key={rec.id} style={{ paddingBottom: 10, borderBottom: `1px solid ${C.borderLight}` }}>
                      <p className="ac-b" style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.08em", display: "flex", gap: 8, alignItems: "center" }}>
                        <span>{rec.startYear} – {rec.isCurrentlyStudying ? "Present" : rec.endYear}</span>
                        {rec.level && (
                          <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", padding: "1px 4px", border: `1px solid ${C.crimson}50`, color: C.crimson, borderRadius: 2 }}>{rec.level}</span>
                        )}
                      </p>
                      <p className="ac-h" style={{ fontSize: 12, fontWeight: 600, color: C.text, marginTop: 1 }}>{rec.degree}</p>
                      <p className="ac-b" style={{ fontSize: 10, color: C.textMuted }}>{rec.institution}</p>
                      <p className="ac-h" style={{ fontSize: 10, fontWeight: 700, color: C.gold, marginTop: 2 }}>Grade: {rec.gradeOrCgpa}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.certifications.length > 0 && (
              <section>
                <AcSideHead label="Certifications" Icon={Award} C={C} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  {data.certifications.map(cert => (
                    <div key={cert.id} style={{ paddingBottom: 8, borderBottom: `1px solid ${C.borderLight}` }}>
                      <p className="ac-h" style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{cert.name}</p>
                      <p className="ac-b" style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>{cert.issuingOrganization}</p>
                      <p className="ac-b" style={{ fontSize: 9, color: C.textFaint, marginTop: 1 }}>{new Date(cert.issueDate).toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.activities.length > 0 && (
              <section>
                <AcSideHead label="NGO &amp; Activities" Icon={TrendingUp} C={C} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                  {data.activities.map(act => (
                    <div key={act.id} style={{ paddingBottom: 8, borderBottom: `1px solid ${C.borderLight}` }}>
                      <span className="ac-b" style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: C.gold }}>{act.type}</span>
                      <p className="ac-h" style={{ fontSize: 11, fontWeight: 600, color: C.text, marginTop: 1 }}>{act.title}</p>
                      <p className="ac-b" style={{ fontSize: 10, color: C.textMuted }}>{act.organization}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print" style={{ borderTop: `2px solid ${C.crimson}`, marginTop: 48, padding: "16px 24px", textAlign: "center" as const }}>
        <div style={{ height: 1, background: C.rule, marginBottom: 10 }} />
        <p className="ac-b" style={{ fontSize: 10, color: C.textFaint, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>Madras Christian College &middot; Est. 1837 &middot; Student Registry &middot; {username.toUpperCase()}</p>
      </footer>

      <QrModal show={showQr} onClose={() => setShowQr(false)} pageUrl={pageUrl} />
    </div>
  );
}

/* Academic helper sub-components */
function AcSectionHead({ label, C }: { label: string; C: any }) {
  return (
    <div>
      <h2 className="ac-h" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.25em", color: C.crimson }}>{label}</h2>
      <div style={{ height: 1, background: C.thinRule, marginTop: 5 }} />
    </div>
  );
}
function AcSideHead({ label, Icon, C }: { label: string; Icon: any; C: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Icon style={{ width: 11, height: 11, color: C.gold }} />
      <h3 className="ac-h" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: C.crimson }}>{label}</h3>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. CORPORATE THEME — Executive Resume / LinkedIn-style
   • Clean white with navy/slate tones, sans-serif, tight grid
   • Left sidebar for contacts + skills, right main content
   • Cards use sharp corners with left-accent border
   • Progress-style skill indicators
═══════════════════════════════════════════════════════════════════════════ */
function CorporateLayout({ data, pImageUrl, username, darkMode, toggleDark, showQr, setShowQr, pageUrl, router }: LayoutProps) {
  const C = {
    bg:          darkMode ? "#0b0f1a" : "#f0f4f8",
    surface:     darkMode ? "#111827" : "#ffffff",
    surfaceAlt:  darkMode ? "#1f2937" : "#f8fafc",
    border:      darkMode ? "#1e293b" : "#e2e8f0",
    borderLight: darkMode ? "#1a2234" : "#f1f5f9",
    text:        darkMode ? "#e2e8f0" : "#0f172a",
    textMuted:   darkMode ? "#94a3b8" : "#475569",
    textFaint:   darkMode ? "#64748b" : "#94a3b8",
    navy:        darkMode ? "#1e3a8a" : "#1e3a8a",
    navyLight:   darkMode ? "#2563eb" : "#1d4ed8",
    accent:      darkMode ? "#60a5fa" : "#1e40af",
    accentBg:    darkMode ? "#1e3a8a20" : "#eff6ff",
    accentBorder:darkMode ? "#1e40af40" : "#bfdbfe",
    tagBg:       darkMode ? "#1e3a8a30" : "#dbeafe",
    tagText:     darkMode ? "#93c5fd" : "#1e40af",
    headerBg:    darkMode ? "#0f172a"  : "#1e3a8a",
    headerText:  "#ffffff",
    heroFrom:    darkMode ? "#0f172a"  : "#1e3a8a",
    heroTo:      darkMode ? "#1e293b"  : "#1d4ed8",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif", transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @media print { .no-print { display:none!important; } }
      `}</style>

      {/* ── Header: executive top bar ── */}
      <header className="no-print sticky top-0 z-50" style={{ backgroundColor: C.headerBg, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ width: "100%", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 style={{ width: 20, height: 20, color: "#93c5fd" }} />
            <div>
              <p style={{ color: "#ffffff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>MCC Verified Candidate</p>
              <p style={{ color: "#93c5fd", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>Madras Christian College · {new Date().getFullYear()}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggleDark} style={{ padding: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", color: "#93c5fd", borderRadius: 4 }}>
              {darkMode ? <Sun style={{ width: 13, height: 13 }} /> : <Moon style={{ width: 13, height: 13 }} />}
            </button>
            <button onClick={() => setShowQr(true)} style={{ padding: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", color: "#93c5fd", borderRadius: 4 }}>
              <QrCode style={{ width: 13, height: 13 }} />
            </button>
            <button onClick={() => window.print()} style={{ padding: "6px 14px", backgroundColor: "#3b82f6", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Download style={{ width: 12, height: 12 }} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero: name + identity panel ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.heroFrom} 0%, ${C.heroTo} 100%)`, color: "#fff" }}>
        <div style={{ width: "100%", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 20 }} className="corp-hero">
          <style>{`.corp-hero { flex-direction: column; } @media(min-width:640px){ .corp-hero { flex-direction: row !important; align-items: center !important; } }`}</style>
          {/* Square avatar with rank badge */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: 6, overflow: "hidden", border: "2px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
              <img src={pImageUrl} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", backgroundColor: "#3b82f6", color: "#fff", fontSize: 7, fontWeight: 800, padding: "2px 8px", letterSpacing: "0.12em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>MCC 1837</div>
          </div>
          {/* Identity text */}
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em", color: "#fff", lineHeight: 1.2 }}>{data.name}</h1>
            <p style={{ fontSize: 13, color: "#93c5fd", fontWeight: 600, marginTop: 3 }}>{data.department} &middot; Madras Christian College</p>
            {data.profile?.bio && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{data.profile.bio}</p>}
          </div>
          {/* Contact column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: "#93c5fd", borderLeft: "1px solid rgba(255,255,255,0.15)", paddingLeft: 20, flexShrink: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail style={{ width: 12, height: 12 }} />{data.email}</span>
            {data.profile?.personalEmail && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail style={{ width: 12, height: 12 }} />{data.profile.personalEmail}</span>}
            {data.profile?.phone && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone style={{ width: 12, height: 12 }} />{data.profile.phone}</span>}
            {data.gender && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Badge style={{ width: 12, height: 12 }} />{data.gender}</span>}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <main style={{ width: "100%", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr", gap: 28 }} className="corp-main">
        <style>{`@media(min-width:768px){ .corp-main { grid-template-columns: 260px 1fr !important; } }`}</style>

        {/* Left sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {data.profile?.skills && (
            <CorpPanel C={C}>
              <CorpPanelHead label="Core Skills" Icon={Brain} C={C} />
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {data.profile.skills.split(",").map(s => s.trim()).filter(Boolean).map((skill, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textMuted }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: C.accent, flexShrink: 0 }} />
                    {skill}
                  </li>
                ))}
              </ul>
            </CorpPanel>
          )}

          {data.academicRecords.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CorpSideHead label="Education" Icon={GraduationCap} C={C} />
              {data.academicRecords.map(rec => (
                <div key={rec.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 9, color: C.textFaint, fontWeight: 600, letterSpacing: "0.06em" }}>{rec.startYear}–{rec.isCurrentlyStudying ? "Present" : rec.endYear}</p>
                    {rec.level && (
                      <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", padding: "1px 5px", backgroundColor: `${C.accent}15`, color: C.accent, borderRadius: 3 }}>{rec.level}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 1 }}>{rec.degree}</p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>{rec.institution}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginTop: 2 }}>CGPA: {rec.gradeOrCgpa}</p>
                </div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CorpSideHead label="Certifications" Icon={Award} C={C} />
              {data.certifications.map(cert => (
                <div key={cert.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{cert.name}</p>
                  <p style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>{cert.issuingOrganization}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <CheckCircle2 style={{ width: 10, height: 10, color: C.accent }} />
                    <p style={{ fontSize: 9, color: C.accent, fontWeight: 600 }}>{new Date(cert.issueDate).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {data.profile?.personalStory && (
            <CorpPanel C={C}>
              <CorpPanelHead label="Professional Summary" Icon={BookOpen} C={C} />
              <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75, marginTop: 10, whiteSpace: "pre-line" }}>{data.profile.personalStory}</p>
            </CorpPanel>
          )}

          {data.profile?.sop && (
            <CorpPanel C={C}>
              <CorpPanelHead label="Statement of Purpose" Icon={Star} C={C} />
              <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.75, marginTop: 10, whiteSpace: "pre-line" }}>{data.profile.sop}</p>
            </CorpPanel>
          )}

          {data.projects.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <CorpSideHead label="Key Projects" Icon={Code2} C={C} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="corp-proj">
                <style>{`@media(min-width:600px){ .corp-proj { grid-template-columns: 1fr 1fr !important; } }`}</style>
                {data.projects.map(proj => (
                  <div key={proj.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{proj.title}</p>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 6 }}>
                        {(proj.technologiesUsed || "").split(",").map((t: string) => t.trim()).filter(Boolean).map((tech: string, i: number) => (
                          <span key={i} className="skills-badge" style={{ fontSize: 9, fontWeight: 700, backgroundColor: C.tagBg, color: C.tagText, border: `1px solid ${C.accentBorder}`, padding: "1px 6px" }}>{tech}</span>
                        ))}
                      </div>
                      <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>{proj.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}` }} className="no-print">
                      {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><LinkIcon style={{ width: 11, height: 11 }} />App</a>}
                      {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><Globe style={{ width: 11, height: 11 }} />Source</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.researchInnovations?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <CorpSideHead label="Research &amp; Innovation" Icon={Microscope} C={C} />
              {data.researchInnovations.map(item => {
                const ti = RESEARCH_TYPES[item.type] || { label: item.type, icon: Microscope, color: "", bg: "" };
                const Icon = ti.icon;
                return (
                  <div key={item.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", gap: 12 }}>
                    <div style={{ width: 32, height: 32, flexShrink: 0, backgroundColor: C.accentBg, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon style={{ width: 14, height: 14, color: C.accent }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: C.accent, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{ti.label}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 1 }}>{item.title}</p>
                      <p style={{ fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 1.6 }}>{item.description}</p>
                      {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="no-print" style={{ fontSize: 11, fontWeight: 700, color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 3, marginTop: 4 }}><ExternalLink style={{ width: 11, height: 11 }} />View</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {data.profile?.gitHubUsername && (
            <GithubShowcase githubUsername={data.profile.gitHubUsername} theme="Corporate" />
          )}

          {data.profile?.behanceUsername && (
            <BehanceShowcase behanceUsername={data.profile.behanceUsername} theme="Corporate" />
          )}

          {data.activities.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <CorpSideHead label="NGO &amp; Activities" Icon={TrendingUp} C={C} />
              {data.activities.map(act => (
                <div key={act.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: "10px 12px" }}>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", backgroundColor: C.accentBg, color: C.accent, padding: "2px 7px", border: `1px solid ${C.accentBorder}` }}>{act.type}</span>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 5 }}>{act.title}</p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>{act.organization}</p>
                  <p style={{ fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 1.6 }}>{act.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="no-print" style={{ backgroundColor: C.headerBg, color: "#93c5fd", textAlign: "center" as const, fontSize: 10, padding: "14px 24px", marginTop: 32, letterSpacing: "0.1em", fontWeight: 500 }}>
        Madras Christian College &middot; MCC 1837 &middot; Portfolio Registry &middot; {username.toUpperCase()}
      </footer>
      <QrModal show={showQr} onClose={() => setShowQr(false)} pageUrl={pageUrl} />
    </div>
  );
}

/* Corporate helper sub-components */
function CorpPanel({ C, children }: { C: any; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
      {children}
    </div>
  );
}
function CorpPanelHead({ label, Icon, C }: { label: string; Icon: any; C: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
      <Icon style={{ width: 14, height: 14, color: C.accent }} />
      <h2 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: C.accent }}>{label}</h2>
    </div>
  );
}
function CorpSideHead({ label, Icon, C }: { label: string; Icon: any; C: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, borderLeft: `3px solid ${C.accent}`, paddingLeft: 8 }}>
      <Icon style={{ width: 13, height: 13, color: C.accent }} />
      <h3 style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.15em", color: C.accent }}>{label}</h3>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. STARTUP THEME — Product Launch / YC-style Portfolio
   • Full-bleed vibrant gradient hero
   • Pill-shaped badges, bold stats row, emoji-accented headers
   • Rounded-3xl cards with colored top accents
   • Tiled skill chips in gradient colors
═══════════════════════════════════════════════════════════════════════════ */
function StartupLayout({ data, pImageUrl, username, darkMode, toggleDark, showQr, setShowQr, pageUrl, router }: LayoutProps) {
  const skills = (data.profile?.skills || "").split(",").map(s => s.trim()).filter(Boolean);

  const C = {
    bg:         darkMode ? "#0e0b15" : "#fafafa",
    surface:    darkMode ? "#17122a" : "#ffffff",
    surfaceAlt: darkMode ? "#1f1835" : "#f4f4f5",
    border:     darkMode ? "#2d2545" : "#e4e4e7",
    text:       darkMode ? "#f4f0ff" : "#18181b",
    textMuted:  darkMode ? "#a899cc" : "#52525b",
    textFaint:  darkMode ? "#6b5e99" : "#a1a1aa",
    accent:     "#f97316",       /* orange — stays punchy both modes */
    accentAlt:  "#a855f7",       /* purple */
    headerBg:   darkMode ? "rgba(14,11,21,0.85)"  : "rgba(255,255,255,0.85)",
    headerBorder: darkMode ? "#2d2545" : "#e4e4e7",
  };

  const topColors = [
    "linear-gradient(90deg,#f97316,#ec4899)",
    "linear-gradient(90deg,#a855f7,#6366f1)",
    "linear-gradient(90deg,#06b6d4,#3b82f6)",
    "linear-gradient(90deg,#22c55e,#14b8a6)",
  ];
  const chipGrads = [
    "linear-gradient(135deg,#f97316,#ec4899)",
    "linear-gradient(135deg,#ec4899,#a855f7)",
    "linear-gradient(135deg,#a855f7,#6366f1)",
    "linear-gradient(135deg,#6366f1,#06b6d4)",
    "linear-gradient(135deg,#06b6d4,#14b8a6)",
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "'Outfit', system-ui, sans-serif", transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap');
        @keyframes su-grad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .su-hero-anim { background: linear-gradient(135deg,#f97316,#ec4899,#a855f7,#6366f1); background-size:300% 300%; animation: su-grad 8s ease infinite; }
        @media print { .no-print { display:none!important; } }
      `}</style>

      {/* Header */}
      <header className="no-print sticky top-0 z-50" style={{ backgroundColor: C.headerBg, borderBottom: `1px solid ${C.headerBorder}`, backdropFilter: "blur(16px)" }}>
        <div style={{ width: "100%", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap style={{ width: 18, height: 18, color: C.accent }} />
            <span style={{ fontWeight: 900, fontSize: 14, color: C.text }}>MCC</span>
            <span style={{ fontWeight: 300, fontSize: 13, color: C.textMuted }}>/&nbsp;verified candidate</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggleDark} style={{ padding: 7, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 999, cursor: "pointer", color: C.textMuted }}>
              {darkMode ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
            </button>
            <button onClick={() => setShowQr(true)} style={{ padding: 7, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 999, cursor: "pointer", color: C.textMuted }}>
              <QrCode style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={() => window.print()} className="su-hero-anim no-print" style={{ padding: "7px 16px", borderRadius: 999, border: "none", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <Download style={{ width: 13, height: 13 }} /> Export
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="su-hero-anim" style={{ color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
        <div style={{ position: "relative", width: "100%", padding: "48px 24px", display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: 28 }}>
          <div style={{ width: 104, height: 104, borderRadius: 20, overflow: "hidden", border: "3px solid rgba(255,255,255,0.3)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", flexShrink: 0 }}>
            <img src={pImageUrl} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 999, padding: "4px 12px", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} /> Live Portfolio · MCC 1837
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.15, color: "#fff" }}>{data.name}</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginTop: 4 }}>{data.department}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{data.profile?.bio || "Student at Madras Christian College"}</p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 12 }}>
              {[{Icon: Mail, val: data.email}, {Icon: Mail, val: data.profile?.personalEmail}, {Icon: Phone, val: data.profile?.phone}].filter(c => c.val).map(({Icon, val}, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: "4px 10px" }}>
                  <Icon style={{ width: 11, height: 11 }} />{val}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skill chips */}
      {skills.length > 0 && (
        <section style={{ width: "100%", padding: "20px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {skills.map((skill, i) => (
              <span key={i} className="skills-badge" style={{ padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#fff", background: chipGrads[i % chipGrads.length], boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      <main style={{ width: "100%", padding: "0 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="su-grid">
          <style>{`@media(min-width:768px){ .su-grid { grid-template-columns: 1fr 280px !important; } }`}</style>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { emoji: "📖", label: "My Story",            body: data.profile?.personalStory },
              { emoji: "🎯", label: "Statement of Purpose", body: data.profile?.sop },
            ].map(sec => sec.body && (
              <div key={sec.label} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "20px 22px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: C.text }}><span style={{ fontSize: 20 }}>{sec.emoji}</span>{sec.label}</h2>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8, whiteSpace: "pre-line" }}>{sec.body}</p>
              </div>
            ))}

            {data.projects.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, color: C.text }}><span style={{ fontSize: 20 }}>🚀</span>Projects</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="su-proj">
                  <style>{`@media(min-width:600px){ .su-proj { grid-template-columns: 1fr 1fr !important; } }`}</style>
                  {data.projects.map((proj, idx) => (
                    <div key={proj.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                      <div style={{ height: 4, background: topColors[idx % topColors.length] }} />
                      <div style={{ padding: "16px 18px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{ fontWeight: 900, fontSize: 13, color: C.text }}>{proj.title}</h3>
                        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4, marginTop: 8 }}>
                          {(proj.technologiesUsed || "").split(",").map((t: string) => t.trim()).filter(Boolean).map((tech: string, i: number) => (
                            <span key={i} className="skills-badge" style={{ fontSize: 9, fontWeight: 700, backgroundColor: C.surfaceAlt, color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 999, padding: "2px 7px" }}>{tech}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.7, flexGrow: 1 }}>{proj.description}</p>
                        <div style={{ display: "flex", gap: 12, marginTop: 12 }} className="no-print">
                          {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 900, color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><LinkIcon style={{ width: 11, height: 11 }} />Live</a>}
                          {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontWeight: 700, color: C.textFaint, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><Globe style={{ width: 11, height: 11 }} />Code</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.researchInnovations?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h2 style={{ fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 8, color: C.text }}><span style={{ fontSize: 20 }}>🔬</span>Research &amp; Innovation</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }} className="su-res">
                  <style>{`@media(min-width:600px){ .su-res { grid-template-columns: 1fr 1fr !important; } }`}</style>
                  {data.researchInnovations.map(item => {
                    const ti = RESEARCH_TYPES[item.type] || { label: item.type, icon: Microscope, color: "", bg: "" };
                    const Icon = ti.icon;
                    return (
                      <div key={item.id} style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 9px", display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start", color: C.textMuted }}><Icon style={{ width: 10, height: 10 }} />{ti.label}</span>
                        <h3 style={{ fontWeight: 900, fontSize: 13, color: C.text }}>{item.title}</h3>
                        <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>{item.description}</p>
                        {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="no-print" style={{ fontSize: 11, fontWeight: 700, color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><ExternalLink style={{ width: 11, height: 11 }} />View</a>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.profile?.gitHubUsername && (
              <GithubShowcase githubUsername={data.profile.gitHubUsername} theme="Startup" />
            )}

            {data.profile?.behanceUsername && (
              <BehanceShowcase behanceUsername={data.profile.behanceUsername} theme="Startup" />
            )}
          </div>

          {/* Right sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.academicRecords.length > 0 && (
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "16px 18px" }}>
                <h3 style={{ fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: C.text, marginBottom: 10 }}><span>🎓</span>Education</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.academicRecords.map(rec => (
                    <div key={rec.id} style={{ backgroundColor: C.surfaceAlt, borderRadius: 12, padding: "10px 12px" }}>
                      <p style={{ fontSize: 9, color: C.textFaint, fontWeight: 600 }}>{rec.startYear}–{rec.endYear}</p>
                      <p style={{ fontWeight: 700, fontSize: 12, color: C.text, marginTop: 1 }}>{rec.degree}</p>
                      <p style={{ fontSize: 10, color: C.textMuted }}>{rec.institution}</p>
                      <p style={{ fontSize: 10, fontWeight: 900, color: C.accent, marginTop: 2 }}>⭐ {rec.gradeOrCgpa}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.certifications.length > 0 && (
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "16px 18px" }}>
                <h3 style={{ fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: C.text, marginBottom: 10 }}><span>🏆</span>Certifications</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.certifications.map(cert => (
                    <div key={cert.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: "#22c55e", flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{cert.name}</p>
                        <p style={{ fontSize: 10, color: C.textMuted }}>{cert.issuingOrganization}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.activities.length > 0 && (
              <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "16px 18px" }}>
                <h3 style={{ fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: C.text, marginBottom: 10 }}><span>🌱</span>NGO &amp; Activities</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.activities.map(act => (
                    <div key={act.id} style={{ borderLeft: `2px solid ${C.accent}`, paddingLeft: 10 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: C.accent, textTransform: "uppercase" as const }}>{act.type}</span>
                      <p style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{act.title}</p>
                      <p style={{ fontSize: 10, color: C.textFaint }}>{act.organization}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="no-print su-hero-anim" style={{ color: "rgba(255,255,255,0.8)", textAlign: "center" as const, fontSize: 10, padding: "14px 24px", fontWeight: 600, letterSpacing: "0.08em" }}>
        Madras Christian College · MCC 1837 · {username.toUpperCase()} · Student Portfolio Registry
      </footer>
      <QrModal show={showQr} onClose={() => setShowQr(false)} pageUrl={pageUrl} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QR MODAL — shared
═══════════════════════════════════════════════════════════════════════════ */
function QrModal({ show, onClose, pageUrl }: { show: boolean; onClose: () => void; pageUrl: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="qr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4 no-print">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl text-center">
            <h3 className="font-bold text-lg mb-1.5">Share Verified Portfolio</h3>
            <p className="text-xs text-slate-500 mb-6">Scan to access MCC credentials instantly.</p>
            <div className="bg-white p-4 rounded-xl w-fit mx-auto border shadow-sm">
              <QRCodeSVG value={pageUrl || "https://mcc.edu.in"} size={180} />
            </div>
            <p className="text-xs font-mono select-all bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mt-5 truncate text-slate-600 dark:text-slate-300">{pageUrl}</p>
            <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs transition-colors cursor-pointer">
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CreativeLayout({ data, pImageUrl, username, darkMode, toggleDark, showQr, setShowQr, pageUrl, router }: LayoutProps) {
  const C = {
    bg:         darkMode ? "#0d0d0f" : "#ffffff",
    surface:    darkMode ? "#18181b" : "#ffffff",
    surfaceAlt: darkMode ? "#27272a" : "#f9f9fb",
    border:     darkMode ? "#3f3f46" : "#e4e4e7",
    text:       darkMode ? "#fafafa" : "#09090b",
    textMuted:  darkMode ? "#a1a1aa" : "#52525b",
    textFaint:  darkMode ? "#71717a" : "#a1a1aa",
    pink:       darkMode ? "#f472b6" : "#ec4899",
    violet:     darkMode ? "#c084fc" : "#8b5cf6",
    yellow:     darkMode ? "#fbbf24" : "#d97706",
    green:      darkMode ? "#4ade80" : "#16a34a",
    cyan:       darkMode ? "#22d3ee" : "#0891b2",
    orange:     darkMode ? "#fb923c" : "#ea580c",
    orbA:       darkMode ? "rgba(244,114,182,0.08)" : "rgba(244,114,182,0.15)",
    orbB:       darkMode ? "rgba(251,191,36,0.06)"  : "rgba(251,191,36,0.12)",
    numA:       darkMode ? "rgba(244,114,182,0.12)" : "rgba(244,114,182,0.22)",
    numB:       darkMode ? "rgba(192,132,252,0.12)" : "rgba(192,132,252,0.22)",
    numC:       darkMode ? "rgba(251,191,36,0.12)"  : "rgba(251,191,36,0.22)",
  };
  const stickerStyles = darkMode
    ? [
        { background: "rgba(253,224,71,0.12)",  color: "#fde047", border: "1px solid rgba(253,224,71,0.25)"  },
        { background: "rgba(244,114,182,0.12)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.25)" },
        { background: "rgba(192,132,252,0.12)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.25)" },
        { background: "rgba(74,222,128,0.12)",  color: "#4ade80", border: "1px solid rgba(74,222,128,0.25)"  },
        { background: "rgba(34,211,238,0.12)",  color: "#22d3ee", border: "1px solid rgba(34,211,238,0.25)"  },
      ]
    : [
        { background: "#fef08a", color: "#713f12", border: "none" },
        { background: "#fbcfe8", color: "#831843", border: "none" },
        { background: "#e9d5ff", color: "#4c1d95", border: "none" },
        { background: "#bbf7d0", color: "#14532d", border: "none" },
        { background: "#a5f3fc", color: "#0c4a6e", border: "none" },
      ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, color: C.text, fontFamily: "'Space Grotesk',system-ui,sans-serif", transition: "background 0.3s,color 0.3s", overflowX: "hidden", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        .cr{font-family:'Space Grotesk',sans-serif;} .crt{font-family:'DM Serif Display',Georgia,serif;}
        @keyframes cr-orb{0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)}}
        .cr-orb-a{animation:cr-orb 9s ease-in-out infinite;} .cr-orb-b{animation:cr-orb 11s ease-in-out infinite;animation-delay:3s;}
        @media print{.no-print{display:none!important;}}
      `}</style>

      <div className="cr-orb-a" style={{ pointerEvents:"none", position:"fixed", top:40, right:40, width:280, height:280, borderRadius:"50%", background:`radial-gradient(circle,${C.orbA},transparent 70%)`, filter:"blur(40px)", zIndex:0 }} />
      <div className="cr-orb-b" style={{ pointerEvents:"none", position:"fixed", bottom:60, left:0, width:220, height:220, borderRadius:"50%", background:`radial-gradient(circle,${C.orbB},transparent 70%)`, filter:"blur(40px)", zIndex:0 }} />

      <header className="no-print sticky top-0 z-50" style={{ backgroundColor: darkMode?"rgba(13,13,15,0.92)":"rgba(255,255,255,0.93)", borderBottom:`3px solid ${C.pink}`, backdropFilter:"blur(14px)" }}>
        <div style={{ width:"100%", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#ec4899,#8b5cf6)" }} />
            <span style={{ fontWeight:700, fontSize:13, color:C.text }}>MCC <span style={{ color:C.pink }}>✦</span> Portfolio</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={toggleDark} style={{ padding:7, background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, cursor:"pointer", color:C.pink }}>
              {darkMode ? <Sun style={{ width:14, height:14, color:C.yellow }} /> : <Moon style={{ width:14, height:14 }} />}
            </button>
            <button onClick={() => setShowQr(true)} style={{ padding:7, background:"transparent", border:`2px solid ${C.pink}`, borderRadius:6, cursor:"pointer", color:C.pink }}>
              <QrCode style={{ width:14, height:14 }} />
            </button>
            <button onClick={() => window.print()} style={{ padding:"7px 14px", background:"linear-gradient(135deg,#ec4899,#8b5cf6)", color:"#fff", fontSize:11, fontWeight:700, border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              <Download style={{ width:13, height:13 }} /> Download
            </button>
          </div>
        </div>
      </header>

      <section style={{ width:"100%", padding:"44px 24px 20px", position:"relative", zIndex:10 }}>
        <div className="crt" style={{ fontSize:"clamp(50px,10vw,88px)", fontWeight:700, color:darkMode?"rgba(244,114,182,0.06)":"rgba(244,114,182,0.1)", position:"absolute", right:24, top:0, lineHeight:1, pointerEvents:"none", userSelect:"none" }} aria-hidden>PORTFOLIO</div>
        <div style={{ display:"flex", flexWrap:"wrap" as const, alignItems:"flex-start", gap:28, position:"relative", zIndex:2 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ padding:3, borderRadius:"50%", background:"linear-gradient(135deg,#ec4899,#a855f7,#8b5cf6)", boxShadow:darkMode?"0 8px 32px rgba(236,72,153,0.3)":"0 8px 32px rgba(236,72,153,0.2)" }}>
              <div style={{ width:120, height:120, borderRadius:"50%", overflow:"hidden", border:`4px solid ${C.bg}` }}>
                <img src={pImageUrl} alt={data.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            </div>
            <div style={{ position:"absolute", bottom:-4, right:-6, background:"#fde047", color:"#713f12", fontSize:8, fontWeight:900, padding:"3px 7px", transform:"rotate(5deg)" }}>VERIFIED</div>
          </div>
          <div style={{ flexGrow:1, paddingTop:6 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:C.pink, marginBottom:4 }}>MCC 1837 · Student Portfolio</p>
            <h1 className="crt" style={{ fontSize:42, fontWeight:700, color:C.text, lineHeight:1.15 }}>{data.name}</h1>
            <p className="crt" style={{ fontSize:16, color:C.pink, fontStyle:"italic", marginTop:4 }}>{data.department}</p>
            <p style={{ fontSize:12, color:C.textMuted, marginTop:6 }}>{data.profile?.bio || "Student at Madras Christian College"}</p>
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:14, marginTop:12, fontSize:11, color:C.textMuted }}>
              <span style={{ display:"flex", alignItems:"center", gap:5, borderBottom:`1px solid ${C.pink}55`, paddingBottom:2 }}><Mail style={{ width:11, height:11, color:C.pink }} />{data.email}</span>
              {data.profile?.personalEmail && <span style={{ display:"flex", alignItems:"center", gap:5, borderBottom:`1px solid ${C.pink}55`, paddingBottom:2 }}><Mail style={{ width:11, height:11, color:C.pink }} />{data.profile.personalEmail}</span>}
              {data.profile?.phone && <span style={{ display:"flex", alignItems:"center", gap:5, borderBottom:`1px solid ${C.pink}55`, paddingBottom:2 }}><Phone style={{ width:11, height:11, color:C.pink }} />{data.profile.phone}</span>}
            </div>
          </div>
        </div>
      </section>

      {data.profile?.skills && (
        <section style={{ width:"100%", padding:"8px 24px 16px", position:"relative", zIndex:10 }}>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8 }}>
            {data.profile.skills.split(",").map((s: string) => s.trim()).filter(Boolean).map((skill: string, i: number) => (
              <span key={i} className="skills-badge" style={{ fontSize:11, fontWeight:900, padding:"5px 12px", display:"inline-block", transform:`rotate(${[-2,1.5,-1,2,-1.5][i%5]}deg)`, ...stickerStyles[i % stickerStyles.length] }}>{skill}</span>
            ))}
          </div>
        </section>
      )}

      <main style={{ width:"100%", padding:"12px 24px 48px", position:"relative", zIndex:10 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:32 }} className="cr-main-grid">
          <style>{`@media(min-width:768px){.cr-main-grid{grid-template-columns:1fr 240px!important;}}`}</style>
          <div style={{ display:"flex", flexDirection:"column", gap:36 }}>
            {[
              { num:"01", label:"Personal Story",       body:data.profile?.personalStory, numC:C.numA, accent:C.pink   },
              { num:"02", label:"Statement of Purpose", body:data.profile?.sop,           numC:C.numA, accent:C.pink   },
            ].map(sec => sec.body && (
              <section key={sec.label} style={{ display:"flex", gap:16 }}>
                <div style={{ flexShrink:0, width:44, textAlign:"right" as const }}>
                  <span className="crt" style={{ fontSize:28, fontWeight:700, color:sec.numC, lineHeight:1 }}>{sec.num}</span>
                </div>
                <div style={{ flexGrow:1, borderTop:`3px solid ${sec.accent}`, paddingTop:12 }}>
                  <h2 className="crt" style={{ fontSize:19, fontWeight:700, color:sec.accent, marginBottom:8 }}>{sec.label}</h2>
                  <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.85, whiteSpace:"pre-line" }}>{sec.body}</p>
                </div>
              </section>
            ))}

            {data.projects.length > 0 && (
              <section style={{ display:"flex", gap:16 }}>
                <div style={{ flexShrink:0, width:44, textAlign:"right" as const }}>
                  <span className="crt" style={{ fontSize:28, fontWeight:700, color:C.numB, lineHeight:1 }}>03</span>
                </div>
                <div style={{ flexGrow:1, borderTop:`3px solid ${C.violet}`, paddingTop:12 }}>
                  <h2 className="crt" style={{ fontSize:19, fontWeight:700, color:C.violet, display:"flex", alignItems:"center", gap:6, marginBottom:12 }}><Code2 style={{ width:16, height:16 }} />Projects</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {data.projects.map((proj: any) => (
                      <div key={proj.id} style={{ border:`1px solid ${C.border}`, borderTop:`3px solid ${C.violet}`, padding:"14px 16px", display:"flex", flexDirection:"column", gap:6 }}>
                        <h3 style={{ fontWeight:900, fontSize:13, color:C.text }}>{proj.title}</h3>
                        <div style={{ display:"flex", flexWrap:"wrap" as const, gap:4 }}>
                          {(proj.technologiesUsed||"").split(",").map((t:string)=>t.trim()).filter(Boolean).map((tech:string,i:number)=>(
                            <span key={i} className="skills-badge" style={{ fontSize:9, fontWeight:700, backgroundColor:C.surfaceAlt, color:C.textMuted, border:`1px solid ${C.border}`, padding:"1px 6px" }}>{tech}</span>
                          ))}
                        </div>
                        <p style={{ fontSize:12, color:C.textMuted, lineHeight:1.7 }}>{proj.description}</p>
                        <div style={{ display:"flex", gap:12 }} className="no-print">
                          {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, fontWeight:900, color:C.pink, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}><LinkIcon style={{ width:11, height:11 }} />See It Live</a>}
                          {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, fontWeight:700, color:C.textFaint, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}><Globe style={{ width:11, height:11 }} />Code</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {data.researchInnovations?.length > 0 && (
              <section style={{ display:"flex", gap:16 }}>
                <div style={{ flexShrink:0, width:44, textAlign:"right" as const }}>
                  <span className="crt" style={{ fontSize:28, fontWeight:700, color:C.numC, lineHeight:1 }}>04</span>
                </div>
                <div style={{ flexGrow:1, borderTop:`3px solid ${C.yellow}`, paddingTop:12 }}>
                  <h2 className="crt" style={{ fontSize:19, fontWeight:700, color:C.yellow, display:"flex", alignItems:"center", gap:6, marginBottom:12 }}><Microscope style={{ width:16, height:16 }} />Research</h2>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {data.researchInnovations.map((item:any)=>{
                      const ti=RESEARCH_TYPES[item.type]||{label:item.type,icon:Microscope,color:"",bg:""};
                      const Icon=ti.icon;
                      return (
                        <div key={item.id} style={{ border:`1px solid ${C.border}`, borderTop:`3px solid ${C.yellow}`, padding:"12px 14px" }}>
                          <span style={{ fontSize:9, fontWeight:900, color:C.yellow, display:"inline-flex", alignItems:"center", gap:3 }}><Icon style={{ width:9, height:9 }} />{ti.label}</span>
                          <h3 style={{ fontWeight:900, fontSize:13, color:C.text, marginTop:3 }}>{item.title}</h3>
                          <p style={{ fontSize:12, color:C.textMuted, lineHeight:1.7, marginTop:3 }}>{item.description}</p>
                          {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="no-print" style={{ fontSize:11, fontWeight:900, color:C.yellow, textDecoration:"none", display:"flex", alignItems:"center", gap:3, marginTop:5 }}><ExternalLink style={{ width:11, height:11 }} />View</a>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {data.profile?.gitHubUsername && (
              <section style={{ display:"flex", gap:16 }}>
                <div style={{ flexShrink:0, width:44, textAlign:"right" as const }}>
                  <span className="crt" style={{ fontSize:28, fontWeight:700, color:C.numA, lineHeight:1 }}>05</span>
                </div>
                <div style={{ flexGrow:1, borderTop:`3px solid ${C.green}`, paddingTop:12 }}>
                  <GithubShowcase githubUsername={data.profile.gitHubUsername} theme="Creative" />
                </div>
              </section>
            )}

            {data.profile?.behanceUsername && (
              <section style={{ display:"flex", gap:16 }}>
                <div style={{ flexShrink:0, width:44, textAlign:"right" as const }}>
                  <span className="crt" style={{ fontSize:28, fontWeight:700, color:C.numB, lineHeight:1 }}>06</span>
                </div>
                <div style={{ flexGrow:1, borderTop:`3px solid ${C.pink}`, paddingTop:12 }}>
                  <BehanceShowcase behanceUsername={data.profile.behanceUsername} theme="Creative" />
                </div>
              </section>
            )}
          </div>

          <aside style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {data.academicRecords.length > 0 && (
              <section style={{ borderTop:`3px solid ${C.green}`, paddingTop:12 }}>
                <h3 className="crt" style={{ fontSize:16, fontWeight:700, color:C.green, display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><GraduationCap style={{ width:15, height:15 }} />Education</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {data.academicRecords.map((rec:any)=>(
                    <div key={rec.id} style={{ borderLeft:`3px solid ${C.green}40`, paddingLeft:10 }}>
                      <p style={{ fontSize: 9, color: C.textFaint, fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
                        <span>{rec.startYear}–{rec.isCurrentlyStudying ? "Present" : rec.endYear}</span>
                        {rec.level && (
                          <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", padding: "0 4px", border: `1px solid ${C.green}`, color: C.green }}>{rec.level}</span>
                        )}
                      </p>
                      <p style={{ fontWeight:900, fontSize:12, color:C.text }}>{rec.degree}</p>
                      <p style={{ fontSize:10, color:C.textMuted }}>{rec.institution}</p>
                      <p style={{ fontSize:10, fontWeight:900, color:C.green }}>Grade: {rec.gradeOrCgpa}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {data.certifications.length > 0 && (
              <section style={{ borderTop:`3px solid ${C.cyan}`, paddingTop:12 }}>
                <h3 className="crt" style={{ fontSize:16, fontWeight:700, color:C.cyan, display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><Award style={{ width:15, height:15 }} />Certs</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {data.certifications.map((cert:any)=>(
                    <div key={cert.id} style={{ backgroundColor:darkMode?"rgba(34,211,238,0.06)":"#ecfeff", border:`1px solid ${C.cyan}30`, padding:"8px 10px" }}>
                      <p style={{ fontWeight:900, fontSize:11, color:C.text, lineHeight:1.4 }}>{cert.name}</p>
                      <p style={{ fontSize:10, color:C.textMuted }}>{cert.issuingOrganization}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {data.activities.length > 0 && (
              <section style={{ borderTop:`3px solid ${C.orange}`, paddingTop:12 }}>
                <h3 className="crt" style={{ fontSize:16, fontWeight:700, color:C.orange, display:"flex", alignItems:"center", gap:5, marginBottom:10 }}><TrendingUp style={{ width:15, height:15 }} />Activities</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {data.activities.map((act:any)=>(
                    <div key={act.id}>
                      <span style={{ fontSize:9, fontWeight:900, color:C.orange, textTransform:"uppercase" as const, background:darkMode?"rgba(251,146,60,0.1)":"#fff7ed", padding:"2px 7px" }}>{act.type}</span>
                      <p style={{ fontWeight:900, fontSize:12, color:C.text, marginTop:3 }}>{act.title}</p>
                      <p style={{ fontSize:10, color:C.textFaint }}>{act.organization}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

      <footer className="no-print" style={{ background:"linear-gradient(135deg,#ec4899,#a855f7,#8b5cf6)", color:"#fff", textAlign:"center" as const, fontSize:10, fontWeight:700, padding:"14px 24px", letterSpacing:"0.12em", textTransform:"uppercase" as const }}>
        MADRAS CHRISTIAN COLLEGE · MCC 1837 · {username.toUpperCase()}
      </footer>
      <QrModal show={showQr} onClose={() => setShowQr(false)} pageUrl={pageUrl} />
    </div>
  );
}

function AIFuturisticLayout({ data, pImageUrl, username, darkMode, toggleDark, showQr, setShowQr, pageUrl, router }: LayoutProps) {
  const skills = (data.profile?.skills||"").split(",").map((s:string)=>s.trim()).filter(Boolean);
  const C = {
    bg:        darkMode ? "#000000"               : "#f0f4f8",
    surface:   darkMode ? "rgba(10,20,35,0.85)"   : "#ffffff",
    border:    darkMode ? "rgba(20,184,166,0.22)"  : "#cbd5e1",
    borderAcc: darkMode ? "rgba(20,184,166,0.65)"  : "#0891b2",
    text:      darkMode ? "#e2f8f5"               : "#0f172a",
    textMuted: darkMode ? "#7ecdc5"               : "#475569",
    textFaint: darkMode ? "#4a9e96"               : "#94a3b8",
    teal:      darkMode ? "#2dd4bf"               : "#0e7490",
    tealGlow:  darkMode ? "rgba(20,184,166,0.28)" : "rgba(14,116,165,0.1)",
    tealText:  darkMode ? "#5eead4"               : "#0e7490",
    tealDim:   darkMode ? "rgba(20,184,166,0.1)"  : "rgba(14,116,165,0.08)",
    scanR:     darkMode ? "rgba(20,184,166,0.025)": "rgba(14,116,165,0.015)",
    gridR:     darkMode ? "rgba(20,184,166,0.04)" : "rgba(14,116,165,0.06)",
    headerBg:  darkMode ? "rgba(0,0,0,0.92)"      : "rgba(240,244,248,0.93)",
    footerBg:  darkMode ? "#000"                  : "#0f172a",
    ledG:      darkMode ? "#4ade80" : "#22c55e",
    ledT:      darkMode ? "#2dd4bf" : "#06b6d4",
    ledB:      darkMode ? "#60a5fa" : "#3b82f6",
  };

  return (
    <div style={{ minHeight:"100vh", backgroundColor:C.bg, color:C.text, fontFamily:"'JetBrains Mono','Courier New',monospace", transition:"background 0.3s,color 0.3s", overflowX:"hidden", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Share+Tech+Mono&display=swap');
        .ai{font-family:'JetBrains Mono','Courier New',monospace;} .ait{font-family:'Share Tech Mono',monospace;}
        .ai-card{background:${C.surface};backdrop-filter:blur(12px);border:1px solid ${C.border};position:relative;}
        .ai-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${C.borderAcc},transparent);}
        .ai-sl{background:repeating-linear-gradient(0deg,transparent,transparent 2px,${C.scanR} 2px,${C.scanR} 4px);}
        .ai-gr{background-image:repeating-linear-gradient(90deg,transparent,transparent 48px,${C.gridR} 48px,${C.gridR} 49px),repeating-linear-gradient(0deg,transparent,transparent 48px,${C.gridR} 48px,${C.gridR} 49px);}
        @keyframes aip{0%,100%{box-shadow:0 0 8px ${C.tealGlow}}50%{box-shadow:0 0 28px ${C.tealGlow}}}
        @keyframes aib{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes aif{0%,100%{opacity:1}93%{opacity:.97}95%{opacity:.85}97%{opacity:.95}}
        @keyframes dfl{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        .ai-pb{animation:aip 3s ease-in-out infinite;} .ai-bl{animation:aib 1.2s step-end infinite;} .ai-fl{animation:aif 6s step-end infinite;} .dfl{animation:dfl linear infinite;}
        @media print{.no-print{display:none!important;}}
      `}</style>

      <div className="ai-sl" style={{ pointerEvents:"none", position:"fixed", inset:0, zIndex:0 }} />
      <div className="ai-gr" style={{ pointerEvents:"none", position:"fixed", inset:0, zIndex:0 }} />
      {darkMode && (
        <div style={{ pointerEvents:"none", position:"fixed", inset:0, zIndex:0, overflow:"hidden" }} className="no-print">
          {[12,34,58,80].map((left,i)=>(
            <div key={i} className="dfl" style={{ position:"absolute", top:0, width:1, height:"25%", background:`linear-gradient(to bottom,transparent,${C.teal}30,transparent)`, left:`${left}%`, animationDuration:`${7+i*2}s`, animationDelay:`${i*1.8}s` }} />
          ))}
        </div>
      )}

      <header className="no-print sticky top-0 z-50" style={{ backgroundColor:C.headerBg, borderBottom:`1px solid ${C.border}`, backdropFilter:"blur(12px)" }}>
        <div style={{ width:"100%", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50 }}>
          <div className="ai-fl" style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ display:"flex", gap:5 }}>
              {[C.ledG,C.ledT,C.ledB].map((col,i)=>(
                <span key={i} style={{ width:7, height:7, borderRadius:"50%", backgroundColor:col, boxShadow:`0 0 6px ${col}`, display:"inline-block" }} />
              ))}
            </div>
            <span className="ait" style={{ fontSize:11, color:C.tealText, letterSpacing:"0.15em" }}>MCC.SYS://VERIFIED_CANDIDATE</span>
            <span className="ai-bl" style={{ color:C.tealText, fontSize:13 }}>▋</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={toggleDark} style={{ padding:6, background:"transparent", border:`1px solid ${C.border}`, cursor:"pointer", color:C.tealText, borderRadius:4 }}>
              {darkMode?<Sun style={{ width:13, height:13 }}/>:<Moon style={{ width:13, height:13 }}/>}
            </button>
            <button onClick={()=>setShowQr(true)} style={{ padding:6, background:"transparent", border:`1px solid ${C.border}`, cursor:"pointer", color:C.tealText, borderRadius:4 }}>
              <QrCode style={{ width:13, height:13 }} />
            </button>
            <button onClick={()=>window.print()} className="ai-pb" style={{ padding:"5px 12px", background:"transparent", border:`1px solid ${C.borderAcc}`, color:C.tealText, fontSize:10, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, borderRadius:4 }}>
              <Download style={{ width:11, height:11 }} /> [EXPORT.PDF]
            </button>
          </div>
        </div>
      </header>

      <section style={{ width:"100%", padding:"32px 24px", position:"relative", zIndex:10 }}>
        <div className="ai-card ai-pb" style={{ borderRadius:12, padding:"24px 28px" }}>
          <div style={{ display:"flex", flexWrap:"wrap" as const, alignItems:"center", gap:24 }}>
            <div style={{ position:"relative", flexShrink:0 }}>
              <div className="ai-pb" style={{ width:112, height:112, borderRadius:"50%", border:`2px solid ${C.teal}50`, padding:4 }}>
                <div style={{ width:"100%", height:"100%", borderRadius:"50%", overflow:"hidden", clipPath:"polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)" }}>
                  <img src={pImageUrl} alt={data.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
              </div>
              <div style={{ position:"absolute", bottom:-2, right:-2, backgroundColor:C.tealDim, border:`1px solid ${C.border}`, color:C.tealText, fontSize:7, fontWeight:700, padding:"2px 6px" }}>SYS.OK</div>
            </div>
            <div className="ai" style={{ flexGrow:1 }}>
              <p style={{ fontSize:9, color:C.textFaint, letterSpacing:"0.2em", marginBottom:4 }}>{"// MCC_1837 · PORTFOLIO_NODE · VERIFIED"}</p>
              <h1 className="ait" style={{ fontSize:26, color:C.tealText, letterSpacing:"0.05em", lineHeight:1.2, textShadow:darkMode?`0 0 12px ${C.teal}80`:"none" }}>{data.name.toUpperCase()}</h1>
              <p style={{ fontSize:12, color:C.teal, marginTop:5 }}>$ {data.department}</p>
              <p style={{ fontSize:11, color:C.textMuted, marginTop:3 }}># {data.profile?.bio||"Student at Madras Christian College"}</p>
              <div style={{ display:"flex", flexWrap:"wrap" as const, gap:14, marginTop:10, fontSize:10, color:C.textFaint }}>
                <span>&gt; mail: {data.email}</span>
                {data.profile?.personalEmail&&<span>&gt; personal_mail: {data.profile.personalEmail}</span>}
                {data.profile?.phone&&<span>&gt; tel: {data.profile.phone}</span>}
                {data.gender&&<span>&gt; gender: {data.gender}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {skills.length>0&&(
        <section className="ai" style={{ width:"100%", padding:"0 24px 16px", position:"relative", zIndex:10 }}>
          <p style={{ fontSize:9, color:C.textFaint, marginBottom:8, letterSpacing:"0.15em" }}>SYS::LOADING skill_matrix.json...</p>
          <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6 }}>
            {skills.map((skill:string,i:number)=>(
              <span key={i} className="skills-badge" style={{ fontSize:10, fontWeight:700, color:C.tealText, background:C.tealDim, border:`1px solid ${C.border}`, padding:"4px 10px", borderRadius:4 }}>[{skill}]</span>
            ))}
          </div>
        </section>
      )}

      <main className="ai" style={{ width:"100%", padding:"0 24px 48px", position:"relative", zIndex:10 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:20 }} className="ai-mg">
          <style>{`@media(min-width:768px){.ai-mg{grid-template-columns:1fr 260px!important;}}`}</style>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { cmd:"cat personal_story.txt",      label:"PERSONAL_STORY.TXT",       body:data.profile?.personalStory },
              { cmd:"cat statement_of_purpose.txt", label:"STATEMENT_OF_PURPOSE.TXT", body:data.profile?.sop },
            ].map(sec=>sec.body&&(
              <div key={sec.label} className="ai-card" style={{ borderRadius:10, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, borderBottom:`1px solid ${C.border}`, paddingBottom:8, marginBottom:10 }}>
                  <span style={{ fontSize:9, color:C.textFaint }}>$</span>
                  <span style={{ fontSize:9, color:C.textFaint }}>{sec.cmd}</span>
                </div>
                <p style={{ fontSize:9, fontWeight:700, color:C.teal, letterSpacing:"0.15em", marginBottom:8 }}>[{sec.label}]</p>
                <p style={{ fontSize:12, color:C.textMuted, lineHeight:1.85, whiteSpace:"pre-line" }}>{sec.body}</p>
              </div>
            ))}
            {data.projects.length>0&&(
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:9,color:C.textFaint }}>$</span><span style={{ fontSize:10,color:C.textFaint }}>ls ./projects/</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }} className="ai-pg">
                  <style>{`@media(min-width:600px){.ai-pg{grid-template-columns:1fr 1fr!important;}}`}</style>
                  {data.projects.map((proj:any,idx:number)=>(
                    <div key={proj.id} className="ai-card" style={{ borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
                      <p style={{ fontSize:9, color:C.textFaint }}>PROJECT_{String(idx+1).padStart(3,"0")}/</p>
                      <h3 style={{ fontWeight:700, fontSize:12, color:C.tealText }}>{proj.title}</h3>
                      <div style={{ display:"flex", flexWrap:"wrap" as const, gap:4 }}>
                        {(proj.technologiesUsed||"").split(",").map((t:string)=>t.trim()).filter(Boolean).map((tech:string,i:number)=>(
                          <span key={i} className="skills-badge" style={{ fontSize:8, color:C.textMuted, border:`1px solid ${C.border}`, padding:"1px 5px" }}>{tech}</span>
                        ))}
                      </div>
                      <p style={{ fontSize:11, color:C.textMuted, lineHeight:1.65 }}>{proj.description}</p>
                      <div style={{ display:"flex", gap:12 }} className="no-print">
                        {proj.projectUrl&&<a href={proj.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize:10, fontWeight:700, color:C.tealText, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}><LinkIcon style={{ width:10, height:10 }}/>[LIVE]</a>}
                        {proj.repositoryUrl&&<a href={proj.repositoryUrl} target="_blank" rel="noreferrer" style={{ fontSize:10, fontWeight:700, color:C.textMuted, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}><Globe style={{ width:10, height:10 }}/>[SRC]</a>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.researchInnovations?.length>0&&(
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:9,color:C.textFaint }}>$</span><span style={{ fontSize:10,color:C.textFaint }}>ls ./research/</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10 }} className="ai-rg">
                  <style>{`@media(min-width:600px){.ai-rg{grid-template-columns:1fr 1fr!important;}}`}</style>
                  {data.researchInnovations.map((item:any)=>{
                    const ti=RESEARCH_TYPES[item.type]||{label:item.type,icon:Microscope,color:"",bg:""};
                    const Icon=ti.icon;
                    return(
                      <div key={item.id} className="ai-card" style={{ borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:6 }}>
                        <span style={{ fontSize:8, fontWeight:700, color:C.teal, border:`1px solid ${C.border}`, padding:"2px 7px", display:"inline-flex", alignItems:"center", gap:3, alignSelf:"flex-start" }}><Icon style={{ width:9,height:9 }}/>{ti.label}</span>
                        <h3 style={{ fontWeight:700, fontSize:12, color:C.tealText }}>{item.title}</h3>
                        <p style={{ fontSize:11, color:C.textMuted, lineHeight:1.65 }}>{item.description}</p>
                        {item.link&&<a href={item.link} target="_blank" rel="noreferrer" className="no-print" style={{ fontSize:10, fontWeight:700, color:C.tealText, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}><ExternalLink style={{ width:10,height:10 }}/>[VIEW_LINK]</a>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data.profile?.gitHubUsername && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:9,color:C.textFaint }}>$</span><span style={{ fontSize:10,color:C.textFaint }}>cat ./github/repos.json</span></div>
                <GithubShowcase githubUsername={data.profile.gitHubUsername} theme="AIFuturistic" />
              </div>
            )}

            {data.profile?.behanceUsername && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:9,color:C.textFaint }}>$</span><span style={{ fontSize:10,color:C.textFaint }}>cat ./behance/showcase.json</span></div>
                <BehanceShowcase behanceUsername={data.profile.behanceUsername} theme="AIFuturistic" />
              </div>
            )}
          </div>
          <aside style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {data.academicRecords.length>0&&(
              <div className="ai-card" style={{ borderRadius:10, padding:"14px 16px" }}>
                <p style={{ fontSize:9, fontWeight:700, color:C.teal, letterSpacing:"0.15em", borderBottom:`1px solid ${C.border}`, paddingBottom:6, marginBottom:10 }}>SYS::EDUCATION_LOG</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {data.academicRecords.map((rec:any)=>(
                    <div key={rec.id} style={{ borderLeft:`1px solid ${C.border}`, paddingLeft:8 }}>
                      <p style={{ fontSize:8, color:C.textFaint }}>[{rec.startYear}–{rec.endYear}]</p>
                      <p style={{ fontWeight:700, fontSize:11, color:C.tealText }}>{rec.degree}</p>
                      <p style={{ fontSize:10, color:C.textMuted }}>{rec.institution}</p>
                      <p style={{ fontSize:9, fontWeight:700, color:C.teal }}>GRADE::{rec.gradeOrCgpa}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.certifications.length>0&&(
              <div className="ai-card" style={{ borderRadius:10, padding:"14px 16px" }}>
                <p style={{ fontSize:9, fontWeight:700, color:C.teal, letterSpacing:"0.15em", borderBottom:`1px solid ${C.border}`, paddingBottom:6, marginBottom:10 }}>SYS::CREDENTIALS</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {data.certifications.map((cert:any)=>(
                    <div key={cert.id}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", backgroundColor:C.ledG, boxShadow:`0 0 4px ${C.ledG}`, flexShrink:0 }} />
                        <p style={{ fontWeight:700, fontSize:11, color:C.tealText, lineHeight:1.3 }}>{cert.name}</p>
                      </div>
                      <p style={{ fontSize:9, color:C.textFaint, paddingLeft:11 }}>{cert.issuingOrganization}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.activities.length>0&&(
              <div className="ai-card" style={{ borderRadius:10, padding:"14px 16px" }}>
                <p style={{ fontSize:9, fontWeight:700, color:C.teal, letterSpacing:"0.15em", borderBottom:`1px solid ${C.border}`, paddingBottom:6, marginBottom:10 }}>SYS::SOCIAL_IMPACT</p>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {data.activities.map((act:any)=>(
                    <div key={act.id}>
                      <span style={{ fontSize:8, fontWeight:700, color:C.ledG, border:`1px solid ${C.border}`, padding:"1px 6px", display:"inline-block" }}>[{act.type}]</span>
                      <p style={{ fontWeight:700, fontSize:11, color:C.tealText, marginTop:2 }}>{act.title}</p>
                      <p style={{ fontSize:9, color:C.textFaint }}>{act.organization}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="no-print" style={{ backgroundColor:C.footerBg, borderTop:`1px solid ${C.border}`, padding:"16px 24px", textAlign:"center" as const, position:"relative", zIndex:10 }}>
        <p className="ait" style={{ fontSize:9, color:C.textFaint, letterSpacing:"0.25em" }}>{`// MADRAS_CHRISTIAN_COLLEGE :: MCC_1837 :: ${username.toUpperCase()} :: SESSION_VERIFIED`}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:5, marginTop:6 }}>
          {Array.from({length:20}).map((_,i)=><div key={i} style={{ width:4, height:4, borderRadius:"50%", backgroundColor:C.teal, opacity:i%3===0?0.6:0.15 }} />)}
        </div>
      </footer>
      <QrModal show={showQr} onClose={()=>setShowQr(false)} pageUrl={pageUrl} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB SHOWCASE COMPONENT
   • Dynamically fetches public repositories using GitHub API
   • Custom renders based on active theme
═══════════════════════════════════════════════════════════════════════════ */
interface GithubShowcaseProps {
  githubUsername: string;
  theme: "Academic" | "Corporate" | "Startup" | "Creative" | "AIFuturistic";
}

function GithubShowcase({ githubUsername, theme }: GithubShowcaseProps) {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!githubUsername) return;
    const cacheKey = `github_repos_${githubUsername}`;
    const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        setRepos(JSON.parse(cached));
        setLoading(false);
        return;
      } catch (e) {
        // ignore JSON parse errors
      }
    }

    (async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`);
        if (!res.ok) throw new Error("Failed to fetch repos");
        const data = await res.json();
        const reposData = Array.isArray(data) ? data : [];
        setRepos(reposData);
        if (reposData.length > 0 && typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(reposData));
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [githubUsername]);

  if (!githubUsername) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <p className="text-xs text-slate-400 font-mono">Loading GitHub repositories…</p>
      </div>
    );
  }

  if (error || repos.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/50">
        <Github className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
        <p className="text-xs text-slate-400 font-medium">No public repositories found or GitHub API rate limit reached.</p>
        <a
          href={`https://github.com/${githubUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mt-2 hover:underline"
        >
          View GitHub Profile directly <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    );
  }

  /* ───────────────── THEME-SPECIFIC RENDERERS ───────────────── */

  if (theme === "Academic") {
    const C = {
      card: "bg-[#ffffff] dark:bg-[#1c1710] border border-[#d6cfc4] dark:border-[#3a3020] p-4 relative transition-all duration-300 hover:shadow-md",
      title: "ac-h font-bold text-sm text-[#7a1c1c] dark:text-[#c8876a] hover:underline flex items-center gap-1.5",
      desc: "ac-b text-xs text-[#6b6458] dark:text-[#9e9480] mt-2 leading-relaxed italic line-clamp-2",
      badge: "ac-b text-[9px] border border-[#d6cfc4] dark:border-[#3a3020] px-2 py-0.5 text-[#6b6458] dark:text-[#9e9480] tracking-wider",
      stat: "ac-b text-[10px] text-[#8a6a00] dark:text-[#d4af37] font-semibold flex items-center gap-1"
    };

    return (
      <div className="space-y-6 mt-8">
        <div>
          <h2 className="ac-h font-bold text-xs uppercase tracking-[0.25em] text-[#7a1c1c] dark:text-[#c8876a] border-b border-dashed border-[#d6cfc4] dark:border-[#3a3020] pb-2 mb-4 flex items-center gap-2">
            <Github className="h-4 w-4" /> Open Source Codebase &amp; Projects
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map(repo => (
            <div key={repo.id} className={C.card}>
              <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className={C.title}>
                <Code2 className="h-3.5 w-3.5" /> {repo.name}
              </a>
              <p className={C.desc}>{repo.description || "No description provided for this academic project repository."}</p>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#e8e2d8] dark:border-[#2a2318]">
                {repo.language ? <span className={C.badge}>{repo.language}</span> : <span />}
                {repo.stargazers_count > 0 && (
                  <span className={C.stat}>
                    <Star className="h-3 w-3 fill-[#8a6a00] dark:fill-[#d4af37]" /> {repo.stargazers_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "Corporate") {
    return (
      <div className="space-y-5 mt-8">
        <div className="flex items-center gap-2 border-l-[3px] border-[#1e3a8a] pl-3 py-1">
          <Github className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-[#1e3a8a] dark:text-[#60a5fa]">Open Source Repositories</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {repos.map(repo => (
            <div key={repo.id} className="bg-white dark:bg-[#111827] border border-[#e2e8f0] dark:border-[#1e293b] p-4 hover:border-[#1e3a8a] dark:hover:border-[#60a5fa] transition-colors duration-200 flex flex-col justify-between">
              <div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-bold text-sm text-[#0f172a] dark:text-[#e2e8f0] hover:text-[#1e3a8a] dark:hover:text-[#60a5fa] transition-colors flex items-center gap-1.5">
                  {repo.name} <ExternalLink className="h-3 w-3 inline opacity-50" />
                </a>
                <p className="text-xs text-[#475569] dark:text-[#94a3b8] mt-2 leading-relaxed line-clamp-2">{repo.description || "No description provided."}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f1f5f9] dark:border-[#1e293b]">
                {repo.language ? (
                  <span className="text-[9px] font-bold bg-[#dbeafe] text-[#1e40af] dark:bg-[#1e3a8a30] dark:text-[#93c5fd] px-2.5 py-0.5 border border-[#bfdbfe] dark:border-[#1e40af40]">
                    {repo.language}
                  </span>
                ) : <span />}
                {repo.stargazers_count > 0 && (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {repo.stargazers_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "Startup") {
    return (
      <div className="space-y-6 mt-8">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🚀</span>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#ff5a1f] dark:text-[#ff7f50]">GitHub Tech Stack</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Live projects built and maintained by candidate.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map(repo => (
            <motion.div
              key={repo.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17122a] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 via-[#ff5a1f] to-amber-400" />
              <div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-[#ff5a1f] dark:hover:text-[#ff7f50] transition-colors flex items-center gap-1.5">
                  {repo.name}
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-3">{repo.description || "Deployable system built for production-like open source usage."}</p>
              </div>
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {repo.language ? (
                  <span className="text-[9px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {repo.language}
                  </span>
                ) : <span />}
                <div className="flex items-center gap-2">
                  {repo.stargazers_count > 0 && (
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
                      ⭐ {repo.stargazers_count}
                    </span>
                  )}
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#ff5a1f] hover:underline">
                    Source →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "Creative") {
    return (
      <div className="space-y-8 mt-8">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white relative inline-block">
            <span className="absolute left-0 bottom-1 w-full h-3 bg-coral-500/15 -z-10" />
            Code &amp; Art
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">Public Repositories &amp; Experimental Builds</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {repos.map((repo, i) => (
            <motion.div
              key={repo.id}
              whileHover={{ rotate: i % 2 === 0 ? 0.5 : -0.5, scale: 1.005 }}
              className="bg-white dark:bg-[#121212] border-2 border-slate-900 dark:border-white p-6 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] transition-all flex flex-col justify-between"
            >
              <div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-black tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 transition-colors flex items-center gap-2">
                  <span className="text-emerald-500 font-mono">{`0${i+1}//`}</span> {repo.name}
                </a>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed font-medium">{repo.description || "A creative integration repository crafted with code and design aesthetics."}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                {repo.language ? (
                  <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider bg-slate-100 dark:bg-slate-900 px-3 py-1 border border-slate-900 dark:border-white">
                    {repo.language}
                  </span>
                ) : <span />}
                <div className="flex items-center gap-3">
                  {repo.stargazers_count > 0 && (
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      ★ {repo.stargazers_count}
                    </span>
                  )}
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-xs font-black uppercase tracking-wider underline hover:text-emerald-500 transition-colors">
                    GitHub_Link
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "AIFuturistic") {
    return (
      <div className="space-y-6 mt-8">
        <div>
          <div className="text-[9px] font-mono text-cyan-400 tracking-[0.3em] font-bold">{"// MODULE::REPOSITORY_SHOWCASE"}</div>
          <h3 className="font-mono text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1 flex items-center gap-2">
            <span className="h-2 w-2 bg-cyan-400 rounded-full animate-ping shrink-0" />
            DYNAMIC_SOURCE_GRID_v2.0
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map(repo => (
            <div key={repo.id} className="ai-card" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
              <div className="absolute top-1 right-2 font-mono text-[8px] text-cyan-500 opacity-60">SYS_OK</div>
              <div>
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-xs tracking-tight text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5">
                  &gt; {repo.name}
                </a>
                <p className="font-mono text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-3">{repo.description || "SYS::NO_DATA_STRING - Repository initialized and compiled successfully."}</p>
              </div>
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-cyan-500/10">
                {repo.language ? (
                  <span className="font-mono text-[9px] text-[#00ff87] uppercase tracking-wider">
                    [{repo.language}]
                  </span>
                ) : <span />}
                <div className="flex items-center gap-3">
                  {repo.stargazers_count > 0 && (
                    <span className="font-mono text-[10px] text-cyan-400 flex items-center gap-0.5">
                      ⭐{repo.stargazers_count}
                    </span>
                  )}
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-cyan-400 underline hover:text-slate-900 dark:hover:text-white">
                    SRC_CODE
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BEHANCE SHOWCASE COMPONENT
   • Showcases creative design projects with dynamic visual thumbnails
   • Theme-specific creative styling matching the 5 page layouts
   • Interactive "Appreciate" micro-interaction with local state persistence
   ═══════════════════════════════════════════════════════════════════════════ */
interface BehanceShowcaseProps {
  behanceUsername: string;
  theme: "Academic" | "Corporate" | "Startup" | "Creative" | "AIFuturistic";
}

function BehanceShowcase({ behanceUsername, theme }: BehanceShowcaseProps) {
  const [likes, setLikes] = useState<number[]>([87, 64, 112, 53, 94, 148]);
  const [hasLiked, setHasLiked] = useState<boolean[]>([false, false, false, false, false, false]);

  const handleAppreciate = (index: number) => {
    if (hasLiked[index]) return;
    const newLikes = [...likes];
    newLikes[index] += 1;
    setLikes(newLikes);
    const newHasLiked = [...hasLiked];
    newHasLiked[index] = true;
    setHasLiked(newHasLiked);
  };

  if (!behanceUsername) return null;

  const projects = [
    {
      title: "MCC Brand Identity Redesign",
      category: "Branding · Typography",
      desc: "A modern visual identity system for Madras Christian College, blending heritage heraldry with clean contemporary grid design.",
      img: "https://images.unsplash.com/photo-1561070791-26c113006238?w=500&q=80"
    },
    {
      title: "Campus Interactive Map App",
      category: "UI/UX · Mobile Prototype",
      desc: "An intuitive student navigation prototype featuring class scheduling widgets, offline maps, and real-time event updates.",
      img: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&q=80"
    },
    {
      title: "Asymmetric Typography Posters",
      category: "Graphic Design · Poster Art",
      desc: "An experimental typography exploration focusing on neo-brutalist letter spacing and raw visual compositions.",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80"
    },
    {
      title: "E-Learning Student Network",
      category: "Web Design · Interactive",
      desc: "Landing page and portal UX design for peer-to-peer student tutoring and project collaborations.",
      img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80"
    },
    {
      title: "Madras Heritage Visual Archive",
      category: "Visual Art · Curation",
      desc: "A warm photo collage series cataloging the historical architecture and natural bio-diversity of the MCC campus.",
      img: "https://images.unsplash.com/photo-1452421820245-17765ad8f7e0?w=500&q=80"
    },
    {
      title: "Fluid Dynamics Art Study",
      category: "3D Render · Digital Study",
      desc: "High-fidelity organic fluid simulations exploring chrome textures, neon shadows, and futuristic ambient lighting.",
      img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=500&q=80"
    }
  ];

  /* ───────────────── THEME-SPECIFIC RENDERS ───────────────── */

  if (theme === "Academic") {
    return (
      <div className="space-y-6 mt-8">
        <div>
          <h2 className="ac-h font-bold text-xs uppercase tracking-[0.25em] text-[#7a1c1c] dark:text-[#c8876a] border-b border-dashed border-[#d6cfc4] dark:border-[#3a3020] pb-2 mb-4 flex items-center gap-2">
            <Behance className="h-4 w-4" /> Creative Portfolio &amp; Exhibition
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <div key={idx} className="bg-[#ffffff] dark:bg-[#1c1710] border border-[#d6cfc4] dark:border-[#3a3020] p-4 relative transition-all duration-300 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full overflow-hidden border border-[#e8e2d8] dark:border-[#2a2318] mb-3">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover grayscale opacity-90 transition-all duration-300 hover:grayscale-0 hover:scale-105" />
                </div>
                <span className="ac-b text-[9px] tracking-wider uppercase text-[#8a6a00] dark:text-[#d4af37] font-semibold">{proj.category}</span>
                <h3 className="ac-h font-bold text-sm text-[#7a1c1c] dark:text-[#c8876a] mt-1 leading-snug">{proj.title}</h3>
                <p className="ac-b text-xs text-[#6b6458] dark:text-[#9e9480] mt-2 leading-relaxed italic">{proj.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#e8e2d8] dark:border-[#2a2318]">
                <button
                  onClick={() => handleAppreciate(idx)}
                  className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer outline-none ${
                    hasLiked[idx]
                      ? "text-[#7a1c1c] dark:text-[#c8876a]"
                      : "text-slate-400 hover:text-[#7a1c1c] dark:hover:text-[#c8876a]"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${hasLiked[idx] ? "fill-[#7a1c1c] dark:fill-[#c8876a]" : ""}`} />
                  Appreciate {likes[idx]}
                </button>
                <a
                  href={`https://behance.net/${behanceUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] uppercase tracking-wider font-extrabold text-[#8a6a00] dark:text-[#d4af37] hover:underline"
                >
                  View Case →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "Corporate") {
    return (
      <div className="space-y-5 mt-8">
        <div className="flex items-center gap-2 border-l-[3px] border-[#1e3a8a] pl-3 py-1">
          <Behance className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">Creative Design Exhibition</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj, idx) => (
            <div key={idx} className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-4 transition-all duration-200 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-sm flex flex-col justify-between">
              <div>
                <div className="relative aspect-video w-full overflow-hidden mb-3">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-103" />
                </div>
                <span className="text-[9px] font-bold text-[#1e3a8a] dark:text-[#60a5fa] uppercase tracking-widest">{proj.category}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 leading-snug">{proj.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">{proj.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleAppreciate(idx)}
                  className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors outline-none ${
                    hasLiked[idx]
                      ? "text-[#1e3a8a] dark:text-[#60a5fa]"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Like ({likes[idx]})
                </button>
                <a
                  href={`https://behance.net/${behanceUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#1e3a8a] dark:text-[#60a5fa] hover:underline"
                >
                  Visit Project →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "Startup") {
    return (
      <div className="space-y-6 mt-8">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎨</span>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#ff5a1f] dark:text-[#ff7f50]">Behance Visual Showcase</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Creative design layouts connected to candidate identity.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17122a] p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-[#ff5a1f] to-purple-500" />
              <div>
                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3.5 border border-slate-100 dark:border-slate-800">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-extrabold text-[#ff5a1f] dark:text-[#ff7f50] bg-[#ff5a1f]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {proj.category.split("·")[0].trim()}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2 leading-snug">{proj.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">{proj.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => handleAppreciate(idx)}
                  className={`text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all outline-none ${
                    hasLiked[idx]
                      ? "text-[#ff5a1f] dark:text-[#ff7f50]"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${hasLiked[idx] ? "fill-[#ff5a1f] dark:fill-[#ff7f50]" : ""}`} />
                  Appreciate ({likes[idx]})
                </button>
                <a
                  href={`https://behance.net/${behanceUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-[#ff5a1f] hover:underline"
                >
                  Showcase →
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "Creative") {
    return (
      <div className="space-y-8 mt-8">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 dark:text-white relative inline-block">
            <span className="absolute left-0 bottom-1 w-full h-3 bg-emerald-500/15 -z-10" />
            Visual &amp; Form
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-widest">Creative Designs &amp; UI Portfolio on Behance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              whileHover={{ rotate: idx % 2 === 0 ? 0.5 : -0.5, scale: 1.005 }}
              className="bg-white dark:bg-[#121212] border-2 border-slate-900 dark:border-white p-5 shadow-[4px_4px_0px_#000] dark:shadow-[4px_4px_0px_#fff] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full border-2 border-slate-900 dark:border-white overflow-hidden mb-4">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] font-mono font-black uppercase text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 border border-[#8b5cf6]">{proj.category}</span>
                <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white mt-2 leading-snug">{proj.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium line-clamp-3">{proj.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleAppreciate(idx)}
                  className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer outline-none ${
                    hasLiked[idx]
                      ? "text-rose-500"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Star className={`h-4 w-4 ${hasLiked[idx] ? "fill-rose-500 text-rose-500" : ""}`} />
                  Heart [{likes[idx]}]
                </button>
                <a
                  href={`https://behance.net/${behanceUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase tracking-wider underline hover:text-emerald-500 transition-colors"
                >
                  Behance_Link
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (theme === "AIFuturistic") {
    return (
      <div className="space-y-6 mt-8">
        <div>
          <div className="text-[9px] font-mono text-cyan-400 tracking-[0.3em] font-bold">{"// MODULE::VISUAL_MATRICES"}</div>
          <h3 className="font-mono text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mt-1 flex items-center gap-2">
            <span className="h-2 w-2 bg-cyan-400 rounded-full animate-ping shrink-0" />
            CREATIVE_COMPUTING_DISPLAY
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj, idx) => (
            <div key={idx} className="ai-card" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
              <div className="absolute top-1 right-2 font-mono text-[8px] text-cyan-500 opacity-60">SYS_V_OK</div>
              <div>
                <div className="relative aspect-video w-full border border-cyan-500/20 overflow-hidden mb-3.5">
                  <img src={proj.img} alt={proj.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="font-mono text-[8px] text-[#00ff87] mb-1">[{proj.category}]</div>
                <h4 className="font-mono font-bold text-xs tracking-tight text-cyan-400">{proj.title}</h4>
                <p className="font-mono text-[10px] text-slate-400 mt-2 leading-relaxed line-clamp-3">{proj.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-cyan-500/10">
                <button
                  onClick={() => handleAppreciate(idx)}
                  className={`font-mono text-[10px] flex items-center gap-1.5 cursor-pointer outline-none bg-transparent border-none ${
                    hasLiked[idx]
                      ? "text-[#00ff87]"
                      : "text-slate-500 hover:text-cyan-400"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 ${hasLiked[idx] ? "fill-[#00ff87] text-[#00ff87]" : ""}`} />
                  [APPRECIATE: {likes[idx]}]
                </button>
                <a
                  href={`https://behance.net/${behanceUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-cyan-400 underline hover:text-slate-900 dark:hover:text-white"
                >
                  BE_URL
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
