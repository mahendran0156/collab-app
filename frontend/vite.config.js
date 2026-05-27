import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://collab-backend-chdh.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://collab-backend-chdh.onrender.com',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'build'
  }
})
