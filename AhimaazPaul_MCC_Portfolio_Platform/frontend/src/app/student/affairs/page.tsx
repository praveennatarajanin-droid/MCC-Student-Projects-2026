'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Megaphone, MessageSquareWarning, Plus, Loader2,
  CheckCircle2, AlertCircle, X, Bell, Shield, Heart,
  ChevronDown, Send, CheckCheck, Clock, RefreshCw,
} from 'lucide-react';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'Event' | 'Notice' | 'Welfare';
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

interface Grievance {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'Resolved' | 'Dismissed';
  adminReply: string;
  createdAt: string;
  resolvedAt?: string;
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
const listV: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

// ── Shared CSS ───────────────────────────────────────────────────────────────

const inputCls = 'block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder-text-muted/40';
const textareaCls = `${inputCls} resize-none`;

// ── Category meta ─────────────────────────────────────────────────────────────

const catMeta: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  Event:   { icon: Bell,   color: 'text-primary',       bg: 'bg-primary/8',     border: 'border-primary/20',     label: 'Event' },
  Notice:  { icon: Shield, color: 'text-amber-500',     bg: 'bg-amber-500/8',   border: 'border-amber-500/20',   label: 'Notice' },
  Welfare: { icon: Heart,  color: 'text-emerald-500',   bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', label: 'Welfare' },
};

const statusMeta: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Open:      { color: 'text-amber-600',   bg: 'bg-amber-500/10 border-amber-500/20',       icon: Clock },
  Resolved:  { color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20',   icon: CheckCheck },
  Dismissed: { color: 'text-text-muted',  bg: 'bg-card-border/30 border-card-border',      icon: X },
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function StudentAffairsPage() {
  const [tab, setTab] = useState<'announcements' | 'grievances'>('announcements');

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [filterCat, setFilterCat] = useState<string>('All');

  // Grievances
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loadingGrv, setLoadingGrv] = useState(false);
  const [showGrvModal, setShowGrvModal] = useState(false);
  const [grvForm, setGrvForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchAnnouncements = async () => {
    setLoadingAnn(true);
    try {
      const r = await api.get('/api/StudentAffairs/announcements');
      setAnnouncements(r.data);
    } catch { showToast('error', 'Failed to load announcements.'); }
    finally { setLoadingAnn(false); }
  };

  const fetchGrievances = async () => {
    setLoadingGrv(true);
    try {
      const r = await api.get('/api/StudentAffairs/grievances/mine');
      setGrievances(r.data);
    } catch { showToast('error', 'Failed to load grievances.'); }
    finally { setLoadingGrv(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);
  useEffect(() => { if (tab === 'grievances') fetchGrievances(); }, [tab]);

  // ── Submit grievance ─────────────────────────────────────────────────────

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post('/api/StudentAffairs/grievances', grvForm);
      setGrievances(prev => [r.data, ...prev]);
      showToast('success', 'Grievance submitted! The administration will respond shortly.');
      setShowGrvModal(false);
      setGrvForm({ subject: '', description: '' });
    } catch { showToast('error', 'Failed to submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  // ── Filtered announcements ────────────────────────────────────────────────

  const filteredAnn = filterCat === 'All' ? announcements : announcements.filter(a => a.category === filterCat);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">Student Affairs</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Campus announcements, events, and grievance tracking.</p>
        </div>
        {tab === 'grievances' && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowGrvModal(true)}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-500 text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Grievance</span>
          </motion.button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 glass rounded-2xl border border-card-border/60 w-fit">
        {(['announcements', 'grievances'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === t ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {t === 'announcements'
              ? <span className="flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5" /> Announcements</span>
              : <span className="flex items-center gap-1.5"><MessageSquareWarning className="w-3.5 h-3.5" /> My Grievances</span>}
          </button>
        ))}
      </div>

      {/* ── ANNOUNCEMENTS TAB ────────────────────────────────────────────── */}
      {tab === 'announcements' && (
        <>
          {/* Category filter chips */}
          <div className="flex gap-2 flex-wrap">
            {['All', 'Event', 'Notice', 'Welfare'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  filterCat === cat
                    ? 'bg-primary text-white border-primary'
                    : 'border-card-border text-text-muted hover:border-primary/30 hover:text-text-main'
                }`}
              >
                {cat}
              </button>
            ))}
            <button onClick={fetchAnnouncements} className="ml-auto p-1.5 rounded-xl border border-card-border text-text-muted hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAnn ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingAnn ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredAnn.length === 0 ? (
            <div className="glass rounded-3xl p-12 flex flex-col items-center gap-3 text-center border border-card-border/60">
              <Megaphone className="w-10 h-10 text-primary/30" />
              <p className="text-sm font-bold text-text-main">No announcements</p>
              <p className="text-xs text-text-muted">Check back later for campus updates.</p>
            </div>
          ) : (
            <motion.div variants={listV} initial="hidden" animate="visible" className="space-y-4">
              {filteredAnn.map(ann => {
                const meta = catMeta[ann.category] || catMeta['Notice'];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={ann.id}
                    variants={cardV}
                    whileHover={{ y: -2 }}
                    className={`glass rounded-2xl p-5 border ${meta.border} relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${ann.category === 'Event' ? 'bg-primary' : ann.category === 'Welfare' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="pl-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${meta.bg}`}>
                            <Icon className={`w-3 h-3 ${meta.color}`} />
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                        </div>
                        <span className="text-[9px] text-text-muted font-medium">{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-text-main leading-snug">{ann.title}</h3>
                      <p className="text-xs text-text-muted/80 mt-1.5 leading-relaxed">{ann.body}</p>
                      <p className="text-[9px] text-text-muted mt-3 font-medium">Posted by {ann.createdBy}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* ── GRIEVANCES TAB ───────────────────────────────────────────────── */}
      {tab === 'grievances' && (
        <>
          {loadingGrv ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : grievances.length === 0 ? (
            <div className="glass rounded-3xl p-12 flex flex-col items-center gap-3 text-center border border-card-border/60">
              <MessageSquareWarning className="w-10 h-10 text-amber-400/60" />
              <p className="text-sm font-bold text-text-main">No grievances yet</p>
              <p className="text-xs text-text-muted max-w-[220px]">
                Have a concern? Submit it here and the administration will respond.
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowGrvModal(true)}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Submit a Grievance
              </motion.button>
            </div>
          ) : (
            <motion.div variants={listV} initial="hidden" animate="visible" className="space-y-4">
              {grievances.map(g => {
                const sm = statusMeta[g.status] || statusMeta['Open'];
                const StatusIcon = sm.icon;
                return (
                  <motion.div key={g.id} variants={cardV} className="glass rounded-2xl p-5 border border-card-border/60 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-extrabold text-text-main leading-snug">{g.subject}</h3>
                      <span className={`shrink-0 flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${sm.bg} ${sm.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />{g.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted/80 leading-relaxed">{g.description}</p>
                    {g.adminReply && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest block mb-1 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Admin Response
                        </span>
                        <p className="text-[11px] text-text-muted leading-relaxed italic">"{g.adminReply}"</p>
                      </div>
                    )}
                    <p className="text-[9px] text-text-muted font-medium pt-1 border-t border-card-border/40">
                      Submitted {new Date(g.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {g.resolvedAt && ` · Resolved ${new Date(g.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* ── Submit Grievance Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showGrvModal && (
          <motion.div variants={overlayV} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowGrvModal(false); }}>
            <motion.div variants={modalV} initial="hidden" animate="visible" exit="exit"
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="h-1 bg-gradient-to-r from-amber-400 to-primary" />
              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-amber-500" />
                    Submit a Grievance
                  </h3>
                  <button onClick={() => setShowGrvModal(false)} className="p-1.5 rounded-xl hover:bg-primary/5 text-text-muted cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <p className="text-xs text-text-muted mb-5 leading-relaxed">
                  Your grievance will be reviewed by the Student Affairs administration. You can track the status and receive a response from this page.
                </p>
                <form onSubmit={handleSubmitGrievance} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Subject *</label>
                    <input required className={inputCls} placeholder="Brief description of the issue…" value={grvForm.subject} onChange={e => setGrvForm(f => ({ ...f, subject: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Description *</label>
                    <textarea required rows={5} className={textareaCls} placeholder="Describe the situation in detail, including dates, names, and any relevant context…" value={grvForm.description} onChange={e => setGrvForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
                    <button type="button" onClick={() => setShowGrvModal(false)} className="px-4 py-2 rounded-xl border border-card-border text-xs font-semibold text-text-muted cursor-pointer hover:bg-page-bg/30 transition-all">Cancel</button>
                    <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-60">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Submit
                    </motion.button>
                  </div>
                </form>
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
