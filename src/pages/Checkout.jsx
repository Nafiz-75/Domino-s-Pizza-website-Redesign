import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Banknote, Bike, CreditCard, Lock, Pencil, ShoppingBag, Smartphone, Store } from 'lucide-react';
import { useApp } from '../state/AppState';
import { MIN_DELIVERY_ORDER, areaById, describeOptions, isStoreOpen, storeById } from '../data/menu';
import { fmtTime, isBDPhone, isEmail, normalizeBDPhone, prettyPhone, taka } from '../lib/format';
import { AddressCard, AddressForm, StoreCard, formatAddress } from '../components/Location';
import { STORES } from '../data/menu';
import { CouponBox, TotalsTable } from '../components/Cart';
import { EASE, Field, Photo, Stepper } from '../components/ui';

const STEPS = ['Delivery', 'Payment', 'Review'];

const PAYMENTS = [
  { id: 'cod', label: 'Cash on delivery', sub: 'Pay the rider in cash. Exact change helps.', icon: Banknote },
  { id: 'bkash', label: 'bKash', sub: 'You’ll approve the payment in the bKash app.', icon: Smartphone },
  { id: 'nagad', label: 'Nagad', sub: 'You’ll approve the payment in the Nagad app.', icon: Smartphone },
  { id: 'card', label: 'Card', sub: 'Visa, Mastercard or Amex on a secure payment page.', icon: CreditCard },
];

function slots(store) {
  if (!store) return [];
  const out = [];
  const now = new Date();
  const t = new Date(now.getTime() + 45 * 60_000);
  t.setMinutes(Math.ceil(t.getMinutes() / 30) * 30, 0, 0);
  for (let n = 0; out.length < 10 && n < 96; n++) {
    const d = new Date(t.getTime() + n * 30 * 60_000);
    if (isStoreOpen(store, d)) out.push(d);
  }
  return out;
}

