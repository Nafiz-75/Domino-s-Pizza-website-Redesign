import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bike, Check, ChefHat, ClipboardCheck, Flame, PackageCheck, Phone, RotateCcw, Search, XCircle } from 'lucide-react';
import { orderStage, useApp } from '../state/AppState';
import { PRODUCT, describeOptions, storeById } from '../data/menu';
import { fmtDate, fmtTime, prettyPhone, taka } from '../lib/format';
import { formatAddress } from '../components/Location';
import { TotalsTable } from '../components/Cart';
import { EASE, Field } from '../components/ui';
import { PageHead } from './Browse';

const ICONS = { placed: ClipboardCheck, prep: ChefHat, oven: Flame, qc: PackageCheck, out: Bike, done: Check };

function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setN(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return n;
}

export function OrderStatus() {
  const { id } = useParams();
  const { orders, cancelOrder, reorder, toast } = useApp();
  const now = useNow();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-[28px] font-black">We can’t find order {id}</h1>
        <p className="mt-2 text-ink-3">Orders are saved in the browser they were placed from.</p>
        <Link to="/track" className="btn-primary mt-6">Look up another order</Link>
      </div>
    );
  }
  const { stages, index, cancelled, done, waiting } = orderStage(order, now);
  const store = storeById(order.storeId);
  const eta = order.when && order.when !== 'asap' ? new Date(order.when) : new Date(order.placedAt + order.etaMin * 60_000);
  const canCancel = !cancelled && (waiting || index < 1);
  const scheduled = order.when && order.when !== 'asap';

  return (
    <div className="container-x py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }}
        className={`overflow-hidden rounded-[28px] p-6 text-white sm:p-10 ${cancelled ? 'bg-ink' : 'bg-blue-600'}`}>
        <p className="text-[13px] font-bold uppercase tracking-[.16em] text-blue-100">Order {order.id}</p>
        <h1 className="mt-2 text-[34px] font-black leading-tight sm:text-[46px]">
          {cancelled ? 'Order cancelled' : waiting ? 'Scheduled and confirmed' : done ? (order.mode === 'pickup' ? 'Ready at the counter' : 'Delivered. Enjoy!') : stages[index].label}
        </h1>
        {!cancelled && !done && (
          <p className="mt-2 text-[16px] text-blue-100">
            {scheduled ? `Scheduled for ${new Date(order.when).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}` : order.mode === 'delivery' ? <>Arriving around <b className="text-white">{fmtTime(eta)}</b></> : <>Ready around <b className="text-white">{fmtTime(eta)}</b> at Domino’s {store?.name}</>}
          </p>
        )}
        {!cancelled && (
          <ol className="mt-8 grid gap-3 sm:grid-cols-[repeat(var(--n),1fr)] sm:gap-0" style={{ '--n': stages.length }} aria-label="Order progress">
            {stages.map((s, n) => {
              const I = ICONS[s.id];
              const state = n < index ? 'done' : n === index ? 'now' : 'next';
              return (
                <li key={s.id} className="relative flex items-center gap-3 sm:flex-col sm:text-center" aria-current={state === 'now' ? 'step' : undefined}>
                  {n > 0 && <span className="absolute right-1/2 top-6 hidden h-1 w-full -translate-y-1/2 rounded-full bg-white/20 sm:block" aria-hidden="true">
                    <motion.span className="block h-full origin-left rounded-full bg-white" initial={false} animate={{ scaleX: n <= index ? 1 : 0 }} transition={{ duration: 0.6, ease: EASE }} /></span>}
                  <motion.span className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full ${state === 'next' ? 'bg-blue-700 text-blue-200' : 'bg-white text-blue-600'}`}
                    animate={state === 'now' ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={state === 'now' ? { repeat: Infinity, duration: 1.6 } : {}}>
                    <I size={22} aria-hidden="true" />
                  </motion.span>
                  <span className={`text-[13.5px] font-semibold sm:mt-2 ${state === 'next' ? 'text-blue-200' : 'text-white'}`}>{s.label}<span className="sr-only">{state === 'done' ? ', done' : state === 'now' ? ', in progress' : ''}</span></span>
                </li>
              );
            })}
          </ol>
        )}
        <p className="mt-6 text-[12px] text-blue-100/80">Demo timeline runs faster than real life. In production each step comes from the store’s make-line.</p>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-6">
          <h2 className="text-[19px] font-extrabold">Items</h2>
          <ul className="mt-4 grid gap-3">
            {order.lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 text-[14.5px]">
                <span><b>{l.qty} × {l.name}</b>{PRODUCT[l.id]?.kind === 'pizza' && <span className="block text-[12.5px] text-ink-3">{describeOptions(PRODUCT[l.id], l.opts)}</span>}</span>
                <span className="font-semibold tabular-nums">{taka(l.total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line-2 pt-4"><TotalsTable t={order} /></div>
        </section>
        <aside className="grid content-start gap-4">
          <div className="card p-6 text-[14.5px]">
            <h2 className="text-[17px] font-extrabold">{order.mode === 'delivery' ? 'Delivering to' : 'Pick up from'}</h2>
            <p className="mt-1 text-ink-2">{order.mode === 'delivery' ? formatAddress(order.address) : `${store?.address}`}</p>
            <p className="mt-3 text-ink-3">Placed {fmtDate(order.placedAt)}, {fmtTime(order.placedAt)} · {order.contact.name} · {prettyPhone(order.contact.phone)}</p>
            <a href={`tel:${store?.phone.replace(/\D/g, '')}`} className="btn-ghost mt-4 w-full"><Phone size={16} /> Call Domino’s {store?.name}</a>
          </div>
          <div className="grid gap-2">
            {canCancel && <button className="btn-ghost text-red-600" onClick={() => { if (confirm('Cancel this order?')) { cancelOrder(order.id); toast('Order cancelled.'); } }}><XCircle size={17} /> Cancel order</button>}
            {(done || cancelled) && <button className="btn-primary" onClick={() => reorder(order)}><RotateCcw size={17} /> Order this again</button>}
            <Link to="/help" className="btn-link justify-center text-[14px]">Problem with this order?</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Track() {
  const { orders, userOrders, user } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const now = Date.now();
  const active = userOrders.filter((o) => !orderStage(o, now).done && !o.cancelled);
  return (
    <>
      <PageHead eyebrow="Track" title="Where’s my pizza?" sub="Enter your order number, or pick a recent order." />
      <div className="container-x mt-10 grid max-w-[720px] gap-6">
        <form className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end" onSubmit={(e) => {
          e.preventDefault();
          const id = q.trim().toUpperCase();
          if (orders.some((o) => o.id === id)) nav(`/order/${id}`); else setErr('No order with that number in this browser. Check the number in your confirmation.');
        }}>
          <div className="flex-1"><Field label="Order number" id="trk" error={err}><input id="trk" className="input uppercase placeholder:normal-case" placeholder="DPZ1234567" value={q} onChange={(e) => { setQ(e.target.value); setErr(''); }} /></Field></div>
          <button className="btn-primary h-12"><Search size={17} /> Track</button>
        </form>
        {active.length > 0 && (
          <section>
            <h2 className="text-[19px] font-extrabold">In progress</h2>
            <ul className="mt-3 grid gap-2">
              {active.map((o) => {
                const st = orderStage(o, now);
                return <li key={o.id}><Link to={`/order/${o.id}`} className="card flex items-center justify-between p-4 hover:ring-blue-200"><span><b>{o.id}</b><span className="block text-[13px] text-ink-3">{st.stages[st.index].label} · {taka(o.total)}</span></span><span className="btn-link text-[14px]">Track</span></Link></li>;
              })}
            </ul>
          </section>
        )}
        {!user && <p className="text-[14px] text-ink-3"><Link to="/signin?next=/account/orders" className="font-semibold text-blue-600 hover:underline">Sign in</Link> to see every order on your account.</p>}
      </div>
    </>
  );
}
