'use client';

import { motion } from 'framer-motion';
import { Shield, MapPin, Clock } from 'lucide-react';
import { Report } from '@/lib/store';

interface ReportCardProps {
  report: Report;
  index?: number;
  compact?: boolean;
}

const categoryConfig = {
  ragging: { label: 'Ragging', className: 'badge-ragging', emoji: '⚠️' },
  harassment: { label: 'Harassment', className: 'badge-harassment', emoji: '🚨' },
  safety: { label: 'Safety', className: 'badge-safety', emoji: '⛔' },
  other: { label: 'Other', className: 'badge-other', emoji: '📋' },
};

const statusConfig = {
  Pending: { label: 'Pending', className: 'badge-pending', dot: '#d97706' },
  'Under Review': { label: 'Under Review', className: 'badge-review', dot: '#2563eb' },
  Resolved: { label: 'Resolved', className: 'badge-resolved', dot: '#059669' },
};

const priorityConfig = {
  High: { className: 'badge-high', label: 'High' },
  Medium: { className: 'badge-medium', label: 'Medium' },
  Low: { className: 'badge-low', label: 'Low' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export default function ReportCard({ report, index = 0, compact = false }: ReportCardProps) {
  const cat = categoryConfig[report.category] || categoryConfig.other;
  const stat = statusConfig[report.status] || statusConfig.Pending;
  const pri = priorityConfig[report.priority] || priorityConfig.Low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card group cursor-default"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className={`badge ${cat.className}`}>
            {cat.emoji} {cat.label}
          </span>
          <span className={`badge ${pri.className}`}>
            {pri.label} Priority
          </span>
        </div>
        <span className={`badge ${stat.className} shrink-0`}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: stat.dot }}
          />
          {stat.label}
        </span>
      </div>

      {/* Description */}
      <p className={`text-slate-600 text-sm leading-relaxed mb-3 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
        {report.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {report.location && (
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3 h-3" />
              {report.location.slice(0, 25)}{report.location.length > 25 ? '…' : ''}
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3 h-3" />
            Anonymous
          </span>
        </div>
        <span className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3" />
          {timeAgo(report.created_at)}
        </span>
      </div>
    </motion.div>
  );
}
