import { requireAdmin } from "@/lib/auth";
import { handleError, fail } from "@/lib/api";
import { listProducts, listOrders } from "@/lib/store";

export async function GET(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const type = request.nextUrl.searchParams.get("type") || "products";
    if (!["products", "orders"].includes(type)) return fail("Неизвестный тип экспорта");

    const items = type === "orders" ? await listOrders() : await listProducts();
    const payload = {
      exportedAt: new Date().toISOString(),
      count: items.length,
      [type]: items,
    };
    const date = new Date().toISOString().slice(0, 10);

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="flowerknows-${type}-${date}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleError(err, "Не удалось сформировать файл");
  }
}
