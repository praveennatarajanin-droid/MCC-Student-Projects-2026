'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, Award, GraduationCap, Link2, Trash2, Plus, Edit3, Save, 
  CheckCircle2, Loader2, AlertCircle, X, Trophy, Heart, Star, Code2, 
  ExternalLink, Globe, Palette, ShieldCheck, ShieldAlert, ArrowLeft,
  ChevronRight, Calendar, Sparkles, MessageSquare, PlusCircle
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  gitHubUrl: string;
  liveDemoUrl: string;
  techStack: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
  fileUrl: string;
}

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

interface Hackathon {
  id: string;
  name: string;
  projectName: string;
  description: string;
  achievementPosition: string;
  date: string;
}

interface CommunityService {
  id: string;
  organizationName: string;
  activity: string;
  hoursServed: number;
  description: string;
  date: string;
}

interface CreativeWork {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  behanceUrl: string;
}

interface StudentProfile {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  department: {
    name: string;
  };
  bio: string;
  headline: string;
  skills: string;
  theme: string;
  customThemeConfig: string;
  isApproved: boolean;
  usernameSlug: string;
  gitHubUrl: string;
  linkedInUrl: string;
  behanceUrl: string;
  resumeUrl: string;
  personalStory: string;
  statementOfPurpose: string;
  academicRecordsJson: string;
  projects: Project[];
  certifications: Certification[];
  researchPapers: ResearchPaper[];
  achievements: Achievement[];
  hackathons: Hackathon[];
  communityServices: CommunityService[];
  creativeWorks: CreativeWork[];
}

