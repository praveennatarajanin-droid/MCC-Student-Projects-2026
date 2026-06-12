'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  GraduationCap, Plus, Edit3, Trash2, Loader2, Search,
  CheckCircle2, AlertCircle, X, ExternalLink, Building2,
  MapPin, BarChart2, Users, BadgeCheck, ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface Alumni {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  graduationYear: number;
  degree: string;
  department: string;
  currentEmployer: string;
  jobTitle: string;
  linkedInUrl: string;
  city: string;
  isVerified: boolean;
  createdAt: string;
}

interface AlumniStats {
  total: number;
  verified: number;
  topEmployers: { employer: string; count: number }[];
  byYear: { year: number; count: number }[];
}

// ── Variants ────────────────────────────────────────────────────────────────

const overlayV: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalV: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 28 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 26 } },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.16 } },
};
const toastV: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
  exit: { opacity: 0, y: 20 },
};
const cardV: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 16 } },
};
const listV: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

// ── Shared CSS ───────────────────────────────────────────────────────────────

const inputCls = 'block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder-text-muted/40';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

const defaultForm: Omit<Alumni, 'id' | 'createdAt'> = {
  name: '', email: '', registrationNumber: '', graduationYear: new Date().getFullYear(),
  degree: '', department: '', currentEmployer: '', jobTitle: '',
  linkedInUrl: '', city: '', isVerified: false,
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function AdminAlumniPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [stats, setStats] = useState<AlumniStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Alumni> & typeof defaultForm>({ ...defaultForm });
  const [isEdit, setIsEdit] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchAlumni = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterDept) params.department = filterDept;
      if (filterYear) params.year = filterYear;
      const r = await api.get('/api/Alumni', { params });
      setAlumni(r.data);
    } catch { showToast('error', 'Failed to load alumni records.'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const r = await api.get('/api/Alumni/stats');
      setStats(r.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchAlumni(); fetchStats(); }, []);
  useEffect(() => { fetchAlumni(); }, [filterDept, filterYear]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (isEdit && form.id) {
        const r = await api.put(`/api/Alumni/${form.id}`, payload);
        setAlumni(prev => prev.map(a => a.id === form.id ? r.data : a));
        showToast('success', 'Alumni record updated.');
      } else {
        const r = await api.post('/api/Alumni', payload);
        setAlumni(prev => [r.data, ...prev]);
        showToast('success', 'Alumni record added!');
      }
      closeModal();
      fetchStats();
    } catch { showToast('error', 'Failed to save record.'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this alumni record? This cannot be undone.')) return;
    try {
      await api.delete(`/api/Alumni/${id}`);
      setAlumni(prev => prev.filter(a => a.id !== id));
      showToast('success', 'Record deleted.');
      fetchStats();
    } catch { showToast('error', 'Failed to delete.'); }
  };

  const openAdd = () => { setForm({ ...defaultForm }); setIsEdit(false); setShowModal(true); };
  const openEdit = (a: Alumni) => { setForm({ ...a }); setIsEdit(true); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setForm({ ...defaultForm }); setIsEdit(false); };

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = alumni.filter(a =>
    !search ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.currentEmployer.toLowerCase().includes(search.toLowerCase()) ||
    a.department.toLowerCase().includes(search.toLowerCase())
  );

  const uniqueDepts = [...new Set(alumni.map(a => a.department).filter(Boolean))];
  const years = [...new Set(alumni.map(a => a.graduationYear).filter(Boolean))].sort((a, b) => b - a);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">Alumni Network</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Track and manage the MCC alumni ecosystem.</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Alumni</span>
        </motion.button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Alumni', val: stats.total, icon: GraduationCap, color: 'text-primary bg-primary/5' },
            { label: 'Verified', val: stats.verified, icon: BadgeCheck, color: 'text-emerald-600 bg-emerald-500/5' },
            { label: 'Top Employer', val: stats.topEmployers[0]?.employer || '—', icon: Building2, color: 'text-secondary bg-secondary/5' },
            { label: 'Latest Batch', val: years[0] || '—', icon: Users, color: 'text-indigo-600 bg-indigo-500/5' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass rounded-2xl p-4 border border-card-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">{s.label}</span>
                  <span className="text-lg font-black text-text-main mt-0.5 block truncate">{s.val}</span>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Graduation trend chart */}
      {stats && stats.byYear.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-card-border/60">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 mb-4">
            <BarChart2 className="w-4 h-4 text-primary" /> Alumni per Graduation Year
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byYear} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="year" fontSize={9} stroke="#86868b" />
                <YAxis fontSize={9} stroke="#86868b" />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }} />
                <Bar name="Alumni Count" dataKey="count" fill="#C8102E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder-text-muted/40"
            placeholder="Search by name, employer, or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-44">
          <select className={selectCls} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>
        <div className="relative w-36">
          <select className={selectCls} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Alumni list */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-12 flex flex-col items-center gap-3 text-center border border-card-border/60">
          <GraduationCap className="w-10 h-10 text-primary/30" />
          <p className="text-sm font-bold text-text-main">No alumni records found</p>
          <p className="text-xs text-text-muted">Add your first alumni record to start building the network.</p>
        </div>
      ) : (
        <motion.div variants={listV} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(a => (
            <motion.div
              key={a.id}
              variants={cardV}
              whileHover={{ y: -2 }}
              className="glass rounded-2xl p-5 border border-card-border/60 hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-text-main leading-tight">{a.name}</h3>
                      {a.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-text-muted font-medium">{a.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-all cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                  {isSuperAdmin && <button onClick={() => handleDelete(a.id)} className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-card-border/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <GraduationCap className="w-3 h-3 shrink-0" />
                  <span>{a.degree || 'N/A'} · {a.department || 'N/A'} · Class of {a.graduationYear}</span>
                </div>
                {a.currentEmployer && (
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="font-semibold text-text-main">{a.jobTitle}</span>
                    <span>@ {a.currentEmployer}</span>
                  </div>
                )}
                {a.city && (
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{a.city}</span>
                  </div>
                )}
                {a.linkedInUrl && (
                  <a href={a.linkedInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> LinkedIn Profile
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div variants={overlayV} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
            <motion.div variants={modalV} initial="hidden" animate="visible" exit="exit"
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
              onClick={e => e.stopPropagation()}>
              <div className="h-1 bg-gradient-to-r from-primary to-secondary shrink-0" />
              <div className="flex items-center justify-between px-7 pt-6 pb-4 shrink-0">
                <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  {isEdit ? 'Edit Alumni Record' : 'Add Alumni Record'}
                </h3>
                <button onClick={closeModal} className="p-1.5 rounded-xl hover:bg-primary/5 text-text-muted cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-7 pb-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Full Name *</label>
                    <input required className={inputCls} placeholder="e.g. Franklin Raj" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Email *</label>
                    <input required type="email" className={inputCls} placeholder="alumni@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Reg. Number</label>
                    <input className={inputCls} placeholder="MCC2022CS001" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Degree</label>
                    <input className={inputCls} placeholder="B.Sc. Computer Science" value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Department</label>
                    <input className={inputCls} placeholder="Computer Science" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Graduation Year *</label>
                    <input required type="number" min={1950} max={2099} className={inputCls} value={form.graduationYear} onChange={e => setForm(f => ({ ...f, graduationYear: parseInt(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">City</label>
                    <input className={inputCls} placeholder="Chennai" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Current Employer</label>
                    <input className={inputCls} placeholder="Google, Infosys…" value={form.currentEmployer} onChange={e => setForm(f => ({ ...f, currentEmployer: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Job Title</label>
                    <input className={inputCls} placeholder="Software Engineer" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">LinkedIn URL</label>
                    <input type="url" className={inputCls} placeholder="https://linkedin.com/in/…" value={form.linkedInUrl} onChange={e => setForm(f => ({ ...f, linkedInUrl: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isVerified} onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))} className="w-4 h-4 accent-primary rounded" />
                      <span className="text-xs font-semibold text-text-main">Verified — show on public alumni page</span>
                    </label>
                  </div>
                </div>
              </form>
              <div className="flex justify-end gap-2 px-7 py-5 border-t border-card-border/60 shrink-0">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border border-card-border text-xs font-semibold text-text-muted cursor-pointer hover:bg-page-bg/30 transition-all">Cancel</button>
                <motion.button type="submit" form="" whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all">
                  {isEdit ? 'Save Changes' : 'Add Record'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div key="toast" variants={toastV} initial="hidden" animate="visible" exit="exit"
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold backdrop-blur-md border ${
              toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-600' : 'bg-red-500/15 border-red-500/25 text-red-500'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
