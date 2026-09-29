'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, X, Shield } from 'lucide-react';

const EMERGENCY_NUMBERS = [
  { label: 'Police', number: '100', icon: '🚔', color: '#2563eb', desc: 'Law & Order' },
  { label: 'Emergency', number: '112', icon: '🆘', color: '#dc2626', desc: 'All emergencies' },
  { label: 'Women Helpline', number: '1091', icon: '👩‍⚖️', color: '#7c3aed', desc: '24/7 Support' },
  { label: 'Cyber Crime', number: '1930', icon: '💻', color: '#0891b2', desc: 'Online crimes' },
  { label: 'Ambulance', number: '102', icon: '🚑', color: '#059669', desc: 'Medical emergency' },
  { label: 'Ambulance Alt', number: '108', icon: '🏥', color: '#059669', desc: 'Medical services' },
  { label: 'Anti-Ragging', number: '1800-180-5522', icon: '🛡️', color: '#4f46e5', desc: 'UGC Helpline (Free)' },
];

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating SOS Button */}
      <div className="fixed bottom-5 right-5 z-50">
        {/* Pulse rings */}
        {!isOpen && (
          <>
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(220,38,38,0.3)' }}
            />
            <motion.div
              animate={{ scale: [1, 2.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(220,38,38,0.15)' }}
            />
          </>
        )}
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-full flex flex-col items-center justify-center text-white font-black text-xs shadow-lg select-none"
          style={{
            background: '#dc2626',
            boxShadow: '0 4px 20px rgba(220,38,38,0.4)',
          }}
        >
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black tracking-wide">SOS</span>
        </motion.button>
      </div>

      {/* Emergency Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[80]"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-24 sm:right-5 sm:w-96 z-[90] rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: '1px solid #fecaca',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              }}
            >
              {/* Modal header */}
              <div className="px-5 py-4" style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: '#fee2e2', border: '1px solid #fecaca' }}
                    >
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">Emergency</div>
                      <div className="text-red-500 text-xs">Select emergency service</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="px-5 py-3 flex items-center gap-2.5"
                style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-amber-700 text-xs leading-relaxed">
                  <strong>Use only in real emergencies.</strong> False calls are a punishable offense.
                </p>
              </div>

              {/* Numbers grid */}
              <div className="p-4 grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto">
                {EMERGENCY_NUMBERS.map((n, i) => (
                  <motion.a
                    key={i}
                    href={`tel:${n.number}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`relative rounded-xl p-4 flex flex-col gap-1 transition-all hover:scale-[1.03] active:scale-[0.98] ${
                      n.number === '1800-180-5522' ? 'col-span-2' : ''
                    }`}
                    style={{
                      background: `${n.color}08`,
                      border: `1px solid ${n.color}20`,
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{n.icon}</span>
                      <Phone className="w-3.5 h-3.5 opacity-30" style={{ color: n.color }} />
                    </div>
                    <div className="font-black text-slate-800 text-lg leading-none">{n.number}</div>
                    <div className="font-semibold text-xs" style={{ color: n.color }}>{n.label}</div>
                    <div className="text-slate-400 text-[10px]">{n.desc}</div>
                  </motion.a>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
