/**
 * One-off script: update the `images` field of each Stripe product to the
 * public product photo we found on the manufacturer/retailer's site.
 *
 * Usage: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/update-stripe-images.ts
 *
 * Stripe requires images to be publicly reachable URLs (jpg/png/webp). After
 * running this, the storefront automatically picks them up via /api/products
 * (60s cache).
 */

import Stripe from 'stripe';

type ImageUpdate = { slug: string; image: string; source: string };

const IMAGES: ImageUpdate[] = [
  {
    slug: 'marstek-venus-e3',
    image:
      'https://www.marstek.nl/wp-content/uploads/2026/05/Marstek-Venus-E-3.0-excl.-P1-meter.png',
    source: 'marstek.nl',
  },
  {
    slug: 'indevolt-solidflex-2000',
    image:
      'https://nl.indevolt.com/cdn/shop/files/sf-1-pro-french.jpg?v=1777027028',
    source: 'indevolt.com',
  },
  {
    slug: 'growatt-nexa-2000',
    image:
      'https://volt-shop.nl/wp-content/uploads/2025/12/Growatt-NEXA-2000-thuisbatterij.png',
    source: 'volt-shop.nl',
  },
  {
    slug: 'marstek-venus-a',
    image:
      'https://www.marstek.nl/wp-content/uploads/2025/09/marstek-venus-a-charging.png',
    source: 'marstek.nl',
  },
  {
    slug: 'ecoflow-stream',
    image:
      'https://nl.ecoflow.com/cdn/shop/files/ecoflow-stream-ultra-x-1183190545_1066x_0160ec5b-b7a7-4df3-adbe-b650ba693a97.png',
    source: 'ecoflow.com',
  },
];

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY env var is required');
  const stripe = new Stripe(key);

  const products = await stripe.products.list({ active: true, limit: 100 });

  for (const u of IMAGES) {
    const match = products.data.find((p) => p.metadata?.slug === u.slug);
    if (!match) {
      console.warn(`No Stripe product found for slug=${u.slug} — skipping`);
      continue;
    }
    await stripe.products.update(match.id, {
      images: [u.image],
      metadata: { ...match.metadata, image_source: u.source },
    });
    console.log(`Updated ${u.slug} (${match.id}) image → ${u.image}`);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
