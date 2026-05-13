/**
 * One-off script: create the 5 selected Batterij123.nl products in Stripe
 * (Product + Price + Payment Link) and write the result to products.json.
 *
 * Usage: STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/create-stripe-products.ts
 */

import Stripe from 'stripe';
import fs from 'node:fs/promises';
import path from 'node:path';

type ScrapedProduct = {
  id: string;
  name: string;
  brand: string;
  description: string;
  priceEur: number;
  image: string;
  productUrl: string;
};

const SITE = 'https://batterij123.nl';

const PRODUCTS: ScrapedProduct[] = [
  {
    id: 'marstek-venus-e3',
    name: 'Marstek Venus E 3.0',
    brand: 'Marstek',
    description:
      'De nieuwste generatie Venus-serie met verbeterde AI-sturing voor maximale besparing.',
    priceEur: 2950,
    image: `${SITE}/images/venuse1.webp`,
    productUrl: `${SITE}/producten/marstek-venus-e3`,
  },
  {
    id: 'indevolt-solidflex-2000',
    name: 'Indevolt SolidFlex 2000',
    brand: 'Indevolt',
    description:
      "Robuuste 'solid-state' geïnspireerde opbouw voor extreme veiligheid en lange levensduur.",
    priceEur: 3800,
    image: `${SITE}/images/solidflex1.webp`,
    productUrl: `${SITE}/producten/indevolt-solidflex-2000`,
  },
  {
    id: 'growatt-nexa-2000',
    name: 'Growatt NEXA 2000',
    brand: 'Growatt',
    description:
      'Slimme 2000W output batterij van Growatt, perfect voor hybride omvormers.',
    priceEur: 3100,
    image: `${SITE}/images/nexa1.webp`,
    productUrl: `${SITE}/producten/growatt-nexa-2000`,
  },
  {
    id: 'marstek-venus-a',
    name: 'Marstek Venus A',
    brand: 'Marstek',
    description:
      'De instapversie van de Venus serie, betrouwbaar en zeer scherp geprijsd voor de NL markt.',
    priceEur: 2400,
    image: `${SITE}/images/venusa1.webp`,
    productUrl: `${SITE}/producten/marstek-venus-a`,
  },
  {
    id: 'ecoflow-stream',
    name: 'EcoFlow STREAM',
    brand: 'EcoFlow',
    description:
      'Slimme plug & play stekkerbatterij — direct in het stopcontact, automatisch opladen op zonne-energie of goedkope stroom.',
    priceEur: 799,
    image: `${SITE}/images/eco_steam1.webp`,
    productUrl: `${SITE}/producten/ecoflow-stream`,
  },
];

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY env var is required');
  }
  const stripe = new Stripe(key);

  const out: Array<{
    id: string;
    slug: string;
    name: string;
    brand: string;
    description: string;
    priceEur: number;
    image: string;
    productUrl: string;
    stripe: {
      productId: string;
      priceId: string;
      paymentLinkId: string;
      paymentLinkUrl: string;
      livemode: boolean;
    };
  }> = [];

  for (const p of PRODUCTS) {
    console.log(`\n=== ${p.name} (€${p.priceEur}) ===`);

    const product = await stripe.products.create({
      name: p.name,
      description: p.description,
      images: [p.image],
      url: p.productUrl,
      metadata: {
        brand: p.brand,
        slug: p.id,
        source: 'batterij123.nl',
      },
    });
    console.log('  product:', product.id);

    const price = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: p.priceEur * 100,
    });
    console.log('  price:  ', price.id);

    await stripe.products.update(product.id, { default_price: price.id });

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: 'redirect',
        redirect: { url: `${SITE}/success` },
      },
      metadata: {
        slug: p.id,
        source: 'batterij123.nl',
      },
    });
    console.log('  link:   ', link.url);

    out.push({
      id: product.id,
      slug: p.id,
      name: p.name,
      brand: p.brand,
      description: p.description,
      priceEur: p.priceEur,
      image: p.image,
      productUrl: p.productUrl,
      stripe: {
        productId: product.id,
        priceId: price.id,
        paymentLinkId: link.id,
        paymentLinkUrl: link.url,
        livemode: link.livemode,
      },
    });
  }

  const file = path.resolve(process.cwd(), 'products.json');
  const payload = {
    source: SITE,
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
