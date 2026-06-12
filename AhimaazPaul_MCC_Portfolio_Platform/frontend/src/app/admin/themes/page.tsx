'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Palette, BarChart3, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ThemeStat {
  theme: string;
  count: number;
}

const THEME_DESCRIPTIONS = [
  { name: 'Apple-Minimal', desc: 'Sleek, minimalist design inspired by modern Apple product cards. Clean grid borders and generous spacing.' },
  { name: 'Academic', desc: 'Traditional dark maroon layout suited for research focus, classical fonts, and formal publications showcase.' },
  { name: 'Corporate', desc: 'Dark navy two-column layout: fixed sidebar with education & skills on the left, clean white resume content on the right.' },
  { name: 'Startup', desc: 'Gradient hero banner with glassmorphism bento-grid cards. Stats row, vibrant colors, and a tech-forward project showcase.' },
  { name: 'Creative', desc: 'Aesthetic, fluid grid designed for media students, highlighting photos, video frames, and Behance links.' },
  { name: 'AI-Futuristic', desc: 'Cyberpunk inspired glowing theme featuring neon green colors, monospace terminals, and robotic AI co-pilot widgets.' }
];

export default function ThemeManagement() {
  const [stats, setStats] = useState<ThemeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/Admin/themes');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load theme statistics', err);
      setErrorMsg('Failed to load theme statistics from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Pre-fill theme stats with 0 if not present in API results
  const chartData = THEME_DESCRIPTIONS.map(td => {
    const found = stats.find(s => s.theme.toLowerCase() === td.name.toLowerCase());
    return {
      name: td.name,
      count: found ? found.count : 0
    };
  });

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
            <Palette className="w-8 h-8 text-primary" />
            <span>Theme Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Analyze active theme usage across student directories and configure customization settings.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-card-border bg-page-bg/30 text-xs font-semibold hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Theme Data</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl flex items-center gap-2.5 border border-red-500/20 bg-red-500/10 text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Theme Deployment Chart */}
        <div className="lg:col-span-2 glass rounded-[32px] p-6 sm:p-7 border border-card-border/60 flex flex-col gap-4">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3">
            <BarChart3 className="w-4.5 h-4.5 text-primary" />
            <span>Active Student Theme Deployment</span>
          </h3>

          <div className="h-64 w-full pt-3 font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={9} fontWeight="bold" stroke="#86868b" />
                <YAxis fontSize={9} stroke="#86868b" allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Bar name="Deployments" dataKey="count" fill="#0066cc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Available Theme Catalog */}
        <div className="lg:col-span-1 glass rounded-[32px] p-6 border border-card-border/60 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider border-b border-card-border/60 pb-3">
            Theme Catalog Settings
          </h3>
          <div className="space-y-4">
            {THEME_DESCRIPTIONS.map(theme => {
              const countItem = chartData.find(d => d.name === theme.name);
              return (
                <div key={theme.name} className="p-3.5 rounded-xl border border-card-border/80 bg-page-bg/15 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-main">{theme.name}</span>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/15 px-2 py-0.5 rounded-md">
                      {countItem ? countItem.count : 0} active
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-1 leading-relaxed font-sans">{theme.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
