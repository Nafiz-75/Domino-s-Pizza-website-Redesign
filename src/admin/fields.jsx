/* Schema-driven form fields. A field is { k, label, type, ... } — see schema.js.
   One <Form> renders any record, so every editor in the dashboard is just data. */
import { useId, useRef, useState } from 'react';
import { AnimatePresence, Reorder, motion, useDragControls } from 'motion/react';
import { ChevronDown, GripVertical, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { ICONS } from '../components/ui';
import { imgSrc } from '../content/store';
import { Switch, notify } from './kit';

export const IMAGE_LIBRARY = [
  'menu_hand-tossed-pizza_2024_01', 'menu_tc-pizza_pacific-veggie_2023-05', 'specialty-pizzas', 'menu_variety_2024_02', 'menu_specialty-pizza_2024_01',
  'menu_handmade-pan-pizza_2024_01', 'new-york-style-pizza_1', 'PSC_01', 'menu_chicken-wings_2024_01', 'menu_scb_pepperoni-scb_close-up',
  'menu_bread-bites_01', 'spicy-chicken-bacon-ranch_01', 'five-cheese-mac-and-cheese', 'menu_salads', 'menu_chocolate-lava-crunch-cakes_2026_02', 'menu_marbled-cookie-brownie',
].map((n) => `img/${n}.webp`);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* Uploads are shrunk to ≤ 900 px WebP so they fit in browser storage. */
function compress(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/webp', 0.8));
    };
    img.onerror = () => reject(new Error('That file isn’t an image we can read.'));
    img.src = URL.createObjectURL(file);
  });
}

const opts = (f, ctx) => (typeof f.options === 'function' ? f.options(ctx.content, ctx.record) : f.options || []).map((o) => (Array.isArray(o) ? o : [o, String(o)]));

function ImageField({ value, onChange }) {
  const [lib, setLib] = useState(false);
  const file = useRef(null);
  const src = imgSrc(value);
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-raised ring-1 ring-edge">
          {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} className="text-dim" aria-hidden="true" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="a-btn-ghost" onClick={() => setLib((x) => !x)} aria-expanded={lib}>Library <ChevronDown size={14} /></button>
          <button type="button" className="a-btn-ghost" onClick={() => file.current.click()}>Upload</button>
          {value && <button type="button" className="a-btn-quiet" onClick={() => onChange('')}>Remove</button>}
          <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = '';
            if (f) try { onChange(await compress(f)); } catch (err) { notify(err.message, 'error'); }
          }} />
        </div>
      </div>
      <input className="a-input mt-2" placeholder="…or paste an image URL" value={value?.startsWith('data:') ? '(uploaded image)' : value || ''} onChange={(e) => onChange(e.target.value)} readOnly={value?.startsWith('data:')} />
      <AnimatePresence>
        {lib && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {IMAGE_LIBRARY.map((p) => (
                <button key={p} type="button" onClick={() => { onChange(p); setLib(false); }} aria-label={p}
                  className={`aspect-square overflow-hidden rounded-lg ring-2 ${value === p ? 'ring-brand' : 'ring-transparent hover:ring-edge'}`}>
                  <img src={imgSrc(p)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chips({ options, value = [], onChange }) {
  const set = new Set(value);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => {
        const on = set.has(v);
        return (
          <button key={v} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== v) : [...value, v])}
            className={`h-8 rounded-full px-3 text-[12.5px] font-semibold ring-1 transition-colors ${on ? 'bg-brand text-white ring-brand' : 'bg-app text-dim ring-edge hover:text-fg'}`}>{l}</button>
        );
      })}
    </div>
  );
}

function Tags({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [t, setT] = useState('');
  const add = () => { const v = t.trim(); if (v && !value.includes(v)) onChange([...value, v]); setT(''); };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl bg-app p-1.5 ring-1 ring-edge focus-within:ring-2 focus-within:ring-brand">
      {value.map((x) => (
        <span key={x} className="inline-flex h-7 items-center gap-1 rounded-lg bg-raised pl-2.5 pr-1 text-[12.5px] font-semibold">
          {x}<button type="button" className="grid h-5 w-5 place-items-center rounded text-dim hover:text-fg" onClick={() => onChange(value.filter((y) => y !== x))} aria-label={`Remove ${x}`}><X size={12} /></button>
        </span>
      ))}
      <input className="h-7 min-w-[120px] flex-1 bg-transparent px-1.5 text-[13.5px] outline-none placeholder:text-dim/70" value={t} placeholder={placeholder}
        onChange={(e) => setT(e.target.value)} onBlur={add}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)); }} />
    </div>
  );
}

