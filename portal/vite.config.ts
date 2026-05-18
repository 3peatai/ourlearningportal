import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/portal/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../public/portal',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
})
