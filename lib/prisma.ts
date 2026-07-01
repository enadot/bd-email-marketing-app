import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma 7 requires a driver adapter. We use the pooled (pgbouncer) connection
// for the app runtime — set DATABASE_URL to the Supabase pooler URL.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Supabase requires TLS; the pooler presents a cert node-postgres won't
    // verify against the system CA, so encrypt without strict verification.
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
