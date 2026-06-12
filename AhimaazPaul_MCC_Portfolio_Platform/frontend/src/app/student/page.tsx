'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  CheckCircle2, AlertTriangle, Clock, Sparkles, Award, BookOpen, 
  Briefcase, ShieldCheck, Heart, User, Send, ArrowRight, Loader2, Play,
  ChevronRight, Calendar, FileText, CheckCircle, GraduationCap, Cpu, ShieldAlert,
  Brain, UserCheck, RefreshCw, ExternalLink
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 16 }
  }
};

interface ProfileData {
  id: string;
  isApproved: boolean;
  bio: string;
  headline: string;
  skills: string;
  resumeUrl: string;
  projects: any[];
  certifications: any[];
  researchPapers: any[];
  communityServices: any[];
  creativeWorks: any[];
  hackathons: any[];
  user: {
    name: string;
    email: string;
  };
  department: {
    name: string;
  };
}

export const MccCrestLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <img src="/mcc-logo.png" alt="MCC Logo" className={`${className} object-contain`} />
);

export default function StudentDashboard() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [syncingFeed, setSyncingFeed] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState([
    { id: '1', date: 'May 29, 2026', type: 'Exam', title: 'Instant Examinations Notice - July 2026 cycle published', urgent: true },
    { id: '2', date: 'May 22, 2026', type: 'Result', title: 'End Semester Examinations (ESE) April 2026 results released', urgent: false },
    { id: '3', date: 'May 2026', type: 'Admission', title: 'Online UG & PG Applications for Academic Year 2026–2027 are active', urgent: false },
    { id: '4', date: 'Apr 18, 2026', type: 'Notice', title: 'Online Course Feedback and Hall Ticket portal active for ESE', urgent: false },
  ]);



  const handleSyncFeed = () => {
    setSyncingFeed(true);
    setTimeout(() => {
      setSyncingFeed(false);
    }, 700);
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/StudentProfile/me');
      setProfile(response.data);
      setProfileError(false);
    } catch (err: any) {
      console.error('Failed to load student profile', err);
      setProfileError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);
    try {
      const response = await api.post('/api/StudentProfile/submit-approval');
      setSubmitMessage(response.data.message);
      await fetchProfile();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-3xl p-10 text-center flex flex-col items-center gap-5 max-w-md border border-card-border/60">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-text-main">Portfolio Not Found</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {profileError
                ? 'Your student profile could not be loaded. This may be a temporary issue — try refreshing the page. If the problem persists, please contact the administrator.'
                : 'Setting up your workspace...'}
            </p>
          </div>
          {profileError && (
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => { setLoading(true); setProfileError(false); fetchProfile(); }}
                className="btn-primary w-full py-2.5 text-sm rounded-xl flex items-center justify-center gap-2"
              >
                <Loader2 className="w-4 h-4" /> Retry
              </button>
              <p className="text-[10px] text-text-muted">
                Account: <span className="font-semibold text-primary">student@mcc.edu</span> or <span className="font-semibold text-primary">franklinraj@mcc.edu</span> (password: <span className="font-mono">student</span>)
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate Placement Readiness Score
  let score = 15;
  const suggestions: { text: string; link: string; points: number }[] = [];

  if (profile.bio) {
    score += 15;
  } else {
    suggestions.push({ text: 'Add bio description', link: '/student/portfolio', points: 15 });
  }

  const skillsCount = profile.skills ? profile.skills.split(';').filter(Boolean).length : 0;
  if (skillsCount >= 3) {
    score += 20;
  } else {
    suggestions.push({ text: 'List 3 or more skills', link: '/student/portfolio', points: 20 });
  }

  if (profile.projects && profile.projects.length >= 2) {
    score += 30;
  } else {
    suggestions.push({ text: `Add 2+ projects (Current: ${profile.projects?.length || 0})`, link: '/student/portfolio', points: 30 });
  }

  if (profile.certifications && profile.certifications.length >= 1) {
    score += 20;
  } else {
    suggestions.push({ text: 'Add a verified certificate', link: '/student/portfolio', points: 20 });
  }

  if ((profile.researchPapers && profile.researchPapers.length >= 1) || 
      (profile.communityServices && profile.communityServices.length >= 1)) {
    score += 15;
  } else {
    suggestions.push({ text: 'Log a publication or NGO work', link: '/student/research', points: 15 });
  }

  score = Math.min(score, 100);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      
      {/* Messages */}
      {(submitMessage || submitError) && (
        <motion.div variants={itemVariants} className="space-y-2">
          {submitMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs font-semibold">
              {submitMessage}
            </div>
          )}
          {submitError && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-semibold">
              {submitError}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Asymmetric Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        
        {/* Bento Box 1: Welcome Header Card (col-span-4) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 glass rounded-[32px] p-6 flex flex-col justify-between border border-card-border/60 relative overflow-hidden min-h-[220px]"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm uppercase shadow-sm">
                {profile.user.name.slice(0, 2)}
              </div>
              <div>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-0.5 rounded-md border border-primary/10">
                  {profile.department?.name || 'Computer Department'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-text-main mt-0.5 tracking-tight leading-none">
                  Hello, {profile.user.name.split(' ')[0]}
                </h1>
              </div>
            </div>

            <p className="text-xs text-text-muted max-w-md leading-relaxed font-sans">
              Welcome back to your career console. Your digital profile and portfolio nodes are live. Monitor recruiters, track mock scores, and update credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-card-border/60 pt-4 mt-4">
            {profile.isApproved ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Public Portfolio</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center w-full justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Draft Review Status</span>
                </div>
                
                <button
                  onClick={handleSubmitForApproval}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-primary text-white text-[10px] font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit to Placement Cell</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bento Box 2: Holographic circular readiness score (col-span-2, row-span-2) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 glass rounded-[32px] p-6 flex flex-col justify-between gap-6 border border-card-border/60 relative overflow-hidden min-h-[300px]"
        >
          {/* Glowing blur */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary-hover)_0%,_transparent_60%)] opacity-[0.03] pointer-events-none" />

          <div>
            <h3 className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              <span>Readiness Core</span>
            </h3>
            <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
              Auto-calculated alignment value for upcoming placement cycles.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer neon halo */}
              <div className="absolute inset-0 rounded-full bg-primary/3 blur-xl pointer-events-none" />
              
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-card-border/40"
                  strokeWidth="7"
                  fill="transparent"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-primary"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={339.3}
                  initial={{ strokeDashoffset: 339.3 }}
                  animate={{ strokeDashoffset: 339.3 - (339.3 * score) / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-text-main tracking-tight">{score}%</span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Metric</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className={`inline-block text-[10px] font-bold px-3.5 py-1 rounded-full ${
              score >= 80 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15' 
                : score >= 50 
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/15' 
                : 'bg-red-500/10 text-red-500 border border-red-500/15'
            }`}>
              {score >= 80 ? 'Competitive Status' : score >= 50 ? 'Moderate Core' : 'Needs Verification'}
            </span>
          </div>
        </motion.div>

        {/* Bento Box 3: Quick Stats (col-span-4) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Projects', val: profile.projects?.length || 0, icon: Briefcase, color: 'text-primary' },
            { label: 'Certifications', val: profile.certifications?.length || 0, icon: Award, color: 'text-secondary' },
            { label: 'Research Papers', val: profile.researchPapers?.length || 0, icon: BookOpen, color: 'text-emerald-500' },
            { label: 'NGO campaign', val: `${profile.communityServices?.reduce((a, c) => a + (c.hoursServed || 0), 0) || 0}h`, icon: Heart, color: 'text-red-500' }
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="glass rounded-[24px] p-4 text-center border border-card-border/60 flex flex-col justify-between gap-1 shadow-sm">
              <Icon className={`w-4.5 h-4.5 mx-auto opacity-80 ${color}`} />
              <div>
                <span className="text-lg font-black text-text-main block mt-1 leading-none">{val}</span>
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block mt-1">{label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Middle Bento Row: Actions & Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento Box 4: Action Suggestions (col-span-1) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 glass rounded-[32px] p-6 border border-card-border/60 flex flex-col justify-between min-h-[260px]"
        >
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3.5">// Profile Optimization</h3>
            {suggestions.length === 0 ? (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p className="text-xs font-bold">Workspace fully competitive and approved for placement matching!</p>
              </div>
            ) : (
              <div className="divide-y divide-card-border/50">
                {suggestions.slice(0, 4).map((sug, i) => (
                  <Link
                    key={i}
                    href={sug.link}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 hover:text-primary transition-colors text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        +{sug.points}%
                      </span>
                      <span className="text-text-muted group-hover:text-text-main font-semibold">
                        {sug.text}
                      </span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/student/portfolio" className="text-[10px] font-bold text-primary inline-flex items-center gap-1 hover:underline mt-4">
            <span>Optimize portfolio timeline</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Bento Box 5: AI Prompt Terminal Console (col-span-1) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 glass rounded-[32px] p-6 border border-card-border/60 flex flex-col justify-between min-h-[260px] relative overflow-hidden bg-neutral-900/10 dark:bg-black/10"
        >
          <div>
            <h3 className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
              <Cpu className="w-4 h-4 text-secondary" />
              <span>AI Placement Co-Pilot</span>
            </h3>
            
            <div className="bg-black/40 border border-card-border/60 rounded-2xl p-4 font-mono text-xs text-text-muted leading-relaxed space-y-1.5 shadow-inner">
              <p className="text-secondary">&gt; system status check: ready</p>
              <p>&gt; load suggestions: verified skills list</p>
              <p className="text-emerald-500">&gt; match ranking index: compiled (92.4% match accuracy)</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Scan your research materials, auto-generate statement of purpose drafts, and verify CV alignment scores.
            </p>
            <Link
              href="/student/ai"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-secondary text-white text-[10px] font-bold hover:opacity-95 transition-all shadow-sm w-fit"
            >
              <span>Initialize AI Assistant</span>
              <Play className="w-3 h-3 fill-current" />
            </Link>
          </div>
        </motion.div>

        {/* Bento Box 6: MCC Live Updates Feed (col-span-1) */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-1 glass rounded-[32px] p-6 border border-card-border/60 flex flex-col justify-between min-h-[260px] relative overflow-hidden text-left"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span>MCC Live Feed</span>
              </h3>
              
              <button 
                onClick={handleSyncFeed}
                disabled={syncingFeed}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {syncingFeed ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-2.5 h-2.5" />
                )}
                <span>{syncingFeed ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
              {liveUpdates.map((item) => (
                <div key={item.id} className="text-xs leading-normal border-b border-card-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-text-muted uppercase">{item.date}</span>
                    <span className={`text-[9px] font-black uppercase px-1 rounded-sm border ${
                      item.type === 'Exam' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : item.type === 'Result' 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : item.type === 'Admission' 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-neutral-500/10 text-text-muted border-card-border'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-text-main font-semibold hover:text-primary transition-colors cursor-pointer leading-tight text-xs">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-card-border/60 pt-3 mt-3">
            <Link 
              href="https://mcc.edu.in" 
              target="_blank" 
              className="text-[9px] font-bold text-text-muted hover:text-primary inline-flex items-center gap-1.5"
            >
              <span>mcc.edu.in portal</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
            
            <MccCrestLogo className="h-8 w-auto invert dark:invert-0 transition-all duration-300" />
          </div>
        </motion.div>
      </div>

      {/* ── Subsystem Module Portals grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Portfolio Builder', desc: 'Manage your personal story, resume, achievements, and coding projects.', icon: UserCheck, color: 'text-primary', link: '/student/portfolio' },
          { title: 'Research & Innovation', desc: 'Publish papers, prototypes, and startup pitches.', icon: BookOpen, color: 'text-emerald-500', link: '/student/research' },
          { title: 'AI Command Core', desc: 'Generate SOPs, check CV compatibility, and map careers.', icon: Brain, color: 'text-secondary', link: '/student/ai' },
          { title: 'Certificates Vault', desc: 'Upload and verify skill badges and credentials.', icon: Award, color: 'text-indigo-500', link: '/student/certificates' }
        ].map((mod) => {
          const Icon = mod.icon;
          return (
            <motion.div 
              key={mod.title}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="glass rounded-[24px] p-5 border border-card-border/60 flex flex-col justify-between gap-4"
            >
              <div>
                <Icon className={`w-6 h-6 mb-3 ${mod.color}`} />
                <h4 className="text-xs font-black text-text-main">{mod.title}</h4>
                <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans">{mod.desc}</p>
              </div>
              <Link href={mod.link} className={`text-[10px] font-bold ${mod.color} inline-flex items-center gap-1 hover:underline`}>
                <span>Enter module</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
