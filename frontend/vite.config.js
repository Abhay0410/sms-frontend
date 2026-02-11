import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['react-toastify', 'react-icons'],
          'chart-vendor': ['recharts', 'chart.js'],
          'date-vendor': ['date-fns', 'react-datepicker'],

          // Feature-based chunks
          'admin-dashboard': [
            './src/pages/admin/AdminDashboardPage.jsx',
            './src/pages/admin/AdminProfileManage.jsx'
          ],
          'academic-management': [
            './src/pages/admin/Admin_Features/AcademicManagement/ClassManagement.jsx',
            './src/pages/admin/Admin_Features/AcademicManagement/TeacherManagement.jsx',
            './src/pages/admin/Admin_Features/AcademicManagement/StudentManagement.jsx',
            './src/pages/admin/Admin_Features/AcademicManagement/SubjectManagement.jsx',
            './src/pages/admin/Admin_Features/AcademicManagement/TimetableManagement.jsx'
          ],
          'fee-management': [
            './src/pages/admin/Admin_Features/feemanagement/FeeOverview.jsx',
            './src/pages/admin/Admin_Features/feemanagement/SetClassFees.jsx',
            './src/pages/admin/Admin_Features/feemanagement/RecordPayment.jsx',
            './src/pages/admin/Admin_Features/feemanagement/PaymentHistory.jsx'
          ],
          'hr-payroll': [
            './src/pages/admin/Admin_Features/HRManagement/StaffAttendance.jsx',
            './src/pages/admin/Admin_Features/HRManagement/LeaveRequests.jsx',
            './src/pages/admin/Admin_Features/HRManagement/StaffAttendanceGrid.jsx',
            './src/pages/admin/Admin_Features/Payroll/AdminPayrollDashboard.jsx',
            './src/pages/admin/Admin_Features/Payroll/SalaryStructureSetup.jsx',
            './src/pages/admin/Admin_Features/Payroll/MonthlyPayRun.jsx'
          ],
          'library': [
            './src/pages/admin/Admin_Features/Library/LibraryInventory.jsx',
            './src/pages/admin/Admin_Features/Library/BookIssueReturn.jsx'
          ],
          'registration': [
            './src/pages/admin/Admin_Features/UserRegistrations/TeacherRegisterForm.jsx',
            './src/pages/admin/Admin_Features/UserRegistrations/StudentParentRegisterForm.jsx',
            './src/pages/admin/Admin_Features/UserRegistrations/AdminRegisterForm.jsx'
          ]
        }
      }
    }
  }
})
