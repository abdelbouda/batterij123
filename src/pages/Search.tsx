import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import { BookOpen, Package, Search as SearchIcon } from 'lucide-react';
import BatteryCard from '../components/BatteryCard';
import { fetchProducts, type Product } from '../lib/products';
import { articles } from '../data/articles';
import { usePageMeta } from '../lib/seo';

export default function SearchResults() {
  const [params] = useSearchParams();
  const rawQuery = params.get('q') ?? '';
  const query = rawQuery.trim();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: query
      ? `Zoekresultaten voor "${query}" | Batterij123`
      : 'Zoeken | Batterij123',
    description: query
      ? `Zoekresultaten voor "${query}" op Batterij123: thuisbatterijen, merken en kennisbank-artikelen.`
      : 'Zoek in onze catalogus en kennisbank van thuisbatterijen, plug & play oplossingen en salderingsregeling-uitleg.',
    canonicalPath: query ? `/zoeken?q=${encodeURIComponent(query)}` : '/zoeken',
  });

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error('Failed to load products for search', err))
      .finally(() => setLoading(false));
  }, []);

  const productFuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ['name', 'brand', 'description', 'features', 'capacity'],
        threshold: 0.4,
      }),
    [products],
  );

  const articleFuse = useMemo(
    () =>
      new Fuse(articles, {
        keys: ['title', 'excerpt', 'intro', 'category', 'sections.heading'],
        threshold: 0.4,
      }),
    [],
  );

  const productHits = useMemo(() => {
    if (!query) return [];
    return productFuse.search(query).map((r) => r.item);
  }, [query, productFuse]);

  const articleHits = useMemo(() => {
    if (!query) return [];
    return articleFuse.search(query).map((r) => r.item);
  }, [query, articleFuse]);

  const totalHits = productHits.length + articleHits.length;

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Zoekresultaten
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {query ? (
              <>
                Resultaten voor <span className="text-gray-500">"{query}"</span>
              </>
            ) : (
              'Wat zoekt u?'
            )}
          </h1>
          {query && (
            <p className="mt-2 text-sm text-gray-500">
              {loading
                ? 'Bezig met zoeken…'
                : `${totalHits} ${totalHits === 1 ? 'resultaat' : 'resultaten'} gevonden (${productHits.length} ${
                    productHits.length === 1 ? 'product' : 'producten'
                  }, ${articleHits.length} ${articleHits.length === 1 ? 'artikel' : 'artikelen'})`}
            </p>
          )}
        </header>

        {!query && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <SearchIcon
              aria-hidden="true"
              className="mx-auto h-10 w-10 text-gray-400"
            />
            <p className="mt-4 text-gray-500">
              Typ een zoekterm in de balk hierboven om te zoeken in producten en de
              kennisbank.
            </p>
          </div>
        )}

        {query && !loading && totalHits === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <SearchIcon
              aria-hidden="true"
              className="mx-auto h-10 w-10 text-gray-400"
            />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Geen resultaten gevonden
            </h2>
            <p className="mt-2 text-gray-500">
              We konden niets vinden voor "{query}". Probeer een andere zoekterm of bekijk{' '}
              <Link to="/producten" className="font-bold text-gray-900 underline">
                alle producten
              </Link>{' '}
              of de{' '}
              <Link to="/educatie" className="font-bold text-gray-900 underline">
                kennisbank
              </Link>
              .
            </p>
          </div>
        )}

        {productHits.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center gap-2">
              <Package aria-hidden="true" className="h-5 w-5 text-gray-900" />
              <h2 className="text-xl font-bold text-gray-900">Producten</h2>
              <span className="text-sm text-gray-400">({productHits.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productHits.map((p) => (
                <BatteryCard key={p.id} battery={p} />
              ))}
            </div>
          </section>
        )}

        {articleHits.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-2">
              <BookOpen aria-hidden="true" className="h-5 w-5 text-gray-900" />
              <h2 className="text-xl font-bold text-gray-900">Artikelen</h2>
              <span className="text-sm text-gray-400">({articleHits.length})</span>
            </div>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articleHits.map((a) => (
                <li
                  key={a.slug}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <Link to={`/educatie/${a.slug}`} className="block">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {a.category}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-gray-900 line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                      {a.excerpt}
                    </p>
                    <span className="mt-4 inline-block text-sm font-bold text-gray-900 underline">
                      Lees meer
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
