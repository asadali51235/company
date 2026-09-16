import { describe, expect, it } from "vitest";
import { articles, getContent, searchContent, tools } from "./site-data";

describe("estate insights content library", () => {
  it("contains a featured lead story and calculator catalog", () => {
    expect(articles.some((item) => item.featured)).toBe(true);
    expect(tools.length).toBeGreaterThanOrEqual(4);
  });

  it("finds content by title, excerpt, or category", () => {
    expect(searchContent("rental yield").some((item) => item.slug === "rental-yields-by-neighbourhood")).toBe(true);
    expect(searchContent("area guides").some((item) => item.kind === "Area guide")).toBe(true);
  });

  it("returns the correct content by stable slug and all content for blank search", () => {
    expect(getContent("first-time-buyer-playbook")?.kind).toBe("Guide");
    expect(searchContent(" ")).toHaveLength(articles.length);
  });
});
