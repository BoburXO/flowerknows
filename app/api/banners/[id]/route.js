import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildBanner } from "@/lib/validate";

export async function PUT(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");
    const existing = await db.get("banners", id);
    if (!existing) return fail("Баннер не найден", 404);
    const { value, error } = buildBanner(existing, body);
    if (error) return fail(error);
    value.id = existing.id;
    await db.put("banners", value);
    return ok(value);
  } catch (err) {
    return handleError(err, "Не удалось обновить баннер");
  }
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const removed = await db.remove("banners", id);
    if (!removed) return fail("Баннер не найден", 404);
    return ok(undefined, { extra: { message: "Баннер удалён" } });
  } catch (err) {
    return handleError(err, "Не удалось удалить баннер");
  }
}
