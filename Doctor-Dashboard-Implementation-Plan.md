# MediTrack — Doctor Patient Management Dashboard
## Full Implementation Plan (Frontend + Backend)

Reference: Medicezen-style dashboard (sidebar nav, stat cards, patient table, calendar, schedule timeline, charts).

---

## 1. Project Summary

A web application where a doctor logs in and gets a dashboard to:
- See KPIs (patients, appointments, beds/rooms if relevant, quick stats)
- Add/manage patients with symptoms, vitals, and conditions
- Get **AI-assisted analysis** (Gemini/OpenAI) of a patient's submitted symptoms — "possible cause / recommendation" shown after submission
- View patients in a **table** (name, ID, priority, start date, end date, status)
- Manage **Appointments** (today's appointments)
- Manage **Schedules** (patient treatment schedules, calendar/timeline view like the reference image)
- Manage **Billing** (generate/track invoices per patient)
- **Share a secure link** with a patient so they can view their own condition/reports (read-only patient portal)
- Visual analytics with **ECharts** and **Morris-style charts**

---

## 2. Tech Stack

### Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | **React (Vite)** | Fast dev server, matches "MERN" request |
| Routing | React Router v6 | Standard SPA routing |
| State/Data | **TanStack Query (React Query)** + Zustand | Server cache + light client state |
| Styling | Tailwind CSS + shadcn/ui | Matches clean card/dashboard aesthetic in the reference image |
| Charts | **ECharts (echarts-for-react)** + **Morris.js** (or `react-chartjs-2` as a safer modern alternative to Morris, which is unmaintained) | Requested explicitly |
| Calendar/Schedule | `FullCalendar` or a custom timeline (Gantt-style row per patient/day, like the reference image) | Matches the "Schedule" timeline UI |
| Forms | React Hook Form + Zod | Patient intake forms, validation |
| Auth client | `@supabase/supabase-js` | Talks to Supabase Auth directly from frontend |
| Icons | lucide-react | Matches icon style in reference |

### Backend
| Layer | Choice | Why |
|---|---|---|
| Runtime | **Node.js + Express** | Requested (the "N" and part of "E" in MERN) |
| Database | **Supabase (Postgres)** | Requested — replaces MongoDB in classic MERN |
| ORM/Query | Supabase JS client (server-side, service-role key) or **Prisma** pointed at Supabase's Postgres connection string | Prisma gives type-safe migrations if you want stronger schema control |
| Auth | **Supabase Auth** (email/password + magic link) | One system for doctor login AND patient share-links |
| File storage | **Supabase Storage** | Patient reports, scanned documents, profile photos |
| Realtime | **Supabase Realtime** | Live updates to schedule/patient status without polling |
| AI | **Gemini API** or **OpenAI API** (your key) called **server-side only** | Never expose the key in frontend |
| Jobs/Queue (optional, Phase 2) | BullMQ + Redis (Upstash) | For sending reminder emails/SMS for appointments |
| Email/SMS (optional) | Resend / Twilio | Appointment reminders, patient link delivery |
| Hosting | Frontend → Vercel/Netlify; Backend → Render/Railway; DB → Supabase | Free-tier friendly, quick to ship |
| Payments (Billing) | Stripe or Razorpay (if real payments needed) — otherwise Billing module is just internal invoice tracking, no payment gateway | Depends on scope |

**Note on "MERN":** since you're using Supabase (Postgres) instead of MongoDB, the stack becomes effectively **PERN-with-Supabase** (Postgres, Express, React, Node) with Supabase handling Auth/Storage/Realtime on top — this keeps everything you asked for (Express + Node + React) while getting Supabase's built-in auth, RLS security, and realtime for free.

---

## 3. High-Level Architecture

```
┌────────────────────┐        HTTPS/REST        ┌──────────────────────┐
│   React Frontend    │ ───────────────────────▶ │  Express API Server   │
│  (Doctor Dashboard)  │ ◀─────────────────────── │  (Node.js)             │
└─────────┬───────────┘                          └──────────┬───────────┘
          │  Direct (Auth, Realtime,                         │
          │  simple reads via RLS)                           │  Service-role
          ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase                                  │
│  - Postgres DB (patients, appointments, schedules, billing...)   │
│  - Auth (doctor accounts + patient magic-link accounts)          │
│  - Storage (reports, avatars)                                    │
│  - Realtime (push updates to dashboard)                          │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │  Gemini / OpenAI API        │
                     │  (symptom → analysis)       │
                     │  called ONLY from Express    │
                     └───────────────────────────┘

┌────────────────────────┐
│  Patient Portal (React)  │  ← opened via secure shared link (magic link/token)
│  Read-only view of own    │
│  condition + reports       │
└────────────────────────┘
```

**Rule of thumb:** simple authenticated reads (dashboard lists, chart data) can go straight from React → Supabase using Row Level Security (RLS) policies. Anything sensitive/compute-heavy (AI calls, billing calculations, generating share-links, sending emails) goes through the Express API using the Supabase **service role key**, which never touches the browser.

---

## 4. Database Schema (Supabase / Postgres)

```sql
-- Doctors (extends Supabase auth.users)
create table doctors (
  id uuid primary key references auth.users(id),
  full_name text not null,
  specialty text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Patients
create table patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) not null,
  full_name text not null,
  gender text,
  age int,
  ward_no text,
  priority text check (priority in ('Low','Medium','High')) default 'Medium',
  status text check (status in ('Active','Recovered','Critical','Discharged')) default 'Active',
  phone text,
  email text,             -- used to send the patient their portal link
  start_date date,
  end_date date,
  avatar_url text,
  created_at timestamptz default now()
);

-- Symptoms / condition entries (one patient can have many entries over time)
create table patient_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) not null,
  doctor_id uuid references doctors(id) not null,
  symptoms text not null,          -- free text entered by doctor
  vitals jsonb,                    -- { bp, temp, pulse, spo2, weight ... }
  notes text,
  ai_summary text,                 -- AI-generated possible cause/recommendation
  ai_raw_response jsonb,           -- full API response for audit
  recorded_at timestamptz default now()
);

-- Appointments (today/upcoming visits)
create table appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) not null,
  patient_id uuid references patients(id) not null,
  appointment_date date not null,
  start_time time not null,
  end_time time,
  reason text,
  status text check (status in ('Scheduled','Completed','Cancelled','No-show')) default 'Scheduled',
  created_at timestamptz default now()
);

-- Treatment schedules (the Gantt/timeline rows in the reference image:
-- "Check up patient", "Lunch Break", "Heart Surgery" etc.)
create table schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) not null,
  patient_id uuid references patients(id),   -- nullable for non-patient blocks e.g. Lunch Break
  title text not null,
  schedule_date date not null,
  start_time time not null,
  end_time time not null,
  type text check (type in ('Checkup','Surgery','Therapy','Break','Evaluation','Other')),
  created_at timestamptz default now()
);

-- Billing
create table invoices (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) not null,
  patient_id uuid references patients(id) not null,
  items jsonb not null,             -- [{description, qty, unit_price}]
  total_amount numeric not null,
  status text check (status in ('Paid','Pending','Overdue')) default 'Pending',
  issued_date date default now(),
  due_date date,
  created_at timestamptz default now()
);

-- Shared patient portal links
create table patient_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) not null,
  token text unique not null,       -- random secure token
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
```

**Row Level Security (RLS):** enable RLS on every table; policy = `doctor_id = auth.uid()` for doctor-facing tables, and a separate policy on `patients`/`patient_records` allowing read-only access when the request carries a valid, non-expired `patient_links.token` (checked via a Postgres function), so patients never need a full account.

---

## 5. Authentication & Sharing Flow

1. **Doctor login/signup** — Supabase Auth (email/password). On first login, a row is created in `doctors`.
2. **Patient link sharing** (the "share to patient" feature):
   - Doctor clicks **"Share with patient"** on a patient's profile.
   - Express endpoint `POST /api/patients/:id/share-link` generates a signed token, stores it in `patient_links` with an expiry (e.g. 7 days), and returns a URL like:
     `https://meditrack.app/patient/view/:token`
   - Optionally emails the link to `patients.email` via Resend.
   - The patient opens the link → a **read-only Patient Portal** page fetches their own condition/records/reports by validating the token server-side — **no login required**, or optionally upgraded to a lightweight magic-link Supabase account for returning patients.
3. Tokens are single-purpose and scoped only to that patient's data — never expose the doctor's data.

---

## 6. AI Symptom Analysis Flow (Gemini/OpenAI)

1. Doctor fills the **"Add Patient Record"** form: symptoms, vitals, notes.
2. On submit, frontend calls `POST /api/patients/:id/records`.
3. Express server:
   - Saves the record to `patient_records`.
   - Builds a structured prompt, e.g.:
     *"Given these patient symptoms and vitals: {...}, list 3 possible causes ranked by likelihood, recommended next diagnostic steps, and red-flag symptoms to watch for. This is decision support only, not a diagnosis."*
   - Calls Gemini (`generateContent`) or OpenAI (`/chat/completions`) **with your API key stored in an environment variable on the server**, never in frontend code.
   - Stores the response in `ai_summary` / `ai_raw_response` and returns it to the frontend.
4. Frontend displays the AI suggestion as a distinct "AI Insight" card on the patient profile, clearly labeled **"AI-generated — for reference only, confirm with clinical judgement."**
5. This keeps your API key private and lets you swap Gemini ⇄ OpenAI by changing one service file (`/services/aiService.js`) without touching the frontend.

---

## 7. Frontend Page/Component Breakdown

```
/src
 ├─ /components
 │   ├─ layout/ (Sidebar, Topbar, PageWrapper)
 │   ├─ cards/ (StatCard, PatientRow, AppointmentCard)
 │   ├─ charts/ (EChart wrappers, MorrisChart wrappers)
 │   ├─ calendar/ (MiniCalendar, ScheduleTimeline)
 │   └─ forms/ (PatientForm, RecordForm, InvoiceForm)
 ├─ /pages
 │   ├─ Login.jsx
 │   ├─ Dashboard.jsx        → stat cards + patient table preview + calendar + schedule + charts
 │   ├─ Patients.jsx         → full patient table (Name, Ward No, Priority, Start/End date) + Add/Edit modal
 │   ├─ PatientProfile.jsx   → history, vitals over time, AI insight, "Share link" button
 │   ├─ Appointments.jsx     → today's appointments list/board
 │   ├─ Schedules.jsx        → weekly timeline (like reference image row-per-day)
 │   ├─ Billing.jsx          → invoice list, create/edit invoice, status filter
 │   ├─ Analytics.jsx        → ECharts + Morris/Chart.js visualizations (patient trends, priority distribution, revenue)
 │   └─ Settings.jsx
 └─ /portal
     └─ PatientView.jsx      → token-based read-only page for patients
```

**Dashboard.jsx layout (mirrors the reference image):**
- Top: greeting + notification/profile icons
- Row of stat cards (Patients, Appointments Today, Critical Cases, Revenue)
- Patient list preview (table) + Calendar widget side-by-side
- Schedule timeline strip (hour columns × day rows, color-coded blocks)
- Analytics row: ECharts (e.g., patient inflow trend, line/area) + Morris/Chart.js (e.g., priority distribution donut, recovery rate bar)

---

## 8. Backend API Endpoints (Express)

```
Auth
  POST   /api/auth/login              (delegates to Supabase, or supabase-js used directly from frontend)

Patients
  GET    /api/patients                 list (filters: status, priority, search)
  POST   /api/patients                 create
  GET    /api/patients/:id             detail + records history
  PUT    /api/patients/:id             update
  DELETE /api/patients/:id
  POST   /api/patients/:id/records     add symptoms/vitals → triggers AI analysis
  POST   /api/patients/:id/share-link  generate patient portal link

Appointments
  GET    /api/appointments?date=today
  POST   /api/appointments
  PUT    /api/appointments/:id
  DELETE /api/appointments/:id

Schedules
  GET    /api/schedules?week=...
  POST   /api/schedules
  PUT    /api/schedules/:id
  DELETE /api/schedules/:id

Billing
  GET    /api/invoices
  POST   /api/invoices
  PUT    /api/invoices/:id
  GET    /api/invoices/:id/pdf         (optional: generate PDF invoice)

AI
  POST   /api/ai/analyze               (internal, called by records endpoint)

Patient Portal (token-based, no auth header)
  GET    /api/portal/:token            returns that patient's own record summary
```

---

## 9. Charts Implementation Notes

- **ECharts** (`echarts-for-react`): use for the line/area trend (e.g., patients treated per day/month) and a stacked bar (appointments by type). Theme colors pulled from Tailwind config to match the dashboard palette.
- **Morris.js** is unmaintained (last updated years ago) and can break on modern bundlers — recommend either:
  - keeping Morris only for the simple donut/bar shown in the reference (feasible, but flag the risk), **or**
  - substituting `react-chartjs-2` (Chart.js) for the same visual result with active maintenance.
  I'll build it with **Morris.js first since you asked for it explicitly**, and note the fallback in the code comments.
- Both chart sets fetch from `GET /api/analytics/*` endpoints that pre-aggregate data server-side (avoid heavy client-side computation).

---

## 10. Security & Compliance Notes
*(Not legal advice — consult a compliance professional if handling real patient data.)*

- Enforce RLS on every Supabase table; never rely on frontend checks alone.
- Store AI API keys only in backend `.env` (Express) — never in Vite `.env` (which ships to the browser).
- Encrypt patient share-link tokens, set short expiry, allow doctor to revoke a link.
- Log all AI requests/responses for audit (`ai_raw_response` column already included).
- If this will hold real health data, review HIPAA/local health-data regulations before production launch — this affects hosting region, encryption-at-rest, and audit logging requirements.

---

## 11. Suggested Build Phases

| Phase | Scope |
|---|---|
| **1. Foundation** | Supabase project + schema, doctor auth, project scaffolding (Vite + Express), deploy skeleton |
| **2. Core CRUD** | Patients table/CRUD, Appointments, Schedules — matching the reference UI |
| **3. Dashboard & Charts** | Stat cards, calendar widget, schedule timeline, ECharts + Morris charts wired to real data |
| **4. AI Integration** | Symptom/vitals form → Express → Gemini/OpenAI → AI Insight card |
| **5. Patient Sharing** | Share-link generation, patient portal page, optional email delivery |
| **6. Billing** | Invoice CRUD, status tracking, optional PDF export |
| **7. Polish & Deploy** | RLS hardening, loading/error states, responsive layout, production deploy |

---

## 12. Folder Structure (repo layout)

```
/meditrack
 ├─ /frontend        (Vite + React)
 │   └─ src/... (as above)
 ├─ /backend         (Express)
 │   ├─ /routes
 │   ├─ /controllers
 │   ├─ /services     (aiService.js, supabaseAdmin.js, emailService.js)
 │   ├─ /middleware   (authMiddleware.js verifies Supabase JWT)
 │   └─ server.js
 └─ /supabase
     └─ schema.sql   (the SQL from section 4)
```

---

## Next Steps
Tell me which phase you want to start building first — I'd suggest **Phase 1 + 2** (Supabase schema + Patients CRUD + basic dashboard) so you have something running end-to-end fast, then layer in AI and sharing. When you're ready to wire up the AI call, share which API (Gemini or OpenAI) you're using and I'll write the exact `aiService.js` for it.
