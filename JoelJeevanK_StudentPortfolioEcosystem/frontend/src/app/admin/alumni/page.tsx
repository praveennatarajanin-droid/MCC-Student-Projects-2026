"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from "recharts";
import { GraduationCap, Users, Award, Search, Download, RefreshCw, Mail, Phone, ExternalLink, ChevronDown, ChevronUp, Loader2, AlertCircle, CheckCircle2, Calendar, BookOpen, UserCheck, Eye } from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface AlumniRecord {
  id: string;
  name: string;
  email: string;
  gender: string;
  department: string;
  username: string;
  isApproved: boolean;
  isBlocked: boolean;
  bio: string;
  skills: string;
  profileImageUrl: string;
  phone: string;
  degree: string;
  graduationYear: number;
  startYear?: number;
  endYear?: number;
  gradeOrCgpa: string;
  projectsCount: number;
  certificationsCount: number;
}

export default function AlumniTrackingPage() {
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState("");
  const [userDept, setUserDept] = useState("");
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "");
    setUserDept(localStorage.getItem("userDepartment") || "");
    fetchAlumni();
  }, []);

  async function fetchAlumni() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/api/admin/alumni");
      setAlumni(data);
      
      // Expand all departments by default
      const uniqueDepts = Array.from(new Set(data.map((a: AlumniRecord) => a.department))) as string[];
      const defaultExpanded: Record<string, boolean> = {};
      uniqueDepts.forEach(d => {
        defaultExpanded[d] = true;
      });
      setExpandedDepts(defaultExpanded);
    } catch (err: any) {
      setError("Failed to retrieve alumni roster.");
    } finally {
      setLoading(false);
    }
  }

  const toggleDeptExpand = (dept: string) => {
    setExpandedDepts(prev => ({
      ...prev,
      [dept]: !prev[dept]
    }));
  };

  // Get unique batches and departments for filters
  const uniqueBatches = useMemo(() => {
    const years = alumni.map(a => a.graduationYear).filter(Boolean);
    return ["All", ...Array.from(new Set(years)).sort((a, b) => b - a).map(String)];
  }, [alumni]);

  const uniqueDepartments = useMemo(() => {
    return ["All", ...Array.from(new Set(alumni.map(a => a.department))).sort()];
  }, [alumni]);

  // Filtered Alumni list
  const filteredAlumni = useMemo(() => {
    return alumni.filter(a => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.degree.toLowerCase().includes(search.toLowerCase()) ||
        a.skills.toLowerCase().includes(search.toLowerCase());

      const matchesBatch = batchFilter === "All" || String(a.graduationYear) === batchFilter;
      const matchesDept = deptFilter === "All" || a.department === deptFilter;

      return matchesSearch && matchesBatch && matchesDept;
    });
  }, [alumni, search, batchFilter, deptFilter]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = filteredAlumni.length;
    return {
      total
    };
  }, [filteredAlumni]);

  // Chart Data: Department-wise alumni count
  const departmentChartData = useMemo(() => {
    const counts = filteredAlumni.reduce((acc, a) => {
      acc[a.department] = (acc[a.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAlumni]);

  // Chart Data: Graduation trends over years
  const graduationTrendsData = useMemo(() => {
    const counts = filteredAlumni.reduce((acc, a) => {
      if (a.graduationYear) {
        acc[a.graduationYear] = (acc[a.graduationYear] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(counts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [filteredAlumni]);

  // Grouped by department for the accordion view
  const groupedAlumni = useMemo(() => {
    return filteredAlumni.reduce<Record<string, AlumniRecord[]>>((acc, a) => {
      if (!acc[a.department]) acc[a.department] = [];
      acc[a.department].push(a);
      return acc;
    }, {});
  }, [filteredAlumni]);

  // jsPDF Export functionality
  const downloadPDFReport = () => {
    if (filteredAlumni.length === 0) return;
    setExportingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Branding Header
      doc.setFillColor(122, 28, 28); // MCC Crimson
      doc.rect(0, 0, pageWidth, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MADRAS CHRISTIAN COLLEGE (AUTONOMOUS)", pageWidth / 2, 16, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Tambaram, Chennai, Tamil Nadu - 600059", pageWidth / 2, 22, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("ALUMNI REGISTRY & GRADUATE TRACKING REPORT", pageWidth / 2, 29, { align: "center" });

      // Accent Gold border line
      doc.setDrawColor(212, 175, 55); // MCC Gold
      doc.setLineWidth(1.5);
      doc.line(0, 40, pageWidth, 40);

      // Section 1: Stats Summary
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Executive Summary Statistics", 15, 52);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 56, pageWidth - 30, 26, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Total Alumni Tracked:  ${stats.total} Graduates`, 20, 63);
      doc.text(`Report Filters:        Dept: ${deptFilter} | Batch: ${batchFilter}`, 20, 70);

      // Section 2: Detailed Alumni List Table
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("MCC Alumni Registry List", 15, 94);

      let y = 100;
      
      // Table Header Row
      doc.setFillColor(122, 28, 28);
      doc.rect(15, y, pageWidth - 30, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Name", 18, y + 5.5);
      doc.text("Department", 65, y + 5.5);
      doc.text("Degree", 115, y + 5.5);
      doc.text("Batch", 155, y + 5.5, { align: "center" });
      doc.text("CGPA", 172, y + 5.5, { align: "center" });
      doc.text("Status", 187, y + 5.5, { align: "center" });

      y += 8;

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);

      filteredAlumni.forEach((alumnus, idx) => {
        // Check for page break
        if (y > pageHeight - 22) {
          doc.addPage();
          
          // Re-draw small header on next page
          doc.setFillColor(122, 28, 28);
          doc.rect(0, 0, pageWidth, 15, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("MCC ALUMNI REGISTRY & GRADUATE TRACKING", 15, 10);
          
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          y = 25;

          // Re-draw Table Header
          doc.setFillColor(122, 28, 28);
          doc.rect(15, y, pageWidth - 30, 8, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.text("Name", 18, y + 5.5);
          doc.text("Department", 65, y + 5.5);
          doc.text("Degree", 115, y + 5.5);
          doc.text("Batch", 155, y + 5.5, { align: "center" });
          doc.text("CGPA", 172, y + 5.5, { align: "center" });
          doc.text("Status", 187, y + 5.5, { align: "center" });
          
          y += 8;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
        }

        // Alternating row background
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, pageWidth - 30, 8, "F");
        }

        // Horizontal line
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.3);
        doc.line(15, y + 8, pageWidth - 15, y + 8);

        // Print cell data
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        
        // Truncate long names/depts
        const nameText = alumnus.name.length > 22 ? alumnus.name.substring(0, 20) + ".." : alumnus.name;
        doc.text(nameText, 18, y + 5.5);
        
        doc.setFont("helvetica", "normal");
        const deptText = alumnus.department.length > 25 ? alumnus.department.substring(0, 23) + ".." : alumnus.department;
        doc.text(deptText, 65, y + 5.5);

        const degreeText = alumnus.degree.length > 22 ? alumnus.degree.substring(0, 20) + ".." : alumnus.degree;
        doc.text(degreeText, 115, y + 5.5);

        const batchText = alumnus.startYear && alumnus.endYear
          ? `${alumnus.startYear}–${alumnus.endYear}`
          : String(alumnus.graduationYear);
        doc.text(batchText, 155, y + 5.5, { align: "center" });
        doc.text(alumnus.gradeOrCgpa || "N/A", 172, y + 5.5, { align: "center" });

        const isReady = alumnus.projectsCount > 0 && alumnus.certificationsCount > 0;
        doc.setFont("helvetica", "bold");
        if (isReady) {
          doc.setTextColor(22, 163, 74); // Green
          doc.text("Corporate Ready", 187, y + 5.5, { align: "center" });
        } else {
          doc.setTextColor(148, 163, 184); // Grey
          doc.text("Graduated", 187, y + 5.5, { align: "center" });
        }
        doc.setTextColor(51, 65, 85); // Reset

        y += 8;
      });

      // Footer info on the last page
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      const generatedAt = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      doc.text(`Alumni Registry Export Generated On: ${generatedAt}`, 15, pageHeight - 10);
      doc.text("MCC Portfolio Registry Management System • Confidential Institutional Record", pageWidth - 15, pageHeight - 10, { align: "right" });

      doc.save(`MCC_Alumni_Registry_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
        <p className="text-slate-500 text-sm">Retrieving alumni database records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-slate-500 border border-dashed rounded-3xl glass-panel">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-base text-foreground">Alumni Records Unavailable</h3>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
        <button onClick={fetchAlumni} className="mt-4 px-4 py-2 text-xs font-bold btn-premium rounded-xl cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <GraduationCap className="h-7 w-7 text-mcc-crimson dark:text-mcc-gold" />
            {userRole === "Staff" ? "Department Alumni Tracking" : "Institutional Alumni Tracking"}
          </h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm mt-1">
            Track and monitor graduated MCC student careers, credentials, projects, and corporate placements.
          </p>
        </div>
      </div>

      {/* Ratios Metrics Summaries Grid */}
      <div className="glass-panel p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-mcc-crimson/10 text-mcc-crimson dark:bg-mcc-gold/10 dark:text-mcc-gold rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Alumni Tracked</p>
            <p className="text-2xl font-extrabold mt-0.5 text-mcc-crimson dark:text-mcc-gold">{stats.total} Graduates</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchAlumni}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
            title="Refresh Database"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={downloadPDFReport}
            disabled={filteredAlumni.length === 0 || exportingPDF}
            className="px-4 py-2.5 rounded-xl btn-premium text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {exportingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Export Alumni PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analytics Charts Row */}
      {filteredAlumni.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department-wise Distribution */}
          {userRole !== "Staff" && (
            <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between h-72">
              <div>
                <h3 className="font-extrabold text-sm text-mcc-crimson dark:text-mcc-gold flex items-center gap-2">
                  Alumni Distribution by Department
                </h3>
                <p className="text-[11px] text-slate-400">Total studied student strength in each academic department.</p>
              </div>
              <div className="h-44 mt-4">
                {departmentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                      <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.6)" fontSize={9} tickFormatter={(str) => str.length > 10 ? `${str.substring(0,8)}...` : str} />
                      <YAxis stroke="rgba(148, 163, 184, 0.6)" fontSize={9} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7a1c1c" radius={[4, 4, 0, 0]}>
                        {departmentChartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "#7a1c1c" : "#d4af37"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400 italic">No departmental records found.</div>
                )}
              </div>
            </div>
          )}

          {/* Graduation Trends Over Years */}
          <div className={`${userRole === "Staff" ? "lg:col-span-2" : ""} glass-panel p-6 rounded-3xl border flex flex-col justify-between h-72`}>
            <div>
              <h3 className="font-extrabold text-sm text-mcc-crimson dark:text-mcc-gold flex items-center gap-2">
                Batch Distribution Over Time
              </h3>
              <p className="text-[11px] text-slate-400">Trend graph illustrating studied student volume per entry batch year.</p>
            </div>
            <div className="h-44 mt-4">
              {graduationTrendsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graduationTrendsData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7a1c1c" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#7a1c1c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                    <XAxis dataKey="year" stroke="rgba(148, 163, 184, 0.6)" fontSize={9} type="number" domain={['auto', 'auto']} tickFormatter={(y) => `Batch ${y}`} />
                    <YAxis stroke="rgba(148, 163, 184, 0.6)" fontSize={9} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#7a1c1c" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400 italic">No graduation trends recorded.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search alumni by name, degree, skills, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
          />
        </div>

        <select
          value={batchFilter}
          onChange={e => setBatchFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none cursor-pointer"
        >
          <option value="All">All Batches</option>
          {uniqueBatches.filter(b => b !== "All").map(batch => (
            <option key={batch} value={batch}>Batch {batch}</option>
          ))}
        </select>

        {userRole !== "Staff" && (
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none cursor-pointer"
          >
            {uniqueDepartments.map(d => (
              <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
            ))}
          </select>
        )}
      </div>

      {/* Accordion List (Grouped by Department) */}
      {Object.keys(groupedAlumni).length === 0 ? (
        <div className="p-12 text-center border border-dashed rounded-3xl text-slate-500 glass-panel">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <h4 className="font-bold text-foreground">No Alumni Records Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            We couldn't locate any studied student records matching the selected search query or batch year filter.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAlumni)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dept, deptAlumni]) => {
              const isOpen = expandedDepts[dept] !== false;
              const readyCount = deptAlumni.filter(a => a.projectsCount > 0 && a.certificationsCount > 0).length;
              return (
                <div key={dept} className="glass-panel rounded-3xl border overflow-hidden transition-all duration-300">
                  {/* Department Accordion Trigger Header */}
                  <button
                    onClick={() => toggleDeptExpand(dept)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-mcc-crimson/5 dark:bg-mcc-gold/5 border-b border-slate-100 dark:border-slate-800 hover:bg-mcc-crimson/[0.08] dark:hover:bg-mcc-gold/[0.08] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <span className="font-extrabold text-sm text-mcc-crimson dark:text-mcc-gold">{dept}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full registry-badge">
                        {deptAlumni.length} Graduate{deptAlumni.length !== 1 ? "s" : ""}
                      </span>
                      {readyCount > 0 && (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          {readyCount} Corporate Placed / Ready
                        </span>
                      )}
                    </div>
                    <div>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-x-auto"
                      >
                        <div className="min-w-[800px] divide-y divide-slate-100 dark:divide-slate-800">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-white text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "rgb(29, 41, 61)" }}>
                                <th className="px-6 py-3">Alumnus Name</th>
                                <th className="px-6 py-3">Completed Degree</th>
                                <th className="px-6 py-3 text-center">Batch Year</th>
                                <th className="px-6 py-3 text-center">GPA / Grade</th>
                                <th className="px-6 py-3">Top Tech Skills</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {deptAlumni.map((alumnus) => {
                                const isReady = alumnus.projectsCount > 0 && alumnus.certificationsCount > 0;
                                return (
                                  <tr
                                    key={alumnus.id}
                                    className="hover:bg-slate-100/30 dark:hover:bg-slate-900/10 transition-colors text-sm"
                                  >
                                    {/* Alumnus Name / Avatar */}
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-mcc-crimson/10 text-mcc-crimson dark:bg-mcc-gold/10 dark:text-mcc-gold">
                                          {alumnus.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{alumnus.name}</span>
                                            {isReady && (
                                              <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                Vetted
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-slate-400 truncate block font-mono">
                                            {alumnus.email}
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Degree */}
                                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-350">
                                      {alumnus.degree}
                                    </td>

                                    {/* Graduation Year */}
                                    <td className="px-6 py-4 text-center font-bold text-slate-500 dark:text-slate-400">
                                      {alumnus.startYear && alumnus.endYear
                                        ? `${alumnus.startYear}–${alumnus.endYear}`
                                        : alumnus.graduationYear}
                                    </td>

                                    {/* CGPA */}
                                    <td className="px-6 py-4 text-center font-extrabold text-slate-600 dark:text-slate-300">
                                      {alumnus.gradeOrCgpa || "—"}
                                    </td>

                                    {/* Skills */}
                                    <td className="px-6 py-4 max-w-[240px]">
                                      {alumnus.skills ? (
                                        <div className="flex flex-wrap gap-1">
                                          {alumnus.skills.split(",").slice(0, 3).map((skill, idx) => (
                                            <span
                                              key={idx}
                                              className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 border dark:border-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-350"
                                            >
                                              {skill.trim()}
                                            </span>
                                          ))}
                                          {alumnus.skills.split(",").length > 3 && (
                                            <span className="text-[9px] font-semibold text-slate-400 pt-0.5 pl-0.5">
                                              +{alumnus.skills.split(",").length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-slate-400 italic">No skills listed</span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                      <div className="inline-flex items-center gap-2">
                                        {alumnus.username && (
                                          <a
                                            href={`/student/${alumnus.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1"
                                            title="Inspect public profile site"
                                          >
                                            <Eye className="h-3 w-3" /> Profile
                                          </a>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>
      )}
    </motion.div>
  );
}
