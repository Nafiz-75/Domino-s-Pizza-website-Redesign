import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, MapPin, Phone, Search, SearchX } from 'lucide-react';
import { useApp } from '../state/AppState';
import { AREAS, CATEGORIES, COUPONS, OFFERS, PRODUCTS, STORES, isStoreOpen } from '../data/menu';
import { ProductCard } from '../components/Product';
import { StoreCard } from '../components/Location';

export function PageHead({ eyebrow, title, sub, children }) {
  return (
    <div className="bg-white">
      <div className="container-x py-10 sm:py-14">
        {eyebrow && <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{eyebrow}</motion.p>}
        <motion.h1 className="mt-1 text-[34px] font-black sm:text-[46px]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>{title}</motion.h1>
        {sub && <p className="mt-2 max-w-[60ch] text-[16px] text-ink-3">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

export function Menu() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('c') || 'all';
  const [q, setQ] = useState('');
  const [veg, setVeg] = useState(false);
  const [sort, setSort] = useState('popular');

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let l = PRODUCTS.filter((p) => (cat === 'all' || p.kind === cat) && (!veg || p.veg) && (!term || (p.name + ' ' + p.desc).toLowerCase().includes(term)));
    l = [...l].sort(sort === 'low' ? (a, b) => a.price - b.price : sort === 'high' ? (a, b) => b.price - a.price : sort === 'rating' ? (a, b) => b.rating - a.rating : (a, b) => a.pop - b.pop);
    return l;
  }, [cat, q, veg, sort]);

  return (
    <>
      <PageHead eyebrow="Menu" title="See it, then order it" sub="Every pizza can be resized, re-crusted and topped your way. Prices are for Medium unless noted." />
      <div className="sticky top-[104px] z-30 border-y border-line-2 bg-white/90 backdrop-blur md:top-[64px] lg:top-[72px]">
        <div className="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Categories">
            {CATEGORIES.map((c) => (
              <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setParams(c.id === 'all' ? {} : { c: c.id }, { replace: true })}
                className={`relative h-10 shrink-0 rounded-full px-4 text-[14px] font-bold transition-colors ${cat === c.id ? 'text-white' : 'text-ink-2 hover:text-blue-700'}`}>
                {cat === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-blue-600" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="relative">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <div className="relative min-w-[200px] flex-1 lg:max-w-[280px]">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              <label htmlFor="menu-q" className="sr-only">Search the menu</label>
              <input id="menu-q" type="search" className="input h-10 pl-10" placeholder="Search pizzas, sides…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <button aria-pressed={veg} onClick={() => setVeg((v) => !v)} className="chip h-10 px-3.5">
              <span className={`relative h-5 w-9 rounded-full transition-colors ${veg ? 'bg-veg' : 'bg-line'}`} aria-hidden="true">
                <motion.span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow" animate={{ left: veg ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </span>
              Veg only
            </button>
            <label htmlFor="menu-sort" className="sr-only">Sort</label>
            <select id="menu-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="input h-10 w-auto pr-8 text-[14px] font-semibold">
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>
      <section className="container-x mt-8" aria-live="polite">
        <p className="mb-4 text-[14px] text-ink-3">{list.length} item{list.length === 1 ? '' : 's'}</p>
        {list.length ? (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {list.map((p, n) => <ProductCard key={p.id} product={p} index={n} />)}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="card grid place-items-center p-12 text-center">
            <SearchX size={36} className="text-ink-3" aria-hidden="true" />
            <p className="mt-3 text-[17px] font-bold">Nothing matches “{q}”</p>
            <button className="btn-link mt-2" onClick={() => { setQ(''); setVeg(false); }}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  );
}

export function Deals() {
  const { openItem, applyCoupon, toast, setCartOpen } = useApp();
  const extra = Object.entries(COUPONS).filter(([c]) => !OFFERS.some((o) => o.code === c));
  const use = (code) => {
    applyCoupon(code);
    navigator.clipboard?.writeText(code).catch(() => {});
    toast(`${code} added to your cart. It applies once the order qualifies.`);
  };
  return (
    <>
      <PageHead eyebrow="Deals" title="Offers and promo codes" sub="Codes are checked in your cart. If an order doesn’t qualify yet, the cart tells you exactly what’s missing." />
      <div className="container-x mt-10 grid gap-5 md:grid-cols-3">
        {OFFERS.map((o, n) => (
          <motion.article key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: n * 0.07 }} className="card overflow-hidden">
            <img src={o.image} alt="" className="aspect-[16/9] w-full object-cover" />
            <div className="p-5">
              <p className="text-[12px] font-bold uppercase tracking-widest text-red-600">{o.kicker}</p>
              <h2 className="mt-1 text-[21px] font-extrabold leading-tight">{o.title}</h2>
              <p className="mt-2 text-[14px] text-ink-3">{o.sub}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => use(o.code)} className="btn-ghost h-10 flex-1 font-mono tracking-wider"><Copy size={15} aria-hidden="true" /> {o.code}</button>
                <button onClick={() => openItem(o.go)} className="btn-primary h-10">Order</button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="container-x mt-10">
        <h2 className="text-[22px] font-extrabold">More codes</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {extra.map(([code, c]) => (
            <li key={code} className="card flex items-center justify-between gap-3 p-4">
              <div><p className="font-mono text-[15px] font-bold tracking-wider text-blue-700">{code}</p><p className="text-[14px] text-ink-3">{c.label}</p></div>
              <button onClick={() => { use(code); setCartOpen(true); }} className="btn-ghost h-10">Use code</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function Stores() {
  const { choosePickup, toast } = useApp();
  const [sel, setSel] = useState(STORES[0].id);
  const s = STORES.find((x) => x.id === sel);
  const areas = AREAS.filter((a) => a.store === sel);
  return (
    <>
      <PageHead eyebrow="Stores" title="Find a Domino’s near you" sub="Every store delivers to the areas around it and takes carryout orders. Store list is illustrative." />
      <div className="container-x mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid content-start gap-2.5">
          {STORES.map((x) => <StoreCard key={x.id} s={x} selected={sel === x.id} onSelect={() => setSel(x.id)} />)}
        </div>
        <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card overflow-hidden lg:sticky lg:top-28 lg:self-start">
          <iframe title={`Map of ${s.name}`} className="h-[280px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${s.lng - 0.012}%2C${s.lat - 0.008}%2C${s.lng + 0.012}%2C${s.lat + 0.008}&layer=mapnik&marker=${s.lat}%2C${s.lng}`} />
          <div className="p-6">
            <h2 className="text-[24px] font-extrabold">Domino’s {s.name}</h2>
            <p className="mt-1 flex items-start gap-2 text-[14.5px] text-ink-2"><MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />{s.address}</p>
            <p className="mt-1 flex items-center gap-2 text-[14.5px] text-ink-2"><Phone size={16} className="shrink-0 text-blue-600" aria-hidden="true" /><a href={`tel:${s.phone.replace(/\D/g, '')}`} className="hover:underline">{s.phone}</a></p>
            <p className={`mt-3 text-[14px] font-semibold ${isStoreOpen(s) ? 'text-veg' : 'text-red-600'}`}>{isStoreOpen(s) ? 'Open now' : 'Closed now'} · {s.open} – {s.close === '00:00' ? 'midnight' : s.close} daily</p>
            <h3 className="mt-5 font-sans text-[13px] font-bold uppercase tracking-wider text-ink-3">Delivers to</h3>
            <ul className="mt-2 flex flex-wrap gap-2">{areas.map((a) => <li key={a.id} className="chip">{a.name} · ~{a.eta} min</li>)}</ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn-primary" onClick={() => { choosePickup(s.id); toast(`Carryout from ${s.name} selected.`); }}>Order carryout here</button>
              <a className="btn-ghost" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}>Directions</a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
