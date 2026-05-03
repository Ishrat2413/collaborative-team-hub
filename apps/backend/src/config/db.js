/**
 * @fileoverview Prisma Client singleton.
 *
 * Using a singleton prevents the creation of multiple Prisma Client instances
 * during development hot-reloads, which would exhaust the database connection pool.
 *
 * In production, a new instance is always created (no global caching needed).
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

/**
 * @type {PrismaClient}
 */
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
