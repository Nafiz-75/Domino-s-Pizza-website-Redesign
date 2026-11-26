import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// Relative base so the same build works on GitHub Pages (/Domino-s-Pizza-website-Redesign/) and Vercel (/).
// Two pages: the shop (index.html) and the admin dashboard (admin/index.html → /admin/).
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: { input: { shop: resolve(import.meta.dirname, 'index.html'), admin: resolve(import.meta.dirname, 'admin/index.html') } },
  },
  plugins: [react(), tailwindcss()],
});
