import { PrismaClient } from '@prisma/client';

// Single Prisma client for the whole server (reused across imports)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
});

export default prisma;

export async function connectDB() {
  await prisma.$connect();
  console.log('[db] connected to PostgreSQL via Prisma');
}
