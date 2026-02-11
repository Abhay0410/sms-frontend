// src/constants/apiEndpoints.js
export const API_ENDPOINTS = {

    SCHOOL: {
    REGISTER: '/api/schools/register',
    LIST: '/api/schools/list',
    ACTIVE: '/api/schools/active',
    BY_SLUG: (slug) => `/api/schools/slug/${slug}`,
  },
  // ========================================
  // ADMIN ENDPOINTS
  // ========================================
  ADMIN: {
    // Auth
    AUTH: {
      REGISTER: '/api/admin/register',
      LOGIN: '/api/auth/admin/login',
      LOGOUT: '/api/auth/admin/logout',
      PROFILE: '/api/auth/admin/profile',
      CHANGE_PASSWORD: '/api/auth/admin/change-password',
      VALIDATE: '/api/auth/admin/validate',
     
    },
    // Update
     UPDATE: (id) => `/api/admin/update/${id}`,
    // Dashboard
    //DASHBOARD: '/api/admin/dashboard',

    // Student Management
    STUDENT: {
      ALL: '/api/admin/students',
      LIST: '/api/admin/students/list',
      CREATE: '/api/admin/students',
      CREATE_WITH_PARENT: '/api/admin/students/with-parent',
      GET_BY_ID: (id) => `/api/admin/students/${id}`,
      UPDATE: (id) => `/api/admin/students/${id}`,
      DELETE: (id) => `/api/admin/students/${id}`,
      BULK_UPLOAD: '/api/admin/students/bulk-upload',
      UPDATE_STATUS: (id) => `/api/admin/students/${id}/status`,
      PROMOTE: '/api/admin/students/promote',
    },

    // Student Management (Advanced)
    STUDENT_MANAGEMENT: {
      LIST: '/api/admin/student-management/list',
      STATISTICS: '/api/admin/student-management/statistics',
      BULK_UPDATE_STATUS: '/api/admin/student-management/bulk-update-status',
      PROMOTE: '/api/admin/student-management/promote',
      BULK_DELETE: '/api/admin/student-management/bulk-delete',
      TRANSFER: '/api/admin/student-management/transfer',
    },

    // Teacher Management
    TEACHER: {
      ALL: '/api/admin/teachers',
      COUNTS: '/api/admin/teachers/counts',
      LIST: '/api/admin/teachers/list',
      CREATE: '/api/admin/teachers',
      GET_BY_ID: (id) => `/api/admin/teachers/${id}`,
      UPDATE: (id) => `/api/admin/teachers/${id}`,
      DELETE: (id) => `/api/admin/teachers/${id}`,
      ASSIGN_CLASS: (id) => `/api/admin/teachers/${id}/assign-class`,
      UPDATE_STATUS: (id) => `/api/admin/teachers/${id}/status`,
      TOGGLE_STATUS: (id) => `/api/admin/teachers/${id}/toggle-status`,
    },

    // Teacher Management (Advanced)
    TEACHER_MANAGEMENT: {
      LIST: '/api/admin/teacher-management/list',
      TEACHERS: '/api/admin/teacher-management/teachers',
      ASSIGNMENTS: (id) => `/api/admin/teacher-management/${id}/assignments`,
      SECTION_TEACHERS: '/api/admin/teacher-management/section-teachers',
      AVAILABLE_SUBJECTS: '/api/admin/teacher-management/available-subjects',
      ASSIGN: '/api/admin/teacher-management/assign',
      ASSIGN_CLASS_TEACHER: '/api/admin/teacher-management/assign-class-teacher',
      ASSIGN_SUBJECT_TEACHER: '/api/admin/teacher-management/assign-subject-teacher',
      REMOVE: '/api/admin/teacher-management/remove',
      REMOVE_CLASS_TEACHER: '/api/admin/teacher-management/remove-class-teacher',
      REMOVE_SUBJECT_TEACHER: '/api/admin/teacher-management/remove-subject-teacher',
    },

    // Staff Management
   STAFF: {
   LIST: '/api/admin/payroll/staff-list', 
 },

    // Class Management
     CLASS: {
      ALL: '/api/admin/classes',
      LIST: '/api/admin/classes/list',
      STATISTICS: '/api/admin/classes/statistics', // 👈 Add this line
      CREATE: '/api/admin/classes',
      GET_BY_ID: (id) => `/api/admin/classes/${id}`,
      UPDATE: (id) => `/api/admin/classes/${id}`,
      DELETE: (id) => `/api/admin/classes/${id}`,
      ADD_SECTION: (id) => `/api/admin/classes/${id}/section`,
      ASSIGN_STUDENTS: (classId, sectionName) => `/api/admin/classes/${classId}/section/${sectionName}/assign-students`,
      PROMOTE: '/api/admin/classes/promote',
      COPY_ACADEMIC_YEAR: '/api/admin/classes/copy-academic-year',
      ACADEMIC_YEARS: '/api/admin/classes/academic-years',
      UPDATE_FEE_STRUCTURE: (id) => `/api/admin/classes/${id}/fee-structure`,
    },

    // Subject Management
    SUBJECT_MANAGEMENT: {
  ALL: '/api/admin/subject-management',
  CLASS: (id) => `/api/admin/subject-management/class/${id}`,
    REMOVE_FROM_POOL: '/api/admin/subject-management/remove-from-pool',
  ADD: '/api/admin/subject-management/add',
  ADD_TO_SECTIONS: '/api/admin/subject-management/add-to-sections',
  UPDATE: '/api/admin/subject-management/update',
  REMOVE: '/api/admin/subject-management/remove',
  REMOVE_FROM_SECTIONS: '/api/admin/subject-management/remove-from-sections',

    },

    // Timetable Management
    TIMETABLE: {
      ALL: '/api/admin/timetable',
      BY_CLASS_SECTION: '/api/admin/timetable/by-class-section',
      CREATE: '/api/admin/timetable',
      GET_BY_ID: (id) => `/api/admin/timetable/${id}`,
      UPDATE: (id) => `/api/admin/timetable/${id}`,
      DELETE: (id) => `/api/admin/timetable/${id}`,
      TOGGLE_STATUS: (id) => `/api/admin/timetable/${id}/toggle-status`,
      PUBLISH: (id) => `/api/admin/timetable/${id}/publish`,  // ✅ Add
      UNPUBLISH: (id) => `/api/admin/timetable/${id}/unpublish`,
      ADD_DAY: (id) => `/api/admin/timetable/${id}/day`,
      ADD_PERIOD: (id, day) => `/api/admin/timetable/${id}/${day}/period`,
      ADD_BREAK: (id, day) => `/api/admin/timetable/${id}/${day}/break`,
      UPDATE_PERIOD: (id, day, periodId) => `/api/admin/timetable/${id}/${day}/period/${periodId}`,
      DELETE_PERIOD: (id, day, periodId) => `/api/admin/timetable/${id}/${day}/period/${periodId}`,
      COPY: '/api/admin/timetable/copy',
    },

    // Fee Management
   FEE: {
      // Base
      ALL: '/api/admin/fees/payments', // Ledger view
      
      // Master Data (Fee Heads)
      HEADS: '/api/admin/fees/head', 
      
      // Structure & Rules
      CLASS_FEES: '/api/admin/fees/class-fees',
      SET_CLASS_FEE: '/api/admin/fees/set-class-fee',
      
      // Assignment (The Engine)
      ASSIGN_STRUCTURE: '/api/admin/fees/assign-structure',
      
      // Transactions
      RECORD_PAYMENT: '/api/admin/fees/pay', // ✅ Updated to match new route
      PAYMENT_HISTORY: (studentId) => `/api/admin/fees/student/${studentId}/history`,
      
      // Analytics
      STATISTICS: '/api/admin/fees/statistics',
      DEFAULTERS: '/api/admin/fees/defaulters',
      STUDENTS_WITH_FEES: '/api/admin/fees/students-with-fees',
      
      // Receipts
      RECEIPT_DETAILS: (paymentId) => `/api/admin/fees/receipt/${paymentId}`,
      DOWNLOAD_RECEIPT: (paymentId) => `/api/admin/fees/receipt/${paymentId}/download`,
    },

    // Announcement Management
    ANNOUNCEMENT: {
      ALL: '/api/admin/announcements',
      CLASSES: '/api/admin/announcements/classes',
      CREATE: '/api/admin/announcements',
      UPDATE: (id) => `/api/admin/announcements/${id}`,
      DELETE: (id) => `/api/admin/announcements/${id}`,
      DELETE_ATTACHMENT: (announcementId, attachmentId) => `/api/admin/announcements/${announcementId}/attachment/${attachmentId}`,
      TOGGLE_PIN: (id) => `/api/admin/announcements/${id}/toggle-pin`,
    },

    // Result Management
    RESULT: {
      ALL: '/api/admin/results',
      STATISTICS: '/api/admin/results/statistics',
      GET_BY_ID: (id) => `/api/admin/results/${id}`,
      VIEW: (id) => `/api/admin/results/${id}/view`,
      DOWNLOAD: (id) => `/api/admin/results/${id}/download`,
      APPROVE: (id) => `/api/admin/results/${id}/approve`,
      UNAPPROVE: (id) => `/api/admin/results/${id}/unapprove`,
      PUBLISH: (id) => `/api/admin/results/${id}/publish`,
      UNPUBLISH: (id) => `/api/admin/results/${id}/unpublish`,
      BULK_APPROVE: '/api/admin/results/bulk-approve',
      BULK_PUBLISH: '/api/admin/results/bulk-publish',
      DELETE: (id) => `/api/admin/results/${id}`,
    },
   
  HR: {
  ATTENDANCE_LIST: '/api/admin/hr/attendance',
  UPDATE_ATTENDANCE: (id) => `/api/admin/hr/attendance/${id}`,
LEAVE_REQUESTS: '/api/admin/hr/leaves', // ✅ Correct path
        PROCESS_LEAVE: (id) => `/api/admin/hr/leaves/${id}/process`,
  APPROVE_LEAVE: (id) => `/api/admin/hr/leaves/${id}/approve`,
  REJECT_LEAVE: (id) => `/api/admin/hr/leaves/${id}/reject`,
},


  // ===============================
  // 💰 PAYROLL 
  // ===============================

PAYROLL: {
  GET_POLICY: '/api/admin/payroll/policy',
  UPDATE_POLICY: '/api/admin/payroll/policy',
  
  SETUP_SALARY: '/api/admin/payroll/setup-salary',
  SETUP_STRUCTURE: '/api/admin/payroll/setup-structure',
  GET_STRUCTURE: (teacherId) => `/api/admin/payroll/structure/${teacherId}`,
  UPDATE_SALARY: (teacherId) => `/api/admin/payroll/teachers/${teacherId}/salary`,
  
  // ✅ Staff Management
  STAFF_LIST: '/api/admin/payroll/staff-list',
  
  // ✅ Pre-payroll
  ATTENDANCE_STATS: (month, year) => `/api/admin/payroll/attendance-stats?month=${month}&year=${year}`,
  
  // ✅ Payroll Generation
  GENERATE: '/api/admin/payroll/generate',
  RUN_PAYROLL: '/api/admin/payroll/run-payroll',
  
  // ✅ Payroll Listing
  LIST: '/api/admin/payroll', 
  SUMMARY: '/api/admin/payroll/summary',
  TEACHER_HISTORY: (teacherId) => `/api/admin/payroll/teacher/${teacherId}`,

  // ✨ NEW: Self Service & View Endpoints (Added for consistency)
  MY_HISTORY: '/api/admin/payroll/my-history', // Staff self view
  VIEW_SLIP: (slipId) => `/api/admin/payroll/slip-details/${slipId}`, // Get details for modal
  DOWNLOAD_SLIP: (slipId) => `/api/admin/payroll/download-slip/${slipId}`, // Generate PDFKit file
  
  // ✅ Status Updates
  MARK_PAID: (id) => `/api/admin/payroll/${id}/pay`,
  MARK_PAID_V2: (slipId) => `/api/admin/payroll/mark-paid/${slipId}`,
  
  // ✅ Updates & Deletion
  UPDATE_PAYROLL: (id) => `/api/admin/payroll/update/${id}`,
  DELETE_DRAFT: (id) => `/api/admin/payroll/${id}`,
},

LIBRARY: {
  ALL_BOOKS: '/api/admin/library/inventory',
  ADD_BOOK: '/api/admin/library/books',
  UPDATE_BOOK: (id) => `/api/admin/library/books/${id}`,
  DELETE_BOOK: (id) => `/api/admin/library/books/${id}`,
  ISSUE_BOOK: '/api/admin/library/issue',
  RETURN_BOOK: '/api/admin/library/return',
  BOOK_DETAILS: (id) => `/api/admin/library/books/${id}`,
  STATS: '/api/admin/library/stats',
  RECENT_TRANSACTIONS: '/api/admin/library/recent',
},

  },

  // ========================================
  // TEACHER ENDPOINTS
  // ========================================
  TEACHER: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/teacher/login',
      LOGOUT: '/api/auth/teacher/logout',
      PROFILE: '/api/auth/teacher/profile',
      UPDATE_PROFILE: '/api/auth/teacher/profile',
      CHANGE_PASSWORD: '/api/auth/teacher/change-password',
      VALIDATE: '/api/auth/teacher/validate',
    },

    // Dashboard
    DASHBOARD: '/api/teacher/dashboard',

    // Attendance
    ATTENDANCE: {
      CLASSES: '/api/teacher/attendance/classes',   
      STUDENTS: '/api/teacher/attendance/students',
      MARK: '/api/teacher/attendance',
      BY_CLASS: '/api/teacher/attendance/class',
      BY_DATE: '/api/teacher/attendance/date',
      UPDATE: (id) => `/api/teacher/attendance/${id}`,
    },

    // Result Management
    RESULT: {
      SECTIONS: '/api/teacher/result/sections',
      STUDENTS: '/api/teacher/result/students',
      CREATE: '/api/teacher/result/create',
      MY_RESULTS: '/api/teacher/result/my-results',
      APPROVED: '/api/teacher/result/approved',
      GET_BY_ID: (id) => `/api/teacher/result/${id}`,
      UPDATE: (id) => `/api/teacher/result/${id}`,
      DELETE: (id) => `/api/teacher/result/${id}`,
      DOWNLOAD: (id) => `/api/teacher/result/${id}/download`,
    },

    // Timetable
    TIMETABLE: {
      MY_SCHEDULE: '/api/teacher/timetable/my-schedule',
      BY_CLASS_SECTION: '/api/teacher/timetable/by-class-section',
    },

    // Announcements
    ANNOUNCEMENT: {
      ALL: '/api/teacher/announcements',
      MY_SECTIONS: '/api/teacher/announcements/my-sections',
      MY_ANNOUNCEMENTS: '/api/teacher/announcements/my-announcements',
      CREATE: '/api/teacher/announcements',
      UPDATE: (id) => `/api/teacher/announcements/${id}`,
      DELETE: (id) => `/api/teacher/announcements/${id}`,
      TOGGLE_PIN: (id) => `/api/teacher/announcements/${id}/toggle-pin`,
    },
