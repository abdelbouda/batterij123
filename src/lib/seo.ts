import { useEffect } from 'react';

/**
 * SEO helper: zet pagina-specifieke <title>, <meta name="description"> en
 * <link rel="canonical"> bij mount. Werkt client-side; Google indexeert
 * deze tags ook na render.
 */
export const SITE_URL = 'https://www.batterij123.nl';
export const SITE_NAME = 'Batterij123';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface PageMeta {
  title: string;
  description: string;
  /** Path-only canonical, bv. "/producten". Wordt automatisch geprefixed. */
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
}

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const canonical = meta.canonicalPath
      ? `${SITE_URL}${meta.canonicalPath.startsWith('/') ? meta.canonicalPath : `/${meta.canonicalPath}`}`
      : SITE_URL;
    const ogImage = meta.ogImage ?? DEFAULT_OG_IMAGE;
    const ogType = meta.ogType ?? 'website';

    document.title = meta.title;
    setMetaTag('description', meta.description);
    setLinkTag('canonical', canonical);

    setMetaTag('og:title', meta.title, 'property');
    setMetaTag('og:description', meta.description, 'property');
    setMetaTag('og:url', canonical, 'property');
    setMetaTag('og:image', ogImage, 'property');
    setMetaTag('og:type', ogType, 'property');
    setMetaTag('og:site_name', SITE_NAME, 'property');
    setMetaTag('og:locale', 'nl_NL', 'property');

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', meta.title);
    setMetaTag('twitter:description', meta.description);
    setMetaTag('twitter:image', ogImage);
  }, [meta.title, meta.description, meta.canonicalPath, meta.ogImage, meta.ogType]);
}
