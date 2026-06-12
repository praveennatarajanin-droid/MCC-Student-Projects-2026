'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Library, Edit3, CheckCircle2, AlertCircle, Loader2, Save, X, ShieldAlert } from 'lucide-react';

interface InstitutionDetails {
  id: string;
  name: string;
  code: string;
  address: string;
  contactEmail: string;
}

export default function InstitutionManagement() {
  const { user, loading: authLoading } = useAuth();
  const [details, setDetails] = useState<InstitutionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InstitutionDetails>({ id: '', name: '', code: '', address: '', contactEmail: '' });
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDetails = async () => {
    try {
      const res = await api.get('/api/Admin/institution');
      setDetails(res.data);
      setForm(res.data);
    } catch (err) {
      console.error('Failed to load institution details', err);
      setStatusMsg({ type: 'error', text: 'Error connecting to database to load institution.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchDetails();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.put('/api/Admin/institution', form);
      setDetails(res.data);
      setIsEditing(false);
      setStatusMsg({ type: 'success', text: 'Institution settings updated successfully.' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to update institution settings.' });
    } finally {
      setSaving(false);
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
      <div>
        <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
          <Library className="w-8 h-8 text-primary" />
          <span>Institution Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Review and update MCC institutional credentials, address details, and contact registers.
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

      <div className="glass rounded-[32px] p-6 sm:p-8 shadow-sm max-w-2xl">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Institution Name *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Institution Code *</label>
                <input
                  type="text" required
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Address Location</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Contact Email *</label>
                <input
                  type="email" required
                  value={form.contactEmail}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                  className="block w-full px-3.5 py-2.5 rounded-xl border border-card-border/80 bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit" disabled={saving}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Settings</span>
              </button>
              <button
                type="button"
                onClick={() => { setForm(details!); setIsEditing(false); }}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl border border-card-border hover:bg-page-bg/30 text-xs font-bold text-text-muted transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Official Name</span>
                <span className="text-sm font-bold text-text-main block mt-1.5">{details?.name}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Code Identifiers</span>
                <span className="text-xs font-bold bg-page-bg/50 border border-card-border px-2.5 py-0.5 rounded-md text-text-muted uppercase mt-1.5 inline-block">
                  {details?.code}
                </span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Physical Address</span>
                <span className="text-xs font-medium text-text-main block mt-1.5 leading-relaxed">{details?.address}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Contact Registry</span>
                <span className="text-xs font-semibold text-primary block mt-1.5">{details?.contactEmail}</span>
              </div>
            </div>

            <div className="border-t border-card-border/40 pt-5">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modify Credentials</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
