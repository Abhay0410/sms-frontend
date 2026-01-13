import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaDollarSign,
  FaCalendarAlt,
} from "react-icons/fa";

export default function FeeOverview({ academicYear }) {
  const [statistics, setStatistics] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);

      // यदि academicYear नहीं है तो return
      if (!academicYear) {
        toast.info("Please select an academic year");
        return;
      }

      const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
        params: { academicYear },
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
      toast.error(err + "Statistics not available");
    } finally {
      setStatsLoading(false);
    }
  }, [academicYear]);

  const loadStudentList = async (status) => {
    try {
      setStudentsLoading(true);
      setSelectedList(status);

      const res = await api.get(API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES, {
        params: { academicYear, status },
      });

      setStudentList(res?.data?.students || []);
    } catch (err) {
      toast.error(err + "Failed to load student list");
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (academicYear) {
      loadStatistics();
    }
  }, [loadStatistics, academicYear]);

  // यदि academicYear select नहीं किया गया है
  if (!academicYear) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaCalendarAlt className="h-8 w-8 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Select Academic Year</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Please select an academic year from the dropdown above to view fee statistics
        </p>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        <p className="mt-4 text-slate-500 font-medium">
          Loading fee statistics for <span className="font-bold text-purple-600">{academicYear}</span>...
        </p>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaDollarSign className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
        <p className="text-slate-600 mb-6">
          No fee data found for academic year <span className="font-bold">{academicYear}</span>
        </p>
        <button 
          onClick={loadStatistics}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 transition-all"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  const collectionPercentage = statistics.collectionPercentage;

  return (
    <div className="space-y-8">
      {/* Academic Year Banner */}
      {/* <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-3xl border border-purple-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <FaCalendarAlt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Viewing Fee Data</h3>
              <p className="text-2xl font-black text-purple-600">{academicYear}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Collection Rate</p>
              <p className="text-3xl font-black text-slate-900">{collectionPercentage}%</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* ===================== TOP CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaUsers className="text-purple-600" />}
          label="Total Students"
          value={statistics.totalStudents}
          bg="bg-gradient-to-br from-purple-50 to-white"
        />

        <StatCard
          icon={<FaDollarSign className="text-blue-600" />}
          label="Total Expected"
          value={`₹${statistics.totalExpected.toLocaleString("en-IN")}`}
          bg="bg-gradient-to-br from-blue-50 to-white"
        />

        <StatCard
          icon={<FaCheckCircle className="text-green-600" />}
          label="Total Collected"
          value={`₹${statistics.totalCollected.toLocaleString("en-IN")}`}
          bg="bg-gradient-to-br from-green-50 to-white"
        />

        <StatCard
          icon={<FaExclamationCircle className="text-red-600" />}
          label="Total Pending"
          value={`₹${statistics.totalPending.toLocaleString("en-IN")}`}
          bg="bg-gradient-to-br from-red-50 to-white"
        />
      </div>

      {/* ===================== COLLECTION PROGRESS ===================== */}
      <div className="rounded-3xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Fee Collection Progress
            </h3>
            <p className="text-slate-500 text-sm mt-1">Academic Year: {academicYear}</p>
          </div>
          <span className="text-4xl font-black text-purple-600 mt-2 md:mt-0">
            {collectionPercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 h-6 rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(collectionPercentage, 100)}%`,
            }}
          />
        </div>
        
        <div className="mt-4 flex justify-between text-sm text-slate-500 font-medium">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ===================== PAID / UNPAID ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClickableCard
          title="Paid Students"
          count={statistics.paymentStatus.paid}
          icon={<FaCheckCircle />}
          color="green"
          academicYear={academicYear}
          onClick={() => loadStudentList("paid")}
        />

        <ClickableCard
          title="Unpaid Students"
          count={statistics.paymentStatus.unpaid}
          icon={<FaExclamationCircle />}
          color="red"
          academicYear={academicYear}
          onClick={() => loadStudentList("unpaid")}
        />
      </div>

      {/* ===================== STUDENT LIST ===================== */}
      {selectedList && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {selectedList === "paid" ? "✅ Paid Students" : "⚠️ Unpaid Students"}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Academic Year: {academicYear} • {studentList.length} students
              </p>
            </div>
            <button 
              onClick={() => setSelectedList(null)}
              className="text-sm text-slate-500 hover:text-slate-700 mt-2 md:mt-0"
            >
              Close List
            </button>
          </div>

          {studentsLoading && (
            <div className="text-center py-10">
              <div className="h-8 w-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading students...</p>
            </div>
          )}

          {!studentsLoading && studentList.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
              <FaUsers className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                No {selectedList} students found for {academicYear}
              </p>
            </div>
          )}

          {!studentsLoading && studentList.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {studentList.map((student) => (
                <div
                  key={student._id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-purple-300 transition-all bg-white hover:shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-lg text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-500">
                        Class {student.className} • ID: {student.studentID}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900">
                        ₹{student.feeDetails?.paidAmount?.toLocaleString("en-IN") || 0} / ₹
                        {student.feeDetails?.totalFee?.toLocaleString("en-IN") || 0}
                      </p>
                      <p className={`text-sm font-bold ${selectedList === "paid" ? "text-green-600" : "text-red-600"}`}>
                        {student.feeDetails?.status || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

const StatCard = ({ icon, label, value, bg = "bg-white" }) => (
  <div className={`p-6 rounded-3xl shadow border border-slate-100 ${bg}`}>
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <p className="text-sm font-bold text-slate-600">{label}</p>
    </div>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

const ClickableCard = ({ title, count, icon, color, academicYear, onClick }) => {
  const colorStyles = {
    green: {
      bg: "bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100",
      border: "border-green-200 hover:border-green-400",
      text: "text-green-600",
      value: "text-green-700",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100",
      border: "border-red-200 hover:border-red-400",
      text: "text-red-600",
      value: "text-red-700",
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-3xl p-6 shadow border transition-all duration-300 ${colorStyles.bg} ${colorStyles.border}`}
    >
      <div className={`flex items-center gap-3 mb-3 ${colorStyles.text}`}>
        {icon}
        <p className="text-sm font-bold">{title}</p>
      </div>
      <p className={`text-4xl font-black ${colorStyles.value}`}>{count}</p>
      <p className="text-xs text-slate-500 mt-2">Academic Year: {academicYear}</p>
    </div>
  );
};