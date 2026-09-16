import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { authenticateRequest } from "../auth";

export type AdminRole = "ADMIN" | "EDITOR";

export type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AdminUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: AdminUser | null = null;

  try {
    user = (await authenticateRequest(opts.req)) as AdminUser | null;
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}