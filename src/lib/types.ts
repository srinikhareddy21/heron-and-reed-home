/**
 * Shared domain types for products and categories.
 *
 * These mirror the shape returned by the backend's `toClient()` serializers
 * (see backend/src/models/Product.js and backend/src/models/Category.js),
 * so the frontend and API stay in sync.
 */

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: "New" | "Sale" | "Bestseller";
  description: string;
  materials: string[];
  dimensions: string;
  features: string[];
  isNew?: boolean;
  isBestseller?: boolean;
};

export type SearchResult = { product: Product; score: number };
