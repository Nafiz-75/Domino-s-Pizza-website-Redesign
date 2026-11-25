import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { useApp } from '../state/AppState';
import { prettyPhone } from '../lib/format';
import { EASE, Field, Logo, OtpInput, PasswordField, Spinner, passwordOk } from '../components/ui';

function AuthShell({ title, sub, children, stepKey, back }) {
  return (
    <div className="container-x grid min-h-[calc(100dvh-200px)] place-items-center py-12">
      <motion.div layout className="w-full max-w-[440px] overflow-hidden rounded-3xl bg-white p-6 shadow-pop ring-1 ring-line/70 sm:p-8" transition={{ duration: 0.4, ease: EASE }}>
        <div className="mb-6 flex h-9 items-center justify-between">
          {back ? <button onClick={back} className="-ml-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 font-semibold text-blue-600 hover:bg-blue-50"><ArrowLeft size={18} /> Back</button> : <Logo className="text-blue-700" />}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={stepKey} initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: EASE }}>
            <h1 className="text-[28px] font-black leading-tight">{title}</h1>
            {sub && <p className="mt-1.5 text-[15px] text-ink-3">{sub}</p>}
            <div className="mt-6">{children}</div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function FormError({ msg }) {
  return (
    <AnimatePresence>
      {msg && <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
        className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[14px] font-medium text-red-700 ring-1 ring-red-100">{msg}</motion.p>}
    </AnimatePresence>
  );
}

function useNext() {
  const [params] = useSearchParams();
  const next = params.get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';
}

function OtpStep({ phone, onVerified, onBack }) {
  const { verifyOtp, resendOtp } = useApp();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(0);
  const [left, setLeft] = useState(30);
  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft((s) => s - 1), 1000); return () => clearTimeout(t); }, [left]);
  const submit = (c = code) => {
    try { const r = verifyOtp(c); onVerified(r); }
    catch (e) { setErr(e.message); setShake((s) => s + 1); setTimeout(() => setCode(''), 450); }
  };
  return (
    <div className="grid gap-4">
      <OtpInput value={code} error={!!err} shakeKey={shake} onChange={(v) => { setCode(v); setErr(''); if (v.length === 6) submit(v); }} />
      <FormError msg={err} />
      <button className="btn-primary h-12" disabled={code.length < 6} onClick={() => submit()}>Verify</button>
      <div className="flex items-center justify-between text-[14px]">
        <button disabled={left > 0} onClick={() => { try { resendOtp(); setLeft(30); setErr(''); } catch (e) { setErr(e.message); } }}
          className="font-semibold text-blue-600 disabled:text-ink-3">{left > 0 ? `Resend code in 0:${String(left).padStart(2, '0')}` : 'Resend code'}</button>
        <button onClick={onBack} className="font-semibold text-blue-600">Change number</button>
      </div>
      <p className="text-[12.5px] text-ink-3">Sent to {prettyPhone(phone)}. In this demo the code appears in the message box at the top of the screen.</p>
    </div>
  );
}

