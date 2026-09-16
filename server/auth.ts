import bcrypt from "bcryptjs";
import { createHmac, randomBytes } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { prisma } from "./prisma";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for admin sessions");
  return createHmac("sha256", secret).update(token).digest("hex");
}

export async function authenticateRequest(req: Request) {
  const token = parseCookieHeader(req.headers.cookie ?? "")[COOKIE_NAME];
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session.adminUser;
}

export async function loginAdmin(email: string, password: string, res: Response, req: Request) {
  const adminUser = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!adminUser || !(await bcrypt.compare(password, adminUser.passwordHash))) return null;

  const token = randomBytes(32).toString("hex");
  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      adminUserId: adminUser.id,
    },
  });

  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_DURATION_MS,
  });
  return adminUser;
}

export async function logoutAdmin(req: Request, res: Response) {
  const token = parseCookieHeader(req.headers.cookie ?? "")[COOKIE_NAME];
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
}
