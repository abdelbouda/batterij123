import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Plus, Trash2, LogIn, LogOut, ShieldCheck, Database, Edit2, X, Save, Eye, EyeOff } from 'lucide-react';

const ADMIN_EMAIL = 'abdelbouda@gmail.com';

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', brand: '', capacity: '', price: '', image: '', description: '', features: '', status: 'available'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
        fetchProducts();
      } else {
        if (currentUser) await signOut(auth);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, features: typeof formData.features === 'string' ? formData.features.split(',').map(f => f.trim()) : formData.features };
    
    if (editingId) {
      await updateDoc(doc(db, 'products', editingId), data);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'products'), data);
    }
    
    setFormData({ name: '', brand: '', capacity: '', price: '', image: '', description: '', features: '', status: 'available' });
    fetchProducts();
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({ ...product, features: product.features.join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStatus = async (product: any) => {
    const newStatus = product.status === 'available' ? 'unavailable' : 'available';
    await updateDoc(doc(db, 'products', product.id), { status: newStatus });
    fetchProducts();
  };

  if (loading) return <div className="p-24 text-center italic">Laden...</div>;
  if (!user) return <div className="p-24 text-center"><ShieldCheck className="mx-auto h-12 w-12 mb-4 text-gray-400" /> <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="bg-black text-white px-6 py-3 rounded-full font-bold">Admin Login</button></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex justify-between items-center border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold">Batterij Beheer</h1>
        <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black"><LogOut size={18}/> Uitloggen</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORMULIER */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-sm sticky top-6">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Product Wijzigen' : 'Nieuw Product'}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Naam" required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="Merk" required className="w-full p-2 border rounded" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              <div className="flex gap-2">
                <input type="text" placeholder="Capaciteit" className="w-1/2 p-2 border rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                <input type="text" placeholder="Prijs" className="w-1/2 p-2 border rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <input type="text" placeholder="Afbeelding URL" className="w-full p-2 border rounded" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <textarea placeholder="Beschrijving" className="w-full p-2 border rounded" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <input type="text" placeholder="Kenmerken (komma gescheiden)" className="w-full p-2 border rounded" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
              
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                {editingId ? <Save size={20}/> : <Plus size={20}/>} {editingId ? 'Opslaan' : 'Toevoegen'}
              </button>
              {editingId && <button onClick={() => {setEditingId(null); setFormData({name:'',brand:'',capacity:'',price:'',image:'',description:'',features:'',status:'available'})}} className="w-full text-gray-500 py-1 text-sm">Annuleren</button>}
            </div>
          </form>
        </div>

        {/* LIJST */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-bold">Product</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className={p.status === 'unavailable' ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 object-cover rounded" alt="" />
                        <div>
                          <div className="font-bold">{p.name}</div>
                          <div className="text-xs text-gray-500">€{p.price}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleStatus(p)} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.status === 'available' ? <><Eye size={12}/> Live</> : <><EyeOff size={12}/> Offline</>}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => startEdit(p)} className="p-2 hover:bg-gray-100 rounded text-blue-600"><Edit2 size={18}/></button>
                      <button onClick={async () => {if(confirm('Verwijderen?')) { await deleteDoc(doc(db, 'products', p.id)); fetchProducts(); }}} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={18}/></button>
                    </td>
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
