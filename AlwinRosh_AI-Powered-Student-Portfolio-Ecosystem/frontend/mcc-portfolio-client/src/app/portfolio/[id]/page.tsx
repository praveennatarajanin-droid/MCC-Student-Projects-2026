"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  GitBranch,
  ExternalLink,
  AlertCircle,
  Award,
  Trophy,
  BookOpen,
  Briefcase,
  Mail,
  MapPin,
  Star,
  FileText,
  Code2,
  Cpu,
  ArrowLeft,
  Heart,
  Palette,
  Share2,
  Download,
  Check,
} from "lucide-react";
import api from "@/services/api";

const Github = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function PortfolioPage() {
  const params = useParams();
  const id = params.id;
  const username = params.username;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [researchPapers, setResearchPapers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [communityServices, setCommunityServices] = useState<any[]>([]);
  const [creativeWorks, setCreativeWorks] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [startupCompetitions, setStartupCompetitions] = useState<any[]>([]);
  const [ngoActivities, setNgoActivities] = useState<any[]>([]);
  const [sportsAchievements, setSportsAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [themeConfig, setThemeConfig] = useState<any>(null);

  // Expanded abstract track states
  const [expandedAbstracts, setExpandedAbstracts] = useState<{ [key: number]: boolean }>({});

  // Active theme local switcher override
  const [activeTheme, setActiveTheme] = useState<string>("Academic");

  // GitHub integration states
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Share/copy URL state
  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopyUrl = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    });
  };

  const handleDownloadQr = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&format=png`;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `mcc-portfolio-qr-${user?.fullName?.replace(/\s+/g, "-").toLowerCase() || "student"}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!profile?.gitHubUsername) {
      setGithubRepos([]);
      return;
    }
    const fetchGitHubRepos = async () => {
      try {
        setLoadingRepos(true);
        const response = await fetch(`https://api.github.com/users/${profile.gitHubUsername}/repos?sort=updated&per_page=6`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setGithubRepos(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch GitHub repositories", error);
      } finally {
        setLoadingRepos(false);
      }
    };
    fetchGitHubRepos();
  }, [profile?.gitHubUsername]);

  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.nameid || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.id && storedToken) {
        const idFromToken = getUserIdFromToken(storedToken);
        if (idFromToken) {
          parsedUser.id = idFromToken;
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }
      }
      setLoggedInUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (!themeConfig) return;
    
    let styleTag = document.getElementById("dynamic-theme-overrides");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-overrides";
      document.head.appendChild(styleTag);
    }
    
    let cssContent = "";
    if (themeConfig.primaryColor) {
      cssContent += `
        :root {
          --theme-primary: ${themeConfig.primaryColor};
        }
        .text-custom-primary { color: ${themeConfig.primaryColor} !important; }
        .bg-custom-primary { background-color: ${themeConfig.primaryColor} !important; }
        .border-custom-primary { border-color: ${themeConfig.primaryColor} !important; }
      `;
    }
    if (themeConfig.secondaryColor) {
      cssContent += `
        :root {
          --theme-secondary: ${themeConfig.secondaryColor};
        }
        .text-custom-secondary { color: ${themeConfig.secondaryColor} !important; }
        .bg-custom-secondary { background-color: ${themeConfig.secondaryColor} !important; }
        .border-custom-secondary { border-color: ${themeConfig.secondaryColor} !important; }
      `;
    }
    if (themeConfig.fontFamily) {
      cssContent += `
        .font-custom-override { font-family: ${themeConfig.fontFamily}, sans-serif !important; }
      `;
    }
    styleTag.innerHTML = cssContent;
    
    return () => {
      const tag = document.getElementById("dynamic-theme-overrides");
      if (tag) tag.remove();
    };
  }, [themeConfig]);

  useEffect(() => {
    if (!id && !username) return;
    fetchPortfolio();
  }, [id, username]);

  useEffect(() => {
    if (user) {
      const fullName = user.fullName || "MCC Student";
      const dept = user.department || "";
      const bioText = profile?.bio || "Madras Christian College Student Resume Portfolio";
      const pageTitle = `${fullName} | ${dept} | Verified Portfolio | MCC`;
      const descText = `${fullName}'s verified student portfolio at Madras Christian College. Department: ${dept}. ${bioText.slice(0, 120)}`;
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";
      const avatarImg = profile?.profileImageUrl || "";

      document.title = pageTitle;

      // Helper to upsert a <meta> tag
      const setMeta = (selector: string, attr: string, value: string) => {
        let tag = document.querySelector(selector) as HTMLMetaElement | null;
        if (!tag) {
          tag = document.createElement("meta");
          const [attrName, ...rest] = selector.replace('meta[', '').replace(']', '').split('="');
          tag.setAttribute(attrName, rest.join('="').replace('"', ''));
          document.head.appendChild(tag);
        }
        tag.setAttribute(attr, value);
      };

      // Basic SEO
      setMeta('meta[name="description"]', "content", descText);
      setMeta('meta[name="keywords"]', "content", `${fullName}, ${dept}, MCC, Madras Christian College, student portfolio, resume`);
      setMeta('meta[name="author"]', "content", fullName);

      // Open Graph
      setMeta('meta[property="og:title"]', "content", pageTitle);
      setMeta('meta[property="og:description"]', "content", descText);
      setMeta('meta[property="og:type"]', "content", "profile");
      setMeta('meta[property="og:url"]', "content", pageUrl);
      setMeta('meta[property="og:site_name"]', "content", "MCC Portfolio Platform");
      if (avatarImg) setMeta('meta[property="og:image"]', "content", avatarImg);

      // Twitter Card
      setMeta('meta[name="twitter:card"]', "content", "summary");
      setMeta('meta[name="twitter:title"]', "content", pageTitle);
      setMeta('meta[name="twitter:description"]', "content", descText);
      if (avatarImg) setMeta('meta[name="twitter:image"]', "content", avatarImg);

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", pageUrl);

      // JSON-LD Structured Data
      let jsonLdScript = document.getElementById("portfolio-jsonld") as HTMLScriptElement | null;
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.id = "portfolio-jsonld";
        jsonLdScript.type = "application/ld+json";
        document.head.appendChild(jsonLdScript);
      }
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "name": pageTitle,
        "description": descText,
        "url": pageUrl,
        "mainEntity": {
          "@type": "Person",
          "name": fullName,
          "description": bioText,
          "affiliation": {
            "@type": "EducationalOrganization",
            "name": "Madras Christian College",
            "address": "Chennai, Tamil Nadu, India"
          },
          ...(dept && { "jobTitle": `${dept} Student` }),
          ...(user.email && { "email": user.email }),
          ...(profile?.linkedInUrl && { "sameAs": [profile.linkedInUrl] }),
          ...(avatarImg && { "image": avatarImg }),
        }
      };
      jsonLdScript.textContent = JSON.stringify(jsonLd);
    }
  }, [user, profile]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const url = id ? `/Public/${id}` : `/Public/by-username/${username}`;
      const response = await api.get(url);
      setUser(response.data.user);
      setProfile(response.data.profile);
      setSkills(response.data.skills || []);
      setProjects(response.data.projects || []);
      setCertifications(response.data.certifications || []);
      setResearchPapers(response.data.researchPapers || []);
      setAchievements(response.data.achievements || []);
      setHackathons(response.data.hackathons || []);
      setCommunityServices(response.data.communityServices || []);
      setCreativeWorks(response.data.creativeWorks || []);
      setResumes(response.data.resumes || []);
      setAcademicRecords(response.data.academicRecords || []);
      setOlympiads(response.data.olympiads || []);
      setStartupCompetitions(response.data.startupCompetitions || []);
      setNgoActivities(response.data.ngoActivities || []);
      setSportsAchievements(response.data.sportsAchievements || []);
      
      if (response.data.themeConfig) {
        setThemeConfig(response.data.themeConfig);
      }
      if (response.data.profile?.selectedTheme) {
        setActiveTheme(response.data.profile.selectedTheme);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnerOrAdmin =
    loggedInUser &&
    (Number(loggedInUser.id) === Number(id) ||
      (user && Number(loggedInUser.id) === Number(user.id)) ||
      loggedInUser.role === "Admin" ||
      loggedInUser.role === 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-400 font-bold tracking-widest text-xs uppercase animate-pulse">Loading MCC Resume Portfolio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/5 border border-white/10 p-12 rounded-3xl max-w-xl shadow-2xl backdrop-blur-md">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">This student portfolio does not exist or has been removed from Madras Christian College platform.</p>
          <button onClick={() => window.location.href = "/"} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg">
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  if (profile && !profile.isApproved && !isOwnerOrAdmin) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/5 border border-white/10 p-12 rounded-3xl max-w-xl shadow-2xl backdrop-blur-md">
          <AlertCircle size={64} className="text-yellow-500 mx-auto mb-6 animate-bounce" />
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Verification In Progress</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            This student portfolio is currently undergoing verification by the Madras Christian College administrators. It will be publicly viewable once approved.
          </p>
          <button onClick={() => window.location.href = "/"} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const initials = user.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // Setup theme-specific configurations
  const getThemeStyles = () => {
    switch (activeTheme) {
      case "Corporate":
        return {
          wrapper: "font-sans bg-slate-50 text-slate-900 min-h-screen transition-all duration-300 pb-16 print:bg-white print:p-0",
          container: "max-w-5xl mx-auto my-8 shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl overflow-hidden bg-white border border-slate-200/80 print:shadow-none print:my-0 print:border-none",
          header: "bg-slate-900 text-white px-8 py-7 flex flex-row items-center gap-5 border-b-4 border-blue-600 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-slate-300",
          avatarBorder: "border-4 border-slate-700 shadow-md print:border-2 print:border-slate-300",
          avatarBg: "bg-gradient-to-br from-slate-700 to-slate-800 text-white",
          subtitle: "text-blue-400 font-bold text-sm tracking-wider uppercase print:text-slate-600",
          iconColor: "text-blue-500",
          btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all",
          sidebar: "w-full md:w-80 bg-slate-100 text-slate-800 px-8 py-10 space-y-10 border-r border-slate-200/60 print:bg-white print:p-0 print:w-full print:border-none",
          sidebarHeader: "text-xs font-black uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-300 pb-2 print:text-black print:border-black",
          levelBar: "bg-gradient-to-r from-blue-600 to-slate-700",
          mainContent: "flex-1 bg-white px-10 py-10 space-y-12 print:p-0",
          sectionHeaderIcon: "text-blue-600 print:hidden",
          sectionTitle: "text-lg font-black uppercase tracking-widest text-slate-900 pb-1.5 border-b border-slate-200 print:text-black print:border-black",
          badge: "inline-block mt-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200",
          borderAccent: "border-l-3 border-blue-600 pl-4",
          btnSmall: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
          btnSmallSec: "text-xs text-slate-600 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50",
          paperReadBtn: "bg-slate-800 hover:bg-slate-900 text-white shadow-sm",
          footer: "bg-slate-900 text-slate-400 px-10 py-6 text-center border-t border-slate-800 print:hidden",
          pendingBanner: "bg-blue-500/10 border-b border-blue-500/20 text-blue-700"
        };
      case "Startup":
        return {
          wrapper: "font-sans bg-neutral-50 text-neutral-900 min-h-screen transition-all duration-300 pb-16 print:bg-white print:p-0",
          container: "max-w-5xl mx-auto my-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden bg-white print:shadow-none print:my-0 print:rounded-none",
          header: "bg-gradient-to-r from-violet-600 via-pink-600 to-orange-500 text-white px-8 py-7 flex flex-row items-center gap-5 relative overflow-hidden print:bg-none print:text-black print:p-0 print:border-b-2 print:border-slate-300",
          avatarBorder: "border-4 border-white/45 shadow-2xl scale-105 print:border-2 print:border-slate-300",
          avatarBg: "bg-gradient-to-br from-violet-500 to-pink-500 text-white",
          subtitle: "text-orange-200 font-extrabold text-sm tracking-widest uppercase print:text-slate-600",
          iconColor: "text-pink-500",
          btnColor: "bg-neutral-900 hover:bg-neutral-800 text-white shadow-xl hover:scale-105 transition-all duration-200",
          sidebar: "w-full md:w-80 bg-neutral-900 text-neutral-200 px-8 py-10 space-y-10 print:bg-white print:text-black print:p-0 print:w-full",
          sidebarHeader: "text-xs font-black uppercase tracking-widest text-violet-400 mb-5 flex items-center gap-2 pb-2 border-b border-neutral-800 print:text-black print:border-black",
          levelBar: "bg-gradient-to-r from-violet-500 to-pink-500",
          mainContent: "flex-1 bg-white px-10 py-10 space-y-12 print:p-0",
          sectionHeaderIcon: "text-violet-600 print:hidden",
          sectionTitle: "text-lg font-black uppercase tracking-widest text-neutral-900 pb-2 border-b-2 border-neutral-100 print:text-black print:border-black",
          badge: "inline-block mt-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100",
          borderAccent: "border-l-3 border-pink-500 pl-4",
          btnSmall: "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md hover:scale-105 transition-transform duration-200",
          btnSmallSec: "text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100",
          paperReadBtn: "bg-neutral-950 hover:bg-neutral-900 text-white shadow-md",
          footer: "bg-neutral-950 text-neutral-500 px-10 py-8 text-center print:hidden",
          pendingBanner: "bg-pink-500/10 border-b border-pink-500/20 text-pink-700"
        };
      case "Creative":
        return {
          wrapper: "font-sans bg-gradient-to-tr from-[#f3f4f6] to-[#e5e7eb] text-slate-800 min-h-screen transition-all duration-300 pb-16 print:bg-white print:p-0",
          container: "max-w-5xl mx-auto my-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/40 print:shadow-none print:my-0 print:rounded-none print:border-none",
          header: "bg-gradient-to-tr from-teal-800 via-indigo-950 to-purple-900 text-white px-8 py-7 flex flex-row items-center gap-5 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-slate-300",
          avatarBorder: "border-4 border-teal-400/40 shadow-xl print:border-2 print:border-slate-300",
          avatarBg: "bg-gradient-to-br from-teal-400 to-indigo-600 text-white",
          subtitle: "text-teal-300 font-semibold text-sm tracking-widest uppercase print:text-slate-600",
          iconColor: "text-teal-400",
          btnColor: "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20 hover:-translate-y-0.5 transition-all duration-200",
          sidebar: "w-full md:w-80 bg-indigo-950/95 text-indigo-100 px-8 py-10 space-y-10 print:bg-white print:text-black print:p-0 print:w-full",
          sidebarHeader: "text-xs font-black uppercase tracking-widest text-teal-300 mb-5 flex items-center gap-2 pb-2 border-b border-indigo-900 print:text-black print:border-black",
          levelBar: "bg-gradient-to-r from-teal-400 to-indigo-400",
          mainContent: "flex-1 bg-white/95 px-10 py-10 space-y-12 print:p-0",
          sectionHeaderIcon: "text-indigo-600 print:hidden",
          sectionTitle: "text-lg font-black uppercase tracking-widest text-indigo-950 pb-2 border-b border-indigo-50 print:text-black print:border-black",
          badge: "inline-block mt-1.5 px-3 py-0.5 bg-teal-50 text-teal-800 text-xs font-semibold rounded-md border border-teal-100/50",
          borderAccent: "border-l-3 border-teal-400 pl-4",
          btnSmall: "bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/10",
          btnSmallSec: "text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50",
          paperReadBtn: "bg-indigo-900 hover:bg-indigo-950 text-white shadow-md",
          footer: "bg-indigo-950 text-indigo-300/60 px-10 py-6 text-center print:hidden",
          pendingBanner: "bg-teal-500/10 border-b border-teal-500/20 text-teal-700"
        };
      case "AIFuturistic":
        return {
          wrapper: "font-mono bg-[#030303] text-gray-300 min-h-screen selection:bg-[#00ffcc]/30 selection:text-[#00ffcc] transition-all duration-300 pb-16 print:bg-white print:text-black print:p-0",
          container: "max-w-5xl mx-auto my-8 shadow-[0_0_80px_rgba(0,255,204,0.12)] rounded-2xl overflow-hidden bg-[#0a0a0c] border border-[#00ffcc]/20 print:shadow-none print:my-0 print:border-none",
          header: "bg-black text-[#00ffcc] px-8 py-7 flex flex-row items-center gap-5 border-b border-[#00ffcc]/30 shadow-[inset_0_0_40px_rgba(0,255,204,0.05)] print:bg-white print:text-black print:p-0 print:border-b-2 print:border-slate-300",
          avatarBorder: "border-4 border-[#00ffcc]/40 shadow-[0_0_25px_rgba(0,255,204,0.25)] print:border-2 print:border-slate-300",
          avatarBg: "bg-black border border-[#00ffcc] text-[#00ffcc]",
          subtitle: "text-cyan-400 font-bold text-sm tracking-wider uppercase font-mono print:text-slate-600",
          iconColor: "text-[#00ffcc]",
          btnColor: "bg-transparent hover:bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/50 shadow-[0_0_15px_rgba(0,255,204,0.15)]",
          sidebar: "w-full md:w-80 bg-[#060608] text-gray-400 px-8 py-10 space-y-10 border-r border-[#00ffcc]/10 print:bg-white print:text-black print:p-0 print:w-full",
          sidebarHeader: "text-xs font-bold uppercase tracking-widest text-[#00ffcc] mb-5 flex items-center gap-2 pb-2 border-b border-[#00ffcc]/20 print:text-black print:border-black",
          levelBar: "bg-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]",
          mainContent: "flex-1 bg-[#050507] px-10 py-10 space-y-12 text-gray-300 print:bg-white print:text-black print:p-0",
          sectionHeaderIcon: "text-[#00ffcc] print:hidden",
          sectionTitle: "text-lg font-bold uppercase tracking-widest text-[#00ffcc] pb-2 border-b border-[#00ffcc]/15 print:text-black print:border-black",
          badge: "inline-block mt-1.5 px-2.5 py-0.5 bg-black text-[#00ffcc] text-xs font-bold rounded border border-[#00ffcc]/20",
          borderAccent: "border-l-3 border-[#00ffcc]/50 pl-4",
          btnSmall: "bg-[#00ffcc] hover:bg-cyan-400 text-black font-bold shadow-[0_0_10px_rgba(0,255,204,0.2)]",
          btnSmallSec: "text-xs text-[#00ffcc] hover:text-white border border-[#00ffcc]/20 bg-[#09090b]",
          paperReadBtn: "bg-[#00ffcc] hover:bg-cyan-400 text-black font-bold",
          footer: "bg-black text-gray-600 px-10 py-6 text-center border-t border-[#00ffcc]/10 print:hidden",
          pendingBanner: "bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400"
        };
      case "LinkedIn":
        return {
          wrapper: "font-sans bg-[#f3f2ef] text-[#191919] min-h-screen transition-all duration-300 pb-16 print:bg-white print:p-0",
          container: "max-w-5xl mx-auto my-8 shadow-md rounded-xl overflow-hidden bg-white border border-slate-200 print:shadow-none print:my-0 print:border-none",
          header: "bg-gradient-to-r from-[#0a66c2] to-[#004182] text-white px-8 py-10 flex flex-row items-center gap-6 relative min-h-[180px] border-b border-slate-200 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-slate-300",
          avatarBorder: "border-4 border-white shadow-lg shrink-0 print:border-2 print:border-slate-300",
          avatarBg: "bg-gradient-to-br from-[#0a66c2] to-[#004182] text-white",
          subtitle: "text-blue-100 font-medium text-sm tracking-wide print:text-slate-600",
          iconColor: "text-[#0a66c2]",
          btnColor: "bg-[#0a66c2] hover:bg-[#004182] text-white shadow-md transition-all rounded-full px-6 py-2.5 font-semibold text-xs",
          sidebar: "w-full md:w-80 bg-white text-slate-800 px-8 py-10 space-y-10 border-r border-slate-200 print:bg-white print:p-0 print:w-full print:border-none",
          sidebarHeader: "text-xs font-black uppercase tracking-widest text-[#0a66c2] mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 print:text-black print:border-black",
          levelBar: "bg-[#0a66c2]",
          mainContent: "flex-1 bg-white px-10 py-10 space-y-12 print:p-0",
          sectionHeaderIcon: "text-[#0a66c2] print:hidden",
          sectionTitle: "text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 print:text-black print:border-black",
          badge: "inline-block mt-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200",
          borderAccent: "border-l-4 border-[#0a66c2] pl-4",
          btnSmall: "bg-[#0a66c2] hover:bg-[#004182] text-white transition-all text-xs rounded-full px-4 py-2 font-semibold",
          btnSmallSec: "text-xs text-slate-600 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 rounded-full px-4 py-2 font-semibold",
          paperReadBtn: "bg-slate-800 hover:bg-slate-900 text-white rounded-full px-4 py-2 font-semibold text-xs",
          footer: "bg-[#1d2226] text-slate-400 px-10 py-8 text-center print:hidden",
          pendingBanner: "bg-blue-500/10 border-b border-blue-500/20 text-blue-750"
        };
      case "Academic":
      default:
        return {
          wrapper: "font-serif bg-[#FAF9F5] text-[#2c2c2c] min-h-screen transition-all duration-300 pb-16 print:bg-white print:p-0",
          container: "max-w-5xl mx-auto my-8 shadow-2xl rounded-2xl overflow-hidden bg-white border border-amber-900/10 print:shadow-none print:my-0 print:rounded-none print:border-none",
          header: "bg-[#18233c] text-white px-8 py-7 flex flex-row items-center gap-5 relative border-b-4 border-amber-500 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-slate-300",
          avatarBorder: "border-4 border-amber-400/40 shadow-xl print:border-2 print:border-slate-300",
          avatarBg: "bg-gradient-to-br from-[#18233c] to-[#253966] text-white",
          subtitle: "text-amber-400 font-semibold text-sm tracking-widest uppercase print:text-slate-600",
          iconColor: "text-amber-400",
          btnColor: "bg-amber-600 hover:bg-amber-700 text-white shadow-lg",
          sidebar: "w-full md:w-80 bg-[#121c32] text-slate-200 px-8 py-10 space-y-10 print:bg-white print:text-black print:p-0 print:w-full",
          sidebarHeader: "text-xs font-black uppercase tracking-widest text-amber-400 mb-5 flex items-center gap-2 pb-2 border-b border-amber-500/20 print:text-black print:border-black",
          levelBar: "bg-gradient-to-r from-amber-500 to-amber-600",
          mainContent: "flex-1 bg-white px-10 py-10 space-y-12 print:p-0",
          sectionHeaderIcon: "text-[#18233c] print:hidden",
          sectionTitle: "text-lg font-black uppercase tracking-widest text-[#18233c] pb-2 border-b-2 border-amber-50 print:text-black print:border-black",
          badge: "inline-block mt-1.5 px-3 py-0.5 bg-amber-50 text-amber-800 text-xs font-semibold rounded-md border border-amber-200/65",
          borderAccent: "border-l-3 border-amber-500 pl-4",
          btnSmall: "bg-amber-600 hover:bg-amber-700 text-white shadow-md",
          btnSmallSec: "text-xs text-amber-700 hover:text-amber-900 border border-amber-200 bg-amber-50/30 hover:bg-amber-50",
          paperReadBtn: "bg-[#18233c] hover:bg-slate-800 text-white shadow-md",
          footer: "bg-[#0b1222] text-[#5c6e8e] px-10 py-6 text-center print:hidden",
          pendingBanner: "bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-700"
        };
    }
  };

  const s = getThemeStyles();

  if (themeConfig) {
    if (themeConfig.primaryColor) {
      s.iconColor = "text-custom-primary";
      s.btnColor = "bg-custom-primary hover:opacity-90 text-white shadow-md";
      s.btnSmall = "bg-custom-primary hover:opacity-90 text-white shadow-sm";
      s.borderAccent = "border-l-3 border-custom-primary pl-4";
      s.levelBar = "bg-custom-primary";
    }
    if (themeConfig.fontFamily) {
      s.wrapper = `${s.wrapper.replace(/font-\w+/g, "")} font-custom-override`;
    }
  }

  const toggleAbstract = (paperId: number) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  return (
    <div className={s.wrapper}>
      <title>{user.fullName} – Premium Resume Portfolio</title>

      {/* ═══════════════════════════════════════
          DYNAMIC FLOATING THEME SELECTOR & ACTION BAR (PRINT EXCLUDED)
      ═══════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto mt-4 px-4 flex justify-between items-center print:hidden">
        {/* Dynamic theme pills */}
        <div className="bg-slate-900/10 backdrop-blur border border-slate-500/10 p-1.5 rounded-full flex gap-1 shadow-sm overflow-x-auto max-w-full">
          {["Academic", "Corporate", "Startup", "Creative", "AIFuturistic", "LinkedIn"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTheme(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                activeTheme === t
                  ? "bg-slate-900 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-900/5"
              }`}
            >
              {t === "AIFuturistic" ? "AI Futuristic" : t}
            </button>
          ))}
        </div>

        {/* Actions panel */}
        <div className="flex items-center gap-2 print:hidden">
          {/* Back to Search button */}
          <Link
            href="/search"
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:shadow"
          >
            <ArrowLeft size={13} className="text-slate-500" />
            Directory
          </Link>

          {/* Share / Copy URL button */}
          <button
            id="portfolio-share-btn"
            onClick={handleCopyUrl}
            className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow ${
              urlCopied
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
            }`}
          >
            {urlCopied ? <Check size={13} /> : <Share2 size={13} className="text-slate-500" />}
            {urlCopied ? "Copied!" : "Share"}
          </button>

          {/* Print / Export Resume Button */}
          <button
            id="portfolio-print-btn"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* PENDING BANNER */}
      {profile && !profile.isApproved && isOwnerOrAdmin && (
        <div className={`max-w-5xl mx-auto mt-4 px-6 py-3 rounded-2xl text-center text-sm flex items-center justify-center gap-2 font-semibold print:hidden ${s.pendingBanner}`}>
          <AlertCircle size={16} />
          Your portfolio is pending admin verification. Only you can view this page.
        </div>
      )}

      {/* RESUME WRAPPER */}
      <div className={s.container}>

        {/* ═══════════════════════════════════════
            TOP HEADER BAND
        ═══════════════════════════════════════ */}
        <div className={s.header}>
          
          {/* Subtle geometric background overlay for Startup & Creative */}
          {activeTheme === "Startup" && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)] pointer-events-none" />
          )}
          {activeTheme === "Creative" && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.08),transparent_50%)] pointer-events-none" />
          )}

          {/* AVATAR */}
          <div className="flex-shrink-0 relative self-center">
            {profile?.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={user.fullName}
                className={`w-20 h-20 rounded-full object-cover ${s.avatarBorder} relative z-10`}
              />
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center relative z-10 ${s.avatarBorder} ${s.avatarBg}`}>
                <span className="text-2xl font-bold">{initials}</span>
              </div>
            )}
            {activeTheme === "AIFuturistic" && (
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-[#00ffcc]/20 blur-md animate-pulse pointer-events-none" />
            )}
          </div>

          {/* NAME + META — stacked cleanly */}
          <div className="flex-1 min-w-0 relative z-10">
            {/* Row 1: Name + badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white print:text-black leading-tight">
                {user.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-400 whitespace-nowrap print:text-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                MCC VERIFIED
              </span>
            </div>

            {/* Row 2: Department subtitle */}
            <p className={`mt-1.5 text-sm font-semibold tracking-wide ${s.subtitle}`}>
              {user.department} · Madras Christian College
            </p>

            {/* Row 3: Bio (if present) */}
            {profile?.bio && (
              <p className="text-slate-300 text-xs leading-relaxed mt-2 max-w-xl print:text-slate-700">
                {profile.bio}
              </p>
            )}

            {/* Row 4: Contact links */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              {user.email && (
                <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition print:text-black">
                  <Mail size={12} className={`${s.iconColor} flex-shrink-0`} />
                  <span>{user.email}</span>
                </a>
              )}
              {profile?.linkedInUrl && (
                <a href={profile.linkedInUrl} target="_blank" className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition print:text-black">
                  <Linkedin size={12} className={`${s.iconColor} flex-shrink-0`} />
                  <span>LinkedIn</span>
                </a>
              )}
              {profile?.gitHubUrl && (
                <a href={profile.gitHubUrl} target="_blank" className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition print:text-black">
                  <Github size={12} className={`${s.iconColor} flex-shrink-0`} />
                  <span>GitHub</span>
                </a>
              )}
              <span className="flex items-center gap-1.5 text-xs text-slate-300 print:text-black">
                <MapPin size={12} className={`${s.iconColor} flex-shrink-0`} />
                <span>Chennai, Tamil Nadu</span>
              </span>
            </div>
          </div>

          {/* DOWNLOAD CV BUTTON */}
          {resumes.length > 0 && (
            <div className="flex-shrink-0 self-center relative z-10 print:hidden">
              <a
                href={resumes[0].resumeUrl}
                target="_blank"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${s.btnColor}`}
              >
                <FileText size={13} /> Download CV
              </a>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            TWO-COLUMN BODY
        ═══════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row">

          {/* ═══════════════════════════════════════
              LEFT SIDEBAR: TECHNICAL SKILLS & BADGES
          ═══════════════════════════════════════ */}
          <aside className={s.sidebar}>

            {/* SKILLS */}
            {skills.length > 0 && (
              <section className="print:break-inside-avoid">
                <h2 className={s.sidebarHeader}>
                  <Cpu size={14} /> Skills Arsenal
                </h2>
                <div className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-inherit">{skill.name}</span>
                        <span className={`text-[10px] font-mono font-bold tracking-widest ${s.iconColor}`}>{skill.level}</span>
                      </div>
                      <div className="w-full bg-slate-300/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${s.levelBar}`}
                          style={{
                            width:
                              skill.level?.toLowerCase() === "expert" ? "95%" :
                              skill.level?.toLowerCase() === "advanced" ? "80%" :
                              skill.level?.toLowerCase() === "intermediate" ? "60%" :
                              skill.level?.toLowerCase() === "beginner" ? "35%" : "55%"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CERTIFICATIONS (TIMELINE STYLE) */}
            {certifications.length > 0 && (
              <section className="print:break-inside-avoid">
                <h2 className={s.sidebarHeader}>
                  <Award size={14} /> Certifications
                </h2>
                <div className="space-y-5">
                  {certifications.map((cert) => (
                    <div key={cert.id} className={`${s.borderAccent} pl-4 relative group`}>
                      <p className="text-xs font-bold uppercase tracking-wide text-inherit leading-tight group-hover:text-teal-400 transition-colors">{cert.title}</p>
                      <p className="text-[11px] opacity-70 mt-1">{cert.issuer}</p>
                      {cert.issueDate && (
                        <p className="text-[10px] opacity-50 mt-0.5">{new Date(cert.issueDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>
                      )}
                      {cert.certificateUrl && (
                        <a href={cert.certificateUrl} target="_blank" className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${s.iconColor} hover:opacity-80 transition-opacity`}>
                          <ExternalLink size={10} /> View Credentials
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ACHIEVEMENTS (TIMELINE STYLE) */}
            {achievements.length > 0 && (
              <section className="print:break-inside-avoid">
                <h2 className={s.sidebarHeader}>
                  <Trophy size={14} /> Achievements
                </h2>
                <div className="space-y-5">
                  {achievements.map((ach) => (
                    <div key={ach.id} className={`${s.borderAccent} pl-4`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-inherit leading-tight">{ach.title}</p>
                        {ach.category && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-slate-500/10 border border-slate-500/20 uppercase font-semibold">
                            {ach.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-75 mt-1 leading-relaxed">{ach.description}</p>
                      {ach.achievementUrl && (
                        <a href={ach.achievementUrl} target="_blank" className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${s.iconColor} hover:opacity-80 transition-opacity`}>
                          <ExternalLink size={10} /> Verify Proof
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* RESUMES / ATTACHED DOCUMENTS */}
            {resumes.length > 0 && (
              <section className="print:hidden">
                <h2 className={s.sidebarHeader}>
                  <FileText size={14} /> Resume Credentials
                </h2>
                <div className="space-y-2.5">
                  {resumes.map((resume) => (
                    <a
                      key={resume.id}
                      href={resume.resumeUrl}
                      target="_blank"
                      className="flex items-center justify-between text-xs bg-slate-500/5 hover:bg-slate-500/10 border border-slate-500/10 px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      <span className="font-semibold text-inherit truncate pr-2">{resume.resumeTitle}</span>
                      <FileText size={13} className={s.iconColor} />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* QR CODE RECRUITER WIDGET */}
            <section className="print:hidden">
              <h2 className={s.sidebarHeader}>
                <Code2 size={14} /> QR Portfolio Link
              </h2>
              <div className={`border rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all ${
                activeTheme === "AIFuturistic" ? "bg-black border-[#00ffcc]/20" : "bg-slate-500/[0.03] border-slate-500/10"
              }`}>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block mb-3 font-bold">Scan to View Portfolio</span>
                <img
                  id="portfolio-qr-img"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&bgcolor=ffffff&color=000000&margin=10`}
                  alt="Portfolio QR Code"
                  className={`w-32 h-32 rounded-lg p-1.5 bg-white border ${activeTheme === "AIFuturistic" ? "border-[#00ffcc]/30" : "border-slate-200"}`}
                />
                <span className="text-[9px] opacity-60 mt-3 block font-medium">Scan to open this MCC portfolio instantly on any mobile device.</span>
                <button
                  id="portfolio-qr-download-btn"
                  onClick={handleDownloadQr}
                  className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    activeTheme === "AIFuturistic"
                      ? "border-[#00ffcc]/30 text-[#00ffcc] hover:bg-[#00ffcc]/10"
                      : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <Download size={10} /> Download QR Code
                </button>
                <button
                  id="portfolio-copy-url-btn"
                  onClick={handleCopyUrl}
                  className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    urlCopied
                      ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                      : activeTheme === "AIFuturistic"
                      ? "border-[#00ffcc]/30 text-[#00ffcc] hover:bg-[#00ffcc]/10"
                      : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {urlCopied ? <Check size={10} /> : <Share2 size={10} />}
                  {urlCopied ? "Link Copied!" : "Copy Portfolio Link"}
                </button>
              </div>
            </section>
          </aside>

          {/* ═══════════════════════════════════════
              RIGHT MAIN COLUMN: PROJECTS, RESEARCH & HACKATHONS
          ═══════════════════════════════════════ */}
          <main className={s.mainContent}>

            {/* PERSONAL STORY & SOP */}
            {(profile?.personalStory || profile?.sop) && (
              <section className="print:break-inside-avoid space-y-6">
                {profile.personalStory && (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <BookOpen size={20} className={s.sectionHeaderIcon} />
                      <h2 className={s.sectionTitle}>My Personal Journey</h2>
                      <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                    </div>
                    <p className={`text-sm leading-relaxed italic border-l-4 pl-4 ${
                      activeTheme === "AIFuturistic"
                        ? "text-[#00ffcc]/80 border-[#00ffcc]/30 bg-black/40 py-4 pr-3 rounded-r-xl"
                        : activeTheme === "Academic"
                        ? "text-slate-800 border-amber-500 bg-amber-50/20 py-4 pr-3 rounded-r-xl font-serif"
                        : "text-slate-600 border-violet-500 bg-slate-50 py-4 pr-3 rounded-r-xl"
                    }`}>
                      "{profile.personalStory}"
                    </p>
                  </div>
                )}

                {profile.sop && (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <FileText size={20} className={s.sectionHeaderIcon} />
                      <h2 className={s.sectionTitle}>Statement of Purpose</h2>
                      <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                    </div>
                    <div className={`text-xs leading-relaxed p-5 border rounded-2xl ${
                      activeTheme === "AIFuturistic"
                        ? "bg-black border-[#00ffcc]/15 text-gray-300 shadow-[inset_0_0_20px_rgba(0,255,204,0.02)]"
                        : activeTheme === "Academic"
                        ? "bg-amber-50/10 border-amber-900/10 text-slate-800 font-serif"
                        : "bg-[#f8fafc] border-slate-200/80 text-slate-600"
                    }`}>
                      <p className="whitespace-pre-line">{profile.sop}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ACADEMIC HISTORY */}
            {academicRecords.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <Award size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Academic History</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="space-y-6 relative border-l border-slate-200 dark:border-white/10 ml-4 pl-6">
                  {academicRecords.map((item) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        activeTheme === "AIFuturistic"
                          ? "bg-black border-[#00ffcc] text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.5)]"
                          : "bg-white border-violet-600 text-violet-600"
                      }`}>
                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                      </span>

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className={`text-base font-black tracking-tight leading-tight ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                            {item.degree}
                          </h3>
                          <p className={`text-xs font-bold mt-1 ${activeTheme === "AIFuturistic" ? "text-[#00ffcc]" : "text-violet-600"}`}>
                            {item.institution} {item.fieldOfStudy ? `· ${item.fieldOfStudy}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 sm:mt-0">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            activeTheme === "AIFuturistic" ? "bg-black border border-[#00ffcc]/20 text-[#00ffcc]" : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {item.startYear} - {item.endYear || "Present"}
                          </span>
                          {item.grade && (
                            <span className={s.badge}>
                              Grade: {item.grade}
                            </span>
                          )}
                        </div>
                      </div>

                      {item.attachmentUrl && (
                        <div className="mt-3 print:hidden">
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition ${s.btnSmallSec}`}
                          >
                            <FileText size={10} className={s.iconColor} /> Verified Transcript / Proof
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PROJECTS */}
            {projects.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <Code2 size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Featured Projects</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>
                
                <div className="space-y-8">
                  {projects.map((project) => (
                    <div key={project.id} className="group transition-all duration-300">
                      {project.imageUrl && (
                        <img 
                          src={project.imageUrl} 
                          className="w-full h-48 object-cover rounded-xl mb-4 border border-slate-200/50 dark:border-white/10" 
                          alt={project.title} 
                        />
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-black tracking-tight leading-tight transition-colors ${activeTheme === "AIFuturistic" ? "text-white group-hover:text-[#00ffcc]" : "text-slate-900 group-hover:text-violet-600"}`}>
                            {project.title}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {project.technologies.split(",").map((tech: string, index: number) => (
                              <span key={index} className={s.badge}>
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-1 sm:mt-0 print:hidden">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              className={`flex items-center gap-1.5 text-[11px] font-bold border px-3 py-2 rounded-xl transition ${
                                activeTheme === "AIFuturistic"
                                  ? "text-[#00ffcc] border-[#00ffcc]/30 bg-black hover:bg-[#00ffcc]/10 shadow-[0_0_8px_rgba(0,255,204,0.05)]"
                                  : "text-slate-600 border-slate-200 hover:border-slate-400 bg-white shadow-sm hover:shadow"
                              }`}
                            >
                              <Github size={12} /> Code
                            </a>
                          )}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition ${s.btnSmall}`}
                            >
                              <ExternalLink size={12} /> Live Link
                            </a>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm leading-relaxed ${activeTheme === "AIFuturistic" ? "text-gray-400" : "text-slate-600"}`}>
                        {project.description}
                      </p>
                      
                      {/* Printable URLs for resume output */}
                      <div className="hidden print:block text-[10px] text-slate-500 mt-1 space-y-0.5">
                        {project.githubUrl && <p>GitHub: {project.githubUrl}</p>}
                        {project.liveUrl && <p>Demo: {project.liveUrl}</p>}
                      </div>
                      
                      <div className={`mt-4 h-px ${activeTheme === "AIFuturistic" ? "bg-white/10" : "bg-slate-100"}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* RESEARCH PAPERS */}
            {researchPapers.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <BookOpen size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Scholarly Publications</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>
                
                <div className="space-y-8">
                  {researchPapers.map((paper) => {
                    const isExpanded = expandedAbstracts[paper.id];
                    return (
                      <div key={paper.id} className="transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className={`text-base font-black tracking-tight leading-tight ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>{paper.title}</h3>
                            <p className={`text-xs font-bold mt-1.5 ${activeTheme === "AIFuturistic" ? "text-[#00ffcc]" : "text-violet-600"}`}>{paper.conference}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 mt-1 sm:mt-0 print:hidden">
                            <button
                              onClick={() => toggleAbstract(paper.id)}
                              className={`flex items-center gap-1.5 text-[11px] font-bold border px-3 py-2 rounded-xl transition ${s.btnSmallSec}`}
                            >
                              {isExpanded ? "Hide Abstract" : "Read Abstract"}
                            </button>
                            {paper.paperUrl && (
                              <a href={paper.paperUrl} target="_blank" className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition ${s.paperReadBtn}`}>
                                <BookOpen size={12} /> View PDF
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Interactive abstract toggler with smooth transition height */}
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] mt-3" : "max-h-0 print:max-h-[500px] print:mt-3"}`}>
                          <p className={`text-xs leading-relaxed border-l-3 pl-4 ${
                            activeTheme === "AIFuturistic"
                              ? "text-gray-400 border-[#00ffcc]/40 bg-white/5 py-2.5 pr-2 rounded-r-xl"
                              : "text-slate-600 border-violet-300 bg-slate-50 py-2.5 pr-2 rounded-r-xl"
                          }`}>
                            <span className="font-extrabold uppercase tracking-widest text-[9px] block mb-1 opacity-70">Publication Abstract</span>
                            {paper.abstract}
                          </p>
                        </div>
                        
                        <div className="hidden print:block text-[10px] text-slate-500 mt-1">
                          {paper.paperUrl && <p>Link: {paper.paperUrl}</p>}
                        </div>
                        
                        <div className={`mt-4 h-px ${activeTheme === "AIFuturistic" ? "bg-white/10" : "bg-slate-100"}`} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* OLYMPIADS & COMPETITIONS */}
            {olympiads.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <Trophy size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Olympiads & Honors</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {olympiads.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 border rounded-2xl transition-all duration-300 flex flex-col justify-between ${
                        activeTheme === "AIFuturistic"
                          ? "bg-black border-white/5 hover:border-[#00ffcc]/35 text-gray-300"
                          : "bg-slate-50 border-slate-200/65 hover:bg-white hover:shadow-md text-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-bold text-sm leading-snug ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                            {item.name}
                          </h4>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                            activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/10 text-[#00ffcc]" : "bg-amber-50 border border-amber-200 text-amber-800"
                          }`}>
                            Year: {item.year}
                          </span>
                        </div>
                        {item.subject && (
                          <p className="text-[10px] text-slate-400 font-semibold mb-2">Subject: {item.subject}</p>
                        )}
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-full mb-3 uppercase">
                          ★ Rank/Award: {item.rank}
                        </span>
                        {item.description && (
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.description}</p>
                        )}
                      </div>

                      {item.certificateUrl && (
                        <div className="pt-3 border-t border-dashed border-white/10 print:hidden">
                          <a
                            href={item.certificateUrl}
                            target="_blank"
                            className="text-xs font-bold text-yellow-500 hover:underline flex items-center gap-1.5"
                          >
                            <Trophy size={12} /> View Olympiad Certificate
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* HACKATHONS (TIMELINE STYLE) */}
            {hackathons.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <Star size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Hackathons & Ideations</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>
                
                <div className="space-y-8">
                  {hackathons.map((hack) => (
                    <div key={hack.id} className="transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-black tracking-tight leading-tight ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>{hack.title}</h3>
                          <p className="text-xs mt-1.5">
                            <span className={`font-extrabold ${activeTheme === "AIFuturistic" ? "text-[#00ffcc]" : "text-violet-600"}`}>{hack.organizer}</span>
                            {hack.eventDate && ` · ${new Date(hack.eventDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
                          </p>
                          {hack.projectName && (
                            <p className="text-xs mt-1 opacity-70">Created Product: <span className="font-bold">{hack.projectName}</span></p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-1 sm:mt-0 print:hidden">
                          {hack.hackathonUrl && (
                            <a
                              href={hack.hackathonUrl}
                              target="_blank"
                              className={`flex items-center gap-1.5 text-[11px] font-bold border px-3 py-2 rounded-xl transition ${
                                activeTheme === "AIFuturistic"
                                  ? "text-[#00ffcc] border-[#00ffcc]/30 bg-black hover:bg-[#00ffcc]/10"
                                  : "text-slate-600 border-slate-200 hover:border-slate-400 bg-white"
                              }`}
                            >
                              <ExternalLink size={12} /> Live Link
                            </a>
                          )}
                          {hack.certificateUrl && (
                            <a
                              href={hack.certificateUrl}
                              target="_blank"
                              className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition ${s.btnSmall}`}
                            >
                              <Award size={12} /> Certificate
                            </a>
                          )}
                        </div>
                      </div>
                      {hack.description && (
                        <p className={`text-sm leading-relaxed mt-2 ${activeTheme === "AIFuturistic" ? "text-gray-400" : "text-slate-600"}`}>
                          {hack.description}
                        </p>
                      )}
                      
                      <div className="hidden print:block text-[10px] text-slate-500 mt-1">
                        {hack.hackathonUrl && <p>Link: {hack.hackathonUrl}</p>}
                      </div>
                      
                      <div className={`mt-4 h-px ${activeTheme === "AIFuturistic" ? "bg-white/10" : "bg-slate-100"}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STARTUP & Pitch COMPETITIONS */}
            {startupCompetitions.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <GitBranch size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Startup & Pitch Competitions</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="space-y-6">
                  {startupCompetitions.map((item) => (
                    <div key={item.id} className="transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-black tracking-tight leading-tight ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                            {item.projectName}
                          </h3>
                          <p className="text-xs mt-1.5">
                            <span className={`font-extrabold ${activeTheme === "AIFuturistic" ? "text-[#00ffcc]" : "text-violet-600"}`}>{item.competitionName}</span>
                            {item.role && ` · Role: ${item.role}`}
                            {item.date && ` · ${new Date(item.date).toLocaleDateString()}`}
                          </p>
                          <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded mt-2 font-bold uppercase">
                            Result: {item.result}
                          </span>
                        </div>
                        {item.pitchDeckUrl && (
                          <a
                            href={item.pitchDeckUrl}
                            target="_blank"
                            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition flex-shrink-0 mt-1 sm:mt-0 print:hidden ${s.btnSmall}`}
                          >
                            <FileText size={12} /> View Pitch Deck
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-sm leading-relaxed mt-2 ${activeTheme === "AIFuturistic" ? "text-gray-400" : "text-slate-650"}`}>
                          {item.description}
                        </p>
                      )}
                      <div className={`mt-4 h-px ${activeTheme === "AIFuturistic" ? "bg-white/10" : "bg-slate-100"}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* COMMUNITY SERVICE */}
            {communityServices.length > 0 && (
              <section className="print:break-inside-avoid mt-10">
                <div className="flex items-center gap-4 mb-6">
                  <Heart size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Community Service & Volunteering</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="space-y-8">
                  {communityServices.map((item) => (
                    <div key={item.id} className="transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-black tracking-tight leading-tight ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                          <p className="text-xs mt-1.5">
                            <span className={`font-extrabold ${activeTheme === "AIFuturistic" ? "text-[#00ffcc]" : "text-violet-600"}`}>{item.organization}</span>
                            {item.hoursServed && ` · ${item.hoursServed} Hours Served`}
                            {item.date && ` · ${new Date(item.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
                          </p>
                        </div>
                        {item.attachmentUrl && (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition flex-shrink-0 mt-1 sm:mt-0 print:hidden ${s.btnSmallSec}`}
                          >
                            <Heart size={12} /> View Proof
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-sm leading-relaxed mt-2 ${activeTheme === "AIFuturistic" ? "text-gray-400" : "text-slate-650"}`}>
                          {item.description}
                        </p>
                      )}
                      
                      <div className={`mt-4 h-px ${activeTheme === "AIFuturistic" ? "bg-white/10" : "bg-slate-100"}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* NGO ACTIVITIES */}
            {ngoActivities.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <Heart size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>NGO Volunteering & Social Service</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="space-y-6">
                  {ngoActivities.map((item) => (
                    <div key={item.id} className="transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-black tracking-tight leading-tight ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>{item.role}</h3>
                          <p className="text-xs mt-1.5">
                            <span className={`font-extrabold ${activeTheme === "AIFuturistic" ? "text-[#00ffcc]" : "text-violet-600"}`}>{item.organizationName}</span>
                            {item.hoursContributed && ` · ${item.hoursContributed} Hours Contributed`}
                            {item.startDate && ` · ${new Date(item.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} - ${item.endDate ? new Date(item.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Present"}`}
                          </p>
                        </div>
                        {item.certificateUrl && (
                          <a
                            href={item.certificateUrl}
                            target="_blank"
                            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition flex-shrink-0 mt-1 sm:mt-0 print:hidden ${s.btnSmallSec}`}
                          >
                            <Heart size={12} /> View Certificate
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-sm leading-relaxed mt-2 ${activeTheme === "AIFuturistic" ? "text-gray-400" : "text-slate-650"}`}>
                          {item.description}
                        </p>
                      )}
                      <div className={`mt-4 h-px ${activeTheme === "AIFuturistic" ? "bg-white/10" : "bg-slate-100"}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SPORTS & ATHLETICS CORNER */}
            {sportsAchievements.length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <Trophy size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Sports & Athletics Corner</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {sportsAchievements.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 border rounded-2xl transition-all duration-300 flex flex-col justify-between ${
                        activeTheme === "AIFuturistic"
                          ? "bg-black border-white/5 hover:border-[#00ffcc]/35 text-gray-300"
                          : "bg-slate-50 border-slate-200/65 hover:bg-white hover:shadow-md text-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-bold text-sm leading-snug ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                            {item.sportName}
                          </h4>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                            activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/10 text-[#00ffcc]" : "bg-amber-50 border border-amber-200 text-amber-800"
                          }`}>
                            Level: {item.level}
                          </span>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-full mb-3 uppercase">
                          ★ Award: {item.achievement}
                        </span>
                        {item.date && (
                          <p className="text-[10px] text-slate-400 mb-2 font-mono">Date: {new Date(item.date).toLocaleDateString()}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">{item.description}</p>
                        )}
                      </div>

                      {item.certificateUrl && (
                        <div className="pt-3 border-t border-dashed border-white/10 print:hidden">
                          <a
                            href={item.certificateUrl}
                            target="_blank"
                            className="text-xs font-bold text-yellow-500 hover:underline flex items-center gap-1.5"
                          >
                            <Trophy size={12} /> View Merit Proof
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CREATIVE WORKS */}
            {creativeWorks.length > 0 && (
              <section className="print:break-inside-avoid mt-10">
                <div className="flex items-center gap-4 mb-6">
                  <Palette size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Creative Works & Design Portfolio</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {creativeWorks.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between ${
                        activeTheme === "AIFuturistic"
                          ? "bg-black border-white/5 hover:border-[#00ffcc]/35 text-gray-300"
                          : "bg-slate-50 border-slate-200/65 hover:bg-white hover:shadow-md"
                      }`}
                    >
                      <div>
                        {item.mediaUrl && !item.mediaUrl.endsWith(".pdf") && (
                          <img
                            src={item.mediaUrl}
                            className="w-full h-32 object-cover rounded-xl mb-4 border border-slate-200/55 dark:border-white/10"
                            alt={item.title}
                          />
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-bold text-sm truncate pr-2 ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                            {item.title}
                          </h4>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                            activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/10 text-[#00ffcc]" : "bg-violet-100 text-violet-750"
                          }`}>
                            {item.category}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed mb-4 ${activeTheme === "AIFuturistic" ? "text-gray-400" : "text-slate-655"}`}>
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono pt-3 border-t border-dashed border-white/10">
                        {item.date && (
                          <span className="opacity-55">{new Date(item.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                        )}
                        <div className="flex gap-2">
                          {item.workUrl && (
                            <a
                              href={item.workUrl}
                              target="_blank"
                              className="text-purple-400 hover:underline font-bold"
                            >
                              Showcase Link
                            </a>
                          )}
                          {item.mediaUrl && (
                            <a
                              href={item.mediaUrl}
                              target="_blank"
                              className="text-emerald-400 hover:underline font-bold"
                            >
                              Media File
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* GITHUB REPOSITORY SHOWCASE */}
            {profile?.gitHubUsername && (
              <section className="print:break-inside-avoid mt-10">
                <div className="flex items-center gap-4 mb-6">
                  <Github size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>GitHub Repositories</h2>
                  <span className="text-xs font-mono opacity-50">@{profile.gitHubUsername}</span>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                {loadingRepos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : githubRepos.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {githubRepos.map((repo: any) => (
                      <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        className={`p-5 border rounded-2xl transition-all duration-300 block hover:-translate-y-1 hover:shadow-md ${
                          activeTheme === "AIFuturistic"
                            ? "bg-black border-white/5 hover:border-[#00ffcc]/35 hover:shadow-[#00ffcc]/5 text-gray-300"
                            : "bg-[#f8fafc]/50 hover:bg-[#f8fafc] border-slate-200/80 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-bold text-sm truncate pr-2 ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                            {repo.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                            <span className="flex items-center gap-0.5 text-amber-500">
                              ★ {repo.stargazers_count}
                            </span>
                            <span className="text-gray-400">
                              ⌥ {repo.forks_count}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 h-8">
                          {repo.description || "No description provided."}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          {repo.language && (
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold">
                              {repo.language}
                            </span>
                          )}
                          <span className="opacity-50">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs italic">
                    No public repositories found for @{profile.gitHubUsername}.
                  </div>
                )}
              </section>
            )}

            {/* BEHANCE PORTFOLIO CONNECT */}
            {profile?.behanceUrl && (
              <section className="print:break-inside-avoid mt-10">
                <div className="flex items-center gap-4 mb-6">
                  <ExternalLink size={20} className={s.sectionHeaderIcon} />
                  <h2 className={s.sectionTitle}>Creative Works & Design Showcase</h2>
                  <div className={`flex-1 h-px ${activeTheme === "AIFuturistic" ? "bg-[#00ffcc]/20" : "bg-slate-100"}`} />
                </div>

                <div className={`p-6 border rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                  activeTheme === "AIFuturistic"
                    ? "bg-black border-white/5 hover:border-[#00ffcc]/35 text-gray-300"
                    : "bg-slate-500/[0.02] border-slate-200/80 hover:bg-slate-500/[0.04] text-slate-800"
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                    <div>
                      <h3 className={`text-lg font-bold mb-1.5 ${activeTheme === "AIFuturistic" ? "text-white" : "text-slate-900"}`}>
                        Behance Portfolio Connected
                      </h3>
                      <p className="text-xs text-gray-405 leading-relaxed max-w-xl">
                        View {user.fullName}'s dynamic creative project boards, custom UI/UX designs, digital media assets, and illustrations curated directly on Behance.
                      </p>
                    </div>
                    
                    <a
                      href={profile.behanceUrl}
                      target="_blank"
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shrink-0 hover:scale-105 ${
                        activeTheme === "AIFuturistic"
                          ? "bg-transparent text-[#00ffcc] border border-[#00ffcc]/45 hover:bg-[#00ffcc]/10"
                          : "bg-[#0057ff] hover:bg-[#004ce5] text-white shadow-md shadow-blue-500/15"
                      }`}
                    >
                      <ExternalLink size={14} /> Explore Behance Projects
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* EMPTY STATE */}
            {projects.length === 0 && researchPapers.length === 0 && hackathons.length === 0 && communityServices.length === 0 && creativeWorks.length === 0 && academicRecords.length === 0 && olympiads.length === 0 && startupCompetitions.length === 0 && ngoActivities.length === 0 && sportsAchievements.length === 0 && !profile?.gitHubUsername && !profile?.behanceUrl && (
              <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-3xl">
                <Briefcase size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold uppercase tracking-wider text-xs">No resume items uploaded yet</p>
              </div>
            )}

          </main>
        </div>

        {/* FOOTER */}
        <div className={s.footer}>
          <p className="text-[10px] font-mono tracking-widest text-inherit/50">
            MADRAS CHRISTIAN COLLEGE · STUDENT PLACEMENT DIRECTORY · OFFICIAL VERIFIED ARCHIVE · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}