MESSAGING: {
  GET_THREADS: '/api/teacher/messages',
  GET_MY_SECTIONS: '/api/teacher/messages/my-sections', // Add this
  SEARCH_RECIPIENTS: '/api/teacher/messages/search-recipients',
  CREATE_THREAD: '/api/teacher/messages/thread',
  GET_THREAD_BY_ID: (id) => `/api/teacher/messages/${id}`,
  REPLY: (id) => `/api/teacher/messages/${id}/reply`,
  DELETE_MESSAGE: (threadId, messageId) => `/api/teacher/messages/${threadId}/message/${messageId}`,
},
MY_HR: {
MARK_ATTENDANCE: '/api/teacher/hr/attendance',
  RECENT_HISTORY: '/api/teacher/hr/attendance/recent',
      TODAY_STATUS: '/api/teacher/hr/attendance/today',
      MARK_IN: '/api/teacher/hr/attendance/in',
      MARK_OUT: '/api/teacher/hr/attendance/out',
      My_Status: '/api/teacher/hr/attendance/stats',
      APPLY_LEAVE: '/api/teacher/hr/leaves/apply', 
      LEAVE_STATUS: '/api/teacher/hr/leaves/my',
      MY_LEAVES: '/api/teacher/hr/leaves/my',
      MY_PAYROLL: '/api/teacher/hr/payroll/my',
}
  },

  // ========================================
  // STUDENT ENDPOINTS
  // ========================================
  STUDENT: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/student/login',
      LOGOUT: '/api/auth/student/logout',
      PROFILE: '/api/auth/student/profile',
      CHANGE_PASSWORD: '/api/auth/student/change-password',
      VALIDATE: '/api/auth/student/validate',
    },

    // Dashboard
    DASHBOARD: '/api/student/dashboard',

    // Attendance
    ATTENDANCE: {
      MY_ATTENDANCE: '/api/student/attendance',
      BY_SUBJECT: '/api/student/attendance/subject',
    },

    // Results
    RESULT: {
      MY_RESULTS: '/api/student/results',
      GET_BY_ID: (id) => `/api/student/results/${id}`,
      DOWNLOAD: (id) => `/api/student/results/${id}/download`,
    },

    // Fees
 FEE: {
  STATUS: '/api/student/fees/status',
  HISTORY: '/api/student/fees/history',
  RECEIPT: (feePaymentId, paymentId) =>
    `/api/student/fees/${feePaymentId}/payment/${paymentId}/receipt`,
  DOWNLOAD_RECEIPT: (feePaymentId, paymentId) =>
    `/api/student/fees/${feePaymentId}/payment/${paymentId}/download`,
},

    // Announcements
    ANNOUNCEMENT: {
      ALL: '/api/student/announcements',
      PINNED: '/api/student/announcements/pinned',
      GET_BY_ID: (id) => `/api/student/announcements/${id}`,
      MARK_READ: (id) => `/api/student/announcements/${id}/mark-read`,
    },
   MESSAGING: {
  GET_THREADS: '/api/student/messages',
  GET_THREAD_BY_ID: (id) => `/api/student/messages/${id}`,
  REPLY: (id) => `/api/student/messages/${id}/reply`,
},

    // Timetable
    TIMETABLE: {
      MY_TIMETABLE: '/api/student/timetable/my-timetable',
    },
  },

  // ========================================
  // PARENT ENDPOINTS
  // ========================================
  PARENT: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/parent/login',
      LOGOUT: '/api/auth/parent/logout',
      PROFILE: '/api/auth/parent/profile',
      CHILDREN: '/api/auth/parent/children',
      CHANGE_PASSWORD: '/api/auth/parent/change-password',
      VALIDATE: '/api/auth/parent/validate',
    },

    // Dashboard
    DASHBOARD: '/api/parent/dashboard',

    // Child Attendance
    ATTENDANCE: {
      CHILD: (childId) => `/api/parent/attendance/${childId}`,
    },

    // Child Results
    RESULT: {
      CHILD: (childId) => `/api/parent/results/${childId}`, 
      DOWNLOAD: (resultId) => `/api/parent/results/${resultId}/download`,
    },

    // Child Fees
  FEE: {
    ALL_CHILDREN: '/api/parent/fees',
    CHILD_STATUS: (childId) => `/api/parent/fees/${childId}/status`,
    CHILD_HISTORY: (childId) => `/api/parent/fees/${childId}/history`,
    RECEIPT_DETAILS: (feePaymentId, paymentId) =>
      `/api/parent/fees/receipt/${feePaymentId}/${paymentId}`,
    DOWNLOAD_RECEIPT: (feePaymentId, paymentId) =>
      `/api/parent/fees/receipt/${feePaymentId}/${paymentId}/download`,
  },

    // Announcements
    ANNOUNCEMENT: {
      ALL: '/api/parent/announcements',
      PINNED: '/api/parent/announcements/pinned',
      BY_CHILD: (childId) => `/api/parent/announcements/child/${childId}`,
      GET_BY_ID: (id) => `/api/parent/announcements/${id}`,
      MARK_READ: (id) => `/api/parent/announcements/${id}/mark-read`,
    },
 MESSAGING: {
  GET_THREADS: '/api/parent/messages',
  GET_THREAD_BY_ID: (id) => `/api/parent/messages/${id}`,
  REPLY: (id) => `/api/parent/messages/${id}/reply`,
},

    // Timetable
    TIMETABLE: {
      CHILD: (childId) => `/api/parent/timetable/${childId}`,
    },
  },

  // ========================================
  // COMMON ENDPOINTS
  // ========================================
  COMMON: {
    UPLOAD_FILE: '/api/upload',
    DOWNLOAD_FILE: (fileId) => `/api/download/${fileId}`,
    SEARCH: '/api/search',
  },
};
