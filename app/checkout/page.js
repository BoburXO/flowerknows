"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { localized, itemShadeLabel, REGIONS, formatUzPhone, isValidUzPhone } from "@/lib/utils";
import {
  FiCheckCircle,
  FiTruck,
  FiShoppingBag,
  FiCreditCard,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiArrowLeft,
  FiSend,
} from "react-icons/fi";

export default function CheckoutPage() {
  const { cart, cartReady, clearCart, subtotal, shippingCost, totalAmount } = useCart();
  const { t, lang, fp } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998 ",
    city: REGIONS[0].ru,
    address: "",
    note: "",
    paymentMethod: "cash",
    website: "", // honeypot (hidden field, bots fill it)
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderResult, setOrderResult] = useState(null);

  const handleChange = (e) => {
    const { name } = e.target;
    const value = name === "phone" ? formatUzPhone(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage(t("checkout_err_name"));
      return;
    }
    if (!isValidUzPhone(formData.phone)) {
      setErrorMessage(t("checkout_err_phone"));
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage(t("checkout_err_address"));
      return;
    }

    if (cart.length === 0) {
      setErrorMessage(t("checkout_err_empty"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
            note: formData.note,
          },
          // only ids and quantities: the server takes prices and stock from the catalog
          items: cart.map((i) => ({
            productId: i.productId,
            shadeId: i.shadeId,
            shade: i.shade,
            quantity: i.quantity,
            name: i.name,
          })),
          paymentMethod: formData.paymentMethod,
          website: formData.website,
          lang,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderResult(data.data);
        clearCart();
      } else {
        setErrorMessage(data.error || t("checkout_err_generic"));
      }
    } catch (err) {
      setErrorMessage(t("checkout_err_server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!cartReady && !orderResult ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-[#D47A75] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cart.length === 0 && !orderResult ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-[#EFE6DC] p-8 space-y-4 max-w-lg mx-auto">
            <h2 className="text-2xl font-serif-vintage font-bold text-[#3D332A]">{t("cart_empty")}</h2>
            <p className="text-xs text-[#8C7A6B] leading-relaxed">{t("cart_empty_desc")}</p>
            <Link
              href="/catalog"
              className="px-8 py-3 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-md hover:bg-[#C46863] transition inline-block"
            >
              {t("cart_go_catalog")}
            </Link>
          </div>
        ) : orderResult ? (
          /* Order Confirmed Screen */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#EFE6DC] shadow-lg text-center space-y-6 animate-scaleUp">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FiCheckCircle size={52} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D47A75]">
                {t("checkout_order_id")}
              </span>
              <div className="text-4xl font-serif-vintage font-bold text-[#3D332A] tracking-wider">
                {orderResult.id}
              </div>
              <h2 className="text-2xl font-serif-vintage font-bold text-[#3D332A]">
                {t("checkout_success_title")}
              </h2>
              <p className="text-xs sm:text-sm text-[#66584C] max-w-md mx-auto leading-relaxed">
                {t("checkout_success_desc")}
              </p>
            </div>

            {/* Order summary box */}
            <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#EFE6DC] text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between py-1 border-b border-[#E8DDD0]">
                <span className="text-[#8C7A6B]">{t("checkout_recipient_info")}</span>
                <span className="font-bold text-[#3D332A]">{orderResult.customer?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DDD0]">
                <span className="text-[#8C7A6B]">{t("checkout_phone_short")}</span>
                <span className="font-bold text-[#3D332A]">{orderResult.customer?.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DDD0]">
                <span className="text-[#8C7A6B]">{t("checkout_delivery_address")}</span>
                <span className="font-bold text-[#3D332A]">
                  {orderResult.customer?.city}, {orderResult.customer?.address}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8DDD0]">
                <span className="text-[#8C7A6B]">{t("checkout_payment_method")}</span>
                <span className="font-bold text-[#3D332A]">{t(`checkout_pay_${orderResult.paymentId || "cash"}`)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-sm font-bold text-[#3D332A]">
                <span>{t("cart_total")}</span>
                <span className="text-[#D47A75] text-base">{fp(orderResult.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D47A75] to-[#E8A598] text-white font-bold text-xs tracking-wider shadow-md hover:shadow-lg transition"
              >
                {t("checkout_continue")}
              </Link>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="flex items-center gap-3 pb-6 border-b border-[#EFE6DC] mb-8">
              <Link href="/cart" className="text-[#7E6F62] hover:text-[#D47A75]">
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#D47A75] font-semibold">
                  {t("checkout_eyebrow")}
                </span>
                <h1 className="text-3xl font-serif-vintage text-[#3D332A] font-bold mt-0.5">
                  {t("checkout_title")}
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Form Fields (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Section 1: Customer Details */}
                <div className="bg-white rounded-3xl p-6 border border-[#EFE6DC] shadow-xs space-y-4">
                  <h3 className="font-serif-vintage text-lg font-bold text-[#3D332A] flex items-center gap-2 pb-3 border-b border-[#FAF6F0]">
                    <FiUser className="text-[#D47A75]" />
                    <span>{t("checkout_step_1")}</span>
                  </h3>

                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={formData.website}
                    onChange={handleChange}
                    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5E5044] mb-1">
                        {t("checkout_name")}
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder={t("checkout_name_ph")}
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-xs text-[#3D332A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5E5044] mb-1">
                        {t("checkout_phone")}
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        name="phone"
                        required
                        placeholder="+998 90 123 45 67"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-xs text-[#3D332A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery Details */}
                <div className="bg-white rounded-3xl p-6 border border-[#EFE6DC] shadow-xs space-y-4">
                  <h3 className="font-serif-vintage text-lg font-bold text-[#3D332A] flex items-center gap-2 pb-3 border-b border-[#FAF6F0]">
                    <FiMapPin className="text-[#D47A75]" />
                    <span>{t("checkout_delivery_title")}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5E5044] mb-1">
                        {t("checkout_city")}
                      </label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-xs text-[#3D332A]"
                      >
                        {REGIONS.map((r) => (
                          <option key={r.ru} value={r.ru}>
                            {lang === "uz" ? r.uz : r.ru}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5E5044] mb-1">
                        {t("checkout_address")}
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder={t("checkout_address_ph")}
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-xs text-[#3D332A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#5E5044] mb-1">
                      {t("checkout_note")}
                    </label>
                    <input
                      type="text"
                      name="note"
                      placeholder={t("checkout_note_ph")}
                      value={formData.note}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-xs text-[#3D332A]"
                    />
                  </div>
                </div>

                {/* Section 3: Payment Method */}
                <div className="bg-white rounded-3xl p-6 border border-[#EFE6DC] shadow-xs space-y-4">
                  <h3 className="font-serif-vintage text-lg font-bold text-[#3D332A] flex items-center gap-2 pb-3 border-b border-[#FAF6F0]">
                    <FiCreditCard className="text-[#D47A75]" />
                    <span>{t("checkout_step_2")}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "cash", label: t("checkout_pay_cash_label"), desc: t("checkout_pay_cash_desc") },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: m.id })}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          formData.paymentMethod === m.id
                            ? "bg-[#FAF3EC] border-[#D47A75] ring-2 ring-[#D47A75]/30 font-bold"
                            : "bg-[#FAF6F0] border-[#E8DDD0] hover:border-[#D47A75]/40"
                        }`}
                      >
                        <span className="block text-xs font-bold text-[#3D332A]">
                          {m.label}
                        </span>
                        <span className="block text-[10px] text-[#8C7A6B]">
                          {m.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review & Submit (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-[#EFE6DC] shadow-xs space-y-5 sticky top-28">
                  <h3 className="font-serif-vintage text-xl font-bold text-[#3D332A] pb-3 border-b border-[#FAF6F0]">
                    {t("checkout_step_3")}
                  </h3>

                  {/* Items mini list */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.cartItemId} className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8DDD0]">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-bold text-[#3D332A] line-clamp-1 block">
                              {localized(item, "name", lang)}
                            </span>
                            <span className="text-[10px] text-[#8C7A6B]">
                              {itemShadeLabel(item, lang)} • {item.quantity} {t("product_pieces")}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[#3D332A] shrink-0">
                          {fp(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-2 text-xs text-[#66584C] pt-3 border-t border-[#FAF6F0]">
                    <div className="flex justify-between">
                      <span>{t("cart_items_sum")}</span>
                      <span className="font-semibold text-[#3D332A]">{fp(subtotal)}</span>
                    </div>
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
                      <span className="text-lg text-[#D47A75]">{fp(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D47A75] to-[#E8A598] hover:from-[#C46863] hover:to-[#D47A75] text-white font-bold text-xs tracking-wider shadow-lg hover:shadow-xl transition disabled:opacity-50"
                  >
                    {loading ? t("checkout_submitting") : t("checkout_submit_btn")}
                  </button>

                  <p className="text-[10px] text-[#8C7A6B] text-center leading-relaxed">
                    {t("checkout_terms_notice")}
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
