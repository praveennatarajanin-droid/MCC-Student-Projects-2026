'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi, authApi, aiApi, User } from '@/lib/api';
import {
  User as UserIcon, BookOpen, Briefcase, Award, GraduationCap, Flame, Globe,
  Sparkles, Trash2, Plus, Edit3, Eye, FileText, CheckCircle2, LogOut, Code,
  Compass, X, Camera, Image as ImageIcon, Link2, Megaphone, Palette, MapPin,
  Mail, GitBranch, Bell, CheckCheck
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

/* ─── Helpers ─────────────────────────────────────────────────── */
const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.readAsDataURL(file);
    r.onload = () => res(r.result as string);
    r.onerror = rej;
  });

const fieldClass =
  'w-full px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-theme-primary/30';

const NAV_TABS = [
  { id: 'profile',        label: 'Profile',        icon: <UserIcon size={16} /> },
  { id: 'items',          label: 'Portfolio',       icon: <Briefcase size={16} /> },
  { id: 'achievements',   label: 'Activities',      icon: <Award size={16} /> },
  { id: 'notifications',  label: 'Notifications',   icon: <Bell size={16} /> },
  { id: 'ai',             label: 'AI Assistant',    icon: <Sparkles size={16} /> },
  { id: 'preview',        label: 'Live Preview',    icon: <Eye size={16} /> },
];

