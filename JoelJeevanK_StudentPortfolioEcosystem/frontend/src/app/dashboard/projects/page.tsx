"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Code, Link as LinkIcon, Globe, Upload, Film, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, BACKEND_URL } from "@/utils/api";

interface Project {
  id: string;
  title: string;
  description: string;
  technologiesUsed: string; // Comma-separated
  projectUrl: string;
  repositoryUrl: string;
  mediaUrl: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForm, setShowForm] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    technologiesUsed: "",
    projectUrl: "",
    repositoryUrl: "",
    mediaUrl: ""
  });

  async function fetchProjects() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/project");
      setProjects(data);
    } catch (err: any) {
      setMessage({ text: "Failed to retrieve projects list.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
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

    // Validate Project Fields
    if (!form.title.trim() || form.title.trim().length < 2) {
      setMessage({ text: "Project Title must be at least 2 characters.", type: "error" });
      setSaving(false);
      return;
    }
    if (!form.technologiesUsed.trim()) {
      setMessage({ text: "Technologies Used is required.", type: "error" });
      setSaving(false);
      return;
    }
    const techArray = form.technologiesUsed.split(",").map(t => t.trim()).filter(Boolean);
    if (techArray.length === 0) {
      setMessage({ text: "Please enter a valid list of technologies separated by commas.", type: "error" });
      setSaving(false);
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      setMessage({ text: "Project Description must be at least 10 characters.", type: "error" });
      setSaving(false);
      return;
    }

    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

    if (selectedDocument) {
      const allowedExtensions = [".pdf", ".doc", ".docx"];
      const fileName = selectedDocument.name.toLowerCase();
      const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));
      if (!isValid) {
        setMessage({ text: "Only PDF or Word documents (.pdf, .doc, .docx) are allowed for Project Document.", type: "error" });
        setSaving(false);
        return;
      }
    }

    if (form.projectUrl && form.projectUrl.trim()) {
      if (!urlRegex.test(form.projectUrl.trim())) {
        setMessage({ text: "Please enter a valid URL for the Live Application.", type: "error" });
        setSaving(false);
        return;
      }
    }
    if (form.repositoryUrl && form.repositoryUrl.trim()) {
      if (!urlRegex.test(form.repositoryUrl.trim())) {
        setMessage({ text: "Please enter a valid URL for the Source Repository.", type: "error" });
        setSaving(false);
        return;
      }
    }

    try {
      if (form.id) {
        // Update Project
        let updated = await apiRequest(`/api/project/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(form)
        });

        if (selectedDocument) {
          const fileData = new FormData();
          fileData.append("file", selectedDocument);
          const uploadResult = await apiRequest(`/api/project/${form.id}/upload`, {
            method: "POST",
            body: fileData
          });
          updated = { ...updated, mediaUrl: uploadResult.mediaUrl };
        }

        setProjects(projects.map(p => p.id === form.id ? updated : p));
        setMessage({ text: "Project updated successfully!", type: "success" });
      } else {
        // Create Project
        let created = await apiRequest("/api/project", {
          method: "POST",
          body: JSON.stringify(form)
        });

        if (selectedDocument) {
          const fileData = new FormData();
          fileData.append("file", selectedDocument);
          const uploadResult = await apiRequest(`/api/project/${created.id}/upload`, {
            method: "POST",
            body: fileData
          });
          created = { ...created, mediaUrl: uploadResult.mediaUrl };
        }

        setProjects([created, ...projects]);
        setMessage({ text: selectedDocument ? "Project created and document uploaded!" : "Project created successfully!", type: "success" });
      }

      setForm({
        id: "",
        title: "",
        description: "",
        technologiesUsed: "",
        projectUrl: "",
        repositoryUrl: "",
        mediaUrl: ""
      });
      setSelectedDocument(null);
      setShowForm(false);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save project details.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const editProject = (proj: Project) => {
    setForm({ ...proj });
    setSelectedDocument(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setMessage({ text: "", type: "" });

    try {
      await apiRequest(`/api/project/${id}`, { method: "DELETE" });
      setProjects(projects.filter(p => p.id !== id));
      setMessage({ text: "Project deleted successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: "Failed to delete project.", type: "error" });
    }
  };

  const handleMediaUpload = async (projId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(projId);
    setMessage({ text: "", type: "" });

    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const uploadResult = await apiRequest(`/api/project/${projId}/upload`, {
        method: "POST",
        body: fileData
      });

      setProjects(projects.map(p => p.id === projId ? { ...p, mediaUrl: uploadResult.mediaUrl } : p));
      setMessage({ text: "Project screenshot updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to upload image.", type: "error" });
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
        <p className="text-slate-500 text-sm">Loading projects gallery...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects & Media Gallery</h2>
          <p className="text-slate-500 text-sm">Showcase your technical coding accomplishments, applications, publications, or visual works.</p>
        </div>
        <button
          onClick={() => {
            setForm({
              id: "",
              title: "",
              description: "",
              technologiesUsed: "",
              projectUrl: "",
              repositoryUrl: "",
              mediaUrl: ""
            });
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-premium text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> {showForm ? "Hide Form" : "Create Showcase"}
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

      {/* --- CREATE / EDIT FORM --- */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-panel rounded-3xl p-6 border max-w-2xl mx-auto">
          <h3 className="text-lg font-bold mb-4">{form.id ? "Edit Project Details" : "Log New Coding Accomplishment"}</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Smart Smart Parking IoT Portal"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technologies Used */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Technologies Used</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Python, PostgreSQL"
                  value={form.technologiesUsed}
                  onChange={e => setForm({ ...form, technologiesUsed: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Comma-separated technologies list.</span>
              </div>

              {/* Project Document File Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Project Document (Optional)</label>
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-mcc-crimson dark:hover:border-mcc-gold hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all">
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-semibold truncate">
                    {selectedDocument 
                      ? selectedDocument.name 
                      : form.mediaUrl 
                        ? "Document already uploaded (Select new file to replace)" 
                        : "Click to upload project document (PDF, Word)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setSelectedDocument(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {form.mediaUrl && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Current: <a href={form.mediaUrl.startsWith("http") ? form.mediaUrl : `${BACKEND_URL}${form.mediaUrl}`} target="_blank" rel="noreferrer" className="underline text-mcc-crimson dark:text-mcc-gold">{form.mediaUrl.split("/").pop()}</a>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Url */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Live Application URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://myproject.vercel.app"
                  value={form.projectUrl}
                  onChange={e => setForm({ ...form, projectUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>

              {/* Repository Url */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Source Repository / Github URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://github.com/my-profile/project"
                  value={form.repositoryUrl}
                  onChange={e => setForm({ ...form, repositoryUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Project Description / Technical Overview</label>
              <textarea
                placeholder="Details of the architecture, key functionalities solved, systems configured, and engineering tools integrated..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none resize-none"
                required
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedDocument(null);
                  setForm({
                    id: "",
                    title: "",
                    description: "",
                    technologiesUsed: "",
                    projectUrl: "",
                    repositoryUrl: "",
                    mediaUrl: ""
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
                {saving ? "Saving..." : "Record Project"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* --- PROJECTS GALLERY GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 border border-dashed rounded-3xl">
            No coding projects registered yet. Click &apos;Create Showcase&apos; above.
          </div>
        ) : (
          projects.map(proj => {
            const isDoc = proj.mediaUrl && (
              proj.mediaUrl.endsWith(".pdf") || 
              proj.mediaUrl.endsWith(".doc") || 
              proj.mediaUrl.endsWith(".docx")
            );
            const isLocalUpload = proj.mediaUrl && proj.mediaUrl.startsWith("/uploads/projects/");
            const isImage = proj.mediaUrl && !isDoc && (
              isLocalUpload ||
              proj.mediaUrl.endsWith(".jpg") || 
              proj.mediaUrl.endsWith(".jpeg") || 
              proj.mediaUrl.endsWith(".png") || 
              proj.mediaUrl.endsWith(".gif")
            );
            const pMediaUrl = isImage 
              ? proj.mediaUrl.startsWith("http") 
                ? proj.mediaUrl 
                : `${BACKEND_URL}${proj.mediaUrl}`
              : "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80";

            return (
              <div key={proj.id} className="glass-panel rounded-3xl overflow-hidden border relative group flex flex-col justify-between">
                
                {/* Actions overlay */}
                <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <button onClick={() => editProject(proj)} className="p-1.5 bg-background hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 shadow-md cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteProject(proj.id)} className="p-1.5 bg-background hover:bg-red-50 rounded-lg text-red-500 shadow-md cursor-pointer hover:text-white">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  {/* Media Banner */}
                  <div className="h-44 relative bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <img src={pMediaUrl} alt={proj.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                    
                    {/* Dark opacity layer */}
                    <div className="absolute inset-0 bg-slate-900/10"></div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    {/* Technology tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(proj.technologiesUsed || "").split(",").map(t => t.trim()).filter(Boolean).map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold registry-badge">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <h4 className="font-bold text-base leading-snug line-clamp-1">{proj.title}</h4>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{proj.description}</p>
                  </div>
                </div>

                {/* Footer links */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-4">
                  <div className="flex gap-3 flex-wrap">
                    {proj.projectUrl && (
                      <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-mcc-crimson dark:text-mcc-gold hover:underline">
                        <LinkIcon className="h-3.5 w-3.5" /> Application
                      </a>
                    )}
                    {proj.repositoryUrl && (
                      <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:underline">
                        <Globe className="h-3.5 w-3.5" /> Repository
                      </a>
                    )}
                    {proj.mediaUrl && (isDoc || proj.mediaUrl.startsWith("http")) && (
                      <a href={proj.mediaUrl.startsWith("http") ? proj.mediaUrl : `${BACKEND_URL}${proj.mediaUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        <FileText className="h-3.5 w-3.5" /> Document
                      </a>
                    )}
                  </div>

                  {/* Attachment Uploader */}
                  <div className="relative">
                    <label className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md cursor-pointer transition-all registry-badge hover:opacity-90">
                      <Upload className="h-3 w-3" />
                      {uploadingId === proj.id ? "Saving..." : "Change Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleMediaUpload(proj.id, e)}
                        className="hidden"
                        disabled={uploadingId === proj.id}
                      />
                    </label>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
