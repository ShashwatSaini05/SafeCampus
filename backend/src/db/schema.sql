-- SafeCampus Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Users table (stores verified college students)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_verified boolean default false,
  anonymous_id text unique,
  created_at timestamptz default now()
);

-- OTP codes table (for email verification)
create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- Reports table (anonymous safety reports)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  category text not null check (category in ('ragging', 'harassment', 'safety', 'other')),
  description text not null,
  location text,
  status text default 'Pending' check (status in ('Pending', 'Under Review', 'Resolved')),
  priority text default 'Low' check (priority in ('Low', 'Medium', 'High')),
  anonymous_id text references users(anonymous_id) on delete set null,
  created_at timestamptz default now()
);

-- Evidence table (file attachments for reports)
create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  file_url text not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_reports_status on reports(status);
create index if not exists idx_reports_category on reports(category);
create index if not exists idx_reports_priority on reports(priority);
create index if not exists idx_reports_created_at on reports(created_at desc);
create index if not exists idx_reports_tracking_id on reports(tracking_id);
create index if not exists idx_otp_codes_email on otp_codes(email);

-- Row Level Security (RLS) -- Enable basic RLS
alter table users enable row level security;
alter table reports enable row level security;
alter table evidence enable row level security;
alter table otp_codes enable row level security;

-- Allow service role to bypass RLS (for backend)
-- All operations are done via service role key which bypasses RLS

-- Create Supabase Storage bucket for evidence
-- Run this separately or via Supabase dashboard:
-- insert into storage.buckets (id, name, public) values ('safecampus-evidence', 'safecampus-evidence', true);
