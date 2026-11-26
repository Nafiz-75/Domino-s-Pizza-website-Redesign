import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { load, save, wipeAll } from '../lib/storage';
import { hashPassword, makeOtp, makeSalt } from '../lib/crypto';
import { isBDPhone, isEmail, normalizeBDPhone, uid } from '../lib/format';
import {
  AREAS, COUPONS, DELIVERY_FEE, FREE_DELIVERY_OVER, MIN_DELIVERY_ORDER, PRODUCT,
  areaById, storeById, unitPrice,
} from '../data/menu';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

/* Order life cycle. Offsets are seconds after placing, compressed for the
   demo; production reads these from the store's make-line events. */
export const STAGES_DELIVERY = [
  { id: 'placed', label: 'Order received', at: 0 },
  { id: 'prep', label: 'Being made', at: 25 },
  { id: 'oven', label: 'In the oven', at: 70 },
  { id: 'qc', label: 'Quality check', at: 130 },
  { id: 'out', label: 'Out for delivery', at: 160 },
  { id: 'done', label: 'Delivered', at: 300 },
];
export const STAGES_PICKUP = [
  { id: 'placed', label: 'Order received', at: 0 },
  { id: 'prep', label: 'Being made', at: 25 },
  { id: 'oven', label: 'In the oven', at: 70 },
  { id: 'qc', label: 'Quality check', at: 130 },
  { id: 'done', label: 'Ready for pickup', at: 160 },
];
export function orderStage(order, now = Date.now()) {
  const stages = order.mode === 'pickup' ? STAGES_PICKUP : STAGES_DELIVERY;
  if (order.cancelled) return { stages, index: -1, cancelled: true };
  /* a store/admin override from the dashboard wins over the timed simulation */
  if (order.stageIndex != null) { const index = Math.min(order.stageIndex, stages.length - 1); return { stages, index, done: index === stages.length - 1 }; }
  /* scheduled orders start on the make-line one ETA before the chosen time */
  const start = order.when && order.when !== 'asap' ? Math.max(order.placedAt, new Date(order.when).getTime() - order.etaMin * 60_000) : order.placedAt;
  const secs = (now - start) / 1000;
  if (secs < 0) return { stages, index: 0, waiting: true, startsAt: start };
  let index = 0;
  stages.forEach((s, i) => { if (secs >= s.at) index = i; });
  return { stages, index, done: index === stages.length - 1 };
}

const lineKey = (id, opts) => id + '|' + JSON.stringify({ s: opts.size, c: opts.crust, t: [...(opts.toppings || [])].sort() });

