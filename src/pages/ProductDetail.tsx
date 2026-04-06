import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Battery, CheckCircle2, ArrowLeft, Star, Zap, Shield, Clock, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [battery, setBattery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBattery({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `products/${id}`);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
                alt={battery.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
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

            <p className="mt-8 text-lg leading-relaxed text-gray-500">
              {battery.description} De {battery.name} is ontworpen om uw energie-onafhankelijkheid te maximaliseren. Met een bruikbare capaciteit van {battery.capacity} biedt dit systeem voldoende opslag voor een gemiddeld Nederlands huishouden om de avond en nacht door te komen op eigen zonne-energie.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-6 border-y border-gray-100 py-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-900">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Capaciteit</p>
                  <p className="font-bold text-gray-900">{battery.capacity}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-900">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Garantie</p>
                  <p className="font-bold text-gray-900">10 Jaar</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
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

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <button 
                onClick={() => addToCart(battery)}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gray-900 py-4 text-center text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="h-5 w-5" />
                In winkelwagen
              </button>
              <button className="flex-1 rounded-full border border-gray-200 bg-white py-4 text-center text-base font-bold text-gray-900 transition-colors hover:bg-gray-50">
                Download Datasheet
              </button>
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
