import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Globale zoekbalk in de header. Op submit (Enter / klik op icoon)
 * navigeert naar /zoeken?q=<query>. Op de /zoeken pagina blijft de
 * input automatisch gesynchroniseerd met de URL via useSearchParams.
 */
export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

  function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/zoeken?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className={
        compact
          ? 'relative w-full'
          : 'relative w-full max-w-md'
      }
    >
      <label htmlFor="global-search" className="sr-only">
        Zoek op product, merk of artikel
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      />
      <input
        id="global-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Zoek thuisbatterij, merk of artikel…"
        aria-label="Zoek op product, merk of artikel"
        className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Zoekopdracht wissen"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
