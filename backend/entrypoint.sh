#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
# Simple wait loop
for i in $(seq 1 30); do
  if node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.\$connect().then(() => { p.\$disconnect(); process.exit(0); }).catch(() => process.exit(1));
  " 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  echo "   Waiting... ($i/30)"
  sleep 2
done

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database (if needed)..."
npx ts-node prisma/seed.ts 2>/dev/null || echo "   Seed completed or already seeded"

echo "🚀 Starting Apirental API server..."
node dist/index.js
