"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { FiPhone } from "react-icons/fi";
import { FaTelegramPlane, FaInstagram } from "react-icons/fa";
import { useCatalog } from "@/context/CatalogContext";
import { PHONE_DISPLAY, PHONE_E164, TELEGRAM_URL, TELEGRAM_USERNAME, INSTAGRAM_URL, INSTAGRAM_USERNAME } from "@/lib/config";
import { localized } from "@/lib/utils";

export default function Footer() {
  const { t, lang } = useLanguage();
  const { categories, collections } = useCatalog();

  return (
    <footer className="bg-[#FAF3EC] border-t border-[#EFE6DC] pt-14 pb-8 text-[#5E5044]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E8DDD0]">
          {/* Brand info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-serif-vintage tracking-[0.25em] text-[#3D332A] font-bold uppercase">
                Flower Knows
              </span>
              {/* <span className="text-[10px] tracking-[0.2em] text-[#8C7A6B] uppercase font-light">
                Parfums & Cosmétiques • Uzbekistan
              </span> */}
            </div>

            <p className="text-xs text-[#7E6F62] leading-relaxed max-w-sm">
              {t("footer_desc")}
            </p>

            <div className="pt-2 text-xs text-[#7E6F62] space-y-1.5">
              {/* <div className="flex items-center gap-2">
                <FiMapPin className="text-[#D47A75]" />
                <span>{t("footer_address")}</span>
              </div> */}
              <a href={`tel:${PHONE_E164}`} className="flex items-center gap-2 hover:text-[#D47A75] transition">
                <FiPhone className="text-[#D47A75]" />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#229ED9] transition"
              >
                <FaTelegramPlane className="text-[#D47A75]" />
                <span>@{TELEGRAM_USERNAME}</span>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#D47A75] transition"
              >
                <FaInstagram className="text-[#D47A75]" />
                <span>@{INSTAGRAM_USERNAME}</span>
              </a>
              {/* <div className="flex items-center gap-2">
                <FiMail className="text-[#D47A75]" />
                <span>info@flowerknows.uz</span>
              </div> */}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3D332A] uppercase tracking-wider">
              {t("nav_collections")}
            </h4>
            <ul className="text-xs space-y-2 text-[#7E6F62]">
              {collections.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalog?collection=${encodeURIComponent(c.id)}`}
                    className="hover:text-[#D47A75] transition"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3D332A] uppercase tracking-wider">
              {t("nav_catalog")}
            </h4>
            <ul className="text-xs space-y-2 text-[#7E6F62]">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/catalog?category=${encodeURIComponent(c.id)}`}
                    className="hover:text-[#D47A75] transition"
                  >
                    {localized(c, "name", lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin link */}
          {/* <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3D332A] uppercase tracking-wider">
              {t("nav_admin")}
            </h4>
            <p className="text-xs text-[#7E6F62] leading-relaxed">
              PIN-kod orqali boshqaruv:
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8DDD0] hover:border-[#D47A75] text-[#3D332A] text-xs font-bold transition shadow-xs"
            >
              <FiShield className="text-[#D47A75]" />
              <span>{t("nav_admin")}</span>
            </Link>
          </div> */}
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A6B] gap-4">
          <p>© 2026 Flower Knows Uzbekistan. {t("footer_rights")}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Tashkent, Uzbekistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
