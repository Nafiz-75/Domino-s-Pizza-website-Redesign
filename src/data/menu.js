/* Menu, pricing rules and store network.
   Product names and photos follow the earlier concept; prices, stores and
   delivery zones are illustrative prototype data. In production this file is
   replaced by the menu / store API (see README → Integration points). */

const img = (name) => `${import.meta.env.BASE_URL}img/${name}.webp`;

export const SIZES = [
  { id: 'personal', label: 'Personal', inch: 7, serves: '1', factor: 0.55 },
  { id: 'medium', label: 'Medium', inch: 10, serves: '2', factor: 1 },
  { id: 'large', label: 'Large', inch: 13, serves: '3–4', factor: 1.45 },
];

export const CRUSTS = [
  { id: 'tossed', label: 'Hand Tossed', delta: 0, note: 'Soft in the middle, crisp at the rim.' },
  { id: 'thin', label: 'Wheat Thin', delta: 0, note: 'Rolled thin and baked longer.' },
  { id: 'pan', label: 'Fresh Pan', delta: 80, note: 'Deep base with a fried edge.', notOn: ['personal'] },
  { id: 'burst', label: 'Cheese Burst', delta: 150, note: 'Cheese sealed inside the base.', notOn: ['personal'] },
];

export const TOPPINGS = [
  { id: 'xcheese', label: 'Extra cheese', veg: true, price: 90 },
  { id: 'mushroom', label: 'Mushroom', veg: true, price: 60 },
  { id: 'onion', label: 'Onion', veg: true, price: 50 },
  { id: 'capsicum', label: 'Capsicum', veg: true, price: 50 },
  { id: 'jalapeno', label: 'Jalapeño', veg: true, price: 60 },
  { id: 'olive', label: 'Black olive', veg: true, price: 60 },
  { id: 'paneer', label: 'Paneer', veg: true, price: 80 },
  { id: 'chicken', label: 'Grilled chicken', veg: false, price: 110 },
  { id: 'sausage', label: 'Chicken sausage', veg: false, price: 100 },
  { id: 'pepperoni', label: 'Beef pepperoni', veg: false, price: 120 },
];
export const MAX_TOPPINGS = 5;

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'pizza', label: 'Pizzas' },
  { id: 'combo', label: 'Combos' },
  { id: 'side', label: 'Sides' },
  { id: 'dessert', label: 'Desserts' },
  { id: 'drink', label: 'Drinks' },
];

