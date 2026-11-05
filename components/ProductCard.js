
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { localized, shadeLabel, badgeLabel } from "@/lib/utils";
import {
  FiHeart,
  FiEye,
  FiShoppingBag,
  FiCheck,
  FiArrowUpRight,
} from "react-icons/fi";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, lang, fp } = useLanguage();
  const productName = localized(product, "name", lang);

  const [selectedShadeIndex, setSelectedShadeIndex] = useState(0);
  const [isAddedAnim, setIsAddedAnim] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const shades = product.shades || [];
  const images = product.images || [];
  const selectedShade = shades[selectedShadeIndex] || null;
  const isFavorite = isInWishlist(product.id);

  const discountPercent =
    product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : null;

  useEffect(() => {
    if (!isAddedAnim) return;

    const timer = setTimeout(() => setIsAddedAnim(false), 1400);
    return () => clearTimeout(timer);
  }, [isAddedAnim]);

  const stopEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAddToCart = (e) => {
    stopEvent(e);

    if (!product.inStock) return;

    addToCart(product, selectedShade, 1);
    setIsAddedAnim(true);
  };

  const handleWishlist = (e) => {
    stopEvent(e);
    toggleWishlist(product.id);
  };

  const activeImage = images[imageIndex] || images[0];

  const handleImageEnter = () => {
  if (images.length > 1) {
    setImageIndex(1);
    setImageError(false);
  }
};

const handleImageLeave = () => {
  setImageIndex(0);
  setImageError(false);
};

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#F0E3DF] bg-[#FFFCFA] transition-all duration-500 hover:-translate-y-1 hover:border-[#E8C9C9] hover:shadow-[0_18px_45px_rgba(177,135,137,0.13)] sm:rounded-[28px]">

    {/* Product image */}
<div
  className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0]"
  onMouseEnter={handleImageEnter}
  onMouseLeave={handleImageLeave}
