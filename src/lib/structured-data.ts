import { SITE_URL, SITE_NAME } from './seo';
import type { Product } from './products';
import type { Article } from '../data/articles';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description:
      'Onafhankelijke vergelijker voor plug & play thuisbatterijen in Nederland. Bespaar op uw energierekening na de afbouw van de salderingsregeling.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Energieweg 123',
      postalCode: '1000 AB',
      addressLocality: 'Amsterdam',
      addressCountry: 'NL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@batterij123.nl',
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
        urlTemplate: `${SITE_URL}/producten?q={search_term_string}`,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { '@type': 'Brand', name: product.brand || SITE_NAME },
    sku: product.stripeProductId,
    aggregateRating: product.reviews
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating || 4.7,
          reviewCount: product.reviews,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: product.paymentLinkUrl ?? `${SITE_URL}/producten/${product.id}`,
      priceCurrency: 'EUR',
      price: priceNumber || product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

export function articleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: `${SITE_URL}${article.image}`,
    datePublished: article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    mainEntityOfPage: `${SITE_URL}/educatie/${article.slug}`,
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
