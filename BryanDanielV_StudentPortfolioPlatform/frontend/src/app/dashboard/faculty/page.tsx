"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  batchYear: string;
  cgpa: number;
  portfolio: {
    id: string;
    slug: string;
    isPublic: boolean;
    isApproved: boolean;
    reviewRemarks: string | null;
    reviewedBy: string | null;
  } | null;
}

export default function FacultyDashboard() {
  const { token, user, logout } = useAuth();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Review Drawer state
  const [auditStudentId, setAuditStudentId] = useState<string | null>(null);
  const [auditDetails, setAuditDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const departments = [
    "All",
    "Computer Applications (MCA)",
    "Computer Science (B.Sc / M.Sc)",
    "Information Technology",
    "Commerce (B.Com / M.Com)",
    "Economics",
    "English Literature",
    "Physics",
    "Chemistry",
    "Mathematics",
  ];

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<StudentSummary[]>("/faculty/students", token);
      setStudents(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to load student profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadStudents();
    }
  }, [token]);

  const loadStudentDetails = async (studentId: string) => {
    try {
      setDetailsLoading(true);
      setAuditStudentId(studentId);
      setAuditDetails(null);
      const details = await api.get<any>(`/faculty/students/${studentId}`, token);
      setAuditDetails(details);
      setReviewRemarks(details.portfolio?.reviewRemarks || "");
    } catch (err: any) {
      showNotification(err.message || "Failed to load profile details.", "error");
      setAuditStudentId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleReviewSubmit = async (approve: boolean) => {
    if (!auditDetails?.portfolio?.id) {
      showNotification("This student has not initialized a portfolio yet.", "error");
      return;
    }
    try {
      setReviewLoading(true);
      await api.put(
        `/faculty/portfolios/${auditDetails.portfolio.id}/review`,
        { approve, remarks: reviewRemarks },
        token
      );
      showNotification(
        `Portfolio ${approve ? "approved" : "flagged for revisions"} successfully.`,
        "success"
      );
      // Reload student list to update summary tables
      await loadStudents();
      // Close drawer
      setAuditStudentId(null);
      setAuditDetails(null);
    } catch (err: any) {
      showNotification(err.message || "Failed to submit review.", "error");
    } finally {
      setReviewLoading(false);
    }
  };

  const showNotification = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    }
  };

  // Filter calculations
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "All" || s.department === selectedDept;

    const isApproved = s.portfolio?.isApproved === true;
    const hasPortfolio = s.portfolio !== null;

    let matchesStatus = true;
    if (selectedStatus === "Approved") {
      matchesStatus = isApproved;
    } else if (selectedStatus === "Pending") {
      matchesStatus = hasPortfolio && !isApproved;
    } else if (selectedStatus === "NoPortfolio") {
      matchesStatus = !hasPortfolio;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalCount = students.length;
  const approvedCount = students.filter((s) => s.portfolio?.isApproved).length;
  const pendingCount = students.filter((s) => s.portfolio && !s.portfolio.isApproved).length;
  const missingCount = students.filter((s) => !s.portfolio).length;

  return (
    <div className="flex flex-col gap-8 w-full">
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-6">
        <div>
          <span className="text-xs text-mcc-gold font-bold tracking-widest uppercase">
            Faculty Administration
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
            Welcome, Professor {user?.firstName || "Faculty"}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.department || "Madras Christian College Faculty Member"} &bull; Role: {user?.role}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Total Students
          </span>
          <span className="text-3xl font-black mt-2 text-slate-800 dark:text-slate-100">
            {loading ? "..." : totalCount}
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm border-l-4 border-l-green-600">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Approved Portfolios
          </span>
          <span className="text-3xl font-black mt-2 text-green-650 dark:text-green-400">
            {loading ? "..." : approvedCount}
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm border-l-4 border-l-amber-500">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Pending Audits
          </span>
          <span className="text-3xl font-black mt-2 text-amber-600 dark:text-amber-400">
            {loading ? "..." : pendingCount}
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            No Portfolio
          </span>
          <span className="text-3xl font-black mt-2 text-slate-600 dark:text-slate-400">
            {loading ? "..." : missingCount}
          </span>
        </div>
      </div>

      {/* Main Student Directory section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs cursor-pointer"
              >
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved Only</option>
                <option value="Pending">Pending Audit</option>
                <option value="NoPortfolio">No Portfolio Profile</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory List / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
            <div className="w-8 h-8 border-2 border-t-mcc-maroon border-mcc-gold rounded-full animate-spin" />
            <span className="text-xs">Loading Student Profiles...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">
            No students found matching the search filters.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">CGPA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const hasPortfolio = student.portfolio !== null;
                  const isApproved = student.portfolio?.isApproved === true;

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 dark:border-slate-800/30 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Roll: {student.rollNumber} &bull; Batch: {student.batchYear}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {student.department}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {!hasPortfolio ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-400">
                            No Portfolio
                          </span>
                        ) : isApproved ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-950/20 text-green-600 border border-green-900/30">
                            Approved
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/20 text-amber-600 border border-amber-900/30">
                            Pending Audit
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {hasPortfolio ? (
                          <button
                            onClick={() => loadStudentDetails(student.id)}
                            className="px-3 py-1.5 rounded-lg bg-mcc-maroon hover:bg-mcc-maroon-light border border-mcc-gold/30 text-mcc-gold hover:text-white transition-all text-xs font-semibold shadow-sm cursor-pointer"
                          >
                            Audit Portfolio
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium italic">
                            Uninitialized
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Drawer / Modal overlay */}
      <AnimatePresence>
        {auditStudentId && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setAuditStudentId(null);
                setAuditDetails(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-mcc-gold font-bold uppercase tracking-wider block">
                    Portfolio Auditing Cell
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                    {detailsLoading ? "Retrieving Profile Details..." : `${auditDetails?.profile?.firstName} ${auditDetails?.profile?.lastName}`}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setAuditStudentId(null);
                    setAuditDetails(null);
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
                {detailsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
                    <div className="w-8 h-8 border-2 border-t-mcc-maroon border-mcc-gold rounded-full animate-spin" />
                    <span className="text-xs">Fetching academic metadata, projects, publications...</span>
                  </div>
                ) : auditDetails ? (
                  <>
                    {/* Bio & Links */}
                    <div className="flex flex-col gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bio</span>
                        <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 italic">
                          "{auditDetails.profile?.bio || "No bio entered."}"
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
                          <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold block mt-0.5">
                            {auditDetails.profile?.department}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">CGPA Score</span>
                          <span className="text-xs text-slate-800 dark:text-slate-200 font-bold block mt-0.5">
                            {auditDetails.profile?.cgpa?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {auditDetails.profile?.githubUsername && (
                          <a
                            href={`https://github.com/${auditDetails.profile.githubUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-mcc-gold hover:underline flex items-center gap-1 font-semibold"
                          >
                            GitHub Profile
                          </a>
                        )}
                        {auditDetails.profile?.behanceUsername && (
                          <a
                            href={`https://behance.net/${auditDetails.profile.behanceUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-mcc-gold hover:underline flex items-center gap-1 font-semibold"
                          >
                            Behance Portfolio
                          </a>
                        )}
                        {/* Additional Custom Portfolio Links */}
                        {(() => {
                          let settings: any = {};
                          try {
                            settings = JSON.parse(auditDetails.portfolio?.layoutSettingsJson || "{}");
                          } catch (e) {}
                          return (
                            <>
                              {settings.linkedinUrl && (
                                <a
                                  href={settings.linkedinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  LinkedIn
                                </a>
                              )}
                              {settings.leetcodeUrl && (
                                <a
                                  href={settings.leetcodeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-orange-500 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  LeetCode
                                </a>
                              )}
                              {settings.blogUrl && (
                                <a
                                  href={settings.blogUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-teal-500 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  Blog
                                </a>
                              )}
                            </>
                          );
                        })()}
                        {auditDetails.portfolio?.slug && (
                          <a
                            href={`/portfolio/${auditDetails.portfolio.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold border-l border-slate-300 dark:border-slate-800 pl-4 ml-1"
                          >
                            Open Public Site
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Statement of Purpose */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                        Statement of Purpose (SOP)
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                        {auditDetails.portfolio?.statementOfPurpose || "No statement of purpose formulated yet."}
                      </p>
                    </div>

                    {/* Personal Story / Journey */}
                    {auditDetails.portfolio?.storyContent && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                          {auditDetails.portfolio.storyTitle || "Personal Journey / Story"}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                          {auditDetails.portfolio.storyContent}
                        </p>
                      </div>
                    )}

                    {/* Projects */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                        Projects ({auditDetails.projects?.length || 0})
                      </h4>
                      {auditDetails.projects?.length === 0 ? (
                        <p className="text-xs italic text-slate-450">No projects listed.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {auditDetails.projects.map((proj: any) => (
                            <div key={proj.id} className="p-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/50">
                              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{proj.title}</h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                              {proj.technologiesUsed && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {proj.technologiesUsed.split(",").map((tech: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded-md text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                                      {tech.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Publications */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                        Publications ({auditDetails.publications?.length || 0})
                      </h4>
                      {auditDetails.publications?.length === 0 ? (
                        <p className="text-xs italic text-slate-455">No indexed publications registered.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {auditDetails.publications.map((pub: any) => (
                            <div key={pub.id} className="p-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/50">
                              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{pub.title}</h5>
                              <p className="text-[10px] text-mcc-gold font-semibold mt-0.5">{pub.journalOrConference} &bull; {new Date(pub.publishDate).getFullYear()}</p>
                              {pub.abstract && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed italic">
                                  "Abstract: {pub.abstract}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Certifications */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                        Certifications ({auditDetails.certifications?.length || 0})
                      </h4>
                      {auditDetails.certifications?.length === 0 ? (
                        <p className="text-xs italic text-slate-455">No credentials listed.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {auditDetails.certifications.map((cert: any) => (
                            <div key={cert.id} className="p-3 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/50">
                              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{cert.name}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">{cert.issuingOrganization}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Achievements & Awards */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                        Awards & Contests ({auditDetails.achievements?.length || 0})
                      </h4>
                      {auditDetails.achievements?.length === 0 ? (
                        <p className="text-xs italic text-slate-455">No achievements recorded.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {auditDetails.achievements.map((ach: any) => (
                            <div key={ach.id} className="p-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/50">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{ach.title}</h5>
                                <span className="text-[9px] uppercase font-bold text-slate-400">{ach.category}</span>
                              </div>
                              <p className="text-[10px] text-mcc-gold font-semibold mt-0.5">Date Earned: {new Date(ach.dateEarned).toLocaleDateString()}</p>
                              {ach.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                  {ach.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Community Services */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                        Community Outreach ({auditDetails.communityServices?.length || 0})
                      </h4>
                      {auditDetails.communityServices?.length === 0 ? (
                        <p className="text-xs italic text-slate-455">No outreach or service records registered.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {auditDetails.communityServices.map((service: any) => (
                            <div key={service.id} className="p-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/50">
                              <div className="flex justify-between items-start">
                                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">{service.organization}</h5>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{service.role}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{service.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Auditing Review Panel Footer */}
              {auditDetails && (
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-2">
                      Professor Feedback & Remarks
                    </label>
                    <textarea
                      placeholder="Write feedback for the student portfolio. E.g. 'SOP looks solid. Please append your latest project from the hackathon.'"
                      value={reviewRemarks}
                      onChange={(e) => setReviewRemarks(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 focus:border-mcc-gold focus:outline-none text-xs leading-relaxed"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleReviewSubmit(false)}
                      disabled={reviewLoading}
                      className="w-1/3 h-10 rounded-lg border border-amber-900 bg-amber-950/20 text-amber-500 hover:bg-amber-950/40 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Request Revisions
                    </button>
                    <button
                      onClick={() => handleReviewSubmit(true)}
                      disabled={reviewLoading}
                      className="flex-1 h-10 rounded-lg bg-gradient-to-r from-mcc-maroon to-mcc-maroon-light text-slate-100 hover:from-mcc-maroon-light hover:to-red-650 text-xs font-semibold transition-all shadow-md disabled:opacity-50 cursor-pointer border border-mcc-gold/30"
                    >
                      {reviewLoading ? "Submitting Audit..." : "Approve Portfolio"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
