// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAeAld-bvewboCVAyxLwouPoF_nGK5ubdg",
  authDomain: "veloria-1cd69.firebaseapp.com",
  projectId: "veloria-1cd69",
  storageBucket: "veloria-1cd69.firebasestorage.app",
  messagingSenderId: "773422861275",
  appId: "1:773422861275:web:66bd24fa6b163d906335fe",
  measurementId: "G-QWF1K7QDJK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// ملحوظة: Firebase Storage اتشال من هنا لأنه بقى بيحتاج خطة Blaze
// وبنستخدم ImgBB بدل منه لرفع الصور (شوف Products.jsx)

// Analytics بيتعمل له init بس لو الـ browser بيدعمه (بيبوظ في بعض البيئات)
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});

export default app;