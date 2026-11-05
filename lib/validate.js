/* Server-side input cleaning for admin forms. Never trust the browser. */

const HEX = /^#[0-9a-fA-F]{6}$/;

export const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const numOr = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function cleanUrl(v) {
  const s = str(v, 2000);
  if (!s) return "";
  if (/^https?:\/\//i.test(s) || s.startsWith("/")) return s;
  return "";
}

function cleanList(v, maxItems, maxLen) {
  let arr = v;
  if (typeof v === "string") arr = v.split("\n");
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => str(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanShades(v) {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 40)
    .map((s, i) => ({
      id: str(s?.id, 40) || `s${Date.now().toString(36)}${i}`,
      name: str(s?.name, 120),
      nameRu: str(s?.nameRu, 120),
      nameUz: str(s?.nameUz, 120),
      hex: HEX.test(s?.hex || "") ? s.hex : "#E8DDD0",
    }))
    .filter((s) => s.name);
}

/**
 * Merge `body` into `base` (existing product or {}) and validate.
 * Fields that are absent in `body` keep their previous value.
 * Returns { value } or { error }.
 */
export function buildProduct(base, body, { categoryIds, collectionIds }) {
  const has = (k) => body[k] !== undefined;
  const p = { ...base };

  if (has("name")) p.name = str(body.name, 160);
  if (has("nameRu")) p.nameRu = str(body.nameRu, 160);
  if (has("nameUz")) p.nameUz = str(body.nameUz, 160);
  if (!p.name) return { error: "Укажите название товара" };

  if (has("category")) p.category = str(body.category, 60);
  if (!p.category || !categoryIds.includes(p.category)) return { error: "Выберите существующую категорию" };

  if (has("collection")) p.collection = str(body.collection, 80);
  if (!p.collection || !collectionIds.includes(p.collection)) return { error: "Выберите существующую коллекцию" };

  if (has("price")) p.price = Math.round(numOr(body.price, NaN));
  if (!Number.isFinite(p.price) || p.price <= 0) return { error: "Укажите корректную цену" };

  if (has("oldPrice")) {
    const old = Math.round(numOr(body.oldPrice, 0));
    p.oldPrice = old > 0 ? old : null;
  }
  if (p.oldPrice === undefined) p.oldPrice = null;

  if (has("stockCount")) p.stockCount = Math.max(0, Math.round(numOr(body.stockCount, 0)));
  if (p.stockCount === undefined) p.stockCount = 20;

  if (has("inStock")) p.inStock = body.inStock !== false && body.inStock !== "false";
  if (p.inStock === undefined) p.inStock = true;
  if (p.stockCount <= 0) p.inStock = false;
  else if (!has("inStock") && base.stockCount === 0 && p.stockCount > 0) p.inStock = true;

  if (has("badge")) p.badge = str(body.badge, 30).toUpperCase();
  if (p.badge === undefined) p.badge = "";

  if (has("images") || has("image")) {
    const list = Array.isArray(body.images) ? body.images : body.image ? [body.image] : [];
    p.images = list.map(cleanUrl).filter(Boolean).slice(0, 10);
  }
  if (!Array.isArray(p.images) || p.images.length === 0) {
    return { error: "Добавьте хотя бы одну ссылку на изображение (http/https)" };
  }

  if (has("shades")) p.shades = cleanShades(body.shades);
  if (!Array.isArray(p.shades)) p.shades = [];

  for (const f of ["description", "descriptionRu", "descriptionUz"]) {
    if (has(f)) p[f] = str(body[f], 3000);
  }
  for (const f of ["features", "featuresRu", "featuresUz"]) {
    if (has(f)) p[f] = cleanList(body[f], 20, 220);
  }
  // keep legacy fields consistent: `description` / `features` = Uzbek fallback
  if (!p.description && p.descriptionUz) p.description = p.descriptionUz;
  if ((!p.features || p.features.length === 0) && p.featuresUz?.length) p.features = p.featuresUz;

  if (has("rating")) p.rating = Math.min(5, Math.max(0, numOr(body.rating, 5)));
  if (p.rating === undefined) p.rating = 5;
  if (has("reviewsCount")) p.reviewsCount = Math.max(0, Math.round(numOr(body.reviewsCount, 0)));
  if (p.reviewsCount === undefined) p.reviewsCount = 0;

  return { value: p };
}

export function buildCategory(base, body) {
  const c = { ...base };
  if (body.name !== undefined) c.name = str(body.name, 80);
  if (body.nameRu !== undefined) c.nameRu = str(body.nameRu, 80);
  if (body.nameUz !== undefined) c.nameUz = str(body.nameUz, 80);
  if (body.descriptionRu !== undefined) c.descriptionRu = str(body.descriptionRu, 300);
  if (body.descriptionUz !== undefined) c.descriptionUz = str(body.descriptionUz, 300);
  if (body.description !== undefined) c.description = str(body.description, 300);
  if (!c.name && c.nameRu) c.name = c.nameRu;
  if (!c.name && c.nameUz) c.name = c.nameUz;
  if (!c.name) return { error: "Укажите название категории" };
  if (!c.nameRu) c.nameRu = c.name;
  if (!c.nameUz) c.nameUz = c.name;
  if (!c.description) c.description = c.descriptionUz || c.descriptionRu || "";
  if (body.sort !== undefined) c.sort = Math.round(numOr(body.sort, 100));
  if (c.sort === undefined) c.sort = 100;
  return { value: c };
}

export function buildCollection(base, body) {
  const c = { ...base };
  if (body.name !== undefined) c.name = str(body.name, 80);
  if (body.nameRu !== undefined) c.nameRu = str(body.nameRu, 80);
  if (body.nameUz !== undefined) c.nameUz = str(body.nameUz, 80);
  if (body.descriptionRu !== undefined) c.descriptionRu = str(body.descriptionRu, 300);
  if (body.descriptionUz !== undefined) c.descriptionUz = str(body.descriptionUz, 300);
  if (body.themeColor !== undefined) c.themeColor = HEX.test(body.themeColor) ? body.themeColor : "#F7D6D0";
  if (body.accent !== undefined) c.accent = HEX.test(body.accent) ? body.accent : "#D47A75";
  if (body.image !== undefined) c.image = cleanUrl(body.image);
  if (!c.name) return { error: "Укажите название коллекции" };
  if (!c.nameRu) c.nameRu = c.name;
  if (!c.nameUz) c.nameUz = c.name;
  if (!c.themeColor) c.themeColor = "#F7D6D0";
  if (!c.accent) c.accent = "#D47A75";
  if (!c.image) {
    c.image =
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80";
  }
  if (body.sort !== undefined) c.sort = Math.round(numOr(body.sort, 100));
  if (c.sort === undefined) c.sort = 100;
  return { value: c };
}

export function buildLookbookPost(base, body) {
  const p = { ...base };
  if (body.image !== undefined) p.image = cleanUrl(body.image);
  if (body.title !== undefined) p.title = str(body.title, 80);
  if (body.likes !== undefined) p.likes = Math.max(0, Math.round(numOr(body.likes, 0)));
  if (body.link !== undefined) p.link = cleanUrl(body.link);
  if (body.sort !== undefined) p.sort = Math.round(numOr(body.sort, 100));
  if (!p.image) return { error: "Укажите ссылку на фото (http/https)" };
  if (!p.title) return { error: "Укажите заголовок (например, #SwanBalletLook)" };
  if (p.likes === undefined) p.likes = 0;
  if (p.link === undefined) p.link = "";
  if (p.sort === undefined) p.sort = 100;
  return { value: p };
}

export function buildBanner(base, body) {
  const b = { ...base };
  if (body.image !== undefined) b.image = cleanUrl(body.image);
  if (body.title !== undefined) b.title = str(body.title, 120);
  if (body.link !== undefined) b.link = cleanUrl(body.link);
  if (body.active !== undefined) b.active = body.active !== false && body.active !== "false";
  if (body.sort !== undefined) b.sort = Math.round(numOr(body.sort, 100));
  if (!b.image) return { error: "Укажите ссылку на изображение (http/https или /файл.jpg из папки public)" };
  if (b.title === undefined) b.title = "";
  if (b.link === undefined) b.link = "";
  if (b.active === undefined) b.active = true;
  if (b.sort === undefined) b.sort = 100;
  return { value: b };
}
