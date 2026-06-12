'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle, 
  Eye, MessageSquare, Send, Loader2, RefreshCw, Edit3, Award
} from 'lucide-react';
import Link from 'next/link';

interface PendingApproval {
  id: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  departmentName: string;
  usernameSlug: string;
  status: string;
  comments: string;
  submittedAt: string;
}

interface PendingCertification {
  id: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  departmentName: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
  credentialId: string;
  fileUrl: string;
  status: string;
}

export default function ApprovalsQueue() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [certifications, setCertifications] = useState<PendingCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolios' | 'certificates'>('portfolios');
  
  // Review form states
  const [commentsMap, setCommentsMap] = useState<Record<string, string>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApprovals = async () => {
    try {
      const [portfolioRes, certRes] = await Promise.all([
        api.get('/api/Admin/approvals'),
        api.get('/api/Admin/certifications')
      ]);
      setApprovals(portfolioRes.data);
      setCertifications(certRes.data);
    } catch (err) {
      console.error('Failed to load pending approvals', err);
      setStatusMsg({ type: 'error', text: 'Error fetching review queue from database.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApprovals();
  };

  const handleReview = async (id: string, action: 'Approved' | 'Rejected') => {
    const comments = commentsMap[id] || (action === 'Approved' ? 'Looks good, approved!' : 'Needs updates.');
    setSubmittingId(id);
    setStatusMsg(null);

    try {
      await api.post(`/api/Admin/approvals/${id}/review`, {
        status: action,
        comments
      });
      setStatusMsg({ 
        type: 'success', 
        text: `Portfolio of ${approvals.find(a => a.id === id)?.studentName} has been successfully ${action === 'Approved' ? 'approved' : 'returned for changes'}.` 
      });
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to complete review request.' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCertReview = async (id: string, action: 'verified' | 'failed') => {
    const comments = commentsMap[id] || (action === 'verified' ? 'Credentials verified successfully.' : 'Verification failed.');
    setSubmittingId(id);
    setStatusMsg(null);

    try {
      await api.post(`/api/Admin/certifications/${id}/review`, {
        status: action,
        comments
      });
      setStatusMsg({ 
        type: 'success', 
        text: `Certification of ${certifications.find(c => c.id === id)?.studentName} has been successfully ${action === 'verified' ? 'verified' : 'failed'}.` 
      });
      setCertifications(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Failed to complete certification review request.' });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCommentChange = (id: string, text: string) => {
    setCommentsMap(prev => ({ ...prev, [id]: text }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-text-main tracking-tight">
            Approvals &amp; Audits
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Review student portfolio live-requests and verify academic or professional industry certifications.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-card-border bg-page-bg/30 text-xs font-semibold hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
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

      {/* Tabs */}
      <div className="flex border-b border-card-border/60 pb-1">
        <button
          onClick={() => setActiveTab('portfolios')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'portfolios'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <span>Portfolio Reviews</span>
          {approvals.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
              {approvals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'certificates'
              ? 'border-primary text-primary font-black'
              : 'border-transparent text-text-muted hover:text-text-main'
          }`}
        >
          <span>Certificate Verifications</span>
          {certifications.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500">
              {certifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Main List */}
      {activeTab === 'portfolios' ? (
        approvals.length === 0 ? (
          <div className="glass rounded-[32px] p-16 text-center max-w-lg mx-auto flex flex-col items-center gap-4.5">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-text-main">Queue Fully Cleared!</h3>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                There are no pending portfolio reviews. All submitted student portfolios have been audited.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {approvals.map((req) => (
              <div 
                key={req.id} 
                className="glass rounded-[28px] p-6.5 shadow-sm border border-card-border flex flex-col lg:flex-row items-stretch gap-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-secondary" />

                {/* Student info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded-md">
                      {req.departmentName}
                    </span>
                    <h3 className="text-lg font-bold text-text-main mt-3 leading-none">
                      {req.studentName}
                    </h3>
                    <p className="text-xs text-text-muted mt-1.5">{req.studentEmail}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-page-bg/15 border border-card-border text-xs leading-relaxed space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-text-muted">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Submission Context:</span>
                    </div>
                    <p className="italic">"{req.comments || 'No submission notes provided.'}"</p>
                    <p className="text-[10px] text-text-muted/80 mt-1 font-semibold">
                      Submitted: {new Date(req.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action column */}
                <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-card-border pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between gap-5 text-left">
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-text-muted flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-secondary" />
                      <span>Reviewer Feedback</span>
                    </label>
                    <textarea
                      rows={2.5}
                      placeholder="Provide audit suggestions or congratulatory notes..."
                      value={commentsMap[req.id] || ''}
                      onChange={(e) => handleCommentChange(req.id, e.target.value)}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/45"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <Link
                      href={`/student/${req.usernameSlug}`}
                      target="_blank"
                      className="flex items-center justify-center py-2.5 rounded-xl border border-card-border hover:bg-primary/5 text-primary text-xs font-bold transition-all"
                      title="Live Preview Portfolio"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </Link>

                    <Link
                      href={`/admin/students/${req.studentProfileId}`}
                      className="flex items-center justify-center py-2.5 rounded-xl border border-card-border hover:bg-secondary/5 text-secondary text-xs font-bold transition-all"
                      title="Edit Portfolio Content Directly"
                    >
                      <Edit3 className="w-4.5 h-4.5" />
                    </Link>

                    <button
                      onClick={() => handleReview(req.id, 'Rejected')}
                      disabled={submittingId !== null}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Return</span>
                    </button>

                    <button
                      onClick={() => handleReview(req.id, 'Approved')}
                      disabled={submittingId !== null}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )
      ) : (
        certifications.length === 0 ? (
          <div className="glass rounded-[32px] p-16 text-center max-w-lg mx-auto flex flex-col items-center gap-4.5">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <div>
              <h3 className="text-lg font-bold text-text-main">No Certificates Pending!</h3>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                There are no pending certificate verification requests in the queue.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {certifications.map((cert) => (
              <div 
                key={cert.id} 
                className="glass rounded-[28px] p-6.5 shadow-sm border border-card-border flex flex-col lg:flex-row items-stretch gap-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400" />

                {/* Certificate & Student Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-500/5 px-2.5 py-1 rounded-md">
                        {cert.departmentName}
                      </span>
                      <h3 className="text-lg font-bold text-text-main mt-3 leading-none">
                        {cert.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-1.5">
                        Issued by <strong className="text-text-main">{cert.issuer}</strong>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-text-main">{cert.studentName}</p>
                      <p className="text-[11px] text-text-muted">{cert.studentEmail}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-page-bg/15 border border-card-border text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block font-mono">Credential ID</span>
                      <p className="font-semibold text-text-main mt-0.5 font-mono">{cert.credentialId || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block font-mono">Issue Date</span>
                      <p className="font-semibold text-text-main mt-0.5">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action column */}
                <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-card-border pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between gap-5 text-left">
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-text-muted flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-secondary" />
                      <span>Reviewer Feedback</span>
                    </label>
                    <textarea
                      rows={2.5}
                      placeholder="E.g. Check credential ID, or verification notes..."
                      value={commentsMap[cert.id] || ''}
                      onChange={(e) => handleCommentChange(cert.id, e.target.value)}
                      className="block w-full px-3 py-2 rounded-xl border border-card-border bg-page-bg/40 text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-primary/45"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        className="flex items-center justify-center py-2.5 rounded-xl border border-card-border hover:bg-primary/5 text-primary text-xs font-bold transition-all"
                        title="Verify Credential Node"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </a>
                    ) : cert.fileUrl ? (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        className="flex items-center justify-center py-2.5 rounded-xl border border-card-border hover:bg-primary/5 text-primary text-xs font-bold transition-all"
                        title="View PDF Document"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </a>
                    ) : (
                      <div 
                        className="flex items-center justify-center py-2.5 rounded-xl border border-card-border text-text-muted/40 text-xs transition-all cursor-not-allowed"
                        title="No Document Uploaded"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </div>
                    )}

                    <button
                      onClick={() => handleCertReview(cert.id, 'failed')}
                      disabled={submittingId !== null}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Fail</span>
                    </button>

                    <button
                      onClick={() => handleCertReview(cert.id, 'verified')}
                      disabled={submittingId !== null}
                      className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Verify</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
