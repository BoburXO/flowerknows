# Flower Knows Uzbekistan

Next.js 16 do'kon: katalog, savat (localStorage), real checkout, admin panel (rus tilida), ikki tilli (RU/UZ) vitrina.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local
npm run dev
```

Admin: `/admin/login` — parol standart `omina_rania`. Boshqa parol xohlasangiz, serverda `ADMIN_PASSWORD` env o'zgaruvchisini qo'ying.

## Ma'lumotlar qayerda saqlanadi? (MUHIM)

| Hosting | Sozlama | Natija |
|---|---|---|
| **Vercel / Netlify** (serverless) | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Ma'lumotlar Redis bazasida, hech qachon o'chmaydi |
| **O'z serveringiz / VPS** (`next start`, pm2) | Hech narsa | `data/*.json` fayllar (xohlasangiz `FK_DATA_DIR=/var/lib/flowerknows`) |

Serverless hostingda Redis ulanmagan bo'lsa, sayt buyurtmani **qabul qilmaydi** va aniq xato ko'rsatadi
(avval buyurtma "o'tgandek" ko'rinib, aslida saqlanmasdi). Admin panelda ham qizil ogohlantirish chiqadi.

**Upstash ulash (Vercel):** Vercel → Storage / Marketplace → Upstash Redis → loyihaga ulang
(env o'zgaruvchilar avtomatik qo'shiladi, `KV_REST_API_URL/TOKEN` ham qo'llab-quvvatlanadi) → Redeploy.
Boshlang'ich mahsulotlar `seed/` papkasidan birinchi so'rovda o'zi yuklanadi.

## Tuzilma

- `seed/` — boshlang'ich katalog (faqat birinchi ishga tushirishda ishlatiladi)
- `data/` — jonli ma'lumotlar (file rejimida, git'ga kirmaydi)
- `lib/db.js` — saqlash qatlami (Redis yoki fayl), `lib/auth.js` — admin sessiyasi
- `app/api/*` — mahsulot, kategoriya, kolleksiya, buyurtma, statistika, eksport
- `lib/translations.js` — vitrina matnlari (RU/UZ)

## Tanlangan qoidalar

- Narx va ombor **serverda** tekshiriladi: brauzerdan kelgan narxga ishonilmaydi.
- Buyurtma bekor qilinsa, mahsulotlar omborga qaytadi.
- Bepul yetkazish: `lib/config.js` (`FREE_SHIPPING_THRESHOLD`, `SHIPPING_COST`).
- Telegram support/Instagram havolalari ham `lib/config.js` da.
