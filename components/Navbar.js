"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { TELEGRAM_URL } from "@/lib/config";
import {
  FiShoppingBag,
  FiHeart,
  FiSearch,
  FiMenu,
  FiX,
  FiShield,
  FiGlobe,
} from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, subtotal, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { lang, setLang, t, fp } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#EFE6DC] transition-all">
      {/* Top romantic banner with Language Selector */}
      <div className="bg-gradient-to-r from-[#F7D6D0] via-[#FAF6F0] to-[#E8DDD0] py-1.5 px-4 text-xs tracking-wider text-[#66584C] font-medium border-b border-[#EFE6DC]/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* <div className="hidden sm:flex items-center gap-2">
            <span className="text-[#D47A75]">✨</span>
            <span>{t("top_banner")}</span>
          </div> */}
          <div className="text-left flex-1">
            <span>🌸 Flower Knows Uzbekistan ✨</span>
          </div>

          {/* Language Switcher RU | UZ */}
          <div className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-full border border-[#E8DDD0] shadow-xs">
            <FiGlobe size={12} className="text-[#D47A75]" />
            <button
              onClick={() => setLang("ru")}
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                lang === "ru"
                  ? "bg-[#D47A75] text-white shadow-xs"
                  : "text-[#66584C] hover:text-[#D47A75]"
              }`}
            >
              RU
            </button>
            <span className="text-[#C5B5A5] text-[10px]">|</span>
            <button
              onClick={() => setLang("uz")}
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                lang === "uz"
                  ? "bg-[#D47A75] text-white shadow-xs"
                  : "text-[#66584C] hover:text-[#D47A75]"
              }`}
            >
              UZ
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#3D332A] hover:text-[#D47A75] transition"
              aria-label={t("nav_menu")}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-initial text-center lg:text-left">
            <Link href="/" className="inline-block group">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-xl font-serif-vintage tracking-[0.25em] text-[#3D332A] group-hover:text-[#D47A75] transition duration-300 font-semibold uppercase">
                  Flower <br /> Knows
                </span>
                <div className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#8C7A6B] uppercase font-light -mt-1">
                  {/* <span>Parfums & Cosmétiques</span>
                  <span className="text-[#D47A75]">•</span>
                  <span>Tashkent</span> */}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm tracking-wide font-medium text-[#5E5044]">
            <Link
              href="/"
              className="hover:text-[#D47A75] transition py-1 border-b-2 border-transparent hover:border-[#D47A75]"
            >
              {t("nav_home")}
            </Link>
            <Link
              href="/catalog"
              className="hover:text-[#D47A75] transition py-1 border-b-2 border-transparent hover:border-[#D47A75]"
            >
              {t("nav_catalog")}
            </Link>
            <Link
              href="/#collections"
              className="hover:text-[#D47A75] transition py-1 border-b-2 border-transparent hover:border-[#D47A75]"
            >
              {t("nav_collections")}
            </Link>
            {/* <Link
              href="/#why-us"
              className="hover:text-[#D47A75] transition py-1 border-b-2 border-transparent hover:border-[#D47A75]"
            >
              {t("why_title")}
            </Link> */}
            {/* <Link
              href="/admin/login"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5ECE3] hover:bg-[#EFE3D5] text-[#3D332A] border border-[#E8DDD0] transition text-xs font-semibold shadow-xs"
            >
              <FiShield className="text-[#D47A75]" />
              <span>{t("nav_admin")}</span>
            </Link> */}
          </nav>

          {/* Actions: Search, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Live Search Bar for Desktop */}
            {/* <div className="relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-56 lg:w-64 pl-9 pr-4 py-1.5 rounded-full text-xs bg-[#F5ECE3]/70 focus:bg-white border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden transition text-[#3D332A] placeholder-[#9E8C7E]"
                />
                <button type="submit" className="absolute left-3 top-2.5 text-[#9E8C7E] text-sm">
                  <FiSearch />
                </button>
              </form>
            </div> */}

            {/* Mobile search toggle */}
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="md:hidden p-2 text-[#3D332A] hover:text-[#D47A75] transition"
              aria-label={t("nav_search")}
            >
              <FiSearch size={20} />
            </button>

            {/* Telegram support */}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 p-2 text-[#3D332A] hover:text-[#229ED9] transition"
              title={t("nav_support_title")}
              aria-label={t("nav_support_title")}
            >
              <FaTelegramPlane size={20} />
              <span className="hidden xl:inline text-xs font-semibold">{t("nav_support")}</span>
            </a>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              aria-label={t("nav_wishlist")}
              className="relative p-2 text-[#3D332A] hover:text-[#D47A75] transition"
              title={t("nav_wishlist")}
            >
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#D47A75] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button (links to /cart or drawer) */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF3EC] border border-[#E8DDD0] hover:border-[#D47A75] text-[#3D332A] transition shadow-xs group"
            >
              <div className="relative">
                <FiShoppingBag
                  size={19}
                  className="text-[#3D332A] group-hover:text-[#D47A75] transition"
                />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D47A75] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#5E5044]">
                {fp(subtotal)}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search input expand */}
        {isSearchActive && (
          <div className="md:hidden pb-3 px-1 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-white border border-[#E8DDD0] focus:border-[#D47A75] focus:outline-hidden text-[#3D332A]"
              />
              <FiSearch className="absolute left-3 top-3 text-[#9E8C7E]" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF6F0] border-b border-[#EFE6DC] px-6 py-4 space-y-3 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#3D332A] hover:text-[#D47A75]"
          >
            {t("nav_home")}
          </Link>
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#3D332A] hover:text-[#D47A75]"
          >
            {t("nav_catalog")}
          </Link>
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#3D332A] hover:text-[#D47A75]"
          >
            {t("nav_cart")} ({totalItemsCount})
          </Link>
          <Link
            href="/#collections"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#3D332A] hover:text-[#D47A75]"
          >
            {t("nav_collections")}
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#3D332A] hover:text-[#D47A75]"
          >
            {t("nav_wishlist")} ({wishlistCount})
          </Link>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-[#3D332A] hover:text-[#229ED9]"
          >
            <FaTelegramPlane />
            <span>{t("nav_support_title")}</span>
          </a>
          <div className="pt-2 border-t border-[#E8DDD0]">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-[#D47A75]"
            >
              <FiShield />
              <span>{t("nav_admin")}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
