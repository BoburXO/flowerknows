
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { useCatalog } from "@/context/CatalogContext";

export default function Hero() {
  const { t } = useLanguage();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Slides are managed in the admin panel (Banners tab). Fallback keeps the layout intact if none exist.
  const { banners } = useCatalog();
  const slides =
    banners && banners.length > 0
      ? banners
      : [
          {
            id: "fallback",
            image:
              "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=80",
            title: "Flower Knows",
            link: "",
          },
        ];
  const current = slides[activeSlide % slides.length];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-16 md:pt-12 md:pb-24">
      {/* Background Soft Pastel Beige Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#F7D6D0]/40 via-[#F5ECE3]/50 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#EADCCF]/40 blur-2xl -z-10 pointer-events-none" />

      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#FCEEE9]/60 blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* Left Column: Romantic Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3EC] border border-[#E8DDD0] shadow-xs">
              <span className="text-[#D47A75] text-xs">✦</span>

              <span className="text-xs uppercase tracking-widest text-[#7E6F62] font-semibold">
                {t("hero_badge")}
              </span>

              <span className="text-[#D47A75] text-xs">✦</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-vintage tracking-wide text-[#3D332A] leading-[1.15]">
              <span className="italic font-normal text-[#D47A75]">
                {t("hero_title_highlight")}
              </span>
              <br />
            </h1>

            <p className="text-[#6E6053] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              {t("hero_desc")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/catalog"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D47A75] to-[#E8A598] hover:from-[#C46863] hover:to-[#D47A75] text-white font-medium text-sm tracking-wider shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{t("hero_btn_catalog")}</span>
                <FiArrowRight className="group-hover:translate-x-1 transition duration-200" />
              </Link>

              <Link
                href="/#collections"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FAF6F0] hover:bg-[#F2EAE0] text-[#3D332A] border border-[#E8DDD0] hover:border-[#D47A75] font-medium text-sm tracking-wider transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <FiStar className="text-[#D47A75]" />
                <span>{t("hero_btn_collections")}</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#EFE6DC] max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <span className="block text-xl font-serif-vintage font-bold text-[#3D332A]">
                  {t("hero_stat_1_val")}
                </span>
                <span className="text-xs text-[#8C7A6B]">
                  {t("hero_stat_1_lbl")}
                </span>
              </div>

              <div className="text-center lg:text-left">
                <span className="block text-xl font-serif-vintage font-bold text-[#3D332A]">
                  {t("hero_stat_2_val")}
                </span>
                <span className="text-xs text-[#8C7A6B]">
                  {t("hero_stat_2_lbl")}
                </span>
              </div>

              <div className="text-center lg:text-left">
                <span className="block text-xl font-serif-vintage font-bold text-[#3D332A]">
                  {t("hero_stat_3_val")}
                </span>
                <span className="text-xs text-[#8C7A6B]">
                  {t("hero_stat_3_lbl")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Image Carousel */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl overflow-hidden p-3 bg-gradient-to-b from-[#FFFDFB] to-[#F5ECE3] border border-[#E8DDD0] shadow-xl">

                <div
                  className="relative h-[380px] sm:h-[460px] w-full rounded-2xl overflow-hidden group"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {/* Main Image */}
                  {current.link ? (
                    <a
                      href={current.link}
                      target={/^https?:/i.test(current.link) ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                    >
                      <img
                        key={current.id}
                        src={current.image}
                        alt={current.title || "Flower Knows"}
                        className="w-full h-full object-cover animate-[fadeIn_0.7s_ease-in-out] group-hover:scale-105 transition-transform duration-700"
                      />
                    </a>
                  ) : (
                    <img
                      key={current.id}
                      src={current.image}
                      alt={current.title || "Flower Knows"}
                      className="w-full h-full object-cover animate-[fadeIn_0.7s_ease-in-out] group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  {/* Overlay */}
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-[#2F251E]/70 via-transparent to-black/10 pointer-events-none" /> */}

                  {/* Top Badge */}
                  {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#8B4844] tracking-widest uppercase border border-[#E8DDD0]">
                    {slides[activeSlide].badge}
                  </div> */}

                  {/* Bottom Caption */}
                  {/* <div className="absolute bottom-12 left-4 right-4 text-white p-2">
                    <span className="text-xs tracking-widest uppercase text-[#F7D6D0] block mb-1">
                      {slides[activeSlide].subtitle}
                    </span>

                    <h3 className="text-xl sm:text-2xl font-serif-vintage font-bold leading-snug">
                      {slides[activeSlide].title}
                    </h3>
                  </div> */}

                  {slides.length > 1 && (
                  <>
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-[#3D332A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white shadow-md"
                  >
                    <FiArrowRight className="rotate-180" />
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md text-[#3D332A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white shadow-md"
                  >
                    <FiArrowRight />
                  </button>

                  {/* Indicators */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-10">
                    {slides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeSlide === idx
                            ? "w-7 bg-white"
                            : "w-2 bg-white/50 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                  </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
