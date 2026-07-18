import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

const SIZES = ['S', 'M', 'L'];

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('متأكد إنك عايز تمسح المنتج ده؟')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  // ================= حساب السعر والمخزون الإجمالي لكل منتج =================
  const getPriceRange = (product) => {
    if (product.hasMultipleSizes) {
      const prices = SIZES
        .filter((s) => product.sizes?.[s]?.active)
        .map((s) => Number(product.sizes[s].price || 0));
      if (prices.length === 0) return null;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `${min} ج.م` : `${min} - ${max} ج.م`;
    }
    return product.singleSize?.price ? `${Number(product.singleSize.price)} ج.م` : '—';
  };

  const getTotalStock = (product) => {
    if (product.hasMultipleSizes) {
      return SIZES
        .filter((s) => product.sizes?.[s]?.active)
        .reduce((sum, s) => sum + Number(product.sizes[s].stock || 0), 0);
    }
    return Number(product.singleSize?.stock || 0);
  };

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen" dir="rtl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-[#5A2D20]">المنتجات</h1>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="بحث باسم المنتج..."
            className="p-3 border-none bg-white rounded-2xl w-64 shadow focus:ring-2 focus:ring-[#5A2D20]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => navigate('/admin/products/add')}
            className="bg-[#5A2D20] text-white px-6 py-3 rounded-2xl font-bold shadow hover:shadow-md transition"
          >
            + إضافة منتج
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-400">جارِ التحميل...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-400">
          {search ? 'مفيش منتجات مطابقة للبحث' : 'لسه مفيش منتجات، دوس "إضافة منتج" عشان تبدأ'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stock = getTotalStock(product);
            const hasDiscount = product.discount?.active && product.discount?.percent;
            return (
              <div key={product.id} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <Link to={`/admin/products/${product.id}`}>
                  <div className="relative">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x300'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {hasDiscount && (
                      <span className="absolute top-3 right-3 bg-[#A85A3A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        خصم {product.discount.percent}%
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <Link to={`/admin/products/${product.id}`}>
                    <h3 className="font-bold text-[#5A2D20] text-lg mb-1 truncate hover:underline">
                      {product.name || 'بدون اسم'}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-[#A85A3A]">{getPriceRange(product)}</span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {stock > 0 ? `متوفر: ${stock}` : 'نفدت'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                      className="flex-1 bg-[#F8F3EE] text-[#5A2D20] py-2 rounded-xl font-bold text-sm hover:shadow transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => navigate(`/admin/inventory?product=${product.id}`)}
                      className="flex-1 bg-[#F8F3EE] text-[#5A2D20] py-2 rounded-xl font-bold text-sm hover:shadow transition"
                    >
                      المخزون
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-sm hover:shadow transition disabled:opacity-60"
                    >
                      {deletingId === product.id ? 'جارِ الحذف...' : 'حذف'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
