import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Lock, Minus, Package, Plus, RotateCcw, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { formatPrice } from "@/lib/product-utils";
import { useAllProducts } from "@/lib/queries";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Heron & Reed" },
      { name: "description", content: "Review your cart and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, removeFromCart } = useStore();
  const navigate = useNavigate();
  const products = useAllProducts();

  const lines = cart
    .map((i) => {
      const product = products.find((p) => p.slug === i.slug);
      return product ? { product, qty: i.qty } : null;
    })
    .filter((x): x is { product: NonNullable<ReturnType<typeof products.find>>; qty: number } => x !== null);

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const savings = lines.reduce(
    (s, l) => s + ((l.product.compareAt ? l.product.compareAt - l.product.price : 0) * l.qty),
    0,
  );
  const shipping = subtotal === 0 ? 0 : subtotal >= 99 ? 0 : 19;
  const total = subtotal + shipping;

  const cartSlugs = new Set(lines.map((l) => l.product.slug));
  const recommended = products.filter((p) => !cartSlugs.has(p.slug)).slice(0, 4);

  const deliveryRange = (() => {
    const start = new Date();
    start.setDate(start.getDate() + 4);
    const end = new Date();
    end.setDate(end.getDate() + 8);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  return (
    <div className="container-x py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Your cart</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lines.length === 0 ? "Your cart is empty." : `${lines.length} item${lines.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
      </div>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-background">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="divide-y divide-border rounded-md border border-border bg-card">
            {lines.map(({ product, qty }) => (
              <div key={product.slug} className="flex gap-4 p-4 md:gap-6 md:p-5">
                <Link to="/product/$slug" params={{ slug: product.slug }} className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary md:h-28 md:w-28">
                  <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                </Link>
                <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <div className="min-w-0">
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="block truncate text-sm font-medium hover:text-accent md:text-base">
                      {product.name}
                    </Link>
                    <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {product.category.replace("-", " ")}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-md border border-border">
                        <button className="grid h-8 w-8 place-items-center hover:bg-secondary" onClick={() => setQty(product.slug, qty - 1)} aria-label="Decrease">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{qty}</span>
                        <button className="grid h-8 w-8 place-items-center hover:bg-secondary" onClick={() => setQty(product.slug, qty + 1)} aria-label="Increase">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(product.slug)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold">{formatPrice(product.price * qty)}</div>
                    {product.compareAt && (
                      <div className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.compareAt * qty)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {savings > 0 && (
                <Row label="You save" value={`− ${formatPrice(savings)}`} accent />
              )}
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
              <div className="border-t border-border pt-3">
                <Row label="Total" value={formatPrice(total)} bold />
              </div>
            </dl>
            <div className="mt-5 flex items-start gap-2 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <div className="font-medium text-foreground">Estimated delivery</div>
                <div>{deliveryRange}</div>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
            >
              <Lock className="h-4 w-4" /> Secure checkout
            </button>
            <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Free shipping on orders over $99</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Secure encrypted checkout</div>
              <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-accent" /> 30-day easy returns</div>
              <div className="flex items-center gap-2"><Package className="h-4 w-4 text-accent" /> Carefully packed by hand</div>
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-accent" /> Visa · Mastercard · Amex · Apple Pay</div>
            </div>
          </aside>
        </div>
      )}

      <section className="mt-20">
        <h2 className="font-display text-2xl md:text-3xl">Recommended for you</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hand-picked pieces that pair beautifully.</p>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {recommended.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-medium" : accent ? "text-accent" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "font-display text-lg" : accent ? "font-medium text-accent" : ""}>{value}</dd>
    </div>
  );
}