import CatalogView from "@/components/CatalogView";
import { listProducts, listCategories, listCollections, filterProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const first = (v) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const category = first(sp?.category);
  const collection = first(sp?.collection);
  const search = first(sp?.search);

  let title = "Каталог косметики Flower Knows | Katalog";
  let description =
    "Каталог оригинальной косметики Flower Knows в Ташкенте: румяна, помады, палетки теней, пудра, зеркала и подарочные наборы. Доставка по Узбекистану. / Flower Knows original kosmetika katalogi.";
  try {
    if (collection) {
      const col = (await listCollections({ withCounts: false })).find((c) => c.id === collection);
      if (col) {
        title = `Коллекция ${col.nameRu || col.name} (${col.name}) — Flower Knows`;
        description = `${col.descriptionRu || ""} Купить косметику коллекции ${col.name} в Ташкенте. / ${col.nameUz || col.name} kolleksiyasi.`.trim();
      }
    } else if (category) {
      const cat = (await listCategories({ withCounts: false })).find((c) => c.id === category);
      if (cat) {
        title = `${cat.nameRu || cat.name} — купить в Ташкенте | Flower Knows`;
        description = `${cat.descriptionRu || ""} ${cat.nameUz || cat.name} — Flower Knows O'zbekiston.`.trim();
      }
    }
  } catch (e) {
    /* fall back to defaults */
  }

  // filtered / searched listings are duplicates of the main catalog for search engines
  const filtered = Boolean(search);
  const canonical = collection
    ? `/catalog?collection=${encodeURIComponent(collection)}`
    : category
    ? `/catalog?category=${encodeURIComponent(category)}`
    : "/catalog";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CatalogPage({ searchParams }) {
  const sp = await searchParams;
  const hasFilters = Boolean(first(sp?.category) || first(sp?.collection) || first(sp?.search));

  // unfiltered list is rendered on the server; filtered views are fetched by the client
  let initialProducts = null;
  if (!hasFilters) {
    try {
      initialProducts = filterProducts(await listProducts(), { sort: "popular" });
    } catch (e) {
      console.error("[catalog]", e?.message);
    }
  }
  return <CatalogView initialProducts={initialProducts} />;
}
