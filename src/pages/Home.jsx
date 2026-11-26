import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, Bike, Quote, Store } from 'lucide-react';
import { useApp } from '../state/AppState';
import { CATEGORIES, HERO_PIZZAS, OFFERS, PRODUCTS, REVIEWS } from '../data/menu';
import { taka } from '../lib/format';
import { ProductCard } from '../components/Product';
import { EASE, Icon, Rating, VegMark } from '../components/ui';
import { fill, useContent } from '../content/store';

/* Hero: the featured pizza changes on its own every few seconds. Pauses on
   hover/focus, when the tab is hidden or the hero is off screen; picking a
   pizza restarts the timer. Off entirely for reduced-motion users. */
function Hero() {
  const { openItem, setLocationOpen, setMode, fulfil } = useApp();
  const c = useContent();
  const h = c.home.hero;
  const ROTATE_MS = c.settings.heroRotateMs;
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const p = HERO_PIZZAS[i % HERO_PIZZAS.length];
  const running = !reduce && !paused && inView;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => { if (!document.hidden) setI((x) => (x + 1) % HERO_PIZZAS.length); }, ROTATE_MS);
    return () => clearTimeout(t);
  }, [i, running, ROTATE_MS]);
  if (!p) return null;

  return (
    <section ref={ref} className="relative overflow-hidden bg-blue-600 text-white" aria-roledescription="carousel" aria-label="Featured pizzas">
      {/* domino pip pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[.09]" aria-hidden="true"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 0 3px, transparent 3.5px)', backgroundSize: '38px 38px' }} />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-blue-500/60 blur-3xl" aria-hidden="true" />
      <div className="container-x relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <motion.p className="font-bn text-[17px] font-semibold text-cheese" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{h.kicker}</motion.p>
          <motion.h1 className="mt-3 text-[44px] font-black leading-[.95] sm:text-[64px] lg:text-[76px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ease: EASE, duration: 0.6 }}>
            {h.title.split(/\n/).map((l, n, a) => <span key={n} className={n === 1 ? 'text-white/90' : ''}>{l}{n < a.length - 1 && <br />}</span>)}
          </motion.h1>
          <motion.p className="mt-5 max-w-[46ch] text-[16.5px] leading-relaxed text-blue-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {h.sub}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <button className="btn-primary h-13 px-6 text-[16px]" onClick={() => { setMode('delivery'); if (!fulfil.address) setLocationOpen(true); else document.getElementById('popular')?.scrollIntoView(); }}>
              <Bike size={19} aria-hidden="true" /> {h.ctaDelivery}
            </button>
            <button className="btn h-13 bg-white px-6 text-[16px] text-blue-700 hover:bg-blue-50" onClick={() => { setMode('pickup'); setLocationOpen(true); }}>
              <Store size={19} aria-hidden="true" /> {h.ctaCarryout}
            </button>
          </motion.div>
          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[14px] text-blue-100">
            {h.bullets.map((b) => <li key={b.id} className="flex items-center gap-2"><Icon name={b.icon} size={17} /> {fill(b.text, c)}</li>)}
          </ul>
        </div>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <div className="absolute inset-[6%] rounded-full bg-blue-700/60 shadow-[inset_0_0_0_10px_rgba(255,255,255,.06)]" aria-hidden="true" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.button key={p.id} onClick={() => openItem(p.id)} aria-label={`${p.name}, customise and add`}
                className="absolute inset-[9%] overflow-hidden rounded-full shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] ring-8 ring-white/10"
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -90, scale: 0.6, x: 120 }}
                animate={{ opacity: 1, rotate: 0, scale: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6, x: -120 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18 }}>
                <img src={p.image} alt="" className="h-full w-full object-cover" />
              </motion.button>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div key={p.id} className="absolute -bottom-2 left-1/2 w-[86%] -translate-x-1/2 rounded-2xl bg-white p-4 text-ink shadow-pop sm:w-[78%]"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[16px] font-extrabold"><VegMark veg={p.veg} /> <span className="truncate">{p.name}</span></p>
                    <p className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-3"><Rating value={p.rating} /> · Medium {taka(p.price)}</p>
                  </div>
                  <button onClick={() => openItem(p.id)} className="btn-primary h-10 shrink-0 px-4 text-[14px]">Order</button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* thumbnail rail: tap to choose; the active one shows the countdown */}
          <div className="mt-10 flex justify-center gap-2.5" role="tablist" aria-label="Choose a featured pizza">
            {HERO_PIZZAS.map((x, n) => (
              <button key={x.id} role="tab" aria-selected={n === i} aria-label={x.name} onClick={() => setI(n)}
                className={`relative h-14 w-14 overflow-hidden rounded-full ring-2 transition-all sm:h-16 sm:w-16 ${n === i ? 'scale-110 ring-white' : 'opacity-60 ring-white/20 hover:opacity-100'}`}>
                <img src={x.image} alt="" className="h-full w-full object-cover" />
                {n === i && running && (
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                    <motion.circle key={i} cx="32" cy="32" r="30" fill="none" stroke="#e31837" strokeWidth="4" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }} />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">Showing {p.name}</p>
        </div>
      </div>
    </section>
  );
}

function Offers() {
  const { openItem } = useApp();
  const t = useContent().home.offers;
  if (!OFFERS.length) return null;
  return (
    <section className="container-x mt-14" aria-labelledby="offers-h">
      <div className="flex items-end justify-between gap-4">
        <div><p className="eyebrow">{t.eyebrow}</p><h2 id="offers-h" className="mt-1 text-[30px] font-extrabold sm:text-[36px]">{t.title}</h2></div>
        <Link to="/deals" className="btn-link shrink-0">All deals <ArrowRight size={16} /></Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {OFFERS.map((o, n) => (
          <motion.article key={o.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: n * 0.08, ease: EASE, duration: 0.5 }}
            whileHover={{ y: -5 }} className="group relative overflow-hidden rounded-3xl bg-blue-900 text-white">
            <img src={o.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/70 to-transparent" />
            <div className="relative flex min-h-[260px] flex-col justify-end p-6">
              <p className="text-[12px] font-bold uppercase tracking-widest text-cheese">{o.kicker}</p>
              <h3 className="mt-1 text-[24px] font-extrabold leading-tight">{o.title}</h3>
              <p className="mt-2 text-[14px] text-blue-100">{o.sub}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="rounded-lg border border-dashed border-white/50 px-2.5 py-1 font-mono text-[13px] font-bold tracking-wider">{o.code}</span>
                <button onClick={() => openItem(o.go)} className="ml-auto inline-flex items-center gap-1 text-[14px] font-bold text-white hover:underline">Order <ArrowRight size={15} /></button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Categories() {
  const t = useContent().home.categories;
  const tiles = CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({ ...c, p: PRODUCTS.find((p) => p.kind === c.id) }));
  return (
    <section className="container-x mt-16" aria-labelledby="cat-h">
      <h2 id="cat-h" className="text-[24px] font-extrabold">{t.title}</h2>
      <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-5">
        {tiles.map((t, n) => (
          <motion.div key={t.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: n * 0.05 }}>
            <Link to={`/menu?c=${t.id}`} className="group flex w-[132px] shrink-0 flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-card ring-1 ring-line/70 hover:ring-blue-200 sm:w-auto">
              <span className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-blue-50 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                {t.p.image ? <img src={t.p.image} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full" style={{ background: `linear-gradient(150deg, ${t.p.swatch[0]}, ${t.p.swatch[1]})` }} />}
              </span>
              <span className="text-[15px] font-bold">{t.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Popular() {
  const t = useContent().home.popular;
  const list = [...PRODUCTS].sort((a, b) => a.pop - b.pop).slice(0, t.count);
  return (
    <section id="popular" className="container-x mt-16 scroll-mt-28" aria-labelledby="pop-h">
      <div className="flex items-end justify-between gap-4">
        <div><p className="eyebrow">{t.eyebrow}</p><h2 id="pop-h" className="mt-1 text-[30px] font-extrabold sm:text-[36px]">{t.title}</h2></div>
        <Link to="/menu" className="btn-link shrink-0">Full menu <ArrowRight size={16} /></Link>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p, n) => <ProductCard key={p.id} product={p} index={n} />)}
      </div>
    </section>
  );
}

function HowItWorks() {
  const t = useContent().home.how;
  return (
    <section className="container-x mt-20" aria-labelledby="how-h">
      <div className="rounded-[32px] bg-white p-8 shadow-card ring-1 ring-line/70 sm:p-12">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 id="how-h" className="mt-1 max-w-[18ch] text-[30px] font-extrabold sm:text-[36px]">{t.title}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {t.steps.map((s, n) => (
            <motion.li key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: n * 0.1, ease: EASE, duration: 0.5 }} className="relative">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white"><Icon name={s.icon} size={26} /></span>
              <span className="absolute left-16 top-3 font-display text-[48px] font-black leading-none text-blue-50" aria-hidden="true">0{n + 1}</span>
              <h3 className="mt-5 text-[19px] font-extrabold">{s.title}</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-3">{s.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Reviews() {
  const t = useContent().home.reviews;
  if (!REVIEWS.length) return null;
  return (
    <section className="container-x mt-20" aria-labelledby="rev-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">{t.eyebrow}</p><h2 id="rev-h" className="mt-1 text-[30px] font-extrabold sm:text-[36px]">{t.title}</h2></div>
        <p className="text-[14px] text-ink-3"><b className="text-[22px] text-ink">{t.score}</b> {t.note}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {REVIEWS.map((r, n) => (
          <motion.figure key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: n * 0.08 }} className="card p-6">
            <Quote size={26} className="text-red-500" aria-hidden="true" />
            <blockquote className="mt-3 text-[15.5px] leading-relaxed text-ink-2">{r.text}</blockquote>
            <figcaption className="mt-4 text-[14px]"><b>{r.name}</b> <span className="text-ink-3">· {r.where}</span></figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

const SECTIONS = { hero: Hero, offers: Offers, categories: Categories, popular: Popular, how: HowItWorks, reviews: Reviews };

/* Section order and visibility come from the admin (Content → Home page). */
export default function Home() {
  const { sections } = useContent().home;
  return sections.filter((s) => s.show && SECTIONS[s.id]).map((s) => { const S = SECTIONS[s.id]; return <S key={s.id} />; });
}
