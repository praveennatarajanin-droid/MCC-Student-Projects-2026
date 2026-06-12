'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Building2, Users, CheckCircle, Loader2, RefreshCw, BookOpen, ShieldAlert } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
  institutionName: string;
  totalStudents: number;
  approvedStudents: number;
  topSkills: string[];
}

const DEPT_COLORS = [
  'from-primary to-primary-hover',
  'from-secondary to-secondary-hover',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-indigo-500 to-indigo-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
];

export default function DepartmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'aided' | 'sfs'>('all');

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get('/api/Admin/departments'); setDepartments(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const aidedDepts = departments.filter(d => 
    ["COM", "CHEM", "HIST", "POL", "ECO", "PHIL", "TAM", "ENG", "MATH", "STAT", "PHYS", "PB", "ZOO"].includes(d.code)
  );
  const sfsDepts = departments.filter(d => !aidedDepts.some(ad => ad.id === d.id));
  const filteredDepts = activeTab === 'all' ? departments : activeTab === 'aided' ? aidedDepts : sfsDepts;

  const totalStudents = departments.reduce((a, d) => a + d.totalStudents, 0);
  const totalApproved = departments.reduce((a, d) => a + d.approvedStudents, 0);

  if (authLoading || (loading && user?.role === 'SuperAdmin')) {
    return (
      <div className="flex h-64 items-center justify-center animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-text-main tracking-tight">Access Denied</h2>
        <p className="text-text-muted text-sm mt-2 max-w-sm leading-relaxed">
          You do not have the required permissions to access this page. This module is restricted to the Super Administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3 h-3" /><span>Institutional Structure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">Departments</h1>
          <p className="text-xs text-text-muted mt-1">All academic departments and their student enrollment statistics.</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl border border-card-border hover:bg-primary/5 text-text-muted cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Departments', val: departments.length, icon: Building2, color: 'text-primary bg-primary/10' },
          { label: 'Total Students', val: totalStudents, icon: Users, color: 'text-secondary bg-secondary/10' },
          { label: 'Verified Profiles', val: totalApproved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-500/10' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase">{c.label}</p>
                <p className="text-2xl font-extrabold text-text-main leading-tight">{c.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 rounded-xl bg-card-bg border border-card-border max-w-md">
        {(['all', 'aided', 'sfs'] as const).map((tab) => {
          const count = tab === 'all' 
            ? departments.length 
            : tab === 'aided' 
              ? aidedDepts.length 
              : sfsDepts.length;
          const label = tab === 'all' 
            ? 'All Streams' 
            : tab === 'aided' 
              ? 'Aided Stream' 
              : 'Self-Financed (SFS)';
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDepts.map((dept, i) => {
          const pct = dept.totalStudents > 0 ? Math.round((dept.approvedStudents / dept.totalStudents) * 100) : 0;
          const isAided = aidedDepts.some(ad => ad.id === dept.id);
          return (
            <div key={dept.id} className="glass rounded-3xl overflow-hidden shadow-sm border border-card-border hover:shadow-md transition-all">
              <div className={`h-2 w-full bg-gradient-to-r ${DEPT_COLORS[i % DEPT_COLORS.length]}`} />
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted">{dept.code}</span>
                      <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none ${
                        isAided
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/15 text-secondary-hover'
                      }`}>
                        {isAided ? 'Aided' : 'SFS'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-text-main mt-1.5 leading-snug">{dept.name}</h3>
                    <p className="text-[10px] text-text-muted">{dept.institutionName}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-page-bg/50 border border-card-border shrink-0">
                    <BookOpen className="w-5 h-5 text-text-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-page-bg/30 border border-card-border text-center">
                    <p className="text-lg font-extrabold text-text-main">{dept.totalStudents}</p>
                    <p className="text-[9px] font-bold text-text-muted uppercase">Enrolled</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15 text-center">
                    <p className="text-lg font-extrabold text-emerald-600">{dept.approvedStudents}</p>
                    <p className="text-[9px] font-bold text-text-muted uppercase">Verified</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-semibold text-text-muted mb-1.5">
                    <span>Portfolio Completion</span><span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${DEPT_COLORS[i % DEPT_COLORS.length]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {dept.topSkills.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-text-muted uppercase mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.topSkills.map(s => (
                        <span key={s} className="text-[9px] font-semibold bg-primary/8 text-primary border border-primary/15 px-2 py-0.5 rounded-md">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
