"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  FiShield,
  FiAward,
  FiTruck,
  FiGift,
} from "react-icons/fi";

export default function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <FiAward className="text-[#D47A75]" size={26} />,
      title: t("why_1_t"),
      desc: t("why_1_d"),
    },
    {
      icon: <FiShield className="text-[#D47A75]" size={26} />,
      title: t("why_2_t"),
      desc: t("why_2_d"),
    },
    {
      icon: <FiTruck className="text-[#D47A75]" size={26} />,
      title: t("why_3_t"),
      desc: t("why_3_d"),
    },
    {
      icon: <FiGift className="text-[#D47A75]" size={26} />,
      title: t("why_4_t"),
      desc: t("why_4_d"),
    },
  ];

  return (
    <section id="why-us" className="py-16 bg-[#FAF6F0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
            {t("why_subtitle")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-vintage text-[#3D332A] mt-1">
            {t("why_title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white/80 hover:bg-white border border-[#EFE6DC] hover:border-[#E8DDD0] shadow-xs hover:shadow-md transition duration-300 space-y-3 text-center sm:text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FAF3EC] border border-[#E8DDD0] flex items-center justify-center mx-auto sm:mx-0">
                {f.icon}
              </div>
              <h3 className="font-serif-vintage text-base font-bold text-[#3D332A]">
                {f.title}
              </h3>
              <p className="text-xs text-[#7E6F62] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
