import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildCategory } from "@/lib/validate";

export async function PUT(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");
    const existing = await db.get("categories", id);
    if (!existing) return fail("Категория не найдена", 404);
    const { value, error } = buildCategory(existing, body);
    if (error) return fail(error);
    value.id = existing.id;
    await db.put("categories", value);
    return ok(value);
  } catch (err) {
    return handleError(err, "Не удалось обновить категорию");
  }
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const products = await db.all("products");
    const used = products.filter((p) => p.category === id).length;
    if (used > 0) {
      return fail(`Нельзя удалить: в этой категории ${used} товар(ов). Сначала перенесите или удалите их.`, 409);
    }
    const removed = await db.remove("categories", id);
    if (!removed) return fail("Категория не найдена", 404);
    return ok(undefined, { extra: { message: "Категория удалена" } });
  } catch (err) {
    return handleError(err, "Не удалось удалить категорию");
  }
}
