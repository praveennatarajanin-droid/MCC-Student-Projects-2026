'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Users, CheckCircle, Clock, Percent, FileText, Lightbulb, 
  Loader2, RefreshCw, BarChart2, PieChart as PieIcon, Award, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion, Variants } from 'framer-motion';

interface AnalyticsData {
  totalStudents: number;
  approvedPortfolios: number;
  pendingApprovals: number;
  completionPercentage: number;
  departments: { name: string; code: string; studentCount: number; approvedCount: number }[];
  skillsCloud: { name: string; count: number }[];
  research: { totalPapers: number; innovationProjects: number };
  placementReadiness: { high: number; medium: number; low: number };
}

const COLORS = ['#C8102E', '#C5A059', '#e5e7eb'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/Admin/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-3 border border-card-border/60">
        <span className="text-red-500 font-bold">Analytics Data Error</span>
        <p className="text-xs text-text-muted">Could not retrieve portfolio statistics.</p>
      </div>
    );
  }

  // Prep Recharts readiness pie data
  const readinessPieData = [
    { name: 'High Readiness (80+)', value: data.placementReadiness.high },
    { name: 'Medium Readiness (50-79)', value: data.placementReadiness.medium },
    { name: 'Low Readiness (<50)', value: data.placementReadiness.low },
  ].filter(item => item.value > 0);

  // Prep skills chart data
  const skillsData = data.skillsCloud.slice(0, 5);

  const statCards = [
    { title: 'Registered Students', val: data.totalStudents, icon: Users, color: 'text-primary bg-primary/5' },
    { title: 'Verified Portfolios', val: data.approvedPortfolios, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-500/5' },
    { title: 'Pending Reviews', val: data.pendingApprovals, icon: Clock, color: 'text-amber-500 bg-amber-500/5' },
    { title: 'Verification Rate', val: `${data.completionPercentage}%`, icon: Percent, color: 'text-indigo-600 bg-indigo-500/5' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative font-sans select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">Admin Workspace</h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            System-wide registration insights, placement preparedness distributions, and skill metrics.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-card-border bg-page-bg/30 text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Workspace</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="glass rounded-2xl p-5 border border-card-border/60 flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black text-text-main leading-none">
                {card.val}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Stats */}
        <div className="lg:col-span-2 glass rounded-2xl p-5.5 border border-card-border/60 space-y-4 text-left">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span>Registration by Department</span>
          </h3>

          <div className="h-64 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.departments}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="code" fontSize={9} fontWeight="semibold" stroke="#86868b" />
                <YAxis fontSize={9} stroke="#86868b" />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }} />
                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }} />
                <Bar name="Total Registered" dataKey="studentCount" fill="#C8102E" radius={[3, 3, 0, 0]} />
                <Bar name="Verified Portfolios" dataKey="approvedCount" fill="#C5A059" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readiness distribution */}
        <div className="lg:col-span-1 glass rounded-2xl p-5.5 border border-card-border/60 space-y-4 flex flex-col justify-between text-left">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3">
            <PieIcon className="w-4 h-4 text-secondary" />
            <span>Placement Readiness</span>
          </h3>

          {readinessPieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center italic text-xs text-text-muted py-12">
              No readiness details computed.
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <div className="h-36 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={readinessPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={54}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {readinessPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend details */}
              <div className="w-full space-y-2 mt-2">
                {readinessPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] font-bold text-text-muted">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-text-main">{item.value} students</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Skill Clouds counts */}
        <div className="lg:col-span-2 glass rounded-2xl p-5.5 border border-card-border/60 space-y-4 text-left">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3">
            <BarChart2 className="w-4 h-4 text-secondary" />
            <span>Top Skill Trends</span>
          </h3>

          {skillsData.length === 0 ? (
            <p className="text-xs text-text-muted italic text-center py-12">No skill counts recorded yet.</p>
          ) : (
            <div className="h-56 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillsData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={9} stroke="#86868b" />
                  <YAxis type="category" dataKey="name" fontSize={9} width={70} fontWeight="semibold" stroke="#86868b" />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Bar name="Student Count" dataKey="count" fill="#C8102E" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Research innovation stats */}
        <div className="lg:col-span-1 glass rounded-2xl p-5.5 border border-card-border/60 space-y-4 flex flex-col justify-between text-left">
          <div>
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span>Research Activity</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-card-border/80 bg-page-bg/15 flex items-center gap-3">
                <FileText className="w-7 h-7 text-primary shrink-0" />
                <div>
                  <span className="text-[8.5px] font-bold text-text-muted uppercase">Academic Papers</span>
                  <p className="text-sm font-extrabold text-text-main mt-0.5">{data.research.totalPapers} published</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-card-border/80 bg-page-bg/15 flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-secondary shrink-0" />
                <div>
                  <span className="text-[8.5px] font-bold text-text-muted uppercase">Prototypes</span>
                  <p className="text-sm font-extrabold text-text-main mt-0.5">{data.research.innovationProjects} active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl border border-card-border bg-page-bg/40 text-[10px] font-bold text-text-muted justify-center border-t border-card-border/50">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>MCC Certified Dashboard</span>
          </div>
        </div>

      </div>

    </div>
  );
}
