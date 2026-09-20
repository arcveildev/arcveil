import type { MetadataRoute } from "next";
import { DOCS_PAGES } from "@/data/docs/nav";
import { SITE } from "@/data/site";

export const dynamic = "force-static";

const ROUTES = [
  "",
  "/gate",
  "/verify",
  ...DOCS_PAGES.map((page) => page.href),
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/security",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `https://${SITE.domain}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
