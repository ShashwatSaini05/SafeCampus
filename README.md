# SafeCampus – Verified Anonymous Campus Safety Reporting Platform

> A production-ready full-stack web application for COER University students to report safety incidents anonymously.

## Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your Supabase credentials in .env
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
# .env.local is already configured for local dev
npm run dev
# App runs on http://localhost:3000
```

### 3. Setup Supabase Database
- Create a new Supabase project
- Run `backend/src/db/schema.sql` in the SQL Editor
- Create a storage bucket named `safecampus-evidence` (set to public)
- Copy your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `backend/.env`

### 4. Seed Demo Data (Optional)
```bash
cd backend
npm run seed
```

---

## Authentication Flow

1. User enters `@coeruniversity.ac.in` email — all other domains rejected
2. OTP sent to email (logs to console in dev mode if SMTP not configured)
3. After OTP verification → assigned anonymous ID like `User-X92K`
4. All reports linked only to anonymous ID — **email never exposed**

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, live feed, rights, case studies |
| Auth | `/auth` | 3-step email → OTP → success verification |
| Report | `/report` | 4-step report form with AI classification |
| Track | `/track` | Status timeline by tracking ID |
| Admin | `/admin` | Dashboard with analytics + report management |

---

## Default Admin Credentials

```
Secret: safecampus-admin-secret-2024
```
Change this in `backend/.env` → `ADMIN_SECRET`

---

## Project Structure

```
Safe Campus/
├── frontend/              # Next.js 14 + TypeScript + Tailwind v4
│   ├── app/
│   │   ├── page.tsx       # Homepage
│   │   ├── auth/          # Verification wizard
│   │   ├── report/        # Report submission
│   │   ├── track/         # Status tracker
│   │   └── admin/         # Admin dashboard
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── LiveFeed.tsx   # Auto-scrolling cards
│   │   ├── ReportCard.tsx
│   │   └── SOSButton.tsx  # Floating emergency button
│   └── lib/
│       ├── api.ts         # Axios API client
│       └── store.ts       # Zustand auth store
│
└── backend/               # Express.js + TypeScript
    └── src/
        ├── routes/        # auth, reports, admin, upload
        ├── middleware/    # JWT + admin auth
        ├── lib/           # supabase, mailer, AI classifier
        └── db/            # schema.sql + seed.ts
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/send-otp` | — | Send OTP to college email |
| POST | `/api/auth/verify-otp` | — | Verify OTP, get token + anon ID |
| GET | `/api/reports` | — | Public paginated feed |
| GET | `/api/reports/track/:id` | — | Track by tracking ID |
| POST | `/api/reports` | JWT | Submit anonymous report |
| POST | `/api/reports/sos` | JWT | Emergency SOS report |
| POST | `/api/reports/classify` | — | AI category + priority preview |
| GET | `/api/admin/reports` | Admin | All reports with filters |
| PATCH | `/api/admin/reports/:id` | Admin | Update status/priority |
| GET | `/api/admin/analytics` | Admin | KPIs + trend data |
| POST | `/api/upload/evidence` | JWT | Upload file (base64) |

---

## AI Classification

Reports are automatically classified using keyword matching:
- **Categories**: ragging, harassment, safety, other
- **Priority**: High / Medium / Low based on urgency keywords (e.g., "emergency", "attack", "bleeding")

---

## 🆘 Emergency Contacts

- National Emergency: **112**
- Anti-Ragging Helpline: **1800-180-5522**
- UGC Helpline: **1800-111-656**
