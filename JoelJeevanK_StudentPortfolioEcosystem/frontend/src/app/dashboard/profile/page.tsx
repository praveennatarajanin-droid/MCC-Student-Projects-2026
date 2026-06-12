"use client";

import { useEffect, useState } from "react";
import {
  User, Phone, BookOpen, FileText, CheckCircle2, AlertCircle,
  Camera, Loader2, Sparkles, BrainCircuit, Palette, Laptop,
  Compass, Eye, Rocket, Save, Zap, ExternalLink
} from "lucide-react";

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
import { apiRequest, BACKEND_URL, getAuthHeaders } from "@/utils/api";

/* ── Theme definitions — no preview colours, icon + label only ── */
const THEMES = [
  { id: "Academic Theme",     label: "Academic",      icon: BookOpen,    desc: "University serif"    },
  { id: "Corporate Theme",    label: "Corporate",     icon: Laptop,      desc: "Executive clean"     },
  { id: "Startup Theme",      label: "Startup",       icon: Rocket,      desc: "Bold & energetic"    },
  { id: "Creative Theme",     label: "Creative",      icon: Palette,     desc: "Editorial design"    },
  { id: "AI Futuristic Theme",label: "AI Futuristic", icon: BrainCircuit,desc: "Cyber terminal"      },
];

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "", email: "", department: "", gender: "", username: "",
    profile: { bio: "", phone: "", personalEmail: "", personalStory: "", sop: "", profileImageUrl: "", skills: "", theme: "Academic Theme", gitHubUsername: "", behanceUsername: "" },
  });

  const [formData, setFormData] = useState({
    bio: "", phone: "", personalEmail: "", personalStory: "", sop: "", skills: "", theme: "Academic Theme", gitHubUsername: "", behanceUsername: "",
  });

  const [githubUser, setGithubUser] = useState<any>(null);
  const [verifyingGithub, setVerifyingGithub] = useState(false);
  const [githubInput, setGithubInput] = useState("");

  const [behanceUser, setBehanceUser] = useState<any>(null);
  const [verifyingBehance, setVerifyingBehance] = useState(false);
  const [behanceInput, setBehanceInput] = useState("");
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - cropOffset.x,
      y: e.touches[0].clientY - cropOffset.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setCropOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [generatingSop, setGeneratingSop] = useState(false);
  const [message,       setMessage]       = useState({ text: "", type: "" });

  async function fetchGithubDetails(username: string) {
    try {
      const res = await fetch(`https://api.github.com/users/${username}`);
      if (res.ok) {
        const data = await res.json();
        setGithubUser(data);
      }
    } catch (e) {
      console.error("Failed to fetch Github details", e);
    }
  }

  async function fetchBehanceDetails(username: string) {
    try {
      const mockBehanceData = {
        name: username.charAt(0).toUpperCase() + username.slice(1) + " Designs",
        username: username,
        views: 2450,
        appreciations: 432,
        followers: 128,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        bio: "Creative Visual Designer & UI/UX enthusiast at Madras Christian College."
      };
      setBehanceUser(mockBehanceData);
    } catch (e) {
      console.error("Failed to fetch Behance details", e);
    }
  }

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/profile");
      const normalize = (s: string) => {
        if (!s) return "Academic Theme";
        const c = s.trim().toLowerCase().replace(/\s*theme\s*/g, "").replace(/\s+/g, "");
        if (c === "corporate")                        return "Corporate Theme";
        if (c === "startup")                          return "Startup Theme";
        if (c === "creative")                         return "Creative Theme";
        if (c === "aifuturistic" || c === "futuristic") return "AI Futuristic Theme";
        return "Academic Theme";
      };
      const p = data.profile || {};
      const normalizedTheme = normalize(p.theme);
      
      data.profile = { ...p, theme: normalizedTheme };
      setProfileData(data);
      
      setFormData({ bio: p.bio || "", phone: p.phone || "", personalEmail: p.personalEmail || "", personalStory: p.personalStory || "", sop: p.sop || "", skills: p.skills || "", theme: normalizedTheme, gitHubUsername: p.gitHubUsername || "", behanceUsername: p.behanceUsername || "" });
      setGithubInput(p.gitHubUsername || "");
      if (p.gitHubUsername) {
        fetchGithubDetails(p.gitHubUsername);
      }
      setBehanceInput(p.behanceUsername || "");
      if (p.behanceUsername) {
        fetchBehanceDetails(p.behanceUsername);
      }
      localStorage.setItem("isApproved", String(data.isApproved));
      window.dispatchEvent(new Event("profileUpdate"));
      
      try {
        const records = await apiRequest("/api/academic");
        setAcademicRecords(records || []);
      } catch (err) {
        console.error("Failed to load academic records", err);
      }
      try {
        const certs = await apiRequest("/api/certification");
        setCertifications(certs || []);
      } catch (err) {
        console.error("Failed to load certifications", err);
      }
      try {
        const acts = await apiRequest("/api/activity");
        setActivities(acts || []);
      } catch (err) {
        console.error("Failed to load activities", err);
      }
    } catch {
      setMessage({ text: "Failed to load profile details.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);



  const handleVerifyGithub = async () => {
    if (!githubInput.trim()) {
      setMessage({ text: "Please enter a GitHub username.", type: "error" });
      return;
    }
    setVerifyingGithub(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await fetch(`https://api.github.com/users/${githubInput.trim()}`);
      if (!res.ok) {
        throw new Error("GitHub profile not found. Please check the username.");
      }
      const data = await res.json();
      setGithubUser(data);
      setFormData(prev => ({ ...prev, gitHubUsername: data.login }));
      setMessage({ text: `Successfully connected to GitHub profile: ${data.login}! Click 'Save Profile' to save changes permanently.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to verify GitHub username.", type: "error" });
      setGithubUser(null);
    } finally {
      setVerifyingGithub(false);
    }
  };

  const handleDisconnectGithub = () => {
    setGithubUser(null);
    setGithubInput("");
    setFormData(prev => ({ ...prev, gitHubUsername: "" }));
    setMessage({ text: "GitHub profile disconnected. Click 'Save Profile' to save changes permanently.", type: "success" });
  };



  const handleVerifyBehance = async () => {
    if (!behanceInput.trim()) {
      setMessage({ text: "Please enter a Behance username.", type: "error" });
      return;
    }
    setVerifyingBehance(true);
    setMessage({ text: "", type: "" });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const username = behanceInput.trim();
      const mockBehanceData = {
        name: username.charAt(0).toUpperCase() + username.slice(1) + " Designs",
        username: username,
        views: 2450,
        appreciations: 432,
        followers: 128,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        bio: "Creative Visual Designer & UI/UX enthusiast at Madras Christian College."
      };
      setBehanceUser(mockBehanceData);
      setFormData(prev => ({ ...prev, behanceUsername: username }));
      setMessage({ text: `Successfully connected to Behance profile: @${username}! Click 'Save Profile' to save changes permanently.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to verify Behance username.", type: "error" });
      setBehanceUser(null);
    } finally {
      setVerifyingBehance(false);
    }
  };

  const handleDisconnectBehance = () => {
    setBehanceUser(null);
    setBehanceInput("");
    setFormData(prev => ({ ...prev, behanceUsername: "" }));
    setMessage({ text: "Behance profile disconnected. Click 'Save Profile' to save changes permanently.", type: "success" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ text: "", type: "" });
  };

  const handleAiGenerateSop = () => {
    if (!formData.personalStory) {
      setMessage({ text: "Please write your Personal Story first so the AI can build a tailored Statement of Purpose.", type: "error" });
      return;
    }

    setGeneratingSop(true);
    setTimeout(() => {
      const dept = profileData.department || "Undergraduate Studies";
      const name = profileData.name || "Student";
      const skillsList = formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
      const certNames = certifications.map(c => c.name).filter(Boolean);
      const activityDetails = activities.map(a => `${a.title} at ${a.organization}`).filter(Boolean);

      let sopText = `STATEMENT OF PURPOSE\n\n`;
      
      // Introduction
      sopText += `As a dedicated student in the Department of ${dept} at Madras Christian College, my academic journey has been guided by a strong desire to synthesize theoretical knowledge with practical industry impact. My name is ${name}, and I have committed myself to achieving excellence in my academic discipline, cultivating a robust toolkit of technical and analytical skills.\n\n`;

      // Personal Story Integration
      sopText += `My personal story and character have been profoundly shaped by my unique experiences and milestones. ${formData.personalStory.trim()}\n\n`;

      // Skills and Academics
      if (skillsList.length > 0) {
        sopText += `Throughout my curriculum at MCC, I have developed professional competence in several core areas, most notably ${skillsList.slice(0, 4).join(", ")}. In my studies, I have consistently sought to apply these skills to solve real-world problems. `;
        if (skillsList.length > 4) {
          sopText += `Furthermore, my exposure to ${skillsList.slice(4).join(", ")} has given me a versatile edge in adapting to rapidly evolving industry workflows. `;
        }
        sopText += `\n\n`;
      }

      // Certifications
      if (certNames.length > 0) {
        sopText += `To complement my classroom learning, I have pursued professional validation of my expertise. Earning credentials such as ${certNames.slice(0, 3).join(" and ")} has not only deepened my command of these areas but also demonstrated my proactive drive for continuous learning and self-improvement.\n\n`;
      }

      // NGO & Activities
      if (activityDetails.length > 0) {
        sopText += `Beyond academics, I believe in holistic development and social responsibility. My active participation in social impact initiatives, including my work with ${activityDetails.slice(0, 2).join(" and ")}, has cultivated crucial leadership, empathy, and team collaboration skills. These experiences have taught me how to apply structured problem-solving methodologies to community-centered challenges.\n\n`;
      }

      // Conclusion
      sopText += `Looking ahead, my goal is to leverage my academic foundation from Madras Christian College to make high-impact contributions in my professional career. Whether through post-graduate research or advanced roles in the global industry, I aim to combine my domain skills to drive digital and operational transformation, matching MCC's heritage of service and academic excellence.`;

      setFormData(prev => ({ ...prev, sop: sopText }));
      setGeneratingSop(false);
      setMessage({ text: "AI drafted your Statement of Purpose based on your story, skills, credentials, and activities!", type: "success" });
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Validation for optional bio
    if (formData.bio && formData.bio.trim().length > 150) {
      setMessage({ text: "Bio / Tagline cannot exceed 150 characters.", type: "error" });
      setSaving(false);
      return;
    }

    // Validation for optional phone number
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setMessage({ text: "Please enter a valid Phone Number (7 to 15 digits).", type: "error" });
        setSaving(false);
        return;
      }
    }

    // Validation for optional personal email
    if (formData.personalEmail && formData.personalEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.personalEmail.trim())) {
        setMessage({ text: "Please enter a valid personal email address.", type: "error" });
        setSaving(false);
        return;
      }
    }

    // Validation for optional skills
    if (formData.skills && formData.skills.trim()) {
      const skillsList = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
      if (skillsList.length === 0) {
        setMessage({ text: "Please enter a valid comma-separated list of skills.", type: "error" });
        setSaving(false);
        return;
      }
    }

    try {
      await apiRequest("/api/profile", { method: "PUT", body: JSON.stringify(formData) });
      setMessage({ text: "Profile updated successfully.", type: "success" });
      setProfileData(prev => ({ ...prev, profile: { ...prev.profile, ...formData } }));
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save changes.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please select a valid image file.", type: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "Image size must be less than 5MB.", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
      setCropScale(1);
      setCropOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = () => {
    if (!cropImage) return;
    setUploading(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setUploading(false);
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);

      const imgWidth = img.width;
      const imgHeight = img.height;
      const baseScale = Math.max(400 / imgWidth, 400 / imgHeight);
      const drawWidth = imgWidth * baseScale * cropScale;
      const drawHeight = imgHeight * baseScale * cropScale;

      const drawX = 200 - drawWidth / 2 + cropOffset.x;
      const drawY = 200 - drawHeight / 2 + cropOffset.y;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setUploading(false);
          return;
        }
        
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        const fd = new FormData();
        fd.append("file", file);

        try {
          const response = await fetch(`${BACKEND_URL}/api/profile/upload-image`, {
            method: "POST",
            headers: {
              ...getAuthHeaders()
            },
            body: fd,
          });
          let data;
          try {
            data = await response.json();
          } catch {
            data = {};
          }
          if (!response.ok) throw new Error(data.message || "Upload failed");
          setProfileData(prev => ({ ...prev, profile: { ...prev.profile, profileImageUrl: data.imageUrl } }));
          setMessage({ text: "Profile photo updated successfully.", type: "success" });
          window.dispatchEvent(new Event("profileUpdate"));
        } catch (err: any) {
          setMessage({ text: err.message || "Failed to upload image.", type: "error" });
        } finally {
          setUploading(false);
          setCropImage(null);
        }
      }, "image/jpeg", 0.9);
    };
    img.src = cropImage;
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-7 w-7 text-mcc-crimson dark:text-mcc-gold animate-spin" />
      <p className="text-slate-400 text-sm">Loading profile…</p>
    </div>
  );

  const pImageUrl = profileData.profile?.profileImageUrl
    ? `${BACKEND_URL}${profileData.profile.profileImageUrl}`
    : "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80";

  const completeness = [
    { label: "Photo uploaded",        done: !!profileData.profile?.profileImageUrl },
    { label: "Bio / tagline",         done: !!formData.bio },
    { label: "Contact phone",         done: !!formData.phone },
    { label: "Skills added (min 3)",  done: formData.skills.split(",").filter(Boolean).length >= 3 },
    { label: "Personal story",        done: !!formData.personalStory },
    { label: "Statement of purpose",  done: !!formData.sop },
    { label: "Academic Records added", done: academicRecords.length > 0 },
    { label: "Behance linked (Optional)", done: !!formData.behanceUsername },
  ];
  const doneCount = completeness.filter(c => c.done).length;

  // Helper to generate dynamic advice
  const getDynamicCareerGuidance = () => {
    const dept = profileData.department || "";
    const skills = formData.skills ? formData.skills.split(",").map(s => s.trim().toLowerCase()).filter(Boolean) : [];
    const skillsRaw = formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
    const hasStory = !!formData.personalStory;
    const hasSop = !!formData.sop;
    const certCount = certifications.length;
    const activityCount = activities.length;

    // 1. Ideal Career Paths
    let paths: string[] = [];
    if (dept.includes("Computer") || dept.includes("BCA")) {
      if (skills.some(s => s.includes("machine") || s.includes("ml") || s.includes("ai") || s.includes("python") || s.includes("data"))) {
        paths.push("AI / Machine Learning Engineer");
        paths.push("Data Science Specialist");
      }
      if (skills.some(s => s.includes("react") || s.includes("front") || s.includes("web") || s.includes("js") || s.includes("css") || s.includes("html"))) {
        paths.push("Frontend Web Architect");
        paths.push("Creative UI/UX Engineer");
      }
      if (skills.some(s => s.includes("c#") || s.includes("sql") || s.includes("net") || s.includes("back") || s.includes("db"))) {
        paths.push("Backend Systems Developer");
        paths.push("Database & Cloud Architect");
      }
      if (paths.length < 3) paths.push("Full Stack Software Engineer");
      if (paths.length < 3) paths.push("Enterprise IT Consultant");
    } else if (dept.includes("Commerce") || dept.includes("Business") || dept.includes("BBA") || dept.includes("B.Com")) {
      paths.push("Business Strategy Consultant");
      if (skills.some(s => s.includes("finance") || s.includes("account") || s.includes("tax") || s.includes("audit"))) {
        paths.push("Corporate Financial Analyst");
        paths.push("Tax & Audit Consultant");
      } else {
        paths.push("Marketing & Brand Manager");
        paths.push("Human Resource Specialist");
      }
    } else if (dept.includes("Visual") || dept.includes("English") || dept.includes("Literature") || dept.includes("Communication")) {
      paths.push("Creative Visual Director");
      paths.push("UI/UX Experience Designer");
      paths.push("Digital Content Strategist");
    } else if (dept.includes("Chemistry") || dept.includes("Physics") || dept.includes("Mathematics")) {
      paths.push("Research Scientist & Analyst");
      paths.push("Quantitative Research Analyst");
      paths.push("Academic Lecturer & Consultant");
    } else {
      if (skillsRaw.length > 0) {
        paths.push(`${skillsRaw[0]} Systems Specialist`);
        if (skillsRaw.length > 1) paths.push(`${skillsRaw[1]} Consultant`);
      }
      paths.push("Academic & Industry Consultant");
    }
    paths = Array.from(new Set(paths)).slice(0, 3);

    // 2. Recruiter Matches
    let recruiters: { name: string; score: number }[] = [];
    if (dept.includes("Computer") || dept.includes("BCA")) {
      recruiters = [
        { name: "Microsoft Development Centre", score: certCount > 1 ? 96 : 91 },
        { name: "Cognizant Technology Solutions", score: skills.length > 4 ? 94 : 88 },
        { name: "Zoho Corporation Research Lab", score: 92 }
      ];
    } else if (dept.includes("Commerce") || dept.includes("Business") || dept.includes("B.Com") || dept.includes("BBA")) {
      recruiters = [
        { name: "Goldman Sachs Advisory Group", score: certCount > 0 ? 95 : 90 },
        { name: "Deloitte Tax & Audit", score: 92 },
        { name: "KPMG Placement cell", score: 89 }
      ];
    } else if (dept.includes("Visual") || dept.includes("Communication")) {
      recruiters = [
        { name: "Adobe Creative Hub", score: 95 },
        { name: "Ogilvy & Mather Design", score: 91 },
        { name: "Netflix Production Cell", score: 87 }
      ];
    } else {
      recruiters = [
        { name: "Infosys Research & Science", score: 93 },
        { name: "TCS Innovation Labs", score: 89 },
        { name: "Madras Christian College Research Cell", score: 95 }
      ];
    }

    // 3. Profile Tips
    const tips: string[] = [];
    if (!formData.bio) tips.push("Add a short bio tagline under Basic Info.");
    if (skills.length < 3) tips.push("List at least 3 professional skills.");
    if (!hasStory) tips.push("Complete your Personal Story narrative.");
    if (!hasSop) tips.push("Draft your Statement of Purpose.");
    if (certCount === 0) tips.push("Add a professional certification under Credentials.");
    if (activityCount === 0) tips.push("Log NGO / Extracurricular activity logs.");
    
    if (tips.length === 0) {
      tips.push("Your portfolio profile is 105% complete! Great work!");
      tips.push("Verify your credentials with Admin to secure placards.");
    } else {
      tips.push("Link GitHub/Behance to fetch your real-time portfolios.");
    }

    return { paths, recruiters, tips };
  };

  const hasChanges = 
    formData.bio !== (profileData.profile?.bio || "") ||
    formData.phone !== (profileData.profile?.phone || "") ||
    formData.personalEmail !== (profileData.profile?.personalEmail || "") ||
    formData.skills !== (profileData.profile?.skills || "") ||
    formData.personalStory !== (profileData.profile?.personalStory || "") ||
    formData.sop !== (profileData.profile?.sop || "") ||
    formData.theme !== (profileData.profile?.theme || "Academic Theme") ||
    formData.gitHubUsername !== (profileData.profile?.gitHubUsername || "") ||
    formData.behanceUsername !== (profileData.profile?.behanceUsername || "");

  const advice = getDynamicCareerGuidance();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-7"
    >

      {/* ── Page heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Profile &amp; Story</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your public portfolio identity and personal narrative.</p>
        </div>
        {profileData.username && (
          <a
            href={`/student/${profileData.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Eye className="h-3.5 w-3.5" /> View Public Site
          </a>
        )}
      </div>

      {/* ── Alert ── */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            key="msg"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
            }`}
          >
            {message.type === "success"
              ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              : <AlertCircle  className="h-4 w-4 shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ───── Left sidebar ───── */}
        <div className="lg:col-span-1 flex flex-col gap-5">

          {/* Profile identity card */}
          <div className="glass-panel rounded-2xl overflow-hidden">

            {/* Avatar row */}
            <div className="p-5 flex flex-col items-center text-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <img
                  src={pImageUrl}
                  alt={profileData.name}
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                />
                <label className="absolute bottom-0 right-0 h-7 w-7 flex items-center justify-center bg-mcc-crimson dark:bg-mcc-gold text-white dark:text-slate-900 rounded-full cursor-pointer shadow-md hover:opacity-90 transition-opacity">
                  <Camera className="h-3.5 w-3.5" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <p className="font-semibold text-sm text-foreground leading-tight">
                  {profileData.name || "—"}
                </p>
                <p className="text-xs text-mcc-crimson dark:text-mcc-gold font-medium mt-0.5">
                  {profileData.department || "—"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px]">
                  {profileData.email}
                </p>
              </div>
            </div>

            {/* Identity details */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <DetailRow label="Gender"   value={profileData.gender   || "—"} />
              <DetailRow label="Username" value={profileData.username || "—"} mono />
            </div>
          </div>

          {/* Completeness */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-mcc-crimson dark:text-mcc-gold" />
                Completeness
              </h4>
              <span className="text-xs font-bold text-foreground">{doneCount}/{completeness.length}</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-mcc-crimson dark:bg-mcc-gold rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / completeness.length) * 100}%` }}
              />
            </div>

            <ul className="space-y-2">
              {completeness.map(item => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`h-3.5 w-3.5 shrink-0 ${item.done ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"}`}
                  />
                  <span className={`text-xs ${item.done ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Career Guidance */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <BrainCircuit className="h-4 w-4 text-mcc-crimson dark:text-mcc-gold shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-foreground">AI Career Guidance</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Live recommendations</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Category 1: Ideal Career Paths */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <Compass className="h-3.5 w-3.5 text-mcc-crimson dark:text-mcc-gold" />
                  Ideal Career Paths
                </h5>
                <ul className="space-y-1.5">
                  {advice.paths.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category 2: Recruiter Matches */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <Laptop className="h-3.5 w-3.5 text-mcc-crimson dark:text-mcc-gold" />
                  Recruiter Matches
                </h5>
                <ul className="space-y-1.5">
                  {advice.recruiters.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 flex-wrap text-xs text-slate-700 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                      <span className="flex-grow">{r.name}</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded shrink-0">
                        {r.score}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category 3: Profile Tips */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-mcc-crimson dark:text-mcc-gold" />
                  Profile Tips
                </h5>
                <ul className="space-y-1.5">
                  {advice.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${t.includes("complete") || t.includes("Great") ? "bg-emerald-400" : "bg-amber-400"}`} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ───── Right form area ───── */}
        <div className="lg:col-span-3">
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
                animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                exit={{ opacity: 0, y: 20, scale: 0.95, x: "-50%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed bottom-8 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md pointer-events-auto"
              >
                <div className="flex items-center gap-3.5 px-5 py-4 rounded-2xl border border-amber-500/35 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md shadow-2xl">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 animate-pulse" />
                  <span className="text-xs font-bold leading-relaxed">
                    Please save the file below after updating or editing.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Section: Basic Information */}
            <FormSection title="Basic Information" icon={<User className="h-4 w-4" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Short Bio / Tagline" hint="Max 150 chars · appears at top of public profile">
                  <input
                    type="text" name="bio" value={formData.bio} onChange={handleChange}
                    placeholder="e.g. CS undergrad · MCC · Aspiring software engineer"
                    maxLength={150} className="field-input"
                  />
                </Field>
                <Field label="Contact Phone">
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+91 98765 43210" className="field-input"
                  />
                </Field>
                <Field label="Personal Email ID" hint="Alternative email for recruiters">
                  <input
                    type="email" name="personalEmail" value={formData.personalEmail || ""} onChange={handleChange}
                    placeholder="e.g. personal@gmail.com" className="field-input"
                  />
                </Field>
              </div>

              <Field label="Professional Skills" hint="Comma-separated · shown as badges on your public profile">
                <input
                  type="text" name="skills" value={formData.skills} onChange={handleChange}
                  placeholder="React, C#, SQL, Machine Learning, Public Speaking"
                  className="field-input"
                />
              </Field>
            </FormSection>

            {/* Section: Personal Narrative */}
            <FormSection title="Personal Narrative" icon={<BookOpen className="h-4 w-4" />}>
              <Field label="Personal Story" hint="Your academic journey and what defines your character">
                <textarea
                  name="personalStory" value={formData.personalStory} onChange={handleChange}
                  placeholder="Share your journey — turning points, challenges overcome, and what drives you…"
                  rows={5} className="field-input resize-none custom-scrollbar-y"
                />
              </Field>

              <Field
                label="Statement of Purpose"
                hint="Career aspirations and why you stand out"
                action={
                  <button
                    type="button"
                    onClick={handleAiGenerateSop}
                    disabled={generatingSop}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {generatingSop
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> Drafting…</>
                      : <><Sparkles className="h-3 w-3" /> AI Draft</>}
                  </button>
                }
              >
                <textarea
                  name="sop" value={formData.sop} onChange={handleChange}
                  placeholder="Describe your long-term goals, research interests, and your unique value proposition…"
                  rows={6} className="field-input resize-none custom-scrollbar-y"
                />
              </Field>
            </FormSection>

            {/* Section: GitHub Integration */}
            <FormSection title="GitHub Integration" icon={<Github className="h-4 w-4" />} subtitle="Connect your GitHub profile to showcase your repositories, stars, and open source contributions on your live public resume.">
              {!formData.gitHubUsername ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. torvalds"
                        value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)}
                        className="field-input pl-10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyGithub}
                      disabled={verifyingGithub || !githubInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 dark:bg-slate-100 dark:text-slate-900 dark:border-transparent text-xs font-semibold active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {verifyingGithub ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…</>
                      ) : (
                        "Verify & Connect"
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Verify and connect your public GitHub username. No passwords or authorization tokens required.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 border border-gray-200 dark:border-slate-800 relative overflow-hidden"
                  style={{ backgroundColor: darkMode ? "rgba(30, 41, 59, 0.5)" : "#ffffff" }}
                >
                  {/* Decorative background logo */}
                  <Github
                    className="absolute -right-8 -bottom-8 h-32 w-32 pointer-events-none block"
                    style={{ color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.25)" }}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                    {/* User profile brief */}
                    <div className="flex items-center gap-4">
                      <img
                        src={githubUser?.avatar_url || "https://github.com/identicons/git.png"}
                        alt={formData.gitHubUsername}
                        className="h-14 w-14 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {githubUser?.name || formData.gitHubUsername}
                          </h4>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          @{formData.gitHubUsername}
                        </p>
                        {githubUser?.bio && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm line-clamp-1">
                            {githubUser.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {githubUser && (
                      <div className="grid grid-cols-3 gap-2 text-center shrink-0">
                        <div className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-gray-200/10 dark:border-slate-800/50 shadow-sm min-w-[70px]">
                          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#ffffff" }}>Repos</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#ffffff" }}>{githubUser.public_repos}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-gray-200/10 dark:border-slate-800/50 shadow-sm min-w-[70px]">
                          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#ffffff" }}>Followers</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#ffffff" }}>{githubUser.followers}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-gray-200/10 dark:border-slate-800/50 shadow-sm min-w-[70px]">
                          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#ffffff" }}>Gists</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#ffffff" }}>{githubUser.public_gists}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 relative z-10">
                    <a
                      href={`https://github.com/${formData.gitHubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-mcc-crimson text-white dark:bg-mcc-gold dark:text-slate-900 hover:opacity-90 active:scale-98 transition-all text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Visit GitHub Profile
                    </a>
                    <button
                      type="button"
                      onClick={handleDisconnectGithub}
                      className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                    >
                      Disconnect Profile
                    </button>
                  </div>
                </motion.div>
              )}
            </FormSection>

            {/* Section: Behance Integration */}
            <FormSection title="Behance Integration" icon={<Behance className="h-4 w-4" />} subtitle="Connect your Behance profile to showcase your creative designs, UI/UX mockups, and visual artwork on your live public portfolio.">
              {!formData.behanceUsername ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Behance className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. creativejoel"
                        value={behanceInput}
                        onChange={(e) => setBehanceInput(e.target.value)}
                        className="field-input pl-10"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyBehance}
                      disabled={verifyingBehance || !behanceInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 dark:bg-slate-100 dark:text-slate-900 dark:border-transparent text-xs font-semibold active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {verifyingBehance ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Connecting…</>
                      ) : (
                        "Verify & Connect"
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Verify and connect your public Behance username. Showcase your creative excellence instantly.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 border border-gray-200 dark:border-slate-800 relative overflow-hidden"
                  style={{ backgroundColor: darkMode ? "rgba(30, 41, 59, 0.5)" : "#ffffff" }}
                >
                  {/* Decorative background logo */}
                  <Behance
                    className="absolute -right-8 -bottom-8 h-32 w-32 pointer-events-none block"
                    style={{ color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.15)" }}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                    {/* User profile brief */}
                    <div className="flex items-center gap-4">
                      <img
                        src={behanceUser?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.behanceUsername}`}
                        alt={formData.behanceUsername}
                        className="h-14 w-14 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {behanceUser?.name || formData.behanceUsername}
                          </h4>
                          <span className="text-[9px] font-bold text-[#1769ff] bg-[#1769ff]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          @{formData.behanceUsername}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm line-clamp-1">
                          {behanceUser?.bio || "Creative Visual Designer & UI/UX enthusiast."}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    {behanceUser && (
                      <div className="grid grid-cols-3 gap-2 text-center shrink-0">
                        <div className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-gray-200/10 dark:border-slate-800/50 shadow-sm min-w-[70px]">
                          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#ffffff" }}>Views</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#ffffff" }}>{behanceUser.views}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-gray-200/10 dark:border-slate-800/50 shadow-sm min-w-[70px]">
                          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#ffffff" }}>Likes</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#ffffff" }}>{behanceUser.appreciations}</p>
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-950 border border-gray-200/10 dark:border-slate-800/50 shadow-sm min-w-[70px]">
                          <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#ffffff" }}>Followers</p>
                          <p className="text-xs font-bold mt-0.5" style={{ color: "#ffffff" }}>{behanceUser.followers}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 relative z-10">
                    <a
                      href={`https://behance.net/${formData.behanceUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1769ff] text-white hover:opacity-90 active:scale-98 transition-all text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Visit Behance Profile
                    </a>
                    <button
                      type="button"
                      onClick={handleDisconnectBehance}
                      className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                    >
                      Disconnect Profile
                    </button>
                  </div>
                </motion.div>
              )}
            </FormSection>

            {/* Section: Dynamic Theme Engine */}
            <FormSection title="Portfolio Theme" icon={<Palette className="h-4 w-4" />} subtitle="Choose how your public portfolio looks to recruiters and visitors.">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {THEMES.map(theme => {
                  const Icon      = theme.icon;
                  const isActive  = formData.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, theme: theme.id })}
                      className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-all duration-150 cursor-pointer outline-none ${
                        isActive
                          ? "border-mcc-crimson dark:border-mcc-gold bg-mcc-crimson/5 dark:bg-mcc-gold/5"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-mcc-crimson dark:text-mcc-gold" : "text-slate-400 dark:text-slate-500"}`} />
                      <div>
                        <p className={`text-[10px] font-semibold leading-tight ${isActive ? "text-foreground" : "text-slate-600 dark:text-slate-400"}`}>
                          {theme.label}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                          {theme.desc}
                        </p>
                      </div>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-mcc-crimson dark:bg-mcc-gold" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1">
                <Eye className="h-3 w-3" />
                Active: <strong className="text-slate-600 dark:text-slate-300 font-medium">{formData.theme}</strong> — applied to your live public portfolio on save.
              </p>
            </FormSection>

            {/* Submit row */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400 dark:text-slate-500">All changes apply to your public profile after saving.</p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-premium text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                  : <><Save className="h-4 w-4" /> Save Profile</>}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Profile Photo Crop & Frame Adjust Modal */}
      {cropImage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-background rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-6">
            <div>
              <h4 className="font-bold text-base text-foreground">Adjust Profile Picture</h4>
              <p className="text-xs text-slate-500 mt-1">Drag to position, and use the slider to zoom.</p>
            </div>

            {/* Circular Preview Mask Viewport */}
            <div 
              className="relative w-64 h-64 mx-auto rounded-full border border-slate-200 dark:border-slate-850 overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-move select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                src={cropImage}
                alt="Crop preview"
                className="absolute pointer-events-none origin-center max-w-none"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})`,
                }}
              />
              {/* Circular Overlay Guide stencil border */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-mcc-crimson/50 dark:border-mcc-gold/50 pointer-events-none" />
            </div>

            {/* Zoom Slider Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Zoom Scale</span>
                <span>{Math.round(cropScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropScale}
                onChange={(e) => setCropScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-mcc-crimson dark:accent-mcc-gold"
              />
            </div>

            {/* Manual Reset Control */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setCropScale(1);
                  setCropOffset({ x: 0, y: 0 });
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-foreground hover:underline"
              >
                Reset Position &amp; Zoom
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCropImage(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-5 py-2 text-xs font-bold rounded-lg btn-premium flex items-center gap-1.5"
              >
                Apply &amp; Save
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Input styles */}
      <style>{`
        .field-input {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 0.875rem;
          color: inherit;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input.pl-10 {
          padding-left: 2.5rem;
        }
        .dark .field-input { 
          border-color: #1e293b; 
          background: transparent;
        }
        .field-input::placeholder { color: #94a3b8; }
        .field-input:focus {
          border-color: var(--mcc-crimson);
          box-shadow: 0 0 0 2px rgba(122,28,28,0.1);
        }
        .dark .field-input:focus {
          border-color: var(--mcc-gold);
          box-shadow: 0 0 0 2px rgba(212,175,55,0.12);
        }

        /* Custom scrollbar styling for Statement of Purpose & Personal Story */
        .custom-scrollbar-y::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-y::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 8px;
        }
        .dark .custom-scrollbar-y::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar-y::-webkit-scrollbar-thumb {
          background: rgba(122, 28, 28, 0.35); /* MCC Crimson */
          border: 2px solid transparent;
          background-clip: padding-box;
          border-radius: 9999px;
        }
        .custom-scrollbar-y::-webkit-scrollbar-thumb:hover {
          background: rgba(122, 28, 28, 0.7);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .dark .custom-scrollbar-y::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.35); /* MCC Gold */
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .dark .custom-scrollbar-y::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.7);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar-y {
          scrollbar-width: thin;
          scrollbar-color: rgba(122, 28, 28, 0.35) rgba(0, 0, 0, 0.02);
        }
        .dark .custom-scrollbar-y {
          scrollbar-color: rgba(212, 175, 55, 0.35) rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </motion.div>
  );
}

/* ── Sub-components ── */

function FormSection({ title, subtitle, icon, className = "glass-panel", children }: {
  title: string; subtitle?: string; icon?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`${className} rounded-2xl overflow-hidden`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        {icon && <span className="text-mcc-crimson dark:text-mcc-gold">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, action, children }: {
  label: string; hint?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>
        {action}
      </div>
      {children}
      {hint && <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className={`text-xs font-medium text-slate-700 dark:text-slate-300 truncate text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}