export default function AdminStudentWorkspace() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'projects' | 'research' | 'activities'>('profile');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Core content editing states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [behanceUrl, setBehanceUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [personalStory, setPersonalStory] = useState('');
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('Apple-Minimal');
  const [customThemeConfig, setCustomThemeConfig] = useState('{}');
  const [academicRecords, setAcademicRecords] = useState<{ degree: string; institution: string; cgpa: string; year: string }[]>([]);

  // Sub-module list states
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [communityServices, setCommunityServices] = useState<CommunityService[]>([]);
  const [creativeWorks, setCreativeWorks] = useState<CreativeWork[]>([]);

  // Modal forms
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<{ id?: string; title: string; description: string; gitHubUrl: string; liveDemoUrl: string; techStack: string }>({
    title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: ''
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState<{ id?: string; name: string; issuer: string; issueDate: string; credentialUrl: string; fileUrl: string }>({
    name: '', issuer: '', issueDate: '', credentialUrl: '', fileUrl: ''
  });

  const [showResearchModal, setShowResearchModal] = useState(false);
  const [researchForm, setResearchForm] = useState<{ id?: string; title: string; abstract: string; journalOrConference: string; publishDate: string; paperUrl: string; isInnovationProject: boolean; prototypeStatus: string; startupIdeaPitch: string }>({
    title: '', abstract: '', journalOrConference: '', publishDate: '', paperUrl: '', isInnovationProject: false, prototypeStatus: 'Idea', startupIdeaPitch: ''
  });

  const [showAchModal, setShowAchModal] = useState(false);
  const [achForm, setAchForm] = useState<{ id?: string; title: string; description: string; date: string; category: string }>({
    title: '', description: '', date: '', category: 'Academic'
  });

  const [showHackModal, setShowHackModal] = useState(false);
  const [hackForm, setHackForm] = useState<{ id?: string; name: string; projectName: string; description: string; achievementPosition: string; date: string }>({
    name: '', projectName: '', description: '', achievementPosition: '', date: ''
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState<{ id?: string; organizationName: string; activity: string; hoursServed: number; description: string; date: string }>({
    organizationName: '', activity: '', hoursServed: 0, description: '', date: ''
  });

  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [creativeForm, setCreativeForm] = useState<{ id?: string; title: string; description: string; mediaUrl: string; behanceUrl: string }>({
    title: '', description: '', mediaUrl: '', behanceUrl: ''
  });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudentProfile = useCallback(async () => {
    try {
      const res = await api.get(`/api/Admin/students/${studentId}`);
      const data = res.data as StudentProfile;
      setProfile(data);
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setSkills(data.skills || '');
      setGitHubUrl(data.gitHubUrl || '');
      setLinkedInUrl(data.linkedInUrl || '');
      setBehanceUrl(data.behanceUrl || '');
      setResumeUrl(data.resumeUrl || '');
      setPersonalStory(data.personalStory || '');
      setStatementOfPurpose(data.statementOfPurpose || '');
      setIsApproved(data.isApproved);
      setSelectedTheme(data.theme || 'Apple-Minimal');
      setCustomThemeConfig(data.customThemeConfig || '{}');

      try {
        setAcademicRecords(JSON.parse(data.academicRecordsJson || '[]'));
      } catch {
        setAcademicRecords([]);
      }

      setProjects(data.projects || []);
      setCertifications(data.certifications || []);
      setResearchPapers(data.researchPapers || []);
      setAchievements(data.achievements || []);
      setHackathons(data.hackathons || []);
      setCommunityServices(data.communityServices || []);
      setCreativeWorks(data.creativeWorks || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to retrieve student profile from database.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId, fetchStudentProfile]);

  const handleUpdateCoreProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/api/Admin/students/${studentId}`, {
        bio,
        headline,
        skills,
        gitHubUrl,
        linkedInUrl,
        behanceUrl,
        personalStory,
        statementOfPurpose,
        academicRecordsJson: JSON.stringify(academicRecords),
        theme: selectedTheme,
        customThemeConfig,
        isApproved
      });
      showToast('success', 'Student profile core details saved and student notified!');
      fetchStudentProfile();
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save student profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAcademicChange = (index: number, key: string, val: string) => {
    const updated = [...academicRecords];
    updated[index] = { ...updated[index], [key]: val };
    setAcademicRecords(updated);
  };

  const addAcademicRecord = () => setAcademicRecords([...academicRecords, { degree: '', institution: '', cgpa: '', year: '' }]);
  const removeAcademicRecord = (index: number) => setAcademicRecords(academicRecords.filter((_, i) => i !== index));

  // Projects CRUD handlers
  const handleSaveProject = async () => {
    try {
      if (projectForm.id) {
        await api.put(`/api/Admin/students/${studentId}/projects/${projectForm.id}`, projectForm);
        showToast('success', 'Project updated successfully.');
      } else {
        await api.post(`/api/Admin/students/${studentId}/projects`, projectForm);
        showToast('success', 'New project added.');
      }
      setShowProjectModal(false);
      setProjectForm({ title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: '' });
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/projects/${id}`);
      showToast('success', 'Project deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete project.');
    }
  };

  // Certifications CRUD handlers
  const handleSaveCert = async () => {
    try {
      const payload = { ...certForm, issueDate: certForm.issueDate ? new Date(certForm.issueDate).toISOString() : null };
      if (certForm.id) {
        await api.put(`/api/Admin/students/${studentId}/certifications/${certForm.id}`, payload);
        showToast('success', 'Certification updated.');
      } else {
        await api.post(`/api/Admin/students/${studentId}/certifications`, payload);
        showToast('success', 'Certification added.');
      }
      setShowCertModal(false);
      setCertForm({ name: '', issuer: '', issueDate: '', credentialUrl: '', fileUrl: '' });
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save certification.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/certifications/${id}`);
      showToast('success', 'Certification deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete certification.');
    }
  };

  // Research Papers CRUD handlers
  const handleSaveResearch = async () => {
    try {
      const payload = { ...researchForm, publishDate: researchForm.publishDate ? new Date(researchForm.publishDate).toISOString() : null };
      if (researchForm.id) {
        await api.put(`/api/Admin/students/${studentId}/research/${researchForm.id}`, payload);
        showToast('success', 'Research paper updated.');
      } else {
        await api.post(`/api/Admin/students/${studentId}/research`, payload);
        showToast('success', 'Research paper added.');
      }
      setShowResearchModal(false);
      setResearchForm({ title: '', abstract: '', journalOrConference: '', publishDate: '', paperUrl: '', isInnovationProject: false, prototypeStatus: 'Idea', startupIdeaPitch: '' });
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save research paper.');
    }
  };

  const handleDeleteResearch = async (id: string) => {
    if (!confirm('Delete this research paper?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/research/${id}`);
      showToast('success', 'Research paper deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete research paper.');
    }
  };

  // Achievements CRUD handlers
  const handleSaveAch = async () => {
    try {
      const payload = { ...achForm, date: achForm.date ? new Date(achForm.date).toISOString() : null };
      if (achForm.id) {
        await api.put(`/api/Admin/students/${studentId}/achievements/${achForm.id}`, payload);
      } else {
        await api.post(`/api/Admin/students/${studentId}/achievements`, payload);
      }
      setShowAchModal(false);
      setAchForm({ title: '', description: '', date: '', category: 'Academic' });
      showToast('success', 'Achievement saved.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save achievement.');
    }
  };

  const handleDeleteAch = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/achievements/${id}`);
      showToast('success', 'Achievement deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete achievement.');
    }
  };

  // Hackathons CRUD handlers
  const handleSaveHack = async () => {
    try {
      const payload = { ...hackForm, date: hackForm.date ? new Date(hackForm.date).toISOString() : null };
      if (hackForm.id) {
        await api.put(`/api/Admin/students/${studentId}/hackathons/${hackForm.id}`, payload);
      } else {
        await api.post(`/api/Admin/students/${studentId}/hackathons`, payload);
      }
      setShowHackModal(false);
      setHackForm({ name: '', projectName: '', description: '', achievementPosition: '', date: '' });
      showToast('success', 'Hackathon entry saved.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save hackathon.');
    }
  };

  const handleDeleteHack = async (id: string) => {
    if (!confirm('Delete this hackathon entry?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/hackathons/${id}`);
      showToast('success', 'Hackathon record deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete hackathon.');
    }
  };

  // Community Service CRUD handlers
  const handleSaveService = async () => {
    try {
      const payload = { ...serviceForm, date: serviceForm.date ? new Date(serviceForm.date).toISOString() : null };
      if (serviceForm.id) {
        await api.put(`/api/Admin/students/${studentId}/community/${serviceForm.id}`, payload);
      } else {
        await api.post(`/api/Admin/students/${studentId}/community`, payload);
      }
      setShowServiceModal(false);
      setServiceForm({ organizationName: '', activity: '', hoursServed: 0, description: '', date: '' });
      showToast('success', 'Service entry saved.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save service activity.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this community service entry?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/community/${id}`);
      showToast('success', 'Service entry deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete service entry.');
    }
  };

  // Creative Works CRUD handlers
  const handleSaveCreative = async () => {
    try {
      if (creativeForm.id) {
        await api.put(`/api/Admin/students/${studentId}/creative/${creativeForm.id}`, creativeForm);
      } else {
        await api.post(`/api/Admin/students/${studentId}/creative`, creativeForm);
      }
      setShowCreativeModal(false);
      setCreativeForm({ title: '', description: '', mediaUrl: '', behanceUrl: '' });
      showToast('success', 'Creative exhibit saved.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to save creative exhibit.');
    }
  };

  const handleDeleteCreative = async (id: string) => {
    if (!confirm('Delete this creative work entry?')) return;
    try {
      await api.delete(`/api/Admin/students/${studentId}/creative/${id}`);
      showToast('success', 'Creative work deleted.');
      fetchStudentProfile();
    } catch (err) {
      showToast('error', 'Failed to delete creative work.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-text-muted">Accessing Student Ledger...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass rounded-3xl p-10 text-center max-w-md mx-auto flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h3 className="text-base font-bold">Workspace Access Error</h3>
        <p className="text-xs text-text-muted leading-relaxed">Could not load the requested student profile. Please make sure the student profile still exists in the database directory.</p>
        <button onClick={() => router.push('/admin/students')} className="py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
      </div>
    );
  }

  const tabItems = [
    { id: 'profile', label: 'Overview & Theme', icon: User },
    { id: 'academics', label: 'Academics Ledger', icon: GraduationCap },
    { id: 'projects', label: 'Projects & Certifications', icon: Briefcase },
    { id: 'research', label: 'Research & Innovation', icon: Sparkles },
    { id: 'activities', label: 'Extracurriculars', icon: Trophy }
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-2.5 max-w-sm text-xs font-bold ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600' : 'bg-red-500/10 border-red-500/25 text-red-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5" /> : <AlertCircle className="w-4.5 h-4.5" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/students')}
            className="p-2.5 rounded-xl border border-card-border/60 hover:bg-primary/5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Back to Student Database"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                {profile.department?.name || 'Academic Core'}
              </span>
              {isApproved ? (
                <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-green-600 bg-green-500/10 border border-green-500/15 px-1.5 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded">
                  <ShieldAlert className="w-3 h-3" />
                  <span>DRAFT</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-text-main mt-1 tracking-tight leading-none">
              Student Workspace // {profile.user.name}
            </h1>
            <p className="text-[10px] sm:text-xs text-text-muted mt-1">
              Direct administrative audit console linked with ledger database. Currently editing <span className="font-semibold text-text-main">{profile.user.email}</span>.
            </p>
          </div>
        </div>

        {/* Global Save Trigger */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-card-border/60 bg-page-bg/30 text-xs font-semibold text-text-muted select-none">
            <input 
              type="checkbox" 
              checked={isApproved} 
              onChange={(e) => setIsApproved(e.target.checked)}
              className="rounded border-card-border text-primary focus:ring-primary/40 cursor-pointer"
            />
            <span>Approve & Verify Portfolio</span>
          </label>

          <button
            onClick={handleUpdateCoreProfile}
            disabled={saving}
            className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Core & Status</span>
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-start">
        
        {/* Left column: Navigation Tabs (col-span-2) */}
        <div className="lg:col-span-2 glass rounded-3xl p-4.5 border border-card-border/60 space-y-1.5">
          <p className="text-[9px] font-black tracking-widest text-text-muted uppercase px-2 mb-2">// DIRECTORY SECTIONS</p>
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-text-muted hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4.5 h-4.5" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'translate-x-0.5' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Right column: Form Content Workspace (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* TAB 1: PROFILE & GENERAL CONTENT */}
          {activeTab === 'profile' && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
              <h3 className="text-sm font-black text-text-main uppercase tracking-wider border-b border-card-border/60 pb-3 flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-primary" />
                <span>Profile Core Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Public Profile Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Aspiring ML Engineer | MCC Scholar"
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Skills Index (semi-colon separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. C#; React; Python; ASP.NET"
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Professional Bio Description</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Student overview bio..."
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={gitHubUrl}
                    onChange={(e) => setGitHubUrl(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Behance Portfolio URL</label>
                  <input
                    type="text"
                    value={behanceUrl}
                    onChange={(e) => setBehanceUrl(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Personal Story Summary</label>
                <textarea
                  rows={3.5}
                  value={personalStory}
                  onChange={(e) => setPersonalStory(e.target.value)}
                  placeholder="Describe student background milestones..."
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase">Statement of Purpose Draft (SOP)</label>
                <textarea
                  rows={4.5}
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                  placeholder="Future aspirations SOP draft..."
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-card-border/60 pt-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Student Selected Preset Theme</label>
                  <select
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2"
                  >
                    {['Apple-Minimal', 'Academic', 'Corporate', 'Startup', 'Creative', 'AI-Futuristic'].map((t) => (
                      <option key={t} value={t} className="bg-neutral-900 text-white">{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Custom Theme Hex/JSON Override</label>
                  <input
                    type="text"
                    value={customThemeConfig}
                    onChange={(e) => setCustomThemeConfig(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMICS LEDGER */}
          {activeTab === 'academics' && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-primary" />
                  <span>Academic History Records</span>
                </h3>
                <button
                  type="button"
                  onClick={addAcademicRecord}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add School/College</span>
                </button>
              </div>

              {academicRecords.length === 0 ? (
                <p className="text-xs text-text-muted italic py-6 text-center">No academic history records found for student.</p>
              ) : (
                <div className="space-y-4">
                  {academicRecords.map((record, idx) => (
                    <div 
                      key={idx} 
                      className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex flex-col sm:flex-row gap-3 items-stretch relative"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-text-muted uppercase">Degree/Class</label>
                          <input
                            type="text"
                            value={record.degree}
                            onChange={(e) => handleAcademicChange(idx, 'degree', e.target.value)}
                            placeholder="e.g. B.Sc. Computer Science"
                            className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-text-muted uppercase">Institution</label>
                          <input
                            type="text"
                            value={record.institution}
                            onChange={(e) => handleAcademicChange(idx, 'institution', e.target.value)}
                            placeholder="e.g. Madras Christian College"
                            className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-text-muted uppercase">Score/CGPA</label>
                          <input
                            type="text"
                            value={record.cgpa}
                            onChange={(e) => handleAcademicChange(idx, 'cgpa', e.target.value)}
                            placeholder="e.g. 8.9 CGPA / 89%"
                            className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-bold text-text-muted uppercase">Passing Year</label>
                          <input
                            type="text"
                            value={record.year}
                            onChange={(e) => handleAcademicChange(idx, 'year', e.target.value)}
                            placeholder="e.g. 2026"
                            className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAcademicRecord(idx)}
                        className="self-end sm:self-center p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Delete academic record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS & CERTIFICATIONS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              
              {/* Projects Panel */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4.5 h-4.5 text-primary" />
                    <span>Projects Portfolio</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectForm({ title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: '' });
                      setShowProjectModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {projects.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No projects listed for student.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-text-main">{proj.title}</h4>
                          <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.techStack.split(';').filter(Boolean).map(t => (
                              <span key={t} className="text-[8px] bg-primary/5 border border-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{t.trim()}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setProjectForm(proj);
                              setShowProjectModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications Panel */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-primary" />
                    <span>Verified Certifications</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setCertForm({ name: '', issuer: '', issueDate: '', credentialUrl: '', fileUrl: '' });
                      setShowCertModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certification</span>
                  </button>
                </div>

                {certifications.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No certifications verified for student.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-text-main">{cert.name}</h4>
                          <p className="text-[10px] text-text-muted">{cert.issuer} {cert.issueDate ? `// ${new Date(cert.issueDate).toLocaleDateString()}` : ''}</p>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-[9px] text-primary font-bold hover:underline inline-flex items-center gap-0.5 mt-1.5">
                              <span>Verify Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCertForm({
                                ...cert,
                                issueDate: cert.issueDate ? cert.issueDate.slice(0, 10) : ''
                              });
                              setShowCertModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCert(cert.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: RESEARCH & INNOVATION */}
          {activeTab === 'research' && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  <span>Research Publications & Innovations</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setResearchForm({ title: '', abstract: '', journalOrConference: '', publishDate: '', paperUrl: '', isInnovationProject: false, prototypeStatus: 'Idea', startupIdeaPitch: '' });
                    setShowResearchModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Research/Idea</span>
                </button>
              </div>

              {researchPapers.length === 0 ? (
                <p className="text-xs text-text-muted italic py-6 text-center">No publications or innovations recorded.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {researchPapers.map((paper) => (
                    <div key={paper.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${
                            paper.isInnovationProject ? 'bg-secondary/5 border-secondary/15 text-secondary' : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-600'
                          }`}>
                            {paper.isInnovationProject ? 'Innovation Pitch' : 'Research Publication'}
                          </span>
                          {paper.isInnovationProject && (
                            <span className="text-[8px] text-text-muted font-bold">Status: {paper.prototypeStatus}</span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-text-main">{paper.title}</h4>
                        <p className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{paper.abstract}</p>
                        {paper.journalOrConference && (
                          <p className="text-[9px] text-text-muted/80">Published in: <span className="font-semibold">{paper.journalOrConference}</span> {paper.publishDate ? `// ${new Date(paper.publishDate).toLocaleDateString()}` : ''}</p>
                        )}
                        {paper.startupIdeaPitch && (
                          <div className="p-2.5 rounded-xl bg-black/10 border border-card-border/50 text-[9px] text-text-muted">
                            <span className="font-black text-secondary block">STARTUP IDEA PITCH:</span>
                            <p className="mt-0.5 leading-relaxed">{paper.startupIdeaPitch}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setResearchForm({
                              ...paper,
                              publishDate: paper.publishDate ? paper.publishDate.slice(0, 10) : ''
                            });
                            setShowResearchModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResearch(paper.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EXTRACURRICULARS */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              
              {/* Achievements & Olympiads */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-primary" />
                    <span>Achievements, Awards & Olympiads</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAchForm({ title: '', description: '', date: '', category: 'Academic' });
                      setShowAchModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Achievement</span>
                  </button>
                </div>

                {achievements.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No awards listed.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {achievements.map((ach) => (
                      <div key={ach.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-bold bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded">{ach.category}</span>
                            <span className="text-[8px] text-text-muted font-medium">{ach.date ? new Date(ach.date).toLocaleDateString() : ''}</span>
                          </div>
                          <h4 className="text-xs font-bold text-text-main">{ach.title}</h4>
                          <p className="text-[10px] text-text-muted leading-relaxed">{ach.description}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setAchForm({
                                ...ach,
                                date: ach.date ? ach.date.slice(0, 10) : ''
                              });
                              setShowAchModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAch(ach.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hackathons */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="w-4.5 h-4.5 text-primary" />
                    <span>Hackathons</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setHackForm({ name: '', projectName: '', description: '', achievementPosition: '', date: '' });
                      setShowHackModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Hackathon</span>
                  </button>
                </div>

                {hackathons.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No hackathon entries logged.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {hackathons.map((hack) => (
                      <div key={hack.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-secondary">{hack.achievementPosition}</span>
                            <span className="text-[8px] text-text-muted">{hack.date ? new Date(hack.date).toLocaleDateString() : ''}</span>
                          </div>
                          <h4 className="text-xs font-bold text-text-main">{hack.name}</h4>
                          {hack.projectName && <p className="text-[9px] text-primary font-semibold">Project: {hack.projectName}</p>}
                          <p className="text-[10px] text-text-muted leading-relaxed mt-1">{hack.description}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setHackForm({
                                ...hack,
                                date: hack.date ? hack.date.slice(0, 10) : ''
                              });
                              setShowHackModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHack(hack.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Service & NGOs */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4.5 h-4.5 text-primary" />
                    <span>Community Service & NGO Activities</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setServiceForm({ organizationName: '', activity: '', hoursServed: 0, description: '', date: '' });
                      setShowServiceModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service</span>
                  </button>
                </div>

                {communityServices.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No community service logged.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {communityServices.map((svc) => (
                      <div key={svc.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-red-500 bg-red-500/5 border border-red-500/10 px-1.5 py-0.5 rounded">{svc.hoursServed} Hours Served</span>
                            <span className="text-[8px] text-text-muted">{svc.date ? new Date(svc.date).toLocaleDateString() : ''}</span>
                          </div>
                          <h4 className="text-xs font-bold text-text-main">{svc.organizationName}</h4>
                          <p className="text-[9px] text-text-muted font-bold">{svc.activity}</p>
                          <p className="text-[10px] text-text-muted leading-relaxed mt-1">{svc.description}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setServiceForm({
                                ...svc,
                                date: svc.date ? svc.date.slice(0, 10) : ''
                              });
                              setShowServiceModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(svc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Creative Works */}
              <div className="glass rounded-3xl p-6 sm:p-8 border border-card-border/60 space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4.5 h-4.5 text-primary" />
                    <span>Creative Works & Media Portfolio</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setCreativeForm({ title: '', description: '', mediaUrl: '', behanceUrl: '' });
                      setShowCreativeModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Creative</span>
                  </button>
                </div>

                {creativeWorks.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-6 text-center">No creative works listed.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {creativeWorks.map((creative) => (
                      <div key={creative.id} className="p-4.5 rounded-2xl border border-card-border bg-page-bg/15 flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-text-main">{creative.title}</h4>
                          <p className="text-[10px] text-text-muted">{creative.description}</p>
                          {creative.behanceUrl && (
                            <a href={creative.behanceUrl} target="_blank" rel="noreferrer" className="text-[9px] text-secondary font-bold hover:underline inline-flex items-center gap-0.5 mt-1.5">
                              <span>Behance Project</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setCreativeForm(creative);
                              setShowCreativeModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-primary/5 text-text-muted hover:text-primary transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCreative(creative.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-text-muted hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ─── MODAL DIALOGS ──────────────────────────────────────────────────────── */}

      {/* Project Modal */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{projectForm.id ? 'Edit Project' : 'Add Project'}</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Project Title</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Description</label>
                  <textarea
                    rows={3}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">GitHub URL</label>
                    <input
                      type="text"
                      value={projectForm.gitHubUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, gitHubUrl: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Live Demo URL</label>
                    <input
                      type="text"
                      value={projectForm.liveDemoUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, liveDemoUrl: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Tech Stack (semi-colon separated)</label>
                  <input
                    type="text"
                    value={projectForm.techStack}
                    onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    placeholder="e.g. React; Node.js; PostgreSQL"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveProject} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Project</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Certification Modal */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{certForm.id ? 'Edit Certification' : 'Add Certification'}</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Certificate Name</label>
                  <input
                    type="text"
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Issuer Organisation</label>
                  <input
                    type="text"
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Issue Date</label>
                    <input
                      type="date"
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Credential URL</label>
                    <input
                      type="text"
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowCertModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveCert} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Certificate</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Research Modal */}
      <AnimatePresence>
        {showResearchModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{researchForm.id ? 'Edit Research/Idea' : 'Add Research/Idea'}</h4>
              <div className="space-y-3.5 text-xs text-left max-h-[75vh] overflow-y-auto pr-1">
                <div className="flex items-center gap-2 py-1.5">
                  <label className="flex items-center gap-1.5 font-bold text-text-main cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={researchForm.isInnovationProject}
                      onChange={(e) => setResearchForm({ ...researchForm, isInnovationProject: e.target.checked })}
                      className="rounded text-primary"
                    />
                    <span>Is this an Innovation Project/Startup Pitch?</span>
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Title</label>
                  <input
                    type="text"
                    value={researchForm.title}
                    onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Abstract Summary</label>
                  <textarea
                    rows={3}
                    value={researchForm.abstract}
                    onChange={(e) => setResearchForm({ ...researchForm, abstract: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none resize-none"
                  />
                </div>

                {!researchForm.isInnovationProject ? (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="font-semibold text-text-muted">Journal / Conference</label>
                      <input
                        type="text"
                        value={researchForm.journalOrConference}
                        onChange={(e) => setResearchForm({ ...researchForm, journalOrConference: e.target.value })}
                        className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-text-muted">Publish Date</label>
                      <input
                        type="date"
                        value={researchForm.publishDate}
                        onChange={(e) => setResearchForm({ ...researchForm, publishDate: e.target.value })}
                        className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    <div className="space-y-1">
                      <label className="font-semibold text-text-muted">Prototype Maturity Status</label>
                      <select
                        value={researchForm.prototypeStatus}
                        onChange={(e) => setResearchForm({ ...researchForm, prototypeStatus: e.target.value })}
                        className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                      >
                        {['Idea', 'Prototype', 'Production'].map(s => (
                          <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-text-muted">Startup Pitch Document/Site URL</label>
                      <input
                        type="text"
                        value={researchForm.paperUrl}
                        onChange={(e) => setResearchForm({ ...researchForm, paperUrl: e.target.value })}
                        className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs"
                      />
                    </div>
                  </div>
                )}

                {researchForm.isInnovationProject && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="font-semibold text-text-muted">Startup Idea Pitch Text</label>
                    <textarea
                      rows={3.5}
                      value={researchForm.startupIdeaPitch}
                      onChange={(e) => setResearchForm({ ...researchForm, startupIdeaPitch: e.target.value })}
                      placeholder="Explain the product value proposition..."
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs resize-none"
                    />
                  </div>
                )}

                {!researchForm.isInnovationProject && (
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Paper PDF / Publisher Link URL</label>
                    <input
                      type="text"
                      value={researchForm.paperUrl}
                      onChange={(e) => setResearchForm({ ...researchForm, paperUrl: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowResearchModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveResearch} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Research</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{achForm.id ? 'Edit Achievement' : 'Add Achievement'}</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Title</label>
                  <input
                    type="text"
                    value={achForm.title}
                    onChange={(e) => setAchForm({ ...achForm, title: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Description</label>
                  <textarea
                    rows={2.5}
                    value={achForm.description}
                    onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Date Achieved</label>
                    <input
                      type="date"
                      value={achForm.date}
                      onChange={(e) => setAchForm({ ...achForm, date: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Category</label>
                    <select
                      value={achForm.category}
                      onChange={(e) => setAchForm({ ...achForm, category: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    >
                      {['Academic', 'Sports', 'Competition', 'Olympiad', 'Other'].map(cat => (
                        <option key={cat} value={cat} className="bg-neutral-900 text-white">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowAchModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveAch} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Achievement</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Hackathon Modal */}
      <AnimatePresence>
        {showHackModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{hackForm.id ? 'Edit Hackathon' : 'Add Hackathon'}</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Hackathon Name</label>
                  <input
                    type="text"
                    value={hackForm.name}
                    onChange={(e) => setHackForm({ ...hackForm, name: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Project/Prototype Name</label>
                    <input
                      type="text"
                      value={hackForm.projectName}
                      onChange={(e) => setHackForm({ ...hackForm, projectName: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Position/Result</label>
                    <input
                      type="text"
                      value={hackForm.achievementPosition}
                      onChange={(e) => setHackForm({ ...hackForm, achievementPosition: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                      placeholder="e.g. Winner, Runner Up, Participant"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Date Logged</label>
                    <input
                      type="date"
                      value={hackForm.date}
                      onChange={(e) => setHackForm({ ...hackForm, date: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Description</label>
                  <textarea
                    rows={2.5}
                    value={hackForm.description}
                    onChange={(e) => setHackForm({ ...hackForm, description: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowHackModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveHack} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Hackathon</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Service Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{serviceForm.id ? 'Edit Service' : 'Add Service'}</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Organisation Name</label>
                    <input
                      type="text"
                      value={serviceForm.organizationName}
                      onChange={(e) => setServiceForm({ ...serviceForm, organizationName: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Activity</label>
                    <input
                      type="text"
                      value={serviceForm.activity}
                      onChange={(e) => setServiceForm({ ...serviceForm, activity: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                      placeholder="e.g. Volunteer, Team Leader"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Hours Served</label>
                    <input
                      type="number"
                      value={serviceForm.hoursServed}
                      onChange={(e) => setServiceForm({ ...serviceForm, hoursServed: parseInt(e.target.value) || 0 })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Date of Activity</label>
                    <input
                      type="date"
                      value={serviceForm.date}
                      onChange={(e) => setServiceForm({ ...serviceForm, date: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Description</label>
                  <textarea
                    rows={2.5}
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveService} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Service</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Creative Modal */}
      <AnimatePresence>
        {showCreativeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6.5 space-y-4">
              <h4 className="text-sm font-bold text-text-main border-b border-card-border/60 pb-2">{creativeForm.id ? 'Edit Creative Work' : 'Add Creative Work'}</h4>
              <div className="space-y-3.5 text-xs text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Title of Work</label>
                  <input
                    type="text"
                    value={creativeForm.title}
                    onChange={(e) => setCreativeForm({ ...creativeForm, title: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted">Description</label>
                  <textarea
                    rows={2.5}
                    value={creativeForm.description}
                    onChange={(e) => setCreativeForm({ ...creativeForm, description: e.target.value })}
                    className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Exhibition / Media URL</label>
                    <input
                      type="text"
                      value={creativeForm.mediaUrl}
                      onChange={(e) => setCreativeForm({ ...creativeForm, mediaUrl: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted">Behance Showcase URL</label>
                    <input
                      type="text"
                      value={creativeForm.behanceUrl}
                      onChange={(e) => setCreativeForm({ ...creativeForm, behanceUrl: e.target.value })}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
                <button type="button" onClick={() => setShowCreativeModal(false)} className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all">Cancel</button>
                <button type="button" onClick={handleSaveCreative} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all">Save Creative</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
