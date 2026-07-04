/**
 * Prisma Client Singleton Module
 * 
 * In Next.js, hot reloading during local development causes the application code
 * to reload frequently. If a new PrismaClient instance is instantiated on every reload,
 * it leads to database connection exhaustion due to multiple active client connections.
 * 
 * To prevent this:
 * 1. We store the active PrismaClient instance on the Node global object `globalForPrisma`.
 * 2. In production, we create a single standard instance.
 * 3. In non-production environments, we save the instance to the global context to reuse it.
 */

import { PrismaClient } from "@prisma/client";

// Define a type-safe structure for the global object to prevent TS compile warnings.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Instantiate or reuse the active client. Log levels are enabled for better visibility.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

// Save to the global object when running outside production (Next.js hot reload safety).
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

