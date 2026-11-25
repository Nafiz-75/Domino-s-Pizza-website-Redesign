export const taka = (n) => '৳' + Math.round(n).toLocaleString('en-US');

export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/* Bangladeshi mobile: 01[3-9] + 8 digits. Accepts +880 / 880 prefixes and spaces. */
export function normalizeBDPhone(raw = '') {
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('880')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('1')) d = '0' + d;
  return d;
}
export const isBDPhone = (raw) => /^01[3-9]\d{8}$/.test(normalizeBDPhone(raw));
export const prettyPhone = (raw) => {
  const d = normalizeBDPhone(raw);
  return d.length === 11 ? `${d.slice(0, 5)}-${d.slice(5)}` : raw;
};
export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
