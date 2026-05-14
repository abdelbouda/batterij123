import { Star, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../lib/products';

export type BatteryProps = Product;

interface BatteryCardProps {
  battery: Product;
  key?: string;
}

/**
 * Toon alleen de korte productnaam in de kaart: alles vanaf de eerste em-dash
 * (`—`), en-dash (`–`) of " - " separator wordt afgekapt. "Wi-Fi" en
 * "AC-Pro" blijven intact omdat daar geen spaties omheen staan.
 */
function shortName(name: string): string {
  return name.split(/\s+[\u2013\u2014]\s+|\s+-\s+/)[0].trim();
}

export default function BatteryCard({ battery }: BatteryCardProps) {
  const { addToCart } = useCart();
  const displayName = shortName(battery.name);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-xl">
      {/* Image Section */}
      <Link to={`/producten/${battery.id}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={battery.image}
          alt={`${displayName} thuisbatterij — ${battery.brand}`}
          width="600"
          height="450"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 backdrop-blur-sm">
            {battery.brand}
          </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link to={`/producten/${battery.id}`} className="hover:underline">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
              {displayName}
            </h3>
          </Link>
          <div className="flex shrink-0 items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" aria-hidden="true" />
            <span className="text-sm font-bold text-gray-900">{battery.rating}</span>
            <span className="text-xs text-gray-500">({battery.reviews})</span>
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {battery.description}
        </p>

        {battery.features.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {battery.features.slice(0, 3).map((feature, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600"
              >
                <CheckCircle2 className="h-3 w-3 text-gray-900" aria-hidden="true" />
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        {/*
          Onderkant van de kaart staat altijd op gelijke hoogte dankzij `mt-auto`
          op de hele actie-strook (CTA-knoppen + prijs/specs-row).
        */}
        <div className="mt-auto">
          <div className="flex gap-2">
            <Link
              to={`/producten/${battery.id}`}
              className="flex-1 rounded-xl bg-gray-100 py-3 text-center text-sm font-bold text-gray-900 transition-colors hover:bg-gray-200"
            >
              Bekijk Details
            </Link>
            <button
              type="button"
              onClick={() => addToCart(battery)}
              aria-label={`${displayName} aan winkelwagen toevoegen`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white transition-opacity hover:opacity-90"
              title="In winkelwagen"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            {battery.capacity ? (
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Capaciteit</span>
                <span className="text-lg font-bold text-gray-900">{battery.capacity}</span>
              </div>
            ) : <div />}
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Vanaf</span>
              <span className="text-xl font-bold text-gray-900">€{battery.price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
