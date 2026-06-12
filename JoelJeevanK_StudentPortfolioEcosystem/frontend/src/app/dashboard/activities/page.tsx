"use client";

import { useEffect, useState } from "react";
import { Award, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Calendar, Users, Star, Target } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface Activity {
  id: string;
  type: string; // "NGO", "CommunityService", "Sports", "Extracurricular"
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  const [form, setForm] = useState({
    id: "",
    type: "NGO",
    title: "",
    organization: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    description: ""
  });

  async function fetchActivities() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/activity");
      setActivities(data);
    } catch (err: any) {
      setMessage({ text: "Failed to load activities list.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Validate Activity Details
    if (!form.title.trim() || form.title.trim().length < 2) {
      setMessage({ text: "Role / Title must be at least 2 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (!form.organization.trim() || form.organization.trim().length < 2) {
      setMessage({ text: "Organization / Association must be at least 2 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (!form.startDate) {
      setMessage({ text: "Start Date is required.", type: "error" });
      setSaving(false);
      return;
    }
    const startDateObj = new Date(form.startDate);
    if (isNaN(startDateObj.getTime())) {
      setMessage({ text: "Please enter a valid Start Date.", type: "error" });
      setSaving(false);
      return;
    }
    if (form.endDate) {
      const endDateObj = new Date(form.endDate);
      if (isNaN(endDateObj.getTime())) {
        setMessage({ text: "Please enter a valid End Date.", type: "error" });
        setSaving(false);
        return;
      }
      if (endDateObj < startDateObj) {
        setMessage({ text: "End Date cannot be before Start Date.", type: "error" });
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        ...form,
        endDate: form.endDate || null
      };

      if (form.id) {
        // Update
        const updated = await apiRequest(`/api/activity/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setActivities(activities.map(a => a.id === form.id ? updated : a));
        setMessage({ text: "Activity record updated successfully!", type: "success" });
      } else {
        // Create
        const created = await apiRequest("/api/activity", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setActivities([created, ...activities]);
        setMessage({ text: "Activity logged successfully!", type: "success" });
      }

      setForm({
        id: "",
        type: "NGO",
        title: "",
        organization: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        description: ""
      });
      setShowForm(false);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to log activity.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const editActivity = (act: Activity) => {
    setForm({
      id: act.id,
      type: act.type,
      title: act.title,
      organization: act.organization,
      startDate: act.startDate.split("T")[0],
      endDate: act.endDate ? act.endDate.split("T")[0] : "",
      description: act.description
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to remove this logged activity?")) return;
    setMessage({ text: "", type: "" });

    try {
      await apiRequest(`/api/activity/${id}`, { method: "DELETE" });
      setActivities(activities.filter(a => a.id !== id));
      setMessage({ text: "Activity deleted successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: "Failed to delete activity.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
        <p className="text-slate-500 text-sm">Retrieving registered student activities...</p>
      </div>
    );
  }

  const filteredActivities = filterType === "all"
    ? activities
    : activities.filter(a => a.type === filterType);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "NGO": return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "CommunityService": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "Sports": return "bg-green-500/10 text-green-600 dark:text-green-400";
      default: return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Extracurricular Activities & Service</h2>
          <p className="text-slate-500 text-sm">Document your NGO participation, community services, sports milestones, and leadership achievements.</p>
        </div>
        <button
          onClick={() => {
            setForm({
              id: "",
              type: "NGO",
              title: "",
              organization: "",
              startDate: new Date().toISOString().split("T")[0],
              endDate: "",
              description: ""
            });
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-premium text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> {showForm ? "Hide Form" : "Log Activity"}
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

      {/* --- FORM PANEL --- */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-panel rounded-3xl p-6 border max-w-2xl mx-auto">
          <h3 className="text-lg font-bold mb-4">{form.id ? "Edit Activity Logs" : "Record New Activity"}</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type selection */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Activity Category</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 text-sm focus:border-mcc-crimson outline-none"
                  required
                >
                  <option value="NGO" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">NGO Volunteering</option>
                  <option value="CommunityService" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Community Service / NSS / NCC</option>
                  <option value="Sports" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sports & Athletics</option>
                  <option value="Extracurricular" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Extracurriculars & Clubs</option>
                </select>
              </div>

              {/* Title / Role */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Your Role / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Volunteer, Captain, Club Secretary"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
            </div>

            {/* Organization / Association */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Organization / Association</label>
              <input
                type="text"
                placeholder="e.g. Red Cross Society, MCC Football Team, Scrub Society"
                value={form.organization}
                onChange={e => setForm({ ...form, organization: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">End Date (Optional, leave blank if active)</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description / Major Contributions</label>
              <textarea
                placeholder="Describe your active contribution, duties, achievements, or what you learned from this experience..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({
                    id: "",
                    type: "NGO",
                    title: "",
                    organization: "",
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: "",
                    description: ""
                  });
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold rounded-lg btn-premium cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : "Record Activity"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* --- FILTER CONTROL --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: "all", label: "All Activities", icon: Award },
          { key: "NGO", label: "NGO Service", icon: Users },
          { key: "CommunityService", label: "Community / NSS / NCC", icon: Target },
          { key: "Sports", label: "Sports & Athletics", icon: Star },
          { key: "Extracurricular", label: "Extracurriculars", icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = filterType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? "bg-mcc-crimson text-white dark:bg-mcc-gold dark:text-slate-900 border-transparent shadow-sm"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- ACTIVITIES TIMELINE LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 border border-dashed rounded-3xl">
            No logged activities matching the selected filter category. Log one using &apos;Log Activity&apos; above.
          </div>
        ) : (
          filteredActivities.map(act => (
            <div key={act.id} className="glass-panel p-6 rounded-3xl border relative group flex flex-col justify-between">
              
              {/* Actions */}
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button onClick={() => editActivity(act)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => deleteActivity(act.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3 ${getBadgeColor(act.type)}`}>
                  {act.type === "CommunityService" ? "NSS / NCC" : act.type}
                </span>
                
                <h4 className="font-bold text-base leading-snug">{act.title}</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{act.organization}</p>
                
                <p className="text-xs text-slate-500 mt-4 leading-relaxed whitespace-pre-line border-t border-slate-100 dark:border-slate-800 pt-3">
                  {act.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <Calendar className="h-4 w-4" />
                <span>
                  Active: {new Date(act.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} - {" "}
                  {act.endDate 
                    ? new Date(act.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) 
                    : "Present"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
