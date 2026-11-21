import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: [
      '@codemirror/language',
      '@codemirror/state',
      '@codemirror/view',
    ],
    alias: {
      '@loykin/chartkit': resolve(import.meta.dirname, '../src/index.ts'),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('/@codemirror/lang-') || id.includes('/@lezer/javascript/') || id.includes('/@lezer/json/')) {
            return 'editor-languages'
          }
          if (id.includes('/@codemirror/theme-one-dark/')) return 'editor-theme'
          if (id.includes('/@codemirror/') || id.includes('/@lezer/')) return 'editor-core'
          if (id.includes('/@uiw/react-codemirror/')) return 'editor-react'
          if (id.includes('/react-router') || id.includes('/react-dom/') || id.includes('/react/')) return 'react-vendor'
          if (id.includes('/uplot/')) return 'chart-vendor'
        },
      },
    },
  },
})
