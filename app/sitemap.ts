import type { MetadataRoute } from "next";
import { articles, tools } from "@/lib/site-data";
import { siteUrl } from "./site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "articles", "guides", "reports", "about", "contact"];
  const contentRoutes = articles.filter((item) => item.kind !== "Area guide" && item.kind !== "Report").map((item) => {
    const section = item.kind === "Article" ? "articles" : item.kind === "Guide" ? "guides" : item.kind === "Report" ? "reports" : "areas";
    return { url: `${siteUrl}/${section}/${item.slug}`, lastModified: new Date(item.date) };
  });
  const toolRoutes = tools.map((tool) => ({ url: `${siteUrl}/tools/${tool.slug}`, changeFrequency: "monthly" as const }));

  return [
    ...staticRoutes.map((route) => ({ url: `${siteUrl}/${route}`, changeFrequency: "weekly" as const })),
    ...contentRoutes,
    ...toolRoutes,
  ];
}
