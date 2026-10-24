import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/orgs': 'http://localhost:3000',
      '/projects': 'http://localhost:3000',
      '/sessions': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
    },
  },
})
