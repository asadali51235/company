import { prisma } from "./prisma";

export type ContentKind = "article" | "guide" | "report" | "area" | "tool";
export type ContentStatus = "draft" | "published" | "unpublished" | "archived";

export type InsertContentItem = {
  kind: ContentKind;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status?: ContentStatus;
  featuredImage?: string;
  imageAlt?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  categoryId?: number;
};

export async function listPublishedContent(query?: string) {
  return prisma.contentItem.findMany({
    where: {
      status: "published",
      ...(query?.trim()
        ? {
            OR: [
              { title: { contains: query.trim(), mode: "insensitive" } },
              { excerpt: { contains: query.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedContentBySlug(slug: string) {
  return prisma.contentItem.findFirst({ where: { slug, status: "published" } });
}

export async function listAdminContent() {
  return prisma.contentItem.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function createContent(input: {
  kind: ContentKind;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status?: ContentStatus;
  featuredImage?: string;
  imageAlt?: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  categoryId?: number;
}) {
  const { categoryId, ...data } = input;
  return prisma.contentItem.create({
    data: {
      ...data,
      status: input.status ?? "draft",
      category: categoryId ? { connect: { id: categoryId } } : undefined,
    },
  });
}

export async function setContentStatus(id: number, status: ContentStatus) {
  return prisma.contentItem.update({
    where: { id },
    data: { status, publishedAt: status === "published" ? new Date() : null },
  });
}

export async function updateContent(id: number, input: Parameters<typeof createContent>[0]) {
  const { categoryId, ...data } = input;
  return prisma.contentItem.update({
    where: { id },
    data: {
      ...data,
      status: input.status ?? "draft",
      publishedAt: input.status === "published" ? new Date() : null,
      category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
    },
  });
}

export async function deleteContent(id: number) {
  return prisma.contentItem.delete({ where: { id } });
}

export const listCategories = () => prisma.category.findMany({ orderBy: { name: "asc" } });
export const createCategory = (name: string, slug: string, description?: string) => prisma.category.create({ data: { name, slug, description } });
export const deleteCategory = (id: number) => prisma.category.delete({ where: { id } });
export const listMedia = () => prisma.media.findMany({ orderBy: { createdAt: "desc" } });
export const createMedia = (url: string, altText?: string) => prisma.media.create({ data: { url, altText } });
export const deleteMedia = (id: number) => prisma.media.delete({ where: { id } });
export const listSettings = () => prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
export const upsertSetting = (key: string, value: string, isPublic: boolean) => prisma.siteSetting.upsert({ where: { key }, update: { value, isPublic }, create: { key, value, isPublic } });

export async function getAdminAnalytics() {
  const [content, subscribers] = await Promise.all([
    prisma.contentItem.groupBy({ by: ["kind", "status"], _count: { _all: true } }),
    prisma.subscriber.count({ where: { status: "active" } }),
  ]);
  const count = (kind: string, status?: string) =>
    content
      .filter((item: any) => item.kind === kind && (!status || item.status === status))
      .reduce((total: number, item: any) => total + item._count._all, 0);
  return {
    subscribers,
    content: {
      article: { total: count("article"), published: count("article", "published"), draft: count("article", "draft") },
      guide: { total: count("guide"), published: count("guide", "published"), draft: count("guide", "draft") },
      report: { total: count("report"), published: count("report", "published"), draft: count("report", "draft") },
      tool: { total: count("tool"), published: count("tool", "published"), draft: count("tool", "draft") },
    },
    recent: await prisma.contentItem.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, title: true, kind: true, status: true, updatedAt: true },
    }),
  };
}

export const listSubscribers = () => prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
export const subscribe = (email: string) => prisma.subscriber.upsert({ where: { email: email.toLowerCase() }, update: { status: "active" }, create: { email: email.toLowerCase() } });
export const listToolSettings = () => prisma.toolSetting.findMany({ orderBy: [{ toolSlug: "asc" }, { key: "asc" }] });
export const saveToolSetting = (input: { toolSlug: string; key: string; label: string; value: string; type: "number" | "text" | "boolean"; description?: string }) => prisma.toolSetting.upsert({ where: { toolSlug_key: { toolSlug: input.toolSlug, key: input.key } }, update: input, create: input });