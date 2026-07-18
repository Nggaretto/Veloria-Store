import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// ⚠️ حط شعارك باسم logo.png جوا فولدر public عشان يظهر في الفاتورة
const LOGO_PATH = '/logo.png';

// مراحل تتبع الأوردر بالترتيب. كل مرحلة عندها اسم الحالة اللي بتتخزن في Firestore + التاريخ المرتبط بيها
const STATUS_FLOW = [
  { key: 'received', label: 'تم استلام الطلب', dateField: 'receivedAt' },
  { key: 'preparing', label: 'تم التجهيز - في انتظار الشحن', dateField: 'preparingAt' },
  { key: 'shipped', label: 'تم الشحن', dateField: 'shippedAt' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'كل الأوردرات' },
  { key: 'new', label: 'جديد' },
  ...STATUS_FLOW.map(s => ({ key: s.key, label: s.label })),
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'orders'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // الأحدث فوق
    list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setOrders(list);
    setLoading(false);
  };

  const currentStatusIndex = (order) => STATUS_FLOW.findIndex(s => s.key === order.status);

  const orderTotal = (order) => {
    if (order.total) return Number(order.total);
    return (order.items || []).reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1), 0);
  };

  const advanceStatus = async (order) => {
    const idx = currentStatusIndex(order);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;

    setSavingId(order.id);
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: next.key,
        [next.dateField]: new Date().toISOString(),
      });
      await fetchOrders();
    } finally {
      setSavingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'new') return orders.filter(o => !o.status);
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  // ================= فتح نافذة طباعة الفاتورة (شكل بريميوم) =================
  const printInvoice = (order) => {
    const items = order.items || [];
    const invoiceNo = String(order.id).slice(-8).toUpperCase();
    const orderDate = order.createdAt?.seconds
      ? new Date(order.createdAt.seconds * 1000)
      : new Date();
    const dateStr = orderDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    const statusLabel = (() => {
      const idx = currentStatusIndex(order);
      if (idx === -1) return 'طلب جديد';
      return STATUS_FLOW[idx].label;
    })();

    const rows = items.map((it, i) => `
      <tr class="${i % 2 === 0 ? 'row-a' : 'row-b'}">
        <td class="cell-name">${it.name || ''}${it.size ? `<span class="size-tag">مقاس ${it.size}</span>` : ''}</td>
        <td class="center">${it.quantity || 1}</td>
        <td class="center">${Number(it.price || 0).toLocaleString('ar-EG')} ج.م</td>
        <td class="center strong">${(Number(it.price || 0) * Number(it.quantity || 1)).toLocaleString('ar-EG')} ج.م</td>
      </tr>`).join('');

    const total = orderTotal(order);

    const html = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>فاتورة ${invoiceNo}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,600;1,500&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Cairo', 'Tahoma', sans-serif;
            color: #3a2418;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .sheet {
            max-width: 760px;
            margin: 0 auto;
            padding: 50px 55px;
            position: relative;
          }
          .gold-bar { height: 6px; background: linear-gradient(90deg, #5A2D20, #C99A5B, #5A2D20); }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 34px 0 24px;
            border-bottom: 2px solid #ECE1D4;
          }
          .brand { display: flex; align-items: center; gap: 16px; }
          .brand img { max-height: 64px; max-width: 140px; object-fit: contain; }
          .brand-name { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #5A2D20; letter-spacing: .5px; }
          .invoice-meta { text-align: left; }
          .invoice-meta .title {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-size: 30px;
            color: #5A2D20;
            margin: 0 0 6px;
          }
          .invoice-meta .num { font-size: 13px; color: #8a7563; letter-spacing: 1px; }
          .invoice-meta .badge {
            display: inline-block; margin-top: 10px; padding: 5px 14px;
            border: 1px solid #C99A5B; color: #8a5a20; border-radius: 20px;
            font-size: 11px; font-weight: 700; letter-spacing: .5px;
          }

          .section-title {
            font-size: 11px; letter-spacing: 1.5px; color: #B08654; text-transform: uppercase;
            font-weight: 700; margin: 30px 0 12px;
          }
          .info-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 14px 40px;
            font-size: 14px; padding: 20px 24px; background: #FBF7F1; border-radius: 14px;
          }
          .info-grid div b { display: block; font-size: 11px; color: #B08654; font-weight: 700; margin-bottom: 3px; }
          .info-grid div span { color: #3a2418; font-weight: 600; }

          table { width: 100%; border-collapse: collapse; margin-top: 26px; }
          thead th {
            background: #5A2D20; color: #F8F3EE; font-size: 12px; font-weight: 700;
            padding: 12px 14px; text-align: center;
          }
          thead th:first-child { text-align: right; border-radius: 8px 0 0 8px; }
          thead th:last-child { border-radius: 0 8px 8px 0; }
          td { padding: 13px 14px; font-size: 13.5px; }
          .cell-name { text-align: right; font-weight: 600; }
          .size-tag {
            display: inline-block; margin-right: 8px; font-size: 10.5px; font-weight: 700;
            color: #8a5a20; background: #F3E6D3; padding: 2px 9px; border-radius: 10px;
          }
          .center { text-align: center; color: #5a473c; }
          .strong { font-weight: 800; color: #5A2D20; }
          .row-a { background: #fff; }
          .row-b { background: #FBF7F1; }

          .totals { display: flex; justify-content: flex-end; margin-top: 22px; }
          .totals-box { width: 260px; }
          .totals-box .line { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13.5px; color: #5a473c; border-bottom: 1px dashed #E3D6C4; }
          .totals-box .grand {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 10px; padding: 14px 18px; background: #5A2D20; border-radius: 12px;
            color: #F8F3EE;
          }
          .totals-box .grand .label { font-size: 13px; font-weight: 600; }
          .totals-box .grand .amount { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: #E8C98F; }

          .footer {
            margin-top: 46px; padding-top: 22px; border-top: 2px solid #ECE1D4;
            text-align: center;
          }
          .footer .thanks { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 19px; color: #5A2D20; margin-bottom: 6px; }
          .footer .sub { font-size: 11.5px; color: #a3907e; }

          @media print {
            .sheet { padding: 20px 40px; }
            @page { margin: 12mm; }
          }
        </style>
      </head>
      <body>
        <div class="gold-bar"></div>
        <div class="sheet">
          <div class="header">
            <div class="brand">
              <img src="${LOGO_PATH}" onerror="this.style.display='none'" />
            </div>
            <div class="invoice-meta">
              <p class="title">Invoice</p>
              <div class="num">رقم الفاتورة: ${invoiceNo} &nbsp;•&nbsp; ${dateStr}</div>
              <span class="badge">${statusLabel}</span>
            </div>
          </div>

          <div class="section-title">بيانات العميل</div>
          <div class="info-grid">
            <div><b>اسم العميل</b><span>${order.customerName || '—'}</span></div>
            <div><b>رقم الموبايل</b><span>${order.phone || '—'}</span></div>
            <div><b>المحافظة</b><span>${order.governorate || '—'}</span></div>
            <div><b>العنوان</b><span>${order.address || '—'}</span></div>
          </div>

          <div class="section-title">تفاصيل الطلب</div>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="totals">
            <div class="totals-box">
              <div class="grand">
                <span class="label">الإجمالي الكلي</span>
                <span class="amount">${total.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p class="thanks">شكراً لثقتكم بنا</p>
            <p class="sub">هذه الفاتورة صادرة إلكترونياً ولا تحتاج توقيع أو ختم</p>
          </div>
        </div>
        <div class="gold-bar"></div>
      </body>
      </html>`;

    const win = window.open('', '_blank', 'width=850,height=1000');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400); // مهلة بسيطة عشان الخط واللوجو يحملوا الأول
  };

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-[#5A2D20] mb-6">إدارة الأوردرات</h1>

      {/* فلاتر الحالة */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition ${
              filter === f.key ? 'bg-[#5A2D20] text-white' : 'bg-white text-[#5A2D20] shadow'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-400">جارِ التحميل...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-lg text-center text-gray-400">لا توجد أوردرات هنا</div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const idx = currentStatusIndex(order);
            const nextStep = STATUS_FLOW[idx + 1];
            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                {/* رأس الفاتورة */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <img src={LOGO_PATH} alt="logo" className="h-12 object-contain" onError={(e) => (e.target.style.display = 'none')} />
                    <div>
                      <div className="font-bold text-[#5A2D20]">أوردر رقم: {order.id}</div>
                      <div className="text-xs text-gray-400">
                        {order.createdAt?.seconds
                          ? new Date(order.createdAt.seconds * 1000).toLocaleString('ar-EG')
                          : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => printInvoice(order)}
                    className="bg-[#F8F3EE] text-[#5A2D20] px-5 py-2 rounded-xl font-bold text-sm"
                  >
                    طباعة الفاتورة
                  </button>
                </div>

                {/* بيانات العميل */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 text-sm">
                  <div><b className="text-[#5A2D20]">اسم العميل: </b>{order.customerName || '—'}</div>
                  <div><b className="text-[#5A2D20]">رقم الموبايل: </b>{order.phone || '—'}</div>
                  <div><b className="text-[#5A2D20]">المحافظة: </b>{order.governorate || '—'}</div>
                  <div><b className="text-[#5A2D20]">العنوان: </b>{order.address || '—'}</div>
                </div>

                {/* المنتجات */}
                <div className="px-6 pb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#5A2D20] bg-[#F8F3EE]">
                        <th className="p-2 text-right rounded-r-xl">المنتج</th>
                        <th className="p-2 text-right">الكمية</th>
                        <th className="p-2 text-right">السعر</th>
                        <th className="p-2 text-right rounded-l-xl">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((it, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="p-2">{it.name}{it.size ? ` (مقاس ${it.size})` : ''}</td>
                          <td className="p-2">{it.quantity || 1}</td>
                          <td className="p-2">{Number(it.price || 0)} ج.م</td>
                          <td className="p-2 font-bold">{Number(it.price || 0) * Number(it.quantity || 1)} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-left font-bold text-[#5A2D20] mt-3">
                    الإجمالي الكلي: {orderTotal(order)} ج.م
                  </div>
                </div>

                {/* تتبع الحالة */}
                <div className="p-6 bg-[#F8F3EE] flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {STATUS_FLOW.map((s, i) => (
                      <div key={s.key} className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full inline-block ${
                            i <= idx ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <span className={`text-xs font-bold ${i <= idx ? 'text-green-700' : 'text-gray-400'}`}>
                          {s.label}
                        </span>
                        {i < STATUS_FLOW.length - 1 && <span className="text-gray-300">—</span>}
                      </div>
                    ))}
                  </div>

                  {nextStep ? (
                    <button
                      onClick={() => advanceStatus(order)}
                      disabled={savingId === order.id}
                      className="bg-[#5A2D20] text-white px-6 py-3 rounded-2xl font-bold text-sm disabled:opacity-60"
                    >
                      {savingId === order.id ? 'جارِ الحفظ...' : nextStep.label}
                    </button>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-bold text-sm">
                      اتشحنت ✅
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
