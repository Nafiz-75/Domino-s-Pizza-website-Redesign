/* Imported first by the admin entry.
   SITE is where the shop lives, relative to the admin page:
   - inside the shop build (<site>/admin/)  → '../'
   - as its own GitHub Pages site           → '/Domino-s-Pizza/' (set in vite.admin.config.js)
   Both are on the same origin, which is how the admin and shop share browser storage. */
import { setAssetRoot } from '../content/store';

export const SITE = import.meta.env.VITE_SITE_URL || '../';
setAssetRoot(SITE);
