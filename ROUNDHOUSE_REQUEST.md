# Re-implement the frontend to match the imported design EXACTLY

## Context

A previous job already built a full working car rental app in this repo:
Node/Express + Prisma/PostgreSQL backend (`backend/`), a React/Vite/Tailwind
frontend (`frontend/`), and a working `docker-compose.yml`. It runs correctly
end-to-end (verified: `docker compose up` boots db+backend+frontend, auth
works, cars/bookings CRUD works against real data).

**The problem: the frontend does NOT match the source design closely enough.**
The previous attempt treated `Apirental.html` as loose inspiration and
free-styled the UI instead of reproducing it faithfully. This run must fix
that — the frontend must match the design **exactly**, not "in the spirit of."

## Step 1 — Import the design (again, carefully)

Use the `claude_design` MCP (`https://api.anthropic.com/v1/design/mcp`,
authenticate via `/design-login` if needed) to import:

https://claude.ai/design/p/7253f2ac-9ac4-44f9-b79f-044fd37fdd74?file=Apirental.html

Fetch the **actual `Apirental.html` file contents** (full HTML/CSS/markup),
not a paraphrase or summary of it. This file is the literal source of truth.

## Step 2 — Reproduce it EXACTLY

For every page/section/component present in `Apirental.html`:

- Match the **exact DOM structure**: same sections, same nesting, same order
  of elements.
- Match the **exact visual styling**: colors (use the literal hex/rgb values
  from the design, don't approximate or substitute a "close enough" palette),
  fonts and font sizes/weights, spacing, border-radius, shadows, gradients,
  breakpoints.
- Match the **exact copy/text content**: headings, labels, button text,
  placeholder text — verbatim from the design, not paraphrased.
- Match the **exact layout and component composition**: same hero section,
  same nav/header layout, same card designs, same grid/flex structure, same
  icons/imagery placement.
- If `Apirental.html` uses specific CSS (inline `<style>`, utility classes,
  custom classes), carry those exact values into the React implementation
  (e.g. as Tailwind config tokens, CSS variables, or component styles) —
  do not invent your own visual system in its place.
- Do NOT add sections, pages, or UI elements that aren't in the design. Do
  NOT drop or simplify sections that are in the design.

This is a **pixel-fidelity reimplementation** task, not a "redesign inspired
by." If something in the design is ambiguous (e.g. an interaction not fully
specified in static HTML), make the smallest reasonable choice that preserves
the visual design — do not use it as license to redesign.

## Step 3 — Keep it wired to the real backend

The existing backend (`backend/`) already implements the full API (auth,
cars, bookings, locations, admin, users) and already works — do not rewrite
it unless a specific frontend requirement genuinely requires a backend change
(e.g. a field or endpoint shown in the design that the current API doesn't
expose). Every interactive element in the reproduced design (search, filters,
booking flow, login/signup, dashboard, admin panel) must call the real
backend API — no mocked data, consistent with the existing implementation.

## Step 4 — Docker stays working

`docker-compose.yml`, the backend `Dockerfile`, and the frontend `Dockerfile`
already work — after your changes, `docker compose up --build` must still
bring up a fully working, seeded app with the new pixel-accurate frontend.
Update the frontend `Dockerfile`/build only if your dependency changes
require it (e.g. new packages for fonts/icons used by the design).

## Acceptance criteria

- Side-by-side, the running app's pages visually match `Apirental.html`
  section-for-section, color-for-color, copy-for-copy — not an
  approximation or a "similar" redesign.
- `docker compose up --build` still yields a fully working app: real backend,
  real database, all flows (browse, book, auth, dashboard, admin) functional
  against real data.
- No regression to backend functionality that already worked.

## Deliverable

Commit the corrected frontend implementation to this repository as a
patch/branch, ready to review as a PR.
