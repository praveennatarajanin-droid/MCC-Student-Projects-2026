"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("portfolios");
  const [analytics, setAnalytics] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    institutionName: "Madras Christian College",
    establishedYear: "1837",
    academicYear: "2025/2026",
    vision: "",
    mission: "",
    primaryColor: "#722F37",
    secondaryColor: "#D4AF37",
    defaultTheme: "academic",
    enabledThemes: ["academic", "corporate", "futuristic", "startup", "creative"]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search/Filters
  const [filterDept, setFilterDept] = useState("All");
  const [studentSearch, setStudentSearch] = useState("");

  // Modals / Selection states
  const [coordModalOpen, setCoordModalOpen] = useState(false);
  const [coordEmail, setCoordEmail] = useState("");
  const [coordPassword, setCoordPassword] = useState("");
  const [coordRole, setCoordRole] = useState("PlacementCoordinator");

  // Student CRUD states
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [editStudentModalOpen, setEditStudentModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [studentForm, setStudentForm] = useState({
    email: "",
    password: "password123",
    rollNumber: "",
    firstName: "",
    lastName: "",
    department: "Computer Applications (MCA)",
    batchYear: "2024-2026",
    cgpa: 8.5,
    isAlumni: false,
    currentCompany: "",
    currentRole: "",
    bio: "Student at Madras Christian College."
  });

  // Portfolio Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [reviewRemarks, setReviewRemarks] = useState("");

  // Broadcast Notification state
  const [notifForm, setNotifForm] = useState({
    targetType: "all", // all, department, student
    departmentName: "Computer Applications (MCA)",
    studentEmail: "",
    title: "",
    message: "",
    type: "System",
    link: "/dashboard/student"
  });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [stats, list, userList, globalConf] = await Promise.all([
        api.get<any>("/admin/analytics", token),
        api.get<any[]>("/admin/portfolios", token),
        api.get<any[]>("/admin/users", token).catch(() => []),
        api.get<any>("/admin/config", token).catch(() => null)
      ]);
      setAnalytics(stats);
      setPortfolios(list);
      setUsers(userList);
      if (globalConf) {
        setConfig(globalConf);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load administrative details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  const showNotification = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4500);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. INSTITUTION PROFILE MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/admin/config", config, token);
      showNotification("Institution profile and branding saved successfully.", "success");
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update config.", "error");
    }
  };

  const handleThemeToggle = (themeName: string) => {
    let list = [...config.enabledThemes];
    if (list.includes(themeName)) {
      if (list.length === 1) {
        showNotification("At least one theme must be enabled.", "error");
        return;
      }
      list = list.filter((t) => t !== themeName);
    } else {
      list.push(themeName);
    }
    setConfig({ ...config, enabledThemes: list });
  };

  // ─────────────────────────────────────────────────────────────
  // 2. PORTFOLIO APPROVALS WITH REMARKS
  // ─────────────────────────────────────────────────────────────
  const openReviewModal = (port: any) => {
    setSelectedPortfolio(port);
    setReviewRemarks(port.reviewRemarks || "");
    setReviewModalOpen(true);
  };

  const handleApproveStatus = async (isApproved: boolean) => {
    if (!selectedPortfolio) return;
    try {
      await api.put(`/admin/portfolios/${selectedPortfolio.portfolioId}/approve`, {
        isApproved,
        reviewRemarks
      }, token);
      showNotification(
        `Portfolio canvas ${isApproved ? "approved and live" : "returned for revision"}.`,
        "success"
      );
      setReviewModalOpen(false);
      setSelectedPortfolio(null);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to submit review decisions.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. STUDENT CRUD MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  const openAddStudent = () => {
    setStudentForm({
      email: "",
      password: "password123",
      rollNumber: "",
      firstName: "",
      lastName: "",
      department: "Computer Applications (MCA)",
      batchYear: "2024-2026",
      cgpa: 8.5,
      isAlumni: false,
      currentCompany: "",
      currentRole: "",
      bio: "Student at Madras Christian College."
    });
    setAddStudentModalOpen(true);
  };

  const openEditStudent = (student: any) => {
    setSelectedStudent(student);
    setStudentForm({
      email: student.user?.email || "",
      password: "", // Not modifying password on edit
      rollNumber: student.rollNumber || "",
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      department: student.department || "Computer Applications (MCA)",
      batchYear: student.batchYear || "2024-2026",
      cgpa: student.cgpa || 0.0,
      isAlumni: student.isAlumni || false,
      currentCompany: student.currentCompany || "",
      currentRole: student.currentRole || "",
      bio: student.bio || ""
    });
    setEditStudentModalOpen(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/students", studentForm, token);
      showNotification("Student account and portfolio created successfully.", "success");
      setAddStudentModalOpen(false);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to create student.", "error");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.put(`/admin/students/${selectedStudent.id}`, {
        rollNumber: studentForm.rollNumber,
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        department: studentForm.department,
        batchYear: studentForm.batchYear,
        cgpa: parseFloat(studentForm.cgpa as any),
        isAlumni: studentForm.isAlumni,
        currentCompany: studentForm.currentCompany,
        currentRole: studentForm.currentRole,
        bio: studentForm.bio
      }, token);
      showNotification("Student profile updated successfully.", "success");
      setEditStudentModalOpen(false);
      setSelectedStudent(null);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update student details.", "error");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this student profile and all associated portfolio data?")) return;
    try {
      await api.delete(`/admin/students/${studentId}`, token);
      showNotification("Student account deleted successfully.", "success");
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete student.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. COORDINATORS & ROLE ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole }, token);
      showNotification(`User role updated to ${newRole} successfully.`, "success");
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update user role.", "error");
    }
  };

  const handleCreateCoordinator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/admin/coordinators`, {
        email: coordEmail,
        password: coordPassword,
        role: coordRole
      }, token);
      showNotification("Coordinator account created successfully.", "success");
      setCoordEmail("");
      setCoordPassword("");
      setCoordRole("PlacementCoordinator");
      setCoordModalOpen(false);
      loadAdminData();
    } catch (err: any) {
      showNotification(err.message || "Failed to create coordinator.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 5. NOTIFICATION BROADCASTS
  // ─────────────────────────────────────────────────────────────
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/notifications", notifForm, token);
      showNotification("Broadcast alert dispatched successfully.", "success");
      setNotifForm({
        ...notifForm,
        title: "",
        message: "",
        studentEmail: ""
      });
    } catch (err: any) {
      showNotification(err.message || "Failed to dispatch broadcast alert.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 6. CSV DATA EXPORTS (REPORTS)
  // ─────────────────────────────────────────────────────────────
  const downloadStudentsCSV = () => {
    if (!portfolios.length) return;
    const headers = ["ID", "Name", "RollNumber", "Department", "Bio", "IsAlumni", "Approved"];
    const rows = portfolios.map((p) => [
      p.student.id,
      `"${p.student.firstName} ${p.student.lastName}"`,
      p.student.rollNumber,
      `"${p.student.department}"`,
      `"${(p.student.bio || "").replace(/"/g, '""')}"`,
      p.student.isAlumni ? "Yes" : "No",
      p.isApproved ? "Approved" : "Pending"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MCC_Student_Registry_${config.academicYear.replace("/", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDepartmentCSV = () => {
    if (!analytics || !analytics.departmentPerformance) return;
    const headers = ["Department", "StudentCount", "AverageCgpa", "AverageCompletion", "PlacementReadyCount", "PlacementReadinessRate", "TotalProjects", "TotalPublications", "TotalCertifications", "StartupPitches"];
    const rows = analytics.departmentPerformance.map((dept: any) => [
      `"${dept.department}"`,
      dept.studentCount,
      dept.averageCgpa,
      dept.averageCompletionRate,
      dept.placementReadyCount,
      dept.placementReadinessRate,
      dept.totalProjects,
      dept.totalPublications,
      dept.totalCertifications,
      dept.totalStartupIdeas
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MCC_Department_Analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <div className="w-10 h-10 border-4 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin" />
        <p className="text-sm">Calculating institutional aggregates...</p>
      </div>
    );
  }

  const departments = [
    "All",
    "Computer Applications (MCA)",
    "Computer Science (MSc)",
    "Business Administration (MBA)",
    "Research Cell",
    "Student Affairs"
  ];

  const uniqueDepartmentsInDB = ["All", ...Array.from(new Set(portfolios.map((p) => p.student.department)))];

  const filteredPortfolios = portfolios.filter((p) => {
    const matchesDept = filterDept === "All" || p.student.department === filterDept;
    const matchesSearch = studentSearch === "" || 
      `${p.student.firstName} ${p.student.lastName} ${p.student.rollNumber}`
        .toLowerCase()
        .includes(studentSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 w-full p-6 md:p-10 max-w-7xl mx-auto bg-transparent text-slate-900 dark:text-slate-100">
      {/* Toast Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg border border-green-800 bg-green-950/90 backdrop-blur text-sm text-green-300 shadow-xl"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-lg border border-red-800 bg-red-950/90 backdrop-blur text-sm text-red-300 shadow-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
          <span className="text-xs text-mcc-gold font-bold tracking-widest uppercase">
            Institutional Administration
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            Super Admin Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {config.institutionName} &bull; Academic Year {config.academicYear}
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-red-650 dark:hover:border-red-950 text-xs font-semibold text-slate-650 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Analytics Summary Panels */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Students</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">
              {analytics.totalStudents}
            </span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Project Uploads</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">
              {analytics.totalProjects}
            </span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Research Papers</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">
              {analytics.totalPublications}
            </span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Certifications</span>
            <span className="text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1">
              {analytics.totalCertifications}
            </span>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 col-span-2 lg:col-span-1 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Profile Completion</span>
            <span className="text-2xl font-black text-mcc-gold block mt-1">
              {analytics.averageCompletionRate}%
            </span>
          </div>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        {[
          { id: "portfolios", label: "Portfolio Approvals" },
          { id: "students", label: "Student Management" },
          { id: "analytics", label: "Department Analytics" },
          { id: "institution", label: "Institution Management" },
          { id: "themes", label: "Theme Management" },
          { id: "users", label: "Role & Accounts" },
          { id: "reports", label: "Reports & Exports" },
          { id: "notifications", label: "Broadcasts" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap pb-3 px-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id
                ? "border-mcc-gold text-mcc-gold"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PORTFOLIO APPROVALS */}
      {activeTab === "portfolios" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Portfolios approvals</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Audit and approve student profiles. Approve or request changes with custom feedback.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 w-44"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Dept:</span>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300"
                  >
                    {uniqueDepartmentsInDB.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                    <th className="pb-3 pr-2">Student Name</th>
                    <th className="pb-3 pr-2">Roll & Department</th>
                    <th className="pb-3 pr-2">Custom Canvas Link</th>
                    <th className="pb-3 pr-2">Audited By</th>
                    <th className="pb-3 pr-2">State</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPortfolios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic">No portfolios found.</td>
                    </tr>
                  ) : (
                    filteredPortfolios.map((port) => (
                      <tr key={port.portfolioId} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                        <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">
                          {port.student.firstName} {port.student.lastName}
                        </td>
                        <td className="py-4 pr-2 text-slate-600 dark:text-slate-400">
                          <span className="block">{port.student.rollNumber}</span>
                          <span className="block text-[10px] text-slate-500">{port.student.department}</span>
                        </td>
                        <td className="py-4 pr-2">
                          <a
                            href={`/portfolio/${port.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-mcc-gold hover:underline font-semibold"
                          >
                            /{port.slug}
                          </a>
                        </td>
                        <td className="py-4 pr-2 text-slate-550 dark:text-slate-450 italic">
                          {port.reviewedBy ? `${port.reviewedBy}` : "Pending Initial Review"}
                        </td>
                        <td className="py-4 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            port.isApproved
                              ? "bg-green-950 text-green-300 border border-green-800"
                              : "bg-amber-950/80 text-amber-300 border border-amber-800"
                          }`}>
                            {port.isApproved ? "Approved" : "Pending Approval"}
                          </span>
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2 items-center">
                          <button
                            onClick={() => openReviewModal(port)}
                            className="px-3 py-1 bg-mcc-maroon border border-mcc-gold/35 text-white hover:bg-mcc-maroon-light rounded text-[10px] font-bold"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STUDENT CRUD MANAGEMENT */}
      {activeTab === "students" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Profile registry</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage MCC student details, adjust academic scores, batch years, and track alumni status.
                </p>
              </div>
              <button
                onClick={openAddStudent}
                className="px-4 py-2 bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-xs font-semibold text-slate-100 rounded-lg transition-all shadow"
              >
                + Add Student Record
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                    <th className="pb-3 pr-2">Student Details</th>
                    <th className="pb-3 pr-2">Roll & Batch</th>
                    <th className="pb-3 pr-2">Department</th>
                    <th className="pb-3 pr-2">CGPA</th>
                    <th className="pb-3 pr-2">Alumni Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 italic">No students registered yet.</td>
                    </tr>
                  ) : (
                    portfolios.map((port) => (
                      <tr key={port.student.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                        <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">
                          <span className="block">{port.student.firstName} {port.student.lastName}</span>
                          <span className="block text-[10px] text-slate-500 font-normal">UID: {port.student.id.substring(0,8)}...</span>
                        </td>
                        <td className="py-4 pr-2 text-slate-600 dark:text-slate-400">
                          <span className="block font-semibold">{port.student.rollNumber}</span>
                          <span className="block text-[10px]">{port.student.batchYear}</span>
                        </td>
                        <td className="py-4 pr-2 text-slate-500">{port.student.department}</td>
                        <td className="py-4 pr-2 font-bold text-mcc-gold">{port.student.cgpa || "0.00"}</td>
                        <td className="py-4 pr-2">
                          {port.student.isAlumni ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-900">
                              Alumni
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-800">
                              Current Student
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2 items-center">
                          <button
                            onClick={() => openEditStudent(port.student)}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 rounded text-[10px] font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(port.student.id)}
                            className="px-3 py-1 bg-red-950/30 text-red-400 hover:bg-red-950/80 hover:text-red-200 rounded text-[10px] font-bold border border-red-900/20"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INSTITUTIONAL ANALYTICS */}
      {activeTab === "analytics" && analytics && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Department Performance Audits</h3>
                  <p className="text-xs text-slate-500">Comparative indices across all participating academic departments.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-widest font-bold">
                        <th className="pb-3 pr-2">Department</th>
                        <th className="pb-3 pr-2 text-center">Students</th>
                        <th className="pb-3 pr-2 text-center">Avg CGPA</th>
                        <th className="pb-3 pr-2 text-center">Completion Rate</th>
                        <th className="pb-3 pr-2 text-center">Placement Ready</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.departmentPerformance?.map((dept: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                          <td className="py-4 pr-2 font-bold text-slate-850 dark:text-slate-150">{dept.department}</td>
                          <td className="py-4 pr-2 text-center font-bold text-slate-650">{dept.studentCount}</td>
                          <td className="py-4 pr-2 text-center text-mcc-gold font-bold">{dept.averageCgpa}</td>
                          <td className="py-4 pr-2 text-center font-semibold">{dept.averageCompletionRate}%</td>
                          <td className="py-4 pr-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-950 text-green-300 border border-green-800">
                              {dept.placementReadyCount} students
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Skill hotlist</h3>
                <div className="flex flex-col gap-3">
                  {analytics.skillAnalytics?.slice(0, 8).map((skill: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{skill.skill}</span>
                        <span className="text-slate-500 font-bold">{skill.count} projects</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-mcc-gold h-full rounded-full" style={{ width: `${skill.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INSTITUTION PROFILE MANAGEMENT */}
      {activeTab === "institution" && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Institution Identity Settings</h3>
            <p className="text-xs text-slate-500 mt-1">Configure profile data and layout colors for Madras Christian College.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Institution Name</label>
              <input
                type="text"
                required
                value={config.institutionName}
                onChange={(e) => setConfig({ ...config, institutionName: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Established Year</label>
              <input
                type="text"
                required
                value={config.establishedYear}
                onChange={(e) => setConfig({ ...config, establishedYear: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Active Academic Year</label>
              <input
                type="text"
                required
                value={config.academicYear}
                onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Vision Statement</label>
              <textarea
                value={config.vision}
                onChange={(e) => setConfig({ ...config, vision: e.target.value })}
                className="w-full p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 h-20"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Mission Statement</label>
              <textarea
                value={config.mission}
                onChange={(e) => setConfig({ ...config, mission: e.target.value })}
                className="w-full p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 h-20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Primary Branding Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-10 h-10 p-0.5 bg-white border border-slate-200 rounded cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-500">{config.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Secondary Accent Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                  className="w-10 h-10 p-0.5 bg-white border border-slate-200 rounded cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-500">{config.secondaryColor}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 font-semibold text-xs transition-all shadow"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: THEME CONFIGURATION MANAGEMENT */}
      {activeTab === "themes" && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 max-w-xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Global Theme & Template controls</h3>
            <p className="text-xs text-slate-500 mt-1">Enable/disable templates globally and configure default layout settings for new profiles.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-3">Enabled Themes</label>
            <div className="flex flex-col gap-3">
              {["academic", "corporate", "futuristic", "startup", "creative"].map((themeName) => {
                const isEnabled = config.enabledThemes.includes(themeName);
                return (
                  <label key={themeName} className="flex items-center gap-3 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleThemeToggle(themeName)}
                      className="w-4 h-4 rounded text-mcc-maroon border-slate-300 focus:ring-mcc-gold"
                    />
                    <span className="capitalize text-slate-700 dark:text-slate-300 font-semibold">{themeName} Theme</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Default Theme for new students</label>
            <select
              value={config.defaultTheme}
              onChange={(e) => setConfig({ ...config, defaultTheme: e.target.value })}
              className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
            >
              {config.enabledThemes.map((themeName: string) => (
                <option key={themeName} value={themeName} className="capitalize">{themeName}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 font-semibold text-xs transition-all shadow"
            >
              Save Theme Config
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: ROLE & ACCOUNTS MANAGEMENT */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">User Accounts & Role Permissions</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage institutional credentials, update administrative roles, and allocate access rights.
                </p>
              </div>
              <button
                onClick={() => setCoordModalOpen(true)}
                className="px-4 py-2 bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-xs font-semibold text-slate-100 rounded-lg transition-all shadow"
              >
                + Create Coordinator Account
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                    <th className="pb-3 pr-2">Email</th>
                    <th className="pb-3 pr-2">Assigned Role</th>
                    <th className="pb-3 pr-2">Linked Student / Profile</th>
                    <th className="pb-3 pr-2">Registered On</th>
                    <th className="pb-3 text-right">Actions / Permissions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 italic">No user accounts found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-100/30 dark:hover:bg-slate-900/10">
                        <td className="py-4 pr-2 font-bold text-slate-800 dark:text-slate-200">
                          {u.email}
                        </td>
                        <td className="py-4 pr-2 text-slate-650 dark:text-slate-400">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-mcc-gold"
                          >
                            <option value="Student">Student</option>
                            <option value="Admin">Super Admin</option>
                            <option value="PlacementCoordinator">Placement Coordinator</option>
                            <option value="ResearchCoordinator">Research Coordinator</option>
                            <option value="InnovationCoordinator">Innovation Coordinator</option>
                            <option value="StudentAffairsCoordinator">Student Affairs Coordinator</option>
                          </select>
                        </td>
                        <td className="py-4 pr-2 text-slate-550 dark:text-slate-450">
                          {u.student ? (
                            <div>
                              <span className="block text-slate-800 dark:text-slate-200">{u.student.firstName} {u.student.lastName}</span>
                              <span className="block text-[10px] text-slate-500">{u.student.rollNumber} &bull; {u.student.department}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">N/A (Staff/Admin)</span>
                          )}
                        </td>
                        <td className="py-4 pr-2 text-slate-600 dark:text-slate-400 font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2 items-center">
                          <span className="text-[10px] text-slate-500 italic">Role managed via dropdown</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REPORTS & EXPORTS */}
      {activeTab === "reports" && (
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Institutional Reports & Data Exports</h3>
            <p className="text-xs text-slate-500 mt-1">Download raw institutional records as CSV sheets for reporting and external databases.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Student Profiles Registry</h4>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">
                  Downloads complete student index sheet including CGPA, approval status, roll numbers, and names.
                </p>
              </div>
              <button
                onClick={downloadStudentsCSV}
                className="mt-auto h-9 px-4 rounded bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 text-xs font-semibold"
              >
                Export Student List (CSV)
              </button>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl flex flex-col gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Department Metrics Summary</h4>
                <p className="text-[11px] text-slate-550 dark:text-slate-400 mt-1">
                  Downloads department performance summaries, averages, project counts, and placement metrics.
                </p>
              </div>
              <button
                onClick={downloadDepartmentCSV}
                className="mt-auto h-9 px-4 rounded bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 text-xs font-semibold"
              >
                Export Department Stats (CSV)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: NOTIFICATION BROADCASTS */}
      {activeTab === "notifications" && (
        <form onSubmit={handleSendNotification} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col gap-6 max-w-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Broadcast Alerts Center</h3>
            <p className="text-xs text-slate-500 mt-1">Send immediate dashboard alerts to students globally, by department, or individually.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Target Audience</label>
              <select
                value={notifForm.targetType}
                onChange={(e) => setNotifForm({ ...notifForm, targetType: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Students</option>
                <option value="department">Specific Department</option>
                <option value="student">Individual Student (Email)</option>
              </select>
            </div>

            <div>
              {notifForm.targetType === "department" ? (
                <>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Target Department</label>
                  <select
                    value={notifForm.departmentName}
                    onChange={(e) => setNotifForm({ ...notifForm, departmentName: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  >
                    {uniqueDepartmentsInDB.filter(d => d !== "All").map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </>
              ) : notifForm.targetType === "student" ? (
                <>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Student Email</label>
                  <input
                    type="email"
                    required
                    value={notifForm.studentEmail}
                    onChange={(e) => setNotifForm({ ...notifForm, studentEmail: e.target.value })}
                    placeholder="student@mcc.edu.in"
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </>
              ) : (
                <div className="opacity-50 pointer-events-none">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Target Filter Scope</label>
                  <input
                    type="text"
                    disabled
                    value="Global Broadcast (No filter)"
                    className="w-full h-10 px-4 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Alert Type</label>
              <select
                value={notifForm.type}
                onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              >
                <option value="System">System Message</option>
                <option value="Placement">Placement Alert</option>
                <option value="Circular">Campus Circular</option>
                <option value="Event">Institutional Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Internal Redirection Link</label>
              <input
                type="text"
                required
                value={notifForm.link}
                onChange={(e) => setNotifForm({ ...notifForm, link: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Alert Title</label>
              <input
                type="text"
                required
                value={notifForm.title}
                onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                placeholder="Important Announcement Name"
                className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Message Body</label>
              <textarea
                required
                value={notifForm.message}
                onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                placeholder="Provide details about the alert. Keep it concise."
                className="w-full p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 h-24"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end">
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 font-semibold text-xs transition-all shadow"
            >
              Broadcast Notification
            </button>
          </div>
        </form>
      )}

      {/* MODAL: CREATE COORDINATOR ACCOUNT */}
      <AnimatePresence>
        {coordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Create Staff / Coordinator Account
                </h3>
                <button onClick={() => setCoordModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCoordinator} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={coordEmail}
                    onChange={(e) => setCoordEmail(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    placeholder="staff-name@mcc.edu.in"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={coordPassword}
                    onChange={(e) => setCoordPassword(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Staff Scope / Role</label>
                  <select
                    value={coordRole}
                    onChange={(e) => setCoordRole(e.target.value)}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  >
                    <option value="PlacementCoordinator">Placement Coordinator</option>
                    <option value="ResearchCoordinator">Research Coordinator</option>
                    <option value="InnovationCoordinator">Innovation Coordinator</option>
                    <option value="StudentAffairsCoordinator">Student Affairs Coordinator</option>
                    <option value="Admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6 border-t border-slate-200 dark:border-slate-850 pt-4">
                  <button
                    type="button"
                    onClick={() => setCoordModalOpen(false)}
                    className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/30 hover:bg-mcc-maroon-light transition-all text-xs font-semibold text-slate-100"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD STUDENT DIALOG */}
      <AnimatePresence>
        {addStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Register New Student Record
                </h3>
                <button onClick={() => setAddStudentModalOpen(false)} className="text-slate-500 dark:text-slate-400 focus:outline-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Student Email</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    placeholder="username@mcc.edu.in"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    placeholder="24-MCA-055"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">CGPA Score</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={studentForm.cgpa}
                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: parseFloat(e.target.value) })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Department</label>
                  <select
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  >
                    {departments.filter(d => d !== "All").map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Batch Year</label>
                  <input
                    type="text"
                    required
                    value={studentForm.batchYear}
                    onChange={(e) => setStudentForm({ ...studentForm, batchYear: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                    placeholder="2024-2026"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-200 dark:border-slate-850 pt-4 flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={studentForm.isAlumni}
                      onChange={(e) => setStudentForm({ ...studentForm, isAlumni: e.target.checked })}
                      className="w-4 h-4 rounded text-mcc-maroon border-slate-300 focus:ring-mcc-gold"
                    />
                    <span>Is Graduated Alumni?</span>
                  </label>
                </div>

                {studentForm.isAlumni && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Employer Company</label>
                      <input
                        type="text"
                        value={studentForm.currentCompany}
                        onChange={(e) => setStudentForm({ ...studentForm, currentCompany: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        placeholder="Zoho Corporation"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Employed Role / Title</label>
                      <input
                        type="text"
                        value={studentForm.currentRole}
                        onChange={(e) => setStudentForm({ ...studentForm, currentRole: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        placeholder="Software Engineer II"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Professional Biography</label>
                  <textarea
                    value={studentForm.bio}
                    onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                    className="w-full p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 h-20"
                  />
                </div>

                <div className="col-span-2 flex justify-end gap-3 mt-4 border-t border-slate-200 dark:border-slate-850 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddStudentModalOpen(false)}
                    className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 font-semibold text-xs transition-all shadow"
                  >
                    Add student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT STUDENT DIALOG */}
      <AnimatePresence>
        {editStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Edit Student Details
                </h3>
                <button onClick={() => setEditStudentModalOpen(false)} className="text-slate-500 dark:text-slate-400 focus:outline-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Student Email</label>
                  <input
                    type="email"
                    disabled
                    value={studentForm.email}
                    className="w-full h-10 px-4 rounded-lg bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">CGPA Score</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={studentForm.cgpa}
                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: parseFloat(e.target.value) })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Batch Year</label>
                  <input
                    type="text"
                    required
                    value={studentForm.batchYear}
                    onChange={(e) => setStudentForm({ ...studentForm, batchYear: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Department</label>
                  <select
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                  >
                    {departments.filter(d => d !== "All").map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={studentForm.isAlumni}
                      onChange={(e) => setStudentForm({ ...studentForm, isAlumni: e.target.checked })}
                      className="w-4 h-4 rounded text-mcc-maroon border-slate-300 focus:ring-mcc-gold"
                    />
                    <span>Is Graduated Alumni?</span>
                  </label>
                </div>

                {studentForm.isAlumni && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Employer Company</label>
                      <input
                        type="text"
                        value={studentForm.currentCompany}
                        onChange={(e) => setStudentForm({ ...studentForm, currentCompany: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        placeholder="Company Employer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Employed Role / Title</label>
                      <input
                        type="text"
                        value={studentForm.currentRole}
                        onChange={(e) => setStudentForm({ ...studentForm, currentRole: e.target.value })}
                        className="w-full h-10 px-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200"
                        placeholder="Employed Job Title"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Biography</label>
                  <textarea
                    value={studentForm.bio}
                    onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                    className="w-full p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 h-20"
                  />
                </div>

                <div className="col-span-2 flex justify-end gap-3 mt-4 border-t border-slate-200 dark:border-slate-850 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditStudentModalOpen(false);
                      setSelectedStudent(null);
                    }}
                    className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-lg bg-mcc-maroon border border-mcc-gold/20 hover:bg-mcc-maroon-light text-slate-100 font-semibold text-xs transition-all shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DETAILED PORTFOLIO REVIEW */}
      <AnimatePresence>
        {reviewModalOpen && selectedPortfolio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl my-8"
            >
              <div className="flex justify-between items-center mb-5 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Review Portfolio: {selectedPortfolio.student.firstName} {selectedPortfolio.student.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Roll Number: {selectedPortfolio.student.rollNumber} &bull; {selectedPortfolio.student.department}</p>
                </div>
                <button
                  onClick={() => {
                    setReviewModalOpen(false);
                    setSelectedPortfolio(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                {/* Statement of Purpose audit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-lg">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Statement of Purpose (SOP)</h4>
                  <p className="text-slate-850 dark:text-slate-250 italic leading-relaxed whitespace-pre-wrap">
                    {selectedPortfolio.statementOfPurpose || "No Statement of Purpose written yet."}
                  </p>
                </div>

                {/* Brief bio audit */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-lg">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Biography</h4>
                  <p className="text-slate-850 dark:text-slate-250 leading-relaxed">
                    {selectedPortfolio.student.bio || "No biography provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-850">
                  <span className="text-slate-500 font-semibold">Public Showcase Route</span>
                  <a
                    href={`/portfolio/${selectedPortfolio.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-mcc-gold hover:underline font-bold"
                  >
                    /portfolio/{selectedPortfolio.slug}
                  </a>
                </div>

                {/* Remarks Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase mb-2">
                    Review Remarks / Revision Comments
                  </label>
                  <textarea
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Provide details of any feedback or reason for requesting revisions..."
                    className="w-full p-4 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-sm text-slate-800 dark:text-slate-200 h-24"
                  />
                </div>

                <div className="flex justify-between items-center mt-6 border-t border-slate-200 dark:border-slate-850 pt-4">
                  <button
                    onClick={() => handleApproveStatus(false)}
                    className="h-10 px-4 rounded-lg bg-amber-950/20 hover:bg-amber-950/50 text-amber-400 font-bold border border-amber-900/30 text-xs"
                  >
                    Request Revisions
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReviewModalOpen(false);
                        setSelectedPortfolio(null);
                      }}
                      className="h-10 px-5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApproveStatus(true)}
                      className="h-10 px-6 rounded-lg bg-green-700 hover:bg-green-600 text-white font-bold text-xs"
                    >
                      Approve & Publish Canvas
                    </button>
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
