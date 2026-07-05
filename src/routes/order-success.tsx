import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/product-utils";

const searchSchema = z.object({
  id: z.string().optional(),
  method: z.enum(["card", "upi", "netbanking", "wallet", "cod"]).optional(),
});

const methodLabel: Record<string, string> = {
  card: "Credit / Debit Card",
  upi: "UPI",
  netbanking: "Net Banking",
  wallet: "Digital Wallet",
  cod: "Cash on Delivery",
};

export const Route = createFileRoute("/order-success")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Heron & Reed" },
      { name: "description", content: "Thank you for your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { id, method } = Route.useSearch();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id) ?? orders[0];

  return (
    <div className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl md:text-4xl">Thank you — your order is confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A confirmation email is on its way. You can track your order anytime from your account.
        </p>

        {order && (
          <div className="mt-8 rounded-md border border-border bg-card p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Order number</div>
                <div className="font-display text-xl">{order.id}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total paid</div>
                <div className="font-display text-xl">{formatPrice(order.total)}</div>
              </div>
            </div>

            <ul className="mt-5 divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.slug} className="flex items-center justify-between py-3 text-sm">
                  <span className="min-w-0 truncate pr-3">{it.name} × {it.qty}</span>
                  <span className="shrink-0 font-medium">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent" />
                <span>Payment: {method ? methodLabel[method] : "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" />
                <span>Estimated delivery: 5–7 business days</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/account"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            View order history
          </Link>
          <Link
            to="/shop"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium hover:bg-secondary"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}