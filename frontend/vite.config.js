import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. Vendor Splitting (node_modules)
          // We use simple .includes() to avoid issues with path separators (/ vs \)
          if (id.includes('node_modules')) {
            
            // Heavy libraries - Split these first
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react-datepicker')) return 'date-libs';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-libs';
            if (id.includes('sweetalert2') || id.includes('react-toastify')) return 'ui-libs';
            
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // Everything else in node_modules goes to a single vendor chunk
            return 'vendor';
          }
          
          // 2. Admin Feature Splitting
          // Groups files in 'src/pages/admin/Admin_Features/FeatureName'
          if (id.includes('Admin_Features')) {
            const match = id.match(/Admin_Features\/([^/]+)/);
            if (match && match[1]) {
              return `admin-feature-${match[1].toLowerCase()}`;
            }
          }
        }
      }
    }
  }
})
