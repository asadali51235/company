import next from "next";
import type { Express } from "express";

export async function setupNext(app: Express, dev: boolean) {
  process.env.NEXT_DIST_DIR = dev ? ".next-dev" : ".next";
  const nextApp = next({ dev });
  await nextApp.prepare();

  const handle = nextApp.getRequestHandler();
  app.all("*", (req, res) => handle(req, res));
}