"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useCatalog } from "@/context/CatalogContext";
import { localized } from "@/lib/utils";

export default function CollectionsBar({ selectedCollection, onSelectCollection }) {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const { collections } = useCatalog();

  return (
    <section id="collections" className="py-10 bg-[#FAF6F0] border-y border-[#EFE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
            {t("col_subtitle")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-vintage text-[#3D332A] mt-1">
            {t("col_title")}
          </h2>
          <p className="text-xs sm:text-sm text-[#7E6F62] mt-2">
            {t("col_desc")}
          </p>
        </div>

        {/* Collection cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {collections.map((c) => {
            const isSelected = selectedCollection === c.id;
            return (
              <div
                key={c.id}
                onClick={() => {
                  if (onSelectCollection) {
                    onSelectCollection(isSelected ? "all" : c.id);
                  } else {
                    router.push(`/catalog?collection=${encodeURIComponent(c.id)}`);
                  }
                }}
                className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-[#FAF3EC] border-[#D47A75] shadow-md ring-2 ring-[#D47A75]/30 -translate-y-1"
                    : "bg-white/80 hover:bg-white border-[#EFE6DC] hover:border-[#D47A75]/50 hover:-translate-y-0.5 shadow-xs"
                }`}
              >
                {/* Image badge */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#FAF6F0]">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div
                    className="absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{ backgroundColor: c.accent }}
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#D47A75] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                      ✓
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-serif-vintage font-bold text-[#3D332A] group-hover:text-[#D47A75] transition truncate">
                    {c.name}
                  </h3>
                  <p className="text-[11px] font-medium text-[#8C7A6B] truncate">
                    {localized(c, "name", lang)}
                  </p>
                  <p className="text-[10px] text-[#A69788] line-clamp-2 leading-tight">
                    {localized(c, "description", lang)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/catalog"
            className="text-xs font-semibold text-[#D47A75] hover:underline inline-flex items-center gap-1.5"
          >
            <span>{t("col_view_all")} →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
