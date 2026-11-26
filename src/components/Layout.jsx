import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Bike, ChevronDown, Info, Menu as MenuIcon, MessageSquareText, ShoppingBag, Store, User, X } from 'lucide-react';
import { useApp } from '../state/AppState';
import { areaById, storeById } from '../data/menu';
import { prettyPhone, taka } from '../lib/format';
import { Logo } from './ui';
import { useContent } from '../content/store';

const useNav = () => useContent().nav.filter((n) => n.show);

export function ConceptBanner() {
  const b = useContent().banner;
  if (!b.show) return null;
  return (
    <div className="bg-blue-950 text-[12.5px] text-blue-100">
      <div className="container-x flex items-center justify-center gap-2 py-1.5 text-center">
        <Info size={14} className="shrink-0" aria-hidden="true" />
        <span><span className="sm:hidden">{b.short}</span><span className="max-sm:hidden">{b.text}</span></span>
      </div>
    </div>
  );
}

export function LocationChip({ compact = false }) {
  const { fulfil, setLocationOpen } = useApp();
  let line = 'Set delivery address';
  let Icon = Bike;
  if (fulfil.mode === 'pickup') {
    Icon = Store;
    line = fulfil.storeId ? `Pickup · ${storeById(fulfil.storeId)?.name}` : 'Choose a pickup store';
  } else if (fulfil.address) {
    line = `${fulfil.address.label || 'Deliver'} · ${areaById(fulfil.address.area)?.name}`;
  }
  return (
    <button onClick={() => setLocationOpen(true)}
      className={`group flex min-w-0 items-center gap-2 rounded-full bg-blue-50 pl-2.5 pr-3 text-left ring-1 ring-blue-100 transition-colors hover:bg-blue-100 ${compact ? 'h-9' : 'h-10'}`}>
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 text-white"><Icon size={14} aria-hidden="true" /></span>
      <span className="min-w-0">
        <span className="block text-[10.5px] font-bold uppercase leading-none tracking-wider text-blue-700">{fulfil.mode === 'pickup' ? 'Carryout' : 'Delivery'}</span>
        <span className="block truncate text-[13px] font-semibold leading-tight text-ink">{line}</span>
      </span>
      <ChevronDown size={15} className="shrink-0 text-ink-3 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
    </button>
  );
}

