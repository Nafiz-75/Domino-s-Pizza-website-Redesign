import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { useApp } from '../state/AppState';
import { COUPONS, FREE_DELIVERY_OVER, MIN_DELIVERY_ORDER, PRODUCT, UPSELL, describeOptions } from '../data/menu';
import { taka } from '../lib/format';
import { Photo, Qty, Sheet, SheetHeader } from './ui';

export function CouponBox() {
  const { coupon, setCoupon, applyCoupon, totals } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  if (coupon) {
    const r = totals.couponResult;
    return (
      <div className={`flex items-start gap-3 rounded-xl p-3 ring-1 ${r?.ok ? 'bg-blue-50 ring-blue-100' : 'bg-red-50 ring-red-100'}`}>
        <Tag size={18} className={r?.ok ? 'mt-0.5 text-blue-600' : 'mt-0.5 text-red-600'} aria-hidden="true" />
        <div className="min-w-0 flex-1 text-[13.5px]">
          <p className="font-bold">{coupon} <span className="font-medium text-ink-3">· {COUPONS[coupon]?.label}</span></p>
          <p className={r?.ok ? 'text-blue-700' : 'text-red-700'}>{r?.message}</p>
        </div>
        <button onClick={() => setCoupon(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white" aria-label="Remove code"><X size={16} /></button>
      </div>
    );
  }
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const r = applyCoupon(code); if (!r.ok) setErr(r.message); else { setErr(''); setCode(''); } }}>
      <div className="flex-1">
        <label htmlFor="coupon" className="sr-only">Promo code</label>
        <input id="coupon" className="input h-11 uppercase placeholder:normal-case" placeholder="Promo code" value={code} onChange={(e) => { setCode(e.target.value); setErr(''); }} aria-invalid={!!err} aria-describedby={err ? 'coupon-err' : undefined} />
        {err && <p id="coupon-err" className="field-error" role="alert">{err}</p>}
      </div>
      <button className="btn-ghost h-11" disabled={!code.trim()}>Apply</button>
    </form>
  );
}

export function TotalsTable({ t = null, compact }) {
  const { totals: live, fulfil } = useApp();
  const x = t || live;
  const mode = t?.mode || fulfil.mode;
  const row = (l, v, cls = '') => <div className={`flex justify-between ${cls}`}><dt>{l}</dt><dd className="tabular-nums">{v}</dd></div>;
  return (
    <dl className={`grid gap-1.5 text-[14px] text-ink-2 ${compact ? '' : ''}`}>
      {row('Subtotal', taka(x.subtotal))}
      {x.discount > 0 && row('Discount', '−' + taka(x.discount), 'text-veg font-semibold')}
      {mode === 'delivery' && row('Delivery', x.delivery ? taka(x.delivery) : 'Free')}
      {row('Total', taka(x.total), 'mt-1 border-t border-line-2 pt-2 text-[17px] font-extrabold text-ink')}
      <p className="text-[11.5px] text-ink-3">Prices include VAT.</p>
    </dl>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, totals, setQty, openItem, addToCart, fulfil } = useApp();
  const nav = useNavigate();
  const close = () => setCartOpen(false);
  const ups = UPSELL.filter((id) => !totals.lines.some((l) => l.id === id)).slice(0, 3).map((id) => PRODUCT[id]);
  const progress = fulfil.mode === 'delivery' && totals.subtotal ? Math.min(1, (totals.subtotal - totals.discount) / FREE_DELIVERY_OVER) : 0;

  return (
    <Sheet open={cartOpen} onClose={close} side="right" labelledBy="cart-title">
      <SheetHeader id="cart-title" title="Your order" onClose={close} sub={totals.count ? `${totals.count} item${totals.count > 1 ? 's' : ''}` : undefined} />
      {totals.lines.length === 0 ? (
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div>
            <motion.div initial={{ rotate: -12, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring' }}
              className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-blue-50 text-blue-600"><ShoppingBag size={34} /></motion.div>
            <h3 className="mt-5 text-[20px] font-extrabold">Your cart is empty</h3>
            <p className="mt-1 text-[14px] text-ink-3">Pick a pizza and we’ll get the oven going.</p>
            <button className="btn-primary mt-6" onClick={() => { close(); nav('/menu'); }}>Browse the menu</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {fulfil.mode === 'delivery' && (
              <div className="mb-4 rounded-xl bg-canvas p-3">
                <p className="text-[13px] font-semibold text-ink-2">
                  {totals.toFree > 0 ? <>Add <b className="text-ink">{taka(totals.toFree)}</b> more for free delivery</> : 'You’ve got free delivery 🎉'}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <motion.div className="h-full rounded-full bg-blue-600" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
              </div>
            )}
            <ul className="grid gap-3">
              <AnimatePresence initial={false}>
                {totals.lines.map((l) => (
                  <motion.li key={l.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }}
                    className="flex gap-3 rounded-2xl p-2 ring-1 ring-line-2">
                    <Photo product={l.product} className="h-20 w-20 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14.5px] font-bold leading-snug">{l.product.name}</p>
                        <p className="shrink-0 text-[14.5px] font-bold tabular-nums">{taka(l.total)}</p>
                      </div>
                      {l.product.kind === 'pizza' && <p className="mt-0.5 text-[12px] leading-snug text-ink-3">{describeOptions(l.product, l.opts)}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <Qty value={l.qty} onChange={(v) => setQty(l.key, v)} label={l.product.name} />
                        <div className="flex">
                          {l.product.kind === 'pizza' && <button onClick={() => openItem(l.id, { editKey: l.key })} className="grid h-9 w-9 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-blue-600" aria-label={`Edit ${l.product.name}`}><Pencil size={16} /></button>}
                          <button onClick={() => setQty(l.key, 0)} className="grid h-9 w-9 place-items-center rounded-full text-ink-3 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${l.product.name}`}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {ups.length > 0 && (
              <div className="mt-6">
                <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-ink-3">Goes well with</h3>
                <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                  {ups.map((p) => (
                    <button key={p.id} onClick={() => addToCart(p.id)} className="flex w-[150px] shrink-0 items-center gap-2 rounded-xl p-2 text-left ring-1 ring-line-2 hover:ring-blue-200">
                      <Photo product={p} className="h-11 w-11 shrink-0 rounded-lg" />
                      <span className="min-w-0"><span className="block truncate text-[12.5px] font-semibold">{p.name}</span><span className="text-[12px] font-bold text-blue-700">+ {taka(p.price)}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6"><CouponBox /></div>
          </div>
          <div className="border-t border-line-2 bg-white px-5 py-4 sm:px-6">
            <TotalsTable />
            {totals.belowMin && <p className="mt-2 text-[13px] font-semibold text-red-600">Delivery orders start at {taka(MIN_DELIVERY_ORDER)}.</p>}
            <button className="btn-primary mt-3 h-12 w-full text-[16px]" disabled={totals.belowMin} onClick={() => { close(); nav('/checkout'); }}>
              Checkout · {taka(totals.total)}
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
