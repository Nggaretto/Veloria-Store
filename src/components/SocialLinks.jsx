import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const DEFAULT_LINKS = {
  whatsapp: "https://wa.me/201000000000",
  facebook: "https://facebook.com/veloria",
  instagram: "https://instagram.com/veloria",
  tiktok: "https://tiktok.com/@veloria",
};

export default function SocialLinks({ className = "" }) {
  const [links, setLinks] = useState(DEFAULT_LINKS);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "social"));
        if (snap.exists()) {
          const data = snap.data();
          setLinks((prev) => ({
            whatsapp: data.whatsapp || prev.whatsapp,
            facebook: data.facebook || prev.facebook,
            instagram: data.instagram || prev.instagram,
            tiktok: data.tiktok || prev.tiktok,
          }));
        }
      } catch {
        // في حالة أي خطأ في الاتصال، بنسيب اللينكات الافتراضية
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* WhatsApp Link */}
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-[#25D366] hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.85.508 3.583 1.393 5.07L2 22l5.094-1.36A9.94 9.94 0 0 0 12 22c5.523 0 10-4.477 10-10S17.524 2 12.001 2zm0 18.09c-1.66 0-3.213-.45-4.548-1.235l-.326-.193-3.026.808.81-2.949-.213-.303A8.06 8.06 0 0 1 3.91 12c0-4.465 3.63-8.09 8.09-8.09 4.465 0 8.09 3.63 8.09 8.09 0 4.465-3.625 8.09-8.09 8.09z" />
        </svg>
      </a>

      {/* Facebook Link */}
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-[#1877F2] hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94z" />
        </svg>
      </a>

      {/* Instagram Link */}
      <a
        href={links.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-gradient-to-tr hover:from-[#feda75] hover:via-[#d62976] hover:to-[#4f5bd5] hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2c-2.717 0-3.056.012-4.123.06-1.064.049-1.791.218-2.427.465a4.9 4.9 0 0 0-1.771 1.153A4.9 4.9 0 0 0 2.525 5.45c-.247.636-.416 1.363-.465 2.427C2.012 8.944 2 9.283 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.427a4.9 4.9 0 0 0 1.153 1.771 4.9 4.9 0 0 0 1.771 1.153c.636.247 1.363.416 2.427.465C8.944 21.988 9.283 22 12 22s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.427-.465a4.9 4.9 0 0 0 1.771-1.153 4.9 4.9 0 0 0 1.153-1.771c.247-.636.416-1.363.465-2.427.048-1.067.058-1.406.058-4.123s-.01-3.056-.058-4.123c-.049-1.064-.218-1.791-.465-2.427a4.9 4.9 0 0 0-1.153-1.771A4.9 4.9 0 0 0 18.55 2.525c-.636-.247-1.363-.416-2.427-.465C15.056 2.012 14.717 2 12 2zm0 1.802c2.67 0 2.987.01 4.042.059.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.858.048 1.055.058 1.372.058 4.042s-.01 2.987-.058 4.042c-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 0 1-.748 1.15 3.1 3.1 0 0 1-1.15.748c-.353.137-.882.3-1.858.344-1.054.048-1.371.058-4.042.058s-2.987-.01-4.042-.058c-.976-.045-1.505-.207-1.858-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.055-.058-1.372-.058-4.042s.01-2.987.058-4.042c.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15a3.1 3.1 0 0 1 1.15-.748c.353-.137.882-.3 1.858-.344C9.013 3.812 9.33 3.802 12 3.802zm0 3.064a5.134 5.134 0 1 0 0 10.268 5.134 5.134 0 0 0 0-10.268zm0 8.468a3.334 3.334 0 1 1 0-6.668 3.334 3.334 0 0 1 0 6.668zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
        </svg>
      </a>

      {/* TikTok Link */}
      <a
        href={links.tiktok}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:scale-110 hover:bg-black hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M16.6 5.82c-1-.99-1.55-2.32-1.55-3.7h-3.13v13.4c0 1.62-1.32 2.94-2.94 2.94a2.94 2.94 0 0 1-2.94-2.94 2.94 2.94 0 0 1 2.94-2.94c.24 0 .48.03.7.08V9.53a6.14 6.14 0 0 0-.7-.04A6.11 6.11 0 0 0 3 15.6a6.11 6.11 0 0 0 6.11 6.11 6.11 6.11 0 0 0 6.11-6.11V9.01a8.6 8.6 0 0 0 5.02 1.61V7.5c-1.35 0-2.6-.43-3.64-1.68z" />
        </svg>
      </a>
    </div>
  );
}
