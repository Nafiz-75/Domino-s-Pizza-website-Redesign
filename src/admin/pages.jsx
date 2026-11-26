/* Admin screens. Collections and forms are generic (driven by schema.js);
   only the dashboard, orders, customers and publishing have bespoke layouts. */
import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, Reorder, motion } from 'motion/react';
import {
  ArrowRight, Ban, Bike, Copy, Download, GripVertical, History, PackageOpen, Plus, RotateCcw, Search, ShoppingBag, Store, TrendingUp, Upload, Users, Wallet,
} from 'lucide-react';
import { STAGES_DELIVERY, STAGES_PICKUP, orderStage } from '../state/AppState';
import { DEFAULT_CONTENT } from '../content/defaults';
import { discardDraft, imgSrc, importContent, publish, resetDraftToDefaults, restore, setDraft, useCms } from '../content/store';
import { fmtDate, fmtTime, prettyPhone, taka } from '../lib/format';
import { Form } from './fields';
import { SITE } from './root';
import { FORMS, RESOURCES } from './schema';
import { Badge, Card, ConfirmButton, Drawer, EASE, Empty, PageTitle, Stat, Switch, notify, safely, useStored } from './kit';

const DAY = 86_400_000;
const PAY = { cod: 'Cash', bkash: 'bKash', nagad: 'Nagad', card: 'Card' };
const slug = (s = '') => s.toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'item';

/* ---------- order status, shared by dashboard / orders / customers ---------- */
function status(o, now = Date.now()) {
  const st = orderStage(o, now);
  if (st.cancelled) return { label: 'Cancelled', tone: 'red', live: false };
  if (st.waiting) return { label: 'Scheduled', tone: 'amber', live: true };
  return { label: st.stages[st.index].label, tone: st.done ? 'green' : 'blue', live: !st.done, index: st.index, stages: st.stages };
}
const OrderBadge = ({ o }) => { const s = status(o); return <Badge tone={s.tone} dot={s.live}>{s.label}</Badge>; };

