import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  // Custom domain on GitHub Pages → the site is served from the root.
  base: '/',
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
