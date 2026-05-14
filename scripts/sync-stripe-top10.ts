/**
 * Idempotent sync of the Top-10 Plug & Play thuisbatterijen lineup to Stripe.
 *
 * For each item:
 *   - Look up the Stripe Product by metadata.slug.
 *   - Update name / description / metadata / images, or create a new product.
 *   - Create a new Price (Stripe prices are immutable) and set as default.
 *   - Generate a new Payment Link pointed at the new Price.
 *
 * Images come from the repo's `public/products/<slug>/*.webp` directory and
 * are referenced via the live site URL once deployed.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/sync-stripe-top10.ts
 *
 * Optional env:
 *   SITE_URL  Defaults to https://batterij123.nl. Override to use a Vercel
 *             preview URL while images are still propagating.
 */

import Stripe from 'stripe';
import fs from 'node:fs/promises';
import path from 'node:path';

type TopItem = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  /** Price in euros (whole numbers; list price + €100 margin). */
  priceEur: number;
  /** Optional list of image filenames in public/products/<slug>/. */
  imageCount: number;
  /** Storefront detail-page URL. */
  productPath: string;
  /** Display metadata. */
  capacity: string;
  rating: string;
  unique: string;
  source: string;
};

const SITE_URL = (process.env.SITE_URL || 'https://batterij123.nl').replace(/\/+$/, '');

const TOP10: TopItem[] = [
  {
    slug: 'homewizard-plug-in',
    name: 'HomeWizard Plug-In',
    brand: 'HomeWizard',
    description:
      'Plug & Play thuisbatterij van HomeWizard met de beste app & P1-integratie (NL). 2,7 kWh, eenvoudig zelf te installeren in een stopcontact.',
    priceEur: 1295,
    imageCount: 4,
    productPath: '/producten/homewizard-plug-in',
    capacity: '2.7 kWh',
    rating: '9.4',
    unique: 'Beste app & P1-integratie (NL)',
    source: 'homewizard.com',
  },
  {
    slug: 'marstek-venus-e3',
    name: 'Marstek Venus E 3.0',
    brand: 'Marstek',
    description:
      'Plug & Charge thuisbatterij met de meeste capaciteit voor de prijs. 5,12 kWh LFP, AI-sturing en koppelbaar tot 30 kWh.',
    priceEur: 1550,
    imageCount: 4,
    productPath: '/producten/marstek-venus-e3',
    capacity: '5.12 kWh',
    rating: '9.2',
    unique: 'Meeste capaciteit voor de prijs',
    source: 'marstek.nl',
  },
  {
    slug: 'zendure-solarflow-2400-ac-plus',
    name: 'Zendure SolarFlow 2400 AC+',
    brand: 'Zendure',
    description:
      'Beste allrounder met zonne-ingang. 2,4 kWh basis, uitbreidbaar tot 17,28 kWh, 2400W off-grid vermogen, 800W bidirectionele AC.',
    priceEur: 1400,
    imageCount: 5,
    productPath: '/producten/zendure-solarflow-2400-ac-plus',
    capacity: '2.4 kWh',
    rating: '9.0',
    unique: 'Beste allrounder met zonne-ingang',
    source: 'zendure.nl',
  },
  {
    slug: 'anker-solix-solarbank-3-pro',
    name: 'Anker SOLIX Solarbank 3 Pro',
    brand: 'Anker SOLIX',
    description:
      'Snelste laadtijd & topkwaliteit bouw. AI-gestuurd plug-in opslagsysteem met 2,68 kWh per unit, uitbreidbaar tot 16 kWh, 3600W solar input.',
    priceEur: 1300,
    imageCount: 5,
    productPath: '/producten/anker-solix-solarbank-3-pro',
    capacity: '2.68 kWh',
    rating: '8.9',
    unique: 'Snelste laadtijd & topkwaliteit bouw',
    source: 'ankersolix.com',
  },
  {
    slug: 'ecoflow-stream-ac-pro',
    name: 'EcoFlow STREAM AC Pro',
    brand: 'EcoFlow',
    description:
      'Beste ecosysteem met portable power. 1,92 kWh plug-and-play thuisbatterij, uitbreidbaar tot 11,52 kWh, 1200W terugleveren via stopcontact.',
    priceEur: 1350,
    imageCount: 5,
    productPath: '/producten/ecoflow-stream-ac-pro',
    capacity: '1.92 kWh',
    rating: '8.8',
    unique: 'Beste ecosysteem met portable power',
    source: 'ecoflow.nl',
  },
  {
    slug: 'zinvolt-power',
    name: 'ZinVolt Power',
    brand: 'ZinVolt',
    description:
      'Lichtgewicht & zeer mobiel. Draagbare plug & play thuisbatterij van 1 kWh, uitbreidbaar tot 6 kWh, ook off-grid bruikbaar.',
    priceEur: 850,
    imageCount: 5,
    productPath: '/producten/zinvolt-power',
    capacity: '1.02 kWh',
    rating: '8.5',
    unique: 'Lichtgewicht & zeer mobiel',
    source: 'zinvolt.com',
  },
  {
    slug: 'sessy',
    name: 'Sessy (Stekkermodel)',
    brand: 'Sessy',
    description:
      'Hoogwaardig NL product, slimme sturing. 5,0 kWh bruikbare capaciteit, ingebouwde EMS, ontwikkeld en geassembleerd in Nederland.',
    priceEur: 3600,
    imageCount: 5,
    productPath: '/producten/sessy',
    capacity: '5.0 kWh',
    rating: '9.1',
    unique: 'Hoogwaardig NL product, slimme sturing',
    source: 'sessy.nl',
  },
  {
    slug: 'lunergy-hub-2400-ac',
    name: 'Lunergy Hub 2400 AC',
    brand: 'Lunergy',
    description:
      'Stilste werking dankzij actieve koeling. 5,22 kWh modulair plug-in systeem met 2400W vermogen, uitbreidbaar tot 15,66 kWh per unit.',
    priceEur: 2200,
    imageCount: 5,
    productPath: '/producten/lunergy-hub-2400-ac',
    capacity: '5.22 kWh',
    rating: '8.4',
    unique: 'Stilste werking (actieve koeling)',
    source: 'lunergypower.nl',
  },
  {
    slug: 'indevolt-solidflex-2000',
    name: 'Indevolt SolidFlex 2000',
    brand: 'Indevolt',
    description:
      'Lange levensduur met 8000+ cycli en Red Dot Design Award winnaar 2025. 1,79 kWh, robuuste solid-state geïnspireerde opbouw.',
    priceEur: 1200,
    imageCount: 5,
    productPath: '/producten/indevolt-solidflex-2000',
    capacity: '1.79 kWh',
    rating: '8.3',
    unique: 'Lange levensduur (8000+ cycli)',
    source: 'indevolt.com',
  },
  {
    slug: 'ecoflow-stream-ultra',
    name: 'EcoFlow STREAM Ultra',
    brand: 'EcoFlow',
    description:
      'Vlaggenschip van de STREAM-serie. 3,84 kWh thuisbatterij met directe zonne-ingang, AI-app en koppelbaar binnen het EcoFlow-ecosysteem.',
    priceEur: 2500,
    imageCount: 5,
    productPath: '/producten/ecoflow-stream-ultra',
    capacity: '3.84 kWh',
    rating: '8.8',
    unique: 'Vlaggenschip van het STREAM-ecosysteem',
    source: 'ecoflow.nl',
  },
];

