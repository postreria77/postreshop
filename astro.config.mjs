// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import vercel from '@astrojs/vercel';

import icon from 'astro-icon';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon(), react()],
  output: "static",
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@ui': '/src/components/ui',  
        '@layouts': '/src/layouts',
        '@stores': '/src/stores',
        '@lib': '/src/lib',
        '@actions': '/src/actions',
        '@assets': '/src/assets',
        '@svgs': '/src/assets/svgs',
        '@utils': '/src/lib/utils'
      }
    }
  },
});