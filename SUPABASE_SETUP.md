# SafeCampus – Supabase Setup Guide

This document outlines the configuration and manual steps required to set up Supabase for **SafeCampus**.

---

## 1. Environment Variables Configuration

Copy the following variables into your `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ADMIN_SECRET=safecampus-admin-secret-2024
NEXT_PUBLIC_SUPABASE_URL=https://drtgbdnftbrgleueivsa.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FOk52Z_r_4R0RqxjOCPNmw_cFnkBpA9
```

---

## 2. Supabase Dashboard Manual Setup Checklist

### A. Run Database Schema & RLS Policies
1. Open your **Supabase Dashboard** ➔ **SQL Editor**.
2. Copy the entire contents of `supabase/schema.sql`.
3. Paste into the SQL Editor and click **Run**.

### B. Authentication & Magic Link Settings
1. Go to **Authentication** ➔ **Providers** ➔ **Email**.
2. Enable **Email** provider.
3. Make sure **Enable Passwordless Sign-in (Magic Link)** is toggled ON.
4. Set **Site URL** and **Redirect URLs** under **Authentication** ➔ **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Additional Redirect URLs: `http://localhost:3000/auth/callback`

### C. Storage Bucket Setup
1. Go to **Storage** in the Supabase Sidebar.
2. Create a bucket named `safecampus-evidence`.
3. Set the bucket to **Public**.

---

## 3. Architecture & Privacy Guarantee

- **Authentication**: Email Magic Link sent to `@coeruniversity.ac.in`.
- **Anonymity**: Every verified student is assigned a unique `anonymous_id` (e.g., `SC-7F4K92`). Reports display only the `anonymous_id`. Real email addresses are never rendered publicly or on report cards.
- **Row Level Security (RLS)**: Enforced directly at the PostgreSQL layer.
