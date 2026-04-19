import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      // dev: resolve directly from source so Vite HMR works without a dist rebuild
      '@loykin/chartkit':         resolve(__dirname, '../src/index.ts'),
      '@loykin/chartkit/styles':  resolve(__dirname, '../src/styles/index.css'),
    },
  },
})
