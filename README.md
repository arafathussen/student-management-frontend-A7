# Rise Abroad Education — Global University Admission Management System (Frontend)

A modern, responsive fullstack Next.js 16 (App Router) frontend for **Rise Abroad Education**, engineered with TypeScript, Tailwind CSS v4, Radix UI / shadcn primitives, TanStack Query, React Hook Form + Zod, Recharts, Sonner, and Stripe Payment Integration.

---

## 🔗 Live Links & Documentation

- **Live Backend API:** `https://riseabroad-server.vercel.app/api/v1`
- **Backend Repository:** [student-management-backend-A6](https://github.com/arafathussen/student-management-backend-A6)
- **Interactive API Documentation:** [Postman Published Docs](https://documenter.getpostman.com/view/56453818/2sBYHXPxia)

---

## 🔐 One-Click Demo Login & RBAC Credentials (3 Roles)

The `/login` page includes **One-Click Demo Login** buttons for instant evaluation across all 3 primary roles:

| Role | Email | Password | Key Workflows |
|---|---|---|---|
| **Super Admin** | `admin@university.com` | `AdminPassword123!` | Analytics charts (`/admin`, `/admin/reports`), User & Resource CRUD (`/admin/manage`), Commission Ledger, CMS |
| **Senior Counselor** | `counselor@university.com` | `Counselor123!` | Application verification pipeline (`/counselor`), Offer letter issuance, Commission analytics (`/counselor/earnings`), Availability (`/counselor/profile`) |
| **Student Applicant** | `arafat.student@gmail.com` | `Student123!` | Multi-step program application wizard, Flight Tracker (`/dashboard`), Stripe tuition deposit (`/dashboard/payments`), Official PDF receipts |

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling & UI:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Framer Motion
- **Server State & Caching:** TanStack Query v5 (`@tanstack/react-query`)
- **Forms & Validation:** React Hook Form + `@hookform/resolvers` + Zod v4
- **Data Visualization:** Recharts (`BarChart`, `PieChart`, `AreaChart`)
- **Notifications:** Sonner Toast System
- **Authentication & Route Protection:** Next.js Edge Middleware (`src/middleware.ts`) + `AuthContext` + Google OAuth 2.0
- **Payment Gateway:** Stripe Checkout (Test Mode) with `/payment/success` & `/payment/cancel` flows

---

## 📄 Implemented Application Routes (24+ Pages)

### Public Pages
- `/` — Home / Landing Portal
- `/universities` — Global University Directory (URL-synced search, filters, sorting, pagination via `useSearchParams`)
- `/universities/[id]` — University Details & 3-Step Application Wizard
- `/services` — Admissions, Document Verification, Stripe & Visa Services
- `/about` — Institutional Overview, Accreditation & Governance Pillars
- `/blogs` & `/blogs/[slug]` — Higher Study Guides & Articles
- `/success` & `/success/[id]` — Student Visa & Admission Success Stories
- `/contact` — Global Office Directory & Inquiry Desk

### Authentication
- `/login` — Sign In with **One-Click Demo Login (3 Roles)**, Zod validation & Google OAuth
- `/register` — Student Registration with Country Code Picker & Zod validation
- `/verify-otp` — 6-Digit Email OTP Verification
- `/forgot-password` & `/reset-password` — Account Recovery Flow

### Role-Specific Protected Dashboards
- **Admin:** `/admin` (Command Center), `/admin/manage` (Resource & User CRUD), `/admin/reports` (Recharts Analytics & Financial Audit)
- **Counselor:** `/counselor` (Application & Document Desk), `/counselor/earnings` (Commission Analytics), `/counselor/profile` (Advisor Profile & Availability)
- **Student:** `/dashboard` (Application Flight Tracker & Checklist), `/dashboard/payments` (Stripe Invoices & PDF Receipts), `/dashboard/profile`, `/dashboard/settings`

### Payment & System Boundaries
- `/payment/success` — Stripe Payment Verification & Receipt Confirmation
- `/payment/cancel` — Stripe Checkout Cancellation & Retry Flow
- `src/app/loading.tsx` & `src/app/error.tsx` & `src/app/not-found.tsx` — Skeleton Loaders, Error Boundary & Custom 404

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env.local)
# NEXT_PUBLIC_API_URL=https://riseabroad-server.vercel.app/api/v1
# (or http://localhost:5000/api/v1 for local backend)

# 3. Start development server
npm run dev

# 4. Production build check
npm run build
```
