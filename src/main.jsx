import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import './index.css';
import { AppProvider } from './state/AppState';
import { ConceptBanner, Footer, Header, SmsInbox, Toasts } from './components/Layout';
import { CartDrawer } from './components/Cart';
import { LocationSheet } from './components/Location';
import { ItemSheet } from './components/Product';
import Home from './pages/Home';
import { Deals, Menu, Stores } from './pages/Browse';
import { Forgot, SignIn, SignUp } from './pages/Auth';
import Checkout from './pages/Checkout';
import { OrderStatus, Track } from './pages/Order';
import { AccountLayout, Addresses, Orders, Profile, RequireAuth, Security } from './pages/Account';
import { Help, Legal, NotFound } from './pages/Info';
import { PREVIEW, useContent } from './content/store';
import { Logo } from './components/ui';


const TITLES = { '/': 'Order pizza online', '/menu': 'Menu', '/deals': 'Deals', '/stores': 'Stores', '/track': 'Track order', '/checkout': 'Checkout', '/signin': 'Sign in', '/signup': 'Create account', '/forgot': 'Reset password', '/help': 'Help' };

function Routed() {
  const loc = useLocation();
  const c = useContent();
  /* top-level section decides the page transition, so account tabs don't re-animate the whole page */
  const section = loc.pathname.split('/')[1] || 'home';
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = TITLES[loc.pathname] || (loc.pathname.startsWith('/account') ? 'My account' : loc.pathname.startsWith('/order') ? 'Order status' : 'Domino’s');
    document.title = `${t} · ${c.settings.siteTitle}`;
  }, [loc.pathname, c.settings.siteTitle]);
  return (
    <AnimatePresence mode="wait">
      <motion.main key={section} id="main" tabIndex={-1} className="outline-none" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}>
        <Routes location={loc}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<Track />} />
          <Route path="/order/:id" element={<OrderStatus />} />
          <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
            <Route index element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="security" element={<Security />} />
          </Route>
          <Route path="/help" element={<Help />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

/* Brand colours, SEO and maintenance mode, all set from Admin → Settings. */
const mix = (hex, pct, to = 'black') => `color-mix(in oklab, ${hex} ${100 - pct}%, ${to})`;
function useSiteChrome(s) {
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--color-blue-600', s.primary);
    r.setProperty('--color-blue-500', mix(s.primary, 14, 'white'));
    r.setProperty('--color-blue-700', mix(s.primary, 18));
    r.setProperty('--color-blue-800', mix(s.primary, 38));
    r.setProperty('--color-blue-900', mix(s.primary, 62));
    r.setProperty('--color-blue-950', mix(s.primary, 76));
    r.setProperty('--color-red-500', s.accent);
    r.setProperty('--color-red-600', mix(s.accent, 12));
    r.setProperty('--color-red-700', mix(s.accent, 26));
    document.querySelector('meta[name="description"]')?.setAttribute('content', s.seoDescription);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', s.primary);
  }, [s.primary, s.accent, s.seoDescription]);
}

function Maintenance({ message }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-blue-600 p-6 text-center text-white">
      <div><Logo mono className="text-white" /><h1 className="mt-6 text-[34px] font-black">Back shortly</h1><p className="mt-2 max-w-[40ch] text-blue-100">{message}</p></div>
    </div>
  );
}

function Site() {
  const c = useContent();
  const ver = useRef({ c, n: 0 });
  if (ver.current.c !== c) ver.current = { c, n: ver.current.n + 1 };
  useSiteChrome(c.settings);
  if (c.settings.maintenance && !PREVIEW) return <Maintenance message={c.settings.maintenanceMessage} />;
  return (
    <MotionConfig reducedMotion="user">
      {/* content edits re-mount the shop so every derived list is rebuilt; cart, session and orders reload from storage */}
      <AppProvider key={ver.current.n}>
          <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold">Skip to content</a>
          <ConceptBanner />
          <Header />
          <Routed />
          <Footer />
          <CartDrawer />
          <LocationSheet />
          <ItemSheet />
          <Toasts />
          <SmsInbox />
      </AppProvider>
    </MotionConfig>
  );
}

function App() {
  const { pathname } = useLocation();
  /* the dashboard is a separate page now (admin/index.html); keep old #/admin links working */
  if (pathname.startsWith('/admin')) { location.replace('./admin/'); return null; }
  return <Site />;
}

/* "/admin" without the trailing slash would load the shop; send it to the admin page */
if (/\/admin$/.test(location.pathname)) location.replace(location.pathname + '/' + location.search);

createRoot(document.getElementById('root')).render(<StrictMode><HashRouter><App /></HashRouter></StrictMode>);
