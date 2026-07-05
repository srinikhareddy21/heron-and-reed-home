import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAllCategories, useAllProducts } from "@/lib/queries";
import { getHeroProducts } from "@/lib/product-utils";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import heroLiving from "@/assets/hero-living-wide.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Heron & Reed — Premium Furniture & Home Décor" },
      { name: "description", content: "Thoughtfully curated furniture and home décor for every room. Sofas, tables, lighting, dinnerware and more." },
      { property: "og:title", content: "Heron & Reed — Premium Furniture & Home Décor" },
      { property: "og:description", content: "Thoughtfully curated furniture and home décor for every room." },
    ],
  }),
  component: Index,
});

function Index() {
  const products = useAllProducts();
  const categories = useAllCategories();
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew);
  const bestsellers = products.filter((p) => p.isBestseller);
  const heroProducts = getHeroProducts(products);

  return (
    <div className="flex flex-col">
      <Hero heroProducts={heroProducts} />
      <ShopByCategory categories={categories} />
      <ProductRow title="Featured" subtitle="Pieces our design team can't stop talking about." items={featuredProducts} />
      <FeaturedCollection categories={categories} />
      <ProductRow title="New Arrivals" subtitle="Just landed — fresh from our makers." items={newArrivals} />
      <ProductRow title="Best Sellers" subtitle="Loved by thousands of homes." items={bestsellers} />
      <WhyShop />
      <Newsletter />
    </div>
  );
}

