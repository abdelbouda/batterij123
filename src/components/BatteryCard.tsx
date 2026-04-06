import { Star, CheckCircle2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export interface BatteryProps {
  id: string;
  name: string;
  brand: string;
  capacity: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  features: string[];
  description: string;
}

interface BatteryCardProps {
  battery: BatteryProps;
  key?: string;
}

export default function BatteryCard({ battery }: BatteryCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-xl">
      {/* Image Section */}
      <Link to={`/producten/${battery.id}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={battery.image}
          alt={battery.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 backdrop-blur-sm">
            {battery.brand}
          </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between">
          <Link to={`/producten/${battery.id}`} className="hover:underline">
            <h3 className="text-xl font-bold text-gray-900">{battery.name}</h3>
          </Link>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-bold text-gray-900">{battery.rating}</span>
            <span className="text-xs text-gray-500">({battery.reviews})</span>
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500 line-clamp-2">
          {battery.description}
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {battery.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600"
            >
              <CheckCircle2 className="h-3 w-3 text-gray-900" />
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Capaciteit</span>
            <span className="text-lg font-bold text-gray-900">{battery.capacity}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Vanaf</span>
            <span className="text-xl font-bold text-gray-900">€{battery.price}</span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Link 
            to={`/producten/${battery.id}`}
            className="flex-1 rounded-xl bg-gray-100 py-3 text-center text-sm font-bold text-gray-900 transition-colors hover:bg-gray-200"
          >
            Bekijk Details
          </Link>
          <button
            onClick={() => addToCart(battery)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white transition-opacity hover:opacity-90"
            title="In winkelwagen"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
