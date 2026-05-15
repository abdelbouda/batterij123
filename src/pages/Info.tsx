import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { usePageMeta } from '../lib/seo';
import { infoHubs } from '../data/info-hubs';
import { articles } from '../data/articles';
import { fetchProducts, type Product } from '../lib/products';
import JsonLd from '../components/JsonLd';
import { breadcrumbSchema } from '../lib/structured-data';

export default function Info() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  usePageMeta({
    title: 'Info & advies thuisbatterijen | Batterij123',
    description:
      'Praktische informatie over thuisbatterijen: salderingsregeling 2027, dynamische tarieven, veiligheid (LFP) en kosten. Inclusief interne links naar producten en artikelen.',
    canonicalPath: '/info',
  });

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((products) => {
        if (cancelled) return;
        const batteries = products.filter(
          (p) =>
            p.capacity &&
            p.capacity.trim().length > 0 &&
            !/p1\s*meter/i.test(p.name),
        );
        setTopProducts((batteries.length > 0 ? batteries : products).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setTopProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white py-12">
      <JsonLd
        id="breadcrumb-info"
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Info', path: '/info' },
        ])}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-400">Info</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Info & advies over thuisbatterijen
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Korte hubs met de belangrijkste uitleg + interne links naar onze productvergelijker en
            verdiepende artikelen. Zo helpt u Google (en bezoekers) sneller de juiste route te
            vinden.
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          {infoHubs.map((hub) => (
            <Link
              key={hub.slug}
              to={`/info/${hub.slug}`}
              className="rounded-3xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-md"
            >
              <h2 className="text-xl font-bold text-gray-900">{hub.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{hub.description}</p>
              <span className="mt-6 inline-block text-sm font-bold text-gray-900 underline">
                Bekijk hub
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-xl font-bold text-gray-900">Populaire producten</h2>
          <p className="mt-2 text-sm text-gray-600">
            Direct naar de productpagina’s voor vergelijking en afrekenen.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {topProducts.map((p) => (
              <Link key={p.id} to={`/producten/${p.id}`} className="font-bold text-gray-900 hover:underline">
                {p.name}
              </Link>
            ))}
            <Link to="/producten" className="font-bold text-gray-900 underline">
              Alle producten
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-900" aria-hidden="true" />
            <h2 className="text-xl font-bold text-gray-900">Laatste artikelen</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 6).map((a) => (
              <Link
                key={a.slug}
                to={`/educatie/${a.slug}`}
                className="rounded-3xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {a.category}
                </p>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{a.title}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
                <span className="mt-4 inline-block text-sm font-bold text-gray-900 underline">
                  Lees meer
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

