/**
 * GET /api/products
 *
 * Returns the catalog as the single source of truth from Stripe.
 *
 * For each active Stripe product, we expand its default_price and look up the
 * active Payment Link that was created for it (matched by metadata.slug).
 *
 * Optional product metadata (set in the Stripe dashboard or via the create
 * script) is read for fields the storefront needs but Stripe doesn't model
 * natively: brand, capacity, rating, reviews, features, slug.
 */

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeInstance;
}

interface ProductOut {
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
  stripePriceId: string | null;
}

function parseFeatures(meta: Stripe.Metadata | null): string[] {
  const raw = meta?.features;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Fallback: comma-separated string
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function priceString(amount: number): string {
  // Display whole-euro amounts as "2950" to match the existing BatteryCard UI
  // (which renders `€{price}`).
  return String(amount);
}

export default async function handler(req: any, res: any) {
  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      error:
        'STRIPE_SECRET_KEY is not configured. Set it in Vercel project settings.',
    });
  }

  try {
    const [products, paymentLinks] = await Promise.all([
      stripe.products.list({
        active: true,
        limit: 100,
        expand: ['data.default_price'],
      }),
      stripe.paymentLinks.list({ active: true, limit: 100 }),
    ]);

    const linksBySlug = new Map<string, string>();
    const linksByProductId = new Map<string, string>();
    for (const link of paymentLinks.data) {
      const slug = link.metadata?.slug;
      if (slug) linksBySlug.set(slug, link.url);
      // Also build a fallback index keyed by the (first) product on the link.
      // Fetching line items would cost another round trip per link, so we rely
      // on metadata.slug as the primary join.
    }

    const out: ProductOut[] = [];
    for (const p of products.data) {
      const meta = (p.metadata ?? {}) as Stripe.Metadata;
      const slug = meta.slug || p.id;

      let priceEur = 0;
      let stripePriceId: string | null = null;
      if (p.default_price && typeof p.default_price !== 'string') {
        const dp = p.default_price as Stripe.Price;
        stripePriceId = dp.id;
        if (typeof dp.unit_amount === 'number') {
          priceEur = Math.round(dp.unit_amount / 100);
        }
      } else if (typeof p.default_price === 'string') {
        stripePriceId = p.default_price;
      }

      const rating = meta.rating ? Number(meta.rating) : 4.7;
      const reviews = meta.reviews ? Number(meta.reviews) : 0;

      out.push({
        id: slug,
        name: p.name,
        brand: meta.brand || '',
        capacity: meta.capacity || '',
        price: priceString(priceEur),
        priceEur,
        rating: Number.isFinite(rating) ? rating : 4.7,
        reviews: Number.isFinite(reviews) ? reviews : 0,
        image: p.images?.[0] || '',
        features: parseFeatures(meta),
        description: p.description || '',
        paymentLinkUrl:
          linksBySlug.get(slug) ?? linksByProductId.get(p.id) ?? null,
        productUrl: p.url || null,
        stripeProductId: p.id,
        stripePriceId,
      });
    }

    // Stable ordering: by priceEur ascending so cheaper products surface first.
    out.sort((a, b) => a.priceEur - b.priceEur);

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    );
    return res.status(200).json({
      source: 'stripe',
      generatedAt: new Date().toISOString(),
      products: out,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
