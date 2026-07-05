import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { infoPages, infoPageOrder } from "@/lib/info-pages";

export const Route = createFileRoute("/info/$slug")({
  loader: ({ params }) => {
    const page = infoPages[params.slug];
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Not found — Heron & Reed" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { page } = loaderData;
    const title = `${page.title} — Heron & Reed`;
    const description = page.intro;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: InfoPage,
  notFoundComponent: InfoNotFound,
});

function InfoPage() {
  const { page } = Route.useLoaderData();
  const related = infoPageOrder
    .filter((s) => s !== page.slug)
    .slice(0, 4)
    .map((s) => infoPages[s]);

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="container-x pb-14 pt-10 md:pb-20 md:pt-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div className="mt-6 max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {page.eyebrow}
            </span>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {page.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="space-y-8">
            {page.sections.map((s: { heading: string; body: string }) => (
              <article
                key={s.heading}
                className="rounded-md border border-border bg-card p-6 md:p-8"
              >
                <h2 className="font-display text-xl md:text-2xl">{s.heading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {s.body}
                </p>
              </article>
            ))}
            {page.footer && (
              <p className="text-xs text-muted-foreground">{page.footer}</p>
            )}
          </div>

          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            <div className="rounded-md border border-border bg-card p-6">
              <h3 className="font-display text-lg">Explore more</h3>
              <ul className="mt-4 divide-y divide-border">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/info/$slug"
                      params={{ slug: r.slug }}
                      className="group flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <span>
                        <span className="block font-medium">{r.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.eyebrow}
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md bg-primary p-6 text-primary-foreground">
              <h3 className="font-display text-lg">Still have a question?</h3>
              <p className="mt-2 text-sm opacity-85">
                Our client team is happy to help — from styling advice to order details.
              </p>
              <Link
                to="/info/$slug"
                params={{ slug: "contact" }}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Contact us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function InfoNotFound() {
  return (
    <div className="container-x py-20 text-center">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-accent"
      >
        Go home
      </Link>
    </div>
  );
}
