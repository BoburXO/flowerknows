import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildProduct } from "@/lib/validate";
import { listProducts, listCategories, listCollections, filterProducts } from "@/lib/store";

export async function GET(request) {
  try {
    const sp = request.nextUrl.searchParams;
    const ids = (sp.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 100);
    const products = filterProducts(await listProducts(), {
      category: sp.get("category"),
      collection: sp.get("collection"),
      search: sp.get("search"),
      sort: sp.get("sort"),
      ids,
    });
    return ok(products, { extra: { count: products.length } });
  } catch (err) {
    return handleError(err, "Не удалось загрузить товары");
  }
}

export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");

    const [cats, cols] = await Promise.all([listCategories({ withCounts: false }), listCollections({ withCounts: false })]);
    const { value, error } = buildProduct(
      { id: "fk-p" + Date.now().toString(36), createdAt: new Date().toISOString(), rating: 5, reviewsCount: 0 },
      body,
      { categoryIds: cats.map((c) => c.id), collectionIds: cols.map((c) => c.id) }
    );
    if (error) return fail(error);

    await db.put("products", value);
    return ok(value, { status: 201 });
  } catch (err) {
    return handleError(err, "Не удалось добавить товар");
  }
}
