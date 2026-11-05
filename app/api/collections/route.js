import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildCollection } from "@/lib/validate";
import { listCollections } from "@/lib/store";

export async function GET() {
  try {
    return ok(await listCollections());
  } catch (err) {
    return handleError(err, "Не удалось загрузить коллекции");
  }
}

export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");

    const existing = await listCollections({ withCounts: false });
    const { value, error } = buildCollection({}, body);
    if (error) return fail(error);

    // the collection name is its id (products reference it by name and URLs use it)
    if (existing.some((c) => c.id.toLowerCase() === value.name.toLowerCase())) {
      return fail("Коллекция с таким названием уже существует");
    }
    value.id = value.name;
    value.sort = Math.max(0, ...existing.map((c) => c.sort ?? 0)) + 1;

    await db.put("collections", value);
    return ok({ ...value, count: 0 }, { status: 201 });
  } catch (err) {
    return handleError(err, "Не удалось добавить коллекцию");
  }
}
