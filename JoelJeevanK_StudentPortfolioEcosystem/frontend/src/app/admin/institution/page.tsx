"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface DepartmentRecord {
  id: string;
  name: string;
  createdAt: string;
}

export default function InstitutionManagementPage() {
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [newDeptName, setNewDeptName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  async function fetchDepartments() {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const data = await apiRequest("/api/admin/departments");
      setDepartments(data);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to load departments.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    if (newDeptName.trim().length < 2) {
      setMessage({ text: "Department name must be at least 2 characters.", type: "error" });
      return;
    }

    setActionLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiRequest("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify({ name: newDeptName.trim() })
      });
      setDepartments(prev => [...prev, res].sort((a, b) => a.name.localeCompare(b.name)));
      setMessage({ text: `Department "${newDeptName.trim()}" added successfully!`, type: "success" });
      setNewDeptName("");
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to add department.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDepartment = async (dept: DepartmentRecord) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the department "${dept.name}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(dept.id);
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/admin/departments/${dept.id}`, { method: "DELETE" });
      setDepartments(prev => prev.filter(d => d.id !== dept.id));
      setMessage({ text: `Department "${dept.name}" deleted successfully.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete department.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Building2 className="h-6 w-6 text-mcc-crimson dark:text-mcc-gold" /> Institution Management
          </h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm mt-1">
            Manage academic departments and configure settings. Department changes will reflect instantly in registry registration forms.
          </p>
        </div>
        <button
          onClick={fetchDepartments}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Departments",
            value: departments.length,
            icon: Building2,
            color: "text-mcc-crimson dark:text-mcc-gold",
            bg: "bg-mcc-crimson/10 dark:bg-mcc-gold/10"
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-4 rounded-2xl border max-w-sm">
              <div className={`p-2 rounded-xl w-fit mb-2 ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${stat.color}`}>{loading ? "..." : stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Message Alert */}
      <AnimatePresence mode="wait">
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-start gap-3 border text-sm ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Department Form */}
        <div className="lg:col-span-1 glass-panel border rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-1 text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold" />
            Add Department
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Create a new department in the Madras Christian College registry. It will immediately appear in the registration and staff dropdowns.
          </p>

          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Department Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Biochemistry"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || !newDeptName.trim()}
              className="w-full py-2.5 font-bold rounded-xl btn-premium transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add Department"
              )}
            </button>
          </form>
        </div>

        {/* Departments List */}
        <div className="lg:col-span-2 glass-panel border rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-1 text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold" />
            Active Departments
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Review existing academic departments. You can delete departments that are not in use by any registered students or staff.
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
              <p className="text-slate-500 text-sm">Loading department registry...</p>
            </div>
          ) : departments.length === 0 ? (
            <div className="p-10 text-center border border-dashed rounded-3xl text-slate-500">
              <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold">No departments found in the registry.</p>
            </div>
          ) : (
            <div className="border rounded-2xl overflow-x-auto">
              <table className="w-full min-w-[400px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-white font-bold text-xs uppercase tracking-wider" style={{ backgroundColor: "rgb(29, 41, 61)" }}>
                    <th className="px-5 py-3.5">Department Name</th>
                    <th className="px-5 py-3.5">Date Added</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-5 py-4 font-bold text-foreground text-sm">{dept.name}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {new Date(dept.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDeleteDepartment(dept)}
                          disabled={deletingId === dept.id}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                          title="Delete department permanently"
                        >
                          {deletingId === dept.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
