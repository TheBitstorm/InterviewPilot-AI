// prisma.config.ts
// Prisma 7.x configuration file (placed in the project root).
// DATABASE_URL is moved here from the datasource block in schema.prisma.
// earlyAccess is required for Prisma 7 config features.

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
