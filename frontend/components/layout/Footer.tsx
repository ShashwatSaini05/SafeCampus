'use client';

import Link from 'next/link';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-auto w-full pt-12 sm:pt-16 pb-8 border-t overflow-hidden" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-16">
          
          {/* 1. Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                style={{ background: '#4f46e5' }}>
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">SafeCampus</span>
                <span className="block text-[10px] text-slate-400 font-medium -mt-1 leading-none">COER University</span>
              </div>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed pr-4">
              Empowering students to report incidents safely, securely, and completely anonymously. 
              Creating a better, safer campus environment for everyone at COER University.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Submit a Report', href: '/report' },
                { label: 'Track Your Report', href: '/track' },
                { label: 'Student Dashboard', href: '/dashboard' },
                { label: 'Know Your Rights', href: '/rights' },
                { label: 'Campus Feedback', href: '/feedback' },
                { label: 'Platform Login', href: '/auth' }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors inline-block hover:translate-x-1 transform duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Support & Resources */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Resources & Legal</h3>
            <ul className="space-y-3">
              {[
                { label: 'Anti-Ragging Squad (UGC)', href: '/rights' },
                { label: 'Women\'s Grievance Cell', href: '/rights' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Administrator Access', href: '/admin/login' }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-indigo-600 transition-colors inline-block hover:translate-x-1 transform duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Contact & Support</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>COER University Campus<br />Roorkee, Uttarakhand 247667</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>+91 1800-180-5522 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <a href="mailto:support@coeruniversity.ac.in" className="hover:text-indigo-600 transition-colors">support@coeruniversity.ac.in</a>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {[
                { 
                  name: 'Twitter', 
                  href: '#', 
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg> 
                },
                { 
                  name: 'Instagram', 
                  href: '#', 
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> 
                },
                { 
                  name: 'Github', 
                  href: '#', 
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> 
                }
              ].map((social, i) => (
                <a key={i} href={social.href} aria-label={social.name} className="group w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-indigo-50"
                  style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
            Copyright © 2026 Byte CodeX | All Rights Reserved
          </p>
          <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 justify-center">
            Designed & Developed by <span className="font-bold text-indigo-600 tracking-wide bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Byte CodeX</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
