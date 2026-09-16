import "./globals.css";
import type { Metadata } from "next";
import { JsonLd } from "./json-ld";
import { siteUrl } from "./site-config";

// Safe URL fallback ensure karne ke liye helper
const safeSiteUrl = siteUrl && siteUrl.trim() !== "" ? siteUrl : "http://localhost:3000";

function getValidMetadataBase(): URL {
  try {
    return new URL(safeSiteUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getValidMetadataBase(),
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
    url: safeSiteUrl, // <-- Yahan raw siteUrl ki jagah safeSiteUrl use karein
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Estate Insights",
            url: safeSiteUrl, // <-- Yahan bhi
            potentialAction: {
              "@type": "SearchAction",
              target: `${safeSiteUrl}/search?query={search_term_string}`, // <-- Yahan bhi
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </body>
    </html>
  );
}