/* ─── Notification read-tracking helpers (localStorage) ──────── */
const NOTIF_READ_KEY = 'mcc_read_notifications';
function getReadNotifIds(): Set<number> {
  try {
    const raw = localStorage.getItem(NOTIF_READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}
function markNotifRead(ids: number[]) {
  const current = getReadNotifIds();
  ids.forEach(id => current.add(id));
  localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...current]));
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─── Sub-component: Section heading ──────────────────────────── */
function SectionHead({ icon, title, onAdd, addLabel }: {
  icon: React.ReactNode; title: string; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-theme-border/40">
      <h2 className="text-sm font-bold flex items-center gap-2 text-theme-fg/80">
        <span className="text-theme-primary">{icon}</span>
        {title}
      </h2>
      {onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover cursor-pointer transition-all shadow-sm"
        >
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

/* ─── Sub-component: Empty state ──────────────────────────────── */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center text-sm text-theme-fg/35 font-semibold italic border-2 border-dashed border-theme-border/30 rounded-2xl">
      No {label} added yet.
    </div>
  );
}

/* ─── Sub-component: Alert banner ────────────────────────────── */
function AlertBanner({ type, message, onClose }: {
  type: 'success' | 'error'; message: string; onClose: () => void;
}) {
  const styles = type === 'success'
    ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    : 'bg-red-500/8 border-red-500/20 text-red-500';
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className={`mb-5 px-4 py-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 overflow-hidden ${styles}`}
    >
      <span className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle2 size={13} /> : <X size={13} />}
        {message}
      </span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [themesList, setThemesList] = useState<any[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<Set<number>>(new Set());

  /* Profile form */
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [sop, setSop] = useState('');
  const [theme, setTheme] = useState('Academic');
  const [department, setDepartment] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [behanceUrl, setBehanceUrl] = useState('');

  /* AI states */
  const [aiTargetGoal, setAiTargetGoal] = useState("Master's in Computer Science");
  const [aiTone, setAiTone] = useState('Professional');
  const [generatedSop, setGeneratedSop] = useState('');
  const [aiScore, setAiScore] = useState<any>(null);
  const [aiCareer, setAiCareer] = useState<any>(null);
  const [generatingSop, setGeneratingSop] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingCareer, setLoadingCareer] = useState(false);

  /* CRUD modal */
  const [modalType, setModalType] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formFields, setFormFields] = useState<any>({});

  /* ── Bootstrap ── */
  useEffect(() => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'Student') { router.push('/login'); return; }
    setCurrentUser(user);
    fetchProfile();
    fetchAnnouncements();
    fetchThemes();
    setReadNotifIds(getReadNotifIds());
  }, []);

  const fetchThemes = async () => {
    try {
      const data = await portfolioApi.getEnabledThemes();
      setThemesList(data || []);
    } catch {}
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await portfolioApi.getActiveNotifications();
      setAnnouncements(data || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'ai') { loadScore(); loadCareer(); }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getMyProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setBio(data.bio || '');
      setSop(data.sop || '');
      setTheme(data.theme || 'Academic');
      setDepartment(data.department || '');
      setBannerUrl(data.bannerUrl || '');
      setAvatarUrl(data.avatarUrl || '');
      setGithubUrl(data.githubUrl || '');
      setBehanceUrl(data.behanceUrl || '');
    } catch (e: any) { setError(e.message || 'Failed to load profile.'); }
    finally { setLoading(false); }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const updated = await portfolioApi.updateProfile({ fullName, bio, sop, theme, department, bannerUrl, avatarUrl, githubUrl, behanceUrl });
      setProfile(updated);
      setSuccess('Profile saved successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { setError(e.message || 'Failed to update profile.'); }
  };

  const handleLogout = () => { authApi.logout(); router.push('/'); };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      '⚠️ PERMANENTLY DELETE YOUR PORTFOLIO?\n\nThis will erase your account, all projects, certifications, research, and every item you have added.\n\nThis action CANNOT be undone.\n\nType OK to confirm.'
    );
    if (!confirmed) return;
    try {
      await portfolioApi.deleteMyAccount();
      authApi.logout();
      router.push('/?deleted=1');
    } catch (e: any) {
      setError(e.message || 'Failed to delete account. Please try again.');
    }
  };

  /* ── AI ── */
  const loadScore = async () => {
    setLoadingScore(true);
    try { setAiScore(await aiApi.getResumeSuggestions()); }
    catch { setError('Failed to load AI resume score.'); }
    finally { setLoadingScore(false); }
  };

  const loadCareer = async () => {
    setLoadingCareer(true);
    try { setAiCareer(await aiApi.getCareerRecommendations()); }
    catch { setError('Failed to load career guidance.'); }
    finally { setLoadingCareer(false); }
  };

  const handleGenerateSop = async () => {
    setGeneratingSop(true);
    try { setGeneratedSop((await aiApi.generateSOP(aiTargetGoal, aiTone)).sop); }
    catch { setError('Failed to generate SOP.'); }
    finally { setGeneratingSop(false); }
  };

  /* ── CRUD ── */
  const openModal = (type: string, item: any = null) => {
    setModalType(type); setEditingItem(item);
    setFormFields(item ? { ...item } : {});
  };
  const closeModal = () => { setModalType(null); setEditingItem(null); setFormFields({}); };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingItem;
      if (modalType === 'project') isEdit ? await portfolioApi.updateProject(editingItem.id, formFields) : await portfolioApi.addProject(formFields);
      else if (modalType === 'certification') isEdit ? await portfolioApi.updateCertification(editingItem.id, formFields) : await portfolioApi.addCertification(formFields);
      else if (modalType === 'research') isEdit ? await portfolioApi.updateResearch(editingItem.id, formFields) : await portfolioApi.addResearch(formFields);
      else if (modalType === 'achievement') isEdit ? await portfolioApi.updateAchievement(editingItem.id, formFields) : await portfolioApi.addAchievement(formFields);
      else if (modalType === 'hackathon') isEdit ? await portfolioApi.updateHackathon(editingItem.id, formFields) : await portfolioApi.addHackathon(formFields);
      else if (modalType === 'service') isEdit ? await portfolioApi.updateCommunityService(editingItem.id, formFields) : await portfolioApi.addCommunityService(formFields);
      else if (modalType === 'creative') isEdit ? await portfolioApi.updateCreativeWork(editingItem.id, formFields) : await portfolioApi.addCreativeWork(formFields);
      setSuccess('Saved successfully!'); closeModal(); fetchProfile();
    } catch (e: any) { setError(e.message || 'Failed to save.'); }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Delete this item permanently?')) return;
    try {
      if (type === 'project') await portfolioApi.deleteProject(id);
      else if (type === 'certification') await portfolioApi.deleteCertification(id);
      else if (type === 'research') await portfolioApi.deleteResearch(id);
      else if (type === 'achievement') await portfolioApi.deleteAchievement(id);
      else if (type === 'hackathon') await portfolioApi.deleteHackathon(id);
      else if (type === 'service') await portfolioApi.deleteCommunityService(id);
      else if (type === 'creative') await portfolioApi.deleteCreativeWork(id);
      setSuccess('Item deleted.'); fetchProfile();
    } catch { setError('Failed to delete item.'); }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-theme-primary border-t-transparent animate-spin" />
      <p className="text-sm font-semibold text-theme-fg/55 animate-pulse">Loading your dashboard…</p>
    </div>
  );

  /* ── Shared card row component ── */
  const ItemCard = ({ children, onEdit, onDelete, type, id }: any) => (
    <div className="glass p-5 rounded-2xl flex flex-col gap-3 relative group">
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-1.5 justify-end border-t border-theme-border/25 pt-3 mt-auto">
        <button onClick={() => openModal(type, { id, ...onEdit })} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer transition-colors">
          <Edit3 size={13} />
        </button>
        <button onClick={() => handleDelete(type, id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );

  const portfolioUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/student/${currentUser?.username}`
    : `http://localhost:3000/student/${currentUser?.username}`;

  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg flex">
      {/* Background blob */}
      <div className="fixed top-0 right-0 w-[450px] h-[450px] rounded-full bg-theme-primary/5 blur-[130px] pointer-events-none" />

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-60 glass border-r border-theme-border/50 shrink-0 hidden md:flex flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-7">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-md shrink-0">
                <GraduationCap size={18} />
              </div>
              <div>
                <span className="font-bold text-xs block leading-tight">MCC PORTFOLIO</span>
                <span className="text-[9px] text-theme-fg/45 font-bold uppercase tracking-widest">Student Console</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
            {NAV_TABS.map((tab) => {
              const unreadCount = tab.id === 'notifications'
                ? announcements.filter(a => !readNotifIds.has(a.id)).length
                : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-theme-primary text-white shadow-md shadow-theme-primary/15'
                      : 'text-theme-fg/65 hover:text-theme-fg hover:bg-theme-border/20'
                  }`}
                >
                  <span className="relative">
                    {tab.icon}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold leading-none shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User info */}
        <div className="border-t border-theme-border/40 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div
              className="w-9 h-9 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-xs uppercase border border-theme-border/30 shrink-0 overflow-hidden"
              style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', color: 'transparent' } : {}}
            >
              {!avatarUrl && currentUser?.username.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs block truncate">{profile?.fullName || currentUser?.username}</span>
              <span className="text-[10px] text-theme-fg/40 truncate block">{currentUser?.email}</span>
            </div>
          </div>
          <div className="px-1">
            {profile?.approved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 w-full justify-center">
                <CheckCircle2 size={10} /> Public Portfolio Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20 w-full justify-center">
                ⏳ Pending Admin Review
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 border border-red-500/10 hover:bg-red-500/5 cursor-pointer transition-all"
          >
            <LogOut size={14} /><span>Sign Out</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 border border-red-500/10 cursor-pointer transition-all"
            title="Permanently delete your account and all portfolio data"
          >
            <Trash2 size={13} /><span>Delete My Portfolio</span>
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-5 py-6 md:px-10 md:py-10">

          {/* Mobile nav strip */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-theme-border/40 no-scrollbar">
            <ThemeToggle />
            {NAV_TABS.map((tab) => {
              const unreadCount = tab.id === 'notifications'
                ? announcements.filter(a => !readNotifIds.has(a.id)).length
                : 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer relative ${
                    activeTab === tab.id ? 'bg-theme-primary text-white' : 'glass text-theme-fg/60'
                  }`}
                >
                  {tab.label}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold leading-none shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
            <button onClick={handleLogout} className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold text-red-500 glass cursor-pointer">Out</button>
          </div>

          {/* Alert messages */}
          <AnimatePresence>
            {success && <AlertBanner key="success-banner" type="success" message={success} onClose={() => setSuccess('')} />}
            {error && <AlertBanner key="error-banner" type="error" message={error} onClose={() => setError('')} />}
          </AnimatePresence>

          {/* Unread notifications prompt */}
          {activeTab !== 'notifications' && announcements.filter(a => !readNotifIds.has(a.id)).length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveTab('notifications')}
              className="w-full mb-6 glass p-3.5 rounded-2xl border-l-4 border-theme-primary flex items-center gap-3 cursor-pointer hover:bg-theme-primary/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0 relative">
                <Bell size={15} />
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 flex items-center justify-center px-0.5 rounded-full bg-red-500 text-white text-[8px] font-extrabold leading-none">
                  {announcements.filter(a => !readNotifIds.has(a.id)).length}
                </span>
              </div>
              <span className="text-xs font-bold text-theme-fg/70 group-hover:text-theme-fg transition-colors">
                You have {announcements.filter(a => !readNotifIds.has(a.id)).length} unread notification{announcements.filter(a => !readNotifIds.has(a.id)).length !== 1 ? 's' : ''} — tap to view
              </span>
            </motion.button>
          )}

          {/* ─────────── TAB CONTENT ─────────── */}
          <AnimatePresence mode="wait">

            {/* ══ PROFILE TAB ══ */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }} className="space-y-7">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
                  <p className="text-sm text-theme-fg/50 mt-1">Configure your personal brand, bio, and portfolio theme.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Banner + Avatar Editor */}
                  <div className="rounded-3xl overflow-hidden border border-theme-border/40 bg-theme-primary/3">
                    {/* Banner */}
                    <div
                      className="h-36 md:h-44 w-full relative"
                      style={{
                        background: bannerUrl
                          ? `url('${bannerUrl}') center/cover no-repeat`
                          : `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/10" />
                      <label className="absolute bottom-3 right-3 flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-[11px] font-bold text-white cursor-pointer hover:bg-white/15 transition-all border-white/20 no-print">
                        <ImageIcon size={12} />
                        Change Banner
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) setBannerUrl(await toBase64(f));
                        }} />
                      </label>
                      {bannerUrl && (
                        <button type="button" onClick={() => setBannerUrl('')}
                          className="absolute bottom-3 left-3 glass px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-white border-white/20 hover:bg-white/15 transition-all"
                        >Remove</button>
                      )}
                    </div>

                    {/* Avatar row */}
                    <div className="px-6 pb-5 flex flex-col md:flex-row items-start md:items-end gap-4 -mt-10 md:-mt-12">
                      <div className="relative group w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-theme-bg shadow-xl bg-theme-primary/10 overflow-hidden shrink-0">
                        {avatarUrl
                          ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          : <span className="absolute inset-0 flex items-center justify-center text-theme-primary text-xl font-extrabold uppercase">{fullName?.substring(0, 2) || 'ST'}</span>
                        }
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-bold cursor-pointer gap-1 no-print">
                          <Camera size={18} />
                          <span>Upload Photo</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) setAvatarUrl(await toBase64(f));
                          }} />
                        </label>
                      </div>
                      <div className="pb-2">
                        <p className="font-bold text-base">{fullName || 'Your Name'}</p>
                        <p className="text-xs text-theme-fg/50">{department || 'Department'} · Madras Christian College</p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="glass p-7 rounded-3xl space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-fg/60">Full Display Name</label>
                        <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass} placeholder="e.g. Franklin Raj" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-fg/60">Academic Department</label>
                        <input required type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={fieldClass} placeholder="e.g. Computer Science" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-fg/60">GitHub Profile URL</label>
                        <div className="relative"><Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-fg/35" />
                          <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={fieldClass + ' pl-9'} placeholder="https://github.com/username" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-fg/60">Behance Portfolio URL</label>
                        <div className="relative"><Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-fg/35" />
                          <input type="url" value={behanceUrl} onChange={(e) => setBehanceUrl(e.target.value)} className={fieldClass + ' pl-9'} placeholder="https://behance.net/username" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-theme-fg/60">Portfolio Theme</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {themesList.length === 0 ? (
                          [
                            { name: 'Academic', color: '#800020' },
                            { name: 'Corporate', color: '#1e40af' },
                            { name: 'Startup', color: '#10b981' },
                            { name: 'Creative', color: '#d946ef' },
                            { name: 'AI Futuristic', color: '#06b6d4' }
                          ].map(t => (
                            <button key={t.name} type="button" onClick={() => setTheme(t.name)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                theme === t.name ? 'border-[var(--sel-color)] bg-[var(--sel-color)]/10 text-[var(--sel-color)]' : 'glass text-theme-fg/60 hover:text-theme-fg'
                              }`}
                              style={{ '--sel-color': t.color } as any}
                            >
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.color }} />
                              {t.name === 'AI Futuristic' ? 'Futuristic' : t.name}
                            </button>
                          ))
                        ) : (
                          themesList.filter(t => t.isEnabled || theme === t.name).map((t) => (
                            <button key={t.id} type="button" onClick={() => setTheme(t.name)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                theme === t.name ? 'border-[var(--sel-color)] bg-[var(--sel-color)]/10 text-[var(--sel-color)]' : 'glass text-theme-fg/60 hover:text-theme-fg'
                              }`}
                              style={{ '--sel-color': t.primaryColor } as any}
                            >
                              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: t.primaryColor }} />
                              {t.name === 'AI Futuristic' ? 'Futuristic' : t.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-theme-fg/60">Professional Bio</label>
                      <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className={fieldClass + ' resize-y'} placeholder="A short description about yourself, your interests, and goals…" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-theme-fg/60">Statement of Purpose (SOP)</label>
                        <button type="button" onClick={() => setActiveTab('ai')} className="inline-flex items-center gap-1 text-xs text-theme-primary font-bold hover:underline">
                          <Sparkles size={12} /> Generate with AI
                        </button>
                      </div>
                      <textarea rows={6} value={sop} onChange={(e) => setSop(e.target.value)} className={fieldClass + ' resize-y'} placeholder="Your statement of purpose for applications, scholarships, or job placements…" />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link href={`/student/${currentUser?.username}`} target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-primary hover:underline underline-offset-2">
                        <Eye size={13} /> View Public Page
                      </Link>
                      <button type="submit" className="px-6 py-3 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-bold shadow-md shadow-theme-primary/10 cursor-pointer transition-all">
                        Save Profile
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══ PORTFOLIO / ITEMS TAB ══ */}
            {activeTab === 'items' && (
              <motion.div key="items" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }} className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Portfolio Items</h1>
                  <p className="text-sm text-theme-fg/50 mt-1">Manage projects, certifications, and research publications.</p>
                </div>

                {/* Projects */}
                <section className="space-y-4">
                  <SectionHead icon={<Code size={15} />} title="Coding Projects" onAdd={() => openModal('project')} addLabel="Add Project" />
                  {!profile?.projects?.length ? <EmptyState label="projects" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.projects?.map((proj: any) => (
                        <div key={proj.id} className="glass p-5 rounded-2xl flex flex-col gap-3">
                          <div>
                            <h3 className="font-bold text-sm mb-1">{proj.title}</h3>
                            <p className="text-xs text-theme-fg/65 line-clamp-3 leading-relaxed">{proj.description}</p>
                            {proj.techStack && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {proj.techStack.split(',').map((t: string) => (
                                  <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-theme-primary/8 text-theme-primary">{t.trim()}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between border-t border-theme-border/25 pt-3">
                            <span className="text-[10px] text-theme-fg/35">{proj.githubUrl ? '⚡ GitHub linked' : 'No link'}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => openModal('project', proj)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                              <button onClick={() => handleDelete('project', proj.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Certifications */}
                <section className="space-y-4">
                  <SectionHead icon={<Award size={15} />} title="Certifications" onAdd={() => openModal('certification')} addLabel="Add Cert" />
                  {!profile?.certifications?.length ? <EmptyState label="certifications" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.certifications?.map((cert: any) => (
                        <div key={cert.id} className="glass p-5 rounded-2xl flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0"><Award size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm truncate">{cert.name}</h3>
                            <p className="text-xs text-theme-fg/60">{cert.issuer}</p>
                            <p className="text-[10px] text-theme-fg/40">{new Date(cert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => openModal('certification', cert)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                            <button onClick={() => handleDelete('certification', cert.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Research */}
                <section className="space-y-4">
                  <SectionHead icon={<FileText size={15} />} title="Research Publications" onAdd={() => openModal('research')} addLabel="Add Publication" />
                  {!profile?.researchPapers?.length ? <EmptyState label="research papers" /> : (
                    <div className="space-y-3">
                      {profile?.researchPapers?.map((paper: any) => (
                        <div key={paper.id} className="glass p-5 rounded-2xl">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-bold text-sm">{paper.title}</h3>
                              <p className="text-xs text-theme-primary font-semibold mt-0.5">{paper.journalName}</p>
                              <p className="text-[10px] text-theme-fg/40 mt-0.5">Published: {new Date(paper.publishDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => openModal('research', paper)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                              <button onClick={() => handleDelete('research', paper.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                            </div>
                          </div>
                          <p className="text-xs text-theme-fg/65 bg-theme-primary/5 p-3.5 rounded-xl leading-relaxed line-clamp-3">{paper.abstract}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Creative Works */}
                <section className="space-y-4">
                  <SectionHead icon={<Palette size={15} />} title="Creative Works & Media" onAdd={() => openModal('creative')} addLabel="Add Creative Work" />
                  {profile?.creativeWorks?.length === 0 ? <EmptyState label="creative works" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.creativeWorks?.map((cw: any) => (
                        <div key={cw.id} className="glass p-5 rounded-2xl flex flex-col gap-3">
                          {cw.imageUrl && (
                            <img src={cw.imageUrl} alt={cw.title} className="w-full h-32 object-cover rounded-xl border border-theme-border/30" />
                          )}
                          <div>
                            <h3 className="font-bold text-sm mb-1">{cw.title}</h3>
                            <p className="text-xs text-theme-fg/65 line-clamp-2 leading-relaxed">{cw.description}</p>
                            <p className="text-[9px] text-theme-fg/40 mt-1.5">{cw.date ? new Date(cw.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : ''}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-theme-border/25 pt-3">
                            <span className="text-[10px] text-theme-fg/35">{cw.projectUrl ? '🔗 External link' : ''}</span>
                            <div className="flex gap-1.5">
                              <button onClick={() => openModal('creative', cw)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                              <button onClick={() => handleDelete('creative', cw.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* ══ ACHIEVEMENTS TAB ══ */}
            {activeTab === 'achievements' && (
              <motion.div key="achievements" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }} className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Extracurriculars & Achievements</h1>
                  <p className="text-sm text-theme-fg/50 mt-1">Hackathons, awards, NSS/NCC roles, and community service.</p>
                </div>

                {/* Achievements */}
                <section className="space-y-4">
                  <SectionHead icon={<Award size={15} />} title="Academic Honors & Awards" onAdd={() => openModal('achievement')} addLabel="Add Award" />
                  {!profile?.achievements?.length ? <EmptyState label="achievements" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.achievements?.map((ach: any) => (
                        <div key={ach.id} className="glass p-5 rounded-2xl flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center shrink-0"><Award size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm">{ach.title}</h3>
                            <p className="text-xs text-theme-fg/65 mt-0.5 leading-relaxed">{ach.description}</p>
                            <p className="text-[10px] text-theme-fg/40 mt-1">{new Date(ach.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => openModal('achievement', ach)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                            <button onClick={() => handleDelete('achievement', ach.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Hackathons */}
                <section className="space-y-4">
                  <SectionHead icon={<Flame size={15} />} title="Hackathons & Competitions" onAdd={() => openModal('hackathon')} addLabel="Add Hackathon" />
                  {!profile?.hackathons?.length ? <EmptyState label="hackathons" /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.hackathons?.map((hack: any) => (
                        <div key={hack.id} className="glass p-5 rounded-2xl">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-sm">{hack.eventName}</h3>
                            <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-theme-primary/10 text-theme-primary shrink-0">{hack.prizeWon}</span>
                          </div>
                          <p className="text-xs text-theme-fg/65">Project: <strong className="text-theme-fg font-semibold">{hack.projectName}</strong></p>
                          <p className="text-[10px] text-theme-fg/40 mt-1">{new Date(hack.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                          <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-theme-border/25">
                            <button onClick={() => openModal('hackathon', hack)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                            <button onClick={() => handleDelete('hackathon', hack.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Community Service */}
                <section className="space-y-4">
                  <SectionHead icon={<Globe size={15} />} title="NSS & Community Service" onAdd={() => openModal('service')} addLabel="Add Service" />
                  {!profile?.communityServices?.length ? <EmptyState label="community service" /> : (
                    <div className="space-y-3">
                      {profile?.communityServices?.map((svc: any) => (
                        <div key={svc.id} className="glass p-5 rounded-2xl flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0"><Globe size={18} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-bold text-sm">{svc.organization}</h3>
                              <span className="text-[10px] font-bold bg-theme-fg/5 text-theme-fg/60 px-2 py-0.5 rounded-full uppercase">{svc.role}</span>
                            </div>
                            <p className="text-xs text-theme-fg/65 leading-relaxed">{svc.description}</p>
                            <p className="text-[10px] text-theme-fg/40 mt-1">{new Date(svc.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => openModal('service', svc)} className="p-1.5 rounded-lg hover:bg-theme-primary/8 text-theme-primary cursor-pointer"><Edit3 size={13} /></button>
                            <button onClick={() => handleDelete('service', svc.id)} className="p-1.5 rounded-lg hover:bg-red-500/8 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {/* ══ AI TAB ══ */}
            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }} className="space-y-7">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles size={22} className="text-theme-primary" /> AI Assistant Suite
                  </h1>
                  <p className="text-sm text-theme-fg/50 mt-1">Intelligent feedback, SOP generation, and career roadmapping.</p>
                </div>

                {/* Score card */}
                <div className="glass p-7 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-theme-fg/45">Portfolio Score</span>
                    <div className="w-32 h-32 rounded-full border-8 border-theme-border/30 flex items-center justify-center relative">
                      <div className="absolute inset-2 rounded-full border-4 border-theme-primary/25 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-theme-primary leading-none">
                          {loadingScore ? '…' : aiScore?.portfolioScore ?? '--'}
                        </span>
                        <span className="text-[11px] font-semibold text-theme-fg/50">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-base">Resume Analysis Summary</h3>
                    <p className="text-xs text-theme-fg/70 leading-relaxed bg-theme-primary/5 p-4 rounded-xl border border-theme-border/30">
                      {loadingScore ? 'Analyzing your profile…' : aiScore?.feedbackSummary ?? 'No score calculated yet.'}
                    </p>
                    <div>
                      <span className="text-[10px] font-bold text-theme-fg/50 uppercase tracking-wider block mb-2">Key Suggestions:</span>
                      {loadingScore ? (
                        <span className="text-xs text-theme-fg/40 italic">Calculating…</span>
                      ) : aiScore?.recommendations?.length === 0 ? (
                        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Profile looks complete! Great placement readiness.</span>
                      ) : (
                        <ul className="text-xs space-y-1 text-theme-fg/70 list-disc pl-4">
                          {aiScore?.recommendations?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* SOP Generator */}
                <div className="glass p-7 rounded-3xl space-y-5">
                  <h3 className="font-bold text-base flex items-center gap-2"><FileText size={17} className="text-theme-primary" /> AI SOP Generator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-theme-fg/60">Target Goal</label>
                      <input type="text" value={aiTargetGoal} onChange={(e) => setAiTargetGoal(e.target.value)} className={fieldClass} placeholder="e.g. Master's in CS, Frontend Dev at Google" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-theme-fg/60">Writing Tone</label>
                      <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className={fieldClass + ' appearance-none cursor-pointer'}>
                        {['Professional', 'Academic', 'Bold', 'Creative'].map((t) => (
                          <option key={t} value={t} className="text-black">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="button" onClick={handleGenerateSop} disabled={generatingSop}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-md cursor-pointer disabled:opacity-50 transition-all"
                  >
                    <Sparkles size={14} />
                    {generatingSop ? 'Generating…' : 'Generate Custom SOP'}
                  </button>
                  {generatedSop && (
                    <div className="space-y-3 pt-1">
                      <span className="text-[10px] font-bold text-theme-fg/50 uppercase tracking-wider block">Generated SOP:</span>
                      <pre className="text-xs text-theme-fg/75 p-5 rounded-2xl bg-theme-primary/5 border border-theme-border/40 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">{generatedSop}</pre>
                      <button type="button"
                        onClick={() => { setSop(generatedSop); setActiveTab('profile'); setSuccess('SOP applied! Remember to save your profile.'); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-theme-primary/25 text-theme-primary text-xs font-bold hover:bg-theme-primary/5 cursor-pointer transition-all"
                      >
                        <CheckCircle2 size={14} /> Apply SOP to Profile
                      </button>
                    </div>
                  )}
                </div>

                {/* Career Guidance */}
                <div className="glass p-7 rounded-3xl space-y-5">
                  <h3 className="font-bold text-base flex items-center gap-2"><Compass size={17} className="text-theme-primary" /> AI Career Guidance</h3>
                  {loadingCareer ? (
                    <div className="flex items-center gap-3 text-xs text-theme-fg/45 italic">
                      <span className="w-4 h-4 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
                      Calculating career roadmaps…
                    </div>
                  ) : aiCareer ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-theme-primary/5 p-5 rounded-2xl border border-theme-primary/12">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-theme-primary block mb-1">Recommended Track</span>
                          <h4 className="font-extrabold text-lg text-theme-primary">{aiCareer.recommendedRole}</h4>
                          <p className="text-xs text-theme-fg/65 mt-2 leading-relaxed">{aiCareer.rationale}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-theme-fg/60 block mb-2">Skill Gaps to Fill:</span>
                          <div className="flex flex-wrap gap-2">
                            {aiCareer.skillsGap?.map((s: string) => (
                              <span key={s} className="text-[10px] font-bold bg-theme-fg/5 text-theme-fg/65 px-2.5 py-1 rounded-lg">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <span className="text-xs font-bold text-theme-fg/60 block mb-2">Target Universities:</span>
                          <ul className="text-xs text-theme-fg/70 space-y-1.5 list-disc pl-4">
                            {aiCareer.suggestedUniversities?.map((u: string) => <li key={u}>{u}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-theme-fg/60 block mb-2">Fellowships & Scholarships:</span>
                          <div className="flex flex-col gap-1.5">
                            {aiCareer.suggestedScholarships?.map((s: string) => (
                              <span key={s} className="text-[11px] font-semibold text-theme-primary bg-theme-primary/5 px-3 py-1.5 rounded-xl border border-theme-primary/10">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-theme-fg/40">Career guidance will load automatically.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ NOTIFICATIONS TAB ══ */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-sm text-theme-fg/50 mt-1">Announcements and updates from college administration.</p>
                  </div>
                  {announcements.some(a => !readNotifIds.has(a.id)) && (
                    <button
                      onClick={() => {
                        const allIds = announcements.map(a => a.id);
                        markNotifRead(allIds);
                        setReadNotifIds(new Set([...readNotifIds, ...allIds]));
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-theme-primary/10 text-theme-primary text-xs font-bold hover:bg-theme-primary/20 transition-all cursor-pointer"
                    >
                      <CheckCheck size={14} /> Mark all as read
                    </button>
                  )}
                </div>

                {/* Unread / Read Stats */}
                {(() => {
                  const unread = announcements.filter(a => !readNotifIds.has(a.id)).length;
                  const read = announcements.length - unread;
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                          <Bell size={18} />
                        </div>
                        <div>
                          <span className="text-xl font-extrabold text-red-500 leading-none">{unread}</span>
                          <p className="text-[10px] text-theme-fg/50 font-bold uppercase tracking-wider mt-0.5">Unread</p>
                        </div>
                      </div>
                      <div className="glass p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <span className="text-xl font-extrabold text-emerald-500 leading-none">{read}</span>
                          <p className="text-[10px] text-theme-fg/50 font-bold uppercase tracking-wider mt-0.5">Read</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Notification List */}
                {announcements.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-theme-primary/5 flex items-center justify-center mx-auto mb-4">
                      <Bell size={28} className="text-theme-fg/20" />
                    </div>
                    <p className="text-sm font-bold text-theme-fg/35">No notifications yet</p>
                    <p className="text-xs text-theme-fg/25 mt-1">College announcements will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((notif) => {
                      const isRead = readNotifIds.has(notif.id);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`glass p-5 rounded-2xl border-l-4 transition-all ${
                            isRead
                              ? 'border-theme-border/30 opacity-65'
                              : 'border-theme-primary shadow-md shadow-theme-primary/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isRead
                                ? 'bg-theme-fg/5 text-theme-fg/30'
                                : 'bg-theme-primary/10 text-theme-primary'
                            }`}>
                              <Megaphone size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className={`font-bold text-sm ${
                                  isRead ? 'text-theme-fg/60' : 'text-theme-fg'
                                }`}>{notif.title}</h3>
                                {!isRead && (
                                  <span className="shrink-0 w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
                                )}
                              </div>
                              <p className={`text-xs mt-1 leading-relaxed ${
                                isRead ? 'text-theme-fg/40' : 'text-theme-fg/65'
                              }`}>{notif.message}</p>
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-theme-border/20">
                                <span className="text-[10px] text-theme-fg/35 font-semibold">
                                  {timeAgo(notif.createdAt)}
                                </span>
                                {!isRead && (
                                  <button
                                    onClick={() => {
                                      markNotifRead([notif.id]);
                                      setReadNotifIds(new Set([...readNotifIds, notif.id]));
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-theme-primary hover:bg-theme-primary/8 transition-all cursor-pointer"
                                  >
                                    <CheckCircle2 size={11} /> Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ PREVIEW TAB ══ */}
            {activeTab === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Live Portfolio Preview</h1>
                    <p className="text-sm text-theme-fg/50 mt-1">See how guests and recruiters view your public page.</p>
                  </div>
                  <Link href={`/student/${currentUser?.username}`} target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-md transition-all cursor-pointer">
                    <Eye size={14} /> Open in New Tab
                  </Link>
                </div>

                {/* Share + QR */}
                <div className="glass p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-bold text-sm flex items-center gap-2"><Globe size={16} className="text-theme-primary" /> Share Your Portfolio</h3>
                    <p className="text-xs text-theme-fg/60 leading-relaxed">Your portfolio link is ready to share on LinkedIn, your resume, or via QR code.</p>
                    <div className="flex items-center gap-2">
                      <input readOnly value={portfolioUrl} className="flex-1 px-3 py-2.5 rounded-xl text-xs text-theme-fg/65 font-mono select-all" />
                      <button
                        onClick={() => { navigator.clipboard.writeText(portfolioUrl); setSuccess('Link copied!'); }}
                        className="px-4 py-2.5 rounded-xl bg-theme-primary/10 text-theme-primary text-xs font-bold hover:bg-theme-primary/20 transition-all cursor-pointer shrink-0"
                      >Copy</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-theme-border/30">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(portfolioUrl)}`}
                      alt="Portfolio QR Code"
                      className="w-24 h-24 object-contain"
                    />
                    <span className="text-[9px] uppercase font-bold tracking-wider text-theme-fg/40 mt-2">Scan to View</span>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="border border-theme-border/40 rounded-3xl overflow-hidden glass shadow-xl">
                  <div className="bg-theme-border/10 px-5 py-3 border-b border-theme-border/40 flex items-center justify-between text-xs text-theme-fg/50">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <span className="font-semibold text-[10px] tracking-wider uppercase bg-theme-primary/8 text-theme-primary px-2.5 py-0.5 rounded-full ml-1">
                        {theme} Theme
                      </span>
                    </div>
                    <span className="hidden md:block font-mono text-[10px]">mccportfolio.edu/student/{currentUser?.username}</span>
                  </div>

                  <div className={`p-6 md:p-8 min-h-[450px] transition-all ${
                    theme === 'Academic' ? 'theme-academic' :
                    theme === 'Corporate' ? 'theme-corporate' :
                    theme === 'Startup' ? 'theme-startup' :
                    theme === 'Creative' ? 'theme-creative' : 'theme-futuristic'
                  } bg-theme-bg text-theme-fg`}>
                    <div className="max-w-3xl mx-auto space-y-8">
                      {/* Preview Hero Card */}
                      <div className="glass rounded-3xl overflow-hidden shadow-md">
                        {/* Banner */}
                        <div
                          className="h-24 w-full relative"
                          style={{
                            background: bannerUrl
                              ? `url('${bannerUrl}') center/cover no-repeat`
                              : `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
                          }}
                        >
                          <div className="absolute top-2.5 right-2.5 glass px-2 py-1 rounded-full text-[8px] font-bold text-white uppercase border border-white/20">
                            {theme}
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="px-5 pb-5 relative">
                          <div className="flex justify-between items-end -mt-8 mb-3 gap-3">
                            <div className="w-16 h-16 rounded-xl border-2 border-theme-bg shadow-md overflow-hidden bg-theme-primary/10 flex items-center justify-center text-theme-primary text-lg font-extrabold uppercase shrink-0"
                              style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', color: 'transparent' } : {}}
                            >
                              {!avatarUrl && (fullName ? fullName.substring(0, 2) : 'ST')}
                            </div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {githubUrl && (
                                <span className="glass p-1.5 rounded-lg text-theme-fg/65"><GitBranch size={12} /></span>
                              )}
                              {behanceUrl && (
                                <span className="glass p-1.5 rounded-lg text-theme-fg/65"><Globe size={12} /></span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h2 className="text-lg font-extrabold leading-tight">
                              {fullName || 'Student Name'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[10px] text-theme-fg/65 font-semibold">
                              {department && (
                                <span className="flex items-center gap-1"><BookOpen size={11} />{department}</span>
                              )}
                              <span className="flex items-center gap-1"><MapPin size={11} />MCC, Chennai</span>
                              {currentUser?.email && (
                                <span className="flex items-center gap-1"><Mail size={11} />{currentUser.email}</span>
                              )}
                            </div>
                            {bio && (
                              <p className="text-xs text-theme-fg/70 leading-relaxed pt-0.5">{bio}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mini Stats strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { label: 'Projects', value: profile?.projects?.length ?? 0, icon: <Code size={11} /> },
                          { label: 'Certifications', value: profile?.certifications?.length ?? 0, icon: <Award size={11} /> },
                          { label: 'Publications', value: profile?.researchPapers?.length ?? 0, icon: <FileText size={11} /> },
                          { label: 'Hackathons', value: profile?.hackathons?.length ?? 0, icon: <Flame size={11} /> },
                          { label: 'Creative', value: profile?.creativeWorks?.length ?? 0, icon: <Palette size={11} /> },
                        ].map((stat, i) => (
                          <div key={stat.label} className={`glass p-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 text-center ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
                            <span className="text-sm font-extrabold text-theme-primary leading-none">{stat.value}</span>
                            <span className="flex items-center gap-1 text-[7.5px] text-theme-fg/55 font-bold uppercase tracking-wider">
                              {stat.icon}{stat.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Technical skills */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 glass p-4 rounded-2xl flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-xs text-theme-fg">Skill Profile & Domain Alignment</h4>
                            <p className="text-[10px] text-theme-fg/60 leading-normal mt-1.5">
                              Dynamic skill profiling aggregated from your active projects, certifications, and research publications.
                            </p>
                            <div className="mt-4 space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span>Placement & Industry Readiness</span>
                                <span className="text-theme-primary">High</span>
                              </div>
                              <div className="w-full h-1.5 bg-theme-border/30 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-theme-primary to-theme-accent rounded-full" style={{ width: '85%' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <div className="glass p-3 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[100px]">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-theme-fg/40 mb-1.5">Competencies</span>
                            <div className="w-10 h-10 rounded-xl border border-theme-primary/20 flex items-center justify-center bg-theme-primary/5 text-theme-primary">
                              <Sparkles size={16} className="animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statement of Purpose */}
                      {sop && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-extrabold tracking-widest text-theme-primary">Statement of Purpose</span>
                            <div className="flex-1 h-px bg-theme-border/40" />
                          </div>
                          <div className="glass p-4 rounded-xl">
                            <p className="text-xs text-theme-fg/75 leading-relaxed line-clamp-4 whitespace-pre-wrap">{sop}</p>
                          </div>
                        </div>
                      )}

                      {/* Projects Showcase */}
                      {profile?.projects && profile.projects.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-extrabold tracking-widest text-theme-primary">Projects Showcase</span>
                            <div className="flex-1 h-px bg-theme-border/40" />
                          </div>
                          <div className="glass p-5 rounded-3xl border border-theme-border/30 shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-theme-border/15 md:-mx-2">
                              {profile.projects.slice(0, 2).map((proj: any, i: number) => (
                                <div key={proj.id} className={`space-y-2 flex flex-col justify-between pt-3 md:pt-0 ${i > 0 ? 'md:pl-4' : ''}`}>
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-xs leading-snug">{proj.title}</h4>
                                    <p className="text-[10px] text-theme-fg/65 line-clamp-2 leading-relaxed">{proj.description}</p>
                                  </div>
                                  {proj.techStack && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {proj.techStack.split(',').slice(0, 3).map((t: string) => (
                                        <span key={t} className="text-[8px] font-bold bg-theme-primary/8 text-theme-primary px-1.5 py-0.5 rounded-md">{t.trim()}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Certifications preview */}
                      {profile?.certifications && profile.certifications.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-extrabold tracking-widest text-theme-primary">Certifications</span>
                            <div className="flex-1 h-px bg-theme-border/40" />
                          </div>
                          <div className="glass p-4 rounded-3xl border border-theme-border/30 shadow-md divide-y divide-theme-border/15">
                            {profile.certifications.slice(0, 2).map((cert: any, i: number) => (
                              <div key={cert.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                                <div className="w-8 h-8 rounded-lg bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0">
                                  <Award size={14} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs truncate">{cert.name}</h4>
                                  <p className="text-[10px] text-theme-fg/55 font-semibold truncate">{cert.issuer}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Creative Works preview */}
                      {profile?.creativeWorks && profile.creativeWorks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-extrabold tracking-widest text-theme-primary">Creative Works</span>
                            <div className="flex-1 h-px bg-theme-border/40" />
                          </div>
                          <div className="glass p-4 rounded-3xl border border-theme-border/30 shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {profile.creativeWorks.slice(0, 3).map((cw: any) => (
                                <div key={cw.id} className="flex flex-col justify-between border border-theme-border/15 rounded-xl overflow-hidden bg-theme-bg/10 shadow-sm">
                                  {cw.imageUrl && (
                                    <div className="relative h-12 w-full overflow-hidden">
                                      <img src={cw.imageUrl} alt={cw.title} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="p-2 space-y-1">
                                    <h4 className="font-bold text-[9px] leading-snug truncate">{cw.title}</h4>
                                    <p className="text-[8px] text-theme-fg/60 line-clamp-1 leading-none">{cw.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ═══ CRUD MODAL ═══ */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="w-full max-w-lg glass p-7 rounded-3xl max-h-[92vh] overflow-y-auto relative shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold capitalize">
                  {editingItem ? 'Edit' : 'Add'} {modalType === 'service' ? 'Community Service' : modalType}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-theme-border/30 text-theme-fg/50 cursor-pointer transition-colors"><X size={18} /></button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {modalType === 'project' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Project Title</label>
                      <input required type="text" value={formFields.title||''} onChange={(e) => setFormFields({...formFields, title: e.target.value})} className={fieldClass} placeholder="e.g. Campus Navigation App" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Tech Stack (comma-separated)</label>
                      <input type="text" value={formFields.techStack||''} onChange={(e) => setFormFields({...formFields, techStack: e.target.value})} className={fieldClass} placeholder="React, TypeScript, Node.js" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">GitHub URL</label>
                        <input type="url" value={formFields.githubUrl||''} onChange={(e) => setFormFields({...formFields, githubUrl: e.target.value})} className={fieldClass} placeholder="https://github.com/…" /></div>
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Demo URL</label>
                        <input type="url" value={formFields.demoUrl||''} onChange={(e) => setFormFields({...formFields, demoUrl: e.target.value})} className={fieldClass} placeholder="https://…" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Description</label>
                      <textarea required rows={3} value={formFields.description||''} onChange={(e) => setFormFields({...formFields, description: e.target.value})} className={fieldClass+' resize-none'} /></div>
                  </>
                )}

                {modalType === 'certification' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Certification Name</label>
                      <input required type="text" value={formFields.name||''} onChange={(e) => setFormFields({...formFields, name: e.target.value})} className={fieldClass} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Issuing Organization</label>
                      <input required type="text" value={formFields.issuer||''} onChange={(e) => setFormFields({...formFields, issuer: e.target.value})} className={fieldClass} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Issue Date</label>
                        <input required type="date" value={formFields.issueDate?.substring(0,10)||''} onChange={(e) => setFormFields({...formFields, issueDate: e.target.value})} className={fieldClass+' cursor-pointer'} /></div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-fg/60">Certificate File / Link</label>
                        {formFields.credentialUrl?.startsWith('data:') ? (
                          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> File attached</span>
                            <button type="button" onClick={() => setFormFields({...formFields, credentialUrl:''})} className="text-[10px] font-bold text-red-500">Remove</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input type="text" placeholder="Paste URL or upload…" value={formFields.credentialUrl||''} onChange={(e) => setFormFields({...formFields, credentialUrl: e.target.value})} className={fieldClass+' flex-1'} />
                            <label className="px-3 py-2.5 rounded-xl border border-theme-primary/25 text-theme-primary text-xs font-bold hover:bg-theme-primary/5 cursor-pointer flex items-center shrink-0">
                              Upload
                              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={async (e) => { const f=e.target.files?.[0]; if(f) { const b64 = await toBase64(f); setFormFields({...formFields, credentialUrl: b64}); } }} />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'research' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Paper Title</label>
                      <input required type="text" value={formFields.title||''} onChange={(e) => setFormFields({...formFields, title: e.target.value})} className={fieldClass} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Journal / Conference</label>
                        <input required type="text" value={formFields.journalName||''} onChange={(e) => setFormFields({...formFields, journalName: e.target.value})} className={fieldClass} /></div>
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Publish Date</label>
                        <input required type="date" value={formFields.publishDate?.substring(0,10)||''} onChange={(e) => setFormFields({...formFields, publishDate: e.target.value})} className={fieldClass+' cursor-pointer'} /></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-theme-fg/60">Paper File / DOI Link</label>
                      {formFields.paperUrl?.startsWith('data:') ? (
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> Manuscript attached</span>
                          <button type="button" onClick={() => setFormFields({...formFields, paperUrl:''})} className="text-[10px] font-bold text-red-500">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input type="text" placeholder="DOI, ResearchGate, arXiv link…" value={formFields.paperUrl||''} onChange={(e) => setFormFields({...formFields, paperUrl: e.target.value})} className={fieldClass+' flex-1'} />
                          <label className="px-3 py-2.5 rounded-xl border border-theme-primary/25 text-theme-primary text-xs font-bold hover:bg-theme-primary/5 cursor-pointer flex items-center shrink-0">
                            Upload PDF
                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={async (e) => { const f=e.target.files?.[0]; if(f) { const b64 = await toBase64(f); setFormFields({...formFields, paperUrl: b64}); } }} />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Abstract / Summary</label>
                      <textarea required rows={4} value={formFields.abstract||''} onChange={(e) => setFormFields({...formFields, abstract: e.target.value})} className={fieldClass+' resize-none'} /></div>
                  </>
                )}

                {modalType === 'achievement' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Award Title</label>
                      <input required type="text" value={formFields.title||''} onChange={(e) => setFormFields({...formFields, title: e.target.value})} className={fieldClass} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Date Received</label>
                      <input required type="date" value={formFields.date?.substring(0,10)||''} onChange={(e) => setFormFields({...formFields, date: e.target.value})} className={fieldClass+' cursor-pointer'} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Description / Rationale</label>
                      <textarea required rows={3} value={formFields.description||''} onChange={(e) => setFormFields({...formFields, description: e.target.value})} className={fieldClass+' resize-none'} /></div>
                  </>
                )}

                {modalType === 'hackathon' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Hackathon / Event Name</label>
                      <input required type="text" value={formFields.eventName||''} onChange={(e) => setFormFields({...formFields, eventName: e.target.value})} className={fieldClass} placeholder="e.g. Smart India Hackathon" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Project Built</label>
                        <input required type="text" value={formFields.projectName||''} onChange={(e) => setFormFields({...formFields, projectName: e.target.value})} className={fieldClass} /></div>
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Prize / Rank Won</label>
                        <input required type="text" value={formFields.prizeWon||''} onChange={(e) => setFormFields({...formFields, prizeWon: e.target.value})} className={fieldClass} placeholder="1st Place, Finalist…" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Event Date</label>
                      <input required type="date" value={formFields.date?.substring(0,10)||''} onChange={(e) => setFormFields({...formFields, date: e.target.value})} className={fieldClass+' cursor-pointer'} /></div>
                  </>
                )}

                {modalType === 'service' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Organization Name</label>
                      <input required type="text" value={formFields.organization||''} onChange={(e) => setFormFields({...formFields, organization: e.target.value})} className={fieldClass} placeholder="e.g. MCC National Service Scheme (NSS)" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Your Role</label>
                        <input required type="text" value={formFields.role||''} onChange={(e) => setFormFields({...formFields, role: e.target.value})} className={fieldClass} placeholder="Lead Volunteer" /></div>
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Service Date</label>
                        <input required type="date" value={formFields.date?.substring(0,10)||''} onChange={(e) => setFormFields({...formFields, date: e.target.value})} className={fieldClass+' cursor-pointer'} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Description of Activities</label>
                      <textarea required rows={3} value={formFields.description||''} onChange={(e) => setFormFields({...formFields, description: e.target.value})} className={fieldClass+' resize-none'} /></div>
                  </>
                )}

                {modalType === 'creative' && (
                  <>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Creative Work Title</label>
                      <input required type="text" value={formFields.title||''} onChange={(e) => setFormFields({...formFields, title: e.target.value})} className={fieldClass} placeholder="e.g. Portrait of MCC Quadrangle" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Link / Project URL</label>
                        <input type="url" value={formFields.projectUrl||''} onChange={(e) => setFormFields({...formFields, projectUrl: e.target.value})} className={fieldClass} placeholder="https://behance.net/…" /></div>
                      <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Date Completed</label>
                        <input required type="date" value={formFields.date?.substring(0,10)||''} onChange={(e) => setFormFields({...formFields, date: e.target.value})} className={fieldClass+' cursor-pointer'} /></div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-theme-fg/60">Image Upload / Base64</label>
                      {formFields.imageUrl?.startsWith('data:') ? (
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                          <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12} /> Image attached</span>
                          <button type="button" onClick={() => setFormFields({...formFields, imageUrl:''})} className="text-[10px] font-bold text-red-500">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Paste URL or upload image…" value={formFields.imageUrl||''} onChange={(e) => setFormFields({...formFields, imageUrl: e.target.value})} className={fieldClass+' flex-1'} />
                          <label className="px-3 py-2.5 rounded-xl border border-theme-primary/25 text-theme-primary text-xs font-bold hover:bg-theme-primary/5 cursor-pointer flex items-center shrink-0">
                            Upload
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f=e.target.files?.[0]; if(f) { const b64 = await toBase64(f); setFormFields({...formFields, imageUrl: b64}); } }} />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-theme-fg/60">Short Description</label>
                      <textarea required rows={3} value={formFields.description||''} onChange={(e) => setFormFields({...formFields, description: e.target.value})} className={fieldClass+' resize-none'} placeholder="Detail your artwork, photography, design, or creative code…" /></div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl glass text-sm font-bold cursor-pointer hover:bg-theme-border/20 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-bold shadow-md cursor-pointer transition-all">
                    {editingItem ? 'Save Changes' : 'Add Item'}
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
