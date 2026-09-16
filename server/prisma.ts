import * as PrismaPkg from "@prisma/client";

// Fallback type if @prisma/client is not yet generated
type PrismaClientType = any;

const PrismaClientConstructor: any =
  (PrismaPkg as any).PrismaClient ||
  (PrismaPkg as any).default?.PrismaClient ||
  class {
    [key: string]: any;
    constructor() {
      return new Proxy(this, {
        get: (_target, prop) => {
          if (prop === "$disconnect" || prop === "$connect") {
            return async () => {};
          }
          return new Proxy(
            {},
            {
              get: () => async () => null,
            }
          );
        },
      });
    }
  };

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientType };

export const prisma: PrismaClientType =
  globalForPrisma.prisma ??
  new PrismaClientConstructor({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;