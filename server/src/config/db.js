// src/config/db.js
// Prisma client singleton — import this everywhere instead of new PrismaClient()
// Prisma 7: DATABASE_URL is configured via prisma.config.ts (for CLI).
// At runtime, PrismaClient needs the adapter for the actual DB connection.

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Pool is initialized lazily — DATABASE_URL is loaded by dotenv in app.js before this runs
const createPrismaClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const prisma = createPrismaClient();

module.exports = prisma;
