import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, MapPin, Package, Pencil, RotateCcw, Shield, Trash2, User } from 'lucide-react';
import { orderStage, useApp } from '../state/AppState';
import { fmtDate, fmtTime, isEmail, prettyPhone, taka } from '../lib/format';
import { AddressCard, AddressForm } from '../components/Location';
import { EASE, Field, PasswordField, Sheet, SheetHeader, passwordOk } from '../components/ui';

export function RequireAuth({ children }) {
  const { user } = useApp();
  const loc = useLocation();
  if (!user) return <Navigate to={`/signin?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return children;
}

const TABS = [
  { to: '/account', end: true, label: 'Profile', icon: User },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/security', label: 'Security', icon: Shield },
];

export function AccountLayout() {
  const { user, signOut } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 font-display text-[24px] font-black text-white">{user.name[0].toUpperCase()}</span>
          <div><h1 className="text-[28px] font-black leading-tight">Hi, {user.name.split(' ')[0]}</h1><p className="text-[14px] text-ink-3">{prettyPhone(user.phone)}{user.email ? ` · ${user.email}` : ''}</p></div>
        </div>
        <button className="btn-ghost" onClick={() => { signOut(); nav('/'); }}><LogOut size={17} /> Sign out</button>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col" aria-label="Account">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold">
              {({ isActive }) => (<>
                {isActive && <motion.span layoutId="acct-tab" className="absolute inset-0 rounded-xl bg-white shadow-card ring-1 ring-line" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <t.icon size={18} className={`relative ${isActive ? 'text-blue-600' : 'text-ink-3'}`} aria-hidden="true" />
                <span className={`relative ${isActive ? 'text-ink' : 'text-ink-2'}`}>{t.label}</span>
              </>)}
            </NavLink>
          ))}
        </nav>
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25, ease: EASE }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateUser, toast, users } = useApp();
  const [f, setF] = useState({ name: user.name, email: user.email || '', marketing: !!user.marketing });
  const [err, setErr] = useState({});
  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Add your name.';
    const email = f.email.trim().toLowerCase();
    if (email && !isEmail(email)) er.email = 'That email address is missing something.';
    if (email && users.some((u) => u.id !== user.id && u.email === email)) er.email = 'Another account uses this email.';
    setErr(er);
    if (Object.keys(er).length) return;
    updateUser({ name: f.name.trim(), email: email || null, marketing: f.marketing });
    toast('Profile saved.');
  };
  return (
    <form onSubmit={save} className="card grid max-w-[620px] gap-4 p-6" noValidate>
      <h2 className="text-[20px] font-extrabold">Profile</h2>
      <Field label="Full name" id="pf-name" error={err.name}><input id="pf-name" className="input" value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} autoComplete="name" /></Field>
      <Field label="Mobile number" id="pf-phone" hint="Your number signs you in. Changing it needs a new verification (production)."><input id="pf-phone" className="input bg-canvas" value={prettyPhone(user.phone)} readOnly /></Field>
      <Field label="Email" id="pf-email" error={err.email}><input id="pf-email" className="input" type="email" value={f.email} onChange={(e) => setF((x) => ({ ...x, email: e.target.value }))} autoComplete="email" /></Field>
      <label className="flex items-center gap-2.5 text-[14.5px]"><input type="checkbox" className="h-4 w-4 accent-blue-600" checked={f.marketing} onChange={(e) => setF((x) => ({ ...x, marketing: e.target.checked }))} /> Send me deals by SMS and email</label>
      <button className="btn-primary justify-self-start">Save changes</button>
    </form>
  );
}

export function Orders() {
  const { userOrders, reorder } = useApp();
  const now = Date.now();
  if (!userOrders.length) return (
    <div className="card grid place-items-center p-12 text-center">
      <Package size={36} className="text-blue-600" aria-hidden="true" />
      <p className="mt-3 text-[18px] font-extrabold">No orders yet</p>
      <p className="text-ink-3">Your first one is a few taps away.</p>
      <Link to="/menu" className="btn-primary mt-5">Browse the menu</Link>
    </div>
  );
  return (
    <ul className="grid gap-3">
      {userOrders.map((o, n) => {
        const st = orderStage(o, now);
        const label = o.cancelled ? 'Cancelled' : st.stages[st.index].label;
        return (
          <motion.li key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: n * 0.04 }} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-extrabold">{o.id}</p>
                <p className="text-[13.5px] text-ink-3">{fmtDate(o.placedAt)} at {fmtTime(o.placedAt)} · {o.mode === 'delivery' ? 'Delivery' : 'Carryout'}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[12.5px] font-bold ${o.cancelled ? 'bg-red-50 text-red-700' : st.done ? 'bg-green-50 text-veg' : 'bg-blue-50 text-blue-700'}`}>{label}</span>
            </div>
            <p className="mt-3 text-[14px] text-ink-2">{o.lines.map((l) => `${l.qty}× ${l.name}`).join(', ')}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-auto text-[16px] font-extrabold">{taka(o.total)}</span>
              <Link to={`/order/${o.id}`} className="btn-ghost h-10">{st.done || o.cancelled ? 'Details' : 'Track'}</Link>
              <button className="btn-primary h-10" onClick={() => reorder(o)}><RotateCcw size={15} /> Reorder</button>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function Addresses() {
  const { user, saveAddress, removeAddress, toast } = useApp();
  const [editing, setEditing] = useState(null); // 'new' | address
  return (
    <div className="grid max-w-[720px] gap-3">
      <div className="flex items-center justify-between"><h2 className="text-[20px] font-extrabold">Saved addresses</h2><button className="btn-primary h-10" onClick={() => setEditing('new')}>Add address</button></div>
      {!user.addresses.length && <p className="card p-6 text-ink-3">No saved addresses yet. Add one and checkout gets a lot faster.</p>}
      <AnimatePresence initial={false}>
        {user.addresses.map((a) => (
          <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
            <AddressCard a={a} actions={
              <div className="flex shrink-0">
                <button className="grid h-9 w-9 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-blue-600" aria-label={`Edit ${a.label} address`} onClick={() => setEditing(a)}><Pencil size={16} /></button>
                <button className="grid h-9 w-9 place-items-center rounded-full text-ink-3 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${a.label} address`} onClick={() => { removeAddress(a.id); toast('Address removed.'); }}><Trash2 size={16} /></button>
              </div>} />
          </motion.div>
        ))}
      </AnimatePresence>
      <Sheet open={!!editing} onClose={() => setEditing(null)} labelledBy="addr-h">
        <SheetHeader id="addr-h" title={editing === 'new' ? 'New address' : 'Edit address'} onClose={() => setEditing(null)} />
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {editing && <AddressForm initial={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)} onSubmit={(a) => { saveAddress(a); setEditing(null); toast('Address saved.'); }} />}
        </div>
      </Sheet>
    </div>
  );
}

