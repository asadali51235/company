import fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import remarkHtml from "remark-html";

export type MdxArticle = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
  category: string;
  kind: string;
  html: string;
};

const articlesDirectory = path.join(process.cwd(), "content", "articles");

function parseFrontmatter(source: string) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error("MDX article is missing frontmatter");

  const metadata = Object.fromEntries(
    match[1].split("\n").flatMap((line) => {
      const separator = line.indexOf(":");
      return separator === -1 ? [] : [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
    }),
  );

  return { metadata, body: match[2] };
}

export async function getMdxArticle(slug: string): Promise<MdxArticle | null> {
  try {
    const source = await fs.readFile(path.join(articlesDirectory, `${slug}.mdx`), "utf8");
    const { metadata, body } = parseFrontmatter(source);
    const processed = await remark().use(remarkHtml).process(body);
    return {
      slug,
      title: metadata.title ?? slug,
      description: metadata.description ?? "",
      author: metadata.author ?? "Estate Insights research desk",
      date: metadata.date ?? "",
      category: metadata.category ?? "Property",
      kind: metadata.kind ?? "Article",
      html: processed.toString(),
    };
  } catch {
    return null;
  }
}

export async function getMdxSlugs() {
  const entries = await fs.readdir(articlesDirectory, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx")).map((entry) => entry.name.replace(/\.mdx$/, ""));
}
