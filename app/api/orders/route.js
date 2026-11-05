import { after } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, handleError, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/store";
import { sendOrderToTelegram } from "@/lib/telegram";
import { str } from "@/lib/validate";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/config";
import { isValidUzPhone, formatUzPhone, REGIONS } from "@/lib/utils";

const PAYMENT_LABELS = { cash: "При получении (наличные / карта)" };

const MSG = {
  ru: {
    name: "Пожалуйста, введите ваше имя",
    phone: "Пожалуйста, введите полный номер телефона (+998 XX XXX XX XX)",
    address: "Пожалуйста, введите точный адрес доставки",
    empty: "Ваша корзина пуста",
    gone: (n) => `Товар «${n}» больше недоступен. Обновите корзину.`,
    changed: (n) => `Оттенок товара «${n}» изменился. Обновите корзину.`,
    stock: (n, left) => (left > 0 ? `Товара «${n}» осталось только ${left} шт.` : `Товара «${n}» нет в наличии.`),
    generic: "Не удалось оформить заказ. Попробуйте ещё раз.",
  },
  uz: {
    name: "Iltimos, ismingizni kiriting",
    phone: "Iltimos, telefon raqamingizni to'liq kiriting (+998 XX XXX XX XX)",
    address: "Iltimos, yetkazib berish manzilini kiriting",
    empty: "Savatingiz bo'sh",
    gone: (n) => `«${n}» mahsuloti endi mavjud emas. Savatni yangilang.`,
    changed: (n) => `«${n}» mahsulotining rangi o'zgargan. Savatni yangilang.`,
    stock: (n, left) => (left > 0 ? `«${n}» mahsulotidan atigi ${left} dona qoldi.` : `«${n}» omborda qolmadi.`),
    generic: "Buyurtmani rasmiylashtirib bo'lmadi. Qaytadan urinib ko'ring.",
  },
};

class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

/* ---------------- GET: admin only (customer data!) ---------------- */
export async function GET(request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const status = request.nextUrl.searchParams.get("status");
    let orders = await listOrders();
    if (status && status !== "all") orders = orders.filter((o) => o.status === status);
    return ok(orders, { extra: { count: orders.length } });
  } catch (err) {
    return handleError(err, "Не удалось загрузить заказы");
  }
}

/* ---------------- POST: public checkout ---------------- */
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return fail("Некорректный запрос");
  const lang = body.lang === "uz" ? "uz" : "ru";
  const M = MSG[lang];

  try {
    // honeypot field: real people never fill it
    if (str(body.website, 100)) return fail(M.generic, 400);

    const c = body.customer || {};
    const name = str(c.name, 80);
    const phone = str(c.phone, 30);
    const address = str(c.address, 300);
    const note = str(c.note, 300);
    const city = REGIONS.some((r) => r.ru === c.city) ? c.city : str(c.city, 80) || REGIONS[0].ru;

    if (name.length < 2) return fail(M.name);
    if (!isValidUzPhone(phone)) return fail(M.phone);
    if (address.length < 4) return fail(M.address);

    const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    if (rawItems.length === 0) return fail(M.empty);

    const paymentId = PAYMENT_LABELS[body.paymentMethod] ? body.paymentMethod : "cash";

    const order = await db.withLock("orders", async () => {
      const products = await db.all("products");
      const byId = new Map(products.map((p) => [p.id, p]));

      // 1) validate every line against the REAL catalog (price / stock never come from the browser)
      const lines = new Map();
      for (const raw of rawItems) {
        const product = byId.get(String(raw?.productId));
        const qty = Math.round(Number(raw?.quantity));
        if (!product) throw new OrderError(M.gone(str(raw?.name, 80) || "?"), 409);
        if (!Number.isFinite(qty) || qty < 1) continue;

        let shade = null;
        if (product.shades?.length) {
          shade =
            product.shades.find((s) => raw.shadeId && s.id === raw.shadeId) ||
            product.shades.find((s) => s.name === raw.shade);
          if (!shade) throw new OrderError(M.changed(product.name), 409);
        }

        const key = `${product.id}::${shade?.id || shade?.name || ""}`;
        const prev = lines.get(key);
        lines.set(key, { product, shade, quantity: Math.min(99, (prev?.quantity || 0) + qty) });
      }
      if (lines.size === 0) throw new OrderError(M.empty);

      // total quantity per product (several shades share one stock counter)
      const perProduct = new Map();
      for (const { product, quantity } of lines.values()) {
        perProduct.set(product.id, (perProduct.get(product.id) || 0) + quantity);
      }
      for (const [pid, qty] of perProduct) {
        const p = byId.get(pid);
        const left = p.inStock === false ? 0 : Number(p.stockCount ?? 0);
        if (left < qty) throw new OrderError(M.stock(p.name, Math.max(0, left)), 409);
      }

      // 2) build the order with server-side prices
      const items = [...lines.values()].map(({ product, shade, quantity }) => ({
        productId: product.id,
        name: product.name,
        nameRu: product.nameRu || "",
        nameUz: product.nameUz || "",
        shade: shade?.name || "",
        shadeRu: shade?.nameRu || "",
        shadeUz: shade?.nameUz || "",
        shadeId: shade?.id || "",
        price: product.price,
        quantity,
        image: product.images?.[0] || "",
      }));

      const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

      const seq = await db.nextSeq("orders");
      const order = {
        id: `FK-${new Date().getFullYear()}-${1000 + seq}`,
        customer: { name, phone: formatUzPhone(phone), city, address, note },
        items,
        subtotal,
        shippingCost,
        totalAmount: subtotal + shippingCost,
        paymentMethod: PAYMENT_LABELS[paymentId],
        paymentId,
        status: "pending",
        lang,
        createdAt: new Date().toISOString(),
      };

      // 3) save the order FIRST. If this throws, the customer sees an error — never a fake success.
      await db.put("orders", order);

      // 4) reduce stock
      for (const [pid, qty] of perProduct) {
        const p = byId.get(pid);
        const stockCount = Math.max(0, Number(p.stockCount ?? 0) - qty);
        try {
          await db.put("products", { ...p, stockCount, inStock: stockCount > 0, updatedAt: new Date().toISOString() });
        } catch (err) {
          console.error("[orders] order saved but stock update failed for", pid, err);
        }
      }
      return order;
    });

    after(() => sendOrderToTelegram(order));
    return ok(order, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) return fail(err.message, err.status);
    return handleError(err, M.generic);
  }
}
