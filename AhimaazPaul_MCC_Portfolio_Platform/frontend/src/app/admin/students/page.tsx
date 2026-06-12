'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  Users, Trash2, Eye, ShieldCheck, ShieldAlert, 
  Search, CheckCircle2, AlertCircle, Loader2, RefreshCw,
  Edit3
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface StudentItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  departmentName: string;
  usernameSlug: string;
  isApproved: boolean;
  skillsCount: number;
  theme: string;
}

export default function StudentDatabase() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/Admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load student database', err);
      setStatusMsg({ type: 'error', text: 'Error connecting to database to load students.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the student profile and account for "${name}"? This action is permanent and deletes all associated projects, publications, and files.`)) {
      return;
    }
    setStatusMsg(null);
    try {
      await api.delete(`/api/Admin/students/${userId}`);
      setStatusMsg({ type: 'success', text: `Student account for ${name} was permanently deleted.` });
      setStudents(prev => prev.filter(s => s.userId !== userId));
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to delete student account.' 
      });
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight">
            Student Database Directory
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Browse registered student profiles, verify portfolio themes, and manage user records.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-card-border bg-page-bg/30 text-xs font-semibold hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Messages */}
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

      {/* Directory Search & Listing */}
      <div className="glass rounded-[32px] p-6 sm:p-7 shadow-sm space-y-6">
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search students by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
        </div>

        {/* Database Grid Table */}
        {filteredStudents.length === 0 ? (
          <p className="text-xs text-text-muted italic py-10 text-center">No matching students found in directory.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-card-border/80 text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Skills Listed</th>
                  <th className="py-3 px-4">Selected Theme</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40 font-medium">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-text-main block">{student.name}</span>
                        <span className="text-[10px] text-text-muted">{student.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text-muted uppercase">{student.departmentName}</td>
                    <td className="py-3.5 px-4">
                      {student.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Approved & Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Draft / Pending Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-text-muted">{student.skillsCount} skills</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold bg-page-bg/40 border border-card-border px-2 py-0.5 rounded-md text-text-muted uppercase">
                        {student.theme}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/student/${student.usernameSlug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-primary/5 text-primary cursor-pointer"
                          title="Open student live portfolio"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="p-1.5 rounded-lg hover:bg-secondary/15 text-secondary cursor-pointer"
                          title="Edit student portfolio and records"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {user?.role === 'SuperAdmin' && (
                          <button
                            onClick={() => handleDelete(student.userId, student.name)}
                            className="p-1.5 rounded-lg hover:bg-red-500/5 text-red-500 cursor-pointer"
                            title="Permanently delete user profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
