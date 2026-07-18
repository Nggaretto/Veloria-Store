import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const SIZES = ['S', 'M', 'L'];

export default function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('متأكد إنك عايز تمسح المنتج ده؟')) return;
    await deleteDoc(doc(db, 'products', id));
    navigate('/admin/products');
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#F8F3EE] min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-gray-400">جارِ التحميل...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 bg-[#F8F3EE] min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-gray-400 mb-4">المنتج ده مش موجود</p>
          <Link to="/admin/products" className="text-[#5A2D20] font-bold underline">رجوع للمنتجات</Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount?.active && product.discount?.percent;

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen" dir="rtl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <Link to="/admin/products" className="text-[#5A2D20] font-bold hover:underline">
          ← رجوع للمنتجات
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/inventory?product=${product.id}`)}
            className="bg-white text-[#5A2D20] px-6 py-3 rounded-2xl font-bold shadow hover:shadow-md transition"
          >
            المخزون
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold shadow hover:shadow-md transition"
          >
            حذف المنتج
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* الصور */}
          <div className="p-6">
            <div className="relative rounded-2xl overflow-hidden bg-[#F8F3EE] mb-4">
              <img
                src={product.images?.[activeImage] || 'https://placehold.co/500x500'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-[#A85A3A] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                  خصم {product.discount.percent}%
                </span>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${
                      activeImage === i ? 'border-[#5A2D20]' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-[#5A2D20] mb-3">{product.name}</h1>

            {product.description && (
              <p className="text-gray-600 leading-7 mb-6">{product.description}</p>
            )}

            <h2 className="font-bold text-[#5A2D20] mb-3">المقاسات والأسعار</h2>

            {product.hasMultipleSizes ? (
              <div className="space-y-2 mb-6">
                {SIZES.filter((s) => product.sizes?.[s]?.active).map((s) => {
                  const price = Number(product.sizes[s].price || 0);
                  const stock = Number(product.sizes[s].stock || 0);
                  const finalPrice = hasDiscount
                    ? Math.round(price * (1 - product.discount.percent / 100))
                    : price;
                  return (
                    <div key={s} className="flex items-center justify-between bg-[#F8F3EE] p-3 rounded-xl">
                      <span className="font-bold text-[#5A2D20]">مقاس {s}</span>
                      <div className="flex items-center gap-3">
                        {hasDiscount ? (
                          <span className="flex items-center gap-2">
                            <span className="text-gray-400 line-through text-sm">{price} ج.م</span>
                            <span className="font-bold text-[#A85A3A]">{finalPrice} ج.م</span>
                          </span>
                        ) : (
                          <span className="font-bold text-[#A85A3A]">{price} ج.م</span>
                        )}
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {stock > 0 ? `متوفر: ${stock}` : 'نفدت'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              (() => {
                const price = Number(product.singleSize?.price || 0);
                const stock = Number(product.singleSize?.stock || 0);
                const finalPrice = hasDiscount
                  ? Math.round(price * (1 - product.discount.percent / 100))
                  : price;
                return (
                  <div className="flex items-center justify-between bg-[#F8F3EE] p-3 rounded-xl mb-6">
                    <span className="font-bold text-[#5A2D20]">
                      {product.singleSize?.size === 'ONE' ? 'مقاس واحد' : `مقاس ${product.singleSize?.size}`}
                    </span>
                    <div className="flex items-center gap-3">
                      {hasDiscount ? (
                        <span className="flex items-center gap-2">
                          <span className="text-gray-400 line-through text-sm">{price} ج.م</span>
                          <span className="font-bold text-[#A85A3A]">{finalPrice} ج.م</span>
                        </span>
                      ) : (
                        <span className="font-bold text-[#A85A3A]">{price} ج.م</span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stock > 0 ? `متوفر: ${stock}` : 'نفدت'}
                      </span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
