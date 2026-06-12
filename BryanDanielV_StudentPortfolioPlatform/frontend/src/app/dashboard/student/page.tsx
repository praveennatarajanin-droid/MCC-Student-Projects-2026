"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useInstitutionConfig } from "@/context/InstitutionConfigContext";

export default function StudentDashboard() {
  const { token, user, updateUserLocal } = useAuth();
  const { config: institutionConfig } = useInstitutionConfig();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [communityServices, setCommunityServices] = useState<any[]>([]);
  const [conferences, setConferences] = useState<any[]>([]);
  const [scienceFairs, setScienceFairs] = useState<any[]>([]);
  const [placementDrives, setPlacementDrives] = useState<any[]>([]);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"project" | "cert" | "pub" | "ach" | "service" | "conf" | "fair" | "idea" | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function showNotification(msg: string, type: "success" | "error") {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  }

  // Form input states
  const [bioInput, setBioInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [behanceInput, setBehanceInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [cgpaInput, setCgpaInput] = useState("");
  
  // Portfolio setting states
  const [slugInput, setSlugInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("academic");
  const [sopInput, setSopInput] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");

  // Color settings states
  const [headerBgColor, setHeaderBgColor] = useState("#800020");
  const [accentColor, setAccentColor] = useState("#d4af37");

  // Customizer new states (Phase B)
  const [fontFamily, setFontFamily] = useState("sans");
  const [cardStyle, setCardStyle] = useState("default");
  const [visibleSections, setVisibleSections] = useState<string[]>([
    "about",
    "projects",
    "publications",
    "certifications",
    "achievements",
    "community"
  ]);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");

  const ALL_SECTION_META: Record<string, string> = {
    about: "Personal Story",
    projects: "Technical Projects",
    publications: "Research & Publications",
    certifications: "Professional Certifications",
    achievements: "Awards & Contests",
    community: "Community Outreach",
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...visibleSections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      setVisibleSections(newSections);
    }
  };

  const hideSection = (section: string) => {
    setVisibleSections(visibleSections.filter(s => s !== section));
  };

  const showSection = (section: string) => {
    if (!visibleSections.includes(section)) {
      setVisibleSections([...visibleSections, section]);
    }
  };

  // AI toolkit states
  const [sopPrompt, setSopPrompt] = useState("");
  const [aiSopResult, setAiSopResult] = useState("");
  const [resumeCritique, setResumeCritique] = useState<any>(null);
  const [careerGuidance, setCareerGuidance] = useState<any>(null);
  const [uniMatches, setUniMatches] = useState<any[]>([]);
  const [portfolioSuggestions, setPortfolioSuggestions] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [generatingSop, setGeneratingSop] = useState(false);

  // Phase 3 States
  const [recruiterLeads, setRecruiterLeads] = useState<any[]>([]);
  const [liveUrl, setLiveUrl] = useState("");
  const [internships, setInternships] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);

  // Career Guidance Engine States
  const [targetCareerRole, setTargetCareerRole] = useState("Full Stack Developer");
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // Phase A States
  const [circularsList, setCircularsList] = useState<any[]>([]);
  const [startupIdeas, setStartupIdeas] = useState<any[]>([]);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaTeam, setNewIdeaTeam] = useState("");
  const [newIdeaStage, setNewIdeaStage] = useState("Idea");
  const [newIdeaFundingAsk, setNewIdeaFundingAsk] = useState("");
  const [newIdeaPitchDeckUrl, setNewIdeaPitchDeckUrl] = useState("");
  const [isAlumniInput, setIsAlumniInput] = useState(false);
  const [currentCompanyInput, setCurrentCompanyInput] = useState("");
  const [currentRoleInput, setCurrentRoleInput] = useState("");

  // Phase C: Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settingsStep, setSettingsStep] = useState(1);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [data, leadsData, circularsData, ideasData, notificationsData, drivesData] = await Promise.all([
        api.get<any>("/student/profile", token),
        api.get<any[]>("/student/leads", token).catch(() => []),
        api.get<any[]>("/student/circulars", token).catch(() => []),
        api.get<any[]>("/student/ideas", token).catch(() => []),
        api.get<any[]>("/student/notifications", token).catch(() => []),
        api.get<any>("/student/placement/drives", token).catch(() => ({ drives: [] }))
      ]);
      
      setProfile(data.profile);
      setPortfolio(data.portfolio);
      setProjects(data.projects || []);
      setCertifications(data.certifications || []);
      setPublications(data.publications || []);
      setAchievements(data.achievements || []);
      setCommunityServices(data.communityServices || []);
      setConferences(data.conferencePresentations || []);
      setScienceFairs(data.scienceFairEntries || []);
      setRecruiterLeads(leadsData || []);
      setCircularsList(circularsData || []);
      setStartupIdeas(ideasData || []);
      setNotifications(notificationsData || []);
      setPlacementDrives(drivesData.drives || []);

      // Set input defaults
      setBioInput(data.profile?.bio || "");
      setGithubInput(data.profile?.githubUsername || "");
      setBehanceInput(data.profile?.behanceUsername || "");
      setFirstNameInput(data.profile?.firstName || "");
      setLastNameInput(data.profile?.lastName || "");
      setAvatarUrl(data.profile?.avatarUrl || "");
      setCgpaInput(data.profile?.cgpa !== undefined ? String(data.profile.cgpa) : "0.0");
      setIsAlumniInput(data.profile?.isAlumni === true);
      setCurrentCompanyInput(data.profile?.currentCompany || "");
      setCurrentRoleInput(data.profile?.currentRole || "");

      setSlugInput(data.portfolio?.slug || "");
      setIsPublic(data.portfolio?.isPublic !== false);
      setSopInput(data.portfolio?.statementOfPurpose || "");
      setStoryTitle(data.portfolio?.storyTitle || "");
      setStoryContent(data.portfolio?.storyContent || "");

      if (data.portfolio?.slug && typeof window !== "undefined") {
        setLiveUrl(`${window.location.origin}/portfolio/${data.portfolio.slug}`);
      }
      
      try {
        const settings = JSON.parse(data.portfolio?.layoutSettingsJson || "{}");
        setSelectedTheme(settings.theme || "academic");
        setHeaderBgColor(settings.headerBg || "#800020");
        setAccentColor(settings.accentColor || "#d4af37");
        setFontFamily(settings.fontFamily || "sans");
        setCardStyle(settings.cardStyle || "default");
        setVisibleSections(settings.visibleSections || [
          "about",
          "projects",
          "publications",
          "certifications",
          "achievements",
          "community"
        ]);
        setLinkedinUrl(settings.linkedinUrl || "");
        setLeetcodeUrl(settings.leetcodeUrl || "");
        setBlogUrl(settings.blogUrl || "");
        setTargetCareerRole(settings.targetCareerRole || "Full Stack Developer");
      } catch {
        setSelectedTheme("academic");
        setHeaderBgColor("#800020");
        setAccentColor("#d4af37");
        setFontFamily("sans");
        setCardStyle("default");
        setVisibleSections([
          "about",
          "projects",
          "publications",
          "certifications",
          "achievements",
          "community"
        ]);
        setLinkedinUrl("");
        setLeetcodeUrl("");
        setBlogUrl("");
        setTargetCareerRole("Full Stack Developer");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/student/notifications/${id}/read`, {}, token);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      showNotification(err.message || "Failed to mark notification as read.", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/student/notifications/read-all`, {}, token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showNotification("All notifications marked as read.", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to mark all as read.", "error");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/student/notifications/${id}`, token);
      setNotifications(prev => prev.filter(n => n.id !== id));
      showNotification("Notification dismissed.", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to delete notification.", "error");
    }
  };

  const handleDownloadQr = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      liveUrl || (typeof window !== "undefined" ? `${window.location.origin}/portfolio/${slugInput}` : "")
    )}`;
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slugInput || "student"}-portfolio-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showNotification("QR Code downloaded successfully!", "success");
      })
      .catch(() => {
        showNotification("Failed to download QR code. Try right-clicking the image.", "error");
      });
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadAiRecommendations = async () => {
    try {
      setLoadingAi(true);
      const [resumeData, careerData, uniData, internshipsData, scholarshipsData, suggestionsData] = await Promise.all([
        api.get<any>("/ai/resume-critique", token),
        api.get<any>("/ai/career-guidance", token),
        api.get<any>("/ai/university-matches", token),
        api.get<any>("/ai/internship-matches", token),
        api.get<any>("/ai/scholarships", token),
        api.get<any>("/ai/portfolio-suggestions", token).catch(() => null)
      ]);
      setResumeCritique(resumeData);
      setCareerGuidance(careerData);
      setUniMatches(uniData);
      setInternships(internshipsData || []);
      setScholarships(scholarshipsData || []);
      setPortfolioSuggestions(suggestionsData);
    } catch (err: any) {
      showNotification(err.message || "Failed to load AI recommendations.", "error");
    } finally {
      setLoadingAi(false);
    }
  };

  const loadCareerRoadmap = async (role?: string) => {
    const roleToFetch = role ?? targetCareerRole;
    try {
      setLoadingRoadmap(true);
      const data = await api.post<any>("/ai/career-roadmap", { targetRole: roleToFetch }, token);
      setRoadmapData(data);
    } catch (err: any) {
      showNotification(err.message || "Failed to load career roadmap.", "error");
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleSaveCareerGoal = async () => {
    try {
      const settingsJson = JSON.stringify({
        theme: selectedTheme,
        headerBg: headerBgColor,
        accentColor: accentColor,
        fontFamily: fontFamily,
        cardStyle: cardStyle,
        visibleSections: visibleSections,
        linkedinUrl: linkedinUrl,
        leetcodeUrl: leetcodeUrl,
        blogUrl: blogUrl,
        targetCareerRole: targetCareerRole,
      });
      await api.put<any>("/student/portfolio", {
        slug: slugInput,
        isPublic,
        layoutSettingsJson: settingsJson,
        statementOfPurpose: sopInput,
        storyTitle,
        storyContent,
      }, token);
      showNotification(`Career goal set to "${targetCareerRole}" and saved!`, "success");
      await loadCareerRoadmap(targetCareerRole);
    } catch (err: any) {
      showNotification(err.message || "Failed to save career goal.", "error");
    }
  };

  const handleGenerateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGeneratingSop(true);
      const res = await api.post<{ sop: string }>("/ai/generate-sop", { prompt: sopPrompt }, token);
      setAiSopResult(res.sop);
      setSopInput(res.sop);
      showNotification("AI Statement of Purpose drafted successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to generate SOP.", "error");
    } finally {
      setGeneratingSop(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ai" && token) {
      if (!resumeCritique) loadAiRecommendations();
      if (!roadmapData) loadCareerRoadmap();
    }
  }, [activeTab, token]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedCgpa = parseFloat(cgpaInput);
      if (isNaN(parsedCgpa) || parsedCgpa < 0.0 || parsedCgpa > 10.0) {
        showNotification("CGPA must be a valid number between 0.0 and 10.0.", "error");
        return;
      }

      const updated = await api.put<any>("/student/profile", {
        ...profile,
        firstName: firstNameInput,
        lastName: lastNameInput,
        bio: bioInput,
        githubUsername: githubInput,
        behanceUsername: behanceInput,
        avatarUrl,
        cgpa: parsedCgpa,
      }, token);

      // Save Alumni Status separately
      await api.put("/student/alumni", {
        isAlumni: isAlumniInput,
        currentCompany: currentCompanyInput,
        currentRole: currentRoleInput,
      }, token);
      
      setProfile({
        ...updated,
        cgpa: parsedCgpa,
        isAlumni: isAlumniInput,
        currentCompany: currentCompanyInput,
        currentRole: currentRoleInput,
      });
      updateUserLocal({ firstName: firstNameInput, lastName: lastNameInput, avatarUrl });
      showNotification("Profile details updated successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to update profile.", "error");
    }
  };

  const handlePostStartupIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/student/ideas", {
        title: newIdeaTitle,
        description: newIdeaDescription,
        teamMembers: newIdeaTeam,
        stage: newIdeaStage,
        fundingAsk: newIdeaFundingAsk,
        pitchDeckUrl: newIdeaPitchDeckUrl,
      }, token);
      showNotification("Startup prototype pitch registered successfully!", "success");
      setNewIdeaTitle("");
      setNewIdeaDescription("");
      setNewIdeaTeam("");
      setNewIdeaStage("Idea");
      setNewIdeaFundingAsk("");
      setNewIdeaPitchDeckUrl("");
      loadDashboardData();
    } catch (err: any) {
      showNotification(err.message || "Failed to submit startup pitch.", "error");
    }
  };

  const handleApplyDrive = async (driveId: string) => {
    try {
      await api.post(`/student/placement/drives/${driveId}/apply`, {}, token);
      showNotification("Successfully applied to the job drive!", "success");
      loadDashboardData();
    } catch (err: any) {
      showNotification(err.message || "Failed to register for drive.", "error");
    }
  };

  const handlePortfolioUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsJson = JSON.stringify({
        theme: selectedTheme,
        headerBg: headerBgColor,
        accentColor: accentColor,
        fontFamily: fontFamily,
        cardStyle: cardStyle,
        visibleSections: visibleSections,
        linkedinUrl: linkedinUrl,
        leetcodeUrl: leetcodeUrl,
        blogUrl: blogUrl,
        targetCareerRole: targetCareerRole,
      });
      const updated = await api.put<any>("/student/portfolio", {
        slug: slugInput,
        isPublic,
        layoutSettingsJson: settingsJson,
        statementOfPurpose: sopInput,
        storyTitle,
        storyContent,
      }, token);
      setPortfolio(updated);
      updateUserLocal({ slug: slugInput });
      if (slugInput && typeof window !== "undefined") {
        setLiveUrl(`${window.location.origin}/portfolio/${slugInput}`);
      }
      showNotification("Portfolio configuration saved successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to save portfolio settings.", "error");
    }
  };

  // Avatar Upload Helper
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant local preview
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarUrl(localPreviewUrl);

    try {
      showNotification("Uploading photo...", "success");
      const serverUrl = await api.upload(file, "avatars", token);
      // Replace preview with the permanent server URL
      URL.revokeObjectURL(localPreviewUrl);
      setAvatarUrl(serverUrl);
      showNotification("Photo uploaded! Click 'Save Profile' to apply.", "success");
    } catch (err: any) {
      // Revert preview on failure
      URL.revokeObjectURL(localPreviewUrl);
      setAvatarUrl("");
      showNotification(err.message || "Upload failed. Please try again.", "error");
    }
    // Reset file input so the same file can be re-selected if needed
    e.target.value = "";
  };

  // CRUD Actions
  const handleOpenAddModal = (type: typeof modalType) => {
    setModalType(type);
    setCurrentItem({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (type: typeof modalType, item: any) => {
    setModalType(type);
    setCurrentItem({ ...item });
    setModalOpen(true);
  };

  const handleDeleteItem = async (type: typeof modalType, id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      let endpoint = "";
      if (type === "project") endpoint = `/student/projects/${id}`;
      else if (type === "cert") endpoint = `/student/certifications/${id}`;
      else if (type === "pub") endpoint = `/student/publications/${id}`;
      else if (type === "ach") endpoint = `/student/achievements/${id}`;
      else if (type === "service") endpoint = `/student/community-services/${id}`;
      else if (type === "conf") endpoint = `/student/conferences/${id}`;
      else if (type === "fair") endpoint = `/student/science-fairs/${id}`;
      else if (type === "idea") endpoint = `/student/ideas/${id}`;

      await api.delete(endpoint, token);
      showNotification("Item deleted successfully.", "success");
      loadDashboardData();
    } catch (err: any) {
      showNotification(err.message || "Delete failed.", "error");
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = "";
      if (modalType === "project") endpoint = "/student/projects";
      else if (modalType === "cert") endpoint = "/student/certifications";
      else if (modalType === "pub") endpoint = "/student/publications";
      else if (modalType === "ach") endpoint = "/student/achievements";
      else if (modalType === "service") endpoint = "/student/community-services";
      else if (modalType === "conf") endpoint = "/student/conferences";
      else if (modalType === "fair") endpoint = "/student/science-fairs";
      else if (modalType === "idea") endpoint = "/student/ideas";

      // Strip navigation properties to avoid backend recursive validation issues
      const { student, Student, ...payload } = currentItem;

      if (currentItem.id) {
        // Edit update
        await api.put(`${endpoint}/${currentItem.id}`, payload, token);
        showNotification("Item updated successfully.", "success");
      } else {
        // Add create
        await api.post(endpoint, payload, token);
        showNotification("Item added successfully.", "success");
      }
      setModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      showNotification(err.message || "Action failed.", "error");
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await api.upload(file, "certificates", token);
      setCurrentItem({ ...currentItem, certificateUrl: url });
      showNotification("Certificate uploaded successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Certificate upload failed.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin" />
        <p className="text-sm">Retrieving your profile statistics...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs = [
    { id: "overview", name: "Overview & Profile" },
    { id: "notifications", name: "Inbox", badge: unreadCount },
    { id: "circulars", name: "Campus Notices" },
    { id: "placements", name: "Placement Portal" },
    { id: "projects", name: "Projects" },
    { id: "certifications", name: "Certifications" },
    { id: "publications", name: "Research & Publications" },
    { id: "achievements", name: "Achievements & NGO" },
    { id: "incubator", name: "Startup Incubator" },
    { id: "sop", name: "SOP & Personal Story" },
    { id: "ai", name: "AI Guidance Hub" },
    { id: "settings", name: "Portfolio Settings" },
  ];

  const completionRate = (() => {
    if (!profile) return 0;
    let rate = 0;
    if (profile.avatarUrl) rate += 15;
    if (profile.bio) rate += 15;
    if (portfolio?.statementOfPurpose) rate += 20;
    if (profile.githubUsername) rate += 10;
    if (projects && projects.length > 0) rate += 15;
    if (certifications && certifications.length > 0) rate += 15;
    if ((achievements && achievements.length > 0) || (communityServices && communityServices.length > 0)) rate += 10;
    return rate;
  })();

  const checklistItems = [
    { label: "Profile Avatar Picture", weight: 15, done: !!profile?.avatarUrl },
    { label: "Bio / Professional Tagline", weight: 15, done: !!profile?.bio },
    { label: "Statement of Purpose (SOP)", weight: 20, done: !!portfolio?.statementOfPurpose },
    { label: "GitHub Profile Linked", weight: 10, done: !!profile?.githubUsername },
    { label: "At least one Project", weight: 15, done: projects && projects.length > 0 },
    { label: "At least one Certification", weight: 15, done: certifications && certifications.length > 0 },
    { label: "Awards or NGO/Outreach records", weight: 10, done: (achievements && achievements.length > 0) || (communityServices && communityServices.length > 0) },
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full">
      {/* Toast Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg border border-green-800 bg-green-950/80 backdrop-blur text-sm text-green-300 shadow-xl flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg border border-red-800 bg-red-950/80 backdrop-blur text-sm text-red-300 shadow-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-900 pb-4">
        <div className="min-w-0">
          <span className="text-[10px] text-mcc-gold font-bold tracking-widest uppercase">
            Ecosystem Dashboard
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
            Welcome back, {profile?.firstName}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {profile?.rollNumber} &bull; {profile?.department} &bull; {profile?.batchYear}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shrink-0">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-green-500 dark:text-green-400">Active</span>
        </div>
      </div>

      {/* Faculty Review Feedback Banner */}
      {portfolio && portfolio.reviewRemarks && showFeedbackBanner && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border relative overflow-hidden backdrop-blur-md ${
            portfolio.isApproved
              ? "bg-green-950/20 border-green-900/50 text-green-800 dark:text-green-300"
              : "bg-amber-950/20 border-amber-900/50 text-amber-800 dark:text-amber-300"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">
                {portfolio.isApproved ? "✓" : "📝"}
              </span>
              <div>
                <h4 className="font-bold text-sm">
                  {portfolio.isApproved ? "Faculty Approval Feedback" : "Revisions Requested by Faculty"}
                </h4>
                <p className="text-xs mt-1 opacity-90 leading-relaxed">
                  "{portfolio.reviewRemarks}"
                </p>
                <p className="text-[10px] mt-2 opacity-75 font-semibold">
                  Reviewed by: {portfolio.reviewedBy || "Faculty Staff"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFeedbackBanner(false)}
              className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-900 overflow-x-auto gap-1 scrollbar-none -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-2.5 px-2.5 text-xs font-semibold transition-all border-b-2 -mb-[2px] flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-mcc-gold text-mcc-gold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>{tab.name}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-mcc-maroon border border-mcc-gold/30 text-mcc-gold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">In-App Notification Center</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Stay updated with real-time placement status, campus announcements, and startup prototype evaluations.
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-3.5 py-1.5 border border-mcc-gold/30 hover:border-mcc-gold bg-mcc-gold/10 hover:bg-mcc-gold/20 text-xs font-semibold text-mcc-gold rounded-lg transition-all"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20">
                    <span className="text-3xl block mb-3">🔔</span>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Inbox is Empty</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      No notifications found. Check back later for academic circulars or coordinator updates.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.map((notif) => {
                      let typeIcon = "🔔";
                      let typeColor = "border-slate-200 dark:border-slate-800";
                      let badgeBg = "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800";
                      if (notif.type === "Placement") {
                        typeIcon = "💼";
                        typeColor = "border-blue-200 dark:border-blue-900/50 border-l-4 border-l-blue-500";
                        badgeBg = "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900";
                      } else if (notif.type === "Circular") {
                        typeIcon = "📣";
                        typeColor = "border-amber-200 dark:border-amber-900/50 border-l-4 border-l-mcc-gold";
                        badgeBg = "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900";
                      } else if (notif.type === "StartupIdea") {
                        typeIcon = "🚀";
                        typeColor = "border-teal-200 dark:border-teal-900/50 border-l-4 border-l-teal-500";
                        badgeBg = "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900";
                      }

                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, x: -50 }}
                          className={`p-4 rounded-xl border bg-white dark:bg-slate-950/50 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all flex gap-4 ${typeColor} ${
                            !notif.isRead ? "shadow-[0_0_12px_rgba(212,175,55,0.05)] bg-slate-100/40 dark:bg-slate-900/10" : "opacity-60"
                          }`}
                        >
                          <div className="text-xl flex items-center justify-center shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                            {typeIcon}
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeBg}`}>
                                  {notif.type}
                                </span>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-mcc-gold animate-ping" />
                                )}
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">{notif.title}</h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              {!notif.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="px-2 py-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-800 rounded transition-all"
                                >
                                  Mark as Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteNotification(notif.id)}
                                className="px-2 py-1 bg-red-950/10 dark:bg-red-950/30 hover:bg-red-950/70 border border-red-200 dark:border-red-900/30 hover:border-red-900 text-[10px] text-red-650 dark:text-red-400 hover:text-red-200 font-semibold rounded transition-all"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "placements" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Top row: Readiness Score Card & Checklist */}
            <div className="grid md:grid-cols-12 gap-6">
              {/* Score Card */}
              <div className="md:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Placement Readiness Status</h3>
                
                <div className="flex items-center gap-4 py-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${
                    (completionRate >= 80 && (profile?.cgpa || 0) >= 8.0)
                      ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}>
                    {(completionRate >= 80 && (profile?.cgpa || 0) >= 8.0) ? "✓" : "⏳"}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Readiness Status</span>
                    <h4 className={`text-base font-black ${
                      (completionRate >= 80 && (profile?.cgpa || 0) >= 8.0)
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      {(completionRate >= 80 && (profile?.cgpa || 0) >= 8.0) ? "Eligible & Ready" : "Pending Requirements"}
                    </h4>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-2 border-t border-slate-100 dark:border-slate-900 pt-4">
                  {/* Completeness check */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Profile Completeness (≥ 80%)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{completionRate}%</span>
                      <span className={completionRate >= 80 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {completionRate >= 80 ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                  {/* CGPA check */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Academic CGPA (≥ 8.0)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{(profile?.cgpa || 0).toFixed(2)}</span>
                      <span className={(profile?.cgpa || 0) >= 8.0 ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {(profile?.cgpa || 0) >= 8.0 ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-2 italic leading-relaxed">
                  * Note: Madras Christian College placement policies require a minimum profile completion rate of 80% and a CGPA score of 8.0 or higher to register for job placement drives.
                </p>
              </div>

              {/* Checklist */}
              <div className="md:col-span-7 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Readiness Checklist</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click on missing items to navigate to their respective sections and complete them.</p>

                <div className="grid sm:grid-cols-2 gap-3 mt-1">
                  {[
                    { label: "Profile Photo", done: !!profile?.avatarUrl, tab: "overview" },
                    { label: "Bio Tagline", done: !!profile?.bio, tab: "overview" },
                    { label: "Statement of Purpose (SOP)", done: !!portfolio?.statementOfPurpose, tab: "sop" },
                    { label: "GitHub Linked", done: !!profile?.githubUsername, tab: "overview" },
                    { label: "At least one Project", done: projects && projects.length > 0, tab: "projects" },
                    { label: "At least one Certification", done: certifications && certifications.length > 0, tab: "certifications" },
                    { label: "Achievements / NGO", done: (achievements && achievements.length > 0) || (communityServices && communityServices.length > 0), tab: "achievements" }
                  ].map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveTab(item.tab)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        item.done
                          ? "bg-slate-50/45 dark:bg-slate-950/20 border-slate-250 dark:border-slate-800/80"
                          : "bg-amber-950/5 border-amber-900/20 hover:border-amber-500/40 hover:bg-amber-950/15 cursor-pointer"
                      }`}
                    >
                      <span className={`text-xs ${item.done ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
                        {item.label}
                      </span>
                      <span className={`text-xs font-bold ${item.done ? "text-green-500" : "text-amber-500"}`}>
                        {item.done ? "✓" : "Add +"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Placement Drives List */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Campus Placement Drives</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Active and upcoming job drives for MCC campus placements.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {placementDrives.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20">
                    <span className="text-3xl block mb-3">💼</span>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Job Drives Available</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                      Check back later for active placement drives.
                    </p>
                  </div>
                ) : (
                  placementDrives.map((drive) => {
                    const meetsCgpa = (profile?.cgpa || 0) >= drive.eligibilityCgpa;
                    const overallReady = completionRate >= 80 && (profile?.cgpa || 0) >= 8.0;
                    
                    let statusColor = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800";
                    if (drive.applicationStatus === "Shortlisted") {
                      statusColor = "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900";
                    } else if (drive.applicationStatus === "Selected") {
                      statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900";
                    } else if (drive.applicationStatus === "Under Review") {
                      statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900";
                    } else if (drive.applicationStatus === "Rejected") {
                      statusColor = "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
                    } else if (drive.applicationStatus === "Applied") {
                      statusColor = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900";
                    }

                    return (
                      <div
                        key={drive.id}
                        className="p-5 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-950/40 rounded-xl flex flex-col lg:flex-row justify-between gap-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-mcc-gold/10 text-mcc-gold border border-mcc-gold/30">
                              {drive.companyName}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              meetsCgpa
                                ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900"
                                : "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                            }`}>
                              CGPA Cutoff: {drive.eligibilityCgpa.toFixed(2)}
                            </span>
                          </div>
                          
                          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                            {drive.title}
                          </h4>
                          
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {drive.description}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-550 dark:text-slate-400 font-mono mt-2 border-t border-slate-100 dark:border-slate-900 pt-2">
                            <span>Drive Date: <strong>{new Date(drive.driveDate).toLocaleDateString()}</strong></span>
                            <span>Registration Link: <a href={drive.applicationLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{drive.applicationLink}</a></span>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col justify-center gap-3 w-full lg:w-44 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-900 pt-4 lg:pt-0 lg:pl-6">
                          {drive.applied ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold text-center font-mono">Application Status</span>
                              <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold text-center ${statusColor}`}>
                                {drive.applicationStatus}
                              </span>
                              {drive.applicationRemarks && (
                                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-650 dark:text-slate-400 leading-normal italic text-center">
                                  "{drive.applicationRemarks}"
                                </div>
                              )}
                              <span className="text-[9px] text-slate-400 text-center font-mono block">
                                Applied: {new Date(drive.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {overallReady ? (
                                meetsCgpa ? (
                                  <button
                                    onClick={() => handleApplyDrive(drive.id)}
                                    type="button"
                                    className="w-full py-2 bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light border border-mcc-gold/30 hover:from-mcc-maroon-light hover:to-red-650 rounded-lg text-xs font-bold text-slate-100 transition-all shadow text-center cursor-pointer font-sans"
                                  >
                                    Apply Now
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    type="button"
                                    className="w-full py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed text-center"
                                  >
                                    Below Cutoff
                                  </button>
                                )
                              ) : (
                                <div className="flex flex-col gap-1 text-center">
                                  <button
                                    disabled
                                    type="button"
                                    className="w-full py-2 bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed text-center"
                                  >
                                    Apply Locked
                                  </button>
                                  <span className="text-[9px] text-amber-500 font-semibold leading-normal block">
                                    Requires Placement Readiness
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Profile Completion Bar Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Profile Completion</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {completionRate >= 80 ? "Placement Ready!" : "Complete profile for placement eligibility."}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0 ${
                    completionRate >= 80 
                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900" 
                      : completionRate >= 50 
                      ? "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900" 
                      : "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900"
                  }`}>
                    {completionRate}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                      completionRate >= 80 
                        ? "from-green-500 to-emerald-400" 
                        : completionRate >= 50 
                        ? "from-mcc-gold to-amber-400" 
                        : "from-mcc-maroon to-red-500"
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                {/* Checklist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {checklistItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={item.done ? "text-green-500 font-bold text-sm" : "text-slate-400 font-bold"}>{item.done ? "✓" : "○"}</span>
                      <span className={item.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"}>
                        {item.label} <span className="text-[10px] text-slate-400">({item.weight}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Details Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider">Profile Settings</h3>
                <form onSubmit={handleProfileUpdate} className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                    {/* Avatar Preview Circle */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-md">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Profile Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-2xl font-extrabold text-mcc-gold select-none">
                            {firstNameInput?.[0] || "?"}{lastNameInput?.[0] || ""}
                          </span>
                        )}
                      </div>
                      {/* Uploading indicator badge */}
                      {avatarUrl && (
                        <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Avatar Controls */}
                    <div className="flex flex-col gap-2.5 flex-1">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Avatar Profile Photo</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Square JPG or PNG, max 5MB. Will be cropped to a circle on your public portfolio.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1">
                        {/* Upload button */}
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mcc-maroon hover:bg-mcc-maroon-light border border-mcc-gold/30 text-[11px] font-bold text-slate-100 cursor-pointer transition-all shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {avatarUrl ? "Change Photo" : "Upload Photo"}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleAvatarUpload}
                          />
                        </label>

                        {/* View Full Photo button */}
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(avatarUrl, "_blank")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Full Photo
                          </button>
                        )}

                        {/* Remove button */}
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 text-[11px] font-bold text-red-600 dark:text-red-400 cursor-pointer transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove Photo
                          </button>
                        )}
                      </div>

                      {avatarUrl && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Photo uploaded. Click "Save Profile" below to apply changes.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">First Name</label>
                      <input
                        type="text"
                        value={firstNameInput}
                        onChange={(e) => setFirstNameInput(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Last Name</label>
                      <input
                        type="text"
                        value={lastNameInput}
                        onChange={(e) => setLastNameInput(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Bio / Tagline</label>
                    <input
                      type="text"
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      placeholder="e.g. Aspiring Software Developer | Computer Science Student"
                      className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">CGPA Score</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.0"
                        max="10.0"
                        value={cgpaInput}
                        onChange={(e) => setCgpaInput(e.target.value)}
                        placeholder="e.g. 8.50"
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">GitHub Username</label>
                      <input
                        type="text"
                        value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)}
                        placeholder="e.g. github-profile"
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Behance Username</label>
                      <input
                        type="text"
                        value={behanceInput}
                        onChange={(e) => setBehanceInput(e.target.value)}
                        placeholder="e.g. behance-portfolio"
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="isAlumni"
                        checked={isAlumniInput}
                        onChange={(e) => setIsAlumniInput(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-mcc-gold focus:ring-mcc-gold"
                      />
                      <label htmlFor="isAlumni" className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider cursor-pointer">
                        Mark profile as MCC Alumni
                      </label>
                    </div>
                    {isAlumniInput && (
                      <div className="grid sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Employing Company</label>
                          <input
                            type="text"
                            placeholder="e.g. Freshworks, Zoho"
                            value={currentCompanyInput}
                            onChange={(e) => setCurrentCompanyInput(e.target.value)}
                            className="w-full h-9 px-3 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Current Job Title / Role</label>
                          <input
                            type="text"
                            placeholder="e.g. Associate Engineer"
                            value={currentRoleInput}
                            onChange={(e) => setCurrentRoleInput(e.target.value)}
                            className="w-full h-9 px-3 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-100 font-semibold text-sm w-fit mt-2"
                  >
                    Save Profile Details
                  </button>
                </form>
              </div>
            </div>

            {/* Profile Metrics Column */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Metrics Snapshot</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                  <div
                    onClick={() => setActiveTab("projects")}
                    className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-center shadow-sm cursor-pointer hover:border-mcc-gold/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl font-black text-mcc-gold block">{projects.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Projects</span>
                  </div>
                  <div
                    onClick={() => setActiveTab("publications")}
                    className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-center shadow-sm cursor-pointer hover:border-mcc-gold/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl font-black text-mcc-gold block">{publications.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Publications</span>
                  </div>
                  <div
                    onClick={() => setActiveTab("certifications")}
                    className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-center shadow-sm cursor-pointer hover:border-mcc-gold/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl font-black text-mcc-gold block">{certifications.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Certifications</span>
                  </div>
                  <div
                    onClick={() => setActiveTab("achievements")}
                    className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-center shadow-sm cursor-pointer hover:border-mcc-gold/60 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl font-black text-mcc-gold block">{achievements.length + communityServices.length}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Activities</span>
                  </div>
                </div>
              </div>

              {/* GitHub Integration card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">GitHub Sync</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  Enter your GitHub username to sync open-source projects.
                </p>
                {githubInput ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-mcc-gold/20 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      <div>
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">Linked Username</span>
                        <span className="text-[10px] text-mcc-gold font-medium">@{githubInput}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Simulating repository retrieval for ${githubInput}. Sync complete!`)}
                      className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Sync Repos
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic block">No GitHub profile linked. Use profile settings above.</span>
                )}
              </div>

              {/* Recruiter Connections Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">Recruiter Connections</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  Inquiries from your public portfolio.
                </p>
                {recruiterLeads.length === 0 ? (
                  <span className="text-xs text-slate-500 italic block py-4 text-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg">
                    No placement inquiries received yet.
                  </span>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {recruiterLeads.map((lead) => (
                      <div key={lead.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                              {lead.recruiterName}
                            </span>
                            <span className="text-[10px] text-mcc-gold font-semibold">
                              {lead.companyName}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a href={`mailto:${lead.recruiterEmail}`} className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-350 transition-colors">
                          {lead.recruiterEmail}
                        </a>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/40 p-2.5 rounded border border-slate-200 dark:border-slate-900 leading-relaxed italic">
                          "{lead.message}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Coding & Technical Projects</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Showcase your programming constructs, hackathon demos, and web builds.</p>
              </div>
              <button
                onClick={() => handleOpenAddModal("project")}
                className="px-4 py-2 bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light border border-mcc-gold/30 hover:from-mcc-maroon-light hover:to-red-600 rounded-lg text-xs font-semibold text-slate-100 transition-all flex items-center gap-1.5 shadow"
              >
                + Add Project
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div className="md:col-span-2 p-12 bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                  <span className="text-sm text-slate-500 dark:text-slate-400 italic block">No projects added yet. Click "+ Add Project" to insert.</span>
                </div>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex flex-col justify-between gap-3 shadow-sm">
                    <div>
                      {proj.imageUrl && (
                        <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800/60 mb-3 bg-slate-100 dark:bg-slate-950">
                          <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{proj.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">{proj.description}</p>
                      
                      {proj.technologiesUsed && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {proj.technologiesUsed.split(",").map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-900 pt-4 mt-2">
                      <div className="flex items-center gap-3">
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1">
                            GitHub
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-mcc-gold hover:underline text-xs flex items-center gap-1">
                            Live URL
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEditModal("project", proj)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteItem("project", proj.id)} className="text-xs text-red-500 hover:text-red-400">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Professional Certifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">List certifications earned from AWS, Google, Meta, Coursera, etc.</p>
              </div>
              <button
                onClick={() => handleOpenAddModal("cert")}
                className="px-4 py-2 bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light border border-mcc-gold/30 hover:from-mcc-maroon-light hover:to-red-600 rounded-lg text-xs font-semibold text-slate-100 transition-all"
              >
                + Add Certification
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {certifications.length === 0 ? (
                <div className="p-12 bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                  <span className="text-sm text-slate-500 dark:text-slate-400 italic">No certifications listed.</span>
                </div>
              ) : (
                certifications.map((cert) => (
                  <div key={cert.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center rounded-lg font-bold text-xs text-mcc-gold">
                        CERT
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cert.name}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">{cert.issuingOrganization} &bull; Issued {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-mcc-gold hover:underline">
                          Verify Credential
                        </a>
                      )}
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEditModal("cert", cert)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteItem("cert", cert.id)} className="text-xs text-red-500 hover:text-red-400">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Publications Tab */}
        {activeTab === "publications" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Research Publications & Papers</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload and catalog your journals, conference presentations, and innovation projects.</p>
              </div>
              <button
                onClick={() => handleOpenAddModal("pub")}
                className="px-4 py-2 bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light border border-mcc-gold/30 hover:from-mcc-maroon-light hover:to-red-600 rounded-lg text-xs font-semibold text-slate-100 transition-all"
              >
                + Add Publication
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {publications.length === 0 ? (
                <div className="p-12 bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                  <span className="text-sm text-slate-500 dark:text-slate-400 italic">No publications indexed.</span>
                </div>
              ) : (
                publications.map((pub) => (
                  <div key={pub.id} className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex flex-col gap-3 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{pub.title}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">{pub.journalOrConference} &bull; {new Date(pub.publishDate).getFullYear()}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-500 block mt-0.5">Authors: {pub.authors}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleOpenEditModal("pub", pub)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteItem("pub", pub.id)} className="text-xs text-red-500 hover:text-red-400">
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800/80">
                      <strong>Abstract:</strong> {pub.abstract}
                    </p>
                    {pub.paperUrl && (
                      <a href={pub.paperUrl} target="_blank" rel="noreferrer" className="text-xs text-mcc-gold hover:underline font-medium w-fit">
                        Read Full Paper &rarr;
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8">
            {/* Achievements Column */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Olympiads, Hackathons & Awards</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal("ach")}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  + Add Award
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {achievements.length === 0 ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">No awards listed.</span>
                ) : (
                  achievements.map((ach) => (
                    <div key={ach.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex justify-between gap-3 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{ach.title}</h4>
                          {ach.isVerified ? (
                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 shrink-0">
                              ✓ Verified
                            </span>
                          ) : ach.verifiedBy ? (
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0" title={`Reason: ${ach.verificationRemarks}`}>
                              ✗ Rejected
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{ach.category} &bull; {new Date(ach.dateEarned).toLocaleDateString()}</span>
                        <p className="text-xs text-slate-650 dark:text-slate-500 mt-1">{ach.description}</p>
                        {ach.verificationRemarks && (
                          <p className="text-[10px] text-red-500 mt-1.5 bg-red-500/5 px-2.5 py-1.5 rounded border border-red-500/10 font-medium">
                            <strong>Feedback:</strong> {ach.verificationRemarks}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 justify-between items-end shrink-0">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEditModal("ach", ach)} className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem("ach", ach.id)} className="text-[10px] text-red-500 hover:text-red-400 font-semibold">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conference Presentations Column */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Conference Presentations</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal("conf")}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  + Add Presentation
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {conferences.length === 0 ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">No conference presentations listed.</span>
                ) : (
                  conferences.map((conf) => (
                    <div key={conf.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex justify-between gap-3 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{conf.title}</h4>
                          {conf.isVerified ? (
                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 shrink-0">
                              ✓ Verified
                            </span>
                          ) : conf.verifiedBy ? (
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0" title={`Reason: ${conf.verificationRemarks}`}>
                              ✗ Rejected
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{conf.conferenceName} &bull; {conf.role} &bull; {new Date(conf.presentationDate).toLocaleDateString()}</span>
                        {conf.location && <span className="text-xs text-slate-550 dark:text-slate-400 block mt-0.5">Location: {conf.location}</span>}
                        {conf.abstractUrl && (
                          <a href={conf.abstractUrl} target="_blank" rel="noreferrer" className="text-xs text-mcc-maroon dark:text-mcc-gold hover:underline block mt-1 font-semibold">
                            View Abstract Link
                          </a>
                        )}
                        {conf.verificationRemarks && (
                          <p className="text-[10px] text-red-500 mt-1.5 bg-red-500/5 px-2.5 py-1.5 rounded border border-red-500/10 font-medium">
                            <strong>Feedback:</strong> {conf.verificationRemarks}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 justify-between items-end shrink-0">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEditModal("conf", conf)} className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem("conf", conf.id)} className="text-[10px] text-red-500 hover:text-red-400 font-semibold">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Science Fair Column */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Science Fair Participation</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal("fair")}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  + Add Entry
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {scienceFairs.length === 0 ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">No science fair entries listed.</span>
                ) : (
                  scienceFairs.map((fair) => (
                    <div key={fair.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex justify-between gap-3 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{fair.fairName}</h4>
                          {fair.isVerified ? (
                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 shrink-0">
                              ✓ Verified
                            </span>
                          ) : fair.verifiedBy ? (
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0" title={`Reason: ${fair.verificationRemarks}`}>
                              ✗ Rejected
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{fair.projectTitle} &bull; {fair.level} &bull; {new Date(fair.fairDate).toLocaleDateString()}</span>
                        {fair.awardReceived && <span className="text-xs text-mcc-maroon dark:text-mcc-gold font-semibold block mt-0.5">Award: {fair.awardReceived}</span>}
                        <p className="text-xs text-slate-650 dark:text-slate-500 mt-1">{fair.description}</p>
                        {fair.verificationRemarks && (
                          <p className="text-[10px] text-red-500 mt-1.5 bg-red-500/5 px-2.5 py-1.5 rounded border border-red-500/10 font-medium">
                            <strong>Feedback:</strong> {fair.verificationRemarks}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 justify-between items-end shrink-0">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEditModal("fair", fair)} className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem("fair", fair.id)} className="text-[10px] text-red-500 hover:text-red-400 font-semibold">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Community Service Column */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">NGO & Community Services</h3>
                </div>
                <button
                  onClick={() => handleOpenAddModal("service")}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  + Add Service
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {communityServices.length === 0 ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">No community service records.</span>
                ) : (
                  communityServices.map((service) => (
                    <div key={service.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 rounded-xl flex justify-between gap-3 shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{service.organization}</h4>
                          {service.isVerified ? (
                            <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 shrink-0">
                              ✓ Verified
                            </span>
                          ) : service.verifiedBy ? (
                            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0" title={`Reason: ${service.verificationRemarks}`}>
                              ✗ Rejected
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">{service.role} &bull; {new Date(service.startDate).toLocaleDateString()}</span>
                        <p className="text-xs text-slate-650 dark:text-slate-550 mt-1">{service.description}</p>
                        {service.verificationRemarks && (
                          <p className="text-[10px] text-red-500 mt-1.5 bg-red-500/5 px-2.5 py-1.5 rounded border border-red-500/10 font-medium">
                            <strong>Feedback:</strong> {service.verificationRemarks}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 justify-between items-end shrink-0">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenEditModal("service", service)} className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteItem("service", service.id)} className="text-[10px] text-red-500 hover:text-red-400 font-semibold">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* SOP & Personal Story Tab */}
        {activeTab === "sop" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8">
            {/* Statement of Purpose Card */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Statement of Purpose (SOP)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Formulate an objective statement to share your professional career aspirations, scholarship requests, or startup incubations.
              </p>
              <form onSubmit={handlePortfolioUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">My SOP Draft</label>
                  <textarea
                    rows={8}
                    value={sopInput}
                    onChange={(e) => setSopInput(e.target.value)}
                    placeholder="Describe your academic goals, research focus, and career readiness objectives..."
                    className="w-full p-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 resize-none leading-relaxed transition-colors"
                  />
                </div>
                <button type="submit" className="h-10 px-6 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-100 font-semibold text-sm w-fit shadow">
                  Save SOP Draft
                </button>
              </form>
            </div>

            {/* Personal Story Card */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Personal Story</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Add a narrative description about your journey into computing, science, literature, or management.
              </p>
              <form onSubmit={handlePortfolioUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Story Title</label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="e.g. My Journey into Tech"
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Story Narrative</label>
                  <textarea
                    rows={5}
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="Share how your passion started, key milestones, and projects that taught you the most..."
                    className="w-full p-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 resize-none leading-relaxed transition-colors"
                  />
                </div>
                <button type="submit" className="h-10 px-6 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-100 font-semibold text-sm w-fit shadow">
                  Save Personal Story
                </button>
              </form>
            </div>
          </motion.div>
        )}
        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col justify-between h-full min-h-[460px]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 shrink-0">Theme & Access Controls</h3>
              <form onSubmit={handlePortfolioUpdate} className="flex-1 flex flex-col justify-between">
                <div className="flex-1 flex flex-col gap-4 justify-center">
                  {settingsStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                      <span className="text-[10px] text-mcc-gold uppercase font-bold tracking-wider">Step 1 of 4: Portfolio Identity</span>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Custom URL Slug</label>
                        <div className="flex rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 overflow-hidden focus-within:border-mcc-gold">
                          <span className="px-3 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs flex items-center select-none border-r border-slate-200 dark:border-slate-800">
                            mccportfolio.edu/
                          </span>
                          <input
                            type="text"
                            value={slugInput}
                            onChange={(e) => setSlugInput(e.target.value)}
                            className="flex-1 h-10 px-3 bg-transparent border-none text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Public Toggle */}
                      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <div>
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">Public Portfolio URL</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Toggle visibility to the placement cells.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mcc-maroon peer-checked:after:bg-mcc-gold" />
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {settingsStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                      <span className="text-[10px] text-mcc-gold uppercase font-bold tracking-wider">Step 2 of 4: Dynamic Layout Theme</span>

                      {/* Theme Selector */}
                      <div className="flex flex-col gap-2">
                        {[
                          {
                            id: "academic",
                            name: "Academic Style",
                            icon: "🎓",
                            desc: "Classic scholarly layout — serif fonts, light cream tones, maroon accents.",
                            swatch: ["#800020", "#f5f0e8", "#d4af37"],
                          },
                          {
                            id: "corporate",
                            name: "Corporate Resume",
                            icon: "💼",
                            desc: "Clean professional design — navy blue, sharp grids, minimal borders.",
                            swatch: ["#1e293b", "#f8fafc", "#1d4ed8"],
                          },
                          {
                            id: "startup",
                            name: "Startup Founder",
                            icon: "🚀",
                            desc: "Bold dark mode — zinc tones, orange energy, impact-first storytelling.",
                            swatch: ["#18181b", "#3f3f46", "#f97316"],
                          },
                          {
                            id: "creative",
                            name: "Creative Designer",
                            icon: "🎨",
                            desc: "Dark canvas — teal neon, cinematic black, expressive visual flair.",
                            swatch: ["#0b0c10", "#1f2833", "#66fcf1"],
                          },
                          {
                            id: "futuristic",
                            name: "AI Futuristic",
                            icon: "🤖",
                            desc: "Glassmorphism & neon gold — AI-era aesthetics, frosted panels.",
                            swatch: ["#0f172a", "#1e293b", "#d4af37"],
                          },
                        ].filter((theme) => institutionConfig.enabledThemes.includes(theme.id)).map((theme) => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 border rounded-lg text-left transition-all ${
                              selectedTheme === theme.id
                                ? "bg-mcc-gold/10 border-mcc-gold shadow-sm"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <span className="text-xl shrink-0">{theme.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[11px] font-bold tracking-wide ${ selectedTheme === theme.id ? "text-mcc-gold" : "text-slate-800 dark:text-slate-200" }`}>{theme.name}</div>
                              <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight line-clamp-1">{theme.desc}</div>
                            </div>
                            <div className="flex gap-0.5 shrink-0">
                              {theme.swatch.map((color, i) => (
                                <div key={i} className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {settingsStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                      <span className="text-[10px] text-mcc-gold uppercase font-bold tracking-wider">Step 3 of 4: Typography & Styling</span>

                      {/* Premium Typography */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">Premium Typography</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "sans", name: "Inter (Sans-serif)" },
                            { id: "serif", name: "Playfair (Serif)" },
                            { id: "mono", name: "Fira Code (Mono)" },
                            { id: "display", name: "Outfit (Geometric)" },
                          ].map((font) => (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => setFontFamily(font.id)}
                              className={`p-2 border text-left rounded-lg text-slate-700 dark:text-slate-200 transition-all ${
                                fontFamily === font.id
                                  ? "bg-mcc-gold/10 border-mcc-gold text-mcc-gold font-bold shadow"
                                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                              }`}
                            >
                              <div className="text-xs">{font.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Card Style Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">Card Visual Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "default", name: "Theme Default" },
                            { id: "glass", name: "Frosted Glass" },
                            { id: "neo", name: "Retro Neo-Brutalism" },
                            { id: "glow", name: "Glowing Highlight" },
                          ].map((style) => (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setCardStyle(style.id)}
                              className={`p-2 border text-left rounded-lg text-slate-700 dark:text-slate-200 transition-all ${
                                cardStyle === style.id
                                  ? "bg-mcc-gold/10 border-mcc-gold text-mcc-gold font-bold shadow"
                                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                              }`}
                            >
                              <div className="text-xs">{style.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Header background color customizer */}
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">Header BG Color</label>
                          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950/40 p-1">
                            <input
                              type="color"
                              value={headerBgColor}
                              onChange={(e) => setHeaderBgColor(e.target.value)}
                              className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                            />
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase select-all font-mono">{headerBgColor}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5">Accent Color</label>
                          <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950/40 p-1">
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-5 h-5 bg-transparent border-0 cursor-pointer p-0"
                            />
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase select-all font-mono">{accentColor}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {settingsStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                      <span className="text-[10px] text-mcc-gold uppercase font-bold tracking-wider">Step 4 of 4: Layout Structure & Socials</span>

                      {/* Section Visibility & Reordering */}
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Section Visibility & Order</label>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-normal">Customize card stack order and select which sections to hide.</span>
                        </div>
                        
                        {/* Active Sections */}
                        <div className="flex flex-col gap-1.5 max-h-[170px] overflow-y-auto bg-slate-50/40 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-900">
                          {visibleSections.map((secKey, index) => (
                            <div key={secKey} className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded text-[11px]">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{ALL_SECTION_META[secKey]}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => moveSection(index, "up")}
                                  className="w-5.5 h-5.5 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-[9px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-800"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={index === visibleSections.length - 1}
                                  onClick={() => moveSection(index, "down")}
                                  className="w-5.5 h-5.5 rounded bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-[9px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-800"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => hideSection(secKey)}
                                  className="px-2 h-5.5 rounded bg-red-950/20 hover:bg-red-900/45 border border-red-900/40 text-[9px] font-bold text-red-500 dark:text-red-400 ml-1"
                                >
                                  Hide
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hidden Sections */}
                        {Object.keys(ALL_SECTION_META).some(k => !visibleSections.includes(k)) && (
                          <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-950/20 p-2 rounded-lg border border-slate-200 dark:border-slate-900 border-dashed">
                            <span className="text-[9px] text-slate-500 dark:text-slate-500 font-bold uppercase mb-1 block">Hidden / Disabled Sections</span>
                            <div className="flex flex-wrap gap-1">
                              {Object.keys(ALL_SECTION_META)
                                .filter(k => !visibleSections.includes(k))
                                .map(secKey => (
                                  <button
                                    key={secKey}
                                    type="button"
                                    onClick={() => showSection(secKey)}
                                    className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-350 transition-all flex items-center gap-1"
                                  >
                                    <span>+ Add</span> {ALL_SECTION_META[secKey]}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contact & Social Links */}
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Social & Recruiter Links</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="url"
                            placeholder="LinkedIn URL"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full h-8 px-2 rounded bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                          />
                          <input
                            type="url"
                            placeholder="LeetCode URL"
                            value={leetcodeUrl}
                            onChange={(e) => setLeetcodeUrl(e.target.value)}
                            className="w-full h-8 px-2 rounded bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                          />
                          <input
                            type="url"
                            placeholder="Blog / Website URL"
                            value={blogUrl}
                            onChange={(e) => setBlogUrl(e.target.value)}
                            className="w-full h-8 px-2 rounded bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900 text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Navigation and Save Controls */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-900/60 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={settingsStep === 1}
                      onClick={() => setSettingsStep(prev => prev - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center justify-center text-sm"
                      title="Previous Step"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={settingsStep === 4}
                      onClick={() => setSettingsStep(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:bg-slate-200 dark:hover:bg-slate-900 disabled:opacity-30 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center justify-center text-sm"
                      title="Next Step"
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-200 font-bold text-[11px] shadow"
                  >
                    Save Configs
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Container */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col justify-between h-full min-h-[460px]">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 shrink-0">Live Preview</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 shrink-0">
                    This shows a preview of how your public portfolio website looks with your current settings.
                  </p>
                </div>
                {slugInput ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-6 px-4 text-center h-fit shadow-md">
                    <div className="w-20 h-20 border border-slate-200 dark:border-slate-800 p-1 bg-white rounded-lg flex items-center justify-center mb-2 shadow-inner">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          liveUrl || (typeof window !== "undefined" ? `${window.location.origin}/portfolio/${slugInput}` : "")
                        )}`}
                        alt="Portfolio QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">QR-Enabled Profile Ready</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xs">
                      Recruiters can scan this to view your active portfolio, check your qualifications, and verify credentials.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full justify-center">
                      <a
                        href={`/portfolio/${slugInput}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] text-mcc-gold border border-mcc-gold/20 rounded-md font-bold transition-all text-center flex-1"
                      >
                        Open Portfolio
                      </a>
                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-250 dark:hover:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-900 rounded-md font-bold transition-all flex-1"
                      >
                        Download QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardModalOpen(true)}
                        className="px-2.5 py-1.5 bg-mcc-gold hover:bg-mcc-gold/80 text-[10px] text-slate-950 rounded-md font-bold transition-all flex-1"
                      >
                        Business Card
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic block mt-10">Configure and save a URL slug to enable live preview.</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
        {/* AI Guidance Hub Tab */}
        {activeTab === "ai" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            {/* Top row: Title and status/refresh button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-mcc-gold">✦</span> AI Guidance Hub
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Intelligent academic suggestions, resume auditing, and career readiness gap detection powered by MCC rules engine.
                </p>
              </div>
              <button
                onClick={loadAiRecommendations}
                disabled={loadingAi}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-mcc-gold/40 disabled:opacity-50 text-xs font-bold text-mcc-gold rounded-lg transition-all flex items-center gap-2 shrink-0 shadow-md"
              >
                {loadingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-mcc-gold border-t-transparent rounded-full animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.228 9H18.9" />
                    </svg>
                    Refresh Profile Analysis
                  </>
                )}
              </button>
            </div>

            {loadingAi && !resumeCritique ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3 bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-10 h-10 border-4 border-mcc-gold border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Evaluating your CGPA, projects, publications, and certifications...</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* 1. SOP Generator */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">AI Statement of Purpose (SOP) Writer</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Customize your draft by specifying research areas, career goals, or master studies focus.</p>
                  </div>
                  <form onSubmit={handleGenerateSop} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">Custom Focus or Prompt</label>
                      <input
                        type="text"
                        value={sopPrompt}
                        onChange={(e) => setSopPrompt(e.target.value)}
                        placeholder="e.g. Focus on Distributed Systems, Cloud Architecture, or NSS volunteering"
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={generatingSop}
                      className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light disabled:opacity-50 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      {generatingSop ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                          Drafting Academic SOP...
                        </>
                      ) : (
                        "Generate Custom SOP Draft"
                      )}
                    </button>
                  </form>
                  {aiSopResult && (
                    <div className="flex flex-col gap-3 mt-2">
                      <div className="relative">
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5">Generated SOP Draft</label>
                        <textarea
                          rows={8}
                          value={aiSopResult}
                          onChange={(e) => setAiSopResult(e.target.value)}
                          className="w-full p-4 rounded-lg bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-mono resize-none"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const updated = await api.put<any>("/student/portfolio", {
                              ...portfolio,
                              statementOfPurpose: aiSopResult,
                            }, token);
                            setPortfolio(updated);
                            setSopInput(aiSopResult);
                            showNotification("SOP successfully applied to your public portfolio!", "success");
                          } catch (err: any) {
                            showNotification(err.message || "Failed to apply SOP.", "error");
                          }
                        }}
                        className="w-full px-4 py-2 border border-mcc-gold/30 hover:border-mcc-gold bg-mcc-gold/10 hover:bg-mcc-gold/20 text-xs font-bold text-mcc-gold rounded-lg transition-all"
                      >
                        Apply this SOP to Public Portfolio
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Resume Critique Scorecard */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Portfolio & Resume Critique</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automated scoring of your digital credentials for placement cell readiness.</p>
                  </div>
                  {resumeCritique ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                          {/* Circular progress */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="34" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="6" />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className={`fill-none transition-all duration-1000 ${
                                resumeCritique.score >= 80
                                  ? "stroke-green-500"
                                  : resumeCritique.score >= 60
                                  ? "stroke-amber-500"
                                  : "stroke-red-500"
                              }`}
                              strokeWidth="6"
                              strokeDasharray={`${2 * Math.PI * 34}`}
                              strokeDashoffset={`${2 * Math.PI * 34 * (1 - resumeCritique.score / 100)}`}
                            />
                          </svg>
                          <span className="absolute text-lg font-black text-slate-800 dark:text-slate-100">{resumeCritique.score}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider">Readiness Rating</span>
                          <h5 className={`text-base font-extrabold mt-0.5 ${
                            resumeCritique.score >= 80 ? "text-green-600 dark:text-green-400" : resumeCritique.score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-650 dark:text-red-400"
                          }`}>
                            {resumeCritique.rating}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Based on counts of projects, certifications, research papers, and social links.</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Critical Audit Suggestions</span>
                        {resumeCritique.suggestions && resumeCritique.suggestions.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {resumeCritique.suggestions.map((suggestion: string, i: number) => (
                              <div key={i} className="flex gap-2.5 items-start text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/40">
                                <span className={`shrink-0 font-bold ${
                                  suggestion.startsWith("Critical") ? "text-red-500 dark:text-red-400" : suggestion.startsWith("Important") ? "text-amber-500 dark:text-amber-400" : "text-blue-500 dark:text-blue-400"
                                }`}>
                                  ●
                                </span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-green-950/20 border border-green-900/40 text-center text-xs text-green-400">
                            ✓ Your portfolio hits all critical readiness indexes!
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">Audit report not initialized.</span>
                  )}
                </div>

                {/* 2b. AI Portfolio Design & Layout Suggestions */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-6">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">AI Portfolio Showcase Auditing</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Custom layout and theme suggestions to maximize recruiter attraction rates.</p>
                  </div>
                  {portfolioSuggestions ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                          {/* Circular progress */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="40" cy="40" r="34" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="6" />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              className={`fill-none transition-all duration-1000 ${
                                portfolioSuggestions.score >= 80
                                  ? "stroke-green-500"
                                  : portfolioSuggestions.score >= 60
                                  ? "stroke-amber-500"
                                  : "stroke-red-500"
                              }`}
                              strokeWidth="6"
                              strokeDasharray={`${2 * Math.PI * 34}`}
                              strokeDashoffset={`${2 * Math.PI * 34 * (1 - portfolioSuggestions.score / 100)}`}
                            />
                          </svg>
                          <span className="absolute text-lg font-black text-slate-800 dark:text-slate-100">{portfolioSuggestions.score}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase font-bold tracking-wider">Layout Score</span>
                          <h5 className={`text-base font-extrabold mt-0.5 ${
                            portfolioSuggestions.score >= 80 ? "text-green-600 dark:text-green-400" : portfolioSuggestions.score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-650 dark:text-red-400"
                          }`}>
                            {portfolioSuggestions.rating}
                          </h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Evaluates themes, fonts, biographic data, story blocks, and social links.</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Design Checklist Suggestions</span>
                        {portfolioSuggestions.suggestions && portfolioSuggestions.suggestions.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {portfolioSuggestions.suggestions.map((suggestion: string, i: number) => (
                              <div key={i} className="flex gap-2.5 items-start text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/40">
                                <span className="shrink-0 text-amber-500 font-bold">●</span>
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-green-950/20 border border-green-900/40 text-center text-xs text-green-400">
                            ✓ Your portfolio layout and styling choices are fully optimized!
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">Layout auditing report not initialized. Click Refresh above.</span>
                  )}
                </div>

                {/* 3. Career Guidance Engine — Full Width */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-6">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="text-mcc-gold text-lg">🎯</span> Career Guidance Engine
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Set your target career role and track a personalised milestone roadmap built from your actual profile data.</p>
                    </div>
                    {roadmapData && (
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 block uppercase tracking-wider font-semibold">Roadmap Progress</span>
                          <span className="text-base font-black text-mcc-gold">{roadmapData.completedCount} / {roadmapData.totalCount} milestones</span>
                        </div>
                        <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="19" className="stroke-slate-200 dark:stroke-slate-800 fill-none" strokeWidth="5" />
                            <circle
                              cx="24" cy="24" r="19"
                              className="fill-none stroke-mcc-gold transition-all duration-1000"
                              strokeWidth="5"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 19}`}
                              strokeDashoffset={`${2 * Math.PI * 19 * (1 - (roadmapData.progressPercent || 0) / 100)}`}
                            />
                          </svg>
                          <span className="absolute text-[10px] font-black text-slate-800 dark:text-slate-100">{roadmapData.progressPercent}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left column: Role selector + timeline */}
                    <div className="flex flex-col gap-5">
                      {/* Role pill selector */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Select Your Target Career Role</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Full Stack Developer",
                            "Frontend Engineer",
                            "Backend Systems Developer",
                            "Machine Learning / Data Engineer",
                            "Research Scholar / PhD",
                            "Entrepreneur / Startup Founder"
                          ].map((role) => (
                            <button
                              key={role}
                              onClick={() => setTargetCareerRole(role)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                targetCareerRole === role
                                  ? "bg-mcc-maroon border-mcc-gold/50 text-mcc-gold shadow-md"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-mcc-gold/30 hover:text-slate-800 dark:hover:text-slate-200"
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={handleSaveCareerGoal}
                          disabled={loadingRoadmap}
                          className="h-9 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light disabled:opacity-50 text-xs font-bold text-slate-200 transition-all w-fit flex items-center gap-2 shadow cursor-pointer"
                        >
                          {loadingRoadmap ? (
                            <><div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" /> Generating Roadmap...</>
                          ) : (
                            <>Set as My Career Goal &rarr;</>
                          )}
                        </button>
                      </div>

                      {/* Milestone Timeline */}
                      {roadmapData ? (
                        <div className="flex flex-col gap-2">
                          {/* Progress bar */}
                          <div className="mb-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                              <span>Milestone Completion</span>
                              <span className="text-mcc-gold font-bold">{roadmapData.completedCount} of {roadmapData.totalCount} done</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-mcc-maroon to-mcc-gold h-full rounded-full transition-all duration-1000"
                                style={{ width: `${roadmapData.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {roadmapData.milestones.map((m: any, i: number) => (
                            <div key={i} className="flex gap-3 relative">
                              {i < roadmapData.milestones.length - 1 && (
                                <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
                              )}
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 text-[9px] font-black border-2 transition-all ${
                                m.isCompleted
                                  ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/30"
                                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                              }`}>
                                {m.isCompleted ? "✓" : m.step}
                              </div>
                              <div className="pb-4 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-bold ${
                                    m.isCompleted
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-slate-800 dark:text-slate-200"
                                  }`}>
                                    {m.title}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                    m.category === "Projects" ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
                                    m.category === "Skills" ? "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" :
                                    m.category === "Research" ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" :
                                    m.category === "Certifications" ? "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800" :
                                    m.category === "Academic" ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" :
                                    m.category === "Community" ? "bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" :
                                    "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                                  }`}>
                                    {m.category}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{m.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/20">
                          <span className="text-3xl block mb-2">🎯</span>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No roadmap yet</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">Select a career goal above and click "Set as My Career Goal" to generate your personalised milestone roadmap.</p>
                        </div>
                      )}
                    </div>

                    {/* Right column: Skill Gaps + Courses + Stack Matches */}
                    <div className="flex flex-col gap-4">
                      {roadmapData ? (
                        <>
                          {/* Skill Gaps */}
                          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Skill Gaps for {roadmapData.targetRole}</span>
                            {roadmapData.skillGaps && roadmapData.skillGaps.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                {roadmapData.skillGaps.map((gap: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2.5 text-xs p-2.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-lg">
                                    <span className="text-amber-500 shrink-0 font-bold mt-0.5">⚠</span>
                                    <span className="text-slate-700 dark:text-slate-300">{gap}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg bg-green-950/20 border border-green-900/40 text-center text-xs text-green-400">✓ No critical skill gaps detected for this role!</div>
                            )}
                          </div>

                          {/* Recommended Courses */}
                          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Recommended Upskill Courses</span>
                            <div className="flex flex-col gap-2">
                              {roadmapData.recommendedCourses && roadmapData.recommendedCourses.map((course: string, i: number) => (
                                <div key={i} className="flex items-start gap-2.5 text-xs p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30 rounded-lg">
                                  <span className="text-blue-400 shrink-0 mt-0.5">📚</span>
                                  <span className="text-slate-700 dark:text-slate-300">{course}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tech Stack Matches (from careerGuidance) */}
                          {careerGuidance && careerGuidance.roles && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Your Tech Stack Role Matches</span>
                              <div className="flex flex-col gap-2">
                                {careerGuidance.roles.map((r: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg">
                                    <div>
                                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{r.role}</span>
                                      <span className="text-[9px] text-slate-500 dark:text-slate-400">{r.desc}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                      r.fit === "High Match" || r.fit === "Strong Match"
                                        ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                        : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                    }`}>{r.fit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        careerGuidance ? (
                          <div className="flex flex-col gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tech Stack Career Matches</span>
                              {careerGuidance.roles && careerGuidance.roles.map((r: any, i: number) => (
                                <div key={i} className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between gap-4">
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{r.role}</h5>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                    r.fit === "High Match" || r.fit === "Strong Match"
                                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                      : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                  }`}>{r.fit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Career analysis loading...</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. University Recommendations */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Higher Education & Master Program Matching</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Recommendations for higher studies matching your CGPA and paper publications.</p>
                  </div>
                  {uniMatches && uniMatches.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {uniMatches.map((uni: any, i: number) => (
                        <div key={i} className="p-3.5 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col gap-1.5">
                          <div className="flex justify-between items-center gap-2">
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{uni.university}</h5>
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[9px] font-bold shrink-0">
                              {uni.matchChance}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-medium">Program: {uni.program}</span>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal bg-slate-100 dark:bg-slate-900/30 p-2 rounded border border-slate-200 dark:border-slate-800/40 mt-1">
                            <strong>AI Match Reason:</strong> {uni.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">No university matches retrieved.</span>
                  )}
                </div>

                {/* 5. Internship Matches */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Stipend Internship Recommendations</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Stipend internships matched based on your active project portfolio skills.</p>
                  </div>
                  {internships && internships.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {internships.map((internship: any, i: number) => (
                        <div key={i} className="p-3.5 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col gap-1.5 shadow-inner">
                          <div className="flex justify-between items-center gap-2">
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{internship.internshipRole}</h5>
                            <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-[9px] font-bold shrink-0">
                              {internship.matchChance}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                            <span>Company: {internship.company}</span>
                            <span className="text-mcc-gold font-bold">{internship.stipend}</span>
                          </div>
                          <p className="text-[10px] text-slate-650 dark:text-slate-400 leading-normal bg-slate-100 dark:bg-slate-900/30 p-2 rounded border border-slate-200 dark:border-slate-800/40 mt-1">
                            {internship.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">No internship recommendations matching your current skillset.</span>
                  )}
                </div>

                {/* 6. Scholarship Matches */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur-md flex flex-col gap-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Scholarship & Research Matches</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Academic scholarship opportunities based on your CGPA and paper publications.</p>
                  </div>
                  {scholarships && scholarships.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {scholarships.map((scholarship: any, i: number) => (
                        <div key={i} className="p-3.5 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl flex flex-col gap-1.5 shadow-inner">
                          <div className="flex justify-between items-center gap-2">
                            <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{scholarship.scholarshipName}</h5>
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[9px] font-bold shrink-0">
                              {scholarship.matchChance}
                            </span>
                          </div>
                          <div className="text-[10px] text-mcc-gold font-bold">
                            Award: {scholarship.awardAmount}
                          </div>
                          <p className="text-[10px] text-slate-650 dark:text-slate-400 leading-normal bg-slate-100 dark:bg-slate-900/30 p-2 rounded border border-slate-200 dark:border-slate-800/40 mt-1">
                            <strong>Eligibility Reason:</strong> {scholarship.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">No scholarship recommendations matches.</span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Campus Notices Tab */}
        {activeTab === "circulars" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Campus Bulletins & Notices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Important updates published by placement, research, and innovation coordinators.</p>
              <div className="flex flex-col gap-4">
                {circularsList.length === 0 ? (
                  <div className="p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">No announcements posted yet.</span>
                  </div>
                ) : (
                  circularsList.map((circ) => (
                    <div key={circ.id} className="p-5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{circ.title}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                          {new Date(circ.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {circ.content}
                      </p>
                      <span className="text-[10px] text-mcc-gold font-bold uppercase mt-3.5 block tracking-widest">
                        Sender: {circ.senderRole.replace("Coordinator", " Cell")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Startup Incubator Tab */}
        {activeTab === "incubator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Submit Startup / Prototype Pitch</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Log your startup designs, prototype milestones, and seek incubator support from the cell.</p>
                
                <form onSubmit={handlePostStartupIdea} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Idea / Venture Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EcoCampus Marketplace"
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Pitch Description</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe the problem, your solution, and what resource or funding support you require..."
                      value={newIdeaDescription}
                      onChange={(e) => setNewIdeaDescription(e.target.value)}
                      className="w-full p-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 resize-none"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Team Member Names</label>
                      <input
                        type="text"
                        required
                        placeholder="Comma separated names"
                        value={newIdeaTeam}
                        onChange={(e) => setNewIdeaTeam(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Development Stage</label>
                      <select
                        value={newIdeaStage}
                        onChange={(e) => setNewIdeaStage(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      >
                        <option value="Idea">Idea / Paper Concept</option>
                        <option value="Prototype">Working Prototype</option>
                        <option value="MVP">Minimum Viable Product</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Funding Ask (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹5,00,000"
                        value={newIdeaFundingAsk}
                        onChange={(e) => setNewIdeaFundingAsk(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Pitch Deck URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="Google Drive, Canva, etc."
                        value={newIdeaPitchDeckUrl}
                        onChange={(e) => setNewIdeaPitchDeckUrl(e.target.value)}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-200 font-semibold text-sm w-fit shadow"
                  >
                    Register Pitch
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Your Submissions</h3>
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {startupIdeas.length === 0 ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg">
                      No startup pitches submitted yet.
                    </span>
                  ) : (
                    startupIdeas.map((idea) => (
                      <div key={idea.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{idea.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            idea.status === "IncubationApproved"
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : idea.status === "Review"
                              ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                          }`}>
                            {idea.status === "IncubationApproved" ? "Incubation Approved" : idea.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {idea.description}
                        </p>
                        <div className="text-[10px] text-slate-550 dark:text-slate-400 flex flex-col gap-1 mt-1 border-t border-slate-200 dark:border-slate-900/65 pt-2">
                          <div className="flex justify-between items-center text-[9px]">
                            <span>Stage: <strong className="text-slate-700 dark:text-slate-350">{idea.stage}</strong></span>
                            <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                          </div>
                          {idea.fundingAsk && (
                            <span className="text-[9px]">Funding Ask: <strong className="text-slate-700 dark:text-slate-350">{idea.fundingAsk}</strong></span>
                          )}
                          {idea.pitchDeckUrl && (
                            <span className="text-[9px]">
                              Pitch Deck: <a href={idea.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-mcc-gold hover:underline font-bold">View Deck</a>
                            </span>
                          )}
                          {idea.mentorName && (
                            <span className="text-[9px]">Mentor: <strong className="text-slate-700 dark:text-slate-350">{idea.mentorName}</strong></span>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-2 border-t border-slate-200 dark:border-slate-900/65 pt-2">
                          <button
                            onClick={() => handleOpenEditModal("idea", idea)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-[10px] font-medium text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem("idea", idea.id)}
                            className="px-2 py-1 bg-red-950/10 hover:bg-red-950/20 text-[10px] font-medium text-red-650 dark:text-red-400 rounded border border-red-900/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CRUD Edit/Add Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {currentItem.id ? "Edit" : "Add"} {modalType === "project" ? "Project" : modalType === "cert" ? "Certification" : modalType === "pub" ? "Publication" : modalType === "ach" ? "Achievement" : modalType === "service" ? "Community Service" : modalType === "conf" ? "Conference Presentation" : modalType === "fair" ? "Science Fair Entry" : "Startup Prototype Pitch"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
                {modalType === "project" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Project Title</label>
                      <input
                        type="text"
                        required
                        value={currentItem.title || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={currentItem.description || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Technologies Used (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="React, Next.js, C#"
                        value={currentItem.technologiesUsed || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, technologiesUsed: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">GitHub URL</label>
                        <input
                          type="url"
                          value={currentItem.githubUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, githubUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Live Demo URL</label>
                        <input
                          type="url"
                          value={currentItem.liveUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, liveUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Project Showcase Type</label>
                        <select
                          value={currentItem.projectType || "Technical"}
                          onChange={(e) => setCurrentItem({ ...currentItem, projectType: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        >
                          <option value="Technical">Technical</option>
                          <option value="Innovation">Innovation</option>
                          <option value="Research">Research</option>
                          <option value="Design">Design</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Demo Video URL</label>
                        <input
                          type="url"
                          placeholder="e.g. YouTube or Drive link"
                          value={currentItem.demoVideoUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, demoVideoUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Project Image URL</label>
                      <input
                        type="url"
                        value={currentItem.imageUrl || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </>
                )}

                {modalType === "cert" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Certification Name</label>
                      <input
                        type="text"
                        required
                        value={currentItem.name || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Issuing Organization</label>
                      <input
                        type="text"
                        required
                        value={currentItem.issuingOrganization || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, issuingOrganization: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Issue Date</label>
                        <input
                          type="date"
                          required
                          value={currentItem.issueDate ? currentItem.issueDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, issueDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Expiration Date</label>
                        <input
                          type="date"
                          value={currentItem.expirationDate ? currentItem.expirationDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, expirationDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Credential ID</label>
                        <input
                          type="text"
                          value={currentItem.credentialId || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, credentialId: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Credential Verification URL</label>
                        <input
                          type="url"
                          value={currentItem.credentialUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, credentialUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                {modalType === "pub" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Publication Title</label>
                      <input
                        type="text"
                        required
                        value={currentItem.title || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Journal / Conference Name</label>
                      <input
                        type="text"
                        required
                        value={currentItem.journalOrConference || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, journalOrConference: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Publish Date</label>
                        <input
                          type="date"
                          required
                          value={currentItem.publishDate ? currentItem.publishDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, publishDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Paper URL (ArXiv, IEEE, etc.)</label>
                        <input
                          type="url"
                          value={currentItem.paperUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, paperUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Publication Category</label>
                        <select
                          value={currentItem.publicationType || "Journal"}
                          onChange={(e) => setCurrentItem({ ...currentItem, publicationType: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        >
                          <option value="Journal">Journal</option>
                          <option value="Conference">Conference</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Book Chapter">Book Chapter</option>
                          <option value="Preprint">Preprint</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">DOI or ISBN</label>
                        <input
                          type="text"
                          placeholder="e.g. 10.1016/j.jpdc.2025.02"
                          value={currentItem.doiOrIsbn || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, doiOrIsbn: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Authors (Comma-separated)</label>
                      <input
                        type="text"
                        required
                        value={currentItem.authors || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, authors: e.target.value })}
                        placeholder="Bryan Manuel, Dr. Franklin Raj"
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Abstract Summary</label>
                      <textarea
                        rows={4}
                        required
                        value={currentItem.abstract || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, abstract: e.target.value })}
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </>
                )}

                {modalType === "ach" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Award/Achievement Title</label>
                      <input
                        type="text"
                        required
                        value={currentItem.title || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Description</label>
                      <textarea
                        rows={3}
                        required
                        value={currentItem.description || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Date Earned</label>
                        <input
                          type="date"
                          required
                          value={currentItem.dateEarned ? currentItem.dateEarned.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, dateEarned: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Category</label>
                        <select
                          value={currentItem.category || "Hackathon"}
                          onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        >
                          <option value="Hackathon">Hackathon</option>
                          <option value="Olympiad">Olympiad</option>
                          <option value="Sports">Sports</option>
                          <option value="Extracurricular">Extracurricular</option>
                          <option value="Startup">Startup Contest</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Certificate PDF/Image</label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          readOnly
                          placeholder="No file uploaded"
                          value={currentItem.certificateUrl || ""}
                          className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-400"
                        />
                        <label className="h-10 px-4 border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/60 dark:hover:bg-slate-900 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                          Browse
                          <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleCertificateUpload} />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {modalType === "service" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">NGO/Organization Name</label>
                      <input
                        type="text"
                        required
                        value={currentItem.organization || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, organization: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Your Role / Duty</label>
                      <input
                        type="text"
                        required
                        value={currentItem.role || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, role: e.target.value })}
                        placeholder="e.g. Volunteer, NSS Coordinator"
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Impact Description</label>
                      <textarea
                        rows={3}
                        required
                        value={currentItem.description || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Start Date</label>
                        <input
                          type="date"
                          required
                          value={currentItem.startDate ? currentItem.startDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, startDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">End Date (Optional)</label>
                        <input
                          type="date"
                          value={currentItem.endDate ? currentItem.endDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, endDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                {modalType === "conf" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Presentation Title</label>
                      <input
                        type="text"
                        required
                        value={currentItem.title || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Conference Name</label>
                      <input
                        type="text"
                        required
                        value={currentItem.conferenceName || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, conferenceName: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Role</label>
                        <select
                          value={currentItem.role || "Presenter"}
                          onChange={(e) => setCurrentItem({ ...currentItem, role: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        >
                          <option value="Presenter">Presenter</option>
                          <option value="Panelist">Panelist</option>
                          <option value="Session Chair">Session Chair</option>
                          <option value="Organizer">Organizer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Location / Venue</label>
                        <input
                          type="text"
                          placeholder="e.g. Chennai, India"
                          value={currentItem.location || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, location: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Presentation Date</label>
                        <input
                          type="date"
                          required
                          value={currentItem.presentationDate ? currentItem.presentationDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, presentationDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Abstract Link (Optional)</label>
                        <input
                          type="url"
                          value={currentItem.abstractUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, abstractUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Presentation Certificate</label>
                      <div className="flex gap-4 items-center">
                        <input
                          type="text"
                          readOnly
                          placeholder="No certificate uploaded"
                          value={currentItem.certificateUrl || ""}
                          className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-400"
                        />
                        <label className="h-10 px-4 border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/60 dark:hover:bg-slate-900 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                          Browse
                          <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleCertificateUpload} />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {modalType === "fair" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Science Fair Name</label>
                      <input
                        type="text"
                        required
                        value={currentItem.fairName || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, fairName: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Project Title</label>
                      <input
                        type="text"
                        required
                        value={currentItem.projectTitle || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, projectTitle: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Description / Concept</label>
                      <textarea
                        rows={3}
                        required
                        value={currentItem.description || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Level</label>
                        <select
                          value={currentItem.level || "School"}
                          onChange={(e) => setCurrentItem({ ...currentItem, level: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        >
                          <option value="School">School</option>
                          <option value="District">District</option>
                          <option value="State">State</option>
                          <option value="National">National</option>
                          <option value="International">International</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Award Received (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. First Place, Gold Medal"
                          value={currentItem.awardReceived || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, awardReceived: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Fair Date</label>
                        <input
                          type="date"
                          required
                          value={currentItem.fairDate ? currentItem.fairDate.substring(0, 10) : ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, fairDate: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Certificate URL / Attachment</label>
                        <div className="flex gap-4 items-center">
                          <input
                            type="text"
                            readOnly
                            placeholder="No certificate uploaded"
                            value={currentItem.certificateUrl || ""}
                            className="flex-1 h-10 px-4 rounded-lg bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-400"
                          />
                          <label className="h-10 px-4 border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/60 dark:hover:bg-slate-900 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                            Browse
                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleCertificateUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {modalType === "idea" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Idea / Venture Title</label>
                      <input
                        type="text"
                        required
                        value={currentItem.title || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Description / Pitch</label>
                      <textarea
                        rows={4}
                        required
                        value={currentItem.description || ""}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                        className="w-full p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Team Members</label>
                        <input
                          type="text"
                          required
                          value={currentItem.teamMembers || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, teamMembers: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Stage</label>
                        <select
                          value={currentItem.stage || "Idea"}
                          onChange={(e) => setCurrentItem({ ...currentItem, stage: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        >
                          <option value="Idea">Idea</option>
                          <option value="Prototype">Prototype</option>
                          <option value="MVP">MVP</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Funding Ask (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹5,00,000"
                          value={currentItem.fundingAsk || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, fundingAsk: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Pitch Deck URL (Optional)</label>
                        <input
                          type="url"
                          placeholder="Google Drive, Canva, etc."
                          value={currentItem.pitchDeckUrl || ""}
                          onChange={(e) => setCurrentItem({ ...currentItem, pitchDeckUrl: e.target.value })}
                          className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 mt-6 border-t border-slate-200 dark:border-slate-900 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold text-slate-650 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-xs font-semibold text-slate-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Business Card Modal */}
      <AnimatePresence>
        {cardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-lg w-full flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Printable Digital Business Card</h3>
                <button
                  onClick={() => setCardModalOpen(false)}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Printable Business Card Area */}
              <div className="flex justify-center py-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                <div
                  className="print-card-area w-[360px] h-[210px] bg-gradient-to-br from-[#800020] to-[#500010] border-2 border-[#d4af37] rounded-xl p-4 flex flex-col justify-between text-white relative shadow-2xl overflow-hidden"
                  style={{
                    fontFamily: fontFamily === 'serif' ? 'Playfair Display, Georgia, serif' : fontFamily === 'mono' ? 'Fira Code, monospace' : fontFamily === 'display' ? 'Outfit, sans-serif' : 'Inter, sans-serif'
                  }}
                >
                  {/* Decorative Watermark */}
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
                    <span className="text-9xl font-black font-sans">MCC</span>
                  </div>

                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-white/20 pb-1.5 z-10">
                    <div>
                      <span className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase block leading-none">MADRAS CHRISTIAN COLLEGE</span>
                      <span className="text-[7px] text-white/60 tracking-wider uppercase block mt-0.5 leading-none">Student Portfolio Ecosystem</span>
                    </div>
                    <span className="text-[#d4af37] text-[10px] font-bold">ESTD. 1837</span>
                  </div>

                  {/* Card Main Body */}
                  <div className="flex justify-between items-center gap-2 my-auto z-10">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-extrabold text-white truncate block leading-tight">
                        {profile?.firstName} {profile?.lastName}
                      </span>
                      <span className="text-[9px] text-[#d4af37] font-semibold block mt-0.5 truncate">
                        {profile?.department}
                      </span>
                      <span className="text-[8px] text-white/70 block mt-1 leading-none">
                        Roll: {profile?.rollNumber} &bull; Batch {profile?.batchYear}
                      </span>
                      <span className="text-[8px] text-white/50 block mt-1 underline truncate font-mono">
                        mcc-portfolio.edu/portfolio/{slugInput}
                      </span>
                    </div>

                    <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center border border-[#d4af37]/35 shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          liveUrl || (typeof window !== "undefined" ? `${window.location.origin}/portfolio/${slugInput}` : "")
                        )}`}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-center border-t border-white/10 pt-1 z-10 text-[7px] text-white/60">
                    <span>Generated: {new Date().toLocaleDateString()}</span>
                    <span className="text-[#d4af37] font-semibold">Scan to Verify Profile</span>
                  </div>

                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }
                      .print-card-area, .print-card-area * {
                        visibility: visible !important;
                      }
                      .print-card-area {
                        position: fixed !important;
                        left: 50% !important;
                        top: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 3.5in !important;
                        height: 2.0in !important;
                        border: 2px solid #d4af37 !important;
                        background: linear-gradient(135deg, #800020 0%, #500010 100%) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-shadow: none !important;
                        border-radius: 0.125in !important;
                      }
                    }
                  ` }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setCardModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-xs font-bold text-slate-200 rounded-lg transition-all"
                >
                  Print ID Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
