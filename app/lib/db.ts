import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
   
  console.log('[prisma] Created new PrismaClient (production)');
} else {
  // @ts-expect-error: Node.js global type workaround
  if (!global.prisma) {
    // @ts-expect-error: Node.js global type workaround
    global.prisma = new PrismaClient();
     
    console.log('[prisma] Created new PrismaClient (development)');
  }
  // @ts-expect-error: Node.js global type workaround
  prisma = global.prisma;
}

 
console.log('[prisma] Exporting prisma instance:', typeof prisma);

export { prisma }; 