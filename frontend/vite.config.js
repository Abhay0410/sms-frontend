import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ✅ SIRF NODE_MODULES KO CHUNK KARO
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-core';
            }
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Icons
            if (id.includes('react-icons/fa')) {
              return 'icons-fa';
            }
            // Date
            if (id.includes('date-fns') || id.includes('react-datepicker')) {
              return 'date';
            }
            return 'vendor';
          }
          // ❌ APP CODE KO CHUNK MAT KARO - DYNAMIC IMPORTS KHUD SPLIT KARENGE
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})