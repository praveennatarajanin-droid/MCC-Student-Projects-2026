"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, UserCheck, Eye, Loader2, CheckCircle2, AlertCircle, RefreshCw, ClipboardList, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface PendingStudent {
  id: string;
  name: string;
  email: string;
  gender: string;
  department: string;
  username: string;
  bio: string;
  skills: string;
  profileImageUrl: string;
  phone: string;
  personalStory: string;
  sop: string;
  gitHubUsername: string;
  academicRecordsCount: number;
}

const getCompleteness = (s: PendingStudent) => {
  const items = [
    { label: "Photo", done: !!s.profileImageUrl },
    { label: "Phone", done: !!s.phone },
    { label: "Tagline", done: !!s.bio },
    { label: "Skills", done: s.skills.split(",").filter(Boolean).length >= 3 },
    { label: "Story", done: !!s.personalStory },
    { label: "SOP", done: !!s.sop },
    { label: "Academics", done: s.academicRecordsCount > 0 },
    { label: "GitHub", done: !!s.gitHubUsername }
  ];
  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  return { items, done, pct };
};

export default function ApprovalsQueuePage() {
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  async function fetchPendingStudents() {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const data = await apiRequest("/api/admin/pending");
      setStudents(data);
    } catch (err: any) {
      setMessage({ text: "Failed to retrieve the approvals queue list.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (studentId: string) => {
    const confirmApprove = window.confirm("Are you sure you want to approve this student's profile? Click OK to approve or Cancel.");
    if (!confirmApprove) return;

    setProcessingId(studentId);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/admin/approve/${studentId}`, { method: "POST" });
      setStudents(students.filter(s => s.id !== studentId));
      setMessage({ text: "Student portfolio verified and published to recruiters live registry!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to approve student profile.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
        <p className="text-slate-500 text-sm">Retrieving pending approvals roster...</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Approvals Registry</h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm">Inspect submitted student dossiers and verify their portfolios for corporate recruiter visibility.</p>
        </div>
        <button
          onClick={fetchPendingStudents}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          title="Refresh Queue"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
          message.type === "success" 
            ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {students.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed rounded-3xl glass-panel">
          <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-3 animate-pulse" />
          <h3 className="font-bold text-base text-foreground">Approvals Queue is Clear</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            All submitted Madras Christian College student portfolios have been audited and live-published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {students.map(student => {
            const completeness = getCompleteness(student);
            return (
              <div key={student.id} className="glass-panel p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-mcc-gold transition-all duration-300">
              
              <div className="space-y-3 max-w-2xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold px-2.5 py-0.5 bg-mcc-crimson/10 dark:bg-mcc-gold/10 rounded-full">
                    {student.department}
                  </span>
                  
                  <h3 className="font-extrabold text-base mt-2 text-foreground">{student.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{student.email} • Gender: {student.gender}</p>
                </div>

                {student.bio ? (
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed italic truncate">
                    &ldquo;{student.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed italic">No bio inputted yet.</p>
                )}

                {student.skills && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {student.skills.split(",").slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="text-[9px] font-bold px-2 py-0.5 bg-slate-600 text-white dark:bg-slate-800 dark:text-slate-200 rounded-md border-none">
                        {skill.trim()}
                      </span>
                    ))}
                    {student.skills.split(",").length > 5 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 text-slate-400">
                        +{student.skills.split(",").length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Dossier Completeness Audit */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" /> Dossier Audit
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      completeness.pct >= 80 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {completeness.pct}% Completed ({completeness.done}/8)
                    </span>
                  </div>
                  
                  {/* Visual Audit Grid */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {completeness.items.map((item, idx) => (
                      <span
                        key={idx}
                        className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                          item.done 
                            ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400" 
                            : "bg-slate-100/50 border-slate-200 dark:bg-slate-800/20 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                        }`}
                        title={`${item.label}: ${item.done ? "Complete" : "Incomplete"}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.done ? "bg-green-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Operations */}
              <div className="flex items-center gap-3 shrink-0 w-full md:w-auto pt-4 border-t border-slate-100 dark:border-slate-800 md:pt-0 md:border-t-0">
                {/* Inspect Link (view public link directly, even though pending it can show in admin context or bypass) */}
                <Link
                  href={`/student/${student.username}`}
                  target="_blank"
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  <Eye className="h-4 w-4" /> Inspect Dossier
                </Link>

                {/* Approve Button */}
                <button
                  onClick={() => handleApprove(student.id)}
                  disabled={processingId === student.id}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl btn-premium text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {processingId === student.id ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" /> Approve & Publish
                    </>
                  )}
                </button>
              </div>

            </div>
          )})}
        </div>
      )}
    </motion.div>
  );
}
