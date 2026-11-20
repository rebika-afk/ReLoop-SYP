import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, avoid creating too many client instances during hot-reload
  if (!global.__reloop_prisma__) {
    global.__reloop_prisma__ = new PrismaClient();
  }
  prisma = global.__reloop_prisma__;
}

export default prisma;

