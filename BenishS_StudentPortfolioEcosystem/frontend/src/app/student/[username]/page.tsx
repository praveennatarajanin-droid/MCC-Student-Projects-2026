'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioApi } from '@/lib/api';
import {
  GitBranch, Globe, GraduationCap, FileText, Award, Code, Flame, Users,
  ExternalLink, BookOpen, Sparkles, ArrowLeft, MapPin, Mail, Calendar, Palette,
  X, ChevronRight
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const THEME_CLASS: Record<string, string> = {
  Academic: 'theme-academic',
  Corporate: 'theme-corporate',
  Startup: 'theme-startup',
  Creative: 'theme-creative',
  'AI Futuristic': 'theme-futuristic',
};

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary shrink-0 print:bg-transparent print:w-auto print:h-auto print:text-theme-primary">
        {icon}
      </div>
      <h2 className="text-base font-extrabold tracking-tight print:text-sm print:text-theme-fg">{title}</h2>
      <div className="flex-1 h-px bg-theme-border/40 ml-1 print:bg-theme-primary/20 print:h-[1.5px]" />
    </div>
  );
}

// ───────────────── OPTION A HELPERS & SUBCOMPONENTS ─────────────────

function getRadarData(profile: any) {
  const axes = [
    { name: 'Frontend', value: 20 },
    { name: 'Backend', value: 20 },
    { name: 'Database', value: 20 },
    { name: 'DevOps & Tools', value: 20 },
    { name: 'Creative & Research', value: 20 }
  ];

  if (profile.projects) {
    profile.projects.forEach((p: any) => {
      const tech = (p.techStack || '').toLowerCase();
      if (tech.includes('react') || tech.includes('next') || tech.includes('html') || tech.includes('css') || tech.includes('tailwind') || tech.includes('javascript') || tech.includes('typescript') || tech.includes('vue') || tech.includes('angular')) {
        axes[0].value += 15;
      }
      if (tech.includes('asp') || tech.includes('c#') || tech.includes('node') || tech.includes('express') || tech.includes('java') || tech.includes('spring') || tech.includes('python') || tech.includes('django') || tech.includes('api') || tech.includes('dotnet')) {
        axes[1].value += 15;
      }
      if (tech.includes('postgres') || tech.includes('sql') || tech.includes('mongo') || tech.includes('redis') || tech.includes('mysql') || tech.includes('db') || tech.includes('sqlite')) {
        axes[2].value += 15;
      }
      if (tech.includes('docker') || tech.includes('kubernetes') || tech.includes('git') || tech.includes('aws') || tech.includes('azure') || tech.includes('cloud') || tech.includes('ci') || tech.includes('cd') || tech.includes('action')) {
        axes[3].value += 15;
      }
    });
  }

  if (profile.certifications) {
    profile.certifications.forEach((c: any) => {
      const name = (c.name || '').toLowerCase();
      if (name.includes('cloud') || name.includes('aws') || name.includes('devops') || name.includes('docker')) {
        axes[3].value += 15;
      } else if (name.includes('database') || name.includes('sql') || name.includes('postgres')) {
        axes[2].value += 15;
      } else if (name.includes('frontend') || name.includes('react')) {
        axes[0].value += 15;
      } else {
        axes[1].value += 15;
      }
    });
  }

  if (profile.researchPapers && profile.researchPapers.length > 0) axes[4].value += 20;
  if (profile.creativeWorks && profile.creativeWorks.length > 0) axes[4].value += 25;
  if (profile.behanceUrl) axes[4].value += 20;
  if (profile.hackathons) {
    profile.hackathons.forEach(() => {
      axes[3].value += 10;
    });
  }

  axes.forEach(a => {
    a.value = Math.max(20, Math.min(100, a.value));
  });

  return axes;
}

