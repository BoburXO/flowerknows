import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildCategory } from "@/lib/validate";
import { listCategories } from "@/lib/store";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    return ok(await listCategories());
  } catch (err) {
    return handleError(err, "Не удалось загрузить категории");
  }
}

export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");

    const existing = await listCategories({ withCounts: false });
    const { value, error } = buildCategory({}, body);
    if (error) return fail(error);

    let id = slugify(body.id || value.name || value.nameRu) || `cat-${Date.now().toString(36)}`;
    if (existing.some((c) => c.id === id)) {
      let n = 2;
      while (existing.some((c) => c.id === `${id}-${n}`)) n++;
      id = `${id}-${n}`;
    }
    value.id = id;
    if (body.sort === undefined) value.sort = Math.max(0, ...existing.map((c) => c.sort ?? 0)) + 1;

    await db.put("categories", value);
    return ok({ ...value, count: 0 }, { status: 201 });
  } catch (err) {
    return handleError(err, "Не удалось добавить категорию");
  }
}
