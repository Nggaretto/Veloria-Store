import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Leaf, Truck, ShieldCheck, ArrowLeft, ChevronDown } from "lucide-react";
import ProductCard from "../../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const bannerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start start", "end start"],
  });
  const bannerOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const bannerScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const bannerY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3EE] overflow-hidden">
      {/* ================= بانر البراند ================= */}
      <motion.div
        ref={bannerRef}
        style={{ opacity: bannerOpacity, scale: bannerScale, y: bannerY }}
        className="relative h-[65vh] min-h-[380px] md:h-[75vh] w-full overflow-hidden"
      >
        <img
          src="veloria-banner.jpg"
          alt="Veloria - Pure Care for Naturally Beautiful Hair"
          className="w-full h-full object-cover"
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { duration: 0.6, delay: 0.8 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/90"
        >
          <span className="text-xs font-bold tracking-widest">اسحب لتكتشف أكتر</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>

      {/* ================= الهيرو ================= */}
      <div className="relative">
        {/* خلفية مزخرفة */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#E8C7A0] rounded-full blur-3xl opacity-40" />
          <div className="absolute top-40 -left-32 w-96 h-96 bg-[#A85A3A] rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[#5A2D20] rounded-full blur-3xl opacity-10" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: "radial-gradient(#5A2D20 0.7px, transparent 0.7px)",
              backgroundSize: "26px 26px",
              maskImage: "linear-gradient(to bottom, black, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          {[
            { top: "18%", left: "12%", size: 5, dur: 6, delay: 0 },
            { top: "70%", left: "8%", size: 3, dur: 5, delay: 0.5 },
            { top: "30%", left: "90%", size: 4, dur: 7, delay: 1 },
            { top: "60%", left: "94%", size: 3, dur: 5.5, delay: 1.5 },
            { top: "85%", left: "20%", size: 3, dur: 6.5, delay: 0.8 },
            { top: "10%", left: "75%", size: 4, dur: 6, delay: 1.2 },
            { top: "50%", left: "5%", size: 3, dur: 5, delay: 0.3 },
          ].map((p, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-[#A85A3A]"
              style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
              animate={{ y: [0, -30, 0], opacity: [0, 0.7, 0] }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 md:pt-32 md:pb-24">
          {/* بادج */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative inline-flex items-center gap-2 bg-white/70 backdrop-blur-md border border-[#A85A3A]/25 text-[#5A2D20] text-[11px] font-bold px-5 py-2 rounded-full tracking-[0.15em] shadow-sm mb-12"
          >
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ["0 0 0 0 rgba(168,90,58,0.25)", "0 0 0 8px rgba(168,90,58,0)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <Sparkles className="w-3.5 h-3.5 text-[#A85A3A]" />
            منتجات عناية طبيعية أصلية
          </motion.div>

          {/* اللوجو + هالة دوّارة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.35 }}
            className="relative mb-10"
          >
            <div className="absolute inset-0 rounded-full bg-[#E8C7A0] blur-3xl opacity-50 scale-150" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <svg
                className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] animate-spin-slow"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="47"
                  fill="none"
                  stroke="url(#goldRing)"
                  strokeWidth="0.8"
                  strokeDasharray="3 6"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E8C7A0" />
                    <stop offset="50%" stopColor="#C98A5E" />
                    <stop offset="100%" stopColor="#A85A3A" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="relative rounded-full p-[3px] bg-gradient-to-br from-[#E8C7A0] via-[#C98A5E] to-[#5A2D20] shadow-2xl">
                <img
                  src="logo.png"
                  alt="Veloria"
                  className="relative h-28 w-28 md:h-32 md:w-32 rounded-full object-cover ring-4 ring-[#F8F3EE]"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* فاصل زخرفي */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#A85A3A]/60" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#A85A3A]" />
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#A85A3A]/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display italic text-5xl md:text-7xl font-bold leading-tight tracking-tight bg-gradient-to-l from-[#5A2D20] via-[#C98A5E] to-[#5A2D20] bg-clip-text text-transparent animate-shimmer"
          >
            Welcome to Veloria
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-[#6b5a4e] text-lg md:text-xl mt-6 max-w-xl leading-relaxed"
          >
            لمسة طبيعية خالصة، وعناية تدوم مع كل استخدام
          </motion.p>

          {/* الأزرار */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-12"
          >
            <Link
              to="/products"
              className="group relative overflow-hidden inline-flex items-center gap-2 bg-gradient-to-br from-[#6b3527] to-[#4a2318] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-[#5A2D20]/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
              <span className="relative">تسوق دلوقتي</span>
              <ArrowLeft className="relative w-5 h-5 transition group-hover:-translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-white/60 backdrop-blur text-[#5A2D20] px-10 py-4 rounded-full font-bold text-lg border-2 border-[#A85A3A]/25 hover:border-[#A85A3A]/60 hover:bg-white/90 hover:-translate-y-0.5 transition-all"
            >
              تعرف علينا
            </Link>
          </motion.div>

          {/* شريط الثقة */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.65 } },
            }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-16 text-[#5A2D20]"
          >
            {[
              { icon: Leaf, label: "مكونات طبيعية" },
              { icon: Truck, label: "توصيل لكل مصر" },
              { icon: ShieldCheck, label: "جودة مضمونة" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-2 cursor-default"
              >
                {i !== 0 && <span className="hidden sm:block h-4 w-px bg-[#A85A3A]/20 -ml-4 mr-4" />}
                <Icon className="w-5 h-5 text-[#A85A3A]" />
                <span className="text-sm font-bold tracking-wide">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ================= المنتجات ================= */}
      <div className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-[#A85A3A] uppercase">
            التشكيلة
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#5A2D20] mt-2">
            منتجاتنا
          </h2>
          <div className="w-16 h-1 bg-[#A85A3A] rounded-full mx-auto mt-4" />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-10">جارِ تحميل المنتجات...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-10 text-center text-gray-400">
            قريباً ستظهر قائمة المنتجات هنا
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
