/* Content store: the single source of truth for site content.
   - live:    what visitors see
   - draft:   what the admin is editing (the preview iframe renders it)
   - history: the last published versions, for one-click restore
   Backed by localStorage (prototype). In production these three map to a
   CMS / content API with the same shape. Tabs and the preview iframe stay in
   sync through the browser's storage event. */
import { useSyncExternalStore } from 'react';
import { DEFAULT_CONTENT } from './defaults';
import { load, save } from '../lib/storage';

const K = { live: 'content:live', draft: 'content:draft', history: 'content:history' };
const HISTORY_MAX = 8;
export const PREVIEW = typeof location !== 'undefined' && new URLSearchParams(location.search).has('preview');

/* stored content may predate new fields: fill gaps from the defaults (objects only, arrays are taken as stored) */
function merge(def, val) {
  if (val === undefined) return structuredClone(def);
  if (!def || typeof def !== 'object' || Array.isArray(def) || typeof val !== 'object' || Array.isArray(val)) return val;
  const out = { ...val };
  for (const k of Object.keys(def)) out[k] = merge(def[k], val[k]);
  return out;
}
const read = (key) => merge(DEFAULT_CONTENT, load(key, undefined));

let state = { live: read(K.live), draft: load(K.draft, null) ? read(K.draft) : read(K.live), history: load(K.history, []), rev: 0 };
const subs = new Set();
const emit = () => { state = { ...state, rev: state.rev + 1 }; subs.forEach((f) => f()); };

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key?.includes('content:')) return;
    state = { ...state, live: read(K.live), draft: load(K.draft, null) ? read(K.draft) : read(K.live), history: load(K.history, []) };
    emit();
  });
}

export const subscribe = (f) => { subs.add(f); return () => subs.delete(f); };

/** The content the current page should render. */
export const getContent = () => (PREVIEW ? state.draft : state.live);
export function useContent() { return useSyncExternalStore(subscribe, getContent); }
export function useCms() { return useSyncExternalStore(subscribe, () => state); }

export const isDirty = () => JSON.stringify(state.draft) !== JSON.stringify(state.live);

/* ---------- admin actions ---------- */
function persist(key, value) {
  save(key, value);
  if (JSON.stringify(load(key, null)) !== JSON.stringify(value)) throw new Error('Browser storage is full. Remove large uploaded images or old versions.');
}

/** Replace a top-level section of the draft, e.g. setDraft('products', list). */
export function setDraft(section, value) {
  const draft = { ...state.draft, [section]: typeof value === 'function' ? value(state.draft[section]) : value };
  persist(K.draft, draft);
  state = { ...state, draft };
  emit();
}

export function publish(note = '') {
  const entry = { at: Date.now(), note, content: state.live };
  const history = [entry, ...state.history].slice(0, HISTORY_MAX);
  persist(K.live, state.draft);
  try { persist(K.history, history); } catch { persist(K.history, history.slice(0, 2)); }
  state = { ...state, live: state.draft, history: load(K.history, []) };
  emit();
}

export function discardDraft() { persist(K.draft, state.live); state = { ...state, draft: state.live }; emit(); }

export function restore(index) {
  const v = state.history[index];
  if (v) { persist(K.draft, merge(DEFAULT_CONTENT, v.content)); state = { ...state, draft: read(K.draft) }; emit(); }
}

export function importContent(obj) {
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.products)) throw new Error('That file isn’t a content export.');
  persist(K.draft, merge(DEFAULT_CONTENT, obj));
  state = { ...state, draft: read(K.draft) };
  emit();
}

export function resetDraftToDefaults() { persist(K.draft, structuredClone(DEFAULT_CONTENT)); state = { ...state, draft: read(K.draft) }; emit(); }

/* ---------- helpers for rendering ---------- */

/** Fills {deliveryFee}, {freeOver}, {minOrder}, {storeCount} in editable copy. */
export function fill(text = '', c = getContent()) {
  const s = c.settings;
  const vars = { deliveryFee: s.deliveryFee, freeOver: s.freeDeliveryOver, minOrder: s.minDeliveryOrder, storeCount: c.stores.filter((x) => x.show !== false).length };
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

/** Resolves a stored image (public path, URL or data URL) to a usable src. */
let assetRoot = import.meta.env.BASE_URL;
/** Pages served from a sub-folder (the admin) point stored public paths back at the site root. */
export const setAssetRoot = (r) => { assetRoot = r; };
export const imgSrc = (v) => (!v ? null : /^(https?:|data:|blob:|\/)/.test(v) ? v : `${assetRoot}${v}`);
