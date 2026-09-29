'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore, Report } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, Calendar, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
  ragging: '#dc2626', harassment: '#4f46e5', safety: '#2563eb', other: '#7c3aed',
};

const SAMPLE_REPORTS: Report[] = [
  {
    id: 'sample_001',
    tracking_id: 'SC-2026-0001',
    category: 'ragging',
    description: 'A group of senior students forced freshers to do push-ups and sing songs in the hostel common room at night. Multiple first-year students were targeted and humiliated.',
    location: 'Boys Hostel Block A, Ground Floor Common Room',
    status: 'Under Review',
    priority: 'High',
    anonymous_id: 'sample_user',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample_002',
    tracking_id: 'SC-2026-0002',
    category: 'harassment',
    description: 'Repeated unwanted messages and following after class hours by a classmate. The person waits outside the lecture hall and makes uncomfortable comments despite being asked to stop.',
    location: 'Engineering Block, Near Lecture Hall 3',
    status: 'Pending',
    priority: 'High',
    anonymous_id: 'sample_user',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample_003',
    tracking_id: 'SC-2026-0003',
    category: 'safety',
    description: 'Broken railing on the second floor staircase near the library. Several students have reported near-miss incidents. The railing has been loose for over a week with no repair.',
    location: 'Central Library, 2nd Floor Staircase',
    status: 'Resolved',
    priority: 'Medium',
    anonymous_id: 'sample_user',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample_004',
    tracking_id: 'SC-2026-0004',
    category: 'other',
    description: 'Suspected theft of laptops from the computer lab during lunch hours. Two students reported missing devices this week. Lab door lock appears to be tampered with.',
    location: 'Computer Science Lab 2, Block C',
    status: 'Pending',
    priority: 'Medium',
    anonymous_id: 'sample_user',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DashboardPage() {
  const { isVerified, anonymousId, email, authLoading } = useAuthStore();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isVerified || !anonymousId) {
      router.push('/auth');
      return;
    }

    const fetchReports = async () => {
      setLoading(true);
      let remoteReports: Report[] = [];
      try {
        const { data } = await supabase
          .from('reports')
          .select('*')
          .eq('anonymous_id', anonymousId)
          .order('created_at', { ascending: false });
        
        if (data) remoteReports = data as Report[];
      } catch {
        // Supabase may be unreachable
      }

      // Always include sample reports so dashboard isn't empty
      const map = new Map<string, Report>();
      SAMPLE_REPORTS.forEach(r => map.set(r.id, r));
      remoteReports.forEach(r => map.set(r.id, r));

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setReports(combined);
      setLoading(false);
    };

    fetchReports();

    // Subscribe to realtime updates for this user's reports
    const channel = supabase.channel(`dashboard_${anonymousId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reports',
        filter: `anonymous_id=eq.${anonymousId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReports(prev => [payload.new as Report, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setReports(prev => prev.map(r => r.id === payload.new.id ? payload.new as Report : r));
        } else if (payload.eventType === 'DELETE') {
          setReports(prev => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isVerified, anonymousId, authLoading, router]);

  if (authLoading || (!isVerified && !authLoading)) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="w-full pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-4 sm:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">My Reports</h1>
            <p className="text-slate-400 text-sm mb-1">Realtime status of your anonymous submissions</p>
            {email && <p className="text-indigo-600 text-xs font-mono bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded inline-flex">Logged in as {email}</p>}
          </div>
          <Link href="/report" className="btn-primary text-sm !px-5 flex items-center gap-2">
            <Shield className="w-4 h-4" /> New Report
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : reports.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16 border-dashed">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-700 font-bold mb-2">No Reports Found</h3>
            <p className="text-slate-400 text-sm mb-6">You haven't submitted any reports yet.</p>
            <Link href="/report" className="btn-ghost inline-flex">Start a Report</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <AnimatePresence>
              {reports.map((report) => (
                <motion.div 
                  key={report.id} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="card flex flex-col hover:-translate-y-1 transition-transform relative group"
                  style={{ border: `1px solid ${CATEGORY_COLORS[report.category] || '#94a3b8'}20` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.06]" style={{ background: CATEGORY_COLORS[report.category] || '#94a3b8' }} />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className="badge capitalize text-[10px] mb-2" style={{ background: `${CATEGORY_COLORS[report.category] || '#94a3b8'}10`, color: CATEGORY_COLORS[report.category] || '#64748b' }}>
                        {report.category}
                      </span>
                      <div className="text-xs text-slate-400 font-mono tracking-wide">{report.id.substring(0, 8)}...</div>
                    </div>
                    <span className={`badge badge-${report.status === 'Resolved' ? 'resolved' : report.status === 'Under Review' ? 'review' : 'pending'} text-[10px]`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3 leading-relaxed relative z-10">
                    {report.description}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center relative z-10">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(report.created_at).toLocaleDateString()}</span>
                    {report.location && <span className="flex items-center gap-1.5 truncate max-w-[50%]"><MapPin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{report.location}</span></span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
