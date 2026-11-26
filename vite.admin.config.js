import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/* Standalone admin site (its own GitHub Pages repo). Output: dist-admin/ with
   index.html at the top. It reads shop images and opens the preview from the
   shop site, which shares the same origin (nafiz-75.github.io). */
const SITE = process.env.SITE_URL || '/Domino-s-Pizza-website-Redesign/';

export default defineConfig({
  root: 'admin',
  base: './',
  publicDir: false,
  define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(SITE) },
  build: { outDir: '../dist-admin', emptyOutDir: true },
  plugins: [react(), tailwindcss()],
});