function Panel({ title, action, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-[19px] font-extrabold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

export default function Checkout() {
  const app = useApp();
  const { user, fulfil, setMode, chooseDelivery, choosePickup, setWhen, totals, placeOrder, saveAddress } = app;
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [addingAddr, setAddingAddr] = useState(false);
  const [contact, setContact] = useState({ name: user?.name || fulfil.address?.name || '', phone: user?.phone || fulfil.address?.phone || '', email: user?.email || '' });
  const [payment, setPayment] = useState('cod');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);

  const store = storeById(fulfil.storeId);
  const open = store ? isStoreOpen(store) : true;
  const times = useMemo(() => slots(store), [store]);
  const area = fulfil.address ? areaById(fulfil.address.area) : null;

  /* Store closed (or a stale scheduled slot): move to the earliest slot it can actually make. */
  useEffect(() => {
    if (!store) return;
    const stale = fulfil.when !== 'asap' && !times.some((d) => d.toISOString() === fulfil.when);
    if ((!open && fulfil.when === 'asap') || stale) setWhen(open ? 'asap' : times[0]?.toISOString() || 'asap');
  }, [store?.id, open, times]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!totals.lines.length) {
    return (
      <div className="container-x grid min-h-[50vh] place-items-center py-16 text-center">
        <div>
          <ShoppingBag size={40} className="mx-auto text-blue-600" aria-hidden="true" />
          <h1 className="mt-4 text-[28px] font-black">Your cart is empty</h1>
          <p className="mt-1 text-ink-3">Add something from the menu to check out.</p>
          <Link to="/menu" className="btn-primary mt-6">Browse the menu</Link>
        </div>
      </div>
    );
  }

  const validateDetails = () => {
    const er = {};
    if (fulfil.mode === 'delivery' && !fulfil.address) er.where = 'Add a delivery address.';
    if (fulfil.mode === 'pickup' && !fulfil.storeId) er.where = 'Choose a store to pick up from.';
    if (!open && fulfil.when === 'asap') er.when = 'This store is closed right now. Pick a later time.';
    if (!contact.name.trim()) er.name = 'Add your name.';
    if (!isBDPhone(contact.phone)) er.phone = 'Enter an 11-digit mobile number, like 01712-345678.';
    if (contact.email && !isEmail(contact.email)) er.email = 'That email address is missing something.';
    if (totals.belowMin) er.where = `Delivery orders start at ${taka(MIN_DELIVERY_ORDER)}.`;
    setErrors(er);
    return !Object.keys(er).length;
  };

  const go = (n) => { setStep(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const next = () => { if (step === 0 && !validateDetails()) return; go(step + 1); };

  const place = async () => {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1100)); // payment gateway / order API round-trip in production
    const order = placeOrder({ contact: { ...contact, phone: normalizeBDPhone(contact.phone) }, payment, note });
    nav(`/order/${order.id}`, { replace: true });
  };

  const whenLabel = fulfil.when === 'asap' ? (fulfil.mode === 'delivery' ? `As soon as possible · ~${area?.eta || 30} min` : 'As soon as possible · ~15 min') : `Scheduled · ${new Date(fulfil.when).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="container-x py-8 sm:py-12">
      <h1 className="text-[32px] font-black sm:text-[40px]">Checkout</h1>
      <div className="mt-6 max-w-[560px]"><Stepper steps={STEPS} current={step} onStep={go} /></div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: EASE }} className="grid content-start gap-5">
            {step === 0 && (
              <>
                {!user && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                    <p className="text-[14.5px] text-blue-900"><b>Have an account?</b> Sign in to use saved addresses and earn member deals.</p>
                    <Link to="/signin?next=/checkout" className="btn-blue h-10">Sign in</Link>
                  </div>
                )}
                <Panel title="How do you want it?">
                  <div className="grid grid-cols-2 gap-2">
                    {[['delivery', 'Delivery', Bike], ['pickup', 'Carryout', Store]].map(([id, l, I]) => (
                      <button key={id} aria-pressed={fulfil.mode === id} onClick={() => { setMode(id); setErrors({}); }}
                        className={`flex h-14 items-center justify-center gap-2 rounded-xl text-[15px] font-bold ring-1 transition-colors ${fulfil.mode === id ? 'bg-blue-600 text-white ring-blue-600' : 'ring-line hover:ring-blue-200'}`}>
                        <I size={18} aria-hidden="true" />{l}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5">
                    {fulfil.mode === 'delivery' ? (
                      addingAddr || (!fulfil.address && !user?.addresses.length) ? (
                        <AddressForm contact={false} submitLabel="Deliver here" onCancel={fulfil.address || user?.addresses.length ? () => setAddingAddr(false) : undefined}
                          initial={{ name: contact.name, phone: contact.phone }}
                          onSubmit={(a) => { const s = user ? saveAddress(a) : a; chooseDelivery(s); setAddingAddr(false); setErrors({}); }} />
                      ) : (
                        <div className="grid gap-2.5">
                          {(user?.addresses.length ? user.addresses : [fulfil.address]).filter(Boolean).map((a) => (
                            <AddressCard key={a.id} a={a} selected={fulfil.address?.id === a.id} onSelect={() => chooseDelivery(a)} />
                          ))}
                          {user && fulfil.address && !user.addresses.some((a) => a.id === fulfil.address.id) && <AddressCard a={fulfil.address} selected />}
                          <button onClick={() => setAddingAddr(true)} className="btn-link justify-self-start text-[14px]">+ Use a different address</button>
                          {area && <p className="text-[13px] text-ink-3">From <b className="text-ink-2">Domino’s {store?.name}</b> · about {area.eta} minutes.</p>}
                        </div>
                      )
                    ) : (
                      <div className="grid gap-2.5">{STORES.map((s) => <StoreCard key={s.id} s={s} selected={fulfil.storeId === s.id} onSelect={() => { choosePickup(s.id); setErrors({}); }} />)}</div>
                    )}
                    {errors.where && <p className="field-error" role="alert">{errors.where}</p>}
                  </div>
                </Panel>

                {store && (
                  <Panel title="When?">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Delivery time">
                      <button role="radio" aria-checked={fulfil.when === 'asap'} disabled={!open} onClick={() => setWhen('asap')} className="chip h-10 disabled:opacity-40">As soon as possible</button>
                      {times.map((d) => (
                        <button key={d.toISOString()} role="radio" aria-checked={fulfil.when === d.toISOString()} onClick={() => setWhen(d.toISOString())} className="chip h-10">
                          {d.toDateString() === new Date().toDateString() ? 'Today' : 'Tomorrow'} {fmtTime(d)}
                        </button>
                      ))}
                    </div>
                    {!open && <p className="mt-3 text-[13.5px] font-semibold text-ink-2">Domino’s {store.name} is closed right now (opens {store.open}), so we’ve picked its first available time. You can choose another.</p>}
                    {errors.when && <p className="field-error" role="alert">{errors.when}</p>}
                  </Panel>
                )}

                <Panel title="Your details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" id="co-name" error={errors.name}><input id="co-name" className="input" value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} autoComplete="name" aria-invalid={!!errors.name} /></Field>
                    <Field label="Mobile number" id="co-phone" error={errors.phone} hint="The rider and store will call this number."><input id="co-phone" className="input" value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} inputMode="tel" autoComplete="tel" placeholder="01712-345678" aria-invalid={!!errors.phone} /></Field>
                    <div className="sm:col-span-2"><Field label="Email for receipt (optional)" id="co-email" error={errors.email}><input id="co-email" className="input" type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} autoComplete="email" aria-invalid={!!errors.email} /></Field></div>
                  </div>
                </Panel>
              </>
            )}

            {step === 1 && (
              <Panel title="How would you like to pay?">
                <div className="grid gap-2.5" role="radiogroup" aria-label="Payment method">
                  {PAYMENTS.filter((p) => !(p.id === 'cod' && fulfil.mode === 'pickup')).concat(fulfil.mode === 'pickup' ? [{ id: 'cod', label: 'Pay at the store', sub: 'Cash or card at the counter when you collect.', icon: Store }] : []).map((p) => {
                    const on = payment === p.id;
                    return (
                      <button key={p.id} role="radio" aria-checked={on} onClick={() => setPayment(p.id)}
                        className={`relative flex items-center gap-3 rounded-2xl p-4 text-left ring-1 transition-colors ${on ? 'ring-2 ring-blue-600' : 'ring-line hover:ring-blue-200'}`}>
                        {on && <motion.span layoutId="pay-bg" className="absolute inset-0 rounded-2xl bg-blue-50" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-line"><p.icon size={19} aria-hidden="true" /></span>
                        <span className="relative flex-1"><span className="block text-[15px] font-bold">{p.label}</span><span className="block text-[13px] text-ink-3">{p.sub}</span></span>
                        <span className={`relative grid h-5 w-5 place-items-center rounded-full ring-2 ${on ? 'ring-blue-600' : 'ring-line'}`}>{on && <motion.span layoutId="pay-dot" className="h-2.5 w-2.5 rounded-full bg-blue-600" />}</span>
                      </button>
                    );
                  })}
                </div>
                {payment !== 'cod' && (
                  <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas p-3 text-[13px] text-ink-2"><Lock size={15} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                    In production you’re handed to the {payment === 'card' ? 'card payment gateway' : PAYMENTS.find((x) => x.id === payment).label} page to approve the exact amount. This prototype never asks for or stores payment details, and nothing is charged.</p>
                )}
                <div className="mt-5"><Field label="Note for the store (optional)" id="co-note"><textarea id="co-note" rows={2} className="input h-auto py-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra oregano sachets please" maxLength={160} /></Field></div>
              </Panel>
            )}

            {step === 2 && (
              <>
                <Panel title="Check your order" action={<button onClick={() => go(0)} className="btn-link text-[14px]"><Pencil size={14} /> Edit</button>}>
                  <dl className="grid gap-3 text-[14.5px]">
                    <div><dt className="text-[12.5px] font-bold uppercase tracking-wider text-ink-3">{fulfil.mode === 'delivery' ? 'Deliver to' : 'Pick up from'}</dt>
                      <dd className="mt-0.5 font-semibold">{fulfil.mode === 'delivery' ? formatAddress(fulfil.address) : `Domino’s ${store?.name} · ${store?.address}`}</dd>
                      {fulfil.address?.instructions && fulfil.mode === 'delivery' && <dd className="text-ink-3">“{fulfil.address.instructions}”</dd>}</div>
                    <div><dt className="text-[12.5px] font-bold uppercase tracking-wider text-ink-3">When</dt><dd className="mt-0.5 font-semibold">{whenLabel}</dd></div>
                    <div><dt className="text-[12.5px] font-bold uppercase tracking-wider text-ink-3">Contact</dt><dd className="mt-0.5 font-semibold">{contact.name} · {prettyPhone(contact.phone)}</dd></div>
                    <div><dt className="text-[12.5px] font-bold uppercase tracking-wider text-ink-3">Payment</dt><dd className="mt-0.5 font-semibold">{fulfil.mode === 'pickup' && payment === 'cod' ? 'Pay at the store' : PAYMENTS.find((p) => p.id === payment).label}</dd></div>
                  </dl>
                </Panel>
                <Panel title="Items">
                  <ul className="grid gap-3">
                    {totals.lines.map((l) => (
                      <li key={l.key} className="flex items-center gap-3">
                        <Photo product={l.product} className="h-14 w-14 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1"><p className="text-[14.5px] font-bold">{l.qty} × {l.product.name}</p>{l.product.kind === 'pizza' && <p className="text-[12.5px] text-ink-3">{describeOptions(l.product, l.opts)}</p>}</div>
                        <p className="font-bold tabular-nums">{taka(l.total)}</p>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </>
            )}

            <div className="flex gap-3">
              {step > 0 && <button className="btn-ghost h-12" onClick={() => go(step - 1)}>Back</button>}
              {step < 2 ? (
                <button className="btn-primary h-12 flex-1 text-[16px]" onClick={next}>Continue to {STEPS[step + 1].toLowerCase()}</button>
              ) : (
                <motion.button whileTap={{ scale: 0.98 }} className="btn-primary relative h-13 flex-1 overflow-hidden text-[16.5px]" onClick={place} disabled={placing}>
                  {placing && <motion.span className="absolute inset-y-0 left-0 bg-red-700" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.1, ease: 'easeInOut' }} />}
                  <span className="relative">{placing ? 'Sending to the store…' : `Place order · ${taka(totals.total)}`}</span>
                </motion.button>
              )}
            </div>
            {step === 2 && <p className="-mt-2 text-center text-[12.5px] text-ink-3">Demo: this sends nothing to a real store and charges nothing.</p>}
          </motion.div>
        </AnimatePresence>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-5">
            <h2 className="text-[17px] font-extrabold">Order summary</h2>
            <ul className="mt-3 grid gap-1.5 text-[14px] text-ink-2">
              {totals.lines.map((l) => <li key={l.key} className="flex justify-between gap-3"><span className="truncate">{l.qty} × {l.product.name}</span><span className="tabular-nums">{taka(l.total)}</span></li>)}
            </ul>
            <div className="my-4"><CouponBox /></div>
            <TotalsTable />
          </div>
        </aside>
      </div>
    </div>
  );
}
