import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ApiError } from "@/lib/api";
import { categoriesQueryOptions, categoryQueryOptions, productsQueryOptions } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params, context }) => {
    let category;
    try {
      category = await context.queryClient.ensureQueryData(categoryQueryOptions(params.slug));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound();
      throw err;
    }
    const [products, categories] = await Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions({ category: params.slug })),
      context.queryClient.ensureQueryData(categoriesQueryOptions()),
    ]);
    return { category, products, categories };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category.name ?? "Category";
    return {
      meta: [
        { title: `${name} — Heron & Reed` },
        { name: "description", content: `Shop ${name} at Heron & Reed — premium furniture and home décor.` },
        { property: "og:title", content: `${name} — Heron & Reed` },
        { property: "og:description", content: `Shop ${name} at Heron & Reed — premium furniture and home décor.` },
        { property: "og:image", content: loaderData?.category.image ?? "" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products, categories } = Route.useLoaderData();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="container-x grid grid-cols-1 items-center gap-8 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{category.name}</h1>
            <p className="mt-3 text-muted-foreground">{category.tagline}. {products.length} pieces.</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {categories.filter((c) => c.slug !== category.slug).map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="aspect-[4/3] overflow-hidden rounded-md">
            <img src={category.image} alt={category.name} className="h-full w-full object-cover" width={1024} height={768} />
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        {products.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p: Product) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}