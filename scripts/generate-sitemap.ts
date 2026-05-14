/**
 * Genereert `public/sitemap.xml` voor batterij123.nl.
 *
 * Bevat alle statische routes + dynamische routes uit `src/data/articles.ts`
 * en `products.json` (gegenereerd door `sync-stripe-top10.ts`).
 *
 * Gebruik: `tsx scripts/generate-sitemap.ts` — wordt automatisch aangeroepen
 * via `npm run build` (`prebuild` hook).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { articles } from '../src/data/articles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE = 'https://www.batterij123.nl';
const today = new Date().toISOString().split('T')[0];

type Url = { loc: string; changefreq?: string; priority?: number; lastmod?: string };

const urls: Url[] = [
  { loc: '/', changefreq: 'weekly', priority: 1.0, lastmod: today },
  { loc: '/producten', changefreq: 'daily', priority: 0.9, lastmod: today },
  { loc: '/educatie', changefreq: 'weekly', priority: 0.8, lastmod: today },
  { loc: '/contact', changefreq: 'monthly', priority: 0.7, lastmod: today },
];

// Articles
for (const a of articles) {
  urls.push({
    loc: `/educatie/${a.slug}`,
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: today,
  });
}

// Stripe products from generated JSON
try {
  const productsPath = path.join(__dirname, '..', 'products.json');
  if (fs.existsSync(productsPath)) {
    const raw = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const list: { id?: string; slug?: string }[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.products)
        ? raw.products
        : [];
    for (const p of list) {
      const slug = p.slug || p.id;
      if (slug) {
        urls.push({
          loc: `/producten/${slug}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: today,
        });
      }
    }
  }
} catch (err) {
  console.warn('[sitemap] kon producten niet uit products.json lezen:', err);
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${SITE}${u.loc}</loc>\n` +
        (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
        (u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>\n` : '') +
        (u.priority !== undefined ? `    <priority>${u.priority.toFixed(1)}</priority>\n` : '') +
        `  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`[sitemap] ${urls.length} URLs geschreven naar ${outPath}`);
