# Build a fully working Car Rental app from an imported Claude Design

## Goal

Produce a complete, production-ready car rental web application, implemented
end-to-end (frontend + backend + database), fully containerized with Docker
(and docker-compose), based on a UI/UX design imported from Claude Design.

## Step 1 — Import the design

Use the `claude_design` MCP server (`https://api.anthropic.com/v1/design/mcp`,
authenticate via `/design-login` if not already authenticated) to import the
design project at:

https://claude.ai/design/p/7253f2ac-9ac4-44f9-b79f-044fd37fdd74?file=Apirental.html

Import and implement the file: `Apirental.html`.

Use this design as the visual/UX source of truth for the frontend: layout,
components, pages, flows, and styling should faithfully follow what's defined
in `Apirental.html`. Treat it as a static mockup — reimplement it as a proper
componentized frontend (do not just serve the static HTML), wiring every
interactive element to real backend functionality.

## Step 2 — Implement the full application

This must be a **fully productive, working app** — not a prototype or a UI
shell with mocked data. Infer the complete feature set a car rental platform
needs from the design (page-by-page), and implement every feature end-to-end
against a real backend and real database. At minimum, a car rental app of
this kind should include:

- Browsing/searching available cars (filter by dates, location, category,
  price range, etc. — whatever the design exposes)
- Car detail view (specs, photos, pricing, availability calendar)
- Booking/reservation flow (date selection, price calculation, confirmation)
- User authentication (signup/login) and a user account/profile area with
  booking history
- An admin/back-office area for managing the car fleet, pricing, and
  reservations, if the design includes one
- Persisted state in a real database — no in-memory-only or hardcoded mock
  data once the app is running

Implement every screen, form, and interactive control shown in the design
with real, working behavior — no dead links, disabled-forever buttons, or
"coming soon" placeholders unless the design itself marks them as such.

### Stack

- **Backend:** Node.js + Express (TypeScript preferred), with a REST API.
- **Database:** PostgreSQL, accessed via an ORM (Prisma or Sequelize — your
  choice), with migrations and a seed script that populates realistic demo
  data (car fleet, sample users, sample bookings) so the app is immediately
  explorable after first boot.
- **Frontend:** A modern componentized frontend (React + Vite is preferred)
  that reproduces the imported design and calls the real backend API — no
  mocked fetches.
- **Auth:** Real session/JWT-based authentication with hashed passwords.

## Step 3 — Dockerize fully

Provide a complete Docker setup so the whole stack runs with a single
command:

- `Dockerfile` for the backend, `Dockerfile` for the frontend (or a combined
  multi-stage build if that's cleaner), and a `docker-compose.yml` that wires
  up frontend, backend, and a PostgreSQL service (with a named volume for
  data persistence).
- Automatic database migration + seeding on first container startup, so
  `docker compose up` alone yields a fully working, populated application
  with no manual setup steps.
- Sensible environment-variable configuration (DB connection string, JWT
  secret, ports) via a `.env.example` file, with working defaults for local
  dev.
- A top-level `README.md` documenting how to run the app with
  `docker compose up`, default ports, and any seeded demo credentials for
  logging in.

## Acceptance criteria

- `docker compose up` (from a clean clone) brings up a fully working app:
  frontend reachable in a browser, backend API healthy, database migrated
  and seeded.
- Every primary flow visible in the `Apirental.html` design actually works
  end-to-end against the real backend/database: browsing cars, viewing
  details, creating a booking, signing up/logging in, viewing booking
  history, and (if present in the design) the admin management flow.
- No hardcoded/mocked data is used at runtime — all data flows through the
  API and database.
- Code is organized cleanly (clear separation of frontend/backend, sensible
  folder structure) and is idiomatic for the chosen stack.

## Deliverable

Commit the full implementation (frontend, backend, Docker setup, docs) to
this repository as a patch/branch, ready to be reviewed and merged as a PR.
