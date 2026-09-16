import Providers from "../providers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, tools } from "@/lib/site-data";
import { getMdxArticle, getMdxSlugs } from "@/lib/mdx";
import { BreadcrumbJsonLd, JsonLd } from "../json-ld";
import { siteUrl } from "../site-config";

export async function generateStaticParams() {
  const articles = await Promise.all((await getMdxSlugs()).map((slug) => getMdxArticle(slug)));
  return articles.filter((item): item is NonNullable<typeof item> => Boolean(item && ["Article", "Guide"].includes(item.kind))).map((item) => ({ slug: [item.kind === "Guide" ? "guides" : "articles", item.slug] }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const segments = (await params).slug ?? [];
  if (segments.length === 1 && segments[0] === "reports") {
    return { title: "Property statistics", description: "A clear snapshot of property prices, rents, yields and supply.", alternates: { canonical: "/reports" }, openGraph: { type: "website", title: "Property statistics", description: "A clear snapshot of property prices, rents, yields and supply.", url: "/reports" } };
  }
  if (segments[0] === "tools" && segments[1]) {
    const tool = tools.find((entry) => entry.slug === segments[1]);
    return tool ? { title: tool.name, description: tool.description, alternates: { canonical: `/tools/${tool.slug}` } } : {};
  }
  if (segments.length !== 2 || !["articles", "guides"].includes(segments[0])) return {};
  const item = await getMdxArticle(segments[1]);
  if (!item || (item.kind === "Article" ? segments[0] !== "articles" : item.kind === "Guide" ? segments[0] !== "guides" : true)) return {};
  const canonical = `/${segments[0]}/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical },
    openGraph: { type: "article", title: item.title, description: item.description, url: canonical, publishedTime: item.date, authors: [item.author] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const segments = (await params).slug ?? [];
  if (segments.length === 1 && segments[0] === "reports") {
    const statistics = [
      ["Median property price", "$428k", "+6.8%", "year over year"],
      ["Median monthly rent", "$1,850", "+7.4%", "year over year"],
      ["Average gross yield", "5.2%", "+0.4 pts", "market average"],
      ["Active inventory", "12,480", "-3.1%", "available listings"],
    ];
    return (
      <main className="min-h-screen bg-ivory text-ink">
        <article className="container py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-ink/55"><a href="/">Home</a> <span aria-hidden="true">/</span> <span>Reports</span></nav>
          <header className="max-w-3xl"><p className="eyebrow">Research desk</p><h1 className="display-heading mt-5">Property statistics at a glance.</h1><p className="mt-6 text-lg leading-8 text-ink/65">A clear snapshot of the numbers readers use to understand prices, rents, yields and supply.</p></header>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{statistics.map(([label, value, change, detail]) => <section className="admin-card" key={label}><p className="text-xs font-semibold uppercase tracking-[.12em] text-ink/45">{label}</p><p className="font-display mt-5 text-[38px] font-semibold tracking-[-.06em]">{value}</p><p className="mt-3 text-sm font-semibold text-coral">{change}</p><p className="mt-1 text-xs text-ink/45">{detail}</p></section>)}</div>
          <section className="mt-12 rounded-[20px] bg-sand p-7 md:p-10"><p className="eyebrow">How to read this</p><h2 className="font-display mt-3 text-[32px] font-semibold tracking-[-.05em]">Context matters more than one headline number.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-ink/60">These indicators are a starting point for research, not financial advice. Compare them over time and alongside the practical guidance in our articles.</p></section>
        </article>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Dataset", name: "Estate Insights property statistics", description: "Property price, rent, yield and inventory indicators.", url: `${siteUrl}/reports`, creator: { "@type": "Organization", name: "Estate Insights" } }} />
      </main>
    );
  }
  const tool = segments[0] === "tools" && segments[1] ? tools.find((entry) => entry.slug === segments[1]) : null;
  if (tool) {
    return (
      <>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: tool.name, description: tool.description, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }} />
        <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: `What does the ${tool.name} calculate?`, acceptedAnswer: { "@type": "Answer", text: `${tool.description} It is an educational estimate, not financial advice.` } }, { "@type": "Question", name: "Are these calculator results financial advice?", acceptedAnswer: { "@type": "Answer", text: "No. Use the result as a starting point and verify assumptions with a qualified professional." } }] }} />
        <Providers />
      </>
    );
  }
  const item = segments.length === 2 && ["articles", "guides"].includes(segments[0]) ? await getMdxArticle(segments[1]) : null;
  if (item && (item.kind === "Article" ? segments[0] !== "articles" : item.kind === "Guide" ? segments[0] !== "guides" : true)) return <Providers />;
  if (segments.length === 2 && !item && articles.some((article) => article.slug === segments[1])) notFound();
  if (!item) return <Providers />;

  const section = segments[0];
  const canonical = `${siteUrl}/${section}/${item.slug}`;
  return (
    <main className="min-h-screen bg-ivory text-ink">
      <article className="container py-16 md:py-24">
        <nav aria-label="Breadcrumb" className="mb-10 text-sm text-ink/55"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href={`/${section}`}>{item.kind}s</a> <span aria-hidden="true">/</span> <span>{item.title}</span></nav>
        <header className="mx-auto max-w-3xl">
          <p className="eyebrow">{item.kind} · {item.category}</p>
          <h1 className="display-heading mt-5">{item.title}</h1>
          <p className="mt-6 text-lg leading-8 text-ink/65">{item.description}</p>
          <p className="mt-6 border-y border-ink/10 py-4 text-sm text-ink/55">By {item.author} · Published {item.date}</p>
        </header>
        <div className="prose-custom mx-auto mt-12 max-w-2xl" dangerouslySetInnerHTML={{ __html: item.html }} />
      </article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.description, author: { "@type": "Person", name: item.author }, datePublished: item.date, dateModified: item.date, mainEntityOfPage: canonical, publisher: { "@type": "Organization", name: "Estate Insights" } }} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteUrl }, { name: item.kind, url: `${siteUrl}/${section}` }, { name: item.title, url: canonical }]} />
    </main>
  );
}