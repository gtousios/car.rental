# Apirental — Technical Design

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐
│    Frontend      │    │    Backend       │    │  PostgreSQL  │
│  React + Vite    │◄──►│  Express + TS    │◄──►│  + Prisma    │
│  (nginx :80)     │    │  (node :3001)    │    │  (:5432)     │
└─────────────────┘    └─────────────────┘    └──────────────┘
     Docker              Docker                   Docker
```

### Frontend (React + Vite + TypeScript)
- **Router**: React Router v7 with protected & admin routes
- **State**: React Context for auth; local state for page data
- **API**: Centralized service layer (`services/api.ts`) with JWT token management
- **Styling**: TailwindCSS with custom primary color palette
- **Icons**: Lucide React icon library

### Backend (Express + TypeScript)
- **API**: RESTful JSON API with Express Router
- **Auth**: JWT tokens (7-day expiry), bcrypt password hashing
- **Validation**: Zod schema validation on all inputs
- **ORM**: Prisma with PostgreSQL
- **CORS**: Configurable origin

### Database (PostgreSQL + Prisma)
- 4 tables: User, Car, Location, Booking
- UUID primary keys
- Enum types for roles, statuses, categories
- Proper foreign key relationships

## Data Model

### User
- id (UUID PK), email (unique), password (bcrypt hash)
- firstName, lastName, phone
- role (USER | ADMIN)

### Car
- id (UUID PK), brand, model, year
- category (ECONOMY | COMPACT | MIDSIZE | FULLSIZE | SUV | LUXURY | VAN | SPORTS)
- transmission (AUTOMATIC | MANUAL), fuelType (GASOLINE | DIESEL | ELECTRIC | HYBRID)
- seats, doors, luggage, pricePerDay
- imageUrl, description, features[], available
- mileage, color, licensePlate (unique)

### Location
- id (UUID PK), name, address, city, state, country, zipCode
- latitude, longitude

### Booking
- id (UUID PK), userId (FK), carId (FK)
- pickupLocationId (FK), returnLocationId (FK)
- startDate, endDate, totalPrice
- status (PENDING | CONFIRMED | ACTIVE | COMPLETED | CANCELLED)
- notes

## Security
- Passwords hashed with bcrypt (10 rounds)
- JWT authentication with configurable secret (raises exception if missing)
- Role-based access control (admin middleware)
- Input validation with Zod on all endpoints
- SQL injection prevented by Prisma ORM
- CORS restricted to configured origin
