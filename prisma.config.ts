import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 keeps connection URLs out of schema.prisma. Migrations / introspection
// use the DIRECT (non-pooled) connection; the app runtime uses the pooled URL via
// the driver adapter in lib/prisma.ts.
//
// We read process.env directly (not the throwing env() helper) so that
// `prisma generate` — which doesn't need a live URL — never fails the build when
// DIRECT_URL happens to be unset (e.g. a misconfigured Vercel environment).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
