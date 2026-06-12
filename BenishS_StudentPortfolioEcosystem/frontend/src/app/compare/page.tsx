'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  GraduationCap, ArrowLeft, ArrowLeftRight, Sparkles, BookOpen, 
  Briefcase, Award, Flame, Users, CheckCircle2, ShieldAlert, 
  ExternalLink, Code, Globe, Calendar, Link2
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { portfolioApi } from '@/lib/api';

// Parsing function to calculate the Radar axes for a student profile
function getRadarData(profile: any) {
  const axes = [
    { name: 'Frontend', value: 20 },
    { name: 'Backend', value: 20 },
    { name: 'Database', value: 20 },
    { name: 'DevOps & Tools', value: 20 },
    { name: 'Creative & Research', value: 20 }
  ];

  if (!profile) return axes;

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

// Custom dual overlay Radar component
function DualRadarChart({ p1, p2, name1, name2 }: { p1: any; p2: any; name1: string; name2: string }) {
  const axes1 = getRadarData(p1);
  const axes2 = getRadarData(p2);
  const cx = 150;
  const cy = 140;
  const R = 90;

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

  // Points for Student 1
  const s1Points = axes1.map((a, i) => {
    const { x, y } = getCoordinates(i, a.value);
    return `${x},${y}`;
  }).join(' ');

  // Points for Student 2
  const s2Points = axes2.map((a, i) => {
    const { x, y } = getCoordinates(i, a.value);
    return `${x},${y}`;
  }).join(' ');

  const labelOffset = 22;
  const labels = axes1.map((a, i) => {
    const angle = -Math.PI / 2 + i * (2 * Math.PI / 5);
    const x = cx + (R + labelOffset) * Math.cos(angle);
    const y = cy + (R + labelOffset) * Math.sin(angle);
    let textAnchor: 'start' | 'end' | 'middle' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    else if (Math.cos(angle) < -0.1) textAnchor = 'end';
    
    return { name: a.name, x, y, textAnchor };
  });

  return (
    <div className="flex flex-col items-center justify-center p-6 glass border border-theme-border/30 rounded-3xl w-full max-w-md mx-auto">
      <h3 className="text-xs font-bold text-theme-fg/60 uppercase tracking-widest mb-4 flex items-center gap-1.5">
        <Sparkles size={13} className="text-theme-primary" />
        Competency Overlay
      </h3>

      <div className="relative w-full aspect-square max-w-[300px]">
        <svg viewBox="0 0 300 280" className="w-full h-full overflow-visible">
          {/* Axis lines & Pentagon background grids */}
          {gridPaths.map((path, i) => (
            <polygon
              key={i}
              points={path}
              className="fill-none stroke-theme-border/30"
              strokeWidth="1"
            />
          ))}

          {/* Core Spoke Lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                className="stroke-theme-border/25"
                strokeWidth="1"
              />
            );
          })}

          {/* Polygon Overlay 1: Student 1 (Cyan/Primary theme variant) */}
          <motion.polygon
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            points={s1Points}
            className="fill-cyan-500/25 stroke-cyan-500"
            strokeWidth="2.5"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Polygon Overlay 2: Student 2 (Purple/Accent variant) */}
          <motion.polygon
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.4 }}
            points={s2Points}
            className="fill-purple-500/25 stroke-purple-500"
            strokeWidth="2.5"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* Overlay Dot Markers for Student 1 */}
          {axes1.map((a, i) => {
            const { x, y } = getCoordinates(i, a.value);
            return <circle key={`s1-${i}`} cx={x} cy={y} r="3.5" className="fill-cyan-500 stroke-white" strokeWidth="1" />;
          })}

          {/* Overlay Dot Markers for Student 2 */}
          {axes2.map((a, i) => {
            const { x, y } = getCoordinates(i, a.value);
            return <circle key={`s2-${i}`} cx={x} cy={y} r="3.5" className="fill-purple-500 stroke-white" strokeWidth="1" />;
          })}

          {/* Pentagon Axis Labels */}
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={l.y + 4}
              textAnchor={l.textAnchor}
              className="fill-theme-fg/75 text-[10px] font-extrabold tracking-tight uppercase"
            >
              {l.name}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend Map */}
      <div className="flex gap-6 mt-4 text-[10px] font-bold border-t border-theme-border/20 pt-3.5 w-full justify-center">
        <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
          {name1}
        </span>
        <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
          {name2}
        </span>
      </div>
    </div>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const u1 = searchParams.get('u1');
  const u2 = searchParams.get('u2');
  
  const [profile1, setProfile1] = useState<any>(null);
  const [profile2, setProfile2] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inst, setInst] = useState<any>(null);

  useEffect(() => {
    portfolioApi.getInstitution()
      .then(data => setInst(data))
      .catch(() => {});

    if (!u1 || !u2) {
      setError('Please select two student portfolios to compare.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    // Parallel fetch public student portfolios
    Promise.all([
      fetch(`http://localhost:5113/api/portfolio/public/${u1}`),
      fetch(`http://localhost:5113/api/portfolio/public/${u2}`)
    ])
      .then(async ([res1, res2]) => {
        if (!res1.ok) throw new Error(`Portfolio for student '${u1}' was not found.`);
        if (!res2.ok) throw new Error(`Portfolio for student '${u2}' was not found.`);
        
        const data1 = await res1.json();
        const data2 = await res2.json();
        
        setProfile1(data1);
        setProfile2(data2);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'An error occurred loading comparison data.');
        setLoading(false);
      });
  }, [u1, u2]);

  // Aggregate unique skills (tech stack) lists
  const getSkillsList = (profile: any) => {
    if (!profile || !profile.projects) return [];
    const set = new Set<string>();
    profile.projects.forEach((p: any) => {
      (p.techStack || '').split(',').forEach((s: string) => {
        const cleaned = s.trim();
        if (cleaned) set.add(cleaned);
      });
    });
    return Array.from(set);
  };

  const skills1 = getSkillsList(profile1);
  const skills2 = getSkillsList(profile2);

  return (
    <>
      {/* =========== HEADER =========== */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 w-full z-50 glass border-b border-theme-border/50 py-3.5 px-5 md:px-10 flex justify-between items-center"
      >
        <Link href="/explore" className="flex items-center gap-2 group text-xs font-bold text-theme-fg/70 hover:text-theme-primary transition-colors py-2 px-3 rounded-xl hover:bg-theme-primary/5">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Explore</span>
        </Link>

        <span className="font-extrabold text-xs tracking-wider uppercase text-theme-fg/50 flex items-center gap-1.5">
          <ArrowLeftRight size={13} className="text-theme-primary" />
          Side-By-Side Comparison
        </span>

        <ThemeToggle />
      </motion.header>

      {/* =========== MAIN COMPARE GRID =========== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-5 py-8 z-10 relative flex flex-col gap-6">
        
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-theme-primary border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-theme-fg/50 animate-pulse">Running comparison compilation…</p>
          </div>
        ) : error ? (
          <div className="py-20 max-w-md mx-auto text-center glass border border-theme-border/30 rounded-3xl p-8 space-y-4">
            <ShieldAlert size={36} className="text-red-500 mx-auto" />
            <h3 className="font-extrabold text-sm text-theme-fg/80">Comparison Failed</h3>
            <p className="text-xs text-theme-fg/55 leading-relaxed">{error}</p>
            <Link href="/explore" className="inline-block px-5 py-2.5 rounded-xl bg-theme-primary text-white text-xs font-bold shadow-md hover:bg-theme-primary-hover transition-all">
              Return to Registry
            </Link>
          </div>
        ) : (
          <>
            {/* Split Header (Profile Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Profile 1 */}
              <div className="glass p-5 rounded-3xl border border-theme-border/40 relative flex gap-4 items-center">
                <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
                <div
                  className="w-16 h-16 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold text-lg border border-theme-border/20 shadow-inner overflow-hidden shrink-0"
                  style={profile1.avatarUrl ? { backgroundImage: `url(${profile1.avatarUrl})`, backgroundSize: 'cover', color: 'transparent' } : {}}
                >
                  {!profile1.avatarUrl && profile1.fullName?.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block mb-0.5">Student Portfolio A</span>
                  <h2 className="text-base font-extrabold leading-tight truncate">{profile1.fullName}</h2>
                  <span className="text-[10px] text-theme-fg/50 font-bold uppercase tracking-wider block mt-0.5">{profile1.department}</span>
                  <Link href={`/student/${profile1.user?.username}`} target="_blank" className="text-[9px] font-bold text-theme-primary hover:underline flex items-center gap-1 mt-1">
                    Open Public page <ExternalLink size={9} />
                  </Link>
                </div>
              </div>

              {/* Profile 2 */}
              <div className="glass p-5 rounded-3xl border border-theme-border/40 relative flex gap-4 items-center">
                <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                <div
                  className="w-16 h-16 rounded-2xl bg-theme-accent/10 text-theme-accent flex items-center justify-center font-bold text-lg border border-theme-border/20 shadow-inner overflow-hidden shrink-0"
                  style={profile2.avatarUrl ? { backgroundImage: `url(${profile2.avatarUrl})`, backgroundSize: 'cover', color: 'transparent' } : {}}
                >
                  {!profile2.avatarUrl && profile2.fullName?.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-widest block mb-0.5">Student Portfolio B</span>
                  <h2 className="text-base font-extrabold leading-tight truncate">{profile2.fullName}</h2>
                  <span className="text-[10px] text-theme-fg/50 font-bold uppercase tracking-wider block mt-0.5">{profile2.department}</span>
                  <Link href={`/student/${profile2.user?.username}`} target="_blank" className="text-[9px] font-bold text-theme-primary hover:underline flex items-center gap-1 mt-1">
                    Open Public page <ExternalLink size={9} />
                  </Link>
                </div>
              </div>

            </div>

            {/* Radar Overlay Competency Section */}
            <div className="w-full">
              <DualRadarChart 
                p1={profile1} 
                p2={profile2} 
                name1={profile1.fullName} 
                name2={profile2.fullName} 
              />
            </div>

            {/* Side-by-Side Detail Table Sheet */}
            <div className="glass rounded-3xl border border-theme-border/30 overflow-hidden shadow-sm">
              
              {/* Row: Bio */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Professional Bio</span>
                </div>
                <div className="md:col-span-2 p-4 text-xs font-medium border-b md:border-b-0 md:border-r border-theme-border/25">
                  {profile1.bio ? <p className="leading-relaxed text-theme-fg/75">{profile1.bio}</p> : <p className="italic text-theme-fg/30">No bio written.</p>}
                </div>
                <div className="md:col-span-2 p-4 text-xs font-medium">
                  {profile2.bio ? <p className="leading-relaxed text-theme-fg/75">{profile2.bio}</p> : <p className="italic text-theme-fg/30">No bio written.</p>}
                </div>
              </div>

              {/* Row: Active Themes */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25 text-center md:text-left">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Branding Theme</span>
                </div>
                <div className="md:col-span-2 p-4 text-xs font-bold text-theme-fg/80 border-b md:border-b-0 md:border-r border-theme-border/25">
                  {profile1.theme}
                </div>
                <div className="md:col-span-2 p-4 text-xs font-bold text-theme-fg/80">
                  {profile2.theme}
                </div>
              </div>

              {/* Row: Numeric Quantities */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Metrics Comparison</span>
                </div>
                <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-theme-border/25 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between"><span>Coding Projects</span><span className="font-extrabold text-theme-primary">{profile1.projects?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Certifications</span><span className="font-extrabold text-theme-primary">{profile1.certifications?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Research Papers</span><span className="font-extrabold text-theme-primary">{profile1.researchPapers?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Hackathons</span><span className="font-extrabold text-theme-primary">{profile1.hackathons?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Extracurricular Awards</span><span className="font-extrabold text-theme-primary">{profile1.achievements?.length || 0}</span></div>
                </div>
                <div className="md:col-span-2 p-4 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between"><span>Coding Projects</span><span className="font-extrabold text-theme-primary">{profile2.projects?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Certifications</span><span className="font-extrabold text-theme-primary">{profile2.certifications?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Research Papers</span><span className="font-extrabold text-theme-primary">{profile2.researchPapers?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Hackathons</span><span className="font-extrabold text-theme-primary">{profile2.hackathons?.length || 0}</span></div>
                  <div className="flex justify-between"><span>Extracurricular Awards</span><span className="font-extrabold text-theme-primary">{profile2.achievements?.length || 0}</span></div>
                </div>
              </div>

              {/* Row: Stacks & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Technology Stack</span>
                </div>
                <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-theme-border/25 flex flex-wrap gap-1.5 align-content-start">
                  {skills1.length > 0 ? (
                    skills1.map(s => (
                      <span key={s} className="px-2 py-1 rounded-lg bg-theme-primary/5 text-theme-primary border border-theme-primary/10 text-[10px] font-bold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic">No skills listed in projects.</span>
                  )}
                </div>
                <div className="md:col-span-2 p-4 flex flex-wrap gap-1.5 align-content-start">
                  {skills2.length > 0 ? (
                    skills2.map(s => (
                      <span key={s} className="px-2 py-1 rounded-lg bg-theme-primary/5 text-theme-primary border border-theme-primary/10 text-[10px] font-bold">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic">No skills listed in projects.</span>
                  )}
                </div>
              </div>

              {/* Row: Detailed Projects List */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Projects Showcase</span>
                </div>
                <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-theme-border/25 space-y-4">
                  {profile1.projects?.length > 0 ? (
                    profile1.projects.map((p: any) => (
                      <div key={p.id} className="space-y-1">
                        <h4 className="text-xs font-bold text-theme-fg flex items-center gap-1">
                          <Briefcase size={12} className="text-theme-primary shrink-0" />
                          {p.title}
                        </h4>
                        <p className="text-[10px] text-theme-fg/60 leading-normal">{p.description}</p>
                        <span className="block text-[8px] font-semibold text-theme-primary uppercase">{p.techStack}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No projects listed.</span>
                  )}
                </div>
                <div className="md:col-span-2 p-4 space-y-4">
                  {profile2.projects?.length > 0 ? (
                    profile2.projects.map((p: any) => (
                      <div key={p.id} className="space-y-1">
                        <h4 className="text-xs font-bold text-theme-fg flex items-center gap-1">
                          <Briefcase size={12} className="text-theme-primary shrink-0" />
                          {p.title}
                        </h4>
                        <p className="text-[10px] text-theme-fg/60 leading-normal">{p.description}</p>
                        <span className="block text-[8px] font-semibold text-theme-primary uppercase">{p.techStack}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No projects listed.</span>
                  )}
                </div>
              </div>

              {/* Row: Detailed Research Publications */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Publications</span>
                </div>
                <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-theme-border/25 space-y-4">
                  {profile1.researchPapers?.length > 0 ? (
                    profile1.researchPapers.map((r: any) => (
                      <div key={r.id} className="space-y-1">
                        <h4 className="text-xs font-bold text-theme-fg flex items-center gap-1">
                          <BookOpen size={12} className="text-theme-primary shrink-0" />
                          {r.title}
                        </h4>
                        <p className="text-[10px] text-theme-fg/60 italic">{r.journalName} · {new Date(r.publishDate).toLocaleDateString('en-IN', { year: 'numeric' })}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No publications listed.</span>
                  )}
                </div>
                <div className="md:col-span-2 p-4 space-y-4">
                  {profile2.researchPapers?.length > 0 ? (
                    profile2.researchPapers.map((r: any) => (
                      <div key={r.id} className="space-y-1">
                        <h4 className="text-xs font-bold text-theme-fg flex items-center gap-1">
                          <BookOpen size={12} className="text-theme-primary shrink-0" />
                          {r.title}
                        </h4>
                        <p className="text-[10px] text-theme-fg/60 italic">{r.journalName} · {new Date(r.publishDate).toLocaleDateString('en-IN', { year: 'numeric' })}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No publications listed.</span>
                  )}
                </div>
              </div>

              {/* Row: Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-5 border-b border-theme-border/25">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Credentials</span>
                </div>
                <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-theme-border/25 space-y-3">
                  {profile1.certifications?.length > 0 ? (
                    profile1.certifications.map((c: any) => (
                      <div key={c.id} className="flex justify-between items-center text-[11px] font-semibold">
                        <div>
                          <span className="block text-theme-fg leading-snug">{c.name}</span>
                          <span className="block text-[9px] text-theme-fg/40 font-bold uppercase tracking-wider">{c.issuer}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No credentials listed.</span>
                  )}
                </div>
                <div className="md:col-span-2 p-4 space-y-3">
                  {profile2.certifications?.length > 0 ? (
                    profile2.certifications.map((c: any) => (
                      <div key={c.id} className="flex justify-between items-center text-[11px] font-semibold">
                        <div>
                          <span className="block text-theme-fg leading-snug">{c.name}</span>
                          <span className="block text-[9px] text-theme-fg/40 font-bold uppercase tracking-wider">{c.issuer}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No credentials listed.</span>
                  )}
                </div>
              </div>

              {/* Row: Honors & Extracurriculars */}
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-1 bg-theme-primary/5 p-4 flex items-center md:justify-center border-b md:border-b-0 md:border-r border-theme-border/25">
                  <span className="text-xs font-bold uppercase text-theme-primary tracking-wider">Activities & Honors</span>
                </div>
                <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-theme-border/25 space-y-3">
                  {profile1.achievements?.length > 0 || profile1.hackathons?.length > 0 ? (
                    <>
                      {profile1.hackathons?.map((h: any) => (
                        <div key={h.id} className="text-xs leading-normal">
                          <span className="font-extrabold text-theme-fg flex items-center gap-1"><Flame size={12} className="text-theme-primary" /> {h.eventName}</span>
                          <span className="block text-[10px] text-theme-fg/60">Built: {h.projectName} · <span className="font-bold text-amber-500">{h.prizeWon}</span></span>
                        </div>
                      ))}
                      {profile1.achievements?.map((a: any) => (
                        <div key={a.id} className="text-xs leading-normal">
                          <span className="font-extrabold text-theme-fg flex items-center gap-1"><Award size={12} className="text-theme-primary" /> {a.title}</span>
                          <span className="block text-[10px] text-theme-fg/60">{a.description}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No activities listed.</span>
                  )}
                </div>
                <div className="md:col-span-2 p-4 space-y-3">
                  {profile2.achievements?.length > 0 || profile2.hackathons?.length > 0 ? (
                    <>
                      {profile2.hackathons?.map((h: any) => (
                        <div key={h.id} className="text-xs leading-normal">
                          <span className="font-extrabold text-theme-fg flex items-center gap-1"><Flame size={12} className="text-theme-primary" /> {h.eventName}</span>
                          <span className="block text-[10px] text-theme-fg/60">Built: {h.projectName} · <span className="font-bold text-amber-500">{h.prizeWon}</span></span>
                        </div>
                      ))}
                      {profile2.achievements?.map((a: any) => (
                        <div key={a.id} className="text-xs leading-normal">
                          <span className="font-extrabold text-theme-fg flex items-center gap-1"><Award size={12} className="text-theme-primary" /> {a.title}</span>
                          <span className="block text-[10px] text-theme-fg/60">{a.description}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span className="text-[10px] text-theme-fg/30 italic block">No activities listed.</span>
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      {/* =========== FOOTER =========== */}
      <footer className="glass border-t border-theme-border/30 py-5 px-6 text-center z-10 mt-12">
        <p className="text-xs text-theme-fg/45">
          &copy; {new Date().getFullYear()} {inst?.name || 'Madras Christian College'} · All rights reserved.
        </p>
      </footer>
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-theme-bg text-theme-fg">
        <div className="w-10 h-10 rounded-full border-4 border-theme-primary border-t-transparent animate-spin" />
        <p className="text-xs font-semibold animate-pulse">Initializing side-by-side compilation…</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
