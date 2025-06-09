// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = (globalThis as any).__prisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    // Avoid creating multiple instances in development during HMR
    (globalThis as any).__prisma__ = prisma;
}

export default prisma;
