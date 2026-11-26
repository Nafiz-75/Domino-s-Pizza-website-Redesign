/* What the dashboard can edit, as data. Adding a new editable thing to the
   site = add its default to content/defaults.js + an entry here. No new screens. */
import {
  Bike, CloudUpload, Cookie, Crop, FileText, Footprints, HelpCircle, Home, LayoutDashboard, Layers, LayoutTemplate,
  Map as MapIcon, MapPin, Menu as MenuIcon, MessageSquareQuote, Pizza, Settings2, ShoppingBasket, Store, Tag, Ticket, Users,
} from 'lucide-react';

const products = (c) => c.products.map((p) => [p.id, p.name]);
const sizes = (c) => c.sizes.map((s) => [s.id, s.label]);
const ROUTES = ['/', '/menu', '/deals', '/stores', '/track', '/help', '/signin', '/signup', '/account', '/account/orders', '/account/addresses', '/legal/terms', '/legal/privacy', '/legal/refunds', '/legal/nutrition'];
const show = { k: 'show', label: 'Visible on site', type: 'toggle' };

/* ---------- collections: list + add / edit / duplicate / delete / reorder ---------- */
export const RESOURCES = {
  products: {
    title: 'Products', one: 'product', icon: Pizza, group: 'Catalogue', title_k: 'name',
    sub: 'Everything on the menu. Pizza prices are the Medium price; other sizes are calculated from Sizes.',
    columns: [{ k: 'image', type: 'image' }, { k: 'name', label: 'Name' }, { k: 'kind', label: 'Category', type: 'ref', ref: 'categories' }, { k: 'price', label: 'Price', type: 'money' }, { k: 'veg', label: 'Diet', type: 'veg' }, { k: 'status', label: 'Status', type: 'status' }],
    search: ['name', 'desc', 'tags'],
    filter: { k: 'kind', options: (c) => c.categories.map((x) => [x.id, x.label]) },
    fields: [
      { k: 'name', label: 'Name' },
      { k: 'kind', label: 'Category', type: 'select', options: (c) => c.categories.map((x) => [x.id, x.label]) },
      { k: 'price', label: 'Price', type: 'money', hint: 'Pizzas: the Medium price.' },
      { k: 'pop', label: 'Popularity rank', type: 'number', min: 1, hint: '1 = shown first in Bestsellers.' },
      { k: 'image', label: 'Photo', type: 'image' },
      { k: 'desc', label: 'Description', type: 'textarea' },
      { k: 'tags', label: 'Badges', type: 'tags', placeholder: 'Bestseller, New, Spicy…', hint: 'The first badge shows on the card.' },
      { k: 'allergens', label: 'Allergens', type: 'tags', placeholder: 'Gluten, Milk…' },
      { k: 'rating', label: 'Rating', type: 'number', step: 0.1, min: 0, max: 5 },
      { k: 'kcal', label: 'Energy (kcal)', type: 'number', min: 0 },
      { k: 'spice', label: 'Spice level', type: 'select', numeric: true, options: [[0, 'Not spicy'], [1, 'Mild'], [2, 'Medium'], [3, 'Hot']] },
      { k: 'id', label: 'ID', mono: true, hint: 'Used in links and saved carts. Change with care.' },
      { k: 'veg', label: 'Vegetarian', type: 'toggle' },
      show,
      { k: 'soldOut', label: 'Sold out (shown, can’t be ordered)', type: 'toggle' },
    ],
    blank: { kind: 'pizza', name: '', price: 500, veg: true, rating: 4.5, pop: 50, tags: [], image: '', desc: '', kcal: 0, allergens: [], spice: 0, show: true, soldOut: false, swatch: null },
  },
  categories: {
    title: 'Categories', one: 'category', icon: Layers, group: 'Catalogue', title_k: 'label', sub: 'Menu tabs, in this order. Hiding a category hides its products.',
    columns: [{ k: 'label', label: 'Name' }, { k: 'id', label: 'ID', type: 'mono' }, { k: 'count', label: 'Products', type: 'count' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [{ k: 'label', label: 'Name' }, { k: 'id', label: 'ID', mono: true, hint: 'Products point to this. “pizza” turns on the pizza builder.' }, show],
    blank: { label: '', show: true },
  },
  sizes: {
    title: 'Pizza sizes', one: 'size', icon: Crop, group: 'Catalogue', title_k: 'label', sub: 'Price factor multiplies the Medium price (1 = Medium).',
    columns: [{ k: 'label', label: 'Size' }, { k: 'inch', label: 'Inches' }, { k: 'serves', label: 'Serves' }, { k: 'factor', label: 'Price factor' }],
    fields: [{ k: 'label', label: 'Name' }, { k: 'id', label: 'ID', mono: true }, { k: 'inch', label: 'Diameter (inches)', type: 'number' }, { k: 'serves', label: 'Serves' }, { k: 'factor', label: 'Price factor', type: 'number', step: 0.05, min: 0.1 }],
    blank: { label: '', inch: 12, serves: '2', factor: 1.2 },
  },
  crusts: {
    title: 'Crusts', one: 'crust', icon: Cookie, group: 'Catalogue', title_k: 'label',
    columns: [{ k: 'label', label: 'Crust' }, { k: 'delta', label: 'Extra (Medium)', type: 'money' }, { k: 'note', label: 'Note' }],
    fields: [{ k: 'label', label: 'Name' }, { k: 'id', label: 'ID', mono: true }, { k: 'delta', label: 'Extra charge on Medium', type: 'money' }, { k: 'note', label: 'Short note', span: 'full' }, { k: 'notOn', label: 'Not available on', type: 'multi', options: sizes }],
    blank: { label: '', delta: 0, note: '', notOn: [] },
  },
  toppings: {
    title: 'Toppings', one: 'topping', icon: ShoppingBasket, group: 'Catalogue', title_k: 'label',
    columns: [{ k: 'label', label: 'Topping' }, { k: 'price', label: 'Price (Medium)', type: 'money' }, { k: 'veg', label: 'Diet', type: 'veg' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [{ k: 'label', label: 'Name' }, { k: 'price', label: 'Price on Medium', type: 'money' }, { k: 'id', label: 'ID', mono: true }, { k: 'veg', label: 'Vegetarian', type: 'toggle' }, show],
    blank: { label: '', price: 60, veg: true, show: true },
  },
  offers: {
    title: 'Deal cards', one: 'deal', icon: Tag, group: 'Marketing', title_k: 'title', sub: 'The cards on the home page and Deals page.',
    columns: [{ k: 'image', type: 'image' }, { k: 'title', label: 'Title' }, { k: 'code', label: 'Code', type: 'mono' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [
      { k: 'kicker', label: 'Kicker' }, { k: 'title', label: 'Title' }, { k: 'sub', label: 'Description', type: 'textarea', rows: 2 },
      { k: 'code', label: 'Promo code', type: 'select', options: (c) => c.coupons.map((x) => [x.code, x.code]) },
      { k: 'go', label: '“Order” opens', type: 'select', options: products },
      { k: 'image', label: 'Background image', type: 'image' }, show,
    ],
    blank: { kicker: '', title: '', sub: '', code: '', go: '', image: '', show: true },
  },
  coupons: {
    title: 'Promo codes', one: 'code', icon: Ticket, group: 'Marketing', title_k: 'code', idFrom: 'code', sub: 'Rules are checked in the cart; shoppers see exactly why a code doesn’t apply yet.',
    columns: [{ k: 'code', label: 'Code', type: 'mono' }, { k: 'label', label: 'Shown as' }, { k: 'type', label: 'Reward', type: 'reward' }, { k: 'active', label: 'Status', type: 'active' }],
    fields: [
      { k: 'code', label: 'Code', mono: true, upper: true }, { k: 'label', label: 'Description' },
      { k: 'type', label: 'Reward', type: 'select', options: [['fixed', 'Fixed amount off'], ['percent', 'Percent off'], ['free_delivery', 'Free delivery'], ['bundle', 'Bundle price']] },
      { k: 'value', label: 'Value', type: 'number', when: (r) => r.type !== 'free_delivery', hint: 'Taka off, percent, or the bundle price.' },
      { k: 'bundleQty', label: 'Pizzas in bundle', type: 'number', min: 2, when: (r) => r.type === 'bundle' },
      { k: 'bundleSize', label: 'Bundle size', type: 'select', options: (c) => [['', 'Any size'], ...sizes(c)], when: (r) => r.type === 'bundle' },
      { k: 'minSubtotal', label: 'Minimum order', type: 'money' },
      { k: 'mode', label: 'Order type', type: 'select', options: [['any', 'Delivery and carryout'], ['delivery', 'Delivery only'], ['pickup', 'Carryout only']] },
      { k: 'days', label: 'Only on these days (none = every day)', type: 'days' },
      { k: 'requiresProducts', label: 'Cart must contain', type: 'multi', options: products },
      { k: 'requiresSize', label: 'Cart must contain a pizza of size', type: 'select', options: (c) => [['', 'No requirement'], ...sizes(c)] },
      { k: 'expires', label: 'Ends on', type: 'date', hint: 'Leave empty for no end date.' },
      { k: 'active', label: 'Active', type: 'toggle' }, { k: 'requiresAccount', label: 'Signed-in customers only', type: 'toggle' }, { k: 'firstOrderOnly', label: 'First order only', type: 'toggle' },
    ],
    blank: { code: '', label: '', active: true, type: 'fixed', value: 100, bundleQty: 2, bundleSize: '', days: [], minSubtotal: 0, mode: 'any', requiresAccount: false, firstOrderOnly: false, requiresProducts: [], requiresSize: '', expires: '' },
  },
  reviews: {
    title: 'Reviews', one: 'review', icon: MessageSquareQuote, group: 'Marketing', title_k: 'name',
    columns: [{ k: 'name', label: 'Customer' }, { k: 'where', label: 'Order · area' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [{ k: 'name', label: 'Customer name' }, { k: 'where', label: 'Order · area' }, { k: 'text', label: 'Review', type: 'textarea' }, show],
    blank: { name: '', where: '', text: '', show: true },
  },
  stores: {
    title: 'Stores', one: 'store', icon: Store, group: 'Locations', title_k: 'name',
    columns: [{ k: 'name', label: 'Store' }, { k: 'phone', label: 'Phone' }, { k: 'hours', label: 'Hours', type: 'hours' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [
      { k: 'name', label: 'Name' }, { k: 'phone', label: 'Phone' }, { k: 'address', label: 'Address', span: 'full' },
      { k: 'open', label: 'Opens', type: 'time' }, { k: 'close', label: 'Closes', type: 'time', hint: '00:00 = midnight.' },
      { k: 'lat', label: 'Latitude', type: 'number', step: 0.0001 }, { k: 'lng', label: 'Longitude', type: 'number', step: 0.0001 },
      { k: 'id', label: 'ID', mono: true }, show,
    ],
    blank: { name: '', phone: '', address: '', open: '11:00', close: '23:00', lat: 23.78, lng: 90.4, show: true },
  },
  areas: {
    title: 'Delivery areas', one: 'area', icon: MapPin, group: 'Locations', title_k: 'name', sub: 'Each area is served by one store. Customers pick from this list at checkout.',
    columns: [{ k: 'name', label: 'Area' }, { k: 'store', label: 'Store', type: 'ref', ref: 'stores', refLabel: 'name' }, { k: 'eta', label: 'ETA (min)' }],
    filter: { k: 'store', options: (c) => c.stores.map((s) => [s.id, s.name]) },
    fields: [
      { k: 'name', label: 'Area name' }, { k: 'store', label: 'Served by', type: 'select', options: (c) => c.stores.map((s) => [s.id, s.name]) },
      { k: 'eta', label: 'Delivery time (minutes)', type: 'number', min: 5 },
      { k: 'lat', label: 'Latitude', type: 'number', step: 0.0001 }, { k: 'lng', label: 'Longitude', type: 'number', step: 0.0001 }, { k: 'id', label: 'ID', mono: true },
    ],
    blank: { name: '', store: '', eta: 30, lat: 23.78, lng: 90.4 },
  },
  nav: {
    title: 'Navigation', one: 'link', icon: MenuIcon, group: 'Content', title_k: 'label', sub: 'Header links, in this order.',
    columns: [{ k: 'label', label: 'Label' }, { k: 'to', label: 'Goes to', type: 'mono' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [{ k: 'label', label: 'Label' }, { k: 'to', label: 'Goes to', type: 'select', options: ROUTES }, show],
    blank: { label: '', to: '/menu', show: true },
  },
  faq: {
    title: 'FAQ', one: 'question', icon: HelpCircle, group: 'Content', title_k: 'q', sub: 'Help page questions. Use {deliveryFee}, {freeOver}, {minOrder} to insert live values.',
    columns: [{ k: 'q', label: 'Question' }, { k: 'show', label: 'Status', type: 'show' }],
    fields: [{ k: 'q', label: 'Question', span: 'full' }, { k: 'a', label: 'Answer', type: 'textarea', rows: 4 }, show],
    blank: { q: '', a: '', show: true },
  },
  legal: {
    title: 'Policy pages', one: 'page', icon: FileText, group: 'Content', title_k: 'title', sub: 'Shown at /legal/<id>. Nutrition is generated from the products.',
    columns: [{ k: 'title', label: 'Page' }, { k: 'id', label: 'URL', type: 'legal' }, { k: 'sections', label: 'Sections', type: 'len' }],
    fields: [
      { k: 'title', label: 'Title' }, { k: 'id', label: 'URL id', mono: true }, { k: 'sub', label: 'Intro line', span: 'full' },
      { k: 'sections', label: 'Sections', type: 'list', item: 'section', fields: [{ k: 'h', label: 'Heading', span: 'full' }, { k: 'p', label: 'Text', type: 'textarea' }] },
    ],
    blank: { title: '', sub: '', sections: [] },
  },
};

/* ---------- single forms: each section edits one object in the content ---------- */
const sectionHead = (path, title) => ({ title, path, fields: [{ k: 'eyebrow', label: 'Eyebrow' }, { k: 'title', label: 'Heading' }] });
export const FORMS = {
  home: {
    title: 'Home page', icon: Home, group: 'Content', sub: 'Drag sections to reorder, switch them off, and edit every line of copy.',
    sections: [
      { title: 'Sections', path: ['home'], fields: [{ k: 'sections', label: 'Order & visibility', type: 'list', fixed: true, fields: [{ k: 'label', label: 'Section', type: 'static' }, { k: 'show', label: 'Show', type: 'toggle' }] }] },
      { title: 'Hero', path: ['home', 'hero'], fields: [
        { k: 'kicker', label: 'Kicker (Bangla)', span: 'full' },
        { k: 'title', label: 'Headline (one line per row)', type: 'textarea', rows: 3 }, { k: 'sub', label: 'Supporting text', type: 'textarea' },
        { k: 'ctaDelivery', label: 'Delivery button' }, { k: 'ctaCarryout', label: 'Carryout button' },
        { k: 'pizzas', label: 'Pizzas in the carousel (none = all pizzas)', type: 'multi', options: (c) => c.products.filter((p) => p.kind === 'pizza').map((p) => [p.id, p.name]) },
        { k: 'bullets', label: 'Bullet points', type: 'list', item: 'bullet', fields: [{ k: 'text', label: 'Text', span: 'full' }, { k: 'icon', label: 'Icon', type: 'icon' }] },
      ] },
      sectionHead(['home', 'offers'], 'Deals section'),
      { title: 'Categories section', path: ['home', 'categories'], fields: [{ k: 'title', label: 'Heading', span: 'full' }] },
      { ...sectionHead(['home', 'popular'], 'Bestsellers section'), fields: [...sectionHead().fields, { k: 'count', label: 'Products shown', type: 'number', min: 1, max: 20 }] },
      { title: 'How it works', path: ['home', 'how'], fields: [...sectionHead().fields, { k: 'steps', label: 'Steps', type: 'list', item: 'step', fields: [{ k: 'title', label: 'Title' }, { k: 'icon', label: 'Icon', type: 'icon' }, { k: 'text', label: 'Text', type: 'textarea', rows: 2 }] }] },
      { title: 'Reviews section', path: ['home', 'reviews'], fields: [...sectionHead().fields, { k: 'score', label: 'Score' }, { k: 'note', label: 'Score note' }] },
    ],
  },
  pages: {
    title: 'Page headers', icon: LayoutTemplate, group: 'Content', sub: 'The headline block at the top of each page.',
    sections: [
      ...['menu', 'deals', 'stores', 'nutrition'].map((p) => ({ title: p[0].toUpperCase() + p.slice(1), path: ['pages', p], fields: [{ k: 'eyebrow', label: 'Eyebrow' }, { k: 'title', label: 'Title' }, { k: 'sub', label: 'Intro', type: 'textarea', rows: 2 }] })),
      { title: 'Help', path: ['pages', 'help'], fields: [{ k: 'eyebrow', label: 'Eyebrow' }, { k: 'title', label: 'Title' }, { k: 'sub', label: 'Intro', type: 'textarea', rows: 2 }, { k: 'hours', label: 'Support hours' }] },
      { title: '404 page', path: ['pages', 'notFound'], fields: [{ k: 'title', label: 'Title' }, { k: 'sub', label: 'Text' }] },
    ],
  },
  footer: {
    title: 'Footer & banner', icon: Footprints, group: 'Content',
    sections: [
      { title: 'Top banner', path: ['banner'], fields: [{ k: 'show', label: 'Show banner', type: 'toggle', span: 'full' }, { k: 'text', label: 'Text (desktop)', type: 'textarea', rows: 2 }, { k: 'short', label: 'Text (mobile)', span: 'full' }] },
      { title: 'Footer', path: ['footer'], fields: [
        { k: 'about', label: 'About', type: 'textarea', rows: 2 }, { k: 'hours', label: 'Hours line', span: 'full' }, { k: 'legal', label: 'Legal line', type: 'textarea', rows: 2 },
        { k: 'columns', label: 'Link columns', type: 'list', item: 'column', fields: [{ k: 'title', label: 'Column title', span: 'full' }, { k: 'links', label: 'Links', type: 'list', item: 'link', fields: [{ k: 'label', label: 'Label' }, { k: 'to', label: 'Goes to', type: 'select', options: ROUTES }] }] },
      ] },
    ],
  },
  coverage: {
    title: 'Coverage & upsells', icon: MapIcon, group: 'Locations',
    sections: [
      { title: 'Not delivering to', path: [], fields: [{ k: 'outOfZone', label: 'Named on the address form as outside every zone', type: 'tags' }] },
      { title: 'Cart upsell', path: [], fields: [{ k: 'upsell', label: 'Suggested in the cart, in this order', type: 'multi', options: products }] },
    ],
  },
  settings: {
    title: 'Settings', icon: Settings2, group: 'System', sub: 'Brand, ordering rules and site status.',
    sections: [
      { title: 'Brand & SEO', path: ['settings'], fields: [
        { k: 'brandName', label: 'Brand name (logo)' }, { k: 'siteTitle', label: 'Browser title suffix' },
        { k: 'primary', label: 'Primary colour', type: 'color', hint: 'Navigation, links, selected states.' }, { k: 'accent', label: 'Action colour', type: 'color', hint: 'The main button on each screen.' },
        { k: 'seoDescription', label: 'Search description', type: 'textarea', rows: 2 },
      ] },
      { title: 'Ordering rules', path: ['settings'], fields: [
        { k: 'deliveryFee', label: 'Delivery fee', type: 'money' }, { k: 'freeDeliveryOver', label: 'Free delivery over', type: 'money' },
        { k: 'minDeliveryOrder', label: 'Minimum delivery order', type: 'money' }, { k: 'maxToppings', label: 'Max extra toppings', type: 'number', min: 0, max: 10 },
        { k: 'heroRotateMs', label: 'Hero carousel speed (ms)', type: 'number', step: 500, min: 2000 },
      ] },
      { title: 'Site status', path: ['settings'], fields: [{ k: 'maintenance', label: 'Maintenance mode (shop shows a “back shortly” page)', type: 'toggle', span: 'full' }, { k: 'maintenanceMessage', label: 'Message', type: 'textarea', rows: 2 }] },
    ],
  },
};

/* ---------- sidebar ---------- */
export const NAV = [
  { group: 'Overview', items: [{ to: '', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  { group: 'Sales', items: [{ to: 'orders', label: 'Orders', icon: Bike }, { to: 'customers', label: 'Customers', icon: Users }] },
  ...['Catalogue', 'Marketing', 'Locations', 'Content', 'System'].map((group) => ({
    group,
    items: [
      ...Object.entries(RESOURCES).filter(([, r]) => r.group === group).map(([id, r]) => ({ to: `r/${id}`, label: r.title, icon: r.icon })),
      ...Object.entries(FORMS).filter(([, f]) => f.group === group).map(([id, f]) => ({ to: `f/${id}`, label: f.title, icon: f.icon })),
      ...(group === 'System' ? [{ to: 'publish', label: 'Publish & versions', icon: CloudUpload }] : []),
    ],
  })),
];
