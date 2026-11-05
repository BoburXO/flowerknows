/* Shared helpers (safe for both server and client) */

export function formatPrice(amount, lang = "uz") {
  const n = Number(amount) || 0;
  const unit = lang === "ru" ? "сум" : "so'm";
  return new Intl.NumberFormat(lang === "ru" ? "ru-RU" : "uz-UZ").format(n) + " " + unit;
}

export function formatDate(dateString, lang = "uz") {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return String(dateString);
  }
}

/* ---------- localized content helpers ---------- */

const isEmpty = (v) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);

/** pick(product, "description", "ru") -> product.descriptionRu || product.description */
export function localized(obj, field, lang) {
  if (!obj) return "";
  const suffix = lang === "uz" ? "Uz" : "Ru";
  const v = obj[field + suffix];
  if (!isEmpty(v)) return v;
  const base = obj[field];
  return isEmpty(base) ? (Array.isArray(base) ? [] : "") : base;
}

/** "01 Snow Swan (Нежный розовый жемчуг)" */
export function shadeLabel(shade, lang) {
  if (!shade) return "";
  const base = shade.name || "";
  const tr = lang === "uz" ? shade.nameUz : shade.nameRu;
  return tr && tr.trim() ? `${base} (${tr})` : base;
}

/** Cart / order line shade label (items store shade + shadeRu + shadeUz) */
export function itemShadeLabel(item, lang) {
  if (!item) return "";
  const tr = lang === "uz" ? item.shadeUz : item.shadeRu;
  return tr && tr.trim() ? `${item.shade} (${tr})` : item.shade || "";
}

const BADGE_LABELS = {
  YANGI: { ru: "НОВИНКА", uz: "YANGI" },
  BESTSELLER: { ru: "БЕСТСЕЛЛЕР", uz: "BESTSELLER" },
  HIT: { ru: "ХИТ", uz: "HIT" },
  TAVSIYA: { ru: "РЕКОМЕНДУЕМ", uz: "TAVSIYA" },
  EKSKLYUZIV: { ru: "ЭКСКЛЮЗИВ", uz: "EKSKLYUZIV" },
  CHEKLANGAN: { ru: "ОГРАНИЧЕНО", uz: "CHEKLANGAN" },
};

export function badgeLabel(badge, lang) {
  if (!badge) return "";
  const entry = BADGE_LABELS[String(badge).toUpperCase()];
  return entry ? entry[lang === "uz" ? "uz" : "ru"] : badge;
}

export const BADGE_ADMIN_LABELS = {
  YANGI: "Новинка",
  BESTSELLER: "Бестселлер",
  HIT: "Хит",
  TAVSIYA: "Рекомендуем",
  EKSKLYUZIV: "Эксклюзив",
  CHEKLANGAN: "Ограниченно",
};

/* ---------- regions (value stored in orders is the Russian label) ---------- */

export const REGIONS = [
  { ru: "г. Ташкент", uz: "Toshkent shahri" },
  { ru: "Ташкентская область", uz: "Toshkent viloyati" },
  { ru: "Самаркандская область", uz: "Samarqand viloyati" },
  { ru: "Бухарская область", uz: "Buxoro viloyati" },
  { ru: "Ферганская область", uz: "Farg'ona viloyati" },
  { ru: "Андижанская область", uz: "Andijon viloyati" },
  { ru: "Наманганская область", uz: "Namangan viloyati" },
  { ru: "Хорезмская область", uz: "Xorazm viloyati" },
  { ru: "Кашкадарьинская область", uz: "Qashqadaryo viloyati" },
  { ru: "Сурхандарьинская область", uz: "Surxondaryo viloyati" },
  { ru: "Навоийская область", uz: "Navoiy viloyati" },
  { ru: "Джизакская область", uz: "Jizzax viloyati" },
  { ru: "Сырдарьинская область", uz: "Sirdaryo viloyati" },
  { ru: "Республика Каракалпакстан", uz: "Qoraqalpog'iston Respublikasi" },
];

/* ---------- phone ---------- */

export function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Formats as +998 90 123 45 67 while typing */
export function formatUzPhone(value) {
  let d = phoneDigits(value);
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  let out = "+998";
  if (d.length > 0) out += " " + d.slice(0, 2);
  if (d.length > 2) out += " " + d.slice(2, 5);
  if (d.length > 5) out += " " + d.slice(5, 7);
  if (d.length > 7) out += " " + d.slice(7, 9);
  return out + (d.length === 0 ? " " : "");
}

export function isValidUzPhone(value) {
  const d = phoneDigits(value);
  return d.length === 12 && d.startsWith("998");
}

/* ---------- slug ---------- */

const CYR = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o", қ: "q", ғ: "g", ҳ: "h",
};

export function slugify(input) {
  const s = String(input || "")
    .toLowerCase()
    .replace(/[ʻʼ’'`]/g, "")
    .split("")
    .map((ch) => (CYR[ch] !== undefined ? CYR[ch] : ch))
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 50);
}

/** 1400 -> "1.4k", 980 -> "980" */
export function formatLikes(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return (Math.round(v / 100) / 10).toString().replace(/\.0$/, "") + "k";
  return String(v);
}
