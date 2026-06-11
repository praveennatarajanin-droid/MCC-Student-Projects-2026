"use client";

import { useEffect, useState } from "react";

import {
  User,
  Briefcase,
  Award,
  Code,
  LogOut,
  Plus,
  GitBranch,
  ExternalLink,
  Trophy,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Trash2,
  Bell,
  Sun,
  Moon,
  Video,
  Download,
  FileText,
  Heart,
  Palette,
  Eye,
  Edit,
} from "lucide-react";

import api from "@/services/api";

export default function DashboardPage() {

    const [user, setUser] = useState<any>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const getPreviewThemeStyles = () => {
    switch (selectedTheme) {
      case "Corporate":
        return {
          card: "bg-white border border-slate-200 p-6 rounded-xl text-slate-800 font-sans shadow-sm text-left",
          badge: "inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200",
          title: "text-slate-900 font-black uppercase text-sm tracking-wider pb-1 border-b border-slate-200",
          accentText: "text-blue-500 font-semibold text-xs",
          label: "text-[10px] uppercase font-bold text-slate-500",
          button: "bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-bold shadow-sm",
          borderAccent: "border-l-3 border-blue-500",
          levelBar: "bg-blue-600"
        };
      case "Startup":
        return {
          card: "bg-white border border-neutral-100 p-6 rounded-2xl text-neutral-800 font-sans shadow-md text-left",
          badge: "inline-block px-2.5 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-bold rounded-full border border-violet-100",
          title: "text-neutral-900 font-black uppercase text-sm tracking-wider pb-1 border-b-2 border-neutral-150",
          accentText: "text-pink-500 font-bold text-xs",
          label: "text-[10px] uppercase font-black tracking-widest text-violet-400",
          button: "bg-neutral-900 text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md",
          borderAccent: "border-l-3 border-violet-500",
          levelBar: "bg-pink-500"
        };
      case "Creative":
        return {
          card: "bg-indigo-950 border border-indigo-900 p-6 rounded-2xl text-indigo-100 font-sans shadow-lg text-left",
          badge: "inline-block px-2 py-0.5 bg-teal-50/10 text-teal-300 text-[10px] font-semibold rounded border border-teal-500/25",
          title: "text-teal-300 font-black uppercase text-sm tracking-wider pb-1 border-b border-indigo-800",
          accentText: "text-teal-400 font-semibold text-xs",
          label: "text-[10px] uppercase font-bold text-teal-300",
          button: "bg-teal-600 text-white text-xs px-4 py-1.5 rounded font-bold shadow-lg",
          borderAccent: "border-l-3 border-teal-400",
          levelBar: "bg-teal-400"
        };
      case "AIFuturistic":
        return {
          card: "bg-black border border-[#00ffcc]/25 p-6 rounded-xl text-gray-300 font-mono shadow-[0_0_15px_rgba(0,255,204,0.05)] text-left",
          badge: "inline-block px-2 py-0.5 bg-black text-[#00ffcc] text-[10px] font-bold rounded border border-[#00ffcc]/20",
          title: "text-[#00ffcc] font-bold uppercase text-sm tracking-widest pb-1 border-b border-[#00ffcc]/15",
          accentText: "text-cyan-400 font-bold text-xs",
          label: "text-[10px] uppercase font-bold text-slate-400",
          button: "bg-transparent text-[#00ffcc] border border-[#00ffcc]/50 text-xs px-3 py-1.5 rounded font-bold shadow-[0_0_10px_rgba(0,255,204,0.1)]",
          borderAccent: "border-l-3 border-[#00ffcc]",
          levelBar: "bg-[#00ffcc]"
        };
      case "LinkedIn":
        return {
          card: "bg-white border border-slate-200 p-6 rounded-xl text-slate-800 font-sans shadow-sm text-left",
          badge: "inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full border border-slate-200",
          title: "text-slate-900 font-bold text-sm pb-1 border-b border-slate-200",
          accentText: "text-[#0a66c2] font-semibold text-xs",
          label: "text-[10px] uppercase font-semibold text-slate-400",
          button: "bg-[#0a66c2] text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm",
          borderAccent: "border-l-3 border-[#0a66c2]",
          levelBar: "bg-[#0a66c2]"
        };
      case "LinkedIn":
        return {
          card: "bg-white border border-slate-200 p-6 rounded-xl text-slate-800 font-sans shadow-sm text-left",
          badge: "inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full border border-slate-200",
          title: "text-slate-900 font-bold text-sm pb-1 border-b border-slate-200",
          accentText: "text-[#0a66c2] font-semibold text-xs",
          label: "text-[10px] uppercase font-semibold text-slate-400",
          button: "bg-[#0a66c2] text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm",
          borderAccent: "border-l-4 border-[#0a66c2]",
          levelBar: "bg-[#0a66c2]"
        };
      case "Academic":
      default:
        return {
          card: "bg-white border border-amber-900/10 p-6 rounded-xl text-[#2c2c2c] font-serif shadow-sm text-left",
          badge: "inline-block px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded border border-amber-250",
          title: "text-[#18233c] font-black uppercase text-sm tracking-wider pb-1 border-b-2 border-amber-100",
          accentText: "text-amber-600 font-semibold text-xs",
          label: "text-[10px] uppercase font-bold text-[#18233c]/60",
          button: "bg-amber-600 text-white text-xs px-4 py-1.5 rounded font-semibold",
          borderAccent: "border-l-3 border-amber-600",
          levelBar: "bg-amber-600"
        };
    }
  };

  const [selectedTheme, setSelectedTheme] = useState("Academic");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [generatedSop, setGeneratedSop] = useState("");
  const [generatingSop, setGeneratingSop] = useState(false);
  const [sopTone, setSopTone] = useState("Academic");
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Theme and notifications
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [availableThemes, setAvailableThemes] = useState<any[]>([]);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("studentThemeMode", nextTheme);
    }
  };

  const defaultThemes = [
    { themeId: "Academic", displayName: "Academic", description: "Elegant serif typography, formal navy & gold" },
    { themeId: "Corporate", displayName: "Corporate", description: "Sleek professional grids, slate gray details" },
    { themeId: "Startup", displayName: "Startup", description: "Vibrant high-contrast, pink/orange gradients" },
    { themeId: "Creative", displayName: "Creative", description: "Artistic pastels, glassmorphic backdrops" },
    { themeId: "AIFuturistic", displayName: "AI Futuristic", description: "Cyber neon glows, tech-monospaced fonts" },
    { themeId: "LinkedIn", displayName: "LinkedIn Pro", description: "LinkedIn-style professional profile layout, blue & white" },
  ];

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/Notifications/student");
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch student notifications", error);
    }
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await api.post(`/Notifications/student/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const fetchThemesList = async () => {
    try {
      const response = await api.get("/Profiles/themes");
      if (response.data && response.data.length > 0) {
        setAvailableThemes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch active themes", error);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // ⚠️ Do NOT set Content-Type manually — axios must auto-generate it with the multipart boundary
    const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await api.post("/Upload", formData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data.url;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const url = await uploadFile(file);
      setter(url);
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to upload ${fieldName}: ${errMsg}`);
    } finally {
      setUploadingField(null);
    }
  };

  const handleGenerateSop = async () => {
    try {
      setGeneratingSop(true);
      const response = await api.post("/AI/generate-sop", {
        targetPath: targetCareer,
        tone: sopTone,
      });
      setGeneratedSop(response.data.sop);
    } catch (error: any) {
      alert(`Failed to generate SOP: ${error?.response?.data || error?.message || "Unknown error"}`);
    } finally {
      setGeneratingSop(false);
    }
  };

  const fetchAiAnalysis = async () => {
    try {
      setLoadingAi(true);
      const response = await api.get("/AI/career-analysis");
      setAiAnalysis(response.data);
    } catch (error) {
      console.error("Failed to fetch AI analysis", error);
    } finally {
      setLoadingAi(false);
    }
  };

  const downloadReadinessReport = () => {
    if (!aiAnalysis) {
      alert("AI Analysis is not loaded yet.");
      return;
    }
    const content = `MADRAS CHRISTIAN COLLEGE - PORTFOLIO READINESS REPORT
-----------------------------------------------------------
Student Name: ${user?.fullName || "MCC Student"}
Department: ${user?.department || ""}
CGPA: ${cgpa || "N/A"}
Target Career Path: ${targetCareer || "N/A"}

PROFILE COMPLETENESS
-----------------------------------------------------------
Completeness Score: ${aiAnalysis.profileCompleteness}%

SKILL GAP ANALYSIS
-----------------------------------------------------------
Target Career Requirements Match: ${aiAnalysis.skillMatchPercentage}%
Matched Skills: ${aiAnalysis.matchedSkills?.join(", ") || "None"}
Missing Skills: ${aiAnalysis.missingSkills?.join(", ") || "None"}

RECOMMENDED HIGHER EDUCATION (GLOBAL UNIVERSITIES)
-----------------------------------------------------------
${aiAnalysis.universities?.map((u: any, i: number) => `${i+1}. ${u.name} (${u.country}) - ${u.program}\n   Details: ${u.details}`).join("\n\n") || "None"}

RECOMMENDED HIGH-IMPACT INTERNSHIPS / PLACEMENTS
-----------------------------------------------------------
${aiAnalysis.internships?.map((it: any, i: number) => `${i+1}. ${it.company} - ${it.role} (${it.location})\n   Why you match: ${it.matchReason}`).join("\n\n") || "None"}

ELIGIBLE SCHOLARSHIPS & FUNDING FELLOWSHIPS
-----------------------------------------------------------
${aiAnalysis.scholarships?.map((s: any, i: number) => `${i+1}. ${s.title} (${s.amount})\n   Details: ${s.details}`).join("\n\n") || "None"}

Report Generated: ${new Date().toLocaleDateString()}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${user?.fullName?.replace(/\s+/g, "_") || "Student"}_MCC_Readiness_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================
  // PROFILE
  // =========================

  const [bio, setBio] = useState("");

  const [linkedInUrl, setLinkedInUrl] = useState("");

  const [gitHubUrl, setGitHubUrl] = useState("");

  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [behanceUrl, setBehanceUrl] = useState("");

  const [gitHubUsername, setGitHubUsername] = useState("");
  const [gitHubRepos, setGitHubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  const [targetCareer, setTargetCareer] = useState("");

  const [cgpa, setCgpa] = useState<number | string>("");

  const [isAlumni, setIsAlumni] = useState(false);
  const [graduationYear, setGraduationYear] = useState<number | string>("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");
  const [higherStudyUniversity, setHigherStudyUniversity] = useState("");
  const [higherStudyProgram, setHigherStudyProgram] = useState("");

  // =========================
  // SKILLS
  // =========================

  const [skills, setSkills] = useState<any[]>([]);

  const [skillName, setSkillName] = useState("");

  const [skillLevel, setSkillLevel] = useState("");

  // =========================
  // CERTIFICATIONS
  // =========================

  const [certifications, setCertifications] = useState<any[]>([]);

  const [certificationTitle, setCertificationTitle] = useState("");

  const [issuer, setIssuer] = useState("");

  const [certificateUrl, setCertificateUrl] = useState("");

  const [issueDate, setIssueDate] = useState("");

  // =========================
  // RESEARCH PAPERS
  // =========================

  const [researchPapers, setResearchPapers] = useState<any[]>([]);

  const [researchTitle, setResearchTitle] = useState("");

  const [abstract, setAbstract] = useState("");

  const [conference, setConference] = useState("");

  const [paperUrl, setPaperUrl] = useState("");

  const [publishedDate, setPublishedDate] = useState("");

  const [researchCategory, setResearchCategory] = useState("Journal Publication");

  // =========================
  // ACHIEVEMENTS
  // =========================

  const [achievements, setAchievements] = useState<any[]>([]);

  const [achievementTitle, setAchievementTitle] = useState("");

  const [achievementDescription, setAchievementDescription] = useState("");

  const [achievementUrl, setAchievementUrl] = useState("");

  const [achievementDate, setAchievementDate] = useState("");

  const [achievementCategory, setAchievementCategory] = useState("Academic Award");


  // =========================
  // HACKATHONS
  // =========================

  const [hackathons, setHackathons] = useState<any[]>([]);

  const [hackathonTitle, setHackathonTitle] = useState("");

  const [organizer, setOrganizer] = useState("");

  const [hackathonDescription, setHackathonDescription] = useState("");

  const [projectName, setProjectName] = useState("");

  const [hackathonUrl, setHackathonUrl] = useState("");

  const [eventDate, setEventDate] = useState("");

  // =========================
// RESUMES
// =========================

const [resumes, setResumes] = useState<any[]>([]);

const [resumeTitle, setResumeTitle] = useState("");

const [resumeUrl, setResumeUrl] = useState("");
  // =========================
  // PROJECTS
  // =========================

  const [projects, setProjects] = useState<any[]>([]);

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [technologies, setTechnologies] = useState("");

  const [githubUrl, setGithubUrl] = useState("");

  const [liveUrl, setLiveUrl] = useState("");

  const [projectCategory, setProjectCategory] = useState("Software Project");

  const [demoVideoUrl, setDemoVideoUrl] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [hackathonCertificateUrl, setHackathonCertificateUrl] = useState("");

  // =========================
  // COMMUNITY SERVICE
  // =========================
  const [communityServices, setCommunityServices] = useState<any[]>([]);
  const [communityTitle, setCommunityTitle] = useState("");
  const [communityOrg, setCommunityOrg] = useState("");
  const [communityDesc, setCommunityDesc] = useState("");
  const [hoursServed, setHoursServed] = useState<number | string>("");
  const [communityDate, setCommunityDate] = useState("");
  const [communityAttachment, setCommunityAttachment] = useState("");

  // =========================
  // CREATIVE WORKS
  // =========================
  const [creativeWorks, setCreativeWorks] = useState<any[]>([]);
  const [creativeTitle, setCreativeTitle] = useState("");
  const [creativeCategory, setCreativeCategory] = useState("Artwork");
  const [creativeDesc, setCreativeDesc] = useState("");
  const [creativeUrl, setCreativeUrl] = useState("");
  const [creativeMedia, setCreativeMedia] = useState("");
  const [creativeDate, setCreativeDate] = useState("");

  const [personalStory, setPersonalStory] = useState("");
  const [sop, setSop] = useState("");

  // Academic Records states
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [academicInstitution, setAcademicInstitution] = useState("");
  const [academicDegree, setAcademicDegree] = useState("");
  const [academicField, setAcademicField] = useState("");
  const [academicGrade, setAcademicGrade] = useState("");
  const [academicStartYear, setAcademicStartYear] = useState<number | string>("");
  const [academicEndYear, setAcademicEndYear] = useState<number | string>("");
  const [academicAttachment, setAcademicAttachment] = useState("");
  const [editingAcademicId, setEditingAcademicId] = useState<number | null>(null);

  // Olympiads states
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [olympiadName, setOlympiadName] = useState("");
  const [olympiadSubject, setOlympiadSubject] = useState("");
  const [olympiadRank, setOlympiadRank] = useState("");
  const [olympiadYear, setOlympiadYear] = useState<number | string>("");
  const [olympiadDesc, setOlympiadDesc] = useState("");
  const [olympiadCertificate, setOlympiadCertificate] = useState("");
  const [editingOlympiadId, setEditingOlympiadId] = useState<number | null>(null);

  // Startup Competitions states
  const [startupCompetitions, setStartupCompetitions] = useState<any[]>([]);
  const [startupCompName, setStartupCompName] = useState("");
  const [startupProjName, setStartupProjName] = useState("");
  const [startupRole, setStartupRole] = useState("");
  const [startupResult, setStartupResult] = useState("");
  const [startupDesc, setStartupDesc] = useState("");
  const [startupDate, setStartupDate] = useState("");
  const [startupPitchDeck, setStartupPitchDeck] = useState("");
  const [editingStartupId, setEditingStartupId] = useState<number | null>(null);

  // NGO Activities states
  const [ngoActivities, setNgoActivities] = useState<any[]>([]);
  const [ngoOrgName, setNgoOrgName] = useState("");
  const [ngoRole, setNgoRole] = useState("");
  const [ngoDesc, setNgoDesc] = useState("");
  const [ngoHours, setNgoHours] = useState<number | string>("");
  const [ngoStartDate, setNgoStartDate] = useState("");
  const [ngoEndDate, setNgoEndDate] = useState("");
  const [ngoCertificate, setNgoCertificate] = useState("");
  const [editingNgoId, setEditingNgoId] = useState<number | null>(null);

  // Sports Achievements states
  const [sportsAchievements, setSportsAchievements] = useState<any[]>([]);
  const [sportsName, setSportsName] = useState("");
  const [sportsLevel, setSportsLevel] = useState("");
  const [sportsAward, setSportsAward] = useState("");
  const [sportsDesc, setSportsDesc] = useState("");
  const [sportsDate, setSportsDate] = useState("");
  const [sportsCertificate, setSportsCertificate] = useState("");
  const [editingSportsId, setEditingSportsId] = useState<number | null>(null);

  // =========================
  // EDITING STATES
  // =========================
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [editingResearchId, setEditingResearchId] = useState<number | null>(null);
  const [editingAchId, setEditingAchId] = useState<number | null>(null);
  const [editingHackId, setEditingHackId] = useState<number | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingResumeId, setEditingResumeId] = useState<number | null>(null);
  const [editingCommunityId, setEditingCommunityId] = useState<number | null>(null);
  const [editingCreativeId, setEditingCreativeId] = useState<number | null>(null);

 // =========================
// LOAD ALL DATA
// =========================

const loadAllData = () => {

  fetchProfile();

  fetchSkills();

  fetchCertifications();

  fetchResearchPapers();

  fetchAchievements();

  fetchHackathons();

  fetchResumes();

  fetchProjects();

  fetchCommunityServices();

  fetchCreativeWorks();

  fetchAcademicRecords();

  fetchOlympiads();

  fetchStartupCompetitions();

  fetchNgoActivities();

  fetchSportsAchievements();

  fetchNotifications();

  fetchThemesList();

  fetchAiAnalysis();

};

  // =========================
  // FETCH DATA
  // =========================

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
      console.error("Failed to decode token", e);
      return null;
    }
  };

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      if (!currentUser.id && storedToken) {
        const idFromToken = getUserIdFromToken(storedToken);
        if (idFromToken) {
          currentUser.id = idFromToken;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      }
      setUser(currentUser);
    }

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("studentThemeMode") as "light" | "dark";
      if (savedTheme) {
        setThemeMode(savedTheme);
      }
    }

    loadAllData();

  }, []);

  useEffect(() => {
    if (!gitHubUsername) {
      setGitHubRepos([]);
      return;
    }
    const fetchRepos = async () => {
      setLoadingRepos(true);
      try {
        const res = await fetch(`https://api.github.com/users/${gitHubUsername}/repos?sort=updated&per_page=4`);
        if (res.ok) {
          const data = await res.json();
          setGitHubRepos(data);
        } else {
          setGitHubRepos([]);
        }
      } catch (err) {
        console.error("Failed to fetch GitHub repos", err);
        setGitHubRepos([]);
      } finally {
        setLoadingRepos(false);
      }
    };
    const timer = setTimeout(fetchRepos, 800);
    return () => clearTimeout(timer);
  }, [gitHubUsername]);

  // =========================
  // EDIT TRIGGERS & CANCELLATIONS
  // =========================
  const startEditSkill = (item: any) => {
    setEditingSkillId(item.id);
    setSkillName(item.name);
    setSkillLevel(item.level);
  };
  const cancelEditSkill = () => {
    setEditingSkillId(null);
    setSkillName("");
    setSkillLevel("");
  };

  const startEditCertification = (item: any) => {
    setEditingCertId(item.id);
    setCertificationTitle(item.title);
    setIssuer(item.issuer);
    setCertificateUrl(item.certificateUrl);
    setIssueDate(item.issueDate ? item.issueDate.split("T")[0] : "");
  };
  const cancelEditCertification = () => {
    setEditingCertId(null);
    setCertificationTitle("");
    setIssuer("");
    setCertificateUrl("");
    setIssueDate("");
  };

  const startEditResearchPaper = (item: any) => {
    setEditingResearchId(item.id);
    setResearchTitle(item.title);
    setAbstract(item.abstract);
    setConference(item.conference);
    setPaperUrl(item.paperUrl);
    setPublishedDate(item.publishedDate ? item.publishedDate.split("T")[0] : "");
    setResearchCategory(item.category || "Journal Publication");
  };
  const cancelEditResearchPaper = () => {
    setEditingResearchId(null);
    setResearchTitle("");
    setAbstract("");
    setConference("");
    setPaperUrl("");
    setPublishedDate("");
    setResearchCategory("Journal Publication");
  };

  const startEditAchievement = (item: any) => {
    setEditingAchId(item.id);
    setAchievementTitle(item.title);
    setAchievementDescription(item.description);
    setAchievementUrl(item.achievementUrl);
    setAchievementDate(item.achievementDate ? item.achievementDate.split("T")[0] : "");
    setAchievementCategory(item.category || "Academic Award");
  };
  const cancelEditAchievement = () => {
    setEditingAchId(null);
    setAchievementTitle("");
    setAchievementDescription("");
    setAchievementUrl("");
    setAchievementDate("");
    setAchievementCategory("Academic Award");
  };

  const startEditHackathon = (item: any) => {
    setEditingHackId(item.id);
    setHackathonTitle(item.title);
    setOrganizer(item.organizer);
    setHackathonDescription(item.description);
    setProjectName(item.projectName);
    setHackathonUrl(item.hackathonUrl);
    setHackathonCertificateUrl(item.certificateUrl || "");
    setEventDate(item.eventDate ? item.eventDate.split("T")[0] : "");
  };
  const cancelEditHackathon = () => {
    setEditingHackId(null);
    setHackathonTitle("");
    setOrganizer("");
    setHackathonDescription("");
    setProjectName("");
    setHackathonUrl("");
    setHackathonCertificateUrl("");
    setEventDate("");
  };

  const startEditProject = (item: any) => {
    setEditingProjectId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setTechnologies(item.technologies);
    setGithubUrl(item.githubUrl);
    setLiveUrl(item.liveUrl);
    setProjectCategory(item.category || "Software Project");
    setDemoVideoUrl(item.demoVideoUrl || "");
    setImageUrl(item.imageUrl || "");
  };
  const cancelEditProject = () => {
    setEditingProjectId(null);
    setTitle("");
    setDescription("");
    setTechnologies("");
    setGithubUrl("");
    setLiveUrl("");
    setProjectCategory("Software Project");
    setDemoVideoUrl("");
    setImageUrl("");
  };

  const startEditResume = (item: any) => {
    setEditingResumeId(item.id);
    setResumeTitle(item.resumeTitle);
    setResumeUrl(item.resumeUrl);
  };
  const cancelEditResume = () => {
    setEditingResumeId(null);
    setResumeTitle("");
    setResumeUrl("");
  };

  const startEditCommunityService = (item: any) => {
    setEditingCommunityId(item.id);
    setCommunityTitle(item.title);
    setCommunityOrg(item.organization);
    setCommunityDesc(item.description);
    setHoursServed(item.hoursServed);
    setCommunityDate(item.date ? item.date.split("T")[0] : "");
    setCommunityAttachment(item.attachmentUrl || "");
  };
  const cancelEditCommunityService = () => {
    setEditingCommunityId(null);
    setCommunityTitle("");
    setCommunityOrg("");
    setCommunityDesc("");
    setHoursServed("");
    setCommunityDate("");
    setCommunityAttachment("");
  };

  const startEditCreativeWork = (item: any) => {
    setEditingCreativeId(item.id);
    setCreativeTitle(item.title);
    setCreativeCategory(item.category || "Artwork");
    setCreativeDesc(item.description);
    setCreativeUrl(item.workUrl || "");
    setCreativeMedia(item.mediaUrl || "");
    setCreativeDate(item.date ? item.date.split("T")[0] : "");
  };
  const cancelEditCreativeWork = () => {
    setEditingCreativeId(null);
    setCreativeTitle("");
    setCreativeCategory("Artwork");
    setCreativeDesc("");
    setCreativeUrl("");
    setCreativeMedia("");
    setCreativeDate("");
  };

  // =========================
  // HACKATHONS API
  // =========================

  const fetchHackathons = async () => {
    try {
      const response = await api.get("/Hackathons");
      setHackathons(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addHackathon = async () => {
    try {
      const payload = {
        title: hackathonTitle,
        organizer,
        description: hackathonDescription,
        projectName,
        hackathonUrl,
        certificateUrl: hackathonCertificateUrl,
        eventDate,
      };

      if (editingHackId) {
        await api.put(`/Hackathons/${editingHackId}`, payload);
        alert("Hackathon Updated Successfully!");
      } else {
        await api.post("/Hackathons", payload);
        alert("Hackathon Added Successfully!");
      }

      cancelEditHackathon();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Hackathon: ${errMsg}`);
    }
  };

  // =========================
// RESUMES API
// =========================

const fetchResumes = async () => {
  try {
    const response = await api.get("/Resumes");
    setResumes(response.data);
  } catch (error) {
    console.error(error);
  }
};

const addResume = async () => {
  try {
    const payload = {
      resumeTitle,
      resumeUrl,
    };

    if (editingResumeId) {
      await api.put(`/Resumes/${editingResumeId}`, payload);
      alert("Resume Updated Successfully!");
    } else {
      await api.post("/Resumes", payload);
      alert("Resume Uploaded Successfully!");
    }

    cancelEditResume();
    loadAllData();
  } catch (error: any) {
    console.error(error);
    const errMsg = error?.response?.data || error?.message || "Unknown error";
    alert(`Failed to save Resume: ${errMsg}`);
  }
};

  // =========================
  // PROFILE API
  // =========================

  const fetchProfile = async () => {
    try {
      const response = await api.get("/Profiles");

      if (response.data) {
        setBio(response.data.bio || "");
        setLinkedInUrl(response.data.linkedInUrl || "");
        setGitHubUrl(response.data.gitHubUrl || "");
        setProfileImageUrl(response.data.profileImageUrl || "");
        setSelectedTheme(response.data.selectedTheme || "Academic");
        setBehanceUrl(response.data.behanceUrl || "");
        setGitHubUsername(response.data.gitHubUsername || "");
        setTargetCareer(response.data.targetCareer || "");
        setCgpa(response.data.cgpa || "");
        setPersonalStory(response.data.personalStory || "");
        setSop(response.data.sop || "");
        setIsAlumni(response.data.isAlumni || false);
        setGraduationYear(response.data.graduationYear || "");
        setCurrentCompany(response.data.currentCompany || "");
        setCurrentJobTitle(response.data.currentJobTitle || "");
        setHigherStudyUniversity(response.data.higherStudyUniversity || "");
        setHigherStudyProgram(response.data.higherStudyProgram || "");

        // Backfill user ID into localStorage if it is missing from a previous session
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (!parsed.id && response.data.userId) {
            parsed.id = response.data.userId;
            localStorage.setItem("user", JSON.stringify(parsed));
            setUser(parsed);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveProfile = async () => {
    try {
      await api.post("/Profiles", {
        bio,
        linkedInUrl,
        gitHubUrl,
        profileImageUrl,
        selectedTheme,
        behanceUrl,
        gitHubUsername,
        targetCareer,
        cgpa: Number(cgpa) || 0.0,
        personalStory,
        sop,
        isAlumni,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        currentCompany,
        currentJobTitle,
        higherStudyUniversity,
        higherStudyProgram,
      });

      alert("Profile Saved Successfully!");
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Profile: ${errMsg}`);
    }
  };

  // =========================
  // SKILLS API
  // =========================

  const fetchSkills = async () => {
    try {
      const response = await api.get("/Skills");
      setSkills(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addSkill = async () => {
    try {
      const payload = {
        name: skillName,
        level: skillLevel,
      };

      if (editingSkillId) {
        await api.put(`/Skills/${editingSkillId}`, payload);
        alert("Skill Updated Successfully!");
      } else {
        await api.post("/Skills", payload);
        alert("Skill Added Successfully!");
      }

      cancelEditSkill();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Skill: ${errMsg}`);
    }
  };

  // =========================
  // CERTIFICATIONS API
  // =========================

  const fetchCertifications = async () => {
    try {
      const response = await api.get("/Certifications");
      setCertifications(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addCertification = async () => {
    try {
      const payload = {
        title: certificationTitle,
        issuer,
        certificateUrl,
        issueDate,
      };

      if (editingCertId) {
        await api.put(`/Certifications/${editingCertId}`, payload);
        alert("Certification Updated Successfully!");
      } else {
        await api.post("/Certifications", payload);
        alert("Certification Added Successfully!");
      }

      cancelEditCertification();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Certification: ${errMsg}`);
    }
  };

  // =========================
  // RESEARCH PAPERS API
  // =========================

  const fetchResearchPapers = async () => {
    try {
      const response = await api.get("/ResearchPapers");
      setResearchPapers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addResearchPaper = async () => {
    try {
      const payload = {
        title: researchTitle,
        abstract,
        conference,
        paperUrl,
        publishedDate,
        category: researchCategory,
      };

      if (editingResearchId) {
        await api.put(`/ResearchPapers/${editingResearchId}`, payload);
        alert("Research Paper Updated Successfully!");
      } else {
        await api.post("/ResearchPapers", payload);
        alert("Research Paper Added Successfully!");
      }

      cancelEditResearchPaper();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Research Paper: ${errMsg}`);
    }
  };

  // =========================
  // ACHIEVEMENTS API
  // =========================

  const fetchAchievements = async () => {
    try {
      const response = await api.get("/Achievements");
      setAchievements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addAchievement = async () => {
    try {
      const payload = {
        title: achievementTitle,
        description: achievementDescription,
        achievementUrl,
        achievementDate,
        category: achievementCategory,
      };

      if (editingAchId) {
        await api.put(`/Achievements/${editingAchId}`, payload);
        alert("Achievement Updated Successfully!");
      } else {
        await api.post("/Achievements", payload);
        alert("Achievement Added Successfully!");
      }

      cancelEditAchievement();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Achievement: ${errMsg}`);
    }
  };

  // =========================
  // COMMUNITY SERVICE API
  // =========================

  const fetchCommunityServices = async () => {
    try {
      const response = await api.get("/CommunityServices");
      setCommunityServices(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addCommunityService = async () => {
    try {
      const payload = {
        title: communityTitle,
        organization: communityOrg,
        description: communityDesc,
        hoursServed: Number(hoursServed) || 0.0,
        date: communityDate,
        attachmentUrl: communityAttachment,
      };

      if (editingCommunityId) {
        await api.put(`/CommunityServices/${editingCommunityId}`, payload);
        alert("Community Service Record Updated!");
      } else {
        await api.post("/CommunityServices", payload);
        alert("Community Service Record Added!");
      }

      cancelEditCommunityService();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Community Service: ${errMsg}`);
    }
  };

  // =========================
  // CREATIVE WORKS API
  // =========================

  const fetchCreativeWorks = async () => {
    try {
      const response = await api.get("/CreativeWorks");
      setCreativeWorks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addCreativeWork = async () => {
    try {
      const payload = {
        title: creativeTitle,
        category: creativeCategory,
        description: creativeDesc,
        workUrl: creativeUrl,
        mediaUrl: creativeMedia,
        date: creativeDate,
      };

      if (editingCreativeId) {
        await api.put(`/CreativeWorks/${editingCreativeId}`, payload);
        alert("Creative Work Updated!");
      } else {
        await api.post("/CreativeWorks", payload);
        alert("Creative Work Added!");
      }

      cancelEditCreativeWork();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Creative Work: ${errMsg}`);
    }
  };

  // =========================
  // ACADEMIC RECORDS API
  // =========================
  const fetchAcademicRecords = async () => {
    try {
      const response = await api.get("/AcademicRecords");
      setAcademicRecords(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addAcademicRecord = async () => {
    try {
      const payload = {
        institution: academicInstitution,
        degree: academicDegree,
        fieldOfStudy: academicField,
        grade: academicGrade,
        startYear: Number(academicStartYear) || 0,
        endYear: Number(academicEndYear) || 0,
        attachmentUrl: academicAttachment,
      };

      if (editingAcademicId) {
        await api.put(`/AcademicRecords/${editingAcademicId}`, payload);
        alert("Academic Record Updated!");
      } else {
        await api.post("/AcademicRecords", payload);
        alert("Academic Record Added!");
      }

      cancelEditAcademicRecord();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save Academic Record: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteAcademicRecord = async (id: number) => {
    if (!confirm("Delete this academic record?")) return;
    try {
      await api.delete(`/AcademicRecords/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete academic record: ${error?.response?.data || error?.message}`);
    }
  };

  const startEditAcademicRecord = (item: any) => {
    setEditingAcademicId(item.id);
    setAcademicInstitution(item.institution);
    setAcademicDegree(item.degree);
    setAcademicField(item.fieldOfStudy);
    setAcademicGrade(item.grade);
    setAcademicStartYear(item.startYear);
    setAcademicEndYear(item.endYear);
    setAcademicAttachment(item.attachmentUrl || "");
  };

  const cancelEditAcademicRecord = () => {
    setEditingAcademicId(null);
    setAcademicInstitution("");
    setAcademicDegree("");
    setAcademicField("");
    setAcademicGrade("");
    setAcademicStartYear("");
    setAcademicEndYear("");
    setAcademicAttachment("");
  };

  // =========================
  // OLYMPIADS API
  // =========================
  const fetchOlympiads = async () => {
    try {
      const response = await api.get("/Olympiads");
      setOlympiads(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addOlympiad = async () => {
    try {
      const payload = {
        name: olympiadName,
        subject: olympiadSubject,
        rank: olympiadRank,
        year: Number(olympiadYear) || 0,
        description: olympiadDesc,
        certificateUrl: olympiadCertificate,
      };

      if (editingOlympiadId) {
        await api.put(`/Olympiads/${editingOlympiadId}`, payload);
        alert("Olympiad Achievement Updated!");
      } else {
        await api.post("/Olympiads", payload);
        alert("Olympiad Achievement Added!");
      }

      cancelEditOlympiad();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save Olympiad: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteOlympiad = async (id: number) => {
    if (!confirm("Delete this Olympiad achievement?")) return;
    try {
      await api.delete(`/Olympiads/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete Olympiad: ${error?.response?.data || error?.message}`);
    }
  };

  const startEditOlympiad = (item: any) => {
    setEditingOlympiadId(item.id);
    setOlympiadName(item.name);
    setOlympiadSubject(item.subject);
    setOlympiadRank(item.rank);
    setOlympiadYear(item.year);
    setOlympiadDesc(item.description);
    setOlympiadCertificate(item.certificateUrl || "");
  };

  const cancelEditOlympiad = () => {
    setEditingOlympiadId(null);
    setOlympiadName("");
    setOlympiadSubject("");
    setOlympiadRank("");
    setOlympiadYear("");
    setOlympiadDesc("");
    setOlympiadCertificate("");
  };

  // =========================
  // STARTUP COMPETITIONS API
  // =========================
  const fetchStartupCompetitions = async () => {
    try {
      const response = await api.get("/StartupCompetitions");
      setStartupCompetitions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addStartupCompetition = async () => {
    try {
      const payload = {
        competitionName: startupCompName,
        projectName: startupProjName,
        role: startupRole,
        result: startupResult,
        description: startupDesc,
        date: startupDate,
        pitchDeckUrl: startupPitchDeck,
      };

      if (editingStartupId) {
        await api.put(`/StartupCompetitions/${editingStartupId}`, payload);
        alert("Startup Competition Updated!");
      } else {
        await api.post("/StartupCompetitions", payload);
        alert("Startup Competition Added!");
      }

      cancelEditStartupCompetition();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save Startup Competition: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteStartupCompetition = async (id: number) => {
    if (!confirm("Delete this startup competition record?")) return;
    try {
      await api.delete(`/StartupCompetitions/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete startup competition: ${error?.response?.data || error?.message}`);
    }
  };

  const startEditStartupCompetition = (item: any) => {
    setEditingStartupId(item.id);
    setStartupCompName(item.competitionName);
    setStartupProjName(item.projectName);
    setStartupRole(item.role);
    setStartupResult(item.result);
    setStartupDesc(item.description);
    setStartupDate(item.date ? item.date.split("T")[0] : "");
    setStartupPitchDeck(item.pitchDeckUrl || "");
  };

  const cancelEditStartupCompetition = () => {
    setEditingStartupId(null);
    setStartupCompName("");
    setStartupProjName("");
    setStartupRole("");
    setStartupResult("");
    setStartupDesc("");
    setStartupDate("");
    setStartupPitchDeck("");
  };

  // =========================
  // NGO ACTIVITIES API
  // =========================
  const fetchNgoActivities = async () => {
    try {
      const response = await api.get("/NgoActivities");
      setNgoActivities(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addNgoActivity = async () => {
    try {
      const payload = {
        organizationName: ngoOrgName,
        role: ngoRole,
        description: ngoDesc,
        hoursContributed: Number(ngoHours) || 0.0,
        startDate: ngoStartDate,
        endDate: ngoEndDate || null,
        certificateUrl: ngoCertificate,
      };

      if (editingNgoId) {
        await api.put(`/NgoActivities/${editingNgoId}`, payload);
        alert("NGO Activity Updated!");
      } else {
        await api.post("/NgoActivities", payload);
        alert("NGO Activity Added!");
      }

      cancelEditNgoActivity();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save NGO Activity: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteNgoActivity = async (id: number) => {
    if (!confirm("Delete this NGO activity record?")) return;
    try {
      await api.delete(`/NgoActivities/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete NGO activity: ${error?.response?.data || error?.message}`);
    }
  };

  const startEditNgoActivity = (item: any) => {
    setEditingNgoId(item.id);
    setNgoOrgName(item.organizationName);
    setNgoRole(item.role);
    setNgoDesc(item.description);
    setNgoHours(item.hoursContributed);
    setNgoStartDate(item.startDate ? item.startDate.split("T")[0] : "");
    setNgoEndDate(item.endDate ? item.endDate.split("T")[0] : "");
    setNgoCertificate(item.certificateUrl || "");
  };

  const cancelEditNgoActivity = () => {
    setEditingNgoId(null);
    setNgoOrgName("");
    setNgoRole("");
    setNgoDesc("");
    setNgoHours("");
    setNgoStartDate("");
    setNgoEndDate("");
    setNgoCertificate("");
  };

  // =========================
  // SPORTS ACHIEVEMENTS API
  // =========================
  const fetchSportsAchievements = async () => {
    try {
      const response = await api.get("/SportsAchievements");
      setSportsAchievements(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addSportsAchievement = async () => {
    try {
      const payload = {
        sportName: sportsName,
        level: sportsLevel,
        achievement: sportsAward,
        description: sportsDesc,
        date: sportsDate,
        certificateUrl: sportsCertificate,
      };

      if (editingSportsId) {
        await api.put(`/SportsAchievements/${editingSportsId}`, payload);
        alert("Sports Achievement Updated!");
      } else {
        await api.post("/SportsAchievements", payload);
        alert("Sports Achievement Added!");
      }

      cancelEditSportsAchievement();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      alert(`Failed to save Sports Achievement: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteSportsAchievement = async (id: number) => {
    if (!confirm("Delete this sports achievement?")) return;
    try {
      await api.delete(`/SportsAchievements/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete sports achievement: ${error?.response?.data || error?.message}`);
    }
  };

  const startEditSportsAchievement = (item: any) => {
    setEditingSportsId(item.id);
    setSportsName(item.sportName);
    setSportsLevel(item.level);
    setSportsAward(item.achievement);
    setSportsDesc(item.description);
    setSportsDate(item.date ? item.date.split("T")[0] : "");
    setSportsCertificate(item.certificateUrl || "");
  };

  const cancelEditSportsAchievement = () => {
    setEditingSportsId(null);
    setSportsName("");
    setSportsLevel("");
    setSportsAward("");
    setSportsDesc("");
    setSportsDate("");
    setSportsCertificate("");
  };

  // =========================
  // DELETE FUNCTIONS
  // =========================

  const deleteSkill = async (id: number) => {
    if (!confirm("Delete this skill?")) return;
    try {
      await api.delete(`/Skills/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete skill: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteCertification = async (id: number) => {
    if (!confirm("Delete this certification?")) return;
    try {
      await api.delete(`/Certifications/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete certification: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteResearchPaper = async (id: number) => {
    if (!confirm("Delete this research paper?")) return;
    try {
      await api.delete(`/ResearchPapers/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete research paper: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteAchievement = async (id: number) => {
    if (!confirm("Delete this achievement?")) return;
    try {
      await api.delete(`/Achievements/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete achievement: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteHackathon = async (id: number) => {
    if (!confirm("Delete this hackathon?")) return;
    try {
      await api.delete(`/Hackathons/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete hackathon: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/Projects/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete project: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteResume = async (id: number) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await api.delete(`/Resumes/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete resume: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteCommunityService = async (id: number) => {
    if (!confirm("Delete this community service record?")) return;
    try {
      await api.delete(`/CommunityServices/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete community service: ${error?.response?.data || error?.message}`);
    }
  };

  const deleteCreativeWork = async (id: number) => {
    if (!confirm("Delete this creative work record?")) return;
    try {
      await api.delete(`/CreativeWorks/${id}`);
      loadAllData();
    } catch (error: any) {
      alert(`Failed to delete creative work: ${error?.response?.data || error?.message}`);
    }
  };

  // =========================
  // PROJECTS API
  // =========================

  const fetchProjects = async () => {
    try {
      const response = await api.get("/Projects");
      setProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addProject = async () => {
    try {
      const payload = {
        title,
        description,
        technologies,
        githubUrl,
        liveUrl,
        category: projectCategory,
        demoVideoUrl,
        imageUrl,
      };

      if (editingProjectId) {
        await api.put(`/Projects/${editingProjectId}`, payload);
        alert("Project Updated Successfully!");
      } else {
        await api.post("/Projects", payload);
        alert("Project Added Successfully!");
      }

      cancelEditProject();
      loadAllData();
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.response?.data || error?.message || "Unknown error";
      alert(`Failed to save Project: ${errMsg}`);
    }
  };

  return (

    <div className={`min-h-screen flex transition-colors duration-300 ${
      themeMode === "dark" ? "bg-black text-white" : "bg-[#f8fafc] text-[#0f172a]"
    }`}>
{/* SIDEBAR */}

<div className={`w-72 border-r backdrop-blur-xl sticky top-0 h-screen flex flex-col transition-colors duration-300 ${
  themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
}`}>

  {/* TOP */}

  <div className="p-6 border-b border-white/10">

    <h1 className="text-3xl font-bold">
      MCC Portfolio
    </h1>

  </div>

  {/* SCROLLABLE MENU */}

  <div className="flex-1 overflow-y-auto p-6 space-y-4">

    {/* PROFILE */}

    <button
      onClick={() =>
        document.getElementById("profile-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
      }`}
    >
      <User size={22} />
      Profile
    </button>

    {/* SKILLS */}

    <button
      onClick={() =>
        document.getElementById("skills-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Code size={22} />
      Skills
    </button>

    {/* CERTIFICATIONS */}

    <button
      onClick={() =>
        document.getElementById("certifications-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Award size={22} />
      Certifications
    </button>

    {/* RESEARCH */}

    <button
      onClick={() =>
        document.getElementById("research-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Briefcase size={22} />
      Research
    </button>

    {/* ACHIEVEMENTS */}

    <button
      onClick={() =>
        document.getElementById("achievements-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Trophy size={22} />
      Achievements
    </button>

    {/* HACKATHONS */}

    <button
      onClick={() =>
        document.getElementById("hackathons-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <GitBranch size={22} />
      Hackathons
    </button>

    {/* PROJECTS */}

    <button
      onClick={() =>
        document.getElementById("projects-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <GitBranch size={22} />
      Projects
    </button>

    {/* RESUME */}

    <button
      onClick={() =>
        document.getElementById("resume-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Briefcase size={22} />
      Resume
    </button>

    {/* COMMUNITY SERVICE */}

    <button
      onClick={() =>
        document.getElementById("community-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Heart size={22} />
      Community Service
    </button>

    {/* CREATIVE WORKS */}

    <button
      onClick={() =>
        document.getElementById("creative-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Palette size={22} />
      Creative Works
    </button>

    {/* ACADEMIC RECORDS */}
    <button
      onClick={() =>
        document.getElementById("academic-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Award size={22} />
      Academic Records
    </button>

    {/* OLYMPIADS */}
    <button
      onClick={() =>
        document.getElementById("olympiads-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Trophy size={22} />
      Olympiads
    </button>

    {/* STARTUP COMPETITIONS */}
    <button
      onClick={() =>
        document.getElementById("startup-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <GitBranch size={22} />
      Startup Pitching
    </button>

    {/* NGO ACTIVITIES */}
    <button
      onClick={() =>
        document.getElementById("ngo-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Heart size={22} />
      NGO Activities
    </button>

    {/* SPORTS ACHIEVEMENTS */}
    <button
      onClick={() =>
        document.getElementById("sports-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Trophy size={22} />
      Sports Corner
    </button>

    {/* AI ADVISOR */}

    <button
      onClick={() =>
        document.getElementById("ai-section")?.scrollIntoView({
          behavior: "smooth",
        })
      }
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl font-bold ${
        themeMode === "dark" ? "bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 border border-purple-500/20" : "bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
      }`}
    >
      <Sparkles size={22} className="text-purple-400" />
      AI Career Advisor
    </button>

    {/* SEARCH */}

    <button
      onClick={() => window.location.href = "/search"}
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <User size={22} />
      Search Students
    </button>

    {/* LEADERBOARD */}

    <button
      onClick={() => window.location.href = "/leaderboard"}
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Trophy size={22} />
      Leaderboard
    </button>

    {/* MY PORTFOLIO */}

    <button
      onClick={() => {
        // Primary: use the clean username slug URL if we have fullName
        if (user?.fullName) {
          const slug = user.fullName.replace(/\s+/g, "").replace(/-+/g, "").toLowerCase();
          window.open(`/student/${slug}`, "_blank");
          return;
        }
        // Fallback: use numeric ID from localStorage or JWT
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        if (storedUser) {
          const u = JSON.parse(storedUser);
          let userId = u.id;
          if (!userId && storedToken) {
            userId = getUserIdFromToken(storedToken);
          }
          if (userId) {
            window.open(`/portfolio/${userId}`, "_blank");
          } else {
            alert("Could not determine your user ID. Please log out and log back in.");
          }
        } else {
          alert("Please log in to view your portfolio.");
        }
      }}
      className={`w-full flex items-center gap-4 transition p-4 rounded-2xl ${
        themeMode === "dark" ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
      }`}
    >
      <Briefcase size={22} />
      My Portfolio
    </button>

    

  </div>

  {/* LOGOUT */}

  <div className="p-6 border-t border-white/10">

    <button
      onClick={() => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href = "/login";

      }}
      className="w-full flex items-center gap-3 text-red-400 hover:bg-red-500/10 p-4 rounded-2xl transition"
    >
      <LogOut size={20} />
      Logout
    </button>

  </div>

</div>

      {/* MAIN CONTENT */}

      <div className="flex-1 p-10 overflow-y-auto">

        {/* HEADER */}

        <div className="mb-10 flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-bold mb-3">
              Welcome, {user?.fullName}
            </h1>

            <p className="text-gray-400 text-lg">
              Build your professional student portfolio
            </p>

          </div>

          <div className="flex items-center gap-4 relative">
            {/* Theme Mode Toggle */}
            <button
              onClick={toggleThemeMode}
              className={`p-3 border rounded-2xl transition ${
                themeMode === "dark"
                  ? "bg-white/5 border-white/10 hover:bg-white/10 text-amber-400"
                  : "bg-white border-slate-200 hover:bg-slate-100 text-indigo-600 shadow-sm"
              }`}
              title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 border rounded-2xl transition relative ${
                  themeMode === "dark"
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
                }`}
                title="View campus announcements"
              >
                <Bell size={20} />
                {notifications.filter((n: any) => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-black animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-80 border rounded-2xl p-4 shadow-2xl z-50 space-y-3 ${
                  themeMode === "dark" ? "bg-[#0b0b0f] border-white/10" : "bg-white border-slate-200"
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${
                    themeMode === "dark" ? "border-white/5" : "border-slate-100"
                  }`}>
                    <h4 className={`font-bold text-xs ${themeMode === "dark" ? "text-white" : "text-slate-800"}`}>Campus Alerts</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-gray-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.isRead) {
                              markNotificationAsRead(notif.id);
                            }
                          }}
                          className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                            notif.isRead
                              ? themeMode === "dark"
                                ? "bg-white/[0.01] border-white/5"
                                : "bg-slate-50 border-slate-150"
                              : "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className={`font-bold text-[11px] leading-tight ${themeMode === "dark" ? "text-white" : "text-slate-800"}`}>{notif.title}</span>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 leading-relaxed mb-1.5">{notif.message}</p>
                          <span className="text-[8px] font-mono text-gray-500 block">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-xs">
                        No notifications or alerts.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {profileImageUrl && (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-500"
              />
            )}
          </div>

        </div>

        {/* PROFILE SECTION */}

       <div
  id="profile-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>

          <h2 className="text-3xl font-bold mb-8">
            Profile Settings
          </h2>



          <div className="grid md:grid-cols-2 gap-5 mb-5">

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Profile Photo (JPG / PNG)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setProfileImageUrl, "Profile Image")}
                  className="hidden"
                  id="profile-image-file-input"
                />
                <label
                  htmlFor="profile-image-file-input"
                  className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                >
                  {uploadingField === "Profile Image" ? "Uploading..." : "Upload Photo"}
                </label>
                {profileImageUrl && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle size={16} /> Uploaded
                  </span>
                )}
              </div>
            </div>

            <input
              type="text"
              placeholder="LinkedIn URL"
              value={linkedInUrl}
              onChange={(e) => setLinkedInUrl(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none flex-1 transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="GitHub Profile URL"
              value={gitHubUrl}
              onChange={(e) => setGitHubUrl(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none flex-1 transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="GitHub Username (for Repository Showcase)"
              value={gitHubUsername}
              onChange={(e) => setGitHubUsername(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none flex-1 transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Behance Profile URL"
              value={behanceUrl}
              onChange={(e) => setBehanceUrl(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none flex-1 transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <select
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none flex-1 transition-all duration-300 ${
                themeMode === "dark" ? "bg-[#0b0b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="" disabled>Select Target Career Path</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="AI Researcher / ML Engineer">AI Researcher / ML Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Cloud Engineer / DevOps">Cloud Engineer / DevOps</option>
            </select>

            <input
              type="number"
              step="0.01"
              max="10.0"
              min="0.0"
              placeholder="Academic Marks / CGPA (e.g. 9.15)"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none flex-1 transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

          </div>

          <textarea
            placeholder="Write your bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none mt-5 min-h-[120px] transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-450" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <textarea
            placeholder="Write your personal story / professional journey..."
            value={personalStory}
            onChange={(e) => setPersonalStory(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none mt-5 min-h-[120px] transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-450" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <textarea
            placeholder="Write your Statement of Purpose (SOP)..."
            value={sop}
            onChange={(e) => setSop(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none mt-5 min-h-[120px] transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-450" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          {/* ALUMNI TRACKING */}
          <div className={`mt-8 border border-dashed rounded-3xl p-6 transition-colors duration-300 ${
            themeMode === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  🎓 Alumni Status & Career Tracking
                </h3>
                <p className={`text-xs ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>
                  Help Madras Christian College track your career progress and university placements.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAlumni}
                  onChange={(e) => setIsAlumni(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className={`ml-3 text-sm font-semibold ${themeMode === "dark" ? "text-gray-300" : "text-slate-700"}`}>
                  I am an MCC Alumni
                </span>
              </label>
            </div>

            {isAlumni && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 block mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className={`w-full border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 block mb-2">
                    Current Company (Employment)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zoho Corporation"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    className={`w-full border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 block mb-2">
                    Current Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={currentJobTitle}
                    onChange={(e) => setCurrentJobTitle(e.target.value)}
                    className={`w-full border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 block mb-2">
                    Higher Study University (if applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Carnegie Mellon University"
                    value={higherStudyUniversity}
                    onChange={(e) => setHigherStudyUniversity(e.target.value)}
                    className={`w-full border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-gray-400 block mb-2">
                    Higher Study Program / Degree
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MS in Computer Science"
                    value={higherStudyProgram}
                    onChange={(e) => setHigherStudyProgram(e.target.value)}
                    className={`w-full border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC THEME ENGINE */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
              <Sparkles size={20} /> Choose Portfolio Theme
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(availableThemes.length > 0 ? availableThemes : defaultThemes).map((t: any) => {
                const themeId = t.themeId || t.id;
                const displayName = t.displayName || t.name;
                const description = t.description || t.desc;
                return (
                  <button
                    key={themeId}
                    type="button"
                    onClick={() => setSelectedTheme(themeId)}
                    className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between h-36 ${
                      selectedTheme === themeId
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-base block">{displayName}</span>
                      <span className="text-xs text-gray-400 mt-2 block leading-relaxed">{description}</span>
                    </div>
                    {selectedTheme === themeId && (
                      <span className="text-purple-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle size={14} /> Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={saveProfile}
            className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 rounded-2xl font-semibold"
          >
            Save Profile
          </button>

          {/* CONNECTED INTEGRATIONS PREVIEW */}
          {(gitHubUsername || behanceUrl) && (
            <div className="mt-8 border-t border-dashed border-white/10 pt-8">
              <h3 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
                <GitBranch size={20} /> Connected Integrations Preview
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* GITHUB REPOS BOARD */}
                {gitHubUsername && (
                  <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
                    themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="text-purple-400" size={20} />
                        <span className="font-bold text-sm">GitHub Repository Sync</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        CONNECTED
                      </span>
                    </div>

                    {loadingRepos ? (
                      <div className="text-xs text-gray-400 py-4 animate-pulse">Syncing repositories from GitHub...</div>
                    ) : gitHubRepos.length > 0 ? (
                      <div className="space-y-3">
                        {gitHubRepos.map((repo) => (
                          <a
                            key={repo.id}
                            href={repo.html_url}
                            target="_blank"
                            className={`block p-3 border rounded-xl hover:border-purple-500/50 transition-colors duration-300 ${
                              themeMode === "dark" ? "bg-black/20 border-white/5" : "bg-white border-slate-200 shadow-xs"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-purple-400 hover:underline">{repo.name}</span>
                              <span className="text-[9px] text-gray-400">★ {repo.stargazers_count}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">{repo.description || "No description provided."}</p>
                            <div className="flex gap-2 mt-1.5 items-center">
                              {repo.language && (
                                <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-[8px] text-gray-500">Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 py-4">Connected to @{gitHubUsername}, but no public repositories found or rate limit reached.</div>
                    )}
                  </div>
                )}

                {/* BEHANCE BOARD */}
                {behanceUrl && (
                  <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
                    themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Palette className="text-purple-400" size={20} />
                        <span className="font-bold text-sm">Behance Portfolio Sync</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        CONNECTED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Behance Mock Boards */}
                      <div className={`border rounded-xl p-3 flex flex-col justify-between h-24 ${
                        themeMode === "dark" ? "bg-black/20 border-white/5" : "bg-white border-slate-200"
                      }`}>
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 block truncate">Mobile UX Mockup</span>
                          <span className="text-[8px] text-gray-400 block mt-0.5">Figma Design System</span>
                        </div>
                        <span className="text-[8px] text-gray-500">Updated 2 days ago</span>
                      </div>
                      <div className={`border rounded-xl p-3 flex flex-col justify-between h-24 ${
                        themeMode === "dark" ? "bg-black/20 border-white/5" : "bg-white border-slate-200"
                      }`}>
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 block truncate">Vector Illustrations</span>
                          <span className="text-[8px] text-gray-400 block mt-0.5">Adobe Illustrator</span>
                        </div>
                        <span className="text-[8px] text-gray-500">Updated 1 week ago</span>
                      </div>
                    </div>
                    <div className="mt-3 text-right">
                      <a
                        href={behanceUrl}
                        target="_blank"
                        className="text-[10px] text-purple-400 hover:underline font-semibold"
                      >
                        View Full Behance Profile →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* SKILLS SECTION */}

        <div
  id="skills-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>

          <h2 className="text-3xl font-bold mb-8">
            Skills
          </h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <input
              type="text"
              placeholder="Skill Name (e.g. React)"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-[#0b0b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="">Select Skill Level</option>
              <option value="Beginner">Beginner (Level ~35%)</option>
              <option value="Intermediate">Intermediate (Level ~60%)</option>
              <option value="Advanced">Advanced (Level ~80%)</option>
              <option value="Expert">Expert (Level ~95%)</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={addSkill}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center gap-3 font-semibold"
              >
                <Plus size={20} />
                {editingSkillId ? "Update Skill" : "Add Skill"}
              </button>
              {editingSkillId && (
                <button
                  onClick={cancelEditSkill}
                  className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(skillName || skillLevel) && (
            <div className="mb-8 p-6 border border-dashed border-purple-500/20 rounded-2xl bg-purple-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className="mb-1.5 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider">{skillName || "React"}</span>
                    <span className={getPreviewThemeStyles().accentText}>{skillLevel || "Expert"}</span>
                  </div>
                  <div className="w-full bg-slate-300/20 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getPreviewThemeStyles().levelBar || "bg-purple-600"}`}
                      style={{
                        width:
                          skillLevel?.toLowerCase() === "expert" ? "95%" :
                          skillLevel?.toLowerCase() === "advanced" ? "80%" :
                          skillLevel?.toLowerCase() === "intermediate" ? "60%" :
                          skillLevel?.toLowerCase() === "beginner" ? "35%" : "75%"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`border rounded-2xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-2xl font-bold">
                    {skill.name}
                  </h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditSkill(skill)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit skill"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteSkill(skill.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400">
                  {skill.level}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* CERTIFICATIONS SECTION */}

<div
  id="certifications-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>
          <h2 className="text-3xl font-bold mb-8">
            Certifications
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              type="text"
              placeholder="Certification Title"
              value={certificationTitle}
              onChange={(e) => setCertificationTitle(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
            />

            <input
              type="text"
              placeholder="Issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Certificate File (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setCertificateUrl, "Certificate")}
                  className="hidden"
                  id="cert-file-input"
                />
                {!certificateUrl ? (
                  <label
                    htmlFor="cert-file-input"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Certificate" ? "Uploading..." : "Upload Certificate"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {certificateUrl.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={certificateUrl} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setCertificateUrl("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={addCertification}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 rounded-2xl font-semibold text-black"
            >
              {editingCertId ? "Update Certification" : "Add Certification"}
            </button>
            {editingCertId && (
              <button
                onClick={cancelEditCertification}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(certificationTitle || issuer) && (
            <div className="mb-8 p-6 border border-dashed border-yellow-500/20 rounded-2xl bg-yellow-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-yellow-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-amber-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{certificationTitle || "AWS Cloud Practitioner"}</p>
                    <p className="text-[11px] opacity-70 mt-1">{issuer || "Amazon"}</p>
                    {issueDate && (
                      <p className="text-[10px] opacity-50 mt-0.5">
                        {new Date(issueDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    )}
                    {certificateUrl && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Award size={10} /> Verified Credentials Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">

            {certifications.map((cert) => (
              <div
                key={cert.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-2xl font-bold">
                    {cert.title}
                  </h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditCertification(cert)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit certification"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteCertification(cert.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete certification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 mb-2">
                  Issued by: {cert.issuer}
                </p>

                <div className="flex gap-3 mt-4 flex-wrap">
                  {cert.certificateUrl && (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold"
                    >
                      <Award size={15} /> View Certificate
                    </a>
                  )}
                </div>

              </div>

            ))}

          </div>

        </div>

        {/* RESEARCH PAPERS SECTION */}

<div
  id="research-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>
          <h2 className="text-3xl font-bold mb-8">
            Research Papers
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              type="text"
              placeholder="Research Paper Title"
              value={researchTitle}
              onChange={(e) => setResearchTitle(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
            />

            <input
              type="text"
              placeholder="Conference / Journal"
              value={conference}
              onChange={(e) => setConference(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Research Paper File (PDF)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, setPaperUrl, "Research Paper")}
                  className="hidden"
                  id="paper-file-input"
                />
                {!paperUrl ? (
                  <label
                    htmlFor="paper-file-input"
                    className="bg-cyan-500 hover:bg-cyan-600 text-black px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Research Paper" ? "Uploading..." : "Upload Paper PDF"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                      <FileText size={14} /> PDF Attached
                    </span>
                    <button
                      onClick={() => setPaperUrl("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
            />

            <select
              value={researchCategory}
              onChange={(e) => setResearchCategory(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 md:col-span-2 ${
                themeMode === "dark" ? "bg-[#0b0b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="Journal Publication">Journal Publication</option>
              <option value="Conference Presentation">Conference Presentation</option>
              <option value="Science Fair Innovation">Science Fair Innovation</option>
            </select>

          </div>

          <textarea
            placeholder="Research Abstract"
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addResearchPaper}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingResearchId ? "Update Research Paper" : "Add Research Paper"}
            </button>
            {editingResearchId && (
              <button
                onClick={cancelEditResearchPaper}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(researchTitle || conference || abstract) && (
            <div className="mb-8 p-6 border border-dashed border-cyan-500/20 rounded-2xl bg-cyan-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-cyan-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{researchTitle || "Deep Learning in Agriculture"}</p>
                    {researchCategory && (
                      <span className="inline-block bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase">
                        {researchCategory}
                      </span>
                    )}
                    <p className="text-[11px] opacity-70 mt-2">{conference || "IEEE Conference 2026"}</p>
                    <p className="text-[10px] opacity-60 mt-1 line-clamp-3 italic">
                      {abstract || "Abstract goes here. Provide a brief overview of the research methodology and results..."}
                    </p>
                    {publishedDate && (
                      <p className="text-[9px] opacity-40 mt-1.5">
                        Published: {new Date(publishedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    )}
                    {paperUrl && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <FileText size={10} /> PDF Publication Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">

            {researchPapers.map((paper) => (

              <div
                key={paper.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {paper.title}
                    </h3>
                    {paper.category && (
                      <span className="inline-block bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs px-2.5 py-1 rounded-full mt-1.5 font-semibold">
                        {paper.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditResearchPaper(paper)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit research paper"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteResearchPaper(paper.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete research paper"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-purple-300 mb-3">
                  {paper.conference}
                </p>

                <p className="text-gray-400 mb-5">
                  {paper.abstract}
                </p>

                <div className="flex gap-3 flex-wrap">
                  {paper.paperUrl && (
                    <a
                      href={paper.paperUrl}
                      target="_blank"
                      className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold"
                    >
                      <ExternalLink size={15} /> View Paper
                    </a>
                  )}
                </div>

              </div>

            ))}

          </div>

        </div>

        {/* ACHIEVEMENTS SECTION */}

<div
  id="achievements-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>
          <h2 className="text-3xl font-bold mb-8">
            Achievements
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              type="text"
              placeholder="Achievement Title"
              value={achievementTitle}
              onChange={(e) => setAchievementTitle(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Proof of Achievement (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setAchievementUrl, "Achievement Proof")}
                  className="hidden"
                  id="achievement-file-input"
                />
                {!achievementUrl ? (
                  <label
                    htmlFor="achievement-file-input"
                    className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Achievement Proof" ? "Uploading..." : "Upload Proof"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {achievementUrl.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={achievementUrl} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setAchievementUrl("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>

            <input
              type="date"
              value={achievementDate}
              onChange={(e) => setAchievementDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
            />

            <select
              value={achievementCategory}
              onChange={(e) => setAchievementCategory(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="Academic Award" className={themeMode === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>Academic Award</option>
              <option value="Olympiad / Competition" className={themeMode === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>Olympiad / Competition</option>
              <option value="Sports Achievement" className={themeMode === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>Sports Achievement</option>
              <option value="NGO / Community Service" className={themeMode === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>NGO / Community Service</option>
              <option value="Startup Competition" className={themeMode === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"}>Startup Competition</option>
            </select>

          </div>

          <textarea
            placeholder="Achievement Description"
            value={achievementDescription}
            onChange={(e) => setAchievementDescription(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addAchievement}
              className="bg-gradient-to-r from-pink-500 to-rose-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingAchId ? "Update Achievement" : "Add Achievement"}
            </button>
            {editingAchId && (
              <button
                onClick={cancelEditAchievement}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(achievementTitle || achievementDescription) && (
            <div className="mb-8 p-6 border border-dashed border-pink-500/20 rounded-2xl bg-pink-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-pink-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-pink-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{achievementTitle || "First Place Hackathon"}</p>
                    {achievementCategory && (
                      <span className="inline-block bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase">
                        {achievementCategory}
                      </span>
                    )}
                    <p className="text-[11px] opacity-70 mt-2">{achievementDescription || "Won first prize for innovative web app..."}</p>
                    {achievementDate && (
                      <p className="text-[9px] opacity-40 mt-1">
                        {new Date(achievementDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    )}
                    {achievementUrl && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Trophy size={10} /> Verified Proof Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">

            {achievements.map((achievement) => (

              <div
                key={achievement.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-bold">
                      {achievement.title}
                    </h3>
                    {achievement.category && (
                      <span className="text-[10px] self-start px-2.5 py-1 rounded-full font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase font-semibold">
                        {achievement.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditAchievement(achievement)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit achievement"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteAchievement(achievement.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete achievement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 mb-5">
                  {achievement.description}
                </p>

                <div className="flex gap-3 flex-wrap">
                  {achievement.achievementUrl && (
                    <a
                      href={achievement.achievementUrl}
                      target="_blank"
                      className="bg-pink-500 hover:bg-pink-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold"
                    >
                      <ExternalLink size={15} /> View Achievement
                    </a>
                  )}
                </div>

              </div>

            ))}

          </div>

        </div>
        {/* HACKATHONS SECTION */}

<div
  id="hackathons-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>

  <h2 className="text-3xl font-bold mb-8">
    Hackathons
  </h2>

  <div className="grid md:grid-cols-2 gap-4 mb-6">

    <input
      type="text"
      placeholder="Hackathon Title"
      value={hackathonTitle}
      onChange={(e) => setHackathonTitle(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="text"
      placeholder="Organizer"
      value={organizer}
      onChange={(e) => setOrganizer(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="text"
      placeholder="Project Name"
      value={projectName}
      onChange={(e) => setProjectName(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="text"
      placeholder="Hackathon URL"
      value={hackathonUrl}
      onChange={(e) => setHackathonUrl(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="date"
      value={eventDate}
      onChange={(e) => setEventDate(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
      themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
    }`}>
      <label className="text-sm text-gray-400 font-semibold">Certificate / Proof (PDF / Image)</label>
      <div className="flex items-center gap-4 mt-1">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => handleFileUpload(e, setHackathonCertificateUrl, "Hackathon Certificate")}
          className="hidden"
          id="hackathon-cert-file-input"
        />
        {!hackathonCertificateUrl ? (
          <label
            htmlFor="hackathon-cert-file-input"
            className="bg-violet-500 hover:bg-violet-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
          >
            {uploadingField === "Hackathon Certificate" ? "Uploading..." : "Upload Certificate"}
          </label>
        ) : (
          <div className="flex items-center gap-3">
            {hackathonCertificateUrl.endsWith(".pdf") ? (
              <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                <FileText size={14} /> PDF Attached
              </span>
            ) : (
              <img src={hackathonCertificateUrl} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
            )}
            <button
              onClick={() => setHackathonCertificateUrl("")}
              className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
            >
              Remove File
            </button>
          </div>
        )}
      </div>
    </div>

  </div>

  <textarea
    placeholder="Hackathon Description"
    value={hackathonDescription}
    onChange={(e) => setHackathonDescription(e.target.value)}
    className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
    }`}
  />

  <div className="flex gap-2 mb-6">
    <button
      onClick={addHackathon}
      className="bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-4 rounded-2xl font-semibold text-white"
    >
      {editingHackId ? "Update Hackathon" : "Add Hackathon"}
    </button>
    {editingHackId && (
      <button
        onClick={cancelEditHackathon}
        className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
      >
        Cancel
      </button>
    )}
  </div>

  {/* LIVE PREVIEW WIDGET */}
  {(hackathonTitle || organizer || hackathonDescription) && (
    <div className="mb-8 p-6 border border-dashed border-purple-500/20 rounded-2xl bg-purple-500/5">
      <h4 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-4 flex items-center gap-2">
        <Eye size={14} /> Live Preview ({selectedTheme} Theme)
      </h4>
      <div className="max-w-md">
        <div className={getPreviewThemeStyles().card}>
          <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-purple-500"} pl-4`}>
            <p className="text-xs font-bold uppercase tracking-wide leading-tight">{hackathonTitle || "MCC Hackathon 2026"}</p>
            <p className="text-[11px] opacity-70 mt-1">{organizer || "Madras Christian College"}</p>
            <p className="text-[10px] opacity-60 mt-2 line-clamp-3 italic">{hackathonDescription || "Built an AI agent to help students build portfolios..."}</p>
            {projectName && (
              <p className="text-[10px] font-semibold mt-1 text-purple-400">
                Project: {projectName}
              </p>
            )}
            {eventDate && (
              <p className="text-[9px] opacity-40 mt-1">
                {new Date(eventDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </p>
            )}
            {hackathonCertificateUrl && (
              <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                <Award size={10} /> Verified Certificate Attached
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

  <div className="grid lg:grid-cols-2 gap-6 mt-10">

    {hackathons.map((hackathon) => (

      <div
        key={hackathon.id}
        className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
          themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-2xl font-bold">
            {hackathon.title}
          </h3>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
            <button
              onClick={() => startEditHackathon(hackathon)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
              title="Edit hackathon"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteHackathon(hackathon.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
              title="Delete hackathon"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className="text-violet-300 mb-2">
          {hackathon.organizer}
        </p>

        <p className="text-gray-400 mb-4">
          {hackathon.description}
        </p>

        <p className="text-sm text-gray-500 mb-5">
          Project: {hackathon.projectName}
        </p>

        <div className="flex gap-3 flex-wrap">
          {hackathon.hackathonUrl && (
            <a
              href={hackathon.hackathonUrl}
              target="_blank"
              className="bg-violet-500 hover:bg-violet-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold"
            >
              <ExternalLink size={15} /> View Hackathon
            </a>
          )}
          {hackathon.certificateUrl && (
            <a
              href={hackathon.certificateUrl}
              target="_blank"
              className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
            >
              <Award size={15} /> View Certificate
            </a>
          )}
        </div>

      </div>

    ))}

  </div>

</div>

{/* PROJECTS SECTION */}

<div
  id="projects-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>

  <h2 className="text-3xl font-bold mb-8">
    Projects
  </h2>

  <div className="grid md:grid-cols-2 gap-4 mb-6">

    <input
      type="text"
      placeholder="Project Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="text"
      placeholder="Technologies"
      value={technologies}
      onChange={(e) => setTechnologies(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="text"
      placeholder="GitHub URL"
      value={githubUrl}
      onChange={(e) => setGithubUrl(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <input
      type="text"
      placeholder="Live URL"
      value={liveUrl}
      onChange={(e) => setLiveUrl(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <select
      value={projectCategory}
      onChange={(e) => setProjectCategory(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-[#0b0b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <option value="Software Project">Software Project</option>
      <option value="Hardware Prototype">Hardware Prototype</option>
      <option value="Startup Idea">Startup Idea</option>
      <option value="Innovation Project">Innovation Project</option>
    </select>

    <input
      type="text"
      placeholder="Video Demonstration URL (YouTube/Loom/etc.)"
      value={demoVideoUrl}
      onChange={(e) => setDemoVideoUrl(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 md:col-span-2 ${
      themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
    }`}>
      <label className="text-sm text-gray-400 font-semibold">Project Banner / Screenshot (Image)</label>
      <div className="flex items-center gap-4 mt-1">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, setImageUrl, "Project Image")}
          className="hidden"
          id="project-image-file-input"
        />
        {!imageUrl ? (
          <label
            htmlFor="project-image-file-input"
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
          >
            {uploadingField === "Project Image" ? "Uploading..." : "Upload Project Image"}
          </label>
        ) : (
          <div className="flex items-center gap-3">
            <img src={imageUrl} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
            <button
              onClick={() => setImageUrl("")}
              className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>
    </div>

  </div>

  <textarea
    placeholder="Project Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
      themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
    }`}
  />

  <div className="flex gap-2 mb-6">
    <button
      onClick={addProject}
      className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 rounded-2xl font-semibold text-white"
    >
      {editingProjectId ? "Update Project" : "Add Project"}
    </button>
    {editingProjectId && (
      <button
        onClick={cancelEditProject}
        className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
      >
        Cancel
      </button>
    )}
  </div>

  {/* LIVE PREVIEW WIDGET */}
  {(title || description || technologies) && (
    <div className="mb-8 p-6 border border-dashed border-green-500/20 rounded-2xl bg-green-500/5">
      <h4 className="text-xs uppercase font-bold tracking-widest text-green-400 mb-4 flex items-center gap-2">
        <Eye size={14} /> Live Preview ({selectedTheme} Theme)
      </h4>
      <div className="max-w-md">
        <div className={getPreviewThemeStyles().card}>
          {imageUrl && (
            <img src={imageUrl} className="w-full h-32 object-cover rounded-lg mb-3 border border-white/10" alt="Project Banner" />
          )}
          <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-green-500"} pl-4`}>
            <p className="text-xs font-bold uppercase tracking-wide leading-tight">{title || "E-Commerce Platform"}</p>
            {projectCategory && (
              <span className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase">
                {projectCategory}
              </span>
            )}
            <p className="text-[11px] font-semibold mt-1 text-emerald-400">{technologies || "React, Node.js, Postgres"}</p>
            <p className="text-[10px] opacity-60 mt-2 line-clamp-3 italic">{description || "A scalable platform built with modern technologies..."}</p>
            <div className="flex gap-2 mt-3">
              {githubUrl && <span className="text-[9px] font-mono opacity-50">GitHub Connected</span>}
              {liveUrl && <span className="text-[9px] font-mono opacity-50">Demo Available</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  <div className="grid lg:grid-cols-2 gap-6 mt-10">

    {projects.map((project) => (

      <div
        key={project.id}
        className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
          themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
        }`}
      >
        {project.imageUrl && (
          <img src={project.imageUrl} className="w-full h-40 object-cover rounded-2xl mb-4 border border-slate-200 dark:border-white/10" alt={project.title} />
        )}
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            <h3 className="text-2xl font-bold">
              {project.title}
            </h3>
            {project.category && (
              <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-full mt-1.5 font-semibold">
                {project.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
            <button
              onClick={() => startEditProject(project)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
              title="Edit project"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteProject(project.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
              title="Delete project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <p className="text-green-300 mb-3">
          {project.technologies}
        </p>

        <p className="text-gray-400 mb-5">
          {project.description}
        </p>

        <div className="flex gap-4 flex-wrap">

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/50 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
            >
              <GitBranch size={15} /> GitHub
            </a>
          )}

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold"
            >
              <ExternalLink size={15} /> Live Demo
            </a>
          )}

          {project.demoVideoUrl && (
            <a
              href={project.demoVideoUrl}
              target="_blank"
              className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
            >
              <Video size={15} /> Video Demo
            </a>
          )}

        </div>

      </div>

    ))}

  </div>

</div>
{/* RESUME SECTION */}

<div
  id="resume-section"
  className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
         themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
       }`}
>

  <h2 className="text-3xl font-bold mb-8">
    Resume Upload
  </h2>

  <div className="grid md:grid-cols-2 gap-4 mb-6">

    <input
      type="text"
      placeholder="Resume Title"
      value={resumeTitle}
      onChange={(e) => setResumeTitle(e.target.value)}
      className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
        themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
      }`}
    />

    <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
      themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
    }`}>
      <label className={`text-sm font-semibold ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>Upload Resume File (PDF)</label>
      <div className="flex items-center gap-4 mt-1">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileUpload(e, setResumeUrl, "Resume")}
          className="hidden"
          id="resume-file-input"
        />
        {!resumeUrl ? (
          <label
            htmlFor="resume-file-input"
            className="bg-indigo-500 hover:bg-indigo-600 px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition text-white"
          >
            {uploadingField === "Resume" ? "Uploading..." : "Choose PDF File"}
          </label>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              <FileText size={14} /> PDF Attached
            </span>
            <button
              onClick={() => setResumeUrl("")}
              className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
            >
              Remove File
            </button>
          </div>
        )}
      </div>
    </div>

  </div>

  <div className="flex gap-2 mb-6">
    <button
      onClick={addResume}
      className="bg-gradient-to-r from-indigo-500 to-blue-600 px-8 py-4 rounded-2xl font-semibold text-white"
    >
      {editingResumeId ? "Update Resume" : "Upload Resume"}
    </button>
    {editingResumeId && (
      <button
        onClick={cancelEditResume}
        className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
      >
        Cancel
      </button>
    )}
  </div>

  <div className="grid lg:grid-cols-2 gap-6 mt-10">

    {resumes.map((resume) => (

      <div
        key={resume.id}
        className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
          themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="text-2xl font-bold">
            {resume.resumeTitle}
          </h3>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
            <button
              onClick={() => startEditResume(resume)}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
              title="Edit resume"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => deleteResume(resume.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
              title="Delete resume"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {resume.resumeUrl && (
            <a
              href={resume.resumeUrl}
              target="_blank"
              className="bg-indigo-500 hover:bg-indigo-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold"
            >
              <ExternalLink size={15} /> View Resume
            </a>
          )}
        </div>

      </div>

    ))}

</div>
</div>

        {/* COMMUNITY SERVICE SECTION */}
        <div
          id="community-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">Community Service / Volunteering</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Volunteering Role / Title"
              value={communityTitle}
              onChange={(e) => setCommunityTitle(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Organization Name"
              value={communityOrg}
              onChange={(e) => setCommunityOrg(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="number"
              placeholder="Hours Served"
              value={hoursServed}
              onChange={(e) => setHoursServed(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="date"
              value={communityDate}
              onChange={(e) => setCommunityDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 md:col-span-2 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Certificate / Proof of Service (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setCommunityAttachment, "Community Attachment")}
                  className="hidden"
                  id="community-attachment-file-input"
                />
                {!communityAttachment ? (
                  <label
                    htmlFor="community-attachment-file-input"
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Community Attachment" ? "Uploading..." : "Upload Certificate"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {communityAttachment.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={communityAttachment} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setCommunityAttachment("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Describe your volunteering activities and achievements..."
            value={communityDesc}
            onChange={(e) => setCommunityDesc(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addCommunityService}
              className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingCommunityId ? "Update Community Service" : "Add Community Service"}
            </button>
            {editingCommunityId && (
              <button
                onClick={cancelEditCommunityService}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(communityTitle || communityOrg || communityDesc) && (
            <div className="mb-8 p-6 border border-dashed border-red-500/20 rounded-2xl bg-red-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-red-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-red-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{communityTitle || "Food Drive Coordinator"}</p>
                    <p className="text-[11px] opacity-70 mt-1">{communityOrg || "Red Cross MCC"}</p>
                    {hoursServed && (
                      <span className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase">
                        {hoursServed} Hours Served
                      </span>
                    )}
                    <p className="text-[10px] opacity-60 mt-2 line-clamp-3 italic">{communityDesc || "Organized weekly food distribution drives..."}</p>
                    {communityDate && (
                      <p className="text-[9px] opacity-40 mt-1">
                        {new Date(communityDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    )}
                    {communityAttachment && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Heart size={10} /> Community Proof Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {communityServices.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-red-400 text-sm font-semibold mt-1">{item.organization}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditCommunityService(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteCommunityService(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 mb-4">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Hours Served: <strong className="text-red-400 font-bold">{item.hoursServed}</strong></span>
                  {item.date && (
                    <span>Date: {new Date(item.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  )}
                </div>

                <div className="flex gap-3 flex-wrap">
                  {item.attachmentUrl && (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition text-white"
                    >
                      <Heart size={15} /> View Service Certificate
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CREATIVE WORKS SECTION */}
        <div
          id="creative-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">Creative Works / Design Portfolio</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Artwork / Design Title"
              value={creativeTitle}
              onChange={(e) => setCreativeTitle(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <select
              value={creativeCategory}
              onChange={(e) => setCreativeCategory(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-[#0b0b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="Artwork">Artwork / Digital Painting</option>
              <option value="UI Design">UI/UX Design / Mockup</option>
              <option value="Photography">Photography</option>
              <option value="Writing">Writing / Article</option>
              <option value="Video">Video / Motion Graphics</option>
              <option value="Other">Other Creative Piece</option>
            </select>

            <input
              type="text"
              placeholder="External Portfolio Link (Behance, Dribbble, Medium)"
              value={creativeUrl}
              onChange={(e) => setCreativeUrl(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="date"
              value={creativeDate}
              onChange={(e) => setCreativeDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 md:col-span-2 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Upload Showcase Media (Image / PDF)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setCreativeMedia, "Creative Media")}
                  className="hidden"
                  id="creative-media-file-input"
                />
                {!creativeMedia ? (
                  <label
                    htmlFor="creative-media-file-input"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Creative Media" ? "Uploading..." : "Upload Media file"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {creativeMedia.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={creativeMedia} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setCreativeMedia("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Provide a description of your creative project, design choices, or writing abstract..."
            value={creativeDesc}
            onChange={(e) => setCreativeDesc(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addCreativeWork}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingCreativeId ? "Update Creative Work" : "Add Creative Work"}
            </button>
            {editingCreativeId && (
              <button
                onClick={cancelEditCreativeWork}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(creativeTitle || creativeDesc) && (
            <div className="mb-8 p-6 border border-dashed border-teal-500/20 rounded-2xl bg-teal-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-teal-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  {creativeMedia && !creativeMedia.endsWith(".pdf") && (
                    <img src={creativeMedia} className="w-full h-32 object-cover rounded-lg mb-3 border border-white/10" alt="Creative Piece" />
                  )}
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-teal-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{creativeTitle || "Cyberpunk Chennai"}</p>
                    {creativeCategory && (
                      <span className="inline-block bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[9px] px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase">
                        {creativeCategory}
                      </span>
                    )}
                    <p className="text-[10px] opacity-60 mt-2 line-clamp-3 italic">{creativeDesc || "A digital design showcase project..."}</p>
                    {creativeDate && (
                      <p className="text-[9px] opacity-40 mt-1">
                        {new Date(creativeDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    )}
                    {(creativeUrl || creativeMedia) && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Palette size={10} /> View Creative Work
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {creativeWorks.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                {item.mediaUrl && !item.mediaUrl.endsWith(".pdf") && (
                  <img src={item.mediaUrl} className="w-full h-40 object-cover rounded-2xl mb-4 border border-slate-200 dark:border-white/10" alt={item.title} />
                )}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <span className="inline-block bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs px-2.5 py-1 rounded-full mt-1.5 font-semibold">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditCreativeWork(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit creative work"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteCreativeWork(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete creative work"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 mb-4">{item.description}</p>
                {item.date && (
                  <p className="text-xs text-gray-500 mb-4">
                    Created: {new Date(item.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </p>
                )}

                <div className="flex gap-3 flex-wrap">
                  {item.workUrl && (
                    <a
                      href={item.workUrl}
                      target="_blank"
                      className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/50 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
                    >
                      <ExternalLink size={15} /> External Link
                    </a>
                  )}
                  {item.mediaUrl && (
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      className="bg-teal-500 hover:bg-teal-600 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition text-white"
                    >
                      <Download size={15} /> Download Media
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACADEMIC RECORDS SECTION */}
        <div
          id="academic-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">Academic Records & History</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Institution Name"
              value={academicInstitution}
              onChange={(e) => setAcademicInstitution(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Degree (e.g. B.Sc. Computer Science)"
              value={academicDegree}
              onChange={(e) => setAcademicDegree(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Field of Study"
              value={academicField}
              onChange={(e) => setAcademicField(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Grade (e.g. 9.2 CGPA / 85%)"
              value={academicGrade}
              onChange={(e) => setAcademicGrade(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="number"
              placeholder="Start Year"
              value={academicStartYear}
              onChange={(e) => setAcademicStartYear(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="number"
              placeholder="End Year (or Expected)"
              value={academicEndYear}
              onChange={(e) => setAcademicEndYear(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 md:col-span-2 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Upload Transcript / Proof (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setAcademicAttachment, "Academic Record Attachment")}
                  className="hidden"
                  id="academic-attachment-file-input"
                />
                {!academicAttachment ? (
                  <label
                    htmlFor="academic-attachment-file-input"
                    className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Academic Record Attachment" ? "Uploading..." : "Upload Document"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {academicAttachment.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={academicAttachment} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setAcademicAttachment("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={addAcademicRecord}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingAcademicId ? "Update Academic Record" : "Add Academic Record"}
            </button>
            {editingAcademicId && (
              <button
                onClick={cancelEditAcademicRecord}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(academicInstitution || academicDegree || academicGrade) && (
            <div className="mb-8 p-6 border border-dashed border-purple-500/20 rounded-2xl bg-purple-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-purple-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{academicDegree || "Bachelor of Science"}</p>
                    <p className="text-[11px] opacity-70 mt-1">{academicInstitution || "Madras Christian College"}</p>
                    {academicField && <p className="text-[10px] text-purple-400 font-semibold mt-0.5">{academicField}</p>}
                    {academicGrade && (
                      <span className="inline-block bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] px-2 py-0.5 rounded mt-1.5 font-bold">
                        Grade: {academicGrade}
                      </span>
                    )}
                    {(academicStartYear || academicEndYear) && (
                      <p className="text-[9px] opacity-40 mt-1">
                        Timeline: {academicStartYear || ""} - {academicEndYear || "Present"}
                      </p>
                    )}
                    {academicAttachment && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <FileText size={10} /> Verified Transcript Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {academicRecords.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.degree}</h3>
                    <p className="text-purple-400 text-sm font-semibold mt-1">{item.institution}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditAcademicRecord(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteAcademicRecord(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  {item.fieldOfStudy && <p>Field: <strong className="text-gray-300">{item.fieldOfStudy}</strong></p>}
                  {item.grade && <p>Grade: <strong className="text-gray-300">{item.grade}</strong></p>}
                  <p>Timeline: <strong className="text-gray-300">{item.startYear} - {item.endYear || "Present"}</strong></p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {item.attachmentUrl && (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition text-white"
                    >
                      <Download size={15} /> View Attachment / Transcript
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OLYMPIADS SECTION */}
        <div
          id="olympiads-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">Olympiads & Competitive Exams</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Olympiad Name (e.g. NSO, ACM ICPC)"
              value={olympiadName}
              onChange={(e) => setOlympiadName(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Subject / Domain"
              value={olympiadSubject}
              onChange={(e) => setOlympiadSubject(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Rank / Score (e.g. AIR 45 / Gold Medal)"
              value={olympiadRank}
              onChange={(e) => setOlympiadRank(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="number"
              placeholder="Year"
              value={olympiadYear}
              onChange={(e) => setOlympiadYear(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 md:col-span-2 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Olympiad Certificate (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setOlympiadCertificate, "Olympiad Certificate")}
                  className="hidden"
                  id="olympiad-certificate-file-input"
                />
                {!olympiadCertificate ? (
                  <label
                    htmlFor="olympiad-certificate-file-input"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Olympiad Certificate" ? "Uploading..." : "Upload Certificate"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {olympiadCertificate.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={olympiadCertificate} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setOlympiadCertificate("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Describe your achievement, prep, or topics covered..."
            value={olympiadDesc}
            onChange={(e) => setOlympiadDesc(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addOlympiad}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-4 rounded-2xl font-semibold text-black"
            >
              {editingOlympiadId ? "Update Olympiad" : "Add Olympiad Achievement"}
            </button>
            {editingOlympiadId && (
              <button
                onClick={cancelEditOlympiad}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(olympiadName || olympiadRank || olympiadSubject) && (
            <div className="mb-8 p-6 border border-dashed border-yellow-500/20 rounded-2xl bg-yellow-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-yellow-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-amber-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{olympiadName || "International Math Olympiad"}</p>
                    {olympiadSubject && <p className="text-[10px] text-amber-500 font-semibold mt-0.5">{olympiadSubject}</p>}
                    {olympiadRank && (
                      <span className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] px-2 py-0.5 rounded mt-1.5 font-bold">
                        Rank: {olympiadRank}
                      </span>
                    )}
                    {olympiadYear && <p className="text-[9px] opacity-40 mt-1">Year: {olympiadYear}</p>}
                    {olympiadDesc && <p className="text-[10px] opacity-60 mt-1.5 italic line-clamp-2">{olympiadDesc}</p>}
                    {olympiadCertificate && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Trophy size={10} /> Olympiad Medal Proof Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {olympiads.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.name}</h3>
                    <p className="text-yellow-400 text-sm font-semibold mt-1">Subject: {item.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditOlympiad(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteOlympiad(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  <p>Rank/Result: <strong className="text-gray-300">{item.rank}</strong></p>
                  <p>Year: <strong className="text-gray-300">{item.year}</strong></p>
                  {item.description && <p className="mt-2 text-xs leading-relaxed">{item.description}</p>}
                </div>

                <div className="flex gap-3 flex-wrap">
                  {item.certificateUrl && (
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
                    >
                      <Trophy size={15} /> View Olympiad Certificate
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STARTUP COMPETITIONS SECTION */}
        <div
          id="startup-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">Startup Pitching & Innovation Competitions</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Competition Name (e.g. Smart India Hackathon, Pitch Day)"
              value={startupCompName}
              onChange={(e) => setStartupCompName(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Project Name / Idea"
              value={startupProjName}
              onChange={(e) => setStartupProjName(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Your Role (e.g. Lead Presenter, Lead Dev)"
              value={startupRole}
              onChange={(e) => setStartupRole(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Result / Award (e.g. Winner, Top 10, Incubation offer)"
              value={startupResult}
              onChange={(e) => setStartupResult(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="date"
              value={startupDate}
              onChange={(e) => setStartupDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Pitch Deck PDF (or Project PDF)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e, setStartupPitchDeck, "Startup Pitch Deck")}
                  className="hidden"
                  id="startup-deck-file-input"
                />
                {!startupPitchDeck ? (
                  <label
                    htmlFor="startup-deck-file-input"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Startup Pitch Deck" ? "Uploading..." : "Upload Pitch Deck"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <FileText size={14} /> PDF Attached
                    </span>
                    <button
                      onClick={() => setStartupPitchDeck("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Pitch details, business model, problem statement, key metrics..."
            value={startupDesc}
            onChange={(e) => setStartupDesc(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addStartupCompetition}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingStartupId ? "Update Startup Record" : "Add Startup Record"}
            </button>
            {editingStartupId && (
              <button
                onClick={cancelEditStartupCompetition}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(startupCompName || startupProjName || startupResult) && (
            <div className="mb-8 p-6 border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-emerald-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{startupProjName || "Eco-Fuel Innovator"}</p>
                    <p className="text-[11px] opacity-70 mt-1">{startupCompName || "National Startup Challenge"}</p>
                    {startupRole && <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Role: {startupRole}</p>}
                    {startupResult && (
                      <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded mt-1.5 font-bold">
                        Result: {startupResult}
                      </span>
                    )}
                    {startupDate && <p className="text-[9px] opacity-40 mt-1">Date: {new Date(startupDate).toLocaleDateString()}</p>}
                    {startupDesc && <p className="text-[10px] opacity-60 mt-1.5 line-clamp-2 leading-relaxed">{startupDesc}</p>}
                    {startupPitchDeck && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <FileText size={10} /> Pitch Deck PDF Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {startupCompetitions.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.projectName}</h3>
                    <p className="text-emerald-400 text-sm font-semibold mt-1">{item.competitionName}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditStartupCompetition(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteStartupCompetition(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  <p>Your Role: <strong className="text-gray-300">{item.role}</strong></p>
                  <p>Result/Award: <strong className="text-gray-300">{item.result}</strong></p>
                  {item.date && <p>Date: <strong className="text-gray-300">{new Date(item.date).toLocaleDateString()}</strong></p>}
                  {item.description && <p className="mt-2 text-xs leading-relaxed">{item.description}</p>}
                </div>

                <div className="flex gap-3 flex-wrap">
                  {item.pitchDeckUrl && (
                    <a
                      href={item.pitchDeckUrl}
                      target="_blank"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
                    >
                      <Download size={15} /> View Pitch Deck / Document
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NGO ACTIVITIES SECTION */}
        <div
          id="ngo-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">NGO Volunteering & Social Service</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="NGO Name / Organization"
              value={ngoOrgName}
              onChange={(e) => setNgoOrgName(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Your Role (e.g. Volunteer, Team Leader)"
              value={ngoRole}
              onChange={(e) => setNgoRole(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="number"
              placeholder="Hours Contributed"
              value={ngoHours}
              onChange={(e) => setNgoHours(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="date"
              placeholder="Start Date"
              value={ngoStartDate}
              onChange={(e) => setNgoStartDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="date"
              placeholder="End Date"
              value={ngoEndDate}
              onChange={(e) => setNgoEndDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Service Certificate (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setNgoCertificate, "NGO Certificate")}
                  className="hidden"
                  id="ngo-certificate-file-input"
                />
                {!ngoCertificate ? (
                  <label
                    htmlFor="ngo-certificate-file-input"
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "NGO Certificate" ? "Uploading..." : "Upload Certificate"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {ngoCertificate.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={ngoCertificate} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setNgoCertificate("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Volunteering description, duties performed, social impact created..."
            value={ngoDesc}
            onChange={(e) => setNgoDesc(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addNgoActivity}
              className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-4 rounded-2xl font-semibold text-white"
            >
              {editingNgoId ? "Update NGO Activity" : "Add NGO Activity"}
            </button>
            {editingNgoId && (
              <button
                onClick={cancelEditNgoActivity}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(ngoOrgName || ngoRole || ngoHours) && (
            <div className="mb-8 p-6 border border-dashed border-red-500/20 rounded-2xl bg-red-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-red-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-red-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{ngoRole || "Social Work Volunteer"}</p>
                    <p className="text-[11px] opacity-70 mt-1">{ngoOrgName || "HelpAge India"}</p>
                    {ngoHours && (
                      <span className="inline-block bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded mt-1.5 font-bold">
                        {ngoHours} Hours Contributed
                      </span>
                    )}
                    {ngoStartDate && <p className="text-[9px] opacity-40 mt-1">Start: {new Date(ngoStartDate).toLocaleDateString()}</p>}
                    {ngoDesc && <p className="text-[10px] opacity-60 mt-1.5 line-clamp-2">{ngoDesc}</p>}
                    {ngoCertificate && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Heart size={10} /> Volunteer Proof Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {ngoActivities.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.role}</h3>
                    <p className="text-red-400 text-sm font-semibold mt-1">{item.organizationName}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditNgoActivity(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteNgoActivity(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  <p>Hours Contributed: <strong className="text-gray-300">{item.hoursContributed}</strong></p>
                  <p>Timeline: <strong className="text-gray-300">{new Date(item.startDate).toLocaleDateString()} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : "Present"}</strong></p>
                  {item.description && <p className="mt-2 text-xs leading-relaxed">{item.description}</p>}
                </div>

                <div className="flex gap-3 flex-wrap">
                  {item.certificateUrl && (
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      className="bg-red-500 hover:bg-red-600 text-white border-0 px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
                    >
                      <Heart size={15} /> View Service Certificate
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SPORTS ACHIEVEMENTS SECTION */}
        <div
          id="sports-section"
          className={`mt-10 border rounded-3xl p-8 transition-colors duration-300 ${
            themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-3xl font-bold mb-8">Sports Corner & Athletics</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Sport / Athletic Event"
              value={sportsName}
              onChange={(e) => setSportsName(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Competition Level (e.g. University, State, National)"
              value={sportsLevel}
              onChange={(e) => setSportsLevel(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="text"
              placeholder="Achievement / Rank (e.g. Gold Medal, Runner Up)"
              value={sportsAward}
              onChange={(e) => setSportsAward(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <input
              type="date"
              value={sportsDate}
              onChange={(e) => setSportsDate(e.target.value)}
              className={`border rounded-2xl px-5 py-4 outline-none transition-all duration-300 ${
                themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />

            <div className={`border rounded-2xl px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 md:col-span-2 ${
              themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <label className="text-sm text-gray-400 font-semibold">Medal / Merit Certificate (PDF / Image)</label>
              <div className="flex items-center gap-4 mt-1">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleFileUpload(e, setSportsCertificate, "Sports Certificate")}
                  className="hidden"
                  id="sports-certificate-file-input"
                />
                {!sportsCertificate ? (
                  <label
                    htmlFor="sports-certificate-file-input"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-2xl cursor-pointer text-sm font-semibold transition"
                  >
                    {uploadingField === "Sports Certificate" ? "Uploading..." : "Upload Certificate"}
                  </label>
                ) : (
                  <div className="flex items-center gap-3">
                    {sportsCertificate.endsWith(".pdf") ? (
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                        <FileText size={14} /> PDF Attached
                      </span>
                    ) : (
                      <img src={sportsCertificate} className="w-10 h-10 object-cover rounded-lg border border-white/20" alt="Preview" />
                    )}
                    <button
                      onClick={() => setSportsCertificate("")}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Sports context, matches played, positions, extra achievements details..."
            value={sportsDesc}
            onChange={(e) => setSportsDesc(e.target.value)}
            className={`w-full border rounded-2xl px-5 py-4 outline-none min-h-[120px] mb-6 transition-all duration-300 ${
              themeMode === "dark" ? "bg-white/10 border-white/10 text-white placeholder-gray-400" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />

          <div className="flex gap-2 mb-6">
            <button
              onClick={addSportsAchievement}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 px-8 py-4 rounded-2xl font-semibold text-black"
            >
              {editingSportsId ? "Update Sports Record" : "Add Sports Record"}
            </button>
            {editingSportsId && (
              <button
                onClick={cancelEditSportsAchievement}
                className="px-5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>

          {/* LIVE PREVIEW WIDGET */}
          {(sportsName || sportsAward || sportsLevel) && (
            <div className="mb-8 p-6 border border-dashed border-yellow-500/20 rounded-2xl bg-yellow-500/5">
              <h4 className="text-xs uppercase font-bold tracking-widest text-yellow-400 mb-4 flex items-center gap-2">
                <Eye size={14} /> Live Preview ({selectedTheme} Theme)
              </h4>
              <div className="max-w-md">
                <div className={getPreviewThemeStyles().card}>
                  <div className={`${getPreviewThemeStyles().borderAccent || "border-l-3 border-amber-500"} pl-4`}>
                    <p className="text-xs font-bold uppercase tracking-wide leading-tight">{sportsName || "Football Captain"}</p>
                    <p className="text-[11px] opacity-70 mt-1">Level: {sportsLevel || "University Level"}</p>
                    {sportsAward && (
                      <span className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] px-2 py-0.5 rounded mt-1.5 font-bold">
                        Award: {sportsAward}
                      </span>
                    )}
                    {sportsDate && <p className="text-[9px] opacity-40 mt-1">Date: {new Date(sportsDate).toLocaleDateString()}</p>}
                    {sportsDesc && <p className="text-[10px] opacity-60 mt-1.5 line-clamp-2">{sportsDesc}</p>}
                    {sportsCertificate && (
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-2.5 ${getPreviewThemeStyles().accentText}`}>
                        <Trophy size={10} /> Merit Medal Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            {sportsAchievements.map((item) => (
              <div
                key={item.id}
                className={`border rounded-3xl p-6 relative group transition-colors duration-300 ${
                  themeMode === "dark" ? "bg-white/10 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <h3 className="text-2xl font-bold">{item.sportName}</h3>
                    <p className="text-yellow-400 text-sm font-semibold mt-1">Level: {item.level}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200 shrink-0">
                    <button
                      onClick={() => startEditSportsAchievement(item)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-xl transition"
                      title="Edit record"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteSportsAchievement(item.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-400 mb-4">
                  <p>Achievement/Award: <strong className="text-gray-300">{item.achievement}</strong></p>
                  <p>Date: <strong className="text-gray-300">{new Date(item.date).toLocaleDateString()}</strong></p>
                  {item.description && <p className="mt-2 text-xs leading-relaxed">{item.description}</p>}
                </div>

                <div className="flex gap-3 flex-wrap">
                  {item.certificateUrl && (
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-2xl inline-flex items-center gap-2 text-sm font-semibold transition"
                    >
                      <Trophy size={15} /> View Merit Proof
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI CAREER ADVISOR SECTION */}
        <div
  id="ai-section"
  className={`mt-10 border rounded-3xl p-8 backdrop-blur-xl transition-colors duration-300 ${
    themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
  }`}
>
  <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
    <div>
      <h2 className="text-3xl font-bold flex items-center gap-3 text-purple-400">
        <Sparkles className="text-purple-400 animate-pulse" size={32} />
        AI Career Advisor & SOP Generator
      </h2>
      <p className="text-gray-400 text-sm mt-1">
        Personalized insights, Statements of Purpose, and higher education paths synthesized directly from your MCC achievements.
      </p>
    </div>
    <div className="flex items-center gap-3">
      {aiAnalysis && (
        <button
          onClick={downloadReadinessReport}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-semibold transition shadow-md"
        >
          <Download size={18} /> Download Readiness Report
        </button>
      )}
      <div className="bg-purple-500/10 border border-purple-500/20 px-5 py-3 rounded-2xl flex items-center gap-2">
        <span className="text-xs uppercase font-mono text-purple-400">Advisor Status:</span>
        <span className={`text-sm font-bold flex items-center gap-1 transition-colors duration-300 ${
          themeMode === "dark" ? "text-white" : "text-slate-800"
        }`}>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
          Ready to Advise
        </span>
      </div>
    </div>
  </div>

  <div className="grid md:grid-cols-2 gap-8">
    {/* PORTFOLIO HEALTH CHECK & SKILL GAP ANALYSIS */}
    <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 ${
      themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
    }`}>
      <div>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
          themeMode === "dark" ? "text-white" : "text-slate-900"
        }`}>
          <CheckCircle className="text-emerald-400" size={20} />
          Profile Health & Career Focus
        </h3>
        
        {/* SCORE BAR */}
        {(() => {
          let score = aiAnalysis?.profileCompleteness;
          if (score === undefined) {
            score = 20;
            if (bio) score += 15;
            if (profileImageUrl) score += 15;
            if (linkedInUrl) score += 10;
            if (gitHubUrl) score += 10;
            if (skills.length >= 3) score += 10;
            else if (skills.length > 0) score += 5;
            if (projects.length >= 2) score += 10;
            else if (projects.length > 0) score += 5;
            if (resumes.length > 0) score += 10;
          }
          return (
            <div className="mb-6">
              <div className="flex justify-between items-center text-sm font-semibold mb-2">
                <span className="text-gray-400">Portfolio Completeness Score</span>
                <span className="text-purple-400 font-mono text-lg">{score}%</span>
              </div>
              <div className={`w-full h-3.5 rounded-full overflow-hidden transition-colors duration-300 ${
                themeMode === "dark" ? "bg-white/10" : "bg-slate-200"
              }`}>
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          );
        })()}

        {/* CHECKLIST */}
        <div className="space-y-3 mt-4 text-sm border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center gap-3">
            {bio ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className={bio ? (themeMode === "dark" ? "text-gray-300" : "text-slate-700 font-medium") : (themeMode === "dark" ? "text-gray-500" : "text-slate-400")}>Student Bio Statement</span>
          </div>
          <div className="flex items-center gap-3">
            {profileImageUrl ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className={profileImageUrl ? (themeMode === "dark" ? "text-gray-300" : "text-slate-700 font-medium") : (themeMode === "dark" ? "text-gray-500" : "text-slate-400")}>Profile Photo Upload</span>
          </div>
          <div className="flex items-center gap-3">
            {linkedInUrl || gitHubUrl ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className={linkedInUrl || gitHubUrl ? (themeMode === "dark" ? "text-gray-300" : "text-slate-700 font-medium") : (themeMode === "dark" ? "text-gray-500" : "text-slate-400")}>LinkedIn & GitHub Connectivity</span>
          </div>
          <div className="flex items-center gap-3">
            {skills.length >= 3 ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className={skills.length >= 3 ? (themeMode === "dark" ? "text-gray-300" : "text-slate-700 font-medium") : (themeMode === "dark" ? "text-gray-500" : "text-slate-400")}>Core Technical Skills (At least 3)</span>
          </div>
          <div className="flex items-center gap-3">
            {projects.length >= 2 ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className={projects.length >= 2 ? (themeMode === "dark" ? "text-gray-300" : "text-slate-700 font-medium") : (themeMode === "dark" ? "text-gray-500" : "text-slate-400")}>Real-world Projects (At least 2)</span>
          </div>
          <div className="flex items-center gap-3">
            {resumes.length > 0 ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className={resumes.length > 0 ? (themeMode === "dark" ? "text-gray-300" : "text-slate-700 font-medium") : (themeMode === "dark" ? "text-gray-500" : "text-slate-400")}>Professional Resume PDF Upload</span>
          </div>
        </div>

        {/* SKILL GAP ANALYSIS ROW */}
        {aiAnalysis ? (
          <div>
            <h4 className={`text-lg font-bold mb-3 flex items-center gap-2 transition-colors duration-300 ${
              themeMode === "dark" ? "text-white" : "text-slate-900"
            }`}>
              <Sparkles className="text-yellow-400" size={18} />
              Skill Gap for {aiAnalysis.targetCareer}
            </h4>
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-gray-400">Required Skill Match</span>
                <span className="text-emerald-400 font-mono">{aiAnalysis.skillMatchPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${aiAnalysis.skillMatchPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-1">Skills You Have:</span>
                <div className="flex flex-wrap gap-1.5">
                  {aiAnalysis.matchedSkills && aiAnalysis.matchedSkills.length > 0 ? (
                    aiAnalysis.matchedSkills.map((sk: string) => (
                      <span key={sk} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">No matching skills found yet for this career path.</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-1">Missing Requirements (Add to Profile):</span>
                <div className="flex flex-wrap gap-1.5">
                  {aiAnalysis.missingSkills && aiAnalysis.missingSkills.length > 0 ? (
                    aiAnalysis.missingSkills.map((sk: string) => (
                      <span key={sk} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full font-mono">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> All career path requirements satisfied!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-xs italic">
            Enter profile information and save to view career skill gap analysis.
          </div>
        )}
      </div>

      <div className={`mt-6 p-4 border rounded-xl text-xs transition-colors duration-300 ${
        themeMode === "dark" ? "bg-white/5 border-white/5 text-gray-400" : "bg-purple-50/50 border-purple-100 text-purple-750"
      }`}>
        📌 <span className={`font-bold ${themeMode === "dark" ? "text-gray-300" : "text-purple-900"}`}>MCC Recruiter Tip:</span> Students with completeness scores above 85% receive 4x more visibility on our placement portal search engine. Keep uploading your credentials!
      </div>

      {aiAnalysis && (
        <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
          {aiAnalysis.resumeSuggestions && aiAnalysis.resumeSuggestions.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 transition-colors duration-300 ${
                themeMode === "dark" ? "text-purple-300" : "text-purple-800"
              }`}>
                <FileText size={15} /> AI Resume Suggestions
              </h4>
              <ul className="space-y-1.5 text-xs">
                {aiAnalysis.resumeSuggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-400">
                    <span className="text-purple-400 select-none">•</span>
                    <span className={themeMode === "dark" ? "text-gray-300" : "text-slate-700"}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiAnalysis.portfolioImprovementSuggestions && aiAnalysis.portfolioImprovementSuggestions.length > 0 && (
            <div className="pt-2">
              <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 transition-colors duration-300 ${
                themeMode === "dark" ? "text-indigo-300" : "text-indigo-800"
              }`}>
                <Sparkles size={15} className="text-indigo-400" /> AI Portfolio Suggestions
              </h4>
              <ul className="space-y-1.5 text-xs">
                {aiAnalysis.portfolioImprovementSuggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-400">
                    <span className="text-indigo-400 select-none">•</span>
                    <span className={themeMode === "dark" ? "text-gray-300" : "text-slate-700"}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>

    {/* AI SOP GENERATOR */}
    <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 ${
      themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
    }`}>
      <div>
        <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 transition-colors duration-300 ${
          themeMode === "dark" ? "text-white" : "text-slate-900"
        }`}>
          <Sparkles className="text-purple-400" size={20} />
          AI SOP Generator
        </h3>
        <p className={`text-sm mb-5 leading-relaxed transition-colors duration-300 ${
          themeMode === "dark" ? "text-gray-400" : "text-slate-600"
        }`}>
          Generate an academic or professional Statement of Purpose (SOP) built dynamically around your department, skills, and projects for admissions or placements.
        </p>

        {/* TONE SELECTOR & PATH */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">SOP Tone / Focus</label>
            <select
              value={sopTone}
              onChange={(e) => setSopTone(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 outline-none text-xs transition-all duration-300 ${
                themeMode === "dark" ? "bg-[#0b0b0f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <option value="Academic">Academic (Postgraduate Study)</option>
              <option value="Corporate">Corporate (Industry Jobs)</option>
              <option value="Startup">Startup (Fast-Paced Builders)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Target Path</label>
            <input
              type="text"
              value={targetCareer || "your career"}
              disabled
              placeholder="Set career focus in profile"
              className={`w-full border rounded-xl px-3 py-2 text-xs opacity-70 cursor-not-allowed ${
                themeMode === "dark" ? "bg-white/5 border-white/10 text-white" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}
            />
          </div>
        </div>

        {generatedSop ? (
          <textarea
            value={generatedSop}
            onChange={(e) => setGeneratedSop(e.target.value)}
            className={`w-full h-44 border rounded-xl p-4 text-xs font-mono outline-none leading-relaxed resize-none overflow-y-auto mb-4 transition-colors duration-300 ${
              themeMode === "dark" ? "bg-black border-white/10 text-gray-300" : "bg-white border-slate-200 text-slate-800"
            }`}
          />
        ) : (
          <div className={`h-44 border border-dashed rounded-xl flex items-center justify-center text-center p-6 text-sm mb-4 leading-relaxed transition-colors duration-300 ${
            themeMode === "dark" ? "bg-black border-white/10 text-gray-500" : "bg-slate-100 border-slate-200 text-slate-400"
          }`}>
            Click "Generate SOP" to synthesize your portfolio entries into a cohesive Statement of Purpose.
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleGenerateSop}
          disabled={generatingSop}
          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-sm transition"
        >
          {generatingSop ? "SOP Synthesis Engine Initializing..." : generatedSop ? "Re-Generate SOP" : "Generate SOP"}
        </button>
        {generatedSop && (
          <>
            <button
              onClick={() => {
                setSop(generatedSop);
                alert("Generated SOP applied to your Profile settings! Don't forget to click 'Save Profile Details' to save permanently.");
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 rounded-xl text-sm font-semibold transition animate-pulse"
            >
              Apply to Profile
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedSop);
                alert("SOP copied to clipboard!");
              }}
              className={`px-5 rounded-xl text-sm font-semibold transition border transition-colors duration-300 ${
                themeMode === "dark"
                  ? "bg-white/10 hover:bg-white/20 border-white/10 text-white"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
            >
              Copy
            </button>
          </>
        )}
      </div>
    </div>
  </div>

  {/* CAREER RECOMMENDATIONS & SCHOLARSHIP MATCHES */}
  <div className="mt-8 grid md:grid-cols-2 gap-6">
    {/* CAREER PATH MATCHING */}
    <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
      themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
    }`}>
      <h4 className="text-lg font-bold mb-3 text-purple-400">🎯 AI Career Path Matching</h4>
      <p className={`text-xs mb-4 transition-colors duration-300 ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>
        Match ratings for popular software and research careers based on your skill registry:
      </p>
      <div className="space-y-4">
        {aiAnalysis?.careerRecommendations && aiAnalysis.careerRecommendations.length > 0 ? (
          aiAnalysis.careerRecommendations.map((rec: any, index: number) => (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className={themeMode === "dark" ? "text-white" : "text-slate-900"}>{rec.career}</span>
                <span className="text-purple-400 font-mono">{rec.matchPercentage}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden transition-colors duration-300 ${
                themeMode === "dark" ? "bg-white/10" : "bg-slate-200"
              }`}>
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${rec.matchPercentage}%` }}
                ></div>
              </div>
              <div className="flex flex-wrap gap-1 text-[9px] mt-1 select-none">
                {rec.matchedSkills.map((sk: string) => (
                  <span key={sk} className="bg-emerald-500/10 text-emerald-450 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                    {sk}
                  </span>
                ))}
                {rec.missingSkills.map((sk: string) => (
                  <span key={sk} className="bg-rose-500/10 text-rose-450 px-1.5 py-0.5 rounded border border-rose-500/15 font-mono">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 italic">No career path matches computed.</p>
        )}
      </div>
    </div>

    {/* UNIVERSITY RECOMMENDATIONS */}
    <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
      themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
    }`}>
      <h4 className="text-lg font-bold mb-3 text-cyan-400">🎓 University Admissions</h4>
      <p className={`text-xs mb-4 transition-colors duration-300 ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>Top admissions matches matching your major in {user?.department || "your department"}:</p>
      <ul className={`space-y-4 text-sm leading-relaxed transition-colors duration-300 ${themeMode === "dark" ? "text-gray-300" : "text-slate-700"}`}>
        {aiAnalysis?.universities && aiAnalysis.universities.length > 0 ? (
          aiAnalysis.universities.map((univ: any, index: number) => (
            <li key={index}>
              🏫 <span className={`font-bold transition-colors duration-300 ${themeMode === "dark" ? "text-white" : "text-slate-900"}`}>{univ.name}</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">{univ.country}</span>
              <span className={`text-xs block font-semibold transition-colors duration-300 ${themeMode === "dark" ? "text-gray-300" : "text-slate-600"}`}>{univ.program}</span>
              <span className={`text-xs block transition-colors duration-300 ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>{univ.details}</span>
            </li>
          ))
        ) : (
          <li className="text-xs text-gray-500 italic">No recommendations loaded.</li>
        )}
      </ul>
    </div>

    {/* PLACEMENT & INTERNSHIPS */}
    <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
      themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
    }`}>
      <h4 className="text-lg font-bold mb-3 text-emerald-400">💼 Internship & Placements</h4>
      <p className={`text-xs mb-4 transition-colors duration-300 ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>High-impact engineering roles that pair with your custom portfolio metrics:</p>
      <ul className={`space-y-4 text-sm leading-relaxed transition-colors duration-300 ${themeMode === "dark" ? "text-gray-300" : "text-slate-700"}`}>
        {aiAnalysis?.internships && aiAnalysis.internships.length > 0 ? (
          aiAnalysis.internships.map((intern: any, index: number) => (
            <li key={index}>
              🚀 <span className={`font-bold transition-colors duration-300 ${themeMode === "dark" ? "text-white" : "text-slate-900"}`}>{intern.company}</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">{intern.location}</span>
              <span className={`text-xs block font-semibold transition-colors duration-300 ${themeMode === "dark" ? "text-gray-300" : "text-slate-600"}`}>{intern.role}</span>
              <p className={`text-xs mt-0.5 text-gray-400 transition-colors duration-300`}>{intern.description}</p>
              <span className={`text-xs block text-purple-400 font-medium transition-colors duration-300`}>💡 {intern.matchReason}</span>
            </li>
          ))
        ) : (
          <li className="text-xs text-gray-500 italic">No internship recommendations loaded.</li>
        )}
      </ul>
    </div>

    {/* SCHOLARSHIPS & FELLOWSHIPS */}
    <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
      themeMode === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200 shadow-sm"
    }`}>
      <h4 className="text-lg font-bold mb-3 text-yellow-400">✨ Scholarships & Incubation</h4>
      <p className={`text-xs mb-4 transition-colors duration-300 ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>Elite educational awards and funding structures that fit your profile:</p>
      <ul className={`space-y-4 text-sm leading-relaxed transition-colors duration-300 ${themeMode === "dark" ? "text-gray-300" : "text-slate-700"}`}>
        {aiAnalysis?.scholarships && aiAnalysis.scholarships.length > 0 ? (
          aiAnalysis.scholarships.map((schol: any, index: number) => (
            <li key={index}>
              🏆 <span className={`font-bold transition-colors duration-300 ${themeMode === "dark" ? "text-white" : "text-slate-900"}`}>{schol.title}</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">{schol.amount}</span>
              <span className={`text-xs block transition-colors duration-300 ${themeMode === "dark" ? "text-gray-400" : "text-slate-500"}`}>{schol.details}</span>
              {schol.eligible ? (
                <span className="inline-block text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full mt-1 border border-green-500/20 font-bold">✓ Profile Eligible</span>
              ) : (
                <span className="inline-block text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full mt-1 border border-red-500/20 font-bold">✗ Conditions Unmet</span>
              )}
            </li>
          ))
        ) : (
          <li className="text-xs text-gray-500 italic">No scholarships loaded.</li>
        )}
      </ul>
    </div>
  </div>
</div>

      </div>

    </div>
  );
}