/* Sample orders so the dashboard has something to show in a fresh browser. */
function sampleOrders(c) {
  const prods = c.products.filter((p) => p.show !== false);
  const names = ['Ayesha K.', 'Rafiq H.', 'Nusrat J.', 'Imran S.', 'Farhana A.', 'Tahmid R.', 'Mehjabin T.', 'Shakib M.', 'Lamia C.', 'Arif B.'];
  return Array.from({ length: 64 }, (_, n) => {
    const placedAt = Date.now() - Math.random() * 14 * DAY - 3600_000;
    const lines = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => {
      const p = prods[Math.floor(Math.random() ** 1.6 * prods.length)];
      const qty = 1 + Math.floor(Math.random() * 2);
      return { key: p.id, id: p.id, name: p.name, opts: p.kind === 'pizza' ? { size: 'medium', crust: 'tossed', toppings: [] } : {}, qty, unit: p.price, total: p.price * qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const pickup = Math.random() < 0.25;
    const area = c.areas[Math.floor(Math.random() * c.areas.length)];
    const delivery = !pickup && subtotal < c.settings.freeDeliveryOver ? c.settings.deliveryFee : 0;
    return {
      id: 'DPZ' + String(9000000 + n * 7919).slice(-7), sample: true, userId: null, placedAt, mode: pickup ? 'pickup' : 'delivery', when: 'asap',
      address: pickup ? null : { area: area.id, road: 'Road ' + (1 + (n % 27)), house: String(10 + n) }, storeId: area.store, etaMin: area.eta,
      contact: { name: names[n % names.length], phone: '017' + String(10000000 + n * 1234567).slice(-8) }, payment: ['cod', 'bkash', 'nagad', 'card'][n % 4], note: '',
      lines, subtotal, discount: 0, delivery, total: subtotal + delivery, coupon: null, cancelled: Math.random() < 0.06,
    };
  });
}

/* ================= Dashboard ================= */
function BarChart({ data }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const H = 180;
  return (
    <div className="relative">
      <div className="flex h-[200px] items-end gap-[2px]" role="img" aria-label="Revenue per day">
        {data.map((d, i) => (
          <button key={d.label} type="button" className="group relative flex h-full flex-1 items-end outline-none" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            aria-label={`${d.label}: ${taka(d.value)}, ${d.count} orders`}>
            <motion.span className={`block w-full rounded-t-[4px] bg-brand ${hover != null && hover !== i ? 'opacity-55' : ''} transition-opacity`} initial={{ height: 0 }} animate={{ height: Math.max(2, (d.value / max) * H) }} transition={{ delay: i * 0.02, ease: EASE, duration: 0.6 }} />
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between border-t border-edge pt-2 text-[11.5px] text-dim">
        <span>{data[0]?.label}</span><span>{data.at(-1)?.label}</span>
      </div>
      <AnimatePresence>
        {hover != null && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-fg px-3 py-2 text-[12px] text-app shadow-pop"
            style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
            <b className="block">{data[hover].label}</b>{taka(data[hover].value)} · {data[hover].count} orders
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Dashboard() {
  const { draft: c, live } = useCms();
  const [orders, setOrders] = useStored('orders', []);
  const [users] = useStored('users', []);
  const [range, setRange] = useState(14);
  const m = useMemo(() => {
    const from = Date.now() - range * DAY;
    const inRange = orders.filter((o) => o.placedAt >= from);
    const ok = inRange.filter((o) => !o.cancelled);
    const revenue = ok.reduce((s, o) => s + o.total, 0);
    const days = Array.from({ length: range }, (_, i) => {
      const d = new Date(Date.now() - (range - 1 - i) * DAY); d.setHours(0, 0, 0, 0);
      const day = ok.filter((o) => o.placedAt >= d.getTime() && o.placedAt < d.getTime() + DAY);
      return { label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), value: day.reduce((s, o) => s + o.total, 0), count: day.length };
    });
    const qty = {};
    ok.forEach((o) => o.lines.forEach((l) => { qty[l.id] = qty[l.id] || { name: l.name, qty: 0, revenue: 0 }; qty[l.id].qty += l.qty; qty[l.id].revenue += l.total; }));
    const top = Object.values(qty).sort((a, b) => b.qty - a.qty).slice(0, 6);
    const byStore = c.stores.map((s) => ({ name: s.name, n: ok.filter((o) => o.storeId === s.id).length })).sort((a, b) => b.n - a.n);
    const customers = new Set(inRange.map((o) => o.userId || o.contact?.phone)).size;
    return { revenue, count: ok.length, aov: ok.length ? revenue / ok.length : 0, customers, days, top, byStore, live: orders.filter((o) => status(o).live).length, cancelled: inRange.length - ok.length };
  }, [orders, range, c.stores]);
  const dirty = JSON.stringify(c) !== JSON.stringify(live);
  const recent = [...orders].sort((a, b) => b.placedAt - a.placedAt).slice(0, 6);

  return (
    <>
      <PageTitle title="Dashboard" sub="Sales from orders placed on the site, plus the state of your content.">
        <div className="flex rounded-xl bg-panel p-1 ring-1 ring-edge" role="radiogroup" aria-label="Date range">
          {[7, 14, 30].map((d) => (
            <button key={d} role="radio" aria-checked={range === d} onClick={() => setRange(d)} className={`relative h-8 rounded-lg px-3 text-[13px] font-semibold ${range === d ? 'text-fg' : 'text-dim'}`}>
              {range === d && <motion.span layoutId="range" className="absolute inset-0 rounded-lg bg-raised" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative">{d} days</span>
            </button>
          ))}
        </div>
      </PageTitle>

      {!orders.length && (
        <Card className="mb-5"><div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-dim">No orders yet in this browser. Place one on the site, or load sample orders to see the dashboard working.</p>
          <button className="a-btn-primary" onClick={safely(() => setOrders(sampleOrders(c)), '64 sample orders added.')}>Load sample orders</button>
        </div></Card>
      )}

      <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-4">
        <Stat index={0} label="Revenue" value={taka(m.revenue)} sub={`Last ${range} days, excluding cancelled`} icon={Wallet} />
        <Stat index={1} label="Orders" value={m.count} sub={`${m.cancelled} cancelled · ${m.live} in progress now`} icon={ShoppingBag} />
        <Stat index={2} label="Average order" value={taka(m.aov)} sub="Revenue ÷ orders" icon={TrendingUp} />
        <Stat index={3} label="Customers" value={m.customers} sub={`${users.length} registered accounts`} icon={Users} />
      </div>

      <div className="mt-4 grid gap-4 @4xl:grid-cols-[1.6fr_1fr]">
        <Card title="Revenue per day"><BarChart data={m.days} /></Card>
        <Card title="Top products" pad={false}>
          {m.top.length ? (
            <ul className="divide-y divide-edge">
              {m.top.map((p) => (
                <li key={p.name} className="px-5 py-3">
                  <div className="flex justify-between gap-3 text-[13.5px]"><span className="truncate font-semibold">{p.name}</span><span className="tabular-nums text-dim">{p.qty} sold</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-raised"><motion.div className="h-full rounded-full bg-brand" initial={{ width: 0 }} animate={{ width: `${(p.qty / m.top[0].qty) * 100}%` }} transition={{ ease: EASE, duration: 0.7 }} /></div>
                </li>
              ))}
            </ul>
          ) : <Empty icon={PackageOpen} title="No sales in this range" />}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 @4xl:grid-cols-3">
        <Card title="Recent orders" className="@4xl:col-span-2" pad={false} action={<Link to="orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand">All orders <ArrowRight size={14} /></Link>}>
          {recent.length ? (
            <ul className="divide-y divide-edge">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3 text-[13.5px]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-raised text-dim">{o.mode === 'pickup' ? <Store size={16} /> : <Bike size={16} />}</span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{o.contact?.name} <span className="font-mono text-[12px] text-dim">{o.id}</span></p><p className="text-[12.5px] text-dim">{fmtDate(o.placedAt)} · {fmtTime(o.placedAt)}</p></div>
                  <OrderBadge o={o} /><span className="w-20 text-right font-semibold tabular-nums">{taka(o.total)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty icon={ShoppingBag} title="No orders yet" />}
        </Card>
        <div className="grid content-start gap-4">
          <Card title="Content">
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              {[['Products', c.products.length], ['Hidden', c.products.filter((p) => p.show === false).length], ['Sold out', c.products.filter((p) => p.soldOut).length], ['Active codes', c.coupons.filter((x) => x.active).length]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-app p-3 ring-1 ring-edge"><dt className="text-dim">{k}</dt><dd className="mt-0.5 text-[20px] font-extrabold tabular-nums">{v}</dd></div>
              ))}
            </dl>
            <Link to="publish" className={`mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold ${dirty ? 'bg-cheese/20 text-fg' : 'bg-app text-dim ring-1 ring-edge'}`}>
              {dirty ? 'Unpublished changes waiting' : 'Site is up to date'} <ArrowRight size={14} />
            </Link>
          </Card>
          <Card title="Orders by store">
            <ul className="grid gap-2 text-[13px]">{m.byStore.map((s) => <li key={s.name} className="flex justify-between"><span>{s.name}</span><b className="tabular-nums">{s.n}</b></li>)}</ul>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ================= Orders ================= */
const FILTERS = [['all', 'All'], ['live', 'In progress'], ['done', 'Completed'], ['cancelled', 'Cancelled']];
function Filters({ value, onChange, options, id }) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist">
      {options.map(([v, l]) => (
        <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)} className={`relative h-9 shrink-0 rounded-xl px-3.5 text-[13px] font-semibold ${value === v ? 'text-white' : 'text-dim hover:text-fg'}`}>
          {value === v && <motion.span layoutId={id} className="absolute inset-0 rounded-xl bg-brand" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative">{l}</span>
        </button>
      ))}
    </div>
  );
}
function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
      <input type="search" className="a-input pl-9" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
    </div>
  );
}
const Table = ({ head, children }) => (
  <div className="a-card overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-[13.5px]">
      <thead><tr className="border-b border-edge text-[11.5px] uppercase tracking-wider text-dim">{head.map((h, i) => <th key={i} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
      {children}
    </table>
  </div>
);

function OrderDrawer({ order: o, onClose, update, remove, c }) {
  if (!o) return <Drawer open={false} onClose={onClose} />;
  const s = status(o);
  const stages = o.mode === 'pickup' ? STAGES_PICKUP : STAGES_DELIVERY;
  const area = c.areas.find((a) => a.id === o.address?.area);
  return (
    <Drawer open onClose={onClose} title={`Order ${o.id}`} sub={`${fmtDate(o.placedAt)} · ${fmtTime(o.placedAt)} · ${o.mode === 'pickup' ? 'Carryout' : 'Delivery'}`}
      footer={<>
        {o.cancelled ? <button className="a-btn-ghost" onClick={() => update({ cancelled: false })}><RotateCcw size={15} /> Restore order</button>
          : <ConfirmButton onConfirm={() => update({ cancelled: true })} label="Yes, cancel it"><Ban size={15} /> Cancel order</ConfirmButton>}
        <ConfirmButton className="a-btn-quiet ml-auto" onConfirm={() => { remove(); onClose(); }} label="Delete for good">Delete</ConfirmButton>
      </>}>
      <div className="flex items-center justify-between"><OrderBadge o={o} />{o.stageIndex != null && !o.cancelled && <button className="text-[12.5px] font-semibold text-brand" onClick={() => update({ stageIndex: null })}>Back to automatic timing</button>}</div>
      {!o.cancelled && (
        <ol className="mt-4 grid gap-1.5">
          {stages.map((st, i) => {
            const done = s.index != null && i <= s.index;
            return (
              <li key={st.id}>
                <button onClick={() => update({ stageIndex: i })} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-semibold ring-1 transition-colors ${i === s.index ? 'bg-brand/10 ring-brand' : 'ring-edge hover:bg-raised'}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${done ? 'bg-brand text-white' : 'bg-raised text-dim'}`}>{i + 1}</span>{st.label}
                  {i === s.index && <span className="ml-auto text-[12px] text-dim">current</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-2 text-[12px] text-dim">Choosing a step updates the customer’s tracking page right away.</p>

      <h3 className="mt-6 font-sans text-[12px] font-bold uppercase tracking-wider text-dim">Items</h3>
      <ul className="mt-2 divide-y divide-edge rounded-xl ring-1 ring-edge">
        {o.lines.map((l) => <li key={l.key} className="flex justify-between gap-3 px-3 py-2.5 text-[13.5px]"><span><b>{l.qty}×</b> {l.name}</span><span className="tabular-nums">{taka(l.total)}</span></li>)}
      </ul>
      <dl className="mt-3 grid gap-1 text-[13.5px]">
        {[['Subtotal', o.subtotal], o.discount ? [`Discount${o.coupon ? ` (${o.coupon})` : ''}`, -o.discount] : null, ['Delivery', o.delivery]].filter(Boolean).map(([k, v]) => <div key={k} className="flex justify-between text-dim"><dt>{k}</dt><dd className="tabular-nums">{taka(v)}</dd></div>)}
        <div className="flex justify-between text-[15px] font-bold"><dt>Total · {PAY[o.payment] || o.payment}</dt><dd className="tabular-nums">{taka(o.total)}</dd></div>
      </dl>

      <h3 className="mt-6 font-sans text-[12px] font-bold uppercase tracking-wider text-dim">Customer</h3>
      <p className="mt-2 text-[14px] font-semibold">{o.contact?.name}</p>
      <p className="text-[13.5px] text-dim">{prettyPhone(o.contact?.phone)}{o.contact?.email ? ` · ${o.contact.email}` : ''}</p>
      {o.address && <p className="mt-1 text-[13.5px] text-dim">{[o.address.flat, o.address.house && `House ${o.address.house}`, o.address.road, area?.name].filter(Boolean).join(', ')}{o.address.landmark ? ` (near ${o.address.landmark})` : ''}</p>}
      <p className="mt-1 text-[13.5px] text-dim">Store: {c.stores.find((x) => x.id === o.storeId)?.name || '—'}</p>
      {(o.note || o.address?.note) && <p className="mt-2 rounded-xl bg-app p-3 text-[13.5px] ring-1 ring-edge">“{o.note || o.address.note}”</p>}
    </Drawer>
  );
}

export function Orders() {
  const { draft: c } = useCms();
  const [orders, setOrders] = useStored('orders', []);
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const list = useMemo(() => [...orders].sort((a, b) => b.placedAt - a.placedAt).filter((o) => {
    const s = status(o);
    if (f === 'live' && !s.live) return false;
    if (f === 'done' && (s.live || o.cancelled)) return false;
    if (f === 'cancelled' && !o.cancelled) return false;
    const t = q.trim().toLowerCase();
    return !t || [o.id, o.contact?.name, o.contact?.phone].join(' ').toLowerCase().includes(t);
  }), [orders, f, q]);
  const update = (id) => (patch) => setOrders((all) => all.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const current = orders.find((o) => o.id === open);
  return (
    <>
      <PageTitle title="Orders" sub="Every order placed on the site. Open one to move it through the make-line, cancel or restore it.">
        {orders.some((o) => o.sample) && <ConfirmButton onConfirm={() => setOrders((all) => all.filter((o) => !o.sample))} label="Remove samples">Clear sample orders</ConfirmButton>}
      </PageTitle>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><Filters id="ord-f" value={f} onChange={setF} options={FILTERS} /><SearchBox value={q} onChange={setQ} placeholder="Search order, name or phone" /></div>
      <Table head={['Order', 'Placed', 'Customer', 'Type', 'Status', 'Total']}>
        <tbody>
          {list.map((o) => (
            <tr key={o.id} onClick={() => setOpen(o.id)} className="cursor-pointer border-b border-edge last:border-0 hover:bg-raised/60">
              <td className="px-4 py-3"><button className="font-mono font-semibold text-brand" onClick={() => setOpen(o.id)}>{o.id}</button></td>
              <td className="px-4 py-3 text-dim">{fmtDate(o.placedAt)} {fmtTime(o.placedAt)}</td>
              <td className="px-4 py-3">{o.contact?.name}</td>
              <td className="px-4 py-3 text-dim">{o.mode === 'pickup' ? 'Carryout' : 'Delivery'}</td>
              <td className="px-4 py-3"><OrderBadge o={o} /></td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{taka(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {!list.length && <Empty icon={ShoppingBag} title="No orders match">Try another filter.</Empty>}
      <OrderDrawer order={current} c={c} onClose={() => setOpen(null)} update={update(open)} remove={() => setOrders((all) => all.filter((o) => o.id !== open))} />
    </>
  );
}

/* ================= Customers ================= */
export function Customers() {
  const [users, setUsers] = useStored('users', []);
  const [orders, setOrders] = useStored('orders', []);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const stats = (u) => { const os = orders.filter((o) => o.userId === u.id && !o.cancelled); return { n: os.length, spend: os.reduce((s, o) => s + o.total, 0) }; };
  const list = users.filter((u) => !q || [u.name, u.phone, u.email].join(' ').toLowerCase().includes(q.toLowerCase()));
  const u = users.find((x) => x.id === open);
  const patch = (p) => setUsers((all) => all.map((x) => (x.id === open ? { ...x, ...p } : x)));
  return (
    <>
      <PageTitle title="Customers" sub="Accounts created on the site. Passwords are never shown; suspend an account to sign it out and block sign-in." />
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Search name, phone or email" /></div>
      <Table head={['Customer', 'Phone', 'Joined', 'Orders', 'Spent', 'Status']}>
        <tbody>
          {list.map((x) => { const s = stats(x); return (
            <tr key={x.id} onClick={() => setOpen(x.id)} className="cursor-pointer border-b border-edge last:border-0 hover:bg-raised/60">
              <td className="px-4 py-3"><span className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-[12px] font-bold text-white">{x.name[0]?.toUpperCase()}</span><span><b className="block">{x.name}</b><span className="text-[12px] text-dim">{x.email || 'No email'}</span></span></span></td>
              <td className="px-4 py-3 text-dim">{prettyPhone(x.phone)}</td>
              <td className="px-4 py-3 text-dim">{fmtDate(x.createdAt)}</td>
              <td className="px-4 py-3 tabular-nums">{s.n}</td>
              <td className="px-4 py-3 tabular-nums">{taka(s.spend)}</td>
              <td className="px-4 py-3">{x.blocked ? <Badge tone="red">Suspended</Badge> : <Badge tone="green">Active</Badge>}</td>
            </tr>
          ); })}
        </tbody>
      </Table>
      {!list.length && <Empty icon={Users} title={users.length ? 'No customers match' : 'No accounts yet'}>{!users.length && 'Accounts appear here when someone signs up on the site.'}</Empty>}
      <Drawer open={!!u} onClose={() => setOpen(null)} title={u?.name} sub={u && `Joined ${fmtDate(u.createdAt)}`}
        footer={u && <>
          <button className="a-btn-ghost" onClick={() => patch({ blocked: !u.blocked })}>{u.blocked ? 'Reactivate account' : 'Suspend account'}</button>
          <ConfirmButton className="a-btn-quiet ml-auto" label="Delete account and orders" onConfirm={() => { setUsers((a) => a.filter((x) => x.id !== u.id)); setOrders((a) => a.filter((o) => o.userId !== u.id)); setOpen(null); }}>Delete</ConfirmButton>
        </>}>
        {u && <>
          <Form value={u} onChange={(v) => patch({ name: v.name, email: v.email, marketing: v.marketing })} fields={[{ k: 'name', label: 'Name' }, { k: 'email', label: 'Email' }, { k: 'marketing', label: 'Receives offers', type: 'toggle', span: 'full' }]} />
          <p className="mt-3 text-[13px] text-dim">Phone {prettyPhone(u.phone)} (sign-in ID, changed by the customer only)</p>
          <h3 className="mt-6 font-sans text-[12px] font-bold uppercase tracking-wider text-dim">Saved addresses</h3>
          <ul className="mt-2 grid gap-2 text-[13.5px]">{u.addresses.length ? u.addresses.map((a) => <li key={a.id} className="rounded-xl bg-app p-3 ring-1 ring-edge"><b>{a.label || 'Address'}</b>{a.isDefault && ' · default'}<br /><span className="text-dim">{[a.house && `House ${a.house}`, a.road, a.area].filter(Boolean).join(', ')}</span></li>) : <li className="text-dim">None</li>}</ul>
          <h3 className="mt-6 font-sans text-[12px] font-bold uppercase tracking-wider text-dim">Orders</h3>
          <ul className="mt-2 divide-y divide-edge rounded-xl ring-1 ring-edge">{orders.filter((o) => o.userId === u.id).map((o) => <li key={o.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13.5px]"><span className="font-mono">{o.id}</span><OrderBadge o={o} /><span className="tabular-nums">{taka(o.total)}</span></li>)}</ul>
        </>}
      </Drawer>
    </>
  );
}

/* ================= Generic collection editor ================= */
function Cell({ col, row, c }) {
  const v = row[col.k];
  switch (col.type) {
    case 'image': { const src = imgSrc(v); return <span className="block h-11 w-14 overflow-hidden rounded-lg bg-raised" style={!src && row.swatch ? { background: `linear-gradient(150deg, ${row.swatch[0]}, ${row.swatch[1]})` } : undefined}>{src && <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />}</span>; }
    case 'money': return <span className="tabular-nums">{taka(v)}</span>;
    case 'mono': return <span className="font-mono text-[12.5px]">{v}</span>;
    case 'ref': { const r = c[col.ref].find((x) => x.id === v); return r ? r[col.refLabel || 'label'] : <span className="text-red-500">Missing</span>; }
    case 'veg': return <Badge tone={v ? 'green' : 'red'}>{v ? 'Veg' : 'Non-veg'}</Badge>;
    case 'show': return v === false ? <Badge>Hidden</Badge> : <Badge tone="green">Visible</Badge>;
    case 'active': return v ? <Badge tone="green">Active</Badge> : <Badge>Off</Badge>;
    case 'status': return row.show === false ? <Badge>Hidden</Badge> : row.soldOut ? <Badge tone="amber">Sold out</Badge> : <Badge tone="green">On sale</Badge>;
    case 'count': return c.products.filter((p) => p.kind === row.id).length;
    case 'len': return v?.length || 0;
    case 'hours': return `${row.open} – ${row.close === '00:00' ? 'midnight' : row.close}`;
    case 'legal': return <span className="font-mono text-[12.5px]">/legal/{v}</span>;
    case 'reward': return { fixed: `৳${row.value} off`, percent: `${row.value}% off`, free_delivery: 'Free delivery', bundle: `${row.bundleQty} for ৳${row.value}` }[v];
    default: return <span className="line-clamp-1">{Array.isArray(v) ? v.join(', ') : String(v ?? '')}</span>;
  }
}

export function Resource() {
  const { id } = useParams();
  const R = RESOURCES[id];
  const { draft: c } = useCms();
  const list = c[id];
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const [edit, setEdit] = useState(null); // { rec, isNew, orig }
  if (!R) return <Empty title="Unknown section" />;
  const canDrag = !q && f === 'all';
  const visible = list.filter((r) => (f === 'all' || r[R.filter.k] === f) && (!q || (R.search || [R.title_k]).some((k) => String(r[k] ?? '').toLowerCase().includes(q.toLowerCase()))));
  const toggleKey = R.fields.some((x) => x.k === 'show') ? 'show' : R.fields.some((x) => x.k === 'active') ? 'active' : null;

  const save = safely(() => {
    let rec = { ...edit.rec };
    const title = String(rec[R.title_k] ?? '').trim();
    if (!title) throw new Error(`Give the ${R.one} a ${R.fields.find((x) => x.k === R.title_k)?.label.toLowerCase() || 'name'}.`);
    if (R.idFrom) rec.id = rec[R.idFrom];
    if (!rec.id) { rec.id = slug(title); let n = 2; while (list.some((x) => x.id === rec.id)) rec.id = `${slug(title)}-${n++}`; }
    if (list.some((x) => x.id === rec.id && x !== edit.orig)) throw new Error(`Another ${R.one} already uses the ID “${rec.id}”.`);
    setDraft(id, edit.isNew ? [...list, rec] : list.map((x) => (x === edit.orig ? rec : x)));
    notify(`${title} saved to draft.`);
    setEdit(null);
  });
  const remove = safely((row) => { setDraft(id, list.filter((x) => x !== row)); setEdit(null); }, 'Deleted from draft.');
  const duplicate = safely((row) => setDraft(id, [...list, { ...structuredClone(row), id: `${row.id}-copy`, [R.title_k]: `${row[R.title_k]} (copy)` }]), 'Duplicated.');

  return (
    <>
      <PageTitle title={R.title} sub={R.sub}>
        <button className="a-btn-primary" onClick={() => setEdit({ rec: structuredClone(R.blank), isNew: true })}><Plus size={16} /> New {R.one}</button>
      </PageTitle>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {R.filter ? <Filters id={`f-${id}`} value={f} onChange={setF} options={[['all', 'All'], ...R.filter.options(c)]} /> : <span className="text-[13px] text-dim">{list.length} {R.one}{list.length === 1 ? '' : 's'}{canDrag ? ' · drag to reorder' : ''}</span>}
        <SearchBox value={q} onChange={setQ} placeholder={`Search ${R.title.toLowerCase()}`} />
      </div>
      <div className="a-card overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-[13.5px]">
          <thead><tr className="border-b border-edge text-[11.5px] uppercase tracking-wider text-dim"><th className="w-8" />{R.columns.map((col) => <th key={col.k} className="px-3 py-3 font-semibold">{col.label}</th>)}<th className="px-3 py-3 text-right font-semibold">{toggleKey ? 'On' : ''}</th></tr></thead>
          <Reorder.Group as="tbody" axis="y" values={visible} onReorder={(v) => canDrag && setDraft(id, v)}>
            {visible.map((row) => (
              <Reorder.Item as="tr" key={row.id} value={row} drag={canDrag ? 'y' : false} className="group border-b border-edge bg-panel last:border-0 hover:bg-raised/60">
                <td className="pl-3 text-dim">{canDrag && <GripVertical size={15} className="cursor-grab opacity-40 group-hover:opacity-100" aria-hidden="true" />}</td>
                {R.columns.map((col, i) => (
                  <td key={col.k} className="px-3 py-2.5">
                    {i === 1 || (R.columns[0].type !== 'image' && i === 0)
                      ? <button className="text-left font-semibold hover:text-brand" onClick={() => setEdit({ rec: structuredClone(row), orig: row })}><Cell col={col} row={row} c={c} /></button>
                      : <Cell col={col} row={row} c={c} />}
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="a-btn-quiet h-8 w-8 px-0 opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => duplicate(row)} aria-label={`Duplicate ${row[R.title_k]}`} title="Duplicate"><Copy size={15} /></button>
                    {toggleKey && <Switch checked={row[toggleKey] !== false} onChange={(v) => setDraft(id, list.map((x) => (x === row ? { ...x, [toggleKey]: v } : x)))} label={`${row[R.title_k]} on site`} />}
                  </div>
                </td>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </table>
        {!visible.length && <Empty icon={PackageOpen} title={`No ${R.title.toLowerCase()} match`} />}
      </div>
      <Drawer open={!!edit} onClose={() => setEdit(null)} wide={id === 'products' || id === 'coupons' || id === 'legal'}
        title={edit?.isNew ? `New ${R.one}` : edit?.rec[R.title_k] || R.one} sub="Changes go to the draft. Publish to put them live."
        footer={<>
          <button className="a-btn-primary" onClick={save}>Save</button>
          <button className="a-btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
          {!edit?.isNew && <ConfirmButton className="a-btn-quiet ml-auto" label={`Delete ${R.one}`} onConfirm={() => remove(edit.orig)}>Delete</ConfirmButton>}
        </>}>
        {edit && <Form fields={R.fields} value={edit.rec} ctx={{ content: c }} onChange={(rec) => setEdit((e) => ({ ...e, rec }))} />}
      </Drawer>
    </>
  );
}

/* ================= Generic single-form editor ================= */
const getIn = (o, path) => path.reduce((x, k) => x?.[k], o);
const setIn = (o, [k, ...rest], v) => (k === undefined ? v : Array.isArray(o) ? o.map((x, i) => (i === k ? setIn(x, rest, v) : x)) : { ...o, [k]: setIn(o?.[k], rest, v) });

export function FormPage() {
  const { id } = useParams();
  const F = FORMS[id];
  const { draft: c } = useCms();
  if (!F) return <Empty title="Unknown section" />;
  return (
    <>
      <PageTitle title={F.title} sub={F.sub ? `${F.sub} Edits save to the draft as you type.` : 'Edits save to the draft as you type.'} />
      <div className="grid gap-4">
        {F.sections.map((s, n) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: n * 0.04, ease: EASE }}>
            <Card title={s.title}>
              <Form fields={s.fields} value={s.path.length ? getIn(c, s.path) : c} ctx={{ content: c }}
                onChange={safely((next) => {
                  if (!s.path.length) return Object.keys(next).forEach((k) => next[k] !== c[k] && setDraft(k, next[k]));
                  const top = s.path[0];
                  setDraft(top, setIn(c, s.path, next)[top]);
                })} />
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/* ================= Publish, versions, backup ================= */
const LABEL = { settings: 'Settings', banner: 'Banner', nav: 'Navigation', home: 'Home page', pages: 'Page headers', footer: 'Footer', categories: 'Categories', sizes: 'Sizes', crusts: 'Crusts', toppings: 'Toppings', products: 'Products', upsell: 'Cart upsell', offers: 'Deal cards', coupons: 'Promo codes', stores: 'Stores', areas: 'Delivery areas', outOfZone: 'Coverage', reviews: 'Reviews', faq: 'FAQ', legal: 'Policy pages' };

export function Publish() {
  const { draft, live, history } = useCms();
  const [note, setNote] = useState('');
  const file = useRef(null);
  const changed = Object.keys(DEFAULT_CONTENT).filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(live[k]));
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
    a.download = `site-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <PageTitle title="Publish & versions" sub="Edits collect in a draft. Preview it, then publish to put it live for visitors. Every publish keeps the previous version for restore." />
      <div className="grid gap-4 @4xl:grid-cols-[1.3fr_1fr]">
        <Card title="Draft">
          {changed.length ? (
            <>
              <p className="text-[13.5px] text-dim">Changed since the last publish:</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">{changed.map((k) => <li key={k}><Badge tone="amber">{LABEL[k] || k}</Badge></li>)}</ul>
              <label className="a-label mt-4" htmlFor="pub-note">Note for this version (optional)</label>
              <input id="pub-note" className="a-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Winter menu prices" />
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="a-btn-primary" onClick={safely(() => { publish(note); setNote(''); }, 'Published. Visitors now see the new version.')}><Upload size={15} /> Publish now</button>
                <a className="a-btn-ghost" href={`${SITE}?preview#/`} target="_blank" rel="noreferrer">Open preview</a>
                <ConfirmButton className="a-btn-quiet ml-auto" label="Discard all draft changes" onConfirm={safely(discardDraft, 'Draft reset to the live site.')}>Discard draft</ConfirmButton>
              </div>
            </>
          ) : <Empty icon={Upload} title="Nothing to publish">The draft matches the live site.</Empty>}
        </Card>
        <Card title="Backup">
          <p className="text-[13.5px] text-dim">Download the whole site as one JSON file, or load one back into the draft.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="a-btn-ghost" onClick={download}><Download size={15} /> Export</button>
            <button className="a-btn-ghost" onClick={() => file.current.click()}><Upload size={15} /> Import</button>
            <input ref={file} type="file" accept="application/json" hidden onChange={async (e) => {
              const fl = e.target.files?.[0]; e.target.value = '';
              if (fl) { try { importContent(JSON.parse(await fl.text())); notify('Imported into the draft. Review, then publish.'); } catch (err) { notify(err.message.includes('JSON') ? 'That file isn’t valid JSON.' : err.message, 'error'); } }
            }} />
          </div>
          <div className="mt-5 border-t border-edge pt-4">
            <p className="text-[13.5px] text-dim">Start over from the original concept content (draft only — publish to apply).</p>
            <ConfirmButton className="a-btn-ghost mt-2" label="Yes, reset the draft" onConfirm={safely(resetDraftToDefaults, 'Draft reset to the original content.')}><RotateCcw size={15} /> Reset to defaults</ConfirmButton>
          </div>
        </Card>
      </div>
      <Card title="Version history" className="mt-4" pad={false}>
        {history.length ? (
          <ul className="divide-y divide-edge">
            {history.map((h, i) => (
              <li key={h.at} className="flex flex-wrap items-center gap-3 px-5 py-3 text-[13.5px]">
                <History size={16} className="text-dim" aria-hidden="true" />
                <span className="font-semibold">{fmtDate(h.at)} · {fmtTime(h.at)}</span>
                <span className="text-dim">{h.note || 'Version replaced by a publish'}</span>
                <button className="a-btn-ghost ml-auto" onClick={safely(() => restore(i), 'Loaded into the draft. Publish to make it live again.')}>Restore to draft</button>
              </li>
            ))}
          </ul>
        ) : <Empty icon={History} title="No earlier versions yet">They appear after your first publish.</Empty>}
      </Card>
    </>
  );
}
