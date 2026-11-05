"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { localized, itemShadeLabel } from "@/lib/utils";
import {
  FiTrash2,
  FiShoppingBag,
  FiArrowRight,
  FiTruck,
  FiArrowLeft,
  FiTag,
} from "react-icons/fi";

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    freeShippingThreshold,
    isFreeShipping,
    shippingCost,
    totalAmount,
    totalItemsCount,
    cartReady,
    cartNotice,
    dismissCartNotice,
  } = useCart();
  const { t, lang, fp } = useLanguage();

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "ROCOCO" || promoCode.trim().toUpperCase() === "FLOWER") {
      const discount = Math.round(subtotal * 0.1);
      setPromoDiscount(discount);
      setPromoMsg(t("cart_promo_success"));
    } else {
      setPromoDiscount(0);
      setPromoMsg(t("cart_promo_invalid"));
    }
  };

  const diffForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const finalTotal = Math.max(0, totalAmount - promoDiscount);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EFE6DC] mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#D47A75] font-semibold">
              {t("cart_eyebrow")}
            </span>
            <h1 className="text-3xl font-serif-vintage text-[#3D332A] font-bold mt-1">
              {t("cart_title")} ({totalItemsCount})
            </h1>
          </div>

          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#7E6F62] hover:text-[#D47A75] font-semibold"
          >
            <FiArrowLeft />
            <span>{t("cart_continue_shopping")}</span>
          </Link>
        </div>

        {!cartReady ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-2 border-[#D47A75] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#8C7A6B]">{t("cart_loading")}</p>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-[#EFE6DC] p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-[#FAF3EC] text-[#D47A75] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FiShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-serif-vintage font-bold text-[#3D332A]">
              {t("cart_empty")}
            </h2>
            <p className="text-xs text-[#8C7A6B] leading-relaxed">
              {t("cart_empty_desc")}
            </p>
            <div className="pt-2">
              <Link
                href="/catalog"
                className="px-8 py-3 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-md hover:bg-[#C46863] transition inline-block"
              >
                {t("cart_go_catalog")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {cartNotice && (
                <div className="p-3.5 rounded-2xl bg-[#FCEEE9] border border-[#E8DDD0] text-xs text-[#8B4844] font-semibold flex items-start justify-between gap-3">
                  <span>{t("cart_updated_notice")}</span>
                  <button onClick={dismissCartNotice} className="font-bold hover:text-[#D47A75]" aria-label="OK">
                    ×
                  </button>
                </div>
              )}
              {/* Free Delivery Bar */}
              {/* <div className="p-4 rounded-2xl bg-white border border-[#EFE6DC] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#66584C] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <FiTruck className="text-[#D47A75]" size={16} />
                    {isFreeShipping
                      ? t("free_shipping_reached")
                      : `${t("free_shipping_left")} ${fp(diffForFree)}`}
                  </span>
                  <span className="text-[#D47A75] font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#FAF3EC] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#E8A598] to-[#D47A75] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div> */}

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-[#EFE6DC] shadow-xs divide-y divide-[#FAF6F0] overflow-hidden">
                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-[#FAF6F0]/40 transition"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#EFE6DC]">
                        <img
                          src={item.image}
                          alt={localized(item, "name", lang)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="font-serif-vintage font-bold text-sm text-[#3D332A] hover:text-[#D47A75] transition line-clamp-1">
                            {localized(item, "name", lang)}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-[#8C7A6B]">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: item.shadeHex || "#E8DDD0" }}
                          />
                          <span>{itemShadeLabel(item, lang)}</span>
                        </div>
                        <span className="text-xs font-bold text-[#D47A75] block sm:hidden">
                          {fp(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <div className="flex items-center rounded-xl border border-[#E8DDD0] bg-[#FAF6F0] overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-white text-[#5E5044] font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-[#3D332A] min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          disabled={item.stock != null && item.quantity >= item.stock}
                          title={item.stock != null && item.quantity >= item.stock ? t("product_max_stock") : undefined}
                          className="px-3 py-1 hover:bg-white text-[#5E5044] font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <div className="hidden sm:block text-right min-w-[100px]">
                        <span className="text-sm font-bold text-[#3D332A] block">
                          {fp(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-[#8C7A6B]">
                            {item.quantity} × {fp(item.price)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="p-2 text-[#9E8C7E] hover:text-red-500 transition"
                        title={t("cart_remove")}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs text-[#8C7A6B] hover:text-red-500 font-semibold"
                >
                  {t("cart_clear")}
                </button>
                <Link
                  href="/catalog"
                  className="text-xs text-[#D47A75] hover:underline font-semibold sm:hidden"
                >
                  ← {t("cart_continue_shopping")}
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-3xl bg-white border border-[#EFE6DC] shadow-xs space-y-5">
                <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A]">
                  {t("cart_order_summary")}
                </h3>

                {/* Promo Code Input */}
                {/* <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="block text-xs font-semibold text-[#5E5044]">
                    Промокод на скидку:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Например: ROCOCO"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#E8DDD0] text-xs uppercase focus:outline-hidden text-[#3D332A]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#3D332A] text-white text-xs font-bold hover:bg-[#5E5044] transition"
                    >
                      Ок
                    </button>
                  </div>
                  {promoMsg && (
                    <span className="text-[11px] font-semibold text-emerald-600 block">
                      {promoMsg}
                    </span>
                  )}
                </form> */}

                {/* Summary Rows */}
                <div className="space-y-2.5 text-xs text-[#66584C] pt-2 border-t border-[#FAF6F0]">
                  <div className="flex justify-between">
                    <span>{t("cart_items_sum")}</span>
                    <span className="font-semibold text-[#3D332A]">{fp(subtotal)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>{t("cart_promo_discount")}</span>
                      <span>-{fp(promoDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{t("cart_shipping")}</span>
                    <span className="font-semibold text-[#3D332A]">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-bold">{t("cart_shipping_free")}</span>
                      ) : (
                        fp(shippingCost)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-[#3D332A] pt-3 border-t border-[#EFE6DC]">
                    <span>{t("cart_total")}</span>
                    <span className="text-lg text-[#D47A75]">{fp(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout Link Button */}
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D47A75] to-[#E8A598] hover:from-[#C46863] hover:to-[#D47A75] text-white font-bold text-xs tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <span>{t("cart_checkout_btn")}</span>
                  <FiArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
