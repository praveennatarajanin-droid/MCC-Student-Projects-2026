"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, Users, CheckSquare, Sparkles, Loader2, AlertCircle, RefreshCw, Milestone, Award, Code2, Microscope, Activity, Flame, GraduationCap, Clock, Download } from "lucide-react";
import { jsPDF } from "jspdf";
const Github = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
import { motion } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface CompletionMetrics {
  profiles: number;
  academics: number;
  certifications: number;
  projects: number;
}

interface DeptPerformance {
  department: string;
  studentCount: number;
  approvedCount: number;
  projectsCount: number;
  certificationsCount: number;
  researchCount: number;
  averageProjects: number;
  averageCertifications: number;
  averageResearch: number;
  averageCompletion: number;
}

interface SkillAnalytic {
  skill: string;
  count: number;
}

interface ResearchTypeCount {
  type: string;
  count: number;
}

interface PlacementReadiness {
  ready: number;
  notReady: number;
  readyPercentage: number;
  details: {
    hodApproved: number;
    githubLinked: number;
    projectVetted: number;
    certificationVetted: number;
  };
}

interface EngagementTimelineEvent {
  studentName: string;
  activityType: string;
  detail: string;
  dateStr: string;
}

interface StudentEngagement {
  totalActivities: number;
  averageChecklistScore: number;
  recentTimeline: EngagementTimelineEvent[];
}

interface CompletionDistribution {
  low: number;
  medium: number;
  high: number;
}

interface AnalyticsData {
  totalStudents: number;
  approvedStudents: number;
  pendingStudents: number;
  averageCompletionRate: number;
  completionDistribution: CompletionDistribution;
  completionMetrics: CompletionMetrics;
  departmentPerformance: DeptPerformance[];
  skillAnalytics: SkillAnalytic[];
  researchActivity: ResearchTypeCount[];
  placementReadiness: PlacementReadiness;
  studentEngagement: StudentEngagement;
}

const RESEARCH_LABELS: Record<string, string> = {
  ResearchPaper: "Research Paper",
  InnovationProject: "Innovation Project",
  Prototype: "Prototype",
  ConferencePresentation: "Conference Presentation",
  ScienceFair: "Science Fair",
  StartupIdea: "Startup Idea"
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let rAFId: number;
    const end = value;
    if (end === 0) {
      setCurrent(0);
      return;
    }

    const duration = 1000; // 1 second duration
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease out: extremely smooth slow-down at the end
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const nextValue = Math.floor(easeProgress * end);
      setCurrent(nextValue);

      if (progress < 1) {
        rAFId = requestAnimationFrame(animate);
      } else {
        setCurrent(end);
      }
    };

    rAFId = requestAnimationFrame(animate);

    return () => {
      if (rAFId) {
        cancelAnimationFrame(rAFId);
      }
    };
  }, [value]);

  return <>{current}{suffix}</>;
}

