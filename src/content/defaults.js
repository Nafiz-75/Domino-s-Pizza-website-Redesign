/* Every editable piece of the public site, as plain data.
   The admin dashboard edits a copy of this object; the site renders whatever
   version is published (see ./store.js). Prices, stores, zones and reviews
   are illustrative prototype data.
   Text fields may use {deliveryFee}, {freeOver}, {minOrder}, {storeCount}. */

export const DEFAULT_CONTENT = {
  settings: {
    brandName: 'Domino’s',
    siteTitle: 'Domino’s Bangladesh (concept)',
    seoDescription: 'An unofficial, end-to-end redesign concept for Domino’s Pizza Bangladesh: menu, pizza builder, accounts, delivery addresses, checkout and live order tracking.',
    primary: '#006491',
    accent: '#e31837',
    deliveryFee: 60,
    freeDeliveryOver: 799,
    minDeliveryOrder: 300,
    maxToppings: 5,
    heroRotateMs: 4500,
    maintenance: false,
    maintenanceMessage: 'We’re updating the menu. Back in a few minutes.',
  },

  banner: {
    show: true,
    text: 'Unofficial redesign concept for Domino’s Bangladesh. Orders, payments and accounts are simulated and stay in this browser.',
    short: 'Unofficial concept · demo orders & accounts only',
  },

  nav: [
    { id: 'menu', to: '/menu', label: 'Menu', show: true },
    { id: 'deals', to: '/deals', label: 'Deals', show: true },
    { id: 'stores', to: '/stores', label: 'Stores', show: true },
    { id: 'track', to: '/track', label: 'Track order', show: true },
  ],

  home: {
    sections: [
      { id: 'hero', label: 'Hero carousel', show: true },
      { id: 'offers', label: 'Deals', show: true },
      { id: 'categories', label: 'Categories', show: true },
      { id: 'popular', label: 'Bestsellers', show: true },
      { id: 'how', label: 'How it works', show: true },
      { id: 'reviews', label: 'Reviews', show: true },
    ],
    hero: {
      kicker: 'গরম, তাজা, ৩০ মিনিটে',
      title: 'Hot, fresh,\nat your door\nin 30 minutes.',
      sub: 'Hand-stretched dough, sauce from vine tomatoes and 100% mozzarella. Order for delivery across Dhaka, or pick up on your way home.',
      ctaDelivery: 'Order delivery',
      ctaCarryout: 'Carryout',
      bullets: [
        { id: 'b1', icon: 'Timer', text: 'Live delivery estimate' },
        { id: 'b2', icon: 'MapPin', text: '{storeCount} stores across Dhaka' },
        { id: 'b3', icon: 'Flame', text: 'Baked at 250 °C' },
      ],
      pizzas: [], // empty = every pizza
    },
    offers: { eyebrow: 'This week', title: 'Deals worth ordering for' },
    categories: { title: 'What are you in the mood for?' },
    popular: { eyebrow: 'Most ordered in Dhaka', title: 'Bestsellers', count: 8 },
    how: {
      eyebrow: 'How ordering works',
      title: 'Three taps from hungry to handed over',
      steps: [
        { id: 's1', icon: 'MapPin', title: 'Tell us where', text: 'Add your address once. We match it to the nearest store and show a real delivery time.' },
        { id: 's2', icon: 'ChefHat', title: 'We make it fresh', text: 'Your ticket hits the make-line instantly. Dough is stretched and topped to order.' },
        { id: 's3', icon: 'Bike', title: 'Watch it arrive', text: 'Follow each step live, from oven to rider to your door, with a heat-locked bag.' },
      ],
    },
    reviews: { eyebrow: 'Reviews', title: 'What Dhaka says', score: '4.6', note: '/ 5 from 8,430 rated orders (sample data)' },
  },

  pages: {
    menu: { eyebrow: 'Menu', title: 'See it, then order it', sub: 'Every pizza can be resized, re-crusted and topped your way. Prices are for Medium unless noted.' },
    deals: { eyebrow: 'Deals', title: 'Offers and promo codes', sub: 'Codes are checked in your cart. If an order doesn’t qualify yet, the cart tells you exactly what’s missing.' },
    stores: { eyebrow: 'Stores', title: 'Find a Domino’s near you', sub: 'Every store delivers to the areas around it and takes carryout orders. Store list is illustrative.' },
    help: { eyebrow: 'Help', title: 'How can we help?', sub: 'Answers to the usual questions, and a direct line to a person if they don’t cover it.', hours: '11:00 – 23:30 daily' },
    nutrition: { eyebrow: 'Nutrition', title: 'Nutrition & allergens', sub: 'Energy per slice for Medium hand-tossed pizzas, per portion for everything else. Prototype figures — the real table comes from the product spec sheets.' },
    notFound: { title: 'This page went out for delivery', sub: 'and didn’t come back. Let’s get you to something hot.' },
  },

  footer: {
    about: 'Hot, fresh pizza across Dhaka. Order online for delivery in about 30 minutes, or pick up from your nearest store.',
    hours: 'Store hours 11:00 – 23:30 · Prices include VAT',
    legal: 'Unofficial portfolio concept — not affiliated with or endorsed by Domino’s. Domino’s® name and marks belong to Domino’s IP Holder LLC. Prices, stores and offers shown are illustrative.',
    columns: [
      { id: 'order', title: 'Order', links: [{ id: 'l1', label: 'Menu', to: '/menu' }, { id: 'l2', label: 'Deals', to: '/deals' }, { id: 'l3', label: 'Track an order', to: '/track' }, { id: 'l4', label: 'Find a store', to: '/stores' }] },
      { id: 'account', title: 'Account', links: [{ id: 'l1', label: 'Sign in', to: '/signin' }, { id: 'l2', label: 'Create account', to: '/signup' }, { id: 'l3', label: 'My orders', to: '/account/orders' }, { id: 'l4', label: 'Saved addresses', to: '/account/addresses' }] },
      { id: 'help', title: 'Help', links: [{ id: 'l1', label: 'FAQ & contact', to: '/help' }, { id: 'l2', label: 'Nutrition & allergens', to: '/legal/nutrition' }, { id: 'l3', label: 'Refund policy', to: '/legal/refunds' }, { id: 'l4', label: 'Terms', to: '/legal/terms' }, { id: 'l5', label: 'Privacy', to: '/legal/privacy' }] },
    ],
  },

  categories: [
    { id: 'pizza', label: 'Pizzas', show: true },
    { id: 'combo', label: 'Combos', show: true },
    { id: 'side', label: 'Sides', show: true },
    { id: 'dessert', label: 'Desserts', show: true },
    { id: 'drink', label: 'Drinks', show: true },
  ],

  sizes: [
    { id: 'personal', label: 'Personal', inch: 7, serves: '1', factor: 0.55 },
    { id: 'medium', label: 'Medium', inch: 10, serves: '2', factor: 1 },
    { id: 'large', label: 'Large', inch: 13, serves: '3–4', factor: 1.45 },
  ],

  crusts: [
    { id: 'tossed', label: 'Hand Tossed', delta: 0, note: 'Soft in the middle, crisp at the rim.', notOn: [] },
    { id: 'thin', label: 'Wheat Thin', delta: 0, note: 'Rolled thin and baked longer.', notOn: [] },
    { id: 'pan', label: 'Fresh Pan', delta: 80, note: 'Deep base with a fried edge.', notOn: ['personal'] },
    { id: 'burst', label: 'Cheese Burst', delta: 150, note: 'Cheese sealed inside the base.', notOn: ['personal'] },
  ],

  toppings: [
    { id: 'xcheese', label: 'Extra cheese', veg: true, price: 90, show: true },
    { id: 'mushroom', label: 'Mushroom', veg: true, price: 60, show: true },
    { id: 'onion', label: 'Onion', veg: true, price: 50, show: true },
    { id: 'capsicum', label: 'Capsicum', veg: true, price: 50, show: true },
    { id: 'jalapeno', label: 'Jalapeño', veg: true, price: 60, show: true },
    { id: 'olive', label: 'Black olive', veg: true, price: 60, show: true },
    { id: 'paneer', label: 'Paneer', veg: true, price: 80, show: true },
    { id: 'chicken', label: 'Grilled chicken', veg: false, price: 110, show: true },
    { id: 'sausage', label: 'Chicken sausage', veg: false, price: 100, show: true },
    { id: 'pepperoni', label: 'Beef pepperoni', veg: false, price: 120, show: true },
  ],

  /* price = Medium price for pizzas. image: path under public/, a URL, or an uploaded data URL */
  products: [
    { id: 'margherita', kind: 'pizza', name: 'Margherita', veg: true, price: 549, rating: 4.5, pop: 4, tags: ['Classic'], image: 'img/menu_hand-tossed-pizza_2024_01.webp', desc: 'Vine tomato sauce, 100% mozzarella and fresh basil. Nothing to hide behind.', kcal: 195, allergens: ['Gluten', 'Milk'], spice: 0 },
    { id: 'farmhouse', kind: 'pizza', name: 'Farmhouse', veg: true, price: 849, rating: 4.6, pop: 3, tags: ['Bestseller'], image: 'img/menu_tc-pizza_pacific-veggie_2023-05.webp', desc: 'Onion, capsicum, button mushroom and fresh tomato, loaded on.', kcal: 215, allergens: ['Gluten', 'Milk'], spice: 1 },
    { id: 'paprika', kind: 'pizza', name: 'Peppy Paprika', veg: true, price: 789, rating: 4.4, pop: 5, tags: ['Spicy'], image: 'img/specialty-pizzas.webp', desc: 'Crisp capsicum, paneer, jalapeño and a real paprika kick.', kcal: 205, allergens: ['Gluten', 'Milk'], spice: 2 },
    { id: 'greenwave', kind: 'pizza', name: 'Mexican Green Wave', veg: true, price: 819, rating: 4.3, pop: 6, tags: ['Spicy'], image: 'img/menu_variety_2024_02.webp', desc: 'Jalapeño, capsicum and onion under a Mexican herb dusting.', kcal: 208, allergens: ['Gluten', 'Milk'], spice: 3 },
    { id: 'dominator', kind: 'pizza', name: 'Chicken Dominator', veg: false, price: 1090, rating: 4.8, pop: 1, tags: ['Bestseller'], image: 'img/menu_specialty-pizza_2024_01.webp', desc: 'Grilled chicken, chicken sausage, peri-peri chicken and onion. No room left over.', kcal: 268, allergens: ['Gluten', 'Milk'], spice: 2 },
    { id: 'pepperoni', kind: 'pizza', name: 'Cheese Burst Pepperoni', veg: false, price: 990, rating: 4.7, pop: 2, tags: ['New'], image: 'img/menu_handmade-pan-pizza_2024_01.webp', desc: 'Beef pepperoni and black olive on a molten cheese-burst base.', kcal: 295, allergens: ['Gluten', 'Milk'], spice: 1 },
    { id: 'familybox', kind: 'combo', name: 'Dhaka Family Box', veg: false, price: 1990, rating: 4.7, pop: 7, tags: ['Saves ৳510'], image: 'img/menu_variety_2024_02.webp', desc: 'Two large pizzas, 8 wings, garlic bread sticks and two 500 ml drinks.', kcal: 0, allergens: ['Gluten', 'Milk'] },
    { id: 'duobox', kind: 'combo', name: 'Two Medium Deal', veg: false, price: 1499, rating: 4.5, pop: 8, tags: ['Tue–Thu'], image: 'img/new-york-style-pizza_1.webp', desc: 'Any two medium hand-tossed pizzas for one price.', kcal: 0, allergens: ['Gluten', 'Milk'] },
    { id: 'stuffedfeast', kind: 'combo', name: 'Stuffed Crust Feast', veg: false, price: 1690, rating: 4.6, pop: 12, tags: [], image: 'img/PSC_01.webp', desc: 'Large parmesan stuffed crust, stuffed cheesy bread and a lava cake.', kcal: 0, allergens: ['Gluten', 'Milk', 'Egg'] },
    { id: 'wings', kind: 'side', name: 'Peri-Peri Wings (8)', veg: false, price: 460, rating: 4.5, pop: 9, tags: ['Spicy'], image: 'img/menu_chicken-wings_2024_01.webp', desc: 'Eight pieces, baked rather than fried, tossed in peri-peri butter.', kcal: 88, allergens: ['Milk'], spice: 2 },
    { id: 'cheesybread', kind: 'side', name: 'Stuffed Cheesy Bread', veg: true, price: 390, rating: 4.7, pop: 10, tags: ['Bestseller'], image: 'img/menu_scb_pepperoni-scb_close-up.webp', desc: 'Mozzarella sealed inside the dough, garlic butter on top. Eight strips.', kcal: 142, allergens: ['Gluten', 'Milk'] },
    { id: 'breadsticks', kind: 'side', name: 'Garlic Bread Sticks', veg: true, price: 260, rating: 4.4, pop: 11, tags: [], image: 'img/menu_bread-bites_01.webp', desc: 'Soft sticks brushed twice with garlic butter, marinara dip on the side.', kcal: 96, allergens: ['Gluten', 'Milk'] },
    { id: 'loaded', kind: 'side', name: 'Loaded Chicken Bake', veg: false, price: 520, rating: 4.3, pop: 14, tags: [], image: 'img/spicy-chicken-bacon-ranch_01.webp', desc: 'Crust base, ranch, pulled chicken and melted mozzarella.', kcal: 158, allergens: ['Gluten', 'Milk', 'Egg'] },
    { id: 'mac', kind: 'side', name: 'Five Cheese Mac', veg: true, price: 420, rating: 4.2, pop: 15, tags: [], image: 'img/five-cheese-mac-and-cheese.webp', desc: 'Baked penne under five cheeses and a toasted crumb top.', kcal: 174, allergens: ['Gluten', 'Milk'] },
    { id: 'salad', kind: 'side', name: 'Garden Salad', veg: true, price: 290, rating: 4.0, pop: 18, tags: [], image: 'img/menu_salads.webp', desc: 'Leaves, cherry tomato, carrot and red onion with vinaigrette.', kcal: 62, allergens: ['Mustard'] },
    { id: 'lava', kind: 'dessert', name: 'Choco Lava Cake (2)', veg: true, price: 250, rating: 4.8, pop: 13, tags: ['Bestseller'], image: 'img/menu_chocolate-lava-crunch-cakes_2026_02.webp', desc: 'Two cakes with a crisp shell and a warm molten centre.', kcal: 350, allergens: ['Gluten', 'Milk', 'Egg', 'Soy'] },
    { id: 'brownie', kind: 'dessert', name: 'Marbled Cookie Brownie', veg: true, price: 320, rating: 4.6, pop: 16, tags: ['New'], image: 'img/menu_marbled-cookie-brownie.webp', desc: 'Cookie dough and brownie baked in one tin, cut into nine.', kcal: 210, allergens: ['Gluten', 'Milk', 'Egg', 'Soy'] },
    { id: 'coke', kind: 'drink', name: 'Coca-Cola 500 ml', veg: true, price: 60, rating: 4.6, pop: 17, tags: [], image: '', swatch: ['#c8102e', '#7a0a1c'], desc: 'Chilled bottle.', kcal: 210, allergens: [] },
    { id: 'sprite', kind: 'drink', name: 'Sprite 500 ml', veg: true, price: 60, rating: 4.5, pop: 19, tags: [], image: '', swatch: ['#1f8a4c', '#0b4a29'], desc: 'Chilled bottle.', kcal: 200, allergens: [] },
    { id: 'water', kind: 'drink', name: 'Mineral Water 500 ml', veg: true, price: 25, rating: 4.4, pop: 20, tags: [], image: '', swatch: ['#0b78ad', '#003e5c'], desc: 'Still water.', kcal: 0, allergens: [] },
  ].map((p) => ({ show: true, soldOut: false, spice: 0, swatch: null, ...p })),

  upsell: ['breadsticks', 'lava', 'wings', 'coke'],

  offers: [
    { id: 'duo', show: true, kicker: 'Tuesday to Thursday', title: 'Two medium pizzas, ৳1,499', sub: 'Any two from the pizza menu, hand tossed, one price.', code: 'DUO1499', image: 'img/new-york-style-pizza_1.webp', go: 'duobox' },
    { id: 'welcome', show: true, kicker: 'New here?', title: '৳150 off your first order', sub: 'Create an account and use the code on any order over ৳800.', code: 'WELCOME150', image: 'img/menu_specialty-pizza_2024_01.webp', go: 'dominator' },
    { id: 'lava', show: true, kicker: 'While stocks last', title: 'Lava cake ৳99 with any large', sub: 'Add a Choco Lava Cake to any large pizza and it drops from ৳250 to ৳99.', code: 'LAVA99', image: 'img/menu_chocolate-lava-crunch-cakes_2026_02.webp', go: 'lava' },
  ],

  /* Declarative promo rules, evaluated by checkCoupon() in data/menu.js.
     type: fixed (৳ value) | percent (value %) | free_delivery | bundle (bundleQty pizzas of bundleSize for ৳ value) */
  coupons: [
    { id: 'DUO1499', code: 'DUO1499', label: 'Two medium pizzas for ৳1,499', active: true, type: 'bundle', value: 1499, bundleQty: 2, bundleSize: 'medium', days: [2, 3, 4], minSubtotal: 0, mode: 'any', requiresAccount: false, firstOrderOnly: false, requiresProducts: [], requiresSize: '', expires: '' },
    { id: 'WELCOME150', code: 'WELCOME150', label: '৳150 off your first order', active: true, type: 'fixed', value: 150, bundleQty: 0, bundleSize: '', days: [], minSubtotal: 800, mode: 'any', requiresAccount: true, firstOrderOnly: true, requiresProducts: [], requiresSize: '', expires: '' },
    { id: 'LAVA99', code: 'LAVA99', label: 'Lava cake ৳99 with a large', active: true, type: 'fixed', value: 151, bundleQty: 0, bundleSize: '', days: [], minSubtotal: 0, mode: 'any', requiresAccount: false, firstOrderOnly: false, requiresProducts: ['lava'], requiresSize: 'large', expires: '' },
    { id: 'CAMPUS20', code: 'CAMPUS20', label: '20% off on Student Wednesday', active: true, type: 'percent', value: 20, bundleQty: 0, bundleSize: '', days: [3], minSubtotal: 0, mode: 'any', requiresAccount: false, firstOrderOnly: false, requiresProducts: [], requiresSize: '', expires: '' },
    { id: 'FREEDEL', code: 'FREEDEL', label: 'Free delivery', active: true, type: 'free_delivery', value: 0, bundleQty: 0, bundleSize: '', days: [], minSubtotal: 0, mode: 'delivery', requiresAccount: false, firstOrderOnly: false, requiresProducts: [], requiresSize: '', expires: '' },
  ],

  stores: [
    { id: 'dhn', show: true, name: 'Dhanmondi 27', address: 'House 52, Road 27 (old), Dhanmondi, Dhaka 1209', phone: '09610-001001', lat: 23.7539, lng: 90.3755, open: '11:00', close: '23:30' },
    { id: 'gul', show: true, name: 'Gulshan 2', address: 'Plot 9, Gulshan Avenue, Gulshan 2, Dhaka 1212', phone: '09610-001002', lat: 23.7946, lng: 90.4143, open: '11:00', close: '00:00' },
    { id: 'ban', show: true, name: 'Banani 11', address: 'House 61, Road 11, Banani, Dhaka 1213', phone: '09610-001003', lat: 23.7937, lng: 90.4043, open: '11:00', close: '23:30' },
    { id: 'utt', show: true, name: 'Uttara Sector 7', address: 'House 18, Sonargaon Janapath, Sector 7, Uttara, Dhaka 1230', phone: '09610-001004', lat: 23.8737, lng: 90.3925, open: '11:00', close: '23:00' },
    { id: 'mir', show: true, name: 'Mirpur 10', address: 'Begum Rokeya Sarani, Mirpur 10, Dhaka 1216', phone: '09610-001005', lat: 23.8069, lng: 90.3687, open: '11:00', close: '23:00' },
    { id: 'bsh', show: true, name: 'Bashundhara R/A', address: 'Block C, Road 2, Bashundhara R/A, Dhaka 1229', phone: '09610-001006', lat: 23.8150, lng: 90.4268, open: '11:00', close: '23:30' },
  ],

  areas: [
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
  ],

  outOfZone: ['Motijheel', 'Old Dhaka', 'Jatrabari', 'Keraniganj', 'Savar', 'Narayanganj'],

  reviews: [
    { id: 'r1', show: true, name: 'Nabila R.', where: 'Chicken Dominator · Dhanmondi', text: 'Ordered at 8:40 on a Thursday, box was at the gate by 9:05 and the base was still crisp underneath.' },
    { id: 'r2', show: true, name: 'Tanvir H.', where: 'Peppy Paprika · Uttara', text: 'The paprika one has actual bite, not just colour. My kids took the whole thing and I had to order a second.' },
    { id: 'r3', show: true, name: 'Sadia K.', where: 'Margherita · Banani', text: 'I keep going back to the plain Margherita. Good sauce, real mozzarella, nothing hiding behind toppings.' },
  ],

  faq: [
    { id: 'f1', show: true, q: 'How long does delivery take?', a: 'Most orders inside a store zone arrive in 22–35 minutes. The checkout shows the live estimate for your address before you pay.' },
    { id: 'f2', show: true, q: 'Is there a delivery fee?', a: 'Delivery is ৳{deliveryFee}, and free on orders over ৳{freeOver}. The minimum delivery order is ৳{minOrder}.' },
    { id: 'f3', show: true, q: 'How can I pay?', a: 'Cash on delivery, bKash, Nagad, or a Visa / Mastercard / Amex card through a secure payment gateway.' },
    { id: 'f4', show: true, q: 'Can I change or cancel an order?', a: 'You can cancel from the tracking page until the store starts making it. After that, call the store and they will help.' },
    { id: 'f5', show: true, q: 'Something was wrong with my order.', a: 'Open the order in your account and tap “Report a problem”, or call the store that made it. Refunds go back to the original payment method within 3–7 working days.' },
  ],

  legal: [
    { id: 'terms', title: 'Terms of use', sub: 'Prototype copy for the redesign. Final wording comes from Domino’s Bangladesh legal.', sections: [
      { id: 'a', h: 'Orders', p: 'An order is confirmed when the store accepts it and you see an order number. Prices and availability can change until then.' },
      { id: 'b', h: 'Delivery', p: 'Delivery is available inside each store’s zone. The fee is ৳{deliveryFee}, waived over ৳{freeOver}. Estimates are estimates; traffic and weather can add time.' },
      { id: 'c', h: 'Promo codes', p: 'One code per order. Codes have conditions shown in the cart and can’t be exchanged for cash.' },
      { id: 'd', h: 'Accounts', p: 'Keep your password private. You’re responsible for orders placed from your account.' },
    ] },
    { id: 'privacy', title: 'Privacy policy', sub: 'Prototype copy for the redesign. Final wording comes from Domino’s Bangladesh legal.', sections: [
      { id: 'a', h: 'What we collect', p: 'Name, mobile number, optional email, delivery addresses and order history — only what’s needed to make and deliver your food.' },
      { id: 'b', h: 'How it’s used', p: 'To fulfil orders, contact you about them, and (if you opt in) send offers. We don’t sell personal data.' },
      { id: 'c', h: 'Payments', p: 'Card and mobile-wallet payments are processed by licensed gateways. We never see or store full card numbers.' },
      { id: 'd', h: 'Your choices', p: 'Edit your profile, remove addresses, opt out of marketing or delete your account at any time from My account.' },
      { id: 'e', h: 'This prototype', p: 'Everything you enter on this concept site stays in your own browser’s local storage. Nothing is sent to a server. “Reset demo data” in the footer clears it.' },
    ] },
    { id: 'refunds', title: 'Refunds & complaints', sub: 'Prototype copy for the redesign. Final wording comes from Domino’s Bangladesh legal.', sections: [
      { id: 'a', h: 'Something wrong?', p: 'Report it from the order page or the Help page within 24 hours. A photo helps.' },
      { id: 'b', h: 'How refunds work', p: 'Approved refunds go back to the original payment method within 3–7 working days, or as a store credit if you prefer.' },
      { id: 'c', h: 'Cancellations', p: 'You can cancel until the store starts making your order. After that, call the store.' },
    ] },
  ],
};
