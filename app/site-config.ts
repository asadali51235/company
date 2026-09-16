const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercelSiteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

export const siteUrl =
  (configuredSiteUrl && configuredSiteUrl.length > 0 ? configuredSiteUrl : undefined) ??
  vercelSiteUrl ??
  "http://localhost:3000";