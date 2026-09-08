import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

  return new PrismaClient({
    datasources: connectionString
      ? {
          db: {
            url: connectionString,
          },
        }
      : undefined,
    log: ['error'],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = createPrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = globalForPrisma.prisma;
      }
    } catch (err: any) {
      console.warn('[PrismaClient] Lazy initialization deferred:', err?.message);
    }
  }
  return globalForPrisma.prisma as PrismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrisma();
    if (!instance) return () => Promise.resolve(null);
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export default prisma;
