'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, CheckCircle, Loader2, Star, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function FeedbackPage() {
  const { isVerified, anonymousId } = useAuthStore();
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        anonymous_id: anonymousId || 'Anonymous',
        message: message.trim(),
        rating,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Feedback submitted! Thank you.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 px-4 flex items-center justify-center">
      <div className="relative w-full max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card !p-6 sm:!p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <MessageSquare className="w-7 h-7 text-indigo-500" />
          </div>

          <h1 className="text-2xl font-black text-slate-800 mb-2">Campus Feedback</h1>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            Share your thoughts or suggest safety improvements. Your feedback is confidential.
          </p>

          {!isVerified ? (
            <div className="p-4 rounded-xl text-left text-sm mb-6" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p className="text-amber-700 mb-3 text-xs sm:text-sm">🔒 Please verify your college email before submitting feedback.</p>
              <Link href="/auth" className="btn-primary text-xs sm:text-sm w-full justify-center">
                Verify Email <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : submitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback Received!</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-6">Thank you for helping us improve campus safety for everyone.</p>
              <button onClick={() => { setSubmitted(false); setMessage(''); }} className="btn-ghost text-xs sm:text-sm">
                Submit another feedback
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">Rating</label>
                <div className="flex gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Tell us what's working well or what needs improvement..."
                  className="input-field text-sm resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Posting as anonymous user <strong className="text-indigo-600 font-mono">{anonymousId}</strong></span>
              </div>

              <button type="submit" disabled={loading || !message.trim()} className="btn-primary w-full justify-center disabled:opacity-50">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Send Feedback</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
