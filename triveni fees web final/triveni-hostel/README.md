# Triveni Hostel Fee Collection System

A modern, responsive web application for automating monthly fee collection, tracking payments, and managing hostel finances. Built with Next.js, MongoDB, and TailwindCSS.

## Features

- **Role-based Authentication**: Admin and Parent logins with JWT cookies.
- **Admin Dashboard**:
  - Summary cards: total collected this month, pending amount.
  - Daily collections chart (last 7 days).
  - Unpaid fees list with “Mark as Paid” and “View Details” actions.
  - Paid fees list (this month) with green theme.
  - Student CRUD (Add/Edit/Delete).
  - Export reports (CSV/PDF).
- **Parent Dashboard**:
  - View student info, room, monthly fee, total due.
  - Due fees cards with “Pay Now” UPI links.
  - Upcoming fee reminder.
  - Payment history.
- **SMS Webhook**: Android SMS Forwarder integration to auto-mark fees as paid from bank/UPI SMS.
- **Responsive UI**: Emerald dark/light theme with subtle animations (framer-motion).

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: TailwindCSS + shadcn/ui + framer-motion
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT in HttpOnly cookies
- **Charts**: Recharts
- **Export**: json2csv, pdfmake
- **Forms**: React Hook Form + Zod

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Android SMS Forwarder app (optional, for auto-payment detection)

## Installation

1. Clone and install:
   ```bash
   git clone <repo>
   cd triveni-hostel
   npm install
   ```

2. Environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your MongoDB URI and secrets
   ```

3. Seed dummy data:
   ```bash
   npm run seed
   ```

4. Run dev server:
   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## Default Credentials (after seeding)

- **Admin**: mobile=9999999999, password=admin123
- **Parent**: mobile=<any parent mobile from DB>, password=parent123

## API Endpoints

- `POST /api/auth/login` – Admin/Parent login
- `POST /api/auth/logout` – Logout
- `GET /api/auth/me` – Current user info
- `GET /api/students` – List all students (admin)
- `POST /api/students` – Add student (admin)
- `PUT /api/students/[id]` – Update student (admin)
- `DELETE /api/students/[id]` – Delete student (admin)
- `GET /api/fees` – List fees with filters
- `POST /api/fees/mark-paid` – Mark fee as paid (admin)
- `POST /api/sms-webhook` – SMS forwarder webhook (auto-match)
- `GET /api/export/csv` – Export CSV (admin)
- `GET /api/export/pdf` – Export PDF (admin)
- `GET /api/parents/students?parentId=...` – Parent’s students with fees

## SMS Webhook (Android SMS Forwarder)

Configure your SMS Forwarder app to POST to:
```
https://<your-domain>/api/sms-webhook
```

Body example:
```json
{
  "message": "Rs.5000 credited to A/c No XXXXX12345 from UPI ref 1234567890ABCDEF on 2025-04-02",
  "sender": "VM-ICICIB",
  "timestamp": "2025-04-02T10:15:00Z"
}
```

The endpoint extracts amount and transaction ID, matches to unpaid fees, and marks them paid.

## Deployment

- **Vercel**: Connect repo, set environment variables, deploy.
- **Docker**: Use `Dockerfile` (optional) and host on any node platform.

## Contributing

1. Fork
2. Feature branch
3. Commit
4. Pull request

## License

MIT
