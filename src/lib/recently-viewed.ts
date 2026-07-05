import { useEffect, useState } from "react";

const KEY = "hr_recently_viewed_v1";
const MAX = 8;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? (arr as string[]).filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* ignore */
  }
}

/**
 * Track a slug as recently viewed (client-only). Safe on SSR.
 */
export function useTrackRecentlyViewed(slug: string | undefined) {
  useEffect(() => {
    if (!slug) return;
    const current = read();
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX);
    write(next);
  }, [slug]);
}

/**
 * Read recently viewed slugs (client-only). Optionally exclude one slug.
 */
export function useRecentlyViewed(excludeSlug?: string): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(read());
  }, []);
  return excludeSlug ? list.filter((s) => s !== excludeSlug) : list;
}
