import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const SIZES = ["S", "M", "L"];

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const activeSizes = product.hasMultipleSizes
    ? SIZES.filter((s) => product.sizes?.[s]?.active)
    : [];

  const [selectedSize, setSelectedSize] = useState(activeSizes[0] || null);

  const hasDiscount = Boolean(product.discount?.active && Number(product.discount?.percent) > 0);
  const discountPercent = Number(product.discount?.percent || 0);

  const getBasePriceStock = () => {
    if (product.hasMultipleSizes) {
      const s = selectedSize ? product.sizes?.[selectedSize] : null;
      return {
        price: Number(s?.price || 0),
        stock: Number(s?.stock || 0),
      };
    }
    return {
      price: Number(product.singleSize?.price || 0),
      stock: Number(product.singleSize?.stock || 0),
    };
  };

  const { price: basePrice, stock } = getBasePriceStock();
  const finalPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;

  const outOfStock = product.hasMultipleSizes ? activeSizes.length === 0 || stock <= 0 : stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addToCart(
      product,
      product.hasMultipleSizes ? selectedSize : product.singleSize?.size || "ONE",
      1,
      finalPrice,
      stock
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
      <Link to={`/product/${product.id}`} className="relative block">
        <img
          src={product.images?.[0] || "https://placehold.co/400x400"}
          alt={product.name}
          className="w-full h-56 object-cover"
        />
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-[#A85A3A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            خصم {discountPercent}%
          </span>
        )}
      </Link>
      <div className="p-5 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-lg text-[#5A2D20] mb-1 hover:text-[#A85A3A] transition">{product.name}</h3>
        </Link>
        {product.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        )}

        {product.hasMultipleSizes && activeSizes.length > 0 && (
          <div className="flex gap-2 mb-3">
            {activeSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 rounded-lg text-sm font-bold border transition ${
                  selectedSize === s
                    ? "bg-[#5A2D20] text-white border-[#5A2D20]"
                    : "bg-[#F8F3EE] text-[#5A2D20] border-transparent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 mt-auto">
          {basePrice === 0 ? (
            <span className="font-bold text-[#A85A3A] text-lg">—</span>
          ) : hasDiscount ? (
            <span className="flex items-baseline gap-2">
              <span className="text-gray-400 line-through text-sm">{basePrice} ج.م</span>
              <span className="font-bold text-[#A85A3A] text-lg">{finalPrice} ج.م</span>
            </span>
          ) : (
            <span className="font-bold text-[#A85A3A] text-lg">{basePrice} ج.م</span>
          )}
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold ${
              outOfStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {outOfStock ? "نفدت الكمية" : `متوفر: ${stock}`}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="bg-[#5A2D20] text-white py-3 rounded-xl font-bold hover:bg-[#74412F] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          أضف للسلة
        </button>
      </div>
    </div>
  );
}