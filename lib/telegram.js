const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const money = (n) => new Intl.NumberFormat("ru-RU").format(Number(n) || 0) + " сум";

/** Sends the new-order message to the shop's Telegram chat. Never throws. */
export async function sendOrderToTelegram(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log(
      `[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы — уведомление пропущено. Новый заказ ${order.id}: ${order.customer?.name} ${order.customer?.phone}, ${money(order.totalAmount)}`
    );
    return;
  }

  try {
    const lines = (order.items || [])
      .map(
        (it, i) =>
          `${i + 1}. ${esc(it.name)}${it.shade ? ` (${esc(it.shade)})` : ""} — ${it.quantity} шт. × ${money(it.price)}`
      )
      .join("\n");

    const text =
      `🌸 <b>НОВЫЙ ЗАКАЗ — FLOWER KNOWS</b> 🌸\n\n` +
      `🆔 <b>Заказ:</b> <code>${esc(order.id)}</code>\n` +
      `👤 <b>Клиент:</b> ${esc(order.customer?.name)}\n` +
      `📞 <b>Телефон:</b> ${esc(order.customer?.phone)}\n` +
      `📍 <b>Адрес:</b> ${esc(order.customer?.city)}, ${esc(order.customer?.address)}\n` +
      (order.customer?.note ? `💬 <b>Комментарий:</b> ${esc(order.customer.note)}\n` : "") +
      `💳 <b>Оплата:</b> ${esc(order.paymentMethod)}\n\n` +
      `🛍 <b>Товары:</b>\n${lines}\n\n` +
      `🚚 <b>Доставка:</b> ${order.shippingCost ? money(order.shippingCost) : "бесплатно"}\n` +
      `💰 <b>Итого:</b> <b>${money(order.totalAmount)}</b>`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) console.error("[telegram] HTTP", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("[telegram] send failed:", err);
  }
}
