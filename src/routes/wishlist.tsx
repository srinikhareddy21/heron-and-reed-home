import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useAllProducts } from "@/lib/queries";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Heron & Reed" },
      { name: "description", content: "Pieces you've saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const products = useAllProducts();
  const items = wishlist
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<ReturnType<typeof products.find>> => !!p);

  return (
    <div className="container-x py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl">Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length === 0 ? "Nothing saved yet." : `${items.length} item${items.length > 1 ? "s" : ""} saved`}
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-background">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="mt-5 inline-block rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-accent">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}