/* price = Medium price for pizzas */
const RAW = [
  { id: 'margherita', kind: 'pizza', name: 'Margherita', veg: true, price: 549, rating: 4.5, pop: 4, tags: ['Classic'], photo: 'menu_hand-tossed-pizza_2024_01', desc: 'Vine tomato sauce, 100% mozzarella and fresh basil. Nothing to hide behind.', kcal: 195, allergens: ['Gluten', 'Milk'], spice: 0 },
  { id: 'farmhouse', kind: 'pizza', name: 'Farmhouse', veg: true, price: 849, rating: 4.6, pop: 3, tags: ['Bestseller'], photo: 'menu_tc-pizza_pacific-veggie_2023-05', desc: 'Onion, capsicum, button mushroom and fresh tomato, loaded on.', kcal: 215, allergens: ['Gluten', 'Milk'], spice: 1 },
  { id: 'paprika', kind: 'pizza', name: 'Peppy Paprika', veg: true, price: 789, rating: 4.4, pop: 5, tags: ['Spicy'], photo: 'specialty-pizzas', desc: 'Crisp capsicum, paneer, jalapeño and a real paprika kick.', kcal: 205, allergens: ['Gluten', 'Milk'], spice: 2 },
  { id: 'greenwave', kind: 'pizza', name: 'Mexican Green Wave', veg: true, price: 819, rating: 4.3, pop: 6, tags: ['Spicy'], photo: 'menu_variety_2024_02', desc: 'Jalapeño, capsicum and onion under a Mexican herb dusting.', kcal: 208, allergens: ['Gluten', 'Milk'], spice: 3 },
  { id: 'dominator', kind: 'pizza', name: 'Chicken Dominator', veg: false, price: 1090, rating: 4.8, pop: 1, tags: ['Bestseller'], photo: 'menu_specialty-pizza_2024_01', desc: 'Grilled chicken, chicken sausage, peri-peri chicken and onion. No room left over.', kcal: 268, allergens: ['Gluten', 'Milk'], spice: 2 },
  { id: 'pepperoni', kind: 'pizza', name: 'Cheese Burst Pepperoni', veg: false, price: 990, rating: 4.7, pop: 2, tags: ['New'], photo: 'menu_handmade-pan-pizza_2024_01', desc: 'Beef pepperoni and black olive on a molten cheese-burst base.', kcal: 295, allergens: ['Gluten', 'Milk'], spice: 1 },

  { id: 'familybox', kind: 'combo', name: 'Dhaka Family Box', veg: false, price: 1990, rating: 4.7, pop: 7, tags: ['Saves ৳510'], photo: 'menu_variety_2024_02', desc: 'Two large pizzas, 8 wings, garlic bread sticks and two 500 ml drinks.', kcal: 0, allergens: ['Gluten', 'Milk'] },
  { id: 'duobox', kind: 'combo', name: 'Two Medium Deal', veg: false, price: 1499, rating: 4.5, pop: 8, tags: ['Tue–Thu'], photo: 'new-york-style-pizza_1', desc: 'Any two medium hand-tossed pizzas for one price.', kcal: 0, allergens: ['Gluten', 'Milk'] },
  { id: 'stuffedfeast', kind: 'combo', name: 'Stuffed Crust Feast', veg: false, price: 1690, rating: 4.6, pop: 12, tags: [], photo: 'PSC_01', desc: 'Large parmesan stuffed crust, stuffed cheesy bread and a lava cake.', kcal: 0, allergens: ['Gluten', 'Milk', 'Egg'] },

  { id: 'wings', kind: 'side', name: 'Peri-Peri Wings (8)', veg: false, price: 460, rating: 4.5, pop: 9, tags: ['Spicy'], photo: 'menu_chicken-wings_2024_01', desc: 'Eight pieces, baked rather than fried, tossed in peri-peri butter.', kcal: 88, allergens: ['Milk'], spice: 2 },
  { id: 'cheesybread', kind: 'side', name: 'Stuffed Cheesy Bread', veg: true, price: 390, rating: 4.7, pop: 10, tags: ['Bestseller'], photo: 'menu_scb_pepperoni-scb_close-up', desc: 'Mozzarella sealed inside the dough, garlic butter on top. Eight strips.', kcal: 142, allergens: ['Gluten', 'Milk'] },
  { id: 'breadsticks', kind: 'side', name: 'Garlic Bread Sticks', veg: true, price: 260, rating: 4.4, pop: 11, tags: [], photo: 'menu_bread-bites_01', desc: 'Soft sticks brushed twice with garlic butter, marinara dip on the side.', kcal: 96, allergens: ['Gluten', 'Milk'] },
  { id: 'loaded', kind: 'side', name: 'Loaded Chicken Bake', veg: false, price: 520, rating: 4.3, pop: 14, tags: [], photo: 'spicy-chicken-bacon-ranch_01', desc: 'Crust base, ranch, pulled chicken and melted mozzarella.', kcal: 158, allergens: ['Gluten', 'Milk', 'Egg'] },
  { id: 'mac', kind: 'side', name: 'Five Cheese Mac', veg: true, price: 420, rating: 4.2, pop: 15, tags: [], photo: 'five-cheese-mac-and-cheese', desc: 'Baked penne under five cheeses and a toasted crumb top.', kcal: 174, allergens: ['Gluten', 'Milk'] },
  { id: 'salad', kind: 'side', name: 'Garden Salad', veg: true, price: 290, rating: 4.0, pop: 18, tags: [], photo: 'menu_salads', desc: 'Leaves, cherry tomato, carrot and red onion with vinaigrette.', kcal: 62, allergens: ['Mustard'] },

  { id: 'lava', kind: 'dessert', name: 'Choco Lava Cake (2)', veg: true, price: 250, rating: 4.8, pop: 13, tags: ['Bestseller'], photo: 'menu_chocolate-lava-crunch-cakes_2026_02', desc: 'Two cakes with a crisp shell and a warm molten centre.', kcal: 350, allergens: ['Gluten', 'Milk', 'Egg', 'Soy'] },
  { id: 'brownie', kind: 'dessert', name: 'Marbled Cookie Brownie', veg: true, price: 320, rating: 4.6, pop: 16, tags: ['New'], photo: 'menu_marbled-cookie-brownie', desc: 'Cookie dough and brownie baked in one tin, cut into nine.', kcal: 210, allergens: ['Gluten', 'Milk', 'Egg', 'Soy'] },

  { id: 'coke', kind: 'drink', name: 'Coca-Cola 500 ml', veg: true, price: 60, rating: 4.6, pop: 17, tags: [], swatch: ['#c8102e', '#7a0a1c'], desc: 'Chilled bottle.', kcal: 210, allergens: [] },
  { id: 'sprite', kind: 'drink', name: 'Sprite 500 ml', veg: true, price: 60, rating: 4.5, pop: 19, tags: [], swatch: ['#1f8a4c', '#0b4a29'], desc: 'Chilled bottle.', kcal: 200, allergens: [] },
  { id: 'water', kind: 'drink', name: 'Mineral Water 500 ml', veg: true, price: 25, rating: 4.4, pop: 20, tags: [], swatch: ['#0b78ad', '#003e5c'], desc: 'Still water.', kcal: 0, allergens: [] },
];

