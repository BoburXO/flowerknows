/* Domain-level data access shared by API routes and server components. */
import { db } from "@/lib/db";

const bySort = (a, b) => (a.sort ?? 100) - (b.sort ?? 100) || String(a.name).localeCompare(String(b.name));
const byNewest = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);

export async function listProducts() {
  const items = await db.all("products");
  return items.sort(byNewest);
}

export async function getProduct(id) {
  return db.get("products", String(id));
}

export async function listCategories({ withCounts = true } = {}) {
  const cats = await db.all("categories");
  if (withCounts) {
    const products = await db.all("products");
    for (const c of cats) c.count = products.filter((p) => p.category === c.id).length;
  }
  return cats.sort(bySort);
}

export async function listCollections({ withCounts = true } = {}) {
  const cols = await db.all("collections");
  if (withCounts) {
    const products = await db.all("products");
    for (const c of cols) c.count = products.filter((p) => p.collection === c.id).length;
  }
  return cols.sort(bySort);
}

export async function listLookbook() {
  const items = await db.all("lookbook");
  return items.sort((a, b) => (a.sort ?? 100) - (b.sort ?? 100) || byNewest(a, b));
}

export async function listBanners({ onlyActive = false } = {}) {
  const items = await db.all("banners");
  const list = onlyActive ? items.filter((b) => b.active !== false) : items;
  return list.sort((a, b) => (a.sort ?? 100) - (b.sort ?? 100) || byNewest(a, b));
}

export async function listOrders() {
  const items = await db.all("orders");
  return items.sort(byNewest);
}

/** Same rules for the API and for server-rendered pages. */
export function filterProducts(products, { category, collection, search, sort, ids } = {}) {
  let list = [...products];

  if (ids && ids.length) {
    const set = new Set(ids);
    list = list.filter((p) => set.has(p.id));
  }
  if (category && category !== "all") {
    list = list.filter((p) => (p.category || "").toLowerCase() === category.toLowerCase());
  }
  if (collection && collection !== "all") {
    list = list.filter((p) => (p.collection || "").toLowerCase() === collection.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.nameRu, p.nameUz, p.description, p.descriptionRu, p.descriptionUz, p.collection]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }

  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewsCount || 0) - (a.reviewsCount || 0));
      break;
    case "newest":
      list.sort(byNewest);
      break;
    default: // "popular"
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0) || byNewest(a, b));
  }
  return list;
}

export async function getStats() {
  const [products, orders] = await Promise.all([db.all("products"), listOrders()]);
  const live = orders.filter((o) => o.status !== "cancelled");
  const count = (s) => orders.filter((o) => o.status === s).length;
  return {
    totalRevenue: live.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    totalOrders: orders.length,
    pendingOrders: count("pending"),
    confirmedOrders: count("confirmed"),
    shippingOrders: count("shipping"),
    deliveredOrders: count("delivered"),
    cancelledOrders: count("cancelled"),
    totalProducts: products.length,
    lowStockCount: products.filter((p) => (p.stockCount ?? 0) <= 10).length,
    recentOrders: orders.slice(0, 5),
  };
}
