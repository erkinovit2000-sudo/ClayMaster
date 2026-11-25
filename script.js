(() => {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const LS = { get: (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const CATS = ['legends','realmadrid','barcelona','manutd','mancity','psg','liverpool','bayern','arsenal','chelsea','national','goalkeepers','special'];
let lang = LS.get('lang', 'en'); if (!TR[lang]) lang = 'en';
let cart = LS.get('cart', {}), wish = LS.get('wish', []), f = { q: '', cat: '', club: '', max: 60, rating: 0, sort: 'pop', tag: '' };
let cur = null, qv = 1;
const t = k => TR[lang][k] ?? TR.en[k] ?? k;
const money = n => '$' + n.toFixed(2);
const byId = id => PRODUCTS.find(p => p.id === Number(id));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const desc = p => t('desc').replace('{p}', p.player).replace('{c}', p.club);
const saveCart = () => { LS.set('cart', cart); $('#cc').textContent = Object.values(cart).reduce((a, b) => a + b, 0); };
const toast = m => { const e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 1800); };

function calc() {
  let units = 0, sub = 0;
  for (const [id, q] of Object.entries(cart)) { const p = byId(id); if (p) { units += q; sub += p.price * q; } }
  const pct = units >= 5 ? 15 : units >= 3 ? 10 : units >= 2 ? 5 : 0, disc = sub * pct / 100;
  return { units, sub, pct, disc, total: sub - disc };
}
function sanitizeCart() { for (const id of Object.keys(cart)) { const p = byId(id); if (!p || p.stock < 1) delete cart[id]; else cart[id] = Math.max(1, Math.min(cart[id] | 0, p.stock)); } }

function opts(sel, items, val) { sel.innerHTML = items.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join(''); sel.value = val; }
function applyStatic() {
  document.documentElement.lang = lang; $('#lang').value = lang;
  $$('[data-i18n]').forEach(e => e.textContent = t(e.dataset.i18n));
  $$('[data-ph]').forEach(e => e.placeholder = t(e.dataset.ph));
  $$('[data-i18n-aria]').forEach(e => e.setAttribute('aria-label', t(e.dataset.i18nAria)));
  opts($('#fCat'), [['', t('all')], ...CATS.map(c => [c, t('cat_' + c)])], f.cat);
  opts($('#fClub'), [['', t('all')], ...[...new Set(PRODUCTS.map(p => p.club))].sort().map(c => [c, c])], f.club);
  opts($('#fRating'), [['0', t('all')], ['4', '4.0+'], ['4.5', '4.5+'], ['4.8', '4.8+']], String(f.rating));
  opts($('#fSort'), [['pop', t('s_pop')], ['new', t('s_new')], ['low', t('s_low')], ['high', t('s_high')]], f.sort);
}
function card(p) {
  const w = wish.includes(p.id);
  return `<article class="card"><div class="imgw"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" width="400" height="400">${p.isNew ? `<span class="tag">${t('new')}</span>` : p.isBest ? `<span class="tag b">${t('best')}</span>` : ''}<button class="heart ${w ? 'on' : ''}" data-act="wish" data-id="${p.id}" aria-label="${t('wish')}" aria-pressed="${w}">♥</button></div><h3>${esc(p.name)}</h3><p class="d">${esc(desc(p))}</p><div class="meta"><span>★ ${p.rating}</span><span class="${p.stock ? 'ok' : 'no'}">${p.stock ? t('inStock') + ' (' + p.stock + ')' : t('out')}</span></div><div class="row"><b>${money(p.price)}</b><button class="btn s" data-act="quick" data-id="${p.id}">${t('quick')}</button><button class="btn p s" data-act="add" data-id="${p.id}" ${p.stock ? '' : 'disabled'}>${t('add')}</button></div></article>`;
}
function renderGrid() {
  const q = f.q.toLowerCase();
  const r = PRODUCTS.filter(p => (!f.cat || p.category === f.cat) && (!f.club || p.club === f.club) && p.price <= f.max && p.rating >= f.rating && (!q || (p.name + ' ' + p.player + ' ' + p.club).toLowerCase().includes(q)) && (f.tag !== 'new' || p.isNew) && (f.tag !== 'best' || p.isBest));
  r.sort({ pop: (a, b) => b.sold - a.sold, new: (a, b) => b.id - a.id, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price }[f.sort]);
  $('#grid').innerHTML = r.length ? r.map(card).join('') : `<p>${t('noRes')}</p>`;
  $('#count').textContent = `${r.length} ${t('found')}`; $('#mp').textContent = money(f.max);
}
function renderAll() { applyStatic(); renderGrid(); if (cur) $('#mbody').innerHTML = cur(); }

const open = fn => { cur = fn; $('#mbody').innerHTML = fn(); $('#modal').hidden = false; document.body.classList.add('lock'); };
const close = () => { cur = null; $('#modal').hidden = true; document.body.classList.remove('lock'); };
const refresh = () => { if (cur) $('#mbody').innerHTML = cur(); };

function productModal(id) {
  const p = byId(id), max = p.stock;
  return `<div class="pm"><img src="${p.image}" alt="${esc(p.name)}" width="400" height="400"><div><h2>${esc(p.name)}</h2><p>${esc(desc(p))}</p><dl><dt>${t('material')}</dt><dd>${t('matVal')}</dd><dt>${t('height')}</dt><dd>${p.height} cm</dd><dt>${t('club')}</dt><dd>${esc(p.club)}</dd><dt>★</dt><dd>${p.rating}</dd><dt></dt><dd class="${max ? 'ok' : 'no'}">${max ? t('inStock') + ' (' + max + ')' : t('out')}</dd></dl>
  <div class="qty"><span>${t('qty')}</span><button data-act="qm" aria-label="−">−</button><b id="qn">${qv}</b><button data-act="qp" aria-label="+">+</button></div><p><b>${money(p.price * qv)}</b></p><button class="btn p" data-act="addq" data-id="${p.id}" ${max ? '' : 'disabled'}>${t('add')}</button></div></div>`;
}
function cartModal() {
  sanitizeCart(); const c = calc();
  if (!c.units) return `<h2>${t('cart')}</h2><p>${t('empty')}</p>`;
  const rows = Object.entries(cart).map(([id, q]) => { const p = byId(id); return `<div class="ci"><img src="${p.image}" alt="" width="64" height="64"><div><b>${esc(p.name)}</b><div class="note">${money(p.price)}</div><div class="qty"><button data-act="cd" data-id="${id}" aria-label="−">−</button><b>${q}</b><button data-act="ci" data-id="${id}" aria-label="+">+</button><button class="btn s" data-act="cr" data-id="${id}" aria-label="Remove">×</button></div></div><b>${money(p.price * q)}</b></div>`; }).join('');
  return `<h2>${t('cart')}</h2>${rows}<div class="sum" style="margin:16px 0"><div><span>${t('subtotal')}</span><span>${money(c.sub)}</span></div>${c.pct ? `<div class="dis"><span>${t('discount')} (−${c.pct}%)</span><span>−${money(c.disc)}</span></div>` : ''}<div class="t"><span>${t('total')}</span><span>${money(c.total)}</span></div></div><button class="btn p" data-act="checkout">${t('checkout')}</button>`;
}
let draft = {};
function checkoutModal() {
  const c = calc(), v = k => esc(draft[k] || '');
  return `<h2>${t('checkout')}</h2><form id="co" novalidate><label>${t('f_name')}*<input name="fullName" value="${v('fullName')}" autocomplete="name" required></label><label>${t('f_phone')}*<input name="phone" type="tel" value="${v('phone')}" autocomplete="tel" required></label><label>${t('f_email')} (${t('f_opt')})<input name="email" type="email" value="${v('email')}" autocomplete="email"></label><label>${t('f_country')}*<input name="country" value="${v('country')}" autocomplete="country-name" required></label><label>${t('f_city')}*<input name="city" value="${v('city')}" autocomplete="address-level2" required></label><label>${t('f_address')}*<textarea name="address" rows="2" required>${v('address')}</textarea></label><label>${t('f_notes')}<textarea name="notes" rows="2">${v('notes')}</textarea></label><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <div class="sum" style="margin:12px 0">${Object.entries(cart).map(([id, q]) => `<div><span>${esc(byId(id).name)} ×${q}</span><span>${money(byId(id).price * q)}</span></div>`).join('')}${c.pct ? `<div class="dis"><span>${t('discount')} (−${c.pct}%)</span><span>−${money(c.disc)}</span></div>` : ''}<div class="t"><span>${t('total')}</span><span>${money(c.total)}</span></div></div><p class="note">${t('pay')}</p><div id="ferr" class="err" role="alert"></div><button class="btn p" type="submit" id="pb">${t('place')}</button></form>`;
}
async function place(form) {
  const d = Object.fromEntries(new FormData(form)); draft = d; const e = [];
  if (d.fullName.trim().length < 2) e.push(`${t('f_name')}: ${t('req')}`);
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(d.phone.trim())) e.push(t('badPhone'));
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.push(t('badEmail'));
  if (!d.country.trim()) e.push(`${t('f_country')}: ${t('req')}`);
  if (!d.city.trim()) e.push(`${t('f_city')}: ${t('req')}`);
  if (d.address.trim().length < 5) e.push(`${t('f_address')}: ${t('req')}`);
  if (!Object.keys(cart).length) e.push(t('empty'));
  const box = $('#ferr'); if (e.length) { box.innerHTML = e.map(esc).join('<br>'); return; }
  const btn = $('#pb'); btn.disabled = true; box.textContent = '';
  try {
    const r = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: d, items: Object.entries(cart).map(([id, qty]) => ({ id: +id, qty })), website: d.website || '' }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || 'failed');
    cart = {}; draft = {}; saveCart();
    open(() => `<h2>✓ ${t('ok_t')}</h2><p>${t('ok_p')}</p><p>${t('orderId')}: <b>${esc(j.orderId)}</b><br>${t('total')}: <b>${money(j.total)}</b></p>`);
  } catch { box.textContent = t('errOrder'); btn.disabled = false; }
}

