import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildProduct } from "@/lib/validate";
import { getProduct, listCategories, listCollections } from "@/lib/store";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return fail("Товар не найден", 404);
    return ok(product);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");

    const existing = await getProduct(id);
    if (!existing) return fail("Товар не найден", 404);

    const [cats, cols] = await Promise.all([listCategories({ withCounts: false }), listCollections({ withCounts: false })]);
    const { value, error } = buildProduct(existing, body, {
      categoryIds: cats.map((c) => c.id),
      collectionIds: cols.map((c) => c.id),
    });
    if (error) return fail(error);

    value.id = existing.id;
    value.createdAt = existing.createdAt || new Date().toISOString();
    value.updatedAt = new Date().toISOString();
    await db.put("products", value);
    return ok(value);
  } catch (err) {
    return handleError(err, "Не удалось обновить товар");
  }
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const removed = await db.remove("products", id);
    if (!removed) return fail("Товар не найден", 404);
    return ok(undefined, { extra: { message: "Товар удалён" } });
  } catch (err) {
    return handleError(err, "Не удалось удалить товар");
  }
}
