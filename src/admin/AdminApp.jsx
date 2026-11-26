/* Admin dashboard shell: passcode gate, sidebar, top bar, live preview, routes. */
import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ExternalLink, Lock, Menu as MenuIcon, Monitor, PanelLeftClose, PanelLeftOpen, PanelRight, Smartphone, Upload, X } from 'lucide-react';
import { Logo } from '../components/ui';
import { hashPassword, makeSalt } from '../lib/crypto';
import { load, save } from '../lib/storage';
import { publish, useCms } from '../content/store';
import { NAV } from './schema';
import { Customers, Dashboard, FormPage, Orders, Publish, Resource } from './pages';
import { EASE, ThemeToggle, Toaster, notify, safely, spring, useTheme } from './kit';

const SESSION = 'dpz-admin-session';
import { SITE } from './root';

/* Prototype gate: a passcode hashed in this browser. Production replaces it
   with real staff sign-in (SSO, roles, audit log) on the server. */
function Gate({ onUnlock }) {
  const auth = load('admin:auth', null);
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    if (!auth) {
      if (pass.length < 6) return setErr('Use at least 6 characters.');
      if (pass !== pass2) return setErr('The two passcodes don’t match.');
      const salt = makeSalt();
      save('admin:auth', { salt, hash: await hashPassword(pass, salt) });
    } else if ((await hashPassword(pass, auth.salt)) !== auth.hash) return setErr('That passcode isn’t right.');
    sessionStorage.setItem(SESSION, '1');
    onUnlock();
  };
  return (
    <div className="grid min-h-dvh place-items-center bg-app p-6">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE, duration: 0.5 }} className="a-card w-full max-w-[400px] p-7">
        <Logo className="text-brand" />
        <h1 className="mt-6 text-[22px] font-extrabold">{auth ? 'Unlock the dashboard' : 'Set an admin passcode'}</h1>
        <p className="mt-1 text-[13.5px] text-dim">{auth ? 'Enter the passcode for this browser.' : 'First visit in this browser. The passcode is stored hashed, on this device only.'}</p>
        <label className="a-label mt-5" htmlFor="pc">Passcode</label>
        <input id="pc" type="password" autoComplete={auth ? 'current-password' : 'new-password'} className="a-input" value={pass} onChange={(e) => { setPass(e.target.value); setErr(''); }} autoFocus />
        {!auth && <><label className="a-label mt-3" htmlFor="pc2">Repeat passcode</label><input id="pc2" type="password" autoComplete="new-password" className="a-input" value={pass2} onChange={(e) => { setPass2(e.target.value); setErr(''); }} /></>}
        <AnimatePresence>{err && <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-[13px] font-semibold text-red-500">{err}</motion.p>}</AnimatePresence>
        <button className="a-btn-primary mt-5 h-10 w-full">{auth ? 'Unlock' : 'Create passcode'}</button>
        <a href={SITE} className="mt-4 block text-center text-[13px] font-semibold text-dim hover:text-fg">Back to the shop</a>
      </motion.form>
    </div>
  );
}

/* Collapsible sidebar: full labels or an icon rail; active item marked by a
   shared-layout pill (pattern after 21st.dev "Sidebar"). */
