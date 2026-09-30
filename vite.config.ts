import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  // With a custom domain (public/CNAME) Pages serves the site from the root;
  // without one it lives at chikirao.github.io/DolphinPhotos/.
  base: fs.existsSync(path.resolve(__dirname, 'public/CNAME')) ? '/' : '/DolphinPhotos/',
  plugins: [
    react(),
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
