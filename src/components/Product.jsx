import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useApp } from '../state/AppState';
import { CRUSTS, MAX_TOPPINGS, PRODUCT, SIZES, TOPPINGS, unitPrice } from '../data/menu';
import { taka } from '../lib/format';
import { Photo, Qty, Rating, Sheet, SheetHeader, Spice, VegMark } from './ui';

export function ProductCard({ product, index = 0 }) {
  const { openItem, addToCart } = useApp();
  const isPizza = product.kind === 'pizza';
  return (
    <motion.article layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -4 }} className="card group flex flex-col overflow-hidden">
      <button onClick={() => openItem(product.id)} className="relative block aspect-[4/3] overflow-hidden text-left" aria-label={`${product.name}, see details`}>
        <Photo product={product} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.05]" />
        {product.tags[0] && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-bold text-red-600 shadow-sm">{product.tags[0]}</span>}
      </button>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <VegMark veg={product.veg} />
          <Rating value={product.rating} />
          <Spice level={product.spice} />
        </div>
        <h3 className="mt-2 text-[17px] font-bold leading-snug">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-ink-3">{product.desc}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            {isPizza && <span className="block text-[11.5px] font-semibold text-ink-3">Medium from</span>}
            <span className="text-[18px] font-extrabold text-ink">{taka(product.price)}</span>
          </div>
          {isPizza ? (
            <button onClick={() => openItem(product.id)} className="btn-primary h-10 px-4 text-[14px]">Customise</button>
          ) : (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => addToCart(product.id)} className="btn-primary h-10 px-4 text-[14px]" aria-label={`Add ${product.name}`}>
              <Plus size={16} aria-hidden="true" /> Add
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* Pizza builder + item detail. Used for adding and for editing a cart line. */
export function ItemSheet() {
  const { item, closeItem, addToCart, replaceLine, cart } = useApp();
  const product = item ? PRODUCT[item.id] : null;
  const editing = item?.editKey ? cart.find((l) => l.key === item.editKey) : null;
  const [size, setSize] = useState('medium');
  const [crust, setCrust] = useState('tossed');
  const [tops, setTops] = useState([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!item) return;
    setSize(editing?.opts.size || item.size || 'medium');
    setCrust(editing?.opts.crust || 'tossed');
    setTops(editing?.opts.toppings || []);
    setQty(1);
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Personal size can't take pan / cheese burst */
  useEffect(() => {
    const c = CRUSTS.find((x) => x.id === crust);
    if (c?.notOn?.includes(size)) setCrust('tossed');
  }, [size, crust]);

  if (!product) return <Sheet open={false} onClose={closeItem} />;
  const isPizza = product.kind === 'pizza';
  const opts = { size, crust, toppings: tops };
  const unit = unitPrice(product, opts);
  const toggleTop = (id) => setTops((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length >= MAX_TOPPINGS ? t : [...t, id]));

  const submit = () => {
    if (editing) replaceLine(editing.key, opts);
    else addToCart(product.id, isPizza ? opts : {}, qty);
    closeItem();
  };

  return (
    <Sheet open={!!item} onClose={closeItem} labelledBy="item-title" wide={isPizza}>
      <SheetHeader id="item-title" title={product.name} onClose={closeItem} sub={isPizza ? 'Build it your way' : product.kind[0].toUpperCase() + product.kind.slice(1)} />
      <div className={`flex-1 overflow-y-auto ${isPizza ? 'md:grid md:grid-cols-[1fr_1.15fr]' : ''}`}>
        <div className={`${isPizza ? 'md:sticky md:top-0 md:self-start' : ''} p-5 sm:p-6`}>
          <motion.div className="relative overflow-hidden rounded-2xl bg-canvas" layout>
            <motion.div key={size} initial={{ scale: 0.92, rotate: -8, opacity: 0.6 }} animate={{ scale: { personal: 0.84, medium: 0.94, large: 1 }[size] || 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
              <Photo product={product} className="aspect-[4/3] w-full rounded-2xl" eager />
            </motion.div>
          </motion.div>
          <div className="mt-4 flex items-center gap-2"><VegMark veg={product.veg} /><Rating value={product.rating} /><Spice level={product.spice} /></div>
          <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{product.desc}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-3">
            {product.kcal > 0 && <div><dt className="inline">Energy: </dt><dd className="inline font-semibold text-ink-2">{product.kcal} kcal{isPizza ? ' / slice' : ''}</dd></div>}
            {product.allergens.length > 0 && <div><dt className="inline">Contains: </dt><dd className="inline font-semibold text-ink-2">{product.allergens.join(', ')}</dd></div>}
          </dl>
        </div>

        {isPizza && (
          <div className="space-y-7 border-t border-line-2 p-5 sm:p-6 md:border-l md:border-t-0">
            <fieldset>
              <legend className="text-[15px] font-bold">Size</legend>
              <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Size">
                {SIZES.map((s) => {
                  const on = size === s.id;
                  return (
                    <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => setSize(s.id)}
                      className={`relative rounded-xl p-3 text-left ring-1 transition-colors ${on ? 'ring-2 ring-blue-600' : 'ring-line hover:ring-blue-200'}`}>
                      {on && <motion.span layoutId="size-bg" className="absolute inset-0 rounded-xl bg-blue-50" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                      <span className="relative block text-[14px] font-bold">{s.label}</span>
                      <span className="relative block text-[12px] text-ink-3">{s.inch}" · serves {s.serves}</span>
                      <span className="relative mt-1 block text-[13px] font-semibold text-blue-700">{taka(unitPrice(product, { size: s.id, crust: 'tossed' }))}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[15px] font-bold">Crust</legend>
              <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Crust">
                {CRUSTS.map((c) => {
                  const on = crust === c.id;
                  const blocked = c.notOn?.includes(size);
                  return (
                    <button key={c.id} type="button" role="radio" aria-checked={on} disabled={blocked} onClick={() => setCrust(c.id)}
                      className={`relative rounded-xl p-3 text-left ring-1 transition-colors disabled:opacity-45 ${on ? 'ring-2 ring-blue-600' : 'ring-line hover:ring-blue-200'}`}>
                      {on && <motion.span layoutId="crust-bg" className="absolute inset-0 rounded-xl bg-blue-50" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                      <span className="relative flex items-center justify-between gap-2 text-[14px] font-bold">{c.label}
                        <span className="text-[12px] font-semibold text-ink-3">{c.delta ? '+' + taka(Math.round((c.delta * SIZES.find((s) => s.id === size).factor) / 10) * 10) : 'Free'}</span></span>
                      <span className="relative block text-[12px] text-ink-3">{blocked ? 'Not on Personal size' : c.note}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="flex w-full items-baseline justify-between text-[15px] font-bold">Extra toppings
                <span className="text-[12.5px] font-semibold text-ink-3">{tops.length}/{MAX_TOPPINGS}</span></legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOPPINGS.filter((t) => product.veg ? t.veg : true).map((t) => {
                  const on = tops.includes(t.id);
                  return (
                    <motion.button key={t.id} type="button" whileTap={{ scale: 0.94 }} aria-pressed={on} onClick={() => toggleTop(t.id)}
                      disabled={!on && tops.length >= MAX_TOPPINGS} className="chip h-9 disabled:opacity-40">
                      <VegMark veg={t.veg} className="!h-3.5 !w-3.5" /> {t.label} <span className={on ? 'text-blue-100' : 'text-ink-3'}>+{taka(t.price)}</span>
                    </motion.button>
                  );
                })}
              </div>
              {product.veg && <p className="mt-2 text-[12px] text-ink-3">Showing vegetarian toppings to keep this pizza veg.</p>}
            </fieldset>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-line-2 bg-white px-5 py-4 sm:px-6">
        {!editing && <Qty value={qty} onChange={(v) => setQty(Math.max(1, v))} min={1} label={product.name} />}
        <button onClick={submit} className="btn-primary h-12 flex-1 text-[15.5px]">
          {editing ? 'Update item' : 'Add to order'} ·
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={unit * (editing ? 1 : qty)} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
              {taka(unit * (editing ? 1 : qty))}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </Sheet>
  );
}
