import { ok, handleError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getStats } from "@/lib/store";

export async function GET(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    return ok(await getStats());
  } catch (err) {
    return handleError(err, "Не удалось загрузить статистику");
  }
}
