import app from '../apps/api/src/app.js';
import fs from 'fs';
import path from 'path';

// Serverless SQLite filesystem compatibility layer for Vercel / AWS Lambda
if (process.env.VERCEL) {
  const tmpDb = '/tmp/dev.db';
  if (!fs.existsSync(tmpDb)) {
    const candidatePaths = [
      path.join(process.cwd(), 'apps', 'api', 'prisma', 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.resolve('apps/api/prisma/dev.db'),
      '/var/task/apps/api/prisma/dev.db',
      '/var/task/prisma/dev.db'
    ];

    for (const cand of candidatePaths) {
      if (fs.existsSync(cand)) {
        try {
          fs.copyFileSync(cand, tmpDb);
          break;
        } catch (err) {
          console.warn(`Failed to copy seed db from ${cand} to /tmp on Vercel:`, err);
        }
      }
    }
  }
  process.env.DATABASE_URL = 'file:/tmp/dev.db';
}

export default function handler(req: any, res: any) {
  return app(req, res);
}