export const PRODUCTS = RAW.map((p) => ({ ...p, image: p.photo ? img(p.photo) : null }));
export const PRODUCT = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
export const HERO_PIZZAS = PRODUCTS.filter((p) => p.kind === 'pizza');
export const UPSELL = ['breadsticks', 'lava', 'wings', 'coke'];

export const round10 = (n) => Math.round(n / 10) * 10;

/** Unit price of a configured line. */
export function unitPrice(product, opts = {}) {
  if (product.kind !== 'pizza') return product.price;
  const size = SIZES.find((s) => s.id === (opts.size || 'medium'));
  const crust = CRUSTS.find((c) => c.id === (opts.crust || 'tossed'));
  const base = round10(product.price * size.factor);
  const crustDelta = round10(crust.delta * size.factor);
  const tops = (opts.toppings || []).reduce((s, id) => s + (TOPPINGS.find((t) => t.id === id)?.price || 0), 0);
  return base + crustDelta + round10(tops * size.factor);
}

export function describeOptions(product, opts = {}) {
  if (product.kind !== 'pizza') return '';
  const size = SIZES.find((s) => s.id === (opts.size || 'medium'));
  const crust = CRUSTS.find((c) => c.id === (opts.crust || 'tossed'));
  const tops = (opts.toppings || []).map((id) => TOPPINGS.find((t) => t.id === id)?.label).filter(Boolean);
  return [`${size.label} ${size.inch}"`, crust.label, tops.length ? `+ ${tops.join(', ')}` : ''].filter(Boolean).join(' · ');
}

/* ---------- Offers & coupons ---------- */

export const OFFERS = [
  { id: 'duo', kicker: 'Tuesday to Thursday', title: 'Two medium pizzas, ৳1,499', sub: 'Any two from the pizza menu, hand tossed, one price.', code: 'DUO1499', image: img('new-york-style-pizza_1'), go: 'duobox' },
  { id: 'welcome', kicker: 'New here?', title: '৳150 off your first order', sub: 'Create an account and use the code on any order over ৳800.', code: 'WELCOME150', image: img('menu_specialty-pizza_2024_01'), go: 'dominator' },
  { id: 'lava', kicker: 'While stocks last', title: 'Lava cake ৳99 with any large', sub: 'Add a Choco Lava Cake to any large pizza and it drops from ৳250 to ৳99.', code: 'LAVA99', image: img('menu_chocolate-lava-crunch-cakes_2026_02'), go: 'lava' },
];

export const FREE_DELIVERY_OVER = 799;
export const DELIVERY_FEE = 60;
export const MIN_DELIVERY_ORDER = 300;

