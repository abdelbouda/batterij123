import type { Article } from './articles';

export type InfoHub = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  articleSlugs: string[];
  productIds: string[];
};

export const infoHubs: InfoHub[] = [
  {
    slug: 'salderingsregeling-2027',
    title: 'Salderingsregeling 2027',
    description:
      'Wat verandert er in 2027 en waarom een thuisbatterij dan extra interessant wordt. Praktische uitleg + links naar relevante producten.',
    intro:
      'De afbouw van de salderingsregeling verandert de rekensom voor zonnepanelen. In deze hub vindt u de beste uitleg, rekenhulpen en productlinks (plug & play thuisbatterijen + P1 meter) om uw zelfconsumptie te verhogen.',
    articleSlugs: [
      'afbouw-salderingsregeling-2027',
      'thuisbatterij-kosten-subsidie-2026',
      'capaciteit-thuisbatterij-berekenen',
    ],
    productIds: ['marstek-venus-e3', 'ecoflow-stream', 'homewizard-p1-meter'],
  },
  {
    slug: 'dynamische-tarieven',
    title: 'Dynamische tarieven & slim laden',
    description:
      'Verdien extra met een dynamisch contract: laden bij lage uurprijzen, ontladen op piekuren. Inclusief producten die dit goed ondersteunen.',
    intro:
      'Met een dynamisch energiecontract volgt uw stroomprijs de uurprijs. Dat geeft kansen: laden op goedkope uren en ontladen als de prijs hoog is. In deze hub vindt u de belangrijkste uitleg en praktische stappen om te starten.',
    articleSlugs: ['smart-grid-energy-trading', 'afbouw-salderingsregeling-2027'],
    productIds: ['homewizard-p1-meter', 'ecoflow-stream', 'marstek-venus-e3'],
  },
  {
    slug: 'veiligheid-lfp',
    title: 'Veiligheid & LFP-batterijen',
    description:
      'LFP is in 2026 de standaard voor plug & play. Lees waarom, en bekijk modellen die op LFP draaien.',
    intro:
      'Bij thuisbatterijen draait het niet alleen om prijs per kWh, maar ook om veiligheid, levensduur en betrouwbaarheid. LFP (LiFePO4) is thermisch stabieler dan veel lithium-ion varianten en daarom populair voor plug & play systemen.',
    articleSlugs: ['lithium-ion-vs-lfp-veiligheid', 'thuisbatterij-kosten-subsidie-2026'],
    productIds: ['ecoflow-stream', 'marstek-venus-a', 'zendure-solarflow-2400-ac-plus'],
  },
];

export function getInfoHubBySlug(slug: string): InfoHub | undefined {
  return infoHubs.find((h) => h.slug === slug);
}

export function resolveHubArticles(hub: InfoHub, all: Article[]) {
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  return hub.articleSlugs.map((s) => bySlug.get(s)).filter(Boolean) as Article[];
}
