'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

const ADMIN_CREDENTIALS = [
  { email: 'saurabhkumarjha011@gmail.com', password: 'admin123' },
  { email: 'admin@example.com', password: 'admin123' },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isVerified, email: storeEmail, setAuth } = useAuthStore();
  const router = useRouter();

  // Auto redirect if already logged in as admin
  useEffect(() => {
    if (isVerified && ADMIN_CREDENTIALS.some(c => c.email === storeEmail?.toLowerCase())) {
      router.push('/admin');
    }
  }, [isVerified, storeEmail, router]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const match = ADMIN_CREDENTIALS.find(c => c.email === cleanEmail && c.password === password);

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 600));

    if (!match) {
      setError('Invalid admin credentials. Check your email and password.');
      setLoading(false);
      return;
    }

    // Set auth state directly — no magic link needed
    const adminAnonId = 'admin_' + Math.random().toString(36).substring(2, 10);
    setAuth(adminAnonId, match.email);
    
    setLoading(false);
    router.push('/admin');
  };

  return (
    <div className="min-h-screen pb-12 px-4 flex items-center justify-center">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 sm:w-80 h-64 sm:h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ef4444, transparent)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="card !p-6 sm:!p-8 relative overflow-hidden text-center"
          style={{ border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #ef4444, transparent)' }} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-white mb-2">Admin Portal</h1>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
              Enter your administrator credentials to access the dashboard.
            </p>

            {/* Email */}
            <div className="mb-4 text-left">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                <Mail className="inline w-3 h-3 mr-1" /> Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('admin-password')?.focus()}
                placeholder="admin@example.com"
                className="input-field text-sm sm:text-base"
                autoComplete="email"
                inputMode="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="mb-5 text-left">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                <Lock className="inline w-3 h-3 mr-1" /> Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="input-field text-sm sm:text-base"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="mb-5 p-3 text-left rounded-xl text-xs sm:text-sm text-red-400 flex items-start gap-2"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button onClick={handleLogin} disabled={loading || !email || !password}
              className="btn-danger w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                : <>Login as Admin <ArrowRight className="w-4 h-4" /></>}
            </button>

            <p className="text-slate-600 text-[10px] mt-4">
              🔒 This area is restricted to authorized administrators only.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