export function AppProvider({ children }) {
  /* ---------- persisted state ---------- */
  const [users, setUsers] = useState(() => load('users', []));
  const [sessionId, setSessionId] = useState(() => load('session', null));
  const [cart, setCart] = useState(() => load('cart', []));
  const [orders, setOrders] = useState(() => load('orders', []));
  const [fulfil, setFulfil] = useState(() => load('fulfil', { mode: 'delivery', address: null, storeId: null, when: 'asap' }));
  const [coupon, setCoupon] = useState(() => load('coupon', null));

  useEffect(() => save('users', users), [users]);
  useEffect(() => save('session', sessionId), [sessionId]);
  useEffect(() => save('cart', cart), [cart]);
  useEffect(() => save('orders', orders), [orders]);
  useEffect(() => save('fulfil', fulfil), [fulfil]);
  useEffect(() => save('coupon', coupon), [coupon]);

  /* keep tabs in sync (sign out in one tab signs out everywhere) */
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key?.startsWith('dpz-concept:')) return;
      setUsers(load('users', [])); setSessionId(load('session', null)); setCart(load('cart', []));
      setOrders(load('orders', [])); setFulfil(load('fulfil', fulfil)); setCoupon(load('coupon', null));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* an account blocked from the admin dashboard is signed out */
  const user = users.find((u) => u.id === sessionId && !u.blocked) || null;

  /* ---------- UI: toasts, cart drawer, location sheet ---------- */
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((text, tone = 'info') => {
    const id = uid('t');
    setToasts((t) => [...t.slice(-1), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  /* item sheet: { id, editKey?, size? } */
  const [item, setItem] = useState(null);
  const openItem = useCallback((id, extra = {}) => setItem({ id, ...extra, n: Date.now() }), []);
  const closeItem = useCallback(() => setItem(null), []);
  /* demo SMS inbox: shows the OTP that production would text */
  const [sms, setSms] = useState(null);

  /* ---------- auth ---------- */
  const failures = useRef({});
  const pending = useRef(null); // { kind: 'signup'|'reset', phone, otp, expires, data }

  const findUser = (identifier) => {
    const id = identifier.trim().toLowerCase();
    const phone = normalizeBDPhone(id);
    return users.find((u) => (isBDPhone(phone) && u.phone === phone) || (u.email && u.email === id));
  };

  const sendOtp = (kind, phone, data) => {
    const otp = makeOtp();
    pending.current = { kind, phone, otp, expires: Date.now() + 5 * 60_000, data, tries: 0 };
    setSms({ to: phone, code: otp, at: Date.now() });
  };

  const startSignUp = async ({ name, phone, email, password }) => {
    const p = normalizeBDPhone(phone);
    if (!name.trim()) throw new Error('Tell us your name.');
    if (!isBDPhone(p)) throw new Error('Enter an 11-digit Bangladeshi mobile number, like 01712-345678.');
    if (email && !isEmail(email)) throw new Error('That email address is missing something.');
    if (users.some((u) => u.phone === p)) throw new Error('An account already uses this number. Sign in instead.');
    if (email && users.some((u) => u.email === email.trim().toLowerCase())) throw new Error('An account already uses this email. Sign in instead.');
    const salt = makeSalt();
    const hash = await hashPassword(password, salt);
    sendOtp('signup', p, { name: name.trim(), phone: p, email: email.trim().toLowerCase() || null, salt, hash });
    return p;
  };

  const verifyOtp = (code) => {
    const pd = pending.current;
    if (!pd) throw new Error('That code has expired. Ask for a new one.');
    if (Date.now() > pd.expires) { pending.current = null; throw new Error('That code has expired. Ask for a new one.'); }
    if (code !== pd.otp) {
      pd.tries += 1;
      if (pd.tries >= 5) { pending.current = null; throw new Error('Too many wrong codes. Start again.'); }
      throw new Error(`That code isn't right. ${5 - pd.tries} tries left.`);
    }
    if (pd.kind === 'signup') {
      const u = { id: uid('u'), ...pd.data, addresses: [], createdAt: Date.now(), marketing: false };
      setUsers((list) => [...list, u]);
      setSessionId(u.id);
      pending.current = null;
      setSms(null);
      return { kind: 'signup', user: u };
    }
    pd.verified = true;
    setSms(null);
    return { kind: 'reset' };
  };

  const resendOtp = () => {
    const pd = pending.current;
    if (!pd) throw new Error('Start again to get a new code.');
    sendOtp(pd.kind, pd.phone, pd.data);
  };

  const signIn = async (identifier, password) => {
    const key = identifier.trim().toLowerCase();
    const f = failures.current[key] || { n: 0, until: 0 };
    if (Date.now() < f.until) throw new Error(`Too many attempts. Try again in ${Math.ceil((f.until - Date.now()) / 1000)} seconds.`);
    const u = findUser(identifier);
    const ok = u && (await hashPassword(password, u.salt)) === u.hash;
    if (!ok) {
      f.n += 1;
      if (f.n >= 5) { f.until = Date.now() + 60_000; f.n = 0; }
      failures.current[key] = f;
      throw new Error('That phone/email and password don’t match.');
    }
    delete failures.current[key];
    if (u.blocked) throw new Error('This account is suspended. Contact the store for help.');
    setSessionId(u.id);
    return u;
  };

  const startReset = (phone) => {
    const p = normalizeBDPhone(phone);
    if (!isBDPhone(p)) throw new Error('Enter the mobile number on your account.');
    const u = users.find((x) => x.phone === p);
    /* Same message whether or not the account exists, so the form can't be used to probe numbers. */
    if (u) sendOtp('reset', p, { userId: u.id });
    else setSms({ to: p, code: null, at: Date.now() });
    return p;
  };

  const finishReset = async (password) => {
    const pd = pending.current;
    if (!pd || pd.kind !== 'reset' || !pd.verified) throw new Error('Verify the code first.');
    const salt = makeSalt();
    const hash = await hashPassword(password, salt);
    setUsers((list) => list.map((u) => (u.id === pd.data.userId ? { ...u, salt, hash } : u)));
    setSessionId(pd.data.userId);
    pending.current = null;
  };

  const signOut = () => { setSessionId(null); setCoupon(null); toast('Signed out.'); };

  const updateUser = (patch) => setUsers((list) => list.map((u) => (u.id === sessionId ? { ...u, ...patch } : u)));

  const changePassword = async (current, next) => {
    if ((await hashPassword(current, user.salt)) !== user.hash) throw new Error('Your current password isn’t right.');
    const salt = makeSalt();
    updateUser({ salt, hash: await hashPassword(next, salt) });
  };

  const deleteAccount = () => {
    setUsers((list) => list.filter((u) => u.id !== sessionId));
    setOrders((list) => list.filter((o) => o.userId !== sessionId));
    setSessionId(null);
  };

  /* ---------- addresses ---------- */
  const saveAddress = (addr) => {
    const a = { ...addr, id: addr.id || uid('a') };
    if (user) {
      const exists = user.addresses.some((x) => x.id === a.id);
      let list = exists ? user.addresses.map((x) => (x.id === a.id ? a : x)) : [...user.addresses, a];
      if (a.isDefault || list.length === 1) list = list.map((x) => ({ ...x, isDefault: x.id === a.id }));
      updateUser({ addresses: list });
    }
    return a;
  };
  const removeAddress = (id) => user && updateUser({ addresses: user.addresses.filter((a) => a.id !== id) });

  const chooseDelivery = (address) => setFulfil((f) => ({ ...f, mode: 'delivery', address, storeId: areaById(address.area)?.store || null }));
  const choosePickup = (storeId) => setFulfil((f) => ({ ...f, mode: 'pickup', storeId }));
  const setMode = (mode) => setFulfil((f) => ({ ...f, mode }));
  const setWhen = (when) => setFulfil((f) => ({ ...f, when }));

  /* a signed-in user with a default address gets it pre-selected */
  useEffect(() => {
    if (user && !fulfil.address) {
      const d = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (d) chooseDelivery(d);
    }
  }, [user?.id, user?.addresses.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- cart ---------- */
  const addToCart = (id, opts = {}, qty = 1) => {
    const p = PRODUCT[id];
    if (!p || p.soldOut) { toast('That item isn’t available right now.', 'error'); return; }
    const o = p.kind === 'pizza' ? { size: opts.size || 'medium', crust: opts.crust || 'tossed', toppings: opts.toppings || [] } : {};
    const key = lineKey(id, o);
    setCart((c) => {
      const hit = c.find((l) => l.key === key);
      if (hit) return c.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
      return [...c, { key, id, opts: o, qty }];
    });
    toast(`${p.name} added to your order.`, 'success');
  };
  const setQty = (key, qty) => setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l))));
  const replaceLine = (key, opts) => setCart((c) => {
    const line = c.find((l) => l.key === key);
    if (!line) return c;
    const nk = lineKey(line.id, opts);
    const rest = c.filter((l) => l.key !== key);
    const merge = rest.find((l) => l.key === nk);
    if (merge) return rest.map((l) => (l.key === nk ? { ...l, qty: l.qty + line.qty } : l));
    return c.map((l) => (l.key === key ? { ...l, key: nk, opts } : l));
  });
  const clearCart = () => { setCart([]); setCoupon(null); };

  const userOrders = useMemo(() => orders.filter((o) => (user ? o.userId === user.id : !o.userId)), [orders, user]);

  const totals = useMemo(() => {
    const lines = cart.filter((l) => PRODUCT[l.id]).map((l) => {
      const product = PRODUCT[l.id];
      const unit = unitPrice(product, l.opts);
      return { ...l, product, unit, total: unit * l.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    let discount = 0, couponResult = null, freeDelivery = false;
    if (coupon && COUPONS[coupon]) {
      couponResult = COUPONS[coupon].check({ lines, subtotal, user, orderCount: user ? orders.filter((o) => o.userId === user.id && !o.cancelled).length : 0, mode: fulfil.mode, now: new Date() });
      if (couponResult.ok) { discount = Math.min(subtotal, couponResult.discount || 0); freeDelivery = !!couponResult.freeDelivery; }
    }
    const delivery = fulfil.mode === 'delivery' && subtotal > 0 && !freeDelivery && subtotal - discount < FREE_DELIVERY_OVER ? DELIVERY_FEE : 0;
    const total = Math.max(0, subtotal - discount + delivery);
    const belowMin = fulfil.mode === 'delivery' && subtotal > 0 && subtotal < MIN_DELIVERY_ORDER;
    const toFree = fulfil.mode === 'delivery' && subtotal > 0 && !freeDelivery ? Math.max(0, FREE_DELIVERY_OVER - (subtotal - discount)) : 0;
    return { lines, subtotal, count, discount, delivery, total, couponResult, belowMin, toFree };
  }, [cart, coupon, user, orders, fulfil.mode]);

  const applyCoupon = (code) => {
    const c = code.trim().toUpperCase();
    if (!COUPONS[c]) return { ok: false, message: 'We don’t recognise that code.' };
    setCoupon(c);
    return { ok: true };
  };

  /* ---------- orders ---------- */
  const placeOrder = ({ contact, payment, note }) => {
    const store = storeById(fulfil.storeId);
    const area = fulfil.address ? areaById(fulfil.address.area) : null;
    const order = {
      id: 'DPZ' + Date.now().toString().slice(-7),
      userId: user?.id || null,
      placedAt: Date.now(),
      mode: fulfil.mode,
      when: fulfil.when,
      address: fulfil.mode === 'delivery' ? fulfil.address : null,
      storeId: store?.id,
      etaMin: fulfil.mode === 'delivery' ? area?.eta || 30 : 15,
      contact, payment, note,
      lines: totals.lines.map(({ key, id, opts, qty, unit, total, product }) => ({ key, id, opts, qty, unit, total, name: product.name })),
      subtotal: totals.subtotal, discount: totals.discount, delivery: totals.delivery, total: totals.total,
      coupon: totals.couponResult?.ok ? coupon : null,
      cancelled: false,
    };
    setOrders((o) => [order, ...o]);
    if (fulfil.mode === 'delivery' && user && fulfil.address && !user.addresses.some((a) => a.id === fulfil.address.id)) saveAddress(fulfil.address);
    clearCart();
    return order;
  };
  const cancelOrder = (id) => setOrders((list) => list.map((o) => (o.id === id ? { ...o, cancelled: true } : o)));
  const reorder = (order) => {
    order.lines.forEach((l) => PRODUCT[l.id] && addToCart(l.id, l.opts, l.qty));
    setCartOpen(true);
  };

  const resetDemo = () => { wipeAll(); window.location.reload(); };

  const value = {
    user, users, toasts, toast, sms, setSms,
    startSignUp, verifyOtp, resendOtp, signIn, startReset, finishReset, signOut, updateUser, changePassword, deleteAccount,
    saveAddress, removeAddress,
    fulfil, chooseDelivery, choosePickup, setMode, setWhen,
    cart, addToCart, setQty, replaceLine, clearCart, totals, coupon, setCoupon, applyCoupon,
    orders, userOrders, placeOrder, cancelOrder, reorder,
    cartOpen, setCartOpen, locationOpen, setLocationOpen, item, openItem, closeItem,
    resetDemo, AREAS,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
