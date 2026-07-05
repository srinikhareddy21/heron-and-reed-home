import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@/lib/product-utils";
import { useAllProducts } from "@/lib/queries";
import { useStore, type Address } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Heron & Reed" },
      { name: "description", content: "Review your order and complete checkout." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, user, placeOrder, saveAddress } = useStore();
  const products = useAllProducts();

  const lines = cart
    .map((i) => {
      const product = products.find((p) => p.slug === i.slug);
      return product ? { product, qty: i.qty } : null;
    })
    .filter((x): x is { product: NonNullable<ReturnType<typeof products.find>>; qty: number } => x !== null);

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 99 ? 0 : 19;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  const initial: Address = user?.address ?? {
    fullName: user?.name ?? "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal: "",
    country: "",
  };
  const [address, setAddress] = useState<Address>(initial);
  const [email, setEmail] = useState(user?.email ?? "");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [saveAddr, setSaveAddr] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  type PayMethod = "card" | "upi" | "netbanking" | "wallet" | "cod";
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [upi, setUpi] = useState({ id: "", showQr: false });
  const [bank, setBank] = useState("");
  const [walletChoice, setWalletChoice] = useState("");

  if (lines.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add a few pieces before heading to checkout.</p>
        <Link to="/shop" className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
          Browse the shop
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl">Sign in to complete checkout</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          For order tracking and history, please sign in or create an account before placing your order.
        </p>
        <Link to="/account" className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
          Sign in to continue
        </Link>
      </div>
    );
  }

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address";
    if (address.fullName.trim().length < 2) e.fullName = "Enter your full name";
    if (address.line1.trim().length < 3) e.line1 = "Enter your street address";
    if (address.city.trim().length < 2) e.city = "Enter your city";
    if (address.region.trim().length < 2) e.region = "Enter your state or region";
    if (address.postal.trim().length < 3) e.postal = "Enter a valid postal code";
    if (address.country.trim().length < 2) e.country = "Enter your country";

    if (payMethod === "card") {
      const num = card.number.replace(/\s+/g, "");
      if (!/^\d{12,19}$/.test(num)) e.cardNumber = "Enter a valid card number (12–19 digits)";
      if (card.name.trim().length < 2) e.cardName = "Enter the cardholder name";
      const expMatch = card.exp.trim().match(/^(0[1-9]|1[0-2])\s*\/?\s*(\d{2})$/);
      if (!expMatch) {
        e.cardExp = "Use MM/YY format";
      } else {
        const mm = parseInt(expMatch[1], 10);
        const yy = parseInt(expMatch[2], 10);
        const now = new Date();
        const curYY = now.getFullYear() % 100;
        const curMM = now.getMonth() + 1;
        if (yy < curYY || (yy === curYY && mm < curMM)) e.cardExp = "Card has expired";
      }
      if (!/^\d{3,4}$/.test(card.cvc.trim())) e.cardCvc = "3 or 4 digit CVC";
    } else if (payMethod === "upi") {
      if (!/^[\w.\-]{2,}@[\w\-]{2,}$/.test(upi.id.trim())) e.upi = "Enter a valid UPI ID (e.g. name@bank)";
    } else if (payMethod === "netbanking") {
      if (!bank) e.bank = "Select your bank";
    } else if (payMethod === "wallet") {
      if (!walletChoice) e.wallet = "Choose a wallet";
    }
    return e;
  };

  const handlePlace = async () => {
    if (placing) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please complete the highlighted fields to continue");
      // scroll to the first error
      if (typeof document !== "undefined") {
        const first = document.querySelector<HTMLElement>("[data-checkout-error='true']");
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setPlacing(true);
    try {
      if (user && saveAddr) saveAddress(address);
      const order = await placeOrder({
        items: lines.map((l) => ({ slug: l.product.slug, name: l.product.name, qty: l.qty, price: l.product.price })),
        subtotal,
        shipping,
        total,
        address,
      });
      toast.success(`Order ${order.id} placed successfully`);
      navigate({ to: "/order-success", search: { id: order.id, method: payMethod } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to place your order. Please try again.");
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-10 md:py-12">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>
      <h1 className="mt-3 font-display text-3xl md:text-4xl">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-8">
          <Card title="Contact">
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: "" }); }}
                placeholder="you@example.com"
                className={inputCls(errors.email)}
              />
            </Field>
          </Card>

          <Card title="Shipping address">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName} className="sm:col-span-2">
                <input value={address.fullName} onChange={(e) => { setAddress({ ...address, fullName: e.target.value }); if (errors.fullName) setErrors({ ...errors, fullName: "" }); }} className={inputCls(errors.fullName)} />
              </Field>
              <Field label="Address" error={errors.line1} className="sm:col-span-2">
                <input value={address.line1} onChange={(e) => { setAddress({ ...address, line1: e.target.value }); if (errors.line1) setErrors({ ...errors, line1: "" }); }} className={inputCls(errors.line1)} placeholder="Street address" />
              </Field>
              <Field label="Apartment, suite (optional)" className="sm:col-span-2">
                <input value={address.line2 ?? ""} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="input" />
              </Field>
              <Field label="City" error={errors.city}>
                <input value={address.city} onChange={(e) => { setAddress({ ...address, city: e.target.value }); if (errors.city) setErrors({ ...errors, city: "" }); }} className={inputCls(errors.city)} />
              </Field>
              <Field label="State / Region" error={errors.region}>
                <input value={address.region} onChange={(e) => { setAddress({ ...address, region: e.target.value }); if (errors.region) setErrors({ ...errors, region: "" }); }} className={inputCls(errors.region)} />
              </Field>
              <Field label="Postal code" error={errors.postal}>
                <input value={address.postal} onChange={(e) => { setAddress({ ...address, postal: e.target.value }); if (errors.postal) setErrors({ ...errors, postal: "" }); }} className={inputCls(errors.postal)} />
              </Field>
              <Field label="Country" error={errors.country}>
                <input value={address.country} onChange={(e) => { setAddress({ ...address, country: e.target.value }); if (errors.country) setErrors({ ...errors, country: "" }); }} className={inputCls(errors.country)} />
              </Field>
            </div>
            {user && (
              <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} />
                Save this address to my account
              </label>
            )}
          </Card>

          <Card title="Payment">
            <PaymentMethodSelector value={payMethod} onChange={(m) => { setPayMethod(m); setErrors({}); }} />
            {payMethod === "card" && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Card number" error={errors.cardNumber} className="sm:col-span-2">
                <div className="relative">
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    maxLength={23}
                    value={card.number}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 19);
                      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                      setCard({ ...card, number: formatted });
                      if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
                    }}
                    className={inputCls(errors.cardNumber) + " pl-10"}
                    placeholder="1234 5678 9012 3456"
                  />
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>
              <Field label="Name on card" error={errors.cardName} className="sm:col-span-2">
                <input autoComplete="cc-name" value={card.name} onChange={(e) => { setCard({ ...card, name: e.target.value }); if (errors.cardName) setErrors({ ...errors, cardName: "" }); }} className={inputCls(errors.cardName)} />
              </Field>
              <Field label="Expiry (MM/YY)" error={errors.cardExp}>
                <input
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  value={card.exp}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    setCard({ ...card, exp: v });
                    if (errors.cardExp) setErrors({ ...errors, cardExp: "" });
                  }}
                  className={inputCls(errors.cardExp)}
                  placeholder="MM/YY"
                />
              </Field>
              <Field label="CVC" error={errors.cardCvc}>
                <input
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  value={card.cvc}
                  onChange={(e) => { setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }); if (errors.cardCvc) setErrors({ ...errors, cardCvc: "" }); }}
                  className={inputCls(errors.cardCvc)}
                  placeholder="123"
                />
              </Field>
            </div>
            )}
            {payMethod === "upi" && (
              <div className="mt-6 grid grid-cols-1 gap-4">
                <Field label="UPI ID">
                  <input
                    value={upi.id}
                    onChange={(e) => setUpi({ ...upi, id: e.target.value })}
                    className="input"
                    placeholder="yourname@okhdfcbank"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => setUpi({ ...upi, showQr: !upi.showQr })}
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
                >
                  <QrCode className="h-4 w-4" /> {upi.showQr ? "Hide QR code" : "Pay via QR code"}
                </button>
                {upi.showQr && (
                  <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-secondary/40 p-6">
                    <div
                      aria-label="Simulated UPI QR code"
                      className="h-40 w-40 rounded-md"
                      style={{
                        backgroundImage: "repeating-conic-gradient(#111 0% 25%, #fff 0% 50%)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Scan with any UPI app to pay {formatPrice(total)}</p>
                  </div>
                )}
              </div>
            )}
            {payMethod === "netbanking" && (
              <div className="mt-6">
                <Field label="Select your bank">
                  <select value={bank} onChange={(e) => setBank(e.target.value)} className="input">
                    <option value="">Choose a bank…</option>
                    {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra", "Yes Bank", "Punjab National Bank"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>
                <p className="mt-3 text-xs text-muted-foreground">You'll be redirected to your bank's secure page to complete payment.</p>
              </div>
            )}
            {payMethod === "wallet" && (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {["Paytm", "Amazon Pay", "Mobikwik"].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWalletChoice(w)}
                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-medium transition-colors ${
                      walletChoice === w ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <Wallet className="h-4 w-4" /> {w}
                  </button>
                ))}
              </div>
            )}
            {payMethod === "cod" && (
              <div className="mt-6 rounded-md border border-border bg-secondary/40 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Banknote className="h-4 w-4 text-accent" /> Cash on Delivery
                </div>
                <p className="mt-1.5 text-muted-foreground">
                  Pay {formatPrice(total)} in cash when your order arrives. Please keep exact change ready.
                </p>
              </div>
            )}
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Payments are encrypted and processed securely.
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Demo project — payments are simulated. No real charge is made and no card details are stored.
            </p>
          </Card>
        </div>

        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="font-display text-xl">Order review</h2>
            <ul className="mt-5 divide-y divide-border">
              {lines.map(({ product, qty }) => (
                <li key={product.slug} className="flex gap-3 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">Qty {qty}</div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold">{formatPrice(product.price * qty)}</div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <SumRow label="Subtotal" value={formatPrice(subtotal)} />
              <SumRow label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
              <SumRow label="Estimated tax" value={formatPrice(tax)} />
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-lg">{formatPrice(total)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={handlePlace}
              disabled={placing}
              aria-busy={placing}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing order…" : (<><CheckCircle2 className="h-4 w-4" /> Place order · {formatPrice(total)}</>)}
            </button>
            {Object.keys(errors).length > 0 && (
              <p className="mt-3 text-center text-xs text-destructive">
                Please fix the highlighted fields above to place your order.
              </p>
            )}
            <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-accent" /> Free shipping on orders over $99</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> 30-day easy returns</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-accent" /> SSL encrypted checkout</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children, className = "", error }: { label: string; children: React.ReactNode; className?: string; error?: string }) {
  return (
    <label className={`block ${className}`} data-checkout-error={error ? "true" : undefined}>
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function inputCls(error?: string) {
  return error ? "input border-destructive focus-visible:ring-destructive" : "input";
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

type PayMethod = "card" | "upi" | "netbanking" | "wallet" | "cod";

function PaymentMethodSelector({ value, onChange }: { value: PayMethod; onChange: (m: PayMethod) => void }) {
  const options: { id: PayMethod; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: "card", label: "Credit / Debit Card", icon: <CreditCard className="h-4 w-4" />, hint: "Visa, Mastercard, RuPay, Amex" },
    { id: "upi", label: "UPI", icon: <Smartphone className="h-4 w-4" />, hint: "GPay, PhonePe, Paytm, BHIM" },
    { id: "netbanking", label: "Net Banking", icon: <Landmark className="h-4 w-4" />, hint: "All major Indian banks" },
    { id: "wallet", label: "Wallets", icon: <Wallet className="h-4 w-4" />, hint: "Paytm, Amazon Pay, Mobikwik" },
    { id: "cod", label: "Cash on Delivery", icon: <Banknote className="h-4 w-4" />, hint: "Pay when your order arrives" },
  ];
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`flex items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
              active ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"
            }`}
          >
            <span className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-md ${active ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`}>
              {o.icon}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">{o.label}</span>
              <span className="block text-xs text-muted-foreground">{o.hint}</span>
            </span>
            <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${active ? "border-accent bg-accent" : "border-border"}`} />
          </button>
        );
      })}
    </div>
  );
}