import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export type ProductsParams = {
  category?: string;
  badge?: string;
  search?: string;
  isNew?: boolean;
  isBestseller?: boolean;
};

function buildProductsQueryString(params?: ProductsParams): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.badge) sp.set("badge", params.badge);
  if (params.search) sp.set("search", params.search);
  if (params.isNew !== undefined) sp.set("isNew", String(params.isNew));
  if (params.isBestseller !== undefined) sp.set("isBestseller", String(params.isBestseller));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** All products, optionally filtered server-side. */
export const productsQueryOptions = (params?: ProductsParams) =>
  queryOptions({
    queryKey: ["products", params ?? {}],
    queryFn: () =>
      api
        .get<{ products: Product[] }>(`/api/products${buildProductsQueryString(params)}`)
        .then((r) => r.products),
    staleTime: 60_000,
  });

/** A single product by slug. */
export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () =>
      api.get<{ product: Product }>(`/api/products/${encodeURIComponent(slug)}`).then((r) => r.product),
    staleTime: 60_000,
  });

/** All categories. */
export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: () => api.get<{ categories: Category[] }>("/api/categories").then((r) => r.categories),
    staleTime: 5 * 60_000,
  });

/** A single category by slug. */
export const categoryQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: () =>
      api.get<{ category: Category }>(`/api/categories/${encodeURIComponent(slug)}`).then((r) => r.category),
    staleTime: 5 * 60_000,
  });

/**
 * Convenience hook for components that need the full product catalog
 * (e.g. for client-side search, "recommended" rails, recently-viewed lookups).
 * The root route loader pre-fetches this, so in practice it resolves
 * synchronously from cache.
 */
export function useAllProducts(): Product[] {
  const { data } = useQuery(productsQueryOptions());
  return data ?? [];
}

/** Convenience hook for components that need the full category list. */
export function useAllCategories(): Category[] {
  const { data } = useQuery(categoriesQueryOptions());
  return data ?? [];
}