export function Security() {
  const { changePassword, deleteAccount, toast } = useApp();
  const nav = useNavigate();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [err, setErr] = useState('');
  return (
    <div className="grid max-w-[620px] gap-6">
      <form className="card grid gap-4 p-6" onSubmit={async (e) => {
        e.preventDefault();
        if (!passwordOk(next)) { setErr('New password needs 8+ characters with a letter and a number.'); return; }
        try { await changePassword(cur, next); setCur(''); setNext(''); setErr(''); toast('Password changed.'); } catch (e2) { setErr(e2.message); }
      }}>
        <h2 className="text-[20px] font-extrabold">Change password</h2>
        <PasswordField value={cur} onChange={setCur} label="Current password" />
        <PasswordField value={next} onChange={setNext} label="New password" autoComplete="new-password" showRules />
        {err && <p className="field-error" role="alert">{err}</p>}
        <button className="btn-primary justify-self-start">Update password</button>
      </form>
      <div className="card p-6 ring-red-100">
        <h2 className="text-[20px] font-extrabold text-red-700">Delete account</h2>
        <p className="mt-1 text-[14px] text-ink-3">Removes your profile, saved addresses and order history from this browser. This can’t be undone.</p>
        <button className="btn mt-4 bg-red-50 text-red-700 ring-1 ring-red-100 hover:bg-red-100" onClick={() => { if (confirm('Delete your account and all its data?')) { deleteAccount(); toast('Account deleted.'); nav('/'); } }}><Trash2 size={16} /> Delete my account</button>
      </div>
    </div>
  );
}
