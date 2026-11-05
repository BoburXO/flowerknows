import { SITE_URL } from "@/lib/site";
import { listProducts, listCollections, listCategories } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const now = new Date();
  const entries = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const [products, collections, categories] = await Promise.all([
      listProducts(),
      listCollections({ withCounts: false }),
      listCategories({ withCounts: false }),
    ]);
    for (const c of categories) {
      entries.push({
        url: `${SITE_URL}/catalog?category=${encodeURIComponent(c.id)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const c of collections) {
      entries.push({
        url: `${SITE_URL}/catalog?collection=${encodeURIComponent(c.id)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    for (const p of products) {
      entries.push({
        url: `${SITE_URL}/product/${encodeURIComponent(p.id)}`,
        lastModified: new Date(p.updatedAt || p.createdAt || now),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (e) {
    console.error("[sitemap]", e?.message);
  }
  return entries;
}
