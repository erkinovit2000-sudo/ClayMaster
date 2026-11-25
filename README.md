# ClayMaster — qo'llanma

Statik sayt (HTML/CSS/JS) + Vercel serverless funksiya (`api/order.js`) + Telegram Bot.

## 1. Telegram bot tokenini olish
1. Telegramda **@BotFather** ni oching → `/newbot` yuboring.
2. Bot nomi va username (oxiri `bot` bilan tugasin) kiriting.
3. BotFather bergan **token** (`123456:ABC...`) ni nusxalang. Hech kimga bermang.

## 2. Chat ID olish
1. O'z botingizga Telegramda kirib **Start** bosing va biror xabar yozing.
2. Brauzerda oching: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Javobdagi `"chat":{"id":123456789,...}` — shu son **TELEGRAM_CHAT_ID**.
   (Guruhga yuborish uchun botni guruhga qo'shing; guruh ID odatda `-100...` bilan boshlanadi.)

## 3. GitHub
1. github.com → **New repository** → nomi `ClayMaster` → Create.
2. **uploading an existing file** havolasini bosing → ZIP ichidagi **barcha fayl va papkalarni** (index.html, api, assets ...) sudrab tashlang → **Commit changes**.
   `.env` fayl yaratmang; tokenni GitHub'ga yuklamang.

## 4. Vercel
1. vercel.com → GitHub bilan kiring → **Add New → Project** → `ClayMaster` ni **Import**.
2. Framework Preset: **Other**. Build/Output sozlamalarini bo'sh qoldiring.
3. **Environment Variables** (yoki keyin: Vercel Dashboard → Project → Settings → Environment Variables → Add New):
   - `TELEGRAM_BOT_TOKEN` = tokeningiz
   - `TELEGRAM_CHAT_ID` = chat ID
4. **Deploy** bosing.
5. Muhim: o'zgaruvchi keyin qo'shilgan bo'lsa → Deployments → so'nggi deploy → **Redeploy**.

## 5. Sinash
Saytni oching → mahsulot qo'shing → Checkout → formani to'ldiring → Place order. Telegramda "NEW ORDER — CLAYMASTER" xabari kelishi kerak. Xabar kelmasa, sayt muvaffaqiyat ko'rsatmaydi (server 502 qaytaradi).

## Xavfsizlik
- Token faqat `api/order.js` ichida `process.env` orqali o'qiladi, frontendda yo'q.
- Narx va jami summa serverda `products.js` dan qayta hisoblanadi; mijozdan kelgan narx hisobga olinmaydi.
- Spam: IP bo'yicha 10 daqiqada 5 ta buyurtma + yashirin honeypot maydon. (Serverless xotirasi bo'lgani uchun bu "asosiy" himoya; jiddiy himoya uchun Vercel KV/Upstash yoki Cloudflare Turnstile qo'shing.)

## Demo va production farqi
- **Ro'yxatdan o'tish/kirish — faqat DEMO.** Ma'lumot foydalanuvchi brauzerida (localStorage) saqlanadi, haqiqiy autentifikatsiya emas. Production uchun Supabase Auth, Firebase Auth yoki Clerk ishlating.
- **Production-ready:** buyurtma API, Telegram yuborish, server validatsiya, savat, til, tema.
- **Ombor (stock)** `products.js` da statik; sotilganda avtomatik kamaymaydi (buning uchun ma'lumotlar bazasi kerak).

## Mahsulot qo'shish
`tools/gen.py` dagi ro'yxatni tahrirlang va `python3 tools/gen.py` ishga tushiring: `products.js` va rasmlar qayta yaratiladi. Haqiqiy foto uchun `assets/products/` ga WebP qo'ying va `products.js` dagi `image` yo'lini o'zgartiring.
