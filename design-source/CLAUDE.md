# CLAUDE.md — Apirental

Project orientation for Claude Code. This is a self-contained front-end prototype of **Apirental**, a luxury / exotic car-rental web app. Continue building from here.

## What this is

A single-page app with **two surfaces**:
- **Customer site** — marketing home, browsable fleet, car detail, "how it works", concierge/contact, locations, and a 4-step booking flow (in a modal).
- **Staff admin console** — dashboard, fleet CRUD, availability calendar, bookings, customers. Reached via the "Admin" button; gated by a login.

It is **multilingual (7 languages: en, el, de, fr, pt, es, bg)**, supports **light/dark themes**, and prices everything in **EUR (€)**.

## How to run

Open `Apirental.html` directly in a browser — no build step. It loads React + Babel from CDN and transpiles the `.jsx` files in the browser. Edit any `.jsx`/`.css` file and refresh.

> The in-browser Babel + CDN setup exists only so the prototype runs from a static file. If/when you migrate to a real toolchain, move to a bundler (e.g. Vite) — but the component breakdown below is a good blueprint to keep.

## File map (load order matters — see `Apirental.html`)

| File | Contents |
|---|---|
| `Apirental.html` | Entry point. Loads fonts, `styles.css`, and every script in dependency order. |
| `styles.css` | **Design tokens** (CSS variables) + global styles + light theme (`:root[data-theme="light"]`). |
| `data.jsx` | All mock data: `CARS`, `LOCATIONS`, `LOCATION_INFO`, `CATEGORIES`, `ADDONS`, `CUSTOMERS`, `BOOKINGS`, `REVENUE_SERIES`. |
| `photos.jsx` | `window.PHOTO_MAP` — base64 car photos keyed by image path (large, auto-generated). |
| `image-slot.js` | `<image-slot>` web component — a user-droppable photo placeholder. |
| `i18n.jsx` | English master strings (`T.en`), value-map keys (`CAT_KEY`, `TAG_KEY`, `STATUS_KEY`), `LOCALE` table, `langPack()` helper. |
| `i18n-eldebg.jsx` | Greek + German translation packs. |
| `i18n-frptesbg.jsx` | French, Portuguese, Spanish, Bulgarian packs **+ `LangProvider`, `useT()`, and the `tx*` value-translation helpers**. |
| `components.jsx` | Shared UI kit: `Icon`, `Button`, `Badge`, `Stars`, `CarImage`, `Spec`, `Modal`, `Field`, `TextInput`, `Select`, `Logo` + helpers (`fmtMoney`, `fmtDate`, `daysBetween`, `useIsMobile`). |
| `customer.jsx` | `SiteHeader`, `Hero`, `CategoryStrip`, `CarCard`, `Featured`, `HowItWorks`, `Footer`, `LangSwitcher`, `ThemeToggle`. |
| `browse.jsx` | `BrowseView` (filterable grid) + `DetailView` (single car). |
| `booking.jsx` | `BookingFlow` — 4-step booking modal + confirmation + pricing math. |
| `pages.jsx` | `HowItWorksPage`, `ConciergePage`, `LocationsPage` (+ `StyledMap`). |
| `admin.jsx` | `Dashboard`, `BookingsAdmin`, `CustomersAdmin`, `AdminApp` shell, `StaffLogin`. |
| `admin-fleet.jsx` | `FleetAdmin` + `CarEditor` (vehicle CRUD) + `CalendarAdmin` (availability). |
| `app.jsx` | Root `App` — site⇄admin mode, auth, and the shared `cars`/`bookings`/`customers` state. Renders into `#root`. |

## Conventions you must follow

**Component scope / globals.** Each `<script type="text/babel">` is transpiled in isolation, so components are shared by attaching them to `window` at the end of each file:
```js
Object.assign(window, { SiteHeader, Hero, CarCard, /* ... */ });
```
If you add a component another file needs, export it the same way. **Never** name a styles object just `styles` — use inline styles or a uniquely-named object (the prototype uses inline styles throughout).

**Styling.** Use the CSS variables in `styles.css` — never hardcode colors. Key tokens: `--bg`, `--surface`, `--gold` (`#d4af37`, primary accent), `--text`/`--text-2`/`--text-3`, radii `--r-sm/--r/--r-lg/--r-xl`, `--shadow`. Fonts: `--font-display` (Outfit, headings via `.display`), `--font-body` (Manrope), `--font-mono` (Space Mono, eyebrows/codes). Helper classes: `.eyebrow`, `.gold-text`, `.fade-in`, `.pop-in`, `.ph` (striped image placeholder).

**Theme.** Toggled by `ThemeToggle`; sets `document.documentElement.dataset.theme` and persists to `localStorage["apirental.theme"]`. An inline script in `Apirental.html` applies the saved theme before first paint.

**i18n.** Wrap user-facing copy in `t("key")` from `useT()`. `t(key, vars)` interpolates `{n}`, `{name}`, `{email}`, `{amount}`. Add new keys to `T.en` in `i18n.jsx` first (it's the fallback master), then translate in the other packs. Data is stored in **English** for filter/join logic and translated for display via helpers: `txCat`, `txTag`, `txStatus`, `txFuel`, `txTier`, `txBStatus`, `txLoc` (each does `MAP[value] ? t(MAP[value]) : value`). Locale stored in `localStorage["apirental.lang"]`.

**Responsiveness.** Use the `useIsMobile(bp)` hook (breakpoints used: 720 / 760 / 820 / 860) rather than CSS media queries for layout switches.

**Money & dates.** `fmtMoney(n)` → `"1.234 €"` (de-DE grouping). `fmtDate(iso)` and `daysBetween(a,b)` live in `components.jsx`.

## State & data shapes

Top-level state lives in `app.jsx`: `mode` (`site`|`admin`), `authed` (bool, persisted), and `cars`/`bookings`/`customers` arrays seeded from `data.jsx`. `createBooking(b)` prepends a booking and bumps the car's `trips`.

Data shapes (see `data.jsx` for the authoritative definitions):
- **Vehicle**: `id, name, brand, category, photo, year, price, seats, transmission, fuel, power, topSpeed, zeroTo, drivetrain, color, rating, trips, location, tag, status, blurb, features[], booked[[from,to]]`.
- **Location**: `id, name, phone, x, y` (+ i18n strings `loc.<id>.name|city|addr|blurb`). `name` (English) is the join key used by `Vehicle.location` and `Booking.pickup`.
- **Addon**: `id, name, desc, price, unit("day"|"trip")`.
- **Customer**: `id, name, email, phone, since, trips, spend, tier`.
- **Booking**: `id, carId, customer, from, to, pickup, status, total`.

**Booking pricing** (`booking.jsx`): `days = max(1, daysBetween(from,to))`; `base = price*days`; `addonTotal = Σ price*qty*(unit==="day"?days:1)`; `fees = round(base*0.08)`; `total = base+addonTotal+fees`.

## Known prototype shortcuts (real work, for when you're ready)

- All data is in-memory mock data — nothing persists across reload.
- "Auth" is a hardcoded credential check (`admin.jsx`, `STAFF_CREDS`) + a `localStorage` flag.
- The booking flow's **payment step is cosmetic** — it formats a fake card and generates a random confirmation code; it does not charge anything.
- The Concierge/contact form has no submission target.
- Availability `booked` ranges are hardcoded per car rather than derived from bookings.

(These are noted for context — don't address them unless the task asks.)
