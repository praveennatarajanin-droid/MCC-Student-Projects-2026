'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';
import { GraduationCap, ArrowRight, ShieldCheck, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Trees, FlaskConical, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const MccCrestLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <img src="/mcc-logo.png" alt="MCC Logo" className={`${className} object-contain`} />
);



export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleSetDemo = (role: 'student' | 'admin') => {
    if (role === 'student') { setEmail('student@mcc.edu'); setPassword('student'); }
    else { setEmail('admin@mcc.edu'); setPassword('admin'); }
  };

  const features = [
    { icon: <Trees className="w-4.5 h-4.5 text-emerald-300" />, text: '365-Acre Scrub Jungle Campus' },
    { icon: <GraduationCap className="w-4.5 h-4.5 text-amber-300" />, text: '185+ Years of Academic Excellence' },
    { icon: <FlaskConical className="w-4.5 h-4.5 text-sky-300" />, text: '34 Departments & Research Labs' },
    { icon: <Award className="w-4.5 h-4.5 text-yellow-300" />, text: 'Top 15 Ranked National Institution' },
  ];

  const content = (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Brand Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between gap-8 w-[46%] shrink-0 py-10 px-12 relative sticky top-0 h-screen overflow-y-auto hide-scrollbar"
        style={{ background: 'linear-gradient(145deg, #C8102E 0%, #8B0A1E 60%, #5C0612 100%)' }}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative z-10 flex items-center gap-3.5 shrink-0">
          <MccCrestLogo className="h-14 w-auto transition-all duration-300" />
          <div className="h-7 w-[1.5px] bg-white/25 self-center" />
          <span className="text-sm font-black tracking-tight text-white leading-none">
            Portfolios
          </span>
        </motion.div>

        {/* Hero copy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10 space-y-5 shrink-0">
          <div>
            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
              Transforming Lives<br />Through Education.
            </h1>
            <p className="text-white/70 text-xs mt-3 leading-relaxed max-w-sm">
              Welcome to the Madras Christian College Digital Portfolio portal. Build your academic legacy, document your achievements, and connect with global opportunities.
            </p>
          </div>

          <div className="space-y-2.5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-300"
              >
                <div className="w-7.5 h-7.5 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
                  {f.icon}
                </div>
                <span className="text-white/95 text-xs font-semibold tracking-wide leading-none">{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* College Vision Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }} 
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/15 rounded-2xl p-4 relative overflow-hidden shadow-md"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.01] rounded-full blur-xl pointer-events-none" />
            <p className="text-white/95 text-xs leading-relaxed font-medium tracking-wide">
              &ldquo;Madras Christian College aspires to be an Institution of excellence transforming lives through education with a commitment to service.&rdquo;
            </p>
            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">College Vision</span>
              </div>
              <span className="text-yellow-300 font-extrabold text-[8px] tracking-widest uppercase bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                In Hoc Signo
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom stat strip */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }} 
          className="relative z-10 flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4.5 shrink-0"
        >
          {[
            ['1837', 'Founded'],
            ['8,500+', 'Students'],
            ['34', 'Depts'],
            ['NAAC A', 'Grade']
          ].map(([num, label], index, arr) => (
            <React.Fragment key={num}>
              <div className="text-center flex-1">
                <p className="text-white font-black text-base md:text-lg tracking-tight leading-none">{num}</p>
                <p className="text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1.5 leading-none">{label}</p>
              </div>
              {index < arr.length - 1 && (
                <div className="h-8 w-[1.5px] bg-white/10 self-center" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-page-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.04] blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8102E, transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm space-y-7 relative z-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <MccCrestLogo className="h-11 w-auto invert dark:invert-0 transition-all duration-300" />
            <div className="h-5 w-[1.5px] bg-card-border/80 self-center" />
            <span className="font-black text-sm text-text-main leading-none">Portfolios</span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-black text-text-main tracking-tight">Welcome back</h2>
            <p className="text-text-muted text-sm mt-1">Sign in to your portfolio workspace</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                <input
                  type="email" required placeholder="name@mcc.edu"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                <input
                  type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text-muted cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          {/* Demo logins */}
          <div className="pt-2 border-t border-card-border">
            <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-wider text-center mb-3">Quick Access</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => handleSetDemo('student')}
                className="btn-secondary py-2.5 text-[11px] flex items-center gap-1.5 justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>Student Demo</span>
              </button>
              <button onClick={() => handleSetDemo('admin')}
                className="btn-secondary py-2.5 text-[11px] flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline">Register here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );

  return <ClientOnly fallback={<div suppressHydrationWarning className="min-h-screen bg-page-bg flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>{content}</ClientOnly>;
}
