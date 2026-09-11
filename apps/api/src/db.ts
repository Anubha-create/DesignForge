import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Handle serverless writable SQLite database on Vercel / AWS Lambda or local fallback
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
} else if (!databaseUrl) {
  // Local environment fallback: search candidates for dev.db or default to absolute path
  const candidates = [
    path.join(process.cwd(), 'apps', 'api', 'prisma', 'dev.db'),
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
    path.resolve(process.cwd(), 'apps/api/prisma/dev.db')
  ];

  let foundDb = candidates.find(c => fs.existsSync(c)) || candidates[0];
  const normalized = foundDb.replace(/\\/g, '/');
  databaseUrl = `file:${normalized}`;
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;
