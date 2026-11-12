# Rise Abroad Education — Global Higher Study & University Admission Management Portal

A full-stack, responsive **Next.js 16 (App Router)** web platform for **Rise Abroad Education** that unifies international university discovery, multi-step student application processing, counselor verification pipelines, role-based analytics dashboards, real-time support messaging, and Stripe tuition deposit payments.

---

## Live Links & Project Resources

| Resource | Link |
|---|---|
| **Project Name** | Rise Abroad Education |
| **Live Frontend URL** | [https://riseabroadedu.vercel.app](https://riseabroadedu.vercel.app) |
| **Live Backend URL** | [https://riseabroad-server.vercel.app](https://riseabroad-server.vercel.app) (`https://riseabroad-server.vercel.app/api/v1`) |
| **Frontend Repository** | [https://github.com/arafathussen/student-management-frontend-A7](https://github.com/arafathussen/student-management-frontend-A7) |
| **Backend Repository** | [https://github.com/arafathussen/student-management-backend-A6](https://github.com/arafathussen/student-management-backend-A6) |
| **API Documentation** | [https://documenter.getpostman.com/view/56453818/2sBYHXPxia](https://documenter.getpostman.com/view/56453818/2sBYHXPxia) |

---

## Website Overview & Core Features

### 1. Public Admissions & Discovery Portal
- **Landing Showcase (`/`):** Quick search bar paired with study destination country selector, live visa statistics & verified student success stories, latest partner university cards, higher study guides, and institutional portal benefits.
- **Global University Directory (`/universities` & `/universities/[id]`):** Filterable, URL-synced catalog by country, offer policy, and search keyword, with curated campus photography, tuition breakdowns, scholarship highlights, official program links, and a 3-step student application wizard.
- **Success Stories (`/success` & `/success/[id]`):** Dynamic student visa grant archive with country filtering, search, YouTube interview embeds, and detailed visa timelines.
- **Higher Study Guides (`/blogs` & `/blogs/[slug]`):** Structured scholarship, visa interview, and admission articles managed directly from the Admin CMS.
- **Services, About & Contact (`/services`, `/about`, `/contact`):** Overview of counseling services, agency governance pillars, global office locations, and contact inquiry desk.

### 2. Multi-Role Dashboards (RBAC)
- **Super Admin Command Center (`/admin`, `/admin/manage`, `/admin/reports`):**
  - Executive KPI overview and interactive Recharts visualizations (`BarChart`, `PieChart`, `AreaChart`).
  - Full CRUD management for Users, Partner Universities, Countries, Applications, Success Stories, Blogs/Guides, Home/Contact CMS settings, and Commission Ledgers.
  - **Super Admin Data & Backup Center:** Full JSON backup export/restore, manual database health ping, Supabase RLS guidance, and automated daily Vercel Cron keep-alive (`/api/keep-alive`).
- **Senior Counselor Desk (`/counselor`, `/counselor/earnings`, `/counselor/profile`):**
  - Assigned application verification workflow, document inspection, advisor notes, offer letter issuance, commission earnings tracking, and availability settings.
- **Student Applicant Portal (`/dashboard`, `/dashboard/payments`, `/dashboard/profile`, `/dashboard/settings`):**
  - Step-by-step application flight tracker and document checklist, official offer letter downloads, Stripe checkout fee deposits (`/payment/success` & `/payment/cancel`), official PDF receipts, and counselor support chat.

### 3. Security, Performance & UX
- **Authentication:** JWT session persistence, role-aware Edge Middleware (`src/middleware.ts`), Email 6-digit OTP verification, Password recovery flow, and Google OAuth 2.0 integration.
- **Responsive Design:** Desktop sidebar + mobile sticky navigation dock across all dashboard workflows, adaptive grids, skeleton loading states, and custom error/404 boundaries.

---

## One-Click Demo Login & RBAC Credentials

The [`/login`](https://riseabroadedu.vercel.app/login) page includes **One-Click Demo Login** buttons for instant evaluation across all 3 primary roles:

| Role | Email | Password | Primary Scope |
|---|---|---|---|
| **Super Admin** | `admin@university.com` | `AdminPassword123!` | Full system control, Analytics, CMS, User & University CRUD, Commissions, Data & Backup |
| **Senior Counselor** | `counselor@university.com` | `Counselor123!` | Application verification pipeline, Offer letters, Advisor availability, Earnings |
| **Student Applicant** | `arafat.student@gmail.com` | `Student123!` | Program applications, Document checklist, Stripe tuition deposits, Support chat |

---

## Technology Stack

- **Framework & Language:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling & UI:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Framer Motion
- **State & Validation:** TanStack Query v5, React Context (`AuthContext`), React Hook Form, Zod v4
- **Charts & Feedback:** Recharts (`BarChart`, `PieChart`, `AreaChart`), Sonner Toast Notifications
- **Integrations:** Express 5 / Prisma / PostgreSQL Backend API, Stripe Checkout (Test Mode), Google OAuth 2.0, Vercel Cron Jobs

---

## Application Routes

### Public Routes
- `/` — Landing Portal (Success Stories, Partner Universities, Higher Study Guides)
- `/universities` & `/universities/[id]` — Accredited University Catalog & Program Application Wizard
- `/success` & `/success/[id]` — Student Visa & Admission Success Archive
- `/services` — Admissions, Verification, Stripe & Visa Services
- `/blogs` & `/blogs/[slug]` — Higher Study Guides & Visa Handbooks
- `/contact` — Office Directory & Inquiry Submission
- `/about` — Institutional Overview & Accreditation Pillars

### Authentication & Recovery
- `/login` — Sign In with One-Click Demo Login (3 Roles) & Google OAuth
- `/register` — Student Registration with Country Code Picker
- `/verify-otp` — 6-Digit Email OTP Verification
- `/forgot-password` & `/reset-password` — Account Password Recovery

### Protected Dashboards & Payments
- **Super Admin / Admin:** `/admin`, `/admin/manage`, `/admin/reports`
- **Counselor:** `/counselor`, `/counselor/earnings`, `/counselor/profile`
- **Student:** `/dashboard`, `/dashboard/payments`, `/dashboard/profile`, `/dashboard/settings`
- **Payments & Automation:** `/payment/success`, `/payment/cancel`, `/api/keep-alive`

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env.local)
NEXT_PUBLIC_API_URL=https://riseabroad-server.vercel.app/api/v1
# (or http://localhost:5000/api/v1 when running backend locally)

# 3. Start development server
npm run dev

# 4. Run typecheck & production build
npx tsc --noEmit
npm run build
```
