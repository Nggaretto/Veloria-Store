import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);
const STORAGE_KEY = "veloria_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // بيضيف منتج للسلة. لو نفس المنتج بنفس المقاس موجود بيزود الكمية بس
  const addToCart = (product, size, qty = 1, price, maxStock) => {
    const key = `${product.id}__${size || "ONE"}`;

    setItems((prev) => {
      const existing = prev.find((it) => it.key === key);

      if (existing) {
        const newQty = Math.min(existing.qty + qty, maxStock || 99);
        return prev.map((it) =>
          it.key === key ? { ...it, qty: newQty } : it
        );
      }

      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          image: product.images?.[0] || "",
          size: size || null,
          price: Number(price) || 0,
          qty: Math.min(qty, maxStock || 99),
          maxStock: maxStock || 99,
        },
      ];
    });

    toast.success("اتضاف للسلة");
  };

  const updateQty = (key, qty) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.key === key
            ? { ...it, qty: Math.max(1, Math.min(qty, it.maxStock || 99)) }
            : it
        )
        .filter((it) => it.qty > 0)
    );
  };

  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, it) => sum + it.qty, 0);
  const totalPrice = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}