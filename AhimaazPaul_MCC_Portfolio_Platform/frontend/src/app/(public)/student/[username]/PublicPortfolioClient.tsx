'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  GraduationCap, Globe, Mail, Award, BookOpen,
  Briefcase, Heart, Layers, Printer, Share2, CheckCircle2,
  MapPin, ExternalLink, Star, FileText, Check, Loader2, ArrowLeft, User,
  Trophy, Sparkles, Terminal, Cpu, Clock, Code, ShieldCheck, ChevronRight,
  Lightbulb, Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const pageSectionVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 16 }
  }
};

// Inline SVG social icons
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const THEMES: ThemeType[] = ['Academic', 'Corporate', 'Startup', 'Creative', 'AI-Futuristic', 'Apple-Minimal'];

export default function PublicPortfolioClient({ username }: { username: string }) {
  const { theme: currentTheme, setTheme, mode, setMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  
  // Corporate/Startup tab selection
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'projects' | 'extracurricular'>('overview');

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get(`/api/public/student/${username}`);
        setProfile(r.data);
        if (r.data.theme) setTheme(r.data.theme);
      } catch {
        // profile stays null
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [username]);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest animate-pulse">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-page-bg text-center">
        <div className="glass rounded-3xl p-10 max-w-md w-full flex flex-col items-center gap-4">
          <GraduationCap className="w-12 h-12 text-primary animate-bounce" />
          <h1 className="text-sm font-extrabold uppercase tracking-widest text-text-main">Portfolio Not Found</h1>
          <p className="text-xs text-text-muted">
            The profile <span className="font-bold text-primary">/student/{username}</span> is not registered or awaits approval.
          </p>
          <Link href="/" className="mt-2 text-xs font-bold py-2 px-4 rounded-xl bg-primary text-white hover:opacity-90 transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Parse Academic records
  let academicRecords: any[] = [];
  try { academicRecords = JSON.parse(profile.academicRecordsJson || '[]'); } catch { /* empty */ }

  const skillsList: string[] = profile.skills ? profile.skills.split(';').filter(Boolean) : [];
  const portfolioUrl = typeof window !== 'undefined' ? window.location.href : `https://mccportfolio.edu/student/${username}`;

  // ─── THEME 1: ACADEMIC LAYOUT ──────────────────────────────────────────────
  const renderAcademicLayout = () => {
    return (
      <div className="space-y-12 font-serif text-amber-950">
        {/* Header/Crest Hero */}
        <section className="text-center border-b-2 border-primary/20 pb-10 space-y-6">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full border-4 border-primary bg-primary text-white flex items-center justify-center font-serif text-3xl font-bold uppercase shadow-md relative overflow-hidden">
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.user?.name} className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="relative z-10">{profile.user?.name?.slice(0, 2) || '??'}</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 justify-center mt-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded border border-primary/20">
                {profile.department?.name || 'Academic Department'}
              </span>
              {profile.isApproved && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h1 className="text-3.5xl font-black text-primary tracking-tight">{profile.user?.name}</h1>
            <p className="text-sm font-semibold italic text-text-muted leading-relaxed max-w-xl mx-auto">
              "{profile.headline || 'Student Scholar at Madras Christian College'}"
            </p>
          </div>

          {/* Social connections */}
          <div className="flex justify-center gap-5 text-xs text-primary/80 font-bold no-print pt-2">
            {profile.user?.email && <a href={`mailto:${profile.user.email}`} className="hover:underline flex items-center gap-1"><Mail className="w-3.5 h-3.5" /><span>Email</span></a>}
            {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1"><GithubIcon className="w-3.5 h-3.5" /><span>GitHub</span></a>}
            {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1"><LinkedinIcon className="w-3.5 h-3.5" /><span>LinkedIn</span></a>}
          </div>
        </section>

        {/* Narrative & Scholarly Statement */}
        <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-black text-primary border-b border-primary/20 pb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <span>Scholarly Narrative &amp; Journey</span>
          </h2>
          <div className="text-sm text-text-main/90 leading-relaxed space-y-4">
            {profile.bio && <p className="font-sans">{profile.bio}</p>}
            {profile.personalStory && (
              <blockquote className="border-l-4 border-primary pl-4 italic text-text-muted my-4">
                "{profile.personalStory}"
              </blockquote>
            )}
            {profile.statementOfPurpose && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Statement of Intent</span>
                <p className="text-xs text-text-muted/95 whitespace-pre-wrap leading-relaxed bg-white/40 p-4 rounded-xl border border-primary/5 font-sans">
                  {profile.statementOfPurpose}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Education & Certifications */}
          <div className="space-y-8">
            {/* Education timeline */}
            <section className="space-y-5">
              <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-primary" />
                <span>Academic History</span>
              </h2>
              <div className="relative pl-5 border-l-2 border-primary/20 space-y-6">
                {academicRecords.map((rec, i) => (
                  <div key={i} className="relative">
                    <div className="absolute w-3.5 h-3.5 rounded-full bg-primary left-[-28px] top-1 border-2 border-white ring-4 ring-primary/15" />
                    <h4 className="text-sm font-bold text-primary">{rec.degree}</h4>
                    <p className="text-xs text-text-muted font-bold font-sans mt-0.5">{rec.institution}</p>
                    <div className="flex gap-2 text-[10px] font-bold text-primary mt-1.5 font-sans">
                      <span className="bg-primary/5 px-2 py-0.5 rounded">CGPA: {rec.cgpa}</span>
                      <span className="bg-primary/5 px-2 py-0.5 rounded">Class of {rec.year}</span>
                    </div>
                  </div>
                ))}
                {academicRecords.length === 0 && <p className="text-xs italic text-text-muted">No academic records loaded.</p>}
              </div>
            </section>

            {/* Certifications & Credentials */}
            <section className="space-y-5 pt-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-secondary" />
                <span>Academic Credentials &amp; Certifications</span>
              </h3>
              <div className="space-y-2">
                {profile.certifications?.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between text-xs p-3 rounded-lg border border-primary/10 bg-white/20">
                    <div>
                      <span className="font-bold text-primary">{c.name}</span>
                      <span className="text-text-muted ml-2">· {c.issuer}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-wider font-mono ml-2 px-1.5 py-0.25 rounded ${c.status === 'verified' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-600'}`}>{c.status}</span>
                    </div>
                    {c.credentialUrl && (
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-secondary hover:underline shrink-0">
                        <ExternalLink className="w-3 h-3" /> Verify
                      </a>
                    )}
                  </div>
                ))}
                {(!profile.certifications || profile.certifications.length === 0) && (
                  <p className="text-xs italic text-text-muted">No certifications recorded.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Research & Innovations */}
          <div className="space-y-8">
            {/* Research papers */}
            <section className="space-y-5">
              <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-primary" />
                <span>Research Publications</span>
              </h2>
              <div className="space-y-4">
                {profile.researchPapers?.filter((r: any) => !r.isInnovationProject).map((paper: any) => (
                  <div key={paper.id} className="p-4 rounded-xl border border-primary/15 bg-white/40 shadow-sm space-y-2">
                    <h4 className="text-xs font-bold text-primary leading-snug">{paper.title}</h4>
                    <p className="text-[10px] text-text-muted font-semibold">{paper.journalOrConference}</p>
                    {paper.abstract && <p className="text-[11px] text-text-muted/90 line-clamp-3 leading-relaxed font-sans">{paper.abstract}</p>}
                    {paper.paperUrl && (
                      <a href={paper.paperUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline font-sans">
                        <ExternalLink className="w-3.5 h-3.5" /><span>Read publication</span>
                      </a>
                    )}
                  </div>
                ))}
                {profile.researchPapers?.filter((r: any) => !r.isInnovationProject).length === 0 && (
                  <p className="text-xs italic text-text-muted">No academic publications listed.</p>
                )}
              </div>
            </section>

            {/* Innovations & Startups */}
            {profile.researchPapers?.some((r: any) => r.isInnovationProject) && (
              <section className="space-y-5">
                <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4.5 h-4.5 text-primary" />
                  <span>Innovation &amp; Startup Prototypes</span>
                </h2>
                <div className="space-y-3">
                  {profile.researchPapers?.filter((r: any) => r.isInnovationProject).map((paper: any) => (
                    <div key={paper.id} className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-primary leading-snug">{paper.title}</h4>
                        {paper.prototypeStatus && (
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-secondary/15 text-primary px-2 py-0.5 rounded border border-secondary/20 shrink-0">
                            {paper.prototypeStatus}
                          </span>
                        )}
                      </div>
                      {paper.abstract && <p className="text-[11px] text-text-muted/90 leading-relaxed font-sans">{paper.abstract}</p>}
                      {paper.startupIdeaPitch && (
                        <div className="bg-white/50 border border-secondary/10 p-3 rounded-lg text-[11px] italic text-text-muted font-sans">
                          <strong>Pitch:</strong> "{paper.startupIdeaPitch}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Honors, Recognitions & Leadership Achievements */}
        <section className="space-y-5 border-t border-primary/10 pt-6">
          <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-primary" />
            <span>Honors, Recognitions &amp; Leadership</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.achievements?.map((ach: any) => (
              <div key={ach.id} className="p-4 rounded-xl border border-primary/10 bg-white/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8.5px] font-extrabold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {ach.category}
                  </span>
                  {ach.date && (
                    <span className="text-[9px] text-text-muted font-bold font-sans">
                      {new Date(ach.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-primary leading-snug">{ach.title}</h4>
                {ach.description && <p className="text-xs text-text-muted leading-relaxed font-sans">{ach.description}</p>}
              </div>
            ))}
            {(!profile.achievements || profile.achievements.length === 0) && (
              <p className="text-xs italic text-text-muted col-span-2">No honors or achievements listed.</p>
            )}
          </div>
        </section>

        {/* Selected Projects */}
        <section className="space-y-5 border-t border-primary/10 pt-6">
          <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4.5 h-4.5 text-primary" />
            <span>Selected Projects Matrix</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.projects?.map((proj: any) => (
              <div key={proj.id} className="p-5 rounded-xl border border-primary/10 bg-white/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary">{proj.title}</h4>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed font-sans">{proj.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-primary/5">
                  {proj.techStack?.split(';').map((tech: string) => (
                    <span key={tech} className="text-[9px] font-semibold bg-primary/5 text-primary px-2 py-0.5 rounded font-sans">{tech.trim()}</span>
                  ))}
                </div>
              </div>
            ))}
            {profile.projects?.length === 0 && <p className="text-xs italic text-text-muted col-span-2">No projects listed.</p>}
          </div>
        </section>

        {/* Creative Works & Volunteer Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-primary/10 pt-6">
          {/* Creative Works */}
          <section className="space-y-5">
            <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-primary" />
              <span>Creative Exhibits &amp; Artworks</span>
            </h2>
            <div className="space-y-4">
              {profile.creativeWorks?.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl border border-primary/10 bg-white/30 space-y-2">
                  <h4 className="text-xs font-bold text-primary">{c.title}</h4>
                  {c.description && <p className="text-xs text-text-muted leading-relaxed font-sans">{c.description}</p>}
                  {c.behanceUrl && (
                    <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline font-sans">
                      <ExternalLink className="w-3.5 h-3.5" /><span>View Exhibit</span>
                    </a>
                  )}
                </div>
              ))}
              {(!profile.creativeWorks || profile.creativeWorks.length === 0) && (
                <p className="text-xs italic text-text-muted">No creative exhibits listed.</p>
              )}
            </div>
          </section>

          {/* Community Service */}
          <section className="space-y-5">
            <h2 className="text-base font-black text-primary border-b border-primary/20 pb-2.5 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4.5 h-4.5 text-primary" />
              <span>Community Service &amp; NSS</span>
            </h2>
            <div className="space-y-4">
              {profile.communityServices?.map((svc: any) => (
                <div key={svc.id} className="p-4 rounded-xl border border-primary/10 bg-white/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-primary">{svc.organizationName}</h4>
                    <span className="text-[9px] font-bold bg-rose-500/10 text-rose-700 px-2.5 py-0.5 rounded border border-rose-500/20">
                      {svc.hoursServed} Hours
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-bold font-sans mt-0.5">{svc.activity}</p>
                  {svc.description && <p className="text-xs text-text-muted/80 leading-relaxed font-sans">{svc.description}</p>}
                </div>
              ))}
              {(!profile.communityServices || profile.communityServices.length === 0) && (
                <p className="text-xs italic text-text-muted">No community service hours logged.</p>
              )}
            </div>
          </section>
        </div>

        {/* Skills pill list */}
        <section className="text-center max-w-xl mx-auto space-y-3 pt-6 border-t border-primary/10">
          <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Skill Competency Index</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {skillsList.map(s => (
              <span key={s} className="text-[10px] font-semibold border border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded">
                {s.trim()}
              </span>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // ─── THEME 2: AI-FUTURISTIC LAYOUT ─────────────────────────────────────────
  const renderAIFuturisticLayout = () => {
    return (
      <div className="space-y-8 font-mono text-emerald-400">
        
        {/* Dark HUD Terminal Header */}
        <section className="border border-emerald-500/30 bg-black/60 rounded-3xl p-5 md:p-8 space-y-6 relative overflow-hidden glowing-border-cyber shadow-lg">
          <div className="absolute top-2 right-4 flex items-center gap-1.5 text-[9px] text-emerald-500/60 uppercase">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>Core: Active</span>
          </div>
 
          {/* Console commands log */}
          <div className="text-[10px] text-emerald-500/50 border-b border-emerald-500/20 pb-4 space-y-1">
            <p>&gt; BOOTING MCC_PORTFOLIO_SYSTEM... SUCCESS.</p>
            <p>&gt; INTEGRITY CHECK: VERIFIED. DEPLOYED ON PUBLIC_REGISTRY.</p>
            <p>&gt; THEME SELECT: AI-FUTURISTIC_HUD. ENCRYPTED_CONNECTION: true</p>
          </div>
 
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {/* Monospace terminal avatar */}
              <div className="w-20 h-20 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-2xl uppercase shadow-glow shrink-0 overflow-hidden">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={profile.user?.name} className="w-full h-full object-cover" />
                ) : (
                  profile.user?.name?.slice(0, 2) || '??'
                )}
              </div>
              <div className="space-y-2">
                <span className="inline-block text-[9px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-0.5 rounded-md">
                  {profile.department?.name || 'Computer Science'}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-emerald-300 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  <span>{profile.user?.name}</span>
                  {profile.isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
                </h1>
                <p className="text-[10px] text-emerald-400/80 leading-relaxed uppercase tracking-wider">
                  [{profile.headline || 'System Engineer Node'}]
                </p>
              </div>
            </div>
 
            {/* Social channels */}
            <div className="flex md:flex-col gap-2.5 text-[10px] uppercase font-bold shrink-0 no-print">
              {profile.user?.email && <a href={`mailto:${profile.user.email}`} className="text-emerald-400 hover:text-white flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /><span>Email</span></a>}
              {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-white flex items-center gap-1.5"><GithubIcon className="w-3.5 h-3.5" /><span>Github</span></a>}
              {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-white flex items-center gap-1.5"><LinkedinIcon className="w-3.5 h-3.5" /><span>LinkedIn</span></a>}
            </div>
          </div>
        </section>
 
        {/* Diagnostics & Readiness Indicators */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="border border-emerald-500/20 bg-black/40 rounded-2xl p-4 flex flex-col justify-between gap-3 glowing-border-cyber">
            <span className="text-[9px] text-emerald-500/60 uppercase">SYSTEM_KPI // Projects &amp; Exhibits</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">{(profile.projects?.length || 0) + (profile.creativeWorks?.length || 0)}</span>
              <span className="text-[9px] text-emerald-500/60">nodes</span>
            </div>
            <div className="w-full bg-emerald-950/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(((profile.projects?.length || 0) + (profile.creativeWorks?.length || 0)) * 20, 100)}%` }} />
            </div>
          </div>
 
          <div className="border border-emerald-500/20 bg-black/40 rounded-2xl p-4 flex flex-col justify-between gap-3 glowing-border-cyber">
            <span className="text-[9px] text-emerald-500/60 uppercase">SYSTEM_KPI // Credentials &amp; Services</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">{(profile.certifications?.length || 0) + (profile.communityServices?.length || 0)}</span>
              <span className="text-[9px] text-emerald-500/60">records</span>
            </div>
            <div className="w-full bg-emerald-950/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(((profile.certifications?.length || 0) + (profile.communityServices?.length || 0)) * 25, 100)}%` }} />
            </div>
          </div>
 
          <div className="border border-emerald-500/20 bg-black/40 rounded-2xl p-4 flex flex-col justify-between gap-3 glowing-border-cyber">
            <span className="text-[9px] text-emerald-500/60 uppercase">SYSTEM_KPI // Publications &amp; Innovations</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300">{profile.researchPapers?.length || 0}</span>
              <span className="text-[9px] text-emerald-500/60">index</span>
            </div>
            <div className="w-full bg-emerald-950/80 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min((profile.researchPapers?.length || 0) * 50, 100)}%` }} />
            </div>
          </div>
        </section>
 
        {/* Narrative bio */}
        <section className="border border-emerald-500/20 bg-black/40 rounded-2xl p-5 md:p-6 space-y-4 glowing-border-cyber">
          <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2 border-b border-emerald-500/20 pb-2">
            <Terminal className="w-4.5 h-4.5 text-emerald-400" />
            <span>NARRATIVE_STREAM // BIO</span>
          </h3>
          <p className="text-xs leading-relaxed text-emerald-400/90 whitespace-pre-wrap">{profile.bio || 'No bio cataloged in dataset.'}</p>
          {profile.statementOfPurpose && (
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-950/10 mt-3 text-xs leading-relaxed">
              <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest block mb-2">// STATEMENT_OF_PURPOSE</span>
              "{profile.statementOfPurpose}"
            </div>
          )}
        </section>
 
        {/* Main code project grid */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2">
            <Code className="w-4.5 h-4.5 text-emerald-400" />
            <span>COMPILE_REPOSITORIES // PROJECTS</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.projects?.map((p: any) => (
              <div key={p.id} className="border border-emerald-500/25 bg-black/40 rounded-2xl p-5 space-y-3 relative overflow-hidden glowing-border-cyber flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 leading-snug flex items-center justify-between gap-2">
                    <span>{p.title}</span>
                    <Terminal className="w-3.5 h-3.5 text-emerald-500/60" />
                  </h4>
                  <p className="text-[11px] text-emerald-400/80 leading-relaxed">{p.description}</p>
                </div>
                <div className="flex flex-wrap gap-1 pt-2 border-t border-emerald-500/10">
                  {p.techStack?.split(';').map((t: string) => (
                    <span key={t} className="text-[9px] border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded text-emerald-400">{t.trim()}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verified Credentials */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-emerald-400" />
            <span>VERIFIED_LEDGER // SECURE_BADGES</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.certifications?.map((c: any) => (
              <div key={c.id} className="border border-emerald-500/25 bg-black/40 rounded-2xl p-4 glowing-border-cyber flex items-center justify-between text-xs gap-4">
                <div>
                  <span className="font-bold text-emerald-300 block">{c.name}</span>
                  <span className="text-emerald-500/60 text-[10px]">{c.issuer}</span>
                  <span className={`inline-block text-[8px] font-bold uppercase tracking-wider font-mono mt-1 px-1.5 py-0.25 rounded border ${c.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>{c.status}</span>
                </div>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-emerald-400 hover:text-white border border-emerald-500/20 bg-emerald-950/20 px-2 py-1 rounded hover:bg-emerald-500/10 shrink-0">
                    Verify
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Publications & Innovations */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
            <span>NEXUS_REPOSITORIES // RESEARCH_&amp;_INNOVATIONS</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.researchPapers?.map((p: any) => (
              <div key={p.id} className="border border-emerald-500/25 bg-black/40 rounded-2xl p-5 space-y-3 relative overflow-hidden glowing-border-cyber flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${p.isInnovationProject ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'}`}>
                      {p.isInnovationProject ? `Innovation [${p.prototypeStatus || 'Idea'}]` : 'Scholarly Publication'}
                    </span>
                    {p.publishDate && (
                      <span className="text-[9px] text-emerald-500/50">
                        {new Date(p.publishDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-emerald-300 leading-snug">{p.title}</h4>
                  <p className="text-[10px] text-emerald-400/60 leading-normal">{p.journalOrConference || 'Preprint Node'}</p>
                  {p.abstract && <p className="text-[11px] text-emerald-400/70 leading-relaxed line-clamp-3 font-sans">{p.abstract}</p>}
                  {p.startupIdeaPitch && (
                    <div className="border border-emerald-500/15 bg-emerald-950/10 p-3 rounded-lg text-[10px] italic text-emerald-400/80 leading-relaxed font-sans">
                      <strong>Startup Pitch:</strong> "{p.startupIdeaPitch}"
                    </div>
                  )}
                </div>
                {p.paperUrl && (
                  <a href={p.paperUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-emerald-400 hover:text-white hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Read publication node
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Achievements & Recognitions */}
        <section className="border border-emerald-500/20 bg-black/40 rounded-2xl p-5 glowing-border-cyber space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2 border-b border-emerald-500/20 pb-2">
            <Trophy className="w-4.5 h-4.5 text-emerald-400" />
            <span>CRITICAL_ACHIEVEMENTS // RECOGNITIONS</span>
          </h3>
          <div className="space-y-4">
            {profile.achievements?.map((ach: any) => (
              <div key={ach.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-950/5 hover:bg-emerald-950/15 transition-all text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded-md text-emerald-400">
                      {ach.category}
                    </span>
                    {ach.date && (
                      <span className="text-[9px] text-emerald-500/40">
                        {new Date(ach.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-300 font-bold block">{ach.title}</span>
                  {ach.description && <p className="text-[11px] text-emerald-400/70 leading-relaxed font-sans">{ach.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Extracurricular logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creative Works */}
          <section className="border border-emerald-500/20 bg-black/40 rounded-2xl p-5 glowing-border-cyber space-y-4">
            <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2 border-b border-emerald-500/20 pb-2">
              <Star className="w-4.5 h-4.5 text-emerald-400" />
              <span>CREATIVE_EXHIBITS // ARTWORKS</span>
            </h3>
            <div className="space-y-3.5">
              {profile.creativeWorks?.map((c: any) => (
                <div key={c.id} className="space-y-1 text-xs">
                  <span className="text-emerald-300 font-bold block">{c.title}</span>
                  {c.description && <p className="text-[11px] text-emerald-400/70 font-sans">{c.description}</p>}
                  {c.behanceUrl && (
                    <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-emerald-400 hover:text-white hover:underline flex items-center gap-1 pt-1">
                      <ExternalLink className="w-3 h-3" /> View exhibit link
                    </a>
                  )}
                </div>
              ))}
              {(!profile.creativeWorks || profile.creativeWorks.length === 0) && (
                <p className="text-xs italic text-emerald-500/50">No creative exhibits listed.</p>
              )}
            </div>
          </section>

          {/* Volunteer Logs */}
          <section className="border border-emerald-500/20 bg-black/40 rounded-2xl p-5 glowing-border-cyber space-y-4">
            <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2 border-b border-emerald-500/20 pb-2">
              <Heart className="w-4.5 h-4.5 text-emerald-400" />
              <span>VOLUNTEER_WORK // NSS_NGO_LOGS</span>
            </h3>
            <div className="space-y-3.5">
              {profile.communityServices?.map((svc: any) => (
                <div key={svc.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-emerald-300 font-bold block">{svc.organizationName}</span>
                    <span className="text-[9px] font-bold border border-rose-500/30 bg-rose-500/5 text-rose-400 px-2.5 py-0.5 rounded-full">
                      {svc.hoursServed}h logged
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-500/60 font-semibold">{svc.activity}</p>
                  {svc.description && <p className="text-[11px] text-emerald-400/70 font-sans">{svc.description}</p>}
                </div>
              ))}
              {(!profile.communityServices || profile.communityServices.length === 0) && (
                <p className="text-xs italic text-emerald-500/50">No volunteer hours logged.</p>
              )}
            </div>
          </section>
        </div>
 
        {/* Academic index */}
        <section className="border border-emerald-500/20 bg-black/40 rounded-2xl p-5 glowing-border-cyber space-y-4">
          <h3 className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-2 border-b border-emerald-500/20 pb-2">
            <GraduationCap className="w-4.5 h-4.5 text-emerald-400" />
            <span>ACADEMIC_LOGS // DATASHEET</span>
          </h3>
          <div className="space-y-4">
            {academicRecords.map((r, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-950/5 hover:bg-emerald-950/15 transition-all text-xs">
                <div>
                  <span className="text-emerald-300 font-bold block">{r.degree}</span>
                  <span className="text-[10px] text-emerald-500/60">{r.institution}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] uppercase font-bold shrink-0">
                  <span>Class: {r.year}</span>
                  <span className="text-emerald-500">|</span>
                  <span className="text-emerald-300">CGPA: {r.cgpa}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
 
        {/* Skill array JSON */}
        <section className="border border-emerald-500/20 bg-black/40 rounded-2xl p-5 glowing-border-cyber font-mono text-[10px]">
          <span className="text-[9px] text-emerald-500/60 uppercase block mb-2.5">// SKILL_ARRAY_JSON</span>
          <pre className="text-emerald-300 whitespace-pre-wrap leading-tight bg-black/70 p-3.5 rounded-xl border border-emerald-500/10 shadow-inner">
            {`{\n  "competencies": [\n    ${skillsList.map(s => `"${s.trim()}"`).join(',\n    ')}\n  ]\n}`}
          </pre>
        </section>
      </div>
    );
  };

  // ─── THEME 3: CREATIVE LAYOUT ──────────────────────────────────────────────
  const renderCreativeLayout = () => {
    return (
      <div className="space-y-12 font-sans text-neutral-900 pb-12">
        {/* Bold Asymmetrical Hero */}
        <section className="relative p-6 sm:p-10 rounded-[32px] bg-indigo-500 text-white overflow-hidden neo-brutalism-shadow">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-pink-500/30 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Tilted colorful avatar */}
              <div className="w-24 h-24 rounded-[32px] bg-pink-500 text-white flex items-center justify-center font-black text-3xl uppercase rotate-3 shadow-xl shrink-0 border-4 border-black select-none overflow-hidden">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={profile.user?.name} className="w-full h-full object-cover" />
                ) : (
                  profile.user?.name?.slice(0, 2) || '??'
                )}
              </div>
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest bg-yellow-400 px-3 py-1 rounded-full border-2 border-black">
                    {profile.department?.name || 'Creative Department'}
                  </span>
                  {profile.isApproved && (
                    <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest bg-emerald-400 px-3 py-1 rounded-full border-2 border-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight drop-shadow">
                  {profile.user?.name}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-yellow-300 uppercase tracking-widest leading-relaxed">
                  // {profile.headline || 'Creative Thinker & Maker'}
                </p>
              </div>
            </div>

            {/* Social channels */}
            <div className="flex gap-2.5 shrink-0 no-print flex-wrap justify-center">
              {profile.user?.email && <a href={`mailto:${profile.user.email}`} className="px-3.5 py-2 rounded-xl bg-white text-neutral-900 hover:bg-yellow-400 font-bold border-2 border-neutral-900 text-xs transition-colors shadow-[3px_3px_0px_0px_#000]">Email</a>}
              {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-white text-neutral-900 hover:bg-yellow-400 font-bold border-2 border-neutral-900 text-xs transition-colors shadow-[3px_3px_0px_0px_#000]">GitHub</a>}
              {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-white text-neutral-900 hover:bg-yellow-400 font-bold border-2 border-neutral-900 text-xs transition-colors shadow-[3px_3px_0px_0px_#000]">LinkedIn</a>}
            </div>
          </div>
        </section>

        {/* Narrative journey */}
        <section className="p-6 sm:p-8 rounded-[28px] bg-yellow-100 border-2 border-black text-neutral-950 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2.5 flex items-center gap-2 mb-4">
            <User className="w-5 h-5" />
            <span>Creative Path &amp; SOP</span>
          </h3>
          <div className="space-y-4 text-xs font-semibold leading-relaxed">
            {profile.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}
            {profile.personalStory && (
              <div className="bg-white p-4 rounded-2xl border-2 border-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                "{profile.personalStory}"
              </div>
            )}
            {profile.statementOfPurpose && (
              <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-black mt-3">
                <span className="text-[9px] font-black uppercase block mb-1.5">Creative Mission Statement</span>
                <p className="font-normal text-neutral-800 whitespace-pre-wrap">{profile.statementOfPurpose}</p>
              </div>
            )}
          </div>
        </section>

        {/* Asymmetrical project grid */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="w-4.5 h-4.5 text-indigo-600" />
            <span>Portfolio Artifacts &amp; Projects</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.projects?.map((proj: any, idx: number) => {
              const rotateClass = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
              return (
                <div key={proj.id} className={`p-6 rounded-[24px] bg-white border-2 border-black text-neutral-900 ${rotateClass} transition-transform hover:rotate-0 flex flex-col justify-between gap-5 shadow-[5px_5px_0px_0px_#000] hover:shadow-[7px_7px_0px_0px_#000]`}>
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black uppercase tracking-tight">{proj.title}</h4>
                    <p className="text-xs text-neutral-700 leading-relaxed">{proj.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-black/10">
                    {proj.techStack?.split(';').map((t: string) => (
                      <span key={t} className="text-[9px] font-black bg-indigo-500/10 text-indigo-800 px-2 py-0.5 rounded border border-indigo-900/10">{t.trim()}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Creative Exhibits (Brutalist Style) */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Star className="w-4.5 h-4.5 text-pink-500" />
            <span>Creative Gallery &amp; Exhibits</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.creativeWorks?.map((c: any, idx: number) => {
              const rotateClass = idx % 2 === 0 ? 'rotate-1' : '-rotate-1';
              return (
                <div key={c.id} className={`p-6 rounded-[24px] bg-pink-100 border-2 border-black text-neutral-900 ${rotateClass} transition-transform hover:rotate-0 flex flex-col justify-between gap-4 shadow-[5px_5px_0px_0px_#000]`}>
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-tight">{c.title}</h4>
                    {c.description && <p className="text-xs text-neutral-700 leading-relaxed font-sans">{c.description}</p>}
                  </div>
                  {c.behanceUrl && (
                    <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-white text-neutral-900 font-bold border-2 border-black text-[10px] w-fit shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-400 transition-colors">
                      View Exhibit ↗
                    </a>
                  )}
                </div>
              );
            })}
            {(!profile.creativeWorks || profile.creativeWorks.length === 0) && (
              <p className="text-xs italic text-neutral-500 col-span-2">No creative exhibits loaded.</p>
            )}
          </div>
        </section>

        {/* Achievements & Honors */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-4.5 h-4.5 text-yellow-500" />
            <span>Honors &amp; Recognitions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.achievements?.map((ach: any, idx: number) => {
              const rotateClass = idx % 2 === 0 ? '-rotate-0.5' : 'rotate-0.5';
              return (
                <div key={ach.id} className={`p-6 rounded-[24px] bg-yellow-50 border-2 border-black text-neutral-900 ${rotateClass} flex flex-col gap-3 shadow-[5px_5px_0px_0px_#000]`}>
                  <div className="flex items-center justify-between gap-2 border-b-2 border-black/15 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-400 px-2 py-0.5 rounded border border-black">
                      {ach.category}
                    </span>
                    {ach.date && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500">
                        {new Date(ach.date).getFullYear()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black uppercase leading-snug">{ach.title}</h4>
                  {ach.description && <p className="text-xs text-neutral-700 leading-relaxed font-sans">{ach.description}</p>}
                </div>
              );
            })}
            {(!profile.achievements || profile.achievements.length === 0) && (
              <p className="text-xs italic text-neutral-500 col-span-2">No honors logged.</p>
            )}
          </div>
        </section>

        {/* Certifications (Brutalist Badges) */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-indigo-600" />
            <span>Verified Credentials &amp; Certs</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {profile.certifications?.map((c: any) => (
              <div key={c.id} className="p-4 rounded-2xl bg-indigo-50 border-2 border-black text-neutral-955 flex items-center justify-between gap-4 shadow-[4px_4px_0px_0px_#000]">
                <div>
                  <span className="text-xs font-black uppercase block leading-tight">{c.name}</span>
                  <span className="text-[10px] text-neutral-600 font-semibold">{c.issuer}</span>
                  <span className={`inline-block text-[8px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.25 rounded border-2 border-black ${c.status === 'verified' ? 'bg-emerald-300 text-neutral-950' : 'bg-amber-300 text-neutral-950'}`}>{c.status}</span>
                </div>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1.5 rounded-lg bg-white border-2 border-black hover:bg-yellow-400 font-black text-[9px] shrink-0 shadow-[2px_2px_0px_0px_#000] transition-colors">
                    Verify
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Community Service NSS/NGO */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-rose-500" />
            <span>NSS &amp; Community Service</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.communityServices?.map((svc: any, idx: number) => {
              const rotateClass = idx % 2 === 0 ? 'rotate-0.5' : '-rotate-0.5';
              return (
                <div key={svc.id} className={`p-6 rounded-[24px] bg-rose-50 border-2 border-black text-neutral-900 ${rotateClass} flex flex-col justify-between gap-4 shadow-[5px_5px_0px_0px_#000]`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b-2 border-black/15 pb-2">
                      <span className="text-xs font-black uppercase tracking-tight">{svc.organizationName}</span>
                      <span className="text-[9px] font-black bg-rose-300 px-2 py-0.5 rounded border-2 border-black">
                        {svc.hoursServed}h
                      </span>
                    </div>
                    <p className="text-xs text-neutral-800 font-black">{svc.activity}</p>
                    {svc.description && <p className="text-xs text-neutral-700 leading-relaxed font-sans">{svc.description}</p>}
                  </div>
                </div>
              );
            })}
            {(!profile.communityServices || profile.communityServices.length === 0) && (
              <p className="text-xs italic text-neutral-500 col-span-2">No volunteer logs.</p>
            )}
          </div>
        </section>

        {/* Research & Innovation Pitches */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-cyan-600" />
            <span>Research &amp; Innovation Nodes</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.researchPapers?.map((p: any, idx: number) => {
              const rotateClass = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
              return (
                <div key={p.id} className={`p-6 rounded-[24px] bg-cyan-50 border-2 border-black text-neutral-900 ${rotateClass} flex flex-col justify-between gap-4 shadow-[5px_5px_0px_0px_#000]`}>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b-2 border-black/15 pb-2">
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border-2 border-black ${p.isInnovationProject ? 'bg-amber-300' : 'bg-cyan-300'}`}>
                        {p.isInnovationProject ? `Innovation [${p.prototypeStatus || 'Idea'}]` : 'Academic Paper'}
                      </span>
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-tight leading-snug">{p.title}</h4>
                    {p.journalOrConference && <p className="text-[10px] text-neutral-600 font-bold">{p.journalOrConference}</p>}
                    {p.abstract && <p className="text-xs text-neutral-700 leading-relaxed font-sans">{p.abstract}</p>}
                    {p.startupIdeaPitch && (
                      <div className="bg-white p-3 rounded-lg border-2 border-black text-[11px] italic font-sans text-neutral-700">
                        <strong>Pitch:</strong> "{p.startupIdeaPitch}"
                      </div>
                    )}
                  </div>
                  {p.paperUrl && (
                    <a href={p.paperUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-bold w-fit shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-400 transition-colors">
                      Read Paper
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Academic Matrix / Creative display */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-[24px] bg-white border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 flex items-center gap-2">
              <GraduationCap className="w-4.5 h-4.5" />
              <span>Academics</span>
            </h4>
            <div className="space-y-4">
              {academicRecords.map((r, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-xs font-black block">{r.degree}</span>
                  <span className="text-[10px] text-neutral-600 block">{r.institution}</span>
                  <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider text-indigo-600 mt-1">
                    <span>CGPA: {r.cgpa}</span>
                    <span>·</span>
                    <span>Class of {r.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 flex items-center gap-2">
                <Layers className="w-4.5 h-4.5" />
                <span>Skills Matrix</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {skillsList.map(s => (
                  <span key={s} className="text-[9px] font-black bg-pink-500/10 text-pink-700 px-2.5 py-1 rounded border border-pink-900/10 hover:bg-yellow-400 hover:text-neutral-900 transition-colors">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  // ─── THEME 4: APPLE-MINIMAL LAYOUT ─────────────────────────────────────────
  const renderAppleMinimalLayout = () => {
    return (
      <div className="space-y-16 font-sans text-neutral-900 pb-20">
        
        {/* Large Typography Apple Banner */}
        <section className="text-left space-y-5 py-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-[9px] font-black uppercase tracking-widest text-neutral-500">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>MCC Student Showcase</span>
          </div>

          <div className="flex items-start gap-6">
            {profile.profilePictureUrl && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border border-neutral-200 shadow-sm shrink-0 mt-1">
                <img src={profile.profilePictureUrl} alt={profile.user?.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black leading-[1.05]">
                Designed for impact. <br />
                <span className="text-primary">{profile.user?.name}</span>.
              </h1>
              <p className="text-base text-neutral-500 max-w-xl leading-relaxed font-semibold">
                {profile.headline || 'Student Researcher and Web Developer at Madras Christian College.'}
              </p>
            </div>
          </div>

          {/* Minimal info details */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-neutral-100 mt-6 text-xs text-neutral-400 font-bold uppercase tracking-wider">
            {profile.department?.name && <span className="text-neutral-800 font-extrabold">{profile.department.name}</span>}
            {profile.isApproved && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Verified</span>}
            {profile.user?.email && <a href={`mailto:${profile.user.email}`} className="hover:text-primary transition-colors">Email</a>}
            {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>}
            {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>}
          </div>
        </section>

        {/* Narrative segment */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-t border-neutral-100">
          <div className="md:col-span-1">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">Biography</span>
            <h3 className="text-lg font-black text-black tracking-tight leading-tight">The journey and core mission.</h3>
          </div>
          <div className="md:col-span-2 space-y-4 text-xs font-semibold text-neutral-500 leading-relaxed font-sans">
            {profile.bio && <p className="text-sm text-neutral-800 leading-relaxed font-normal">{profile.bio}</p>}
            {profile.personalStory && <p className="italic">"{profile.personalStory}"</p>}
            {profile.statementOfPurpose && (
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 text-neutral-700 leading-relaxed mt-2 font-normal">
                <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-wider block mb-1.5">Statement of Purpose</span>
                {profile.statementOfPurpose}
              </div>
            )}
          </div>
        </section>

        {/* Horizontal Slider for Projects */}
        <section className="space-y-4 border-t border-neutral-100 pt-10">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Works</span>
              <h3 className="text-lg font-black text-black tracking-tight">Featured Projects</h3>
            </div>
            <span className="text-[10px] font-bold text-neutral-400">Scroll to view &rarr;</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {profile.projects?.map((p: any) => (
              <div key={p.id} className="min-w-[280px] sm:min-w-[340px] max-w-[340px] flex-shrink-0 p-6 rounded-3xl bg-neutral-50 border border-neutral-200/60 hover:border-neutral-300 transition-all flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-black tracking-tight">{p.title}</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-semibold">{p.description}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {p.techStack?.split(';').map((t: string) => (
                      <span key={t} className="text-[9px] font-semibold bg-neutral-200/50 text-neutral-700 px-2 py-0.5 rounded-md">{t.trim()}</span>
                    ))}
                  </div>
                  {(p.gitHubUrl || p.liveDemoUrl) && (
                    <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400 border-t border-neutral-200/40 pt-3">
                      {p.gitHubUrl && <a href={p.gitHubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Code</a>}
                      {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Demo</a>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {profile.projects?.length === 0 && <p className="text-xs italic text-neutral-400">No project nodes compiled.</p>}
          </div>
        </section>

        {/* Publications & Innovations */}
        <section className="space-y-6 border-t border-neutral-100 pt-10">
          <div>
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Scholarship</span>
            <h3 className="text-lg font-black text-black tracking-tight">Research &amp; Innovations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profile.researchPapers?.map((p: any) => (
              <div key={p.id} className="p-6 rounded-3xl bg-neutral-50 border border-neutral-200/60 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.isInnovationProject ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-primary/5 text-primary border-primary/10'}`}>
                      {p.isInnovationProject ? `Innovation • ${p.prototypeStatus || 'Idea'}` : 'Research Paper'}
                    </span>
                    {p.publishDate && (
                      <span className="text-[9px] text-neutral-400 font-bold">
                        {new Date(p.publishDate).getFullYear()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-black leading-snug">{p.title}</h4>
                  {p.journalOrConference && <p className="text-[10px] text-neutral-400 font-semibold">{p.journalOrConference}</p>}
                  {p.abstract && <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{p.abstract}</p>}
                  {p.startupIdeaPitch && (
                    <p className="text-[11px] text-neutral-600 font-sans italic border-l border-neutral-200 pl-3">
                      <strong>Pitch:</strong> "{p.startupIdeaPitch}"
                    </p>
                  )}
                </div>
                {p.paperUrl && (
                  <a href={p.paperUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                    Read Paper &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Certifications Vault */}
        <section className="space-y-6 border-t border-neutral-100 pt-10">
          <div>
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Credentials</span>
            <h3 className="text-lg font-black text-black tracking-tight">Verified Certifications</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile.certifications?.map((c: any) => (
              <div key={c.id} className="p-4 rounded-3xl bg-neutral-50 border border-neutral-200/60 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-black leading-tight">{c.name}</h4>
                  <p className="text-[10px] text-neutral-500 font-semibold mt-1">{c.issuer}</p>
                  <span className={`inline-block text-[8px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full ${c.status === 'verified' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-600'}`}>{c.status}</span>
                </div>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:underline">
                    Verify Credential &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Honors, Awards & Leadership */}
        <section className="space-y-6 border-t border-neutral-100 pt-10">
          <div>
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Honors</span>
            <h3 className="text-lg font-black text-black tracking-tight">Achievements &amp; Leadership Roles</h3>
          </div>
          <div className="space-y-4">
            {profile.achievements?.map((ach: any) => (
              <div key={ach.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {ach.category}
                    </span>
                    {ach.date && (
                      <span className="text-[9px] text-neutral-400 font-semibold">
                        {new Date(ach.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-black text-black">{ach.title}</h4>
                  {ach.description && <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{ach.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Creative Works & Community Service */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-neutral-100 pt-10">
          {/* Creative Works */}
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Creativity</span>
              <h3 className="text-lg font-black text-black tracking-tight">Creative Works</h3>
            </div>
            <div className="space-y-4">
              {profile.creativeWorks?.map((c: any) => (
                <div key={c.id} className="p-4 rounded-3xl bg-neutral-50 border border-neutral-200/60 space-y-3">
                  <h4 className="text-xs font-black text-black leading-snug">{c.title}</h4>
                  {c.description && <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">{c.description}</p>}
                  {c.behanceUrl && (
                    <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                      View Exhibit &rarr;
                    </a>
                  )}
                </div>
              ))}
              {(!profile.creativeWorks || profile.creativeWorks.length === 0) && (
                <p className="text-xs italic text-neutral-400">No creative works listed.</p>
              )}
            </div>
          </div>

          {/* Community Service */}
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Outreach</span>
              <h3 className="text-lg font-black text-black tracking-tight">Community Service</h3>
            </div>
            <div className="space-y-4">
              {profile.communityServices?.map((svc: any) => (
                <div key={svc.id} className="p-4 rounded-3xl bg-neutral-50 border border-neutral-200/60 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-neutral-200/25 pb-2">
                    <h4 className="text-xs font-black text-black leading-snug">{svc.organizationName}</h4>
                    <span className="text-[9px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                      {svc.hoursServed}h Vol
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-neutral-700">{svc.activity}</p>
                  {svc.description && <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">{svc.description}</p>}
                </div>
              ))}
              {(!profile.communityServices || profile.communityServices.length === 0) && (
                <p className="text-xs italic text-neutral-400">No volunteer hours logged.</p>
              )}
            </div>
          </div>
        </section>

        {/* Academic History & Credentials */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-neutral-100 pt-10">
          <div className="space-y-5">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Education</span>
            <div className="space-y-4">
              {academicRecords.map((r, i) => (
                <div key={i} className="border-b border-neutral-100 pb-3 last:border-0">
                  <h4 className="text-xs font-black text-black">{r.degree}</h4>
                  <p className="text-[10px] text-neutral-500 font-semibold">{r.institution} · Class of {r.year}</p>
                  <span className="inline-block mt-1.5 text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">CGPA: {r.cgpa}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Core Competencies</span>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map(s => (
                <span key={s} className="text-[10px] font-semibold border border-neutral-200 px-3 py-1 rounded-full text-neutral-800 hover:border-primary transition-colors">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  };

  // ─── THEME 5: CORPORATE — Professional two-column sidebar layout ─────────────
  const renderCorporateLayout = () => {
    return (
      <div className="font-sans pb-16" style={{ background: 'var(--color-page-bg)' }}>
        {/* Full-width top bar */}
        <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            {profile.department?.name || 'Department'}
          </span>
          <span className="text-slate-400">Professional Portfolio · Madras Christian College</span>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-0 shadow-2xl">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="md:w-72 shrink-0 bg-[#0f172a] text-white px-7 py-10 space-y-9 flex flex-col">
            {/* Avatar + name */}
            <div className="text-center space-y-3">
              <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-4 border-blue-500/40 shadow-lg bg-blue-900 flex items-center justify-center text-3xl font-black text-blue-300 uppercase">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt={profile.user?.name} className="w-full h-full object-cover" />
                ) : (
                  profile.user?.name?.slice(0, 2) || '??'
                )}
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight leading-tight">{profile.user?.name}</h1>
                <p className="text-xs text-blue-300 font-semibold mt-1 leading-snug">{profile.headline || 'Systems Engineer Candidate'}</p>
                {profile.isApproved && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[9px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest block border-b border-white/10 pb-1.5">Contact</span>
              {profile.user?.email && (
                <a href={`mailto:${profile.user.email}`} className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{profile.user.email}</span>
                </a>
              )}
              {profile.gitHubUrl && (
                <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-white transition-colors">
                  <GithubIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">GitHub</span>
                </a>
              )}
              {profile.linkedInUrl && (
                <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-white transition-colors">
                  <LinkedinIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">LinkedIn</span>
                </a>
              )}
            </div>

            {/* Education */}
            {academicRecords.length > 0 && (
              <div className="space-y-3">
                <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest block border-b border-white/10 pb-1.5">Education</span>
                {academicRecords.map((r, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-white leading-tight">{r.degree}</p>
                    <p className="text-[9px] text-slate-400">{r.institution}</p>
                    <div className="flex gap-2 text-[9px] text-blue-300 font-bold mt-1">
                      <span>CGPA {r.cgpa}</span>
                      <span className="text-slate-600">·</span>
                      <span>{r.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skillsList.length > 0 && (
              <div className="space-y-3">
                <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest block border-b border-white/10 pb-1.5">Core Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map(s => (
                    <span key={s} className="text-[9px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── RIGHT CONTENT ── */}
          <main className="flex-1 bg-white dark:bg-slate-900 px-8 py-10 space-y-10">
            {/* Summary */}
            {profile.bio && (
              <section className="space-y-2">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Professional Summary</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
                {profile.statementOfPurpose && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-2 border-blue-200 pl-3 mt-2">{profile.statementOfPurpose}</p>
                )}
              </section>
            )}

            {/* Projects */}
            {profile.projects && profile.projects.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Key Projects</h2>
                <div className="space-y-5">
                  {profile.projects.map((p: any) => (
                    <div key={p.id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xs font-extrabold text-slate-800 dark:text-white">{p.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          {p.gitHubUrl && <a href={p.gitHubUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-600 hover:underline">Code</a>}
                          {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-600 hover:underline">Demo</a>}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.techStack?.split(';').map((t: string) => (
                          <span key={t} className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-semibold">{t.trim()}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Research & Innovations */}
            {profile.researchPapers && profile.researchPapers.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Research &amp; Innovations</h2>
                <div className="space-y-4">
                  {profile.researchPapers.map((p: any) => (
                    <div key={p.id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{p.title}</p>
                        <span className={`text-[8.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${p.isInnovationProject ? 'bg-amber-500/10 border-amber-500/15 text-amber-600' : 'bg-blue-500/10 border-blue-500/15 text-blue-600'}`}>
                          {p.isInnovationProject ? `Innovation [${p.prototypeStatus || 'Idea'}]` : 'Publication'}
                        </span>
                      </div>
                      <p className="text-[10px] text-blue-600 font-semibold">{p.journalOrConference || 'Preprint Node'}</p>
                      {p.abstract && <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{p.abstract}</p>}
                      {p.startupIdeaPitch && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-lg text-[10px] italic text-slate-600 dark:text-slate-400 font-sans">
                          <strong>Startup Pitch:</strong> "{p.startupIdeaPitch}"
                        </div>
                      )}
                      {p.paperUrl && <a href={p.paperUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 hover:underline inline-flex items-center gap-1 font-sans">View paper node <ExternalLink className="w-3 h-3" /></a>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Certifications</h2>
                <div className="space-y-2">
                  {profile.certifications.map((c: any) => (
                    <div key={c.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white">{c.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2">· {c.issuer}</span>
                      </div>
                      {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 hover:underline shrink-0">Verify</a>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Hackathons */}
            {profile.hackathons && profile.hackathons.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Hackathons &amp; Competitions</h2>
                <div className="space-y-3">
                  {profile.hackathons.map((h: any) => (
                    <div key={h.id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xs font-bold text-slate-800 dark:text-white">{h.name}</h3>
                        {h.achievementPosition && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full">{h.achievementPosition}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Project: <span className="font-semibold">{h.projectName}</span></p>
                      {h.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{h.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Creative Exhibits */}
            {profile.creativeWorks && profile.creativeWorks.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Creative Exhibits &amp; Portfolios</h2>
                <div className="space-y-3">
                  {profile.creativeWorks.map((c: any) => (
                    <div key={c.id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{c.title}</span>
                        {c.behanceUrl && (
                          <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-blue-600 hover:underline shrink-0">View Exhibit</a>
                        )}
                      </div>
                      {c.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{c.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Community Service NSS/NGO */}
            {profile.communityServices && profile.communityServices.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Community Service &amp; NSS</h2>
                <div className="space-y-3">
                  {profile.communityServices.map((svc: any) => (
                    <div key={svc.id} className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{svc.organizationName}</span>
                        <span className="text-[9px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/15 px-2 py-0.5 rounded-full">{svc.hoursServed} Hours</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">{svc.activity}</p>
                      {svc.description && <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{svc.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1 inline-block">Achievements</h2>
                <div className="space-y-2">
                  {profile.achievements.map((a: any) => (
                    <div key={a.id} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <span>
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/15 text-blue-600 dark:text-blue-300 px-1.5 py-0.25 rounded mr-1.5">
                          {a.category}
                        </span>
                        <span className="font-bold">{a.title}</span> — {a.description}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    );
  };

  // ─── THEME 6: STARTUP — Glassmorphism bento-grid layout ──────────────────────
  const renderStartupLayout = () => {
    const gradientHero = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #06b6d4 100%)';
    return (
      <div className="font-sans pb-20 space-y-6">

        {/* ── Hero Banner ── */}
        <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-white" style={{ background: gradientHero }}>
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-7">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-white/10 flex items-center justify-center text-3xl font-black uppercase shrink-0">
              {profile.profilePictureUrl
                ? <img src={profile.profilePictureUrl} alt={profile.user?.name} className="w-full h-full object-cover" />
                : <span>{profile.user?.name?.slice(0, 2) || '??'}</span>
              }
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="text-[10px] font-bold bg-white/15 border border-white/20 px-3 py-0.5 rounded-full uppercase tracking-widest">
                  {profile.department?.name || 'Department'}
                </span>
                {profile.isApproved && (
                  <span className="text-[10px] font-bold bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 px-3 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{profile.user?.name}</h1>
              <p className="text-sm text-white/80 font-medium max-w-xl">{profile.headline || 'Building the future, one commit at a time.'}</p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                {profile.user?.email && <a href={`mailto:${profile.user.email}`} className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl transition-all"><Mail className="w-3.5 h-3.5" />Email</a>}
                {profile.gitHubUrl && <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl transition-all"><GithubIcon className="w-3.5 h-3.5" />GitHub</a>}
                {profile.linkedInUrl && <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl transition-all"><LinkedinIcon className="w-3.5 h-3.5" />LinkedIn</a>}
                {profile.behanceUrl && <a href={profile.behanceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-xl transition-all"><Globe className="w-3.5 h-3.5" />Behance</a>}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Projects', val: profile.projects?.length || 0, color: 'from-violet-500 to-purple-600' },
            { label: 'Certifications', val: profile.certifications?.length || 0, color: 'from-cyan-500 to-blue-600' },
            { label: 'Innovations & Research', val: profile.researchPapers?.length || 0, color: 'from-fuchsia-500 to-pink-600' },
            { label: 'Volunteer Service', val: `${profile.communityServices?.reduce((a: number, c: any) => a + (c.hoursServed || 0), 0) || 0}h`, color: 'from-rose-500 to-red-600' },
          ].map(({ label, val, color }) => (
            <div key={label} className={`rounded-2xl p-4 text-white text-center bg-gradient-to-br ${color} shadow-lg`}>
              <span className="text-2xl font-black block">{val}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
            </div>
          ))}
        </div>
 
        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 
          {/* About — spans 2 cols */}
          {profile.bio && (
            <div className="md:col-span-2 glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">About</h2>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">{profile.bio}</p>
              {profile.personalStory && <p className="text-xs text-text-muted/80 italic border-l-2 border-primary/30 pl-3">"{profile.personalStory}"</p>}
            </div>
          )}
 
          {/* Skills — 1 col */}
          <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Code className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Stack</h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map(s => (
                <span key={s} className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/15 px-2.5 py-1 rounded-lg">{s.trim()}</span>
              ))}
            </div>
          </div>
 
          {/* Projects — 2 cols */}
          {profile.projects && profile.projects.length > 0 && (
            <div className="md:col-span-2 glass rounded-3xl p-6 border border-card-border/60 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Projects</h2>
              </div>
              <div className="space-y-3">
                {profile.projects.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xs font-extrabold text-text-main">{p.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        {p.gitHubUrl && <a href={p.gitHubUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-primary hover:underline">GitHub ↗</a>}
                        {p.liveDemoUrl && <a href={p.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-secondary hover:underline">Demo ↗</a>}
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.techStack?.split(';').map((t: string) => (
                        <span key={t} className="text-[9px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-md">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Education */}
          <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Education</h2>
            </div>
            <div className="space-y-3">
              {academicRecords.map((r, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-bold text-text-main leading-tight">{r.degree}</p>
                  <p className="text-[10px] text-text-muted">{r.institution}</p>
                  <div className="flex gap-2 text-[9px] font-bold text-primary mt-1">
                    <span className="bg-primary/8 px-1.5 py-0.5 rounded">CGPA {r.cgpa}</span>
                    <span className="bg-primary/8 px-1.5 py-0.5 rounded">{r.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Certifications */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Certifications</h2>
              </div>
              <div className="space-y-2.5">
                {profile.certifications.map((c: any) => (
                  <div key={c.id} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-text-main leading-tight">{c.name}</p>
                      <p className="text-[9px] text-text-muted">{c.issuer}</p>
                    </div>
                    {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-primary hover:underline shrink-0">Verify ↗</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Hackathons */}
          {profile.hackathons && profile.hackathons.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Hackathons</h2>
              </div>
              <div className="space-y-2">
                {profile.hackathons.map((h: any) => (
                  <div key={h.id}>
                    <p className="text-[10px] font-bold text-text-main">{h.name}</p>
                    <p className="text-[9px] text-text-muted">{h.projectName} · <span className="text-primary font-bold">{h.achievementPosition}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements & Honors */}
          {profile.achievements && profile.achievements.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Achievements</h2>
              </div>
              <div className="space-y-3">
                {profile.achievements.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider bg-yellow-500/10 text-yellow-700 px-1.5 py-0.25 rounded">{a.category}</span>
                    </div>
                    <p className="text-[10px] font-bold text-text-main leading-snug">{a.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creative Works */}
          {profile.creativeWorks && profile.creativeWorks.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Creative Exhibits</h2>
              </div>
              <div className="space-y-2.5">
                {profile.creativeWorks.slice(0, 3).map((c: any) => (
                  <div key={c.id} className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-text-main leading-tight">{c.title}</p>
                      {c.description && <p className="text-[9px] text-text-muted mt-0.5 line-clamp-1">{c.description}</p>}
                    </div>
                    {c.behanceUrl && <a href={c.behanceUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-primary hover:underline shrink-0">View ↗</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Service & NSS */}
          {profile.communityServices && profile.communityServices.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Community NSS</h2>
              </div>
              <div className="space-y-3.5">
                {profile.communityServices.slice(0, 3).map((svc: any) => (
                  <div key={svc.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-text-main leading-tight truncate">{svc.organizationName}</p>
                      <span className="text-[8px] font-bold bg-rose-500/10 text-rose-600 px-1.5 py-0.25 rounded-full">{svc.hoursServed}h</span>
                    </div>
                    <p className="text-[9px] text-text-muted">{svc.activity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Research & Innovations — full width */}
          {profile.researchPapers && profile.researchPapers.length > 0 && (
            <div className="md:col-span-3 glass rounded-3xl p-6 border border-card-border/60 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xs font-extrabold text-text-main uppercase tracking-wider">Research &amp; Innovations</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.researchPapers.map((p: any) => (
                  <div key={p.id} className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.isInnovationProject ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-primary/5 text-primary border-primary/10'}`}>
                          {p.isInnovationProject ? `Innovation • ${p.prototypeStatus || 'Idea'}` : 'Research Paper'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-text-main leading-snug">{p.title}</p>
                      <p className="text-[9px] text-primary font-semibold">{p.journalOrConference || 'Preprint Node'}</p>
                      {p.abstract && <p className="text-[10px] text-text-muted leading-relaxed font-sans">{p.abstract}</p>}
                      {p.startupIdeaPitch && (
                        <p className="text-[10px] text-text-muted/80 font-sans italic border-l border-primary/20 pl-2">
                          <strong>Pitch:</strong> "{p.startupIdeaPitch}"
                        </p>
                      )}
                    </div>
                    {p.paperUrl && <a href={p.paperUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-secondary hover:underline self-start font-sans">Read Paper &rarr;</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderThemeContent = () => {
    switch (currentTheme) {
      case 'Academic':
        return renderAcademicLayout();
      case 'AI-Futuristic':
        return renderAIFuturisticLayout();
      case 'Creative':
        return renderCreativeLayout();
      case 'Apple-Minimal':
        return renderAppleMinimalLayout();
      case 'Startup':
        return renderStartupLayout();
      case 'Corporate':
      default:
        return renderCorporateLayout();
    }
  };

  // Outer Wrapper styling
  const wrapperClass = currentTheme === 'Academic' 
    ? 'academic-parchment min-h-screen text-amber-950 font-serif' 
    : currentTheme === 'AI-Futuristic' 
    ? 'bg-neutral-950 min-h-screen text-emerald-400 font-mono' 
    : 'min-h-screen bg-page-bg text-text-main font-sans';

  return (
    <div className={`${wrapperClass} transition-colors duration-500 relative pb-24 print:bg-white print:text-black`}>
      
      {/* Ambience grids (disable for AI/Academic override) */}
      {currentTheme !== 'Academic' && currentTheme !== 'AI-Futuristic' && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[140px] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.01)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
      )}

      {currentTheme === 'AI-Futuristic' && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
      )}

      {/* ── Floating Toolbar ── */}
      <div className="no-print sticky top-4 z-50 max-w-4xl mx-auto px-4 mb-8">
        <div className={`glass rounded-2xl px-4 py-2.5 shadow-sm flex items-center justify-between gap-3 relative ${currentTheme === 'AI-Futuristic' ? 'border-emerald-500/20 bg-black/80' : ''}`}>

          {/* Back to registry */}
          <Link href="/" className={`inline-flex items-center gap-1.5 text-xs font-semibold ${currentTheme === 'AI-Futuristic' ? 'text-emerald-500/80 hover:text-white' : 'text-text-muted hover:text-text-main'} transition-colors shrink-0`}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directory</span>
          </Link>

          {/* Theme switcher */}
          <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
            <span className={`text-[9px] font-bold uppercase tracking-wider hidden md:inline ${currentTheme === 'AI-Futuristic' ? 'text-emerald-500/60' : 'text-text-muted'}`}>Layout Preset:</span>
            <div className={`flex rounded-lg p-0.5 gap-0.5 overflow-x-auto hide-scrollbar max-w-full shrink ${currentTheme === 'AI-Futuristic' ? 'bg-emerald-950/40 border border-emerald-500/25' : 'bg-page-bg/40 border border-card-border/60'}`}>
              {THEMES.map(t => (
                <button 
                  key={t} 
                  onClick={() => setTheme(t)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer shrink-0 ${
                    currentTheme === t 
                      ? (currentTheme === 'AI-Futuristic' ? 'bg-emerald-500 text-black shadow-sm' : 'bg-primary text-white shadow-sm') 
                      : (currentTheme === 'AI-Futuristic' ? 'text-emerald-500/60 hover:text-white' : 'text-text-muted hover:text-text-main')
                  }`}
                >
                  {t.split('-')[0].slice(0, 4)}
                </button>
              ))}
            </div>
          </div>

          {/* Action tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => setShareOpen(!shareOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                currentTheme === 'AI-Futuristic' 
                  ? 'border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-500 hover:text-white' 
                  : 'border-card-border hover:bg-primary/5 text-text-muted hover:text-text-main'
              }`}
              title="Share QR Code"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => window.print()}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm ${
                currentTheme === 'AI-Futuristic'
                  ? 'bg-emerald-500 text-black hover:opacity-90'
                  : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print CV</span>
            </button>
          </div>

          {/* Share Box Panel */}
          {shareOpen && (
            <div className={`absolute right-4 left-4 sm:left-auto sm:right-4 top-full mt-2.5 w-auto sm:w-64 glass rounded-3xl p-5 shadow-xl border text-center flex flex-col items-center gap-3 animate-fade-in z-50 ${
              currentTheme === 'AI-Futuristic' ? 'border-emerald-500/30 bg-black' : 'border-card-border/60 bg-page-bg'
            }`}>
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${currentTheme === 'AI-Futuristic' ? 'text-emerald-400' : 'text-text-main'}`}>Share Registry Card</h4>
              <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-inner">
                <QRCodeSVG value={portfolioUrl} size={128} />
              </div>
              <p className={`text-[10px] leading-relaxed ${currentTheme === 'AI-Futuristic' ? 'text-emerald-500/70' : 'text-text-muted'}`}>
                Scan to open this official verified student digital portfolio timeline.
              </p>
              <button 
                onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  currentTheme === 'AI-Futuristic' 
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {copiedLink ? <><Check className="w-3.5 h-3.5" /><span>Copied!</span></> : <><Share2 className="w-3.5 h-3.5" /><span>Copy Profile URL</span></>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content renderer ── */}
      <motion.main 
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6"
      >
        {renderThemeContent()}

        {/* Minimal CV footer */}
        <footer className={`text-center py-10 text-[9px] uppercase tracking-wider border-t no-print mt-12 ${
          currentTheme === 'AI-Futuristic' ? 'border-emerald-500/10 text-emerald-500/40' : 'border-card-border/40 text-text-muted/40'
        }`}>
          <p>
            Verified student portfolio ledger // Madras Christian College Placement Cell
          </p>
          <p className="mt-1">mccportfolio.edu/student/{username}</p>
        </footer>
      </motion.main>
    </div>
  );
}
