import { Link } from "@tanstack/react-router";
import { CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAllCategories } from "@/lib/queries";

export function SiteFooter() {
  const categories = useAllCategories();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
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
    setDone(true);
    toast.success("Thank you for subscribing to Heron & Reed.");
  };

  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container-x grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="font-display text-2xl">
            Heron <span className="text-accent">&</span> Reed
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Thoughtfully made furniture and home décor for the way you actually live.
            Built to last, designed to feel like home from day one.
          </p>
          {done ? (
            <div className="mt-6 flex max-w-sm items-start gap-2 rounded-md border border-border bg-background p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <div className="font-medium">Thank you for subscribing.</div>
                <button type="button" onClick={() => setDone(false)} className="mt-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-accent">
                  Subscribe another email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} noValidate className="mt-6 max-w-sm">
              <div className="flex overflow-hidden rounded-md border border-border bg-background">
                <div className="grid w-10 place-items-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                  placeholder="Your email"
                  aria-label="Your email"
                  aria-invalid={error ? true : undefined}
                  className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
                >
                  Subscribe
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </form>
          )}
        </div>

        <FooterCol title="Shop">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-accent">
                {c.name}
              </Link>
            </li>
          ))}
        </FooterCol>

        <FooterCol title="Support">
          <li><Link to="/info/$slug" params={{ slug: "contact" }} className="hover:text-accent">Contact us</Link></li>
          <li><Link to="/info/$slug" params={{ slug: "shipping-returns" }} className="hover:text-accent">Shipping & returns</Link></li>
          <li><Link to="/info/$slug" params={{ slug: "order-tracking" }} className="hover:text-accent">Order tracking</Link></li>
          <li><Link to="/info/$slug" params={{ slug: "faq" }} className="hover:text-accent">FAQ</Link></li>
        </FooterCol>

        <FooterCol title="Company">
          <li><Link to="/info/$slug" params={{ slug: "our-story" }} className="hover:text-accent">Our story</Link></li>
          <li><Link to="/info/$slug" params={{ slug: "sustainability" }} className="hover:text-accent">Sustainability</Link></li>
          <li><Link to="/info/$slug" params={{ slug: "trade-program" }} className="hover:text-accent">Trade program</Link></li>
          <li><Link to="/info/$slug" params={{ slug: "press" }} className="hover:text-accent">Press</Link></li>
        </FooterCol>
      </div>

      <div className="border-t border-border/80">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Heron & Reed. All rights reserved.</p>
          <p className="opacity-80">Crafted with care · Made to last</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 font-display text-base">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">{children}</ul>
    </div>
  );
}
