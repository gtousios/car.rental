# Rebuild Apirental with 100% design fidelity — full scope, real backend

## Why this run is different

Two previous attempts at this task drifted from the source design because the
build environment could not reach the `claude_design` MCP tool, so the design
was paraphrased/reinvented from memory instead of copied. That gap is now
closed: **this repository contains the literal, complete design source**,
fetched directly from the design project, under `design-source/`. Do not
re-fetch or reinterpret the design — `design-source/` **is** the design.
Read `design-source/CLAUDE.md` first; it is the design's own architecture
document and is authoritative for conventions, file responsibilities, data
shapes, and pricing formulas.

## What Apirental actually is

Read `design-source/CLAUDE.md` in full before doing anything else. Summary:
Apirental is a **luxury/exotic car rental platform** for Athens & Thessaloniki,
EUR-priced, with:

- A **customer site**: marketing home, browsable fleet with filters, car
  detail with specs/reviews, a 4-step booking flow (trip → extras → driver
  details → payment) with loyalty-tier discounts, promo codes, loyalty-point
  redemption, and an optional keyless-entry add-on, a locations page with an
  interactive map, a "how it works" page, a concierge/contact page, "My
  Trips" (view/cancel/modify bookings, leave reviews), and a rule-based chat
  concierge widget that answers from live fleet/pricing data (deterministic
  JS logic — **not** a real LLM call; see `customer.jsx`'s `buildChatKnowledge`
  / `computePriceFacts`, keep this the same way).
- A **staff admin console**: dashboard (revenue, fleet mix, top performers,
  peak demand), fleet CRUD, an availability calendar, a maintenance tracker,
  damage reports, customer directory with booking history, reviews
  moderation, promo-code management, a notifications log (simulated
  email/SMS), and a printable daily pickup/return run sheet.
- **7 languages** (en, el, de, fr, pt, es, bg) — every user-facing string
  goes through `t("key")`, exactly as implemented in `i18n.jsx` +
  `i18n-eldebg.jsx` + `i18n-frptesbg.jsx`.
- **Light/dark theme** toggle, EUR pricing, the exact visual design system in
  `design-source/styles.css` (CSS variables — colors, radii, shadows, type).

## Step 1 — Study the ground truth

Read every file in `design-source/` before writing code:
`CLAUDE.md`, `Apirental.html`, `styles.css`, `data.jsx`, `i18n.jsx`,
`i18n-eldebg.jsx`, `i18n-frptesbg.jsx`, `components.jsx`, `customer.jsx`,
`browse.jsx`, `booking.jsx`, `pages.jsx`, `admin.jsx`, `admin-fleet.jsx`,
`notifications.jsx`, `app.jsx`.

