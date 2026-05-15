import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowLeft, Star, Zap, Shield, ShoppingCart, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import JsonLd from '../components/JsonLd';
import { fetchProducts, type Product } from '../lib/products';
import { usePageMeta } from '../lib/seo';
import { breadcrumbSchema, productSchema } from '../lib/structured-data';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [battery, setBattery] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleDirectCheckout = async () => {
    if (!battery) return;
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: battery.id,
              name: battery.name,
              priceEur: battery.priceEur,
              image: battery.image,
              quantity: 1,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij het aanmaken van de Stripe sessie.");
      }

      const session = await response.json();
      if (!session.url) {
        throw new Error("Stripe checkout URL ontbreekt in de response.");
      }
      window.location.assign(session.url);
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Er is een fout opgetreden tijdens het afrekenen.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchProducts()
      .then((products) => {
        const match = products.find((p) => p.id === id);
        setBattery(match ?? null);
      })
      .catch((err) => console.error('Failed to load product', err))
      .finally(() => setLoading(false));
  }, [id]);

  usePageMeta({
    title: battery
      ? `${battery.name} kopen | €${battery.price} | Batterij123`
      : 'Product | Batterij123',
    description: battery
      ? `${battery.name} — ${battery.capacity || 'plug & play'} thuisbatterij van ${battery.brand}. ${battery.description.slice(0, 110)}… Direct afrekenen via Stripe.`
      : 'Bekijk de details van deze thuisbatterij op Batterij123.',
    canonicalPath: id ? `/producten/${id}` : '/producten',
    ogImage: battery?.image,
    ogType: 'product',
  });

  if (loading) return <div className="flex justify-center py-24">Product laden...</div>;

  if (!battery) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product niet gevonden</h1>
        <p className="mt-2 text-gray-500">De opgevraagde thuisbatterij bestaat niet of is niet langer beschikbaar.</p>
        <Link to="/producten" className="mt-6 rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white">
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-24">
      <JsonLd id={`product-${battery.id}`} data={productSchema(battery)} />
      <JsonLd
        id={`breadcrumb-product-${battery.id}`}
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Producten', path: '/producten' },
          { name: battery.name, path: `/producten/${battery.id}` },
        ])}
      />
      {/* Breadcrumbs & Back Button */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link to="/producten" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Terug naar alle batterijen
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Image Gallery Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100 shadow-sm">
              <img
                src={battery.image}
                alt={`${battery.name} thuisbatterij van ${battery.brand}`}
                width="1200"
                height="900"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>{battery.brand}</span>
              <span>•</span>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                <span>{battery.rating} ({battery.reviews} reviews)</span>
              </div>
            </div>
            
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">{battery.name}</h1>
            
            <div className="mt-8 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">€{battery.price}</span>
              <span className="text-sm text-gray-500">Inclusief BTW & standaard installatie</span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-gray-500 line-clamp-3 sm:line-clamp-none">
              {battery.description}
            </p>

            {/* CTA-knoppen direct boven de specs-border zodat ze in beeld staan zonder te scrollen. */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleDirectCheckout}
                disabled={isCheckingOut}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gray-900 py-4 text-center text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                )}
                {isCheckingOut ? 'Bezig...' : 'Direct afrekenen'}
              </button>
              <button
                type="button"
                onClick={() => addToCart(battery)}
                aria-label={`${battery.name} aan winkelwagen toevoegen`}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-4 text-center text-base font-bold text-gray-900 transition-colors hover:bg-gray-50"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                In winkelwagen
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 border-y border-gray-100 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-900">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Capaciteit</p>
                  <p className="font-bold text-gray-900">{battery.capacity}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-900">
                  <Shield className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Garantie</p>
                  <p className="font-bold text-gray-900">10 Jaar</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Belangrijkste kenmerken</h3>
              <ul className="mt-6 space-y-4">
                {battery.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="h-5 w-5 text-gray-900" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Detailed Specs Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-gray-900">Technische Specificaties</h2>
          <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Nominale Capaciteit', battery.capacity],
                  ['Bruikbare Capaciteit', battery.capacity],
                  ['Max. Ontlaadvermogen', '5.0 kW'],
                  ['Piekvermogen (10s)', '7.0 kW'],
                  ['Rendement (Round-trip)', '90%'],
                  ['Bedrijfstemperatuur', '-20°C tot 50°C'],
                  ['Afmetingen (H x B x D)', '1150 x 753 x 147 mm'],
                  ['Gewicht', '114 kg'],
                  ['Beschermingsklasse', 'IP65 (Buitenmontage mogelijk)'],
                ].map(([label, value], idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 font-medium text-gray-500">{label}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
