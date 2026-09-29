'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, LogOut, User, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import SOSButton from '@/components/SOSButton';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/report', label: 'Report' },
  { href: '/track', label: 'Track' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/rights', label: 'Your Rights' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/admin/login', label: 'Admin' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isVerified, anonymousId, logout } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <>
      {/* ── NAV BAR ──────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'py-2 border-b border-slate-200/80'
            : 'py-3 sm:py-4 bg-transparent'
        }`}
        style={{
          background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* LEFT — Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
              style={{ background: '#4f46e5' }}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">SafeCampus</div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block">COER University</div>
            </div>
          </Link>

          {/* CENTER — Nav links (desktop only) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* RIGHT — Auth (desktop) + Hamburger (mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop auth */}
            {isVerified ? (
              <div className="hidden md:flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                >
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs font-mono font-bold text-indigo-600">{anonymousId}</span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="hidden md:inline-flex btn-primary text-sm !px-5 !py-2.5">
                Verify & Login
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── MOBILE DRAWER (slides from RIGHT) ────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className="fixed top-0 right-0 h-full w-[280px] z-[70] flex flex-col"
              style={{
                background: '#ffffff',
                borderLeft: '1px solid #e2e8f0',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
              }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#4f46e5' }}
                  >
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">SafeCampus</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                        pathname === link.href
                          ? 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="p-4 border-t border-slate-200 space-y-3">
                {isVerified ? (
                  <>
                    <div
                      className="flex items-center gap-2 px-4 py-3 rounded-xl"
                      style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                    >
                      <User className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Logged in as</div>
                        <div className="text-sm font-mono font-bold text-indigo-600 truncate">{anonymousId}</div>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="btn-primary w-full justify-center text-sm">
                    Verify College Email
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating SOS */}
      <SOSButton />
    </>
  );
}
