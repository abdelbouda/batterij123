import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import { CartProvider, useCart } from './context/CartContext';

// Code-split routes: alleen Home staat in de hoofd-bundel zodat de eerste
// paint zo licht mogelijk is. Andere routes laden on-demand.
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Info = lazy(() => import('./pages/Info'));
const InfoDetail = lazy(() => import('./pages/InfoDetail'));
const Education = lazy(() => import('./pages/Education'));
const EducationDetail = lazy(() => import('./pages/EducationDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Success = lazy(() => import('./pages/Success'));
const SearchResults = lazy(() => import('./pages/Search'));
const LazyCartDrawer = lazy(() => import('./components/CartDrawer'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span className="text-sm text-gray-400">Laden…</span>
    </div>
  );
}

function CartDrawerLoader() {
  const { isCartOpen } = useCart();
  if (!isCartOpen) return null;
  return (
    <Suspense fallback={null}>
      <LazyCartDrawer />
    </Suspense>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-white selection:bg-gray-900 selection:text-white">
          <Header />
          <CartDrawerLoader />
          <main className="flex-1">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/producten" element={<Products />} />
                <Route path="/producten/:id" element={<ProductDetail />} />
                <Route path="/info" element={<Info />} />
                <Route path="/info/:slug" element={<InfoDetail />} />
                <Route path="/educatie" element={<Education />} />
                <Route path="/educatie/:slug" element={<EducationDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/zoeken" element={<SearchResults />} />
                <Route path="/success" element={<Success />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Analytics />
      </Router>
    </CartProvider>
  );
}
