# Domino's Bangladesh — Website Redesign Concept

**Unofficial portfolio concept. Not affiliated with or endorsed by Domino's.**
A complete, clickable ordering experience: browse → customise → cart → address → checkout → live tracking → account.
Everything runs in the browser; no real orders, payments or accounts are created.

Live demo: https://nafiz-75.github.io/Domino-s-Pizza-website-Redesign/  
Admin dashboard: https://nafiz-75.github.io/Domino-s-Pizza-Admin/ (see ADMIN.md)

## What's in it

| Area | Included |
|---|---|
| Home | Auto-rotating featured-pizza hero (pauses on hover/focus/off-screen, respects reduced motion), offers, categories, bestsellers, how-it-works, reviews |
| Menu | Categories, search, veg-only toggle, sort, veg/non-veg marks, spice level, ratings |
| Pizza builder | Size (Personal / Medium / Large), crust (with size rules), up to 5 extra toppings, live price |
| Cart | Edit / quantity / remove, upsells, free-delivery progress, minimum order, promo codes with clear reasons when they don't apply |
| Delivery & carryout | Dhaka address form (area, road, house, flat, landmark, rider note), "use my location", delivery-zone + store matching, store hours, carryout store picker |
| Checkout | 3-step (Delivery → Payment → Review), guest or signed-in, ASAP or scheduled slots (auto-picks the first slot when the store is closed), Cash / bKash / Nagad / card hand-off |
| Tracking | Order number, 6-stage live timeline, ETA, cancel before prep, reorder, call store, order lookup |
| Accounts | Sign up with phone OTP, sign in (phone or email), forgot password via OTP, profile, saved addresses (default), order history, change password, delete account, attempt lock-out |
| Content | Stores page with map, Help/FAQ + contact form, Terms, Privacy, Refunds, Nutrition & allergens, 404 |
| Quality | Keyboard + screen-reader support (focus-trapped dialogs, skip link, ARIA), mobile-first, WebP images (1.5 MB total) |

## Stack

React 19 · Vite · Tailwind CSS v4 · Motion (Framer Motion) · React Router (hash routing for static hosting) · lucide icons.
The OTP code input and the checkout stepper are adapted from 21st.dev components ("Sign Up Flow", "Stepper").
Colour system is taken from the logo: blue `#006491`, red `#E31837`, white.

## Run / deploy

```bash
npm install
npm run dev       # local
npm run build     # outputs dist/
```

- **Vercel:** import the repo; it detects Vite (`vercel.json` included). Use a lowercase project name.
- **GitHub Pages:** the `gh-pages` branch holds the built `dist/`.

## Integration points (what production replaces)

Every prototype-only piece is isolated so it can be swapped for Domino's systems:

| Prototype | Production |
|---|---|
| `src/content/store.js` (all site content, edited in the separate admin page at `/admin/`, see ADMIN.md) | CMS / content API with draft, publish and versions |
| `src/lib/storage.js` (localStorage) | Customer, address and order services |
| `src/lib/crypto.js` + OTP shown on screen | Auth service: server-side password hashing, SMS gateway for OTP, rate limiting, sessions/JWT |
| Payment step (no details collected) | SSLCommerz / bKash / Nagad checkout redirects + webhooks |
| `orderStage()` timed simulation | Store make-line / POS events and rider GPS |
| `nearestArea()` zone match | Geocoding + polygon delivery zones |
| Help form | CRM / ticketing |

Prices, stores, delivery zones, reviews and nutrition figures are illustrative.
Domino's® name and marks belong to Domino's IP Holder LLC.
