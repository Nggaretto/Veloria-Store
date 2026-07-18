import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../../firebase/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/admin");
    } catch (error) {
      toast.error("بيانات الدخول غير صحيحة");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7EFE8] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10"
      >
        <h1 className="text-3xl font-bold text-[#5A2D20] mb-2 text-center">
          Veloria Admin
        </h1>
        <p className="text-gray-500 text-center mb-8">
          تسجيل دخول لوحة التحكم
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-5 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#A85A3A]"
          placeholder="admin@veloria.com"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          كلمة المرور
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-8 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#A85A3A]"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#5A2D20] py-3 font-semibold text-white transition hover:bg-[#74412F] disabled:opacity-60"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
