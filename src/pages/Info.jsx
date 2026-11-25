import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../state/AppState';
import { DELIVERY_FEE, FAQ, FREE_DELIVERY_OVER, PRODUCTS, STORES } from '../data/menu';
import { isBDPhone, isEmail } from '../lib/format';
import { Field, VegMark } from '../components/ui';
import { PageHead } from './Browse';

export function Help() {
  const { toast, userOrders } = useApp();
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
      <PageHead eyebrow="Help" title="How can we help?" sub="Answers to the usual questions, and a direct line to a person if they don’t cover it." />
      <div className="container-x mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="faq-h">
          <h2 id="faq-h" className="text-[22px] font-extrabold">Frequently asked</h2>
          <div className="mt-4 grid gap-2">
            {FAQ.map((q, n) => (
              <div key={q.q} className="card overflow-hidden">
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
            <a href={`tel:${STORES[0].phone.replace(/\D/g, '')}`} className="card flex items-center gap-3 p-4 hover:ring-blue-200"><Phone className="text-blue-600" aria-hidden="true" /><span><b className="block">Call a store</b><span className="text-[13px] text-ink-3">11:00 – 23:30 daily</span></span></a>
            <Link to="/stores" className="card flex items-center gap-3 p-4 hover:ring-blue-200"><MessageCircle className="text-blue-600" aria-hidden="true" /><span><b className="block">Store numbers</b><span className="text-[13px] text-ink-3">All six stores</span></span></Link>
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

const DOCS = {
  terms: { title: 'Terms of use', body: [
    ['Orders', 'An order is confirmed when the store accepts it and you see an order number. Prices and availability can change until then.'],
    ['Delivery', `Delivery is available inside each store’s zone. The fee is ৳${DELIVERY_FEE}, waived over ৳${FREE_DELIVERY_OVER}. Estimates are estimates; traffic and weather can add time.`],
    ['Promo codes', 'One code per order. Codes have conditions shown in the cart and can’t be exchanged for cash.'],
    ['Accounts', 'Keep your password private. You’re responsible for orders placed from your account.'],
  ] },
  privacy: { title: 'Privacy policy', body: [
    ['What we collect', 'Name, mobile number, optional email, delivery addresses and order history — only what’s needed to make and deliver your food.'],
    ['How it’s used', 'To fulfil orders, contact you about them, and (if you opt in) send offers. We don’t sell personal data.'],
    ['Payments', 'Card and mobile-wallet payments are processed by licensed gateways. We never see or store full card numbers.'],
    ['Your choices', 'Edit your profile, remove addresses, opt out of marketing or delete your account at any time from My account.'],
    ['This prototype', 'Everything you enter on this concept site stays in your own browser’s local storage. Nothing is sent to a server. “Reset demo data” in the footer clears it.'],
  ] },
  refunds: { title: 'Refunds & complaints', body: [
    ['Something wrong?', 'Report it from the order page or the Help page within 24 hours. A photo helps.'],
    ['How refunds work', 'Approved refunds go back to the original payment method within 3–7 working days, or as a store credit if you prefer.'],
    ['Cancellations', 'You can cancel until the store starts making your order. After that, call the store.'],
  ] },
};

export function Legal() {
  const { doc } = useParams();
  if (doc === 'nutrition') return <Nutrition />;
  const d = DOCS[doc] || DOCS.terms;
  return (
    <>
      <PageHead eyebrow="Policies" title={d.title} sub="Prototype copy for the redesign. Final wording comes from Domino’s Bangladesh legal." />
      <article className="container-x mt-10 grid max-w-[760px] gap-6">
        {d.body.map(([h, p]) => <section key={h}><h2 className="text-[20px] font-extrabold">{h}</h2><p className="mt-2 text-[15.5px] leading-relaxed text-ink-2">{p}</p></section>)}
      </article>
    </>
  );
}

function Nutrition() {
  return (
    <>
      <PageHead eyebrow="Nutrition" title="Nutrition & allergens" sub="Energy per slice for Medium hand-tossed pizzas, per portion for everything else. Prototype figures — the real table comes from the product spec sheets." />
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
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <motion.p initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring' }} className="font-display text-[96px] font-black leading-none text-blue-600">404</motion.p>
        <h1 className="mt-2 text-[28px] font-black">This page went out for delivery</h1>
        <p className="mt-2 text-ink-3">and didn’t come back. Let’s get you to something hot.</p>
        <div className="mt-6 flex justify-center gap-2"><Link to="/" className="btn-ghost">Home</Link><Link to="/menu" className="btn-primary">See the menu</Link></div>
      </div>
    </div>
  );
}
