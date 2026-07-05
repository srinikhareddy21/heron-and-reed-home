import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, getToken, setToken } from "@/lib/api";

type CartItem = { slug: string; qty: number };

export type Address = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  memberSince: string; // ISO date
  address?: Address;
};

export type OrderItem = { slug: string; qty: number; price: number; name: string };
export type Order = {
  id: string;
  date: string; // ISO
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  address?: Address;
};

export type AuthResult = { ok: true } | { ok: false; error: string };

type StoreState = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (slug: string, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  cartCount: number;
  wishlistCount: number;
  user: UserProfile | null;
  authReady: boolean;
  orders: Order[];
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<UserProfile, "name" | "email">>) => void;
  saveAddress: (address: Address) => void;
  placeOrder: (input: {
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    address?: Address;
  }) => Promise<Order>;
};

const StoreContext = createContext<StoreState | null>(null);

function toApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message;
  return fallback;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Guards against a slower "load my data" response overwriting fresher local state
  // (e.g. user adds to cart immediately after sign-in, before the fetch resolves).
  const loadTokenRef = useRef(0);

  async function loadUserData() {
    const myLoad = ++loadTokenRef.current;
    try {
      const [cartRes, wishlistRes, ordersRes] = await Promise.all([
        api.get<{ items: CartItem[] }>("/api/cart"),
        api.get<{ items: string[] }>("/api/wishlist"),
        api.get<{ orders: Order[] }>("/api/orders"),
      ]);
      if (loadTokenRef.current !== myLoad) return; // a newer load (or sign-out) happened
      setCart(cartRes.items);
      setWishlist(wishlistRes.items);
      setOrders(ordersRes.orders);
    } catch {
      // If the token is stale/invalid, fall back to a signed-out state.
      if (loadTokenRef.current !== myLoad) return;
      setToken(null);
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const { user: me } = await api.get<{ user: UserProfile }>("/api/auth/me");
        setUser(me);
        await loadUserData();
      } catch {
        setToken(null);
      } finally {
        setAuthReady(true);
      }
    })();
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      cart,
      wishlist,
      addToCart: (slug, qty = 1) => {
        setCart((c) => {
          const found = c.find((i) => i.slug === slug);
          return found
            ? c.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
            : [...c, { slug, qty }];
        });
        if (user) api.post("/api/cart/items", { slug, qty }).catch(() => {});
      },
      removeFromCart: (slug) => {
        setCart((c) => c.filter((i) => i.slug !== slug));
        if (user) api.delete(`/api/cart/items/${encodeURIComponent(slug)}`).catch(() => {});
      },
      setQty: (slug, qty) => {
        setCart((c) =>
          qty <= 0
            ? c.filter((i) => i.slug !== slug)
            : c.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        );
        if (user) api.patch(`/api/cart/items/${encodeURIComponent(slug)}`, { qty }).catch(() => {});
      },
      clearCart: () => {
        setCart([]);
        if (user) api.delete("/api/cart").catch(() => {});
      },
      toggleWishlist: (slug) => {
        setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
        if (user) api.post("/api/wishlist/toggle", { slug }).catch(() => {});
      },
      isWishlisted: (slug) => wishlist.includes(slug),
      cartCount: cart.reduce((sum, i) => sum + i.qty, 0),
      wishlistCount: wishlist.length,
      user,
      authReady,
      orders,
      signIn: async (email, password) => {
        try {
          const { token, user: me } = await api.post<{ token: string; user: UserProfile }>(
            "/api/auth/login",
            {
              email,
              password,
            },
          );
          setToken(token);
          setUser(me);
          await loadUserData();
          return { ok: true };
        } catch (err) {
          return { ok: false, error: toApiError(err, "Unable to sign in. Please try again.") };
        }
      },
      signUp: async (name, email, password) => {
        try {
          const { token, user: me } = await api.post<{ token: string; user: UserProfile }>(
            "/api/auth/signup",
            {
              name,
              email,
              password,
            },
          );
          setToken(token);
          setUser(me);
          setCart([]);
          setWishlist([]);
          setOrders([]);
          return { ok: true };
        } catch (err) {
          return {
            ok: false,
            error: toApiError(err, "Unable to create your account. Please try again."),
          };
        }
      },
      signOut: () => {
        loadTokenRef.current++; // invalidate any in-flight load
        setToken(null);
        setUser(null);
        setCart([]);
        setWishlist([]);
        setOrders([]);
      },
      updateProfile: (patch) => {
        if (!user) return;
        setUser((u) => (u ? { ...u, ...patch } : u));
        api.put("/api/auth/profile", patch).catch(() => {});
      },
      saveAddress: (address) => {
        if (!user) return;
        setUser((u) => (u ? { ...u, address } : u));
        api.put("/api/auth/address", address).catch(() => {});
      },
      placeOrder: async ({ items, subtotal, shipping, total, address }) => {
        const { order } = await api.post<{ order: Order }>("/api/orders", {
          items,
          subtotal,
          shipping,
          total,
          address,
        });
        setOrders((o) => [order, ...o]);
        setCart([]);
        return order;
      },
    }),
    [cart, wishlist, user, authReady, orders],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
