"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

export default function CoordinatorDashboard() {
  const { token, user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Common data
  const [circulars, setCirculars] = useState<any[]>([]);
  const [newCircularTitle, setNewCircularTitle] = useState("");
  const [newCircularContent, setNewCircularContent] = useState("");

  // Placement coordinator state
  const [students, setStudents] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState("All");
  const [minCgpa, setMinCgpa] = useState("");
  const [expandedDriveId, setExpandedDriveId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<Record<string, string>>({});
  const [reviewRemarks, setReviewRemarks] = useState<Record<string, string>>({});
  const [newDrive, setNewDrive] = useState({
    title: "",
    description: "",
    companyName: "",
    eligibilityCgpa: 0,
    driveDate: "",
    applicationLink: "",
  });

  // Research coordinator state
  const [publications, setPublications] = useState<any[]>([]);
  const [pubFilterDept, setPubFilterDept] = useState("All");
  const [conferences, setConferences] = useState<any[]>([]);
  const [confFilterDept, setConfFilterDept] = useState("All");

  // Innovation coordinator state
  const [ideas, setIdeas] = useState<any[]>([]);
  const [scienceFairs, setScienceFairs] = useState<any[]>([]);

  // Student Affairs coordinator state
  const [achievements, setAchievements] = useState<any[]>([]);
  const [communityServices, setCommunityServices] = useState<any[]>([]);
  const [verifyStatus, setVerifyStatus] = useState<Record<string, boolean>>({});
  const [verifyRemarks, setVerifyRemarks] = useState<Record<string, string>>({});

  // Alumni Tracking state
  const [alumniSearch, setAlumniSearch] = useState("");
  const [alumniDept, setAlumniDept] = useState("All");

  // Modals / Tabs
  const [activeTab, setActiveTab] = useState("overview");

  const showNotification = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load generic stats, circulars, and analytics
      const [statsRes, circularsRes, analyticsRes] = await Promise.all([
        api.get<any>("/coordinator/stats", token),
        api.get<any[]>("/coordinator/circulars", token),
        api.get<any>("/coordinator/analytics", token)
      ]);
      setStats(statsRes);
      setCirculars(circularsRes);
      setAnalytics(analyticsRes);

      // Load role-specific data
      if (user?.role === "PlacementCoordinator") {
        const studRes = await api.get<any[]>("/coordinator/placement/students", token);
        const driveRes = await api.get<any[]>("/coordinator/placement/drives", token);
        setStudents(studRes);
        setDrives(driveRes);
      } else if (user?.role === "ResearchCoordinator") {
        const [pubRes, confRes] = await Promise.all([
          api.get<any[]>("/coordinator/research/publications", token),
          api.get<any[]>("/coordinator/research/conferences", token)
        ]);
        setPublications(pubRes);
        setConferences(confRes);
      } else if (user?.role === "InnovationCoordinator") {
        const [ideasRes, fairsRes] = await Promise.all([
          api.get<any[]>("/coordinator/innovation/ideas", token),
          api.get<any[]>("/coordinator/innovation/science-fairs", token)
        ]);
        setIdeas(ideasRes);
        setScienceFairs(fairsRes);
      } else if (user?.role === "StudentAffairsCoordinator") {
        const achRes = await api.get<any[]>("/coordinator/studentaffairs/achievements", token);
        const csRes = await api.get<any[]>("/coordinator/studentaffairs/community-services", token);
        const studRes = await api.get<any[]>("/coordinator/placement/students", token).catch(() => []);
        setAchievements(achRes);
        setCommunityServices(csRes);
        setStudents(studRes);
      } else if (user?.role === "Admin") {
        const studRes = await api.get<any[]>("/coordinator/placement/students", token).catch(() => []);
        setStudents(studRes);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, user]);

  // Handlers for Circular posting
  const handlePostCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircularTitle || !newCircularContent) return;
    try {
      await api.post("/coordinator/circulars", {
        title: newCircularTitle,
        content: newCircularContent,
      }, token);
      showNotification("Circular bulletin published successfully!", "success");
      setNewCircularTitle("");
      setNewCircularContent("");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to publish circular.", "error");
    }
  };

  // Handlers for Job Drive posting (Placement Coordinator)
  const handlePostDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/coordinator/placement/drives", {
        ...newDrive,
        eligibilityCgpa: Number(newDrive.eligibilityCgpa),
        driveDate: new Date(newDrive.driveDate).toISOString(),
      }, token);
      showNotification("Placement drive published successfully!", "success");
      setNewDrive({
        title: "",
        description: "",
        companyName: "",
        eligibilityCgpa: 0,
        driveDate: "",
        applicationLink: "",
      });
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to publish placement drive.", "error");
    }
  };

  const handleDeleteDrive = async (driveId: string) => {
    if (!confirm("Are you sure you want to delete this placement drive?")) return;
    try {
      await api.delete(`/coordinator/placement/drives/${driveId}`, token);
      showNotification("Placement drive deleted.", "success");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete drive.", "error");
    }
  };

  const handleToggleApplicants = async (driveId: string) => {
    if (expandedDriveId === driveId) {
      setExpandedDriveId(null);
      setApplicants([]);
      return;
    }

    try {
      setExpandedDriveId(driveId);
      setLoadingApplicants(true);
      setApplicants([]);
      const appRes = await api.get<any[]>(`/coordinator/placement/drives/${driveId}/applicants`, token);
      setApplicants(appRes || []);
      
      // Initialize forms state
      const initialStatus: Record<string, string> = {};
      const initialRemarks: Record<string, string> = {};
      (appRes || []).forEach((app) => {
        initialStatus[app.applicationId] = app.status;
        initialRemarks[app.applicationId] = app.remarks || "";
      });
      setReviewStatus(initialStatus);
      setReviewRemarks(initialRemarks);
    } catch (err: any) {
      showNotification(err.message || "Failed to retrieve applicants.", "error");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleSubmitReview = async (applicationId: string) => {
    const status = reviewStatus[applicationId] || "Applied";
    const remarks = reviewRemarks[applicationId] || "";
    try {
      await api.put(`/coordinator/placement/applications/${applicationId}/status`, { status, remarks }, token);
      showNotification("Application review submitted successfully!", "success");
      
      // Refresh applicants for the current drive
      if (expandedDriveId) {
        const appRes = await api.get<any[]>(`/coordinator/placement/drives/${expandedDriveId}/applicants`, token);
        setApplicants(appRes || []);
      }
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to submit application review.", "error");
    }
  };

  // Handlers for Startup Ideas (Innovation Coordinator)
  const handleUpdateIdeaStatus = async (ideaId: string, status: string) => {
    try {
      await api.put(`/coordinator/innovation/ideas/${ideaId}/status`, { status }, token);
      showNotification(`Incubation pitch updated to '${status}'.`, "success");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status.", "error");
    }
  };

  // Handlers for Student Affairs verification
  const handleVerifyAchievement = async (id: string, isVerified: boolean) => {
    const remarks = verifyRemarks[id] || "";
    try {
      await api.put(`/coordinator/studentaffairs/achievements/${id}/verify`, { isVerified, remarks }, token);
      showNotification(`Achievement verification updated to ${isVerified ? "Approved" : "Rejected"}.`, "success");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update achievement verification.", "error");
    }
  };

  const handleVerifyCommunityService = async (id: string, isVerified: boolean) => {
    const remarks = verifyRemarks[id] || "";
    try {
      await api.put(`/coordinator/studentaffairs/community-services/${id}/verify`, { isVerified, remarks }, token);
      showNotification(`Community service verification updated to ${isVerified ? "Approved" : "Rejected"}.`, "success");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update community service verification.", "error");
    }
  };

  const handleVerifyConference = async (id: string, isVerified: boolean) => {
    const remarks = verifyRemarks[id] || "";
    try {
      await api.put(`/coordinator/research/conferences/${id}/verify`, { isVerified, remarks }, token);
      showNotification(`Conference verification updated to ${isVerified ? "Approved" : "Rejected"}.`, "success");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update conference verification.", "error");
    }
  };

  const handleVerifyScienceFair = async (id: string, isVerified: boolean) => {
    const remarks = verifyRemarks[id] || "";
    try {
      await api.put(`/coordinator/innovation/science-fairs/${id}/verify`, { isVerified, remarks }, token);
      showNotification(`Science fair verification updated to ${isVerified ? "Approved" : "Rejected"}.`, "success");
      loadData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update science fair verification.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-12 h-12 border-4 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin" />
        <p className="text-sm">Assembling coordinator console...</p>
      </div>
    );
  }

  // Filter students based on selection
  const departments = ["All", ...Array.from(new Set(students.map((s) => s.department)))];
  const filteredStudents = students.filter((s) => {
    const deptMatch = filterDept === "All" || s.department === filterDept;
    const cgpaMatch = !minCgpa || s.cgpa >= parseFloat(minCgpa);
    return deptMatch && cgpaMatch;
  });

  // Filter publications based on selection
  const pubDepartments = ["All", ...Array.from(new Set(publications.map((p) => p.student.department)))];
  const filteredPublications = publications.filter((p) => {
    return pubFilterDept === "All" || p.student.department === pubFilterDept;
  });

  // Filter conferences based on selection
  const confDepartments = ["All", ...Array.from(new Set(conferences.map((c) => c.student?.department).filter(Boolean)))];
  const filteredConferences = conferences.filter((c) => {
    return confFilterDept === "All" || c.student?.department === confFilterDept;
  });

  // Translate role name for presentation
  const formatRoleName = (role: string) => {
    if (role === "PlacementCoordinator") return "Placement Cell Coordinator";
    if (role === "ResearchCoordinator") return "Research Cell Coordinator";
    if (role === "InnovationCoordinator") return "Innovation & Incubation Head";
    if (role === "StudentAffairsCoordinator") return "Student Affairs Dean / Officer";
    return role;
  };

  return (
    <div className="flex flex-col gap-8 w-full p-6 md:p-10 max-w-7xl mx-auto bg-transparent text-slate-900 dark:text-slate-100">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything except the print container */
          header, footer, nav, .no-print, button, select, input, .Fixed, .toast-notification {
            display: none !important;
          }
          /* Ensure layout takes full printable area */
          .print-container {
            background: white !important;
            color: black !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
          }
          table {
            color: black !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 20px !important;
          }
          th, td {
            color: black !important;
            border-bottom: 1px solid #ddd !important;
            padding: 10px 8px !important;
          }
          th {
            background-color: #f1f1f1 !important;
            font-weight: bold !important;
          }
          a {
            text-decoration: none !important;
            color: black !important;
          }
        }
      `}</style>
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

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-900 pb-6 gap-4 no-print">
        <div>
          <span className="text-xs text-mcc-gold font-bold tracking-widest uppercase">
            Institutional Digital Ecosystem
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            {formatRoleName(user?.role || "")} Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Madras Christian College &bull; Academic Portal
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-950 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-650 dark:hover:text-red-400 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Analytics Stats Roster */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 no-print">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Students Registered</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">{stats.totalStudents}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Placement Drives</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">{stats.totalPlacementDrives}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Research Publications</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">{stats.totalPublications}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Startup Pitches</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">{stats.totalStartupIdeas}</span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 col-span-2 md:col-span-1 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Announcements</span>
            <span className="text-2xl font-black text-mcc-gold block mt-1">{stats.totalCirculars}</span>
          </div>
        </div>
      )}

      {/* Dashboard Sub Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-900 overflow-x-auto gap-2 no-print">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "overview"
              ? "border-mcc-gold text-mcc-gold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Bulletins & Circulars
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
            activeTab === "analytics"
              ? "border-mcc-gold text-mcc-gold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Institutional Analytics
        </button>

        {user?.role === "PlacementCoordinator" && (
          <>
            <button
              onClick={() => setActiveTab("students")}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "students"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Audited Students List
            </button>
            <button
              onClick={() => setActiveTab("drives")}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "drives"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Manage Job Drives
            </button>
          </>
        )}

        {user?.role === "StudentAffairsCoordinator" && (
          <>
            <button
              onClick={() => setActiveTab("studentaffairs-achievements")}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "studentaffairs-achievements"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Achievements Verification
            </button>
            <button
              onClick={() => setActiveTab("studentaffairs-community")}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "studentaffairs-community"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Community Service Verification
            </button>
          </>
        )}

        {(user?.role === "PlacementCoordinator" || user?.role === "StudentAffairsCoordinator" || user?.role === "Admin") && (
          <button
            onClick={() => setActiveTab("alumni")}
            className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
              activeTab === "alumni"
                ? "border-mcc-gold text-mcc-gold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Alumni Tracking
          </button>
        )}

        {user?.role === "ResearchCoordinator" && (
          <>
            <button
              onClick={() => setActiveTab("research")}
              className={`whitespace-nowrap pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "research"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Research Publications Audit
            </button>
            <button
              onClick={() => setActiveTab("conferences")}
              className={`whitespace-nowrap pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "conferences"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Conference Presentations
            </button>
          </>
        )}

        {user?.role === "InnovationCoordinator" && (
          <>
            <button
              onClick={() => setActiveTab("innovation")}
              className={`whitespace-nowrap pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "innovation"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Startup Incubation Pitches
            </button>
            <button
              onClick={() => setActiveTab("sciencefairs")}
              className={`whitespace-nowrap pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                activeTab === "sciencefairs"
                  ? "border-mcc-gold text-mcc-gold"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Science Fair Entries
            </button>
          </>
        )}
      </div>

      {/* Main Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "analytics" && analytics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 print-container"
          >
            {/* Top Row Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col justify-between min-h-36">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Placement Readiness Rate</span>
                  <span className="text-3xl font-black text-mcc-gold block mt-2">{analytics.placementReadiness?.placementReadinessRate}%</span>
                </div>
                <div className="shrink-0 w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-mcc-gold h-full rounded-full" style={{ width: `${analytics.placementReadiness?.placementReadinessRate}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col justify-between min-h-36">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Avg Profile Completion</span>
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 block mt-2">{analytics.portfolioCompletion?.averageCompletionRate}%</span>
                </div>
                <div className="shrink-0 w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-mcc-maroon h-full rounded-full" style={{ width: `${analytics.portfolioCompletion?.averageCompletionRate}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col justify-between min-h-36">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Engagement Actions</span>
                  <span className="text-3xl font-black text-teal-600 dark:text-teal-400 block mt-2">{analytics.studentEngagement?.totalEngagementActivities}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block mt-1">Aggregated across all modules</span>
                </div>
                <div className="shrink-0 w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, ((analytics.studentEngagement?.totalEngagementActivities ?? 0) / 200) * 100)}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col justify-between min-h-36">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">GitHub Integration Rate</span>
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 block mt-2">{analytics.studentEngagement?.linkedGithubRate}%</span>
                </div>
                <div className="shrink-0 w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${analytics.studentEngagement?.linkedGithubRate}%` }} />
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex justify-between items-center no-print">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Institutional Reports Bulletin</h3>
              <button
                onClick={() => window.print()}
                className="h-9 px-4 rounded-lg bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light transition-all text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Institutional Report
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left side: Portfolio Completion & Placement Readiness */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                {/* Portfolio Completion Bracket Distribution */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col gap-5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Portfolio Completion Brackets</h4>
                    <p className="text-[11px] text-slate-500">Distribution of portfolio completion percentage brackets across the student base.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "76% - 100% (Complete / Premium)", count: analytics.portfolioCompletion?.bracket76to100 },
                      { label: "51% - 75% (Intermediate / Good)", count: analytics.portfolioCompletion?.bracket51to75 },
                      { label: "26% - 50% (Developing / Basic)", count: analytics.portfolioCompletion?.bracket26to50 },
                      { label: "0% - 25% (Needs Immediate Setup)", count: analytics.portfolioCompletion?.bracket0to25 }
                    ].map((bracket, idx) => {
                      const total = analytics.totalStudents || 1;
                      const pct = Math.round(((bracket.count || 0) / total) * 100);
                      return (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500 dark:text-slate-400">{bracket.label}</span>
                            <span className="text-slate-800 dark:text-slate-200">{bracket.count} Students ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-3 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                idx === 0 ? "bg-green-500" : idx === 1 ? "bg-blue-500" : idx === 2 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Placement Readiness Details */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col gap-5">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Placement Readiness & Academic Ranks</h4>
                    <p className="text-[11px] text-slate-500">Students matching institutional placement eligibility criteria (Completion &ge; 80% &amp; CGPA &ge; 8.0).</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Avg Student CGPA</span>
                      <span className="text-xl font-bold text-mcc-gold mt-1 block">{analytics.placementReadiness?.averageCgpa.toFixed(2)} / 10.0</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Alumni Placed Records</span>
                      <span className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1 block">{analytics.placementReadiness?.alumniPlacedCount} Placed</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">CGPA Distribution</span>
                    <div className="flex flex-col gap-3 text-xs">
                      {[
                        { label: "CGPA 9.0 & Above (Top Tier)", count: analytics.placementReadiness?.cgpaBrackets.cgpaAbove9, color: "bg-green-500" },
                        { label: "CGPA 8.0 - 8.99 (Excellent)", count: analytics.placementReadiness?.cgpaBrackets.cgpa8to9, color: "bg-blue-500" },
                        { label: "CGPA 7.0 - 7.99 (Competent)", count: analytics.placementReadiness?.cgpaBrackets.cgpa7to8, color: "bg-amber-500" },
                        { label: "CGPA Below 7.0 (Developing)", count: analytics.placementReadiness?.cgpaBrackets.cgpaBelow7, color: "bg-slate-600" }
                      ].map((bracket, i) => {
                        const total = analytics.totalStudents || 1;
                        const pct = Math.round(((bracket.count || 0) / total) * 100);
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${bracket.color}`} />
                            <span className="text-slate-500 dark:text-slate-400 w-44 shrink-0 truncate">{bracket.label}</span>
                            <div className="flex-grow bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                              <div className={`h-full rounded-full ${bracket.color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-slate-800 dark:text-slate-200 font-bold w-12 text-right">{bracket.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side: Skill Analytics & Student Engagement */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                {/* Skill Analytics */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Skill Hotlist (Top Technologies)</h4>
                    <p className="text-[11px] text-slate-500">Analysis of technical stacks linked across student project registries.</p>
                  </div>
                  {analytics.skillAnalytics?.length === 0 ? (
                    <span className="text-xs text-slate-500 italic py-6 text-center">No tech stack skills registered yet.</span>
                  ) : (
                    <div className="flex flex-col gap-3.5 max-h-[340px] overflow-y-auto pr-1">
                      {analytics.skillAnalytics?.map((skill: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-xs font-medium">
                          <span className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 w-28 shrink-0 text-center truncate">
                            {skill.skill}
                          </span>
                          <div className="flex-grow bg-slate-100 dark:bg-slate-950 h-2.5 border border-slate-200 dark:border-slate-800 rounded-full overflow-hidden">
                            <div className="bg-mcc-gold h-full rounded-full" style={{ width: `${skill.percentage}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 w-16 text-right font-bold">
                            {skill.count} projs ({skill.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student Engagement details */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Ecosystem Integration & Engagement</h4>
                    <p className="text-[11px] text-slate-500">Student activity, social link rates, and visibility levels.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-1">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{analytics.studentEngagement?.publicPortfoliosCount}</span>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase">Public Showcase Profiles</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-1">
                      <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{analytics.studentEngagement?.privatePortfoliosCount}</span>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase">Private Draft Profiles</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-xs pt-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800/65">
                      <span className="text-slate-500 dark:text-slate-400">Behance Portfolio Integration</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analytics.studentEngagement?.linkedBehanceRate}% of students</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800/65">
                      <span className="text-slate-500 dark:text-slate-400">Avg Projects per Student</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analytics.studentEngagement?.averageProjectsPerStudent} projects</strong>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800/65">
                      <span className="text-slate-500 dark:text-slate-400">Avg Certifications per Student</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analytics.studentEngagement?.averageCertificationsPerStudent} certs</strong>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500 dark:text-slate-400">Average Publications per Student</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{analytics.researchActivity?.averagePublicationsPerStudent} papers</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width: Department Performance comparisons */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 backdrop-blur flex flex-col gap-6">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Department Performance Indicators</h4>
                <p className="text-[11px] text-slate-500">Cross-department metrics including academic aggregates, publication counts, and placement ready rates.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
                      <th className="pb-3 pr-2">Department</th>
                      <th className="pb-3 pr-2 text-center">Students</th>
                      <th className="pb-3 pr-2 text-center">Avg CGPA</th>
                      <th className="pb-3 pr-2 text-center">Avg Completion</th>
                      <th className="pb-3 pr-2 text-center">Ready Count</th>
                      <th className="pb-3 pr-2 text-center">Ready Rate</th>
                      <th className="pb-3 pr-2 text-center">Projects</th>
                      <th className="pb-3 pr-2 text-center">Publications</th>
                      <th className="pb-3 pr-2 text-center">Certs</th>
                      <th className="pb-3 text-right">Startup Pitches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.departmentPerformance?.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 italic">No department data available.</td>
                      </tr>
                    ) : (
                      analytics.departmentPerformance?.map((dept: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900/10">
                          <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">{dept.department}</td>
                          <td className="py-4 pr-2 text-center text-slate-500 dark:text-slate-400 font-semibold">{dept.studentCount}</td>
                          <td className="py-4 pr-2 text-center text-mcc-gold font-bold">{dept.averageCgpa.toFixed(2)}</td>
                          <td className="py-4 pr-2 text-center text-slate-700 dark:text-slate-300 font-semibold">{dept.averageCompletionRate}%</td>
                          <td className="py-4 pr-2 text-center text-green-500 dark:text-green-400 font-bold">{dept.placementReadyCount}</td>
                          <td className="py-4 pr-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dept.placementReadinessRate >= 50
                                ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                : dept.placementReadinessRate >= 20
                                ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                            }`}>
                              {dept.placementReadinessRate}%
                            </span>
                          </td>
                          <td className="py-4 pr-2 text-center text-slate-600 dark:text-slate-400">{dept.totalProjects}</td>
                          <td className="py-4 pr-2 text-center text-slate-600 dark:text-slate-400">{dept.totalPublications}</td>
                          <td className="py-4 pr-2 text-center text-slate-600 dark:text-slate-400">{dept.totalCertifications}</td>
                          <td className="py-4 text-right text-slate-600 dark:text-slate-400 font-semibold">{dept.totalStartupIdeas}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 1: Bulletins & Circulars */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Post Campus Circular Announcement</h3>
                <form onSubmit={handlePostCircular} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Bulletin Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Placement Roster Audit Deadline"
                      value={newCircularTitle}
                      onChange={(e) => setNewCircularTitle(e.target.value)}
                      className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Announcement Content</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write the detailed bulletin guidelines here..."
                      value={newCircularContent}
                      onChange={(e) => setNewCircularContent(e.target.value)}
                      className="w-full p-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 resize-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-100 font-semibold text-sm w-fit shadow"
                  >
                    Publish Bulletin
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Posted Bulletins</h3>
                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
                  {circulars.length === 0 ? (
                    <span className="text-xs text-slate-500 italic py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      No bulletins posted yet.
                    </span>
                  ) : (
                    circulars.map((circ) => (
                      <div key={circ.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">{circ.title}</h4>
                          <span className="text-[9px] text-slate-500 shrink-0 font-medium">
                            {new Date(circ.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {circ.content}
                        </p>
                        <span className="text-[9px] text-mcc-gold font-bold uppercase mt-2.5 block tracking-widest">
                          By: {circ.senderRole.replace("Coordinator", " Cell")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Students List (Placement Coordinator) */}
        {activeTab === "students" && user?.role === "PlacementCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 print-container shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Placement Audit Roster</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 no-print">Review student CGPAs, profiles readiness, and export records.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs no-print">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Dept:</span>
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-mcc-gold transition-colors"
                    >
                      {departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 dark:text-slate-400">Min CGPA:</span>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 8.0"
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="w-16 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-mcc-gold transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="h-8 px-4 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-100 font-semibold text-xs flex items-center gap-1.5 shadow"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Roster
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
                      <th className="pb-3 pr-2">Student Name</th>
                      <th className="pb-3 pr-2">Roll Number</th>
                      <th className="pb-3 pr-2">Department</th>
                      <th className="pb-3 pr-2">CGPA</th>
                      <th className="pb-3 pr-2">Completeness</th>
                      <th className="pb-3 pr-2">Status</th>
                      <th className="pb-3 text-right no-print">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 italic">No matching students found.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr key={s.id} className="border-b border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/10">
                          <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">
                            {s.firstName} {s.lastName}
                          </td>
                          <td className="py-4 pr-2 text-slate-600 dark:text-slate-400">{s.rollNumber}</td>
                          <td className="py-4 pr-2 text-slate-600 dark:text-slate-400">{s.department}</td>
                          <td className="py-4 pr-2 font-semibold text-mcc-gold">{s.cgpa.toFixed(2)}</td>
                          <td className="py-4 pr-2">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 h-2 rounded-full overflow-hidden shrink-0">
                                <div
                                  className="bg-mcc-gold h-full rounded-full"
                                  style={{ width: `${s.completionRate}%` }}
                                />
                              </div>
                              <span className="font-semibold text-[10px] text-slate-700 dark:text-slate-300">{s.completionRate}%</span>
                            </div>
                          </td>
                          <td className="py-4 pr-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              s.isAlumni
                                ? "bg-stone-100 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800"
                                : "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                            }`}>
                              {s.isAlumni ? `Alumni @ ${s.currentCompany}` : "Current Student"}
                            </span>
                          </td>
                          <td className="py-4 text-right no-print">
                            <a
                              href={`/portfolio/${s.firstName.toLowerCase()}-${s.lastName.toLowerCase()}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              Open Profile
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Manage Job Drives (Placement Coordinator) */}
        {activeTab === "drives" && user?.role === "PlacementCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Create New Job Drive Posting</h3>
                <form onSubmit={handlePostDrive} className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Job Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Associate MTS Programmer"
                        value={newDrive.title}
                        onChange={(e) => setNewDrive({ ...newDrive, title: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Company Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Freshworks Corp"
                        value={newDrive.companyName}
                        onChange={(e) => setNewDrive({ ...newDrive, companyName: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Job Details / Description</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Enter minimum stack requirements, job locations, and round details..."
                      value={newDrive.description}
                      onChange={(e) => setNewDrive({ ...newDrive, description: e.target.value })}
                      className="w-full p-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 resize-none transition-colors"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Min Eligible CGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="e.g. 7.50"
                        value={newDrive.eligibilityCgpa || ""}
                        onChange={(e) => setNewDrive({ ...newDrive, eligibilityCgpa: parseFloat(e.target.value) || 0 })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Drive Scheduled Date</label>
                      <input
                        type="datetime-local"
                        required
                        value={newDrive.driveDate}
                        onChange={(e) => setNewDrive({ ...newDrive, driveDate: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Application Link</label>
                    <input
                      type="url"
                      placeholder="e.g. https://freshworks.com/careers/MTS-apply"
                      value={newDrive.applicationLink}
                      onChange={(e) => setNewDrive({ ...newDrive, applicationLink: e.target.value })}
                      className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-slate-100 font-semibold text-sm w-fit shadow"
                  >
                    Publish Job Drive
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Active Placement Drives</h3>
                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {drives.length === 0 ? (
                    <span className="text-xs text-slate-500 italic py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                      No placement drives posted yet.
                    </span>
                  ) : (
                    drives.map((d) => (
                      <div key={d.id} className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{d.title}</h4>
                            <span className="text-[10px] text-mcc-gold font-semibold block">{d.companyName}</span>
                            <span className="text-[10px] text-blue-500 font-semibold block mt-0.5">
                              Applicants: {d.applicantCount ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleApplicants(d.id)}
                              type="button"
                              className="text-[10px] text-mcc-gold hover:underline font-bold transition-all mr-2 cursor-pointer"
                            >
                              {expandedDriveId === d.id ? "Hide Applicants" : "View Applicants"}
                            </button>
                            <button
                              onClick={() => handleDeleteDrive(d.id)}
                              type="button"
                              className="text-[10px] text-red-500 hover:text-red-400 font-medium shrink-0 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {d.description}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-900 mt-1">
                          <span>Min CGPA: <strong className="text-slate-700 dark:text-slate-300">{d.eligibilityCgpa.toFixed(2)}</strong></span>
                          <span>Date: <strong className="text-slate-700 dark:text-slate-300">{new Date(d.driveDate).toLocaleDateString()}</strong></span>
                        </div>

                        {/* Applicants expandable container */}
                        {expandedDriveId === d.id && (
                          <div className="mt-4 pt-4 border-t border-slate-250 dark:border-slate-800 flex flex-col gap-3">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Registered Applicants</h5>
                            
                            {loadingApplicants ? (
                              <div className="flex items-center justify-center py-4 gap-2">
                                <div className="w-4 h-4 border-2 border-mcc-gold border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] text-slate-500">Loading applicants...</span>
                              </div>
                            ) : applicants.length === 0 ? (
                              <span className="text-[10px] text-slate-500 italic py-2 text-center bg-slate-100 dark:bg-slate-900 rounded">
                                No student registrations for this drive yet.
                              </span>
                            ) : (
                              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                                {applicants.map((app) => {
                                  let appStatusColor = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800";
                                  if (app.status === "Shortlisted") {
                                    appStatusColor = "bg-green-100 text-green-700 border-green-205 dark:bg-green-950 dark:text-green-300 dark:border-green-900";
                                  } else if (app.status === "Selected") {
                                    appStatusColor = "bg-emerald-100 text-emerald-700 border-emerald-205 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900";
                                  } else if (app.status === "Under Review") {
                                    appStatusColor = "bg-yellow-100 text-yellow-700 border-yellow-205 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900";
                                  } else if (app.status === "Rejected") {
                                    appStatusColor = "bg-red-105 text-red-750 border-red-205 dark:bg-red-950 dark:text-red-300 dark:border-red-900";
                                  } else if (app.status === "Applied") {
                                    appStatusColor = "bg-blue-100 text-blue-700 border-blue-205 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900";
                                  }

                                  return (
                                    <div key={app.applicationId} className="p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col gap-3 shadow-inner">
                                      <div className="flex justify-between items-start gap-2">
                                        <div>
                                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                                            {app.student.firstName} {app.student.lastName}
                                          </span>
                                          <span className="text-[9px] text-slate-500 block">
                                            Roll: {app.student.rollNumber} &bull; {app.student.department}
                                          </span>
                                        </div>
                                        {app.student.slug && (
                                          <a
                                            href={`/portfolio/${app.student.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 rounded border border-slate-250 dark:border-slate-800 text-[9px] text-mcc-gold font-bold transition-all"
                                          >
                                            View Portfolio
                                          </a>
                                        )}
                                      </div>

                                      {/* Student Academic Metrics */}
                                      <div className="grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded border border-slate-150 dark:border-slate-900">
                                        <div>
                                          <span className="text-[8px] text-slate-550 uppercase block font-semibold">Student CGPA</span>
                                          <span className="text-[11px] font-bold text-mcc-gold">{(app.student.cgpa || 0).toFixed(2)}</span>
                                        </div>
                                        <div>
                                          <span className="text-[8px] text-slate-550 uppercase block font-semibold font-mono">Profile Completeness</span>
                                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350">{app.student.completenessRate}%</span>
                                        </div>
                                      </div>

                                      {/* Current application status info */}
                                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                                        <span className="text-slate-500 font-semibold">Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${appStatusColor}`}>
                                          {app.status}
                                        </span>
                                        {app.remarks && (
                                          <span className="text-slate-500 italic block flex-1 truncate">
                                            Remarks: "{app.remarks}"
                                          </span>
                                        )}
                                      </div>

                                      {/* Coordinator Review Action Box */}
                                      <div className="flex flex-col gap-2.5 mt-1 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800/80">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Submit Officer Review</span>
                                        
                                        <div className="grid sm:grid-cols-3 gap-2">
                                          <select
                                            value={reviewStatus[app.applicationId] || "Applied"}
                                            onChange={(e) => setReviewStatus({ ...reviewStatus, [app.applicationId]: e.target.value })}
                                            className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-[10px] text-slate-800 dark:text-slate-300 focus:outline-none focus:border-mcc-gold"
                                          >
                                            <option value="Applied">Applied</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Selected">Selected</option>
                                            <option value="Rejected">Rejected</option>
                                          </select>

                                          <input
                                            type="text"
                                            placeholder="Feedback remarks..."
                                            value={reviewRemarks[app.applicationId] || ""}
                                            onChange={(e) => setReviewRemarks({ ...reviewRemarks, [app.applicationId]: e.target.value })}
                                            className="sm:col-span-2 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                                          />
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleSubmitReview(app.applicationId)}
                                          className="px-3 py-1 bg-mcc-maroon hover:bg-mcc-maroon-light border border-mcc-gold/20 text-[10px] font-bold text-slate-200 rounded self-end shadow transition-all cursor-pointer"
                                        >
                                          Submit Review
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Publications Audit (Research Coordinator) */}
        {activeTab === "research" && user?.role === "ResearchCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Scholarly Publications Audit</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track and inspect all research outputs submitted by student authors.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Department:</span>
                  <select
                    value={pubFilterDept}
                    onChange={(e) => setPubFilterDept(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-mcc-gold transition-colors"
                  >
                    {pubDepartments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {filteredPublications.length === 0 ? (
                  <div className="p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 italic">No student publications match selection.</span>
                  </div>
                ) : (
                  filteredPublications.map((pub) => (
                    <div key={pub.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{pub.title}</h4>
                          <span className="text-[10px] text-mcc-gold font-medium block mt-1">
                            {pub.journalOrConference} &bull; Year {new Date(pub.publishDate).getFullYear()}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-300 block">
                            {pub.student.firstName} {pub.student.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {pub.student.rollNumber} &bull; {pub.student.department}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-100 dark:bg-black/15 p-3 rounded border border-slate-200 dark:border-slate-900">
                        <strong>Abstract:</strong> {pub.abstract}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span>Authors: {pub.authors}</span>
                        {pub.paperUrl && (
                          <a href={pub.paperUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-650 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors">
                            Open Paper Document &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: Startup Idea Pitches (Innovation Coordinator) */}
        {activeTab === "innovation" && user?.role === "InnovationCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Entrepreneurial & Incubation Pitches</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit startup prototypes and change incubation registration status.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {ideas.length === 0 ? (
                  <div className="md:col-span-2 p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 italic">No startup prototype ideas submitted yet.</span>
                  </div>
                ) : (
                  ideas.map((idea) => (
                    <div key={idea.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{idea.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            idea.status === "IncubationApproved"
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : idea.status === "Review"
                              ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                          }`}>
                            {idea.status === "IncubationApproved" ? "Incubation Approved" : idea.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mb-3">
                          Submitted by {idea.student.firstName} {idea.student.lastName} ({idea.student.rollNumber}) &bull; {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                          {idea.description}
                        </p>
                        <div className="text-[10px] text-slate-500 leading-relaxed">
                          <strong>Team Members:</strong> {idea.teamMembers} <br />
                          <strong>Prototype Stage:</strong> <span className="text-mcc-gold font-semibold">{idea.stage}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-900 pt-4 mt-2 justify-end">
                        <span className="text-[10px] text-slate-500 mr-2">Change Status:</span>
                        <button
                          onClick={() => handleUpdateIdeaStatus(idea.id, "Review")}
                          disabled={idea.status === "Review"}
                          className="px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800/20 text-[10px] font-bold text-amber-700 dark:text-amber-300 disabled:opacity-40 transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleUpdateIdeaStatus(idea.id, "IncubationApproved")}
                          disabled={idea.status === "IncubationApproved"}
                          className="px-2.5 py-1 rounded bg-green-100 dark:bg-green-950/40 hover:bg-green-200 dark:hover:bg-green-900 border border-green-200 dark:border-green-800/20 text-[10px] font-bold text-green-700 dark:text-green-300 disabled:opacity-40 transition-colors"
                        >
                          Approve Incubation
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Conference Presentations (Research Coordinator) */}
        {activeTab === "conferences" && user?.role === "ResearchCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Conference Presentations Verification</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approve or reject submitted student conference presentation logs.</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Department:</span>
                  <select
                    value={confFilterDept}
                    onChange={(e) => setConfFilterDept(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-mcc-gold transition-colors"
                  >
                    {confDepartments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {filteredConferences.length === 0 ? (
                  <div className="p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 italic">No conference presentations match selection.</span>
                  </div>
                ) : (
                  filteredConferences.map((conf) => (
                    <div key={conf.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{conf.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            conf.isVerified
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : conf.verifiedBy
                                ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}>
                            {conf.isVerified ? "Verified" : conf.verifiedBy ? "Rejected" : "Pending Verification"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-550 block mb-3">
                          Submitted by {conf.student?.firstName} {conf.student?.lastName} ({conf.student?.rollNumber}) &bull; {conf.student?.department}
                        </span>
                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 font-medium">
                          <div>Conference: <strong className="text-slate-800 dark:text-slate-200">{conf.conferenceName}</strong></div>
                          <div>Role: <strong className="text-slate-800 dark:text-slate-200">{conf.role}</strong></div>
                          <div>Location: <strong className="text-slate-800 dark:text-slate-200">{conf.location}</strong></div>
                          <div>Date: <strong className="text-slate-800 dark:text-slate-200">{new Date(conf.presentationDate).toLocaleDateString()}</strong></div>
                        </div>
                        <div className="text-[10px] text-slate-550 flex flex-wrap gap-4 items-center mt-2 border-t border-slate-100 dark:border-slate-905 pt-2">
                          {conf.abstractUrl && (
                            <a href={conf.abstractUrl} target="_blank" rel="noreferrer" className="text-mcc-gold font-bold hover:underline">
                              View Abstract &rarr;
                            </a>
                          )}
                          {conf.certificateUrl && (
                            <a href={conf.certificateUrl} target="_blank" rel="noreferrer" className="text-mcc-gold font-bold hover:underline">
                              View Certificate &rarr;
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-slate-200 dark:border-slate-900 pt-4 mt-2 justify-end">
                        <input
                          type="text"
                          placeholder="Verification remarks..."
                          value={verifyRemarks[conf.id] || ""}
                          onChange={(e) => setVerifyRemarks({ ...verifyRemarks, [conf.id]: e.target.value })}
                          className="w-full sm:w-80 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                        />
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleVerifyConference(conf.id, false)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-800/20 text-[10px] font-bold text-red-700 dark:text-red-400 rounded transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerifyConference(conf.id, true)}
                            className="px-3 py-1 bg-green-100 dark:bg-green-950/40 hover:bg-green-200 dark:hover:bg-green-900 border border-green-200 dark:border-green-800/20 text-[10px] font-bold text-green-700 dark:text-green-300 rounded transition-colors"
                          >
                            Verify & Approve
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

        {/* Tab: Science Fair Entries (Innovation Coordinator) */}
        {activeTab === "sciencefairs" && user?.role === "InnovationCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Science Fair Participation Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approve or reject student science fair and innovation exhibit participation.</p>
              </div>

              <div className="flex flex-col gap-4">
                {scienceFairs.length === 0 ? (
                  <div className="p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 italic">No science fair entries submitted for verification.</span>
                  </div>
                ) : (
                  scienceFairs.map((fair) => (
                    <div key={fair.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{fair.projectTitle}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            fair.isVerified
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : fair.verifiedBy
                                ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}>
                            {fair.isVerified ? "Verified" : fair.verifiedBy ? "Rejected" : "Pending Verification"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mb-3">
                          Submitted by {fair.student?.firstName} {fair.student?.lastName} ({fair.student?.rollNumber}) &bull; {fair.student?.department}
                        </span>
                        <div className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed mb-3 font-medium">
                          <div>Science Fair: <strong className="text-slate-800 dark:text-slate-200">{fair.fairName}</strong></div>
                          <div>Level: <strong className="text-slate-800 dark:text-slate-200">{fair.level}</strong></div>
                          <div>Award Received: <strong className="text-amber-500 font-semibold">{fair.awardReceived || "None/Participant"}</strong></div>
                          <div>Date: <strong className="text-slate-800 dark:text-slate-200">{new Date(fair.fairDate).toLocaleDateString()}</strong></div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 bg-slate-105 dark:bg-black/15 p-3 rounded border border-slate-200 dark:border-slate-900">
                          <strong>Description:</strong> {fair.description}
                        </p>
                        {fair.certificateUrl && (
                          <div className="text-[10px] text-slate-550">
                            <a href={fair.certificateUrl} target="_blank" rel="noreferrer" className="text-mcc-gold font-bold hover:underline">
                              View Certificate &rarr;
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-slate-200 dark:border-slate-900 pt-4 mt-2 justify-end">
                        <input
                          type="text"
                          placeholder="Verification remarks..."
                          value={verifyRemarks[fair.id] || ""}
                          onChange={(e) => setVerifyRemarks({ ...verifyRemarks, [fair.id]: e.target.value })}
                          className="w-full sm:w-80 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                        />
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleVerifyScienceFair(fair.id, false)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-800/20 text-[10px] font-bold text-red-700 dark:text-red-400 rounded transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerifyScienceFair(fair.id, true)}
                            className="px-3 py-1 bg-green-100 dark:bg-green-950/40 hover:bg-green-200 dark:hover:bg-green-900 border border-green-200 dark:border-green-800/20 text-[10px] font-bold text-green-700 dark:text-green-300 rounded transition-colors"
                          >
                            Verify & Approve
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

        {/* Tab: Student Affairs Achievements Verification */}
        {activeTab === "studentaffairs-achievements" && user?.role === "StudentAffairsCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Achievements Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approve or reject submitted student awards and hackathon credentials.</p>
              </div>
              <div className="flex flex-col gap-4">
                {achievements.length === 0 ? (
                  <div className="p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">No achievements submitted for verification.</span>
                  </div>
                ) : (
                  achievements.map((ach) => (
                    <div key={ach.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{ach.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ach.isVerified
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : ach.verifiedBy
                                ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}>
                            {ach.isVerified ? "Verified" : ach.verifiedBy ? "Rejected" : "Pending Verification"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mb-3">
                          Submitted by {ach.student.firstName} {ach.student.lastName} ({ach.student.rollNumber}) &bull; {ach.student.department}
                        </span>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
                          {ach.description}
                        </p>
                        <div className="text-[10px] text-slate-550 flex flex-wrap gap-4 items-center">
                          <span>Category: <strong className="text-slate-700 dark:text-slate-350">{ach.category}</strong></span>
                          <span>Earned: <strong className="text-slate-700 dark:text-slate-350">{new Date(ach.dateEarned).toLocaleDateString()}</strong></span>
                          {ach.certificateUrl && (
                            <a href={ach.certificateUrl} target="_blank" rel="noreferrer" className="text-mcc-gold font-bold hover:underline">
                              View Attached Document &rarr;
                            </a>
                          )}
                        </div>
                        {ach.verificationRemarks && (
                          <div className="text-[10px] text-slate-500 mt-3 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                            <strong>Previous Remarks:</strong> "{ach.verificationRemarks}" (by {ach.verifiedBy})
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-slate-200 dark:border-slate-900 pt-4 mt-2 justify-end">
                        <input
                          type="text"
                          placeholder="Verification feedback remarks..."
                          value={verifyRemarks[ach.id] || ""}
                          onChange={(e) => setVerifyRemarks({ ...verifyRemarks, [ach.id]: e.target.value })}
                          className="w-full sm:w-80 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                        />
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleVerifyAchievement(ach.id, false)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-800/20 text-[10px] font-bold text-red-700 dark:text-red-400 rounded transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerifyAchievement(ach.id, true)}
                            className="px-3 py-1 bg-green-100 dark:bg-green-950/40 hover:bg-green-200 dark:hover:bg-green-900 border border-green-200 dark:border-green-800/20 text-[10px] font-bold text-green-700 dark:text-green-300 rounded transition-colors"
                          >
                            Verify & Approve
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

        {/* Tab: Student Affairs Community Service Verification */}
        {activeTab === "studentaffairs-community" && user?.role === "StudentAffairsCoordinator" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Community Service Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Approve or reject submitted student NGO outreach and volunteer work.</p>
              </div>
              <div className="flex flex-col gap-4">
                {communityServices.length === 0 ? (
                  <div className="p-12 border border-slate-200 dark:border-slate-800 border-dashed text-center rounded-xl">
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">No community service records submitted for verification.</span>
                  </div>
                ) : (
                  communityServices.map((service) => (
                    <div key={service.id} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between gap-4 shadow-sm">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{service.organization}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            service.isVerified
                              ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                              : service.verifiedBy
                                ? "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                                : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}>
                            {service.isVerified ? "Verified" : service.verifiedBy ? "Rejected" : "Pending Verification"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mb-3">
                          Submitted by {service.student.firstName} {service.student.lastName} ({service.student.rollNumber}) &bull; {service.student.department}
                        </span>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
                          {service.description}
                        </p>
                        <div className="text-[10px] text-slate-550 flex flex-wrap gap-4 items-center">
                          <span>Role: <strong className="text-slate-700 dark:text-slate-350">{service.role}</strong></span>
                          <span>Start Date: <strong className="text-slate-700 dark:text-slate-350">{new Date(service.startDate).toLocaleDateString()}</strong></span>
                          <span>End Date: <strong className="text-slate-700 dark:text-slate-350">{service.endDate ? new Date(service.endDate).toLocaleDateString() : "Present"}</strong></span>
                        </div>
                        {service.verificationRemarks && (
                          <div className="text-[10px] text-slate-500 mt-3 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                            <strong>Previous Remarks:</strong> "{service.verificationRemarks}" (by {service.verifiedBy})
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-slate-200 dark:border-slate-900 pt-4 mt-2 justify-end">
                        <input
                          type="text"
                          placeholder="Verification feedback remarks..."
                          value={verifyRemarks[service.id] || ""}
                          onChange={(e) => setVerifyRemarks({ ...verifyRemarks, [service.id]: e.target.value })}
                          className="w-full sm:w-80 px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-mcc-gold"
                        />
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleVerifyCommunityService(service.id, false)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900 border border-red-200 dark:border-red-800/20 text-[10px] font-bold text-red-700 dark:text-red-400 rounded transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerifyCommunityService(service.id, true)}
                            className="px-3 py-1 bg-green-100 dark:bg-green-950/40 hover:bg-green-200 dark:hover:bg-green-900 border border-green-200 dark:border-green-800/20 text-[10px] font-bold text-green-700 dark:text-green-300 rounded transition-colors"
                          >
                            Verify & Approve
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

        {/* Tab: Alumni Tracking Directory */}
        {activeTab === "alumni" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-sm flex flex-col gap-6 print-container">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Alumni Tracking Directory</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 no-print">Trace where our graduated students are employed and track campus alumni networks.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs no-print">
                  <div className="relative w-full sm:w-64 flex items-center">
                    <input
                      type="text"
                      placeholder="Search name, company, or role..."
                      value={alumniSearch}
                      onChange={(e) => setAlumniSearch(e.target.value)}
                      className="w-full h-8 px-3 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-350 focus:outline-none focus:border-mcc-gold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-650 dark:text-slate-450 font-medium">Dept:</span>
                    <select
                      value={alumniDept}
                      onChange={(e) => setAlumniDept(e.target.value)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-mcc-gold"
                    >
                      {departments.map((dept, idx) => (
                        <option key={idx} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Alumni Summary Stats cards */}
              {analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 no-print">
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Alumni Logged</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1 block">
                      {students.filter(s => s.isAlumni).length} Graduates
                    </span>
                  </div>
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Employment Registry</span>
                    <span className="text-2xl font-black text-mcc-gold mt-1 block">
                      {analytics.placementReadiness?.alumniPlacedCount} Employed
                    </span>
                  </div>
                  <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ecosystem Employment Rate</span>
                    <span className="text-2xl font-black text-green-500 mt-1 block">
                      {students.filter(s => s.isAlumni).length > 0
                        ? Math.round((analytics.placementReadiness?.alumniPlacedCount / students.filter(s => s.isAlumni).length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              )}

              {/* Alumni Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
                      <th className="pb-3 pr-2">Alumnus Name</th>
                      <th className="pb-3 pr-2">Roll Number</th>
                      <th className="pb-3 pr-2">Department</th>
                      <th className="pb-3 pr-2">Employed Role</th>
                      <th className="pb-3 pr-2">Company Employer</th>
                      <th className="pb-3 pr-2 text-center">CGPA</th>
                      <th className="pb-3 text-right no-print">Showcase Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(s => s.isAlumni).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 italic">No alumni records found in registry.</td>
                      </tr>
                    ) : (
                      students
                        .filter(s => s.isAlumni)
                        .filter(s => alumniDept === "All" || s.department === alumniDept)
                        .filter(s => {
                          if (!alumniSearch) return true;
                          const term = alumniSearch.toLowerCase();
                          return (s.currentCompany?.toLowerCase().includes(term) ||
                                  s.currentRole?.toLowerCase().includes(term) ||
                                  `${s.firstName} ${s.lastName}`.toLowerCase().includes(term));
                        })
                        .map((s) => (
                          <tr key={s.id} className="border-b border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/10">
                            <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">
                              {s.firstName} {s.lastName}
                            </td>
                            <td className="py-4 pr-2 text-slate-500">{s.rollNumber}</td>
                            <td className="py-4 pr-2 text-slate-500">{s.department}</td>
                            <td className="py-4 pr-2 font-semibold text-slate-700 dark:text-slate-300">
                              {s.currentRole || <span className="opacity-50 font-normal italic">Not Disclosed</span>}
                            </td>
                            <td className="py-4 pr-2">
                              <span className="px-2 py-1 rounded text-[10px] font-bold bg-mcc-gold/10 text-mcc-gold border border-mcc-gold/20">
                                {s.currentCompany || "Freelance / Independent"}
                              </span>
                            </td>
                            <td className="py-4 pr-2 text-center text-slate-550 font-bold">{s.cgpa.toFixed(2)}</td>
                            <td className="py-4 text-right no-print">
                              <a
                                href={`/portfolio/${s.firstName.toLowerCase()}-${s.lastName.toLowerCase()}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
                              >
                                View Canvas
                              </a>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
