import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/product-utils";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.slug);

  return (
    <div className="group relative flex flex-col">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden rounded-md bg-secondary/60"
      >
        <div className="aspect-square w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {product.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
              product.badge === "Sale"
                ? "bg-accent text-accent-foreground"
                : product.badge === "New"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/90 text-foreground",
            )}
          >
            {product.badge}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.slug);
          }}
          aria-label="Wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(product.slug);
            toast.success(`${product.name} added to cart`);
          }}
          className="absolute inset-x-3 bottom-3 inline-flex translate-y-2 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Add to cart
        </button>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="block truncate text-sm font-medium hover:text-accent"
          >
            {product.name}
          </Link>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span>{product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.reviews} reviews</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-semibold">{formatPrice(product.price)}</div>
          {product.compareAt && (
            <div className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAt)}</div>
          )}
        </div>
      </div>
    </div>
  );
}