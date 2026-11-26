/* Admin UI kit: the few primitives every admin screen is built from. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { X } from 'lucide-react';
import { load, save } from '../lib/storage';

export const EASE = [0.2, 0.8, 0.2, 1];
export const spring = { type: 'spring', stiffness: 420, damping: 34 };

/* ---------- theme (light / charcoal dark), remembered per browser ---------- */
export function useTheme() {
  const [dark, setDark] = useState(() => load('admin:theme', null) ?? window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => save('admin:theme', dark), [dark]);
  return [dark, setDark];
}

/* Sun → moon morph. Adapted from 21st.dev "Animated Theme Toggle" (johuniq),
   trimmed to one path list and without next-themes. */
const RAYS = ['M12.4 1.8v2', 'M12.4 21.8v2', 'M4.6 5l1.4 1.4', 'M18.8 19.1l1.4 1.4', 'M1.4 12.8h2', 'M21.4 12.8h2', 'M4.6 20.5l1.4-1.4', 'M18.8 6.4l1.4-1.4'];
const SUN = 'M12.4 17.8a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z';
const MOON = 'M21.2 13.2A9 9 0 1 1 11.4 3.4a7 7 0 0 0 9.8 9.8Z';
export function ThemeToggle({ dark, onChange }) {
  const sun = useMotionValue(dark ? 0 : 1);
  const moon = useMotionValue(dark ? 1 : 0);
  const sunLen = useTransform(sun, [0.6, 1], [0, 1]);
  const moonLen = useTransform(moon, [0.6, 1], [0, 1]);
  const p = { stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none', transition: { duration: 0.6 } };
  return (
    <button onClick={() => onChange(!dark)} className="a-btn-quiet h-9 w-9 px-0" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
      <motion.svg width="19" height="19" viewBox="0 0 25 25" animate={dark ? 'dark' : 'light'}>
        {[SUN, ...RAYS].map((d) => <motion.path key={d} d={d} {...p} variants={{ dark: { scale: 0 }, light: { scale: 1 } }} style={{ scale: sun, pathLength: sunLen }} />)}
        <motion.path d={MOON} {...p} variants={{ dark: { scale: 1 }, light: { scale: 0 } }} style={{ scale: moon, pathLength: moonLen }} />
      </motion.svg>
    </button>
  );
}

/* ---------- toasts (module store, so any file can call notify()) ---------- */
let toasts = [];
const tsubs = new Set();
const temit = () => tsubs.forEach((f) => f());
export function notify(text, tone = 'ok') {
  const id = Math.random();
  toasts = [...toasts.slice(-2), { id, text, tone }]; temit();
  setTimeout(() => { toasts = toasts.filter((t) => t.id !== id); temit(); }, 3800);
}
export function Toaster() {
  const list = useSyncExternalStore((f) => (tsubs.add(f), () => tsubs.delete(f)), () => toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] grid gap-2" role="status" aria-live="polite">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 30 }}
            className={`pointer-events-auto max-w-[380px] rounded-xl px-4 py-3 text-[13.5px] font-semibold shadow-pop ${t.tone === 'error' ? 'bg-red-600 text-white' : 'bg-fg text-app'}`}>{t.text}</motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
/** Runs an action and reports thrown errors (e.g. storage full) as a toast. */
export const safely = (fn, ok) => (...a) => { try { fn(...a); if (ok) notify(ok); } catch (e) { notify(e.message, 'error'); } };

/* ---------- shop records shared with the storefront (orders, users) ---------- */
export function useStored(key, fallback) {
  const [v, setV] = useState(() => load(key, fallback));
  useEffect(() => {
    const on = (e) => e.key?.endsWith(':' + key) && setV(load(key, fallback));
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (next) => setV((cur) => { const val = typeof next === 'function' ? next(cur) : next; save(key, val); return val; });
  return [v, set];
}

/* ---------- primitives ---------- */
export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-edge'}`}>
      <motion.span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow" animate={{ left: checked ? 24 : 4 }} transition={spring} />
    </button>
  );
}

const TONES = {
  green: 'bg-veg/12 text-veg dark:text-[#5fd08f]', red: 'bg-red-500/12 text-red-600 dark:text-[#ff8a9b]',
  blue: 'bg-brand/12 text-brand', amber: 'bg-cheese/20 text-[#8a5a00] dark:text-cheese', gray: 'bg-raised text-dim',
};
export function Badge({ tone = 'gray', children, dot }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold ${TONES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}{children}
    </span>
  );
}

export function PageTitle({ title, sub, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-[26px] font-extrabold tracking-tight">{title}</motion.h1>
        {sub && <p className="mt-1 max-w-[70ch] text-[14px] text-dim">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = '', pad = true }) {
  return (
    <section className={`a-card ${className}`}>
      {title && <header className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3.5"><h2 className="font-sans text-[14.5px] font-bold">{title}</h2>{action}</header>}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, sub, icon: I, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, ease: EASE, duration: 0.45 }} className="a-card p-5">
      <div className="flex items-center justify-between text-[13px] font-semibold text-dim">{label}{I && <span className="grid h-8 w-8 place-items-center rounded-lg bg-raised text-brand"><I size={16} aria-hidden="true" /></span>}</div>
      <p className="mt-2 text-[28px] font-extrabold tabular-nums tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-[12.5px] text-dim">{sub}</p>}
    </motion.div>
  );
}

export function Empty({ icon: I, title, children }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      {I && <span className="grid h-12 w-12 place-items-center rounded-2xl bg-raised text-dim"><I size={22} aria-hidden="true" /></span>}
      <p className="mt-3 text-[15px] font-bold">{title}</p>
      {children && <div className="mt-1 text-[13.5px] text-dim">{children}</div>}
    </div>
  );
}

/** Right-hand editing panel with focus handling and Esc to close. */
export function Drawer({ open, onClose, title, sub, children, footer, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const t = setTimeout(() => ref.current?.querySelector('input, textarea, select, button')?.focus({ preventScroll: true }), 80);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside ref={ref} role="dialog" aria-modal="true" aria-label={title}
            className={`absolute right-0 top-0 flex h-full w-full flex-col bg-panel shadow-pop ${wide ? 'max-w-[760px]' : 'max-w-[560px]'}`}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
            <header className="flex items-start justify-between gap-4 border-b border-edge px-6 py-4">
              <div className="min-w-0"><h2 className="truncate text-[19px] font-extrabold">{title}</h2>{sub && <p className="mt-0.5 text-[13px] text-dim">{sub}</p>}</div>
              <button onClick={onClose} className="a-btn-quiet h-9 w-9 px-0" aria-label="Close"><X size={18} /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <footer className="flex items-center gap-2 border-t border-edge px-6 py-3.5">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Two-step delete: first click arms, second confirms. No browser dialogs. */
export function ConfirmButton({ onConfirm, children, label = 'Confirm', className = 'a-btn-ghost' }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t); }, [armed]);
  return (
    <button type="button" onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      className={armed ? 'a-btn bg-red-600 text-white hover:bg-red-700' : className}>{armed ? label : children}</button>
  );
}
