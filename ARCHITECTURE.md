# Estate Insights Platform

## Product architecture

This build is an editorial-first real-estate content platform. The public experience is organized around a calm reading surface, a content taxonomy, reusable content cards, and browser-side decision tools. The current preview ships with realistic seeded content so the information architecture and UX can be reviewed immediately.

### Public routes

| Route | Purpose |
|---|---|
| `/` | Editorial home, featured story, metrics, tools and newsletter |
| `/articles`, `/guides` | Content listing views |
| `/articles/[slug]`, `/guides/[slug]` | Reusable SEO content detail view |
| `/tools`, `/tools/[slug]` | Calculator index and client-side calculator pages |
| `/search` | Search across the seeded content library |
| `/about`, `/contact` | Trust and contact pages |
| `/admin` | Auth-gated workspace shell with editorial overview |

### Data model target

The project uses Next.js, Prisma, and Neon PostgreSQL. Admin credentials are stored as bcrypt hashes in `admin_users`, and opaque hashed session tokens are stored in `admin_sessions`.

### Authentication

`/admin` is wrapped in the app shell and uses the `adminProcedure` pattern. Admin pages redirect unauthenticated visitors to `/login`.

### SEO architecture

Public articles and guides are server-rendered from `content/articles/*.mdx` through the Next catch-all route. Reports are a read-only statistics view; calculators remain public utilities with formula values managed from the admin Tool settings panel. Article and calculator routes expose route-level `metadata`, canonical URLs, Open Graph fields and JSON-LD for `WebSite`, `Article`, `BreadcrumbList`, `FAQPage` and `SoftwareApplication`. `app/sitemap.ts` and `app/robots.ts` generate discovery files from the current content and tools. Set `NEXT_PUBLIC_SITE_URL` in production to the canonical site origin.

### Media

Use the scaffold storage helper for production uploads and persist URL + file key + alt text only. The preview uses remote Unsplash images as temporary editorial placeholders; replace these URLs with Cloudinary or the project's secure storage URLs before launch.

## Deploy checklist

1. Connect the repository/project to Vercel or use the managed WebDev publishing flow when available.
2. Add `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET` in the deployment environment.
3. Run `pnpm exec prisma db push` against the production database.
4. Promote the owner account to `admin` in the users table.
5. Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS canonical domain. The local fallback is only for development; do not deploy without this value.
6. Replace sample images with licensed Cloudinary/storage assets.
7. Verify `/admin`, a published content detail page, `/tools/rental-yield-calculator`, `/search`, `/robots.txt` and `/sitemap.xml` on the production URL.
8. Submit the sitemap in Google Search Console and monitor Core Web Vitals.
