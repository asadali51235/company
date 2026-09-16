import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import AdminCMS from "@/components/AdminCMS";
import {
  allContent,
  articles,
  categories,
  formatCurrency,
  getContent,
  searchContent,
  tools,
  type ContentItem,
} from "@/lib/site-data";

const navItems = [
  ["Articles", "/articles"],
  ["Guides", "/guides"],
  ["Reports", "/reports"],
  ["Tools", "/tools"],
];

const articleCount = articles.filter((item: ContentItem) => item.kind === "Article").length;
const guideCount = articles.filter((item: ContentItem) => item.kind === "Guide").length;
const toolCount = tools.length;

type CmsPublicContent = {
  slug: string;
  kind: "article" | "guide" | "report" | "area" | "tool";
  title: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
};

function toContentItem(item: CmsPublicContent): ContentItem {
  return {
    slug: item.slug,
    kind: item.kind === "article" ? "Article" : item.kind === "guide" ? "Guide" : item.kind === "report" ? "Report" : item.kind === "area" ? "Area guide" : "Article",
    title: item.title,
    excerpt: item.excerpt ?? "",
    category: item.kind === "guide" ? "Guides" : item.kind === "article" ? "Articles" : "Property",
    readTime: "5 min read",
    date: new Date(item.publishedAt ?? item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    author: "Estate Insights editorial team",
    image: item.featuredImage ?? articles[0].image,
    body: item.content ? item.content.split(/\n\s*\n/).filter(Boolean) : [],
  };
}

function mergePublishedContent(items: ContentItem[], cmsItems?: CmsPublicContent[]) {
  if (!cmsItems) return items;
  const cms = cmsItems.map(toContentItem);
  const cmsSlugs = new Set(cms.map((item: ContentItem) => item.slug));
  return [...cms, ...items.filter((item: ContentItem) => !cmsSlugs.has(item.slug))];
}

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — Estate Insights`;
  }, [title]);
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 group"
      aria-label="Estate Insights home"
    >
      <span className="brand-mark">ei</span>
      <span className="font-display text-[20px] font-semibold tracking-[-0.04em]">
        Estate Insights
      </span>
    </Link>
  );
}

function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  return (
    <header className={`site-header ${open ? "menu-open" : ""}`}>
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Logo />
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Primary navigation"
        >
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/search" className="icon-button" aria-label="Search">
            <Search size={19} />
          </Link>
          <Link href="/login" className="nav-link">
            Sign in
          </Link>
          <Link href="/about" className="button button-dark">
            About us <ArrowUpRight size={16} />
          </Link>
        </div>
        <button
          className="icon-button mobile-menu-toggle md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="mobile-menu mobile-menu-panel md:hidden">
          <div className="container grid gap-3 py-5">
            {navItems.map(([label, href]) => (
              <Link
                onClick={() => setOpen(false)}
                key={href}
                href={href}
                className="mobile-nav-link"
              >
                {label}
                <ChevronRight size={17} />
              </Link>
            ))}
            <Link
              onClick={() => setOpen(false)}
              href="/search"
              className="mobile-nav-link"
            >
              Search
              <ChevronRight size={17} />
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/login"
              className="mobile-nav-link"
            >
              Sign in
              <ChevronRight size={17} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-ivory">
      <div className="container grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-6 text-ivory/60">
            Better decisions start with better information. Independent
            real-estate research, guides and tools for the way the market
            actually works.
          </p>
        </div>
        <FooterColumn
          title="Explore"
          links={[
            ["Articles", "/articles"],
            ["Guides", "/guides"],
            ["Reports", "/reports"],
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            ["About", "/about"],
            ["Contact", "/contact"],
            ["Admin login", "/admin"],
          ]}
        />
        <FooterColumn title="Tools" links={tools.map(tool => [tool.name, `/tools/${tool.slug}`])} />
      </div>
      <div className="container flex flex-col justify-between gap-3 border-t border-ivory/10 py-5 text-xs text-ivory/50 md:flex-row">
        <span>
          © 2026 Estate Insights. Built for useful real-estate decisions.
        </span>
        <span>Privacy · Terms · Editorial policy</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="eyebrow text-ivory/45">{title}</p>
      <div className="mt-4 grid gap-3">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-ivory/70 transition-colors hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <PublicHeader />
      {children}
      <Footer />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-heading mt-3 max-w-2xl">{title}</h2>
        {description && (
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-ink/60">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link href={href} className="text-link shrink-0">
          {linkLabel}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual relative overflow-hidden rounded-[24px] bg-[#c6d7d5] p-5 md:p-7">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: "radial-gradient(#17433f 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="relative flex h-full min-h-[430px] flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-ink/15 bg-ivory/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
            Market note / 08
          </span>
          <span className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-ivory">
            2026 outlook
          </span>
        </div>
        <div className="relative mx-auto flex w-full max-w-[420px] items-end justify-center gap-3 pb-8 pt-12">
          <div className="building building-a">
            <span>10</span>
          </div>
          <div className="building building-b">
            <span>14</span>
          </div>
          <div className="building building-c">
            <span>08</span>
          </div>
          <div className="building building-d">
            <span>18</span>
          </div>
          <div className="absolute bottom-0 left-1/2 h-1 w-[85%] -translate-x-1/2 rounded-full bg-ink/70" />
        </div>
        <div className="relative flex items-end justify-between gap-5">
          <div>
            <p className="font-display text-[40px] font-semibold leading-none tracking-[-0.06em]">
              +7.4%
            </p>
            <p className="mt-2 text-xs text-ink/60">
              Annual median rent growth
            </p>
          </div>
          <div className="max-w-[180px] text-right text-xs leading-5 text-ink/60">
            A calm view of the numbers behind the noise.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  usePageTitle("Research for real-estate decisions");
  const publishedContentQuery = trpc.content.list.useQuery({});
  const publishedContent = publishedContentQuery.data;
  const publicItems = mergePublishedContent(articles, publishedContent as CmsPublicContent[] | undefined);
  const publicArticles = publicItems.filter((item: ContentItem) => item.kind === "Article");
  const publicJournal = publicItems.filter((item: ContentItem) => item.kind === "Article" || item.kind === "Guide");
  const articleCount = publishedContent
    ? publicArticles.length
    : articles.filter((item: ContentItem) => item.kind === "Article").length;
  const guideCount = publicItems.filter((item: ContentItem) => item.kind === "Guide").length;
  return (
    <PublicLayout>
      <main>
        <section className="container grid gap-10 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <div className="eyebrow flex items-center gap-2">
              <span className="status-dot" /> Independent property intelligence
            </div>
            <h1 className="display-heading hero-title mt-6">
              Read the market.
              <br />
              <em>Move with clarity.</em>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-8 text-ink/65">
              Real-estate articles, practical guides, market statistics and
              simple tools for clearer property decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/articles" className="button button-coral">
                Explore the journal <ArrowRight size={17} />
              </Link>
              <Link href="/tools" className="button button-outline">
                Try a calculator <Calculator size={16} />
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-6 text-xs text-ink/55">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-coral" /> No jargon
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-coral" /> Updated weekly
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-coral" /> Built for real
                decisions
              </span>
            </div>
          </div>
          <HeroVisual />
        </section>
        <section className="container pb-20">
          <div className="rule-grid grid gap-4 py-7 sm:grid-cols-3">
            <Metric value={String(articleCount)} label="Published articles" />
            <Metric value={String(guideCount)} label="Published guides" />
            <Metric value={String(toolCount)} label="Free decision tools" />
          </div>
        </section>
        <section className="container pb-24">
          <SectionHeading
            eyebrow="The lead story"
            title="A sharper read on what moves property markets"
            description="Skip the generic advice. Follow the forces shaping prices, rents and real decisions in the places people actually live."
            href="/articles/where-property-prices-are-heading-next"
            linkLabel="Read the lead"
          />
          <div className="feature-story grid overflow-hidden rounded-[22px] bg-sand md:grid-cols-[1fr_1.1fr]">
            <img
              src={publicArticles[0].image}
              alt="Modern home exterior"
              className="h-72 w-full object-cover md:h-full"
            />
            <div className="flex flex-col justify-between p-7 md:p-10">
              <div>
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
                  <span>{publicArticles[0].category}</span>
                  <span className="h-1 w-1 rounded-full bg-coral" />
                  <span>{publicArticles[0].readTime}</span>
                </div>
                <h3 className="font-display mt-5 max-w-xl text-[34px] font-semibold leading-[1.05] tracking-[-0.05em] md:text-[46px]">
                  {publicArticles[0].title}
                </h3>
                <p className="mt-5 max-w-lg text-[15px] leading-7 text-ink/65">
                  {publicArticles[0].excerpt}
                </p>
              </div>
              <div className="mt-10 flex items-center justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="avatar">AK</div>
                  <div>
                    <p className="text-sm font-semibold">
                      {publicArticles[0].author}
                    </p>
                    <p className="text-xs text-ink/50">{publicArticles[0].date}</p>
                  </div>
                </div>
                <Link
                  href={`/articles/${publicArticles[0].slug}`}
                  className="circle-arrow"
                  aria-label="Read article"
                >
                  <ArrowUpRight size={19} />
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-[#e9e1d3] py-20">
          <div className="container">
            <SectionHeading
              eyebrow="From the journal"
              title="Useful context for your next move"
              href="/articles"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {publicJournal.slice(1, 4).map((item: ContentItem) => (
                <ContentCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>
        <section className="container py-24">
          <SectionHeading
            eyebrow="Tools for the numbers"
            title="Make the decision less fuzzy"
            description="Simple, transparent calculators for the moments where a good gut feeling needs a second opinion."
            href="/tools"
            linkLabel="See all tools"
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{tools.map(tool => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </section>
        <Newsletter />
      </main>
    </PublicLayout>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 border-r border-ink/10 last:border-0 sm:justify-center">
      <span className="font-display text-[32px] font-semibold tracking-[-0.06em]">
        {value}
      </span>
      <span className="max-w-[100px] text-xs leading-4 text-ink/55">
        {label}
      </span>
    </div>
  );
}

function ContentCard({
  item,
  compact = false,
}: {
  item: ContentItem;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/${item.kind === "Article" ? "articles" : item.kind === "Guide" ? "guides" : item.kind === "Report" ? "reports" : "areas"}/${item.slug}`}
      className={`content-card group ${compact ? "grid grid-cols-[110px_1fr] gap-4" : ""}`}
    >
      <img
        src={item.image}
        alt={item.title}
        className={`w-full rounded-[14px] object-cover ${compact ? "h-[94px]" : "h-52"}`}
      />
      <div className={compact ? "pt-0.5" : "pt-5"}>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/45">
          <span>{item.kind}</span>
          <span className="h-1 w-1 rounded-full bg-coral" />
          <span>{item.readTime}</span>
        </div>
        <h3
          className={`font-display mt-3 font-semibold leading-[1.1] tracking-[-0.04em] transition-colors group-hover:text-coral ${compact ? "text-[20px]" : "text-[26px]"}`}
        >
          {item.title}
        </h3>
        {!compact && (
          <p className="mt-3 text-sm leading-6 text-ink/60">{item.excerpt}</p>
        )}
        <p className="mt-4 text-xs text-ink/45">{item.date}</p>
      </div>
    </Link>
  );
}

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card group">
      <div className="tool-icon">{tool.icon}</div>
      <div className="mt-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-coral">
            {tool.label}
          </p>
          <h3 className="font-display mt-2 text-[23px] font-semibold leading-[1.05] tracking-[-0.04em]">
            {tool.name}
          </h3>
        </div>
        <ArrowUpRight
          size={17}
          className="mt-1 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/55">{tool.description}</p>
    </Link>
  );
}