/** Each rule returns { ok, discount, freeDelivery, message }. */
export const COUPONS = {
  DUO1499: {
    label: 'Two medium pizzas for ৳1,499',
    check({ lines, now }) {
      const day = now.getDay();
      if (![2, 3, 4].includes(day)) return { ok: false, message: 'DUO1499 works Tuesday to Thursday.' };
      const mediums = lines.flatMap((l) => (l.product.kind === 'pizza' && l.opts.size === 'medium' ? Array(l.qty).fill(l.unit) : []));
      if (mediums.length < 2) return { ok: false, message: 'Add two medium pizzas to use DUO1499.' };
      const top2 = mediums.sort((a, b) => b - a).slice(0, 2);
      const discount = Math.max(0, top2[0] + top2[1] - 1499);
      if (!discount) return { ok: false, message: 'Your two mediums already cost less than ৳1,499.' };
      return { ok: true, discount, message: 'Two mediums for ৳1,499 applied.' };
    },
  },
  WELCOME150: {
    label: '৳150 off your first order',
    check({ subtotal, user, orderCount }) {
      if (!user) return { ok: false, message: 'Sign in to use WELCOME150. It is for new accounts.' };
      if (orderCount > 0) return { ok: false, message: 'WELCOME150 is for your first order only.' };
      if (subtotal < 800) return { ok: false, message: `Add ৳${800 - subtotal} more to use WELCOME150.` };
      return { ok: true, discount: 150, message: '৳150 off your first order.' };
    },
  },
  LAVA99: {
    label: 'Lava cake ৳99 with a large',
    check({ lines }) {
      const large = lines.some((l) => l.product.kind === 'pizza' && l.opts.size === 'large');
      const lava = lines.find((l) => l.product.id === 'lava');
      if (!large || !lava) return { ok: false, message: 'Needs a large pizza and a Choco Lava Cake in the cart.' };
      return { ok: true, discount: 151, message: 'Lava cake down to ৳99.' };
    },
  },
  CAMPUS20: {
    label: '20% off on Student Wednesday',
    check({ subtotal, now }) {
      if (now.getDay() !== 3) return { ok: false, message: 'CAMPUS20 works on Wednesdays. Show a student ID at the door.' };
      return { ok: true, discount: Math.round(subtotal * 0.2), message: '20% off. Keep your student ID handy.' };
    },
  },
  FREEDEL: {
    label: 'Free delivery',
    check({ mode }) {
      if (mode !== 'delivery') return { ok: false, message: 'FREEDEL is for delivery orders.' };
      return { ok: true, discount: 0, freeDelivery: true, message: 'Delivery fee removed.' };
    },
  },
};

/* ---------- Store network & delivery zones (illustrative) ---------- */

export const STORES = [
  { id: 'dhn', name: 'Dhanmondi 27', address: 'House 52, Road 27 (old), Dhanmondi, Dhaka 1209', phone: '09610-001001', lat: 23.7539, lng: 90.3755, open: '11:00', close: '23:30' },
  { id: 'gul', name: 'Gulshan 2', address: 'Plot 9, Gulshan Avenue, Gulshan 2, Dhaka 1212', phone: '09610-001002', lat: 23.7946, lng: 90.4143, open: '11:00', close: '00:00' },
  { id: 'ban', name: 'Banani 11', address: 'House 61, Road 11, Banani, Dhaka 1213', phone: '09610-001003', lat: 23.7937, lng: 90.4043, open: '11:00', close: '23:30' },
  { id: 'utt', name: 'Uttara Sector 7', address: 'House 18, Sonargaon Janapath, Sector 7, Uttara, Dhaka 1230', phone: '09610-001004', lat: 23.8737, lng: 90.3925, open: '11:00', close: '23:00' },
  { id: 'mir', name: 'Mirpur 10', address: 'Begum Rokeya Sarani, Mirpur 10, Dhaka 1216', phone: '09610-001005', lat: 23.8069, lng: 90.3687, open: '11:00', close: '23:00' },
  { id: 'bsh', name: 'Bashundhara R/A', address: 'Block C, Road 2, Bashundhara R/A, Dhaka 1229', phone: '09610-001006', lat: 23.8150, lng: 90.4268, open: '11:00', close: '23:30' },
];

