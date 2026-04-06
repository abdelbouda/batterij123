/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Education from './pages/Education';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-white selection:bg-gray-900 selection:text-white">
          <Header />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/producten" element={<Products />} />
              <Route path="/producten/:id" element={<ProductDetail />} />
              <Route path="/educatie" element={<Education />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/success" element={<div className="py-24 text-center text-gray-900 font-bold text-3xl">Bedankt voor uw bestelling!</div>} />
              <Route path="/contact" element={<div className="py-24 text-center text-gray-500">Contactpagina komt binnenkort...</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
