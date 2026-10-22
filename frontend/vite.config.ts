import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em desenvolvimento, repassa a API ao Caddy do docker compose, que a encaminha ao backend.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})