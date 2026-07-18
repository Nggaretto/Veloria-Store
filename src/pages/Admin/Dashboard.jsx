import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    };
    fetchOrders();
  }, []);

  // حسابات الإحصائيات
  const totalOrders = orders.length;
  const returnedOrders = orders.filter(o => o.status === 'مرتجع').length;
  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(filter.toLowerCase()) || 
    order.date?.includes(filter)
  );

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-[#5A2D20] mb-8">لوحة تحكم Veloria</h1>

      {/* بطاقات الإحصائيات - تصميم سوفت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-[#5A2D20]">
          <h2 className="text-gray-500 text-sm">إجمالي الطلبات</h2>
          <p className="text-3xl font-bold text-[#5A2D20]">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm">إجمالي المبيعات</h2>
          <p className="text-3xl font-bold text-[#5A2D20]">{totalSales} ج.م</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-400">
          <h2 className="text-gray-500 text-sm">إجمالي المرتجعات</h2>
          <p className="text-3xl font-bold text-[#5A2D20]">{returnedOrders}</p>
        </div>
      </div>

      {/* الجراف التحليلي - عرض المبيعات والمرتجعات */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 h-80">
        <h3 className="text-xl font-bold text-[#5A2D20] mb-4">تحليل الأداء</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={orders.slice(-10)}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" name="المبيعات" stroke="#5A2D20" strokeWidth={3} />
            <Line type="monotone" dataKey="returns" name="المرتجعات" stroke="#EF4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* جدول الطلبات */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#5A2D20]">سجل الطلبات</h3>
          <input 
            type="text" 
            placeholder="بحث بالرقم أو التاريخ..." 
            className="p-2 border-none bg-[#F8F3EE] rounded-xl w-64 focus:ring-2 focus:ring-[#5A2D20]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="pb-3 font-medium">رقم الفاتورة</th>
                <th className="pb-3 font-medium">التاريخ</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-mono text-sm text-gray-700">{order.id.slice(0, 8)}...</td>
                  <td className="py-4 text-gray-600">{order.date || '---'}</td>
                  <td className={`py-4 font-bold ${order.status === 'مرتجع' ? 'text-red-500' : 'text-green-600'}`}>
                    {order.status || 'مكتمل'}
                  </td>
                  <td className="py-4 text-gray-700">{order.total} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
