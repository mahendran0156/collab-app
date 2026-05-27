import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL || 'https://collab-backend-98o3.onrender.com'
      ),
      'import.meta.env.VITE_SOCKET_URL': JSON.stringify(
        env.VITE_SOCKET_URL || 'https://collab-backend-98o3.onrender.com'
      ),
    },

    server: {
      port: 5173,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'esnext',   // ← THIS fixes the top-level await error
    },
  }
})