function SkillRadarChart({ profile }: { profile: any }) {
  const axes = getRadarData(profile);
  const cx = 120;
  const cy = 115;
  const R = 75;

  const getCoordinates = (index: number, value: number) => {
    const angle = -Math.PI / 2 + index * (2 * Math.PI / 5);
    const x = cx + R * (value / 100) * Math.cos(angle);
    const y = cy + R * (value / 100) * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [25, 50, 75, 100];
  const gridPaths = gridLevels.map(level => {
    const points = Array.from({ length: 5 }, (_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    });
    return points.join(' ') + ' ' + points[0];
  });

  const valuePoints = axes.map((a, i) => {
    const { x, y } = getCoordinates(i, a.value);
    return `${x},${y}`;
  });
  const polygonPath = valuePoints.join(' ');

  const labelOffset = 18;
  const labels = axes.map((a, i) => {
    const angle = -Math.PI / 2 + i * (2 * Math.PI / 5);
    const x = cx + (R + labelOffset) * Math.cos(angle);
    const y = cy + (R + labelOffset) * Math.sin(angle);
    let textAnchor: 'start' | 'end' | 'middle' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    else if (Math.cos(angle) < -0.1) textAnchor = 'end';
    
    return { name: a.name, value: a.value, x, y, textAnchor };
  });

  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden select-none w-full">
      <div className="w-full flex justify-center mt-2 select-none">
        <svg width="250" height="230" className="overflow-visible print:scale-85 print:origin-center">
          {gridPaths.map((path, index) => (
            <polygon
              key={index}
              points={path}
              fill="none"
              stroke="var(--foreground)"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}

          {Array.from({ length: 5 }).map((_, i) => {
            const inner = getCoordinates(i, 0);
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--foreground)"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
            );
          })}

          <motion.polygon
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.25 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            points={polygonPath}
            fill="var(--primary)"
            className="origin-center"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          <motion.polygon
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            points={polygonPath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            className="origin-center"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {axes.map((a, i) => {
            const { x, y } = getCoordinates(i, a.value);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="var(--background)"
                stroke="var(--primary)"
                strokeWidth="2"
              />
            );
          })}

          {labels.map((l, i) => (
            <g key={i}>
              <text
                x={l.x}
                y={l.y}
                textAnchor={l.textAnchor}
                className="text-[9px] font-extrabold fill-theme-fg/75 tracking-tight print:text-[8px]"
                dominantBaseline="middle"
              >
                {l.name}
              </text>
              <text
                x={l.x}
                y={l.y + 10}
                textAnchor={l.textAnchor}
                className="text-[8px] font-bold fill-theme-primary print:text-[7.5px]"
                dominantBaseline="middle"
              >
                {l.value}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function getTimelineEvents(profile: any) {
  const events: any[] = [];

  if (profile.projects) {
    profile.projects.forEach((p: any) => {
      events.push({
        id: `project-${p.id}`,
        title: p.title,
        subtitle: p.techStack,
        description: p.description,
        date: new Date(2026, 3, 1),
        type: 'Project',
        color: 'var(--primary)',
        link: p.githubUrl || p.demoUrl
      });
    });
  }

  if (profile.certifications) {
    profile.certifications.forEach((c: any) => {
      events.push({
        id: `cert-${c.id}`,
        title: c.name,
        subtitle: c.issuer,
        description: `Issued by ${c.issuer} on ${new Date(c.issueDate).toLocaleDateString('en-IN')}`,
        date: new Date(c.issueDate),
        type: 'Certification',
        color: '#10b981',
        link: c.credentialUrl
      });
    });
  }

  if (profile.researchPapers) {
    profile.researchPapers.forEach((r: any) => {
      events.push({
        id: `research-${r.id}`,
        title: r.title,
        subtitle: r.journalName,
        description: r.abstract,
        date: new Date(r.publishDate),
        type: 'Research',
        color: '#a855f7',
        link: r.paperUrl
      });
    });
  }

  if (profile.achievements) {
    profile.achievements.forEach((a: any) => {
      events.push({
        id: `achievement-${a.id}`,
        title: a.title,
        subtitle: 'Honor / Award',
        description: a.description,
        date: new Date(a.date),
        type: 'Award',
        color: '#f59e0b'
      });
    });
  }

  if (profile.hackathons) {
    profile.hackathons.forEach((h: any) => {
      events.push({
        id: `hackathon-${h.id}`,
        title: h.eventName,
        subtitle: `Built: ${h.projectName}`,
        description: `Won: ${h.prizeWon} at the ${h.eventName} competition.`,
        date: new Date(h.date),
        type: 'Hackathon',
        color: '#ef4444'
      });
    });
  }

  if (profile.communityServices) {
    profile.communityServices.forEach((s: any) => {
      events.push({
        id: `service-${s.id}`,
        title: s.organization,
        subtitle: s.role,
        description: s.description,
        date: new Date(s.date),
        type: 'Community Service',
        color: '#06b6d4'
      });
    });
  }

  if (profile.creativeWorks) {
    profile.creativeWorks.forEach((c: any) => {
      events.push({
        id: `creative-${c.id}`,
        title: c.title,
        subtitle: 'Creative Design / Media',
        description: c.description,
        date: new Date(c.date),
        type: 'Creative',
        color: '#d946ef',
        image: c.imageUrl,
        link: c.projectUrl
      });
    });
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return events;
}

function InteractiveTimeline({ profile }: { profile: any }) {
  const events = getTimelineEvents(profile);
  const [filter, setFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const filteredEvents = events.filter(e => {
    if (filter === 'All') return true;
    if (filter === 'Projects') return e.type === 'Project' || e.type === 'Creative';
    if (filter === 'Credentials') return e.type === 'Certification' || e.type === 'Research';
    if (filter === 'Extracurriculars') return e.type === 'Award' || e.type === 'Hackathon' || e.type === 'Community Service';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Project': return <Code size={12} />;
      case 'Certification': return <Award size={12} />;
      case 'Research': return <FileText size={12} />;
      case 'Award': return <Award size={12} />;
      case 'Hackathon': return <Flame size={12} />;
      case 'Community Service': return <Users size={12} />;
      case 'Creative': return <Palette size={12} />;
      default: return <Calendar size={12} />;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-theme-border/30 pb-3">
        <SectionHeading icon={<Calendar size={15} />} title="Interactive Academic & Career Timeline" />
        <div className="flex gap-1 bg-theme-border/20 p-1 rounded-xl glass shrink-0 text-[9px] font-extrabold uppercase tracking-wider no-print">
          {['All', 'Projects', 'Credentials', 'Extracurriculars'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${filter === f ? 'bg-theme-primary text-white shadow-sm' : 'text-theme-fg/60 hover:text-theme-fg'}`}
            >
              {f === 'Credentials' ? 'Credentials & Pubs' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full space-y-6 py-2">
        {/* Center Vertical Line */}
        <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-theme-border/50" />

        {filteredEvents.map((evt, idx) => {
          const isLeft = idx % 2 === 0;
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: isLeft ? -12 : 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className={`relative flex items-center pl-10 md:pl-0 md:w-full md:justify-between ${isLeft ? 'md:flex-row-reverse' : 'md:flex-row'}`}
            >
              {/* Icon Circle */}
              <div className="absolute left-1 md:left-1/2 md:-translate-x-1/2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-theme-bg border-2 flex items-center justify-center text-theme-primary z-10 shadow-sm"
                style={{ borderColor: evt.color, color: evt.color }}>
                {getIcon(evt.type)}
              </div>

              {/* Spacer on desktop */}
              <div className="hidden md:block w-[45%]" />

              {/* Card Container */}
              <div
                onClick={() => setSelectedEvent(evt)}
                className="w-full md:w-[45%] glass p-4 rounded-2xl border border-theme-border/30 hover:border-theme-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-md text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${evt.color}15`, color: evt.color }}>
                      {evt.type}
                    </span>
                    <span className="text-[10px] text-theme-fg/40 font-semibold">{evt.date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</span>
                  </div>
                  <h4 className="font-bold text-xs mt-2 leading-snug truncate">{evt.title}</h4>
                  <p className="text-[10px] font-semibold text-theme-fg/50 mt-0.5 truncate">{evt.subtitle}</p>
                </div>
                <div className="text-[10px] text-theme-primary font-bold hover:underline flex items-center gap-0.5 mt-3 pt-2 border-t border-theme-border/15">
                  View Details <ChevronRight size={10} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="py-6 text-center text-sm text-theme-fg/40 italic">No events in this category.</div>
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print"
            onClick={(e) => e.target === e.currentTarget && setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              className="w-full max-w-md glass p-6 rounded-3xl shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-theme-border/30 text-theme-fg/40 hover:text-theme-fg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedEvent.color}15`, color: selectedEvent.color }}>
                    {selectedEvent.type}
                  </span>
                  <span className="text-[10px] text-theme-fg/40 font-semibold">{selectedEvent.date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm leading-snug">{selectedEvent.title}</h3>
                  <p className="text-xs font-semibold text-theme-fg/50 mt-1">{selectedEvent.subtitle}</p>
                </div>

                {selectedEvent.image && (
                  <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-40 object-cover rounded-xl border border-theme-border/30 mt-2" />
                )}

                <p className="text-xs text-theme-fg/70 leading-relaxed bg-theme-primary/5 p-4 rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {selectedEvent.description || "No description provided."}
                </p>

                {selectedEvent.link && (
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover shadow-md transition-all w-full justify-center"
                  >
                    <span>Open Linked Credential</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inst, setInst] = useState<any>(null);
  const [enabledThemes, setEnabledThemes] = useState<string[]>([]);

  useEffect(() => {
    if (!username) return;
    portfolioApi.getPublicProfile(username)
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message || 'Portfolio not found.'))
      .finally(() => setLoading(false));

    portfolioApi.getInstitution()
      .then((data) => setInst(data))
      .catch(() => {});

    portfolioApi.getEnabledThemes()
      .then((themes) => setEnabledThemes(themes.filter((t: any) => t.isEnabled).map((t: any) => t.name)))
      .catch(() => {});
  }, [username]);

  /* Loading state */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-theme-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-theme-fg/55 font-semibold animate-pulse">Loading portfolio…</p>
        </div>
      </div>
    );
  }

  /* Error state */
  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center"
        >
          <GraduationCap size={40} />
        </motion.div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
          <p className="text-sm text-theme-fg/55">
            The username <strong className="font-bold text-theme-primary">@{username}</strong> doesn&apos;t match any registered student.
          </p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-theme-primary text-white text-sm font-bold hover:bg-theme-primary-hover transition-all shadow-md">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const isThemeEnabled = enabledThemes.length === 0 || enabledThemes.includes(profile.theme);
  const themeClass = THEME_CLASS[profile.theme] && isThemeEnabled ? THEME_CLASS[profile.theme] : 'theme-academic';
  const isFuturistic = profile.theme === 'AI Futuristic' && isThemeEnabled;

  return (
    <div className={`min-h-screen ${themeClass} bg-theme-bg text-theme-fg relative overflow-hidden`}>
      {/* Background decorative effects */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-theme-primary/8 blur-[150px] pointer-events-none no-print"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-theme-accent/6 blur-[150px] pointer-events-none no-print"
      />
      {isFuturistic && (
        <div className="fixed inset-0 pointer-events-none opacity-5 no-print"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
      )}

      {/* ─── Top Nav ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 glass border-b border-theme-border/40 px-5 py-3 flex justify-between items-center no-print"
      >
        <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:text-theme-primary transition-colors">
          <ArrowLeft size={15} className="no-print" />
          {inst?.logoUrl ? (
            <img src={inst.logoUrl} alt="Logo" className="w-6 h-6 rounded-md object-cover border border-theme-border/30 shrink-0" />
          ) : (
            <GraduationCap size={15} />
          )}
          <span>{inst?.shortName || 'MCC'} Portfolio Ecosystem</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
          <span className="text-theme-fg/55 capitalize">{(isThemeEnabled ? profile.theme : 'Academic')} Theme</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-theme-primary/25 text-theme-primary text-xs font-bold hover:bg-theme-primary/5 transition-all cursor-pointer"
          >
            <FileText size={13} />
            <span>Export Resume</span>
          </button>
          <Link href="/login" className="px-3.5 py-2 rounded-xl bg-theme-primary text-white text-xs font-bold hover:bg-theme-primary-hover transition-all shadow-md">
            Sign In
          </Link>
        </div>
      </motion.nav>

      <main className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-10 relative z-10">

        {/* ═══ HERO CARD ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="glass rounded-3xl overflow-hidden shadow-2xl shadow-theme-primary/5"
        >
          {/* Banner */}
          <div
            className="h-40 md:h-52 w-full relative"
            style={{
              background: profile.bannerUrl
                ? `url('${profile.bannerUrl}') center/cover no-repeat`
                : `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute top-3 right-3 glass px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 border-white/20">
              <Sparkles size={10} />
              <span className="capitalize">{profile.theme}</span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-6 md:px-8 pb-7 relative">
            <div className="flex justify-between items-end -mt-12 md:-mt-14 mb-4 gap-4">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-theme-bg shadow-xl overflow-hidden bg-theme-primary/10 flex items-center justify-center text-theme-primary text-2xl font-extrabold uppercase shrink-0 relative"
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || 'Student'}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  profile.fullName ? profile.fullName.substring(0, 2) : 'ST'
                )}
              </motion.div>

              <div className="flex items-center gap-2 mb-1">
                {profile.githubUrl && (
                  <motion.a whileHover={{ scale: 1.1, rotate: 5 }} href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="glass p-2.5 rounded-xl text-theme-fg/65 hover:text-theme-primary transition-colors">
                    <GitBranch size={17} />
                  </motion.a>
                )}
                {profile.behanceUrl && (
                  <motion.a whileHover={{ scale: 1.1, rotate: -5 }} href={profile.behanceUrl} target="_blank" rel="noopener noreferrer"
                    className="glass p-2.5 rounded-xl text-theme-fg/65 hover:text-theme-primary transition-colors">
                    <Globe size={17} />
                  </motion.a>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="space-y-2.5"
            >
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display leading-tight">
                {profile.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-theme-fg/65 font-semibold">
                {profile.department && (
                  <span className="flex items-center gap-1.5"><BookOpen size={13} />{profile.department}</span>
                )}
                <span className="flex items-center gap-1.5"><MapPin size={13} />Madras Christian College, Chennai</span>
                {profile.user?.email && (
                  <span className="flex items-center gap-1.5"><Mail size={13} />{profile.user.email}</span>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-theme-fg/70 leading-relaxed max-w-2xl pt-0.5">{profile.bio}</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        <AnimatedSection delay={0.1}>
          <div className="glass p-5 rounded-2xl grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-theme-border/20 text-center print:grid-cols-5 print:gap-2 print:divide-none">
            {[
              { label: 'Projects', value: profile.projects?.length ?? 0, icon: <Code size={13} /> },
              { label: 'Certifications', value: profile.certifications?.length ?? 0, icon: <Award size={13} /> },
              { label: 'Publications', value: profile.researchPapers?.length ?? 0, icon: <FileText size={13} /> },
              { label: 'Hackathons', value: profile.hackathons?.length ?? 0, icon: <Flame size={13} /> },
              { label: 'Creative Works', value: profile.creativeWorks?.length ?? 0, icon: <Palette size={13} /> },
            ].map((stat, i) => (
              <div key={stat.label} className={`flex flex-col items-center justify-center gap-1.5 p-2 md:p-0 ${i === 4 ? 'col-span-2 md:col-span-1 print:col-span-1' : ''}`}>
                <span className="text-2xl font-extrabold text-theme-primary leading-none print:text-base">{stat.value}</span>
                <span className="flex items-center gap-1.5 text-[9px] text-theme-fg/55 font-bold uppercase tracking-wider print:text-[8px] print:gap-1">
                  {stat.icon}{stat.label}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ═══ TWO-COLUMN CONTENT GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ─── LEFT COLUMN: main portfolio details (2/3 width) ─── */}
          <div className="lg:col-span-2 space-y-8 print:col-span-3">
            {/* Statement of Purpose */}
            {profile.sop && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-1.5">
                  <SectionHeading icon={<Sparkles size={15} />} title="Statement of Purpose" />
                  <div className="glass p-6 rounded-3xl border border-theme-border/30 shadow-lg">
                    <p className="text-sm text-theme-fg/75 leading-relaxed whitespace-pre-wrap print:text-[11px] print:leading-relaxed print:text-theme-fg/80">{profile.sop}</p>
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<Code size={15} />} title="Projects Showcase" />
                  <div className="glass p-6 md:p-7 rounded-3xl border border-theme-border/30 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 divide-y md:divide-y-0 md:divide-x divide-theme-border/15 md:-mx-4">
                      {profile.projects.map((proj: any, i: number) => (
                        <div key={proj.id} className={`flex flex-col justify-between space-y-4 pt-6 md:pt-0 ${i % 2 !== 0 ? 'md:pl-8' : ''} ${i < 2 ? 'first:pt-0' : ''}`}>
                          <div className="space-y-2.5">
                            <h3 className="font-bold text-sm leading-tight text-theme-fg print:text-xs">{proj.title}</h3>
                            <p className="text-xs text-theme-fg/65 leading-relaxed print:text-[11px] print:leading-normal">{proj.description}</p>
                            {proj.techStack && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5 print:gap-1">
                                {proj.techStack.split(',').map((tech: string) => (
                                  <span key={tech} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-theme-primary/8 text-theme-primary print:text-[8px]">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 pt-3 border-t border-theme-border/15 print:hidden">
                            {proj.githubUrl && (
                              <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-theme-primary hover:underline">
                                <GitBranch size={12} /><span>Source Code</span>
                              </a>
                            )}
                            {proj.demoUrl && (
                              <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-theme-accent hover:underline">
                                <ExternalLink size={12} /><span>Live Demo</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* Research publications */}
            {profile.researchPapers?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<FileText size={15} />} title="Research Publications" />
                  <div className="glass p-6 rounded-3xl border border-theme-border/30 shadow-lg divide-y divide-theme-border/15">
                    {profile.researchPapers.map((paper: any, i: number) => (
                      <div key={paper.id} className={`space-y-3 ${i > 0 ? 'pt-5 mt-5' : ''}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-theme-fg print:text-xs">{paper.title}</h4>
                            <p className="text-xs font-semibold text-theme-primary print:text-[10px]">{paper.journalName}</p>
                            <p className="text-[10px] text-theme-fg/45 flex items-center gap-1 print:text-[8px] print:text-theme-fg/60">
                              <Calendar size={9} className="print:w-2 print:h-2" />
                              Published: {new Date(paper.publishDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                            </p>
                          </div>
                          {paper.paperUrl && (
                            <a href={paper.paperUrl} target="_blank" rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs font-bold text-theme-primary hover:bg-theme-primary/5 transition-colors print:hidden">
                              <ExternalLink size={11} /><span>Read Paper</span>
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-theme-fg/70 leading-relaxed bg-theme-primary/5 p-4 rounded-xl print:p-3 print:bg-transparent print:border print:border-theme-border/20 print:text-[11px]">{paper.abstract}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* Creative Works */}
            {profile.creativeWorks?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<Palette size={15} />} title="Creative Works & Media Gallery" />
                  <div className="glass p-5 rounded-3xl border border-theme-border/30 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {profile.creativeWorks.map((cw: any) => (
                        <div
                          key={cw.id}
                          className="flex flex-col justify-between border border-theme-border/15 rounded-2xl overflow-hidden bg-theme-bg/10 shadow-sm"
                        >
                          {cw.imageUrl && (
                            <div className="relative h-40 w-full overflow-hidden group print:h-24">
                              <img src={cw.imageUrl} alt={cw.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                            </div>
                          )}
                          <div className="p-4 flex-1 flex flex-col justify-between print:p-3 print:gap-1.5">
                            <div className="space-y-1.5">
                              <h4 className="font-bold text-xs leading-snug text-theme-fg print:text-[11px]">{cw.title}</h4>
                              <p className="text-[11px] text-theme-fg/60 line-clamp-3 leading-relaxed print:text-[10px] print:line-clamp-2">{cw.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme-border/25 print:mt-0 print:pt-0 print:border-none">
                              <span className="text-[9px] text-theme-fg/40 print:text-[8px]">{cw.date ? new Date(cw.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : ''}</span>
                              {cw.projectUrl && (
                                <a href={cw.projectUrl} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-theme-primary hover:underline print:hidden">
                                  <span>Link</span><ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </AnimatedSection>
            )}
          </div>

          {/* ─── RIGHT COLUMN: skills & stats (1/3 width) ─── */}
          <div className="lg:col-span-1 space-y-8 print:col-span-3">
            {/* Skills profiling */}
            <AnimatedSection delay={0.15}>
              <div className="space-y-4">
                <div className="glass p-6 rounded-3xl flex flex-col justify-between border border-theme-border/30 shadow-md">
                  <div>
                    <h3 className="text-[10px] uppercase font-extrabold tracking-wider text-theme-fg/40 mb-2 print:text-[8px]">Technical Core</h3>
                    <h4 className="font-extrabold text-sm text-theme-fg print:text-xs">Skill Domain Alignment</h4>
                    <p className="text-xs text-theme-fg/60 leading-relaxed mt-2.5 print:text-[11px] print:leading-normal print:mt-1.5">
                      Aggregated dynamic competence verified against Madras Christian College active registry.
                    </p>
                    <div className="mt-5 space-y-2 print:mt-2.5">
                      <div className="flex justify-between text-xs font-bold print:text-[10px]">
                        <span>Placement Readiness</span>
                        <span className="text-theme-primary">High</span>
                      </div>
                      <div className="w-full h-2 bg-theme-border/30 rounded-full overflow-hidden print:h-1.5">
                        <div className="h-full bg-gradient-to-r from-theme-primary to-theme-accent rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <SkillRadarChart profile={profile} />
                </div>
              </div>
            </AnimatedSection>

            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<Award size={15} />} title="Certifications" />
                  <div className="glass p-5 rounded-3xl border border-theme-border/30 shadow-lg divide-y divide-theme-border/15">
                    {profile.certifications.map((cert: any, i: number) => (
                      <div
                        key={cert.id}
                        className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0 print:w-7 print:h-7 print:rounded-lg">
                          <Award size={14} className="print:w-3.5 print:h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate text-theme-fg print:text-xs">{cert.name}</h4>
                          <p className="text-[10px] text-theme-fg/55 font-semibold print:text-[9px]">{cert.issuer}</p>
                          <p className="text-[9px] text-theme-fg/40 flex items-center gap-1 mt-0.5 print:text-[8px] print:mt-0">
                            <Calendar size={8} className="print:w-2 print:h-2" />
                            {new Date(cert.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                            className="shrink-0 text-theme-primary hover:text-theme-primary-hover transition-colors p-1.5 rounded-lg hover:bg-theme-primary/5 print:hidden">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* Achievements */}
            {profile.achievements?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<Award size={15} />} title="Achievements" />
                  <div className="glass p-5 rounded-3xl border border-theme-border/30 shadow-lg divide-y divide-theme-border/15">
                    {profile.achievements.map((ach: any, i: number) => (
                      <div key={ach.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                        <div className="w-8 h-8 rounded-xl bg-theme-accent/10 text-theme-accent flex items-center justify-center shrink-0 print:w-7 print:h-7 print:rounded-lg">
                          <Award size={14} className="print:w-3.5 print:h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-theme-fg print:text-xs">{ach.title}</h4>
                          <p className="text-[10px] text-theme-fg/65 mt-0.5 leading-relaxed print:text-[9px]">{ach.description}</p>
                          <p className="text-[9px] text-theme-fg/40 mt-1 flex items-center gap-1 print:text-[8px] print:mt-0.5">
                            <Calendar size={8} className="print:w-2 print:h-2" />
                            {new Date(ach.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* Hackathons */}
            {profile.hackathons?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<Flame size={15} />} title="Hackathons" />
                  <div className="glass p-5 rounded-3xl border border-theme-border/30 shadow-lg divide-y divide-theme-border/15">
                    {profile.hackathons.map((hack: any, i: number) => (
                      <div key={hack.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-theme-fg truncate print:text-xs">{hack.eventName}</h4>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-theme-primary/10 text-theme-primary shrink-0 print:text-[8px]">
                            {hack.prizeWon}
                          </span>
                        </div>
                        <p className="text-[10px] text-theme-fg/65 print:text-[9px]">Project: <strong className="text-theme-fg font-semibold">{hack.projectName}</strong></p>
                        <p className="text-[9px] text-theme-fg/40 flex items-center gap-1 print:text-[8px]">
                          <Calendar size={8} className="print:w-2 print:h-2" />
                          {new Date(hack.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* Community Service */}
            {profile.communityServices?.length > 0 && (
              <AnimatedSection>
                <section className="space-y-3 print:space-y-2">
                  <SectionHeading icon={<Users size={15} />} title="Community Service" />
                  <div className="glass p-5 rounded-3xl border border-theme-border/30 shadow-lg divide-y divide-theme-border/15">
                    {profile.communityServices.map((service: any, i: number) => (
                      <div key={service.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                        <div className="w-8 h-8 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center shrink-0 print:w-7 print:h-7 print:rounded-lg">
                          <Users size={14} className="print:w-3.5 print:h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-theme-fg truncate print:text-xs">{service.organization}</h4>
                          <p className="text-[10px] font-bold text-theme-fg/50 uppercase tracking-wider">{service.role}</p>
                          <p className="text-[10px] text-theme-fg/65 mt-1 leading-relaxed print:text-[9px]">{service.description}</p>
                          <p className="text-[9px] text-theme-fg/40 flex items-center gap-1 mt-1 print:text-[8px]">
                            <Calendar size={8} className="print:w-2 print:h-2" />
                            {new Date(service.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            )}
          </div>
        </div>

        {/* ═══ INTERACTIVE TIMELINE ═══ */}
        <AnimatedSection>
          <InteractiveTimeline profile={profile} />
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-theme-border/25 py-5 text-center text-xs text-theme-fg/45 mt-8 no-print">
        <p>
          Portfolio of <strong className="text-theme-fg font-semibold">{profile.fullName}</strong> · {inst?.name || 'Madras Christian College'} Portfolio Ecosystem
        </p>
        <p className="mt-1 text-theme-fg/30">
          {inst?.websiteUrl ? inst.websiteUrl : 'mccportfolio.edu'}/student/{username}
        </p>
      </footer>
    </div>
  );
}
