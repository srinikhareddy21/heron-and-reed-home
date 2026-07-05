import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, LogOut, MapPin, Package, Pencil, ShoppingBag, User } from "lucide-react";
import { formatPrice } from "@/lib/product-utils";
import { useAllProducts } from "@/lib/queries";
import type { Product } from "@/lib/types";
import { useStore, type Address } from "@/lib/store";
import { ProductCard } from "@/components/product-card";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Heron & Reed" },
      { name: "description", content: "Your Heron & Reed account dashboard." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useStore();
  if (!user) return <SignInView />;
  return <Dashboard />;
}

function SignInView() {
  const { signIn, signUp } = useStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const result =
      mode === "signup"
        ? await signUp(form.name, form.email, form.password)
        : await signIn(form.email, form.password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success(mode === "signup" ? "Account created — welcome to Heron & Reed" : "Welcome back");
  };

  return (
    <div className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-md rounded-md border border-border bg-card p-8 md:p-10">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
            <User className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl md:text-3xl">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Track orders, save addresses and build your wishlist."
              : "Sign in to access your orders, addresses and wishlist."}
          </p>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Full name</span>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</span>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</span>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"} />
          </label>
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
          <button type="submit" disabled={submitting} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60">
            {submitting ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>
        <div className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("signin"); setError(null); }} className="font-medium text-accent hover:underline">Sign in</button>
            </>
          ) : (
            <>New to Heron & Reed?{" "}
              <button onClick={() => { setMode("signup"); setError(null); }} className="font-medium text-accent hover:underline">Create an account</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, orders, wishlist, signOut, saveAddress, updateProfile } = useStore();
  const [tab, setTab] = useState<"orders" | "wishlist" | "addresses" | "profile">("orders");
  const products = useAllProducts();
  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberSince = new Date(user.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const wishlistItems = wishlist
    .map((s) => products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<ReturnType<typeof products.find>> => Boolean(p));

  return (
    <div className="container-x py-12 md:py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-md border border-border bg-card p-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15 font-display text-xl text-accent">
              {initials || <User className="h-6 w-6" />}
            </div>
            <div className="mt-3 font-display text-lg">{user.name}</div>
            <div className="break-all text-sm text-muted-foreground">{user.email}</div>
            <div className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              Member since {memberSince}
            </div>
          </div>

          <nav className="rounded-md border border-border bg-card p-2 text-sm">
            <SideLink icon={Package} active={tab === "orders"} onClick={() => setTab("orders")}>Orders</SideLink>
            <SideLink icon={Heart} active={tab === "wishlist"} onClick={() => setTab("wishlist")}>Wishlist</SideLink>
            <SideLink icon={MapPin} active={tab === "addresses"} onClick={() => setTab("addresses")}>Addresses</SideLink>
            <SideLink icon={User} active={tab === "profile"} onClick={() => setTab("profile")}>Profile</SideLink>
            <button
              onClick={() => { signOut(); toast.success("Signed out"); }}
              className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <div className="space-y-10">
          {tab === "orders" && <OrdersSection orders={orders} products={products} />}
          {tab === "wishlist" && <WishlistSection items={wishlistItems} />}
          {tab === "addresses" && (
            <AddressSection address={user.address} onSave={(a) => { saveAddress(a); toast.success("Address saved"); }} />
          )}
          {tab === "profile" && (
            <ProfileSection
              name={user.name}
              email={user.email}
              onSave={(p) => { updateProfile(p); toast.success("Profile updated"); }}
            />
          )}

          <section>
            <h2 className="font-display text-2xl md:text-3xl">Recommended for you</h2>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {products.slice(4, 8).map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function OrdersSection({
  orders,
  products,
}: {
  orders: ReturnType<typeof useStore>["orders"];
  products: Product[];
}) {
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl md:text-3xl">Your orders</h2>
      </div>
      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          copy="Once you place your first order, you'll see it here with full tracking and details."
          cta={{ to: "/shop", label: "Start shopping" }}
        />
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-md border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{o.id}</div>
                  <div className="text-xs text-muted-foreground">
                    Placed {new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <span className="inline-block rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                  {o.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {o.items.slice(0, 5).map((it) => {
                  const p = products.find((prod) => prod.slug === it.slug);
                  return p ? (
                    <div key={it.slug} className="h-14 w-14 overflow-hidden rounded-md bg-secondary" title={it.name}>
                      <img src={p.image} alt={it.name} className="h-full w-full object-cover" />
                    </div>
                  ) : null;
                })}
                <div className="ml-auto text-right">
                  <div className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)} items</div>
                  <div className="font-display text-lg">{formatPrice(o.total)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WishlistSection({ items }: { items: Product[] }) {
  return (
    <section>
      <h2 className="font-display text-2xl md:text-3xl">Your wishlist</h2>
      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved items yet"
          copy="Tap the heart on any product to save it for later."
          cta={{ to: "/shop", label: "Find something you love" }}
        />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => p && <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </section>
  );
}

function AddressSection({ address, onSave }: { address?: Address; onSave: (a: Address) => void }) {
  const [editing, setEditing] = useState(!address);
  const [form, setForm] = useState<Address>(
    address ?? { fullName: "", line1: "", line2: "", city: "", region: "", postal: "", country: "" },
  );
  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="font-display text-2xl md:text-3xl">Saved addresses</h2>
        {address && !editing && (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>
      {!address && !editing ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          copy="Add a shipping address to speed up future checkouts."
          cta={{ label: "Add address", onClick: () => setEditing(true) }}
        />
      ) : editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
            setEditing(false);
          }}
          className="mt-6 grid grid-cols-1 gap-4 rounded-md border border-border bg-card p-6 sm:grid-cols-2"
        >
          <LabelInput label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} className="sm:col-span-2" />
          <LabelInput label="Address" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} className="sm:col-span-2" />
          <LabelInput label="Apartment, suite (optional)" value={form.line2 ?? ""} onChange={(v) => setForm({ ...form, line2: v })} className="sm:col-span-2" />
          <LabelInput label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <LabelInput label="State / Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
          <LabelInput label="Postal code" value={form.postal} onChange={(v) => setForm({ ...form, postal: v })} />
          <LabelInput label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
              Save address
            </button>
            {address && (
              <button type="button" onClick={() => setEditing(false)} className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        address && (
          <div className="mt-6 rounded-md border border-border bg-card p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground">{address.fullName}</span><br />
              {address.line1}<br />
              {address.line2 && (<>{address.line2}<br /></>)}
              {address.city}, {address.region} {address.postal}<br />
              {address.country}
            </p>
          </div>
        )
      )}
    </section>
  );
}

function ProfileSection({ name, email, onSave }: { name: string; email: string; onSave: (p: { name: string; email: string }) => void }) {
  const [form, setForm] = useState({ name, email });
  return (
    <section>
      <h2 className="font-display text-2xl md:text-3xl">Profile</h2>
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(form); }}
        className="mt-6 grid grid-cols-1 gap-4 rounded-md border border-border bg-card p-6 sm:grid-cols-2"
      >
        <LabelInput label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <LabelInput label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <div className="sm:col-span-2">
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}

function LabelInput({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function EmptyState({
  icon: Icon,
  title,
  copy,
  cta,
}: {
  icon: typeof ShoppingBag;
  title: string;
  copy: string;
  cta?: { to?: string; label: string; onClick?: () => void };
}) {
  return (
    <div className="mt-6 rounded-md border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-background">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{copy}</p>
      {cta &&
        (cta.to ? (
          <Link to={cta.to} className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
            {cta.label}
          </Link>
        ) : (
          <button onClick={cta.onClick} className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
            {cta.label}
          </button>
        ))}
    </div>
  );
}

function SideLink({
  icon: Icon,
  children,
  active,
  onClick,
}: {
  icon: typeof User;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors " +
        (active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")
      }
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}