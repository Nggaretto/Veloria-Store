import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase";
import { useCart } from "../../context/CartContext";

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج",
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    governorate: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    if (!form.customerName.trim()) return "اكتب الاسم";
    if (!/^01[0-9]{9}$/.test(form.phone.trim())) return "رقم الموبايل لازم يكون رقم مصري صحيح (01xxxxxxxxx)";
    if (!form.governorate) return "اختار المحافظة";
    if (!form.address.trim()) return "اكتب العنوان بالتفصيل";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const orderItems = items.map((it) => ({
        name: it.name,
        size: it.size && it.size !== "ONE" ? it.size : null,
        price: it.price,
        quantity: it.qty,
      }));

      await addDoc(collection(db, "orders"), {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        governorate: form.governorate,
        address: form.address.trim(),
        items: orderItems,
        total: totalPrice,
        createdAt: serverTimestamp(),
      });

      clearCart();
      navigate("/success");
    } catch (err) {
      toast.error("حصل خطأ، حاول تاني");
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F3EE] flex items-center justify-center px-6">
        <div className="text-center bg-white rounded-3xl shadow-lg p-12 max-w-md">
          <h1 className="text-3xl font-bold text-[#5A2D20] mb-4">السلة فاضية</h1>
          <p className="text-gray-500 mb-8">مفيش حاجة تتعمل لها أوردر دلوقتي</p>
          <Link
            to="/"
            className="inline-block bg-[#5A2D20] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#74412F] transition"
          >
            تسوق دلوقتي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EE] p-6 md:p-10">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* الفورم */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#5A2D20] mb-6">بيانات التوصيل</h1>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-[#5A2D20] mb-2 text-sm">الاسم</label>
              <input
                type="text"
                value={form.customerName}
                onChange={handleChange("customerName")}
                placeholder="اكتب اسمك بالكامل"
                className="w-full p-4 bg-[#F8F3EE] rounded-xl border-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#5A2D20] mb-2 text-sm">رقم الموبايل</label>
              <input
                type="tel"
                dir="ltr"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="01xxxxxxxxx"
                className="w-full p-4 bg-[#F8F3EE] rounded-xl border-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#5A2D20] mb-2 text-sm">المحافظة</label>
              <select
                value={form.governorate}
                onChange={handleChange("governorate")}
                className="w-full p-4 bg-[#F8F3EE] rounded-xl border-none"
              >
                <option value="">اختار المحافظة</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#5A2D20] mb-2 text-sm">العنوان بالتفصيل</label>
              <textarea
                rows={3}
                value={form.address}
                onChange={handleChange("address")}
                placeholder="اسم الشارع، رقم العمارة، علامة مميزة..."
                className="w-full p-4 bg-[#F8F3EE] rounded-xl border-none resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 bg-[#5A2D20] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#74412F] transition disabled:opacity-60"
          >
            {saving ? "جارِ إرسال الطلب..." : "تأكيد الطلب"}
          </button>
        </form>

        {/* ملخص الأوردر */}
        <div className="bg-white rounded-3xl shadow-lg p-8 h-fit">
          <h2 className="text-2xl font-bold text-[#5A2D20] mb-6">ملخص الطلب</h2>

          <div className="space-y-3 mb-6">
            {items.map((it) => (
              <div key={it.key} className="flex items-center gap-3">
                <img
                  src={it.image || "https://placehold.co/60x60"}
                  alt={it.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#5A2D20] text-sm truncate">{it.name}</p>
                  <p className="text-xs text-gray-500">
                    {it.size && it.size !== "ONE" ? `مقاس ${it.size} × ` : ""}الكمية: {it.qty}
                  </p>
                </div>
                <span className="font-bold text-[#A85A3A] text-sm whitespace-nowrap">
                  {it.price * it.qty} ج.م
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-lg font-bold text-[#5A2D20]">الإجمالي</span>
            <span className="text-2xl font-bold text-[#A85A3A]">{totalPrice} ج.م</span>
          </div>
        </div>
      </div>
    </div>
  );
}
