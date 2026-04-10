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
  FaMoneyBillWave,
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
  const [allStudentsData, setAllStudentsData] = useState([]); // ✅ Sabhi students ka data store karne ke liye
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [classList, setClassList] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [session, setSession] = useState(null);

  const getFormattedMonth = useCallback(
    () =>
      selectedMonth !== "ALL"
        ? selectedMonth.substring(0, 3).toUpperCase()
        : undefined,
    [selectedMonth],
  );
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
        `${API_ENDPOINTS.ADMIN.CLASS.STATISTICS}?academicYear=${academicYear}`,
      );

      const classData = res?.data?.classes || res?.data || [];

      setClassList(classData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load classes");
    }
  }, [academicYear]);

  const loadAllFeeData = useCallback(async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES, {
        params: {
          academicYear,
          month: getFormattedMonth(),
          classId: selectedClass !== "ALL" ? selectedClass : undefined,
          // status remove kar diya taaki saara data mile logic ke liye
        },
      });
      const students = res?.data?.students || [];
      setAllStudentsData(students);
    } catch (err) {
      console.error("Failed to load fee context", err);
    }
  }, [academicYear, selectedClass, getFormattedMonth]);

  const fetchSessions = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.SESSION.GET_All_SESSION);

      console.log("FULL RES:", res);

      // ✅ Always correct data
      let sessionData = Array.isArray(res) ? res : res?.data || [];

      // ✅ Remove duplicates (safe)
      sessionData = sessionData.filter(
        (s, index, self) =>
          index ===
          self.findIndex(
            (x) => x.startYear === s.startYear && x.endYear === s.endYear,
          ),
      );

      // ✅ Sort
      sessionData.sort((a, b) => a.startYear - b.startYear);

      console.log("FINAL SESSION DATA:", sessionData);

      setSession(sessionData);

      // ✅ Active session select
      const savedSession = localStorage.getItem("academicYear");

      setAcademicYear((prev) => {
        if (savedSession) return savedSession; // ✅ user selection priority

        const active = sessionData.find((s) => s?.isActive);
        return active ? `${active.startYear}-${active.endYear}` : "";
      });
    } catch (err) {
      console.error("Session fetch error", err);
    }
  };

  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);
      if (!academicYear) return;

      // ✅ 1. Pehle Stats fetch karo
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

      // ✅ 2. Phir parallel mein list fetch karo agar zaroori ho
      await loadAllFeeData();
    } catch (err) {
      console.error(err);
      toast.error("Statistics not available for this period");
    } finally {
      setStatsLoading(false);
    }
  }, [academicYear, selectedClass, getFormattedMonth, loadAllFeeData]);

  // 2. Dashboard Stats ko Override karne ke liye counting logic
  const syncedStats = useMemo(() => {
    if (!allStudentsData.length) return statistics;

    // Filter logic exactly wahi jo aapke student list panel mein hai
    const paidList = allStudentsData.filter((student) => {
      const monthKey =
        selectedMonth !== "ALL"
          ? selectedMonth.substring(0, 3).toUpperCase()
          : null;
      const monthlyInst = monthKey
        ? student.feeDetails?.installments?.filter((i) =>
            i.name.toUpperCase().startsWith(monthKey),
          )
        : null;

      if (monthlyInst?.length) {
        return monthlyInst.every((i) => i.status === "PAID");
      }
      return student.feeDetails.status === "PAID";
    });

    const unpaidList = allStudentsData.filter(
      (student) => !paidList.find((p) => p._id === student._id),
    );

    return {
      ...statistics,
      paymentStatus: {
        paid: paidList.length,
        unpaid: unpaidList.length,
      },
    };
  }, [allStudentsData, statistics, selectedMonth]);

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
    fetchSessions(); // ✅ only once
  }, []);

  useEffect(() => {
    if (academicYear) {
      loadClasses();
    }
  }, [academicYear, loadClasses]);

  useEffect(() => {
    if (academicYear) {
      loadStatistics();
    }
  }, [academicYear, loadStatistics]);

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
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-3 ">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <FaMoneyBillWave size={35} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Fee Overview
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Comprehensive financial analytics and reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-400 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">
            Session:
          </span>
          <select
            value={academicYear}
            onChange={(e) => {
              const value = e.target.value;
              setAcademicYear(value);
              localStorage.setItem("academicYear", value); // ✅ save
            }}
            className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-black"
          >
            {session?.map((s) => (
              <option key={s._id} value={`${s.startYear}-${s.endYear}`}>
                {s.startYear}-{s.endYear}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-400 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 text-purple-600 rounded-lg flex items-center justify-center">
            <FaFilter size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Analytics Filter
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="
                  rounded-lg 
                  border 
                  border-slate-400 
                  bg-slate-50 
                  pl-3 
                  pr-8 
                  py-2 
                  text-sm 
                  font-semibold 
                  text-slate-700 
                  outline-none 
                  focus:ring-2 
                  focus:ring-purple-500/20 
                  focus:border-purple-500
                  hover:border-slate-400
                  transition-all
                  shadow-sm
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
          </div>

          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="
                  rounded-lg 
                  border 
                  border-slate-400 
                  bg-slate-50 
                  pl-3 
                  pr-8 
                  py-2 
                  text-sm 
                  font-semibold 
      text-slate-700 
      outline-none 
      focus:ring-2 
      focus:ring-purple-500/20 
      focus:border-purple-500
      hover:border-slate-400
      transition-all
      shadow-sm
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
          </div>

          <button
            onClick={loadStatistics}
            className="
                h-9 w-9 
                bg-amber-500 
                text-white 
                rounded-lg 
                flex items-center justify-center 
                hover:bg-amber-600 
                transition-all
                shadow-md
              "
            title="Refresh Statistics"
          >
            <FiRefreshCw
              className={statsLoading ? "animate-spin" : ""}
              size={16}
            />
          </button>
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
          className="space-y-5"
        >
          {/* Key Metrics Cards (ClassManagement Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FaUsers />}
              label="Total Students"
              value={syncedStats?.totalStudents || 0}
              color="purple"
            />
            <StatCard
              icon={<FaDollarSign />}
              label={
                selectedMonth === "ALL"
                  ? "Annual Revenue"
                  : `${selectedMonth} Target`
              }
              value={`₹${(syncedStats?.totalExpected || 0).toLocaleString("en-IN")}`}
              color="blue"
            />
            <StatCard
              icon={<FaCheckCircle />}
              label="Collected Amount"
              value={`₹${(syncedStats?.totalCollected || 0).toLocaleString("en-IN")}`}
              color="emerald"
            />
            <StatCard
              icon={<FaExclamationCircle />}
              label="Pending Students"
              value={syncedStats?.paymentStatus?.unpaid || 0} // ✅ Ab ye hamesha list se match karega
              color="rose"
            />
          </div>

          {/* Collection Progress Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-400">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg flex items-center justify-center">
                    <FaChartBar size={14} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Collection Efficiency
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${syncedStats?.collectionPercentage || 0}%`,
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full"
                    />
                  </div>

                  <div className="flex justify-between text-xs font-medium">
                    <div className="text-slate-600">
                      <span className="font-bold">
                        {syncedStats?.collectionPercentage || 0}%
                      </span>{" "}
                      collected
                    </div>
                    <div className="text-slate-600">
                      <span className="font-bold">
                        {100 - (syncedStats?.collectionPercentage || 0)}%
                      </span>{" "}
                      remaining
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center shrink-0">
                <div className="relative h-20 w-20 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="8"
                      strokeDasharray="226.19"
                      strokeDashoffset={
                        226.19 -
                        (226.19 * (syncedStats?.collectionPercentage || 0)) /
                          100
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-lg font-bold text-slate-900">
                    {syncedStats?.collectionPercentage || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SegmentCard
              title="Fully Paid"
              subtitle={
                selectedMonth === "ALL"
                  ? "All dues cleared for academic year"
                  : `All ${selectedMonth} dues cleared`
              }
              count={syncedStats?.paymentStatus?.paid || 0}
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
              count={syncedStats?.paymentStatus?.unpaid || 0}
              color="rose"
              isActive={selectedList === "unpaid"}
              onClick={() => loadStudentList("unpaid")}
            />
          </div>

          {/* 4. Dynamic Student List Dashboard */}
          {selectedList && (
            <div className="bg-slate-900 rounded-xl p-6 shadow-xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {selectedList === "paid"
                      ? "✅ Monthly Settled"
                      : "⚠️ Monthly Pending"}
                  </h3>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">
                    FILTER: {selectedMonth} • FOUND {studentList.length}{" "}
                    STUDENTS
                  </p>
                </div>
                <button
                  onClick={() => setSelectedList(null)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 transition-colors text-white rounded-lg text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar-white">
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
                      className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-bold text-sm truncate max-w-[120px]">
                          {student.name}
                        </p>
                        <p className="text-white/40 text-[10px] font-bold mt-0.5 uppercase">
                          {student.studentID}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">
                          ₹{displayPaid.toLocaleString()}{" "}
                          <span className="text-white/40">
                            / ₹{displayTotal.toLocaleString()}
                          </span>
                        </p>
                        <div
                          className={`mt-1 inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
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
      className={`p-5 rounded-xl border ${colors.border} ${colors.bg} shadow-sm hover:shadow-md transition-all duration-300 group flex items-center gap-4`}
    >
      <div
        className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-xl ${colors.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 tracking-tight">
          {value}
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
        p-5 rounded-xl border cursor-pointer 
        transition-all duration-300 flex items-center justify-between
        ${colors.bg} ${colors.hoverBg} ${colors.border} ${colors.hoverBorder}
        ${isActive ? "border-purple-500 shadow-md ring-1 ring-purple-500" : ""}
      `}
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${colors.text} bg-white/50`}
        >
          <FaUsers />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h4>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-3xl font-bold ${colors.countText}`}>
          {count}
        </span>
        <FaArrowRight
          className={`text-slate-400 transition-colors ${isActive ? "text-purple-600" : ""}`}
          size={16}
        />
      </div>
    </motion.div>
  );
};

const LoadingView = ({ academicYear, selectedMonth }) => (
  <div className="flex flex-col items-center justify-center py-20 space-y-4">
    <div className="relative">
      <div className="h-12 w-12 rounded-full border-4 border-purple-100"></div>
      <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
    </div>
    <div className="text-center space-y-1">
      <p className="text-purple-600 font-bold uppercase tracking-widest text-xs animate-pulse">
        Loading Analytics Dashboard
      </p>
      <p className="text-slate-500 font-medium text-xs">
        {selectedMonth === "ALL"
          ? `Fetching data for ${academicYear}`
          : `Fetching ${selectedMonth} data for ${academicYear}`}
      </p>
    </div>
  </div>
);

const NoAcademicYearView = () => (
  <div className="text-center py-40 bg-white rounded-2xl border-2 border-dashed border-slate-400">
    <div className="h-24 w-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
      <FaCalendarAlt className="h-12 w-12 text-purple-400" />
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-3">
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
