'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import ClientOnly from '@/components/ClientOnly';
import { GraduationCap, ArrowRight, User, Mail, Lock, Link as LinkIcon, Loader2, AlertCircle, ChevronDown, Eye, EyeOff, BookOpen, Shield, Hash, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Department { id: string; name: string; code: string; }

type AccountRole = 'Student' | 'Admin';

const MccCrestLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <img src="/mcc-logo.png" alt="MCC Logo" className={`${className} object-contain`} />
);

export default function RegisterPage() {
  const { register, login } = useAuth();
  const [role, setRole] = useState<AccountRole>('Student');
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameSlug, setUsernameSlug] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    api.get('/api/auth/departments')
      .then(r => { setDepartments(r.data); if (r.data.length > 0) setDepartmentId(r.data[0].id); })
      .catch(() => setError('Could not load departments. Please refresh.'))
      .finally(() => setLoadingDepts(false));
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPendingApproval && email && password) {
      intervalId = setInterval(async () => {
        try {
          await login(email, password);
        } catch (err) {
          console.log('Admin account is still pending approval, retrying in 3 seconds...');
        }
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPendingApproval, email, password, login]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (role === 'Student') {
      setUsernameSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20));
    }
  };

  const handleRoleSwitch = (newRole: AccountRole) => {
    setRole(newRole);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (role === 'Student' && !departmentId) {
      setError('Please select a department.');
      setLoading(false);
      return;
    }
    try {
      const res = await register(name, email, password, departmentId, usernameSlug, registrationNumber, role);
      if (res && res.requiresApproval) {
        setIsPendingApproval(true);
      }
    } catch (err: any) {
      setError(err || 'Registration failed. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = role === 'Student';

  const content = (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Brand Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between gap-8 w-[46%] shrink-0 py-10 px-12 relative sticky top-0 h-screen overflow-y-auto hide-scrollbar"
        style={{ background: 'linear-gradient(145deg, #C8102E 0%, #8B0A1E 60%, #5C0612 100%)' }}
      >
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
              Join the MCC<br />Academic Legacy.
            </h1>
            <p className="text-white/70 text-xs mt-3 leading-relaxed max-w-sm">
              {isStudent
                ? 'Create your official student portfolio to document your academic journey, scientific research, and extracurricular achievements at Madras Christian College.'
                : 'Access the administrative portal to manage departments, authenticate student records, and generate institutional performance reports.'}
            </p>
          </div>

          <div className="space-y-2.5">
            {(isStudent
              ? [
                  'Official digital portfolio page with verified MCC branding',
                  'Dedicated URL linking your professional & academic profile',
                  'Submit projects & publications for department approval',
                  'Direct network mapping to recruiters & distinguished alumni'
                ]
              : [
                  'Authenticate and approve student portfolio submissions',
                  'Oversee and manage departmental curriculum & profiles',
                  'Generate student research & placement analytics dashboards',
                  'Configure institutional systems, settings & NAAC reporting'
                ]
            ).map((t, i) => (
              <motion.div 
                key={t} 
                initial={{ opacity: 0, x: -16 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-3 text-white/90"
              >
                <div className="w-5.5 h-5.5 rounded bg-white/10 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-white/85 text-xs font-semibold leading-normal">{t}</span>
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

        {isStudent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }} 
            className="relative z-10 flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-300 shrink-0 shadow-inner">
              <BookOpen className="w-4 h-4" />
            </div>
            <p className="text-white/80 text-xs leading-normal">
              <span className="text-white/50 font-extrabold block text-[9px] uppercase tracking-widest mb-0.5 leading-none">Your Public Handle</span>
              mccportfolio.edu/student/<span className="text-yellow-300 font-bold underline underline-offset-2 leading-none">{usernameSlug || 'yourname'}</span>
            </p>
          </motion.div>
        )}
        {!isStudent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }} 
            className="relative z-10 flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-400/10 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-white/80 text-xs leading-normal">
              <span className="text-white/50 font-extrabold block text-[9px] uppercase tracking-widest mb-0.5 leading-none">Verification Required</span>
              <span className="text-white/90 font-medium leading-normal">Admin accounts must be manually authorized by the college administrative team.</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-page-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.04] blur-3xl"
          style={{ background: 'radial-gradient(circle, #C8102E, transparent)' }} />

        {isPendingApproval ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-6 relative z-10 text-center glass p-8 rounded-3xl border border-card-border"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-600 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text-main tracking-tight">Registration Submitted</h2>
              <p className="text-amber-600 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full inline-block">
                Pending Approval
              </p>
            </div>

            <p className="text-text-muted text-sm leading-relaxed">
              Your administrator registration request has been successfully submitted and is in the waiting stage.
              <br />
              <br />
              A Super Admin will review your account. Once approved, you will be able to log in successfully.
            </p>

            <div className="pt-4 flex flex-col gap-3">
              <Link href="/login" className="btn-primary py-3 text-sm flex items-center justify-center gap-2">
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="text-xs font-bold text-text-muted hover:text-text-main transition-colors">
                Back to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md space-y-6 relative z-10"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-2">
              <MccCrestLogo className="h-11 w-auto invert dark:invert-0 transition-all duration-300" />
              <div className="h-5 w-[1.5px] bg-card-border/80 self-center" />
              <span className="font-black text-sm text-text-main leading-none">Portfolios</span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-text-main tracking-tight">Create your account</h2>
              <p className="text-text-muted text-sm mt-1">Start your official digital presence at MCC</p>
            </div>

            {/* ── Role Switcher ── */}
            <div className="flex gap-1 p-1 rounded-xl bg-page-bg border border-card-border">
              {(['Student', 'Admin'] as AccountRole[]).map((r) => (
                <motion.button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === r
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {r === 'Student' ? <GraduationCap className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                  {r === 'Student' ? 'Student' : 'Administrator'}
                </motion.button>
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                  <input type="text" required placeholder="Franklin Raj"
                    value={name} onChange={handleNameChange} className="input-field pl-10" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                  <input type="email" required placeholder={isStudent ? "franklin@mcc.edu.in" : "admin@mcc.edu.in"}
                    value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Min. 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text-muted cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Student-only fields */}
              <AnimatePresence>
                {isStudent && (
                  <motion.div
                    key="student-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden space-y-4"
                  >
                    {/* Registration Number */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Registration Number</label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                        <input type="text" placeholder="E.g. 21BCS001"
                          value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value.toUpperCase())}
                          className="input-field pl-10" />
                      </div>
                    </div>

                    {/* Slug + Department */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Portfolio URL</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                          <input type="text" required={isStudent} placeholder="franklinraj"
                            value={usernameSlug}
                            onChange={e => setUsernameSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                            className="input-field pl-10 text-xs" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Department</label>
                        {loadingDepts ? (
                          <div className="input-field flex items-center justify-center">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted/50" />
                          </div>
                        ) : (
                          <div className="relative">
                            <select value={departmentId} onChange={e => setDepartmentId(e.target.value)}
                              className="input-field appearance-none cursor-pointer text-xs pr-7">
                              {departments.filter(d => ["COM", "CHEM", "HIST", "POL", "ECO", "PHIL", "TAM", "ENG", "MATH", "STAT", "PHYS", "PB", "ZOO"].includes(d.code)).length > 0 && (
                                <optgroup label="Aided Stream" className="bg-page-bg font-bold text-primary">
                                  {departments
                                    .filter(d => ["COM", "CHEM", "HIST", "POL", "ECO", "PHIL", "TAM", "ENG", "MATH", "STAT", "PHYS", "PB", "ZOO"].includes(d.code))
                                    .map(d => (
                                      <option key={d.id} value={d.id} className="bg-page-bg text-text-main font-normal">{d.name}</option>
                                    ))
                                  }
                                </optgroup>
                              )}
                              {departments.filter(d => !["COM", "CHEM", "HIST", "POL", "ECO", "PHIL", "TAM", "ENG", "MATH", "STAT", "PHYS", "PB", "ZOO"].includes(d.code)).length > 0 && (
                                <optgroup label="Self-Financed Stream (SFS)" className="bg-page-bg font-bold text-secondary-hover">
                                  {departments
                                    .filter(d => !["COM", "CHEM", "HIST", "POL", "ECO", "PHIL", "TAM", "ENG", "MATH", "STAT", "PHYS", "PB", "ZOO"].includes(d.code))
                                    .map(d => (
                                      <option key={d.id} value={d.id} className="bg-page-bg text-text-main font-normal">{d.name}</option>
                                    ))
                                  }
                                </optgroup>
                              )}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </div>

                    {usernameSlug && (
                      <p className="text-[10px] text-text-muted bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                        🔗 Portfolio URL: <span className="font-bold text-primary">/student/{usernameSlug}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button type="submit" disabled={loading || (isStudent && loadingDepts)} whileTap={{ scale: 0.97 }}
                className="btn-primary w-full py-3 text-sm mt-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating Account...</span></>
                  : <><span>{isStudent ? 'Create Student Account' : 'Create Admin Account'}</span><ArrowRight className="w-4 h-4" /></>}
              </motion.button>
            </form>

            <p className="text-center text-xs text-text-muted">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">Sign In here</Link>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );

  return <ClientOnly fallback={<div suppressHydrationWarning className="min-h-screen bg-page-bg flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>{content}</ClientOnly>;
}
