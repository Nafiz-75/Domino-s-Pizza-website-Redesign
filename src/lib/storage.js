/* Thin localStorage wrapper. In production every key here maps to an API call
   (see README → Integration points). Namespaced so a reset clears only this app. */
const NS = 'dpz-concept:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}
export function wipeAll() {
  Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k));
}
