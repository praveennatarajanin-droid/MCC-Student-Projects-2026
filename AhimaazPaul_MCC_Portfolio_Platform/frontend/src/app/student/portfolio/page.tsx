'use client';

import React, { useEffect, useState, useRef, DragEvent, useCallback } from 'react';
import api from '@/lib/api';
import { useTheme, ThemeType, themeStyles } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  User, Layers, Briefcase, Award, GraduationCap, Link2,
  Trash2, Plus, Edit3, Save, CheckCircle2, Loader2, Upload, AlertCircle, FileText,
  X, Trophy, Heart, Star, Code2, ExternalLink, Hash, Globe, Palette,
  Sparkles, Zap, Camera, IdCard, RefreshCw,
} from 'lucide-react';

// ─── Interfaces (unchanged) ────────────────────────────────────────────────────

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
  credentialId?: string;
  status?: 'verified' | 'pending' | 'failed';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
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

interface Hackathon {
  id: string;
  name: string;
  projectName: string;
  description: string;
  achievementPosition: string;
  date: string;
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const tabVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, x: -16, transition: { duration: 0.15 } },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } },
};

const modalOverlay: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
  exit:    { opacity: 0 },
};

const modalContent: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } },
  exit:    { opacity: 0, scale: 0.94, y: 16, transition: { duration: 0.18 } },
};

const toastVariants: Variants = {
  hidden:  { opacity: 0, y: 48, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 180, damping: 20 } },
  exit:    { opacity: 0, y: 24, scale: 0.96, transition: { duration: 0.2 } },
};

// ─── Helper Components ─────────────────────────────────────────────────────────

// Completion Ring SVG
const CompletionRing = ({ filled, total, color = 'text-primary' }: { filled: number; total: number; color?: string }) => {
  const pct = total === 0 ? 0 : Math.min((filled / total) * 100, 100);
  const r = 11;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <svg width="30" height="30" className="-rotate-90">
        <circle cx="15" cy="15" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-15" />
        <circle cx="15" cy="15" r={r} fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="text-[9px] font-bold tracking-wide">{filled}/{total}</span>
    </div>
  );
};

