import { Battery, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
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
              De onafhankelijke vergelijker voor thuisbatterijen in Nederland. Wij helpen u de beste keuze te maken voor uw energieopslag.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Navigatie</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
              <Link to="/producten" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Producten</Link>
              <Link to="/educatie" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Educatie</Link>
              <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Popular Brands */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Populaire Merken</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/producten" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Tesla Powerwall</Link>
              <Link to="/producten" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">LG Energy Solution</Link>
              <Link to="/producten" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">BYD Battery-Box</Link>
              <Link to="/producten" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Enphase IQ Battery</Link>
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
              Email: info@batterij123.nl<br />
              Tel: +31 (0)20 123 4567
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Batterij123.nl. Alle rechten voorbehouden. Gemaakt met passie voor duurzame energie.
          </p>
        </div>
      </div>
    </footer>
  );
}