>
  <Link
    href={`/product/${product.id}`}
    className="block h-full w-full"
  >
    {activeImage && !imageError ? (
      <img
        src={activeImage}
        alt={productName}
        onError={() => setImageError(true)}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-[#C5A6A1]">
        <FiShoppingBag size={34} strokeWidth={1} />
        <span className="font-serif text-sm tracking-[3px]">
          Flower Knows
        </span>
      </div>
    )}
  </Link>

  {/* Top labels */}
  <div className="absolute left-3 top-3 flex max-w-[70%] flex-col items-start gap-1.5 sm:left-4 sm:top-4">
    {product.badge && (
      <span className="rounded-full border border-[#EBD8D2] bg-[#FFFAF7]/95 px-2.5 py-1.5 text-[8px] font-medium uppercase tracking-[1.2px] text-[#9F7774] sm:text-[9px]">
        {badgeLabel(product.badge, lang)}
      </span>
    )}

    {discountPercent && (
      <span className="rounded-full bg-[#D9A5A5] px-2.5 py-1.5 text-[9px] font-medium tracking-wide text-white">
        −{discountPercent}%
      </span>
    )}
  </div>

  {/* Wishlist */}
  <button
    type="button"
    onClick={handleWishlist}
    aria-label={t("card_wishlist_aria")}
    title={t("card_wishlist_aria")}
    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 sm:right-4 sm:top-4 sm:h-10 sm:w-10 ${
      isFavorite
        ? "border-[#E4B8B8] bg-[#FFF5F4] text-[#C77F85]"
        : "border-white/80 bg-white/80 text-[#A68C87] hover:border-[#E4B8B8] hover:text-[#C77F85]"
    }`}
  >
    <FiHeart
      size={17}
      strokeWidth={1.5}
      fill={isFavorite ? "currentColor" : "none"}
    />
  </button>

  {/* Quick view */}
  <Link
    href={`/product/${product.id}`}
    className="absolute bottom-4 left-4 right-4 hidden translate-y-2 items-center justify-center gap-2 rounded-full border border-[#F0E0DB] bg-[#FFFCFA]/95 py-3 text-[11px] font-medium tracking-wide text-[#8F6F6A] opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white group-hover:translate-y-0 group-hover:opacity-100 sm:flex"
  >
    <FiEye size={15} strokeWidth={1.5} />
    {t("view_product")}
    <FiArrowUpRight size={14} />
  </Link>
</div>

      {/* Product details */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5 sm:gap-4 sm:p-5">

        <div className="space-y-3">

          {/* Collection and rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[9px] font-medium uppercase tracking-[1.5px] text-[#B39A91] sm:text-[10px]">
              {product.collection || "Flower Knows"}
            </span>

            {/* <div className="flex shrink-0 items-center gap-1 text-[10px] text-[#9C8279]">
              <span className="text-[#D7B67D]">★</span>
              <span>{product.rating || "5.0"}</span>
              <span className="text-[#C9B7AF]">
                ({product.reviewsCount || 12})
              </span>
            </div> */}
          </div>

          {/* Name */}
          <Link
            href={`/product/${product.id}`}
            className="block"
          >
            <h3 className="line-clamp-2 min-h-[42px] font-serif text-[15px] font-medium leading-[1.55] tracking-[0.1px] text-[#594641] transition-colors duration-300 group-hover:text-[#B77E80] sm:min-h-[48px] sm:text-[17px]">
              {productName}
            </h3>
          </Link>

          {/* Shades */}
          {shades.length > 0 && (
            <div className="space-y-2.5 border-t border-[#F3E9E4] pt-3">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[10px] tracking-wide text-[#A58B82]">
                  {shadeLabel(selectedShade, lang) || t("card_select_shade")}
                </span>

                <span className="shrink-0 text-[9px] text-[#C1A9A0]">
                  {t("card_shades")} {shades.length}
                </span>
              </div>

              <div className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-2">
                {shades.slice(0, 5).map((shade, idx) => (
                  <button
                    key={shade.id || idx}
                    type="button"
                    onClick={(e) => {
                      stopEvent(e);
                      setSelectedShadeIndex(idx);
                    }}
                    title={shadeLabel(shade, lang)}
                    aria-label={shadeLabel(shade, lang)}
                    className={`h-3.5 w-3.5 rounded-full border border-black/[0.06] transition-all duration-200 hover:scale-110 ${
                      selectedShadeIndex === idx
                        ? "outline outline-1 outline-offset-[3px] outline-[#C68D8C]"
                        : ""
                    }`}
                    style={{
                      backgroundColor: shade.hex || "#E8DDD0",
                    }}
                  />
                ))}

                {shades.length > 5 && (
                  <span className="text-[10px] text-[#B49A91]">
                    +{shades.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price and button */}
        <div className="space-y-3 border-t border-[#F0E4DF] pt-3.5 sm:pt-4">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-serif text-[17px] font-medium tracking-wide text-[#594641] sm:text-[19px]">
              {fp(product.price)}
            </span>

            {product.oldPrice > product.price && (
              <del className="text-[11px] text-[#C3ADA5]">
                {fp(product.oldPrice)}
              </del>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAddToCart}
            className={`flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-[10px] font-medium uppercase tracking-[1px] transition-all duration-300 sm:min-h-[45px] sm:text-[11px] ${
              !product.inStock
                ? "cursor-not-allowed border-[#EDE5E1] bg-[#F5F0ED] text-[#B9ACA6]"
                : isAddedAnim
                ? "border-[#B7C6B1] bg-[#E7EEE3] text-[#657A5D]"
                : "border-[#E9D5D0] bg-[#F9EFEC] text-[#906C68] hover:border-[#C68D8C] hover:bg-[#D7A5A3] hover:text-white active:scale-[0.98]"
            }`}
          >
            {isAddedAnim ? (
              <>
                <FiCheck size={15} />
                {t("added_to_cart")}
              </>
            ) : product.inStock ? (
              <>
                <FiShoppingBag size={15} strokeWidth={1.5} />
                {t("add_to_cart")}
              </>
            ) : (
              t("out_of_stock")
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
