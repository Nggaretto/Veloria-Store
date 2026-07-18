import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../firebase/firebase';

const SOCIAL_DOC = doc(db, 'settings', 'social');
const ABOUT_DOC = doc(db, 'settings', 'about');

const DEFAULT_ABOUT_TEXT =
  'Veloria براند مصري متخصص في منتجات العناية بالشعر بجودة عالية وخامات طبيعية، هدفنا نوفرلك تجربة عناية فاخرة بأسعار في متناول الجميع.';

const FIELDS = [
  { key: 'whatsapp', label: 'واتساب', placeholder: 'https://wa.me/201000000000', color: '#25D366' },
  { key: 'facebook', label: 'فيسبوك', placeholder: 'https://facebook.com/veloria', color: '#1877F2' },
  { key: 'instagram', label: 'انستجرام', placeholder: 'https://instagram.com/veloria', color: '#d62976' },
  { key: 'tiktok', label: 'تيك توك', placeholder: 'https://tiktok.com/@veloria', color: '#000000' },
];

export default function Settings() {
  const [links, setLinks] = useState({ whatsapp: '', facebook: '', instagram: '', tiktok: '' });
  const [aboutText, setAboutText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [socialSnap, aboutSnap] = await Promise.all([getDoc(SOCIAL_DOC), getDoc(ABOUT_DOC)]);
        if (socialSnap.exists()) {
          setLinks((prev) => ({ ...prev, ...socialSnap.data() }));
        }
        setAboutText(aboutSnap.exists() ? (aboutSnap.data().text || '') : DEFAULT_ABOUT_TEXT);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key) => (e) =>
    setLinks((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(SOCIAL_DOC, links, { merge: true });
      toast.success('اتحفظت لينكات السوشيال ميديا');
    } catch (err) {
      toast.error('حصل خطأ وقت الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!aboutText.trim()) {
      toast.error('اكتب نص الصفحة الأول');
      return;
    }
    setSavingAbout(true);
    try {
      await setDoc(ABOUT_DOC, { text: aboutText.trim() }, { merge: true });
      toast.success('اتحفظ نص صفحة "مين إحنا"');
    } catch (err) {
      toast.error('حصل خطأ وقت الحفظ');
    } finally {
      setSavingAbout(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8F3EE] min-h-screen" dir="rtl">
      <h1 className="text-3xl font-bold text-[#5A2D20] mb-8">الإعدادات</h1>

      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl">
        <h2 className="text-xl font-bold text-[#5A2D20] mb-2">لينكات السوشيال ميديا</h2>
        <p className="text-sm text-gray-500 mb-6">
          اللينكات دي بتظهر في الفوتر وصفحة "تواصل معانا" عند العميل
        </p>

        {loading ? (
          <div className="text-center text-gray-400 py-6">جارِ التحميل...</div>
        ) : (
          <div className="space-y-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="flex items-center gap-2 font-bold text-[#5A2D20] mb-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                  {f.label}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={links[f.key] || ''}
                  onChange={handleChange(f.key)}
                  placeholder={f.placeholder}
                  className="w-full p-4 bg-[#F8F3EE] rounded-xl border-none text-sm"
                />
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 bg-[#5A2D20] text-white py-4 rounded-2xl font-bold disabled:opacity-60"
            >
              {saving ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        )}
      </div>

      {/* نص صفحة مين إحنا */}
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-2xl mt-8">
        <h2 className="text-xl font-bold text-[#5A2D20] mb-2">نص صفحة "مين إحنا"</h2>
        <p className="text-sm text-gray-500 mb-6">
          الكلام اللي بيظهر للعميل في صفحة About
        </p>

        {loading ? (
          <div className="text-center text-gray-400 py-6">جارِ التحميل...</div>
        ) : (
          <>
            <textarea
              rows={6}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="اكتب نص صفحة مين إحنا هنا..."
              className="w-full p-4 bg-[#F8F3EE] rounded-xl border-none resize-none text-sm leading-7"
            />
            <button
              onClick={handleSaveAbout}
              disabled={savingAbout}
              className="w-full mt-4 bg-[#5A2D20] text-white py-4 rounded-2xl font-bold disabled:opacity-60"
            >
              {savingAbout ? 'جارِ الحفظ...' : 'حفظ نص الصفحة'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
