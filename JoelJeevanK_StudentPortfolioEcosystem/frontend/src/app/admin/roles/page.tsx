"use client";

import { useEffect, useState } from "react";
import { Users, Lock, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, RefreshCw, Search, Building2, UserX, Shield, Phone, Mail, User, X, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/utils/api";

const FALLBACK_DEPARTMENTS = [
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

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  gender: string;
  department: string;
  role: string;
  username: string;
  isApproved: boolean;
  isBlocked: boolean;
  isSuperAdmin: boolean;
  title?: string;
  phone?: string;
  createdAt: string;
}

export default function RoleManagementPage() {
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    title: "",
    department: "",
    phone: "",
    email: "",
    gender: ""
  });
  const [registeringStaff, setRegisteringStaff] = useState(false);
  const [modalError, setModalError] = useState("");

  const [togglingBlockId, setTogglingBlockId] = useState<string | null>(null);
  const [togglingAdminId, setTogglingAdminId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchStaff();
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const data = await apiRequest("/api/admin/departments");
      if (Array.isArray(data) && data.length > 0) {
        setDepartments(data.map((d: any) => d.name));
        return;
      }
    } catch (err) {
      console.error("Failed to load departments in roles page:", err);
    }
    setDepartments(FALLBACK_DEPARTMENTS);
  }

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  async function fetchStaff() {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const data = await apiRequest("/api/admin/staff");
      setStaffList(data);
    } catch {
      setMessage({ text: "Failed to load staff list.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!staffForm.name || !staffForm.title || !staffForm.department || !staffForm.phone || !staffForm.email || !staffForm.gender) {
      setModalError("All fields are required.");
      return;
    }

    if (staffForm.name.trim().length < 2) {
      setModalError("Full Name must be at least 2 characters.");
      return;
    }

    const nameRegex = /^[A-Za-z\s.\-]+$/;
    if (!nameRegex.test(staffForm.name.trim())) {
      setModalError("Full Name can only contain letters, spaces, dots, and hyphens.");
      return;
    }

    if (staffForm.title.trim().length < 2) {
      setModalError("Title / Designation must be at least 2 characters.");
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
    if (!phoneRegex.test(staffForm.phone.trim())) {
      setModalError("Please enter a valid Phone Number (7 to 15 digits/symbols).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(staffForm.email.trim())) {
      setModalError("Please enter a valid Email Address (e.g. username@mcc.edu.in).");
      return;
    }

    setRegisteringStaff(true);
    try {
      await apiRequest("/api/admin/register-staff", {
        method: "POST",
        body: JSON.stringify(staffForm)
      });
      setMessage({
        text: `Staff member "${staffForm.name}" registered successfully! Password written to backend folder 'sent_emails/'.`,
        type: "success"
      });
      setShowAddStaffModal(false);
      setStaffForm({ name: "", title: "", department: "", phone: "", email: "", gender: "" });
      setModalError("");
      fetchStaff();
    } catch (err: any) {
      setModalError(err.message || "Failed to register staff.");
    } finally {
      setRegisteringStaff(false);
    }
  };

  const handleToggleBlock = async (staff: StaffRecord) => {
    if (!confirm(`Are you sure you want to ${staff.isBlocked ? "unblock" : "block"} staff member "${staff.name}"?`)) return;
    setTogglingBlockId(staff.id);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiRequest(`/api/admin/users/${staff.id}/toggle-block`, { method: "POST" });
      setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, isBlocked: res.isBlocked } : s));
      setMessage({ text: res.message, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to change block status.", type: "error" });
    } finally {
      setTogglingBlockId(null);
    }
  };

  const handleToggleSuperAdmin = async (staff: StaffRecord) => {
    if (!confirm(`Toggle Super Admin role for "${staff.name}"? This allows them to see and approve portfolios across all departments.`)) return;
    setTogglingAdminId(staff.id);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiRequest(`/api/admin/staff/${staff.id}/toggle-super-admin`, { method: "POST" });
      setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, isSuperAdmin: res.isSuperAdmin } : s));
      setMessage({ text: res.message, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to change Super Admin role status.", type: "error" });
    } finally {
      setTogglingAdminId(null);
    }
  };

  const handleDeleteStaff = async (staff: StaffRecord) => {
    if (!confirm(`Are you sure you want to delete staff member "${staff.name}" permanently? This cannot be undone.`)) return;
    setDeletingId(staff.id);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/admin/users/${staff.id}`, { method: "DELETE" });
      setStaffList(prev => prev.filter(s => s.id !== staff.id));
      setMessage({ text: `Staff member "${staff.name}" deleted successfully.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete staff member.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter staff
  const filterDepartments = ["All", ...Array.from(new Set(staffList.map(s => s.department))).sort()];
  const filtered = staffList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
      <p className="text-slate-500 text-sm">Loading role management...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Lock className="h-6 w-6 text-mcc-crimson dark:text-mcc-gold" /> Role &amp; Staff Management
          </h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm mt-1">Manage staff roles, enable Super Admin bypass access, block/unblock login capabilities, or delete records.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalError("");
              setShowAddStaffModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl btn-premium cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Staff Member
          </button>
          <button onClick={fetchStaff} className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Registered Staff", value: staffList.length, icon: Users, color: "text-mcc-crimson dark:text-mcc-gold", bg: "bg-mcc-crimson/10 dark:bg-mcc-gold/10" },
          { label: "Super Admins", value: staffList.filter(s => s.isSuperAdmin).length, icon: Shield, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Blocked Staff", value: staffList.filter(s => s.isBlocked).length, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-500/10" },
          { label: "Active Staff", value: staffList.filter(s => !s.isBlocked).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
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

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"}`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search staff by name, email or department..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none cursor-pointer">
          {filterDepartments.map(d => (
            <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Directory Table Layout */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center border border-dashed rounded-3xl text-slate-500 glass-panel">
          <UserX className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold">No staff members found matching your filters.</p>
        </div>
      ) : (
        <div className="glass-panel border rounded-3xl overflow-x-auto shadow-sm">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-white font-bold" style={{ backgroundColor: "rgb(29, 41, 61)" }}>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Department &amp; Title</th>
                <th className="px-6 py-4 text-center">Super Admin</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map(staff => (
                <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  {/* Staff Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground">{staff.name}</p>
                        <p className="text-xs text-slate-400 truncate">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Department & Title */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold text-xs text-foreground flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {staff.department}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{staff.title || "Lecturer"}</p>
                    </div>
                  </td>

                  {/* Super Admin status */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleSuperAdmin(staff)}
                      disabled={togglingAdminId === staff.id}
                      className={`inline-flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${staff.isSuperAdmin ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      title={staff.isSuperAdmin ? "Disable Super Admin privileges" : "Enable Super Admin privileges"}
                    >
                      {togglingAdminId === staff.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    </button>
                  </td>

                  {/* Block status badge */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${staff.isBlocked ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                      {staff.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>

                  {/* Actions buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleBlock(staff)}
                        disabled={togglingBlockId === staff.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${staff.isBlocked ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600" : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600"}`}
                        title={staff.isBlocked ? "Unblock account" : "Block account from panel"}
                      >
                        {togglingBlockId === staff.id ? <Loader2 className="h-3 w-3 animate-spin" /> : staff.isBlocked ? "Unblock" : "Block"}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteStaff(staff)}
                        disabled={deletingId === staff.id}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete staff account permanently"
                      >
                        {deletingId === staff.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-panel border rounded-3xl p-6 shadow-2xl relative bg-background"
            >
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setModalError("");
                }}
                className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h4 className="font-bold text-lg mb-1 flex items-center gap-2 text-foreground">
                <Lock className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold" />
                Register Staff Member
              </h4>
              <p className="text-xs text-slate-500 mb-6">
                Created staff accounts will receive an email notice. The temporary password will be saved in `wwwroot/sent_emails/`.
              </p>

              {modalError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterStaff} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Samuel"
                      value={staffForm.name}
                      onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title / Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOD, Associate Professor"
                    value={staffForm.title}
                    onChange={e => setStaffForm({ ...staffForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      required
                      value={staffForm.department}
                      onChange={e => setStaffForm({ ...staffForm, department: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none appearance-none"
                    >
                      <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Choose Department</option>
                      {departments.map(d => (
                        <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      required
                      value={staffForm.gender}
                      onChange={e => setStaffForm({ ...staffForm, gender: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none appearance-none"
                    >
                      <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Choose Gender</option>
                      <option value="Male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Male</option>
                      <option value="Female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Female</option>
                      <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98401 23456"
                      value={staffForm.phone}
                      onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="username@mcc.edu.in"
                      value={staffForm.email}
                      onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStaffModal(false);
                      setModalError("");
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registeringStaff}
                    className="px-5 py-2 text-xs font-bold rounded-lg btn-premium cursor-pointer disabled:opacity-50"
                  >
                    {registeringStaff ? "Registering..." : "Register Staff"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
