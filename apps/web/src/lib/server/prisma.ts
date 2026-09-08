import { PrismaClient } from '@prisma/client';
import { ensureDatabaseSchema } from './ensureSchema';

export type ExtendedPrismaClient = PrismaClient & {
  opportunityRecord: any;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

function createPrismaClient(): ExtendedPrismaClient {
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
  }) as unknown as ExtendedPrismaClient;
}

function getPrisma(): ExtendedPrismaClient {
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = createPrismaClient();
      ensureDatabaseSchema(globalForPrisma.prisma).catch(() => {});
    } catch (err: any) {
      console.warn('[PrismaClient] Lazy initialization deferred:', err?.message);
    }
  }
  return globalForPrisma.prisma as ExtendedPrismaClient;
}

export const prisma: ExtendedPrismaClient = new Proxy({} as ExtendedPrismaClient, {
  get(_target, prop) {
    const instance = getPrisma();
    if (!instance) return () => Promise.resolve(null);
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    if (typeof value === 'object' && value !== null) {
      return new Proxy(value, {
        get(modelTarget, modelProp) {
          const method = (modelTarget as any)[modelProp];
          if (typeof method === 'function') {
            return async (...args: any[]) => {
              await ensureDatabaseSchema(instance).catch(() => {});
              return method.apply(modelTarget, args);
            };
          }
          return method;
        },
      });
    }
    return value;
  },
});

export default prisma;
