'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, authApi } from '@/lib/api';
import {
  BarChart2, Users, Shield, Palette, Bell, Download, Building2,
  CheckCircle2, XCircle, Trash2, Edit3, LogOut, GraduationCap,
  TrendingUp, BookOpen, Code, Award, RefreshCw, Plus, X,
  AlertCircle, Eye, EyeOff, ChevronRight, Megaphone, Settings,
  Globe, Flame
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const SIDEBAR_TABS = [
  { id: 'overview',     label: 'Overview',        icon: <BarChart2 size={16} /> },
  { id: 'institution',  label: 'Institution',      icon: <Building2 size={16} /> },
  { id: 'students',     label: 'Student Directory',icon: <Users size={16} /> },
  { id: 'roles',        label: 'Role Management',  icon: <Shield size={16} /> },
  { id: 'themes',       label: 'Theme Config',     icon: <Palette size={16} /> },
  { id: 'alerts',       label: 'Notifications',    icon: <Megaphone size={16} /> },
  { id: 'reports',      label: 'CSV Export',       icon: <Download size={16} /> },
];

function StatCard({ label, value, icon, color = 'theme-primary' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5 rounded-2xl flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold leading-none">{value ?? '—'}</p>
        <p className="text-xs text-theme-fg/50 font-semibold mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-theme-fg/50 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [institution, setInstitution] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [newNotif, setNewNotif] = useState({ title: '', message: '' });
  const [approving, setApproving] = useState<number | null>(null);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);

  useEffect(() => {
    const user = authApi.getCurrentUser();
    if (!user || user.role !== 'Admin') { router.push('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, s, u, inst, n, t] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getStudents(),
        adminApi.getAllUsers(),
        adminApi.getInstitution(),
        adminApi.getNotifications(),
        adminApi.getThemes(),
      ]);
      setAnalytics(a); setStudents(s); setUsers(u);
      setInstitution(inst || {}); setNotifications(n); setThemes(t);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const flash = (m: string, isErr = false) => {
    if (isErr) setError(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setError(''); }, 3500);
  };

  const handleApprove = async (id: number, approve: boolean) => {
    setApproving(id);
    try { await adminApi.approvePortfolio(id, approve); await fetchAll(); flash(approve ? 'Portfolio approved!' : 'Portfolio revoked.'); }
    catch (e: any) { flash(e.message, true); }
    finally { setApproving(null); }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try { await adminApi.updateUserRole(id, role); await fetchAll(); flash(`Role updated to ${role}`); }
    catch (e: any) { flash(e.message, true); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Permanently delete this user and all their data?')) return;
    setDeletingUser(id);
    try { await adminApi.deleteUser(id); await fetchAll(); flash('User deleted.'); }
    catch (e: any) { flash(e.message, true); }
    finally { setDeletingUser(null); }
  };

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await adminApi.updateInstitution(institution); flash('Institution settings saved!'); }
    catch (e: any) { flash(e.message, true); }
    finally { setSaving(false); }
  };

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await adminApi.addNotification(newNotif); setNewNotif({ title: '', message: '' }); await fetchAll(); flash('Announcement published!'); }
    catch (e: any) { flash(e.message, true); }
  };

  const handleToggleNotif = async (id: number) => {
    try { await adminApi.toggleNotification(id); await fetchAll(); }
    catch (e: any) { flash(e.message, true); }
  };

  const handleDeleteNotif = async (id: number) => {
    try { await adminApi.deleteNotification(id); await fetchAll(); flash('Notification removed.'); }
    catch (e: any) { flash(e.message, true); }
  };

  const handleToggleTheme = async (id: number) => {
    try { await adminApi.toggleTheme(id); await fetchAll(); }
    catch (e: any) { flash(e.message, true); }
  };

  const filteredStudents = students.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = students.filter(s => !s.approved).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-4 flex-col">
      <div className="w-12 h-12 rounded-full border-4 border-theme-primary border-t-transparent animate-spin" />
      <p className="text-sm text-theme-fg/50 animate-pulse font-semibold">Loading Super Admin Console…</p>
    </div>
  );

  const fieldCls = 'w-full px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-theme-primary/30';

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)]">
      {/* Background blob */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-theme-primary/5 blur-[130px] pointer-events-none" />

      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-64 glass border-r border-theme-border/50 shrink-0 hidden md:flex flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-md shrink-0">
                <GraduationCap size={18} />
              </div>
              <div>
                <span className="font-bold text-xs block leading-tight">MCC PORTFOLIO</span>
                <span className="text-[9px] text-theme-fg/40 font-bold uppercase tracking-widest">Super Admin</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav */}
          <nav className="space-y-0.5">
            {SIDEBAR_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-theme-primary text-white shadow-md shadow-theme-primary/15'
                    : 'text-theme-fg/60 hover:text-theme-fg hover:bg-theme-border/20'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'students' && pendingCount > 0 && (
                  <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500 text-white">{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-theme-border/40 pt-4 space-y-2">
          <Link href="/" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold glass text-theme-fg/60 hover:text-theme-fg transition-all">
            <ChevronRight size={13} />View Site
          </Link>
          <button
            onClick={() => { authApi.logout(); router.push('/'); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-500 border border-red-500/10 hover:bg-red-500/5 cursor-pointer transition-all"
          >
            <LogOut size={14} />Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10">

          {/* Global messages */}
          <AnimatePresence>
            {msg && (
              <motion.div key="success-msg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={13} />{msg}
              </motion.div>
            )}
            {error && (
              <motion.div key="error-msg" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 px-4 py-3 rounded-2xl bg-red-500/8 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={13} />{error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* ══ OVERVIEW ══ */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-7">
                <SectionHead title="Overview & Analytics" subtitle="Institutional dashboard — live metrics across all student portfolios." />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Students" value={analytics?.totalStudents} icon={<Users size={18} />} />
                  <StatCard label="Approved Portfolios" value={analytics?.approvedStudents} icon={<CheckCircle2 size={18} />} />
                  <StatCard label="Pending Approvals" value={analytics?.pendingApprovals} icon={<AlertCircle size={18} />} />
                  <StatCard label="Total Projects" value={analytics?.totalProjects} icon={<Code size={18} />} />
                  <StatCard label="Research Papers" value={analytics?.totalResearch} icon={<BookOpen size={18} />} />
                  <StatCard label="Certifications" value={analytics?.totalCerts} icon={<Award size={18} />} />
                  <StatCard label="Creative Works" value={analytics?.totalCreative} icon={<Palette size={18} />} />
                  <StatCard label="Hackathons" value={analytics?.totalHackathons} icon={<Flame size={18} />} />
                  <StatCard label="Activities / Awards" value={analytics?.totalAchievements} icon={<Award size={18} />} />
                  <StatCard label="Community Service" value={analytics?.totalCommunity} icon={<Globe size={18} />} />
                  <StatCard label="Avg. Completion" value={`${analytics?.averageCompletion ?? 0}%`} icon={<TrendingUp size={18} />} />
                </div>

                {/* Placement readiness */}
                <div className="glass p-6 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">Placement Readiness Score</h3>
                    <span className="text-xl font-extrabold text-theme-primary">{analytics?.placementReadiness ?? 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-theme-border/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analytics?.placementReadiness ?? 0}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-theme-primary to-theme-accent rounded-full"
                    />
                  </div>
                </div>

                {/* Department performance */}
                {analytics?.departmentPerformance?.length > 0 && (
                  <div className="glass p-6 rounded-3xl space-y-4">
                    <h3 className="font-bold text-sm">Department Performance</h3>
                    <div className="space-y-3">
                      {analytics.departmentPerformance.map((d: any) => (
                        <div key={d.department} className="flex items-center gap-3">
                          <span className="w-40 text-xs font-semibold text-theme-fg/70 truncate shrink-0">{d.department}</span>
                          <div className="flex-1 h-2 bg-theme-border/30 rounded-full overflow-hidden">
                            <div className="h-full bg-theme-primary/60 rounded-full" style={{ width: `${Math.min(d.count * 25, 100)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-theme-fg/50 w-12 text-right">{d.count} students</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ INSTITUTION CONFIG ══ */}
            {activeTab === 'institution' && (
              <motion.div key="institution" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <SectionHead title="Institution Configuration" subtitle="Manage college-wide branding. Changes propagate to all pages." />
                <form onSubmit={handleSaveInstitution} className="glass p-7 rounded-3xl space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      ['Full Name', 'name', 'Madras Christian College (Autonomous)'],
                      ['Short Name', 'shortName', 'MCC'],
                      ['Address', 'address', 'Tambaram, Chennai, Tamil Nadu 600059'],
                      ['Contact Email', 'contactEmail', 'principal@mcc.edu'],
                      ['Website URL', 'websiteUrl', 'https://mcc.edu'],
                    ].map(([label, key, placeholder]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-fg/60">{label}</label>
                        <input type="text" value={(institution as any)[key] || ''} placeholder={placeholder}
                          onChange={e => setInstitution({ ...institution, [key]: e.target.value })}
                          className={fieldCls} />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-fg/60">Logo URL</label>
                    <input type="text" value={institution?.logoUrl || ''} placeholder="https://…"
                      onChange={e => setInstitution({ ...institution, logoUrl: e.target.value })}
                      className={fieldCls} />
                    {institution?.logoUrl && <img src={institution.logoUrl} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover mt-2 border border-theme-border/30" />}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-fg/60">Banner URL</label>
                    <input type="text" value={institution?.bannerUrl || ''} placeholder="https://…"
                      onChange={e => setInstitution({ ...institution, bannerUrl: e.target.value })}
                      className={fieldCls} />
                    {institution?.bannerUrl && <img src={institution.bannerUrl} alt="Banner preview" className="w-full h-24 rounded-xl object-cover mt-2 border border-theme-border/30" />}
                  </div>
                  <button type="submit" disabled={saving}
                    className="px-6 py-3 rounded-xl bg-theme-primary text-white text-sm font-bold hover:bg-theme-primary-hover shadow-md cursor-pointer transition-all disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save Institution Settings'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ══ STUDENT DIRECTORY ══ */}
            {activeTab === 'students' && (
              <motion.div key="students" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <SectionHead title="Student Directory" subtitle="Search, approve, and manage all student portfolios." />
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="Search by name, username, or department…" value={search}
                    onChange={e => setSearch(e.target.value)} className={fieldCls + ' flex-1'} />
                  <button onClick={fetchAll} className="p-3 rounded-xl glass text-theme-fg/60 hover:text-theme-primary cursor-pointer transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredStudents.map((student: any) => (
                    <div key={student.id} className="glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-sm uppercase shrink-0 overflow-hidden"
                        style={student.avatarUrl ? { backgroundImage: `url(${student.avatarUrl})`, backgroundSize: 'cover', color: 'transparent' } : {}}>
                        {!student.avatarUrl && student.username?.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm">{student.fullName || student.username}</h3>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${student.approved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {student.approved ? 'Live' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-theme-fg/50 mt-0.5">@{student.username} · {student.department || 'No dept.'} · {student.email}</p>
                        <div className="flex gap-3 mt-1.5 text-[10px] text-theme-fg/40 font-semibold flex-wrap">
                          <span>🗂 {student.projectCount} projects</span>
                          <span>📜 {student.certCount} certs</span>
                          <span>📝 {student.researchCount} papers</span>
                          <span>🔥 {student.hackathonCount} hackathons</span>
                          <span>🏆 {student.achievementCount} activities</span>
                          <span>🌱 {student.communityCount} service</span>
                          <span>🎨 {student.creativeCount} creative</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/student/${student.username}`} target="_blank"
                          className="p-2 rounded-xl glass text-theme-fg/50 hover:text-theme-primary cursor-pointer transition-colors">
                          <Eye size={14} />
                        </Link>
                        <button onClick={() => handleApprove(student.id, !student.approved)} disabled={approving === student.id}
                          className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${student.approved ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}>
                          {approving === student.id ? '…' : student.approved ? 'Revoke' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="py-12 text-center text-sm text-theme-fg/35 italic">No students match your search.</div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ ROLE MANAGEMENT ══ */}
            {activeTab === 'roles' && (
              <motion.div key="roles" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <SectionHead title="Role Management" subtitle="Promote or demote users between Student and Admin roles." />
                <div className="space-y-3">
                  {users.map((u: any) => (
                    <div key={u.id} className="glass p-5 rounded-2xl flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {u.username?.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm block">{u.fullName || u.username}</span>
                        <span className="text-xs text-theme-fg/50">@{u.username} · {u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${u.role === 'Admin' ? 'bg-theme-primary/10 text-theme-primary' : 'bg-theme-fg/5 text-theme-fg/50'}`}>
                          {u.role}
                        </span>
                        <select value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs font-bold px-2 py-1.5 rounded-xl glass border border-theme-border/30 cursor-pointer text-theme-fg bg-transparent">
                          <option value="Student">Student</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <button onClick={() => handleDeleteUser(u.id)} disabled={deletingUser === u.id}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 cursor-pointer transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ THEME CONFIG ══ */}
            {activeTab === 'themes' && (
              <motion.div key="themes" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <SectionHead title="Theme Configuration" subtitle="Control which portfolio themes students can select. Each theme shapes the entire look of their public portfolio." />

                {/* Info strip */}
                <div className="glass p-4 rounded-2xl flex items-center gap-3 border border-theme-primary/15">
                  <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0">
                    <Palette size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-theme-fg/80">
                      {themes.filter((t: any) => t.isEnabled).length} of {themes.length} themes active
                    </p>
                    <p className="text-[10px] text-theme-fg/45 mt-0.5">Disabled themes are hidden from the student theme picker immediately.</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {themes.filter((t: any) => t.isEnabled).slice(0, 5).map((t: any) => (
                      <div key={t.id} className="w-4 h-4 rounded-full border-2 border-theme-bg shadow-sm" style={{ background: t.primaryColor }} title={t.name} />
                    ))}
                  </div>
                </div>

                {/* Theme cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {themes.map((t: any) => {
                    const themeDescriptions: Record<string, string> = {
                      Academic: 'Classic deep blue — perfect for research-focused students.',
                      Creative: 'Vibrant violet — ideal for designers and artists.',
                      Tech: 'Sharp cyan — great for developers and engineers.',
                      Nature: 'Earthy green — best for environmental or life sciences.',
                      Minimal: 'Slate grey — clean and professional for any field.',
                      Sunset: 'Warm orange — energetic and bold for innovators.',
                    };
                    const desc = themeDescriptions[t.name] || 'A unique portfolio theme for students.';
                    // Derive a secondary color by lightening/shifting primary
                    const secondaryStyle = { background: t.primaryColor, opacity: 0.45 };

                    return (
                      <motion.div
                        key={t.id}
                        layout
                        className={`glass rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                          t.isEnabled
                            ? 'border-theme-primary/20 shadow-lg shadow-theme-primary/5'
                            : 'border-theme-border/15 opacity-55 grayscale'
                        }`}
                      >
                        {/* Color preview banner */}
                        <div className="h-20 relative overflow-hidden">
                          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primaryColor}cc 0%, ${t.primaryColor}44 60%, transparent 100%)` }} />
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.08),transparent)]" />
                          {/* Decorative circles */}
                          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full" style={{ background: t.primaryColor, opacity: 0.18 }} />
                          <div className="absolute right-8 bottom-2 w-10 h-10 rounded-full" style={{ background: t.primaryColor, opacity: 0.12 }} />
                          {/* Theme name overlay */}
                          <div className="absolute inset-0 flex items-end p-4">
                            <span className="text-white font-extrabold text-base drop-shadow-md tracking-tight">{t.name}</span>
                          </div>
                          {/* Status pill */}
                          <div className="absolute top-3 right-3">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              t.isEnabled
                                ? 'bg-white/20 text-white border border-white/30 backdrop-blur-sm'
                                : 'bg-black/20 text-white/60 border border-white/10'
                            }`}>
                              {t.isEnabled ? '● Live' : '○ Off'}
                            </span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-5 space-y-4">
                          {/* Color swatch row */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg shadow-md border border-white/10 shrink-0" style={{ background: t.primaryColor }} />
                            <div className="w-7 h-7 rounded-lg shadow-md border border-white/10 shrink-0" style={{ background: t.primaryColor, opacity: 0.6 }} />
                            <div className="w-7 h-7 rounded-lg shadow-md border border-white/10 shrink-0" style={{ background: t.primaryColor, opacity: 0.3 }} />
                            <div className="ml-2 flex-1 min-w-0">
                              <p className="text-[10px] text-theme-fg/40 font-mono truncate">{t.primaryColor}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-[11px] text-theme-fg/55 leading-relaxed">{desc}</p>

                          {/* Student count if available */}
                          {students.filter((s: any) => s.theme === t.name).length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-theme-primary/60 shrink-0" />
                              <span className="text-[10px] text-theme-fg/40 font-semibold">
                                {students.filter((s: any) => s.theme === t.name).length} student{students.filter((s: any) => s.theme === t.name).length !== 1 ? 's' : ''} using this theme
                              </span>
                            </div>
                          )}

                          {/* Toggle button */}
                          <button
                            onClick={() => handleToggleTheme(t.id)}
                            className={`w-full py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                              t.isEnabled
                                ? 'bg-red-500/8 text-red-500 hover:bg-red-500/15 border border-red-500/15'
                                : 'bg-emerald-500/8 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/15'
                            }`}
                          >
                            {t.isEnabled ? (
                              <><EyeOff size={13} /> Disable Theme</>
                            ) : (
                              <><Eye size={13} /> Enable Theme</>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {themes.length === 0 && (
                  <div className="py-20 text-center text-sm text-theme-fg/35 italic glass rounded-3xl">
                    No themes configured in the database yet.
                  </div>
                )}
              </motion.div>
            )}


            {/* ══ NOTIFICATIONS ══ */}
            {activeTab === 'alerts' && (
              <motion.div key="alerts" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <SectionHead title="Campus Notifications" subtitle="Broadcast announcements to all students and guests." />

                {/* Compose new */}
                <form onSubmit={handleAddNotification} className="glass p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Megaphone size={15} className="text-theme-primary" /> Publish New Announcement</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-fg/60">Headline</label>
                    <input required type="text" value={newNotif.title} onChange={e => setNewNotif({ ...newNotif, title: e.target.value })}
                      className={fieldCls} placeholder="e.g. Smart India Hackathon 2026 Open" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-theme-fg/60">Message</label>
                    <textarea required rows={3} value={newNotif.message} onChange={e => setNewNotif({ ...newNotif, message: e.target.value })}
                      className={fieldCls + ' resize-none'} placeholder="Full announcement message…" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-md cursor-pointer transition-all">
                    <Megaphone size={13} /> Broadcast Announcement
                  </button>
                </form>

                {/* Existing notifications */}
                <div className="space-y-3">
                  {notifications.map((n: any) => (
                    <div key={n.id} className={`glass p-5 rounded-2xl flex items-start gap-4 ${!n.isActive ? 'opacity-50' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isActive ? 'bg-emerald-500' : 'bg-theme-fg/30'}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm">{n.title}</h4>
                        <p className="text-xs text-theme-fg/60 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-theme-fg/35 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => handleToggleNotif(n.id)} className="p-2 rounded-xl glass text-theme-fg/50 hover:text-theme-primary cursor-pointer transition-colors">
                          {n.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button onClick={() => handleDeleteNotif(n.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 cursor-pointer transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <div className="py-10 text-center text-sm text-theme-fg/35 italic">No announcements yet.</div>}
                </div>
              </motion.div>
            )}

            {/* ══ CSV EXPORT ══ */}
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <SectionHead title="Reports & CSV Export" subtitle="Download comprehensive institutional data in CSV format." />
                <div className="glass p-8 rounded-3xl space-y-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center mx-auto">
                    <Download size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Student Roster Export</h3>
                    <p className="text-sm text-theme-fg/55 mt-2 max-w-md mx-auto">
                      Downloads a full CSV file including student names, departments, approval statuses, project counts, certifications, research publications, hackathon entries, and GitHub/Behance URLs.
                    </p>
                  </div>
                  <div className="glass p-4 rounded-2xl text-left text-xs text-theme-fg/60 font-mono max-w-lg mx-auto">
                    <p className="font-bold text-theme-fg/40 mb-1">CSV Columns Included:</p>
                    <p>Username · Full Name · Email · Department · Theme · Approved · Projects · Certifications · Research Papers · Hackathons · GitHub URL · Behance URL</p>
                  </div>
                  <button onClick={() => adminApi.exportCSV()}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-theme-primary text-white font-bold hover:bg-theme-primary-hover shadow-lg shadow-theme-primary/15 cursor-pointer transition-all">
                    <Download size={18} /> Download CSV Report
                  </button>
                  <p className="text-[11px] text-theme-fg/35">File: <code>mcc_students_{new Date().toISOString().slice(0, 10)}.csv</code></p>
                </div>

                {/* Quick summary */}
                <div className="glass p-6 rounded-3xl space-y-3">
                  <h3 className="font-bold text-sm">Current Database Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    {[
                      { label: 'Students', value: analytics?.totalStudents },
                      { label: 'Projects', value: analytics?.totalProjects },
                      { label: 'Research', value: analytics?.totalResearch },
                      { label: 'Certifications', value: analytics?.totalCerts },
                    ].map(s => (
                      <div key={s.label} className="bg-theme-primary/5 rounded-xl p-4">
                        <p className="text-2xl font-extrabold text-theme-primary">{s.value ?? 0}</p>
                        <p className="text-xs text-theme-fg/50 font-semibold mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
