import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 keeps connection URLs out of schema.prisma. Migrations / introspection
// use the DIRECT (non-pooled) connection; the app runtime uses the pooled URL via
// the driver adapter in lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
