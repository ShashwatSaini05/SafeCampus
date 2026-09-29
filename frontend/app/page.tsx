'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, ArrowRight, CheckCircle, Lock, Eye, Zap, BookOpen,
  Users, AlertTriangle, Scale, ChevronDown, ChevronRight
} from 'lucide-react';
import LiveFeed from '@/components/LiveFeed';
import { useState } from 'react';

// ── DATA ──────────────────────────────────────────────────

const FEATURES = [
  { icon: <Shield className="w-5 h-5" />, title: 'Full Anonymity', desc: 'Email never linked to your reports', color: '#4f46e5' },
  { icon: <CheckCircle className="w-5 h-5" />, title: 'Verified Only', desc: 'Domain-gated for authenticity', color: '#0891b2' },
  { icon: <Zap className="w-5 h-5" />, title: 'Instant SOS', desc: 'Emergency button alerts authorities', color: '#dc2626' },
  { icon: <Eye className="w-5 h-5" />, title: 'Track Progress', desc: 'Follow your report in real-time', color: '#059669' },
];

const RIGHTS = [
  { icon: <Scale className="w-5 h-5" />, title: 'Anti-Ragging Act', color: '#dc2626', content: 'Under UGC Anti-Ragging Regulations 2009, ragging is a criminal offense. Perpetrators face expulsion, suspension, or imprisonment up to 3 years. Victims have the right to report without fear of retaliation.', laws: ['UGC Anti-Ragging Regulations, 2009', 'IPC Section 323, 325 (Hurt)', 'IT Act 2000 (Cyber Ragging)'] },
  { icon: <Shield className="w-5 h-5" />, title: 'POSH Act – Harassment', color: '#4f46e5', content: 'The POSH Act 2013 mandates every educational institution to have an Internal Complaints Committee (ICC). You have the right to file a complaint within 3 months. The ICC must complete inquiry within 90 days.', laws: ['POSH Act, 2013', 'IPC Section 354 (Outraging Modesty)', 'IPC Section 509 (Words/Gestures)'] },
  { icon: <Lock className="w-5 h-5" />, title: 'Right to Privacy', color: '#0891b2', content: "Your identity as complainant is legally protected. Institutions cannot disclose identity without consent. Supreme Court's Puttaswamy judgment (2017) declared privacy a Fundamental Right.", laws: ['IT Act Section 72', 'Right to Privacy (Puttaswamy Judgment)', 'CPC Order XXX Rule 1'] },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Right to Safe Education', color: '#d97706', content: 'Article 21A ensures every student the right to education in a safe, discrimination-free environment. Institutions have legal liability to maintain campus safety. UGC non-compliance results in derecognition.', laws: ['Article 21A - Right to Education', 'Protection of Children Act', 'UGC Guidelines 2012'] },
];

const CASE_STUDIES = [
  { title: 'IIT Kharagpur Ragging Case', year: '2022', type: 'Ragging', color: '#dc2626', description: 'Multiple seniors expelled after anonymous complaints led to investigation. CCTV confirmed the incident. Committee acted within 48 hours.', impact: '4 expelled, 2 suspended' },
  { title: 'Delhi University POSH Victory', year: '2023', type: 'Harassment', color: '#4f46e5', description: 'Faculty removed after 12 students filed anonymous complaints through the ICC. University established 24/7 grievance cell.', impact: 'Policy change campus-wide' },
  { title: 'Hostel Safety Infrastructure', year: '2023', type: 'Safety', color: '#0891b2', description: 'Anonymous tip about broken fire exits led to complete hostel safety audit. ₹50 lakh allocated for upgrades.', impact: '₹50L infrastructure upgrade' },
  { title: 'Cyberbullying Chain Ended', year: '2024', type: 'Harassment', color: '#d97706', description: 'Anonymous reporting led to coordinated FIRs. Three students barred from campus after cyber cell intervention.', impact: '3 students barred, FIR filed' },
];

// ── ACCORDION ────────────────────────────────────────────

function RightsAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-3 w-full">
      {RIGHTS.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: `1px solid ${openIdx === i ? r.color + '30' : '#e2e8f0'}`, boxShadow: openIdx === i ? '0 4px 16px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)', transition: 'border-color 0.3s, box-shadow 0.3s' }}>
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${r.color}10`, border: `1px solid ${r.color}20`, color: r.color }}>{r.icon}</div>
              <span className="font-bold text-slate-700 text-sm sm:text-base">{r.title}</span>
            </div>
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 ml-2 transition-transform duration-300 ${openIdx === i ? 'rotate-180' : ''}`} />
          </button>
          <motion.div initial={false} animate={{ height: openIdx === i ? 'auto' : 0, opacity: openIdx === i ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: 'hidden' }}>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-16 sm:pl-[72px]">
              <p className="text-slate-500 text-sm leading-relaxed mb-3">{r.content}</p>
              <div className="space-y-1.5">
                {r.laws.map((law, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-slate-400">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: r.color }} />{law}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────── */}
      <section className="relative min-h-[88vh] sm:min-h-screen flex items-center justify-center hero-grid overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.06), transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.04), transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-20">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 text-[11px] sm:text-xs font-semibold text-indigo-600"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            COER University · Verified Anonymous Platform
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black leading-none tracking-tighter mb-5 sm:mb-6 text-slate-800">
            Your Voice.<br />
            <span className="gradient-text">Protected.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4 sm:px-0">
            Report ragging, harassment & safety issues anonymously.
            Only verified <strong className="text-slate-700">@coeruniversity.ac.in</strong> students — your identity stays confidential.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
            <Link href="/report" className="btn-primary text-sm sm:text-base !px-6 sm:!px-8 !py-3.5 sm:!py-4 gap-2 justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> Report an Incident <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <Link href="/track" className="btn-ghost text-sm sm:text-base !px-6 sm:!px-8 !py-3.5 sm:!py-4 justify-center">
              Track Report Status
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex justify-center gap-8 sm:gap-14">
            {[{ value: '100%', label: 'Anonymous' }, { value: '24/7', label: 'Available' }, { value: '<48h', label: 'Response' }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-3xl font-black gradient-text">{s.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400">
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.div>
      </section>

      {/* ── FEATURES ──────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card flex flex-col items-center text-center group hover:scale-105 transition-transform !p-4 sm:!p-6 justify-between">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4"
                    style={{ background: `${f.color}10`, border: `1px solid ${f.color}20`, color: f.color }}>{f.icon}</div>
                  <h3 className="font-bold text-slate-700 text-xs sm:text-sm mb-1">{f.title}</h3>
                  <p className="text-slate-400 text-[11px] sm:text-xs leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE FEED ─────────────────────── */}
      <section className="py-10 sm:py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 sm:mb-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 sm:h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #4f46e5, #0891b2)' }} />
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">Community Reports</h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm ml-3 sm:ml-4">Real reports — all identities protected</p>
          </motion.div>
        </div>
        <LiveFeed />
      </section>

      {/* ── STUDENT RIGHTS ────────────────── */}
      <section id="rights" className="py-12 sm:py-20 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 text-[11px] sm:text-xs font-semibold text-indigo-600"
              style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
              <BookOpen className="w-3.5 h-3.5" /> Know Your Rights
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3 sm:mb-4">You Are Protected By Law</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Multiple Indian laws protect campus safety victims. Tap to expand each right.</p>
          </motion.div>
          <RightsAccordion />
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-6 text-center">
            <Link href="/rights" className="btn-ghost text-sm inline-flex items-center gap-2">
              View All Rights & Laws <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CASE STUDIES ──────────────────── */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 text-[11px] sm:text-xs font-semibold text-cyan-700"
              style={{ background: '#ecfeff', border: '1px solid #a5f3fc' }}>
              <Users className="w-3.5 h-3.5" /> Real Impact
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-3 sm:mb-4">Cases That Changed Campuses</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">Anonymous reporting has led to real accountability across India.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CASE_STUDIES.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card group hover:scale-[1.02] transition-transform cursor-default flex flex-col justify-between"
                style={{ borderTop: `3px solid ${c.color}` }}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge text-xs" style={{ background: `${c.color}10`, color: c.color, border: `1px solid ${c.color}20` }}>{c.type}</span>
                    <span className="text-xs text-slate-400 font-mono">{c.year}</span>
                  </div>
                  <h3 className="font-bold text-slate-700 text-sm mb-2">{c.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">{c.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="text-green-600 font-semibold">{c.impact}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────── */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #ecfeff)', border: '1px solid #c7d2fe' }}>
            <div className="relative z-10">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500 mx-auto mb-5 sm:mb-6" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight leading-tight">
                Don't Stay Silent.<br className="sm:hidden" /> Report. Protect. Change.
              </h2>
              <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-7 sm:mb-8">
                Every report makes the campus safer. Your anonymity is guaranteed by technology and law.
              </p>
              <Link href="/auth" className="btn-primary text-sm sm:text-base !px-8 sm:!px-10 !py-3.5 sm:!py-4 inline-flex gap-2">
                Get Verified & Start Reporting <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