Two files in `design-source/` are **design-tool scaffolding, not product
features** — do not port their runtime behavior:
- `tweaks-panel.jsx` — a floating "Tweaks" panel for live-editing the accent
  color inside the design tool's preview iframe. Skip it entirely; just hard-
  code the default accent (`#8b5cf6` / `#a78bfa` / `#6d28d9`, see
  `app.jsx`'s `ACCENT_PALETTES[0]`) as the fixed theme accent.
- `image-slot.js` — a drag-and-drop image-upload custom element that
  persists via a `window.omelette` bridge that only exists inside the design
  tool. In production there is no such bridge. Where `CarImage` (in
  `components.jsx`) falls back to `<image-slot>` for secondary photos
  (interior/rear/detail thumbnails on the car detail page, and the car
  editor preview), replace those specific spots with plain static images or
  simple styled placeholders — do not reimplement the drag/pan/zoom/reframe
  runtime.

Everything else — every component, every page, every string key, every CSS
token, every pricing/loyalty/promo formula — is real product behavior and
must be preserved exactly.

## Step 2 — Frontend: port to a real toolchain, pixel/behavior-exact

Build a React + TypeScript + Vite + Tailwind (or plain CSS using the exact
`styles.css` variables — your choice, as long as the visual output is
pixel-identical) frontend that reproduces `design-source/` faithfully:

- Match the **exact DOM structure, layout, and visual design** — colors,
  typography, spacing, radii, shadows, animations — using the literal values
  in `styles.css`. Support both the dark and light themes exactly as defined
  there (`:root` and `:root[data-theme="light"]`).
- Match the **exact copy** in all 7 languages. Port the i18n system (`t()`,
  `useT()`, `LangProvider`, the `tx*` value-translation helpers) and all
  string tables verbatim — do not paraphrase or drop languages.
- Match **every page and flow**: home, browse (with all filters), car
  detail (specs, highlights, reviews), booking flow (all 4 steps + loyalty/
  promo/keyless math exactly as in `booking.jsx`'s `priceBooking`), locations
  page with the stylized map, how-it-works, concierge/contact, My Trips
  (cancel/modify/review), and the full admin console (dashboard, fleet CRUD,
  availability calendar, maintenance tracker, damage reports, customers,
  reviews moderation, promo codes, notifications log, daily run sheet).
- Reproduce the booking pricing/loyalty/promo formulas **exactly** as
  documented in `CLAUDE.md` and implemented in `booking.jsx` — these are
  precise arithmetic (8% taxes & fees, loyalty tier discounts, promo
  percent/fixed discounts, points redemption, keyless fee) and must match to
  the cent.
- Real car photos: the design ships `photos.jsx` (base64, not included here
  because it's a large generated asset) — since you don't have it, source
  reasonable free-to-use stock photos (e.g. Unsplash) per car brand/model
  instead, keeping the same `CarImage` component contract.

## Step 3 — Backend: real persistence, not localStorage

The prototype's "database" is `localStorage` (see `app.jsx`'s `DB_KEYS` /
`dbLoad` / `dbSave` — explicitly called out in `CLAUDE.md` as a known
prototype shortcut). Replace it with a real backend:

- **Node.js + Express (TypeScript) + PostgreSQL via Prisma.**
- Model every entity from `CLAUDE.md`'s "State & data shapes" section and
  `data.jsx`'s seed data: Vehicle/Car, Location, Addon, Customer, Booking,
  Review, Promo, Maintenance record, Damage report, Notification log entry.
  Keep field names and semantics equivalent to the prototype's shapes so the
  frontend port maps cleanly.
- Real JWT-based auth for customers (signup/login/sign-out) and a separate
  staff login for the admin console (the prototype's `STAFF_CREDS` hardcoded
  check should become a real staff user with a hashed password — seed one
  demo admin).
- Booking creation must enforce the same availability-conflict logic as
  `carConflicts`/`isCarAvailable` in `components.jsx` (no double-booking
  overlapping date ranges).
- Seed the database with the exact fleet from `data.jsx` (18 cars, all
  fields), the 8 locations from `LOCATION_INFO`, the 6 add-ons, the seeded
  reviews, and the 5 promo codes — so the app is immediately explorable.
- The chat concierge's knowledge (`buildChatKnowledge`/`computePriceFacts`
  in `customer.jsx`) should read from the real backend's live data, not
  hardcoded arrays.

## Step 4 — Docker

Provide `docker-compose.yml` + Dockerfiles for frontend, backend, and
PostgreSQL, so `docker compose up --build` alone yields a fully working,
migrated, and seeded app with no manual steps. Include a `.env.example` with
working local defaults and a top-level `README.md` documenting how to run it,
default ports, and demo credentials (a customer account and the staff admin
account).

## Acceptance criteria

- Side-by-side against `design-source/Apirental.html` rendered in a browser
  (open it directly — it's a runnable static prototype, no build step
  needed), the rebuilt app matches section-for-section, color-for-color,
  copy-for-copy, in **every one of the 7 languages** and **both themes** —
  not an approximation.
- Every flow actually works end-to-end against the real backend/database:
  browse → detail → book (with extras/loyalty/promo/keyless) → confirmation
  → My Trips (cancel/modify/review) → and the full admin console (fleet
  CRUD, calendar, maintenance, damage, customers, reviews, promos,
  notifications, run sheet).
- `docker compose up --build` boots a fully working, seeded app with zero
  manual setup.
- No hardcoded/mocked data at runtime — everything flows through the API
  and database.

## Deliverable

Commit the full implementation (frontend, backend, Docker setup, docs) to
this repository as a patch/branch, ready to review as a PR.
