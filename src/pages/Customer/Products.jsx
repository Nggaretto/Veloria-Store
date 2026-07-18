import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ProductCard from '../../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  return (
    <div className="min-h-screen bg-[#F8F3EE]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* رأس الصفحة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-[#5A2D20]">منتجاتنا</h1>
            <p className="text-gray-500 mt-1">اكتشفي كل تشكيلة Veloria</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="دوري على منتج..."
              className="w-full pr-11 pl-4 py-3 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-[#5A2D20]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* شبكة عرض المنتجات */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">جارِ تحميل المنتجات...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-14 text-center text-gray-400">
            {search ? 'مفيش منتجات مطابقة للبحث' : 'قريباً هتظهر منتجات جديدة هنا'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}