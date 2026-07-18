import React from 'react';
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7EFE8] flex flex-col">
      <Navbar />
      
      {/* الـ Outlet هنا هو المكان الذي ستظهر فيه صفحات المتجر */}
      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default CustomerLayout;
