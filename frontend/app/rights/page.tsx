'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale, Shield, Lock, BookOpen, Wifi, AlertTriangle,
  ChevronDown, ChevronRight, ArrowRight, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

// ── DATA ──────────────────────────────────────────────────

const RIGHTS = [
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'Anti-Ragging Laws (UGC 2009)',
    color: '#dc2626',
    content: 'Under UGC Anti-Ragging Regulations 2009, ragging is a criminal offense in every form. Perpetrators face expulsion, suspension, or imprisonment up to 3 years. Financial penalties can be imposed on the institution. Victims have the right to report without fear of retaliation — and the institution must act within 7 days.',
    laws: [
      { label: 'UGC Anti-Ragging Regulations, 2009', ref: 'Regulation 6.1' },
      { label: 'IPC Section 323, 325 (Hurt)', ref: 'Imprisonment up to 7 years' },
      { label: 'IPC Section 506 (Criminal Intimidation)', ref: 'Imprisonment up to 2 years' },
      { label: 'IT Act 2000 (Cyber Ragging)', ref: 'Section 66-A' },
    ],
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'POSH Act – Sexual Harassment Protection',
    color: '#4f46e5',
    content: 'The Prevention of Sexual Harassment (POSH) Act 2013 mandates every educational institution to constitute an Internal Complaints Committee (ICC). You have the right to file a complaint within 3 months of any incident. The ICC must complete its inquiry within 90 days. Retaliation against the complainant is strictly prohibited.',
    laws: [
      { label: 'POSH Act, 2013', ref: 'Section 4 — ICC Mandatory' },
      { label: 'IPC Section 354 (Outraging Modesty)', ref: 'Imprisonment up to 5 years' },
      { label: 'IPC Section 354A (Sexual Harassment)', ref: 'Imprisonment up to 3 years' },
      { label: 'IPC Section 509 (Words, Gesture)', ref: 'Imprisonment up to 3 years' },
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: 'Right to Privacy',
    color: '#0891b2',
    content: "Your identity as a complainant is legally protected. Institutions are prohibited from disclosing your identity without explicit consent. Any disclosure is punishable under IT Act provisions. The Supreme Court's Puttaswamy judgment (2017) declared privacy a Fundamental Right. SafeCampus uses anonymous IDs — your email is never exposed in any report.",
    laws: [
      { label: 'IT Act 2000, Section 72', ref: 'Penalty for breach of confidentiality' },
      { label: 'Right to Privacy (Puttaswamy v. UOI, 2017)', ref: 'Fundamental Right under Art 21' },
      { label: 'UGC Anti-Ragging Regulations', ref: 'Confidentiality of complainant — Regulation 9' },
    ],
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Right to Safe Education',
    color: '#d97706',
    content: 'Article 21A of the Constitution guarantees every child and student the right to free and compulsory education in a safe environment. Institutions have a statutory duty to maintain a safe campus. Failure to act on complaints makes the institution directly liable for negligence and regulatory penalties from UGC.',
    laws: [
      { label: 'Article 21A — Right to Education', ref: '86th Constitutional Amendment' },
      { label: 'Right to Education Act, 2009', ref: 'Section 17 — No Corporal Punishment' },
      { label: 'UGC Guidelines 2012', ref: 'Campus Safety Compliance' },
    ],
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    title: 'Cyber Safety Laws (IT Act 2000)',
    color: '#059669',
    content: 'Online bullying, sharing of private images, or threatening messages sent via social media or messaging apps are criminal offenses under the IT Act 2000. Cybercrime can be reported at the National Cybercrime Reporting Portal (cybercrime.gov.in) or by calling 1930. Screenshots and metadata serve as legal evidence.',
    laws: [
      { label: 'IT Act 2000, Section 67 (Obscene Material)', ref: 'Imprisonment up to 5 years' },
      { label: 'IT Act 2000, Section 66C (Identity Theft)', ref: 'Imprisonment up to 3 years' },
      { label: 'IT Act 2000, Section 66E (Privacy Violation)', ref: 'Imprisonment up to 3 years' },
      { label: 'IPC Section 499 (Defamation)', ref: 'Imprisonment up to 2 years' },
    ],
  },
];