// Demo-only auth (localStorage). Not secure: see README.
const hash = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
let tab = 'login';
function accountModal() {
  const s = LS.get('session', null);
  if (s) return `<h2>${t('profile')}</h2><p><b>${esc(s.name)}</b><br>${esc(s.email)}</p><button class="btn" data-act="logout">${t('logout')}</button>`;
  const reg = tab === 'register';
  return `<div class="tabs"><button class="btn s ${reg ? '' : 'p'}" data-act="tab" data-tab="login">${t('login')}</button><button class="btn s ${reg ? 'p' : ''}" data-act="tab" data-tab="register">${t('register')}</button></div><form id="au" novalidate>${reg ? `<label>${t('f_name')}<input name="name" autocomplete="name"></label>` : ''}<label>${t('f_email')}<input name="email" type="email" autocomplete="email"></label><label>${t('f_pass')}<input name="pass" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}"></label>${reg ? `<label>${t('f_pass2')}<input name="pass2" type="password" autocomplete="new-password"></label>` : ''}<div id="aerr" class="err" role="alert"></div><button class="btn p" type="submit">${t(reg ? 'register' : 'login')}</button><p class="note">${t('demo')}</p></form>`;
}
async function auth(form) {
  const d = Object.fromEntries(new FormData(form)), users = LS.get('users', {}), em = d.email.trim().toLowerCase(), err = m => $('#aerr').textContent = m;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return err(t('badEmail'));
  if (tab === 'register') {
    if ((d.name || '').trim().length < 2) return err(`${t('f_name')}: ${t('req')}`);
    if ((d.pass || '').length < 8) return err(t('passShort'));
    if (d.pass !== d.pass2) return err(t('passMismatch'));
    if (users[em]) return err(t('exists'));
    users[em] = { name: d.name.trim(), h: await hash(em + d.pass) }; LS.set('users', users);
    LS.set('session', { name: users[em].name, email: em });
  } else {
    const u = users[em];
    if (!u || u.h !== await hash(em + (d.pass || ''))) return err(t('badLogin'));
    LS.set('session', { name: u.name, email: em });
  }
  refresh();
}

