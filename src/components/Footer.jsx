import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="bg-[#5A2D20] text-white py-10 text-center">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-5">
        <SocialLinks />
        <p className="text-white/80 text-sm">
          © 2026 Veloria. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
