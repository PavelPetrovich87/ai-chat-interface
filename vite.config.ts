import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://0d0cf740-my-ai-clouflare-app.my-ai-cloudflare-app.workers.dev/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  // Vite handles CSS processing automatically with PostCSS/Tailwind
  // No need for explicit CSS config here
})
