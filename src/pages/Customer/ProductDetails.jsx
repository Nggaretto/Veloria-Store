import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const SIZES = ["S", "M", "L"];

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setProduct(data);
        if (data.hasMultipleSizes) {
          const firstActive = SIZES.find((s) => data.sizes?.[s]?.active);
          setSelectedSize(firstActive || null);
        }
      }
      setLoading(false);
    };
    fetchProduct();
    setActiveImage(0);
    setQty(1);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F3EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#5A2D20]/20 border-t-[#5A2D20] rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">جارِ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F3EE] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-400 mb-4">المنتج ده مش موجود</p>
          <Link to="/" className="text-[#5A2D20] font-bold underline">
            رجوع للهوم
          </Link>
        </div>
      </div>
    );
  }

  const activeSizes = product.hasMultipleSizes
    ? SIZES.filter((s) => product.sizes?.[s]?.active)
    : [];

  const hasDiscount = Boolean(product.discount?.active && Number(product.discount?.percent) > 0);
  const discountPercent = Number(product.discount?.percent || 0);

  const getBasePriceStock = () => {
    if (product.hasMultipleSizes) {
      const s = selectedSize ? product.sizes?.[selectedSize] : null;
      return { price: Number(s?.price || 0), stock: Number(s?.stock || 0) };
    }
    return {
      price: Number(product.singleSize?.price || 0),
      stock: Number(product.singleSize?.stock || 0),
    };
  };

  const { price: basePrice, stock } = getBasePriceStock();
  const finalPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;
  const outOfStock = product.hasMultipleSizes ? activeSizes.length === 0 || stock <= 0 : stock <= 0;
  const maxQty = Math.min(stock || 0, 10);

  const handleAdd = () => {
    if (outOfStock) return;
    addToCart(
      product,
      product.hasMultipleSizes ? selectedSize : product.singleSize?.size || "ONE",
      qty,
      finalPrice,
      stock
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* المستخدم قفل نافذة المشاركة */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("اتنسخ لينك المنتج");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F3EE]">
      {/* شريط تنقل بسيط */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-[#5A2D20]/70 hover:text-[#5A2D20] font-medium transition"
        >
          <ChevronLeft className="w-4 h-4" />
          كل المنتجات
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* ================= الصور ================= */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-[2rem] overflow-hidden bg-white shadow-[0_20px_50px_-15px_rgba(90,45,32,0.25)] mb-5 group"
          >
            <img
              src={product.images?.[activeImage] || "https://placehold.co/600x600"}
              alt={product.name}
              className="w-full h-[420px] md:h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {hasDiscount && (
              <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-[#A85A3A] text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                خصم {discountPercent}%
              </div>
            )}

            <div className="absolute top-5 left-5 flex flex-col gap-2">
              <button
                onClick={() => setWishlisted((w) => !w)}
                className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-md hover:scale-110 transition"
                aria-label="أضف للمفضلة"
              >
                <Heart
                  className={`w-4 h-4 transition ${wishlisted ? "fill-[#A85A3A] text-[#A85A3A]" : "text-[#5A2D20]"}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-md hover:scale-110 transition"
                aria-label="شارك المنتج"
              >
                <Share2 className="w-4 h-4 text-[#5A2D20]" />
              </button>
            </div>
          </motion.div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                    activeImage === i ? "border-[#5A2D20] shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= التفاصيل ================= */}
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-[#A85A3A] uppercase mb-2">
            Veloria
          </span>
          <h1 className="text-4xl font-bold text-[#5A2D20] leading-tight">{product.name}</h1>

          <div className="mt-5">
            {basePrice === 0 ? (
              <span className="text-2xl font-bold text-[#A85A3A]">—</span>
            ) : hasDiscount ? (
              <span className="flex items-baseline gap-3">
                <span className="text-gray-400 line-through text-lg">{basePrice} ج.م</span>
                <span className="text-4xl font-bold text-[#A85A3A]">{finalPrice} ج.م</span>
                <span className="text-xs font-bold text-white bg-[#A85A3A] px-2.5 py-1 rounded-full">
                  وفّري {basePrice - finalPrice} ج.م
                </span>
              </span>
            ) : (
              <span className="text-4xl font-bold text-[#A85A3A]">{basePrice} ج.م</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-gray-600 leading-8">{product.description}</p>
          )}

          {product.hasMultipleSizes && activeSizes.length > 0 && (
            <div className="mt-8">
              <span className="block font-bold text-[#5A2D20] mb-3">اختاري المقاس</span>
              <div className="flex gap-3">
                {activeSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSize(s);
                      setQty(1);
                    }}
                    className={`w-14 h-14 rounded-2xl font-bold border-2 transition ${
                      selectedSize === s
                        ? "bg-[#5A2D20] text-white border-[#5A2D20] shadow-md scale-105"
                        : "bg-white text-[#5A2D20] border-[#5A2D20]/15 hover:border-[#5A2D20]/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full font-bold ${
                outOfStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${outOfStock ? "bg-red-500" : "bg-green-500"}`} />
              {outOfStock ? "نفدت الكمية" : `متوفر: ${stock}`}
            </span>
          </div>

          {/* اختيار الكمية */}
          {!outOfStock && (
            <div className="mt-7">
              <span className="block font-bold text-[#5A2D20] mb-3">الكمية</span>
              <div className="inline-flex items-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#5A2D20] hover:bg-[#F8F3EE] rounded-xl transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-[#5A2D20]">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#5A2D20] hover:bg-[#F8F3EE] rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <AnimatePresence mode="wait">
              <motion.button
                key={outOfStock ? "out" : "in"}
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={outOfStock}
                className="flex-1 px-10 py-4 bg-[#5A2D20] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#5A2D20]/20 hover:bg-[#4a2519] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {outOfStock ? "نفدت الكمية" : "أضف للسلة"}
              </motion.button>
            </AnimatePresence>
          </div>

          {/* شارات الثقة */}
          <div className="mt-10 grid grid-cols-3 gap-3 pt-8 border-t border-[#5A2D20]/10">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-[#F8F3EE] rounded-full">
                <Truck className="w-4 h-4 text-[#5A2D20]" />
              </div>
              <span className="text-xs text-gray-500 font-medium">توصيل سريع</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-[#F8F3EE] rounded-full">
                <ShieldCheck className="w-4 h-4 text-[#5A2D20]" />
              </div>
              <span className="text-xs text-gray-500 font-medium">دفع آمن</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center bg-[#F8F3EE] rounded-full">
                <RotateCcw className="w-4 h-4 text-[#5A2D20]" />
              </div>
              <span className="text-xs text-gray-500 font-medium">إرجاع سهل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}