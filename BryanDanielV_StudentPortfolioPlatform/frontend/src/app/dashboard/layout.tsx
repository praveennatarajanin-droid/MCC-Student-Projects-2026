"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AmbientBackground from "@/components/AmbientBackground";

// ── Stagger animation variants ──────────────────────────────────
const sidebarVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const drawerVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 320, damping: 34 } },
  exit:   { x: "-100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" as const } },
};

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

// ── Role label formatter ────────────────────────────────────────
function formatRoleLabel(role: string): string {
  const map: Record<string, string> = {
    Admin: "Administrator",
    Student: "Student",
    PlacementCoordinator: "Placement Cell",
    ResearchCoordinator: "Research Cell",
    InnovationCoordinator: "Innovation Cell",
    StudentAffairsCoordinator: "Student Affairs",
    Faculty: "Faculty",
  };
  return map[role] || role;
}

// ── Role accent color ───────────────────────────────────────────
function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    Admin: "from-rose-500 to-rose-700",
    Student: "from-blue-500 to-blue-700",
    PlacementCoordinator: "from-emerald-500 to-emerald-700",
    ResearchCoordinator: "from-violet-500 to-violet-700",
    InnovationCoordinator: "from-amber-500 to-amber-700",
    StudentAffairsCoordinator: "from-cyan-500 to-cyan-700",
    Faculty: "from-indigo-500 to-indigo-700",
  };
  return map[role] || "from-mcc-maroon to-mcc-maroon-light";
}

