"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { localized, shadeLabel, badgeLabel } from "@/lib/utils";
import {
  FiHeart,
  FiShoppingBag,
  FiCheck,
  FiShield,
  FiTruck,
  FiPackage,
  FiArrowLeft,
  FiShare2,
} from "react-icons/fi";

export default function ProductDetail({ initialProduct, initialRelated = [] }) {
  const router = useRouter();
  const product = initialProduct;
  const relatedProducts = initialRelated;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, lang, fp } = useLanguage();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [isAddedAnim, setIsAddedAnim] = useState(false);

  const productName = localized(product, "name", lang);
  const productDescription = localized(product, "description", lang);
  const productFeatures = localized(product, "features", lang);
  const shades = product.shades || [];
  const stock = Number.isFinite(Number(product.stockCount)) ? Number(product.stockCount) : 99;
  const canBuy = product.inStock !== false && stock > 0;
  const selectedShade = shades[selectedShadeIndex] || null;
  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80"];
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedShade, quantity);
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedShade, quantity);
    router.push("/checkout");
  };

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />

      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF3EC]/60 border-b border-[#EFE6DC] py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-[#8C7A6B]">
          <Link href="/" className="hover:text-[#D47A75] transition">
            {t("nav_home")}
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#D47A75] transition">
            {t("nav_catalog")}
          </Link>
          <span>/</span>
          <span className="text-[#3D332A] font-semibold truncate max-w-xs">
            {productName}
          </span>
        </div>
      </div>

      {/* Main Product Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Big Main Image */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#E8DDD0] shadow-md group">
              <img
                key={images[activeImageIndex]}
                src={images[activeImageIndex] || images[0]}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF3EC] text-[#8B4844] border border-[#E8DDD0] shadow-xs">
                    {badgeLabel(product.badge, lang)}
                  </span>
                )}

                {discountPercent && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wider bg-[#D47A75] text-white shadow-xs">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#3D332A] flex items-center justify-center transition shadow-md"
                title={t("nav_wishlist")}
              >
                <FiHeart
                  size={18}
                  className={
                    isFavorite
                      ? "fill-[#D47A75] text-[#D47A75]"
                      : "text-[#7E6F62] hover:text-[#D47A75]"
                  }
                />
              </button>
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${activeImageIndex === idx
                      ? "border-[#D47A75] ring-2 ring-[#D47A75]/20 opacity-100"
                      : "border-[#EFE6DC] opacity-70 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${productName} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {activeImageIndex === idx && (
                      <span className="absolute inset-0 border-2 border-[#D47A75] rounded-xl pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Quality & Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#EFE6DC] text-center text-xs text-[#7E6F62]">
              <div className="p-3 rounded-2xl bg-white border border-[#EFE6DC] space-y-1">
                <FiShield className="mx-auto text-[#D47A75]" size={18} />
                <span className="font-semibold block text-[#3D332A]">{t("product_trust_1_t")}</span>
                <span className="text-[10px] text-[#8C7A6B]">{t("product_trust_1_sub")}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#EFE6DC] space-y-1">
                <FiTruck className="mx-auto text-[#D47A75]" size={18} />
                <span className="font-semibold block text-[#3D332A]">{t("product_trust_2_t")}</span>
                <span className="text-[10px] text-[#8C7A6B]">{t("product_trust_2_d")}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#EFE6DC] space-y-1">
                <FiPackage className="mx-auto text-[#D47A75]" size={18} />
                <span className="font-semibold block text-[#3D332A]">{t("product_trust_3_t")}</span>
                <span className="text-[10px] text-[#8C7A6B]">{t("product_trust_3_d")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Collection & Rating */}
              {/* <div className="flex items-center justify-between text-xs text-[#8C7A6B] uppercase tracking-wider mb-2">
                <span className="font-semibold text-[#D47A75]">
                  {product.collection || "Flower Knows"}
                </span>
                <div className="flex items-center gap-1.5 text-[#D4AF37]">
                  <span>★★★★★</span>
                  <span className="text-[#3D332A] font-bold">{product.rating || 5.0}</span>
                  <span className="text-[#8C7A6B]">({product.reviewsCount || 0} {t("product_reviews_count")})</span>
                </div>
              </div> */}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-serif-vintage font-bold text-[#3D332A] leading-tight">
                {productName}
              </h1>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-4 mt-4">
                <span className="text-3xl sm:text-4xl font-bold text-[#3D332A]">
                  {fp(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-base text-[#9E8C7E] line-through">
                    {fp(product.oldPrice)}
                  </span>
                )}
                <span className="text-xs px-3 py-1 rounded-full bg-[#EADCCF]/40 text-[#66584C] font-semibold">
                  {canBuy ? `${t("product_stock_left")} ${stock} ${t("product_pieces")}` : t("out_of_stock")}
                </span>
              </div>
            </div>

            {/* Shades Selector */}
            {shades.length > 0 && (
              <div className="p-5 rounded-3xl bg-white border border-[#EFE6DC] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#5E5044] uppercase tracking-wider">
                    {t("product_shade_select")}
                  </span>
                  <span className="font-bold text-[#D47A75]">
                    {shadeLabel(selectedShade, lang)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {shades.map((shade, idx) => (
                    <button
                      key={shade.id || idx}
                      onClick={() => setSelectedShadeIndex(idx)}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left text-xs transition ${selectedShadeIndex === idx
                        ? "bg-[#FAF3EC] border-[#D47A75] ring-2 ring-[#D47A75]/30 font-bold"
                        : "bg-white border-[#EFE6DC] hover:border-[#D47A75]/40"
                        }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: shade.hex || "#E8DDD0" }}
                      />
                      <span className="truncate text-[#3D332A]">{shadeLabel(shade, lang)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#5E5044] uppercase tracking-wider">
                  {t("product_quantity")}
                </span>
                <div className="flex items-center rounded-2xl border border-[#E8DDD0] bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-[#FAF6F0] font-bold text-[#5E5044] text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-xs font-bold text-[#3D332A] min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stock, 99, quantity + 1))}
                    disabled={quantity >= stock}
                    title={quantity >= stock ? t("product_max_stock") : undefined}
                    className="px-4 py-2 hover:bg-[#FAF6F0] font-bold text-[#5E5044] text-sm disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs: Add to Cart & Buy Now */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!canBuy}
                  className={`disabled:opacity-50 disabled:cursor-not-allowed w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2 ${isAddedAnim
                    ? "bg-emerald-600 text-white"
                    : "bg-[#FAF3EC] hover:bg-[#F2E5D9] text-[#3D332A] border border-[#E8DDD0] hover:border-[#D47A75]"
                    }`}
                >
                  {isAddedAnim ? (
                    <>
                      <FiCheck size={18} />
                      <span>{t("added_to_cart")}</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={18} className="text-[#D47A75]" />
                      <span>{t("add_to_cart")}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="disabled:opacity-50 disabled:cursor-not-allowed w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D47A75] to-[#E8A598] hover:from-[#C46863] hover:to-[#D47A75] text-white font-bold text-xs tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>{t("product_buy_now")}</span>
                </button>
              </div>
            </div>

            {/* Information Tabs Accordion */}
            <div className="pt-6 border-t border-[#EFE6DC] space-y-4">
              <div className="flex gap-4 border-b border-[#EFE6DC] text-xs font-semibold pb-2">
                <button
                  onClick={() => setActiveTab("desc")}
                  className={`pb-1 transition ${activeTab === "desc"
                    ? "text-[#D47A75] border-b-2 border-[#D47A75] font-bold"
                    : "text-[#8C7A6B] hover:text-[#3D332A]"
                    }`}
                >
                  {t("tab_description")}
                </button>
                <button
                  onClick={() => setActiveTab("feat")}
                  className={`pb-1 transition ${activeTab === "feat"
                    ? "text-[#D47A75] border-b-2 border-[#D47A75] font-bold"
                    : "text-[#8C7A6B] hover:text-[#3D332A]"
                    }`}
                >
                  {t("tab_features")}
                </button>
                <button
                  onClick={() => setActiveTab("deliv")}
                  className={`pb-1 transition ${activeTab === "deliv"
                    ? "text-[#D47A75] border-b-2 border-[#D47A75] font-bold"
                    : "text-[#8C7A6B] hover:text-[#3D332A]"
                    }`}
                >
                  {t("tab_delivery")}
                </button>
              </div>

              <div className="text-xs text-[#66584C] leading-relaxed min-h-[80px]">
                {activeTab === "desc" && (
                  <p>{productDescription || t("product_default_desc")}</p>
                )}
                {activeTab === "feat" && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {(productFeatures.length > 0
                      ? productFeatures
                      : [t("product_default_feat_1"), t("product_default_feat_2"), t("product_default_feat_3")]
                    ).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
                {activeTab === "deliv" && (
                  <p>{t("delivery_note")}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-10 border-t border-[#EFE6DC]">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
                {product.collection}
              </span>
              <h2 className="text-2xl font-serif-vintage text-[#3D332A] mt-1">
                {t("related_products")}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
