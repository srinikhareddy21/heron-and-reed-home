import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useAllCategories, useAllProducts } from "@/lib/queries";
import { getPopularProducts, searchProducts } from "@/lib/product-utils";
import { ProductCard } from "@/components/product-card";


const shopSearchSchema = z.object({
  q: z.string().catch("").default(""),
});

export const Route = createFileRoute("/shop")({
  validateSearch: (s) => shopSearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Shop All — Heron & Reed" },
      { name: "description", content: "Browse the full Heron & Reed collection of premium furniture and home décor." },
      { property: "og:title", content: "Shop All — Heron & Reed" },
      { property: "og:description", content: "Browse the full Heron & Reed collection of premium furniture and home décor." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { q } = Route.useSearch();
  const query = q.trim();
  const products = useAllProducts();
  const categories = useAllCategories();

  const filtered = query ? searchProducts(products, categories, query).map((r) => r.product) : products;
  const popularProducts = getPopularProducts(products);

  return (
    <div>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-x py-14">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {query ? "Search results" : "The collection"}
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            {query ? <>Results for “{q}”</> : "Shop everything."}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {query
              ? `${filtered.length} ${filtered.length === 1 ? "piece" : "pieces"} matched your search.`
              : `${products.length} carefully chosen pieces across every room of the home.`}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/shop"
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium hover:border-accent hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        {filtered.length === 0 ? (
          <div>
            <div className="mx-auto max-w-md rounded-md border border-border bg-card px-6 py-14 text-center">
              <h2 className="font-display text-2xl">No products found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn't find anything matching “{q}”. Try a different keyword or explore some of our most-loved pieces below.
              </p>
              <Link
                to="/shop"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
              >
                Browse all products
              </Link>
            </div>
            <div className="mt-14">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">You might like</p>
              <h3 className="mt-2 font-display text-2xl">Popular right now</h3>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {popularProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
