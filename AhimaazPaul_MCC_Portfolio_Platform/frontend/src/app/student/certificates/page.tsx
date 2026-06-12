'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import api from '@/lib/api';
import { 
  Award, ShieldCheck, Upload, Trash2, X, Plus, Calendar, 
  ExternalLink, Loader2, Sparkles, Building2, CheckCircle2,
  AlertCircle, FileText, ChevronRight, Verified
} from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  fileUrl: string;
  status: 'verified' | 'pending' | 'failed';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function CertificateSection() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    credentialUrl: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const res = await api.get('/api/StudentProfile/me');
      setCerts(res.data.certifications || []);
    } catch (err) {
      console.error('Failed to load certifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const processCertificateFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/StudentProfile/upload-document?type=certifications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFileUrl(response.data.fileUrl);
      setFileName(file.name);
    } catch (err) {
      console.error(err);
      alert('Could not upload PDF file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processCertificateFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processCertificateFile(files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const payload = {
        name: form.name,
        issuer: form.issuer,
        issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : null,
        credentialId: form.credentialId,
        credentialUrl: form.credentialUrl,
        fileUrl: uploadedFileUrl || ''
      };

      const res = await api.post('/api/StudentProfile/certifications', payload);
      setCerts(prev => [...prev, res.data]);
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving certification:', err);
      alert('Failed to save certification. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this credential?')) return;
    try {
      await api.delete(`/api/StudentProfile/certifications/${id}`);
      setCerts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting certification:', err);
      alert('Failed to delete certification.');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
      credentialUrl: ''
    });
    setUploadedFileUrl(null);
    setFileName(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-card-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Badge Vault</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-text-main tracking-tight font-sans">
            Credentials Repository
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 font-sans">
            Manage your verified industry licenses and academic certification credentials.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-2xl bg-primary text-white text-xs font-bold hover:shadow-md active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto font-sans"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Credential</span>
        </button>
      </div>

      {/* Grid of Certs */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : certs.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center max-w-sm mx-auto flex flex-col items-center gap-3 border border-card-border/60">
          <Award className="w-10 h-10 text-text-muted/30 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-text-main">No certificates recorded</h3>
            <p className="text-xs text-[#8b949e] mt-1 leading-relaxed">
              Upload credentials to calculate your recruiter alignment score.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {certs.map(cert => (
            <motion.div
              key={cert.id}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.025, 
                rotateX: 2.5, 
                rotateY: -2.5,
                z: 10,
                transition: { duration: 0.25, ease: 'easeOut' }
              }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              className="relative glass rounded-3xl p-6 border border-card-border/60 flex flex-col justify-between gap-5 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left bg-gradient-to-br from-card-bg to-page-bg/40"
            >
              <div className={`absolute top-0 left-0 h-full w-[4px] ${
                cert.status === 'verified' 
                  ? 'bg-gradient-to-b from-[#10b981] to-[#34d399]' 
                  : cert.status === 'pending'
                  ? 'bg-gradient-to-b from-[#f59e0b] to-[#fbbf24]'
                  : 'bg-gradient-to-b from-[#ef4444] to-[#f87171]'
              }`} />

              <div>
                <div className="flex items-start justify-between gap-3 pl-1">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-text-main font-sans leading-snug tracking-tight">
                      {cert.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-bold">
                      <Building2 className="w-3.5 h-3.5 text-primary opacity-70" />
                      <span>{cert.issuer}</span>
                    </div>
                  </div>

                  <span className={`text-[8.5px] font-black font-mono px-2 py-0.5 rounded border tracking-wider uppercase shrink-0 ${
                    cert.status === 'verified'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : cert.status === 'pending'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : 'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {cert.status === 'verified' ? 'Verified' : cert.status === 'pending' ? 'Reviewing' : 'Rejected'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-5 pl-1 pt-3.5 border-t border-card-border/50 font-mono text-[10.5px]">
                  <div>
                    <span className="text-[8.5px] font-bold text-text-muted uppercase">Issue Date</span>
                    <p className="font-extrabold text-text-main mt-0.5">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[8.5px] font-bold text-text-muted uppercase">Credential ID</span>
                    <p className="font-extrabold text-text-main mt-0.5 truncate">{cert.credentialId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {cert.status === 'verified' && (
                <div className="absolute right-6 bottom-14 opacity-25 hover:opacity-60 transition-opacity select-none rotate-12 flex items-center justify-center pointer-events-none">
                  <div className="border-[3px] border-[#10b981] text-[#10b981] rounded-full p-2 flex items-center gap-1 font-mono text-[9px] font-black uppercase tracking-wider relative bg-[#10b981]/5">
                    <Verified className="w-4 h-4 text-[#10b981]" />
                    <span>MCC SEALED</span>
                  </div>
                </div>
              )}

              <div className="pt-3.5 border-t border-card-border/50 flex items-center justify-between mt-1 pl-1">
                {cert.credentialUrl ? (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary hover:underline"
                  >
                    <span>VERIFY CREDENTIAL NODE</span>
                    <ExternalLink className="w-3 h-3 text-primary" />
                  </a>
                ) : cert.fileUrl ? (
                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary hover:underline"
                  >
                    <span>VIEW DOCUMENT PDF</span>
                    <ExternalLink className="w-3 h-3 text-primary" />
                  </a>
                ) : (
                  <span className="text-[10px] text-text-muted/40 italic font-mono">// no verification endpoint</span>
                )}

                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                  title="Remove credential"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Upload Modal (featuring Interactive Blur Dropzone) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-card-border/80"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-card-border/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-extrabold text-text-main font-sans">Submit Credential Node</h3>
                    <p className="text-[9px] text-text-muted mt-0.5 font-mono">Upload verification files to recruiter index.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSave} className="overflow-y-auto flex-1 font-sans">
                <div className="px-6 py-5 space-y-4 text-left">
                  
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Credential Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. AWS Solutions Architect Associate"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="block w-full px-3 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                    />
                  </div>

                  {/* Issuer */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Issuing Organization *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Amazon Web Services (AWS)"
                      value={form.issuer}
                      onChange={e => setForm({ ...form, issuer: e.target.value })}
                      className="block w-full px-3 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Issue Date</label>
                      <input
                        type="date"
                        value={form.issueDate}
                        onChange={e => setForm({ ...form, issueDate: e.target.value })}
                        className="block w-full px-3 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                      />
                    </div>
                    {/* ID */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Credential ID</label>
                      <input
                        type="text"
                        placeholder="E.g. AWS-SAA-908"
                        value={form.credentialId}
                        onChange={e => setForm({ ...form, credentialId: e.target.value })}
                        className="block w-full px-3 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Verification URL</label>
                    <input
                      type="url"
                      placeholder="https://aws.amazon.com/verify/..."
                      value={form.credentialUrl}
                      onChange={e => setForm({ ...form, credentialUrl: e.target.value })}
                      className="block w-full px-3 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
                    />
                  </div>

                  {/* File Upload Simulation with Backdrop Blur hover dropzone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">Upload Verification PDF</label>
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleFileDrop}
                      className={`border border-dashed rounded-3xl p-6.5 text-center transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden ${
                        fileName
                          ? 'border-emerald-500/60 bg-emerald-500/5'
                          : dragOver 
                          ? 'border-primary bg-primary/5 backdrop-blur-md scale-[0.98]' 
                          : 'border-card-border bg-page-bg/15 hover:bg-page-bg/25'
                      }`}
                    >
                      {uploadingFile ? (
                        <Loader2 className="w-7 h-7 text-primary animate-spin" />
                      ) : (
                        <Upload className={`w-7 h-7 transition-colors ${fileName ? 'text-emerald-500' : 'text-text-muted/50'}`} />
                      )}
                      {fileName ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-text-main font-mono">{fileName}</p>
                          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">// FILE UPLOADED</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-text-main">Drag &amp; drop credential files here</p>
                          <p className="text-[9px] text-text-muted font-sans">Verification engines only support secure PDF formatting (5MB max).</p>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange} 
                        className="hidden" 
                        id="cert-file-picker" 
                      />
                      <label htmlFor="cert-file-picker" className="mt-1 text-[10px] font-bold text-primary hover:underline cursor-pointer font-sans">
                        Select file from device
                      </label>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4.5 border-t border-card-border/60 shrink-0 font-sans">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-bold text-text-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || uploadingFile}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Credential</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
