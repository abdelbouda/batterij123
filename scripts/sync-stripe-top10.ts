/**
 * Idempotent sync of the Top-10 Plug & Play thuisbatterijen lineup to Stripe.
 *
 * For each item:
 *   - Look up the Stripe Product by metadata.slug.
 *   - Update name / description / metadata / images / marketing_features.
 *   - Create a new Price (Stripe prices are immutable) and set as default.
 *   - Deactivate any previously generated payment links pointing at the same slug.
 *   - Generate a new Payment Link pointed at the new Price (with the HomeWizard
 *     Wi-Fi P1 Meter added as an optional cross-sell item for every battery).
 *
 * Image URLs come from the live Vercel deploy (`/products/<slug>/N.webp`).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/sync-stripe-top10.ts
 *
 * Optional env:
 *   SITE_URL  Image host. Defaults to https://batterij123.vercel.app since the
 *             .nl domain is on a separate host that does not serve these files.
 */

import Stripe from 'stripe';
import fs from 'node:fs/promises';
import path from 'node:path';

type Category = 'battery' | 'accessory';

type CatalogItem = {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  /** Long, SEO-optimized NL description shown in Stripe + on the storefront. */
  description: string;
  /** Marketing-features bullets (Stripe limits each to 80 chars; max 15). */
  features: string[];
  /** Price in euros (whole numbers or with cents). */
  priceEur: number;
  /** Optional list of image filenames in public/products/<slug>/. */
  imageCount: number;
  /** Storefront detail-page URL path. */
  productPath: string;
  /** Display metadata (used by storefront card). */
  capacity: string;
  rating: string;
  unique: string;
  source: string;
};

const SITE_URL = (process.env.SITE_URL || 'https://batterij123.vercel.app').replace(/\/+$/, '');
const STOREFRONT_URL = (process.env.STOREFRONT_URL || 'https://batterij123.nl').replace(/\/+$/, '');

/**
 * 11 items: 10 plug & play thuisbatterijen + 1 accessory (P1 Meter).
 * Prices are based on the laagste retail prijs that we found in late
 * 2026 onderzoek, +€100 marge voor batterijen. P1 Meter = exact retail
 * (geen marge) zoals afgesproken met klant.
 */