function Hero({ heroProducts }: { heroProducts: Product[] }) {
  const featured = heroProducts[0];
  return (
    <section className="relative isolate overflow-hidden bg-secondary/40">
      {/* Full-bleed backdrop image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroLiving}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="h-full w-full object-cover object-center"
        />
        {/* Warm cream veil so text stays legible on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20 md:from-background/95 md:via-background/70 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
      </div>

      <div className="container-x relative pb-16 pt-6 md:pb-24 md:pt-10 lg:pb-28 lg:pt-14">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" /> Autumn Collection · 2026
            </span>
            <h1 className="mt-5 font-display text-[42px] leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-[80px]">
              Simple things<br />
              for a <span className="italic text-accent">happy home.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Sculptural furniture, quiet textures and considered décor —
              curated by our design studio and made to be lived in for years.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-accent"
              >
                Shop the Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-md border border-foreground/15 bg-background/80 px-6 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
              >
                Explore Categories
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-6">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Studios</dt>
                <dd className="mt-1 font-display text-xl">40+</dd>
                <dd className="text-xs text-muted-foreground">independent makers</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Happy homes</dt>
                <dd className="mt-1 font-display text-xl">120k</dd>
                <dd className="text-xs text-muted-foreground">across the world</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Guarantee</dt>
                <dd className="mt-1 font-display text-xl">30-day</dd>
                <dd className="text-xs text-muted-foreground">easy returns</dd>
              </div>
            </dl>
          </div>

          <div className="relative lg:col-span-5 xl:col-span-6">
            {/* Floating featured product card, layered onto the image */}
            {featured && (
              <Link
                to="/product/$slug"
                params={{ slug: featured.slug }}
                className="group ml-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-border/70 bg-background/95 p-3.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-24px_rgba(0,0,0,0.45)]"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <img
                    src={featured.image}
                    alt={featured.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Featured this week
                  </div>
                  <div className="truncate text-sm font-medium">{featured.name}</div>
                  <div className="text-xs font-semibold text-accent">${featured.price}</div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            <div className="mt-4 ml-auto hidden max-w-sm rounded-lg border border-border/60 bg-background/80 p-4 text-xs text-muted-foreground shadow-sm backdrop-blur md:block">
              <div className="flex items-center gap-2 text-foreground">
                <Leaf className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-medium uppercase tracking-[0.16em]">Design notes</span>
              </div>
              <p className="mt-2 leading-relaxed">
                Warm oak, hand-thrown ceramics and soft bouclé — the pieces
                shaping this season's living room.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShopByCategory({ categories }: { categories: Category[] }) {
  return (
    <section className="container-x py-16 md:py-20">
      <SectionHeader title="Shop by Category" subtitle="Everything for every room." />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group relative block aspect-[3/4] overflow-hidden rounded-md bg-secondary"
          >
            <img
              src={c.image}
              alt={c.name}
              loading="lazy"
              width={800}
              height={1000}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 text-background">
              <div className="font-display text-base leading-tight md:text-lg">{c.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] opacity-90">
                Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductRow({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Product[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="container-x py-12 md:py-16">
      <div className="flex items-end justify-between gap-6">
        <SectionHeader title={title} subtitle={subtitle} />
        <Link to="/shop" className="hidden text-sm text-muted-foreground hover:text-accent md:inline-flex md:items-center md:gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

function FeaturedCollection({ categories }: { categories: Category[] }) {
  const livingRoom = categories.find((c) => c.slug === "living-room");
  const kitchenDining = categories.find((c) => c.slug === "kitchen-dining");
  return (
    <section className="container-x py-12 md:py-16">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {livingRoom && (
          <CollectionCard
            eyebrow="Autumn Collection"
            title="Slow living, made tangible."
            copy="Warm woods, soft bouclé and quietly considered shapes for the cooler months."
            image={livingRoom.image}
            to="/category/$slug"
            slug="living-room"
          />
        )}
        {kitchenDining && (
          <CollectionCard
            eyebrow="Set The Table"
            title="Everyday tableware, elevated."
            copy="Hand-thrown stoneware and warm-toned linens for slower meals at home."
            image={kitchenDining.image}
            to="/category/$slug"
            slug="kitchen-dining"
          />
        )}
      </div>
    </section>
  );
}

function CollectionCard({
  eyebrow,
  title,
  copy,
  image,
  slug,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  to: string;
  slug: string;
}) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className="group relative block aspect-[16/10] overflow-hidden rounded-md"
    >
      <img src={image} alt={title} loading="lazy" width={1200} height={750} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/30 to-foreground/0" />
      <div className="absolute inset-x-6 bottom-6 max-w-md text-background sm:inset-x-8 sm:bottom-8">
        <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">{eyebrow}</div>
        <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{title}</h3>
        <p className="mt-2 text-sm opacity-90">{copy}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 border-b border-background/70 pb-0.5 text-sm">
          Shop the collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function WhyShop() {
  const items = [
    { icon: Truck, title: "Free shipping", copy: "On orders over $99. Right to your door." },
    { icon: ShieldCheck, title: "Premium quality", copy: "Materials chosen to last, backed by category-specific warranties." },
    { icon: Leaf, title: "Sustainably sourced", copy: "FSC timber, natural fibers, less waste." },
    { icon: Sparkles, title: "30-day returns", copy: "Easy, free returns within 30 days." },
  ];
  return (
    <section className="container-x py-16 md:py-20">
      <SectionHeader title="Why Shop With Us" subtitle="Small details. Big difference." />
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="rounded-md border border-border bg-card p-6">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 font-display text-lg">{title}</div>
            <p className="mt-1.5 text-sm text-muted-foreground">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState<string[]>([]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (subscribed.includes(value)) {
      setError("This email is already subscribed.");
      toast.error("You're already on the list.");
      return;
    }
    setSubscribed((s) => [...s, value]);
    setEmail("");
    setError("");
    setStatus("success");
    toast.success("Thank you for subscribing to Heron & Reed.");
  };

  return (
    <section className="container-x pb-10">
      <div className="rounded-md bg-primary px-6 py-12 text-primary-foreground md:px-14 md:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="font-display text-3xl leading-tight md:text-4xl">
              First dibs on new arrivals.
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed opacity-80">
              Join the Heron & Reed list for new collections, design notes and 10% off your first order.
            </p>
          </div>
          <div>
            {status === "success" ? (
              <div className="flex items-start gap-3 rounded-md bg-background/10 p-4 text-sm ring-1 ring-background/20">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <div className="font-medium">Thank you for subscribing to Heron & Reed.</div>
                  <p className="mt-1 opacity-80">Keep an eye on your inbox — your 10% welcome code is on its way.</p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-3 text-xs underline underline-offset-4 opacity-80 hover:opacity-100"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="w-full">
                <div className="flex w-full overflow-hidden rounded-md bg-background">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                    placeholder="Email address"
                    aria-label="Email address"
                    aria-invalid={error ? true : undefined}
                    className="h-12 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button type="submit" className="bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90">
                    Subscribe
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-primary-foreground/90">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-3xl tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">{subtitle}</p>
    </div>
  );
}
