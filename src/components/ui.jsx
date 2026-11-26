import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import { getContent } from '../content/store';
import { Bike, ChefHat, Check, Clock, Eye, EyeOff, Flame, Gift, Heart, Leaf, MapPin, Pizza, ShieldCheck, Smile, Sparkles, Star, Store, Timer, Truck, X } from 'lucide-react';

/* Icons the admin can pick for editable content (kept to a curated set so the bundle stays small). */
export const ICONS = { Timer, MapPin, Flame, ChefHat, Bike, Store, Truck, Clock, Pizza, Star, Gift, Heart, Leaf, ShieldCheck, Smile, Sparkles };
export function Icon({ name, ...props }) {
  const I = ICONS[name] || Sparkles;
  return <I aria-hidden="true" {...props} />;
}

export const EASE = [0.2, 0.8, 0.2, 1];

/* ---------- Brand mark: the domino tile in logo blue and red ---------- */
export function Logo({ className = '', mono = false }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <g transform="rotate(-12 17 17)">
          <rect x="4" y="7" width="26" height="20" rx="4" fill={mono ? '#fff' : '#e31837'} />
          <path d="M17 7h9a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-9V7Z" fill={mono ? '#cfe5ef' : '#006491'} />
          <rect x="16.2" y="7" width="1.6" height="20" fill={mono ? '#006491' : '#fff'} />
          <circle cx="10.5" cy="12.5" r="1.9" fill={mono ? '#006491' : '#fff'} />
          <circle cx="10.5" cy="21.5" r="1.9" fill={mono ? '#006491' : '#fff'} />
          <circle cx="23.5" cy="17" r="1.9" fill={mono ? '#006491' : '#fff'} />
        </g>
      </svg>
      <span className="font-display text-[19px] font-extrabold uppercase tracking-tight">{getContent().settings.brandName}</span>
    </span>
  );
}

