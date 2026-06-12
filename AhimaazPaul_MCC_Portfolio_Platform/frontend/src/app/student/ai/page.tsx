'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, FileText, Compass, Send, Copy,
  Check, RefreshCw, History, Loader2, ArrowRight,
  GraduationCap, Briefcase, Award, BookOpen, TrendingUp,
  Star, Building2, MapPin, DollarSign, ExternalLink, Zap,
  ChevronRight, BarChart3, Globe, Target, CheckCircle2, AlertCircle,
  Terminal, Cpu, Shield, Database, Square
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AIHistoryItem {
  id: string;
  type: string;
  promptText: string;
  generatedText: string;
  createdAt: string;
}

interface UniversityRec {
  name: string;
  country: string;
  program: string;
  ranking: string;
  reason: string;
  url: string;
  matchStrength: 'Strong' | 'Good' | 'Reach';
}

interface InternshipMatch {
  company: string;
  role: string;
  skills: string;
  stipend: string;
  location: string;
  applyUrl: string;
  matchPercent: number;
}

interface Scholarship {
  name: string;
  provider: string;
  amount: string;
  eligibility: string;
  deadline: string;
  applyUrl: string;
  category: string;
}

// ─── Tab config ─────────────────────────────────────────────────────────────

const BINARIES = [
  { id: 'sop',          filename: 'sop-generator.py',    icon: Sparkles,      lang: 'Python',  desc: 'Generate customized Statement of Purpose' },
  { id: 'resume',       filename: 'cv-audit.sh',         icon: FileText,      lang: 'Bash',    desc: 'Scan portfolio for industry CV compatibility' },
  { id: 'portfolio',    filename: 'portfolio-tips.go',   icon: BarChart3,     lang: 'Go',      desc: 'Get actionable tips on your current showcase' },
  { id: 'career',       filename: 'career-mapper.rs',    icon: Compass,       lang: 'Rust',    desc: 'Map potential professional avenues' },
  { id: 'university',   filename: 'uni-matcher.py',      icon: GraduationCap, lang: 'Python',  desc: 'Recommend global graduate schools' },
  { id: 'internship',   filename: 'intern-finder.js',    icon: Briefcase,     lang: 'Node.js', desc: 'Scan and match available internships' },
  { id: 'scholarship',  filename: 'scholarship-api.sh',  icon: Award,         lang: 'Bash',    desc: 'Retrieve academic funding opportunities' },
  { id: 'history',      filename: 'query-logs.db',       icon: History,       lang: 'SQLite',  desc: 'View your local AI execution history' },
] as const;

