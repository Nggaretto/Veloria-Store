import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const DEFAULT_ABOUT_TEXT =
  "Veloria براند مصري متخصص في منتجات العناية بالشعر بجودة عالية وخامات طبيعية، هدفنا نوفرلك تجربة عناية فاخرة بأسعار في متناول الجميع.";

export default function About() {
  const [text, setText] = useState(DEFAULT_ABOUT_TEXT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "about"));
        if (snap.exists() && snap.data().text) {
          setText(snap.data().text);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F3EE] flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl bg-white rounded-3xl shadow-lg p-10 text-center">
        <img
          src="/logo.png"
          alt="Veloria"
          className="h-32 w-32 mx-auto rounded-full object-cover shadow-lg ring-4 ring-[#F8F3EE] mb-8"
        />

        <h1 className="text-4xl font-bold text-[#5A2D20] mb-6">
          مين إحنا
        </h1>

        {loading ? (
          <p className="text-gray-400">جارِ التحميل...</p>
        ) : (
          <p className="text-gray-600 leading-8 text-lg whitespace-pre-line">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}