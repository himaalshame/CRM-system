# Revised Product Plan: Business Website + Private CRM

**Date:** 2026-10-15  
**Status:** Pending Review & Approval  
**Existing Project:** `D:\crm_project` (Nexa CRM v2.3.0)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [What Can Be Reused](#3-what-can-be-reused)
4. [What Needs Fixing First](#4-what-needs-fixing-first)
5. [Public Website Plan](#5-public-website-plan)
6. [Private CRM Dashboard Plan](#6-private-crm-dashboard-plan)
7. [Website ↔ CRM Connection](#7-website--crm-connection)
8. [Database & API Changes](#8-database--api-changes)
9. [Internationalization & RTL](#9-internationalization--rtl)
10. [Design Direction](#10-design-direction)
11. [Prioritized Implementation Plan](#11-prioritized-implementation-plan)
12. [V1 vs Future Features](#12-v1-vs-future-features)
13. [Uncommitted Work Assessment](#13-uncommitted-work-assessment)

---

## 1. Executive Summary

The existing project is a functional CRM with a React 19 + Vite + Tailwind CSS frontend and an Express 5 + Prisma 7 + PostgreSQL backend. It has solid foundations: JWT auth, role-based access, layered architecture, and a clean service-oriented structure. However, it was built as an internal CRM tool -- not as a public-facing business website.

This plan transforms it into a **dual-mode application**:

- **Public mode:** A premium, Arabic-first business website showcasing web development services, portfolio, and contact options.
- **Private mode:** A fully functional CRM dashboard for managing clients, services, orders, projects, and employees.

The key architectural decision is to **reuse the existing backend and database** while **rebuilding the public frontend** from scratch, adding a **Lead model** for incoming service requests, and implementing **full i18n with RTL support** across both public and private interfaces.

---

## 2. Current State Assessment

### 2.1 Technology Stack (Confirmed)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19 |
| Build Tool | Vite | 6 |
| Language | TypeScript | 5.7 |
| CSS Framework | Tailwind CSS | 4 |
| Routing | React Router | 7 |
| HTTP Client | Axios | 1.20+ |
| Charts | ApexCharts | 4.1 |
| Backend Framework | Express | 5 |
| ORM | Prisma | 7 (driver adapters) |
| Database | PostgreSQL | -- |
| Auth | JWT (jsonwebtoken) + bcrypt | -- |
| Validation | Zod | 4.5 |

### 2.2 What Already Works Well

- **Layered backend architecture:** Route → Middleware → Controller → Service → Prisma. Clean separation of concerns.
- **JWT authentication** with role-based authorization (ADMIN / EMPLOYEE / CLIENT).
- **Soft delete pattern** (isActive flag) for clients, employees, and services.
- **Order → Project lifecycle:** Orders can be created, approved, and automatically generate projects.
- **Data scoping:** Employees see only assigned projects; clients see only their own orders/projects.
- **Dashboard statistics** endpoint with real data aggregation.
- **Public services listing** and detail pages (functional but CRM-branded).
- **Dark mode** with full theme toggle support.
- **Component library:** Buttons, modals, forms, tables, alerts, badges, avatars, charts, calendar, etc.

### 23 Critical Issues Found

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **No i18n / RTL support** | Critical | All UI is English-only. No Arabic, no RTL layout, no language switcher. |
| 2 | **Fake statistics on public pages** | Critical | Home page shows "500+ Happy Clients", "1.2k Projects", "5+ Years" -- all invented. Violates the "do not invent" requirement. |
| 3 | **No lead/contact model** | Critical | No `Lead`, `ServiceRequest`, or `ContactRequest` model exists. Visitors cannot submit service requests without logging in. |
| 4 | **Route mismatch** | High | Nav links point to `/explore/services` but routes are defined as `/services`. Results in 404. |
| 5 | **No Portfolio page** | High | Required by spec. Does not exist. |
| 6 | **No About page** | High | Required by spec. Does not exist. |
| 7 | **No Contact page** | High | Required by spec. Does not exist. |
| 8 | **No public service request form** | High | Current "Request Service" button requires login. Visitors cannot describe their needs. |
| 9 | **Currency inconsistency** | Medium | Service prices display as `$` on home page but as `EGP` on services page. |
| 10 | **Branding is CRM-centric** | Medium | "Nexa CRM" branding everywhere. Public site should be a web development business, not a CRM product. |
| 11 | **No tests** | Medium | Zero test coverage. No testing framework installed. |
| 12 | **Hardcoded API URL** | Medium | Frontend uses `http://localhost:5000` hardcoded. No environment config. |
| 13 | **Settings page deleted** | Medium | Uncommitted deletion of `Settings.tsx`. Need to investigate. |
| 14 | **No email integration** | Low | Contact form and service requests have no email notification capability. |

### 2.4 Git State

- Branch: `main` (up to date with origin)
- **5 uncommitted changes:**
  - `frontend/index.html` (modified)
  - `frontend/src/App.tsx` (modified)
  - `frontend/src/index.css` (modified)
  - `frontend/src/layout/AppSidebar.tsx` (modified)
  - `frontend/src/pages/Settings/Settings.tsx` (deleted)

---

## 3. What Can Be Reused

### 3.1 Backend (Mostly Reusable)

| Component | Reuse Status | Notes |
|-----------|-------------|-------|
| Express app structure | ✅ Fully reusable | Clean layered architecture |
| JWT auth middleware | ✅ Fully reusable | Role-based, well-structured |
| Prisma client & config | ✅ Fully reusable | Driver adapter pattern |
| Validation (Zod) | ✅ Fully reusable | Already in place |
| Error handling middleware | ✅ Fully reusable | Centralized error handler |
| Service layer pattern | ✅ Fully reusable | Clean separation |
| Controller pattern | ✅ Fully reusable | Standard REST |
| Service CRUD | ✅ Fully reusable | Services, pricing, activation |
| Order lifecycle | ✅ Fully reusable | PENDING → APPROVED → Project |
| Project management | ✅ Fully reusable | Status tracking, assignments |
| Client management | ✅ Fully reusable | CRUD, soft delete |
| Employee management | ✅ Fully reusable | CRUD, assignments |
| Dashboard stats | ✅ Fully reusable | Real data aggregation |

### 3.2 Frontend (Partially Reusable)

| Component | Reuse Status | Notes |
|-----------|-------------|-------|
| Auth context & hooks | ✅ Fully reusable | JWT login/logout |
| ProtectedRoute / RoleRoute | ✅ Fully reusable | Route guards |
| AppLayout, Sidebar, Header | ✅ Fully reusable | Dashboard shell |
| UI components (button, modal, etc.) | ✅ Fully reusable | Well-built component library |
| Chart components | ✅ Fully reusable | ApexCharts integration |
| Table components | ✅ Fully reusable | Reusable data tables |
| Theme system (dark/light) | ✅ Fully reusable | Tailwind dark mode |
| Form components | ✅ Fully reusable | Input, Select, DatePicker |
| API service layer | ✅ Fully reusable | Axios-based, interceptors |
| **Public pages** | ❌ Rebuild from scratch | CRM-branded, wrong content, fake stats |
| **Navigation/routing** | ❌ Restructure | Need new routes for all public pages |
| **Home page** | ❌ Rebuild from scratch | Fake stats, CRM messaging |
| **i18n system** | 🆕 Build new | No existing i18n |

### 3.3 Database (Mostly Reusable)

| Model | Reuse Status | Notes |
|-------|-------------|-------|
| User | ✅ Keep as-is | Auth accounts |
| Employee | ✅ Keep as-is | Employee profiles |
| Client | ✅ Keep as-is | Client profiles |
| Order | ✅ Keep as-is | Order workflow |
| Service | ✅ Keep as-is | Service catalog |
| OrderItem | ✅ Keep as-is | Line items |
| Project | ✅ Keep as-is | Project tracking |
| ProjectEmployee | ✅ Keep as-is | Assignments |
| **Lead (new)** | 🆕 Create new | Incoming service requests |

---

## 4. What Needs Fixing First

These are **blocking issues** that must be resolved before or during development:

### 4.1 Fix Route Mismatch (Immediate)

**Problem:** Navigation links use `/explore/services` but routes are defined as `/services`. Clicking "Services" in the nav leads to a 404.

**Fix:** Standardize all public routes to a single convention. Recommendation: remove the `/explore` prefix and use `/services` consistently.

### 4.2 Investigate Uncommitted Settings Deletion

**Problem:** `frontend/src/pages/Settings/Settings.tsx` was deleted but the change is uncommitted. This could be intentional or accidental.

**Action:** Review the deleted file's content from git history. If it contained useful admin settings, restore it. If it was intentionally removed, document why.

### 4.3 Remove All Fake Statistics

**Problem:** The public home page displays invented metrics: "500+ Happy Clients", "1.2k Projects Delivered", "5+ Years of Trust". The services page shows "98% Client Satisfaction" and "Avg. Delivery 2-4 Weeks" (the latter may be reasonable as a general estimate, not a fabricated result).

**Fix:** Remove all invented statistics. If stats are shown, they must come from real database queries via the dashboard stats endpoint.

### 4.4 Standardize Currency Display

**Problem:** Home page shows `$` prefix, services page shows `EGP`. Both are inconsistent.

**Fix:** Use a centralized currency formatting utility. Default to EGP with proper Arabic formatting when locale is Arabic.

---

## 5. Public Website Plan

### 5.1 Pages to Create

| Page | Route | Description | Priority |
|------|-------|-------------|----------|
| Home | `/` | Hero with value proposition, services preview, CTA. No fake stats. | P0 |
| Services | `/services` | Full service catalog from database | P0 |
| Service Detail | `/services/:id` | Individual service with pricing | P0 |
| Portfolio | `/portfolio` | Showcase completed projects (using real project data) | P0 |
| About | `/about` | Business introduction, team, approach | P0 |
| Contact | `/contact` | Contact form, email, phone, location | P0 |
| Service Request | `/request` | Form for visitors to describe project needs | P0 |

### 5.2 Pages to Improve

| Page | Route | What to Change |
|------|-------|----------------|
| PublicHome | `/` | Complete rebuild: remove CRM branding, remove fake stats, add business-focused value proposition |
| PublicServices | `/services` | Rebrand, improve layout, ensure pricing consistency |
| PublicServiceDetail | `/services/:id` | Rebrand, add service request CTA |
| SignIn | `/login` | Keep functionality, restyle for dual-mode context |
| SignUp | `/register` | Keep functionality, restyle. Note: public registration creates CLIENT role accounts |

### 5.3 Home Page Content Strategy

Since we cannot invent testimonials, statistics, or credentials:

- **Hero:** Clear value proposition: "We build professional websites and digital solutions for businesses" -- focused on what you do, not fabricated metrics.
- **Services Preview:** Pull 3 real services from the database.
- **Why Choose Us:** Focus on process/approach, not invented numbers.
- **CTA:** "Request a Service" → leads to the service request form.
- **No testimonials section** (or a placeholder that clearly indicates it will be populated with real client feedback in the future).

### 5.4 Portfolio Page Strategy

- Pull real completed projects from the database (projects with status COMPLETED).
- Display project name, description, completion date, and services used.
- If no completed projects exist yet, show a professional "Coming Soon" state with a note that the portfolio is being populated.

### 5.5 About Page Strategy

- Professional business introduction.
- Focus on approach, methodology, and expertise.
- Team section (pull from Employee model, but only show what the admin has added).
- No invented credentials or certifications.

### 5.6 Contact Page Strategy

- Contact form (name, email, phone, message).
- Stores submissions as Lead records in the CRM.
- Display contact information (email, phone, location) that the admin can configure in settings.

---

## 6. Private CRM Dashboard Plan

### 6.1 What to Preserve

All existing CRM pages and functionality:

| Page | Route | Access | Status |
|------|-------|--------|--------|
| Dashboard | `/dashboard` | All authenticated | Keep, add i18n |
| Clients | `/clients` | Admin, Employee | Keep, add i18n |
| Employees | `/employees` | Admin | Keep, add i18n |
| Projects | `/projects` | All authenticated | Keep, add i18n |
| Orders | `/orders` | All authenticated | Keep, add i18n |
| Services | `/dashboard/services` | All authenticated | Keep, add i18n |
| **Leads** | `/leads` | Admin, Employee | **New page** |
| Settings | `/settings` | Admin | **Restore + improve** |

### 6.2 New CRM Features Needed

| Feature | Route | Description | Priority |
|---------|-------|-------------|----------|
| Leads Management | `/leads` | Review, update status, convert to client/order | P0 |
| Lead Detail | `/leads/:id` | View full lead details, notes, status history | P0 |
| Convert Lead | Action on lead detail | Create Client + Order from approved lead | P1 |
| Settings | `/settings` | Business info, contact details, email config | P1 |

### 6.3 CRM Improvements

- **i18n support:** All labels, status values, notifications, table headers, form labels in both Arabic and English.
- **RTL layout:** When Arabic is selected, the entire dashboard should switch to RTL.
- **Language switcher:** Visible in the dashboard header.
- **Lead status workflow:** NEW → CONTACTED → QUALIFIED → CONVERTED / ARCHIVED.

---

## 7. Website ↔ CRM Connection

### 7.1 Lead Workflow

```
Visitor submits service request (public form)
    ↓
Lead record created in database (status: NEW)
    ↓
Admin/Employee reviews lead in CRM Leads page
    ↓
Admin contacts the potential client
    ↓
Admin updates lead status (CONTACTED → QUALIFIED)
    ↓
Upon agreement: Admin converts lead → creates Client + Order
    ↓
Order approval → Project creation → Normal CRM workflow
```

### 7.2 Lead Model Design

A dedicated `Lead` model is necessary because:

1. **Different lifecycle:** Leads have their own status workflow (NEW → CONTACTED → QUALIFIED → CONVERTED / ARCHIVED) that doesn't match Order or Client statuses.
2. **No user account:** Leads are from visitors who don't have user accounts. They can't be forced into the User/Client model.
3. **Conversion tracking:** We need to track when a lead becomes a client and link them.
4. **Source tracking:** Knowing where leads came from (which service page, contact form, etc.) is valuable.
5. **Different data:** Leads need fields like "project description", "budget range", "preferred contact method" that don't exist in the Client model.

### 7.3 Security Considerations

- Public service request form **must not** require authentication.
- Lead data is **only accessible** to ADMIN and EMPLOYEE roles.
- Form must include rate limiting and basic spam protection.
- No sensitive CRM data should be exposed through public API endpoints.

---

## 8. Database & API Changes

### 8.1 New Lead Model (Proposed Schema)

```prisma
model Lead {
  id                String   @id @default(uuid())
  name              String
  email             String
  phone             String?
  company           String?
  serviceId         String?  @map("service_id")
  source            LeadSource @default(WEBSITE)
  status            LeadStatus @default(NEW)
  projectDescription String? @map("project_description")
  budgetRange       String?  @map("budget_range")
  preferredContact  String?  @map("preferred_contact")
  notes             String?
  convertedClientId String?  @unique @map("converted_client_id")
  convertedOrderId  String?  @unique @map("converted_order_id")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  service           Service? @relation(fields: [serviceId], references: [id])
  convertedClient   Client?  @relation(fields: [convertedClientId], references: [id])
  convertedOrder    Order?   @relation(fields: [convertedOrderId], references: [id])

  @@map("leads")
}

enum LeadSource {
  WEBSITE
  CONTACT_FORM
  PHONE
  REFERRAL
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  ARCHIVED
}
```

### 8.2 New API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/leads` | **Public** | Submit new service request from website |
| GET | `/leads` | Admin, Employee | List all leads |
| GET | `/leads/:id` | Admin, Employee | Get lead details |
| PATCH | `/leads/:id` | Admin, Employee | Update lead status/notes |
| DELETE | `/leads/:id` | Admin | Delete lead |
| POST | `/leads/:id/convert` | Admin | Convert lead to client + order |

### 8.3 Existing API Changes

- **GET `/services`** (public): Already works. Ensure it returns all necessary fields for the public site.
- **No changes** to existing Client, Order, Project, Employee, or Auth endpoints.

### 8.4 Migration Strategy

1. Create `Lead` table via Prisma migration.
2. Seed with no data (leads come from the website).
3. No destructive changes to existing tables.

---

## 9. Internationalization & RTL

### 9.1 Library Choice

**Recommendation: `react-i18next` + `i18next`**

Rationale:
- Industry standard for React i18n.
- Lightweight, well-maintained.
- Supports pluralization, interpolation, and lazy loading.
- Works seamlessly with React Router.
- Has a `useTranslation` hook that integrates well with functional components.
- No conflict with existing dependencies.
- Bundle size is minimal (~5KB gzipped).

Alternative considered: `formatjs` (more enterprise, but heavier and more complex).

### 9.2 Implementation Approach

```
src/
├── i18n/
│   ├── index.ts          # i18next configuration
│   ├── locales/
│   │   ├── ar.json       # Arabic translations
│   │   └── en.json       # English translations
│   └── LanguageContext.tsx  # Language state management
```

### 9.3 RTL Strategy

- Use **CSS logical properties** (Tailwind supports `ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-` prefixes) instead of physical left/right.
- Set `dir="rtl"` on the root element when Arabic is active.
- Switch font family: Arabic uses a Google Font like "Tajawal" or "Cairo" for proper Arabic rendering.
- All flexbox/grid layouts automatically flip with `dir="rtl"`.
- Test both directions during development.

### 9.4 Translation Scope

| Area | What to Translate |
|------|-------------------|
| Public website | All headings, paragraphs, buttons, form labels, navigation |
| CRM dashboard | All labels, table headers, status values, notifications, form labels, validation messages |
| Status values | OrderStatus, ProjectStatus, LeadStatus — all enum values translated |
| Dates | Use `Intl.DateTimeFormat` with locale-aware formatting |
| Currency | EGP formatting with Arabic numerals when in Arabic mode |

---

## 10. Design Direction

### 10.1 Brand Identity

- **Brand name:** Choose a professional name for the web development business (not "Nexa CRM" for the public-facing side). The CRM internal branding can remain.
- **Color system:** Keep the existing brand colors (`#465fff` primary blue, supporting purple) — they're professional and modern.
- **Typography:** 
  - Arabic: "Tajawal" or "Cairo" (Google Fonts, clean, professional).
  - English: "Inter" (already in use).
- **Logo:** Simple, modern, works in both Arabic and English.

### 10.2 Public Website Design Principles

- Premium, modern digital agency aesthetic.
- Clean whitespace, clear hierarchy.
- Subtle animations (fade-in on scroll, hover effects).
- Strong hero section with clear value proposition.
- Service cards with pricing.
- Professional portfolio grid.
- Contact form with clear CTAs.
- Fully responsive (mobile-first).
- RTL-first design (since Arabic is default).

### 10.3 CRM Dashboard Design Principles

- Keep the existing dark sidebar layout (it works well).
- Add language switcher to header.
- Ensure RTL support throughout.
- Maintain dark mode support.

---

## 11. Prioritized Implementation Plan

### Phase 1: Foundation (Week 1)
**Goal:** Fix blocking issues and set up i18n infrastructure.

1. ✅ Investigate uncommitted Settings.tsx deletion
2. ✅ Fix route mismatch (`/explore/services` → `/services`)
3. ✅ Install `react-i18next` and `i18next`
4. ✅ Create i18n configuration and language context
5. ✅ Create base Arabic and English translation files
6. ✅ Add language switcher component
7. ✅ Add RTL support (CSS logical properties, `dir` attribute management)
8. ✅ Standardize currency formatting utility
9. ✅ Remove all fake statistics from public pages

### Phase 2: Lead System (Week 1-2)
**Goal:** Enable public visitors to submit service requests.

1. ✅ Add `Lead` model to Prisma schema
2. ✅ Create and run Prisma migration
3. ✅ Create Lead controller, service, and routes
4. ✅ Create public POST `/leads` endpoint (no auth required)
5. ✅ Create protected GET/PATCH/DELETE lead endpoints
6. ✅ Build the public Service Request form page
7. ✅ Build the CRM Leads list page
8. ✅ Build the CRM Lead detail page

### Phase 3: Public Website Rebuild (Week 2-3)
**Goal:** Complete, professional, Arabic-first business website.

1. ✅ Rebuild Home page (no fake stats, business-focused)
2. ✅ Rebuild Services page
3. ✅ Rebuild Service Detail page
4. ✅ Create Portfolio page
5. ✅ Create About page
6. ✅ Create Contact page (with form → Lead creation)
7. ✅ Update PublicLayout with proper navigation
8. ✅ Add footer with business info
9. ✅ Apply i18n to all public pages

### Phase 4: CRM Internationalization (Week 3-4)
**Goal:** Full bilingual CRM dashboard.

1. ✅ Add i18n to Dashboard (Home) page
2. ✅ Add i18n to Clients page
3. ✅ Add i18n to Employees page
4. ✅ Add i18n to Projects page
5. ✅ Add i18n to Orders page
6. ✅ Add i18n to Services management page
7. ✅ Add i18n to Leads pages
8. ✅ Add i18n to auth pages (login, register)
9. ✅ Translate all status enums
10. ✅ Add RTL support to CRM dashboard

### Phase 5: Conversion & Polish (Week 4)
**Goal:** Lead-to-client conversion workflow and final polish.

1. ✅ Implement Lead → Client conversion action
2. ✅ Restore and improve Settings page
3. ✅ Add email notifications for new leads
4. ✅ End-to-end testing
5. ✅ Performance optimization
6. ✅ Security review (rate limiting, input validation)

---

## 12. V1 vs Future Features

### V1 (Essential for Launch)

- [x] Public business website (Home, Services, Portfolio, About, Contact)
- [x] Service request form (public, no login required)
- [x] Lead model and API
- [x] CRM Leads management page
- [x] Full Arabic/English i18n with RTL support
- [x] Language switcher
- [x] Responsive design
- [x] Existing CRM functionality preserved
- [x] Lead to Client conversion

### Future (Not in V1)

- [ ] Email notifications for new leads
- [ ] Lead scoring or priority
- [ ] Advanced lead filtering and search
- [ ] Lead analytics dashboard
- [ ] Automated lead response emails
- [ ] Multi-step service request form
- [ ] File upload for project requirements
- [ ] Blog/News section
- [ ] Testimonials (when real ones exist)
- [ ] Test suite (unit + integration)
- [ ] CI/CD pipeline
- [ ] Production deployment configuration

---

## 13. Uncommitted Work Assessment

| File | Status | Assessment | Action |
|------|--------|------------|--------|
| `frontend/index.html` | Modified | Need to review changes | Inspect diff before proceeding |
| `frontend/src/App.tsx` | Modified | Route structure changed | Review and preserve improvements |
| `frontend/src/index.css` | Modified | CSS changes | Review and preserve |
| `frontend/src/layout/AppSidebar.tsx` | Modified | Sidebar changes | Review and preserve |
| `frontend/src/pages/Settings/Settings.tsx` | **Deleted** | Was this intentional? | Review git history, restore if needed |

**Critical:** All uncommitted work must be preserved and reviewed before making any changes. No work should be lost.

---

## Summary of Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| i18n library | react-i18next | Standard, lightweight, React-native |
| RTL approach | CSS logical properties + `dir` attribute | Clean, maintainable, works with Tailwind |
| Lead model | New `Lead` table | Separate lifecycle from Client/Order |
| Lead → Client conversion | Manual (admin action) | Maintains data integrity, admin control |
| Public registration | Keep (CLIENT role) | Existing functionality preserved |
| Settings page | Restore + improve | Needed for business info configuration |
| Testing | Not in V1 | Add once features are stable |
| Payment system | Not building | Not needed for current business model |
| Client portal | Not building | Not needed for current business model |

---

**Next Step:** Review this plan and provide feedback. Upon approval, implementation will begin with Phase 1 (Foundation).
