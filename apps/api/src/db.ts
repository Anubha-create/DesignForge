import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Handle serverless writable SQLite database on Vercel / AWS Lambda
let databaseUrl = process.env.DATABASE_URL;

if (process.env.VERCEL) {
  const tmpDb = '/tmp/dev.db';
  if (!fs.existsSync(tmpDb)) {
    // Search possible locations for the seeded SQLite database
    const candidates = [
      path.join(process.cwd(), 'apps', 'api', 'prisma', 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        try {
          fs.copyFileSync(cand, tmpDb);
          break;
        } catch (err) {
          console.warn(`Failed to copy seed db from ${cand} to /tmp:`, err);
        }
      }
    }
  }
  databaseUrl = 'file:/tmp/dev.db';
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma = new PrismaClient(
  databaseUrl
    ? {
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }
    : undefined
);

export default prisma;
