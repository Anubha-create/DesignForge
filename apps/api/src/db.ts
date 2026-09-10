import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (prismaInstance) {
    return prismaInstance;
  }

  let databaseUrl = process.env.DATABASE_URL;

  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const candidatePaths = [
        path.join(process.cwd(), 'apps', 'api', 'prisma', 'dev.db'),
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.resolve('apps/api/prisma/dev.db'),
        '/var/task/apps/api/prisma/dev.db',
        '/var/task/prisma/dev.db',
        path.join(process.cwd(), 'dev.db')
      ];

      for (const cand of candidatePaths) {
        if (fs.existsSync(cand)) {
          try {
            fs.copyFileSync(cand, tmpDb);
            console.log(`Successfully copied seed db from ${cand} to /tmp/dev.db`);
            break;
          } catch (err) {
            console.warn(`Failed to copy seed db from ${cand} to /tmp:`, err);
          }
        }
      }
    }

    if (fs.existsSync(tmpDb)) {
      databaseUrl = 'file:/tmp/dev.db';
    } else {
      // Fallback to relative file path if /tmp copy was not possible
      databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
    }
    process.env.DATABASE_URL = databaseUrl;
  }

  try {
    prismaInstance = new PrismaClient(
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
  } catch (err) {
    console.error('Error instantiating PrismaClient:', err);
    throw err;
  }

  return prismaInstance;
}

// Transparent lazy Proxy so routes can continue using `prisma.problem.findMany(...)`
// without executing `new PrismaClient()` during top-level module load.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const client = getPrisma();
    const val = Reflect.get(client, prop, receiver);
    return typeof val === 'function' ? val.bind(client) : val;
  }
});

export default prisma;
