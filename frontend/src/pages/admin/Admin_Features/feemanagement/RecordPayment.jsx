import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";

import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaSearch,
  FaRupeeSign,
  FaInfoCircle,
  FaCheckDouble,
  FaCalendarAlt,
  FaReceipt,
  FaFilter,
  FaDownload,
  FaCheck,
  FaTimes,
  FaExclamationCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

export default function RecordPayment() {
  const academicYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -1; i < 6; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    return years;
  }, []);

  const [academicYear, setAcademicYear] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPaid: 0,
    totalStudents: 0,
  });

  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [classList, setClassList] = useState([]);

  // 🔥 State for Manual Month Selection
  const [selectedInsts, setSelectedInsts] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "CASH",
    transactionId: "",
    chequeNumber: "",
    bankName: "",
    upiId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
    sendNotification: true,
    generateReceipt: true,
  });

  const getFormattedMonth = useCallback(
    () =>
      selectedMonth !== "ALL"
        ? selectedMonth.substring(0, 3).toUpperCase()
        : undefined,
    [selectedMonth],
  );

  const getCurrentMonth = () => {
    const monthNames = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
  };

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get(
        `${API_ENDPOINTS.ADMIN.CLASS.STATISTICS}?academicYear=${academicYear}`,
      );
      const classData = res?.data?.classes || res?.data || [];
      setClassList(classData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load classes");
    }
  }, [academicYear]);

  // 🔥 Handle Selection Toggle (Click on Month Card)
  const toggleInstallment = (inst) => {
    const isSelected = selectedInsts.some((i) => i._id === inst._id);
    let newSelection;

    if (isSelected) {
      newSelection = selectedInsts.filter((i) => i._id !== inst._id);
    } else {
      newSelection = [...selectedInsts, inst];
    }

    setSelectedInsts(newSelection);

    const newTotal = newSelection.reduce((sum, item) => {
      const balance = item.amount - (item.paidAmount || 0);
      return sum + balance;
    }, 0);

    updateFormField("amountPaid", newTotal > 0 ? newTotal : "");
  };

  const selectAllInstallments = () => {
    if (!selectedStudent?.feeDetails?.installments) return;

    const pendingInstallments = selectedStudent.feeDetails.installments.filter(
      (inst) => inst.status !== "PAID",
    );

    if (pendingInstallments.length === 0) return;

    setSelectedInsts(pendingInstallments);

    // Calculate total amount
    const totalAmount = pendingInstallments.reduce(
      (sum, inst) => sum + (inst.amount - (inst.paidAmount || 0)),
      0,
    );

    updateFormField("amountPaid", totalAmount);
  };

  const clearAllSelections = () => {
    setSelectedInsts([]);
    updateFormField("amountPaid", "");
  };

  // 🔥 Allocation Preview Logic (Merged Manual + Waterfall)
  const allocationPreview = useMemo(() => {
    if (!selectedStudent?.feeDetails?.installments || !paymentForm.amountPaid) {
      return {
        items: [],
        summary: {
          totalAllocated: 0,
          remaining: 0,
          installmentsCovered: 0,
          isManual: false,
        },
      };
    }

    const amount = Number(paymentForm.amountPaid);
    let remaining = amount;
    const items = [];
    let coveredCount = 0;

    // A. Manual Selection Logic
    if (selectedInsts.length > 0) {
      selectedInsts.forEach((inst) => {
        const needed = inst.amount - (inst.paidAmount || 0);
        const allocated = Math.min(remaining, needed);
        if (allocated > 0) {
          items.push({
            id: inst._id,
            name: inst.name,
            amount: allocated,
            isFullyCleared: allocated >= needed,
            status: allocated >= needed ? "PAID" : "PARTIAL",
            dueDate: inst.dueDate,
            originalAmount: inst.amount,
            alreadyPaid: inst.paidAmount || 0,
            neededAmount: needed,
          });
          remaining -= allocated;
          if (allocated >= needed) coveredCount++;
        }
      });
    } else {
      // B. Waterfall Logic (Auto)
      const pending = [...selectedStudent.feeDetails.installments]
        .filter((i) => i.status !== "PAID")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      for (let inst of pending) {
        if (remaining <= 0) break;
        const needed = inst.amount - (inst.paidAmount || 0);
        if (needed <= 0) continue;
        const allocated = Math.min(remaining, needed);
        items.push({
          id: inst._id,
          name: inst.name,
          amount: allocated,
          isFullyCleared: allocated >= needed,
          status: allocated >= needed ? "PAID" : "PARTIAL",
          dueDate: inst.dueDate,
          originalAmount: inst.amount,
          alreadyPaid: inst.paidAmount || 0,
          neededAmount: needed,
        });
        remaining -= allocated;
        if (allocated >= needed) coveredCount++;
      }
    }

    if (remaining > 0) {
      items.push({
        id: "advance",
        name: "Advance / Future",
        amount: remaining,
        status: "ADVANCE",
        isFullyCleared: false,
      });
    }

    return {
      items,
      summary: {
        totalAllocated: amount - remaining,
        remaining,
        installmentsCovered: coveredCount,
        isManual: selectedInsts.length > 0,
      },
    };
  }, [selectedStudent, paymentForm.amountPaid, selectedInsts]);

  // --------- Load students with fee data ----------
  const loadStudents = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const response = await api.get(
          API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES,
          {
            params: {
              academicYear,
              search: searchTerm,
              page,
              limit: 5,
              month: getFormattedMonth(),
              classId: selectedClass !== "ALL" ? selectedClass : undefined,
            },
          },
        );

        let studentsData = [];
        let paginationData = {};
        let statsData = {};

        if (response.students !== undefined) {
          studentsData = response.students;
          paginationData = response.pagination || {};
          statsData = response.stats || {};
        } else if (response.data?.students !== undefined) {
          studentsData = response.data.students;
          paginationData = response.data.pagination || {};
          statsData = response.data.stats || {};
        } else if (response.data?.success && response.data.data?.students) {
          studentsData = response.data.data.students;
          paginationData = response.data.data.pagination || {};
          statsData = response.data.data.stats || {};
        } else {
          setStudents([]);
          return;
        }

        const finalPagination = {
          current: paginationData.current || page,
          pages: paginationData.pages || 1,
          total: paginationData.total || studentsData.length,
        };

        setStudents(studentsData);
        setPagination(finalPagination);
        setStats({
          totalPending: statsData.totalPending || 0,
          totalPaid: statsData.totalPaid || 0,
          totalStudents: statsData.totalStudents || studentsData.length,
        });
      } catch (error) {
        console.error("❌ Failed to load students:", error);
        toast.error("Failed to load students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    },
    [academicYear, searchTerm, getFormattedMonth, selectedClass],
  );
  console.log("Pagination:", pagination);

  //   const school = (() => {
  //   try {
  //     return JSON.parse(localStorage.getItem("selectedSchool"));
  //   } catch {
  //     return null;
  //   }
  // })();

  useEffect(() => {
    if (academicYear) {
      loadClasses();
    }
  }, [academicYear, loadClasses]);

  useEffect(() => {
    // ✅ 1. Agar search term chota hai aur khali nahi hai, toh call mat karo
    if (searchTerm.length > 0 && searchTerm.length < 3) return;

    const delaySearch = setTimeout(() => {
      loadStudents(1);
    }, 700); // 700ms debounce perfect hota hai production ke liye

    return () => clearTimeout(delaySearch);
  }, [searchTerm, academicYear, selectedMonth, selectedClass, loadStudents]);

  // --------- Helpers ----------
  const updateFormField = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const getSafeFeeNumbers = (feeDetails = {}) => {
    const total = Number(feeDetails.totalAmount || feeDetails.totalFee || 0);
    const paid = Number(feeDetails.paidAmount || 0);
    let pending = Number(
      typeof feeDetails.balancePending === "number"
        ? feeDetails.balancePending
        : feeDetails.pendingAmount,
    );
    if (isNaN(pending)) pending = total - paid;
    if (pending < 0) pending = 0;
    return { total, paid, pending };
  };

  const getStatusBadge = (student) => {
    const fd = student.feeDetails;
    if (!fd) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200 text-xs font-bold uppercase shadow-sm">
          No Fee Set
        </span>
      );
    }

    const { total, paid, pending } = getSafeFeeNumbers(fd);
    const status = fd.status;
    const classHasFeeStructure = fd.classHasFeeStructure;

    if (status === "NOT_SET" && !classHasFeeStructure) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200 text-xs font-bold uppercase shadow-sm">
          No Fee Set
        </span>
      );
    }
    if (status === "ERROR") {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full border border-gray-200 text-xs font-bold uppercase shadow-sm">
          Error
        </span>
      );
    }

    const epsilon = 0.01;
    const isPaid = pending <= epsilon && paid >= total - epsilon;

    if (isPaid || status === "PAID") {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase shadow-sm">
          Paid
        </span>
      );
    }
    if (status === "PARTIALLY_PAID") {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase shadow-sm">
          Partial
        </span>
      );
    }
    if (status === "OVERDUE") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200 text-xs font-bold uppercase shadow-sm">
          Overdue
        </span>
      );
    }
    if (classHasFeeStructure && !fd.feePaymentId) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200 text-xs font-bold uppercase shadow-sm">
          Class Fee Set
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase shadow-sm">
        Pending
      </span>
    );
  };

  const canMakePayment = (student) => {
    if (!student.feeDetails) return false;

    const fd = student.feeDetails;

    // Allow payment if class has fee structure but no fee record yet
    if (fd.classHasFeeStructure && !fd.feePaymentId) return true;

    // Disable if fee not set
    if (fd.status === "NOT_SET" && !fd.classHasFeeStructure) return false;

    const { pending } = getSafeFeeNumbers(fd);

    // Allow payment if pending > 0
    return pending > 0;
  };

  const getPaymentButtonText = (student) => {
    if (!student.feeDetails) return "No Fee Set";
    const fd = student.feeDetails;
    const { pending } = getSafeFeeNumbers(fd);
    if (fd.classHasFeeStructure && !fd.feePaymentId) return "Create & Pay";
    if (pending > 0) return "Record Payment";
    return "No Pending";
  };

  // --------- Open modal ----------
  const handleRecordPayment = (student) => {
    setSelectedStudent(student);
    setSelectedInsts([]);

    // Auto-fill with total pending amount
    const { pending } = getSafeFeeNumbers(student.feeDetails || {});

    setPaymentForm({
      amountPaid: pending || "",
      paymentMethod: "CASH",
      transactionId: "",
      chequeNumber: "",
      bankName: "",
      upiId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      remarks: `Fee payment for ${student.name} - ${student.className}`,
      sendNotification: true,
      generateReceipt: true,
    });

    setShowModal(true);
  };

  // --------- Submit payment ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("No student selected");
      return;
    }

    const amount = parseFloat(paymentForm.amountPaid);
    const maxAmount = selectedStudent.feeDetails?.totalFee || 9999999;

    if (amount > maxAmount) {
      toast.error("Amount cannot exceed total yearly fee");
      return;
    }

    if (amount <= 0 || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Validate amount doesn't exceed pending
    const { pending } = getSafeFeeNumbers(selectedStudent.feeDetails || {});
    if (amount > pending && !selectedStudent.feeDetails?.classHasFeeStructure) {
      toast.error(
        `Amount exceeds pending fee of ₹${pending.toLocaleString("en-IN")}`,
      );
      return;
    }

    try {
      setSaving(true);

      // ✅ Prepare payload matching backend expectations
      const payload = {
        studentId: selectedStudent._id,
        academicYear: academicYear,
        amountPaid: amount,
        paymentMode: paymentForm.paymentMethod,
        paymentDate: paymentForm.paymentDate,
        remarks: paymentForm.remarks,
        sendNotification: paymentForm.sendNotification,
        generateReceipt: paymentForm.generateReceipt,
      };

      // Add selected installments to payload
      if (selectedInsts.length > 0) {
        payload.selectedInstallmentIds = selectedInsts.map((inst) => inst._id);
      }

      // Add payment method specific details
      if (paymentForm.paymentMethod === "UPI" && paymentForm.upiId) {
        payload.upiId = paymentForm.upiId;
      }
      if (paymentForm.paymentMethod === "CHEQUE") {
        payload.chequeNumber = paymentForm.chequeNumber || "";
        payload.bankName = paymentForm.bankName || "";
      }
      if (
        ["BANK_TRANSFER", "ONLINE", "CARD", "UPI"].includes(
          paymentForm.paymentMethod,
        )
      ) {
        payload.transactionId = paymentForm.transactionId || "";
      }

      // Include fee payment ID if it exists
      if (selectedStudent.feeDetails?.feePaymentId) {
        payload.feePaymentId = selectedStudent.feeDetails.feePaymentId;
      }

      const downloadReceipt = async (paymentId) => {
        try {
          const res = await api.get(
            API_ENDPOINTS.ADMIN.FEE.DOWNLOAD_RECEIPT(paymentId),
            { responseType: "blob" },
          );
          console.log("FULL PAYMENT RESPONSE 👉", res);

          const blob = new Blob([res.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `Fee_Receipt_${paymentId}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        } catch (err) {
          toast.error("Failed to download receipt");
          console.error(err);
        }
      };

      const response = await api.post(
        API_ENDPOINTS.ADMIN.FEE.RECORD_PAYMENT,
        payload,
      );

      Swal.fire({
        title: "🎉 Payment Successful!",
        html: `
    <div style="text-align:left; font-size:15px; line-height:1.6">
   
      <p>💰 <strong>Amount Paid:</strong> 
        <span style="color:#2e7d32;font-size:18px;">
          ₹${payload.amountPaid.toLocaleString("en-IN")}
        </span>
      </p>
      <p>🧾 <strong>Receipt No:</strong> 
        <span style="color:#1976d2">
          ${response.data?.receiptNumber || "Generated"}
        </span>
      </p>
      <p>📅 <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <hr/>
      <p style="font-size:13px;color:#666">
        You can download the receipt now or later from payment history.
      </p>
    </div>
  `,
        icon: "success",
        background: "#f9fbff",
        confirmButtonText: "⬇️ Download Receipt",
        cancelButtonText: "❌ Close",
        showCancelButton: true,
        confirmButtonColor: "#1976d2",
        cancelButtonColor: "#9e9e9e",
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeInUp",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const paymentId = response.data?.paymentId;
          if (!paymentId) {
            toast.error("Payment ID not found for receipt");
            return;
          }
          downloadReceipt(paymentId);
        }
      });

      setShowModal(false);
      setSelectedInsts([]);

      // Refresh the student list
      await loadStudents(pagination.current);
    } catch (error) {
      console.error("❌ Payment recording error:", error);

      // Extract error message
      let errorMsg = "Payment failed. Please try again.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(
        <div>
          <div className="font-bold uppercase">Payment Failed</div>
          <div className="text-sm opacity-90">{errorMsg}</div>
        </div>,
        { autoClose: 4000 },
      );
    } finally {
      setSaving(false);
    }
  };

  // --------- Render helpers ----------
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .custom-scrollbar-white::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.1);
    }
    .custom-scrollbar-white::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
    }
    .custom-scrollbar-white::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.5);
    }
    .scale-in-center {
      animation: scale-in-center 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
    @keyframes scale-in-center {
      0% {
        transform: scale(0.95);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .fade-in {
      animation: fade-in 0.2s ease-in-out both;
    }
    @keyframes fade-in {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    .hover-scale {
      transition: all 0.3s ease;
    }
    .hover-scale:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
  `;

  return (
    <div className="space-y-6">
      <style>{scrollbarStyles}</style>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-xl border border-slate-400 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Fee Collection
          </h1>
          <p className="text-sm font-medium text-gray-600 mt-1">
            Record payments and manage transactions
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-400 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">
            Session:
          </span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-lg py-2 pl-3 pr-8 focus:ring-2 focus:ring-purple-500 cursor-pointer outline-none"
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-400 hover:shadow-md transition-all duration-300">
        <div className="flex-1 w-full relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-xl border border-slate-400 outline-none font-medium text-slate-700 transition-all focus:border-indigo-700"
            placeholder="Search by student name, ID, or class..."
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white text-purple-600 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300">
              <FaFilter size={20} />
            </div>
            <div >
              <h3 className="text-xl font-bold text-slate-900 ">
                Filter Students
              </h3>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Select month and class to filter students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="
                  rounded-xl 
                  border 
                  border-slate-400 
                  bg-white 
                  pl-5 
                  pr-10 
                  py-3.5 
                  font-bold 
                  text-slate-700 
                  outline-none 
                  focus:ring-2 
                  focus:ring-purple-500/20 
                  focus:border-purple-500
                  hover:border-slate-400
                  transition-all
                  shadow-sm
                  appearance-none
                  cursor-pointer
                  min-w-[200px]
                "
              >
                <option value="ALL">📊 Full Academic Year</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m.toUpperCase()}>
                    {m.toUpperCase() === getCurrentMonth()
                      ? `📅 ${m} (Current)`
                      : m}
                  </option>
                ))}
              </select>

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="
                  rounded-xl 
                  border 
                  border-slate-400 
                  bg-white 
                  pl-5 
                  pr-10 
                  py-3.5 
                  font-bold 
                  text-slate-700 
                  outline-none 
                  focus:ring-2 
                  focus:ring-purple-500/20 
                  focus:border-purple-500
                  hover:border-slate-400
                  transition-all
                  shadow-sm
                  appearance-none
                  cursor-pointer
                  min-w-[200px]
                "
              >
                <option value="ALL">🏫 All Classes</option>
                {classList.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className}
                  </option>
                ))}
              </select>

              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <button
              onClick={() => loadStudents(1)}
              disabled={loading}
              className="
                h-14 w-14 
                bg-amber-500 
                text-white 
                rounded-xl 
                flex items-center justify-center 
                hover:bg-amber-600 
                transition-all duration-300
                shadow-sm
                hover:shadow-md
                hover:scale-105
              "
              title="Refresh Students"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Uncomment if needed */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white to-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wider font-bold">
                Total Students
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalStudents}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaReceipt className="text-purple-600 text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 p-5 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wider font-bold">
                Total Pending
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ₹{stats.totalPending.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FaRupeeSign className="text-red-600 text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50 p-5 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wider font-bold">
                Total Collected
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{stats.totalPaid.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FaCheckDouble className="text-emerald-600 text-lg" />
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-400 overflow-hidden relative min-h-[400px] hover:shadow-md transition-all duration-300">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center transition-all duration-300">
            <div className="bg-white p-4 rounded-full shadow-xl mb-3">
              <FiRefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <p className="text-slate-600 font-bold text-xs uppercase tracking-widest animate-pulse">
              Updating Records...
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-400">
                <th className="p-5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">
                  Student Details
                </th>
                <th className="p-5 text-left text-xs font-bold uppercase tracking-widest text-slate-500">
                  Class Info
                </th>
                <th className="p-5 text-right text-xs font-bold uppercase tracking-widest text-slate-500">
                  Fee Summary
                </th>
                <th className="p-5 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="p-5 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => {
                  const { total, paid, pending } = getSafeFeeNumbers(
                    student.feeDetails,
                  );
                  const canPay = canMakePayment(student);
                  const isOverdue = student.feeDetails?.status === "OVERDUE";
                  const isPartiallyPaid =
                    student.feeDetails?.status === "PARTIALLY_PAID";

                  return (
                    <tr
                      key={student._id}
                      className={`border-b border-slate-400 hover:bg-slate-50/50 transition-all duration-300 ${
                        isOverdue
                          ? "bg-red-50/30 hover:bg-red-50/50"
                          : isPartiallyPaid
                            ? "bg-amber-50/30 hover:bg-amber-50/50"
                            : ""
                      }`}
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          {student?.profilePicture ? (
                            <img
                              src={
                                student.profilePicture.startsWith("http")
                                  ? student.profilePicture
                                  : `${API_URL}/uploads/${student.schoolId}/students/${student.profilePicture}`
                              }
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                              {student?.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                ID: {student.studentID}
                              </span>
                              {isOverdue && (
                                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded font-bold">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-slate-800">
                          {student.className}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          Section:{" "}
                          <span className="font-semibold">
                            {student.section}
                          </span>
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="text-right space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                              Total:
                            </span>
                            <span className="font-bold text-slate-900">
                              ₹{total.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                              Paid:
                            </span>
                            <span className="font-bold text-emerald-600">
                              ₹{paid.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">
                              Pending:
                            </span>
                            <span
                              className={`font-bold ${pending > 0 ? "text-red-600" : "text-emerald-600"}`}
                            >
                              ₹{pending.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          {getStatusBadge(student)}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleRecordPayment(student)}
                            disabled={!canPay}
                            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 min-w-[140px] ${
                              canPay
                                ? "bg-indigo-700 text-white hover:bg-indigo-800 shadow-sm hover:shadow-md hover:scale-105"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {getPaymentButtonText(student)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="text-slate-300 text-5xl mb-4">
                      <FaSearch className="inline-block" />
                    </div>
                    <p className="text-slate-600 text-lg font-bold">
                      {searchTerm || selectedMonth !== "ALL" || selectedClass !== "ALL"
                        ? "No students found matching your criteria"
                        : "No students found for this academic year"}
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Try adjusting your search or filters
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedMonth("ALL");
                          setSelectedClass("ALL");
                        }}
                        className="px-4 py-2.5 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 font-bold text-sm transition-all duration-300 hover:scale-105"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => loadStudents(1)}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-sm transition-all duration-300 hover:scale-105"
                      >
                        Refresh
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-5 border-t border-slate-400 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-600 font-medium">
              Showing page{" "}
              <span className="font-bold">{pagination.current}</span> of{" "}
              <span className="font-bold">{pagination.pages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadStudents(pagination.current - 1)}
                disabled={pagination.current === 1 || loading}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-300 hover:scale-105"
              >
                ← Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(pagination.current - 2, pagination.pages - 4),
                      ) + i;
                    if (pageNum > pagination.pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => loadStudents(pageNum)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all duration-300 hover:scale-105 ${
                          pagination.current === pageNum
                            ? "bg-indigo-700 text-white shadow-sm"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>
              <button
                onClick={() => loadStudents(pagination.current + 1)}
                disabled={pagination.current === pagination.pages || loading}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-300 hover:scale-105"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal - Triple Column Layout */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col scale-in-center border border-slate-400 hover:shadow-2xl transition-all duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-400 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-sm">
                    {selectedStudent.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedStudent.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        ID: {selectedStudent.studentID}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedStudent.className} - {selectedStudent.section}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-purple-600 font-bold">
                        Session {academicYear}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500">
                      Pending Amount
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      ₹
                      {getSafeFeeNumbers(
                        selectedStudent.feeDetails,
                      ).pending.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="w-10 h-10 bg-white border border-slate-400 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>

            {/* Triple Column Content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 divide-x divide-slate-400">
              {/* Left Column: Month Selection Grid */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-600" />
                    Select Installments
                  </h4>
                  <div className="flex gap-2">
                    {selectedInsts.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllSelections}
                        className="text-xs font-bold text-red-600 hover:text-red-700 uppercase transition-all duration-300 hover:scale-105"
                      >
                        <FaTimes className="inline-block mr-1" /> Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={selectAllInstallments}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase transition-all duration-300 hover:scale-105"
                    >
                      <FaCheck className="inline-block mr-1" /> Select All
                    </button>
                  </div>
                </div>

                {/* Updated Installments Grid */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedStudent?.feeDetails?.installments?.length > 0 ? (
                    selectedStudent.feeDetails.installments
                      .filter((i) => i.status !== "PAID")
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                      .map((inst) => {
                        const isSelected = selectedInsts.some(
                          (s) => s._id === inst._id,
                        );
                        const pendingForThis =
                          inst.amount - (inst.paidAmount || 0);

                        return (
                          <div
                            key={inst._id}
                            onClick={() => toggleInstallment(inst)}
                            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex justify-between items-center group ${
                              isSelected
                                ? "border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100 shadow-sm"
                                : "border-slate-400 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                }`}
                              >
                                {isSelected ? (
                                  <FaCheck className="text-xs" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">
                                  {inst.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Due: {formatDate(inst.dueDate)}
                                </p>
                                {inst.paidAmount > 0 && (
                                  <p className="text-xs text-amber-600 mt-1 font-medium">
                                    Paid: ₹
                                    {inst.paidAmount.toLocaleString("en-IN")}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-900">
                                ₹{pendingForThis.toLocaleString("en-IN")}
                              </p>
                              <p className="text-xs text-slate-400">
                                of ₹{inst.amount.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-400">
                      <FaInfoCircle
                        className="mx-auto text-slate-300 mb-3"
                        size={32}
                      />
                      <p className="text-slate-500 font-bold text-sm">
                        No Installments Found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Make sure Fee Structure is set for this class
                      </p>
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedInsts.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mt-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                        <span className="text-sm font-bold text-purple-700">
                          Selected Months
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2 py-1 rounded-full">
                          {selectedInsts.length} selected
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-600 font-medium">
                        Total Amount:
                      </span>
                      <span className="text-lg font-bold text-purple-900">
                        ₹
                        {selectedInsts
                          .reduce(
                            (sum, inst) =>
                              sum + (inst.amount - (inst.paidAmount || 0)),
                            0,
                          )
                          .toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Middle Column: Payment Details Form */}
              <div className="lg:col-span-4 space-y-6 border-l border-r border-slate-400 px-6">
                <form
                  id="payment-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={
                          getSafeFeeNumbers(selectedStudent.feeDetails).pending
                        }
                        value={paymentForm.amountPaid}
                        onChange={(e) =>
                          updateFormField("amountPaid", e.target.value)
                        }
                        className="w-full bg-slate-50 rounded-xl pl-12 pr-6 py-4 text-xl font-bold outline-none transition-all border border-slate-400 focus:border-indigo-700"
                        required
                        placeholder="0.00"
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        Maximum: ₹
                        {getSafeFeeNumbers(
                          selectedStudent.feeDetails,
                        ).pending.toLocaleString("en-IN")}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          updateFormField(
                            "amountPaid",
                            getSafeFeeNumbers(selectedStudent.feeDetails)
                              .pending,
                          )
                        }
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-all duration-300 hover:scale-105"
                      >
                        Use Maximum
                      </button>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Payment Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) =>
                            updateFormField("paymentDate", e.target.value)
                          }
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none pl-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) =>
                          updateFormField("paymentMethod", e.target.value)
                        }
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none font-medium"
                        required
                      >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI / QR Code</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CHEQUE">Cheque</option>
                        <option value="CARD">Credit/Debit Card</option>
                        <option value="ONLINE">Online Payment</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Conditional Payment Fields */}
                    {paymentForm.paymentMethod === "UPI" && (
                      <input
                        type="text"
                        value={paymentForm.upiId}
                        onChange={(e) =>
                          updateFormField("upiId", e.target.value)
                        }
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none"
                        placeholder="UPI ID / Reference"
                      />
                    )}

                    {paymentForm.paymentMethod === "CHEQUE" && (
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={paymentForm.chequeNumber}
                          onChange={(e) =>
                            updateFormField("chequeNumber", e.target.value)
                          }
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none"
                          placeholder="Cheque Number"
                        />
                        <input
                          type="text"
                          value={paymentForm.bankName}
                          onChange={(e) =>
                            updateFormField("bankName", e.target.value)
                          }
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none"
                          placeholder="Bank Name"
                        />
                      </div>
                    )}

                    {["BANK_TRANSFER", "ONLINE", "CARD"].includes(
                      paymentForm.paymentMethod,
                    ) && (
                      <input
                        type="text"
                        value={paymentForm.transactionId}
                        onChange={(e) =>
                          updateFormField("transactionId", e.target.value)
                        }
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none"
                        placeholder="Transaction ID / Reference"
                      />
                    )}
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sendNotification"
                        checked={paymentForm.sendNotification}
                        onChange={(e) =>
                          updateFormField("sendNotification", e.target.checked)
                        }
                        className="w-4 h-4 text-purple-600 rounded border-slate-400 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="sendNotification"
                        className="text-sm font-medium text-slate-700"
                      >
                        Send payment confirmation to parent
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="generateReceipt"
                        checked={paymentForm.generateReceipt}
                        onChange={(e) =>
                          updateFormField("generateReceipt", e.target.checked)
                        }
                        className="w-4 h-4 text-purple-600 rounded border-slate-400 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="generateReceipt"
                        className="text-sm font-medium text-slate-700"
                      >
                        Generate payment receipt
                      </label>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Remarks / Notes
                    </label>
                    <textarea
                      value={paymentForm.remarks}
                      onChange={(e) =>
                        updateFormField("remarks", e.target.value)
                      }
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-400 focus:border-indigo-700 outline-none text-sm font-medium"
                      rows="3"
                      placeholder="Add any additional notes or remarks..."
                    />
                  </div>
                </form>
              </div>

              {/* Right Column: Allocation Preview */}
              <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                    Allocation Preview
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    See how payment will be distributed
                  </p>
                </div>

                {allocationPreview.items.length > 0 ? (
                  <div className="space-y-4 flex-1">
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar custom-scrollbar-white">
                      {allocationPreview.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-white">
                                  {item.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded ${
                                    item.status === "PAID"
                                      ? "bg-emerald-400/20 text-emerald-300"
                                      : item.status === "ADVANCE"
                                        ? "bg-purple-400/20 text-purple-300"
                                        : "bg-amber-400/20 text-amber-300"
                                  }`}
                                >
                                  {item.status === "PAID"
                                    ? "FULL"
                                    : item.status === "ADVANCE"
                                      ? "ADVANCE"
                                      : "PARTIAL"}
                                </span>
                              </div>
                              {item.dueDate && (
                                <p className="text-xs text-slate-400">
                                  Due: {formatDate(item.dueDate)}
                                </p>
                              )}
                              {item.alreadyPaid > 0 && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Already paid: ₹
                                  {item.alreadyPaid.toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-white">
                                ₹{item.amount.toLocaleString("en-IN")}
                              </p>
                              {item.neededAmount &&
                                item.status !== "ADVANCE" && (
                                  <p className="text-xs text-slate-400">
                                    of ₹
                                    {item.neededAmount.toLocaleString("en-IN")}
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">
                          Installments Covered
                        </span>
                        <span className="font-bold text-white">
                          {allocationPreview.summary.installmentsCovered}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">
                          Total Allocated
                        </span>
                        <span className="font-bold text-white">
                          ₹
                          {allocationPreview.summary.totalAllocated.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                        <span className="text-sm font-bold text-slate-300">
                          Balance Remaining
                        </span>
                        <span className="text-xl font-bold text-purple-300">
                          ₹
                          {Math.max(
                            0,
                            getSafeFeeNumbers(selectedStudent.feeDetails)
                              .pending - Number(paymentForm.amountPaid),
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-3 border-t border-white/10">
                        <span className="text-sm text-slate-400">
                          Total Payment
                        </span>
                        <span className="text-2xl font-bold text-white">
                          ₹
                          {(Number(paymentForm.amountPaid) || 0).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                    <FaInfoCircle size={48} className="text-slate-500 mb-4" />
                    <p className="text-sm text-slate-400 font-bold">
                      Ready for Input
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter amount or select months
                    </p>
                  </div>
                )}

                <div className="mt-6 bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-400 text-center">
                    {allocationPreview.summary.isManual
                      ? "💰 Manual selection active - Payment will go to selected installments"
                      : "⚡ Automatic allocation - Oldest dues cleared first"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-slate-400 bg-white flex gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedInsts([]);
                }}
                disabled={saving}
                className="flex-1 py-3 font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="payment-form"
                disabled={saving || !paymentForm.amountPaid}
                className="flex-[2] bg-indigo-700 text-white py-3 rounded-lg font-bold hover:bg-indigo-800 transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.02]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaCheckDouble />
                    Confirm & Record Payment
                    <span className="text-sm opacity-90 ml-2">
                      (₹
                      {(Number(paymentForm.amountPaid) || 0).toLocaleString(
                        "en-IN",
                      )}
                      )
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}