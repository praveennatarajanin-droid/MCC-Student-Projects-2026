'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/lib/api';
import { LogIn, UserPlus, GraduationCap, Lock, Mail, User, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const departmentsList = [
  'Computer Science', 'Physics', 'Chemistry', 'Mathematics',
  'Commerce', 'English', 'History', 'Economics', 'Psychology', 'Biotechnology',
  'Sociology', 'Fine Arts', 'Music', 'Physical Education'
];

function InputField({
  label, icon, type = 'text', value, onChange, placeholder, required = false,
}: {
  label: string; icon: React.ReactNode; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-theme-fg/65 block">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-theme-fg/35 pointer-events-none">{icon}</span>
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium"
        />
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (searchParams.get('register') === 'true') setIsRegister(true);
    else setIsRegister(false);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (isRegister) {
        await authApi.register({
          username: username.trim(),
          email: email.trim(),
          password,
          department,
        });
        setSuccess('Account created! You can now sign in.');
        setIsRegister(false);
        setPassword('');
      } else {
        const response = await authApi.login(username.trim(), password);
        router.push(response.user.role === 'Admin' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-10">
      {/* Background blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[450px] h-[450px] rounded-full bg-theme-primary/12 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full bg-theme-accent/12 blur-[130px] pointer-events-none" />

      {/* Theme toggle — top-right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Back to home */}
      <div className="absolute top-5 left-5 z-20">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-theme-fg/50 hover:text-theme-primary transition-colors px-3 py-2 rounded-xl hover:bg-theme-primary/5">
          ← Home
        </Link>
      </div>

      {/* Brand logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center gap-3 mb-8 z-10"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-lg shadow-theme-primary/20">
          <GraduationCap size={24} />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight block leading-tight">MADRAS CHRISTIAN COLLEGE</span>
          <span className="text-[10px] text-theme-fg/50 tracking-widest font-semibold uppercase">Portfolio Ecosystem</span>
        </div>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="w-full max-w-[420px] glass p-8 rounded-3xl z-10 shadow-2xl shadow-theme-primary/5 relative"
      >
        {/* Tab switcher */}
        <div className="flex rounded-2xl glass p-1 mb-7 gap-1">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister ? 'bg-theme-primary text-white shadow-md shadow-theme-primary/20' : 'text-theme-fg/60 hover:text-theme-fg'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister ? 'bg-theme-primary text-white shadow-md shadow-theme-primary/20' : 'text-theme-fg/60 hover:text-theme-fg'
            }`}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? 'register' : 'login'}
            initial={{ opacity: 0, x: isRegister ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegister ? -10 : 10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight">
                {isRegister ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-theme-fg/55 mt-1">
                {isRegister
                  ? 'Join the MCC academic showcase ecosystem'
                  : 'Sign in to manage your professional portfolio'}
              </p>
            </div>

            {/* Alert messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="login-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 p-3.5 mb-5 rounded-2xl bg-red-500/8 border border-red-500/20 text-red-500 text-xs font-semibold overflow-hidden"
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  key="login-success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 p-3.5 mb-5 rounded-2xl bg-green-500/8 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold overflow-hidden"
                >
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Username"
                icon={<User size={15} />}
                value={username}
                onChange={setUsername}
                placeholder="e.g. your name"
                required
              />

              {isRegister && (
                <InputField
                  label="Email Address"
                  icon={<Mail size={15} />}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@mcc.edu"
                  required
                />
              )}

              <InputField
                label="Password"
                icon={<Lock size={15} />}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
              />

              {isRegister && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-theme-fg/65 block">Academic Department</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-theme-fg/35 pointer-events-none"><BookOpen size={15} /></span>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium appearance-none cursor-pointer"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept} className="text-black">{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-bold shadow-lg shadow-theme-primary/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Processing…
                  </span>
                ) : isRegister ? (
                  <><UserPlus size={16} /><span>Create Account</span></>
                ) : (
                  <><LogIn size={16} /><span>Sign In</span></>
                )}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        {/* Secure note */}
        {!isRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 pt-5 border-t border-theme-border/40 text-center"
          >
            <p className="text-[10px] text-theme-fg/35 font-medium leading-relaxed">
              🔒 Your credentials are private and secured.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-theme-primary border-t-transparent animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
