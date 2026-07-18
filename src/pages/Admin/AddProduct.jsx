import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';

const SIZE_LABELS = { S: 'سمول (S)', M: 'ميديم (M)', L: 'لارج (L)' };
const SIZES = ['S', 'M', 'L'];

const emptySize = { active: false, price: '', stock: '' };

export default function AddProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState(['']);
  const [sizeMode, setSizeMode] = useState('multiple'); // 'multiple' = S/M/L, 'one' = مقاس واحد
  const [sizes, setSizes] = useState({ S: { ...emptySize }, M: { ...emptySize }, L: { ...emptySize } });
  const [oneSize, setOneSize] = useState({ price: '', stock: '' });
  const [discountActive, setDiscountActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ================= الصور =================
  const handleImageChange = (i, value) => {
    setImages((prev) => prev.map((img, idx) => (idx === i ? value : img)));
  };
  const addImageField = () => setImages((prev) => [...prev, '']);
  const removeImageField = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  // ================= المقاسات =================
  const updateSize = (size, field, value) => {
    setSizes((prev) => ({ ...prev, [size]: { ...prev[size], [field]: value } }));
  };

  // ================= حساب السعر بعد الخصم (نفس منطق صفحة تفاصيل المنتج) =================
  const getFinalPrice = (price) => {
    const p = Number(price || 0);
    if (discountActive && Number(discountPercent) > 0) {
      return Math.round(p * (1 - Number(discountPercent) / 100));
    }
    return p;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('لازم تكتب اسم المنتج');

    let activeSizes = [];
    if (sizeMode === 'multiple') {
      activeSizes = SIZES.filter((s) => sizes[s].active);
      if (activeSizes.length === 0) return setError('لازم تفعّل مقاس واحد على الأقل ويكون له سعر');
      for (const s of activeSizes) {
        if (!sizes[s].price || Number(sizes[s].price) <= 0) {
          return setError(`لازم تكتب سعر صحيح لمقاس ${SIZE_LABELS[s]}`);
        }
      }
    } else {
      if (!oneSize.price || Number(oneSize.price) <= 0) {
        return setError('لازم تكتب سعر صحيح للمنتج');
      }
    }
    if (discountActive && (!discountPercent || Number(discountPercent) <= 0 || Number(discountPercent) >= 100)) {
      return setError('نسبة الخصم لازم تكون رقم بين 1 و 99');
    }

    setLoading(true);
    try {
      const cleanImages = images.map((img) => img.trim()).filter(Boolean);

      const discountPayload = {
        active: discountActive,
        percent: discountActive ? Number(discountPercent) : 0,
      };

      let payload;
      if (sizeMode === 'multiple') {
        const sizesPayload = {};
        SIZES.forEach((s) => {
          sizesPayload[s] = {
            active: sizes[s].active,
            price: sizes[s].active ? Number(sizes[s].price || 0) : 0,
            stock: sizes[s].active ? Number(sizes[s].stock || 0) : 0,
          };
        });
        payload = { hasMultipleSizes: true, sizes: sizesPayload };
      } else {
        payload = {
          hasMultipleSizes: false,
          singleSize: { size: 'ONE', price: Number(oneSize.price || 0), stock: Number(oneSize.stock || 0) },
        };
      }

      await addDoc(collection(db, 'products'), {
        name: name.trim(),
        description: description.trim(),
        images: cleanImages,
        ...payload,
        discount: discountPayload,
        createdAt: new Date(),
      });

      alert('تم إضافة المنتج بنجاح!');
      navigate('/admin/products');
    } catch (err) {
      console.error('خطأ أثناء الإضافة: ', err);
      setError('حصل خطأ، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#5A2D20]">إضافة منتج جديد</h1>
          <Link to="/admin/products" className="text-[#5A2D20] font-bold hover:underline">
            ← رجوع للمنتجات
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-8">
          {error && (
            <div className="bg-red-50 text-red-600 font-bold p-4 rounded-2xl text-sm">{error}</div>
          )}

          {/* ================= بيانات أساسية ================= */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-bold text-[#5A2D20] mb-2">اسم المنتج</label>
              <input
                type="text"
                className="w-full p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: فستان صيفي"
              />
            </div>
            <div>
              <label className="block font-bold text-[#5A2D20] mb-2">الوصف</label>
              <textarea
                rows={4}
                className="w-full p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المنتج..."
              />
            </div>
          </div>

          {/* ================= الصور ================= */}
          <div>
            <label className="block font-bold text-[#5A2D20] mb-2">صور المنتج (لينك الصورة)</label>
            <div className="flex flex-col gap-3">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-3">
                  {img && (
                    <img
                      src={img}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                      onError={(e) => (e.target.style.visibility = 'hidden')}
                    />
                  )}
                  <input
                    type="text"
                    className="flex-1 p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                    placeholder="https://example.com/image.jpg"
                    value={img}
                    onChange={(e) => handleImageChange(i, e.target.value)}
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(i)}
                      className="w-10 h-10 flex-shrink-0 bg-red-50 text-red-600 rounded-xl font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="self-start bg-[#F8F3EE] text-[#5A2D20] px-4 py-2 rounded-xl font-bold text-sm"
              >
                + إضافة صورة تانية
              </button>
            </div>
          </div>

          {/* ================= الخصم ================= */}
          <div className="bg-[#F8F3EE] rounded-2xl p-5">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#5A2D20]"
                checked={discountActive}
                onChange={(e) => setDiscountActive(e.target.checked)}
              />
              <span className="font-bold text-[#5A2D20]">فعّل خصم على المنتج</span>
            </label>
            {discountActive && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={99}
                  className="w-32 p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                  placeholder="نسبة الخصم %"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
                <span className="text-gray-500 text-sm">% خصم على سعر كل المقاسات المفعّلة تحت</span>
              </div>
            )}
          </div>

          {/* ================= المقاسات ================= */}
          <div>
            <label className="block font-bold text-[#5A2D20] mb-3">المقاسات</label>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setSizeMode('multiple')}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${
                  sizeMode === 'multiple'
                    ? 'bg-[#5A2D20] text-white border-[#5A2D20]'
                    : 'bg-[#F8F3EE] text-[#5A2D20] border-transparent'
                }`}
              >
                مقاسات متعددة (S / M / L)
              </button>
              <button
                type="button"
                onClick={() => setSizeMode('one')}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition ${
                  sizeMode === 'one'
                    ? 'bg-[#5A2D20] text-white border-[#5A2D20]'
                    : 'bg-[#F8F3EE] text-[#5A2D20] border-transparent'
                }`}
              >
                مقاس واحد (One Size)
              </button>
            </div>

            {sizeMode === 'multiple' ? (
              <div className="flex flex-col gap-4">
                {SIZES.map((s) => (
                  <div key={s} className="border border-gray-100 rounded-2xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-[#5A2D20]"
                        checked={sizes[s].active}
                        onChange={(e) => updateSize(s, 'active', e.target.checked)}
                      />
                      <span className="font-bold text-[#5A2D20]">{SIZE_LABELS[s]}</span>
                    </label>

                    {sizes[s].active && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">السعر الأصلي (ج.م)</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                            value={sizes[s].price}
                            onChange={(e) => updateSize(s, 'price', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">الكمية بالمخزون</label>
                          <input
                            type="number"
                            min={0}
                            className="w-full p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                            value={sizes[s].stock}
                            onChange={(e) => updateSize(s, 'stock', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">السعر بعد الخصم</label>
                          <div className="w-full p-3 bg-white border-2 border-[#A85A3A] rounded-xl font-bold text-[#A85A3A]">
                            {getFinalPrice(sizes[s].price)} ج.م
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-100 rounded-2xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">السعر الأصلي (ج.م)</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                      value={oneSize.price}
                      onChange={(e) => setOneSize((prev) => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الكمية بالمخزون</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full p-3 bg-[#F8F3EE] rounded-xl border-none focus:ring-2 focus:ring-[#5A2D20]"
                      value={oneSize.stock}
                      onChange={(e) => setOneSize((prev) => ({ ...prev, stock: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">السعر بعد الخصم</label>
                    <div className="w-full p-3 bg-white border-2 border-[#A85A3A] rounded-xl font-bold text-[#A85A3A]">
                      {getFinalPrice(oneSize.price)} ج.م
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#5A2D20] text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-60"
          >
            {loading ? 'جارِ الإضافة...' : 'إضافة المنتج'}
          </button>
        </form>
      </div>
    </div>
  );
}