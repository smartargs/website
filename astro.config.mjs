// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Fully static build. The only server code is the contact form Worker in ./worker,
// which `wrangler deploy` ships together with dist/ (see wrangler.jsonc).
export default defineConfig({
  site: 'https://smartargs.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },

  integrations: [mdx(), react(), sitemap()],

  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
    // Mermaid blocks stay as plain code; src/components/Mermaid.astro turns them into diagrams.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
  },

  // Self-hosted at build time: no requests to Google Fonts or any other font CDN.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-geist-sans',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
    {
      // Pixel font for small labels. Code keeps Geist Mono.
      provider: fontProviders.fontsource(),
      name: 'Silkscreen',
      cssVariable: '--font-silkscreen',
      weights: ['400', '700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
