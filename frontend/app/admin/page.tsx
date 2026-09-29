'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, BarChart3, List, Filter, RefreshCcw, Loader2, CheckCircle,
  Clock, AlertTriangle, TrendingUp, Users, Lock, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { Analytics, Report, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ALLOWED_ADMIN_EMAILS = ['saurabhkumarjha011@gmail.com', 'admin@example.com'];
const KPI_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#ef4444'];
const PIE_COLORS = { ragging: '#ef4444', harassment: '#6366f1', safety: '#3b82f6', other: '#8b5cf6' };

const SAMPLE_REPORTS: Report[] = [
  {
    id: 'sample_001',
    tracking_id: 'SC-2026-0001',
    category: 'ragging',
    description: 'A group of senior students forced freshers to do push-ups and sing songs in the hostel common room at night. Multiple first-year students were targeted and humiliated.',
    location: 'Boys Hostel Block A, Ground Floor Common Room',
    status: 'Under Review',
    priority: 'High',
    anonymous_id: 'anon_sample01',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'sample_002',
    tracking_id: 'SC-2026-0002',
    category: 'harassment',
    description: 'Repeated unwanted messages and following after class hours by a classmate. The person waits outside the lecture hall and makes uncomfortable comments despite being asked to stop.',
    location: 'Engineering Block, Near Lecture Hall 3',
    status: 'Pending',
    priority: 'High',
    anonymous_id: 'anon_sample02',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
  },
  {
    id: 'sample_003',
    tracking_id: 'SC-2026-0003',
    category: 'safety',
    description: 'Broken railing on the second floor staircase near the library. Several students have reported near-miss incidents. The railing has been loose for over a week with no repair.',
    location: 'Central Library, 2nd Floor Staircase',
    status: 'Resolved',
    priority: 'Medium',
    anonymous_id: 'anon_sample03',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'sample_004',
    tracking_id: 'SC-2026-0004',
    category: 'other',
    description: 'Suspected theft of laptops from the computer lab during lunch hours. Two students reported missing devices this week. Lab door lock appears to be tampered with.',
    location: 'Computer Science Lab 2, Block C',
    status: 'Pending',
    priority: 'Medium',
    anonymous_id: 'anon_sample04',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

export default function AdminPage() {
  const { email, isVerified, authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ category: 'all', status: 'all', priority: 'all' });
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = ALLOWED_ADMIN_EMAILS.includes(email?.toLowerCase() || '');

  const fetchReports = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    let remoteReports: Report[] = [];
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        remoteReports = data as Report[];
      }
    } catch (err: any) {
      // Ignore schema cache errors
    }

    // Merge: sample reports + locally stored + remote (remote wins on conflicts)
    const localCached: Report[] = JSON.parse(localStorage.getItem('safecampus_reports_cache') || '[]');
    const map = new Map<string, Report>();

    // Always include sample reports as base data
    SAMPLE_REPORTS.forEach(r => map.set(r.tracking_id || r.id, r));
    localCached.forEach(r => map.set(r.tracking_id || r.id, r));
    remoteReports.forEach(r => map.set(r.tracking_id || r.id, r));

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setReports(combined);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin, fetchReports]);

  const handleUpdateReport = async (id: string, field: 'status' | 'priority', value: string) => {
    setUpdating(id);
    try {
      const isLocal = id.startsWith('loc_');
      if (!isLocal) {
        await supabase
          .from('reports')
          .update({ [field]: value })
          .eq('id', id);
      }

      setReports(prev =>
        prev.map(r => {
          if (r.id === id) {
            const updated = { ...r, [field]: value };
            return updated;
          }
          return r;
        })
      );

      // Update local storage cache
      const localCached: Report[] = JSON.parse(localStorage.getItem('safecampus_reports_cache') || '[]');
      const updatedLocal = localCached.map(r => r.id === id ? { ...r, [field]: value } : r);
      localStorage.setItem('safecampus_reports_cache', JSON.stringify(updatedLocal));

      toast.success('Report updated successfully');
    } catch (err: any) {
      toast.error('Failed to update report');
    } finally {
      setUpdating(null);
    }
  };

  // Generate Analytics from reports
  const analytics: Analytics = useMemo(() => {
    const defaultAnalytics = {
      total: reports.length,
      byStatus: { Pending: 0, 'Under Review': 0, 'Resolved': 0 },
      byCategory: { ragging: 0, harassment: 0, safety: 0, other: 0 },
      byPriority: { High: 0, Medium: 0, Low: 0 },
      trend: [] as { date: string; count: number }[]
    };

    const dateMap: Record<string, number> = {};

    reports.forEach(r => {
      // By Status
      if (defaultAnalytics.byStatus[r.status as keyof typeof defaultAnalytics.byStatus] !== undefined) {
        defaultAnalytics.byStatus[r.status as keyof typeof defaultAnalytics.byStatus]++;
      }
      
      // By Category
      if (defaultAnalytics.byCategory[r.category as keyof typeof defaultAnalytics.byCategory] !== undefined) {
        defaultAnalytics.byCategory[r.category as keyof typeof defaultAnalytics.byCategory]++;
      } else {
        defaultAnalytics.byCategory.other++;
      }

      // By Priority
      if (defaultAnalytics.byPriority[r.priority as keyof typeof defaultAnalytics.byPriority] !== undefined) {
        defaultAnalytics.byPriority[r.priority as keyof typeof defaultAnalytics.byPriority]++;
      }

      // Time trend (last 7 days grouped)
      const d = new Date(r.created_at).toISOString().split('T')[0];
      dateMap[d] = (dateMap[d] || 0) + 1;
    });

    // Format trend
    defaultAnalytics.trend = Object.keys(dateMap)
      .sort()
      .slice(-7)
      .map(date => ({ date, count: dateMap[date] }));

    return defaultAnalytics;
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filter.category !== 'all' && r.category !== filter.category) return false;
      if (filter.status !== 'all' && r.status !== filter.status) return false;
      if (filter.priority !== 'all' && r.priority !== filter.priority) return false;
      return true;
    });
  }, [reports, filter]);

  const badgeClass = (status: string) => {
    if (status === 'Pending') return 'badge-pending';
    if (status === 'Under Review') return 'badge-review';
    return 'badge-resolved';
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;
  }

  // Authentication screen
  if (!isVerified) {
    return (
      <div className="min-h-screen pb-12 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md card !p-6 sm:!p-8 text-center" style={{ border: '1px solid rgba(124,58,237,0.25)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}>
            <Lock className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Admin Access</h1>
          <p className="text-slate-500 text-sm mb-8">You must be logged in as an administrator to access this area.</p>

          <Link href="/admin/login" className="btn-primary w-full justify-center">
            Secure Admin Login <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pb-12 px-4 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md card !p-6 sm:!p-8 text-center" style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-slate-500 text-sm mb-6">The account <strong className="text-red-400">{email}</strong> is not an administrator.</p>
          <Link href="/" className="btn-ghost w-full justify-center">
            Return to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Logged in as {email}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={fetchReports} disabled={loading}
              className="btn-ghost text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 !py-2 !px-3 sm:!px-4">
              <RefreshCcw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="flex border rounded-xl overflow-hidden flex-1 sm:flex-none" style={{ borderColor: 'rgba(42,42,74,0.8)', background: '#12122a' }}>
              {(['analytics', 'reports'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm capitalize transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  style={{ background: activeTab === tab ? 'rgba(124,58,237,0.2)' : 'transparent' }}>
                  {tab === 'analytics' ? <BarChart3 className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" /> : <List className="inline w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: 'Total Reports - 6', value: analytics.total, icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" />, color: KPI_COLORS[0] },
              { label: 'Pending', value: analytics.byStatus.Pending, icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />, color: '#f59e0b' },
              { label: 'Resolved', value: analytics.byStatus.Resolved, icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />, color: '#10b981' },
              { label: 'High Priority', value: analytics.byPriority.High, icon: <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />, color: '#ef4444' },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card !p-4 sm:!p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30`, color: kpi.color }}>
                    {kpi.icon}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">{kpi.value}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 leading-tight">{kpi.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && analytics && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
                {/* Trend */}
                <div className="lg:col-span-2 card !p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-400" /> 7-Day Report Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analytics.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.5)" />
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: '#7f7fffff', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#f1f5f9' }} />
                      <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* By Category Pie */}
                <div className="card !p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" /> By Category
                  </h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={Object.entries(analytics.byCategory).map(([k, v]) => ({ name: k, value: v }))}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                        {Object.keys(analytics.byCategory).map((cat, i) => (
                          <Cell key={i} fill={PIE_COLORS[cat as keyof typeof PIE_COLORS] || '#6366f1'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#5656a3ff', border: '1px solid rgba(176, 176, 232, 0.5)', borderRadius: '8px', color: '#f1f5f9', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-1.5">
                    {Object.entries(analytics.byCategory).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[cat as keyof typeof PIE_COLORS] || '#6366f1' }} />
                          <span className="text-slate-400 capitalize">{cat}</span>
                        </div>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By Status Bar */}
              <div className="card !p-6">
                <h3 className="font-bold text-white mb-4">Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={Object.entries(analytics.byStatus).map(([k, v]) => ({ name: k, count: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(142, 142, 231, 0.5)" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#3d3de5ff', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Filters */}
              <div className="card !p-4 mb-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <Filter className="w-4 h-4 text-slate-500" />
                  {[
                    { key: 'category', options: ['all', 'ragging', 'harassment', 'safety', 'other'] },
                    { key: 'status', options: ['all', 'Pending', 'Under Review', 'Resolved'] },
                    { key: 'priority', options: ['all', 'High', 'Medium', 'Low'] },
                  ].map(({ key, options }) => (
                    <select key={key}
                      value={filter[key as keyof typeof filter]}
                      onChange={(e) => setFilter(f => ({ ...f, [key]: e.target.value }))}
                      className="input-field !w-auto !py-2 text-sm cursor-pointer"
                      style={{ background: '#3e3eb3ff' }}>
                      {options.map(o => <option key={o} value={o}>{key === 'category' && o !== 'all' ? o.charAt(0).toUpperCase() + o.slice(1) : o}</option>)}
                    </select>
                  ))}
                  <button onClick={fetchReports} className="btn-primary !py-2 !px-4 text-sm ml-auto flex items-center gap-2">
                    <RefreshCcw className="w-3.5 h-3.5" /> Apply
                  </button>
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
              ) : (
                <div className="card !p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(42,42,74,0.8)', background: 'rgba(26,26,53,0.5)' }}>
                          {['ID', 'Category', 'Description', 'Location', 'Priority', 'Status', 'Date & Time', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReports.length === 0 ? (
                          <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-600">No reports found</td></tr>
                        ) : filteredReports.map((report, i) => (
                          <motion.tr key={report.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            style={{ borderBottom: '1px solid rgba(42,42,74,0.4)' }}
                            className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-violet-400 whitespace-nowrap">{report.tracking_id || report.id?.substring(0, 8) || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span className={`badge badge-${report.category} text-xs`}>{report.category}</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 max-w-[200px]">
                              <div className="truncate text-xs">{report.description}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs">{report.location || '—'}</td>
                            <td className="px-4 py-3">
                              <select value={report.priority}
                                onChange={(e) => handleUpdateReport(report.id, 'priority', e.target.value)}
                                disabled={updating === report.id}
                                className={`badge badge-${report.priority.toLowerCase()} bg-transparent border cursor-pointer text-xs`}
                                style={{ background: 'transparent' }}>
                                {['Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select value={report.status}
                                onChange={(e) => handleUpdateReport(report.id, 'status', e.target.value)}
                                disabled={updating === report.id}
                                className={`badge ${badgeClass(report.status)} bg-transparent border cursor-pointer text-xs`}
                                style={{ background: 'transparent' }}>
                                {['Pending', 'Under Review', 'Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap font-mono">
                              {new Date(report.created_at).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </td>
                            <td className="px-4 py-3">
                              {updating === report.id && <Loader2 className="w-4 h-4 animate-spin text-violet-400" />}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 border-t text-xs text-slate-600" style={{ borderColor: 'rgba(42,42,74,0.4)' }}>
                    {filteredReports.length} reports shown
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
