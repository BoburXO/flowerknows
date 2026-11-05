import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildLookbookPost } from "@/lib/validate";

export async function PUT(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");
    const existing = await db.get("lookbook", id);
    if (!existing) return fail("Пост не найден", 404);
    const { value, error } = buildLookbookPost(existing, body);
    if (error) return fail(error);
    value.id = existing.id;
    await db.put("lookbook", value);
    return ok(value);
  } catch (err) {
    return handleError(err, "Не удалось обновить пост");
  }
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const removed = await db.remove("lookbook", id);
    if (!removed) return fail("Пост не найден", 404);
    return ok(undefined, { extra: { message: "Пост удалён" } });
  } catch (err) {
    return handleError(err, "Не удалось удалить пост");
  }
}
