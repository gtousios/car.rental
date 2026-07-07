---
title: "Apirental - Car Rental Web Application"
type: refined-request
created: 2026-07-06
status: active
---

# Refined Request: Apirental Car Rental Application

## Overview
Build a complete, production-ready car rental web application ("Apirental") with full-stack implementation, containerized with Docker.

## Features

### 1. Public Pages
- **Landing/Home Page**: Hero section with search form (location, pickup/return dates), featured cars, value propositions
- **Car Browsing**: Filterable car listing (category, price range, transmission, fuel type, seats), sorting, pagination
- **Car Detail**: Full specs, photo gallery, pricing breakdown, availability, booking CTA
- **About/Contact**: Company info pages

### 2. Authentication
- **Sign Up**: Email, name, phone, password with validation
- **Login**: Email + password, JWT-based sessions
- **Password hashing**: bcrypt

### 3. Booking Flow
- **Date/Location Selection**: Pickup & return dates and locations
- **Price Calculation**: Daily rate × days + extras
- **Booking Confirmation**: Summary, user details, payment placeholder
- **Booking Management**: View, cancel bookings

### 4. User Dashboard
- **Profile**: View/edit personal info
- **Booking History**: All bookings with status (upcoming, active, completed, cancelled)

### 5. Admin Panel
- **Dashboard**: Stats overview (total cars, bookings, revenue, users)
- **Car Management**: CRUD operations for fleet
- **Booking Management**: View/update all bookings
- **User Management**: View all users

## Technical Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Auth**: JWT + bcrypt
- **Containerization**: Docker + docker-compose

## Data Models
- User (id, email, name, phone, password, role, timestamps)
- Car (id, brand, model, year, category, transmission, fuelType, seats, pricePerDay, image, description, available, timestamps)
- Location (id, name, address, city, timestamps)
- Booking (id, userId, carId, pickupLocationId, returnLocationId, startDate, endDate, totalPrice, status, timestamps)

## Acceptance Criteria
1. `docker compose up` starts full stack from clean clone
2. All CRUD flows work end-to-end against real DB
3. Auth with JWT, hashed passwords
4. Seed data for immediate exploration
5. Clean code organization
