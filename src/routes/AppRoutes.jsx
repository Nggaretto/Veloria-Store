import { Routes, Route } from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Customer/Home";
import ProductsPage from "../pages/Customer/Products";
import ProductDetails from "../pages/Customer/ProductDetails";
import About from "../pages/Customer/About";
import Contact from "../pages/Customer/Contact";
import Cart from "../pages/Customer/Cart";
import Checkout from "../pages/Customer/Checkout";
import OrderSuccess from "../pages/Customer/OrderSuccess";

import Login from "../pages/Admin/Login";
import Dashboard from "../pages/Admin/Dashboard";
import Products from "../pages/Admin/Products";
import AdminProductDetails from "../pages/Admin/AdminProductDetails";
import AddProduct from "../pages/Admin/AddProduct";
import EditProduct from "../pages/Admin/EditProduct";
import Orders from "../pages/Admin/Orders";
import OrderDetails from "../pages/Admin/OrderDetails";
import Inventory from "../pages/Admin/Inventory";
import Settings from "../pages/Admin/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="product/:id" element={<ProductDetails />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="success" element={<OrderSuccess />} />
      </Route>

      {/* Admin Routes - محمية، لازم تسجل دخول بإيميل وباسورد متسجلين على Firebase */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="products/:id" element={<AdminProductDetails />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex h-screen items-center justify-center text-3xl font-bold">
            404 | Page Not Found
          </div>
        }
      />
    </Routes>
  );
}
