# Wildbeat Safari Tours

Full-stack safari tourism site for Ilyce "Wildbeat" Umuhoza. The project combines a Vite/React frontend with an Express + SQLite backend to showcase tours, capture bookings, collect reviews, and manage donation flows.

## Feature Snapshot

- Multi-section marketing site with hero, featured tours, testimonials, and gallery views
- Three-step booking flow that posts booking requests to the Express API
- Review submission flow with public testimonials
- Dynamically managed Support page with admin-controlled hero copy, causes, donation tiers, and payment methods
- Payment initiation service that routes donations to Stripe, Flutterwave, or M-Pesa depending on the configured method
- Admin utilities for editing support content, payment methods, and reviewing donations (requires admin session token)

## Architecture Overview

| Layer | Description |
|-------|-------------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Shadcn UI primitives, Framer Motion animations |
| Backend | Express server with SQLite persistence, REST endpoints for tours, bookings, reviews, gallery, donations, and support content |
| Payments | Stripe SDK, Flutterwave REST API, and M-Pesa STK push integration via Axios |
| Auth | Email/password signup and login handled by Express, bcrypt hashing, session tokens stored in SQLite |

Key backend helpers live in [backend/server.js](backend/server.js) and database schema/seed logic in [backend/setup-database.js](backend/setup-database.js).

## Setup

### Frontend (Vite app)

```bash
npm install
npm run dev
```

### Backend (Express API)

```bash
cd backend
npm install
npm run setup-db
npm run start
```

Environment variables for payments and email live in `backend/.env`. See [PAYMENT_SETUP.md](PAYMENT_SETUP.md) for required keys.

## Current Access Matrix

| Feature | Guest | Admin | Notes |
|---------|-------|-------|-------|
| View tours | Yes | Yes | `GET /api/tours` is public |
| Book tours | Requires login | Requires login | `POST /api/bookings` expects a valid session token (automatically attached when logged in) |
| Upload gallery photos | No UI | No UI | `POST /api/gallery` exists but no frontend control or auth guard |
| Delete gallery photos | No | No | Endpoint not implemented |
| Leave reviews | Yes | Yes | `POST /api/reviews` is open to all users |
| Delete reviews | No | No | Removal endpoints not implemented |
| Subscribe to newsletter | Not available | Not available | No subscription routes |
| Access admin support manager | No | Yes | `/admin/support` requires admin session and calls protected endpoints |
| Manage booking records | No | API only | `GET /api/bookings` is admin-protected; UI not built yet |
| Moderate reviews | No | No | Not implemented |
| Manage payment methods | No | Yes | Admin-only support payment APIs power `/admin/support` |
| View donation history | No | Yes | `/api/donations` admin endpoints feed the donations dashboard |

## Frontend Structure

```
src/
├── components/
│   ├── layout/
│   ├── home/
│   └── ui/
├── pages/
├── hooks/
├── lib/
└── assets/
```

## Backend Highlights

- Uses SQLite with helper wrappers (`dbAll`, `dbGet`, `dbRun`) for promise-based queries
- Tables include `users`, `sessions`, `tours`, `bookings`, `reviews`, `gallery`, `donation_types`, `support_*` tables, and `donations`
- Auth routes: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`
- Support admin routes allow CRUD for hero copy, causes, and payment methods with JSON config blobs
- Payment initiation endpoint `/api/payments/initiate` selects provider logic based on method integration key

## Additional Documentation

- [PAYMENT_SETUP.md](PAYMENT_SETUP.md)
- [STRIPE_SETUP.md](STRIPE_SETUP.md)
- [backend/README.md](backend/README.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## License

© 2024 Wildbeat Safari Tours. All rights reserved.