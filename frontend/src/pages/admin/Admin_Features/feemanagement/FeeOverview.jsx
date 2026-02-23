import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { AnimatePresence, motion } from "framer-motion";

import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
  FaChartBar,
  FaArrowRight,
  FaFilter,
  FaChartPie,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

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

export default function FeeOverview() {
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

  const [statistics, setStatistics] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [classList, setClassList] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const getFormattedMonth = () =>
    selectedMonth !== "ALL"
      ? selectedMonth.substring(0, 3).toUpperCase()
      : undefined;
  // Removed unused variable: studentsLoading

  // Get current month for default selection
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
      `${API_ENDPOINTS.ADMIN.CLASS.STATISTICS}?academicYear=${academicYear}`
    );

    const classData = res?.data?.classes || res?.data || [];

    setClassList(classData);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load classes");
  }
}, [academicYear]);

  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      if (!academicYear) return;

      const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
        params: {
          academicYear,
          month: getFormattedMonth(),
          classId: selectedClass !== "ALL" ? selectedClass : undefined,
        },
      });

      const stats = response.data;
      setStatistics({
        totalStudents: Number(stats.totalStudents || 0),
        totalExpected: Number(stats.totalExpected || 0),
        totalCollected: Number(stats.totalCollected || 0),
        totalPending: Number(stats.totalPending || 0),
        collectionPercentage: Number(stats.collectionPercentage || 0),
        paymentStatus: {
          paid: Number(stats.paymentStatus?.paid || 0),
          unpaid: Number(stats.paymentStatus?.unpaid || 0),
          completed: Number(stats.paymentStatus?.completed || 0),
          partial: Number(stats.paymentStatus?.partial || 0),
          pending: Number(stats.paymentStatus?.pending || 0),
          overdue: Number(stats.paymentStatus?.overdue || 0),
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Statistics not available for this period");
    } finally {
      setStatsLoading(false);
    }
  }, [academicYear, selectedMonth ,selectedClass]);

  const loadStudentList = async (status) => {
    try {
      // Use a local variable instead of state since it's only used locally
      const _studentsLoading = true;

      setSelectedList(status);
      const res = await api.get(API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES, {
        params: {
          academicYear,
          status,
          month: getFormattedMonth(),
          classId: selectedClass !== "ALL" ? selectedClass : undefined,
        },
      });
      setStudentList(res?.data?.students || []);
    } catch {
      toast.error("Failed to load student list");
    } finally {
      // Loading state is handled by UI feedback, no need for separate state
    }
  };

  
useEffect(() => {
  if (academicYear) {
    loadClasses();
  }
}, [academicYear]);

useEffect(() => {
  if (academicYear) {
    loadStatistics();
  }
}, [academicYear, selectedMonth, selectedClass]);

