import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import BatteryCard from '../components/BatteryCard';
import JsonLd from '../components/JsonLd';
import { fetchProducts, type Product } from '../lib/products';
import { usePageMeta } from '../lib/seo';
import { breadcrumbSchema, productListSchema } from '../lib/structured-data';

type SortKey =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'capacity-desc';

const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'Aanbevolen',
  'price-asc': 'Prijs: laag → hoog',
  'price-desc': 'Prijs: hoog → laag',
  'rating-desc': 'Hoogste rating',
  'capacity-desc': 'Grootste capaciteit',
};

/**
 * Parseert "5,12 kWh", "2.7 kWh", "5 kWh" naar een numerieke kWh-waarde voor
 * sortering en filtering. Retourneert 0 als er geen kWh-getal in zit.
 */
function parseCapacityKwh(capacity: string | null | undefined): number {
  if (!capacity) return 0;
  const match = capacity.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*kWh/i);
  return match ? parseFloat(match[1]) : 0;
}

export default function Products() {
  const [batteries, setBatteries] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [capacityRange, setCapacityRange] = useState<[number, number] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('recommended');

  const sortRef = useRef<HTMLDivElement>(null);

  usePageMeta({
    title: 'Thuisbatterijen vergelijken | Top-10 plug & play 2026 | Batterij123',
    description:
      'Vergelijk de top-10 plug & play thuisbatterijen voor 2026: Marstek, HomeWizard, Zendure, EcoFlow, Anker, Sessy en meer. Live prijzen, reviews en directe checkout via Stripe.',
    canonicalPath: '/producten',
  });

  useEffect(() => {
    fetchProducts()
      .then(setBatteries)
      .catch((err) => console.error('Failed to load products', err))
      .finally(() => setLoading(false));
  }, []);

  // Dropdown buiten-klik sluiten
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const brands = useMemo(
    () => Array.from(new Set(batteries.map((b) => b.brand))).sort(),
    [batteries],
  );

  const priceBounds = useMemo<[number, number]>(() => {
    if (batteries.length === 0) return [0, 0];
    const prices = batteries.map((b) => b.priceEur);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [batteries]);

  const capacityBounds = useMemo<[number, number]>(() => {
    if (batteries.length === 0) return [0, 0];
    const caps = batteries.map((b) => parseCapacityKwh(b.capacity));
    return [Math.floor(Math.min(...caps)), Math.ceil(Math.max(...caps))];
  }, [batteries]);

  const filtered = useMemo(() => {
    let list = batteries;
    if (selectedBrands.length > 0) {
      list = list.filter((b) => selectedBrands.includes(b.brand));
    }
    if (minRating > 0) {
      list = list.filter((b) => b.rating >= minRating);
    }
    if (priceRange) {
      list = list.filter(
        (b) => b.priceEur >= priceRange[0] && b.priceEur <= priceRange[1],
      );
    }
    if (capacityRange) {
      list = list.filter((b) => {
        const c = parseCapacityKwh(b.capacity);
        // Producten zonder kWh-capaciteit (bv. P1 Meter) verbergen we als er een
        // capaciteitsfilter actief is.
        if (c === 0) return false;
        return c >= capacityRange[0] && c <= capacityRange[1];
      });
    }
    const sorted = [...list];
    switch (sortKey) {
      case 'price-asc':
        sorted.sort((a, b) => a.priceEur - b.priceEur);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.priceEur - a.priceEur);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'capacity-desc':
        sorted.sort(
          (a, b) => parseCapacityKwh(b.capacity) - parseCapacityKwh(a.capacity),
        );
        break;
      default:
        break;
    }
    return sorted;
  }, [batteries, selectedBrands, minRating, priceRange, capacityRange, sortKey]);

  const activeFilterCount =
    selectedBrands.length +
    (minRating > 0 ? 1 : 0) +
    (priceRange ? 1 : 0) +
    (capacityRange ? 1 : 0);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  }

  function resetFilters() {
    setSelectedBrands([]);
    setMinRating(0);
    setPriceRange(null);
    setCapacityRange(null);
  }

  if (loading) return <div className="flex justify-center py-24">Producten laden...</div>;

  const listData = batteries.length > 0 ? productListSchema(batteries) : null;

  return (
    <div className="bg-white py-12">
      <JsonLd
        id="breadcrumb-producten"
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Producten', path: '/producten' },
        ])}
      />
      {listData && <JsonLd id="products-list" data={listData} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Vergelijk Thuisbatterijen
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Vind de perfecte batterij voor uw energiebehoeften. Filter op merk,
              capaciteit of prijs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="products-filters-panel"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>Sorteer: {SORT_LABELS[sortKey]}</span>
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.ul
                    role="listbox"
                    aria-label="Sorteervolgorde"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-xl"
                  >
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                      <li key={key}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={sortKey === key}
                          onClick={() => {
                            setSortKey(key);
                            setSortOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-gray-50 ${
                            sortKey === key ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {SORT_LABELS[key]}
                          {sortKey === key && (
                            <span aria-hidden="true" className="text-gray-900">
                              •
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.section
              id="products-filters-panel"
              aria-label="Filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
            >
              <div className="grid gap-8 p-6 md:grid-cols-2 lg:grid-cols-4">
                <fieldset>
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Merk
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => {
                      const active = selectedBrands.includes(brand);
                      return (
                        <button
                          key={brand}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleBrand(brand)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                            active
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Min. rating
                  </legend>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      aria-label="Minimale rating"
                      className="w-full accent-gray-900"
                    />
                    <output className="w-12 text-sm font-bold text-gray-900">
                      {minRating > 0 ? minRating.toFixed(1) : '—'}
                    </output>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Prijs (€)
                  </legend>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange ? priceRange[0] : priceBounds[0]}
                      onChange={(e) =>
                        setPriceRange([
                          Number(e.target.value),
                          priceRange ? priceRange[1] : priceBounds[1],
                        ])
                      }
                      aria-label="Minimale prijs"
                      className="w-24 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange ? priceRange[1] : priceBounds[1]}
                      onChange={(e) =>
                        setPriceRange([
                          priceRange ? priceRange[0] : priceBounds[0],
                          Number(e.target.value),
                        ])
                      }
                      aria-label="Maximale prijs"
                      className="w-24 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Capaciteit (kWh)
                  </legend>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.1}
                      min={capacityBounds[0]}
                      max={capacityBounds[1]}
                      value={capacityRange ? capacityRange[0] : capacityBounds[0]}
                      onChange={(e) =>
                        setCapacityRange([
                          Number(e.target.value),
                          capacityRange ? capacityRange[1] : capacityBounds[1],
                        ])
                      }
                      aria-label="Minimale capaciteit"
                      className="w-24 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                    <span className="text-gray-400">–</span>
                    <input
                      type="number"
                      step={0.1}
                      min={capacityBounds[0]}
                      max={capacityBounds[1]}
                      value={capacityRange ? capacityRange[1] : capacityBounds[1]}
                      onChange={(e) =>
                        setCapacityRange([
                          capacityRange ? capacityRange[0] : capacityBounds[0],
                          Number(e.target.value),
                        ])
                      }
                      aria-label="Maximale capaciteit"
                      className="w-24 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </fieldset>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
                <p className="text-sm text-gray-500">
                  {filtered.length} {filtered.length === 1 ? 'product' : 'producten'} gevonden
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-bold text-gray-500 hover:text-gray-900"
                  >
                    Filters wissen
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                  >
                    Toepassen
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((battery) => (
              <BatteryCard key={battery.id} battery={battery} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Search aria-hidden="true" className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Geen resultaten</h3>
            <p className="mt-2 text-gray-500">
              Geen producten voldoen aan uw filters. Pas de criteria aan of wis de filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-gray-900 underline"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Filters wissen
            </button>
          </div>
        )}

        <div className="mt-24 rounded-3xl bg-gray-50 p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Hulp nodig bij uw keuze?
            </h2>
            <p className="mt-4 text-gray-500">
              Onze experts hebben een uitgebreide vergelijkingstabel samengesteld met meer dan 50
              verschillende modellen. Vraag direct een vrijblijvende offerte aan via WhatsApp of e-mail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
