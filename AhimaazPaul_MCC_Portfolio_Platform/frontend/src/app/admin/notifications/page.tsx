'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Bell, Send, Users, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface StudentListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  departmentName: string;
}

export default function NotificationManagement() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  
  // Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const [targetUserId, setTargetUserId] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [targetMsg, setTargetMsg] = useState('');
  const [sendingTarget, setSendingTarget] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/Admin/students');
      setStudents(res.data);
      if (res.data.length > 0) {
        setTargetUserId(res.data[0].userId);
      }
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBroadcast(true);
    setStatusMsg(null);
    try {
      const res = await api.post('/api/Admin/notifications/broadcast', {
        title: broadcastTitle,
        message: broadcastMsg
      });
      setStatusMsg({ type: 'success', text: res.data.message || 'Notification broadcast sent successfully.' });
      setBroadcastTitle('');
      setBroadcastMsg('');
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to send broadcast notification.' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleTargetNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;
    setSendingTarget(true);
    setStatusMsg(null);
    try {
      const res = await api.post(`/api/Admin/notifications/user/${targetUserId}`, {
        title: targetTitle,
        message: targetMsg
      });
      setStatusMsg({ type: 'success', text: res.data.message || 'Targeted notification sent successfully.' });
      setTargetTitle('');
      setTargetMsg('');
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to send targeted notification.' });
    } finally {
      setSendingTarget(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div>
        <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
          <Bell className="w-8 h-8 text-primary" />
          <span>Notification Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Compose system messages and dispatch notifications to student consoles.
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-start gap-2.5 border animate-fade-in ${
          statusMsg.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-600' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs sm:text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Panel 1: Broadcast Notification */}
        <div className="glass rounded-[32px] p-6 sm:p-7 border border-card-border/60 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3 mb-5">
              <Users className="w-4.5 h-4.5 text-primary" />
              <span>Broadcast Notice (To All Users)</span>
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Broadcast Title *</label>
                <input
                  type="text" required
                  placeholder="e.g. Placement Registration Deadline extended"
                  value={broadcastTitle}
                  onChange={e => setBroadcastTitle(e.target.value)}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Notification Content *</label>
                <textarea
                  required rows={4}
                  placeholder="Write the institutional alert message details..."
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit" disabled={sendingBroadcast}
                  className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {sendingBroadcast ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Dispatch Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel 2: Targeted Student Notification */}
        <div className="glass rounded-[32px] p-6 sm:p-7 border border-card-border/60 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-card-border/60 pb-3 mb-5">
              <Bell className="w-4.5 h-4.5 text-primary" />
              <span>Targeted Alert (To Specific Student)</span>
            </h3>

            {loadingStudents ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : students.length === 0 ? (
              <p className="text-xs text-text-muted italic py-12 text-center">No students registered in database.</p>
            ) : (
              <form onSubmit={handleTargetNotify} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Student *</label>
                  <select
                    value={targetUserId}
                    onChange={e => setTargetUserId(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  >
                    {students.map(student => (
                      <option key={student.userId} value={student.userId}>
                        {student.name} ({student.departmentName}) - {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Alert Title *</label>
                  <input
                    type="text" required
                    placeholder="e.g. Certificate verification missing"
                    value={targetTitle}
                    onChange={e => setTargetTitle(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Notification Content *</label>
                  <textarea
                    required rows={4}
                    placeholder="Write instructions or feedback details for the student..."
                    value={targetMsg}
                    onChange={e => setTargetMsg(e.target.value)}
                    className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit" disabled={sendingTarget}
                    className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {sendingTarget ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch Alert</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
