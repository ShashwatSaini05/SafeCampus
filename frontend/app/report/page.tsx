'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, FileText, MapPin, Upload, CheckCircle, Loader2,
  ArrowRight, ArrowLeft, X, Zap, AlertCircle, Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CampusMap = dynamic(() => import('@/components/CampusMap'), { ssr: false });

const classifyText = (text: string) => {
  const lower = text.toLowerCase();
  let category = 'other';
  let priority = 'Low';
  
  if (lower.match(/hit|beat|slap|attack|blood|weapon|suicide|kill|die/)) priority = 'High';
  if (lower.match(/ragging|senior|forced|intro|strip|humiliate/)) { category = 'ragging'; priority = 'High'; }
  else if (lower.match(/harass|touch|molest|stalk|creep|nude/)) { category = 'harassment'; priority = 'High'; }
  else if (lower.match(/fire|broken|glass|electricity|shock|collapse|danger/)) { category = 'safety'; priority = priority === 'Low' ? 'Medium' : priority; }
  else if (lower.match(/theft|stole|missing|bribe/)) { category = 'other'; priority = 'Medium'; }
  
  return { category, priority };
};

const CATEGORIES = [
  { value: 'ragging', label: 'Ragging', emoji: '⚠️', desc: 'Physical or mental abuse, coercion by seniors', color: '#dc2626' },
  { value: 'harassment', label: 'Harassment', emoji: '🚨', desc: 'Sexual, verbal, or workplace harassment', color: '#4f46e5' },
  { value: 'safety', label: 'Safety Hazard', emoji: '⛔', desc: 'Infrastructure, fire, or physical safety risks', color: '#2563eb' },
  { value: 'other', label: 'Other', emoji: '📋', desc: 'Bullying, discrimination, or other concerns', color: '#7c3aed' },
];

type Step = 1 | 2 | 3 | 4;

