import SocialLinks from "../../components/SocialLinks";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#F8F3EE] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-lg p-10 text-center">
        <h1 className="text-4xl font-bold text-[#5A2D20] mb-6">
          تواصل معانا
        </h1>
        <p className="text-gray-600 mb-8">
          تقدر توصلنا بسهولة من خلال أي وسيلة من دول
        </p>

        <div className="flex justify-center">
          <SocialLinks className="text-[#5A2D20] [&_a]:bg-[#5A2D20]/10" />
        </div>
      </div>
    </div>
  );
}
