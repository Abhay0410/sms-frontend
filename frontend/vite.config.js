import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 2000, // Increased to 2MB to silence warnings for larger chunks
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Normalize path separators to forward slashes for consistency
          const normalizedId = id.replace(/\\/g, '/');

          // 1. Vendor Splitting (node_modules)
          if (normalizedId.includes('/node_modules/')) {
            
            // React core
            if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/react-router/')) {
              return 'react-vendor';
            }
            
            // Icons (Heavy!) - Split this out specifically
            if (normalizedId.includes('/react-icons/')) {
              return 'icons';
            }
            
            // Charts
            if (normalizedId.includes('/recharts/')) {
              return 'charts';
            }
            
            // Date Libraries
            if (normalizedId.includes('/date-fns/') || normalizedId.includes('/react-datepicker/')) {
              return 'date-libs';
            }
            
            // UI Libraries
            if (normalizedId.includes('/sweetalert2/') || normalizedId.includes('/react-toastify/')) {
              return 'ui-libs';
            }
            
            // PDF/Excel
            if (normalizedId.includes('/jspdf/') || normalizedId.includes('/html2canvas/')) {
              return 'pdf-libs';
            }
            
            // All other vendors
            return 'vendor';
          }
          
          // 2. Admin Feature Splitting
          // Groups everything in 'src/pages/admin/Admin_Features/FeatureName' into 'admin-feature-featurename'
          if (normalizedId.includes('/src/pages/admin/Admin_Features/')) {
            const match = normalizedId.match(/Admin_Features\/([^/]+)/);
            if (match && match[1]) {
              return `admin-feature-${match[1].toLowerCase()}`;
            }
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})