function addToCart(id, n) { const p = byId(id); if (!p || !p.stock) return; cart[id] = Math.min((cart[id] || 0) + n, p.stock); saveCart(); toast(t('added')); }
function setNav(k) {
  f = { ...f, cat: k === 'legends' ? 'legends' : '', club: '', tag: k === 'new' || k === 'best' ? k : '', q: '' }; $('#q').value = '';
  applyStatic(); renderGrid(); $('#menu').classList.remove('open');
  if (k === 'clubs') setTimeout(() => $('#fClub').focus(), 300);
}

document.addEventListener('click', e => {
  const n = e.target.closest('[data-nav]'); if (n) { setNav(n.dataset.nav); if (n.dataset.nav === 'about' || n.dataset.nav === 'home') $('#menu').classList.remove('open'); }
  if (e.target.id === 'modal') return close();
  const b = e.target.closest('[data-act]'); if (!b) return;
  const id = b.dataset.id, a = b.dataset.act;
  const acts = {
    burger: () => $('#menu').classList.toggle('open'), top: () => scrollTo({ top: 0 }), close,
    theme: () => { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; LS.set('theme', d); },
    wish: () => { wish = wish.includes(+id) ? wish.filter(x => x !== +id) : [...wish, +id]; LS.set('wish', wish); renderGrid(); },
    add: () => addToCart(id, 1), quick: () => { qv = 1; open(() => productModal(id)); },
    qm: () => { qv = Math.max(1, qv - 1); refresh(); }, qp: () => { const m = byId(cur && $('#mbody [data-act=addq]').dataset.id).stock; qv = Math.min(m, qv + 1); refresh(); },
    addq: () => { addToCart(id, qv); close(); },
    cart: () => open(cartModal), ci: () => { addToCart(id, 1); refresh(); }, cd: () => { cart[id] = Math.max(1, cart[id] - 1); saveCart(); refresh(); }, cr: () => { delete cart[id]; saveCart(); refresh(); },
    checkout: () => open(checkoutModal), account: () => { tab = 'login'; open(accountModal); },
    tab: () => { tab = b.dataset.tab; refresh(); }, logout: () => { LS.set('session', null); refresh(); }
  };
  acts[a] && acts[a]();
});
document.addEventListener('submit', e => { e.preventDefault(); if (e.target.id === 'co') place(e.target); if (e.target.id === 'au') auth(e.target); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) close(); });
$('#lang').addEventListener('change', e => { lang = e.target.value; LS.set('lang', lang); renderAll(); });
$('#q').addEventListener('input', e => { f.q = e.target.value.trim(); renderGrid(); });
$('#fCat').addEventListener('change', e => { f.cat = e.target.value; renderGrid(); });
$('#fClub').addEventListener('change', e => { f.club = e.target.value; renderGrid(); });
$('#fMax').addEventListener('input', e => { f.max = +e.target.value; renderGrid(); });
$('#fRating').addEventListener('change', e => { f.rating = +e.target.value; renderGrid(); });
$('#fSort').addEventListener('change', e => { f.sort = e.target.value; renderGrid(); });
addEventListener('scroll', () => { $('#up').style.visibility = scrollY > 600 ? 'visible' : 'hidden'; }, { passive: true });

const top3 = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 3);
['h1', 'h2', 'h3'].forEach((id, i) => { $('#' + id).src = top3[i].image; $('#' + id).alt = top3[i].name; });
sanitizeCart(); saveCart(); renderAll(); $('#up').style.visibility = 'hidden';
})();