useEffect(() => {
  if (statistics) {
    console.log("Payment Status:", statistics.paymentStatus);
  }
}, [statistics]);
  // Reset selectedList when month changes
  useEffect(() => {
    setSelectedList(null);
  }, [selectedMonth, selectedClass]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl  font-extrabold text-slate-900 tracking-tight">
            Fee Overview
          </h1>
          <p className="text-sm text-slate-600   font-medium mt-2">
            Comprehensive financial analytics and reports
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
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

      {/* Monthly Filter Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-[2.5rem] border border-purple-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white text-purple-600 rounded-2xl flex items-center justify-center shadow-md">
              <FaFilter size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Analytics Filter
              </h3>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Select month to view specific period collection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="
                  rounded-2xl 
                  border-2 
                  border-slate-200 
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
                  hover:border-slate-300
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
      rounded-2xl 
      border-2 
      border-slate-200 
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
      hover:border-slate-300
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
              onClick={loadStatistics}
              className="
                h-14 w-14 
                bg-slate-900 
                text-white 
                rounded-2xl 
                flex items-center justify-center 
                hover:bg-purple-600 
                transition-all
                shadow-md
                hover:shadow-lg
              "
              title="Refresh Statistics"
            >
              <FiRefreshCw
                className={statsLoading ? "animate-spin" : ""}
                size={20}
              />
            </button>
          </div>
        </div>

        {selectedMonth !== "ALL" && (
          <div className="mt-6 bg-white/80 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                Viewing data for:{" "}
                <span className="font-bold text-purple-600">
                  {selectedMonth}
                </span>
              </span>
              <span className="text-xs font-bold text-slate-400">
                {selectedMonth === getCurrentMonth()
                  ? "• Current Month"
                  : "• Historical Data"}
              </span>
            </div>
          </div>
        )}
      </div>

      {statsLoading ? (
        <LoadingView
          academicYear={academicYear}
          selectedMonth={selectedMonth}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Key Metrics Cards (ClassManagement Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<FaUsers />}
              label="Total Students"
              value={statistics.totalStudents}
              color="purple"
            />
            <StatCard
              icon={<FaDollarSign />}
              label={
                selectedMonth === "ALL"
                  ? "Annual Revenue"
                  : `${selectedMonth} Target`
              }
              value={`₹${statistics.totalExpected.toLocaleString("en-IN")}`}
              color="blue"
            />
            <StatCard
              icon={<FaCheckCircle />}
              label="Collected Amount"
              value={`₹${statistics.totalCollected.toLocaleString("en-IN")}`}
              color="emerald"
            />
            <StatCard
              icon={<FaExclamationCircle />}
              label="Pending Dues"
              value={`₹${statistics.totalPending.toLocaleString("en-IN")}`}
              color="rose"
            />
          </div>

          {/* Collection Progress Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-lg border border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl flex items-center justify-center">
                    <FaChartBar size={20} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Collection Efficiency
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      {selectedMonth === "ALL"
                        ? `Overall performance for ${academicYear}`
                        : `${selectedMonth} collection performance`}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${statistics?.collectionPercentage || 0}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full shadow-lg"
                    />
                  </div>

                  <div className="flex justify-between text-sm font-medium">
                    <div className="text-slate-600">
                      <span className="font-bold">
                        {statistics?.collectionPercentage || 0}%
                      </span>{" "}
                      collected
                    </div>
                    <div className="text-slate-600">
                      <span className="font-bold">
                        {100 - (statistics?.collectionPercentage || 0)}%
                      </span>{" "}
                      remaining
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="h-40 w-40 rounded-full border-[12px] border-slate-100 flex items-center justify-center shadow-lg">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="74"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="12"
                        strokeDasharray="464.96"
                        strokeDashoffset={
                          464.96 -
                          (464.96 * (statistics?.collectionPercentage || 0)) /
                            100
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-4xl font-black text-slate-900">
                      {statistics?.collectionPercentage || 0}%
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Collection Rate
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
            <SegmentCard
              title="Fully Paid"
              subtitle={
                selectedMonth === "ALL"
                  ? "All dues cleared for academic year"
                  : `All ${selectedMonth} dues cleared`
              }
              count={statistics?.paymentStatus?.paid || 0}
              color="emerald"
              isActive={selectedList === "paid"}
              onClick={() => loadStudentList("paid")}
            />

            <SegmentCard
              title="Pending Dues"
              subtitle={
                selectedMonth === "ALL"
                  ? "Includes partial and overdue payments"
                  : `${selectedMonth} dues pending`
              }
              count={statistics?.paymentStatus?.unpaid || 0}
              color="rose"
              isActive={selectedList === "unpaid"}
              onClick={() => loadStudentList("unpaid")}
            />
          </div>

          {/* 4. Dynamic Student List Dashboard */}
          {selectedList && (
            <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {selectedList === "paid"
                      ? "✅ Monthly Settled"
                      : "⚠️ Monthly Pending"}
                  </h3>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                    FILTER: {selectedMonth} • FOUND {studentList.length}{" "}
                    STUDENTS
                  </p>
                </div>
                <button
                  onClick={() => setSelectedList(null)}
                  className="px-6 py-2 bg-white/10 text-white rounded-full text-xs font-black uppercase"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar-white">
                {studentList.map((student) => {
                  // 🔥 Current selected month ki installment dhoondo
                  const monthKey =
                    selectedMonth !== "ALL"
                      ? selectedMonth.substring(0, 3).toUpperCase()
                      : null;

                  const monthlyInst = monthKey
                    ? student.feeDetails?.installments?.filter((i) =>
                        i.name.toUpperCase().startsWith(monthKey),
                      )
                    : null;

                  // Agar month select hai toh sirf us mahine ka data dikhao, warna yearly
                  // const displayPaid = monthlyInst ? monthlyInst.paidAmount : student.feeDetails.paidAmount;
                  // const displayTotal = monthlyInst ? monthlyInst.amount : student.feeDetails.totalFee;
                  // const displayStatus = monthlyInst ? monthlyInst.status : student.feeDetails.status;

                  const displayPaid = monthlyInst?.length
                    ? monthlyInst.reduce((sum, i) => sum + i.paidAmount, 0)
                    : student.feeDetails.paidAmount;

                  const displayTotal = monthlyInst?.length
                    ? monthlyInst.reduce((sum, i) => sum + i.amount, 0)
                    : student.feeDetails.totalFee;

                  const displayStatus = monthlyInst?.length
                    ? monthlyInst.every((i) => i.status === "PAID")
                      ? "PAID"
                      : "PARTIAL"
                    : student.feeDetails.status;

                  return (
                    <div
                      key={student._id}
                      className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-black text-lg">
                          {student.name}
                        </p>
                        <p className="text-white/40 text-[10px] font-bold uppercase">
                          {student.studentID}
                        </p>
                      </div>
                      <div className="text-right">
                        {/* 🔥 Ab yahan ₹41,000 / ₹41,000 dikhega monthly filter par */}
                        <p className="text-white font-black text-lg">
                          ₹{displayPaid.toLocaleString()} / ₹
                          {displayTotal.toLocaleString()}
                        </p>
                        <div
                          className={`mt-2 inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            displayStatus === "PAID"
                              ? "bg-emerald-400/20 text-emerald-400"
                              : "bg-rose-400/20 text-rose-400"
                          }`}
                        >
                          {displayStatus}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/* ===================== SUB-COMPONENTS ===================== */

const StatCard = ({ icon, label, value, color }) => {
  const colorMap = {
    purple: {
      bg: "bg-purple-50",
      iconBg: "bg-purple-100 text-purple-600",
      border: "border-purple-100",
    },
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-100 text-blue-600",
      border: "border-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100 text-emerald-600",
      border: "border-emerald-100",
    },
    rose: {
      bg: "bg-rose-50",
      iconBg: "bg-rose-100 text-rose-600",
      border: "border-rose-100",
    },
  };

  const colors = colorMap[color] || colorMap.purple;

  return (
    <div
      className={`p-8 rounded-[2.5rem] border-2 ${colors.border} ${colors.bg} shadow-sm hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex items-center justify-between mb-6">
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colors.iconBg} shadow-sm group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </span>
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">
        {value}
      </p>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {color === "emerald"
            ? "✅ Cleared"
            : color === "rose"
              ? "⚠️ Pending"
              : "📊 Metric"}
        </p>
      </div>
    </div>
  );
};

const SegmentCard = ({ title, subtitle, count, color, isActive, onClick }) => {
  const colorMap = {
    emerald: {
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      hoverBg: "hover:from-emerald-100 hover:to-green-100",
      border: "border-emerald-200",
      hoverBorder: "hover:border-emerald-400",
      text: "text-emerald-600",
      countText: "text-emerald-700",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-50 to-red-50",
      hoverBg: "hover:from-rose-100 hover:to-red-100",
      border: "border-rose-200",
      hoverBorder: "hover:border-rose-400",
      text: "text-rose-600",
      countText: "text-rose-700",
    },
  };

  const colors = colorMap[color] || colorMap.emerald;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-10 rounded-[2.5rem] border-2 cursor-pointer 
        transition-all duration-300 flex items-center justify-between
        ${colors.bg} ${colors.hoverBg} ${colors.border} ${colors.hoverBorder}
        ${isActive ? "border-purple-600 shadow-xl shadow-purple-100" : ""}
      `}
    >
      <div className="flex items-center gap-8">
        <div
          className={`h-20 w-20 rounded-3xl flex items-center justify-center text-2xl ${colors.text} bg-white/50`}
        >
          <FaUsers />
        </div>
        <div>
          <h4 className="text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h4>
          <p className="text-slate-500 text-sm font-medium mt-2 italic">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-5xl font-black ${colors.countText}`}>
          {count}
        </span>
        <FaArrowRight
          className={`text-slate-300 transition-colors ${isActive ? "text-purple-600" : ""}`}
          size={24}
        />
      </div>
    </motion.div>
  );
};

const LoadingView = ({ academicYear, selectedMonth }) => (
  <div className="flex flex-col items-center justify-center py-32 space-y-6">
    <div className="relative">
      <div className="h-20 w-20 rounded-full border-8 border-purple-200"></div>
      <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-8 border-purple-600 border-t-transparent animate-spin"></div>
    </div>
    <div className="text-center space-y-2">
      <p className="text-purple-600 font-black uppercase tracking-widest text-sm animate-pulse">
        Loading Analytics Dashboard
      </p>
      <p className="text-slate-500 font-medium text-sm">
        {selectedMonth === "ALL"
          ? `Fetching data for ${academicYear}`
          : `Fetching ${selectedMonth} data for ${academicYear}`}
      </p>
    </div>
  </div>
);

const NoAcademicYearView = () => (
  <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
    <div className="h-24 w-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <FaCalendarAlt className="h-12 w-12 text-purple-400" />
    </div>
    <h3 className="text-3xl font-black text-slate-900 mb-3">
      Select Academic Year
    </h3>
    <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">
      Choose an academic year from the dropdown above to view detailed fee
      analytics and collection statistics.
    </p>
    <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-400">
      <div className="h-2 w-2 bg-slate-300 rounded-full animate-pulse"></div>
      <span>Waiting for session selection</span>
    </div>
  </div>
);
