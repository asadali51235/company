import "./globals.css";
import type { Metadata } from "next";
import { JsonLd } from "./json-ld";
import { siteUrl } from "./site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Estate Insights | Property research, guides and tools",
    template: "%s | Estate Insights",
  },
  description: "Independent real-estate research, practical guides, market reports and free property calculators.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Estate Insights",
    title: "Estate Insights | Property research, guides and tools",
    description: "Independent real-estate research, practical guides, market reports and free property calculators.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "Estate Insights", url: siteUrl, potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?query={search_term_string}`, "query-input": "required name=search_term_string" } }} />
      </body>
    </html>
  );
}