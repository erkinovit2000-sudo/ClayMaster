const PRODUCTS = require('../products.js');
const byId = new Map(PRODUCTS.map(p => [p.id, p]));
const hits = new Map();
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const clip = (v, n) => String(v ?? '').trim().slice(0, n);
const rate = u => (u >= 5 ? 0.15 : u >= 3 ? 0.1 : u >= 2 ? 0.05 : 0);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const fail = (code, error) => res.status(code).json({ ok: false, error });
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return fail(405, 'method_not_allowed'); }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 600000);
  if (recent.length >= 5) return fail(429, 'too_many_requests');
  recent.push(now); hits.set(ip, recent);

  let b = req.body;
  try { if (typeof b === 'string') b = JSON.parse(b); } catch { return fail(400, 'bad_json'); }
  if (!b || typeof b !== 'object' || b.website) return fail(400, 'invalid');

  const c = b.customer || {};
  const cu = {
    name: clip(c.fullName, 80), phone: clip(c.phone, 25), email: clip(c.email, 100),
    country: clip(c.country, 60), city: clip(c.city, 60), address: clip(c.address, 300), notes: clip(c.notes, 500)
  };
  if (cu.name.length < 2 || !/^\+?[0-9\s\-()]{7,20}$/.test(cu.phone) || !cu.country || !cu.city || cu.address.length < 5) return fail(400, 'invalid_customer');
  if (cu.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cu.email)) return fail(400, 'invalid_email');

  if (!Array.isArray(b.items) || !b.items.length || b.items.length > 30) return fail(400, 'invalid_items');
  const lines = new Map();
  for (const it of b.items) {
    const p = byId.get(Number(it && it.id)); const q = Number(it && it.qty);
    if (!p || !Number.isInteger(q) || q < 1) return fail(400, 'invalid_items');
    lines.set(p.id, (lines.get(p.id) || 0) + q);
  }
  let units = 0, sub = 0; const rows = [];
  for (const [id, q] of lines) {
    const p = byId.get(id);
    if (q > p.stock) return fail(409, 'insufficient_stock');
    units += q; sub += p.price * q;
    rows.push(`- ${esc(p.name)} x${q} — $${(p.price * q).toFixed(2)}`);
  }
  const pct = rate(units), disc = sub * pct, total = sub - disc;

  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return fail(500, 'server_not_configured');

  const orderId = 'CM-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
  const text = [
    '<b>NEW ORDER — CLAYMASTER</b>', '', `Order ID: <b>${orderId}</b>`, '',
    `Customer: ${esc(cu.name)}`, `Phone: ${esc(cu.phone)}`, cu.email ? `Email: ${esc(cu.email)}` : '',
    `Country: ${esc(cu.country)}`, `City: ${esc(cu.city)}`, '', '<b>PRODUCTS:</b>', ...rows, '',
    pct ? `Discount (${Math.round(pct * 100)}%): -$${disc.toFixed(2)}` : '', `<b>Total: $${total.toFixed(2)}</b>`, '',
    `Delivery address: ${esc(cu.address)}`, cu.notes ? `Notes: ${esc(cu.notes)}` : '', '',
    'Payment method: Cash / Other', 'Order status: NEW'
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(8000)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) { console.error('Telegram error', r.status, j.description); return fail(502, 'telegram_failed'); }
  } catch (e) { console.error('Telegram request failed', e.name); return fail(502, 'telegram_failed'); }

  return res.status(200).json({ ok: true, orderId, total: Number(total.toFixed(2)), discount: Number(disc.toFixed(2)) });
};
