import { Battery, Menu, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Producten', path: '/producten' },
    { name: 'Educatie', path: '/educatie' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Battery className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Batterij<span className="text-gray-500">123</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-gray-900",
                location.pathname === item.path ? "text-gray-900" : "text-gray-500"
              )}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-colors hover:bg-gray-200"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
          <Link
            to="/contact"
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Offerte aanvragen
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-900"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="border-b border-gray-200 bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-medium transition-colors",
                  location.pathname === item.path ? "text-gray-900" : "text-gray-500"
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="mt-2 w-full rounded-lg bg-gray-900 py-3 text-center text-sm font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              Offerte aanvragen
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
