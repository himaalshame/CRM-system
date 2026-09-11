<div align="center">

# 🏢 CRM System

### A Production-Oriented Customer Relationship Management Platform

Manage clients, services, orders, projects, and employees — all in one centralized, role-based dashboard.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Educational%2FPortfolio-lightgrey)](#-license)

[Overview](#-overview) •
[Features](#-core-features) •
[Architecture](#️-architecture) •
[Tech Stack](#-tech-stack) •
[Getting Started](#️-getting-started) •
[Roadmap](#️-roadmap)

</div>

---

## 📖 Overview

Managing clients, orders, and projects through scattered spreadsheets, chat threads, and documents doesn't scale. **CRM System** is a full-stack, real-world CRM built to solve that — not a simple CRUD demo, but a production-oriented application with a layered backend, type-safe database access, role-based authentication, and a modern React dashboard.

With this system, a small business can:

- 👥 Manage clients from onboarding to archival
- 🛠️ Define services and pricing
- 📦 Create orders and track them through approval
- 📋 Convert approved orders into active projects
- 👨‍💻 Assign employees to projects with defined roles
- 📊 Monitor everything from a centralized dashboard
- 🔐 Control access with authenticated, role-based routes

---

## ✨ Core Features

| Module | Capabilities |
|---|---|
| **👥 Client Management** | Create, view, update, soft-delete, and restore clients · List active vs. inactive clients |
| **🛠️ Service Management** | Create services with descriptions and prices · Toggle active/inactive · Use in orders |
| **📦 Order Management** | Create client orders · Add multiple services · Auto-calculate totals · Track order & payment status · Approve orders before execution |
| **📋 Project Management** | Spin up projects from approved orders · Track status, start/end dates · Assign employees with defined roles |
| **👨‍💻 Employee Management** | Manage employee records · Assign to projects · Define project-specific responsibilities |
| **🔐 Auth & Authorization** | JWT authentication · Password hashing · Auth middleware · Role-based access (`ADMIN`, `EMPLOYEE`, `CLIENT`) · Protected routes |
| **✅ Validation** | Request-level input validation with **Zod** before hitting business logic |
| **📊 Dashboard** | API + UI components for a real-time overview of business activity |

---

## 🏗️ Architecture

A cleanly separated frontend/backend monorepo:

```text
CRM-system/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── scripts/
│   │   └── utils/
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layout/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   │
│   └── package.json
│
├── .gitignore
└── README.md
```

### 🔄 Backend Request Flow

The backend follows a strict layered architecture to keep responsibilities separated:

```text
HTTP Request
     │
     ▼
   Route            → defines endpoints, wires up middleware/controllers
     │
     ▼
Middleware          → auth, authorization, validation, error handling
     │
     ▼
 Controller         → reads requests, returns responses
     │
     ▼
  Service            → business logic & database operations
     │
     ▼
  Prisma             → type-safe database access
     │
     ▼
PostgreSQL
```

### 🔐 Authentication Flow

```text
Login → Validate credentials → Generate JWT → Client stores auth state
   → Authenticated request → JWT verification middleware
   → Role/Authorization check → Protected controller
```

Authentication and authorization are deliberately decoupled so access control can grow independently as the app evolves.

### 📡 API Communication

The frontend never talks to PostgreSQL directly — everything flows through the REST API:

```text
React → Axios → REST API → Express → Services → Prisma → PostgreSQL
```

Main API areas:

```text
/api/auth
/api/clients
/api/employees
/api/services
/api/orders
/api/projects
/api/dashboard
```

---

## 🗄️ Database

Built on **PostgreSQL** with **Prisma ORM** for type-safe queries and migrations.

**Core domain models:**

```text
User → Client → Employee → Service → Order → OrderItem → Project → ProjectEmployee
```

Schema and migrations live under [`backend/prisma/`](backend/prisma/).

---

## 🧰 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- ApexCharts

</td>
<td valign="top" width="50%">

**Backend**
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Zod

</td>
</tr>
</table>

**Tooling:** Git · GitHub · VS Code · npm

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (LTS recommended)
- PostgreSQL instance (local or hosted)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/himaalshame/CRM-system.git
cd CRM-system
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
```

> ⚠️ Never commit `.env` files or real secrets to GitHub.

Run database migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The API will be available at **`http://localhost:5000`**

### 3. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Development Approach

This project is built incrementally, validating each architectural layer before layering on new complexity. Current focus areas:

- Authentication & JWT implementation
- Zod-based request validation
- REST API design
- Frontend/API integration
- Role-based access control
- Robust error handling
- Production-grade architecture

---

## 🗺️ Roadmap

### ✅ Phase 1 — Core CRM
- [x] Client management
- [x] Service management
- [x] Order management
- [x] Project management
- [x] Employee assignment
- [x] PostgreSQL database
- [x] Prisma integration
- [x] Layered backend architecture

### 🔐 Phase 2 — Authentication
- [x] User model
- [x] JWT authentication architecture
- [x] Authentication middleware
- [x] Role-based authorization
- [ ] Complete frontend authentication flow
- [ ] Refine token/session handling

### 🖥️ Phase 3 — Frontend Integration
- [x] Dashboard foundation
- [x] API service layer
- [ ] Complete API integration
- [ ] Loading states
- [ ] Error states
- [ ] Form validation
- [ ] Protected dashboard flows

### 🚀 Phase 4 — Production Improvements
- [ ] Advanced permissions
- [ ] Pagination and filtering
- [ ] Search
- [ ] Audit logs
- [ ] File/document management
- [ ] Notifications
- [ ] Customer communication integrations
- [ ] Automated workflows with n8n
- [ ] Testing
- [ ] Deployment

---

## 🎯 Project Goals

1. Build a realistic, extensible CRM application
2. Practice production-oriented backend architecture
3. Design and consume REST APIs
4. Deepen understanding of authentication & authorization
5. Apply thorough validation and error handling
6. Connect a modern React frontend to a Node.js backend
7. Design a system ready for real business requirements

---

## 📌 Project Status

**🟢 Active Development**

The core CRM domain and backend foundation are implemented. Frontend integration, authentication refinement, validation, authorization, and production features are actively being developed.

---

## 👨‍💻 Author

**Ibrahim Elshamy**
Web Developer focused on building modern web applications with React, Node.js, TypeScript, REST APIs, and PostgreSQL.

[GitHub](https://github.com/himaalshame)

---

## 📄 License

This project is currently intended for **educational, portfolio, and development purposes**.

---

<div align="center">

⭐️ If you find this project useful or interesting, consider giving it a star!

</div>
