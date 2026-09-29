'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { authService } from '@/lib/authService';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { isVerified } = useAuthStore();
  const router = useRouter();

  // Auto redirect if already logged in
  useEffect(() => {
    if (isVerified) {
      router.push('/dashboard');
    }
  }, [isVerified, router]);

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendLink = async () => {
    if (cooldown > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@coeruniversity.ac.in')) {
      setError('Please use your official college email address ending with @coeruniversity.ac.in.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      await authService.sendMagicLink(cleanEmail, redirectTo);
      setSuccess(true);
      setCooldown(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please wait a moment and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 px-4 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        <div className="card !p-6 sm:!p-8 relative overflow-hidden text-center">

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div key="email-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6"
                  style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
                </div>
                
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Welcome to SafeCampus</h1>
                <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
                  Enter your COER University email. We'll send you a magic link to instantly log in—no password needed.
                </p>

                <div className="mb-5 text-left">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">College Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
                    placeholder="student@coeruniversity.ac.in"
                    className="input-field text-sm sm:text-base"
                    autoComplete="email"
                    inputMode="email"
                    autoFocus
                  />
                  {email && !email.endsWith('@coeruniversity.ac.in') && email.includes('@') && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Must end with @coeruniversity.ac.in
                    </p>
                  )}
                </div>

                {error && (
                  <div className="mb-5 p-3 text-left rounded-xl text-xs sm:text-sm text-red-600 flex items-start gap-2"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button onClick={handleSendLink} disabled={loading || !email || cooldown > 0}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Link…</>
                    : cooldown > 0
                    ? `Please wait ${cooldown}s`
                    : <>Continue with Email <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6"
                  style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                </div>
                
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 mb-3">Check your email</h1>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  We've sent a magic login link to <br/>
                  <strong className="text-indigo-600 font-mono mt-2 block">{email}</strong>
                </p>
                <p className="text-slate-400 text-xs italic mb-8">
                  Click the link in the email to log in automatically. You can close this window if you open the link on this device.
                </p>

                <button
                  onClick={() => { setSuccess(false); setEmail(''); setError(''); }}
                  className="text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 transition-colors text-xs mx-auto">
                  <RotateCcw className="w-3.5 h-3.5" /> Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin link at the bottom of card */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/admin/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 inline-flex">
              Are you an administrator? <span className="text-indigo-600 font-semibold underline decoration-indigo-200 underline-offset-2">Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
