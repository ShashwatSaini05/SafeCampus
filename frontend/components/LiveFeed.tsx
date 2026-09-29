'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Report } from '@/lib/store';
import ReportCard from './ReportCard';

// Static demo reports for when backend is not connected
const DEMO_REPORTS: Report[] = [
  {
    id: '1', tracking_id: 'RPT-A1B2C3', category: 'ragging',
    description: 'Senior students in hostel Block C are forcing freshers to perform embarrassing acts at night. Multiple students affected.',
    location: 'Hostel Block C', status: 'Under Review', priority: 'High', anonymous_id: 'User-DEMO1', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2', tracking_id: 'RPT-D4E5F6', category: 'harassment',
    description: 'A professor is being inappropriately personal with female students during office hours. Multiple girls have faced this issue.',
    location: 'CS Dept, Room 204', status: 'Pending', priority: 'High', anonymous_id: 'User-DEMO2', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3', tracking_id: 'RPT-G7H8I9', category: 'safety',
    description: 'Electrical wiring in main lab building appears dangerously exposed. Saw sparks near switchboard twice this week.',
    location: 'Main Lab Building', status: 'Pending', priority: 'Medium', anonymous_id: 'User-DEMO3', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4', tracking_id: 'RPT-J1K2L3', category: 'ragging',
    description: 'New batch students are being pressured to pay money to seniors monthly. Ongoing for past 2 weeks across multiple departments.',
    location: 'Engineering Block', status: 'Resolved', priority: 'Medium', anonymous_id: 'User-DEMO4', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5', tracking_id: 'RPT-M4N5O6', category: 'safety',
    description: 'Gate near girls hostel is broken and remains open all night. Security absent most nights — serious safety concern.',
    location: 'Girls Hostel Gate B', status: 'Pending', priority: 'Medium', anonymous_id: 'User-DEMO5', created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6', tracking_id: 'RPT-P7Q8R9', category: 'other',
    description: 'Campus water supply in hostel mess contaminated. Several students fell sick last week. Urgent health authority intervention needed.',
    location: 'Hostel Mess A', status: 'Resolved', priority: 'High', anonymous_id: 'User-DEMO1', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7', tracking_id: 'RPT-S1T2U3', category: 'harassment',
    description: 'Received threatening messages after informal complaint last month. Feeling unsafe coming to campus now.',
    location: 'Campus / Online', status: 'Under Review', priority: 'High', anonymous_id: 'User-DEMO2', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function LiveFeed() {
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number | null>(null);
  const positionRef = useRef(0);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      if (data && data.length > 0) {
        setReports(data as Report[]);
      }
    } catch {
      // Use demo data if backend not available
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll || !containerRef.current) return;

    const container = containerRef.current;
    let speed = 0.5;

    const scroll = () => {
      if (!container) return;
      positionRef.current += speed;
      if (positionRef.current >= container.scrollWidth / 2) {
        positionRef.current = 0;
      }
      container.scrollLeft = positionRef.current;
      animRef.current = requestAnimationFrame(scroll);
    };

    animRef.current = requestAnimationFrame(scroll);

    const pause = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    const resume = () => {
      animRef.current = requestAnimationFrame(scroll);
    };

    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
    };
  }, [autoScroll, reports]);

  const doubled = [...reports, ...reports];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <Activity className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-800">Live Reports Feed</h2>
          </div>
          <span className="badge badge-pending text-xs">{reports.length} active</span>
        </div>
        <button
          onClick={() => { fetchReports(); setLoading(true); setTimeout(() => setLoading(false), 1000); }}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Scrolling cards */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #f8fafc, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #f8fafc, transparent)' }} />

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-hidden pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {doubled.map((report, idx) => (
            <div key={`${report.id}-${idx}`} className="w-80 shrink-0">
              <ReportCard report={report} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Pause/Resume control */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          {autoScroll ? '⏸ Pause scroll' : '▶ Resume scroll'}
        </button>
      </div>
    </div>
  );
}