/* Repeatable sub-records (hero bullets, steps, legal sections, footer links…), drag to reorder. */
function ListItem({ item, children, onRemove, fixed }) {
  const drag = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={drag} className="relative rounded-xl bg-app p-3 ring-1 ring-edge">
      <div className="flex gap-2">
        <button type="button" onPointerDown={(e) => drag.start(e)} className="grid h-8 w-6 shrink-0 cursor-grab touch-none place-items-center text-dim active:cursor-grabbing" aria-label="Drag to reorder"><GripVertical size={16} /></button>
        <div className="min-w-0 flex-1">{children}</div>
        {!fixed && <button type="button" onClick={onRemove} className="a-btn-quiet h-8 w-8 shrink-0 px-0 hover:text-red-500" aria-label="Remove"><Trash2 size={15} /></button>}
      </div>
    </Reorder.Item>
  );
}
function ListField({ f, value = [], onChange, ctx }) {
  const blank = () => ({ id: Math.random().toString(36).slice(2, 8), ...Object.fromEntries(f.fields.map((x) => [x.k, x.type === 'toggle' ? true : x.type === 'list' ? [] : ''])) });
  return (
    <div className="grid gap-2">
      <Reorder.Group axis="y" values={value} onReorder={onChange} className="grid gap-2">
        {value.map((item, i) => (
          <ListItem key={item.id || i} item={item} fixed={f.fixed} onRemove={() => onChange(value.filter((x) => x !== item))}>
            <Form fields={f.fields} value={item} ctx={ctx} compact onChange={(next) => onChange(value.map((x) => (x === item ? next : x)))} />
          </ListItem>
        ))}
      </Reorder.Group>
      {!f.fixed && <button type="button" className="a-btn-ghost justify-self-start" onClick={() => onChange([...value, blank()])}><Plus size={15} /> Add {f.item || 'item'}</button>}
    </div>
  );
}

function Input({ f, value, onChange, ctx, id }) {
  switch (f.type) {
    case 'static': return <p id={id} className="text-[14px] font-semibold">{value}</p>;
    case 'textarea': return <textarea id={id} rows={f.rows || 3} className="a-input h-auto py-2.5 leading-relaxed" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
    case 'number': case 'money':
      return (
        <div className="relative">
          {f.type === 'money' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-dim">৳</span>}
          <input id={id} type="number" inputMode="decimal" step={f.step || 1} min={f.min} max={f.max} className={`a-input tabular-nums ${f.type === 'money' ? 'pl-7' : ''}`}
            value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />
        </div>
      );
    case 'toggle': return <Switch checked={value} onChange={onChange} label={f.label} />;
    case 'select':
      return (
        <select id={id} className="a-input" value={value ?? ''} onChange={(e) => onChange(f.numeric ? Number(e.target.value) : e.target.value)}>
          {opts(f, ctx).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    case 'multi': return <Chips options={opts(f, ctx)} value={value} onChange={onChange} />;
    case 'days': return <Chips options={DAYS.map((d, i) => [i, d])} value={value} onChange={(v) => onChange([...v].sort())} />;
    case 'tags': return <Tags value={value} onChange={onChange} placeholder={f.placeholder} />;
    case 'image': return <ImageField value={value} onChange={onChange} />;
    case 'icon': return <Chips options={Object.keys(ICONS).map((k) => [k, k])} value={[value]} onChange={(v) => onChange(v.at(-1))} />;
    case 'list': return <ListField f={f} value={value} onChange={onChange} ctx={ctx} />;
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg bg-transparent" aria-label={f.label} />
          <input id={id} className="a-input font-mono uppercase" value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} />
        </div>
      );
    default: return <input id={id} type={f.type === 'time' || f.type === 'date' ? f.type : 'text'} className={`a-input ${f.mono ? 'font-mono' : ''}`} value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(f.upper ? e.target.value.toUpperCase() : e.target.value)} />;
  }
}

function FieldRow({ f, value, onChange, ctx, compact }) {
  const id = useId();
  const inline = f.type === 'toggle';
  return (
    <div className={`${f.span === 'full' || ['textarea', 'list', 'image', 'multi', 'tags', 'icon', 'days'].includes(f.type) ? 'sm:col-span-2' : ''} ${inline ? 'flex items-center justify-between gap-4 rounded-xl bg-app px-3 py-2.5 ring-1 ring-edge' : ''}`}>
      <label htmlFor={id} className={inline ? 'text-[13.5px] font-semibold' : 'a-label'}>{f.label}</label>
      <Input f={f} value={value} onChange={onChange} ctx={ctx} id={id} />
      {f.hint && !compact && <p className="mt-1.5 text-[12px] text-dim">{f.hint}</p>}
    </div>
  );
}

/** Renders a record from a field list. `when(record)` hides fields that don't apply. */
export function Form({ fields, value, onChange, ctx = {}, compact = false }) {
  const c = { ...ctx, record: value };
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${compact ? '' : 'gap-y-4'}`}>
      {fields.filter((f) => !f.when || f.when(value)).map((f) => (
        <FieldRow key={f.k} f={f} value={value?.[f.k]} ctx={c} compact={compact} onChange={(v) => onChange({ ...value, [f.k]: v })} />
      ))}
    </div>
  );
}
