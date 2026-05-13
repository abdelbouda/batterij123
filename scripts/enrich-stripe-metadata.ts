/**
 * One-off script: enrich the existing Stripe products with extra metadata
 * (capacity, rating, reviews, features) that the storefront UI reads.
 *
 * Stripe doesn't have native fields for these, so we stash them in
 * product.metadata. The /api/products endpoint reads them back.
 *
 * Usage: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/enrich-stripe-metadata.ts
 */

import Stripe from 'stripe';

type Enrichment = {
  slug: string;
  capacity: string;
  rating: number;
  reviews: number;
  features: string[];
};

const ENRICHMENTS: Enrichment[] = [
  {
    slug: 'marstek-venus-e3',
    capacity: '3 kWh',
    rating: 4.7,
    reviews: 184,
    features: ['AI-sturing', 'LFP-technologie', 'Plug & play'],
  },
  {
    slug: 'indevolt-solidflex-2000',
    capacity: '2.5 kWh',
    rating: 4.6,
    reviews: 92,
    features: ['Solid-state geïnspireerd', 'Lange levensduur', 'Stille werking'],
  },
  {
    slug: 'growatt-nexa-2000',
    capacity: '2 kWh',
    rating: 4.5,
    reviews: 67,
    features: ['2000W output', 'Hybride omvormer-compatibel', 'Modulair stapelbaar'],
  },
  {
    slug: 'marstek-venus-a',
    capacity: '2 kWh',
    rating: 4.4,
    reviews: 211,
    features: ['Scherp geprijsd', 'NL-marktversie', 'Eenvoudige installatie'],
  },
  {
    slug: 'ecoflow-stream',
    capacity: '1 kWh',
    rating: 4.5,
    reviews: 38,
    features: ['Plug & play', 'Slim opladen op zonne-energie', 'Stopcontact aansluiting'],
  },
];

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY env var is required');
  const stripe = new Stripe(key);

  const products = await stripe.products.list({ active: true, limit: 100 });

  for (const e of ENRICHMENTS) {
    const match = products.data.find((p) => p.metadata?.slug === e.slug);
    if (!match) {
      console.warn(`No Stripe product found for slug=${e.slug} — skipping`);
      continue;
    }
    await stripe.products.update(match.id, {
      metadata: {
        ...match.metadata,
        capacity: e.capacity,
        rating: String(e.rating),
        reviews: String(e.reviews),
        features: JSON.stringify(e.features),
      },
    });
    console.log(`Enriched ${e.slug} (${match.id})`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
