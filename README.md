# 🚗 Apirental — Car Rental Web Application

A full-stack, production-ready car rental web application built with React, Express, PostgreSQL, and Docker.

## Quick Start

```bash
docker compose up
```

That's it! The application will be available at:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

The database is automatically migrated and seeded with demo data on first startup.

## Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@apirental.com    | admin123  |
| User  | john@example.com       | user123   |
| User  | jane@example.com       | user123   |

## Features

### 🌐 Public
- **Home Page** — Hero with search, featured vehicles, value propositions
- **Car Browsing** — Filter by category, fuel type, transmission, price range, seats; sort and paginate
- **Car Detail** — Full specs, features list, availability checker with price calculator
- **Booking Flow** — Date/location selection, price summary, instant confirmation

### 👤 User Dashboard
- **My Bookings** — View all bookings with status filters (Pending, Confirmed, Active, Completed, Cancelled)
- **Cancel Bookings** — Cancel upcoming reservations
- **Profile Management** — Edit personal info and change password

### 🔐 Authentication
- **Sign Up / Login** — JWT-based authentication with bcrypt password hashing
- **Protected Routes** — Dashboard, booking, and profile require authentication
- **Role-based Access** — Admin panel restricted to admin users

### ⚙️ Admin Panel
- **Dashboard** — Overview stats (total cars, users, bookings, revenue)
- **Car Management** — Full CRUD for the vehicle fleet
- **Booking Management** — View all bookings, update status
- **User Management** — View registered users
- **Location Management** — CRUD for pickup/return locations

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, TypeScript, TailwindCSS, React Router, Lucide Icons |
| Backend    | Node.js, Express 4, TypeScript, Zod |
| Database   | PostgreSQL 16, Prisma ORM           |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| Container  | Docker, docker-compose              |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── routes/               # API route handlers
│   │   │   ├── auth.ts           # Signup, login, me
│   │   │   ├── cars.ts           # Car listing, detail, availability
│   │   │   ├── bookings.ts       # Booking CRUD
│   │   │   ├── locations.ts      # Location listing
│   │   │   ├── users.ts          # Profile management
│   │   │   └── admin.ts          # Admin endpoints
│   │   ├── middleware/auth.ts     # JWT auth middleware
│   │   └── utils/                # Prisma client, JWT helpers
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   ├── seed.ts               # Demo data seeder
│   │   └── migrations/           # SQL migrations
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                # Page components
│   │   ├── components/           # Reusable components
│   │   ├── context/              # Auth context
│   │   ├── services/api.ts       # API client
│   │   └── types/                # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Public
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/health                 | Health check             |
| GET    | /api/cars                   | List cars (with filters) |
| GET    | /api/cars/:id               | Car details              |
| GET    | /api/cars/:id/availability  | Check availability       |
| GET    | /api/locations              | List locations           |
| POST   | /api/auth/signup            | Register                 |
| POST   | /api/auth/login             | Login                    |

### Authenticated
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/auth/me                | Current user             |
| GET    | /api/bookings               | User's bookings          |
| GET    | /api/bookings/:id           | Booking details          |
| POST   | /api/bookings               | Create booking           |
| PATCH  | /api/bookings/:id/cancel    | Cancel booking           |
| GET    | /api/users/profile          | Get profile              |
| PATCH  | /api/users/profile          | Update profile           |
| POST   | /api/users/change-password  | Change password          |

### Admin
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/admin/stats            | Dashboard stats          |
| GET    | /api/admin/cars             | List all cars            |
| POST   | /api/admin/cars             | Add car                  |
| PATCH  | /api/admin/cars/:id         | Update car               |
| DELETE | /api/admin/cars/:id         | Delete car               |
| GET    | /api/admin/bookings         | List all bookings        |
| PATCH  | /api/admin/bookings/:id     | Update booking status    |
| GET    | /api/admin/users            | List all users           |
| GET    | /api/admin/locations        | List locations           |
| POST   | /api/admin/locations        | Add location             |
| PATCH  | /api/admin/locations/:id    | Update location          |
| DELETE | /api/admin/locations/:id    | Delete location          |

## Environment Variables

See `.env.example` for all variables. Key settings:

| Variable       | Default                                              | Description         |
|----------------|------------------------------------------------------|---------------------|
| DATABASE_URL   | postgresql://apirental:apirental@db:5432/apirental   | PostgreSQL URL      |
| JWT_SECRET     | apirental-jwt-secret-change-in-production-2026       | JWT signing secret  |
| PORT           | 3001                                                 | Backend port        |
| CORS_ORIGIN    | http://localhost:3000                                | Allowed CORS origin |

## Development (without Docker)

```bash
# Start PostgreSQL locally, then:

# Backend
cd backend
cp .env.example .env  # Edit DATABASE_URL to point to local DB
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Seed Data

The seeder creates:
- **3 users** (1 admin + 2 regular)
- **12 cars** across all categories (Economy, Compact, Midsize, SUV, Luxury, Sports, Van)
- **6 locations** across NYC, LA, and Miami
- **6 bookings** in various statuses (Pending, Confirmed, Active, Completed, Cancelled)

## License

MIT
