# CoreCRM / Nexa CRM

This project is a public-facing CRM platform focused on a clear and professional customer experience. It includes public pages for product presentation, services, service details, and service request flows, while connecting to the existing internal services layer already present in the project.

## Project Overview

CoreCRM is a customer relationship and service management project designed to manage clients, services, requests, and internal business operations. In the current implementation, a public website experience was separated from the internal dashboard structure while keeping the existing authentication and protected route architecture intact.

The project includes:

- Public landing and service presentation pages
- Service listing and service details pages
- Login and registration pages
- Protected internal dashboard areas for clients, users, services, and orders
- Reuse of the current service API layer already available in the frontend

## What Has Been Implemented

### 1. Public Experience Outside the Dashboard

A public route group was created independently from the existing Auth/App dashboard layout so that the CRM sidebar and dashboard shell are not shown on the public pages.

The public routes include:

- Home page `/`
- Services page `/services`
- Service details page `/services/:id`
- Login page `/login`
- Register page `/register`

### 2. Public Home Page

A professional public home page was created with:

- A clear landing experience
- A concise service preview section
- A visible call-to-action path
- Product positioning content
- A removal of client/order statistics widgets from the public landing experience

### 3. Public Services Page

The services page was built using the existing frontend service API, specifically the `getServices` service adapter, without changing the backend, database, or API contract.

The public service card experience includes:

- Service name
- Service description
- Service price displayed in a clear `EGP` format
- A visible `View Details` or `View More` action on every card
- A `Request Service` button per card

### 4. Public Service Detail Page

A public page for service detail was added so the service data is read from the active service list through the existing service API layer. When a user starts a request flow requiring authentication, the app redirects them to a login route.

### 5. Existing Project Structure Preserved

The current implementation avoids changing:

- Backend logic
- API endpoints
- Database schema or model structure
- Protected dashboard routes and business workflows
- Existing authentication and role-protection flow

### 6. Typography and Inter Font Standardization

Inter was applied to the public UI styling for consistency in typography. The general font weight pattern was aligned with the requested structure:

- Body text: 400
- Labels and navigation: 500
- Buttons and section headings: 600
- Major hero headings: 700

## Local Setup

### Prerequisites

- Node.js
- npm
- Git

### Install Dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## Project Structure

```text
frontend/
  src/
    App.tsx
    api/
    components/
    context/
    layout/
    pages/
    services/
```

## Future Roadmap

The long-term roadmap is to evolve this project into a complete CRM ecosystem with automation, smart communication, proactive customer tracking, and payment features.

### 1. Automation Integration

Planned automation features include:

- Auto-creating service requests and follow-up tasks
- Sending alerts and internal reminders
- Routing requests to the correct team or employee

### 2. Customer Notifications

The next phase will add customer notifications through:

- Email
- SMS
- Internal system notifications

Notifications will be used for:

- Request approval
- Request status changes
- New message or activity updates
- Appointment and service reminders

### 3. Customer Status Tracking Through Communication Platforms

The roadmap includes integrating communication platforms such as:

- WhatsApp
- Telegram
- Instagram
- Facebook
- Email

This will allow customer conversations and service progress to be tracked in one unified workflow.

### 4. Multi-Channel Communication Integration

The project will include a centralized communication layer that connects:

- Email
- WhatsApp
- Telegram
- Social platforms
- Internal CRM messages

This will centralize customer communication and improve response quality.

### 5. Payment Feature

A payment feature will be added using providers such as:

- Stripe
- Paymob
- PayPal
- Local payment gateways

This will allow customers to pay for services directly in the system and link payment status to the order or service request.

### 6. Customer Monitoring and Service Tracking

Future customer monitoring features will include:

- Service and request status
- Service progress
- Communication history
- Payment status
- Follow-up reminders
- Internal comments and customer activity notes

## Upcoming Priorities

1. Add customer automation workflows
2. Unify email, SMS, and WhatsApp notification flows
3. Connect communication and messaging platforms
4. Implement payment integration
5. Improve customer experience inside the CRM workflow

## Notes

This project currently focuses on creating a clean public-facing experience while preserving the existing internal backend, database, and API structure. The current implementation is intentionally limited to public UI improvements and the preparation path for future automation, communication, and payment features.

## Personal Links

- GitHub: https://github.com/himaalshame
- LinkedIn: https://www.linkedin.com/in/ibrahim-ilshamy/
- Portfolio: https://himaalshame.github.io/my-Protfolio/
- WhatsApp Business: https://wa.me/+201020679141
