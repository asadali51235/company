import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { prisma } from "../server/prisma";

const readline = createInterface({ input, output });
const email = (await readline.question("Admin email: ")).trim().toLowerCase();
const password = await readline.question("Admin password: ");
const name = (await readline.question("Admin name (optional): ")).trim() || null;
readline.close();

if (!email || password.length < 12) {
  throw new Error("Email is required and password must be at least 12 characters.");
}

const passwordHash = await bcrypt.hash(password, 12);
await prisma.adminUser.upsert({
  where: { email },
  update: { name, passwordHash, role: "ADMIN" },
  create: { email, name, passwordHash, role: "ADMIN" },
});
console.log(`Admin user ready: ${email}`);
await prisma.$disconnect();