import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin, isAdmin } from "@/lib/auth";
import { buildBanner } from "@/lib/validate";
import { listBanners } from "@/lib/store";

// public: only active banners (the site slider). Admin (?all=1): every banner, incl. hidden ones.
export async function GET(request) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1" && isAdmin(request);
    return ok(await listBanners({ onlyActive: !all }));
  } catch (err) {
    return handleError(err, "Не удалось загрузить баннеры");
  }
}

export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");
    const existing = await listBanners();
    const { value, error } = buildBanner(
      { id: "bn-" + Date.now().toString(36), createdAt: new Date().toISOString() },
      { ...body, sort: body.sort ?? Math.max(0, ...existing.map((b) => b.sort ?? 0)) + 1 }
    );
    if (error) return fail(error);
    await db.put("banners", value);
    return ok(value, { status: 201 });
  } catch (err) {
    return handleError(err, "Не удалось добавить баннер");
  }
}
