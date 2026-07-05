import type { Category, Product, SearchResult } from "@/lib/types";

/**
 * Category-specific trust badge for product pages.
 * Used to avoid claiming "10-year warranty" on décor, kitchenware, etc.
 */
export function trustBadgeFor(categorySlug: string): { label: string } {
  switch (categorySlug) {
    case "living-room":
    case "bedroom":
    case "dining":
      return { label: "Limited furniture warranty" };
    case "lighting":
      return { label: "Manufacturer warranty" };
    case "kitchen-dining":
      return { label: "Food-safe & handcrafted" };
    case "decor":
    default:
      return { label: "Premium quality materials" };
  }
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Relevance-scored product search. Each query token must match at least one
 * field on a product for it to be included in the results; the product's
 * score is the sum of the best per-token contribution across all tokens.
 * Priority: exact name > name-prefix > name-word > category > materials/
 * features/badge > description.
 */
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
const tokenize = (q: string) => norm(q).split(/[^a-z0-9]+/).filter(Boolean);

function scoreToken(p: Product, token: string, categories: Category[]): number {
  const name = norm(p.name);
  const nameWords = tokenize(p.name);
  const cat = categories.find((c) => c.slug === p.category);
  const catWords = tokenize(`${cat?.name ?? ""} ${p.category}`);
  const attrWords = tokenize([...(p.materials ?? []), ...(p.features ?? []), p.badge ?? ""].join(" "));
  const descWords = tokenize(p.description);

  if (name === token) return 100;
  if (nameWords.includes(token)) return 70;
  if (nameWords.some((w) => w.startsWith(token) && token.length >= 3)) return 55;
  if (catWords.includes(token)) return 30;
  if (attrWords.includes(token)) return 18;
  if (descWords.includes(token)) return 8;
  if (descWords.some((w) => w.startsWith(token) && token.length >= 4)) return 4;
  return 0;
}

export function searchProducts(
  products: Product[],
  categories: Category[],
  query: string,
): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const results: SearchResult[] = [];
  for (const product of products) {
    let total = 0;
    let matchedAll = true;
    for (const t of tokens) {
      const s = scoreToken(product, t, categories);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (matchedAll) results.push({ product, score: total });
  }
  results.sort(
    (a, b) => b.score - a.score || b.product.rating - a.product.rating || b.product.reviews - a.product.reviews,
  );
  return results;
}

export function searchCategories(categories: Category[], query: string) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  return categories.filter((c) => {
    const hay = norm(`${c.name} ${c.slug} ${c.tagline}`);
    return tokens.every((t) => hay.includes(t));
  });
}

/** Fixed set of popular fallback picks to suggest when a search returns no results. */
const POPULAR_PRODUCT_SLUGS = [
  "halden-bouclé-sofa",
  "linnea-platform-bed",
  "harper-walnut-dining-table",
  "marlow-brass-floor-lamp",
  "juno-cane-dining-chair",
  "ines-ceramic-vase",
];

export function getPopularProducts(products: Product[]): Product[] {
  return POPULAR_PRODUCT_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(
    (p): p is Product => Boolean(p),
  );
}

/** Fixed set of slugs featured in the homepage hero. */
const HERO_PRODUCT_SLUGS = [
  "halden-bouclé-sofa",
  "wren-oak-coffee-table",
  "marlow-brass-floor-lamp",
  "ines-ceramic-vase",
];

export function getHeroProducts(products: Product[]): Product[] {
  return HERO_PRODUCT_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(
    (p): p is Product => Boolean(p),
  );
}

/**
 * Split a text into segments marking which parts match any query token.
 * Useful for highlighting the matched term in search result rows.
 */
export function highlightSegments(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const tokens = tokenize(query);
  if (!tokens.length) return [{ text, match: false }];
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(re);
  return parts
    .filter((p) => p.length > 0)
    .map((p) => ({ text: p, match: tokens.includes(norm(p)) }));
}