// ── Nav icon helper ─────────────────────────────────────────────
function DashboardIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Close drawer on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // Close drawer on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileMenuOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileMenuOpen]);

  if (loading || !user) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
        <AmbientBackground variant="subtle" />
        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Spinning crest ring */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, hsl(45,65%,52%), hsl(348,83%,28%), hsl(45,65%,52%))",
                animation: "slow-spin 2s linear infinite",
              }}
            />
            <div className="absolute inset-[2px] rounded-full bg-background" />
            <div className="w-6 h-6 border-2 border-mcc-gold border-t-mcc-maroon rounded-full animate-spin relative z-10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
              Loading Ecosystem Session
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Madras Christian College • Digital Portfolio Platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getDashboardHref = () => {
    if (user?.role === "Admin") return "/dashboard/admin";
    if (["PlacementCoordinator", "ResearchCoordinator", "InnovationCoordinator", "StudentAffairsCoordinator"].includes(user?.role))
      return "/dashboard/coordinator";
    if (user?.role === "Faculty") return "/dashboard/faculty";
    return "/dashboard/student";
  };

  const roleColor = getRoleColor(user.role);
  const roleLabel = formatRoleLabel(user.role);
  const dashHref = getDashboardHref();
  const isActive = pathname === dashHref;

  // ── Sidebar inner content (shared between desktop + mobile) ──
  const SidebarContent = () => (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full gap-6"
    >
      {/* ── Logo & Brand ── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <Link href="/" className="block">
          <motion.img
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            src="/mcc_logo.png"
            alt="Madras Christian College"
            className="h-11 w-auto object-contain rounded-xl shadow-md border border-white/10 dark:border-white/5"
          />
        </Link>

        {/* Role badge */}
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-6 rounded-full bg-gradient-to-r ${roleColor}`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-mcc-gold">
            {roleLabel} Portal
          </span>
        </div>
      </motion.div>

      {/* ── User Card ── */}
      <motion.div
        variants={itemVariants}
        className="glass-card rounded-2xl p-4 flex items-center gap-3 group"
      >
        {/* Avatar with crest ring */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-mcc-gold/40 shadow-lg">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${roleColor} flex items-center justify-center font-bold text-white text-sm`}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          {/* Online status dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background animate-status-pulse" />
        </div>

        {/* Name & email */}
        <div className="overflow-hidden min-w-0">
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 block truncate">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
            {user.email}
          </span>
        </div>
      </motion.div>

      {/* ── Navigation ── */}
      <motion.nav variants={itemVariants} className="flex-1 flex flex-col gap-1.5">
        {/* Dashboard link */}
        <Link href={dashHref}>
          <motion.div
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              isActive
                ? "bg-gradient-to-r from-mcc-maroon/15 to-mcc-maroon/5 border-mcc-maroon/30 text-mcc-maroon dark:text-red-300 shadow-sm"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-mcc-gold/8 dark:hover:bg-mcc-gold/5 hover:text-slate-900 dark:hover:text-slate-100 hover:border-mcc-gold/20"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-mcc-maroon" />
            )}
            <DashboardIcon />
            <span>Dashboard Overview</span>
            {isActive && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-mcc-gold animate-pulse" />
            )}
          </motion.div>
        </Link>

        {/* Portfolio link (student only) */}
        {user.slug && (
          <motion.a
            href={`/portfolio/${user.slug}`}
            target="_blank"
            rel="noreferrer"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border border-dashed border-mcc-gold/30 text-mcc-gold hover:bg-mcc-gold/8 hover:border-mcc-gold/60 transition-all cursor-pointer mt-2 group relative"
          >
            <ExternalLinkIcon />
            <span>View Public Portfolio</span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </motion.a>
        )}
      </motion.nav>

      {/* ── Footer Controls ── */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2 mt-auto">
        {/* Theme switcher row */}
        <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
              Appearance
            </span>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Sign out */}
        <motion.button
          onClick={logout}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full text-left cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
        >
          <SignOutIcon />
          <span>Sign Out</span>
        </motion.button>

        {/* MCC Footer badge */}
        <div className="pt-2 pb-1 border-t border-slate-200/60 dark:border-slate-800/60">
          <p className="text-[9px] text-slate-400 dark:text-slate-600 text-center tracking-wide">
            © {new Date().getFullYear()} Madras Christian College
          </p>
          <p className="text-[9px] text-mcc-gold/60 text-center tracking-widest uppercase">
            Est. 1837
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col md:flex-row relative overflow-hidden">

      {/* ── Global ambient background (behind everything) ── */}
      <AmbientBackground variant="default" />

      {/* ════════════════════════════════════
          DESKTOP SIDEBAR
      ════════════════════════════════════ */}
      <aside className="hidden md:flex relative z-20 shrink-0">
        {/* Sidebar glow */}
        <div
          className="absolute inset-y-0 left-0 w-full"
          style={{
            background: "linear-gradient(180deg, hsl(var(--mcc-maroon)/0.04) 0%, transparent 40%, hsl(var(--mcc-gold)/0.03) 100%)",
          }}
        />

        {/* Gradient left accent line */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] z-10"
          style={{
            background: "linear-gradient(180deg, hsl(var(--mcc-maroon)/0.6) 0%, hsl(var(--mcc-gold)/0.4) 50%, hsl(var(--mcc-maroon)/0.2) 100%)",
          }}
        />

        {/* Glass sidebar surface */}
        <div className="glass-sidebar w-64 min-h-screen p-6 relative flex flex-col">
          <SidebarContent />
        </div>
      </aside>

      {/* ════════════════════════════════════
          MOBILE HEADER
      ════════════════════════════════════ */}
      <header className="md:hidden relative z-30 shrink-0">
        <div className="h-16 glass-sidebar border-b border-mcc-gold/10 px-4 flex items-center justify-between">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="block">
              <img
                src="/mcc_logo.png"
                alt="Madras Christian College"
                className="h-8 w-auto object-contain rounded-lg"
              />
            </Link>
            <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="font-bold text-[10px] tracking-[0.15em] text-mcc-gold uppercase">
                MCC Ecosystem
              </span>
            </div>
          </div>

          {/* Right: theme + hamburger */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.92 }}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-0.5 rounded-full bg-slate-700 dark:bg-slate-300 block"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
                className="w-5 h-0.5 rounded-full bg-slate-700 dark:bg-slate-300 block"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-5 h-0.5 rounded-full bg-slate-700 dark:bg-slate-300 block"
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════
          MOBILE DRAWER + OVERLAY
      ════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Slide-in drawer */}
            <motion.div
              key="drawer"
              ref={drawerRef}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 bottom-0 z-50 w-72 md:hidden flex flex-col"
              style={{ background: "var(--sidebar-bg)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", borderRight: "1px solid var(--sidebar-border)" }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-mcc-gold/10">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/mcc_logo.png" alt="MCC" className="h-9 w-auto object-contain rounded-lg" />
                </Link>
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Drawer content */}
              <div className="flex-1 overflow-y-auto p-5">
                <SidebarContent />
              </div>

              {/* Ambient glow inside drawer */}
              <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 100%, var(--orb-secondary), transparent)" }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════
          MAIN CONTENT AREA
      ════════════════════════════════════ */}
      <main className="flex-1 min-w-0 relative z-10 min-h-screen md:min-h-0 flex flex-col">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
