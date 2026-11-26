/* Menu, pricing rules and store network, derived from the content store.
   The exports are live bindings: they are recomputed whenever the published
   content (or the admin draft, in preview) changes, so every component keeps
   importing them as before. Edit the data in the admin dashboard, not here. */
import { fill, getContent, imgSrc, subscribe } from '../content/store';

export let SIZES, CRUSTS, TOPPINGS, MAX_TOPPINGS, CATEGORIES, PRODUCTS, PRODUCT, HERO_PIZZAS, UPSELL, OFFERS;
export let FREE_DELIVERY_OVER, DELIVERY_FEE, MIN_DELIVERY_ORDER, COUPONS, STORES, AREAS, OUT_OF_ZONE, REVIEWS, FAQ;

const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const listDays = (d) => (d.length > 2 && d.every((x, i) => !i || x === d[i - 1] + 1) ? `${DAY[d[0]]} to ${DAY[d.at(-1)]}` : d.map((x) => DAY[x] + 's').join(' and '));

/** Evaluates a declarative coupon rule (see defaults.js) → { ok, discount, freeDelivery, message }. */
export function checkCoupon(r, { lines, subtotal, user, orderCount, mode, now }) {
  const no = (message) => ({ ok: false, message });
  const C = r.code;
  if (!r.active || (r.expires && now > new Date(r.expires + 'T23:59:59'))) return no(`${C} has ended.`);
  if (r.days?.length && !r.days.includes(now.getDay())) return no(`${C} works on ${listDays([...r.days].sort())}.`);
  if (r.mode && r.mode !== 'any' && r.mode !== mode) return no(`${C} is for ${r.mode === 'delivery' ? 'delivery' : 'carryout'} orders.`);
  if (r.requiresAccount && !user) return no(`Sign in to use ${C}. It is for ${r.firstOrderOnly ? 'new accounts' : 'members'}.`);
  if (r.firstOrderOnly && orderCount > 0) return no(`${C} is for your first order only.`);
  const needSize = r.requiresSize && !lines.some((l) => l.product.kind === 'pizza' && l.opts.size === r.requiresSize);
  const needItems = (r.requiresProducts || []).filter((id) => !lines.some((l) => l.id === id));
  if (needSize || needItems.length) {
    const want = [needSize && `a ${r.requiresSize} pizza`, ...needItems.map((id) => PRODUCT[id]?.name || id)].filter(Boolean);
    return no(`Needs ${want.join(' and ')} in the cart.`);
  }
  if (subtotal < (r.minSubtotal || 0)) return no(`Add ৳${r.minSubtotal - subtotal} more to use ${C}.`);
  let discount = 0;
  if (r.type === 'fixed') discount = r.value;
  if (r.type === 'percent') discount = Math.round((subtotal * r.value) / 100);
  if (r.type === 'bundle') {
    const units = lines.flatMap((l) => (l.product.kind === 'pizza' && (!r.bundleSize || l.opts.size === r.bundleSize) ? Array(l.qty).fill(l.unit) : []));
    const n = r.bundleQty || 2;
    if (units.length < n) return no(`Add ${n} ${r.bundleSize || ''} pizzas to use ${C}.`.replace('  ', ' '));
    discount = Math.max(0, units.sort((a, b) => b - a).slice(0, n).reduce((s, x) => s + x, 0) - r.value);
    if (!discount) return no(`Your pizzas already cost less than ৳${r.value.toLocaleString('en-US')}.`);
  }
  return { ok: true, discount, freeDelivery: r.type === 'free_delivery', message: `${r.label} applied.` };
}

