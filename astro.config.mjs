// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ariffebru.github.io',
  base: '/Valditech/',
  vite: {
    plugins: [tailwindcss()]
  }
});