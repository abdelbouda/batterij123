import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getInfoHubBySlug, resolveHubArticles } from '../data/info-hubs';
import { articles } from '../data/articles';
import { fetchProducts, type Product } from '../lib/products';
import { usePageMeta } from '../lib/seo';
import JsonLd from '../components/JsonLd';
import { breadcrumbSchema } from '../lib/structured-data';

export default function InfoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const hub = slug ? getInfoHubBySlug(slug) : undefined;
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hubArticles = useMemo(() => (hub ? resolveHubArticles(hub, articles) : []), [hub]);
  const hubProducts = useMemo(() => {
    if (!hub || products.length === 0) return [];
    const byId = new Map(products.map((p) => [p.id, p]));
    return hub.productIds.map((id) => byId.get(id)).filter(Boolean) as Product[];
  }, [hub, products]);

  usePageMeta({
    title: hub ? `${hub.title} | Info | Batterij123` : 'Info | Batterij123',
    description: hub ? hub.description : 'Informatie over thuisbatterijen op Batterij123.',
    canonicalPath: hub ? `/info/${hub.slug}` : '/info',
    ogType: 'article',
  });

  if (!hub) {
    return (
      <div className="bg-white py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Pagina niet gevonden</h1>
          <p className="mt-4 text-gray-600">Deze Info-pagina bestaat niet (meer).</p>
          <Link to="/info" className="mt-8 inline-flex items-center gap-2 font-bold text-gray-900 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Terug naar Info
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      <JsonLd
        id={`breadcrumb-info-${hub.slug}`}
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Info', path: '/info' },
          { name: hub.title, path: `/info/${hub.slug}` },
        ])}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link to="/info" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Terug naar Info
        </Link>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{hub.title}</h1>
        <p className="mt-4 text-lg text-gray-600">{hub.intro}</p>

        {hubProducts.length > 0 && (
          <section className="mt-12 rounded-3xl border border-gray-200 bg-gray-50 p-8">
            <h2 className="text-xl font-bold text-gray-900">Aanbevolen producten</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ga direct naar de productdetailpagina’s voor specificaties en afrekenen.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {hubProducts.map((p) => (
                <Link key={p.id} to={`/producten/${p.id}`} className="font-bold text-gray-900 hover:underline">
                  {p.name}
                </Link>
              ))}
              <Link to="/producten" className="font-bold text-gray-900 underline">
                Alle producten
              </Link>
            </div>
          </section>
        )}

        {hubArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Aanbevolen artikelen</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {hubArticles.map((a) => (
                <Link
                  key={a.slug}
                  to={`/educatie/${a.slug}`}
                  className="rounded-3xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{a.category}</p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900">{a.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
                  <span className="mt-4 inline-block text-sm font-bold text-gray-900 underline">
                    Lees artikel
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

