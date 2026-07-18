import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#5A2D20] text-white p-6">
        <h1 className="text-3xl font-bold mb-10">
          Veloria Admin
        </h1>

        <nav className="space-y-4">
          <Link to="/admin" className="block hover:text-[#E8C7A0]">
            Dashboard
          </Link>

          <Link to="/admin/products" className="block hover:text-[#E8C7A0]">
            Products
          </Link>

          <Link to="/admin/orders" className="block hover:text-[#E8C7A0]">
            Orders
          </Link>

          <Link to="/admin/inventory" className="block hover:text-[#E8C7A0]">
            Inventory
          </Link>

          <Link to="/admin/settings" className="block hover:text-[#E8C7A0]">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
