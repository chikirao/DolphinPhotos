import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

// With a custom domain (public/CNAME) Pages serves the site from the root;
// without one it lives at chikirao.github.io/DolphinPhotos/.
const cnameFile = path.resolve(__dirname, 'public/CNAME')
const domain = fs.existsSync(cnameFile) ? fs.readFileSync(cnameFile, 'utf8').trim() : null
const base = domain ? '/' : '/DolphinPhotos/'
// Link previews need absolute URLs (og:image, canonical).
const siteUrl = domain ? `https://${domain}/` : 'https://chikirao.github.io/DolphinPhotos/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    },
    tailwindcss(),
    imagetools({
      // `?url` imports are the untouched originals for downloads — leave them alone.
      exclude: [/[?&]url\b/, 'public/**/*'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