export function Header() {
  const { totals, setCartOpen, user } = useApp();
  const NAV = useNav();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 8));
  const loc = useLocation();
  useEffect(() => setMenu(false), [loc.pathname]);

  return (
    <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-md transition-shadow ${scrolled ? 'shadow-[0_6px_24px_-16px_rgb(6_43_64/.5)]' : ''}`}>
      <div className="container-x flex h-16 items-center gap-3 lg:h-[72px] lg:gap-6">
        <Link to="/" className="shrink-0 text-blue-700" aria-label="Domino’s home"><Logo /></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="relative rounded-full px-3.5 py-2 text-[15px] font-semibold text-ink-2 hover:text-blue-700">
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-blue-50" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span className={`relative ${isActive ? 'text-blue-700' : ''}`}>{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden min-w-0 max-w-[260px] md:block"><LocationChip /></div>
        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link to={user ? '/account' : '/signin'} className="hidden h-10 items-center gap-2 rounded-full px-3 text-[14px] font-semibold text-ink-2 hover:bg-canvas sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-[12px] font-bold text-white">
              {user ? user.name[0].toUpperCase() : <User size={15} aria-hidden="true" />}
            </span>
            {user ? user.name.split(' ')[0] : 'Sign in'}
          </Link>
          <button onClick={() => setCartOpen(true)} className="btn-primary relative h-10 pl-3.5 pr-4" aria-label={`Open cart, ${totals.count} items`}>
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline">{totals.count ? taka(totals.total) : 'Cart'}</span>
            <AnimatePresence>
              {totals.count > 0 && (
                <motion.span key={totals.count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 18 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">{totals.count}</motion.span>
              )}
            </AnimatePresence>
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-canvas lg:hidden" onClick={() => setMenu((m) => !m)}
            aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu ? 'Close menu' : 'Open menu'}>
            {menu ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>
      <div className="container-x pb-2.5 md:hidden"><LocationChip compact /></div>
      <AnimatePresence>
        {menu && (
          <motion.nav id="mobile-nav" aria-label="Main" className="overflow-hidden border-t border-line-2 lg:hidden"
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.28 }}>
            <div className="container-x grid gap-1 py-3">
              {[...NAV, { to: user ? '/account' : '/signin', label: user ? 'My account' : 'Sign in / Create account' }].map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}>
                  <NavLink to={n.to} className={({ isActive }) => `block rounded-xl px-3 py-3 text-[16px] font-semibold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-ink'}`}>{n.label}</NavLink>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  const { resetDemo } = useApp();
  const f = useContent().footer;
  return (
    <footer className="mt-24 bg-blue-900 text-blue-100">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(var(--cols),1fr)]" style={{ '--cols': f.columns.length }}>
        <div>
          <Logo mono className="text-white" />
          <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-blue-200">{f.about}</p>
          <p className="mt-4 text-[13px] text-blue-200">{f.hours}</p>
        </div>
        {f.columns.map((c) => (
          <div key={c.id}>
            <h2 className="font-sans text-[13px] font-bold uppercase tracking-[.14em] text-white">{c.title}</h2>
            <ul className="mt-4 grid gap-2.5 text-[14.5px]">
              {c.links.map((l) => <li key={l.id}><Link to={l.to} className="hover:text-white hover:underline underline-offset-4">{l.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-5 text-[12.5px] text-blue-200 md:flex-row md:items-center md:justify-between">
          <p>{f.legal}</p>
          {import.meta.env.DEV && <a href="./admin/" className="shrink-0 font-semibold text-white underline underline-offset-4">Admin dashboard</a>}
          <button onClick={() => { if (confirm('Clear all demo accounts, orders and cart from this browser?')) resetDemo(); }} className="shrink-0 font-semibold text-white underline underline-offset-4">Reset demo data</button>
        </div>
      </div>
    </footer>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[72px] z-[80] flex flex-col items-center sm:top-auto sm:bottom-4 gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className={`pointer-events-auto max-w-[440px] rounded-2xl px-4 py-3 text-[14px] font-semibold shadow-pop ${t.tone === 'error' ? 'bg-red-600 text-white' : 'bg-ink text-white'}`}>
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* Stands in for the SMS gateway: shows the code a real phone would receive. */
export function SmsInbox() {
  const { sms, setSms } = useApp();
  return (
    <AnimatePresence>
      {sms && (
        <motion.aside initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed right-3 top-3 z-[90] w-[min(360px,calc(100%-1.5rem))] rounded-2xl bg-white p-4 shadow-pop ring-1 ring-line" aria-live="polite" aria-label="Demo text message">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-veg text-white"><MessageSquareText size={18} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-ink-3">Demo SMS to {prettyPhone(sms.to)}</p>
              {sms.code ? (
                <p className="mt-0.5 text-[14px] text-ink">Your Domino’s code is <b className="font-mono text-[17px] tracking-[.2em] text-blue-700">{sms.code}</b>. It expires in 5 minutes.</p>
              ) : (
                <p className="mt-0.5 text-[14px] text-ink">No account uses this number, so no code was sent. (The form shows the same screen either way.)</p>
              )}
              <p className="mt-1.5 text-[11.5px] text-ink-3">In production this arrives by text message, not on screen.</p>
            </div>
            <button onClick={() => setSms(null)} className="grid h-8 w-8 place-items-center rounded-full text-ink-3 hover:bg-canvas" aria-label="Dismiss"><X size={16} /></button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
