import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, X, CreditCard, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, isCartOpen, setIsCartOpen } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
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

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-[70] flex w-full flex-col bg-white shadow-2xl sm:max-w-md"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-gray-900" />
                <h2 className="text-xl font-bold text-gray-900">Winkelwagen ({totalItems})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-600">Uw winkelwagen is leeg</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm font-bold text-gray-900">€{item.price}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-full border border-gray-200 px-3 py-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-gray-600 hover:text-gray-900">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-gray-600 hover:text-gray-900">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 p-6">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Totaal</span>
                  <span>€{totalPrice.toLocaleString('nl-NL')}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                  {isCheckingOut ? 'Bezig...' : 'Direct afrekenen'}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-gray-600">
                  <ShieldCheck className="h-3 w-3 text-green-600" />
                  <span>Veilig betalen met SSL-beveiliging</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
