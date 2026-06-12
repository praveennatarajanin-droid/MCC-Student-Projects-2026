"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, BarChart3, LogOut, Sun, Moon, Users, Lock, X, CheckCircle2, ShieldAlert, Loader2, Bell, GraduationCap, Building } from "lucide-react";
import { MccLogo } from "@/components/MccLogo";
import { apiRequest } from "@/utils/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("");
  const [userRole, setUserRole] = useState("");
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

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    if (!userId || (role !== "Admin" && role !== "Staff")) {
      router.push("/login");
      return;
    }

    setUserRole(role || "");
    setAdminName(localStorage.getItem("userName") || "MCC Staff");
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
  }, [router]);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!mounted) return null;

  const sidebarLinks = [
    { href: "/admin", label: userRole === "Staff" ? "Dept Approvals" : "Approvals Queue", icon: ShieldCheck },
    { href: "/admin/users", label: userRole === "Staff" ? "Dept Student Registry" : "Student Registry", icon: Users },
  ];

  if (userRole === "Admin") {
    sidebarLinks.push({ href: "/admin/roles", label: "Role Management", icon: Lock });
    sidebarLinks.push({ href: "/admin/institution", label: "Institution Management", icon: Building });
  }

  sidebarLinks.push({ href: "/admin/analytics", label: userRole === "Staff" ? "Dept Analytics" : "Institutional Analytics", icon: BarChart3 });
  sidebarLinks.push({ href: "/admin/alumni", label: userRole === "Staff" ? "Dept Alumni Tracking" : "Alumni Tracking", icon: GraduationCap });
  sidebarLinks.push({ href: "/admin/notifications", label: "Notifications", icon: Bell });

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
                MCC Registry
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                {userRole === "Staff" ? "Staff Panel" : "Administrative Panel"}
              </span>
            </div>
          </Link>

          {/* User Brief */}
          <div 
            className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800"
            style={{ backgroundColor: darkMode ? "rgba(30, 41, 59, 0.5)" : "#ffffff" }}
          >
            <p className="text-[10px] uppercase font-bold text-slate-400">Authenticated Staff</p>
            <p className="font-extrabold text-sm truncate text-mcc-crimson dark:text-mcc-gold">{adminName}</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              // Check if exact match or nested
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-mcc-crimson text-white dark:bg-mcc-gold dark:text-slate-900 shadow-md"
                      : "hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800/80 dark:hover:text-white text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-grow">{link.label}</span>
                  {link.label === "Notifications" && notifications.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white text-mcc-crimson dark:bg-slate-900 dark:text-mcc-gold" : "bg-red-500 text-white"
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
        <div className="flex flex-col gap-2">
          {/* Change Password */}
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            <Lock className="h-4 w-4 text-slate-500" /> Change Password
          </button>

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
              className="flex-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 md:h-full md:overflow-hidden">
        {/* Top bar for mobile */}
        <header className="glass-panel border-b px-6 py-4 flex items-center justify-between md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <MccLogo className="h-7 w-7 text-mcc-crimson dark:text-mcc-gold" />
            <span className="font-bold text-xs uppercase tracking-wider text-mcc-crimson dark:text-mcc-gold">
              {userRole === "Staff" ? "MCC Staff" : "MCC Admin"}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowChangePasswordModal(true)} className="p-2 text-slate-500 hover:text-mcc-crimson">
              <Lock className="h-4 w-4" />
            </button>
            <button onClick={toggleDarkMode} className="p-2">
              {darkMode ? <Sun className="h-4 w-4 text-mcc-gold" /> : <Moon className="h-4 w-4 text-mcc-crimson" />}
            </button>
            <button onClick={handleLogout} className="text-red-500 p-2">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile Sub Nav */}
        <nav className="flex md:hidden bg-slate-100 dark:bg-slate-900 border-b px-4 py-2 overflow-x-auto gap-2 shrink-0">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-mcc-crimson text-white dark:bg-mcc-gold dark:text-slate-900"
                    : "text-slate-500 dark:text-slate-350"
                }`}
              >
                {link.label}
                {link.label === "Notifications" && notifications.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    isActive ? "bg-white text-mcc-crimson dark:bg-slate-900 dark:text-mcc-gold" : "bg-red-500 text-white"
                  }`}>
                    {notifications.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dynamic Admin View */}
        <main className="flex-grow overflow-y-auto w-full">
          <div className="w-full p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md glass-panel border rounded-3xl p-6 shadow-2xl relative bg-background"
          >
            <button
              onClick={() => {
                setShowChangePasswordModal(false);
                setPasswordError("");
                setPasswordSuccess("");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h4 className="font-bold text-lg mb-1 flex items-center gap-2 text-foreground">
              <Lock className="h-5 w-5 text-mcc-crimson dark:text-mcc-gold" />
              Change Password
            </h4>
            <p className="text-xs text-slate-500 mb-6">
              Enter your current security password to change it to a new one.
            </p>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:border-mcc-crimson outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 text-xs font-bold rounded-lg btn-premium cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Changing...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
