import { Link } from "react-router-dom";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const { items, updateQty, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F3EE] flex items-center justify-center px-6">
        <div className="text-center bg-white rounded-3xl shadow-lg p-12 max-w-md">
          <h1 className="text-3xl font-bold text-[#5A2D20] mb-4">السلة فاضية</h1>
          <p className="text-gray-500 mb-8">لسه معملتش أوردر، تعالى شوف منتجاتنا</p>
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#5A2D20] mb-8 text-center">سلة الأوردر</h1>

        <div className="space-y-4 mb-8">
          {items.map((it) => (
            <div
              key={it.key}
              className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4"
            >
              <img
                src={it.image || "https://placehold.co/100x100"}
                alt={it.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#5A2D20]">{it.name}</h3>
                {it.size && it.size !== "ONE" && (
                  <p className="text-sm text-gray-500">مقاس {it.size}</p>
                )}
                <p className="font-bold text-[#A85A3A] mt-1">{it.price} ج.م</p>
              </div>

              <div className="flex items-center gap-2 bg-[#F8F3EE] rounded-xl px-2 py-1">
                <button
                  onClick={() => updateQty(it.key, it.qty - 1)}
                  className="p-1 text-[#5A2D20] hover:opacity-70"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center font-bold text-[#5A2D20]">{it.qty}</span>
                <button
                  onClick={() => updateQty(it.key, it.qty + 1)}
                  className="p-1 text-[#5A2D20] hover:opacity-70"
                  disabled={it.qty >= (it.maxStock || 99)}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(it.key)}
                className="text-red-500 hover:text-red-700 p-2"
                aria-label="حذف"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <span className="text-xl font-bold text-[#5A2D20]">الإجمالي</span>
          <span className="text-2xl font-bold text-[#A85A3A]">{totalPrice} ج.م</span>
        </div>

        <Link
          to="/checkout"
          className="block text-center mt-6 bg-[#5A2D20] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#74412F] transition"
        >
          إتمام الطلب
        </Link>
      </div>
    </div>
  );
}