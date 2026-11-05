import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildCollection } from "@/lib/validate";

function idFrom(params) {
  return params.then(({ id }) => {
    try {
      return decodeURIComponent(id);
    } catch {
      return id;
    }
  });
}

export async function PUT(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const id = await idFrom(params);
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");
    const existing = await db.get("collections", id);
    if (!existing) return fail("Коллекция не найдена", 404);
    // name/id stay fixed: products and links refer to them
    const { value, error } = buildCollection(existing, { ...body, name: existing.name });
    if (error) return fail(error);
    value.id = existing.id;
    await db.put("collections", value);
    return ok(value);
  } catch (err) {
    return handleError(err, "Не удалось обновить коллекцию");
  }
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const id = await idFrom(params);
    const products = await db.all("products");
    const used = products.filter((p) => p.collection === id).length;
    if (used > 0) {
      return fail(`Нельзя удалить: в этой коллекции ${used} товар(ов). Сначала перенесите или удалите их.`, 409);
    }
    const removed = await db.remove("collections", id);
    if (!removed) return fail("Коллекция не найдена", 404);
    return ok(undefined, { extra: { message: "Коллекция удалена" } });
  } catch (err) {
    return handleError(err, "Не удалось удалить коллекцию");
  }
}
