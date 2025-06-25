import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
  // eslint-disable-next-line no-console
  console.log('[prisma] Created new PrismaClient (production)');
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
    // eslint-disable-next-line no-console
    console.log('[prisma] Created new PrismaClient (development)');
  }
  // @ts-ignore
  prisma = global.prisma;
}

// eslint-disable-next-line no-console
console.log('[prisma] Exporting prisma instance:', typeof prisma);

export { prisma }; 