'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Megaphone, MessageSquareWarning, Plus, Edit3, Trash2, Loader2,
  CheckCircle2, AlertCircle, X, Bell, Shield, Heart,
  ChevronDown, Send, Clock, CheckCheck,
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
  studentName?: string;
  studentEmail?: string;
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
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── Category meta ────────────────────────────────────────────────────────────

const catMeta: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  Event:   { icon: Bell,   color: 'text-primary',         bg: 'bg-primary/8',       border: 'border-primary/20' },
  Notice:  { icon: Shield, color: 'text-amber-500',       bg: 'bg-amber-500/8',     border: 'border-amber-500/20' },
  Welfare: { icon: Heart,  color: 'text-emerald-500',     bg: 'bg-emerald-500/8',   border: 'border-emerald-500/20' },
};

const statusMeta: Record<string, { color: string; bg: string }> = {
  Open:      { color: 'text-amber-600',   bg: 'bg-amber-500/10 border-amber-500/20' },
  Resolved:  { color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  Dismissed: { color: 'text-text-muted',  bg: 'bg-card-border/30 border-card-border' },
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────

export default function AdminAffairsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  const [tab, setTab] = useState<'announcements' | 'grievances'>('announcements');

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const defaultAnn: { id?: string; title: string; body: string; category: 'Event' | 'Notice' | 'Welfare'; isActive: boolean } = { id: '', title: '', body: '', category: 'Notice', isActive: true };
  const [annForm, setAnnForm] = useState<typeof defaultAnn>({ ...defaultAnn });

  // Grievances state
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loadingGrv, setLoadingGrv] = useState(false);
  const [activeGrievance, setActiveGrievance] = useState<Grievance | null>(null);
  const [replyForm, setReplyForm] = useState({ adminReply: '', status: 'Open' });

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
    try {
      const r = await api.get('/api/StudentAffairs/announcements/all');
      setAnnouncements(r.data);
    } catch { showToast('error', 'Failed to load announcements.'); }
    finally { setLoadingAnn(false); }
  };

  const fetchGrievances = async () => {
    setLoadingGrv(true);
    try {
      const r = await api.get('/api/StudentAffairs/grievances');
      setGrievances(r.data);
    } catch { showToast('error', 'Failed to load grievances.'); }
    finally { setLoadingGrv(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);
  useEffect(() => { if (tab === 'grievances') fetchGrievances(); }, [tab]);

  // ── Announcement CRUD ─────────────────────────────────────────────────────

  const saveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { title: annForm.title, body: annForm.body, category: annForm.category, isActive: annForm.isActive };
      if (annForm.id) {
        const r = await api.put(`/api/StudentAffairs/announcements/${annForm.id}`, payload);
        setAnnouncements(prev => prev.map(a => a.id === annForm.id ? r.data : a));
        showToast('success', 'Announcement updated.');
      } else {
        const r = await api.post('/api/StudentAffairs/announcements', payload);
        setAnnouncements(prev => [r.data, ...prev]);
        showToast('success', 'Announcement posted!');
      }
      setShowAnnModal(false);
      setAnnForm({ ...defaultAnn });
    } catch { showToast('error', 'Failed to save announcement.'); }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/api/StudentAffairs/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('success', 'Deleted.');
    } catch { showToast('error', 'Failed to delete.'); }
  };

  // ── Grievance respond ─────────────────────────────────────────────────────

  const respondToGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGrievance) return;
    try {
      await api.put(`/api/StudentAffairs/grievances/${activeGrievance.id}/respond`, replyForm);
      setGrievances(prev => prev.map(g => g.id === activeGrievance.id
        ? { ...g, adminReply: replyForm.adminReply, status: replyForm.status as Grievance['status'] }
        : g));
      showToast('success', 'Response saved.');
      setActiveGrievance(null);
    } catch { showToast('error', 'Failed to respond.'); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in pb-12 relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">Student Affairs</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">Manage campus announcements and student grievances.</p>
        </div>
        {tab === 'announcements' && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => { setAnnForm({ ...defaultAnn }); setShowAnnModal(true); }}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Announcement</span>
          </motion.button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 glass rounded-2xl border border-card-border/60 w-fit">
        {(['announcements', 'grievances'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
              tab === t ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {t === 'announcements' ? <span className="flex items-center gap-1.5"><Megaphone className="w-3.5 h-3.5" /> Announcements</span>
              : <span className="flex items-center gap-1.5"><MessageSquareWarning className="w-3.5 h-3.5" /> Grievances {grievances.filter(g => g.status === 'Open').length > 0 && <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px]">{grievances.filter(g => g.status === 'Open').length}</span>}</span>}
          </button>
        ))}
      </div>

      {/* ── ANNOUNCEMENTS TAB ────────────────────────────────────────────── */}
      {tab === 'announcements' && (
        <>
          {loadingAnn ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="glass rounded-3xl p-12 flex flex-col items-center gap-3 text-center border border-card-border/60">
              <Megaphone className="w-10 h-10 text-primary/30" />
              <p className="text-sm font-bold text-text-main">No announcements yet</p>
              <p className="text-xs text-text-muted">Post your first event, notice, or welfare update.</p>
            </div>
          ) : (
            <motion.div variants={listV} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map(ann => {
                const meta = catMeta[ann.category] || catMeta['Notice'];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={ann.id}
                    variants={cardV}
                    whileHover={{ y: -2 }}
                    className={`glass rounded-2xl p-5 border ${meta.border} flex flex-col gap-3 relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full ${ann.category === 'Event' ? 'bg-primary' : ann.category === 'Welfare' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <div className="pl-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.bg}`}>
                            <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}>{ann.category}</span>
                          {!ann.isActive && <span className="text-[8px] font-bold text-text-muted bg-card-border/50 px-1.5 py-0.5 rounded border border-card-border">Inactive</span>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => { setAnnForm({ id: ann.id, title: ann.title, body: ann.body, category: ann.category as 'Event'|'Notice'|'Welfare', isActive: ann.isActive }); setShowAnnModal(true); }} className="p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-all cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteAnnouncement(ann.id)} className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <h3 className="text-sm font-extrabold text-text-main mt-2 leading-snug">{ann.title}</h3>
                      <p className="text-xs text-text-muted/80 mt-1.5 leading-relaxed line-clamp-3">{ann.body}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-card-border/40">
                        <span className="text-[9px] text-text-muted font-medium">by {ann.createdBy}</span>
                        <span className="text-[9px] text-text-muted font-medium">{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
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
              <MessageSquareWarning className="w-10 h-10 text-primary/30" />
              <p className="text-sm font-bold text-text-main">No grievances submitted</p>
              <p className="text-xs text-text-muted">Student grievances will appear here for resolution.</p>
            </div>
          ) : (
            <motion.div variants={listV} initial="hidden" animate="visible" className="space-y-3">
              {grievances.map(g => {
                const sm = statusMeta[g.status] || statusMeta['Open'];
                return (
                  <motion.div
                    key={g.id}
                    variants={cardV}
                    className="glass rounded-2xl p-5 border border-card-border/60 flex items-start justify-between gap-4 hover:border-primary/20 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${sm.bg} ${sm.color}`}>
                          {g.status}
                        </span>
                        <span className="text-xs font-extrabold text-text-main leading-snug truncate">{g.subject}</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed line-clamp-2">{g.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[9px] text-text-muted font-medium">
                        <span>{g.studentName || 'Unknown Student'}</span>
                        <span>·</span>
                        <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                        {g.adminReply && <><span>·</span><span className="text-emerald-500 flex items-center gap-0.5"><CheckCheck className="w-3 h-3" /> Replied</span></>}
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveGrievance(g); setReplyForm({ adminReply: g.adminReply, status: g.status }); }}
                      className="shrink-0 px-3 py-1.5 rounded-xl border border-card-border bg-page-bg/30 text-xs font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                    >
                      Respond
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      {/* ── Announcement Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAnnModal && (
          <motion.div variants={overlayV} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowAnnModal(false); }}>
            <motion.div variants={modalV} initial="hidden" animate="visible" exit="exit"
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-extrabold text-text-main">{annForm.id ? 'Edit Announcement' : 'New Announcement'}</h3>
                  <button onClick={() => setShowAnnModal(false)} className="p-1.5 rounded-xl hover:bg-primary/5 text-text-muted cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={saveAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Title *</label>
                    <input required className={inputCls} placeholder="Announcement title…" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Body *</label>
                    <textarea required rows={4} className={textareaCls} placeholder="Full details of the announcement…" value={annForm.body} onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Category</label>
                      <div className="relative">
                        <select className={selectCls} value={annForm.category} onChange={e => setAnnForm(f => ({ ...f, category: e.target.value as 'Event'|'Notice'|'Welfare' }))}>
                          <option value="Notice">Notice</option>
                          <option value="Event">Event</option>
                          <option value="Welfare">Welfare</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={annForm.isActive} onChange={e => setAnnForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-primary rounded" />
                        <span className="text-xs font-semibold text-text-main">Active (visible to students)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
                    <button type="button" onClick={() => setShowAnnModal(false)} className="px-4 py-2 rounded-xl border border-card-border text-xs font-semibold text-text-muted cursor-pointer hover:bg-page-bg/30 transition-all">Cancel</button>
                    <motion.button type="submit" whileTap={{ scale: 0.97 }} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all">
                      {annForm.id ? 'Save Changes' : 'Post Announcement'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grievance Reply Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {activeGrievance && (
          <motion.div variants={overlayV} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setActiveGrievance(null); }}>
            <motion.div variants={modalV} initial="hidden" animate="visible" exit="exit"
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="h-1 bg-gradient-to-r from-amber-400 to-primary" />
              <div className="p-7">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-amber-500" />
                    Respond to Grievance
                  </h3>
                  <button onClick={() => setActiveGrievance(null)} className="p-1.5 rounded-xl hover:bg-primary/5 text-text-muted cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="mb-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <p className="text-xs font-bold text-amber-600 mb-1">{activeGrievance.subject}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">{activeGrievance.description}</p>
                  <p className="text-[9px] text-text-muted mt-2">— {activeGrievance.studentName} · {new Date(activeGrievance.createdAt).toLocaleDateString()}</p>
                </div>
                <form onSubmit={respondToGrievance} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Admin Reply</label>
                    <textarea rows={4} className={textareaCls} placeholder="Write your response to the student…" value={replyForm.adminReply} onChange={e => setReplyForm(f => ({ ...f, adminReply: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Update Status</label>
                    <div className="relative">
                      <select className={selectCls} value={replyForm.status} onChange={e => setReplyForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="Open">Open</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
                    <button type="button" onClick={() => setActiveGrievance(null)} className="px-4 py-2 rounded-xl border border-card-border text-xs font-semibold text-text-muted cursor-pointer hover:bg-page-bg/30 transition-all">Cancel</button>
                    <motion.button type="submit" whileTap={{ scale: 0.97 }} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-primary text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Send Response
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
