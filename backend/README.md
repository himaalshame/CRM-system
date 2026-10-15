# Nexa CRM — Backend API

![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-111827?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)

> **I built the backend around a simple idea: business rules belong in one dependable place.** The API connects the public service catalog and the role-based CRM workspace to PostgreSQL, with validation and authorization applied at the request boundary.

This service powers the Nexa CRM frontend. It manages customer and employee records, services, orders, projects, authentication, and dashboard data.

## What the API handles

- **Authentication:** registration creates a standard `CLIENT` account; sign-in returns a JWT. Public registration cannot assign elevated roles.
- **Access control:** protected endpoints check the authenticated user and allowed roles.
- **Service catalog:** public reads for active services, with administrator controls for creating, editing, deactivating, and restoring services.
- **Clients and employees:** role-protected records, updates, and soft-deactivation workflows.
- **Orders:** service line items, totals, status changes, payment status, approval, and cancellation.
- **Projects:** project tracking and employee assignments.
- **Dashboard:** role-aware business summaries and recent activity.

## Request flow

```mermaid
flowchart LR
  Request[HTTP request] --> Route[Express route]
  Route --> Middleware[Authentication, authorization, validation]
  Middleware --> Controller[Controller]
  Controller --> Service[Business logic]
  Service --> Prisma[Prisma Client]
  Prisma --> PostgreSQL[(PostgreSQL)]
  Controller --> Response[JSON response]
```

## API overview

All paths below are relative to the backend origin, which defaults to `http://localhost:5000`.

| Area | Endpoint | Access |
| --- | --- | --- |
| Health | `GET /` | Public |
| Auth | `POST /auth/register`, `POST /auth/login` | Public |
| Services | `GET /services`, `GET /services/:id` | Public |
| Services | `GET /services/inactive` | Admin, employee |
| Services | `POST /services` | Admin |
| Services | `PATCH /services/:id`, `DELETE /services/:id`, `PATCH /services/:id/restore` | Authenticated (admin-only controls in the current UI) |
| Clients | `GET /clients`, `GET /clients/:id`, `POST /clients`, `PATCH /clients/:id` | Admin, employee |
| Clients | `GET /clients/inactive` | Admin, employee |
| Employees | `GET /employees`, `GET /employees/:id` | Authenticated |
| Employees | `POST /employees` | Admin |
| Employees | `PATCH /employees/:id`, `PATCH /employees/:id/deactivate`, `PATCH /employees/:id/restore` | Authenticated |
| Orders | `GET /orders`, `GET /orders/:id` | Authenticated; results are scoped by role |
| Orders | `POST /orders`, `PATCH /orders/:id`, `PATCH /orders/:id/cancel` | Admin, client (ownership rules apply) |
| Orders | `PATCH /orders/:id/approve` | Admin |
| Projects | `GET /projects`, `GET /projects/:id` | Authenticated; results are scoped by role |
| Projects | `POST /projects`, `PATCH /projects/:id` | Admin |
| Projects | `PATCH /projects/:id/status` | Admin, employee |
| Projects | Employee assignment endpoints | Admin |
| Dashboard | `GET /dashboard` | Authenticated |

## Stack and design choices

- Node.js, Express 5, and TypeScript
- PostgreSQL with Prisma 7 and the PostgreSQL driver adapter
- Zod for request validation
- JWT for authentication and bcrypt for password hashing
- Layered organization: routes → middleware → controllers → services → Prisma

## Run locally

You will need Node.js, npm, and a PostgreSQL database. From this directory:

```bash
npm install
```

Create `backend/.env` with the connection string for your database and a private JWT signing secret:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
```

Generate the Prisma client and apply the checked-in migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Start the API in development mode:

```bash
npm run dev
```

The health endpoint is `GET http://localhost:5000/`.

## Useful checks

```bash
npx tsc --noEmit
```

The project does not currently define a backend test or build script. The command above checks TypeScript without emitting files.

## Project structure

```text
src/
├── config/       # Prisma client and PostgreSQL adapter
├── controllers/  # HTTP request/response handling
├── middleware/   # Authentication, authorization, validation, errors
├── routes/       # API paths and middleware composition
├── scripts/      # Local account utilities
├── services/     # Domain logic and database operations
├── utils/        # Shared application errors
└── validators/   # Zod request schemas

prisma/
├── migrations/   # Database migration history
└── schema.prisma # Domain models and relations
```

## A note from me

I wanted this API to make the application's rules visible and maintainable. Keeping validation, access checks, and domain operations in separate layers makes it easier to understand what each request can do—and gives the frontend a consistent contract to work with.

## Find me

- **GitHub:** [himaalshame](https://github.com/himaalshame)
- **LinkedIn:** [Ibrahim Ilshamy](https://www.linkedin.com/in/ibrahim-ilshamy/)
- **Portfolio:** [himaalshame.github.io/my-Protfolio](https://himaalshame.github.io/my-Protfolio/)
- **WhatsApp:** [Message me](https://wa.me/+201020679141)