export function SignIn() {
  const { signIn, user, toast } = useApp();
  const nav = useNavigate();
  const next = useNext();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={next} replace />;
  const submit = async (e) => {
    e.preventDefault();
    if (!id.trim() || !pw) { setErr('Enter your phone or email and your password.'); return; }
    setBusy(true); setErr('');
    try { const u = await signIn(id, pw); toast(`Welcome back, ${u.name.split(' ')[0]}.`); nav(next, { replace: true }); }
    catch (e2) { setErr(e2.message); }
    finally { setBusy(false); }
  };
  return (
    <AuthShell title="Sign in" sub="Your addresses, past orders and saved deals in one place." stepKey="signin">
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <Field label="Mobile number or email" id="si-id">
          <input id="si-id" className="input" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" placeholder="01712-345678" data-autofocus />
        </Field>
        <PasswordField value={pw} onChange={setPw} />
        <div className="-mt-1 text-right"><Link to="/forgot" className="text-[14px] font-semibold text-blue-600 hover:underline">Forgot password?</Link></div>
        <FormError msg={err} />
        <button className="btn-primary h-12 text-[16px]" disabled={busy}>{busy ? <Spinner /> : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-[14.5px] text-ink-3">New to Domino’s? <Link to={`/signup${next !== '/account' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-bold text-blue-600 hover:underline">Create an account</Link></p>
      <p className="mt-3 text-center text-[13.5px]"><Link to="/checkout" className="text-ink-3 underline underline-offset-4 hover:text-ink">Continue as guest</Link></p>
    </AuthShell>
  );
}

export function SignUp() {
  const { startSignUp, user, toast } = useApp();
  const nav = useNavigate();
  const next = useNext();
  const [step, setStep] = useState('details');
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '', agree: false });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState('');
  if (user && step !== 'done') return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!passwordOk(f.password)) { setErr('Your password needs at least 8 characters with a letter and a number.'); return; }
    if (!f.agree) { setErr('Please accept the terms to create an account.'); return; }
    setBusy(true); setErr('');
    try { setPhone(await startSignUp(f)); setStep('otp'); }
    catch (e2) { setErr(e2.message); }
    finally { setBusy(false); }
  };
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setErr(''); };

  if (step === 'otp') {
    return (
      <AuthShell stepKey="otp" title="Verify your number" sub={<>Enter the 6-digit code sent to <b className="text-ink">{prettyPhone(phone)}</b>.</>} back={() => setStep('details')}>
        <OtpStep phone={phone} onBack={() => setStep('details')} onVerified={() => setStep('done')} />
      </AuthShell>
    );
  }
  if (step === 'done') {
    return (
      <AuthShell stepKey="done" title="You’re all set" sub="Your account is ready. Use WELCOME150 for ৳150 off your first order over ৳800.">
        <div className="grid place-items-center py-2">
          <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="grid h-20 w-20 place-items-center rounded-full bg-veg text-white"><Check size={40} strokeWidth={3} /></motion.span>
        </div>
        <button className="btn-primary mt-6 h-12 w-full" onClick={() => { toast('Account created.'); nav(next === '/account' ? '/menu' : next, { replace: true }); }}>Start an order</button>
        <button className="btn-ghost mt-2 h-12 w-full" onClick={() => nav('/account/addresses', { replace: true })}>Add a delivery address</button>
      </AuthShell>
    );
  }
  return (
    <AuthShell stepKey="details" title="Create your account" sub="Save addresses, reorder in two taps and get member-only deals.">
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <Field label="Full name" id="su-name"><input id="su-name" className="input" value={f.name} onChange={set('name')} autoComplete="name" data-autofocus /></Field>
        <Field label="Mobile number" id="su-phone" hint="We’ll text a code to confirm it’s yours.">
          <div className="flex">
            <span className="grid h-12 place-items-center rounded-l-xl bg-canvas px-3 text-[15px] font-semibold text-ink-2 ring-1 ring-line">🇧🇩 +880</span>
            <input id="su-phone" className="input rounded-l-none" value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel-national" placeholder="1712-345678" />
          </div>
        </Field>
        <Field label="Email (optional)" id="su-email" hint="For receipts.">
          <input id="su-email" className="input" type="email" value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
        </Field>
        <PasswordField value={f.password} onChange={(v) => { setF((x) => ({ ...x, password: v })); setErr(''); }} label="Create a password" autoComplete="new-password" showRules />
        <label className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-blue-600" checked={f.agree} onChange={(e) => setF((x) => ({ ...x, agree: e.target.checked }))} />
          <span>I agree to the <Link to="/legal/terms" className="font-semibold text-blue-600 hover:underline">Terms</Link> and <Link to="/legal/privacy" className="font-semibold text-blue-600 hover:underline">Privacy Policy</Link>.</span>
        </label>
        <p className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-[12.5px] text-blue-800"><ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          Demo account: it lives only in this browser and your password is stored hashed. Please don’t reuse a real password.</p>
        <FormError msg={err} />
        <button className="btn-primary h-12 text-[16px]" disabled={busy}>{busy ? <Spinner /> : 'Send verification code'}</button>
      </form>
      <p className="mt-6 text-center text-[14.5px] text-ink-3">Already have an account? <Link to="/signin" className="font-bold text-blue-600 hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}

export function Forgot() {
  const { startReset, finishReset, toast } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (step === 'otp') return (
    <AuthShell stepKey="otp" title="Enter the code" sub={<>If <b className="text-ink">{prettyPhone(phone)}</b> has an account, we’ve texted it a code.</>} back={() => setStep('phone')}>
      <OtpStep phone={phone} onBack={() => setStep('phone')} onVerified={() => setStep('new')} />
    </AuthShell>
  );
  if (step === 'new') return (
    <AuthShell stepKey="new" title="Choose a new password">
      <form className="grid gap-4" onSubmit={async (e) => {
        e.preventDefault();
        if (!passwordOk(pw)) { setErr('Use at least 8 characters with a letter and a number.'); return; }
        setBusy(true);
        try { await finishReset(pw); toast('Password changed. You’re signed in.'); nav('/account', { replace: true }); } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
      }}>
        <PasswordField value={pw} onChange={(v) => { setPw(v); setErr(''); }} label="New password" autoComplete="new-password" showRules />
        <FormError msg={err} />
        <button className="btn-primary h-12" disabled={busy}>{busy ? <Spinner /> : 'Save and sign in'}</button>
      </form>
    </AuthShell>
  );
  return (
    <AuthShell stepKey="phone" title="Reset your password" sub="Enter the mobile number on your account and we’ll text you a code." back={() => nav('/signin')}>
      <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); try { setPhone(startReset(phone)); setStep('otp'); } catch (e2) { setErr(e2.message); } }} noValidate>
        <Field label="Mobile number" id="fp-phone"><input id="fp-phone" className="input" value={phone} onChange={(e) => { setPhone(e.target.value); setErr(''); }} inputMode="tel" autoComplete="tel" placeholder="01712-345678" data-autofocus /></Field>
        <FormError msg={err} />
        <button className="btn-primary h-12">Send code</button>
      </form>
    </AuthShell>
  );
}