/* ---------- Veg / non-veg mark (standard square-and-dot) ---------- */
export function VegMark({ veg, className = '' }) {
  const c = veg ? 'var(--color-veg)' : 'var(--color-nonveg)';
  return (
    <span role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'} title={veg ? 'Vegetarian' : 'Non-vegetarian'}
      className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded-[3px] border-[1.5px] bg-white ${className}`} style={{ borderColor: c }}>
      <span className="h-2 w-2 rounded-full" style={{ background: c }} />
    </span>
  );
}

export function Rating({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-2">
      <Star size={14} className="fill-cheese text-cheese" aria-hidden="true" />
      {value.toFixed(1)}
    </span>
  );
}

export function Spice({ level = 0 }) {
  if (!level) return null;
  return (
    <span className="inline-flex items-center text-red-500" aria-label={`Spice level ${level} of 3`} title={`Spice ${level}/3`}>
      {Array.from({ length: level }, (_, i) => <Flame key={i} size={13} aria-hidden="true" />)}
    </span>
  );
}

/* ---------- Image with graceful fallback ---------- */
export function Photo({ product, className = '', sizes, eager }) {
  const [broken, setBroken] = useState(false);
  if (!product.image || broken) {
    const [a, b] = product.swatch || ['#006491', '#003e5c'];
    return (
      <div className={`grid place-items-center ${className}`} style={{ background: `linear-gradient(150deg, ${a}, ${b})` }} aria-hidden="true">
        <svg viewBox="0 0 40 80" className="h-[62%] drop-shadow-lg" aria-hidden="true">
          <path d="M14 2h12v8c0 3 6 7 6 14v50a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V24c0-7 6-11 6-14V2Z" fill="rgba(255,255,255,.9)" />
          <rect x="8" y="36" width="24" height="18" fill={a} />
        </svg>
      </div>
    );
  }
  return (
    <img src={product.image} alt={product.name} sizes={sizes} loading={eager ? 'eager' : 'lazy'} decoding="async"
      onError={() => setBroken(true)} className={`object-cover ${className}`} />
  );
}

/* ---------- Modal / bottom sheet with focus trap ---------- */
export function Sheet({ open, onClose, title, children, side = 'center', labelledBy, wide = false }) {
  const ref = useRef(null);
  const last = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    last.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const el = ref.current?.querySelector('[data-autofocus]') || ref.current?.querySelector('button, [href], input, select, textarea');
      el?.focus({ preventScroll: true });
    }, 60);
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current?.();
      if (e.key !== 'Tab' || !ref.current) return;
      const f = [...ref.current.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; last.current?.focus?.({ preventScroll: true }); };
  }, [open]);

  const panel = side === 'right'
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' }, cls: 'right-0 top-0 h-full w-full max-w-[440px] rounded-none sm:rounded-l-3xl' }
    : { initial: { y: 40, opacity: 0, scale: 0.98 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: 30, opacity: 0, scale: 0.98 },
      cls: `inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] ${wide ? 'sm:max-w-[880px]' : 'sm:max-w-[520px]'} sm:rounded-3xl sm:max-h-[88dvh]` };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div className="absolute inset-0 bg-blue-950/55 backdrop-blur-[2px]" onClick={() => closeRef.current?.()}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-label={labelledBy ? undefined : title} aria-labelledby={labelledBy}
            className={`absolute flex flex-col overflow-hidden bg-white shadow-pop ${panel.cls}`}
            initial={panel.initial} animate={panel.animate} exit={panel.exit}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function SheetHeader({ title, onClose, id, sub }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-2 px-5 py-4 sm:px-6">
      <div>
        <h2 id={id} className="text-[20px] font-extrabold">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-ink-3">{sub}</p>}
      </div>
      <button onClick={onClose} className="-mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-canvas" aria-label="Close">
        <X size={20} />
      </button>
    </div>
  );
}

/* ---------- Form bits ---------- */
export function Field({ label, error, hint, children, id }) {
  return (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p key="e" role="alert" className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.p>
        ) : hint ? <p className="mt-1.5 text-[12.5px] text-ink-3">{hint}</p> : null}
      </AnimatePresence>
    </div>
  );
}

export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One letter', test: (p) => /[a-zA-Z]/.test(p) },
];
export const passwordOk = (p) => PASSWORD_RULES.every((r) => r.test(p));

export function PasswordField({ value, onChange, label = 'Password', autoComplete = 'current-password', showRules = false, error }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <Field label={label} id={id} error={error}>
      <div className="relative">
        <input id={id} className="input pr-12" type={show ? 'text' : 'password'} value={value} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={showRules ? id + '-rules' : undefined} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-3 hover:text-ink">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showRules && (
        <ul id={id + '-rules'} className="mt-3 grid gap-1.5">
          {PASSWORD_RULES.map((r) => {
            const ok = r.test(value);
            return (
              <li key={r.label} className={`flex items-center gap-2 text-[13px] transition-colors ${ok ? 'text-ink' : 'text-ink-3'}`}>
                <motion.span className="grid h-[18px] w-[18px] place-items-center rounded-full"
                  animate={{ backgroundColor: ok ? '#1f8a4c' : 'rgba(0,0,0,0)', boxShadow: ok ? 'inset 0 0 0 0px #0000' : 'inset 0 0 0 1.5px #b6c3cc' }}>
                  <motion.span animate={{ scale: ok ? 1 : 0.3, opacity: ok ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                    <Check size={12} strokeWidth={3.5} className="text-white" />
                  </motion.span>
                </motion.span>
                {r.label}<span className="sr-only">{ok ? ' — met' : ' — not met'}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Field>
  );
}

/* One-time code: a single real input under six visual boxes, so paste and
   SMS autofill work. Pattern adapted from 21st.dev "Sign Up Flow". */
export function OtpInput({ value, onChange, length = 6, error, disabled, shakeKey }) {
  const [focused, setFocused] = useState(false);
  const controls = useAnimationControls();
  useEffect(() => { if (shakeKey) controls.start({ x: [0, -9, 8, -6, 4, -2, 0], transition: { duration: 0.45 } }); }, [shakeKey, controls]);
  return (
    <motion.div animate={controls} className="relative">
      <input value={value} inputMode="numeric" autoComplete="one-time-code" aria-label={`${length}-digit code`} maxLength={length}
        disabled={disabled} data-autofocus onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" />
      <div className="flex justify-between gap-2" aria-hidden="true">
        {Array.from({ length }, (_, i) => {
          const ch = value[i];
          const active = focused && (i === value.length || (i === length - 1 && value.length === length));
          return (
            <div key={i} className={`grid h-14 flex-1 place-items-center rounded-xl bg-canvas text-[24px] font-bold tabular-nums ring-[1.5px] transition-shadow
              ${error ? 'text-red-600 ring-red-500' : active ? 'ring-blue-500' : 'ring-transparent'}`}>
              {ch ? (
                <motion.span key={ch + i} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }}>{ch}</motion.span>
              ) : active ? <span className="h-7 w-[2px] animate-pulse rounded-full bg-blue-500" /> : <span className="h-[3px] w-3 rounded-full bg-ink-3/30" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* Checkout progress. Structure adapted from 21st.dev "Stepper": done steps
   are buttons that go back, the track fills up to the current step. */
export function Stepper({ steps, current, onStep }) {
  const last = steps.length - 1;
  return (
    <nav aria-label="Checkout progress" className="relative">
      <div className="absolute left-[18px] right-[18px] top-[17px] h-[3px] rounded-full bg-line" aria-hidden="true">
        <motion.div className="h-full origin-left rounded-full bg-blue-600" animate={{ scaleX: last ? Math.min(current, last) / last : 0 }} transition={{ duration: 0.5, ease: EASE }} />
      </div>
      <ol className="relative flex justify-between">
        {steps.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'next';
          const inner = (
            <>
              <motion.span className={`grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold ring-4 ring-white
                ${state === 'next' ? 'bg-white text-ink-3 shadow-[inset_0_0_0_2px_var(--color-line)]' : 'bg-blue-600 text-white'}`}
                animate={{ scale: state === 'current' ? 1.08 : 1 }}>
                {state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}
              </motion.span>
              <span className={`mt-2 text-[12.5px] font-semibold ${state === 'next' ? 'text-ink-3' : 'text-ink'} ${state === 'current' ? '' : 'max-sm:sr-only'}`}>{s}</span>
            </>
          );
          return (
            <li key={s} aria-current={state === 'current' ? 'step' : undefined} className="flex flex-col items-center">
              {state === 'done' && onStep
                ? <button type="button" onClick={() => onStep(i)} className="flex flex-col items-center rounded-lg" aria-label={`Back to ${s}`}>{inner}</button>
                : <span className="flex flex-col items-center">{inner}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Spinner({ className = '' }) {
  return <span className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden="true" />;
}

/* Animated number for prices */
export function Qty({ value, onChange, min = 0, label }) {
  return (
    <div className="inline-flex items-center rounded-full bg-canvas ring-1 ring-line" role="group" aria-label={label ? `Quantity of ${label}` : 'Quantity'}>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-[18px] font-bold text-blue-600 hover:bg-white disabled:opacity-40"
        onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">−</button>
      <span className="w-7 text-center text-[15px] font-bold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-[18px] font-bold text-blue-600 hover:bg-white disabled:opacity-40"
        onClick={() => onChange(value + 1)} disabled={value >= 20} aria-label="Increase">+</button>
    </div>
  );
}
