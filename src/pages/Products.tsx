import { useState, useMemo, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import BatteryCard from '../components/BatteryCard';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import Fuse from 'fuse.js';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [batteries, setBatteries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBatteries(productsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fuse = useMemo(() => new Fuse(batteries, {
    keys: ['name', 'brand', 'description'],
    threshold: 0.4,
    includeMatches: true
  }), [batteries]);

  const filteredBatteries = useMemo(() => {
    if (!searchQuery) return batteries;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, batteries]);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return fuse.search(searchQuery).slice(0, 5).map(result => result.item);
  }, [searchQuery, fuse]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <div className="flex justify-center py-24">Producten laden...</div>;

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Vergelijk Thuisbatterijen</h1>
            <p className="mt-4 text-lg text-gray-500">
              Vind de perfecte batterij voor uw energiebehoeften. Filter op merk, capaciteit of prijs.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[240px]" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Zoek op model of merk..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
                  >
                    <div className="p-2">
                      {suggestions.map((item) => (
                        <Link
                          key={item.id}
                          to={`/producten/${item.id}`}
                          className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.brand}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sorteer</span>
            </button>
          </div>
        </div>

        {filteredBatteries.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBatteries.map((battery) => (
              <BatteryCard key={battery.id} battery={battery} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Geen resultaten gevonden</h3>
            <p className="mt-2 text-gray-500">Probeer een andere zoekterm of wis uw filters.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 text-sm font-bold text-gray-900 underline"
            >
              Wis zoekopdracht
            </button>
          </div>
        )}
        
        {/* Comparison Table Teaser */}
        <div className="mt-24 rounded-3xl bg-gray-50 p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Hulp nodig bij uw keuze?</h2>
            <p className="mt-4 text-gray-500">
              Onze experts hebben een uitgebreide vergelijkingstabel samengesteld met meer dan 50 verschillende modellen. Download de gids of vraag direct een vrijblijvende offerte aan.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-gray-900 px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90">
                Offerte aanvragen
              </button>
              <button className="rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-900 transition-colors hover:bg-gray-50">
                Download Keuzegids
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
