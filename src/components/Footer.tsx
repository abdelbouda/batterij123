import { Battery, Mail, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProducts, type Product } from '../lib/products';

const EMAIL_ADDRESS = 'info@batterij123.nl';
const PHONE_DISPLAY = '06-42008944';
const PHONE_URL = 'tel:+31642008944';
const WHATSAPP_URL = `https://wa.me/31642008944?text=${encodeURIComponent(
  'Hoi! Ik heb een vraag over een thuisbatterij van Batterij123.',
)}`;

export default function Footer() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((products) => {
        if (cancelled) return;
        // Show 5 home batteries (exclude accessories like the P1 Meter);
        // fall back to all products if metadata is missing.
        const batteries = products.filter(
          (p) =>
            p.capacity &&
            p.capacity.trim().length > 0 &&
            !/p1\s*meter/i.test(p.name),
        );
        const list = (batteries.length >= 5 ? batteries : products).slice(0, 5);
        setTopProducts(list);
      })
      .catch(() => {
        if (!cancelled) setTopProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                <Battery className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Batterij<span className="text-gray-500">123</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              De onafhankelijke vergelijker voor thuisbatterijen in Nederland. Wij helpen u de
              beste keuze te maken voor uw energieopslag.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(
                  'Vraag over een thuisbatterij',
                )}`}
                aria-label={`Stuur een e-mail naar ${EMAIL_ADDRESS}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                E-mail
              </a>
              <a
                href={PHONE_URL}
                aria-label={`Bel ${PHONE_DISPLAY}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Bel ons
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open WhatsApp chat"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Navigatie</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link
                to="/producten"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Producten
              </Link>
              <Link
                to="/educatie"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Educatie
              </Link>
              <Link
                to="/contact"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          {/* Top Home Batteries (live from Stripe) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Populaire thuisbatterijen
            </h3>
            <nav className="flex flex-col gap-2">
              {topProducts.length === 0 ? (
                <span className="text-sm text-gray-400">Laden...</span>
              ) : (
                topProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/producten/${p.id}`}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {p.name}
                  </Link>
                ))
              )}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Contact</h3>
            <p className="text-sm text-gray-500">
              Batterij123 B.V.<br />
              Energieweg 123<br />
              1000 AB Amsterdam<br />
              Nederland
            </p>
            <p className="text-sm text-gray-500">
              Email:{' '}
              <a href={`mailto:${EMAIL_ADDRESS}`} className="hover:text-gray-900">
                {EMAIL_ADDRESS}
              </a>
              <br />
              Tel:{' '}
              <a href={PHONE_URL} className="hover:text-gray-900">
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Batterij123.nl. Alle rechten voorbehouden. Gemaakt
            met passie voor duurzame energie.
          </p>
        </div>
      </div>
    </footer>
  );
}
