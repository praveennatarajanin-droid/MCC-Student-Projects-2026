'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ClientOnly from '@/components/ClientOnly';
import {
  ShieldCheck, LayoutDashboard, Users, Bell, Check,
  LogOut, Loader2, ChevronDown,
  Building2, Library, Key, Palette, Megaphone, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const MccCrestLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <img src="/mcc-logo.png" alt="MCC Logo" className={`${className} object-contain`} />
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!token) router.push('/login');
      else if (user && user.role !== 'SuperAdmin' && user.role !== 'Admin') router.push('/student');
    }
  }, [loading, token, user, router]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/StudentProfile/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error('Failed to load admin notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.post(`/api/StudentProfile/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-page-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'SuperAdmin' && user.role !== 'Admin') return null;

  const navLinks = [
    { href: '/admin',               label: 'Analytics',    icon: LayoutDashboard },
    { href: '/admin/students',      label: 'Students',     icon: Users            },
    { href: '/admin/approvals',     label: 'Approvals',    icon: ShieldCheck      },
    { href: '/admin/affairs',       label: 'Affairs',      icon: Megaphone        },
    { href: '/admin/alumni',        label: 'Alumni',       icon: GraduationCap,   restricted: true },
    { href: '/admin/departments',   label: 'Departments',  icon: Building2,        restricted: true },
    { href: '/admin/institution',   label: 'Institution',  icon: Library,          restricted: true },
    { href: '/admin/roles',         label: 'Roles',        icon: Key,              restricted: true },
    { href: '/admin/themes',        label: 'Themes',       icon: Palette          },
    { href: '/admin/notifications', label: 'Alerts',       icon: Bell             },
  ].filter(link => !link.restricted || user.role === 'SuperAdmin');

  const content = (
    <div className="min-h-screen bg-page-bg text-text-main flex flex-col relative pb-28">

      {/* ── Header ── */}
      <header className="w-full h-20 glass border-b border-card-border/60 sticky top-0 z-40 flex items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <MccCrestLogo className="h-12 w-auto invert dark:invert-0 transition-all duration-300" />
          <div className="h-6 w-[1.5px] bg-card-border/80 self-center hidden sm:block" />
          <div className="flex-col hidden sm:flex">
            <span className="text-sm font-black tracking-tight text-text-main leading-none block">Admin Console</span>
            <span className="text-[10px] text-text-muted font-extrabold tracking-widest uppercase mt-0.5">Academic Management Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 relative">
          {/* Bell */}
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileDropdown(false); }}
            className="relative p-1.5 rounded-xl border border-card-border/50 hover:bg-primary/5 text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-card-border/50 hover:bg-primary/5 text-text-muted hover:text-text-main transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black uppercase">
                {user.name.slice(0, 2)}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl p-2.5 shadow-xl border border-card-border/60 z-50 text-xs"
                >
                  <div className="px-2.5 py-2 border-b border-card-border/60 mb-1">
                    <span className="font-extrabold text-sm text-text-main block leading-tight truncate">{user.name}</span>
                    <span className="text-[11px] text-text-muted mt-0.5 block truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => { setShowProfileDropdown(false); logout(); }}
                    className="flex items-center justify-between w-full py-2 px-2.5 rounded-xl text-red-500 hover:bg-red-500/5 transition-all font-semibold cursor-pointer border-t border-card-border/40 pt-2"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Notification popover */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="absolute top-22 right-4 left-4 sm:left-auto sm:right-6 w-auto sm:w-80 glass rounded-3xl shadow-xl z-50 p-4 border border-card-border/60 flex flex-col gap-3 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-card-border pb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{unreadCount} New</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6 italic">Your inbox is clear.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.isRead ? 'border-card-border opacity-60' : 'border-primary/20 bg-primary/5'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-text-main leading-snug">{n.title}</h5>
                      {!n.isRead && (
                        <button onClick={() => handleMarkRead(n.id)} className="p-1 rounded-md hover:bg-primary/10 text-primary cursor-pointer">
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto h-full">{children}</div>
      </main>

      {/* ── Bottom Tab Bar ── */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print w-[calc(100%-2rem)] max-w-3xl px-2">
        <nav 
          ref={navRef}
          className="glass border border-card-border/60 rounded-2xl shadow-2xl px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth whitespace-nowrap"
        >
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                data-active={isActive ? "true" : "false"}
                className={`
                  relative flex items-center justify-center gap-1.5 py-2 px-3.5 sm:px-4 rounded-xl
                  transition-all duration-300 shrink-0 select-none
                  ${isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-main'}
                `}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.span
                    layoutId="admin-tab-active"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  />
                )}

                <Icon className="relative z-10 w-4 h-4 flex-shrink-0" />
                <span className="relative z-10 font-bold text-[11px] leading-none">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );

  return (
    <ClientOnly fallback={<div suppressHydrationWarning className="min-h-screen bg-page-bg flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      {content}
    </ClientOnly>
  );
}