export default function InstitutionalAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/api/admin/analytics");
      setData(result);
    } catch (err: any) {
      setError("Failed to retrieve institutional statistics.");
    } finally {
      setLoading(false);
    }
  }

  const downloadDepartmentAnalyticsPDF = () => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Institution Branding Header
    doc.setFillColor(122, 28, 28); // MCC Crimson (RGB: 122, 28, 28)
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MADRAS CHRISTIAN COLLEGE (AUTONOMOUS)", pageWidth / 2, 16, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Tambaram, Chennai, Tamil Nadu - 600059", pageWidth / 2, 22, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INSTITUTIONAL PORTFOLIO REGISTRY & ANALYTICS REPORT", pageWidth / 2, 29, { align: "center" });

    // Accent line (MCC Gold - #d4af37 => RGB: 212, 175, 55)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.line(0, 40, pageWidth, 40);

    // Section 1: Overview Summary
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Institutional Summary Stats", 15, 52);

    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.rect(15, 56, pageWidth - 30, 24);

    // Overview Stats text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Total Registered Students:  ${data.totalStudents}`, 20, 63);
    doc.text(`Approved Portfolios:           ${data.approvedStudents} (Pending: ${data.pendingStudents})`, 20, 70);
    doc.text(`Average Completion Rate:   ${data.averageCompletionRate}%`, 20, 76);

    doc.text(`Placement Vetted Rate:      ${data.placementReadiness.readyPercentage}%`, 115, 63);
    doc.text(`Placement Vetted Count:     ${data.placementReadiness.ready} students`, 115, 70);
    doc.text(`Average Checklist Score:    ${data.studentEngagement.averageChecklistScore} / 8.0 items`, 115, 76);

    // Section 2: Department Performance Matrix Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Department Performance Summary Matrix", 15, 92);

    // Draw Table Header
    let y = 98;
    doc.setFillColor(122, 28, 28); // Crimson header row background
    doc.rect(15, y, pageWidth - 30, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    
    // Header Columns
    doc.text("Department", 18, y + 5.5);
    doc.text("Students", 95, y + 5.5, { align: "center" });
    doc.text("Approved", 115, y + 5.5, { align: "center" });
    doc.text("Avg Projects", 138, y + 5.5, { align: "center" });
    doc.text("Avg Certs", 160, y + 5.5, { align: "center" });
    doc.text("Completeness", 182, y + 5.5, { align: "center" });

    // Draw Rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    y += 8;

    data.departmentPerformance.forEach((dept, index) => {
      // Row Background alternating colors for readability
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252); // Slate-50 alternating row background
        doc.rect(15, y, pageWidth - 30, 8, "F");
      }
      
      // Horizontal cell line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, y + 8, pageWidth - 15, y + 8);

      // Row Data
      doc.setFont("helvetica", "bold");
      doc.text(dept.department, 18, y + 5.5);
      
      doc.setFont("helvetica", "normal");
      doc.text(String(dept.studentCount), 95, y + 5.5, { align: "center" });
      doc.text(String(dept.approvedCount), 115, y + 5.5, { align: "center" });
      doc.text(String(dept.averageProjects), 138, y + 5.5, { align: "center" });
      doc.text(String(dept.averageCertifications), 160, y + 5.5, { align: "center" });
      doc.text(`${dept.averageCompletion}%`, 182, y + 5.5, { align: "center" });

      y += 8;
      
      // Page break check if table overflows
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    });

    // Draw table border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(15, 98, pageWidth - 30, y - 98);

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    const today = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    doc.text(`Report Generated On: ${today}`, 15, pageHeight - 10);
    doc.text("MCC Portfolio Registry Management System • Confidential Institutional Data", pageWidth - 15, pageHeight - 10, { align: "right" });

    // Download PDF
    const filename = `MCC_Department_Analytics_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  };

  const downloadSingleDepartmentPDF = (dept: DeptPerformance) => {
    if (!data) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Institution Branding Header
    doc.setFillColor(122, 28, 28); // MCC Crimson (RGB: 122, 28, 28)
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("MADRAS CHRISTIAN COLLEGE (AUTONOMOUS)", pageWidth / 2, 16, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Tambaram, Chennai, Tamil Nadu - 600059", pageWidth / 2, 22, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DEPARTMENTAL PERFORMANCE DATA SHEET", pageWidth / 2, 29, { align: "center" });

    // Accent line (MCC Gold - #d4af37 => RGB: 212, 175, 55)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.line(0, 40, pageWidth, 40);

    // Title & Department
    doc.setTextColor(122, 28, 28); // MCC Crimson
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${dept.department.toUpperCase()} DEPARTMENT`, 15, 52);

    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Departmental Performance Analysis & Metrics`, 15, 58);

    // Section 1: Overview Dashboard (Boxed Card)
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setFillColor(248, 250, 252); // Slate-50 background
    doc.rect(15, 64, pageWidth - 30, 32, "FD");

    // Box labels & content
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Departmental Overview", 20, 71);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text("Total Students Enrolled:", 20, 78);
    doc.setFont("helvetica", "bold");
    doc.text(String(dept.studentCount), 70, 78);

    const pendingCount = dept.studentCount - dept.approvedCount;
    const approvalRate = dept.studentCount > 0 ? Math.round((dept.approvedCount / dept.studentCount) * 100) : 0;

    doc.setFont("helvetica", "normal");
    doc.text("Approved Portfolios:", 20, 84);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74); // Green-600
    doc.text(`${dept.approvedCount} (${approvalRate}%)`, 70, 84);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Pending Vetting:", 20, 90);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text(String(pendingCount), 70, 90);

    // Side columns inside card
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Avg Completion Score:", 115, 78);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(122, 28, 28);
    doc.text(`${dept.averageCompletion}%`, 165, 78);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("Vetting Status:", 115, 84);
    doc.setFont("helvetica", "bold");
    if (approvalRate >= 80) {
      doc.setTextColor(22, 163, 74);
      doc.text("EXCELLENT", 165, 84);
    } else if (approvalRate >= 50) {
      doc.setTextColor(217, 119, 6); // Amber-600
      doc.text("SATISFACTORY", 165, 84);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text("NEEDS ATTENTION", 165, 84);
    }

    // Section 2: Engagement Indicators & Averages
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text("Student Engagement & Portfolio Accomplishments", 15, 110);

    // Beautiful metric grid cards for Projects, Certifications, Research
    const colWidth = (pageWidth - 30) / 3;

    // Card 1: Projects
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.rect(15, 116, colWidth - 4, 30, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(122, 28, 28); // Crimson
    doc.text(String(dept.averageProjects), 15 + (colWidth - 4) / 2, 128, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("AVG PROJECTS", 15 + (colWidth - 4) / 2, 136, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Total: ${dept.projectsCount} Projects`, 15 + (colWidth - 4) / 2, 141, { align: "center" });

    // Card 2: Certifications
    doc.rect(15 + colWidth + 2, 116, colWidth - 4, 30, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55); // Gold
    doc.text(String(dept.averageCertifications), 15 + colWidth + 2 + (colWidth - 4) / 2, 128, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("AVG CERTIFICATIONS", 15 + colWidth + 2 + (colWidth - 4) / 2, 136, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Total: ${dept.certificationsCount} Certs`, 15 + colWidth + 2 + (colWidth - 4) / 2, 141, { align: "center" });

    // Card 3: Research
    doc.rect(15 + colWidth * 2 + 4, 116, colWidth - 4, 30, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(String(dept.averageResearch), 15 + colWidth * 2 + 4 + (colWidth - 4) / 2, 128, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("AVG RESEARCH PAPERS", 15 + colWidth * 2 + 4 + (colWidth - 4) / 2, 136, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Total: ${dept.researchCount} Publications`, 15 + colWidth * 2 + 4 + (colWidth - 4) / 2, 141, { align: "center" });

    // Section 3: Completeness Gauge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text("Portfolio Dossier Completeness Rate", 15, 160);

    // Background bar
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 166, pageWidth - 30, 8, "F");
    // Fill bar
    const gaugeFillWidth = (pageWidth - 30) * (dept.averageCompletion / 100);
    doc.setFillColor(122, 28, 28);
    doc.rect(15, 166, gaugeFillWidth, 8, "F");

    // Completeness rate label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(122, 28, 28);
    doc.text(`${dept.averageCompletion}% Complete`, 15 + gaugeFillWidth + 2 > pageWidth - 45 ? pageWidth - 45 : 15 + gaugeFillWidth + 2, 172);

    // Section 4: Benchmarking against institution
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text("Institutional Benchmarking", 15, 190);

    const instAverage = data.averageCompletionRate;
    const deviation = dept.averageCompletion - instAverage;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Comparing this department's completion average with the overall institutional average:", 15, 196);

    // Benchmarking bar chart
    // Department Bar
    doc.setFillColor(122, 28, 28); // Crimson
    doc.rect(45, 204, (pageWidth - 70) * (dept.averageCompletion / 100), 5, "F");
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Dept", 15, 208);
    doc.text(`${dept.averageCompletion}%`, 15 + (pageWidth - 70) * (dept.averageCompletion / 100) + 32, 208);

    // Institutional Average Bar
    doc.setFillColor(212, 175, 55); // Gold
    doc.rect(45, 214, (pageWidth - 70) * (instAverage / 100), 5, "F");
    doc.text("Institution", 15, 218);
    doc.text(`${instAverage}%`, 15 + (pageWidth - 70) * (instAverage / 100) + 32, 218);

    // Deviation statement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    if (deviation >= 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`+ This department is performing ${deviation.toFixed(1)}% HIGHER than the institutional average.`, 15, 230);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text(`- This department is performing ${Math.abs(deviation).toFixed(1)}% LOWER than the institutional average.`, 15, 230);
    }

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const formattedToday = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    doc.text(`Report Generated On: ${formattedToday}`, 15, pageHeight - 10);
    doc.text("MCC Portfolio Registry Management System • Confidential", pageWidth - 15, pageHeight - 10, { align: "right" });

    const singleFilename = `MCC_${dept.department.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(singleFilename);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
        <p className="text-slate-500 text-sm">Computing analytical graphs and performance metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-slate-500 border border-dashed rounded-3xl glass-panel">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-bold text-base text-foreground">Analytics Not Available</h3>
        <p className="text-xs text-slate-400 mt-1">{error || "Failed to load graphs."}</p>
        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 text-xs font-bold btn-premium rounded-xl cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  // Segment Completion Metrics
  const completionData = [
    { name: "Bio & SOP", percentage: data.completionMetrics.profiles },
    { name: "Academics", percentage: data.completionMetrics.academics },
    { name: "Certifications", percentage: data.completionMetrics.certifications },
    { name: "Projects", percentage: data.completionMetrics.projects }
  ];

  // Completion distribution donut
  const distData = [
    { name: "Complete (80-100%)", value: data.completionDistribution.high },
    { name: "Medium (50-79%)", value: data.completionDistribution.medium },
    { name: "Low (0-49%)", value: data.completionDistribution.low }
  ].filter(d => d.value > 0);

  const DIST_COLORS = ["#22c55e", "#eab308", "#ef4444"]; // Green, Yellow, Red

  // Skill analytics horizontal chart data
  const skillChartData = data.skillAnalytics.map(s => ({
    name: s.skill,
    count: s.count
  }));

  // Research activity breakdown
  const researchChartData = data.researchActivity.map(r => ({
    name: RESEARCH_LABELS[r.type] || r.type,
    count: r.count
  })).filter(r => r.count > 0);

  // Placement Donut chart data
  const placementData = [
    { name: "Placement Ready", value: data.placementReadiness.ready },
    { name: "Incomplete Dossier", value: data.placementReadiness.notReady }
  ];

  const PLACEMENT_COLORS = ["#7a1c1c", "#94a3b8"]; // MCC Crimson vs Slate Grey

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Institutional Analytics</h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm">Real-time indicators monitoring candidate records, department metrics, and HOD vetting milestones.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Ratios Metrics Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-3xl border text-left">
          <div className="p-3 bg-mcc-crimson/10 text-mcc-crimson dark:bg-mcc-gold/10 dark:text-mcc-gold rounded-xl w-fit mb-4">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Registered</p>
          <h3 className="text-2xl font-extrabold mt-1 text-foreground"><AnimatedNumber value={data.totalStudents} /></h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Candidates logged in database</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border text-left">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl w-fit mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Avg Completion Rate</p>
          <h3 className="text-2xl font-extrabold mt-1 text-foreground"><AnimatedNumber value={data.averageCompletionRate} suffix="%" /></h3>
          <span className="text-[10px] text-green-500 font-semibold mt-1 block">
            Avg Score: {data.studentEngagement.averageChecklistScore} / 8.0 items
          </span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border text-left">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl w-fit mb-4">
            <Award className="h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Placement Vetted</p>
          <h3 className="text-2xl font-extrabold mt-1 text-foreground"><AnimatedNumber value={data.placementReadiness.ready} /></h3>
          <span className="text-[10px] text-slate-400 mt-1 block">{data.placementReadiness.readyPercentage}% ready for placements</span>
        </div>

        <div className="glass-panel p-6 rounded-3xl border text-left">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl w-fit mb-4">
            <Flame className="h-6 w-6" />
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Engagement Index</p>
          <h3 className="text-2xl font-extrabold mt-1 text-foreground"><AnimatedNumber value={data.studentEngagement.totalActivities} /></h3>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
            Logged Hobbies &amp; NGO events
          </span>
        </div>
      </div>

      {/* Row 2: Portfolio Completeness Rates & Skill Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Completion Rates */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <BarChart3 className="h-5 w-5" /> Portfolio Completeness Rates (%)
            </h3>
            <p className="text-xs text-slate-400">Average percentage of students who have completed key segments of their profile dossiers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Completion segments bar chart */}
            <div className="h-52 md:col-span-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.6)" fontSize={10} />
                  <YAxis stroke="rgba(148, 163, 184, 0.6)" fontSize={10} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'rgba(122, 28, 28, 0.03)' }} />
                  <Bar dataKey="percentage" fill="#7a1c1c" radius={[6, 6, 0, 0]}>
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#7a1c1c" : "#d4af37"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution donut */}
            <div className="flex flex-col items-center justify-center">
              <div className="h-32 w-full relative flex items-center justify-center">
                {distData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {distData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DIST_COLORS[index % DIST_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[10px] text-slate-500">No score records</p>
                )}
                <div className="absolute text-center">
                  <span className="text-xs font-black block">{data.averageCompletionRate}%</span>
                  <span className="text-[7px] uppercase text-slate-400 font-bold">Avg Score</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[10px] font-semibold mt-2 w-full px-2">
                <div className="flex items-center justify-between text-green-500">
                  <span>High (80%+)</span>
                  <span>{data.completionDistribution.high} std</span>
                </div>
                <div className="flex items-center justify-between text-yellow-500">
                  <span>Medium (50-79%)</span>
                  <span>{data.completionDistribution.medium} std</span>
                </div>
                <div className="flex items-center justify-between text-red-500">
                  <span>Low (0-49%)</span>
                  <span>{data.completionDistribution.low} std</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Analytics */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Code2 className="h-5 w-5" /> Skill Analytics (Top 5)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Aggregated core competencies parsed from student profiles.</p>
          </div>

          <div className="h-52 mt-4">
            {skillChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillChartData.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis type="number" stroke="rgba(148, 163, 184, 0.6)" fontSize={9} />
                  <YAxis dataKey="name" type="category" stroke="rgba(148, 163, 184, 0.6)" fontSize={9} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d4af37" radius={[0, 6, 6, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 italic">No skills listed yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Placement Readiness & Research break downs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Placement Vetting Details */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between gap-6">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <CheckSquare className="h-5 w-5" /> Placement Readiness Indicators
            </h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of student dossier metrics that lead to active recruiter matching.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Progress indicators */}
            <div className="space-y-3.5 text-xs">
              {[
                { label: "Approved by HOD", val: data.placementReadiness.details.hodApproved, icon: GraduationCap, color: "bg-emerald-500" },
                { label: "GitHub Account Linked", val: data.placementReadiness.details.githubLinked, icon: Github, color: "bg-blue-500" },
                { label: "1+ Project Completed", val: data.placementReadiness.details.projectVetted, icon: Code2, color: "bg-amber-500" },
                { label: "1+ Certification Uploaded", val: data.placementReadiness.details.certificationVetted, icon: Award, color: "bg-purple-500" }
              ].map((item, index) => {
                const Icon = item.icon;
                const pct = data.totalStudents > 0 ? Math.round((item.val / data.totalStudents) * 100) : 0;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Icon className="h-3.5 w-3.5" /> {item.label}
                      </span>
                      <span className="font-extrabold">{item.val} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Placement readiness donut */}
            <div className="flex flex-col items-center">
              <div className="h-32 w-full relative flex items-center justify-center">
                {data.totalStudents > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={placementData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {placementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLACEMENT_COLORS[index % PLACEMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-500">No data</p>
                )}
                <div className="absolute text-center">
                  <span className="text-lg font-black block">{data.placementReadiness.readyPercentage}%</span>
                  <span className="text-[7px] uppercase font-bold text-slate-400">Vetted Rate</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-[9px] font-bold mt-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-mcc-crimson block"></span> Vetted ({data.placementReadiness.ready})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400 block"></span> Incomplete ({data.placementReadiness.notReady})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Research Activity breakdown */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Microscope className="h-5 w-5" /> Research &amp; Innovation Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of recorded science papers, prototypes, startup ideas, and event presentation metrics.</p>
          </div>

          <div className="h-56 mt-4">
            {researchChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={researchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.6)" fontSize={8.5} interval={0} />
                  <YAxis stroke="rgba(148, 163, 184, 0.6)" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7a1c1c" radius={[6, 6, 0, 0]} barSize={24}>
                    {researchChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#7a1c1c", "#d4af37", "#3b82f6", "#a855f7", "#ec4899", "#f97316"][index % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 italic">No research activities logged.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Department Performance Matrix Table & Student Engagement Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Department summaries (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Milestone className="h-5 w-5" /> Department Performance Summary Matrix
            </h3>
            <button
              onClick={downloadDepartmentAnalyticsPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all cursor-pointer shadow-sm shrink-0"
              title="Download Department-wise Report as PDF"
            >
              <Download className="h-4 w-4" /> Download Report
            </button>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar-x">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-white font-bold border-b border-slate-100 dark:border-slate-800" style={{ backgroundColor: "rgb(29, 41, 61)" }}>
                <tr>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5 text-center">Students</th>
                  <th className="px-5 py-3.5 text-center">Approved</th>
                  <th className="px-5 py-3.5 text-center">Avg Projects</th>
                  <th className="px-5 py-3.5 text-center">Avg Certs</th>
                  <th className="px-5 py-3.5 text-center">Dossier Completeness</th>
                  <th className="px-5 py-3.5 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {data.departmentPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-6 text-center text-slate-500">
                      No department aggregates populated yet.
                    </td>
                  </tr>
                ) : (
                  data.departmentPerformance.map((dept, index) => (
                    <tr key={index} className="hover:bg-slate-100/30 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4 font-bold">{dept.department}</td>
                      <td className="px-5 py-4 text-center">{dept.studentCount}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-green-500/10 text-green-600 dark:text-green-400">
                          {dept.approvedCount} approved
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-mcc-crimson dark:text-mcc-gold">{dept.averageProjects}</td>
                      <td className="px-5 py-4 text-center font-semibold text-purple-600 dark:text-purple-400">{dept.averageCertifications}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-mcc-crimson dark:bg-mcc-gold" style={{ width: `${dept.averageCompletion}%` }} />
                          </div>
                          <span className="font-bold text-[10px] text-slate-400">{dept.averageCompletion}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => downloadSingleDepartmentPDF(dept)}
                          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-mcc-crimson dark:text-mcc-gold transition-colors inline-flex items-center justify-center cursor-pointer shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                          title={`Download ${dept.department} Report`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Engagement timeline */}
        <div className="glass-panel p-6 rounded-3xl border flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Activity className="h-5 w-5" /> Recent Engagement Feed
            </h3>
            <p className="text-xs text-slate-400 mt-1">Live updates of student portfolio activities across the MCC network.</p>
          </div>

          <div className="mt-4 flex-grow space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar-y">
            {data.studentEngagement.recentTimeline.length > 0 ? (
              data.studentEngagement.recentTimeline.map((item, index) => (
                <div key={index} className="flex gap-2.5 text-[11px] items-start border-b border-slate-100 dark:border-slate-800/60 pb-2">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 shrink-0 mt-0.5">
                    {item.activityType.includes("Project") ? <Code2 className="h-3 w-3 text-amber-500" /> :
                     item.activityType.includes("Certification") ? <Award className="h-3 w-3 text-purple-500" /> :
                     item.activityType.includes("Research") ? <Microscope className="h-3 w-3 text-blue-500" /> :
                     <Activity className="h-3 w-3 text-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-grow space-y-0.5">
                    <p className="font-extrabold text-slate-700 dark:text-slate-300 truncate">{item.studentName}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold flex-wrap">
                      <span>{item.activityType}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="flex items-center gap-0.5 text-[9px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        {item.dateStr}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 truncate italic mt-0.5">&ldquo;{item.detail}&rdquo;</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500 italic py-10">No recent activities recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollbar styles */}
      <style>{`
        .custom-scrollbar-x::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-x::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-x::-webkit-scrollbar-thumb {
          background: rgba(122, 28, 28, 0.35);
          border-radius: 9999px;
        }
        .custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
          background: rgba(122, 28, 28, 0.7);
        }
        .dark .custom-scrollbar-x::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.35);
        }
        .dark .custom-scrollbar-x::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.7);
        }

        .custom-scrollbar-y::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-y::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-y::-webkit-scrollbar-thumb {
          background: rgba(122, 28, 28, 0.35);
          border-radius: 9999px;
        }
        .custom-scrollbar-y::-webkit-scrollbar-thumb:hover {
          background: rgba(122, 28, 28, 0.7);
        }
        .dark .custom-scrollbar-y::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.35);
        }
        .dark .custom-scrollbar-y::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.7);
        }

        /* Firefox support */
        .custom-scrollbar-x {
          scrollbar-width: thin;
          scrollbar-color: rgba(122, 28, 28, 0.35) transparent;
        }
        .dark .custom-scrollbar-x {
          scrollbar-color: rgba(212, 175, 55, 0.35) transparent;
        }
        .custom-scrollbar-y {
          scrollbar-width: thin;
          scrollbar-color: rgba(122, 28, 28, 0.35) transparent;
        }
        .dark .custom-scrollbar-y {
          scrollbar-color: rgba(212, 175, 55, 0.35) transparent;
        }
      `}</style>
    </motion.div>
  );
}