// Skills Tag-Chip Input
const SkillsTagInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tags = value.split(';').map(s => s.trim()).filter(Boolean);

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag].join(';'));
    }
    setInput('');
  }, [tags, onChange]);

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag).join(';'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-card-border bg-page-bg/40 min-h-[48px] cursor-text focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all"
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence>
        {tags.map(tag => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-md"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary/60 cursor-pointer ml-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? 'Type a skill and press Enter…' : 'Add more…'}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-text-main outline-none placeholder-text-muted/40"
      />
    </div>
  );
};

// Illustrated Empty State
const EmptyState = ({
  icon: Icon, title, description, onAdd, addLabel, color = 'text-primary', bgColor = 'bg-primary/5'
}: {
  icon: any; title: string; description: string;
  onAdd: () => void; addLabel: string; color?: string; bgColor?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center text-center py-12 px-6 gap-4"
  >
    <div className={`w-16 h-16 rounded-2xl ${bgColor} flex items-center justify-center`}>
      <Icon className={`w-8 h-8 ${color} opacity-40`} />
    </div>
    <div>
      <p className="text-sm font-bold text-text-main">{title}</p>
      <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-48">{description}</p>
    </div>
    <button
      type="button"
      onClick={onAdd}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${bgColor} ${color} text-xs font-bold hover:opacity-80 transition-all cursor-pointer`}
    >
      <Plus className="w-3.5 h-3.5" />
      {addLabel}
    </button>
  </motion.div>
);

// Modal Wrapper with AnimatePresence + backdrop close
const ModalWrapper = ({ open, onClose, title, accentColor = 'from-primary', children }: {
  open: boolean; onClose: () => void; title: string; accentColor?: string; children: React.ReactNode;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        variants={modalOverlay}
        initial="hidden" animate="visible" exit="exit"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          variants={modalContent}
          initial="hidden" animate="visible" exit="exit"
          className="glass rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className={`h-1 w-full bg-gradient-to-r ${accentColor} to-secondary`} />
          
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-4">
            <h4 className="text-base font-bold text-text-main">{title}</h4>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-primary/5 text-text-muted hover:text-text-main transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-7 pb-7 space-y-5">
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Form Field helper
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-text-muted mb-2">{label}</label>
    {children}
  </div>
);

// Input class reusable
const inputCls = "block w-full px-3.5 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder-text-muted/40";
const textareaCls = `${inputCls} resize-none`;

// Section panel with header
const SectionPanel = ({
  icon: Icon, title, count, total,
  onAdd, addLabel, addColor = 'text-primary', addBg = 'bg-primary/10 hover:bg-primary/20',
  iconColor = 'text-primary', iconBg = 'bg-primary/8',
  children
}: {
  icon: any; title: string; count: number; total?: number;
  onAdd: () => void; addLabel: string; addColor?: string; addBg?: string;
  iconColor?: string; iconBg?: string; children: React.ReactNode;
}) => (
  <div className="glass rounded-3xl overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-card-border/60">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-text-main tracking-tight">{title}</h3>
          {count > 0 && (
            <p className={`text-[10px] font-bold ${addColor} opacity-70 mt-0.5`}>{count} entr{count === 1 ? 'y' : 'ies'}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {total !== undefined && <CompletionRing filled={count} total={total} />}
        <button
          type="button"
          onClick={onAdd}
          className={`inline-flex items-center gap-1 py-1.5 px-3 rounded-xl ${addBg} ${addColor} text-xs font-bold transition-all cursor-pointer`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{addLabel}</span>
        </button>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// Rich list item card
const ItemCard = ({
  accentColor = 'from-primary/80 to-primary/30',
  onEdit, onDelete, children
}: {
  accentColor?: string; onEdit?: () => void; onDelete?: () => void; children: React.ReactNode;
}) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -2 }}
    className="relative flex items-start justify-between gap-4 p-5 rounded-2xl border border-card-border/60 bg-page-bg/15 overflow-hidden group hover:border-card-border hover:shadow-sm transition-all duration-300"
  >
    {/* Left accent bar */}
    <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b ${accentColor} rounded-l-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
    <div className="flex-1 min-w-0 pl-1">{children}</div>
    {(onEdit || onDelete) && (
      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-primary/8 text-text-muted hover:text-primary transition-all cursor-pointer"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/8 text-text-muted hover:text-red-500 transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    )}
  </motion.div>
);

// Modal action buttons
const ModalActions = ({ onCancel, onSave, saveLabel = 'Save', loading = false }: { onCancel: () => void; onSave: () => void; saveLabel?: string; loading?: boolean }) => (
  <div className="flex justify-end gap-2.5 pt-2 border-t border-card-border/60">
    <button type="button" onClick={onCancel} disabled={loading}
      className="px-4 py-2 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-semibold text-text-muted cursor-pointer transition-all disabled:opacity-50"
    >
      Cancel
    </button>
    <motion.button type="button" onClick={onSave} whileTap={{ scale: loading ? 1 : 0.97 }} disabled={loading}
      className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
      <span>{loading ? 'Saving...' : saveLabel}</span>
    </motion.button>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PortfolioBuilder() {
  const { theme: activeTheme, setTheme, mode, setCustomConfig, customConfig } = useTheme();
  const { refreshUser, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'achievements' | 'resume'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Auto-save Status
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'changed' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedState = useRef<{
    headline: string;
    bio: string;
    personalStory: string;
    statementOfPurpose: string;
    skills: string;
    gitHubUrl: string;
    linkedInUrl: string;
    behanceUrl: string;
    registrationNumber: string;
    profilePictureUrl: string;
    selectedPreset: ThemeType;
    customPrimary: string;
    customSecondary: string;
    academicRecordsJson: string;
  }>({
    headline: '',
    bio: '',
    personalStory: '',
    statementOfPurpose: '',
    skills: '',
    gitHubUrl: '',
    linkedInUrl: '',
    behanceUrl: '',
    registrationNumber: '',
    profilePictureUrl: '',
    selectedPreset: 'Corporate',
    customPrimary: '',
    customSecondary: '',
    academicRecordsJson: '[]'
  });

  // Toast (replaces statusMsg)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Profile data
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [personalStory, setPersonalStory] = useState('');
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [skills, setSkills] = useState('');
  const [gitHubUrl, setGitHubUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [behanceUrl, setBehanceUrl] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [academicRecords, setAcademicRecords] = useState<{ degree: string; institution: string; cgpa: string; year: string }[]>([
    { degree: '', institution: '', cgpa: '', year: '' }
  ]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [deletingResume, setDeletingResume] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [showResumePreviewModal, setShowResumePreviewModal] = useState(false);

  // Collections (UNCHANGED)
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [communityServices, setCommunityServices] = useState<CommunityService[]>([]);
  const [creativeWorks, setCreativeWorks] = useState<CreativeWork[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);

  // Theme (UNCHANGED)
  const [selectedPreset, setSelectedPreset] = useState<ThemeType>('Corporate');
  const [customPrimary, setCustomPrimary] = useState('');
  const [customSecondary, setCustomSecondary] = useState('');

  // Entity form states (UNCHANGED)
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<{ id?: string; title: string; description: string; gitHubUrl: string; liveDemoUrl: string; techStack: string }>({
    title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: ''
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState<{ id?: string; name: string; issuer: string; issueDate: string; credentialUrl: string; fileUrl: string }>({
    name: '', issuer: '', issueDate: '', credentialUrl: '', fileUrl: ''
  });

  const [showAchModal, setShowAchModal] = useState(false);
  const [achForm, setAchForm] = useState<{ id?: string; title: string; description: string; date: string; category: string }>({
    title: '', description: '', date: '', category: 'Academic'
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState<{ id?: string; organizationName: string; activity: string; hoursServed: number; description: string; date: string }>({
    organizationName: '', activity: '', hoursServed: 0, description: '', date: ''
  });

  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [creativeForm, setCreativeForm] = useState<{ id?: string; title: string; description: string; mediaUrl: string; behanceUrl: string }>({
    title: '', description: '', mediaUrl: '', behanceUrl: ''
  });

  const [showHackModal, setShowHackModal] = useState(false);
  const [hackForm, setHackForm] = useState<{ id?: string; name: string; projectName: string; description: string; achievementPosition: string; date: string }>({
    name: '', projectName: '', description: '', achievementPosition: '', date: ''
  });

  const [uploadingResume, setUploadingResume] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetching (UNCHANGED logic) ──────────────────────────────────────────

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/api/StudentProfile/me');
      const data = res.data;
      setHeadline(data.headline || '');
      setBio(data.bio || '');
      setPersonalStory(data.personalStory || '');
      setStatementOfPurpose(data.statementOfPurpose || '');
      setSkills(data.skills || '');
      setGitHubUrl(data.gitHubUrl || '');
      setLinkedInUrl(data.linkedInUrl || '');
      setBehanceUrl(data.behanceUrl || '');
      setResumeUrl(data.resumeUrl || '');
      setRegistrationNumber(data.registrationNumber || '');
      setProfilePictureUrl(data.profilePictureUrl || '');
      const presetTheme = (data.theme && data.theme !== 'MCC-Official' ? data.theme : 'Corporate') as ThemeType;
      setSelectedPreset(presetTheme);

      let primaryColor = '';
      let secondaryColor = '';
      try {
        const customTheme = JSON.parse(data.customThemeConfig || '{}');
        primaryColor = customTheme.primary || '';
        secondaryColor = customTheme.secondary || '';
        setCustomPrimary(primaryColor);
        setCustomSecondary(secondaryColor);
      } catch (e) { console.error(e); }

      let records = [{ degree: '', institution: '', cgpa: '', year: '' }];
      if (data.academicRecordsJson) {
        try {
          records = JSON.parse(data.academicRecordsJson);
          setAcademicRecords(records);
        } catch {
          setAcademicRecords(records);
        }
      } else {
        setAcademicRecords(records);
      }

      // Populate lastSavedState to prevent initial load auto-save
      lastSavedState.current = {
        headline: data.headline || '',
        bio: data.bio || '',
        personalStory: data.personalStory || '',
        statementOfPurpose: data.statementOfPurpose || '',
        skills: data.skills || '',
        gitHubUrl: data.gitHubUrl || '',
        linkedInUrl: data.linkedInUrl || '',
        behanceUrl: data.behanceUrl || '',
        registrationNumber: data.registrationNumber || '',
        profilePictureUrl: data.profilePictureUrl || '',
        selectedPreset: presetTheme,
        customPrimary: primaryColor,
        customSecondary: secondaryColor,
        academicRecordsJson: JSON.stringify(records)
      };

      setProjects(data.projects || []);
      setCertifications(data.certifications || []);
      setAchievements(data.achievements || []);
      setCommunityServices(data.communityServices || []);
      setCreativeWorks(data.creativeWorks || []);
      setHackathons(data.hackathons || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  // ── API Handlers (UNCHANGED logic, uses showToast) ───────────────────────────

  const handleAvatarUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('error', 'Please upload a valid image file (JPG, PNG, etc.).');
      return;
    }
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/StudentProfile/upload-document?type=avatars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = response.data.fileUrl;
      setProfilePictureUrl(newUrl);
      // Immediately persist so the public profile reflects the change
      await api.post('/api/StudentProfile/update', {
        headline, bio, personalStory, statementOfPurpose, skills,
        gitHubUrl, linkedInUrl, behanceUrl,
        academicRecordsJson: JSON.stringify(academicRecords),
        registrationNumber,
        profilePictureUrl: newUrl,
      });
      lastSavedState.current.profilePictureUrl = newUrl;
      showToast('success', 'Profile photo updated!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Remove your profile photo?')) return;
    setProfilePictureUrl('');
    try {
      await api.post('/api/StudentProfile/update', {
        headline, bio, personalStory, statementOfPurpose, skills,
        gitHubUrl, linkedInUrl, behanceUrl,
        academicRecordsJson: JSON.stringify(academicRecords),
        registrationNumber,
        profilePictureUrl: '',
      });
      lastSavedState.current.profilePictureUrl = '';
      showToast('success', 'Profile photo removed.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not remove photo.');
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent | React.MouseEvent, silent = false) => {
    if (e) e.preventDefault();
    if (saving) return;
    setAutoSaveStatus('saving');
    setSaving(true);
    try {
      const recordsJson = JSON.stringify(academicRecords);
      await api.post('/api/StudentProfile/update', {
        headline, bio, personalStory, statementOfPurpose, skills,
        gitHubUrl, linkedInUrl, behanceUrl,
        academicRecordsJson: recordsJson,
        registrationNumber,
        profilePictureUrl,
      });
      const themeConfig = { primary: customPrimary || undefined, secondary: customSecondary || undefined };
      await api.post('/api/StudentProfile/theme', { theme: selectedPreset, customThemeConfig: JSON.stringify(themeConfig) });
      setTheme(selectedPreset);
      setCustomConfig(themeConfig);
      await refreshUser();

      // Update last saved state snapshot
      lastSavedState.current = {
        headline,
        bio,
        personalStory,
        statementOfPurpose,
        skills,
        gitHubUrl,
        linkedInUrl,
        behanceUrl,
        registrationNumber,
        profilePictureUrl,
        selectedPreset,
        customPrimary,
        customSecondary,
        academicRecordsJson: recordsJson
      };

      setAutoSaveStatus('saved');
      if (!silent) {
        showToast('success', 'Profile and theme settings saved successfully!');
      }
    } catch (err) {
      console.error(err);
      setAutoSaveStatus('error');
      if (!silent) {
        showToast('error', 'Error saving profile configurations.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePresetSelect = (preset: ThemeType) => {
    setSelectedPreset(preset);
    setTheme(preset);
    setCustomPrimary('');
    setCustomSecondary('');
    setCustomConfig({});
  };

  const handleCustomColorChange = (type: 'primary' | 'secondary', val: string) => {
    if (type === 'primary') { setCustomPrimary(val); setCustomConfig({ ...customConfig, primary: val }); }
    else { setCustomSecondary(val); setCustomConfig({ ...customConfig, secondary: val }); }
  };

  // Debounced auto-save hook
  useEffect(() => {
    if (loading) return;

    const currentRecordsJson = JSON.stringify(academicRecords);
    const hasChanges = 
      headline !== lastSavedState.current.headline ||
      bio !== lastSavedState.current.bio ||
      personalStory !== lastSavedState.current.personalStory ||
      statementOfPurpose !== lastSavedState.current.statementOfPurpose ||
      skills !== lastSavedState.current.skills ||
      gitHubUrl !== lastSavedState.current.gitHubUrl ||
      linkedInUrl !== lastSavedState.current.linkedInUrl ||
      behanceUrl !== lastSavedState.current.behanceUrl ||
      registrationNumber !== lastSavedState.current.registrationNumber ||
      profilePictureUrl !== lastSavedState.current.profilePictureUrl ||
      selectedPreset !== lastSavedState.current.selectedPreset ||
      customPrimary !== lastSavedState.current.customPrimary ||
      customSecondary !== lastSavedState.current.customSecondary ||
      currentRecordsJson !== lastSavedState.current.academicRecordsJson;

    if (hasChanges) {
      setAutoSaveStatus('changed');
      const debounceTimer = setTimeout(() => {
        handleUpdateProfile(undefined, true);
      }, 1500);

      return () => clearTimeout(debounceTimer);
    } else {
      setAutoSaveStatus(prev => prev === 'saving' || prev === 'changed' ? 'saved' : prev);
    }
  }, [
    loading,
    headline,
    bio,
    personalStory,
    statementOfPurpose,
    skills,
    gitHubUrl,
    linkedInUrl,
    behanceUrl,
    registrationNumber,
    profilePictureUrl,
    selectedPreset,
    customPrimary,
    customSecondary,
    academicRecords
  ]);

  const renderAutoSaveBadge = () => {
    switch (autoSaveStatus) {
      case 'changed':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-bold shrink-0"
          >
            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
            <span>Unsaved changes</span>
          </motion.div>
        );
      case 'saving':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold shrink-0"
          >
            <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
            <span>Saving changes...</span>
          </motion.div>
        );
      case 'saved':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold shrink-0"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Auto-saved</span>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold shrink-0"
          >
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span>Connection error</span>
          </motion.div>
        );
      case 'idle':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold shrink-0"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Auto-saved</span>
          </motion.div>
        );
    }
  };

  const handleAcademicChange = (index: number, key: string, val: string) => {
    const updated = [...academicRecords];
    updated[index] = { ...updated[index], [key]: val };
    setAcademicRecords(updated);
  };

  const addAcademicRecord = () => setAcademicRecords([...academicRecords, { degree: '', institution: '', cgpa: '', year: '' }]);
  const removeAcademicRecord = (index: number) => setAcademicRecords(academicRecords.filter((_, i) => i !== index));

  // Resume upload (UNCHANGED)
  const processResumeFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      showToast('error', 'Please upload a valid PDF file.');
      return;
    }
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/api/StudentProfile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeUrl(response.data.fileUrl);
      showToast('success', 'Resume uploaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Could not upload PDF file.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processResumeFile(files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processResumeFile(file);
  };

  const handleRemoveResume = async () => {
    if (!confirm('Are you sure you want to remove your resume?')) return;
    setDeletingResume(true);
    try {
      await api.post('/api/StudentProfile/remove-resume');
      setResumeUrl('');
      showToast('success', 'Resume removed successfully.');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to remove resume.');
    } finally {
      setDeletingResume(false);
    }
  };

  // CRUD: Projects (UNCHANGED)
  const handleSaveProject = async () => {
    setModalSaving(true);
    try {
      if (projectForm.id) {
        const res = await api.put(`/api/StudentProfile/projects/${projectForm.id}`, projectForm);
        setProjects(prev => prev.map(p => p.id === projectForm.id ? res.data : p));
      } else {
        const res = await api.post('/api/StudentProfile/projects', projectForm);
        setProjects(prev => [...prev, res.data]);
      }
      setShowProjectModal(false);
      setProjectForm({ title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: '' });
      showToast('success', 'Project saved!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save project.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/api/StudentProfile/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Project removed.');
    } catch (err) { console.error(err); }
  };

  // CRUD: Certifications (Management routed to separate Vault)

  // CRUD: Hackathons (UNCHANGED)
  const handleSaveHack = async () => {
    setModalSaving(true);
    try {
      const payload = { ...hackForm, date: hackForm.date ? new Date(hackForm.date).toISOString() : null };
      if (hackForm.id) {
        const res = await api.put(`/api/StudentProfile/hackathons/${hackForm.id}`, payload);
        setHackathons(prev => prev.map(h => h.id === hackForm.id ? res.data : h));
      } else {
        const res = await api.post('/api/StudentProfile/hackathons', payload);
        setHackathons(prev => [...prev, res.data]);
      }
      setShowHackModal(false);
      setHackForm({ name: '', projectName: '', description: '', achievementPosition: '', date: '' });
      showToast('success', 'Hackathon entry saved!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save hackathon.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteHack = async (id: string) => {
    if (!confirm('Delete this hackathon record?')) return;
    try {
      await api.delete(`/api/StudentProfile/hackathons/${id}`);
      setHackathons(prev => prev.filter(h => h.id !== id));
    } catch (err) { console.error(err); }
  };

  // CRUD: Achievements (UNCHANGED)
  const handleSaveAch = async () => {
    setModalSaving(true);
    try {
      const payload = { ...achForm, date: achForm.date ? new Date(achForm.date).toISOString() : null };
      if (achForm.id) {
        const res = await api.put(`/api/StudentProfile/achievements/${achForm.id}`, payload);
        setAchievements(prev => prev.map(a => a.id === achForm.id ? res.data : a));
      } else {
        const res = await api.post('/api/StudentProfile/achievements', payload);
        setAchievements(prev => [...prev, res.data]);
      }
      setShowAchModal(false);
      setAchForm({ title: '', description: '', date: '', category: 'Academic' });
      showToast('success', 'Achievement saved!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save achievement.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteAch = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/api/StudentProfile/achievements/${id}`);
      setAchievements(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); }
  };

  // CRUD: Community Service (UNCHANGED)
  const handleSaveService = async () => {
    setModalSaving(true);
    try {
      const payload = { ...serviceForm, date: serviceForm.date ? new Date(serviceForm.date).toISOString() : null };
      if (serviceForm.id) {
        const res = await api.put(`/api/StudentProfile/community/${serviceForm.id}`, payload);
        setCommunityServices(prev => prev.map(s => s.id === serviceForm.id ? res.data : s));
      } else {
        const res = await api.post('/api/StudentProfile/community', payload);
        setCommunityServices(prev => [...prev, res.data]);
      }
      setShowServiceModal(false);
      setServiceForm({ organizationName: '', activity: '', hoursServed: 0, description: '', date: '' });
      showToast('success', 'Service activity saved!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save service entry.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service entry?')) return;
    try {
      await api.delete(`/api/StudentProfile/community/${id}`);
      setCommunityServices(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error(err); }
  };

  // CRUD: Creative Works (UNCHANGED)
  const handleSaveCreative = async () => {
    setModalSaving(true);
    try {
      if (creativeForm.id) {
        const res = await api.put(`/api/StudentProfile/creative/${creativeForm.id}`, creativeForm);
        setCreativeWorks(prev => prev.map(c => c.id === creativeForm.id ? res.data : c));
      } else {
        const res = await api.post('/api/StudentProfile/creative', creativeForm);
        setCreativeWorks(prev => [...prev, res.data]);
      }
      setShowCreativeModal(false);
      setCreativeForm({ title: '', description: '', mediaUrl: '', behanceUrl: '' });
      showToast('success', 'Creative work saved!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to save exhibit.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteCreative = async (id: string) => {
    if (!confirm('Delete this creative work?')) return;
    try {
      await api.delete(`/api/StudentProfile/creative/${id}`);
      setCreativeWorks(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  };

  // ── Tab configuration with live counts ────────────────────────────────────────

  const tabs = [
    { id: 'profile', label: 'Profile & Theme', icon: User, count: [headline, bio, skills].filter(Boolean).length, total: 3 },
    { id: 'projects', label: 'Projects & Certs', icon: Briefcase, count: projects.length + certifications.length },
    { id: 'achievements', label: 'Achievements', icon: Award, count: achievements.length + hackathons.length + communityServices.length + creativeWorks.length },
    { id: 'resume', label: 'Academics', icon: GraduationCap, count: academicRecords.filter(r => r.degree).length },
  ];

  // ── Loading State ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          </div>
          <p className="text-xs font-semibold text-text-muted">Loading your portfolio…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────────

  const renderPreviewContent = () => {
    switch (selectedPreset) {
      case 'Academic':
        return (
          <div className="font-serif text-amber-950 p-4 space-y-4 rounded-2xl bg-[#fbf8f3] dark:bg-[#120c0e] border border-amber-900/15 shadow-sm text-left">
            <div className="text-center pb-2.5 border-b border-amber-900/10">
              <div className="w-11 h-11 rounded-full bg-amber-900 text-amber-50 flex items-center justify-center text-xs font-bold mx-auto border border-amber-900/20">
                {user?.name?.slice(0, 2).toUpperCase() || '??'}
              </div>
              <h4 className="text-xs font-black text-amber-900 mt-2">{user?.name || 'Student Name'}</h4>
              <p className="text-[9px] font-semibold text-text-muted mt-0.5">{headline || 'MCC Scholar'}</p>
            </div>
            <div className="space-y-1.5 text-[9px]">
              <span className="font-bold text-amber-900 uppercase tracking-widest block">// Academics</span>
              {academicRecords.map((r, i) => (
                <div key={i} className="pl-2 border-l border-amber-900/25">
                  <p className="font-bold">{r.degree || 'Degree'}</p>
                  <p className="text-text-muted">{r.institution || 'MCC'}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'AI-Futuristic':
        return (
          <div className="font-mono text-emerald-400 p-4 space-y-4 rounded-2xl bg-black border border-emerald-500/25 shadow-md text-left">
            <div className="text-[8px] text-emerald-500/50 border-b border-emerald-500/15 pb-2">
              &gt; SYSTEM STATE: COMPILED
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300">{user?.name || 'Candidate Node'}</h4>
                <p className="text-[8px] text-emerald-500/60 uppercase">[{headline || 'Candidate Node'}]</p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] text-emerald-500/60 uppercase block">// Core Skills</span>
              <div className="flex flex-wrap gap-1">
                {skills.split(';').filter(Boolean).map(s => (
                  <span key={s} className="text-[8px] border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0.5 rounded text-emerald-400">{s.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Creative':
        return (
          <div className="font-sans text-neutral-900 p-4 space-y-4 rounded-2xl bg-white border-2 border-neutral-900 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black text-xs rotate-3 border-2 border-black shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">{user?.name}</h4>
                <p className="text-[8px] text-indigo-700 font-bold uppercase mt-0.5">// {headline || 'Creative Mind'}</p>
              </div>
            </div>
            {bio && <p className="text-[9px] text-neutral-600 bg-yellow-100 p-2.5 rounded-xl border-2 border-black font-semibold leading-relaxed">"{bio}"</p>}
          </div>
        );
      case 'Corporate':
        return (
          <div className="font-sans text-left rounded-2xl overflow-hidden border border-slate-200 shadow-sm text-left">
            {/* Top bar */}
            <div className="bg-[#0f172a] px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Professional Portfolio</span>
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="bg-[#0f172a] w-16 p-2.5 space-y-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-500/30 text-blue-300 flex items-center justify-center text-[8px] font-black mx-auto">
                  {user?.name?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div className="space-y-1">
                  <div className="h-1 bg-blue-400/20 rounded w-full" />
                  <div className="h-1 bg-blue-400/20 rounded w-3/4" />
                  <div className="h-1 bg-blue-400/20 rounded w-5/6" />
                </div>
              </div>
              {/* Content */}
              <div className="bg-white flex-1 p-2.5 space-y-2">
                <div>
                  <div className="h-1.5 bg-blue-600 rounded-full w-16 mb-1" />
                  <div className="h-1 bg-slate-200 rounded w-full" />
                  <div className="h-1 bg-slate-200 rounded w-5/6 mt-0.5" />
                </div>
                <div>
                  <div className="h-1.5 bg-blue-600 rounded-full w-12 mb-1" />
                  <div className="h-1 bg-slate-100 rounded w-full" />
                  <div className="h-1 bg-slate-100 rounded w-4/5 mt-0.5" />
                </div>
                <div className="flex gap-1 pt-1">
                  {['React','Node','TS'].map(t => (
                    <span key={t} className="text-[6px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-bold">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'Startup':
        return (
          <div className="font-sans text-left rounded-2xl overflow-hidden shadow-sm space-y-2 text-left">
            {/* Gradient hero */}
            <div className="rounded-xl p-3 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5,#06b6d4)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 text-white flex items-center justify-center text-[8px] font-black shrink-0">
                  {user?.name?.slice(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <p className="text-[9px] font-black leading-tight">{user?.name || 'Student Name'}</p>
                  <p className="text-[7px] text-white/70 font-medium">{headline || 'Building the future'}</p>
                </div>
              </div>
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { l: 'Projects', c: 'from-violet-500 to-purple-600' },
                { l: 'Certs', c: 'from-cyan-500 to-blue-600' },
                { l: 'Research', c: 'from-fuchsia-500 to-pink-600' },
              ].map(({ l, c }) => (
                <div key={l} className={`rounded-lg p-1.5 text-white text-center bg-gradient-to-br ${c}`}>
                  <span className="text-[10px] font-black block">0</span>
                  <span className="text-[6px] font-bold opacity-80">{l}</span>
                </div>
              ))}
            </div>
            {/* Bento cards */}
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-white rounded-xl border border-purple-100 p-2 col-span-2">
                <div className="h-1 bg-violet-200 rounded w-8 mb-1" />
                <div className="h-1 bg-slate-100 rounded w-full" />
                <div className="h-1 bg-slate-100 rounded w-4/5 mt-0.5" />
              </div>
              <div className="bg-white rounded-xl border border-cyan-100 p-2">
                <div className="h-1 bg-cyan-200 rounded w-6 mb-1" />
                <div className="flex flex-wrap gap-0.5">
                  {(skills.split(';').filter(Boolean).slice(0,3) || ['React','Node']).map(s => (
                    <span key={s} className="text-[5px] bg-violet-50 text-violet-600 px-0.5 rounded font-bold">{s.trim()}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-pink-100 p-2">
                <div className="h-1 bg-fuchsia-200 rounded w-6 mb-1" />
                <div className="h-1 bg-slate-100 rounded w-full" />
              </div>
            </div>
          </div>
        );
      case 'Apple-Minimal':
      default:
        return (
          <div className="font-sans text-neutral-900 p-4 space-y-4 rounded-2xl bg-white border border-neutral-200 text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-black leading-tight tracking-tight">{user?.name}</h4>
              <p className="text-[9px] text-neutral-500 font-semibold">{headline || 'Undergraduate student'}</p>
            </div>
            {bio && <p className="text-[9px] text-neutral-400 font-semibold leading-relaxed">"{bio}"</p>}
            <div className="flex flex-wrap gap-1 pt-2 border-t border-neutral-100">
              {skills.split(';').filter(Boolean).map(s => (
                <span key={s} className="text-[8px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-bold">{s.trim()}</span>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative pb-8">

      {/* ── Page Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 border-b border-card-border/60 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight">
              Portfolio Builder
            </h1>
            {renderAutoSaveBadge()}
          </div>
          <p className="text-xs sm:text-sm text-text-muted mt-1 font-sans">
            Craft your profile, showcase projects, set your theme, and view updates instantly in the live mockup.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Preview public profile */}
          {user?.usernameSlug && (
            <a
              href={`/student/${user.usernameSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview Public Profile</span>
              <span className="sm:hidden">Preview</span>
            </a>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline font-sans">Active Workspace</span>
          </div>
        </div>
      </div>

      {/* ── Split Grid Workspace ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Forms Editor (col-span-7) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Tab Pill Bar */}
          <div className="glass rounded-2xl p-1.5 flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  whileHover={{ scale: isActive ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center
                    ${isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text-muted hover:text-text-main hover:bg-primary/5'}
                  `}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

      {/* ── Tab Content ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >

          {/* ═══ TAB 1: PROFILE & THEME ═════════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-1 gap-6">

              {/* Left: Profile Fields */}
              <div className="lg:col-span-2 xl:col-span-1 space-y-5">

                {/* Profile Photo + Reg Number */}
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center">
                      <Camera className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Photo & Student ID</h3>
                      <p className="text-[10px] text-text-muted">Your profile photo and registration number</p>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Avatar Upload Zone */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-card-border bg-primary/5 flex items-center justify-center">
                          {profilePictureUrl ? (
                            <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-primary/40">
                              {user?.name?.slice(0, 2).toUpperCase() || '??'}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                        >
                          {uploadingAvatar
                            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                            : <Camera className="w-6 h-6 text-white" />}
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {uploadingAvatar ? 'Uploading…' : profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {profilePictureUrl && !uploadingAvatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Registration Number */}
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5" /> Registration Number
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. 21BCS001"
                        value={registrationNumber}
                        onChange={e => setRegistrationNumber(e.target.value.toUpperCase())}
                        className={inputCls}
                      />
                      <p className="text-[10px] text-text-muted">Your college-assigned student registration number.</p>
                    </div>
                  </div>
                </div>

                {/* Basic Identity */}
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Identity & Biography</h3>
                      <p className="text-[10px] text-text-muted">Your public-facing profile information</p>
                    </div>
                    <div className="ml-auto">
                      <CompletionRing
                        filled={[headline, bio, personalStory, statementOfPurpose].filter(Boolean).length}
                        total={4}
                      />
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    <Field label="Headline">
                      <input
                        type="text"
                        placeholder="E.g. Full-Stack Engineer & AI Researcher at MCC"
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Biography">
                      <textarea
                        rows={4}
                        placeholder="Introduce yourself, your academic path at MCC, and key interests…"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className={textareaCls}
                      />
                    </Field>

                    <Field label="Personal Journey Story">
                      <textarea
                        rows={4}
                        placeholder="Tell a deeper story about how you got into this field, milestones at MCC…"
                        value={personalStory}
                        onChange={e => setPersonalStory(e.target.value)}
                        className={textareaCls}
                      />
                    </Field>

                    <Field label="Statement of Purpose (SOP)">
                      <textarea
                        rows={4}
                        placeholder="Your academic and career SOP — can also be AI-generated via the AI Tools tab."
                        value={statementOfPurpose}
                        onChange={e => setStatementOfPurpose(e.target.value)}
                        className={textareaCls}
                      />
                    </Field>
                  </div>
                </div>

                {/* Skills Tag Input */}
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center">
                      <Hash className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Skills Matrix</h3>
                      <p className="text-[10px] text-text-muted">Press <kbd className="px-1 py-0.5 rounded border border-card-border text-[9px] font-mono">Enter</kbd> or <kbd className="px-1 py-0.5 rounded border border-card-border text-[9px] font-mono">,</kbd> to add a skill tag</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-bold text-secondary">{skills.split(';').filter(Boolean).length} skills</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <SkillsTagInput value={skills} onChange={setSkills} />
                  </div>
                </div>

                {/* Social Links */}
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <Link2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Social & Portfolio Links</h3>
                      <p className="text-[10px] text-text-muted">Appear on your public profile card</p>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="GitHub URL">
                      <input type="url" placeholder="https://github.com/…"
                        value={gitHubUrl} onChange={e => setGitHubUrl(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="LinkedIn URL">
                      <input type="url" placeholder="https://linkedin.com/in/…"
                        value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Behance / Dribbble">
                      <input type="url" placeholder="https://behance.net/…"
                        value={behanceUrl} onChange={e => setBehanceUrl(e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Right: Theme Panel */}
              <div className="lg:col-span-1 xl:col-span-1 space-y-5">

                {/* Preset Selector */}
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <Palette className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Portfolio Theme</h3>
                      <p className="text-[10px] text-text-muted">Changes your public showcase style</p>
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                    {(['Academic', 'Corporate', 'Startup', 'Creative', 'AI-Futuristic', 'Apple-Minimal'] as ThemeType[]).map((themeName) => {
                      const colors = themeStyles[themeName].light;
                      const isSelected = selectedPreset === themeName;
                      const descriptions: Record<ThemeType, string> = {
                        Academic: "Classic Serif typography, parchment paper background, and a historical academic timeline.",
                        Corporate: "Dark navy two-column layout: sidebar with education & skills, right panel with timeline projects.",
                        Startup: "Vibrant gradient hero banner with glassmorphism bento-grid cards. Stats row and tech-forward layout.",
                        Creative: "Asymmetric floating layout, playful offset shadow blocks, and rotating project cards.",
                        'AI-Futuristic': "Obsidian dark mode console, cyan glowing cyber-borders, and computer diagnostics HUD layout.",
                        'Apple-Minimal': "Mono high-contrast grayscale, scrollable carousels, and spacious minimal layout."
                      };
                      return (
                        <motion.button
                          key={themeName}
                          type="button"
                          onClick={() => handlePresetSelect(themeName)}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.97 }}
                          className={`w-full text-left rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                            isSelected ? 'border-primary shadow-sm' : 'border-card-border hover:border-primary/30'
                          }`}
                        >
                          {/* Mini Preview */}
                          <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${colors['--color-primary']}, ${colors['--color-secondary']})` }} />
                          <div className="flex items-start justify-between px-3.5 py-3 gap-3">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-sm"
                                style={{ background: `linear-gradient(135deg, ${colors['--color-primary']}, ${colors['--color-secondary']})` }}>
                                {themeName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-text-main'} truncate`}>
                                  {themeName}
                                </span>
                                <span className="text-[9px] text-text-muted mt-0.5 leading-normal">
                                  {descriptions[themeName]}
                                </span>
                              </div>
                            </div>
                            
                            {/* Theme select status and color indicators */}
                            <div className="flex flex-col items-end justify-between shrink-0 gap-2 mt-0.5 self-stretch">
                              <div>
                                {isSelected ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                ) : (
                                  <div className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: colors['--color-primary'] }} />
                                <span className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: colors['--color-secondary'] }} />
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Override */}
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-text-main">Custom Color Override</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <Field label="Primary Accent Color">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={customPrimary || '#800020'}
                          onChange={e => handleCustomColorChange('primary', e.target.value)}
                          className="w-11 h-11 border-0 rounded-xl overflow-hidden cursor-pointer shrink-0 shadow-sm"
                        />
                        <input
                          type="text"
                          placeholder="#800020"
                          value={customPrimary}
                          onChange={e => handleCustomColorChange('primary', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </Field>

                    <Field label="Secondary Accent Color">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={customSecondary || '#C5A059'}
                          onChange={e => handleCustomColorChange('secondary', e.target.value)}
                          className="w-11 h-11 border-0 rounded-xl overflow-hidden cursor-pointer shrink-0 shadow-sm"
                        />
                        <input
                          type="text"
                          placeholder="#C5A059"
                          value={customSecondary}
                          onChange={e => handleCustomColorChange('secondary', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </Field>
                  </div>
                </div>

                 {/* Save Button Row */}
                 <div className="flex items-center justify-between gap-4 mt-6">
                   <div className="text-xs text-text-muted font-sans flex items-center gap-1.5 select-none">
                     {autoSaveStatus === 'saving' && <><Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /><span>Auto-saving...</span></>}
                     {(autoSaveStatus === 'saved' || autoSaveStatus === 'idle') && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>Auto-saved</span></>}
                     {autoSaveStatus === 'changed' && <><RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" /><span>Unsaved changes</span></>}
                     {autoSaveStatus === 'error' && <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span>Connection error</span></>}
                   </div>
                   <motion.button
                     type="submit"
                     disabled={saving}
                     whileHover={{ scale: saving ? 1 : 1.02 }}
                     whileTap={{ scale: saving ? 1 : 0.97 }}
                     className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold hover:shadow-lg transition-all text-xs cursor-pointer"
                   >
                     {saving ? 'Saving...' : 'Save Profile & Theme'}
                   </motion.button>
                 </div>

              </div>
            </form>
          )}

          {/* ═══ TAB 2: PROJECTS & CERTIFICATIONS ══════════════════════════════ */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Projects */}
              <SectionPanel
                icon={Briefcase} title="Projects Matrix"
                count={projects.length}
                onAdd={() => { setProjectForm({ title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: '' }); setShowProjectModal(true); }}
                addLabel="Add Project"
              >
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Code2} title="No projects yet"
                    description="Showcase your technical work — web apps, APIs, research tools, and more."
                    onAdd={() => { setProjectForm({ title: '', description: '', gitHubUrl: '', liveDemoUrl: '', techStack: '' }); setShowProjectModal(true); }}
                    addLabel="Add First Project"
                  />
                ) : (
                  <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                    {projects.map(proj => (
                      <ItemCard key={proj.id}
                        onEdit={() => { setProjectForm(proj); setShowProjectModal(true); }}
                        onDelete={() => handleDeleteProject(proj.id)}
                      >
                        <h4 className="text-sm font-bold text-text-main">{proj.title}</h4>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">{proj.description}</p>
                        {proj.techStack && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {proj.techStack.split(';').slice(0, 4).map(t => (
                              <span key={t} className="text-[10px] font-semibold bg-primary/8 text-primary px-2 py-0.5 rounded-md">{t.trim()}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-text-muted/70 font-semibold">
                          {proj.gitHubUrl && <a href={proj.gitHubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><ExternalLink className="w-3 h-3" /> Source</a>}
                          {proj.liveDemoUrl && <a href={proj.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Globe className="w-3 h-3" /> Demo</a>}
                        </div>
                      </ItemCard>
                    ))}
                  </motion.div>
                )}
              </SectionPanel>

              {/* Certifications */}
              <SectionPanel
                icon={Award} title="Certifications & Medals"
                count={certifications.length}
                onAdd={() => { window.location.href = '/student/certificates'; }}
                addLabel="Manage Vault"
                iconColor="text-secondary" iconBg="bg-secondary/8"
                addColor="text-secondary" addBg="bg-secondary/10 hover:bg-secondary/20"
              >
                {certifications.length === 0 ? (
                  <EmptyState
                    icon={Star} title="No certifications yet"
                    description="Upload verification PDFs and credentials to your portfolio repository."
                    onAdd={() => { window.location.href = '/student/certificates'; }}
                    addLabel="Open Certifications Vault"
                    color="text-secondary" bgColor="bg-secondary/8"
                  />
                ) : (
                  <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                    {certifications.map(cert => (
                      <ItemCard 
                        key={cert.id} 
                        accentColor={
                          cert.status === 'verified'
                            ? 'from-emerald-500/80 to-emerald-500/20'
                            : cert.status === 'pending'
                            ? 'from-amber-500/80 to-amber-500/20'
                            : 'from-red-500/80 to-red-500/20'
                        }
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-text-main">{cert.name}</h4>
                              <p className="text-xs text-text-muted mt-1 font-medium">
                                {cert.issuer} · {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : 'N/A'}
                              </p>
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

                          <div className="flex items-center gap-4 pt-1 text-[10px] font-semibold text-secondary flex-wrap">
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                <Link2 className="w-3 h-3" /> Verify Credential
                              </a>
                            )}
                            {cert.fileUrl && (
                              <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline text-text-muted">
                                <FileText className="w-3 h-3" /> View Document
                              </a>
                            )}
                            <a 
                              href="/student/certificates" 
                              className="inline-flex items-center gap-1 hover:underline ml-auto text-primary"
                            >
                              Manage in Vault &rarr;
                            </a>
                          </div>
                        </div>
                      </ItemCard>
                    ))}
                  </motion.div>
                )}
              </SectionPanel>
            </div>
          )}

          {/* ═══ TAB 3: ACHIEVEMENTS & EXPERIENCE ══════════════════════════════ */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Achievements */}
              <SectionPanel
                icon={Award} title="Honors & Awards"
                count={achievements.length}
                onAdd={() => { setAchForm({ title: '', description: '', date: '', category: 'Academic' }); setShowAchModal(true); }}
                addLabel="Add Honor"
              >
                {achievements.length === 0 ? (
                  <EmptyState
                    icon={Trophy} title="No awards listed"
                    description="Add academic honors, club leadership, sports titles, or any MCC recognition."
                    onAdd={() => { setAchForm({ title: '', description: '', date: '', category: 'Academic' }); setShowAchModal(true); }}
                    addLabel="Add First Achievement"
                  />
                ) : (
                  <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                    {achievements.map(ach => (
                      <ItemCard key={ach.id}
                        onEdit={() => { setAchForm({ ...ach, date: ach.date ? ach.date.substring(0, 10) : '' }); setShowAchModal(true); }}
                        onDelete={() => handleDeleteAch(ach.id)}
                      >
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-primary/8 text-primary px-2 py-0.5 rounded">{ach.category}</span>
                        <h4 className="text-sm font-bold text-text-main mt-1.5">{ach.title}</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">{ach.description}</p>
                      </ItemCard>
                    ))}
                  </motion.div>
                )}
              </SectionPanel>

              {/* Hackathons */}
              <SectionPanel
                icon={Zap} title="Hackathons & Competitions"
                count={hackathons.length}
                onAdd={() => { setHackForm({ name: '', projectName: '', description: '', achievementPosition: '', date: '' }); setShowHackModal(true); }}
                addLabel="Add Entry"
                iconColor="text-secondary" iconBg="bg-secondary/8"
                addColor="text-secondary" addBg="bg-secondary/10 hover:bg-secondary/20"
              >
                {hackathons.length === 0 ? (
                  <EmptyState
                    icon={Zap} title="No hackathons recorded"
                    description="Add SIH, Hackfest, or any competition you participated in."
                    onAdd={() => { setHackForm({ name: '', projectName: '', description: '', achievementPosition: '', date: '' }); setShowHackModal(true); }}
                    addLabel="Add First Hackathon"
                    color="text-secondary" bgColor="bg-secondary/8"
                  />
                ) : (
                  <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                    {hackathons.map(h => (
                      <ItemCard key={h.id} accentColor="from-secondary/80 to-secondary/20"
                        onEdit={() => { setHackForm({ ...h, date: h.date ? h.date.substring(0, 10) : '' }); setShowHackModal(true); }}
                        onDelete={() => handleDeleteHack(h.id)}
                      >
                        <h4 className="text-sm font-bold text-text-main">{h.name}</h4>
                        <p className="text-xs text-text-muted mt-1">Project: <span className="font-semibold text-text-main/80">{h.projectName}</span></p>
                        {h.achievementPosition && (
                          <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-full">
                            {h.achievementPosition}
                          </span>
                        )}
                      </ItemCard>
                    ))}
                  </motion.div>
                )}
              </SectionPanel>

              {/* Community Service */}
              <SectionPanel
                icon={Heart} title="Community Service (NGO / NSS)"
                count={communityServices.length}
                onAdd={() => { setServiceForm({ organizationName: '', activity: '', hoursServed: 0, description: '', date: '' }); setShowServiceModal(true); }}
                addLabel="Add Activity"
                iconColor="text-rose-500" iconBg="bg-rose-500/8"
                addColor="text-rose-600" addBg="bg-rose-500/10 hover:bg-rose-500/20"
              >
                {communityServices.length === 0 ? (
                  <EmptyState
                    icon={Heart} title="No service hours logged"
                    description="Log NGO activities, NSS camps, rural outreach, and volunteer service hours."
                    onAdd={() => { setServiceForm({ organizationName: '', activity: '', hoursServed: 0, description: '', date: '' }); setShowServiceModal(true); }}
                    addLabel="Add First Activity"
                    color="text-rose-500" bgColor="bg-rose-500/8"
                  />
                ) : (
                  <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                    {communityServices.map(svc => (
                      <ItemCard key={svc.id} accentColor="from-rose-500/60 to-rose-500/15"
                        onEdit={() => { setServiceForm({ ...svc, date: svc.date ? svc.date.substring(0, 10) : '' }); setShowServiceModal(true); }}
                        onDelete={() => handleDeleteService(svc.id)}
                      >
                        <h4 className="text-sm font-bold text-text-main">{svc.organizationName}</h4>
                        <p className="text-xs text-text-muted mt-1">
                          {svc.activity} · <span className="text-rose-500 font-bold">{svc.hoursServed}h</span>
                        </p>
                        {svc.description && <p className="text-xs text-text-muted/80 mt-1 line-clamp-2">{svc.description}</p>}
                      </ItemCard>
                    ))}
                  </motion.div>
                )}
              </SectionPanel>

              {/* Creative Works */}
              <SectionPanel
                icon={Star} title="Creative Exhibits & Artworks"
                count={creativeWorks.length}
                onAdd={() => { setCreativeForm({ title: '', description: '', mediaUrl: '', behanceUrl: '' }); setShowCreativeModal(true); }}
                addLabel="Add Exhibit"
                iconColor="text-amber-500" iconBg="bg-amber-500/8"
                addColor="text-amber-600" addBg="bg-amber-500/10 hover:bg-amber-500/20"
              >
                {creativeWorks.length === 0 ? (
                  <EmptyState
                    icon={Sparkles} title="No creative works listed"
                    description="Showcase your illustrations, photography, music compositions, or other creative projects."
                    onAdd={() => { setCreativeForm({ title: '', description: '', mediaUrl: '', behanceUrl: '' }); setShowCreativeModal(true); }}
                    addLabel="Add First Exhibit"
                    color="text-amber-500" bgColor="bg-amber-500/8"
                  />
                ) : (
                  <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                    {creativeWorks.map(c => (
                      <ItemCard key={c.id} accentColor="from-amber-500/60 to-amber-500/15"
                        onEdit={() => { setCreativeForm(c); setShowCreativeModal(true); }}
                        onDelete={() => handleDeleteCreative(c.id)}
                      >
                        <h4 className="text-sm font-bold text-text-main">{c.title}</h4>
                        {c.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{c.description}</p>}
                        {c.behanceUrl && (
                          <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary mt-2 hover:underline">
                            <ExternalLink className="w-3 h-3" /> View Exhibit
                          </a>
                        )}
                      </ItemCard>
                    ))}
                  </motion.div>
                )}
              </SectionPanel>
            </div>
          )}

          {/* ═══ TAB 4: RESUME & ACADEMICS ══════════════════════════════════════ */}
          {activeTab === 'resume' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-1 gap-6">

              {/* Resume Upload — Drag & Drop */}
              <div className="lg:col-span-1 xl:col-span-1">
                <div className="glass rounded-3xl overflow-hidden shadow-sm">
                  <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-card-border/60">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Resume PDF</h3>
                      <p className="text-[10px] text-text-muted">Max 10MB · PDF only</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">

                    {/* Current resume */}
                    {resumeUrl ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-3.5 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-text-main block">Resume PDF</span>
                            <span className="text-[10px] text-text-muted truncate block">Ready for review</span>
                          </div>
                        </div>

                        {/* Actions Stack */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5 pt-2 border-t border-emerald-500/15 w-full">
                          <button
                            type="button"
                            onClick={() => setShowResumePreviewModal(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span>Preview</span>
                          </button>

                          <a
                            href={resumeUrl.startsWith('http') ? resumeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129'}${resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all text-center cursor-pointer whitespace-nowrap"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span>Open PDF</span>
                          </a>

                          <button
                            type="button"
                            onClick={handleRemoveResume}
                            disabled={deletingResume}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            {deletingResume ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            )}
                            <span>Remove</span>
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-text-muted/5 border border-dashed border-card-border text-xs text-text-muted font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 opacity-50" />
                        <span>No resume linked yet.</span>
                      </div>
                    )}

                    {/* Drag & Drop Zone */}
                    {!resumeUrl && (
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                          dragOver
                            ? 'border-primary bg-primary/5 scale-[1.01]'
                            : 'border-card-border hover:border-primary/40 hover:bg-primary/3'
                        }`}
                      >
                        {uploadingResume ? (
                          <><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-xs text-text-muted font-semibold">Uploading…</p></>
                        ) : (
                          <>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-primary/15 text-primary' : 'bg-primary/8 text-primary/60'}`}>
                              <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-text-main">{dragOver ? 'Drop to upload' : 'Drag & drop or click to browse'}</p>
                              <p className="text-[10px] text-text-muted mt-1">PDF files only · Max 10MB</p>
                            </div>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          disabled={uploadingResume}
                          className="sr-only"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Records */}
              <div className="lg:col-span-2 xl:col-span-1 glass rounded-3xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-card-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 text-primary flex items-center justify-center">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-text-main">Academic History</h3>
                      <p className="text-[10px] text-text-muted">Add all qualifications in reverse chronological order</p>
                    </div>
                  </div>
                  <button type="button" onClick={addAcademicRecord}
                    className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Add Record
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <AnimatePresence>
                    {academicRecords.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative p-5 rounded-2xl border border-card-border/60 bg-page-bg/15 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/8 px-2.5 py-1 rounded-md">
                            Record #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAcademicRecord(idx)}
                            disabled={academicRecords.length <= 1}
                            className="p-1.5 rounded-xl hover:bg-red-500/8 text-text-muted hover:text-red-500 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <Field label="Degree / Qualification">
                            <input type="text" placeholder="B.Sc. Computer Science"
                              value={rec.degree} onChange={e => handleAcademicChange(idx, 'degree', e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Institution Name">
                            <input type="text" placeholder="Madras Christian College"
                              value={rec.institution} onChange={e => handleAcademicChange(idx, 'institution', e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="CGPA / Marks (%)">
                            <input type="text" placeholder="9.2 / 10.0"
                              value={rec.cgpa} onChange={e => handleAcademicChange(idx, 'cgpa', e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Year of Graduation">
                            <input type="text" placeholder="2026"
                              value={rec.year} onChange={e => handleAcademicChange(idx, 'year', e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Save Button Row */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-card-border/60">
                    <div className="text-xs text-text-muted font-sans flex items-center gap-1.5 select-none">
                      {autoSaveStatus === 'saving' && <><Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" /><span>Auto-saving...</span></>}
                      {(autoSaveStatus === 'saved' || autoSaveStatus === 'idle') && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>Auto-saved</span></>}
                      {autoSaveStatus === 'changed' && <><RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" /><span>Unsaved changes</span></>}
                      {autoSaveStatus === 'error' && <><AlertCircle className="w-3.5 h-3.5 text-red-500" /><span>Connection error</span></>}
                    </div>
                    <motion.button
                      type="button"
                      onClick={(e) => handleUpdateProfile(e)}
                      disabled={saving}
                      whileHover={{ scale: saving ? 1 : 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold hover:shadow-lg transition-all text-xs cursor-pointer"
                    >
                      {saving ? 'Saving...' : 'Save Academic History'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>

      {/* Right Column: Live Mockup View (col-span-5) */}
      <div className="hidden xl:block xl:col-span-5 sticky top-20 space-y-4">
        <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Live Device Preview</span>
          <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10">
            Style: {selectedPreset}
          </span>
        </div>

        <div className="w-full aspect-[9/16] max-h-[620px] border border-card-border/80 rounded-[44px] overflow-hidden shadow-2xl bg-page-bg relative flex flex-col p-3 ring-8 ring-neutral-900/5">
          {/* Phone Notch */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-black rounded-full z-30 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
          </div>

          <div className="w-full h-full bg-page-bg rounded-[34px] overflow-y-auto overflow-x-hidden p-4 pt-12 space-y-6 relative border border-card-border/60">
            <div className="text-center font-bold pb-2 border-b border-card-border/50 text-[8px] uppercase tracking-wider text-text-muted truncate">
              mccportfolio.edu/student/{user?.usernameSlug || 'username'}
            </div>
            
            {/* Dynamic miniature preset component */}
            {renderPreviewContent()}
            
            {/* Render mini stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-card-border/50">
              <div className="text-center bg-primary/5 p-2 rounded-xl border border-primary/5">
                <span className="text-xs font-black block text-primary">{projects.length}</span>
                <span className="text-[7px] text-text-muted font-bold uppercase tracking-wider">Projects</span>
              </div>
              <div className="text-center bg-primary/5 p-2 rounded-xl border border-primary/5">
                <span className="text-xs font-black block text-primary">{certifications.length}</span>
                <span className="text-[7px] text-text-muted font-bold uppercase tracking-wider">Certs</span>
              </div>
              <div className="text-center bg-primary/5 p-2 rounded-xl border border-primary/5">
                <span className="text-xs font-black block text-primary">{academicRecords.filter(r => r.degree).length}</span>
                <span className="text-[7px] text-text-muted font-bold uppercase tracking-wider">Degrees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

      {/* ═══ MODALS ═══════════════════════════════════════════════════════════════ */}

      {/* Project Modal */}
      <ModalWrapper open={showProjectModal} onClose={() => setShowProjectModal(false)} title={projectForm.id ? 'Edit Project' : 'Add Project'}>
        <Field label="Project Title">
          <input type="text" placeholder="MCC Student Attendance WebApp"
            value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
            className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea rows={3} placeholder="Describe the features, tech decisions, and impact…"
            value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
            className={textareaCls} />
        </Field>
        <Field label="Tech Stack (press Enter to add tags)">
          <SkillsTagInput
            value={projectForm.techStack}
            onChange={v => setProjectForm({ ...projectForm, techStack: v })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="GitHub Link">
            <input type="url" placeholder="https://github.com/…"
              value={projectForm.gitHubUrl} onChange={e => setProjectForm({ ...projectForm, gitHubUrl: e.target.value })}
              className={inputCls} />
          </Field>
          <Field label="Live Demo Link">
            <input type="url" placeholder="https://demo.xyz"
              value={projectForm.liveDemoUrl} onChange={e => setProjectForm({ ...projectForm, liveDemoUrl: e.target.value })}
              className={inputCls} />
          </Field>
        </div>
        <ModalActions onCancel={() => setShowProjectModal(false)} onSave={handleSaveProject} saveLabel="Save Project" loading={modalSaving} />
      </ModalWrapper>



      {/* Hackathon Modal */}
      <ModalWrapper open={showHackModal} onClose={() => setShowHackModal(false)} title={hackForm.id ? 'Edit Hackathon' : 'Add Hackathon'} accentColor="from-secondary">
        <Field label="Hackathon / Competition Name">
          <input type="text" placeholder="Smart India Hackathon 2024"
            value={hackForm.name} onChange={e => setHackForm({ ...hackForm, name: e.target.value })}
            className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Project Built">
            <input type="text" placeholder="AgriSense IoT App"
              value={hackForm.projectName} onChange={e => setHackForm({ ...hackForm, projectName: e.target.value })}
              className={inputCls} />
          </Field>
          <Field label="Position / Rank">
            <input type="text" placeholder="1st Place Winner"
              value={hackForm.achievementPosition} onChange={e => setHackForm({ ...hackForm, achievementPosition: e.target.value })}
              className={inputCls} />
          </Field>
        </div>
        <Field label="Brief Description">
          <textarea rows={3} placeholder="Your role, tech stack used, and what you built…"
            value={hackForm.description} onChange={e => setHackForm({ ...hackForm, description: e.target.value })}
            className={textareaCls} />
        </Field>
        <Field label="Date">
          <input type="date"
            value={hackForm.date} onChange={e => setHackForm({ ...hackForm, date: e.target.value })}
            className={inputCls} />
        </Field>
        <ModalActions onCancel={() => setShowHackModal(false)} onSave={handleSaveHack} saveLabel="Save Entry" loading={modalSaving} />
      </ModalWrapper>

      {/* Achievement Modal */}
      <ModalWrapper open={showAchModal} onClose={() => setShowAchModal(false)} title={achForm.id ? 'Edit Achievement' : 'Add Achievement'}>
        <Field label="Title">
          <input type="text" placeholder="President, Computer Science Association"
            value={achForm.title} onChange={e => setAchForm({ ...achForm, title: e.target.value })}
            className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={achForm.category} onChange={e => setAchForm({ ...achForm, category: e.target.value })}
            className={inputCls}>
            <option value="Academic" className="bg-page-bg text-text-main">Academic Honors</option>
            <option value="Olympiad" className="bg-page-bg text-text-main">Olympiad & Quiz</option>
            <option value="Sports" className="bg-page-bg text-text-main">Sports</option>
            <option value="Hackathon" className="bg-page-bg text-text-main">Hackathon</option>
            <option value="Startup" className="bg-page-bg text-text-main">Startup / Innovation</option>
            <option value="Leadership" className="bg-page-bg text-text-main">Leadership Activity</option>
            <option value="Extracurricular" className="bg-page-bg text-text-main">Extracurricular Achievement</option>
          </select>
        </Field>
        <Field label="Description">
          <textarea rows={3} placeholder="Details of the award, issuing organization, and criteria…"
            value={achForm.description} onChange={e => setAchForm({ ...achForm, description: e.target.value })}
            className={textareaCls} />
        </Field>
        <Field label="Date">
          <input type="date"
            value={achForm.date} onChange={e => setAchForm({ ...achForm, date: e.target.value })}
            className={inputCls} />
        </Field>
        <ModalActions onCancel={() => setShowAchModal(false)} onSave={handleSaveAch} saveLabel="Save Achievement" loading={modalSaving} />
      </ModalWrapper>

      {/* Community Service Modal */}
      <ModalWrapper open={showServiceModal} onClose={() => setShowServiceModal(false)} title={serviceForm.id ? 'Edit Activity' : 'Add Service Activity'} accentColor="from-rose-500">
        <Field label="Organization Name">
          <input type="text" placeholder="MCC NSS / Rural Development Unit"
            value={serviceForm.organizationName} onChange={e => setServiceForm({ ...serviceForm, organizationName: e.target.value })}
            className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Activity Conducted">
            <input type="text" placeholder="Rural Coding Seminars"
              value={serviceForm.activity} onChange={e => setServiceForm({ ...serviceForm, activity: e.target.value })}
              className={inputCls} />
          </Field>
          <Field label="Hours Served">
            <input type="number" placeholder="12"
              value={serviceForm.hoursServed} onChange={e => setServiceForm({ ...serviceForm, hoursServed: parseInt(e.target.value) || 0 })}
              className={inputCls} />
          </Field>
        </div>
        <Field label="Detailed Description">
          <textarea rows={3} placeholder="Explain the activities, community size served, and outcomes…"
            value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
            className={textareaCls} />
        </Field>
        <Field label="Date">
          <input type="date"
            value={serviceForm.date} onChange={e => setServiceForm({ ...serviceForm, date: e.target.value })}
            className={inputCls} />
        </Field>
        <ModalActions onCancel={() => setShowServiceModal(false)} onSave={handleSaveService} saveLabel="Save Activity" loading={modalSaving} />
      </ModalWrapper>

      {/* Creative Work Modal */}
      <ModalWrapper open={showCreativeModal} onClose={() => setShowCreativeModal(false)} title={creativeForm.id ? 'Edit Creative Exhibit' : 'Add Creative Exhibit'} accentColor="from-amber-500">
        <Field label="Exhibit Title">
          <input type="text" placeholder="MCC Campus Vector Art Collection"
            value={creativeForm.title} onChange={e => setCreativeForm({ ...creativeForm, title: e.target.value })}
            className={inputCls} />
        </Field>
        <Field label="Description">
          <textarea rows={3} placeholder="Describe the medium, inspiration, tools used, and significance…"
            value={creativeForm.description} onChange={e => setCreativeForm({ ...creativeForm, description: e.target.value })}
            className={textareaCls} />
        </Field>
        <Field label="Media Link (Google Drive, Imgur…)">
          <input type="url" placeholder="https://drive.google.com/…"
            value={creativeForm.mediaUrl} onChange={e => setCreativeForm({ ...creativeForm, mediaUrl: e.target.value })}
            className={inputCls} />
        </Field>
        <Field label="Portfolio Link (Behance, Dribbble…)">
          <input type="url" placeholder="https://behance.net/…"
            value={creativeForm.behanceUrl} onChange={e => setCreativeForm({ ...creativeForm, behanceUrl: e.target.value })}
            className={inputCls} />
        </Field>
        <ModalActions onCancel={() => setShowCreativeModal(false)} onSave={handleSaveCreative} saveLabel="Save Exhibit" loading={modalSaving} />
      </ModalWrapper>

      {/* Resume Preview Modal */}
      <ModalWrapper open={showResumePreviewModal} onClose={() => setShowResumePreviewModal(false)} title="Resume Preview">
        <div className="w-full rounded-2xl overflow-hidden border border-card-border/80 h-[70vh] bg-page-bg/40">
          <iframe
            src={resumeUrl ? (resumeUrl.startsWith('http') ? resumeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129'}${resumeUrl}`) : ''}
            className="w-full h-full border-0"
            title="Resume PDF Preview"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowResumePreviewModal(false)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md cursor-pointer transition-all"
          >
            Close Preview
          </button>
        </div>
      </ModalWrapper>

      {/* ═══ BOTTOM-RIGHT TOAST ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastVariants}
            initial="hidden" animate="visible" exit="exit"
            className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                : 'bg-red-950/90 border-red-500/30 text-red-200'
            } backdrop-blur-md`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            }
            <p className="text-xs font-semibold">{toast.text}</p>
            <button onClick={() => setToast(null)} className="ml-1 text-current/50 hover:text-current cursor-pointer shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