type BinaryId = typeof BINARIES[number]['id'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ConsoleMatchBadge = ({ strength }: { strength: string }) => {
  const map: Record<string, string> = {
    Strong: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30',
    Good:   'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30',
    Reach:  'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
  };
  return (
    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${map[strength] ?? map.Good}`}>
      [{strength}]
    </span>
  );
};

const ConsoleProgressBar = ({ pct }: { pct: number }) => {
  const totalBlocks = 20;
  const filledBlocks = Math.round((pct / 100) * totalBlocks);
  const unfilledBlocks = totalBlocks - filledBlocks;
  
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] text-[#38bdf8]">
      <span>[</span>
      <span className="text-[#10b981]">
        {'█'.repeat(filledBlocks)}
        {'░'.repeat(unfilledBlocks)}
      </span>
      <span>]</span>
      <span className="text-text-main font-bold">{pct}% MATCH</span>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIToolsPanel() {
  const [activeTab, setActiveTab] = useState<BinaryId>('sop');

  // SOP
  const [focusArea, setFocusArea] = useState('');
  const [careerGoals, setCareerGoals] = useState('');
  const [generatingSop, setGeneratingSop] = useState(false);
  const [sopResult, setSopResult] = useState('');
  const [copiedSop, setCopiedSop] = useState(false);

  // Resume
  const [reviewingResume, setReviewingResume] = useState(false);
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);

  // Portfolio
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [portfolioTips, setPortfolioTips] = useState<string[]>([]);

  // Career
  const [loadingCareer, setLoadingCareer] = useState(false);
  const [careerResult, setCareerResult] = useState('');

  // University
  const [careerGoalUni, setCareerGoalUni] = useState('');
  const [loadingUni, setLoadingUni] = useState(false);
  const [universities, setUniversities] = useState<UniversityRec[]>([]);

  // Internship
  const [loadingInternship, setLoadingInternship] = useState(false);
  const [internships, setInternships] = useState<InternshipMatch[]>([]);

  // Scholarship
  const [loadingScholarship, setLoadingScholarship] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  // History
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory] = useState<AIHistoryItem[]>([]);

  // Shell Logs
  const [shellLogs, setShellLogs] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
    // Reset shell logs for the file execution
    setShellLogs([
      `guest@mcc-ai-shell:~$ chmod +x ./${getCurrentBinary().filename}`,
      `guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename} --help`,
      `--- ${getCurrentBinary().desc} ---`,
      `Language: ${getCurrentBinary().lang} | Status: READY`,
      `Type parameters and execute command to run...`
    ]);
  }, [activeTab]);

  const getCurrentBinary = () => BINARIES.find(b => b.id === activeTab)!;

  const addLog = (msg: string) => {
    setShellLogs(prev => [...prev, msg]);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    addLog(`[db] CONNECTING TO SQLITE DATABASE 'query-logs.db'...`);
    try { 
      const r = await api.get('/api/AI/history'); 
      setHistory(r.data); 
      addLog(`[db] SUCCESS: Fetched ${r.data.length} historical log rows.`);
    }
    catch (e) { 
      console.error(e); 
      addLog(`[db] ERROR: Failed to execute query against database context.`);
    }
    finally { setLoadingHistory(false); }
  };

  const handleGenerateSop = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingSop(true); setSopResult('');
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename} --role="${focusArea.replace(/"/g, '\\"')}" --goals="..."`);
    addLog(`[init] Initializing secure NLP module execution...`);
    addLog(`[load] Mapping portfolio, grades, and project profiles...`);
    addLog(`[eval] Matching Statement of Purpose tone with professional criteria...`);
    
    try { 
      const r = await api.post('/api/AI/sop', { focusArea, careerGoals }); 
      setSopResult(r.data.sop); 
      addLog(`[success] Script terminated successfully. Code: 0. Output size: ${r.data.sop.length} chars.`);
    }
    catch (e) { 
      setSopResult('Failed to generate. Please check your profile details and try again.'); 
      addLog(`[error] Script terminated with exit status 1: API response exception.`);
    }
    finally { setGeneratingSop(false); }
  };

  const handleApplySopToProfile = async () => {
    if (!sopResult) return;
    addLog(`[sys] mv ./output.txt /etc/student/profile/statement_of_purpose`);
    try {
      const r = await api.get('/api/StudentProfile/me');
      const p = r.data;
      await api.post('/api/StudentProfile/update', { ...p, statementOfPurpose: sopResult, academicRecordsJson: p.academicRecordsJson || '[]' });
      addLog(`[sys] SUCCESS: Profile file descriptor updated and saved.`);
      alert('SOP saved to your profile!');
    } catch (e) { 
      console.error(e); 
      addLog(`[sys] ERROR: Failed to write statements to database.`);
    }
  };

  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text); setter(true);
    addLog(`[sys] Output copied to local buffer.`);
    setTimeout(() => setter(false), 2000);
  };

  const handleReviewResume = async () => {
    setReviewingResume(true); setResumeScore(null); setResumeSuggestions([]);
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename}`);
    addLog(`[init] Scraping CV elements from profile metadata...`);
    addLog(`[audit] Evaluating key metrics (Certifications, Project stack, bio completeness)...`);
    
    try { 
      const r = await api.post('/api/AI/resume-review'); 
      setResumeScore(r.data.score); 
      setResumeSuggestions(r.data.suggestions); 
      addLog(`[success] Scan finished. Integrity score evaluated: ${r.data.score}/100.`);
    }
    catch (e) { 
      console.error(e); 
      addLog(`[error] Scanner runtime error. Check network credentials.`);
    } finally { setReviewingResume(false); }
  };

  const handlePortfolioTips = async () => {
    setLoadingPortfolio(true); setPortfolioTips([]);
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename}`);
    addLog(`[analyze] Checking responsive designs, layout flags, and certification depth...`);
    
    try { 
      const r = await api.post('/api/AI/portfolio-improvements'); 
      setPortfolioTips(r.data.improvements); 
      addLog(`[success] Found ${r.data.improvements.length} optimization suggestions.`);
    }
    catch (e) { 
      console.error(e); 
      addLog(`[error] Optimization script aborted.`);
    } finally { setLoadingPortfolio(false); }
  };

  const handleCareerGuidance = async () => {
    setLoadingCareer(true); setCareerResult('');
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename}`);
    addLog(`[compute] Running matrix recommendation heuristics against current department...`);
    
    try { 
      const r = await api.post('/api/AI/career-guidance'); 
      setCareerResult(r.data.guidance); 
      addLog(`[success] Guidance text loaded. Stream output rendering...`);
    }
    catch (e) { 
      setCareerResult('Could not load recommendations.'); 
      addLog(`[error] Remote mapping failure.`);
    } finally { setLoadingCareer(false); }
  };

  const handleUniversityRecs = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingUni(true); setUniversities([]);
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename} --target="${careerGoalUni}"`);
    addLog(`[match] Querying global institutional rankings for '${careerGoalUni}'...`);
    
    try { 
      const r = await api.post('/api/AI/university-recommendations', { careerGoal: careerGoalUni }); 
      setUniversities(r.data.universities); 
      addLog(`[success] Loaded ${r.data.universities.length} institution match nodes.`);
    }
    catch (e) { 
      console.error(e); 
      addLog(`[error] Connection to ranking server lost.`);
    } finally { setLoadingUni(false); }
  };

  const handleInternships = async () => {
    setLoadingInternship(true); setInternships([]);
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename}`);
    addLog(`[network] Polling live corporate endpoints matching your student profile...`);
    
    try { 
      const r = await api.post('/api/AI/internship-matches'); 
      setInternships(r.data.matches); 
      addLog(`[success] Pipeline synchronization complete. Captured ${r.data.matches.length} matches.`);
    }
    catch (e) { 
      console.error(e); 
      addLog(`[error] Node handshake timeout.`);
    } finally { setLoadingInternship(false); }
  };

  const handleScholarships = async () => {
    setLoadingScholarship(true); setScholarships([]);
    addLog(`guest@mcc-ai-shell:~$ ./${getCurrentBinary().filename}`);
    addLog(`[fetch] Aggregating academic grant lists from public repositories...`);
    
    try { 
      const r = await api.post('/api/AI/scholarships'); 
      setScholarships(r.data.scholarships); 
      addLog(`[success] ${r.data.scholarships.length} scholarships parsed and mapped.`);
    }
    catch (e) { 
      console.error(e); 
      addLog(`[error] Parsing engine failure.`);
    } finally { setLoadingScholarship(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* ── Header ── */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono uppercase tracking-wider mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>secure developer terminal session</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          AI Career Command Core
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 font-sans">
          Deploy specialized AI compiler scripts to test CV readiness, map careers, and extract global opportunities.
        </p>
      </div>

      {/* ── Main Terminal Shell Dashboard ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Binary File Navigator */}
        <div className="lg:col-span-1 glass border border-card-border/60 rounded-3xl p-4 flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-card-border/50">
            <Cpu className="w-4.5 h-4.5 text-primary" />
            <span className="text-[11px] font-black uppercase font-mono text-text-muted">executable /bin/</span>
          </div>

          <div className="flex flex-col gap-2 font-mono">
            {BINARIES.map((bin) => {
              const Icon = bin.icon;
              const isActive = activeTab === bin.id;
              
              return (
                <button
                  key={bin.id}
                  onClick={() => setActiveTab(bin.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500'
                      : 'border-card-border/60 hover:border-emerald-500/20 hover:bg-page-bg/30 text-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 transition-all ${
                      isActive ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500' : 'border-card-border bg-page-bg/40 text-text-muted group-hover:text-text-main'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className={`text-[11.5px] font-bold block leading-none ${isActive ? 'text-emerald-500' : 'text-text-main group-hover:text-emerald-500'}`}>
                        {bin.filename}
                      </span>
                      <span className="text-[9px] text-text-muted block mt-1">
                        {bin.lang}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-emerald-500' : 'opacity-40 group-hover:opacity-100'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive CLI Shell Screen */}
        <div className="lg:col-span-3 flex flex-col rounded-3xl border border-card-border bg-[#0a0b0d] shadow-2xl relative overflow-hidden min-h-[580px]">
          
          {/* Top macOS-style Terminal Header */}
          <div className="h-11 bg-[#13151b] border-b border-card-border/70 flex items-center justify-between px-5 select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="text-[10.5px] font-mono text-text-muted/65 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>guest@mcc-ai-shell: ~/{getCurrentBinary().filename}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted/40 font-mono">
              <Shield className="w-3 h-3 text-[#10b981]" />
              <span>AES-256</span>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="flex-1 p-6 flex flex-col justify-between gap-6 overflow-y-auto text-left font-mono">
            
            {/* Upper Section: Command history & Logs */}
            <div className="space-y-2 text-[11px] text-[#86efac]">
              {shellLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed">
                  {log}
                </div>
              ))}
            </div>

            {/* Middle Section: Parameter forms embedded inside the terminal screen */}
            <div className="p-5 border border-card-border bg-[#111319]/70 rounded-2xl space-y-4">
              
              {/* Conditional parameters */}
              {activeTab === 'sop' && (
                <form onSubmit={handleGenerateSop} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">--role / --program</label>
                      <input
                        type="text" required
                        placeholder="e.g. M.S. in Computer Science"
                        value={focusArea}
                        onChange={e => setFocusArea(e.target.value)}
                        className="block w-full px-3 py-2 rounded-lg border border-card-border/60 bg-[#07080a] text-[#10b981] placeholder-text-muted/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">--goals</label>
                      <input
                        type="text" required
                        placeholder="e.g. Artificial Intelligence, research at Google"
                        value={careerGoals}
                        onChange={e => setCareerGoals(e.target.value)}
                        className="block w-full px-3 py-2 rounded-lg border border-card-border/60 bg-[#07080a] text-[#10b981] placeholder-text-muted/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit" disabled={generatingSop}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {generatingSop ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                    <span>COMPILE &amp; EXECUTE</span>
                  </button>
                </form>
              )}

              {activeTab === 'resume' && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <p className="text-[#10b981] font-bold">// Ready to run resume structure audit</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Compares academic profile completeness against recruiter rules.</p>
                  </div>
                  <button
                    onClick={handleReviewResume} disabled={reviewingResume}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {reviewingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>RUN AUDIT</span>
                  </button>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <p className="text-[#10b981] font-bold">// Run portfolio optimizer heuristic</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Analyzes active showcase metrics, profiles, and badges.</p>
                  </div>
                  <button
                    onClick={handlePortfolioTips} disabled={loadingPortfolio}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#3b82f6] text-white font-extrabold hover:bg-blue-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {loadingPortfolio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                    <span>ANALYZE PORTFOLIO</span>
                  </button>
                </div>
              )}

              {activeTab === 'career' && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <p className="text-[#10b981] font-bold">// Map career vectors</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Synthesizes optimal company structures based on stack capability.</p>
                  </div>
                  <button
                    onClick={handleCareerGuidance} disabled={loadingCareer}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#f59e0b] text-black font-extrabold hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {loadingCareer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                    <span>GENERATE ROADMAP</span>
                  </button>
                </div>
              )}

              {activeTab === 'university' && (
                <form onSubmit={handleUniversityRecs} className="space-y-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">--career-goal</label>
                    <input
                      type="text" required
                      placeholder="e.g. Machine Learning Researcher"
                      value={careerGoalUni}
                      onChange={e => setCareerGoalUni(e.target.value)}
                      className="block w-full px-3 py-2 rounded-lg border border-card-border/60 bg-[#07080a] text-[#10b981] placeholder-text-muted/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                  
                  <button
                    type="submit" disabled={loadingUni}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#a855f7] text-white font-extrabold hover:bg-purple-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loadingUni ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>QUERY UNIVERSITIES</span>
                  </button>
                </form>
              )}

              {activeTab === 'internship' && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <p className="text-[#10b981] font-bold">// Poll internship databases</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Scrapes connected recruitment servers and parses alignment indices.</p>
                  </div>
                  <button
                    onClick={handleInternships} disabled={loadingInternship}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {loadingInternship ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Briefcase className="w-3.5 h-3.5" />}
                    <span>FETCH INTERNSHIPS</span>
                  </button>
                </div>
              )}

              {activeTab === 'scholarship' && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <p className="text-[#10b981] font-bold">// Scrape scholarship grants</p>
                    <p className="text-[10px] text-text-muted mt-0.5">Checks merit and category scholarships fitting CGPA records.</p>
                  </div>
                  <button
                    onClick={handleScholarships} disabled={loadingScholarship}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-rose-500 text-white font-extrabold hover:bg-rose-400 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    {loadingScholarship ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                    <span>FETCH GRANTS</span>
                  </button>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-xs">
                    <p className="text-[#10b981] font-bold">// SQL query interface logs</p>
                  </div>
                  <button
                    onClick={fetchHistory}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg border border-[#86efac]/40 text-[#86efac] font-bold hover:bg-[#86efac]/10 active:scale-[0.98] transition-all cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>REFRESH LOG DATABASE</span>
                  </button>
                </div>
              )}

            </div>

            {/* Lower Section: Output compiler panels */}
            <div className="flex-1 flex flex-col justify-end pt-4 min-h-[220px]">
              <div className="text-[10px] text-text-muted/65 uppercase tracking-wider mb-2 font-black border-b border-card-border/50 pb-1.5 flex items-center justify-between">
                <span>Console stdout stream</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              </div>

              <div className="flex-1 overflow-y-auto max-h-[300px]">
                <AnimatePresence mode="wait">
                  
                  {/* 1. SOP RESULT */}
                  {activeTab === 'sop' && (
                    <motion.div key="sop-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {generatingSop ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" />
                          <span className="text-xs text-[#10b981]">Analyzing variables...</span>
                        </div>
                      ) : sopResult ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-[#0d0f14] border border-card-border rounded-xl text-xs text-[#bbf7d0] leading-relaxed max-h-[240px] overflow-y-auto font-mono whitespace-pre-wrap select-all">
                            {sopResult}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleCopy(sopResult, setCopiedSop)} className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#272935] hover:bg-[#343746] text-text-main text-[11px] font-bold cursor-pointer transition-all">
                              {copiedSop ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSop ? 'COPIED!' : 'COPY TO BUFFER'}</span>
                            </button>
                            <button onClick={handleApplySopToProfile} className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10b981] text-[11px] font-bold cursor-pointer transition-all">
                              <Check className="w-3.5 h-3.5" />
                              <span>SAVE TO /etc/profile</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Execute compiler shell script to print output values
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 2. RESUME REVIEW */}
                  {activeTab === 'resume' && (
                    <motion.div key="resume-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      {reviewingResume ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                          <span className="text-xs text-amber-500">Auditing documents...</span>
                        </div>
                      ) : resumeScore !== null ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-5 p-4 bg-[#0d0f14] border border-card-border rounded-xl">
                            <div className="w-16 h-16 rounded-full border-2 border-[#f59e0b] flex flex-col items-center justify-center font-bold font-mono">
                              <span className="text-lg text-text-main leading-none">{resumeScore}</span>
                              <span className="text-[7px] text-text-muted mt-0.5">SCORE</span>
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-bold text-text-main uppercase">Resume Integrity Check</span>
                              <p className="text-[10px] text-text-muted mt-1">Audit score generated based on technical keywords, academic transcripts, and statement matching indices.</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {resumeSuggestions.map((s, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-card-border/80 bg-[#161821]/40 text-xs">
                                <span className="text-amber-500 mt-0.5 font-bold">[{i+1}]</span>
                                <p className="text-[#e2e8f0] leading-relaxed font-sans">{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Launch audit system to score and generate suggestions
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 3. PORTFOLIO IMPROVEMENTS */}
                  {activeTab === 'portfolio' && (
                    <motion.div key="portfolio-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingPortfolio ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#3b82f6]" />
                          <span className="text-xs text-[#3b82f6]">Auditing canvas...</span>
                        </div>
                      ) : portfolioTips.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {portfolioTips.map((tip, i) => (
                            <div key={i} className="p-3.5 rounded-xl border border-[#3b82f6]/20 bg-[#3b82f6]/5 text-xs flex gap-2.5 text-left font-sans">
                              <span className="text-[#3b82f6] font-mono font-bold">0{i+1}.</span>
                              <p className="text-text-muted/95 leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center font-mono">
                          // Click 'ANALYZE PORTFOLIO' to run canvas diagnostics
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 4. CAREER GUIDANCE */}
                  {activeTab === 'career' && (
                    <motion.div key="career-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingCareer ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#f59e0b]" />
                          <span className="text-xs text-[#f59e0b]">Mapping sectors...</span>
                        </div>
                      ) : careerResult ? (
                        <div className="p-4 bg-[#0d0f14] border border-card-border rounded-xl text-xs text-[#fed7aa] leading-relaxed max-h-[300px] overflow-y-auto font-mono whitespace-pre-wrap whitespace-pre-line select-all text-left">
                          {careerResult}
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Run mapping module to extract matching company segments
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 5. UNIVERSITY RECOMMENDATIONS */}
                  {activeTab === 'university' && (
                    <motion.div key="uni-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingUni ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#a855f7]" />
                          <span className="text-xs text-[#a855f7]">Indexing database tables...</span>
                        </div>
                      ) : universities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {universities.map((uni, i) => (
                            <div key={i} className="p-4 rounded-xl border border-card-border bg-[#13151f] space-y-2.5 text-left text-xs font-mono">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <span className="text-[9px] text-[#a855f7] uppercase font-bold">{uni.country}</span>
                                  <h4 className="text-xs font-black text-text-main mt-0.5 leading-snug">{uni.name}</h4>
                                  <p className="text-[10px] text-text-muted mt-0.5">{uni.program}</p>
                                </div>
                                <ConsoleMatchBadge strength={uni.matchStrength} />
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>RANKING: {uni.ranking}</span>
                              </div>
                              <p className="text-[10.5px] text-text-muted/80 leading-relaxed font-sans">{uni.reason}</p>
                              <a href={uni.url} target="_blank" className="inline-flex items-center gap-1 text-[10px] text-[#a855f7] hover:underline font-bold">
                                <ExternalLink className="w-3 h-3" />
                                <span>VISIT INSTITUTION URL</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Enter academic goals and search matching institutions
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 6. INTERNSHIPS MATCHING */}
                  {activeTab === 'internship' && (
                    <motion.div key="intern-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingInternship ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                          <span className="text-xs text-emerald-500">Querying recruiter logs...</span>
                        </div>
                      ) : internships.length > 0 ? (
                        <div className="space-y-4">
                          {internships.map((job, i) => (
                            <div key={i} className="p-4 rounded-xl border border-card-border bg-[#101318] space-y-3.5 text-left text-xs font-mono">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-text-main">{job.company}</h4>
                                    <p className="text-[10.5px] text-text-muted mt-0.5">{job.role}</p>
                                  </div>
                                </div>
                                <ConsoleProgressBar pct={job.matchPercent} />
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-text-muted">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.stipend}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {job.skills.split(',').map((s) => (
                                  <span key={s} className="text-[9.5px] font-bold bg-emerald-500/5 text-[#10b981] border border-emerald-500/15 px-2 py-0.5 rounded">{s.trim()}</span>
                                ))}
                              </div>
                              <a href={job.applyUrl} target="_blank" className="inline-flex items-center gap-1 text-[10px] text-emerald-500 hover:underline font-bold mt-1">
                                <ExternalLink className="w-3 h-3" />
                                <span>LAUNCH APPLICATION PORTAL</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Query active placements from campus partner API endpoints
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 7. SCHOLARSHIPS SUGGESTIONS */}
                  {activeTab === 'scholarship' && (
                    <motion.div key="scholar-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingScholarship ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                          <span className="text-xs text-rose-500">Checking grants ledger...</span>
                        </div>
                      ) : scholarships.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {scholarships.map((sch, i) => (
                            <div key={i} className="p-4 rounded-xl border border-card-border bg-[#151113] space-y-3 text-left text-xs font-mono">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-black text-text-main leading-snug">{sch.name}</h4>
                                <span className="text-[8.5px] font-bold border border-rose-500/20 bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded uppercase">
                                  {sch.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-text-muted font-bold">{sch.provider}</p>
                              <div className="p-2 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 rounded-lg flex items-center gap-1.5 font-bold">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{sch.amount} GRANTED</span>
                              </div>
                              <p className="text-[10.5px] text-text-muted leading-relaxed font-sans">{sch.eligibility}</p>
                              <div className="flex items-center justify-between pt-2 border-t border-card-border/50 text-[10px]">
                                <span className="text-text-muted">DEADLINE: {sch.deadline}</span>
                                <a href={sch.applyUrl} target="_blank" className="inline-flex items-center gap-1 text-rose-400 hover:underline font-bold">
                                  <ExternalLink className="w-3 h-3" />
                                  <span>APPLY</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Launch parser to scrape academic fund pipelines
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 8. AI LOG HISTORY */}
                  {activeTab === 'history' && (
                    <motion.div key="history-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingHistory ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                          <span className="text-xs text-text-muted">Polling rows...</span>
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-xs text-text-muted py-10 text-center">
                          // Zero database records matching query signature
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {history.map((item) => (
                            <div key={item.id} className="p-3.5 rounded-xl border border-card-border bg-[#0d0f13] space-y-2 text-left text-xs font-mono">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="px-2 py-0.5 rounded bg-card-border text-text-main font-bold">
                                  {item.type}
                                </span>
                                <span className="text-text-muted">{new Date(item.createdAt).toLocaleString()}</span>
                              </div>
                              {item.promptText && (
                                <p className="text-[10px] text-text-muted"><span className="text-[#10b981] font-bold">PARAMS:</span> {item.promptText}</p>
                              )}
                              <div className="p-2.5 rounded border border-card-border/50 bg-[#08090d] text-[10.5px] leading-relaxed max-h-24 overflow-y-auto text-text-muted/90 whitespace-pre-wrap font-mono">
                                {item.generatedText}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
