import { StrictMode, useEffect } from 'react';
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

const TITLES = { '/': 'Order pizza online', '/menu': 'Menu', '/deals': 'Deals', '/stores': 'Stores', '/track': 'Track order', '/checkout': 'Checkout', '/signin': 'Sign in', '/signup': 'Create account', '/forgot': 'Reset password', '/help': 'Help' };

function Routed() {
  const loc = useLocation();
  /* top-level section decides the page transition, so account tabs don't re-animate the whole page */
  const section = loc.pathname.split('/')[1] || 'home';
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = TITLES[loc.pathname] || (loc.pathname.startsWith('/account') ? 'My account' : loc.pathname.startsWith('/order') ? 'Order status' : 'Domino’s');
    document.title = `${t} · Domino’s Bangladesh (concept)`;
  }, [loc.pathname]);
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

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <HashRouter>
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
        </HashRouter>
      </AppProvider>
    </MotionConfig>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
