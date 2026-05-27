import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const API_URL = env.VITE_API_URL || 'https://collab-backend-98o3.onrender.com'
  const SOCKET_URL = env.VITE_SOCKET_URL || 'https://collab-backend-98o3.onrender.com'

  return {
    plugins: [react()],

    define: {
      // Bake env vars into the bundle at build time
      'import.meta.env.VITE_API_URL': JSON.stringify(API_URL),
      'import.meta.env.VITE_SOCKET_URL': JSON.stringify(SOCKET_URL),
    },

    server: {
      port: 3000,
      host: true,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      target: 'esnext',        // fixes top-level await error
      rollupOptions: {
        output: {
          manualChunks: {
            // Split Three.js into its own chunk (reduces main bundle size)
            three: ['three'],
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
    },
  }
})
