'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Key, ShieldCheck, ShieldAlert, Loader2, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'Admin' | 'PendingAdmin' | 'SuperAdmin' | string;
  createdAt: string;
}

export default function RoleManagement() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/Admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users list', err);
      setStatusMsg({ type: 'error', text: 'Error connecting to database to load users.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchUsers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleRoleToggle = async (userId: string, currentRole: string, email: string, name: string) => {
    if (email === 'admin@mcc.edu') {
      setStatusMsg({ type: 'error', text: 'Cannot modify privileges of the primary administrator.' });
      return;
    }
    const targetRole = currentRole === 'Admin' ? 'Student' : 'Admin';
    if (!confirm(`Are you sure you want to change "${name}"'s system role to "${targetRole}"?`)) {
      return;
    }

    setUpdatingId(userId);
    setStatusMsg(null);
    try {
      await api.put(`/api/Admin/users/${userId}/role`, { role: targetRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole } : u));
      setStatusMsg({ type: 'success', text: `User role for ${name} updated to ${targetRole}.` });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update user role.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveAdmin = async (userId: string, name: string) => {
    setUpdatingId(userId);
    setStatusMsg(null);
    try {
      await api.put(`/api/Admin/users/${userId}/role`, { role: 'Admin' });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'Admin' } : u));
      setStatusMsg({ type: 'success', text: `Admin account for ${name} has been approved.` });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to approve admin.' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-600 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-text-main tracking-tight">Access Denied</h2>
        <p className="text-text-muted text-sm mt-2 max-w-sm leading-relaxed">
          You do not have the required permissions to access this page. This module is restricted to the Super Administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
            <Key className="w-8 h-8 text-primary" />
            <span>Role Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Audit user accounts, check registration timestamps, and elevate credentials levels.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-card-border bg-page-bg/30 text-xs font-semibold hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
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

      <div className="glass rounded-[32px] p-6 sm:p-7 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-card-border/80 text-text-muted font-bold uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role Credentials</th>
                <th className="py-3 px-4">Joined At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-text-main block">{u.name}</span>
                      <span className="text-[10px] text-text-muted">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.role === 'SuperAdmin' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Super Admin</span>
                      </span>
                    ) : u.role === 'Admin' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </span>
                    ) : u.role === 'PendingAdmin' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Admin</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-text-muted bg-page-bg/40 px-2.5 py-0.5 rounded-full border border-card-border">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Student Account</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-text-muted">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role === 'SuperAdmin' ? (
                      <span className="text-[10px] text-text-muted italic">System Owner</span>
                    ) : u.role === 'PendingAdmin' ? (
                      <button
                        onClick={() => handleApproveAdmin(u.id, u.name)}
                        disabled={updatingId !== null}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 text-[10px] font-bold hover:bg-amber-500 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                      >
                        {updatingId === u.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Approve Admin</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleToggle(u.id, u.role, u.email, u.name)}
                        disabled={updatingId !== null || u.email === 'admin@mcc.edu'}
                        className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                          u.role === 'Admin'
                            ? 'border-card-border bg-page-bg/30 text-text-muted hover:bg-primary/5 hover:text-primary'
                            : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white'
                        }`}
                      >
                        {updatingId === u.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>{u.role === 'Admin' ? 'Demote to Student' : 'Promote to Admin'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
