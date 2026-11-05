"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function NotFoundText({ button = false }) {
  const { t } = useLanguage();
  if (button) return <>{t("product_back_catalog")}</>;
  return (
    <>
      <h2 className="text-2xl font-serif-vintage font-bold text-[#3D332A]">{t("notfound_title")}</h2>
      <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">{t("notfound_desc")}</p>
    </>
  );
}
