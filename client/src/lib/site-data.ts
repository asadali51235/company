export type ContentKind = "Article" | "Guide" | "Report" | "Area guide";

export type ContentItem = {
  slug: string;
  kind: ContentKind;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  featured?: boolean;
  body: string[];
};

export const categories = [
  { name: "Buying", count: 18, color: "coral" },
  { name: "Investing", count: 24, color: "green" },
  { name: "Renting", count: 12, color: "sand" },
  { name: "Market data", count: 16, color: "blue" },
  { name: "Area guides", count: 31, color: "purple" },
];

export const articles: ContentItem[] = [
  {
    slug: "where-property-prices-are-heading-next",
    kind: "Article",
    title: "Where property prices are heading next — and what buyers should watch",
    excerpt: "A practical read on supply, affordability and the signals that matter more than headlines.",
    category: "Market data",
    readTime: "8 min read",
    date: "Sep 12, 2026",
    author: "Ayesha Khan",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
    featured: true,
    body: [
      "Property markets rarely move because of a single number. The useful question is how affordability, inventory and buyer confidence are moving together in a particular neighbourhood.",
      "Our latest read suggests that resilient locations are the ones where new infrastructure is arriving alongside real employment, schools and everyday services. These are the signals that tend to outlast short-term sentiment.",
      "For buyers, the best next step is not to chase a forecast. Build a clear budget, compare total ownership cost, and look for a property that still works if rates stay higher for longer.",
    ],
  },
  {
    slug: "first-time-buyer-playbook",
    kind: "Guide",
    title: "The first-time buyer playbook: from shortlist to keys",
    excerpt: "The decisions, documents and due diligence steps that make a first purchase less overwhelming.",
    category: "Buying",
    readTime: "12 min read",
    date: "Sep 08, 2026",
    author: "Omar Farooq",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=85",
    body: [
      "Buying your first home is a sequence of small decisions. Start by separating what you want from what you can responsibly afford every month.",
      "A strong shortlist includes commute, maintenance, future resale and the quality of the building—not just the finishings in the photos.",
      "Before signing, review title, approvals, service charges and the sale agreement with the right professional advice.",
    ],
  },
  {
    slug: "rental-yields-by-neighbourhood",
    kind: "Report",
    title: "Rental yields by neighbourhood: the 2026 snapshot",
    excerpt: "A visual guide to gross yields, vacancy risk and the trade-offs behind headline returns.",
    category: "Investing",
    readTime: "6 min read",
    date: "Aug 29, 2026",
    author: "Research desk",
    image: "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85",
    body: [
      "Gross yield is a useful first filter, but it is not the same as an investor's return. Insurance, maintenance, taxes and vacancy can materially change the result.",
      "Neighbourhood liquidity matters too. A slightly lower yield in a location with deeper tenant demand may be easier to manage over a full cycle.",
      "Use this snapshot with our rental yield calculator to model your own assumptions rather than relying on an average.",
    ],
  },
  {
    slug: "living-in-lakeview-district",
    kind: "Area guide",
    title: "Living in Lakeview District: a local guide for buyers and renters",
    excerpt: "What everyday life feels like, what homes cost and how the area is changing.",
    category: "Area guides",
    readTime: "10 min read",
    date: "Aug 21, 2026",
    author: "Editorial team",
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=900&q=85",
    body: [
      "Lakeview District combines established streets with a growing mix of apartment-led development. Its strongest draw is the balance between access and liveability.",
      "Renters should compare buildings by management quality and recurring charges. Buyers should pay close attention to traffic patterns and planned infrastructure.",
      "The neighbourhood is best explored at different times of day. A listing can tell you about a floor plan; a walk tells you about a place.",
    ],
  },
  {
    slug: "renting-without-regrets",
    kind: "Article",
    title: "Renting without regrets: five checks before you move in",
    excerpt: "A calm, practical checklist for comparing homes, contracts and hidden monthly costs.",
    category: "Renting",
    readTime: "5 min read",
    date: "Aug 14, 2026",
    author: "Mina Siddiqui",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85",
    body: [
      "A good rental decision is not only about the monthly rent. Add utilities, parking, transport, deposits and any recurring building charges before comparing options.",
      "Read the inventory and condition report carefully. Photos are useful evidence, but they should never replace an in-person inspection.",
      "Ask how repairs are handled and who is responsible for what. Clear expectations help both sides avoid friction later.",
    ],
  },
];

export const tools = [
  { slug: "rental-yield-calculator", name: "Rental yield calculator", label: "Investment", description: "Estimate gross rental yield and compare a property's income potential.", icon: "↗" },
  { slug: "affordability-calculator", name: "Affordability calculator", label: "Buying", description: "Turn a monthly payment comfort zone into a realistic purchase range.", icon: "⌂" },
  { slug: "mortgage-calculator", name: "Mortgage calculator", label: "Buying", description: "Understand principal, interest and the shape of a monthly payment.", icon: "▣" },
  { slug: "roi-calculator", name: "Property ROI calculator", label: "Investing", description: "Model appreciation, income and costs over your investment horizon.", icon: "◎" },
];

export const toolFormulaDefaults = [
  { toolSlug: "rental-yield-calculator", key: "annual_rent_periods", label: "Annual rent periods", value: "12", type: "number" as const, description: "Number of rent periods used to annualise monthly rent." },
  { toolSlug: "affordability-calculator", key: "affordability_ratio", label: "Affordability ratio", value: "0.8", type: "number" as const, description: "Percentage of the entered property value used for the estimate." },
  { toolSlug: "mortgage-calculator", key: "default_interest_rate", label: "Default interest rate", value: "5.5", type: "number" as const, description: "Initial interest rate shown in the calculator." },
  { toolSlug: "mortgage-calculator", key: "default_term_years", label: "Default mortgage term", value: "25", type: "number" as const, description: "Initial mortgage term in years." },
  { toolSlug: "roi-calculator", key: "projection_years", label: "ROI projection years", value: "5", type: "number" as const, description: "Number of years used for the property growth projection." },
];

export const allContent = articles;

export function getContent(slug: string) {
  return allContent.find((item) => item.slug === slug);
}

export function searchContent(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return allContent;
  return allContent.filter((item) => `${item.title} ${item.excerpt} ${item.category}`.toLowerCase().includes(term));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
