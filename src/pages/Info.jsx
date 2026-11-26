import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../state/AppState';
import { FAQ, PRODUCTS, STORES } from '../data/menu';
import { fill, useContent } from '../content/store';
import { isBDPhone, isEmail } from '../lib/format';
import { Field, VegMark } from '../components/ui';
import { PageHead } from './Browse';

export function Help() {
  const { toast, userOrders } = useApp();
  const page = useContent().pages.help;
  const [open, setOpen] = useState(0);
  const [f, setF] = useState({ name: '', contact: '', order: '', topic: 'order', msg: '' });
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Add your name.';
    if (!isBDPhone(f.contact) && !isEmail(f.contact)) er.contact = 'Add a mobile number or email so we can reply.';
    if (f.msg.trim().length < 10) er.msg = 'Tell us a little more (10+ characters).';
    setErr(er);
    if (Object.keys(er).length) return;
    setSent(true);
    toast('Message logged (demo). In production it opens a support ticket.');
  };
  return (
    <>
      <PageHead {...page} />
      <div className="container-x mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-[22px] font-extrabold">Frequently asked</h2>
          <div className="mt-4 grid gap-2">
            {FAQ.map((q, n) => (
              <div key={q.id} className="card overflow-hidden">
                <button className="flex w-full items-center justify-between gap-4 p-5 text-left text-[15.5px] font-bold" aria-expanded={open === n} onClick={() => setOpen(open === n ? -1 : n)}>
                  {q.q}<motion.span animate={{ rotate: open === n ? 180 : 0 }}><ChevronDown size={20} className="text-blue-600" aria-hidden="true" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === n && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-2">{q.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={`tel:${(STORES[0]?.phone || '').replace(/\D/g, '')}`} className="card flex items-center gap-3 p-4 hover:ring-blue-200"><Phone className="text-blue-600" aria-hidden="true" /><span><b className="block">Call a store</b><span className="text-[13px] text-ink-3">{page.hours}</span></span></a>
            <Link to="/stores" className="card flex items-center gap-3 p-4 hover:ring-blue-200"><MessageCircle className="text-blue-600" aria-hidden="true" /><span><b className="block">Store numbers</b><span className="text-[13px] text-ink-3">All {STORES.length} stores</span></span></Link>
          </div>
        </section>
        <section aria-labelledby="contact-h" className="card p-6 lg:self-start">
          <h2 id="contact-h" className="flex items-center gap-2 text-[22px] font-extrabold"><Mail size={22} className="text-blue-600" aria-hidden="true" /> Send us a message</h2>
          {sent ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-blue-50 p-4 text-[15px] text-blue-900">Thanks, {f.name.split(' ')[0]}. In production this creates a ticket and we reply within a few hours.</motion.p>
          ) : (
            <form onSubmit={submit} className="mt-4 grid gap-4" noValidate>
              <Field label="Name" id="h-name" error={err.name}><input id="h-name" className="input" value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} autoComplete="name" /></Field>
              <Field label="Mobile number or email" id="h-contact" error={err.contact}><input id="h-contact" className="input" value={f.contact} onChange={(e) => setF((x) => ({ ...x, contact: e.target.value }))} /></Field>
              <Field label="About" id="h-topic">
                <select id="h-topic" className="input" value={f.topic} onChange={(e) => setF((x) => ({ ...x, topic: e.target.value }))}>
                  <option value="order">A problem with an order</option><option value="refund">A refund</option><option value="feedback">Feedback</option><option value="other">Something else</option>
                </select>
              </Field>
              {(f.topic === 'order' || f.topic === 'refund') && (
                <Field label="Order number (optional)" id="h-order">
                  <input id="h-order" className="input" list="my-orders" value={f.order} onChange={(e) => setF((x) => ({ ...x, order: e.target.value }))} placeholder="DPZ1234567" />
                  <datalist id="my-orders">{userOrders.map((o) => <option key={o.id} value={o.id} />)}</datalist>
                </Field>
              )}
              <Field label="Message" id="h-msg" error={err.msg}><textarea id="h-msg" rows={4} className="input h-auto py-3" value={f.msg} onChange={(e) => setF((x) => ({ ...x, msg: e.target.value }))} /></Field>
              <button className="btn-primary">Send message</button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}

export function Legal() {
  const { doc } = useParams();
  const c = useContent();
  if (doc === 'nutrition') return <Nutrition />;
  const d = c.legal.find((x) => x.id === doc) || c.legal[0];
  if (!d) return <NotFound />;
  return (
    <>
      <PageHead eyebrow="Policies" title={d.title} sub={d.sub} />
      <article className="container-x mt-10 grid max-w-[760px] gap-6">
        {d.sections.map((x) => <section key={x.id}><h2 className="text-[20px] font-extrabold">{x.h}</h2><p className="mt-2 whitespace-pre-line text-[15.5px] leading-relaxed text-ink-2">{fill(x.p, c)}</p></section>)}
      </article>
    </>
  );
}

function Nutrition() {
  const page = useContent().pages.nutrition;
  return (
    <>
      <PageHead {...page} />
      <div className="container-x mt-10 overflow-x-auto">
        <table className="card w-full min-w-[620px] text-left text-[14.5px]">
          <caption className="sr-only">Nutrition and allergen information</caption>
          <thead><tr className="border-b border-line-2 text-[12.5px] uppercase tracking-wider text-ink-3"><th className="p-4">Item</th><th className="p-4">Type</th><th className="p-4">Energy</th><th className="p-4">Contains</th></tr></thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id} className="border-b border-line-2 last:border-0">
                <th scope="row" className="flex items-center gap-2 p-4 font-semibold"><VegMark veg={p.veg} /> {p.name}</th>
                <td className="p-4 capitalize text-ink-2">{p.kind}</td>
                <td className="p-4 tabular-nums">{p.kcal ? `${p.kcal} kcal` : '—'}</td>
                <td className="p-4 text-ink-2">{p.allergens.join(', ') || 'None listed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function NotFound() {
  const t = useContent().pages.notFound;
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <motion.p initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring' }} className="font-display text-[96px] font-black leading-none text-blue-600">404</motion.p>
        <h1 className="mt-2 text-[28px] font-black">{t.title}</h1>
        <p className="mt-2 text-ink-3">{t.sub}</p>
        <div className="mt-6 flex justify-center gap-2"><Link to="/" className="btn-ghost">Home</Link><Link to="/menu" className="btn-primary">See the menu</Link></div>
      </div>
    </div>
  );
}
