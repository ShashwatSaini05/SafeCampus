'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CheckCircle, Loader2, AlertCircle, MapPin, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Report } from '@/lib/store';

const TIMELINE_STEPS = [
  { key: 'Pending', label: 'Submitted', desc: 'Report received and logged' },
  { key: 'Under Review', label: 'Under Review', desc: 'Authorities are investigating' },
  { key: 'Resolved', label: 'Resolved', desc: 'Action taken & case closed' },
];

const STATUS_ORDER = ['Pending', 'Under Review', 'Resolved'];

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    const input = trackingId.trim();
    if (!input) { setError('Please enter a tracking ID'); return; }
    setError('');
    setLoading(true);
    setSearched(false);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .or(`tracking_id.eq.${input.toUpperCase()},id.eq.${input}`)
        .limit(1)
        .maybeSingle();

      if (error || !data) throw new Error('Report not found');
      
      setReport(data);
      setSearched(true);

      // Subscribe to Realtime updates
      supabase.channel(`tracking_${data.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports', filter: `id=eq.${data.id}` }, (payload) => {
          setReport(payload.new as any);
        })
        .subscribe();
        
    } catch {
      setError('Report not found. Double-check your tracking ID.');
      setReport(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = report ? STATUS_ORDER.indexOf(report.status || 'Pending') : -1;

  const categoryColors: Record<string, string> = {
    ragging: '#dc2626', harassment: '#4f46e5', safety: '#2563eb', other: '#7c3aed',
  };

  return (
    <div className="w-full pb-16 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-xl mx-auto pt-4 sm:pt-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 text-[11px] sm:text-xs font-semibold text-cyan-700"
            style={{ background: '#ecfeff', border: '1px solid #a5f3fc' }}
          >
            <Search className="w-3.5 h-3.5" /> Report Tracker
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2 sm:mb-3">Track Your Report</h1>
          <p className="text-slate-400 text-sm">Enter your unique tracking ID to check report status.</p>
        </motion.div>

        {/* Search — stacked on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card !p-4 sm:!p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => { setTrackingId(e.target.value.trim()); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="UUID Tracking ID"
              className="input-field font-mono text-center text-sm sm:text-base tracking-wider flex-1"
              maxLength={40}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="btn-primary !px-6 sm:!px-8 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Search className="w-4 h-4 sm:w-5 sm:h-5" /><span className="sm:hidden">Search</span></>
              }
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-xl flex items-start gap-2 text-sm text-red-600"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm">{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {report && searched && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Report card */}
              <div className="card mb-5 sm:mb-6"
                style={{ border: `1px solid ${categoryColors[report.category || 'other']}20` }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="font-black font-mono text-slate-800 text-xs sm:text-sm mb-1.5 break-all">{report.tracking_id || report.id}</div>
                    <span
                      className="badge capitalize text-xs"
                      style={{
                        background: `${categoryColors[report.category || 'other']}10`,
                        color: categoryColors[report.category || 'other'],
                        border: `1px solid ${categoryColors[report.category || 'other']}20`,
                      }}
                    >
                      {report.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:text-right">
                    <span className="text-xs text-slate-400">Priority:</span>
                    <span className={`badge badge-${(report.priority || 'low').toLowerCase()} text-xs`}>{report.priority}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">{report.description}</p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400 pt-3 sm:pt-4 border-t border-slate-100">
                  {report.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Anonymous
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="w-3 h-3" />
                    {new Date(report.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <h3 className="font-bold text-slate-700 mb-5 sm:mb-6 text-xs sm:text-sm tracking-wide">Progress Timeline</h3>
                <div className="space-y-0">
                  {TIMELINE_STEPS.map((s, i) => {
                    const isBefore = i < currentStepIdx;
                    const isCurrent = i === currentStepIdx;
                    const isAfter = i > currentStepIdx;

                    return (
                      <div key={s.key} className="flex gap-3 sm:gap-4 relative">
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div
                            className="absolute left-[14px] sm:left-[15px] top-8 w-0.5 h-full -mb-2"
                            style={{ background: isBefore ? '#4f46e5' : '#e2e8f0' }}
                          />
                        )}
                        <div
                          className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}
                          style={{
                            background: isBefore || isCurrent ? '#4f46e5' : '#f1f5f9',
                            border: isAfter ? '1px solid #e2e8f0' : 'none',
                          }}
                        >
                          {isBefore ? (
                            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          ) : isCurrent ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"
                            />
                          ) : (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300" />
                          )}
                        </div>

                        <div className="pb-6 sm:pb-8 min-w-0">
                          <div className={`font-semibold text-xs sm:text-sm leading-snug ${isCurrent ? 'text-slate-800' : isBefore ? 'text-slate-600' : 'text-slate-400'}`}>
                            {s.label}
                            {isCurrent && (
                              <span className="ml-2 text-[10px] sm:text-xs font-normal text-indigo-500 animate-pulse">● Current</span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] sm:text-xs mt-0.5">{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-center text-xs text-slate-400 mt-4">
            Demo IDs available after submitting at{' '}
            <span className="text-indigo-500">/report</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
