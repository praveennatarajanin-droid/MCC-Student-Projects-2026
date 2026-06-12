"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, BookOpen, Award, Layers, Eye, LogOut, Sun, Moon, AlertCircle, CheckCircle, Microscope, Bell, X } from "lucide-react";
import { MccLogo } from "@/components/MccLogo";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/utils/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [username, setUsername] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const list = await apiRequest("/api/profile/notifications");
      setNotifications(list || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await apiRequest(`/api/profile/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev => prev.filter(n => n.id !== id));

      // Update local storage and UI status immediately on dismissal
      const profileData = await apiRequest("/api/profile");
      if (profileData) {
        localStorage.setItem("isApproved", String(profileData.isApproved));
        setIsApproved(profileData.isApproved);
      }

      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");
    if (!userId) {
      router.push("/login");
      return;
    }
    if (role === "Admin" || role === "Staff") {
      router.push("/admin");
      return;
    }

    const loadData = () => {
      setUserName(localStorage.getItem("userName") || "Student");
      setUsername(localStorage.getItem("username") || "");
      setIsApproved(localStorage.getItem("isApproved") === "true");
    };

    loadData();
    fetchNotifications();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }

    window.addEventListener("profileUpdate", loadData);
    return () => {
      window.removeEventListener("profileUpdate", loadData);
    };
  }, [router]);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    const theme = localStorage.getItem("theme");
    localStorage.clear();
    if (theme) {
      localStorage.setItem("theme", theme);
    }
    router.push("/login");
  };

  if (!mounted) return null;

  const sidebarLinks = [
    { href: "/dashboard/profile", label: "Profile & Story", icon: User },
    { href: "/dashboard/academics", label: "Academic Records", icon: BookOpen },
    { href: "/dashboard/activities", label: "NGO & Activities", icon: Award },
    { href: "/dashboard/projects", label: "Projects & Media", icon: Layers },
    { href: "/dashboard/research", label: "Research & Innovation", icon: Microscope },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="flex min-h-screen md:h-screen md:overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r hidden md:flex flex-col justify-between p-6 shrink-0 overflow-y-auto">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <MccLogo className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold block">
                MCC Portfolio
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                Student Terminal
              </span>
            </div>
          </Link>

          {/* User Brief */}
          <div 
            className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800"
            style={{ backgroundColor: darkMode ? "rgba(30, 41, 59, 0.5)" : "#ffffff" }}
          >
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500">Welcome,</p>
            <p className="font-extrabold text-sm truncate text-mcc-crimson dark:text-mcc-gold">{userName}</p>

            {/* Approval Badge */}
            <div className="mt-2.5 flex items-center gap-1.5">
              {isApproved ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-transparent px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" /> Live Profile
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-transparent px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3" /> Under Review
                </span>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === "/dashboard/profile" && pathname === "/dashboard");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-mcc-crimson text-white dark:bg-mcc-gold dark:text-slate-900 shadow-md"
                    : "hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800/80 dark:hover:text-white text-slate-600 dark:text-slate-300"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-grow">{link.label}</span>
                  {link.label === "Notifications" && notifications.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-white text-mcc-crimson dark:bg-slate-900 dark:text-mcc-gold" : "bg-red-500 text-white"
                      }`}>
                      {notifications.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-3">
          {/* Public Link */}
          {username && (
            <a
              href={`/student/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all cursor-pointer"
            >
              <Eye className="h-4 w-4" /> View Public Site
            </a>
          )}

          <div className="flex gap-2">
            {/* Dark mode switch */}
            <button
              onClick={toggleDarkMode}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {darkMode ? <Sun className="h-4 w-4 text-mcc-gold" /> : <Moon className="h-4 w-4 text-mcc-crimson" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 md:h-full md:overflow-hidden">
        {/* Top bar (for mobile screens and warnings) */}
        <header className="glass-panel border-b px-6 py-4 flex items-center justify-between md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <MccLogo className="h-7 w-7 text-mcc-crimson dark:text-mcc-gold" />
            <span className="font-bold text-xs uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold">
              MCC Portfolio
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2">
              {darkMode ? <Sun className="h-4 w-4 text-mcc-gold" /> : <Moon className="h-4 w-4 text-mcc-crimson" />}
            </button>
            <button onClick={handleLogout} className="text-red-500 p-2">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Warning Banner if not approved */}
        {!isApproved && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs shrink-0">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              <strong>Institutional Status: Pending Review.</strong> Your public profile url (
              <span className="underline select-all">/student/{username}</span>) is only accessible to you and MCC administrators. It will become publicly live once reviewed and approved by staff.
            </p>
          </div>
        )}

        {/* Responsive mobile nav */}
        <nav className="flex md:hidden bg-slate-100 dark:bg-slate-900 border-b px-4 py-2 overflow-x-auto gap-2 shrink-0">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 ${isActive
                  ? "bg-mcc-crimson text-white dark:bg-mcc-gold dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-300"
                  }`}
              >
                {link.label}
                {link.label === "Notifications" && notifications.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive ? "bg-white text-mcc-crimson dark:bg-slate-900 dark:text-mcc-gold" : "bg-red-500 text-white"
                    }`}>
                    {notifications.length}
                  </span>
                )}
              </Link>
            );
          })}
          {username && (
            <a
              href={`/student/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-slate-200 dark:bg-slate-800 shrink-0 text-slate-700 dark:text-slate-200"
            >
              Preview Public Link
            </a>
          )}
        </nav>

        {/* Dynamic child content */}
        <main className="flex-grow overflow-y-auto w-full">
          <div className="w-full p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications Floating Pane */}
      <div className="fixed top-5 right-5 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md pointer-events-auto flex items-start gap-3.5 relative overflow-hidden ${notif.type === "Success"
                ? "bg-[#10b981]/10 border-[#10b981]/25 text-[#065f46] dark:text-[#a7f3d0]"
                : "bg-[#f59e0b]/10 border-[#f59e0b]/25 text-[#78350f] dark:text-[#fde68a]"
                }`}
            >
              {/* Colored ambient glow */}
              <div className={`absolute top-0 left-0 w-full h-[3px] ${notif.type === "Success" ? "bg-[#10b981]" : "bg-[#f59e0b]"
                }`} />

              <div className="shrink-0 mt-0.5">
                {notif.type === "Success" ? (
                  <CheckCircle className="h-5 w-5 dark:text-[#10b981]" style={{ color: !darkMode ? 'rgb(212, 175, 55)' : undefined, filter: !darkMode ? 'drop-shadow(0 0 3px rgba(212,175,55,0.5))' : undefined }} />
                ) : (
                  <AlertCircle className="h-5 w-5 dark:text-[#f59e0b]" style={{ color: !darkMode ? 'rgb(212, 175, 55)' : undefined, filter: !darkMode ? 'drop-shadow(0 0 3px rgba(212,175,55,0.5))' : undefined }} />
                )}
              </div>

              <div className="flex-grow pr-5">
                <p className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5 flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 dark:text-slate-400" style={{ color: !darkMode ? 'rgb(212, 175, 55)' : undefined, filter: !darkMode ? 'drop-shadow(0 0 2px rgba(212,175,55,0.4))' : undefined }} />
                  Portfolio Alert
                </p>
                <p className="text-xs font-semibold leading-relaxed">{notif.message}</p>
              </div>

              <button
                onClick={() => handleDismissNotification(notif.id)}
                className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-200/20 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
