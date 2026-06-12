"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface Notification {
  id: string;
  message: string;
  type: string; // "Info", "Success", "Warning", "Error"
  isRead: boolean;
  createdAt: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("unread");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await apiRequest("/api/profile/notifications?all=true");
      setNotifications(list || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to retrieve your notifications inbox.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiRequest(`/api/profile/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      // Dispatch event to update layout badge count
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map(n => apiRequest(`/api/profile/notifications/${n.id}/read`, { method: "POST" }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getIcon = (type: string) => {
    const iconStyle = { color: 'rgb(212, 175, 55)', filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.7))' };
    switch (type) {
      case "Success":
        return <span className="shrink-0" style={iconStyle}><CheckCircle2 className="h-5 w-5" /></span>;
      case "Warning":
        return <span className="shrink-0" style={iconStyle}><AlertTriangle className="h-5 w-5" /></span>;
      case "Error":
        return <span className="shrink-0" style={iconStyle}><XCircle className="h-5 w-5" /></span>;
      default:
        return <span className="shrink-0" style={iconStyle}><Info className="h-5 w-5" /></span>;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Success":
        return "border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400";
      case "Warning":
        return "border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-400";
      case "Error":
        return "border-red-500/20 bg-red-500/5 text-red-800 dark:text-red-400";
      default:
        return "border-blue-500/20 bg-blue-500/5 text-blue-800 dark:text-blue-400";
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Inbox</h2>
          <p className="text-slate-450 dark:text-slate-300 text-sm">
            Review notifications, directives, administrative warnings, or alerts dispatched to you.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-mcc-crimson dark:text-mcc-gold hover:underline cursor-pointer"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl border border-slate-350 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab("unread")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "unread"
              ? "border-mcc-crimson text-mcc-crimson dark:border-mcc-gold dark:text-mcc-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Unread Alerts ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-mcc-crimson text-mcc-crimson dark:border-mcc-gold dark:text-mcc-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Loader2 className="h-8 w-8 text-mcc-crimson dark:text-mcc-gold animate-spin" />
          <p className="text-slate-500 text-sm">Loading notifications feed...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-slate-500 border border-dashed rounded-3xl glass-panel">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-bold text-base">Error Loading Notifications</h3>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
          <button onClick={fetchNotifications} className="mt-4 px-4 py-2 text-xs font-bold btn-premium rounded-xl cursor-pointer">
            Retry
          </button>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed rounded-3xl glass-panel flex flex-col items-center justify-center">
          <div className="p-4 bg-amber-50 dark:bg-slate-900 rounded-full w-fit mb-4 shadow-[0_0_12px_2px_rgba(212,175,55,0.2)] dark:shadow-none">
            <Bell className="h-8 w-8 dark:text-slate-400" style={{ color: 'rgb(212, 175, 55)', filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.5))' }} />
          </div>
          <h3 className="font-bold text-base">Your Inbox is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === "unread"
              ? "You do not have any unread notifications or system warnings."
              : "You have not received any notifications or alerts in your registry account."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all hover:translate-x-1 duration-200 relative overflow-hidden ${
                notif.isRead
                  ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  : `border-slate-250 dark:border-slate-800/80 shadow-md ${getTypeStyle(notif.type)}`
              }`}
            >
              {/* Type Accent Strip */}
              {!notif.isRead && (
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                    notif.type === "Success"
                      ? "bg-emerald-500"
                      : notif.type === "Warning"
                      ? "bg-amber-500"
                      : notif.type === "Error"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                />
              )}

              {getIcon(notif.type)}

              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    {notif.type} Alert
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed break-words">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-350 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-350 transition-colors shrink-0 cursor-pointer self-center"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
