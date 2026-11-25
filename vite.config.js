import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base so the same build works on GitHub Pages (/Domino-s-Pizza/) and Vercel (/).
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 700 },
  plugins: [react(), tailwindcss()],
});
