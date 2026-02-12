import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Warning limit ko 3MB kar diya taaki yellow warning na aaye
    chunkSizeWarningLimit: 3000, 
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries ko alag file mein rakho
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Heavy libraries ko alag chunks mein todo
          'vendor-icons': ['react-icons'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['sweetalert2', 'react-toastify', 'react-datepicker'],
          'vendor-utils': ['date-fns', 'jspdf', 'html2canvas']
        }
      }
    }
  }
})