const CATALOG: CatalogItem[] = [
  {
    slug: 'homewizard-p1-meter',
    name: 'HomeWizard Wi-Fi P1 Meter',
    brand: 'HomeWizard',
    category: 'accessory',
    description:
      'De HomeWizard Wi-Fi P1 Meter geeft je in één oogopslag inzicht in je stroomverbruik, teruglevering én gasverbruik. Klik de P1-dongle in de P1-poort van je slimme meter en zie via de gratis HomeWizard-app realtime hoeveel energie je opwekt en gebruikt. Onmisbaar voor dynamische tarieven, plug & play thuisbatterijen en zelfconsumptie-optimalisatie na het einde van de salderingsregeling.',
    features: [
      'Realtime inzicht in stroom, teruglevering en gas',
      'Plug & Play installatie via P1-poort (<1 minuut)',
      'Werkt met alle Nederlandse slimme meters (SMR4 + SMR5)',
      'Lokale API + officiële Home Assistant integratie',
      'Open standaard voor Marstek, Zendure, Anker en EcoFlow',
      '2 jaar fabrieksgarantie van HomeWizard',
    ],
    priceEur: 24.95,
    imageCount: 4,
    productPath: '/producten/homewizard-p1-meter',
    capacity: 'n.v.t.',
    rating: '9.5',
    unique: 'Onmisbare P1-dongle voor elke plug & play thuisbatterij',
    source: 'homewizard.com',
  },
  {
    slug: 'homewizard-plug-in',
    name: 'HomeWizard Plug-In Battery 2,7 kWh',
    brand: 'HomeWizard',
    category: 'battery',
    description:
      'De HomeWizard Plug-In Battery is een 2,7 kWh plug & play thuisbatterij die je zelf in 5 minuten installeert. Sluit de stekker aan, koppel via de P1 Meter aan je slimme meter en bespaar direct op je energierekening. Werkt met dynamische stroomtarieven, ondersteunt zelfconsumptie en wordt aangestuurd via de meest gewaardeerde Nederlandse energie-app. Inclusief lokale API en native Home Assistant-integratie — ideaal voor wie zelf de regie wil houden.',
    features: [
      'Plug & Play: in een stopcontact en klaar',
      '2,69 kWh LiFePO₄ opslag, 6000+ laadcycli',
      'Beste Nederlandse energie-app met P1-integratie',
      '800 W in- en uitgangsvermogen',
      'Lokale API + native Home Assistant integratie',
      'Werkt zonder cloud-abonnement',
      '2 jaar fabrieksgarantie',
    ],
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
    name: 'Marstek Venus E 3.0 — 5,12 kWh Plug & Charge thuisbatterij',
    brand: 'Marstek',
    category: 'battery',
    description:
      'De Marstek Venus E 3.0 is dé plug & charge thuisbatterij met de meeste capaciteit voor je geld: 5,12 kWh LFP-opslag in één compacte unit, koppelbaar tot 30 kWh. Tot 2.500 W noodstroom via een speciale back-up poort, IP65 voor buiten en geschikt voor temperaturen tot -20 °C. AI-modus plant het laden op basis van dynamische stroomprijzen en leert van jouw verbruik. Met 10 jaar fabrieksgarantie de slimste keuze voor huishoudens die zich willen voorbereiden op het einde van de salderingsregeling in 2027.',
    features: [
      '5,12 kWh LFP-opslag, koppelbaar tot 30 kWh',
      'Plug & Charge: installatie in ca. 5 minuten',
      'Tot 2.500 W back-up vermogen via noodstroompoort',
      'AI-modus voor dynamische stroomtarieven',
      'IP65, werking tot -20 °C, geschikt voor buiten',
      '100% compatibel met bestaande zonnepanelen',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 1325,
    imageCount: 4,
    productPath: '/producten/marstek-venus-e3',
    capacity: '5.12 kWh',
    rating: '9.2',
    unique: 'Meeste capaciteit voor de prijs',
    source: 'marstek.nl',
  },
  {
    slug: 'zendure-solarflow-2400-ac-plus',
    name: 'Zendure SolarFlow 2400 AC+ — 2,4 kWh plug-in thuisbatterij',
    brand: 'Zendure',
    category: 'battery',
    description:
      'De Zendure SolarFlow 2400 AC+ is de beste allrounder met zonne-ingang: 2,4 kWh LFP-opslag, uitbreidbaar tot 17,28 kWh, 2400 W bidirectioneel AC en directe MPPT-zonne-ingang. Plug & play via een stopcontact, met ingebouwd brandonderdrukkingssysteem en IP65-behuizing voor buitenmontage. Bestuurbaar via de Zendure-app, geschikt voor dynamische tarieven en gekoppeld aan je P1 Meter voor maximale zelfconsumptie. 10 jaar fabrieksgarantie en een verwachte levensduur van 15 jaar.',
    features: [
      '2,4 kWh basis, uitbreidbaar tot 17,28 kWh',
      'Directe MPPT-zonne-ingang naast AC-laden',
      '2400 W bidirectioneel AC, 3200 W off-grid',
      'IP65 + ingebouwd brandonderdrukkingssysteem',
      'P1-integratie voor zelfconsumptie en dyn. tarieven',
      'Home Assistant + ZenStack-integratie',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 1059,
    imageCount: 5,
    productPath: '/producten/zendure-solarflow-2400-ac-plus',
    capacity: '2.4 kWh',
    rating: '9.0',
    unique: 'Beste allrounder met zonne-ingang',
    source: 'zendure.nl',
  },
  {
    slug: 'anker-solix-solarbank-3-pro',
    name: 'Anker SOLIX Solarbank 3 E2700 Pro — 2,68 kWh plug-in thuisbatterij',
    brand: 'Anker SOLIX',
    category: 'battery',
    description:
      'De Anker SOLIX Solarbank 3 E2700 Pro combineert snelste laadtijd en topkwaliteit bouw met AI-aansturing en een UPS-functie (<20 ms overschakeling). 2,68 kWh per unit, uitbreidbaar tot 16 kWh, met 4 MPPT-trackers voor maximaal 3600 W zonne-input. IP65, ingebouwde accuverwarming en een operating range van -20 °C tot 55 °C maken hem geschikt voor buitenmontage. 1.200 W noodstroom houdt je essentiële apparatuur draaiende bij stroomuitval. 10 jaar fabrieksgarantie.',
    features: [
      '2,68 kWh per unit, uitbreidbaar tot 16 kWh',
      '4 MPPT-trackers tot 3.600 W zonne-input',
      'UPS-functie: <20 ms overschakeling bij stroomuitval',
      '1.200 W noodstroom via off-grid-poort',
      'IP65 + ingebouwde accuverwarming (-20 °C)',
      'AI-modus en P1-integratie voor dyn. tarieven',
      'Native Home Assistant integratie',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 1199,
    imageCount: 5,
    productPath: '/producten/anker-solix-solarbank-3-pro',
    capacity: '2.68 kWh',
    rating: '8.9',
    unique: 'Snelste laadtijd & topkwaliteit bouw',
    source: 'ankersolix.com',
  },
  {
    slug: 'ecoflow-stream-ac-pro',
    name: 'EcoFlow STREAM AC Pro — 1,92 kWh plug & play thuisbatterij',
    brand: 'EcoFlow',
    category: 'battery',
    description:
      'De EcoFlow STREAM AC Pro maakt deel uit van het uitgebreidste plug & play ecosysteem op de markt. 1,92 kWh LFP-opslag, 1.200 W bi-directioneel via een gewoon stopcontact en koppelbaar tot 11,52 kWh. Geen ingewikkelde installatie: in het stopcontact en aansturen via de EcoFlow-app. Combineerbaar met de STREAM Ultra, STREAM Max, microsolar omvormers en draagbare powerstations van EcoFlow. Ideaal voor wie z\'n stekkerbatterij later wil uitbreiden of mobiel wil maken.',
    features: [
      '1,92 kWh LFP, uitbreidbaar tot 11,52 kWh',
      '1.200 W bidirectioneel via een stopcontact',
      'Onderdeel van het EcoFlow STREAM-ecosysteem',
      'AI-monitoring en sturing via EcoFlow-app',
      '100% compatibel met micro-omvormers',
      'IP65, geschikt voor binnen en buiten',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 792,
    imageCount: 5,
    productPath: '/producten/ecoflow-stream-ac-pro',
    capacity: '1.92 kWh',
    rating: '8.8',
    unique: 'Beste ecosysteem met portable power',
    source: 'ecoflow.nl',
  },
  {
    slug: 'zinvolt-power',
    name: 'ZinVolt Power — 1 kWh draagbare plug & play thuisbatterij',
    brand: 'ZinVolt',
    category: 'battery',
    description:
      'De ZinVolt Power is dé lichtgewicht draagbare plug & play thuisbatterij. 1 kWh ingebouwd in de Power-unit, uitbreidbaar tot 6 kWh met ZinVolt Mate modules. Drie stopcontacten, twee PV-ingangen tot 1.200 W en USB-C 100 W bidirectioneel maken hem net zo geschikt voor je woonkamer als voor de camping of een tuinhuis. Fluisterstil (<35 dB), 6.000 laadcycli en aansturing via de ZinVolt-app of P1-dongle. Een complete energie-oplossing met 3 jaar garantie op de Power en 10 jaar garantie op de Mate.',
    features: [
      '1 kWh ingebouwd, uitbreidbaar tot 6 kWh met ZinVolt Mate',
      '3 stopcontacten + 2 PV-ingangen (tot 1.200 W zonne)',
      'USB-C 100 W bidirectioneel + 2× USB-A 18 W',
      'Off-grid bruikbaar (camping, tuinhuis, schuur)',
      'Fluisterstil: <35 dB tijdens werking',
      'WiFi-aansturing via ZinVolt-app',
      '3 jaar garantie Power, 10 jaar garantie Mate',
    ],
    priceEur: 1199,
    imageCount: 5,
    productPath: '/producten/zinvolt-power',
    capacity: '1.02 kWh',
    rating: '8.5',
    unique: 'Lichtgewicht & zeer mobiel',
    source: 'zinvolt.com',
  },
  {
    slug: 'sessy',
    name: 'Sessy 5 kWh — Nederlands ontwikkelde thuisbatterij',
    brand: 'Sessy',
    category: 'battery',
    description:
      'De Sessy is een hoogwaardig Nederlands thuisbatterijproduct, ontwikkeld en geassembleerd in Andelst. 5 kWh bruikbare LFP-capaciteit per unit, koppelbaar tot 10 kWh of meer. Geen abonnementskosten, geen hybride omvormer nodig — Sessy past op elk bestaand PV-systeem. Ingebouwde slimme software, P1-dongle inbegrepen en volledige controle via de Sessy-app of webportal. Werkt op 1-fase én 3-fase aansluitingen en is toekomstbestendig met regelmatige software-updates.',
    features: [
      '5 kWh bruikbare LFP-opslag, koppelbaar tot 10 kWh',
      'In Nederland ontworpen, ontwikkeld en geassembleerd',
      'Geen abonnementskosten — geen hybride omvormer nodig',
      'P1-dongle voor real-time inzicht inbegrepen',
      'Geschikt voor 1-fase én 3-fase aansluiting',
      'Slimme aansturing via Sessy-app en webportal',
      'Compatibel met SMA, SolarEdge, Enphase en Huawei',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 3650,
    imageCount: 5,
    productPath: '/producten/sessy',
    capacity: '5.0 kWh',
    rating: '9.1',
    unique: 'Hoogwaardig NL product, slimme sturing',
    source: 'sessy.nl',
  },
  {
    slug: 'lunergy-hub-2400-ac',
    name: 'Lunergy Hub 2400 AC — 5,22 kWh modulair plug & play systeem',
    brand: 'Lunergy',
    category: 'battery',
    description:
      'De Lunergy Hub 2400 AC is de stilste plug & play thuisbatterij dankzij actieve koeling die pas inschakelt boven 60 °C. 5,22 kWh BP5200-module per unit, uitbreidbaar tot maar liefst 78,3 kWh. 2.400 W laad- en ontlaadvermogen, 4.800 W piek noodstroom en P1-meter standaard inbegrepen. IP65, beschikbaar als plug-in of vaste installatie. Met 10 jaar fabrieksgarantie en native Home Assistant-integratie de modulairste keuze voor wie écht groot wil schalen.',
    features: [
      '5,22 kWh per unit, modulair uitbreidbaar tot 78,3 kWh',
      '2.400 W laad- en ontlaadvermogen',
      'Stilste werking dankzij actieve koeling (>60 °C)',
      '4.800 W piek-noodstroom bij stroomuitval',
      'Gratis P1-meter inbegrepen bij de omvormer',
      'IP65, plug-in of vast aansluitbaar',
      'Native Home Assistant integratie',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 1699,
    imageCount: 5,
    productPath: '/producten/lunergy-hub-2400-ac',
    capacity: '5.22 kWh',
    rating: '8.4',
    unique: 'Stilste werking (actieve koeling)',
    source: 'lunergypower.nl',
  },
  {
    slug: 'indevolt-solidflex-2000',
    name: 'Indevolt SolidFlex 2000 — Semi-solid state plug & play thuisbatterij',
    brand: 'Indevolt',
    category: 'battery',
    description:
      'De Indevolt SolidFlex 2000 zet de standaard met Semi-Solid State LiFePO₄ batterijcellen: veiliger, dichter en langer houdbaar dan klassieke LFP. 1,79 kWh per unit, parallelliseerbaar tot maximaal 32 kWh, 2.400 W off-grid vermogen en automatische overschakeling binnen 10 ms bij stroomuitval. 4 MPPT-trackers tot 2.400 W zonne-ingang, IP65 voor buiten, plug & play met AC-koppeling. Red Dot Design Award winnaar 2025 met 10 jaar fabrieksgarantie.',
    features: [
      'Semi-solid state LiFePO₄ cellen: extra veilig en duurzaam',
      '1,79 kWh, parallelliseerbaar tot 32 kWh totaal',
      '4 MPPT-trackers, tot 2.400 W zonne-input',
      '2.400 W off-grid vermogen, omschakeling <10 ms',
      'IP65, werking van -20 °C tot 55 °C',
      'Red Dot Design Award winnaar 2025',
      'Native Home Assistant integratie (officieel)',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 899,
    imageCount: 5,
    productPath: '/producten/indevolt-solidflex-2000',
    capacity: '1.79 kWh',
    rating: '8.3',
    unique: 'Semi-solid state, 8000+ cycli levensduur',
    source: 'indevolt.com',
  },
  {
    slug: 'ecoflow-stream-ultra',
    name: 'EcoFlow STREAM Ultra — 1,92 kWh plug-in thuisbatterij met 4× MPPT',
    brand: 'EcoFlow',
    category: 'battery',
    description:
      'De EcoFlow STREAM Ultra is het vlaggenschip van de STREAM-serie: 1,92 kWh LFP-opslag, 1.200 W vermogen (2.300 W piek), 4 MPPT-trackers voor maximaal 1.050 W directe zonne-input. Plug & play via een gewoon stopcontact, koppelbaar met andere STREAM-units tot meerdere kWh. IP65 voor buitenmontage, bidirectioneel met 800 W teruglevering en aangestuurd via de EcoFlow-app. Inclusief AI-modus voor dynamische tarieven en native Home Assistant integratie via MQTT. 10 jaar fabrieksgarantie.',
    features: [
      '1,92 kWh LFP, koppelbaar in STREAM-ecosysteem',
      '4 MPPT-trackers, tot 1.050 W directe zonne-input',
      '1.200 W vermogen, 2.300 W piek',
      '800 W teruglevering naar het net',
      'IP65, geschikt voor balkon, tuin of buitenmuur',
      'AI-app voor dynamische stroomtarieven',
      'Native Home Assistant via MQTT',
      '10 jaar fabrieksgarantie',
    ],
    priceEur: 1598,
    imageCount: 5,
    productPath: '/producten/ecoflow-stream-ultra',
    capacity: '3.84 kWh',
    rating: '8.8',
    unique: 'Vlaggenschip van het STREAM-ecosysteem',
    source: 'ecoflow.nl',
  },
];

/**
 * Slug aliases for legacy product migration. When syncing the new slug we
 * also look up these old slugs so we can repurpose the existing Stripe
 * product rather than creating a duplicate.
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

function buildImageUrls(item: CatalogItem): string[] {
  return Array.from(
    { length: item.imageCount },
    (_, i) => `${SITE_URL}/products/${item.slug}/${i + 1}.webp`,
  );
}

function buildMetadata(item: CatalogItem): Stripe.MetadataParam {
  return {
    slug: item.slug,
    brand: item.brand,
    category: item.category,
    capacity: item.capacity,
    rating: item.rating,
    unique: item.unique,
    source: item.source,
  };
}

function buildMarketingFeatures(item: CatalogItem): Stripe.ProductUpdateParams.MarketingFeature[] {
  // Stripe caps each feature name at 80 characters; trim defensively.
  return item.features.slice(0, 15).map((name) => ({ name: name.slice(0, 80) }));
}

async function deactivateOldPaymentLinks(stripe: Stripe, slug: string) {
  let count = 0;
  for await (const link of stripe.paymentLinks.list({ limit: 100, active: true })) {
    if (link.metadata?.slug === slug) {
      await stripe.paymentLinks.update(link.id, { active: false });
      count += 1;
    }
  }
  if (count) console.log(`  deactivated ${count} old payment link(s)`);
}

async function syncOne(
  stripe: Stripe,
  item: CatalogItem,
  options: { optionalAccessoryPriceId: string | null },
) {
  console.log(`\n=== ${item.name} (€${item.priceEur}) ===`);

  const aliases = SLUG_ALIASES[item.slug] ?? [];
  const existing = await findProductBySlug(stripe, item.slug, aliases);

  const images = buildImageUrls(item);
  const productUrl = `${STOREFRONT_URL}${item.productPath}`;
  const metadata = buildMetadata(item);
  const marketing_features = buildMarketingFeatures(item);

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
      marketing_features,
    });
  } else {
    product = await stripe.products.create({
      name: item.name,
      description: item.description,
      images,
      url: productUrl,
      metadata,
      marketing_features,
    });
    console.log(`  created product: ${product.id}`);
  }

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: Math.round(item.priceEur * 100),
  });
  console.log(`  price:           ${price.id}`);

  await stripe.products.update(product.id, { default_price: price.id });
  await deactivateOldPaymentLinks(stripe, item.slug);

  const paymentLinkParams: Stripe.PaymentLinkCreateParams = {
    line_items: [{ price: price.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: `${STOREFRONT_URL}/success` },
    },
    metadata: { slug: item.slug, source: 'batterij123.nl' },
  };

  if (item.category === 'battery' && options.optionalAccessoryPriceId) {
    paymentLinkParams.optional_items = [
      {
        price: options.optionalAccessoryPriceId,
        quantity: 1,
        adjustable_quantity: { enabled: true, minimum: 0, maximum: 3 },
      },
    ];
  }

  const link = await stripe.paymentLinks.create(paymentLinkParams);
  console.log(`  payment link:    ${link.url}`);

  return {
    slug: item.slug,
    name: item.name,
    brand: item.brand,
    category: item.category,
    description: item.description,
    features: item.features,
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

  // Sync the P1 Meter first so we can attach it as optional cross-sell
  // to every battery payment link.
  const accessory = CATALOG.find((c) => c.slug === 'homewizard-p1-meter');
  if (!accessory) throw new Error('homewizard-p1-meter not found in CATALOG');

  const out: Array<Awaited<ReturnType<typeof syncOne>>> = [];
  const accessoryResult = await syncOne(stripe, accessory, { optionalAccessoryPriceId: null });
  out.push(accessoryResult);

  for (const item of CATALOG) {
    if (item.slug === accessory.slug) continue;
    out.push(await syncOne(stripe, item, { optionalAccessoryPriceId: accessoryResult.stripe.priceId }));
  }

  const file = path.resolve(process.cwd(), 'products.json');
  const payload = {
    source: STOREFRONT_URL,
    imageHost: SITE_URL,
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
