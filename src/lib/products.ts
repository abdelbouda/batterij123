/**
 * Shared product types and client-side fetch helper.
 *
 * Products are fetched from Stripe via the /api/products endpoint, which is
 * the source of truth. The Firestore "products" collection is no longer used
 * for displaying the catalog (Admin.tsx may still write to it).
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  capacity: string;
  price: string;
  priceEur: number;
  rating: number;
  reviews: number;
  image: string;
  features: string[];
  description: string;
  paymentLinkUrl: string | null;
  productUrl: string | null;
  stripeProductId: string;
}

let cache: { products: Product[]; expires: number } | null = null;
const TTL_MS = 60 * 1000;

export async function fetchProducts(): Promise<Product[]> {
  const now = Date.now();
  if (cache && cache.expires > now) {
    return cache.products;
  }
  const res = await fetch('/api/products');
  if (!res.ok) {
    throw new Error(`Failed to load products: ${res.status}`);
  }
  const json = (await res.json()) as { products: Product[] };
  cache = { products: json.products, expires: now + TTL_MS };
  return json.products;
}

export function clearProductsCache() {
  cache = null;
}