// ── ACCORDION ITEM ─────────────────────────────────────────

function AccordionItem({ right, isOpen, onClick, index }: {
  right: typeof RIGHTS[0];
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: `1px solid ${isOpen ? right.color + '30' : '#e2e8f0'}`,
        boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Header */}
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${right.color}10`, border: `1px solid ${right.color}20`, color: right.color }}
          >
            {right.icon}
          </div>
          <span className="font-bold text-slate-700 text-sm sm:text-base leading-snug">{right.title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 ml-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Content */}
      <AnimatePresenceWrapper isOpen={isOpen}>
        <div className="px-5 pb-5">
          <div className="pl-14">
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{right.content}</p>
            <div className="space-y-2">
              {right.laws.map((law, j) => (
                <div key={j} className="flex items-start gap-2 text-xs">
                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: right.color }} />
                  <div>
                    <span className="text-slate-500 font-medium">{law.label}</span>
                    <span className="text-slate-400 ml-2">— {law.ref}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatePresenceWrapper>
    </motion.div>
  );
}

// Helper wrapper for accordion animation
function AnimatePresenceWrapper({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}

// ── PAGE ───────────────────────────────────────────────────

export default function RightsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="w-full min-h-[calc(100vh-85px)] flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

        {/* ── HEADER ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-14 w-full flex flex-col items-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-semibold text-indigo-600"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
          >
            <BookOpen className="w-3.5 h-3.5" /> Student Rights
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4 leading-tight">
            Know Your Rights as a<br />
            <span className="gradient-text">Student in India</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Indian law provides strong protections for students. Understand your rights so you can report safely and confidently.
          </p>
        </motion.div>

        {/* ── ACCORDION ─────────────────────────────────── */}
        <section className="w-full mb-12 space-y-3">
          {RIGHTS.map((right, i) => (
            <AccordionItem
              key={i}
              right={right}
              index={i}
              isOpen={openIdx === i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </section>

        {/* ── WARNING BOX ───────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full mb-12 rounded-2xl overflow-hidden"
          style={{ border: '1px solid #fecaca', background: '#ffffff' }}
        >
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <h2 className="font-black text-slate-800 text-base sm:text-lg">Misuse of Platform is Punishable</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              'False reporting is a serious legal offense under IPC Section 182 & 211.',
              'Fabricated complaints can lead to disciplinary action from the institution.',
              'Legal consequences include criminal prosecution and civil liability.',
              'SafeCampus tracks device patterns to detect and deter misuse.',
              'Anonymous ID does not grant immunity — misuse will be traced and reported.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                <span className="text-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── QUICK REFERENCE ───────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full mb-12"
        >
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Quick Reference — Important Numbers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Police', number: '100', color: '#2563eb' },
              { label: 'Emergency', number: '112', color: '#dc2626' },
              { label: 'Women', number: '1091', color: '#7c3aed' },
              { label: 'Ambulance', number: '102', color: '#059669' },
              { label: 'Cyber Crime', number: '1930', color: '#0891b2' },
              { label: 'Anti-Ragging', number: '1800-180-5522', color: '#4f46e5' },
            ].map((n, i) => (
              <a
                key={i}
                href={`tel:${n.number}`}
                className="p-4 rounded-2xl flex flex-col gap-1 transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: `${n.color}08`, border: `1px solid ${n.color}18` }}
              >
                <div className="text-slate-800 font-black text-lg leading-none">{n.number}</div>
                <div className="text-xs font-semibold" style={{ color: n.color }}>{n.label}</div>
              </a>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full rounded-3xl p-8 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #eef2ff, #ecfeff)',
            border: '1px solid #c7d2fe',
          }}
        >
          <div className="relative z-10">
            <Shield className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 tracking-tight">
              Report Safely & Responsibly
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              You are protected by law. Your anonymity is guaranteed. Every genuine report makes campus safer for everyone.
            </p>
            <Link href="/report" className="btn-primary text-sm sm:text-base !px-8 !py-4 inline-flex gap-2">
              Submit a Report Anonymously
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