function Newsletter() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const subscribe = trpc.admin.subscribe.useMutation({
    onSuccess: () => setSent(true),
  });
  return (
    <section className="container py-24">
      <div className="newsletter relative overflow-hidden rounded-[22px] bg-ink p-8 text-ivory md:p-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-ivory/10" />
        <div className="absolute -right-2 -top-2 h-36 w-36 rounded-full border border-coral/40" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="eyebrow text-coral">The Sunday brief</p>
            <h2 className="font-display mt-4 max-w-md text-[38px] font-semibold leading-[.98] tracking-[-0.05em] md:text-[48px]">
              A clearer week in property.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-ivory/60">
              One useful market signal, one practical guide and one tool worth
              bookmarking. No noise.
            </p>
          </div>
          <div>
            {sent ? (
              <div className="flex items-center gap-3 rounded-xl border border-ivory/15 bg-white/5 p-4 text-sm">
                <CheckCircle2 className="text-coral" size={18} /> You’re on the
                list. See you Sunday.
              </div>
            ) : (
              <form
                onSubmit={event => {
                  event.preventDefault();
                  subscribe.mutate({ email });
                }}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <input
                  required
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="Your email address"
                  aria-label="Your email address"
                  className="newsletter-input"
                />
                <button
                  className="button button-coral whitespace-nowrap"
                  disabled={subscribe.isPending}
                  type="submit"
                >
                  {subscribe.isPending ? "Joining…" : "Subscribe"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingPage({
  title,
  eyebrow,
  description,
  items,
}: {
  title: string;
  eyebrow: string;
  description: string;
  items: ContentItem[];
}) {
  usePageTitle(title);
  const publishedContentQuery = trpc.content.list.useQuery({});
  const allowedKinds = new Set(items.map((item: ContentItem) => item.kind));
  const visibleItems = mergePublishedContent(items, publishedContentQuery.data as CmsPublicContent[] | undefined).filter((item: ContentItem) => allowedKinds.has(item.kind));
  return (
    <PublicLayout>
      <main className="container py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-heading mt-5">{title}</h1>
          <p className="mt-5 text-[16px] leading-7 text-ink/60">
            {description}
          </p>
        </div>
        <div className="mt-14 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item: ContentItem) => (
            <ContentCard item={item} key={item.slug} />
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}

export function ArticlesPage() {
  return (
    <ListingPage
      eyebrow="The journal"
      title="Ideas for where you live next."
      description="Reporting, explainers and grounded opinions on buying, renting, investing and the forces shaping property markets."
      items={articles.filter((item: ContentItem) => item.kind === "Article")}
    />
  );
}
export function GuidesPage() {
  return (
    <ListingPage
      eyebrow="Practical guides"
      title="The stuff they forget to tell you."
      description="Clear, step-by-step guides for the big property decisions—without the sales pitch."
      items={articles.filter((item: ContentItem) => item.kind === "Guide")}
    />
  );
}
export function ReportsPage() {
  usePageTitle("Property statistics");
  const statistics = [
    ["Median property price", "$428k", "+6.8%", "year over year"],
    ["Median monthly rent", "$1,850", "+7.4%", "year over year"],
    ["Average gross yield", "5.2%", "+0.4 pts", "market average"],
    ["Active inventory", "12,480", "-3.1%", "available listings"],
  ];
  return (
    <PublicLayout>
      <main className="container py-14 md:py-20">
        <div className="max-w-2xl"><p className="eyebrow">Research desk</p><h1 className="display-heading mt-5">Property statistics at a glance.</h1><p className="mt-5 text-[16px] leading-7 text-ink/60">A clear snapshot of the numbers readers use to understand prices, rents, yields and supply. Updated as new market data is published.</p></div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{statistics.map(([label, value, change, detail]) => <div className="admin-card" key={label}><p className="text-xs font-semibold uppercase tracking-[.12em] text-ink/45">{label}</p><p className="font-display mt-5 text-[38px] font-semibold tracking-[-.06em]">{value}</p><p className="mt-3 text-sm font-semibold text-coral">{change}</p><p className="mt-1 text-xs text-ink/45">{detail}</p></div>)}</div>
        <div className="mt-12 rounded-[20px] bg-sand p-7 md:p-10"><p className="eyebrow">How to read this</p><h2 className="font-display mt-3 text-[32px] font-semibold tracking-[-.05em]">Context matters more than one headline number.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">These indicators are a starting point for research, not financial advice. Compare them over time and alongside the practical guidance in our articles.</p></div>
      </main>
    </PublicLayout>
  );
}

export function ContentDetailPage() {
  const [, params] = useRoute("/:type/:slug");
  const slug = params?.slug ?? "";
  const cmsItemQuery = trpc.content.bySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const item = cmsItemQuery.data
    ? toContentItem(cmsItemQuery.data as CmsPublicContent)
    : getContent(slug);
  usePageTitle(item?.title ?? "Story");
  if (!item) return <NotFoundContent />;
  return (
    <PublicLayout>
      <main className="container py-12 md:py-20">
        <Link href="/articles" className="back-link">
          <ChevronRight size={16} className="rotate-180" /> Back to the journal
        </Link>
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
            <span>{item.kind}</span>
            <span className="h-1 w-1 rounded-full bg-coral" />
            <span>{item.category}</span>
            <span className="h-1 w-1 rounded-full bg-coral" />
            <span>{item.readTime}</span>
          </div>
          <h1 className="display-heading mt-6 max-w-4xl">{item.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-8 text-ink/60">
            {item.excerpt}
          </p>
          <div className="mt-8 flex items-center gap-3 border-y border-ink/10 py-5">
            <div className="avatar">
              {item.author
                .split(" ")
                .map(name => name[0])
                .join("")}
            </div>
            <div>
              <p className="text-sm font-semibold">{item.author}</p>
              <p className="text-xs text-ink/50">
                Published {item.date} · Editorial research
              </p>
            </div>
          </div>
          <img
            src={item.image}
            alt={item.title}
            className="mt-10 h-[300px] w-full rounded-[20px] object-cover md:h-[500px]"
          />
          <article className="prose-custom mx-auto mt-12 max-w-2xl">
            {item.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <blockquote>
              “The best property decision is the one that still makes sense
              after the excitement wears off.”
            </blockquote>
            <h2>What to do next</h2>
            <p>
              Use the information here as a starting point, then pressure-test
              it against your own budget, timeline and local conditions. Our
              calculators are designed to make that last step easier.
            </p>
          </article>
          <div className="mx-auto mt-14 max-w-2xl rounded-[18px] bg-sand p-6">
            <p className="eyebrow">Keep exploring</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/reports" className="button button-dark">
                View statistics <ArrowRight size={16} />
              </Link>
              <Link href="/guides" className="button button-outline">
                Read practical guides
              </Link>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}

function NotFoundContent() {
  return (
    <PublicLayout>
      <main className="container py-32 text-center">
        <p className="eyebrow">404</p>
        <h1 className="display-heading mt-4">That page moved on.</h1>
        <Link href="/" className="button button-dark mt-8">
          Back home
        </Link>
      </main>
    </PublicLayout>
  );
}

export function ToolsPage() {
  usePageTitle("Real-estate tools");
  return (
    <PublicLayout>
      <main className="container py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Free tools</p>
          <h1 className="display-heading mt-5">
            Put a number on the next move.
          </h1>
          <p className="mt-5 text-[16px] leading-7 text-ink/60">
            Transparent calculators for buying, renting and investing. Change
            the assumptions, see what moves, and save your questions for the
            right professional.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {tools.map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
        <div className="mt-16 grid gap-5 rounded-[20px] bg-[#dbe7e4] p-7 md:grid-cols-[1fr_1fr] md:p-10">
          <div>
            <p className="eyebrow">A note on the maths</p>
            <h2 className="font-display mt-4 text-[34px] font-semibold leading-none tracking-[-0.05em]">
              Simple is a feature.
            </h2>
          </div>
          <p className="text-sm leading-7 text-ink/65">
            These tools are educational starting points, not financial advice.
            The formulas stay visible so you can understand the result and
            challenge the assumptions behind it.
          </p>
        </div>
      </main>
    </PublicLayout>
  );
}

export function ToolDetailPage() {
  const [, params] = useRoute("/tools/:slug");
  const tool = tools.find((entry: (typeof tools)[number]) => entry.slug === params?.slug) ?? tools[0];
  usePageTitle(tool.name);
  const formulaSettings = trpc.content.toolSettings.useQuery();
  const [values, setValues] = useState({
    price: "250000",
    rent: "1800",
    deposit: "50000",
    rate: "5.5",
    term: "25",
    growth: "4",
  });
  const update =
    (key: keyof typeof values) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues({ ...values, [key]: event.target.value });
  const settingValue = (toolSlug: string, key: string, fallback: string) =>
    formulaSettings.data?.find((item: any) => item.toolSlug === toolSlug && item.key === key)?.value ?? fallback;
  useEffect(() => {
    if (!formulaSettings.data) return;
    setValues((current: any) => ({
      ...current,
      rate: settingValue("mortgage-calculator", "default_interest_rate", "5.5"),
      term: settingValue("mortgage-calculator", "default_term_years", "25"),
    }));
  }, [formulaSettings.data]);
  const annualRentPeriods = Number(settingValue("rental-yield-calculator", "annual_rent_periods", "12")) || 12;
  const affordabilityRatio = Number(settingValue("affordability-calculator", "affordability_ratio", "0.8")) || 0.8;
  const projectionYears = Number(settingValue("roi-calculator", "projection_years", "5")) || 5;
  const price = Number(values.price) || 0;
  const rent = Number(values.rent) || 0;
  const deposit = Number(values.deposit) || 0;
  const rate = Number(values.rate) || 0;
  const term = Number(values.term) || 1;
  const annualRent = rent * annualRentPeriods;
  const yieldValue = price ? (annualRent / price) * 100 : 0;
  const loan = Math.max(price - deposit, 0);
  const monthlyRate = rate / 100 / 12;
  const payments = term * 12;
  const mortgage = monthlyRate
    ? (loan * (monthlyRate * Math.pow(1 + monthlyRate, payments))) /
      (Math.pow(1 + monthlyRate, payments) - 1)
    : loan / payments;
  const projectedValue =
    price * Math.pow(1 + (Number(values.growth) || 0) / 100, projectionYears);
  const result =
    tool.slug === "rental-yield-calculator"
      ? `${yieldValue.toFixed(2)}%`
      : tool.slug === "mortgage-calculator"
        ? formatCurrency(mortgage)
        : tool.slug === "roi-calculator"
          ? formatCurrency(projectedValue - price)
          : formatCurrency(price * affordabilityRatio);
  return (
    <PublicLayout>
      <main className="container py-12 md:py-20">
        <Link href="/tools" className="back-link">
          <ChevronRight size={16} className="rotate-180" /> Back to all tools
        </Link>
        <div className="mt-10 grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <div className="tool-icon large">{tool.icon}</div>
            <p className="eyebrow mt-8">{tool.label} tool</p>
            <h1 className="display-heading mt-4">{tool.name}</h1>
            <p className="mt-5 text-[16px] leading-7 text-ink/60">
              {tool.description} Adjust the assumptions below to see an instant
              estimate.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-ink/65">
              <p className="flex items-start gap-3">
                <Check className="mt-0.5 text-coral" size={17} /> Runs in your
                browser
              </p>
              <p className="flex items-start gap-3">
                <Check className="mt-0.5 text-coral" size={17} /> No data stored
              </p>
              <p className="flex items-start gap-3">
                <Check className="mt-0.5 text-coral" size={17} /> Built for
                scenario planning
              </p>
            </div>
          </div>
          <div className="calculator-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Your estimate</p>
                <p className="font-display mt-3 text-[52px] font-semibold leading-none tracking-[-0.06em] text-coral">
                  {result}
                </p>
              </div>
              <Calculator className="text-coral/60" size={27} />
            </div>
            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              <CalcField
                label="Property price"
                value={values.price}
                onChange={update("price")}
                prefix="$"
              />
              <CalcField
                label="Monthly rent"
                value={values.rent}
                onChange={update("rent")}
                prefix="$"
              />
              <CalcField
                label="Deposit / equity"
                value={values.deposit}
                onChange={update("deposit")}
                prefix="$"
              />
              <CalcField
                label="Interest rate"
                value={values.rate}
                onChange={update("rate")}
                suffix="%"
              />
              <CalcField
                label="Term"
                value={values.term}
                onChange={update("term")}
                suffix="yrs"
              />
              <CalcField
                label="Annual growth"
                value={values.growth}
                onChange={update("growth")}
                suffix="%"
              />
            </div>
            <div className="mt-8 border-t border-ink/10 pt-5 text-xs leading-5 text-ink/50">
              Illustrative only. Results depend on the assumptions you enter and
              do not account for every fee, tax or market condition.
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}

function CalcField({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold text-ink/60">
      {label}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-ink/35">{prefix}</span>
        <input
          className={`calc-input ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
          inputMode="decimal"
          value={value}
          onChange={onChange}
        />
        <span className="absolute right-3 text-ink/35">{suffix}</span>
      </div>
    </label>
  );
}

export function SearchPage() {
  usePageTitle("Search");
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchContent(query), [query]);
  return (
    <PublicLayout>
      <main className="container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Search the library</p>
          <h1 className="display-heading mt-5">Find the useful bit.</h1>
          <div className="search-box mt-9">
            <Search size={20} className="text-ink/40" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Try “rental yield”, “first-time buyer” or “Lakeview”"
            />
          </div>
          <p className="mt-5 text-sm text-ink/45">
            {query
              ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query}”`
              : `Showing all ${results.length} resources`}
          </p>
          <div className="mt-8 grid gap-5">
            {results.map((item: ContentItem) => (
              <ContentCard compact item={item} key={item.slug} />
            ))}
          </div>
          {results.length === 0 && (
            <div className="empty-state mt-8">
              <Search size={24} />
              <p className="mt-3 font-semibold">No exact matches yet.</p>
              <p className="mt-1 text-sm text-ink/55">
                Try a broader phrase or explore the categories below.
              </p>
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}

export function AboutPage() {
  usePageTitle("About Estate Insights");
  return (
    <PublicLayout>
      <main className="container py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <p className="eyebrow">Why we exist</p>
            <h1 className="display-heading mt-5">
              Property advice should leave you feeling more capable.
            </h1>
          </div>
          <p className="text-[17px] leading-8 text-ink/60">
            Estate Insights is an independent editorial platform for the
            decisions around property. We make the numbers legible, the
            trade-offs visible and the next step easier to find.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          <Principle
            icon={<BookOpen />}
            title="Explain, don’t sell"
            text="Every guide starts with the question a real person is trying to answer—not a product to push."
          />
          <Principle
            icon={<BarChart3 />}
            title="Show the assumptions"
            text="We believe the useful part of a number is understanding what moves it and what does not."
          />
          <Principle
            icon={<ShieldCheck />}
            title="Stay independent"
            text="Our editorial standards are designed to keep practical information separate from commercial pressure."
          />
        </div>
        <div className="mt-20 rounded-[22px] bg-sand p-8 md:p-12">
          <p className="eyebrow">Editorial standard</p>
          <h2 className="font-display mt-4 max-w-2xl text-[38px] font-semibold leading-[1.02] tracking-[-0.05em]">
            Clear enough for Monday morning. Rigorous enough for the big
            decision.
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-ink/65">
            We update evergreen guides when the market or the rules change,
            label opinions clearly, and treat local context as essential—not
            optional.
          </p>
        </div>
      </main>
    </PublicLayout>
  );
}
function Principle({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="border-t-2 border-ink pt-5">
      <div className="text-coral">{icon}</div>
      <h3 className="font-display mt-5 text-[25px] font-semibold tracking-[-0.04em]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-ink/60">{text}</p>
    </div>
  );
}

export function ContactPage() {
  usePageTitle("Contact");
  const [sent, setSent] = useState(false);
  return (
    <PublicLayout>
      <main className="container py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Get in touch</p>
            <h1 className="display-heading mt-5">Have a better question?</h1>
            <p className="mt-6 max-w-md text-[16px] leading-7 text-ink/60">
              Tell us what you are trying to understand. We read every note,
              especially the specific ones.
            </p>
            <div className="mt-9 grid gap-4 text-sm text-ink/65">
              <p className="flex items-center gap-3">
                <Mail size={17} className="text-coral" />{" "}
                hello@estateinsights.example
              </p>
              <p className="flex items-center gap-3">
                <Clock3 size={17} className="text-coral" /> Replies within 2
                working days
              </p>
            </div>
          </div>
          <div className="rounded-[20px] bg-sand p-7 md:p-10">
            {sent ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={34} className="mx-auto text-coral" />
                <h2 className="font-display mt-5 text-[32px] font-semibold tracking-[-0.05em]">
                  Message received.
                </h2>
                <p className="mt-3 text-sm text-ink/60">
                  Thanks for writing. We’ll get back to you soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={event => {
                  event.preventDefault();
                  setSent(true);
                }}
                className="grid gap-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" placeholder="Name" required />
                  <Field
                    label="Email address"
                    placeholder="you@example.com"
                    type="email"
                    required
                  />
                </div>
                <Field
                  label="Subject"
                  placeholder="What can we help with?"
                  required
                />
                <label className="grid gap-2 text-xs font-semibold text-ink/60">
                  Message
                  <textarea
                    required
                    className="form-input min-h-36"
                    placeholder="A little context goes a long way..."
                  />
                </label>
                <button className="button button-dark w-fit" type="submit">
                  Send message <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
function Field({
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold text-ink/60">
      {label}
      <input
        required={required}
        type={type}
        className="form-input"
        placeholder={placeholder}
      />
    </label>
  );
}

export function LoginPage() {
  const [, navigate] = useLocation();
  const login = trpc.auth.login.useMutation({
    onSuccess: () => navigate("/admin"),
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  usePageTitle("Admin login");
  return (
    <main className="admin-login">
      <LockKeyhole size={28} className="text-coral" />
      <h1 className="font-display mt-5 text-[34px] font-semibold">
        Admin sign in
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">
        Use your Estate Insights administrator credentials.
      </p>
      <form
        onSubmit={event => {
          event.preventDefault();
          login.mutate({ email, password });
        }}
        className="mt-7 grid w-full max-w-sm gap-4 text-left"
      >
        <label className="grid gap-2 text-xs font-semibold text-ink/60">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="form-input"
            placeholder="admin@example.com"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold text-ink/60">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="form-input"
            placeholder="Your password"
          />
        </label>
        {login.error && (
          <p className="text-sm text-red-700">Invalid email or password.</p>
        )}
        <button
          className="button button-dark"
          type="submit"
          disabled={login.isPending}
        >
          {login.isPending ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
        </button>
        <Link href="/" className="text-link justify-center">
          Back to website
        </Link>
      </form>
    </main>
  );
}

function AdminWorkspace() {
  const [active, setActive] = useState("Overview");
  const [published, setPublished] = useState(true);
  const { user, logout, loading, isAdmin } = useAuth();
  if (loading)
    return <div className="admin-loading">Loading secure workspace…</div>;
  if (!user)
    return (
      <div className="admin-login">
        <LockKeyhole size={28} className="text-coral" />
        <h1 className="font-display mt-5 text-[34px] font-semibold">
          Sign in to continue
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">
          Only authorized editors can access the Estate Insights workspace.
        </p>
        <button
          className="button button-dark mt-7"
          onClick={() => startLogin()}
        >
          Launch secure login <ArrowRight size={16} />
        </button>
      </div>
    );
  if (!isAdmin)
    return (
      <div className="admin-login">
        <ShieldCheck size={28} className="text-coral" />
        <h1 className="font-display mt-5 text-[34px] font-semibold">
          Access denied
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-ink/55">
          This account does not have admin permissions. Please sign in with an
          administrator account.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button className="button button-dark" onClick={() => logout()}>
            Sign out
          </button>
          <Link href="/" className="button button-outline">
            Back to home
          </Link>
        </div>
      </div>
    );
  const menu = [
    "Overview",
    "Articles",
    "Guides",
    "Reports",
    "Tool settings",
    "Categories",
    "Media",
    "SEO settings",
  ];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="mb-8">
          <Logo />
        </div>
        <p className="eyebrow text-ink/40">Workspace</p>
        <div className="mt-3 grid gap-1">
          {menu.map((item, index) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`admin-nav ${active === item ? "active" : ""}`}
            >
              {index === 0 ? (
                <LayoutDashboard size={16} />
              ) : index === 5 ? (
                <Calculator size={16} />
              ) : (
                <FileText size={16} />
              )}
              {item}
            </button>
          ))}
        </div>
        <div className="mt-auto border-t border-ink/10 pt-5">
          <p className="text-xs font-semibold">
            {user?.name ?? "Admin account"}
          </p>
          <p className="mt-1 truncate text-xs text-ink/45">
            {user?.email ?? "Authenticated workspace"}
          </p>
          <button
            onClick={() => logout()}
            className="mt-4 text-xs font-semibold text-coral"
          >
            Sign out
          </button>
        </div>
      </aside>
      <section className="admin-main">
        <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-center">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="font-display mt-2 text-[34px] font-semibold tracking-[-0.05em]">
              {active}
            </h1>
          </div>
          <button
            className="button button-coral"
            onClick={() => setPublished(!published)}
          >
            {published ? "Create new content" : "Save draft"}{" "}
            <ArrowRight size={16} />
          </button>
        </div>
        {active === "Overview" ? (
          <>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminMetric
                label="Published pieces"
                value="89"
                change="+12 this quarter"
              />
              <AdminMetric
                label="Drafts in progress"
                value="14"
                change="3 need review"
              />
              <AdminMetric
                label="Search impressions"
                value="124k"
                change="+18.4% month on month"
              />
              <AdminMetric
                label="Tools used"
                value="3.8k"
                change="+9.2% this month"
              />
            </div>
            <div className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <div className="admin-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Recent content</p>
                    <h2 className="font-display mt-2 text-[25px] font-semibold">
                      Keep the library moving.
                    </h2>
                  </div>
                  <Link href="/articles" className="text-link text-xs">
                    View site <ArrowUpRight size={14} />
                  </Link>
                </div>
                <div className="mt-6 grid gap-3">
                  {articles.slice(0, 4).map((item: ContentItem) => (
                    <div
                      key={item.slug}
                      className="flex items-center justify-between gap-4 border-t border-ink/10 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-ink/45">
                          {item.kind} · {item.date}
                        </p>
                      </div>
                      <span className="badge badge-green">Published</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card bg-ink text-ivory">
                <p className="eyebrow text-coral">SEO health</p>
                <h2 className="font-display mt-2 text-[25px] font-semibold">
                  A strong base, more to do.
                </h2>
                <div className="mt-7 grid gap-4">
                  {[
                    ["Meta coverage", "94%"],
                    ["Image alt text", "87%"],
                    ["Internal links", "76%"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-ivory/65">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ivory/15">
                        <div
                          className="h-full rounded-full bg-coral"
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/about"
                  className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-ivory"
                >
                  Review checklist <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-7 admin-card">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-coral" />
              <p className="font-semibold">
                {active} management is ready for your content model.
              </p>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/55">
              Create, edit, filter and publish content from this protected
              workspace. The public experience already has the clean URLs,
              content taxonomy and reusable card patterns to consume these
              records.
            </p>
            <button
              className="button button-dark mt-7"
              onClick={() => setPublished(!published)}
            >
              {published ? "Start a draft" : "Publish draft"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
function AdminMetric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="admin-card">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="font-display mt-3 text-[34px] font-semibold tracking-[-0.06em]">
        {value}
      </p>
      <p className="mt-2 text-xs text-coral">{change}</p>
    </div>
  );
}

export function AdminPage() {
  usePageTitle("Admin dashboard");
  return <AdminCMS />;
}

export { allContent, categories };