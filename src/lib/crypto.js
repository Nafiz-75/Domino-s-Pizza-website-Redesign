/* Prototype only: passwords never leave the browser, and are stored as a salted
   SHA-256 hash rather than plain text. Production uses the auth service
   (server-side hashing, rate limiting, SMS OTP) — see README. */
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export function makeSalt() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return hex(a);
}
export async function hashPassword(password, salt) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(salt + ':' + password)));
}
/* 6-digit one-time code */
export const makeOtp = () => String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
