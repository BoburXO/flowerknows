"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "@/lib/translations";
import { formatPrice, formatDate } from "@/lib/utils";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default language is Russian ('ru'); the visitor's choice is remembered
  const [lang, setLang] = useState("ru");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("fk_lang");
      if (savedLang === "ru" || savedLang === "uz") setLang(savedLang);
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLanguage = (newLang) => {
    if (newLang === "ru" || newLang === "uz") {
      setLang(newLang);
      try {
        localStorage.setItem("fk_lang", newLang);
      } catch (e) {
        /* ignore */
      }
    }
  };

  // t("key") or t("key", { name: "Swan Ballet" }) -> replaces {name}
  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations.ru;
      let text = dict[key] ?? translations.ru[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
      }
      return text;
    },
    [lang]
  );

  // price / date formatted in the current language ("сум" vs "so'm")
  const fp = useCallback((amount) => formatPrice(amount, lang), [lang]);
  const fd = useCallback((date) => formatDate(date, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t, fp, fd }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
