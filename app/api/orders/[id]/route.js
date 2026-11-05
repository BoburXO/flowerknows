import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { str } from "@/lib/validate";
import { ORDER_STATUSES } from "@/lib/config";

/** cancelling returns goods to stock; un-cancelling takes them again */
async function adjustStock(items, direction) {
  const products = await db.all("products");
  const byId = new Map(products.map((p) => [p.id, p]));
  const perProduct = new Map();
  for (const it of items || []) {
    perProduct.set(it.productId, (perProduct.get(it.productId) || 0) + (Number(it.quantity) || 0));
  }
  for (const [pid, qty] of perProduct) {
    const p = byId.get(pid);
    if (!p) continue;
    const stockCount = Math.max(0, Number(p.stockCount ?? 0) + direction * qty);
    await db.put("products", { ...p, stockCount, inStock: stockCount > 0, updatedAt: new Date().toISOString() });
  }
}

export async function PATCH(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await readJson(request);
    if (!body) return fail("Некорректный запрос");

    const updated = await db.withLock("orders", async () => {
      const order = await db.get("orders", id);
      if (!order) return null;

      if (body.status !== undefined) {
        if (!ORDER_STATUSES.includes(body.status)) throw Object.assign(new Error("Неизвестный статус"), { bad: true });
        const wasCancelled = order.status === "cancelled";
        const willCancel = body.status === "cancelled";
        if (!wasCancelled && willCancel) await adjustStock(order.items, +1);
        if (wasCancelled && !willCancel) await adjustStock(order.items, -1);
        order.status = body.status;
      }
      if (body.customer && typeof body.customer === "object") {
        const c = body.customer;
        order.customer = {
          ...order.customer,
          ...(c.name !== undefined && { name: str(c.name, 80) }),
          ...(c.phone !== undefined && { phone: str(c.phone, 30) }),
          ...(c.city !== undefined && { city: str(c.city, 80) }),
          ...(c.address !== undefined && { address: str(c.address, 300) }),
          ...(c.note !== undefined && { note: str(c.note, 300) }),
        };
      }
      order.updatedAt = new Date().toISOString();
      await db.put("orders", order);
      return order;
    });

    if (!updated) return fail("Заказ не найден", 404);
    return ok(updated);
  } catch (err) {
    if (err?.bad) return fail(err.message);
    return handleError(err, "Не удалось обновить заказ");
  }
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const { id } = await params;
    const removed = await db.remove("orders", id);
    if (!removed) return fail("Заказ не найден", 404);
    return ok(undefined, { extra: { message: "Заказ удалён" } });
  } catch (err) {
    return handleError(err, "Не удалось удалить заказ");
  }
}
