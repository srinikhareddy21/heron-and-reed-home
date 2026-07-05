import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { useAllCategories, useAllProducts } from "@/lib/queries";
import { formatPrice, getPopularProducts, highlightSegments, searchCategories, searchProducts } from "@/lib/product-utils";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { cartCount, wishlistCount } = useStore();
  const categories = useAllCategories();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center gap-6 md:h-20">
        <button
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-tight md:text-2xl">
          <span className="text-foreground">Heron</span>
          <span className="text-accent">&</span>
          <span className="text-foreground">Reed</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-7 text-sm lg:flex">
          <Link to="/shop" className="hover:text-accent transition-colors">Shop All</Link>
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="hover:text-accent transition-colors"
              activeProps={{ className: "text-accent" }}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <IconLink to="/wishlist" label="Wishlist" count={wishlistCount}>
            <Heart className="h-[18px] w-[18px]" />
          </IconLink>
          <IconLink to="/account" label="Account">
            <User className="h-[18px] w-[18px]" />
          </IconLink>
          <IconLink to="/cart" label="Cart" count={cartCount}>
            <ShoppingBag className="h-[18px] w-[18px]" />
          </IconLink>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      >
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-80 max-w-[85%] bg-background p-6 shadow-xl transition-transform",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-xl">Heron & Reed</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            <Link to="/shop" onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-base hover:bg-secondary">
              Shop All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base hover:bg-secondary"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const categories = useAllCategories();
  const allProducts = useAllProducts();

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 20);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  const query = q.trim();
  const results = useMemo(
    () => (query ? searchProducts(allProducts, categories, query).slice(0, 8).map((r) => r.product) : []),
    [query, allProducts, categories],
  );

  const matchedCategories = useMemo(
    () => (query ? searchCategories(categories, query) : []),
    [query, categories],
  );

  const popularProducts = useMemo(() => getPopularProducts(allProducts), [allProducts]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    onClose();
    navigate({ to: "/shop", search: { q } });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="Search"
    >
      <div
        className="mx-auto mt-24 max-w-2xl rounded-lg border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, categories, keywords…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Start typing to search across our collection.
            </div>
          )}

          {query && matchedCategories.length > 0 && (
            <div className="px-2 pb-2 pt-3">
              <div className="px-2 pb-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Categories
              </div>
              <div className="flex flex-wrap gap-2 px-2 pt-1">
                {matchedCategories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/category/$slug"
                    params={{ slug: c.slug }}
                    onClick={onClose}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && results.length > 0 && (
            <div className="px-2 pb-2 pt-3">
              <div className="px-2 pb-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Products
              </div>
              <ul>
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium"><HighlightText text={p.name} query={q} /></div>
                        <div className="truncate text-xs text-muted-foreground">
                          {categories.find((c) => c.slug === p.category)?.name}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold">{formatPrice(p.price)}</div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submit as unknown as () => void}
                className="mt-2 block w-full rounded-md px-3 py-2 text-center text-xs font-medium text-accent hover:bg-secondary"
              >
                See all results for “{q}”
              </button>
            </div>
          )}

          {query && results.length === 0 && matchedCategories.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="font-display text-lg">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We couldn't find anything matching “{q}”. Try a different keyword — or explore a popular pick below.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {popularProducts.slice(0, 4).map((p) => (
                  <Link
                    key={p.slug}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={onClose}
                    className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconLink({
  to,
  label,
  count,
  children,
}: {
  to: string;
  label: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary"
    >
      {children}
      {count != null && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
          {count}
        </span>
      )}
    </Link>
  );
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const segments = highlightSegments(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} className="bg-accent/20 text-foreground rounded-sm px-0.5">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