export const AREAS = [
  { id: 'dhanmondi', name: 'Dhanmondi', store: 'dhn', eta: 25, lat: 23.7465, lng: 90.376 },
  { id: 'lalmatia', name: 'Lalmatia', store: 'dhn', eta: 28, lat: 23.755, lng: 90.37 },
  { id: 'mohammadpur', name: 'Mohammadpur', store: 'dhn', eta: 32, lat: 23.7662, lng: 90.3589 },
  { id: 'kalabagan', name: 'Kalabagan', store: 'dhn', eta: 27, lat: 23.7495, lng: 90.3845 },
  { id: 'gulshan1', name: 'Gulshan 1', store: 'gul', eta: 24, lat: 23.7808, lng: 90.4167 },
  { id: 'gulshan2', name: 'Gulshan 2', store: 'gul', eta: 22, lat: 23.7946, lng: 90.4143 },
  { id: 'baridhara', name: 'Baridhara', store: 'gul', eta: 26, lat: 23.8035, lng: 90.4205 },
  { id: 'niketan', name: 'Niketan', store: 'gul', eta: 28, lat: 23.7726, lng: 90.4082 },
  { id: 'banani', name: 'Banani', store: 'ban', eta: 22, lat: 23.7937, lng: 90.4043 },
  { id: 'mohakhali', name: 'Mohakhali', store: 'ban', eta: 28, lat: 23.7781, lng: 90.3984 },
  { id: 'tejgaon', name: 'Tejgaon', store: 'ban', eta: 32, lat: 23.7639, lng: 90.3925 },
  { id: 'uttara', name: 'Uttara', store: 'utt', eta: 25, lat: 23.8759, lng: 90.3795 },
  { id: 'airport', name: 'Airport / Khilkhet', store: 'utt', eta: 33, lat: 23.8297, lng: 90.4196 },
  { id: 'mirpur', name: 'Mirpur', store: 'mir', eta: 28, lat: 23.8223, lng: 90.3654 },
  { id: 'pallabi', name: 'Pallabi', store: 'mir', eta: 32, lat: 23.8285, lng: 90.3635 },
  { id: 'kafrul', name: 'Kafrul', store: 'mir', eta: 30, lat: 23.7898, lng: 90.3858 },
  { id: 'bashundhara', name: 'Bashundhara R/A', store: 'bsh', eta: 24, lat: 23.8193, lng: 90.4526 },
  { id: 'badda', name: 'Badda', store: 'bsh', eta: 30, lat: 23.7806, lng: 90.4261 },
  { id: 'nadda', name: 'Nadda / Kuril', store: 'bsh', eta: 28, lat: 23.8167, lng: 90.4214 },
];

export const OUT_OF_ZONE = ['Motijheel', 'Old Dhaka', 'Jatrabari', 'Keraniganj', 'Savar', 'Narayanganj'];

export const storeById = (id) => STORES.find((s) => s.id === id);
export const areaById = (id) => AREAS.find((a) => a.id === id);

export function nearestArea(lat, lng) {
  let best = null, bestD = Infinity;
  for (const a of AREAS) {
    const d = Math.hypot(a.lat - lat, (a.lng - lng) * Math.cos((lat * Math.PI) / 180));
    if (d < bestD) { bestD = d; best = a; }
  }
  /* ~0.045° ≈ 5 km: beyond that, treat as outside every zone */
  return bestD < 0.045 ? best : null;
}

export function isStoreOpen(store, at = new Date()) {
  const [oh, om] = store.open.split(':').map(Number);
  const [ch, cm] = store.close.split(':').map(Number);
  const mins = at.getHours() * 60 + at.getMinutes();
  const open = oh * 60 + om;
  const close = ch === 0 ? 24 * 60 : ch * 60 + cm;
  return mins >= open && mins < close;
}

export const REVIEWS = [
  { name: 'Nabila R.', where: 'Chicken Dominator · Dhanmondi', text: 'Ordered at 8:40 on a Thursday, box was at the gate by 9:05 and the base was still crisp underneath.' },
  { name: 'Tanvir H.', where: 'Peppy Paprika · Uttara', text: 'The paprika one has actual bite, not just colour. My kids took the whole thing and I had to order a second.' },
  { name: 'Sadia K.', where: 'Margherita · Banani', text: 'I keep going back to the plain Margherita. Good sauce, real mozzarella, nothing hiding behind toppings.' },
];

export const FAQ = [
  { q: 'How long does delivery take?', a: 'Most orders inside a store zone arrive in 22–35 minutes. The checkout shows the live estimate for your address before you pay.' },
  { q: 'Is there a delivery fee?', a: `Delivery is ৳${DELIVERY_FEE}, and free on orders over ৳${FREE_DELIVERY_OVER}. The minimum delivery order is ৳${MIN_DELIVERY_ORDER}.` },
  { q: 'How can I pay?', a: 'Cash on delivery, bKash, Nagad, or a Visa / Mastercard / Amex card through a secure payment gateway.' },
  { q: 'Can I change or cancel an order?', a: 'You can cancel from the tracking page until the store starts making it. After that, call the store and they will help.' },
  { q: 'Something was wrong with my order.', a: 'Open the order in your account and tap “Report a problem”, or call the store that made it. Refunds go back to the original payment method within 3–7 working days.' },
];