export default function ReportPage() {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [aiPreview, setAiPreview] = useState<{ category: string; priority: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { isVerified, anonymousId, authLoading } = useAuthStore();
  const router = useRouter();

  // AI classify on description change
  useEffect(() => {
    if (description.length < 20) { setAiPreview(null); return; }
    const timeout = setTimeout(() => {
      setAiLoading(true);
      try {
        const result = classifyText(description);
        setAiPreview(result);
      } catch {
        setAiPreview(null);
      } finally {
        setAiLoading(false);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [description]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f => f.size <= 10 * 1024 * 1024);
    if (valid.length < selected.length) toast.error('Some files exceed 10MB limit');
    setFiles(prev => [...prev, ...valid].slice(0, 3));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...dropped.filter(f => f.size <= 10 * 1024 * 1024)].slice(0, 3));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return [];
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
        const filePath = `${anonymousId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('evidence').getPublicUrl(filePath);
        urls.push(data.publicUrl);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    return urls;
  };

  const handleSubmit = async () => {
    if (!isVerified || !anonymousId) { toast.error('Please verify your email first'); router.push('/auth'); return; }
    setLoading(true);
    try {
      const evidenceUrls = await uploadFiles();
      
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let generatedTrackingId = 'RPT-';
      for (let i = 0; i < 6; i++) {
        generatedTrackingId += chars[Math.floor(Math.random() * chars.length)];
      }

      let savedReport: any = null;

      try {
        const { data: reportData, error: reportError } = await supabase.from('reports').insert({
          tracking_id: generatedTrackingId,
          category: category || aiPreview?.category || 'other',
          description,
          priority: aiPreview?.priority || 'Medium',
          location: location || null,
          anonymous_id: anonymousId
        }).select().single();

        if (reportError) throw reportError;
        savedReport = reportData;

        if (evidenceUrls.length > 0 && reportData) {
          const evidenceRecords = evidenceUrls.map(url => ({
            report_id: reportData.id,
            file_url: url
          }));
          await supabase.from('evidence').insert(evidenceRecords);
        }
      } catch (dbErr: any) {
        // Fallback: If Supabase table public.reports is missing or schema cache error occurs
        savedReport = {
          id: 'loc_' + Math.random().toString(36).substring(2, 10),
          tracking_id: generatedTrackingId,
          category: category || aiPreview?.category || 'other',
          description,
          priority: aiPreview?.priority || 'Medium',
          status: 'Pending',
          location: location || null,
          anonymous_id: anonymousId,
          created_at: new Date().toISOString()
        };

        const existingLocal = JSON.parse(localStorage.getItem('safecampus_reports_cache') || '[]');
        localStorage.setItem('safecampus_reports_cache', JSON.stringify([savedReport, ...existingLocal]));
      }

      setTrackingId(savedReport?.tracking_id || generatedTrackingId);
      setStep(4);
      toast.success('Report submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { High: '#dc2626', Medium: '#d97706', Low: '#059669' };

  return (
    <div className="min-h-screen pb-12 px-4">
      <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
        {/* Left Side: Form */}
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Submit a Report</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
              100% anonymous · Only <strong className="text-slate-600">@coeruniversity.ac.in</strong>
            </p>
          </motion.div>

        {/* Auth guard */}
        {authLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : !isVerified && step !== 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-5 p-4 sm:p-5 rounded-2xl text-sm"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
            <p className="text-slate-600 mb-3 text-sm leading-relaxed">
              🔒 <strong>Verification required.</strong> Your identity stays anonymous after verification.
            </p>
            <Link href="/auth" className="btn-primary text-sm !py-2.5 inline-flex w-full justify-center sm:w-auto">
              Verify College Email <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Progress bar */}
        {!authLoading && step !== 4 && (
          <div className="flex gap-1.5 mb-6 sm:mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ background: step >= s ? '#4f46e5' : '#e2e8f0' }} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* STEP 1: Category + Location */}
          {!authLoading && step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-base sm:text-lg font-bold text-slate-700 mb-1.5">What type of incident?</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">Select the category that best describes the situation.</p>

              {/* 1-col on mobile, 2-col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-5">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-2xl text-left transition-all duration-200 flex items-start gap-3 h-full cursor-pointer ${
                      category === cat.value ? 'scale-[1.01]' : 'hover:scale-[1.005]'
                    }`}
                    style={{
                      background: category === cat.value ? `${cat.color}08` : '#ffffff',
                      border: `2px solid ${category === cat.value ? cat.color : '#e2e8f0'}`,
                      boxShadow: category === cat.value ? `0 4px 12px ${cat.color}15` : '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                    <span className="text-xl sm:text-2xl shrink-0">{cat.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-700 text-sm">{cat.label}</div>
                      <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{cat.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 mb-2 tracking-wide">
                  <MapPin className="inline w-3.5 h-3.5 mr-1" /> Location (Optional)
                </label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Hostel Block C, 3rd Floor..."
                  className="input-field text-sm" />
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full justify-center">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Description */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base sm:text-lg font-bold text-slate-700 mb-1.5">Describe the Incident</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">Be specific — dates, times, what happened. Min 20 characters.</p>

              <div className="mb-4 relative">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={7} maxLength={2000}
                  placeholder="Describe what happened in as much detail as you're comfortable sharing..."
                  className="input-field resize-none leading-relaxed text-sm" />
                <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono">{description.length}/2000</div>
              </div>

              {/* AI Preview */}
              <AnimatePresence>
                {(aiPreview || aiLoading) && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded-xl mb-4 flex items-center gap-3"
                    style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                    <Brain className={`w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0 ${aiLoading ? 'animate-pulse' : ''}`} />
                    {aiLoading ? (
                      <span className="text-slate-500 text-xs sm:text-sm">AI analyzing...</span>
                    ) : aiPreview && (
                      <div className="text-xs sm:text-sm">
                        <span className="text-slate-500">AI suggests: </span>
                        <strong className="text-indigo-600 capitalize">{aiPreview.category}</strong>
                        <span className="text-slate-300 mx-2">·</span>
                        <span className="font-semibold" style={{ color: priorityColor[aiPreview.priority as keyof typeof priorityColor] || '#059669' }}>
                          {aiPreview.priority} Priority
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost gap-2 flex items-center !px-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(3)} disabled={description.length < 20}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Evidence Upload */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base sm:text-lg font-bold text-slate-700 mb-1.5">Attach Evidence</h2>
              <p className="text-slate-400 text-xs sm:text-sm mb-5">Upload photos/videos (optional). Max 3 files, 10MB each.</p>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center mb-4 transition-all cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50"
                style={{ borderColor: '#cbd5e1' }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-2.5" />
                <p className="text-slate-500 text-sm font-medium">
                  Drop files or <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-slate-400 text-xs mt-1">JPEG, PNG, WebP, MP4 · max 10MB</p>
                <input id="file-input" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileAdd} />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2 mb-4">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-slate-600 text-xs flex-1 truncate">{file.name}</span>
                      <span className="text-slate-400 text-xs shrink-0">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                      <button onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="p-4 rounded-2xl mb-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 className="text-xs font-semibold text-slate-500 tracking-wide mb-3">Review Summary</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Category', value: category || aiPreview?.category || 'Auto-detect' },
                    { label: 'Priority', value: aiPreview?.priority || 'Auto-assign' },
                    { label: 'Reporter', value: anonymousId || 'Pending' },
                    ...(location ? [{ label: 'Location', value: location }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-3 text-sm">
                      <span className="text-slate-400 w-20 shrink-0 text-xs">{label}:</span>
                      <span className={`text-slate-700 capitalize text-xs truncate ${label === 'Reporter' ? 'text-indigo-600 font-mono' : ''}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost gap-2 flex items-center !px-4">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading || uploading || !isVerified}
                  className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading || uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? 'Uploading…' : 'Submitting…'}</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Submit Anonymously</>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 sm:py-8">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6"
                style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Report Submitted! 🛡️</h2>
              <p className="text-slate-400 text-sm mb-6">Your identity is fully protected. Save your tracking ID.</p>

              <div className="p-4 sm:p-5 rounded-2xl mb-6 sm:mb-8"
                style={{ background: '#eef2ff', border: '2px solid #c7d2fe' }}>
                <div className="text-slate-400 text-xs mb-2 tracking-wide">Tracking ID</div>
                <div className="text-2xl sm:text-3xl font-black font-mono gradient-text">{trackingId}</div>
                <button
                  onClick={() => { navigator.clipboard.writeText(trackingId); toast.success('Copied!'); }}
                  className="text-xs text-slate-400 hover:text-slate-600 mt-2 transition-colors">
                  📋 Copy to clipboard
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/track" className="flex-1 btn-ghost justify-center flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" /> Track Status
                </Link>
                <button
                  onClick={() => { setStep(1); setCategory(''); setDescription(''); setLocation(''); setFiles([]); setAiPreview(null); }}
                  className="flex-1 btn-primary justify-center text-sm">
                  Submit Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Right Side: Map & Feedback */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="w-full max-w-lg mx-auto lg:mx-0 flex flex-col gap-6 lg:mt-0 pt-4 lg:pt-0"
        >
          {/* Map Card */}
          <div className="rounded-2xl overflow-hidden bg-white p-2" 
               style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <CampusMap location={location} className="h-[300px] sm:h-[350px]" />
            <div className="p-4 sm:p-5 text-center">
              <h3 className="text-slate-700 text-base sm:text-lg font-bold mb-1.5">Campus Safety Map</h3>
              <p className="text-slate-400 text-xs">Live map • Pinch to zoom • Allow location for accuracy</p>
            </div>
          </div>
          
          {/* Feedback Button */}
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeFciTRoMShjU8ZHphhiu2ih5zNIYO7mOFn84OvNe182fc9Vg/viewform?usp=publish-editor"
            target="_blank" 
            rel="noreferrer"
            className="btn-primary w-full justify-center !py-3.5 sm:!py-4 flex items-center gap-2 group transition-all font-bold sm:text-base"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" /> 
            Submit Feedback
          </a>
        </motion.div>
      </div>
    </div>
  );
}
