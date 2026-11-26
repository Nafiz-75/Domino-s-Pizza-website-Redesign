# Admin dashboard

The dashboard is a **separate page** at **`/admin/`**:

- local: `npm run dev` → `http://localhost:5173/admin/`
- live (after deploying): `https://nafiz-75.github.io/Domino-s-Pizza/admin/`

It is its own HTML entry (`admin/index.html` → `src/admin/main.jsx`), so shop visitors never load it. It sits on the same domain as the shop on purpose, because that is how the two share data in this serverless build. Old `#/admin` links redirect here. The first visit asks you to set a passcode for that browser.

## Approach

1. **One content model.** Everything the shop shows (copy, menu, prices, rules, stores, zones, deals, codes, reviews, FAQ, policies, nav, footer, brand colours, SEO, maintenance mode) lives in one JSON-shaped object: `src/content/defaults.js`.
2. **One store.** `src/content/store.js` keeps three copies: **live** (what visitors see), **draft** (what the admin edits) and **history** (last 8 published versions). The site renders live; `?preview` renders the draft.
3. **The site reads the store, not constants.** `src/data/menu.js` re-derives its exports (`PRODUCTS`, `COUPONS`, `STORES`…) whenever content changes, so existing components didn't need rewriting. Page copy uses `useContent()`.
4. **The dashboard is schema-driven.** `src/admin/schema.js` describes every editable thing as data. One generic list editor (`Resource`) and one generic form (`FormPage`) render all of it. To make something new editable, add its default and a schema entry. No new screen is needed.
5. **Operations data** (orders, customer accounts) is read and written in the same storage the shop uses, so status changes show up on the customer's tracking page immediately.

## What the admin controls

| Area | Screen | Controls |
|---|---|---|
| Overview | Dashboard | Revenue, orders, average order, customers (7/14/30 days), revenue per day, top products, orders by store, recent orders, content health |
| Sales | Orders | Filter/search, full detail, set the make-line stage, cancel/restore, delete, sample data |
| | Customers | Search, spend and order count, edit name/email/marketing, suspend (signs out and blocks sign-in), delete |
| Catalogue | Products · Categories · Pizza sizes · Crusts · Toppings | Add/edit/duplicate/delete, drag to reorder, show/hide, sold out, photos (library, upload, URL), prices, badges, allergens, spice, size factors, crust rules |
| Marketing | Deal cards · Promo codes · Reviews | Rule builder for codes (fixed, %, free delivery, bundle; days, minimum, order type, first order, sign-in, required items/size, end date) |
| Locations | Stores · Delivery areas · Coverage & upsells | Hours, phone, map position, area→store and ETA, out-of-zone list, cart upsells |
| Content | Home page · Page headers · Navigation · Footer & banner · FAQ · Policy pages | Section order and visibility, all copy, hero carousel pizzas, icons, links |
| System | Settings · Publish & versions | Brand colours, logo name, SEO, delivery fee/thresholds, topping limit, carousel speed, maintenance mode, publish/discard, version restore, JSON export/import, reset |

Workflow: edit → see it in **Preview** (side pane, desktop/mobile) → **Publish**. Nothing reaches visitors before publishing.

## Files

```
src/content/defaults.js   all default content
src/content/store.js      live / draft / history, useContent(), fill(), imgSrc()
src/data/menu.js          derived menu exports + declarative coupon engine
admin/index.html          admin page (second Vite entry)
src/admin/main.jsx        admin entry point
src/admin/AdminApp.jsx    passcode gate, sidebar, top bar, preview, routes (lazy chunk)
src/admin/schema.js       every editable collection and form, sidebar
src/admin/fields.jsx      field types + <Form>
src/admin/pages.jsx       Dashboard, Orders, Customers, Resource, FormPage, Publish
src/admin/kit.jsx         Drawer, Switch, Badge, Card, Stat, ThemeToggle, toasts
```

Design: same tokens as the shop (logo blue for navigation, logo red for the main action), Archivo/Inter, Motion for transitions, layout pills, drawers and reordering. Dark mode is a charcoal ramp (`#121416 → #1a1d20 → #23272b`) and remembers your choice. The theme toggle is adapted from 21st.dev "Animated Theme Toggle"; the sidebar's rail and active pill follow the 21st.dev "Sidebar" pattern.

## Limits and the production path

This build runs on GitHub Pages with no server, so **content, orders and accounts live in the browser that edits them**. Publishing changes the site for that browser (and its other tabs), not for every visitor. The passcode only protects this device.

To make one admin control the site for everyone:

1. Put the content object behind an API: Supabase, Firebase or a small Node service with a `content` table holding `live`, `draft` and `versions`. Swap `load`/`save` in `store.js` for fetch calls. The shape stays the same.
2. Move orders and customers to the same backend (see README → Integration points).
3. Replace the passcode with real staff sign-in and roles (owner, manager, store staff), plus an audit log.
4. Move image uploads to object storage (S3/R2/Supabase Storage) instead of data URLs.
