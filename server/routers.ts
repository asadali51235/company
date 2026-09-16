import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { loginAdmin, logoutAdmin } from "./auth";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createContent,
  createCategory,
  createMedia,
  deleteCategory,
  deleteContent,
  deleteMedia,
  getPublishedContentBySlug,
  getAdminAnalytics,
  listAdminContent,
  listCategories,
  listMedia,
  listSettings,
  listSubscribers,
  listToolSettings,
  listPublishedContent,
  setContentStatus,
  saveToolSetting,
  subscribe,
  updateContent,
  upsertSetting,
} from "./db";

const contentKind = z.enum(["article", "guide", "report", "area", "tool"]);
const contentStatus = z.enum(["draft", "published", "unpublished", "archived"]);
const imageSource = z.union([
  z.string().url(),
  z.string().regex(/^data:image\/(png|jpeg|jpg|webp);base64,/),
]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const user = await loginAdmin(input.email, input.password, ctx.res, ctx.req);
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await logoutAdmin(ctx.req, ctx.res);
      return { success: true } as const;
    }),
  }),
  content: router({
    list: publicProcedure
      .input(z.object({ query: z.string().optional() }).optional())
      .query(({ input }) => listPublishedContent(input?.query)),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1) }))
      .query(({ input }) => getPublishedContentBySlug(input.slug)),
    adminList: adminProcedure.query(() => listAdminContent()),
    toolSettings: publicProcedure.query(() => listToolSettings()),
    create: adminProcedure
      .input(z.object({
        kind: contentKind,
        title: z.string().min(3).max(240),
        slug: z.string().min(3).max(240),
        excerpt: z.string().max(1000).optional(),
        content: z.string().optional(),
        status: contentStatus.optional(),
        featuredImage: imageSource.optional(),
        imageAlt: z.string().max(240).optional(),
        seoTitle: z.string().max(240).optional(),
        metaDescription: z.string().max(320).optional(),
        canonicalUrl: z.string().url().optional(),
        categoryId: z.number().int().positive().optional(),
      }))
      .mutation(({ input }) => createContent({ ...input, status: input.status ?? "draft" })),
    setStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: contentStatus }))
      .mutation(({ input }) => setContentStatus(input.id, input.status).then(() => ({ success: true }))),
    update: adminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        kind: contentKind,
        title: z.string().min(3).max(240),
        slug: z.string().min(3).max(240),
        excerpt: z.string().max(1000).optional(),
        content: z.string().optional(),
        status: contentStatus.optional(),
        featuredImage: imageSource.optional().or(z.literal("")),
        imageAlt: z.string().max(240).optional(),
        seoTitle: z.string().max(240).optional(),
        metaDescription: z.string().max(320).optional(),
        canonicalUrl: z.string().url().optional().or(z.literal("")),
        categoryId: z.number().int().positive().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...content } = input;
        return updateContent(id, content).then(() => ({ success: true }));
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteContent(input.id).then(() => ({ success: true }))),
  }),
  admin: router({
    categories: adminProcedure.query(() => listCategories()),
    createCategory: adminProcedure.input(z.object({ name: z.string().min(2).max(120), slug: z.string().min(2).max(160), description: z.string().optional() })).mutation(({ input }) => createCategory(input.name, input.slug, input.description)),
    deleteCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteCategory(input.id).then(() => ({ success: true }))),
    media: adminProcedure.query(() => listMedia()),
    createMedia: adminProcedure.input(z.object({ url: z.string().url(), altText: z.string().max(240).optional() })).mutation(({ input }) => createMedia(input.url, input.altText)),
    deleteMedia: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteMedia(input.id).then(() => ({ success: true }))),
    settings: adminProcedure.query(() => listSettings()),
    saveSetting: adminProcedure.input(z.object({ key: z.string().min(2).max(120), value: z.string(), isPublic: z.boolean() })).mutation(({ input }) => upsertSetting(input.key, input.value, input.isPublic)),
    analytics: adminProcedure.query(() => getAdminAnalytics()),
    subscribers: adminProcedure.query(() => listSubscribers()),
    subscribe: publicProcedure.input(z.object({ email: z.string().email() })).mutation(({ input }) => subscribe(input.email)),
    toolSettings: adminProcedure.query(() => listToolSettings()),
    saveToolSetting: adminProcedure.input(z.object({ toolSlug: z.string().min(1), key: z.string().min(1), label: z.string().min(1), value: z.string(), type: z.enum(["number", "text", "boolean"]), description: z.string().optional() })).mutation(({ input }) => saveToolSetting(input)),
  }),
});

export type AppRouter = typeof appRouter;
