import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bike, Check, Clock, Crosshair, Home, MapPin, Plus, Store } from 'lucide-react';
import { useApp } from '../state/AppState';
import { AREAS, OUT_OF_ZONE, STORES, areaById, isStoreOpen, nearestArea, storeById } from '../data/menu';
import { isBDPhone, normalizeBDPhone, prettyPhone, uid } from '../lib/format';
import { Field, Sheet, SheetHeader, Spinner } from './ui';

const LABELS = ['Home', 'Work', 'Other'];

export function formatAddress(a) {
  if (!a) return '';
  return [a.flat && `Flat ${a.flat}`, a.house && `House ${a.house}`, a.road, areaById(a.area)?.name, 'Dhaka'].filter(Boolean).join(', ');
}

/* Address form. Fields follow how Dhaka addresses are actually written:
   house / road / area, with flat and a landmark for the rider. */
export function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save address', contact = true }) {
  const { user } = useApp();
  const [a, setA] = useState(() => ({
    label: 'Home', area: '', road: '', house: '', flat: '', landmark: '', instructions: '',
    name: user?.name || '', phone: user?.phone || '', isDefault: false, ...initial,
  }));
  const [errors, setErrors] = useState({});
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState('');
  const set = (k) => (e) => { setA((x) => ({ ...x, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })); };

  const locate = () => {
    if (!navigator.geolocation) { setGeoMsg('Your browser can’t share location. Pick your area below.'); return; }
    setLocating(true); setGeoMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const area = nearestArea(pos.coords.latitude, pos.coords.longitude);
        if (area) { setA((x) => ({ ...x, area: area.id, lat: pos.coords.latitude, lng: pos.coords.longitude })); setGeoMsg(`Found you near ${area.name}.`); }
        else setGeoMsg('You look outside our delivery zones. Choose an area, or switch to pickup.');
      },
      () => { setLocating(false); setGeoMsg('Location permission was blocked. Pick your area below.'); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!a.area) er.area = 'Choose your area.';
    if (!a.road.trim()) er.road = 'Add a road or block.';
    if (!a.house.trim()) er.house = 'Add a house or holding number.';
    if (contact && !a.name.trim()) er.name = 'Who should the rider ask for?';
    if (contact && !isBDPhone(a.phone)) er.phone = 'Enter an 11-digit mobile number, like 01712-345678.';
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById('addr-' + Object.keys(er)[0])?.focus();
      return;
    }
    onSubmit({ ...a, id: a.id || uid('a'), phone: normalizeBDPhone(a.phone), road: a.road.trim(), house: a.house.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <button type="button" onClick={locate} className="btn-ghost h-11 justify-start">
        {locating ? <Spinner className="h-4 w-4 text-blue-600" /> : <Crosshair size={18} className="text-blue-600" aria-hidden="true" />}
        Use my current location
      </button>
      {geoMsg && <p className="-mt-2 text-[13px] font-medium text-blue-700" role="status">{geoMsg}</p>}

      <div className="flex gap-2" role="radiogroup" aria-label="Address label">
        {LABELS.map((l) => (
          <button type="button" key={l} role="radio" aria-checked={a.label === l} onClick={() => setA((x) => ({ ...x, label: l }))} className="chip">{l}</button>
        ))}
      </div>

      <Field label="Area" id="addr-area" error={errors.area} hint={`Not listed? We don’t deliver to ${OUT_OF_ZONE.slice(0, 3).join(', ')} and others yet — try pickup.`}>
        <select id="addr-area" className="input" value={a.area} onChange={set('area')} aria-invalid={!!errors.area}>
          <option value="">Select your area</option>
          {[...AREAS].sort((x, y) => x.name.localeCompare(y.name)).map((ar) => <option key={ar.id} value={ar.id}>{ar.name}</option>)}
        </select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Road / block" id="addr-road" error={errors.road}>
          <input id="addr-road" className="input" value={a.road} onChange={set('road')} placeholder="Road 27" autoComplete="address-line1" aria-invalid={!!errors.road} />
        </Field>
        <Field label="House / holding no." id="addr-house" error={errors.house}>
          <input id="addr-house" className="input" value={a.house} onChange={set('house')} placeholder="52" aria-invalid={!!errors.house} />
        </Field>
        <Field label="Flat / floor (optional)" id="addr-flat">
          <input id="addr-flat" className="input" value={a.flat} onChange={set('flat')} placeholder="4B" autoComplete="address-line2" />
        </Field>
        <Field label="Landmark (optional)" id="addr-landmark">
          <input id="addr-landmark" className="input" value={a.landmark} onChange={set('landmark')} placeholder="Opposite the mosque gate" />
        </Field>
      </div>
      <Field label="Note for the rider (optional)" id="addr-ins">
        <input id="addr-ins" className="input" value={a.instructions} onChange={set('instructions')} placeholder="Call from the gate, lift is on the left" />
      </Field>
      {contact && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name" id="addr-name" error={errors.name}>
            <input id="addr-name" className="input" value={a.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
          </Field>
          <Field label="Mobile number" id="addr-phone" error={errors.phone}>
            <input id="addr-phone" className="input" value={a.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="01712-345678" aria-invalid={!!errors.phone} />
          </Field>
        </div>
      )}
      {user && (
        <label className="flex items-center gap-2 text-[14px] font-medium">
          <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={!!a.isDefault} onChange={(e) => setA((x) => ({ ...x, isDefault: e.target.checked }))} /> Make this my default address
        </label>
      )}
      <div className="flex gap-2 pt-1">
        {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn-primary flex-1">{submitLabel}</button>
      </div>
    </form>
  );
}

export function AddressCard({ a, selected, onSelect, actions }) {
  const Icon = a.label === 'Home' ? Home : MapPin;
  return (
    <div className={`flex items-start gap-3 rounded-2xl p-3.5 ring-1 transition-colors ${selected ? 'bg-blue-50 ring-2 ring-blue-600' : 'ring-line hover:ring-blue-200'}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-line"><Icon size={17} aria-hidden="true" /></span>
      <button type="button" onClick={onSelect} disabled={!onSelect} className="min-w-0 flex-1 text-left disabled:cursor-default">
        <span className="flex items-center gap-2 text-[14.5px] font-bold">{a.label}{a.isDefault && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10.5px] font-bold text-white">Default</span>}</span>
        <span className="block text-[13.5px] text-ink-2">{formatAddress(a)}</span>
        {a.phone && <span className="block text-[12.5px] text-ink-3">{a.name} · {prettyPhone(a.phone)}</span>}
      </button>
      {selected && <Check size={20} className="mt-1 shrink-0 text-blue-600" aria-hidden="true" />}
      {actions}
    </div>
  );
}

export function StoreCard({ s, selected, onSelect }) {
  const open = isStoreOpen(s);
  return (
    <button type="button" onClick={onSelect} className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left ring-1 transition-colors ${selected ? 'bg-blue-50 ring-2 ring-blue-600' : 'ring-line hover:ring-blue-200'}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-line"><Store size={17} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-bold">{s.name}</span>
        <span className="block text-[13px] text-ink-2">{s.address}</span>
        <span className={`mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-semibold ${open ? 'text-veg' : 'text-red-600'}`}>
          <Clock size={12} aria-hidden="true" /> {open ? `Open · closes ${s.close === '00:00' ? 'midnight' : s.close}` : `Closed · opens ${s.open}`}
        </span>
      </span>
      {selected && <Check size={20} className="mt-1 shrink-0 text-blue-600" aria-hidden="true" />}
    </button>
  );
}

export function LocationSheet() {
  const { locationOpen, setLocationOpen, fulfil, setMode, chooseDelivery, choosePickup, user, saveAddress, toast } = useApp();
  const [adding, setAdding] = useState(false);
  const close = () => { setLocationOpen(false); setAdding(false); };
  const saved = user?.addresses || [];
  const mode = fulfil.mode;

  return (
    <Sheet open={locationOpen} onClose={close} labelledBy="loc-title">
      <SheetHeader id="loc-title" title={mode === 'delivery' ? 'Where should we deliver?' : 'Pick up from a store'} onClose={close} />
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="relative grid grid-cols-2 rounded-full bg-canvas p-1 ring-1 ring-line" role="tablist" aria-label="Order type">
          {[['delivery', 'Delivery', Bike], ['pickup', 'Carryout', Store]].map(([id, l, I]) => (
            <button key={id} role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setAdding(false); }}
              className={`relative z-10 flex h-10 items-center justify-center gap-2 rounded-full text-[14px] font-bold transition-colors ${mode === id ? 'text-white' : 'text-ink-2'}`}>
              {mode === id && <motion.span layoutId="mode-pill" className="absolute inset-0 -z-10 rounded-full bg-blue-600" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <I size={16} aria-hidden="true" />{l}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode + adding} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-5">
            {mode === 'pickup' ? (
              <div className="grid gap-2.5">
                {STORES.map((s) => <StoreCard key={s.id} s={s} selected={fulfil.storeId === s.id} onSelect={() => { choosePickup(s.id); toast(`Pickup from ${s.name}.`); close(); }} />)}
              </div>
            ) : adding || (!saved.length && !fulfil.address) ? (
              <AddressForm submitLabel="Deliver here" onCancel={saved.length || fulfil.address ? () => setAdding(false) : undefined}
                onSubmit={(a) => { const s = user ? saveAddress(a) : a; chooseDelivery(s); toast(`Delivering to ${areaById(a.area).name} · about ${areaById(a.area).eta} min.`); close(); }} />
            ) : (
              <div className="grid gap-2.5">
                {fulfil.address && !saved.some((s) => s.id === fulfil.address.id) && (
                  <AddressCard a={fulfil.address} selected onSelect={close} />
                )}
                {saved.map((a) => <AddressCard key={a.id} a={a} selected={fulfil.address?.id === a.id} onSelect={() => { chooseDelivery(a); close(); }} />)}
                <button onClick={() => setAdding(true)} className="flex items-center gap-3 rounded-2xl p-3.5 text-left font-bold text-blue-700 ring-1 ring-dashed ring-blue-200 hover:bg-blue-50">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white"><Plus size={18} aria-hidden="true" /></span> Add a new address
                </button>
                {fulfil.address && <p className="mt-2 text-[13px] text-ink-3">Delivered from <b className="text-ink-2">{storeById(areaById(fulfil.address.area)?.store)?.name}</b> · about {areaById(fulfil.address.area)?.eta} minutes.</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}
