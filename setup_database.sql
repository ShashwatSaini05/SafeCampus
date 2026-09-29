-- SafeCampus Complete Database Setup Script
-- Copy and paste this ENTIRE file into the Supabase SQL Editor and run it.

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  anonymous_id text NOT NULL UNIQUE,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id text UNIQUE NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL,
  status text DEFAULT 'Pending',
  location text,
  anonymous_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create Evidence Table
CREATE TABLE IF NOT EXISTS public.evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE,
  file_url text NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can insert evidence" ON public.evidence;
DROP POLICY IF EXISTS "Admins can do everything on reports" ON public.reports;

-- 6. Create Standard User Policies
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- Allow users to view their own reports
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (
  anonymous_id IN (SELECT anonymous_id FROM public.users WHERE id = auth.uid())
);

-- Allow users to insert their own reports
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (
  anonymous_id IN (SELECT anonymous_id FROM public.users WHERE id = auth.uid())
);

-- Allow users to insert & view evidence
CREATE POLICY "Users can view own evidence" ON public.evidence FOR SELECT USING (true);
CREATE POLICY "Users can insert evidence" ON public.evidence FOR INSERT WITH CHECK (true);

-- 7. Create Admin Policies (Restricted to specific email)
-- This allows the admin email to view and update ALL reports and evidence
CREATE POLICY "Admins can do everything on reports" ON public.reports 
FOR ALL USING (
  lower(auth.jwt() ->> 'email') = 'saurabhkumarjha011@gmail.com'
);

CREATE POLICY "Admins can do everything on evidence" ON public.evidence 
FOR ALL USING (
  lower(auth.jwt() ->> 'email') = 'saurabhkumarjha011@gmail.com'
);

-- 8. Enable Realtime for Reports
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE public.reports;
