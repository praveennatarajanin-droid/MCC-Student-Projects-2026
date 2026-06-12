"use client";

import { useEffect, useState } from "react";
import { Microscope, Lightbulb, Cpu, Presentation, FlaskConical, Rocket, Plus, Trash2, Edit2, Upload, ExternalLink, FileText, CheckCircle2, AlertCircle, Loader2, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, BACKEND_URL } from "@/utils/api";

const TYPES = [
  { value: "ResearchPaper", label: "Research Paper", icon: Microscope, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { value: "InnovationProject", label: "Innovation Project", icon: Lightbulb, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { value: "Prototype", label: "Prototype", icon: Cpu, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  { value: "ConferencePresentation", label: "Conference Presentation", icon: Presentation, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
  { value: "ScienceFair", label: "Science Fair", icon: FlaskConical, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10" },
  { value: "StartupIdea", label: "Startup Idea", icon: Rocket, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
];

interface ResearchItem {
  id: string;
  type: string;
  title: string;
  description: string;
  category: string;
  date: string;
  link: string;
  attachmentPath: string;
  institutionOrEvent: string;
}

const EMPTY_FORM = {
  id: "",
  type: "ResearchPaper",
  title: "",
  description: "",
  category: "",
  date: new Date().toISOString().split("T")[0],
  link: "",
  institutionOrEvent: "",
};

export default function ResearchInnovationPage() {
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  async function fetchItems() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/researchinnovation");
      setItems(data);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to load research records.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    // Validate Research & Innovation Fields
    if (!form.title.trim() || form.title.trim().length < 2) {
      setMessage({ text: "Research Title must be at least 2 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (form.category && form.category.trim() && form.category.trim().length < 2) {
      setMessage({ text: "Category must be at least 2 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      setMessage({ text: "Description must be at least 10 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (!form.date) {
      setMessage({ text: "Date is required.", type: "error" });
      setSaving(false);
      return;
    }
    const dateObj = new Date(form.date);
    if (isNaN(dateObj.getTime())) {
      setMessage({ text: "Please enter a valid Date.", type: "error" });
      setSaving(false);
      return;
    }
    if (form.institutionOrEvent && form.institutionOrEvent.trim() && form.institutionOrEvent.trim().length < 2) {
      setMessage({ text: "Institution / Event must be at least 2 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (form.link && form.link.trim()) {
      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!urlRegex.test(form.link.trim())) {
        setMessage({ text: "Please enter a valid Link URL.", type: "error" });
        setSaving(false);
        return;
      }
    }

    const userId = localStorage.getItem("userId") || "";
    const userRole = localStorage.getItem("userRole") || "Student";

    const fd = new FormData();
    fd.append("type", form.type);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("date", form.date);
    fd.append("link", form.link);
    fd.append("institutionOrEvent", form.institutionOrEvent);
    if (selectedFile) fd.append("attachment", selectedFile);

    try {
      const url = form.id
        ? `/api/researchinnovation/${form.id}`
        : "/api/researchinnovation";
      const data = await apiRequest(url, {
        method: form.id ? "PUT" : "POST",
        body: fd,
      });

      if (form.id) {
        setItems(items.map(i => i.id === form.id ? data : i));
        setMessage({ text: "Record updated successfully!", type: "success" });
      } else {
        setItems([data, ...items]);
        setMessage({ text: "Research record added successfully!", type: "success" });
      }
      resetForm();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save record.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this research record?")) return;
    setMessage({ text: "", type: "" });
    try {
      await apiRequest(`/api/researchinnovation/${id}`, {
        method: "DELETE"
      });
      setItems(items.filter(i => i.id !== id));
      setMessage({ text: "Record deleted.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete record.", type: "error" });
    }
  };

  const editItem = (item: ResearchItem) => {
    setForm({ id: item.id, type: item.type, title: item.title, description: item.description, category: item.category, date: item.date.split("T")[0], link: item.link, institutionOrEvent: item.institutionOrEvent });
    setSelectedFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setSelectedFile(null);
    setShowForm(false);
  };

  const getTypeInfo = (typeValue: string) => TYPES.find(t => t.value === typeValue) || TYPES[0];

  const filteredItems = activeFilter === "All" ? items : items.filter(i => i.type === activeFilter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
      <p className="text-slate-500 text-sm">Loading Research & Innovation records...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Microscope className="h-6 w-6 text-mcc-crimson dark:text-mcc-gold" />
            Research & Innovation
          </h2>
          <p className="text-slate-500 text-sm mt-1">Showcase your research papers, prototypes, presentations, and startup ideas.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl btn-premium cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Record
        </button>
      </div>

      {/* Message */}
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

      {/* Form Panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-panel rounded-3xl p-6 border overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{form.id ? "Edit Record" : "Add New Research / Innovation"}</h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.value} type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          form.type === t.value
                            ? "border-mcc-crimson dark:border-mcc-gold bg-mcc-crimson/10 dark:bg-mcc-gold/10 text-mcc-crimson dark:text-mcc-gold"
                            : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"
                        }`}>
                        <Icon className="h-3.5 w-3.5" />{t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. AI-Powered Water Quality Prediction"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Category / Field</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Machine Learning, Environmental Science"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your research, findings, methodology, or startup concept..."
                  rows={4} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none resize-none" required />
              </div>

              {/* Date + Institution/Event + Link */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Institution / Event</label>
                  <input type="text" value={form.institutionOrEvent} onChange={e => setForm({ ...form, institutionOrEvent: e.target.value })}
                    placeholder="e.g. IIT Madras TechFest 2024"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Link (Optional)</label>
                  <input type="url" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none" />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Attachment (PDF / Word / Image)</label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-mcc-crimson dark:hover:border-mcc-gold hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all">
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-semibold">
                    {selectedFile ? selectedFile.name : "Click to upload paper, slides, or prototype docs"}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-bold rounded-lg btn-premium cursor-pointer disabled:opacity-50">
                  {saving ? "Saving..." : form.id ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("All")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "All"
              ? "bg-mcc-gold text-slate-900"
              : "registry-badge"
          }`}
        >
          <span>All</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
            activeFilter === "All"
              ? "bg-black/10 text-slate-900"
              : "bg-slate-600 text-white dark:bg-black/20 dark:text-white"
          }`}>
            {items.length}
          </span>
        </button>
        {TYPES.map(t => {
          const count = items.filter(i => i.type === t.value).length;
          if (count === 0) return null;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              onClick={() => setActiveFilter(t.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === t.value
                  ? "bg-mcc-gold text-slate-900"
                  : "registry-badge"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{t.label}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                activeFilter === t.value
                  ? "bg-black/10 text-slate-900"
                  : "bg-slate-600 text-white dark:bg-black/20 dark:text-white"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed rounded-3xl glass-panel">
          <Microscope className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-base">No Research Records Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Start by adding your research papers, innovation projects, conference presentations, or startup ideas.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="mt-5 px-5 py-2.5 text-xs font-bold rounded-xl btn-premium cursor-pointer">
            <Plus className="h-3.5 w-3.5 inline mr-1" /> Add First Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map(item => {
            const typeInfo = getTypeInfo(item.type);
            const Icon = typeInfo.icon;
            const isPdf = item.attachmentPath?.endsWith(".pdf") || item.attachmentPath?.endsWith(".doc") || item.attachmentPath?.endsWith(".docx");

            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-5 rounded-2xl border group relative hover:border-mcc-gold/40 transition-all duration-300">
                
                {/* Edit / Delete */}
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex gap-1.5 transition-opacity">
                  <button onClick={() => editItem(item)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>

                {/* Type Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-3 ${typeInfo.bg} ${typeInfo.color}`}>
                  <Icon className="h-3 w-3" />
                  {typeInfo.label}
                </div>

                <h4 className="font-bold text-sm leading-snug pr-12">{item.title}</h4>
                
                {item.category && (
                  <span className="inline-block text-[10px] font-semibold text-slate-400 mt-1">{item.category}</span>
                )}

                <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{item.description}</p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                  {item.institutionOrEvent && <span className="truncate max-w-[160px]">📍 {item.institutionOrEvent}</span>}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-mcc-crimson dark:text-mcc-gold hover:underline">
                      <ExternalLink className="h-3 w-3" /> View Link
                    </a>
                  )}
                  {item.attachmentPath && (
                    <a href={`${BACKEND_URL}${item.attachmentPath}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-mcc-crimson dark:hover:text-mcc-gold transition-colors">
                      {isPdf ? <FileText className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                      {isPdf ? "View Document" : "View Attachment"}
                    </a>
                  )}
                  {!item.link && !item.attachmentPath && (
                    <span className="text-[10px] text-slate-400 italic">No links or attachments</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
