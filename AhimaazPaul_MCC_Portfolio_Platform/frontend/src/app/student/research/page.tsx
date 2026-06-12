'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  BookOpen, Lightbulb, Calendar, Plus,
  Edit3, Trash2, Loader2, Award, ArrowUpRight,
  CheckCircle2, AlertCircle, X, Rocket, FlaskConical,
  FileText, Link2, Sparkles, Clock, Tag, ChevronDown,
} from 'lucide-react';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  journalOrConference: string;
  publishDate: string;
  paperUrl: string;
  isInnovationProject: boolean;
  prototypeStatus: string;
  startupIdeaPitch: string;
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 28 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 26 } },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.16 } },
};

const toastVariants: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
  exit: { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.18 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 130, damping: 16 } },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Shared Styles ─────────────────────────────────────────────────────────────

const inputCls =
  'block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder-text-muted/40';
const textareaCls = `${inputCls} resize-none`;
const selectCls =
  'block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all appearance-none cursor-pointer';

// ─── Field Component ───────────────────────────────────────────────────────────

const Field = ({
  label, icon: Icon, children,
}: {
  label: string; icon?: React.ElementType; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
      {Icon && <Icon className="w-3 h-3 opacity-70" />}
      {label}
    </label>
    {children}
  </div>
);

// ─── Status Badge ──────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  Concept: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  Prototype: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  Released: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
};

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = ({
  icon: Icon, title, desc, onAdd, label, color, bg,
}: {
  icon: React.ElementType; title: string; desc: string;
  onAdd: () => void; label: string; color: string; bg: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center text-center py-12 px-6 gap-4"
  >
    <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center`}>
      <Icon className={`w-7 h-7 ${color} opacity-50`} />
    </div>
    <div>
      <p className="text-sm font-bold text-text-main">{title}</p>
      <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[200px]">{desc}</p>
    </div>
    <button
      type="button"
      onClick={onAdd}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${bg} ${color} text-xs font-bold hover:opacity-80 transition-all cursor-pointer`}
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ResearchModule() {
  const [researchList, setResearchList] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const defaultForm = {
    title: '',
    abstract: '',
    journalOrConference: '',
    publishDate: '',
    paperUrl: '',
    isInnovationProject: false,
    prototypeStatus: 'Concept',
    startupIdeaPitch: '',
  };
  const [form, setForm] = useState<{ id?: string } & typeof defaultForm>({ ...defaultForm });

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchResearch = async () => {
    try {
      const response = await api.get('/api/StudentProfile/me');
      setResearchList(response.data.researchPapers || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load research entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResearch(); }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        publishDate: form.publishDate ? new Date(form.publishDate).toISOString() : null,
      };
      if (form.id) {
        const res = await api.put(`/api/StudentProfile/research/${form.id}`, payload);
        setResearchList(prev => prev.map(r => r.id === form.id ? res.data : r));
        showToast('success', 'Entry updated successfully.');
      } else {
        const res = await api.post('/api/StudentProfile/research', payload);
        setResearchList(prev => [...prev, res.data]);
        showToast('success', form.isInnovationProject ? 'Innovation added!' : 'Publication added!');
      }
      closeModal();
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await api.delete(`/api/StudentProfile/research/${id}`);
      setResearchList(prev => prev.filter(r => r.id !== id));
      showToast('success', 'Entry deleted.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ ...defaultForm });
  };

  const openAddModal = (isInnovation: boolean) => {
    setForm({ ...defaultForm, isInnovationProject: isInnovation });
    setShowModal(true);
  };

  const openEditModal = (item: ResearchPaper) => {
    setForm({ ...item, publishDate: item.publishDate ? item.publishDate.substring(0, 10) : '' });
    setShowModal(true);
  };

  // ── Loading State ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          </div>
          <p className="text-xs font-semibold text-text-muted">Loading research entries…</p>
        </div>
      </div>
    );
  }

  const publications = researchList.filter(r => !r.isInnovationProject);
  const innovations  = researchList.filter(r => r.isInnovationProject);
  const isEdit = !!form.id;

  return (
    <div className="space-y-8 animate-fade-in relative pb-8">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Research &amp; Innovations
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 font-sans">
            Manage your academic publications, prototype specs, and startup pitches in your laboratory workbench.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => openAddModal(false)}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Paper</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => openAddModal(true)}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-secondary text-white text-[10px] font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Add Pitch</span>
          </motion.button>
        </div>
      </div>

      {/* ── Workbench KPI Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-[24px] p-4.5 flex items-center justify-between border border-card-border/60 shadow-sm">
          <div>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Publications</span>
            <span className="text-xl font-black text-primary block mt-0.5">{publications.length}</span>
          </div>
          <FlaskConical className="w-8 h-8 text-primary/20 shrink-0" />
        </div>
        <div className="glass rounded-[24px] p-4.5 flex items-center justify-between border border-card-border/60 shadow-sm">
          <div>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Startup Ideas</span>
            <span className="text-xl font-black text-secondary block mt-0.5">{innovations.length}</span>
          </div>
          <Rocket className="w-8 h-8 text-secondary/20 shrink-0" />
        </div>
        <div className="glass rounded-[24px] p-4.5 flex items-center justify-between border border-card-border/60 shadow-sm">
          <div>
            <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Active Prototypes</span>
            <span className="text-xl font-black text-emerald-500 block mt-0.5">
              {innovations.filter(i => i.prototypeStatus === 'Prototype' || i.prototypeStatus === 'Released').length}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/20 shrink-0" />
        </div>
      </div>

      {/* ── Sections Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PUBLICATIONS */}
        <div className="glass rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between border border-card-border/60">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-card-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-text-main">Academic Papers</h3>
                <p className="text-[10px] text-text-muted">Research papers &amp; journal registers</p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10 tracking-widest uppercase">
              {publications.length} Total
            </span>
          </div>

          <div className="p-6 flex-1">
            {publications.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No publications cataloged"
                desc="Add your conference proceedings, journal entries, or academic reports."
                onAdd={() => openAddModal(false)}
                label="Add Paper"
                color="text-primary"
                bg="bg-primary/5"
              />
            ) : (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {publications.map(paper => (
                  <motion.div
                    key={paper.id}
                    variants={cardVariants}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-primary/10 bg-primary/3 hover:bg-primary/5 hover:border-primary/25 transition-all duration-300 relative text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xs font-bold text-primary leading-snug line-clamp-2">{paper.title}</h4>
                        <span className="text-[8px] font-black text-text-muted shrink-0 uppercase tracking-widest bg-white/40 dark:bg-black/40 px-2 py-0.5 rounded border border-card-border/50">
                          {paper.publishDate ? new Date(paper.publishDate).getFullYear() : 'N/A'}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-text-muted font-bold tracking-wide uppercase font-sans">
                        Published: {paper.journalOrConference || 'Academic journal'}
                      </p>
                      
                      {paper.abstract && (
                        <p className="text-[11px] text-text-muted/80 leading-relaxed font-sans line-clamp-3">
                          {paper.abstract}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-card-border/40 mt-3">
                        {paper.paperUrl ? (
                          <a
                            href={paper.paperUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:underline font-sans"
                          >
                            <span>Read article</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[9px] text-text-muted/50 italic font-sans">No abstract link</span>
                        )}
                        <div className="flex items-center gap-1.5 no-print">
                          <button
                            onClick={() => openEditModal(paper)}
                            className="p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(paper.id)}
                            className="p-1 rounded hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* INNOVATIONS */}
        <div className="glass rounded-[32px] overflow-hidden shadow-sm flex flex-col justify-between border border-card-border/60">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-card-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center shrink-0">
                <Lightbulb className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-text-main">Innovation &amp; Startup Ideas</h3>
                <p className="text-[10px] text-text-muted">Prototypes, inventions, and startup pitches</p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold text-secondary bg-secondary/5 px-2.5 py-0.5 rounded-full border border-secondary/10 tracking-widest uppercase">
              {innovations.length} Total
            </span>
          </div>

          <div className="p-6 flex-1">
            {innovations.length === 0 ? (
              <EmptyState
                icon={Lightbulb}
                title="No innovations yet"
                desc="Log your prototypes, research ideas, and startup pitches."
                onAdd={() => openAddModal(true)}
                label="Add Pitch"
                color="text-secondary"
                bg="bg-secondary/5"
              />
            ) : (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {innovations.map(inn => (
                  <motion.div
                    key={inn.id}
                    variants={cardVariants}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-secondary/10 bg-secondary/3 hover:bg-secondary/5 hover:border-secondary/25 transition-all duration-300 relative text-left"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xs font-bold text-secondary leading-snug line-clamp-2">{inn.title}</h4>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${statusColors[inn.prototypeStatus] || statusColors['Concept']}`}>
                          {inn.prototypeStatus || 'Concept'}
                        </span>
                      </div>
                      
                      {inn.abstract && (
                        <p className="text-[11px] text-text-muted/80 leading-relaxed font-sans line-clamp-2">
                          {inn.abstract}
                        </p>
                      )}

                      {inn.startupIdeaPitch && (
                        <div className="mt-3 p-3 rounded-xl bg-secondary/5 border border-secondary/10 shadow-inner">
                          <span className="text-[8px] font-black uppercase text-secondary tracking-widest block mb-1.5 flex items-center gap-1.5">
                            <Rocket className="w-3 h-3 text-secondary animate-pulse" />
                            <span>Startup Pitch</span>
                          </span>
                          <p className="text-[10px] text-text-muted leading-relaxed italic">
                            &ldquo;{inn.startupIdeaPitch}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-card-border/40 mt-3">
                        {inn.paperUrl ? (
                          <a
                            href={inn.paperUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-secondary hover:underline"
                          >
                            <span>View Prototype</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-text-muted/50 italic">No prototype link</span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(inn)}
                            className="p-1.5 rounded-lg hover:bg-secondary/8 text-text-muted hover:text-secondary transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inn.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/8 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Top accent bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${form.isInnovationProject ? 'from-secondary to-amber-400' : 'from-primary to-secondary'} shrink-0`} />

              {/* Header */}
              <div className="flex items-center justify-between px-7 pt-6 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${form.isInnovationProject ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {form.isInnovationProject ? <Lightbulb className="w-4.5 h-4.5" /> : <BookOpen className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-main leading-tight">
                      {isEdit ? 'Edit Entry' : form.isInnovationProject ? 'New Innovation / Startup Pitch' : 'New Academic Publication'}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {form.isInnovationProject ? 'Prototype, startup idea, or research project' : 'Journal article, conference paper, or preprint'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 rounded-xl hover:bg-primary/5 text-text-muted hover:text-text-main transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable form body */}
              <form onSubmit={handleSave} className="overflow-y-auto flex-1">
                <div className="px-7 pb-2 space-y-4">

                  {/* Title */}
                  <Field label="Title *" icon={FileText}>
                    <input
                      type="text"
                      required
                      placeholder={
                        form.isInnovationProject
                          ? 'E.g. AgriSense IoT Sensor Array'
                          : 'E.g. Convolutional Neural Networks on Campus Foliage'
                      }
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className={inputCls}
                    />
                  </Field>

                  {/* Abstract */}
                  <Field label="Abstract / Overview *" icon={Sparkles}>
                    <textarea
                      rows={4}
                      required
                      placeholder="Explain the background, methodology, and direct impact of this work…"
                      value={form.abstract}
                      onChange={e => setForm({ ...form, abstract: e.target.value })}
                      className={textareaCls}
                    />
                  </Field>

                  {/* Conditional fields */}
                  {!form.isInnovationProject ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Journal / Conference" icon={Award}>
                        <input
                          type="text"
                          placeholder="IEEE Conference on AI 2026"
                          value={form.journalOrConference}
                          onChange={e => setForm({ ...form, journalOrConference: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Publish Date" icon={Calendar}>
                        <input
                          type="date"
                          value={form.publishDate}
                          onChange={e => setForm({ ...form, publishDate: e.target.value })}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Prototype Status" icon={FlaskConical}>
                          <div className="relative">
                            <select
                              value={form.prototypeStatus}
                              onChange={e => setForm({ ...form, prototypeStatus: e.target.value })}
                              className={selectCls}
                            >
                              <option value="Concept">Concept / Idea</option>
                              <option value="Prototype">Working Prototype</option>
                              <option value="Released">Released Open Source</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                          </div>
                        </Field>
                        <Field label="Target Completion Date" icon={Clock}>
                          <input
                            type="date"
                            value={form.publishDate}
                            onChange={e => setForm({ ...form, publishDate: e.target.value })}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                      <Field label="Startup Pitch / Value Proposition" icon={Rocket}>
                        <textarea
                          rows={3}
                          placeholder="Why is this a viable startup? Who is the customer? E.g., subscription IoT monitoring for farms…"
                          value={form.startupIdeaPitch}
                          onChange={e => setForm({ ...form, startupIdeaPitch: e.target.value })}
                          className={textareaCls}
                        />
                      </Field>
                    </div>
                  )}

                  {/* URL */}
                  <Field label="Paper / Code / Presentation URL" icon={Link2}>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/…"
                      value={form.paperUrl}
                      onChange={e => setForm({ ...form, paperUrl: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2.5 px-7 py-5 border-t border-card-border/60 mt-2 shrink-0">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className={`px-5 py-2 rounded-xl text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all bg-gradient-to-r ${
                      form.isInnovationProject ? 'from-secondary to-amber-500' : 'from-primary to-primary-hover'
                    }`}
                  >
                    {isEdit ? 'Save Changes' : form.isInnovationProject ? 'Add Innovation' : 'Add Publication'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-600'
                : 'bg-red-500/15 border-red-500/25 text-red-500'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
