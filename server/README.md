# HMS JavaScript API

This is the JavaScript (ES module) Express backend for the React client. It uses PostgreSQL through `pg`, SQL schema initialization, native Node.js `scrypt` password hashing, and signed JWT bearer tokens.

## Requirements

- Node.js 20 or later
- PostgreSQL 14 or later

## Run Locally

From this directory, create a PostgreSQL database, copy `.env.example` to `.env`, and set `DATABASE_URL` and a random `JWT_SECRET` with at least 32 characters. Then run:

```powershell
npm install
npm run dev
```

At startup, the server applies `src/db/schema/schema.sql` and inserts the synthetic demonstration records if the database is empty. The API listens on the configured `PORT` (currently `8001`); `GET /health` checks database connectivity.

The client defaults to `http://localhost:8001/api/v1`. Set `VITE_API_BASE_URL` in the client environment if the API uses a different URL. Configure the client origin in `CORS_ORIGINS`.

## Demo Accounts

All seeded demo accounts use `Password@123`:

| Role | Email |
|---|---|
| Administrator | `administrator@example.test` |
| Doctor | `doctor@example.test` |
| Receptionist | `receptionist@example.test` |
| Patient | `patient@example.test` |

The signup form offers Patient, Doctor, Receptionist, and Administrator. Patient accounts activate immediately. Doctor, Receptionist, and Administrator registrations are stored as pending requests and cannot sign in until an administrator approves them in Settings → Staff Requests. Approval is an explicit privilege grant; administrator requests should only be approved by a trusted system owner. Users must sign in with credentials for their actual account; role impersonation is disabled.

## MVC Layout

```text
src/
  app.js
  server.js
  config/       environment and CORS configuration
  controllers/  request validation and workflow coordination
  db/           PostgreSQL client and schema initialization
    schema/     idempotent PostgreSQL schema
    seed.js     synthetic demo records
  lib/          errors and security helpers
  middleware/   authentication, role checks, request IDs, errors
  models/       PostgreSQL queries and entity mapping
  routes/       endpoint definitions by feature
  seed.js
```

`app.js` only configures middleware and mounts routes. Controllers call models; route files bind HTTP methods to controller functions.

## Role Access

| Role | Allowed workflows |
|---|---|
| Administrator | Dashboard, patient/doctor directories, appointments, clinical records, invoices, staff accounts, departments, audit logs |
| Doctor | Assigned appointments and patients, permitted clinical history, create diagnoses and prescriptions |
| Receptionist | Dashboard, register patients, schedule/manage appointments, doctor directory, create/manage invoices; no clinical notes, diagnoses, or prescriptions |
| Patient | Own profile, browse doctors, book/cancel own appointments, view own records and invoices |

The API enforces these rules independently of navigation visibility. Patient IDs and doctor assignment are derived from the authenticated account, never from client role claims.

## API

All protected routes require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a patient or submit a staff-role approval request |
| `POST` | `/api/v1/auth/login` | Authenticate a user |
| `GET` | `/api/v1/auth/me` | Return the authenticated user |
| `GET`, `POST`, `PATCH` | `/api/v1/patients` | Role-scoped patient profiles, staff registration, own-profile updates |
| `GET` | `/api/v1/doctors` | List active doctors, optionally by department |
| `GET`, `POST`, `PATCH` | `/api/v1/appointments` | List, book, or change appointment status |
| `GET`, `POST` | `/api/v1/medical-records` | Read permitted records or create an assigned consultation record |
| `GET`, `POST` | `/api/v1/invoices` | Read permitted invoices or create an invoice |
| `PATCH` | `/api/v1/invoices/:id/mark-paid` | Record payment |
| `GET` | `/api/v1/dashboard/summary` | Role-scoped operational summary |
| `GET` | `/api/v1/audit-logs` | Administrator audit feed |
| `GET` | `/api/v1/admin/registration-requests` | List pending role requests as administrator |
| `PATCH` | `/api/v1/admin/registration-requests/:id` | Approve or reject a pending role request |
| `GET`, `PATCH` | `/api/v1/admin/users` | List staff and activate/deactivate accounts |
| `GET`, `POST`, `PATCH` | `/api/v1/admin/departments` | List, create, activate/deactivate departments |
| `POST` | `/api/v1/admin/reset-demo` | Reset synthetic data in development |

Active appointment slots are protected by a PostgreSQL partial unique index; duplicate bookings return `409 APPOINTMENT_SLOT_UNAVAILABLE`. Password reset currently returns a generic response and does not send email. This is an academic prototype: use synthetic patient information only.

## Commands

```powershell
npm run dev
npm start
npm test
npm run db:seed
```