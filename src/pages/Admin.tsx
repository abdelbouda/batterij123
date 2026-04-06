import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, LogIn, LogOut, ShieldCheck, Database } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { batteries as initialBatteries } from '../data/batteries';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    capacity: '',
    price: '',
    rating: 5,
    reviews: 0,
    image: '',
    description: '',
    features: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchProducts();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setError(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'products');
    }
  };

  const seedDatabase = async () => {
    if (!window.confirm("Wilt u de database vullen met voorbeeldproducten?")) return;
    setIsSeeding(true);
    try {
      for (const battery of initialBatteries) {
        await addDoc(collection(db, 'products'), battery);
      }
      fetchProducts();
      alert("Database succesvol gevuld!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        features: newProduct.features.split(',').map(f => f.trim())
      };
      await addDoc(collection(db, 'products'), productData);
      setNewProduct({
        name: '',
        brand: '',
        capacity: '',
        price: '',
        rating: 5,
        reviews: 0,
        image: '',
        description: '',
        features: ''
      });
      fetchProducts();
      setError(null);
    } catch (err) {
      setError("Fout bij het toevoegen van product. Controleer of u de juiste rechten heeft.");
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Weet u zeker dat u dit product wilt verwijderen?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
        setError(null);
      } catch (err) {
        setError("Fout bij het verwijderen van product.");
        handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  if (loading) return <div className="flex justify-center py-24">Laden...</div>;

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <ShieldCheck className="mb-6 h-16 w-16 text-gray-400" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Toegang</h1>
        <p className="mt-4 text-gray-500">Log in met uw Google-account om producten te beheren.</p>
        <button
          onClick={handleLogin}
          className="mt-8 flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
        >
          <LogIn className="h-5 w-5" />
          Inloggen met Google
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-8 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productbeheer</h1>
          <p className="mt-2 text-gray-500">Ingelogd als {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={seedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {isSeeding ? 'Bezig...' : 'Database Vullen'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Uitloggen
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Add Product Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Nieuw Product</h2>
            <form onSubmit={handleAddProduct} className="mt-6 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Productnaam"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Merk"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
              <input
                type="text"
                placeholder="Capaciteit (bijv. 13.5 kWh)"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                value={newProduct.capacity}
                onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
              />
              <input
                type="text"
                placeholder="Prijs (bijv. 8.500)"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
              <input
                type="text"
                placeholder="Afbeelding URL"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
              <textarea
                placeholder="Beschrijving"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                rows={3}
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Kenmerken (komma gescheiden)"
                required
                className="rounded-lg border border-gray-200 p-3 text-sm focus:border-gray-900 focus:outline-none"
                value={newProduct.features}
                onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
              />
              <button
                type="submit"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gray-900 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-5 w-5" />
                Product Toevoegen
              </button>
            </form>
          </div>
        </div>

        {/* Product List */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Huidige Producten</h2>
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand} • €{product.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {products.length === 0 && <p className="text-gray-500">Geen producten gevonden.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