function Sidebar({ rail, onNavigate }) {
  return (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <div className={`flex h-16 shrink-0 items-center ${rail ? 'justify-center' : 'px-5'}`}>
        <Link to="/" className="text-brand" aria-label="Dashboard">{rail ? <span className="font-display text-[20px] font-black">D</span> : <Logo />}</Link>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((g) => (
          <div key={g.group} className="mt-4 first:mt-1">
            {!rail && <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-dim/80">{g.group}</p>}
            {rail && <div className="mx-auto mb-2 h-px w-6 bg-edge" aria-hidden="true" />}
            <ul className="grid gap-0.5">
              {g.items.map((it) => (
                <li key={it.to}>
                  <NavLink to={`/${it.to}`} end={it.end} onClick={onNavigate} title={rail ? it.label : undefined}
                    className={({ isActive }) => `relative flex h-9 items-center gap-3 rounded-xl text-[13.5px] font-semibold transition-colors ${rail ? 'justify-center' : 'px-3'} ${isActive ? 'text-fg' : 'text-dim hover:text-fg'}`}>
                    {({ isActive }) => (
                      <>
                        {isActive && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-raised ring-1 ring-edge" transition={spring} />}
                        <it.icon size={17} className={`relative shrink-0 ${isActive ? 'text-brand' : ''}`} aria-hidden="true" />
                        {!rail && <span className="relative truncate">{it.label}</span>}
                        {rail && <span className="sr-only">{it.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/* Live preview of the draft: the real shop in an iframe, kept in sync via storage events. */
function Preview({ onClose }) {
  const [mobile, setMobile] = useState(false);
  const [path, setPath] = useState('/');
  const src = `${SITE}?preview#${path}`;
  return (
    <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: mobile ? 430 : 'min(44vw, 760px)', opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ ease: EASE, duration: 0.4 }}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-l border-edge bg-panel lg:flex" aria-label="Draft preview">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-edge px-3">
        <span className="text-[13px] font-bold">Draft preview</span>
        <select className="a-input ml-1 h-8 w-auto text-[12.5px]" value={path} onChange={(e) => setPath(e.target.value)} aria-label="Page">
          {[['/', 'Home'], ['/menu', 'Menu'], ['/deals', 'Deals'], ['/stores', 'Stores'], ['/help', 'Help'], ['/legal/terms', 'Terms']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="ml-auto flex rounded-lg bg-app p-0.5 ring-1 ring-edge">
          {[[false, Monitor, 'Desktop'], [true, Smartphone, 'Mobile']].map(([m, I, l]) => (
            <button key={l} onClick={() => setMobile(m)} aria-pressed={mobile === m} aria-label={l} className={`grid h-7 w-8 place-items-center rounded-md ${mobile === m ? 'bg-raised text-fg' : 'text-dim'}`}><I size={15} /></button>
          ))}
        </div>
        <a href={src} target="_blank" rel="noreferrer" className="a-btn-quiet h-8 w-8 px-0" aria-label="Open preview in a new tab"><ExternalLink size={15} /></a>
        <button onClick={onClose} className="a-btn-quiet h-8 w-8 px-0" aria-label="Close preview"><X size={16} /></button>
      </div>
      <iframe key={path} title="Draft preview of the shop" src={src} className="w-full flex-1 bg-white" />
    </motion.aside>
  );
}

function Keyed({ C }) { const { id } = useParams(); return <C key={id} />; }

function Shell({ lock }) {
  const [dark, setDark] = useTheme();
  const [rail, setRail] = useState(() => load('admin:rail', false));
  const [mobileNav, setMobileNav] = useState(false);
  const [preview, setPreview] = useState(false);
  const { draft, live } = useCms();
  const dirty = JSON.stringify(draft) !== JSON.stringify(live);
  const loc = useLocation();
  useEffect(() => save('admin:rail', rail), [rail]);
  useEffect(() => { document.title = 'Admin · ' + draft.settings.siteTitle; window.scrollTo(0, 0); }, [loc.pathname, draft.settings.siteTitle]);

  return (
    <div className={`admin ${dark ? 'dark' : ''} flex min-h-dvh bg-app font-sans text-fg`}>
      <motion.aside animate={{ width: rail ? 76 : 260 }} transition={{ ease: EASE, duration: 0.35 }} className="sticky top-0 hidden h-dvh shrink-0 border-r border-edge bg-panel md:block">
        <Sidebar rail={rail} />
      </motion.aside>
      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <motion.div className="absolute inset-0 bg-black/45" onClick={() => setMobileNav(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="absolute inset-y-0 left-0 w-[270px] bg-panel" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
              <Sidebar onNavigate={() => setMobileNav(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-edge bg-app/85 px-4 backdrop-blur-md sm:px-6">
          <button className="a-btn-quiet h-9 w-9 px-0 md:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation"><MenuIcon size={18} /></button>
          <button className="a-btn-quiet hidden h-9 w-9 px-0 md:inline-flex" onClick={() => setRail((r) => !r)} aria-label={rail ? 'Expand sidebar' : 'Collapse sidebar'}>{rail ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
          <AnimatePresence>
            {dirty && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="ml-1 hidden items-center gap-2 whitespace-nowrap rounded-full bg-cheese/20 px-3 py-1 text-[12.5px] font-semibold sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cheese" aria-hidden="true" /> Unpublished changes
              </motion.span>
            )}
          </AnimatePresence>
          <div className="ml-auto flex items-center gap-1.5">
            <button className={`a-btn-ghost hidden lg:inline-flex ${preview ? 'ring-brand' : ''}`} onClick={() => { setPreview((p) => !p); if (!preview) setRail(true); }} aria-pressed={preview}><PanelRight size={15} /> Preview</button>
            <a className={`a-btn-quiet hidden ${preview ? '' : 'xl:inline-flex'}`} href={SITE + '#/'} target="_blank" rel="noreferrer"><ExternalLink size={15} /> View site</a>
            <ThemeToggle dark={dark} onChange={setDark} />
            <button className="a-btn-quiet h-9 w-9 px-0" onClick={lock} aria-label="Lock dashboard" title="Lock"><Lock size={16} /></button>
            <button className="a-btn-primary" disabled={!dirty} onClick={safely(() => publish(), 'Published. Visitors now see the new version.')}><Upload size={15} /> Publish</button>
          </div>
        </header>
        <AnimatePresence mode="wait">
          <motion.main key={loc.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}
            className="@container mx-auto w-full max-w-[1280px] flex-1 px-4 py-7 sm:px-6 lg:px-8">
            <Routes location={loc}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="r/:id" element={<Keyed C={Resource} />} />
              <Route path="f/:id" element={<Keyed C={FormPage} />} />
              <Route path="publish" element={<Publish />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </div>
      <AnimatePresence>{preview && <Preview onClose={() => setPreview(false)} />}</AnimatePresence>
      <Toaster />
    </div>
  );
}

export default function AdminApp() {
  const [ok, setOk] = useState(() => sessionStorage.getItem(SESSION) === '1');
  const [dark] = useTheme();
  const lock = () => { sessionStorage.removeItem(SESSION); setOk(false); notify('Locked.'); };
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/*" element={ok ? <Shell lock={lock} /> : <div className={`admin ${dark ? 'dark' : ''} text-fg`}><Gate onUnlock={() => setOk(true)} /></div>} />
      </Routes>
    </MotionConfig>
  );
}
