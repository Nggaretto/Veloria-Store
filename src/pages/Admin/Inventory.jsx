import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const SIZES = ['S', 'M', 'L'];
const LOW_STOCK_KEY = 'inventory_low_stock_threshold';

export default function Inventory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightProductId = searchParams.get('product');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockInputs, setRestockInputs] = useState({}); // key: `${productId}-${size}` -> value
  const [savingKey, setSavingKey] = useState(null);
  const [threshold, setThreshold] = useState(() => Number(localStorage.getItem(LOW_STOCK_KEY)) || 5);
  const notifiedRef = useRef(new Set()); // avoid re-notifying for the same out-of-stock lines every render

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    localStorage.setItem(LOW_STOCK_KEY, String(threshold));
  }, [threshold]);

  const fetchProducts = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  // ================= بناء سطور المخزون (كل منتج بيتحول لسطر أو أكتر حسب المقاسات) =================
  const stockLines = useMemo(() => {
    const lines = [];
    products.forEach(p => {
      if (p.hasMultipleSizes) {
        SIZES.forEach(s => {
          const sizeData = p.sizes?.[s];
          if (sizeData?.active) {
            lines.push({
              key: `${p.id}-${s}`,
              productId: p.id,
              productName: p.name,
              image: p.images?.[0],
              size: s,
              price: sizeData.price,
              stock: Number(sizeData.stock || 0),
              path: `sizes.${s}.stock`,
            });
          }
        });
      } else {
        lines.push({
          key: `${p.id}-ONE`,
          productId: p.id,
          productName: p.name,
          image: p.images?.[0],
          size: p.singleSize?.size === 'ONE' ? null : p.singleSize?.size,
          price: p.singleSize?.price,
          stock: Number(p.singleSize?.stock || 0),
          path: 'singleSize.stock',
        });
      }
    });
    return lines;
  }, [products]);

  const needsRestock = (line) => line.stock <= 0 || line.stock <= threshold;
  const isOutOfStock = (line) => line.stock <= 0;

  const restockList = useMemo(
    () => stockLines.filter(needsRestock).sort((a, b) => a.stock - b.stock),
    [stockLines, threshold]
  );

  // ================= نوتيفيكيشن المتصفح لما يبقى في حاجة خلصت =================
  useEffect(() => {
    if (loading) return;
    const outOfStockLines = stockLines.filter(isOutOfStock);
    const newOnes = outOfStockLines.filter(l => !notifiedRef.current.has(l.key));
    if (newOnes.length === 0) return;

    newOnes.forEach(l => notifiedRef.current.add(l.key));

    if (typeof Notification === 'undefined') return;

    const fire = () => {
      const body = newOnes.length === 1
        ? `${newOnes[0].productName}${newOnes[0].size ? ` (مقاس ${newOnes[0].size})` : ''} خلصت من المخزون`
        : `${newOnes.length} أصناف خلصت من المخزون، افتح صفحة المخزون عشان تزودهم`;
      new Notification('⚠️ المخزون خلص', { body });
    };

    if (Notification.permission === 'granted') {
      fire();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => { if (perm === 'granted') fire(); });
    }
  }, [stockLines, loading]);

  // ================= التزويد =================
  const handleRestockChange = (key, value) => {
    setRestockInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleRestock = async (line) => {
    const delta = Number(restockInputs[line.key]);
    if (!delta) return; // 0 أو فاضي أو مش رقم

    const newStock = Math.max(0, line.stock + delta);

    setSavingKey(line.key);
    try {
      await updateDoc(doc(db, 'products', line.productId), { [line.path]: newStock });
      if (newStock > 0) notifiedRef.current.delete(line.key); // ممكن تتبعت نوتيفيكيشن تانية لو خلصت تاني بعد كده
      setRestockInputs(prev => ({ ...prev, [line.key]: '' }));
      await fetchProducts();
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#5A2D20]">المخزون</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-[#5A2D20]">حد التنبيه للكمية القليلة</label>
          <input
            type="number"
            min={0}
            className="w-20 p-2 bg-white rounded-xl border border-gray-200 text-sm"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value) || 0)}
          />
          <button
            onClick={() => navigate('/products')}
            className="bg-white text-[#5A2D20] px-6 py-3 rounded-2xl font-bold shadow hover:shadow-md transition"
          >
            المنتجات
          </button>
        </div>
      </div>

      {/* ================= ملخص "زودني" ================= */}
      {restockList.length > 0 && (
        <div className="bg-white border-2 border-red-200 rounded-3xl shadow-lg mb-8 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <h2 className="text-xl font-bold text-red-600">محتاجين تزويد ({restockList.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restockList.map(line => (
              <div key={`summary-${line.key}`} className="flex items-center gap-3 bg-[#FFF5F5] p-3 rounded-2xl">
                {line.image && <img src={line.image} className="w-12 h-12 object-cover rounded-lg" />}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#5A2D20] truncate">
                    {line.productName}{line.size ? ` - مقاس ${line.size}` : ''}
                  </div>
                  <div className="text-xs font-bold text-red-500">
                    {isOutOfStock(line) ? 'نفدت الكمية' : `باقي ${line.stock} بس`}
                  </div>
                </div>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold whitespace-nowrap">زودني</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= قائمة المخزون بالتفصيل ================= */}
      {loading ? (
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-400">جارِ التحميل...</div>
      ) : stockLines.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-400">
          لسه مفيش منتجات، دوس "إضافة منتج" في صفحة المنتجات عشان تبدأ
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {stockLines.map(line => {
            const flagged = needsRestock(line);
            const highlighted = line.productId === highlightProductId;
            return (
              <div
                key={line.key}
                className={`bg-white rounded-3xl shadow-lg p-5 flex items-center gap-4 border-2 ${
                  highlighted ? 'border-[#5A2D20]' : flagged ? 'border-red-300' : 'border-transparent'
                }`}
              >
                {line.image && <img src={line.image} className="w-20 h-20 object-cover rounded-2xl flex-shrink-0" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#5A2D20]">{line.productName}</h3>
                    {line.size && (
                      <span className="text-xs bg-[#F8F3EE] text-[#5A2D20] px-2 py-1 rounded-full font-bold">مقاس {line.size}</span>
                    )}
                    {flagged && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">زودني</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-gray-500">{line.price ? `${line.price} ج.م` : '—'}</span>
                    <span className={`font-bold ${isOutOfStock(line) ? 'text-red-600' : flagged ? 'text-amber-600' : 'text-green-600'}`}>
                      {isOutOfStock(line) ? 'نفدت الكمية' : `المتوفر: ${line.stock}`}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3 items-center">
                    <button
                      type="button"
                      onClick={() => handleRestockChange(line.key, String(Number(restockInputs[line.key] || 0) - 1))}
                      className="w-9 h-9 bg-[#F8F3EE] text-[#5A2D20] rounded-xl font-bold text-lg leading-none"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      placeholder="مثال: 5 أو -3"
                      className="w-28 p-2 bg-[#F8F3EE] rounded-xl border-none text-sm text-center"
                      value={restockInputs[line.key] || ''}
                      onChange={(e) => handleRestockChange(line.key, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRestock(line); } }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRestockChange(line.key, String(Number(restockInputs[line.key] || 0) + 1))}
                      className="w-9 h-9 bg-[#F8F3EE] text-[#5A2D20] rounded-xl font-bold text-lg leading-none"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRestock(line)}
                      disabled={savingKey === line.key}
                      className="bg-[#5A2D20] text-white px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-60"
                    >
                      {savingKey === line.key ? 'جارِ...' : 'تعديل'}
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