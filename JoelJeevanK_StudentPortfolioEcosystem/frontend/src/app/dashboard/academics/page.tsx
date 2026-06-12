"use client";

import { useEffect, useState } from "react";
import { BookOpen, Award, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Loader2, Upload, ExternalLink, Calendar, Milestone } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, BACKEND_URL, getAuthHeaders } from "@/utils/api";

interface AcademicRecord {
  id: string;
  degree: string;
  institution: string;
  startYear: number;
  endYear: number;
  gradeOrCgpa: string;
  description: string;
  level?: string;
  isCurrentlyStudying?: boolean;
}

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialId: string;
  certificatePhotos: string;
}

export default function AcademicsPage() {
  const [academics, setAcademics] = useState<AcademicRecord[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Academic Form State
  const [academicForm, setAcademicForm] = useState({
    id: "", // present if editing
    degree: "",
    institution: "",
    startYear: new Date().getFullYear() - 3,
    endYear: new Date().getFullYear(),
    gradeOrCgpa: "",
    description: "",
    level: "UG",
    currentlyStudying: false
  });
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [academicSaving, setAcademicSaving] = useState(false);

  // Certification Form State
  const [certForm, setCertForm] = useState({
    id: "", // present if editing
    name: "",
    issuingOrganization: "",
    issueDate: new Date().toISOString().split("T")[0],
    credentialId: ""
  });
  const [selectedPhotos, setSelectedPhotos] = useState<FileList | null>(null);
  const [showCertForm, setShowCertForm] = useState(false);
  const [certSaving, setCertSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const records = await apiRequest("/api/academic");
      const certifications = await apiRequest("/api/certification");
      setAcademics(records);
      setCerts(certifications);
    } catch (err: any) {
      setMessage({ text: "Failed to retrieve records.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // --- ACADEMIC CRUD ---
  const handleAcademicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcademicSaving(true);
    setMessage({ text: "", type: "" });

    // Validate Academic Record
    if (!academicForm.degree.trim() || academicForm.degree.trim().length < 2) {
      setMessage({ text: "Degree / Qualification must be at least 2 characters.", type: "error" });
      setAcademicSaving(false);
      return;
    }
    if (!academicForm.institution.trim() || academicForm.institution.trim().length < 2) {
      setMessage({ text: "Institution Name must be at least 2 characters.", type: "error" });
      setAcademicSaving(false);
      return;
    }
    const currentYear = new Date().getFullYear();
    if (academicForm.startYear < 1900 || academicForm.startYear > currentYear + 10) {
      setMessage({ text: `Start Year must be between 1900 and ${currentYear + 10}.`, type: "error" });
      setAcademicSaving(false);
      return;
    }
    if (academicForm.endYear < 1900 || academicForm.endYear > currentYear + 10) {
      setMessage({ text: `End Year must be between 1900 and ${currentYear + 10}.`, type: "error" });
      setAcademicSaving(false);
      return;
    }
    if (academicForm.endYear < academicForm.startYear) {
      setMessage({ text: "End Year cannot be before Start Year.", type: "error" });
      setAcademicSaving(false);
      return;
    }
    if (!academicForm.gradeOrCgpa.trim()) {
      setMessage({ text: "Grade / CGPA is required.", type: "error" });
      setAcademicSaving(false);
      return;
    }

    try {
      const payload = {
        degree: academicForm.degree,
        institution: academicForm.institution,
        startYear: academicForm.startYear,
        endYear: academicForm.endYear,
        gradeOrCgpa: academicForm.gradeOrCgpa,
        description: academicForm.description,
        level: academicForm.level,
        isCurrentlyStudying: academicForm.currentlyStudying
      };

      if (academicForm.id) {
        // Update
        const updated = await apiRequest(`/api/academic/${academicForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setAcademics(academics.map(a => a.id === academicForm.id ? updated : a));
        setMessage({ text: "Academic record updated successfully!", type: "success" });
      } else {
        // Create
        const created = await apiRequest("/api/academic", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setAcademics([created, ...academics]);
        setMessage({ text: "Academic record added successfully!", type: "success" });
      }
      setAcademicForm({
        id: "",
        degree: "",
        institution: "",
        startYear: new Date().getFullYear() - 3,
        endYear: new Date().getFullYear(),
        gradeOrCgpa: "",
        description: "",
        level: "UG",
        currentlyStudying: false
      });
      setShowAcademicForm(false);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save record.", type: "error" });
    } finally {
      setAcademicSaving(false);
    }
  };

  const editAcademic = (record: AcademicRecord) => {
    setAcademicForm({
      id: record.id,
      degree: record.degree,
      institution: record.institution,
      startYear: record.startYear,
      endYear: record.endYear,
      gradeOrCgpa: record.gradeOrCgpa,
      description: record.description,
      level: record.level || "UG",
      currentlyStudying: record.isCurrentlyStudying || false
    });
    setShowAcademicForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAcademic = async (id: string) => {
    if (!confirm("Are you sure you want to delete this academic record?")) return;
    setMessage({ text: "", type: "" });

    try {
      await apiRequest(`/api/academic/${id}`, { method: "DELETE" });
      setAcademics(academics.filter(a => a.id !== id));
      setMessage({ text: "Academic record deleted successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: "Failed to delete record.", type: "error" });
    }
  };

  // --- CERTIFICATION CRUD ---
  const handleCertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertSaving(true);
    setMessage({ text: "", type: "" });

    // Validate Certification
    if (!certForm.name.trim() || certForm.name.trim().length < 2) {
      setMessage({ text: "Certification Name must be at least 2 characters.", type: "error" });
      setCertSaving(false);
      return;
    }
    if (!certForm.issuingOrganization.trim() || certForm.issuingOrganization.trim().length < 2) {
      setMessage({ text: "Issuing Organization must be at least 2 characters.", type: "error" });
      setCertSaving(false);
      return;
    }
    if (!certForm.issueDate) {
      setMessage({ text: "Issue Date is required.", type: "error" });
      setCertSaving(false);
      return;
    }
    const issueDateObj = new Date(certForm.issueDate);
    const today = new Date();
    if (isNaN(issueDateObj.getTime())) {
      setMessage({ text: "Please enter a valid Issue Date.", type: "error" });
      setCertSaving(false);
      return;
    }
    if (issueDateObj > today) {
      setMessage({ text: "Issue Date cannot be in the future.", type: "error" });
      setCertSaving(false);
      return;
    }
    if (certForm.credentialId && certForm.credentialId.trim()) {
      const credIdRegex = /^[A-Za-z0-9\-\.\/_\s]+$/;
      if (!credIdRegex.test(certForm.credentialId.trim())) {
        setMessage({ text: "Credential ID must be alphanumeric and can contain hyphens, dots, underscores, or slashes.", type: "error" });
        setCertSaving(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("name", certForm.name);
      formData.append("issuingOrganization", certForm.issuingOrganization);
      formData.append("issueDate", certForm.issueDate);
      formData.append("credentialId", certForm.credentialId);
      
      if (selectedPhotos) {
        for (let i = 0; i < selectedPhotos.length; i++) {
          formData.append("photos", selectedPhotos[i]);
        }
      }

      const userId = localStorage.getItem("userId") || "";
      const userRole = localStorage.getItem("userRole") || "Student";

      const url = certForm.id 
        ? `/api/certification/${certForm.id}` 
        : "/api/certification";
        
      const response = await fetch(`${BACKEND_URL}${url}`, {
        method: certForm.id ? "PUT" : "POST",
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      if (certForm.id) {
        setCerts(certs.map(c => c.id === certForm.id ? data : c));
        setMessage({ text: "Certification details saved successfully!", type: "success" });
      } else {
        setCerts([data, ...certs]);
        setMessage({ text: "Certification created successfully with photos!", type: "success" });
      }

      setCertForm({
        id: "",
        name: "",
        issuingOrganization: "",
        issueDate: new Date().toISOString().split("T")[0],
        credentialId: ""
      });
      setSelectedPhotos(null);
      setShowCertForm(false);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save certification.", type: "error" });
    } finally {
      setCertSaving(false);
    }
  };

  const editCert = (cert: Certification) => {
    setCertForm({
      id: cert.id,
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate.split("T")[0],
      credentialId: cert.credentialId || ""
    });
    setSelectedPhotos(null);
    setShowCertForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCert = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;
    setMessage({ text: "", type: "" });

    try {
      await apiRequest(`/api/certification/${id}`, { method: "DELETE" });
      setCerts(certs.filter(c => c.id !== id));
      setMessage({ text: "Certification deleted successfully.", type: "success" });
    } catch (err: any) {
      setMessage({ text: "Failed to delete certification.", type: "error" });
    }
  };

  const handleFileUpload = async (certId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(certId);
    setMessage({ text: "", type: "" });

    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const userId = localStorage.getItem("userId") || "";
      const response = await fetch(`${BACKEND_URL}/api/certification/${certId}/upload`, {
        method: "POST",
        headers: {
          ...getAuthHeaders()
        },
        body: fileData
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) throw new Error(data.message || `Request failed with status ${response.status}`);

      setCerts(certs.map(c => c.id === certId ? { ...c, certificatePhotos: data.attachmentPath } : c));
      setMessage({ text: "Certificate photo uploaded successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to upload attachment.", type: "error" });
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
        <p className="text-slate-500 text-sm">Loading Academics and Certifications database...</p>
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Academic Records & Certifications</h2>
        <p className="text-slate-500 text-sm">Manage your transcript credentials, CGPA/grades, and verify your professional training certificates.</p>
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

      {/* --- FORM SECTION --- */}
      {showAcademicForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-panel rounded-3xl p-6 border">
          <h3 className="text-lg font-bold mb-4">{academicForm.id ? "Edit Academic Record" : "Add Academic Record"}</h3>
          <form onSubmit={handleAcademicSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Degree / Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. B.Sc. Computer Science"
                  value={academicForm.degree}
                  onChange={e => setAcademicForm({ ...academicForm, degree: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Education Level</label>
                <select
                  value={academicForm.level}
                  onChange={e => setAcademicForm({ ...academicForm, level: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none text-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="UG" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Undergraduate (UG)</option>
                  <option value="PG" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Postgraduate (PG)</option>
                  <option value="PhD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Doctorate (PhD)</option>
                  <option value="Schooling" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Schooling</option>
                  <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Institution Name</label>
              <input
                type="text"
                placeholder="e.g. Madras Christian College"
                value={academicForm.institution}
                onChange={e => setAcademicForm({ ...academicForm, institution: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Start Year</label>
                <input
                  type="number"
                  value={academicForm.startYear}
                  onChange={e => setAcademicForm({ ...academicForm, startYear: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">End Year (or Expected)</label>
                <input
                  type="number"
                  value={academicForm.endYear}
                  onChange={e => setAcademicForm({ ...academicForm, endYear: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Grade / CGPA</label>
                <input
                  type="text"
                  placeholder="e.g. 9.45 CGPA"
                  value={academicForm.gradeOrCgpa}
                  onChange={e => setAcademicForm({ ...academicForm, gradeOrCgpa: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
              <div className="flex items-center h-[46px] pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={academicForm.currentlyStudying}
                    onChange={e => setAcademicForm({ ...academicForm, currentlyStudying: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-mcc-crimson focus:ring-mcc-crimson cursor-pointer"
                  />
                  <span>Currently studying here</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Brief Description (Optional)</label>
              <textarea
                placeholder="List major courses studied, specializations, or academic projects..."
                value={academicForm.description}
                onChange={e => setAcademicForm({ ...academicForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAcademicForm(false);
                  setAcademicForm({
                    id: "",
                    degree: "",
                    institution: "",
                    startYear: new Date().getFullYear() - 3,
                    endYear: new Date().getFullYear(),
                    gradeOrCgpa: "",
                    description: "",
                    level: "UG",
                    currentlyStudying: false
                  });
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={academicSaving}
                className="px-4 py-2 text-xs font-semibold rounded-lg btn-premium cursor-pointer disabled:opacity-50"
              >
                {academicSaving ? "Saving..." : "Save Record"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {showCertForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-panel rounded-3xl p-6 border">
          <h3 className="text-lg font-bold mb-4">{certForm.id ? "Edit Certification Details" : "Add Certification"}</h3>
          <form onSubmit={handleCertSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Certification Name</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Developer"
                  value={certForm.name}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Issuing Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services"
                  value={certForm.issuingOrganization}
                  onChange={e => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={certForm.issueDate}
                  onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Credential ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. AWS-12345"
                  value={certForm.credentialId}
                  onChange={e => setCertForm({ ...certForm, credentialId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Certificate Photos (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-mcc-crimson dark:hover:border-mcc-gold hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all">
                  <Upload className="h-4 w-4 text-slate-400 animate-pulse" />
                  <span className="text-xs text-slate-500 font-semibold truncate">
                    {selectedPhotos && selectedPhotos.length > 0 
                      ? `${selectedPhotos.length} photo(s) selected` 
                      : "Click to upload certificate photos (JPG, PNG)"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => setSelectedPhotos(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCertForm(false);
                  setCertForm({
                    id: "",
                    name: "",
                    issuingOrganization: "",
                    issueDate: new Date().toISOString().split("T")[0],
                    credentialId: ""
                  });
                  setSelectedPhotos(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={certSaving}
                className="px-4 py-2 text-xs font-semibold rounded-lg btn-premium cursor-pointer disabled:opacity-50"
              >
                {certSaving ? "Saving..." : "Save Certification"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* --- DISPLAY AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Academics Record Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold" /> Academic Timeline
            </h3>
            <button
              onClick={() => {
                setAcademicForm({
                  id: "",
                  degree: "",
                  institution: "",
                  startYear: new Date().getFullYear() - 3,
                  endYear: new Date().getFullYear(),
                  gradeOrCgpa: "",
                  description: "",
                  level: "UG",
                  currentlyStudying: false
                });
                setShowAcademicForm(true);
                setShowCertForm(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-mcc-crimson dark:text-mcc-gold hover:underline cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Record
            </button>
          </div>

          <div className="space-y-4">
            {academics.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed rounded-2xl">
                No academic records inputted yet. Click &apos;Add Record&apos; above.
              </div>
            ) : (
              academics.map(rec => (
                <div key={rec.id} className="glass-panel p-5 rounded-2xl border relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                    <button onClick={() => editAcademic(rec)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteAcademic(rec.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-block text-[10px] font-bold text-mcc-crimson dark:text-mcc-gold px-2 py-0.5 bg-mcc-crimson/10 dark:bg-mcc-gold/10 rounded-full">
                      {rec.startYear} - {rec.isCurrentlyStudying ? "Present" : rec.endYear}
                    </span>
                    {rec.level && (
                      <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded-full uppercase">
                        {rec.level}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{rec.degree}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">{rec.institution}</p>
                  
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-mcc-crimson dark:text-mcc-gold font-bold bg-mcc-crimson/10 dark:bg-mcc-gold/10 p-2.5 rounded-xl w-fit">
                    <Milestone className="h-3.5 w-3.5" />
                    <span>Grade Score: {rec.gradeOrCgpa}</span>
                  </div>

                  {rec.description && (
                    <p className="text-xs text-slate-500 mt-3 whitespace-pre-line leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {rec.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certifications Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold" /> Professional Certs
            </h3>
            <button
              onClick={() => {
                setCertForm({
                  id: "",
                  name: "",
                  issuingOrganization: "",
                  issueDate: new Date().toISOString().split("T")[0],
                  credentialId: ""
                });
                setSelectedPhotos(null);
                setShowCertForm(true);
                setShowAcademicForm(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-mcc-crimson dark:text-mcc-gold hover:underline cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Cert
            </button>
          </div>

          <div className="space-y-4">
            {certs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed rounded-2xl">
                No certifications registered yet. Click &apos;Add Cert&apos; above.
              </div>
            ) : (
              certs.map(cert => (
                <div key={cert.id} className="glass-panel p-5 rounded-2xl border relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                    <button onClick={() => editCert(cert)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteCert(cert.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm leading-snug">{cert.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{cert.issuingOrganization}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-2 font-semibold">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>

                  {cert.credentialId && (
                    <p className="text-[10px] font-mono text-slate-400 mt-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">
                      ID: {cert.credentialId}
                    </p>
                  )}

                  {/* Multiple Photo Thumbnails */}
                  {cert.certificatePhotos && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(cert.certificatePhotos || "").split(",").map(p => p.trim()).filter(Boolean).map((photoPath, index) => (
                        <a 
                          key={index}
                          href={`${BACKEND_URL}${photoPath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-16 w-16 border rounded-lg overflow-hidden block shadow-sm hover:scale-105 transition-transform shrink-0"
                          title="Click to view full image"
                        >
                          <img 
                            src={`${BACKEND_URL}${photoPath}`} 
                            alt={`Certificate Photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Actions / Photo uploads */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      {cert.certificatePhotos ? (
                        <span className="text-[10px] text-slate-400 font-semibold italic">
                          Click photo(s) above to view high resolution document.
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-semibold italic">
                          No photos uploaded yet. Upload one below or edit to add.
                        </span>
                      )}
                    </div>

                    {/* Upload Cert File */}
                    <div className="relative">
                      <label className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer transition-all registry-badge hover:opacity-90">
                        <Upload className="h-3 w-3" />
                        {uploadingId === cert.id ? "Uploading..." : cert.certificatePhotos ? "Add Photo" : "Upload Photo"}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={e => handleFileUpload(cert.id, e)}
                          className="hidden"
                          disabled={uploadingId === cert.id}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
