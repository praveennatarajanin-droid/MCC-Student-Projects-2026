"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Loader2, RefreshCw, Send, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/utils/api";

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const DEPARTMENTS = [
  "Computer Science",
  "Physics",
  "Chemistry",
  "Mathematics",
  "English",
  "Commerce"
];

export default function AdminNotificationsPage() {
  // Auth state
  const [userRole, setUserRole] = useState("");
  const [staffDept, setStaffDept] = useState("");

  // Recipients and received notifications
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [receivedNotifs, setReceivedNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientsLoading, setRecipientsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Form states
  const [target, setTarget] = useState("students"); // "all", "students", "staff", "user", "department"
  const [targetUserId, setTargetUserId] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [type, setType] = useState("Info");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // UI States
  const [sendLoading, setSendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"send" | "received">("send");

  const fetchRecipients = async () => {
    setRecipientsLoading(true);
    try {
      // Get targetable users
      const list = await apiRequest("/api/admin/notifications/recipients");
      setRecipients(list || []);

      // Also get own department if staff
      const myProfile = await apiRequest("/api/profile");
      if (myProfile) {
        setStaffDept(myProfile.department || "");
        if (localStorage.getItem("userRole") === "Staff" && !myProfile.isSuperAdmin) {
          // Preset target department to own department for normal staff
          setTargetDepartment(myProfile.department || "");
        }
      }
    } catch (err) {
      console.error("Failed to load recipients", err);
    } finally {
      setRecipientsLoading(false);
    }
  };

  const fetchReceivedNotifications = async () => {
    setHistoryLoading(true);
    try {
      const list = await apiRequest("/api/profile/notifications?all=true");
      setReceivedNotifs(list || []);
    } catch (err) {
      console.error("Failed to load received notifications", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);

    // Fetch details
    fetchRecipients();
    fetchReceivedNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/api/profile/notifications/${id}/read`, { method: "POST" });
      setReceivedNotifs(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      // Dispatch update to sidebar badge count
      window.dispatchEvent(new Event("profileUpdate"));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!message.trim()) {
      setErrorMsg("Please enter a notification message.");
      return;
    }

    if (target === "user" && !targetUserId) {
      setErrorMsg("Please select a specific recipient user.");
      return;
    }

    if (target === "department" && !targetDepartment) {
      setErrorMsg("Please select a target department.");
      return;
    }

    setSendLoading(true);

    try {
      const payload = {
        target,
        targetUserId: target === "user" ? targetUserId : null,
        targetDepartment: target === "department" ? targetDepartment : null,
        message: message.trim(),
        type
      };

      const res = await apiRequest("/api/admin/notifications/send", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setSuccessMsg(res.message || "Notification successfully dispatched.");
      setMessage("");
      setTargetUserId("");
      setSearchQuery("");
      
      // Refresh own received notifications in case they notify themselves
      fetchReceivedNotifications();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch notification.");
    } finally {
      setSendLoading(false);
    }
  };

  // Filter recipients based on search query
  const filteredRecipients = recipients.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const unreadReceivedCount = receivedNotifs.filter(n => !n.isRead).length;
  const isSuperAdmin = userRole === "Admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Notification Center</h2>
        <p className="text-slate-450 dark:text-slate-300 text-sm">
          Dispatch global alerts, warning notices, or department instructions. You can also view alerts sent to you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab("send")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "send"
              ? "border-mcc-crimson text-mcc-crimson dark:border-mcc-gold dark:text-mcc-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Dispatch Alerts
        </button>
        <button
          onClick={() => setActiveTab("received")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "received"
              ? "border-mcc-crimson text-mcc-crimson dark:border-mcc-gold dark:text-mcc-gold"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          My Inbox ({unreadReceivedCount})
        </button>
      </div>

      {activeTab === "send" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dispatch Form (2/3 width) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border space-y-6">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Send className="h-5 w-5" /> Send New Notification
            </h3>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-800 dark:text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-5">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Audience</label>
                <select
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value);
                    setTargetUserId("");
                    setSearchQuery("");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none focus:ring-1 focus:ring-mcc-crimson dark:focus:ring-mcc-gold text-sm"
                >
                  {isSuperAdmin && <option value="all">All Registered Users (Students &amp; Staff)</option>}
                  <option value="students">{isSuperAdmin ? "All Students" : "All Department Students"}</option>
                  {isSuperAdmin && <option value="staff">All Staff Members</option>}
                  <option value="department">Specific Department</option>
                  <option value="user">Specific Individual User (Student / Staff)</option>
                </select>
              </div>

              {/* Specific Department Selection */}
              {target === "department" && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Department</label>
                  <select
                    value={targetDepartment}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none focus:ring-1 focus:ring-mcc-crimson dark:focus:ring-mcc-gold text-sm disabled:opacity-60"
                  >
                    <option value="">-- Choose Department --</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Note: As department staff, you can only alert the {staffDept} department.
                    </span>
                  )}
                </div>
              )}

              {/* Specific Individual User Selection */}
              {target === "user" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target User</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search recipient by name, email, or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none"
                    />
                  </div>

                  {recipientsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 text-mcc-crimson dark:text-mcc-gold animate-spin" />
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar-y">
                      {filteredRecipients.length === 0 ? (
                        <p className="p-3 text-center text-xs text-slate-500 italic">No matching users found.</p>
                      ) : (
                        filteredRecipients.map(r => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setTargetUserId(r.id);
                              setSearchQuery(r.name);
                            }}
                            className={`p-2.5 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                              targetUserId === r.id
                                ? "bg-mcc-crimson/10 dark:bg-mcc-gold/10 font-bold"
                                : "hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                            }`}
                          >
                            <div>
                              <p className="font-semibold">{r.name}</p>
                              <p className="text-[10px] text-slate-450">{r.email}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-medium mr-1.5 uppercase">
                                {r.role}
                              </span>
                              <span className="text-[10px] text-slate-400">{r.department}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {targetUserId && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Selected Recipient ID: {targetUserId}
                    </div>
                  )}
                </div>
              )}

              {/* Notification Severity Type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alert Level / Severity</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Information", val: "Info", color: "border-blue-500 text-blue-600 bg-blue-50/20" },
                    { label: "Warning", val: "Warning", color: "border-amber-500 text-amber-600 bg-amber-50/20" },
                    { label: "Critical Error", val: "Error", color: "border-red-500 text-red-600 bg-red-50/20" },
                    { label: "Success Info", val: "Success", color: "border-emerald-500 text-emerald-600 bg-emerald-50/20" }
                  ].map(btn => (
                    <button
                      key={btn.val}
                      type="button"
                      onClick={() => setType(btn.val)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        type === btn.val
                          ? `${btn.color} ring-2 ring-offset-2 ring-slate-100 dark:ring-slate-900`
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
                      }`}
                    >
                      {btn.val === "Success" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {btn.val === "Warning" && <AlertTriangle className="h-3.5 w-3.5" />}
                      {btn.val === "Error" && <XCircle className="h-3.5 w-3.5" />}
                      {btn.val === "Info" && <Info className="h-3.5 w-3.5" />}
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Warning / Alert Message</label>
                <textarea
                  placeholder="Enter the notification narrative or policy warning details to display on the recipient's dashboard..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-background focus:outline-none focus:ring-1 focus:ring-mcc-crimson dark:focus:ring-mcc-gold text-sm"
                />
              </div>

              {/* Dispatch Action */}
              <button
                type="submit"
                disabled={sendLoading}
                className="w-full py-3 rounded-xl btn-premium text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
              >
                {sendLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Dispatched Warning Queue...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Warning Notification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick FAQ / Guidelines (1/3 width) */}
          <div className="glass-panel p-6 rounded-3xl border space-y-4 h-fit">
            <h4 className="font-extrabold text-sm flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Sparkles className="h-5 w-5" /> Guidelines &amp; Scope
            </h4>
            <div className="text-xs space-y-3.5 text-slate-500 leading-relaxed">
              <p>
                <strong>Recipient Rules:</strong>
                <br />
                As department staff, your authority is restricted to students registered under your specific department. Broadcasting is limited.
              </p>
              <p>
                <strong>System Indicators:</strong>
                <br />
                The alert type determines the badge color and icon on the recipient&apos;s UI:
                <span className="block mt-1 font-semibold text-emerald-500">• Success (Green): Achievements, approvals</span>
                <span className="block mt-1 font-semibold text-blue-500">• Information (Blue): Schedules, events</span>
                <span className="block mt-1 font-semibold text-amber-500">• Warning (Orange): Missing items, pending edits</span>
                <span className="block mt-1 font-semibold text-red-500">• Critical Error (Red): Block notices, profile audits</span>
              </p>
              <p>
                <strong>Immediate Display:</strong>
                <br />
                Dispatched alerts are immediately displayable upon the student&apos;s next dashboard load or route transition.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Received Notifications Inbox */
        <div className="glass-panel p-6 rounded-3xl border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-mcc-crimson dark:text-mcc-gold">
              <Bell className="h-5 w-5" /> My Inbox Alerts
            </h3>
            <button
              onClick={fetchReceivedNotifications}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="h-6 w-6 text-mcc-crimson dark:text-mcc-gold animate-spin" />
              <p className="text-xs text-slate-500">Checking alert feed...</p>
            </div>
          ) : receivedNotifs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 italic">
              No received notifications or warnings on your account.
            </div>
          ) : (
            <div className="space-y-3.5">
              {receivedNotifs.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all relative overflow-hidden ${
                    notif.isRead
                      ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-850 text-slate-500"
                      : `border-slate-250 dark:border-slate-800 ${getTypeStyle(notif.type)}`
                  }`}
                >
                  {!notif.isRead && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[3px] ${
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
                    <div className="flex justify-between items-center gap-4 mb-0.5">
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {notif.type} Warning
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-medium break-words leading-relaxed">{notif.message}</p>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-350 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[9px] font-bold text-slate-500 dark:text-slate-300 cursor-pointer shrink-0 align-self-center"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
