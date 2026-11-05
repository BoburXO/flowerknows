"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { FiHeart } from "react-icons/fi";

export default function WishlistPage() {
  const { wishlist, wishlistReady, clearWishlist } = useWishlist();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // load the real products for the saved ids (deleted products simply disappear)
  const idsKey = wishlist.join(",");
  useEffect(() => {
    if (!wishlistReady) return;
    if (!idsKey) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/products?ids=${encodeURIComponent(idsKey)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d.success) return;
        const order = new Map(wishlist.map((id, i) => [id, i]));
        setProducts([...d.data].sort((a, b) => order.get(b.id) - order.get(a.id)));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, wishlistReady]);

  // a product un-hearted on this page leaves the grid immediately
  const visible = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />

      <div className="bg-gradient-to-r from-[#FAF3EC] via-[#F7D6D0]/40 to-[#FAF3EC] py-10 border-b border-[#EFE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
            {t("wishlist_subtitle")}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif-vintage text-[#3D332A] mt-1">
            {t("wishlist_title")} {wishlistReady && wishlist.length > 0 ? `(${wishlist.length})` : ""}
          </h1>
          <p className="text-xs sm:text-sm text-[#7E6F62] mt-2 max-w-xl mx-auto">{t("wishlist_desc")}</p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!wishlistReady || loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-2 border-[#D47A75] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#8C7A6B]">{t("wishlist_loading")}</p>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-[#EFE6DC] p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-[#FAF3EC] text-[#D47A75] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FiHeart size={36} />
            </div>
            <h2 className="text-2xl font-serif-vintage font-bold text-[#3D332A]">{t("wishlist_empty")}</h2>
            <p className="text-xs text-[#8C7A6B] leading-relaxed">{t("wishlist_empty_desc")}</p>
            <Link
              href="/catalog"
              className="px-8 py-3 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-md hover:bg-[#C46863] transition inline-block"
            >
              {t("cart_go_catalog")}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8">
              <button
                onClick={clearWishlist}
                className="text-xs text-[#8C7A6B] hover:text-red-500 font-semibold"
              >
                {t("wishlist_clear")}
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
