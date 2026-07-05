import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { productQueryOptions, productsQueryOptions, useAllProducts } from "@/lib/queries";
import { formatPrice, trustBadgeFor } from "@/lib/product-utils";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRecentlyViewed, useTrackRecentlyViewed } from "@/lib/recently-viewed";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    let product;
    try {
      product = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) throw notFound();
      throw err;
    }
    const categoryProducts = await context.queryClient.ensureQueryData(
      productsQueryOptions({ category: product.category }),
    );
    const related = categoryProducts.filter((p) => p.slug !== product.slug).slice(0, 8);
    return { product, related };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — Heron & Reed` : "Heron & Reed" },
        { name: "description", content: p?.description ?? "" },
        { property: "og:title", content: p?.name ?? "Heron & Reed" },
        { property: "og:description", content: p?.description ?? "" },
        { property: "og:image", content: p?.image ?? "" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const wished = isWishlisted(product.slug);
  useTrackRecentlyViewed(product.slug);
  const recentSlugs = useRecentlyViewed(product.slug);
  const allProducts = useAllProducts();
  const recentlyViewed: Product[] = recentSlugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 6);

  const carousel = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = carousel.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const care = careFor(product);
  const moreLikeThis: Product[] =
    related.length > 0 ? related : allProducts.filter((p) => p.slug !== product.slug).slice(0, 8);

  return (
    <div>
      <div className="container-x pt-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-accent">
          {product.category.replace("-", " ")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <section className="container-x grid grid-cols-1 gap-10 py-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-12">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-md bg-secondary/60">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" width={1024} height={1024} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[product.image, product.image, product.image, product.image].map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "aspect-square overflow-hidden rounded-md bg-secondary/60 ring-1 transition",
                  activeImg === i ? "ring-accent" : "ring-border hover:ring-foreground/30",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          {product.badge && (
            <span className="inline-block rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-accent">
              {product.badge}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-4 w-4", i < Math.round(product.rating) ? "fill-accent text-accent" : "text-muted-foreground/40")}
                />
              ))}
            </div>
            <span className="text-muted-foreground">{product.rating.toFixed(1)} · {product.reviews} reviews</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatPrice(product.price)}</span>
            {product.compareAt && (
              <span className="text-base text-muted-foreground line-through">{formatPrice(product.compareAt)}</span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-7 flex items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-md border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center hover:bg-secondary" aria-label="Decrease">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-12 w-12 place-items-center hover:bg-secondary" aria-label="Increase">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => {
                addToCart(product.slug, qty);
                toast.success(`${product.name} added to cart`);
              }}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
            >
              Add to cart · {formatPrice(product.price * qty)}
            </button>

            <button
              onClick={() => toggleWishlist(product.slug)}
              aria-label="Wishlist"
              className={cn(
                "grid h-12 w-12 place-items-center rounded-md border border-border bg-background transition-colors hover:bg-secondary",
                wished && "border-accent text-accent",
              )}
            >
              <Heart className={cn("h-5 w-5", wished && "fill-accent")} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-md border border-border bg-secondary/40 p-4 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Free shipping over $99</div>
            <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" /> 30-day easy returns</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> {trustBadgeFor(product.category).label}</div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="container-x py-12">
        <h2 className="font-display text-2xl md:text-3xl">Product details</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SpecCard title="Dimensions">
            <div className="text-sm text-foreground">{product.dimensions}</div>
          </SpecCard>
          <SpecCard title="Materials">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {product.materials.map((m: string) => (
                <li key={m}>• {m}</li>
              ))}
            </ul>
          </SpecCard>
          <SpecCard title="Features">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {product.features.map((f: string) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </SpecCard>
          <SpecCard title="Care instructions">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {care.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </SpecCard>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x py-12">
        <h2 className="font-display text-2xl md:text-3xl">What customers are saying</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {sampleReviews.map((r) => (
            <div key={r.name} className="rounded-md border border-border bg-card p-5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">"{r.body}"</p>
              <div className="mt-3 text-sm font-medium">{r.name}</div>
            </div>
          ))}
        </div>
      </section>

      {moreLikeThis.length > 0 && (
        <section className="container-x py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">You may also like</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pieces that pair beautifully with this one.</p>
            </div>
            <div className="hidden gap-2 md:flex">
              <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-secondary">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background transition-colors hover:bg-secondary">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            ref={carousel}
            className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {moreLikeThis.map((p) => (
              <div key={p.slug} className="w-[60%] shrink-0 snap-start sm:w-[40%] md:w-[28%] lg:w-[22%]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="container-x pb-16 pt-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">Recently viewed</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function careFor(p: Product): string[] {
  const mats = p.materials.join(" ").toLowerCase();
  const base: string[] = [];
  if (/wool|bouclé|boucle|velvet|linen|upholstery|fabric/.test(mats)) {
    base.push("Vacuum gently with an upholstery attachment");
    base.push("Spot clean spills with a damp, lint-free cloth");
    base.push("Avoid direct sunlight to preserve color");
  }
  if (/oak|walnut|wood|timber|frame/.test(mats)) {
    base.push("Wipe with a soft, dry cloth — avoid harsh cleaners");
    base.push("Use coasters and felt pads to protect the finish");
  }
  if (/ceramic|stoneware|glaze/.test(mats)) {
    base.push("Dishwasher safe on a normal cycle");
    base.push("Avoid sudden temperature changes");
  }
  if (/brass|metal|iron/.test(mats)) {
    base.push("Dust with a soft, dry cloth");
    base.push("Avoid abrasive cleaners to protect the finish");
  }
  if (/seagrass|leather|terracotta|plant/.test(mats)) {
    base.push("Keep away from prolonged moisture");
    base.push("Dust gently with a soft brush");
  }
  if (base.length === 0) base.push("Wipe clean with a soft, dry cloth");
  return Array.from(new Set(base)).slice(0, 4);
}

const sampleReviews = [
  { name: "Amelia R.", body: "Beautifully made and even better in person. The finish feels genuinely premium." },
  { name: "Daniel K.", body: "Arrived faster than expected and packaged with real care. Worth every penny." },
  { name: "Priya S.", body: "Has totally transformed how the room feels. We get compliments constantly." },
];