/**
 * Repurpose the old `ecoflow-stream` Stripe product as `ecoflow-stream-ultra`.
 * Without this, the existing product (which still owns the `ecoflow-stream`
 * slug from PR #1) would remain orphaned and we'd create a duplicate.
 */
const SLUG_ALIASES: Record<string, string[]> = {
  'ecoflow-stream-ultra': ['ecoflow-stream'],
};

type StripeProduct = Stripe.Product;

async function findProductBySlug(stripe: Stripe, slug: string, aliases: string[]): Promise<StripeProduct | null> {
  const slugs = [slug, ...aliases];
  // Stripe doesn't allow filtering by metadata via products.list, so paginate.
  for await (const product of stripe.products.list({ limit: 100, active: true })) {
    if (slugs.includes(product.metadata?.slug ?? '')) return product;
  }
  for await (const product of stripe.products.list({ limit: 100, active: false })) {
    if (slugs.includes(product.metadata?.slug ?? '')) return product;
  }
  return null;
}

function buildImageUrls(item: TopItem): string[] {
  return Array.from(
    { length: item.imageCount },
    (_, i) => `${SITE_URL}/products/${item.slug}/${i + 1}.webp`,
  );
}

function buildMetadata(item: TopItem): Stripe.MetadataParam {
  return {
    slug: item.slug,
    brand: item.brand,
    capacity: item.capacity,
    rating: item.rating,
    unique: item.unique,
    source: item.source,
  };
}

async function syncOne(stripe: Stripe, item: TopItem) {
  console.log(`\n=== ${item.name} (€${item.priceEur}) ===`);

  const aliases = SLUG_ALIASES[item.slug] ?? [];
  const existing = await findProductBySlug(stripe, item.slug, aliases);

  const images = buildImageUrls(item);
  const productUrl = `${SITE_URL}${item.productPath}`;
  const metadata = buildMetadata(item);

  let product: StripeProduct;
  if (existing) {
    console.log(`  found existing: ${existing.id} (was slug=${existing.metadata?.slug})`);
    product = await stripe.products.update(existing.id, {
      name: item.name,
      description: item.description,
      images,
      url: productUrl,
      active: true,
      metadata,
    });
  } else {
    product = await stripe.products.create({
      name: item.name,
      description: item.description,
      images,
      url: productUrl,
      metadata,
    });
    console.log(`  created product: ${product.id}`);
  }

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: item.priceEur * 100,
  });
  console.log(`  price:           ${price.id}`);

  await stripe.products.update(product.id, { default_price: price.id });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: `${SITE_URL}/success` },
    },
    metadata: { slug: item.slug, source: 'batterij123.nl' },
  });
  console.log(`  payment link:    ${link.url}`);

  return {
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    description: item.description,
    priceEur: item.priceEur,
    images,
    productUrl,
    stripe: {
      productId: product.id,
      priceId: price.id,
      paymentLinkId: link.id,
      paymentLinkUrl: link.url,
      livemode: link.livemode,
    },
  };
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY env var is required');
  const stripe = new Stripe(key);

  const out: Array<Awaited<ReturnType<typeof syncOne>>> = [];
  for (const item of TOP10) {
    out.push(await syncOne(stripe, item));
  }

  const file = path.resolve(process.cwd(), 'products.json');
  const payload = {
    source: SITE_URL,
    currency: 'eur',
    livemode: out.every((o) => o.stripe.livemode),
    generatedAt: new Date().toISOString(),
    products: out,
  };
  await fs.writeFile(file, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`\nWrote ${out.length} products to ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
