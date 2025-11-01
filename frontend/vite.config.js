import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react-draft-wysiwyg', 'draft-js'],
    force: true
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    chunkSizeWarningLimit: 1000, // Set to 1000 KB (1 MB) to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react', '@heroicons/react'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  }
})
