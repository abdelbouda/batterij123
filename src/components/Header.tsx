import { Battery, Menu, X, ShoppingCart, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import WhatsAppIcon from './WhatsAppIcon';
import SearchBar from './SearchBar';

// Contactnummer voor WhatsApp CTA — internationaal formaat zonder + voor wa.me.
const WHATSAPP_NUMBER = '31642008944';
const WHATSAPP_DISPLAY = '06-42008944';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hoi! Ik heb een vraag over een thuisbatterij van Batterij123.',
)}`;

const EMAIL_ADDRESS = 'info@batterij123.nl';
const EMAIL_URL = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(
  'Vraag over een thuisbatterij',
)}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Producten', path: '/producten' },
    { name: 'Educatie', path: '/educatie' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Battery className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Batterij<span className="text-gray-600">123</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-gray-900",
                location.pathname === item.path ? "text-gray-900" : "text-gray-600"
              )}
            >
              {item.name}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Winkelwagen openen (${totalItems} ${totalItems === 1 ? 'product' : 'producten'})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-colors hover:bg-gray-200"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalItems > 0 && (
              <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Stuur een WhatsApp naar ${WHATSAPP_DISPLAY}`}
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={EMAIL_URL}
            aria-label={`Stuur een e-mail naar ${EMAIL_ADDRESS}`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">{EMAIL_ADDRESS}</span>
            <span className="lg:hidden">Mail</span>
          </a>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Winkelwagen openen (${totalItems} ${totalItems === 1 ? 'product' : 'producten'})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalItems > 0 && (
              <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md"
            aria-label={isOpen ? 'Menu sluiten' : 'Menu openen'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Globale zoekbalk — tweede rij, zichtbaar op alle viewports. */}
      <div className="border-t border-gray-100 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <SearchBar compact />
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div id="mobile-nav" className="border-b border-gray-200 bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-medium transition-colors",
                  location.pathname === item.path ? "text-gray-900" : "text-gray-600"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Stuur een WhatsApp naar ${WHATSAPP_DISPLAY}`}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-3 text-center text-sm font-bold text-white"
              onClick={() => setIsOpen(false)}
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={EMAIL_URL}
              aria-label={`Stuur een e-mail naar ${EMAIL_ADDRESS}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 text-center text-sm font-bold text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {EMAIL_ADDRESS}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