function derive() {
  const c = getContent();
  const s = c.settings;
  SIZES = c.sizes;
  CRUSTS = c.crusts;
  TOPPINGS = c.toppings.filter((t) => t.show !== false);
  MAX_TOPPINGS = s.maxToppings;
  FREE_DELIVERY_OVER = s.freeDeliveryOver;
  DELIVERY_FEE = s.deliveryFee;
  MIN_DELIVERY_ORDER = s.minDeliveryOrder;
  const cats = c.categories.filter((x) => x.show !== false);
  const products = c.products
    .filter((p) => p.show !== false && cats.some((x) => x.id === p.kind))
    .map((p) => ({ ...p, tags: p.tags || [], allergens: p.allergens || [], image: imgSrc(p.image) }));
  PRODUCTS = products;
  PRODUCT = Object.fromEntries(products.map((p) => [p.id, p]));
  CATEGORIES = [{ id: 'all', label: 'All' }, ...cats.filter((x) => products.some((p) => p.kind === x.id))];
  const pizzas = products.filter((p) => p.kind === 'pizza' && !p.soldOut);
  const picked = (c.home.hero.pizzas || []).map((id) => PRODUCT[id]).filter(Boolean);
  HERO_PIZZAS = picked.length ? picked : pizzas;
  UPSELL = c.upsell.filter((id) => PRODUCT[id] && !PRODUCT[id].soldOut);
  OFFERS = c.offers.filter((o) => o.show !== false).map((o) => ({ ...o, image: imgSrc(o.image) }));
  COUPONS = Object.fromEntries(c.coupons.filter((r) => r.active).map((r) => [r.code.toUpperCase(), { label: r.label, check: (ctx) => checkCoupon(r, ctx) }]));
  STORES = c.stores.filter((x) => x.show !== false);
  AREAS = c.areas.filter((a) => STORES.some((x) => x.id === a.store));
  OUT_OF_ZONE = c.outOfZone;
  REVIEWS = c.reviews.filter((r) => r.show !== false);
  FAQ = c.faq.filter((f) => f.show !== false).map((f) => ({ ...f, a: fill(f.a, c) }));
}
derive();
subscribe(derive);

export const round10 = (n) => Math.round(n / 10) * 10;

/** Unit price of a configured line. */
export function unitPrice(product, opts = {}) {
  if (product.kind !== 'pizza') return product.price;
  const size = SIZES.find((s) => s.id === (opts.size || 'medium')) || SIZES[0];
  const crust = CRUSTS.find((c) => c.id === (opts.crust || 'tossed')) || CRUSTS[0];
  const base = round10(product.price * size.factor);
  const crustDelta = round10(crust.delta * size.factor);
  const tops = (opts.toppings || []).reduce((s, id) => s + (TOPPINGS.find((t) => t.id === id)?.price || 0), 0);
  return base + crustDelta + round10(tops * size.factor);
}

export function describeOptions(product, opts = {}) {
  if (product.kind !== 'pizza') return '';
  const size = SIZES.find((s) => s.id === (opts.size || 'medium')) || SIZES[0];
  const crust = CRUSTS.find((c) => c.id === (opts.crust || 'tossed')) || CRUSTS[0];
  const tops = (opts.toppings || []).map((id) => TOPPINGS.find((t) => t.id === id)?.label).filter(Boolean);
  return [`${size.label} ${size.inch}"`, crust.label, tops.length ? `+ ${tops.join(', ')}` : ''].filter(Boolean).join(' · ');
}

export const storeById = (id) => STORES.find((s) => s.id === id);
export const areaById = (id) => AREAS.find((a) => a.id === id);

export function nearestArea(lat, lng) {
  let best = null, bestD = Infinity;
  for (const a of AREAS) {
    const d = Math.hypot(a.lat - lat, (a.lng - lng) * Math.cos((lat * Math.PI) / 180));
    if (d < bestD) { bestD = d; best = a; }
  }
  /* ~0.045° ≈ 5 km: beyond that, treat as outside every zone */
  return bestD < 0.045 ? best : null;
}

export function isStoreOpen(store, at = new Date()) {
  const [oh, om] = store.open.split(':').map(Number);
  const [ch, cm] = store.close.split(':').map(Number);
  const mins = at.getHours() * 60 + at.getMinutes();
  const open = oh * 60 + om;
  const close = ch === 0 ? 24 * 60 : ch * 60 + cm;
  return mins >= open && mins < close;
}
