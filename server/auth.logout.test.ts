import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { prisma } from "./prisma";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    email: "sample@example.com",
    name: "Sample User",
    passwordHash: "not-used",
    role: "ADMIN",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    });
  });
});

describe("admin authorization", () => {
  it("rejects non-admin users from admin content routes", async () => {
    const { ctx } = createAuthContext();
    ctx.user = {
      ...ctx.user!,
      role: "EDITOR",
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.content.adminList()).rejects.toThrow(
      "You do not have required permission (10002)"
    );
  });

  it("allows admin users to access admin content routes", async () => {
    const { ctx } = createAuthContext();
    ctx.user = {
      ...ctx.user!,
      role: "ADMIN",
    };

    const caller = appRouter.createCaller(ctx);
    vi.spyOn(prisma.contentItem, "findMany").mockResolvedValue([]);

    await expect(caller.content.adminList()).resolves.toEqual([]);
  });
});
