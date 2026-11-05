"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CollectionsBar from "@/components/CollectionsBar";
import ProductCard from "@/components/ProductCard";
import FeaturesSection from "@/components/FeaturesSection";
import LookbookSection from "@/components/LookbookSection";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { FiArrowRight } from "react-icons/fi";

export default function HomeView({ initialProducts = [] }) {
  const { t } = useLanguage();
  const bestsellers = initialProducts;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0]">
      {/* Navigation */}
      <Navbar />

      {/* Grand Hero Section */}
      <Hero />

      {/* Collections Showcase Bar */}
      <CollectionsBar />

      {/* Featured Bestsellers Section on Homepage */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
              {t("home_bestsellers_subtitle")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage text-[#3D332A] mt-1">
              {t("hero_title_highlight")}
            </h2>
            <p className="text-xs sm:text-sm text-[#7E6F62] mt-1">
              {t("home_bestsellers_desc")}
            </p>
          </div>

          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white border border-[#E8DDD0] hover:border-[#D47A75] text-[#3D332A] hover:text-[#D47A75] text-xs font-semibold shadow-xs transition group self-start sm:self-auto"
          >
            <span>{t("col_view_all")}</span>
            <FiArrowRight className="group-hover:translate-x-1 transition duration-200" />
          </Link>
        </div>
<br />
<br />
        {/* 4 Featured Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Romantic Brand Banner Section */}
      {/* <section className="py-10 sm:py-14 bg-gradient-to-r from-[#FAF3EC] via-[#FCEEE9] to-[#F5ECE3] border-y border-[#EFE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-xs uppercase tracking-[0.2em] text-[#D47A75] font-bold">
                {t("home_charm_badge")}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif-vintage text-[#3D332A] font-bold leading-snug">
                {t("home_charm_title")}
              </h3>
              <p className="text-xs sm:text-sm text-[#7E6F62] leading-relaxed max-w-lg">
                {t("home_charm_desc")}
              </p>
              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#D47A75] text-white text-xs font-bold shadow-md hover:bg-[#C46863] transition"
                >
                  <span>{t("hero_btn_catalog")}</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>

            <div className="relative aspect-video sm:aspect-2/1 rounded-3xl overflow-hidden shadow-lg border border-[#E8DDD0]">
              <img
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=80"
                alt="Flower Knows Vanity"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] tracking-wider uppercase text-[#F7D6D0]">
                  {t("home_charm_room")}
                </span>
                <h4 className="text-base sm:text-lg font-serif-vintage font-bold">
                  {t("home_charm_boutique")}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Why Us Features */}
      <FeaturesSection />

      {/* Lookbook Gallery */}
      <LookbookSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
