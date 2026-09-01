import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

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
      '@loykin/chartkit': resolve(__dirname, '../src/index.ts'),
    },
  },
})
