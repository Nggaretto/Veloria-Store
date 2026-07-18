import React from 'react';
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#5A2D20]/90 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="logo.png"
            alt="Veloria"
            className="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-white/30"
          />
          <span className="text-2xl font-bold tracking-wide text-[#F8F3EE]">
            Veloria
          </span>
        </Link>
        <nav className="hidden gap-8 font-medium md:flex">
          <Link to="/" className="transition hover:text-[#E8C7A0]">Home</Link>
          <Link to="/products" className="transition hover:text-[#E8C7A0]">Products</Link>
          <Link to="/about" className="transition hover:text-[#E8C7A0]">About</Link>
          <Link to="/contact" className="transition hover:text-[#E8C7A0]">Contact</Link>
        </nav>
        <Link
          to="/cart"
          className="relative rounded-full bg-[#A85A3A] p-3 shadow-md transition hover:scale-105 hover:shadow-lg"
        >
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8C7A0] px-1 text-xs font-bold text-[#5A2D20]">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
