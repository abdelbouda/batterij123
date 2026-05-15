import { SITE_URL, SITE_NAME } from './seo';
import type { Product } from './products';
import type { Article } from '../data/articles';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    description:
      'Onafhankelijke vergelijker voor plug & play thuisbatterijen in Nederland. Bespaar op uw energierekening na de afbouw van de salderingsregeling.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Amsterdam',
      addressCountry: 'NL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@batterij123.nl',
      telephone: '+31642008944',
      contactType: 'customer service',
      availableLanguage: ['Dutch', 'English'],
    },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'nl-NL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/zoeken?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top thuisbatterijen 2026',
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${SITE_URL}/producten/${p.id}`,
      name: p.name,
    })),
  };
}

export function productSchema(product: Product) {
  const priceNumber = product.priceEur || Number(String(product.price).replace(/[^0-9.]/g, ''));
  const url = `${SITE_URL}/producten/${product.id}`;
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { '@type': 'Brand', name: product.brand || SITE_NAME },
    sku: product.stripeProductId,
    url,
    aggregateRating: product.reviews
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating || 4.7,
          reviewCount: product.reviews,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'EUR',
      price: priceNumber || product.price,
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

export function articleSchema(article: Article) {
  const url = `${SITE_URL}/educatie/${article.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt,
    image: `${SITE_URL}${article.image}`,
    datePublished: article.dateIso ?? article.date,
    dateModified: article.dateIso ?? article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    inLanguage: 'nl-NL',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
