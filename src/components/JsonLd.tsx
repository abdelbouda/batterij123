import { useEffect } from 'react';

/**
 * Injecteert een <script type="application/ld+json"> blok in <head>.
 * Identifier zorgt dat we hetzelfde blok kunnen updaten in plaats van
 * dupliceren bij re-renders / SPA-navigatie.
 */
export default function JsonLd({ id, data }: { id: string; data: object | object[] }) {
  useEffect(() => {
    const attrId = `jsonld-${id}`;
    let el = document.getElementById(attrId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = attrId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      // We laten de tag staan bij unmount; volgende pagina overschrijft of vervangt.
    };
  }, [id, data]);
  return null;
}
