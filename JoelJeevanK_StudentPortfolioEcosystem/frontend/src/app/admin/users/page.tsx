"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, GraduationCap, BookUser, Trash2, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, RefreshCw, Search, Building2, UserX, Award, Layers, Activity, Microscope, Plus, X, Phone, Mail, User, Eye, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/utils/api";

const DEPARTMENTS = [
  "Computer Science",
  "Computer Applications (BCA)",
  "Commerce (B.Com)",
  "Business Administration (BBA)",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English Literature",
  "Economics",
  "History",
  "Visual Communication"
];

interface UserRecord {
  id: string;
  name: string;
  email: string;
  gender: string;
  department: string;
  role: string;
  username: string;
  isApproved: boolean;
  isBlocked: boolean;
  title?: string;
  phone?: string;
  academicRecordsCount: number;
  certificationsCount: number;
  activitiesCount: number;
  projectsCount: number;
  researchInnovationsCount: number;
}

interface CredentialSet {
  academicRecords: any[];
  certifications: any[];
  activities: any[];
  projects: any[];
  researchInnovations: any[];
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, CredentialSet>>({});
  const [loadingCreds, setLoadingCreds] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deletingCred, setDeletingCred] = useState<string | null>(null);
  const [disapprovingId, setDisapprovingId] = useState<string | null>(null);

  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");

  const handleToggleBlock = async (user: UserRecord) => {
    if (!confirm(`Are you sure you want to ${user.isBlocked ? "unblock" : "block"} student "${user.name}"?`)) return;
    setBlockingId(user.id);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiRequest(`/api/admin/users/${user.id}/toggle-block`, { method: "POST" });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isBlocked: res.isBlocked } : u));
      setMessage({ text: res.message, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to toggle block status.", type: "error" });
    } finally {
      setBlockingId(null);
    }
  };

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "");
    fetchUsers();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  async function fetchUsers() {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const data = await apiRequest("/api/admin/users");
      setUsers(data);
    } catch {
      setMessage({ text: "Failed to load users.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const loadCredentials = async (userId: string) => {
    setLoadingCreds(userId);
    try {
      const data = await apiRequest(`/api/admin/users/${userId}/credentials`);
      setCredentials(prev => ({ ...prev, [userId]: data }));
    } catch {
      setMessage({ text: "Failed to load credentials.", type: "error" });
    } finally {
      setLoadingCreds(null);
    }
  };

  const toggleExpand = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      await loadCredentials(userId);
    }
  };

  const deleteUser = async (user: UserRecord) => {
    if (!confirm(`Delete user "${user.name}" and ALL their data? This cannot be undone.`)) return;
    setDeletingUser(user.id);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/admin/users/${user.id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setMessage({ text: `User "${user.name}" deleted successfully.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete user.", type: "error" });
    } finally {
      setDeletingUser(null);
    }
  };

  const handleDisapprove = async (user: UserRecord) => {
    const confirmDisapprove = window.confirm(`Are you sure you want to disapprove student "${user.name}"'s portfolio and send it back to the approvals registry queue?`);
    if (!confirmDisapprove) return;

    setDisapprovingId(user.id);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/admin/reject/${user.id}`, { method: "POST" });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isApproved: false } : u));
      setMessage({ text: `Student "${user.name}"'s portfolio disapproved. It has been moved back to the approvals registry queue.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to disapprove student portfolio.", type: "error" });
    } finally {
      setDisapprovingId(null);
    }
  };

  const deleteCredential = async (userId: string, type: string, id: string, label: string) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingCred(id);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/admin/credentials/${type}/${id}`, { method: "DELETE" });
      // Refresh credential set
      const updated = await apiRequest(`/api/admin/users/${userId}/credentials`);
      setCredentials(prev => ({ ...prev, [userId]: updated }));
      // Update user counts
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        const delta: Partial<UserRecord> = {};
        if (type === "academic") delta.academicRecordsCount = u.academicRecordsCount - 1;
        if (type === "certification") delta.certificationsCount = u.certificationsCount - 1;
        if (type === "activity") delta.activitiesCount = u.activitiesCount - 1;
        if (type === "project") delta.projectsCount = u.projectsCount - 1;
        if (type === "researchinnovation") delta.researchInnovationsCount = u.researchInnovationsCount - 1;
        return { ...u, ...delta };
      }));
      setMessage({ text: `Credential deleted successfully.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete credential.", type: "error" });
    } finally {
      setDeletingCred(null);
    }
  };

  // Derived values
  const departments = ["All", ...Array.from(new Set(users.map(u => u.department))).sort()];
  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || u.department === deptFilter;
    return matchSearch && matchDept;
  });

  // Group by department for department view
  const groupedByDept = filtered.reduce<Record<string, UserRecord[]>>((acc, u) => {
    if (!acc[u.department]) acc[u.department] = [];
    acc[u.department].push(u);
    return acc;
  }, {});

  const credIconMap: Record<string, { icon: any; color: string; type: string }> = {
    academicRecords: { icon: GraduationCap, color: "text-blue-500", type: "academic" },
    certifications: { icon: Award, color: "text-amber-500", type: "certification" },
    activities: { icon: Activity, color: "text-purple-500", type: "activity" },
    projects: { icon: Layers, color: "text-green-500", type: "project" },
    researchInnovations: { icon: Microscope, color: "text-pink-500", type: "researchinnovation" },
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
      <p className="text-slate-500 text-sm">Loading user registry...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Users className="h-6 w-6 text-mcc-crimson dark:text-mcc-gold" /> Student Registry
          </h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm mt-1">Manage student portfolios. View credentials, change approval status, block access, or delete records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: users.length, icon: Users, color: "text-mcc-crimson dark:text-mcc-gold", bg: "bg-mcc-crimson/10 dark:bg-mcc-gold/10" },
          { label: "Approved Portfolios", value: users.filter(u => u.isApproved).length, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Pending Review", value: users.filter(u => !u.isApproved).length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Placement Ready", value: users.filter(u => u.isApproved && u.projectsCount > 0 && u.certificationsCount > 0).length, icon: Award, color: "text-purple-600", bg: "bg-purple-500/10" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-4 rounded-2xl border">
              <div className={`p-2 rounded-xl w-fit mb-2 ${stat.bg}`}><Icon className={`h-5 w-5 ${stat.color}`} /></div>
              <p className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by name, email or department..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" />
        </div>

        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none cursor-pointer">
          {departments.map(d => (
            <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      {/* Department Groups */}
      {Object.keys(groupedByDept).length === 0 ? (
        <div className="p-10 text-center border border-dashed rounded-3xl text-slate-500 glass-panel">
          <UserX className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No users found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDept).sort(([a], [b]) => a.localeCompare(b)).map(([dept, deptUsers]) => (
            <div key={dept} className="glass-panel rounded-3xl border overflow-hidden">
              {/* Dept header */}
              <div className="px-6 py-4 bg-mcc-crimson/5 dark:bg-mcc-gold/5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-mcc-crimson dark:text-mcc-gold" />
                  <span className="font-bold text-sm text-mcc-crimson dark:text-mcc-gold">{dept}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full registry-badge">
                    {deptUsers.length} student{deptUsers.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Users in dept */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {deptUsers.map(user => (
                  <div key={user.id}>
                    {/* User row */}
                    <div className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Avatar letter */}
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-mcc-crimson/10 text-mcc-crimson dark:bg-mcc-gold/10 dark:text-mcc-gold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{user.name}</span>
                          {user.isApproved && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              ✓ Approved
                            </span>
                          )}
                          {user.isBlocked && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                              Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {user.email} {user.phone && ` · ${user.phone}`}
                        </p>
                        {/* Mini credential counts */}
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {[
                            { count: user.academicRecordsCount, label: "academic", icon: GraduationCap },
                            { count: user.certificationsCount, label: "certs", icon: Award },
                            { count: user.activitiesCount, label: "activities", icon: Activity },
                            { count: user.projectsCount, label: "projects", icon: Layers },
                            { count: user.researchInnovationsCount, label: "research", icon: Microscope },
                          ].filter(c => c.count > 0).map((c, i) => {
                            const Icon = c.icon;
                            return (
                              <span key={i} className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md registry-badge">
                                <Icon className="h-2.5 w-2.5" />{c.count} {c.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {user.role === "Student" && user.isApproved && (
                          <button
                            onClick={() => handleDisapprove(user)}
                            disabled={disapprovingId === user.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer disabled:opacity-50"
                            title="Disapprove portfolio & return to approvals queue"
                          >
                            {disapprovingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Disapprove
                          </button>
                        )}
                        {user.role === "Student" && (
                          <Link
                            href={`/student/${user.username}`}
                            target="_blank"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                            title="View student public portfolio site"
                          >
                            <Eye className="h-3 w-3" /> Public Site
                          </Link>
                        )}
                        <button
                          onClick={() => handleToggleBlock(user)}
                          disabled={blockingId === user.id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${user.isBlocked ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/20"}`}
                          title={user.isBlocked ? "Unblock student" : "Block student"}
                        >
                          {blockingId === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          onClick={() => toggleExpand(user.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        >
                          {loadingCreds === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : expandedUser === user.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {expandedUser === user.id ? "Hide" : "Credentials"}
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          disabled={deletingUser === user.id}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete user account"
                        >
                          {deletingUser === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Credentials Drawer */}
                    <AnimatePresence>
                      {expandedUser === user.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 py-5 bg-slate-300/10 dark:bg-slate-900/40 border-t border-slate-300/30 dark:border-slate-800">
                            {credentials[user.id] ? (
                              <div className="space-y-4">
                                {(["academicRecords", "certifications", "activities", "projects", "researchInnovations"] as const).map((key) => {
                                  const items = credentials[user.id][key];
                                  if (!items || items.length === 0) return null;
                                  const info = credIconMap[key];
                                  const Icon = info.icon;
                                  const labels: Record<string, string> = {
                                    academicRecords: "Academic Records",
                                    certifications: "Certifications",
                                    activities: "NGO & Activities",
                                    projects: "Projects",
                                    researchInnovations: "Research & Innovation",
                                  };
                                  const getLabel = (item: any) =>
                                    item.degree || item.name || item.title || "Record";

                                  return (
                                    <div key={key}>
                                      <h5 className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2 ${info.color}`}>
                                        <Icon className="h-3.5 w-3.5" />{labels[key]} ({items.length})
                                      </h5>
                                      <div className="space-y-1.5">
                                        {items.map((item: any) => (
                                          <div key={item.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 group shadow-sm">
                                            <div className="min-w-0">
                                              <p className="text-xs font-semibold truncate">{getLabel(item)}</p>
                                              {(item.institution || item.issuingOrganization || item.organization || item.type) && (
                                                <p className="text-[10px] text-slate-400 truncate">{item.institution || item.issuingOrganization || item.organization || item.type}</p>
                                              )}
                                            </div>
                                            <button
                                              onClick={() => deleteCredential(user.id, info.type, item.id, getLabel(item))}
                                              disabled={deletingCred === item.id}
                                              className="ml-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                              title="Delete this credential"
                                            >
                                              {deletingCred === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}

                                {Object.values(credentials[user.id]).every(arr => arr.length === 0) && (
                                  <p className="text-xs text-slate-400 text-center py-4 italic">This user has no credentials yet.</p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading credentials...
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}

    </motion.div>
  );
}
