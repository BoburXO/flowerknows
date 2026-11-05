"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { FiInstagram, FiHeart } from "react-icons/fi";
import { INSTAGRAM_URL } from "@/lib/config";
import { useCatalog } from "@/context/CatalogContext";
import { formatLikes } from "@/lib/utils";

export default function LookbookSection() {
  const { t } = useLanguage();

  const { lookbook } = useCatalog();

  if (!lookbook || lookbook.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-[#F5ECE3]/50 border-t border-[#EFE6DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#D47A75] font-semibold">
              FLOWER KNOWS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-vintage text-[#3D332A] mt-1">
              {t("lookbook_title")}
            </h2>
            <p className="text-xs sm:text-sm text-[#7E6F62] mt-1 max-w-lg">
              {t("lookbook_desc")}
            </p>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8DDD0] hover:border-[#D47A75] text-[#3D332A] text-xs font-semibold shadow-xs transition group w-fit self-start sm:self-auto"
          >
            <FiInstagram className="text-[#D47A75] group-hover:scale-110 transition" />
            <span>{t("lookbook_instagram")}</span>
          </a>
        </div>

<br />
<br />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {lookbook.map((item) => {
            const card = (
              <>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4 text-white">
                  <div className="flex items-center justify-between w-full text-xs">
                    <span className="font-medium tracking-wide text-[11px] sm:text-xs truncate">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] sm:text-[11px] shrink-0">
                      <FiHeart className="fill-white" size={12} /> {formatLikes(item.likes)}
                    </span>
                  </div>
                </div>
              </>
            );
            const cls =
              "group relative block aspect-square rounded-2xl overflow-hidden bg-white border border-[#E8DDD0] shadow-xs cursor-pointer";
            return item.link ? (
              <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className={cls}>
                {card}
              </a>
            ) : (
              <div key={item.id} className={cls}>
                {card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
