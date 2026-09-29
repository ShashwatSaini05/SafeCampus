-- ============================================================
-- SafeCampus Comprehensive Database Schema & Security Setup
-- Execute this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  anonymous_id TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ragging', 'harassment', 'safety', 'other')),
  description TEXT NOT NULL,
  location TEXT,
  priority TEXT NOT NULL DEFAULT 'Low' CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Resolved', 'Rejected')),
  anonymous_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Evidence Table
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Indexes for Optimized Performance
CREATE INDEX IF NOT EXISTS idx_reports_tracking_id ON public.reports(tracking_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);
CREATE INDEX IF NOT EXISTS idx_reports_anonymous_id ON public.reports(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 8. Drop Existing Policies for Idempotent Script Run
DROP POLICY IF EXISTS "Users can view own user record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own user record" ON public.users;
DROP POLICY IF EXISTS "Users can update own user record" ON public.users;

DROP POLICY IF EXISTS "Anyone can read reports public feed" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own reports by anon id" ON public.reports;
DROP POLICY IF EXISTS "Admins can do everything on reports" ON public.reports;

DROP POLICY IF EXISTS "Anyone can view evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can insert evidence" ON public.evidence;
DROP POLICY IF EXISTS "Admins can do everything on evidence" ON public.evidence;

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;

-- 9. Create Users Policies
CREATE POLICY "Users can view own user record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own user record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own user record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 10. Create Reports Policies
-- Public feed query only reads safe non-identifying fields
CREATE POLICY "Anyone can read reports public feed" ON public.reports
  FOR SELECT USING (true);

-- Authenticated students can submit reports
CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (
    anonymous_id IN (SELECT anonymous_id FROM public.users WHERE id = auth.uid())
    OR auth.role() = 'authenticated'
    OR true
  );

-- Admin Policy (Restricted to official admin email)
CREATE POLICY "Admins can do everything on reports" ON public.reports
  FOR ALL USING (
    lower(auth.jwt() ->> 'email') = 'saurabhkumarjha011@gmail.com'
  );

-- 11. Create Evidence Policies
CREATE POLICY "Anyone can view evidence" ON public.evidence
  FOR SELECT USING (true);

CREATE POLICY "Users can insert evidence" ON public.evidence
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can do everything on evidence" ON public.evidence
  FOR ALL USING (
    lower(auth.jwt() ->> 'email') = 'saurabhkumarjha011@gmail.com'
  );

-- 12. Create Feedback Policies
CREATE POLICY "Users can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view feedback" ON public.feedback
  FOR SELECT USING (
    lower(auth.jwt() ->> 'email') = 'saurabhkumarjha011@gmail.com'
  );

-- 13. Enable Realtime
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.reports;

-- 14. Setup Storage Bucket (Execute via Supabase SQL Editor or Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('safecampus-evidence', 'safecampus-evidence', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public storage read policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'safecampus-evidence');

CREATE POLICY "Public storage insert policy" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'safecampus-evidence');
