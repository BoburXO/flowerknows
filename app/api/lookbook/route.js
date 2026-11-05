import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildLookbookPost } from "@/lib/validate";
import { listLookbook } from "@/lib/store";

export async function GET() {
  try {
    return ok(await listLookbook());
  } catch (err) {
    return handleError(err, "Не удалось загрузить лукбук");
  }
}

export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");
    const existing = await listLookbook();
    const { value, error } = buildLookbookPost(
      { id: "lb-" + Date.now().toString(36), createdAt: new Date().toISOString() },
      { ...body, sort: body.sort ?? Math.max(0, ...existing.map((p) => p.sort ?? 0)) + 1 }
    );
    if (error) return fail(error);
    await db.put("lookbook", value);
    return ok(value, { status: 201 });
  } catch (err) {
    return handleError(err, "Не удалось добавить пост");
  }
}
