import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFoundText from "@/components/NotFoundText";

export const metadata = { title: "404", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-12 text-center">
        <div className="space-y-4">
          <div className="text-4xl text-[#D47A75]">🌸</div>
          <NotFoundText />
          <Link
            href="/catalog"
            className="inline-block px-6 py-2.5 rounded-full bg-[#D47A75] text-white text-xs font-semibold shadow-xs"
          >
            <NotFoundText button />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
