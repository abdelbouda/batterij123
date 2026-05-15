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
const projectRoot = path.join(__dirname, '..');

const SITE = 'https://www.batterij123.nl';

type Url = { loc: string; changefreq?: string; priority?: number; lastmod?: string };

function toDateOnly(value: Date) {
  return value.toISOString().split('T')[0];
}

function getFileLastMod(relativePath: string, fallback?: string) {
  try {
    const absolutePath = path.join(projectRoot, relativePath);
    return toDateOnly(fs.statSync(absolutePath).mtime);
  } catch {
    return fallback;
  }
}

const homeLastMod = getFileLastMod(path.join('src', 'pages', 'Home.tsx'));
const productsLastMod = getFileLastMod(path.join('products.json'), homeLastMod);
const educationLastMod = getFileLastMod(path.join('src', 'data', 'articles.ts'), homeLastMod);
const contactLastMod = getFileLastMod(path.join('src', 'pages', 'Contact.tsx'), homeLastMod);

const urls: Url[] = [
  { loc: '/', changefreq: 'weekly', priority: 1.0, lastmod: homeLastMod },
  { loc: '/producten', changefreq: 'daily', priority: 0.9, lastmod: productsLastMod },
  { loc: '/educatie', changefreq: 'weekly', priority: 0.8, lastmod: educationLastMod },
  { loc: '/contact', changefreq: 'monthly', priority: 0.7, lastmod: contactLastMod },
];

function buildUrlset(list: Url[]) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    list
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
    `\n</urlset>\n`
  );
}

function maxLastmod(list: Url[]) {
  const dates = list.map((u) => u.lastmod).filter(Boolean) as string[];
  return dates.length > 0 ? dates.sort().at(-1) : undefined;
}

function writePublic(fileName: string, contents: string) {
  const outPath = path.join(projectRoot, 'public', fileName);
  fs.writeFileSync(outPath, contents, 'utf-8');
  return outPath;
}

const articleUrls: Url[] = articles.map((a) => ({
  loc: `/educatie/${a.slug}`,
  changefreq: 'monthly',
  priority: 0.7,
  lastmod: a.dateIso || educationLastMod,
}));

const productUrls: Url[] = [];
try {
  const productsPath = path.join(projectRoot, 'products.json');
  if (fs.existsSync(productsPath)) {
    const raw = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const list: { id?: string; slug?: string }[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.products)
        ? raw.products
        : [];
    for (const p of list) {
      const slug = p.slug || p.id;
      if (!slug) continue;
      productUrls.push({
        loc: `/producten/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: productsLastMod,
      });
    }
  }
} catch {}

const pagesXml = buildUrlset(urls);
const productsXml = buildUrlset(productUrls);
const articlesXml = buildUrlset(articleUrls);

const pagesFile = 'sitemap-pages.xml';
const productsFile = 'sitemap-products.xml';
const articlesFile = 'sitemap-articles.xml';

writePublic(pagesFile, pagesXml);
writePublic(productsFile, productsXml);
writePublic(articlesFile, articlesXml);

const indexLastmod = maxLastmod([...urls, ...productUrls, ...articleUrls]) || homeLastMod;
const indexXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [
    { file: pagesFile, lastmod: maxLastmod(urls) || indexLastmod },
    { file: productsFile, lastmod: maxLastmod(productUrls) || indexLastmod },
    { file: articlesFile, lastmod: maxLastmod(articleUrls) || indexLastmod },
  ]
    .map(
      (s) =>
        `  <sitemap>\n` +
        `    <loc>${SITE}/${s.file}</loc>\n` +
        (s.lastmod ? `    <lastmod>${s.lastmod}</lastmod>\n` : '') +
        `  </sitemap>`,
    )
    .join('\n') +
  `\n</sitemapindex>\n`;

const indexPath = writePublic('sitemap-index.xml', indexXml);
const legacyPath = writePublic(
  'sitemap.xml',
  buildUrlset([...urls, ...productUrls, ...articleUrls]),
);

console.log(
  `[sitemap] index + ${urls.length + productUrls.length + articleUrls.length} URLs geschreven naar ${indexPath} (en ${legacyPath} als legacy urlset)`,
);
