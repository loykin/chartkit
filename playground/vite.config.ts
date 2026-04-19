import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // dev: resolve styles directly to source so Vite HMR works without a dist rebuild
      '@loykin/chartkit/styles': resolve(__dirname, '../src/styles/index.css'),
    },
  },
})
