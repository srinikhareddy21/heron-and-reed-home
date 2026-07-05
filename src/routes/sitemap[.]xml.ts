import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ categories }, { products }] = await Promise.all([
          api.get<{ categories: Category[] }>("/api/categories"),
          api.get<{ products: Product[] }>("/api/products"),
        ]);

        const paths: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/shop", changefreq: "weekly", priority: "0.9" },
          { path: "/cart" },
          { path: "/wishlist" },
          { path: "/account" },
          ...categories.map((c) => ({ path: `/category/${c.slug}`, changefreq: "weekly", priority: "0.8" })),
          ...products.map((p) => ({ path: `/product/${p.slug}`, changefreq: "weekly", priority: "0.7" })),
        ];

        const urls = paths.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});