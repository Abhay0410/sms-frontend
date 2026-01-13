// components/admin/fee/FeeOverview.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";

/* ===================== COLOR MAP (TAILWIND SAFE) ===================== */
const COLOR_MAP = {
  green: {
    bg: "bg-green-50 hover:bg-green-100",
    text: "text-green-600",
    value: "text-green-700",
  },
  red: {
    bg: "bg-red-50 hover:bg-red-100",
    text: "text-red-600",
    value: "text-red-700",
  },
};

export default function FeeOverview({ academicYear }) {
  const [statistics, setStatistics] = useState(null);
  const [selectedList, setSelectedList] = useState(null); // paid | unpaid
  const [studentList, setStudentList] = useState([]);

  const [statsLoading, setStatsLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);

  /* ===================== LOAD STATISTICS ===================== */


  
  const loadStatistics = useCallback(async () => {
    try {
      setStatsLoading(true);

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

// const loadStatistics = useCallback(async () => {
//   try {
//     setStatsLoading(true);

//     const response = await api.get(API_ENDPOINTS.ADMIN.FEE.STATISTICS, {
//       params: { academicYear },
//     });

//     const stats = response.data?.data || response.data;

//     if (!stats) {
//       throw new Error("Statistics not available");
//     }

//     setStatistics({
//       totalStudents: Number(stats.totalStudents || 0),
//       totalExpected: Number(stats.totalExpected || 0),
//       totalCollected: Number(stats.totalCollected || 0),
//       totalPending: Number(stats.totalPending || 0),
//       collectionPercentage: Number(stats.collectionPercentage || 0),

//       paymentStatus: {
//         paid: Number(stats.paymentStatus?.paid || 0),
//         unpaid: Number(stats.paymentStatus?.unpaid || 0),
//         completed: Number(stats.paymentStatus?.completed || 0),
//         partial: Number(stats.paymentStatus?.partial || 0),
//         pending: Number(stats.paymentStatus?.pending || 0),
//         overdue: Number(stats.paymentStatus?.overdue || 0),
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     toast.error("Statistics not available");
//     setStatistics(null);
//   } finally {
//     setStatsLoading(false);
//   }
// }, [academicYear]);

  /* ===================== LOAD STUDENT LIST ===================== */
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
    loadStatistics();
  }, [loadStatistics]);

  if (statsLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  if (!statistics) return null;

  const collectionPercentage = statistics.collectionPercentage;



  /* ===================== UI ===================== */
  return (
    <div className="space-y-8">
      {/* ===================== TOP CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaUsers className="text-purple-600" />}
          label="Total Students"
          value={statistics.totalStudents}
        />

        <StatCard
          icon={<FaDollarSign className="text-blue-600" />}
          label="Total Expected"
          value={`₹${statistics.totalExpected.toLocaleString("en-IN")}`}
          bg="bg-blue-50"
        />

        <StatCard
          icon={<FaCheckCircle className="text-green-600" />}
          label="Total Collected"
          value={`₹${statistics.totalCollected.toLocaleString("en-IN")}`}
          bg="bg-green-50"
        />

        <StatCard
          icon={<FaExclamationCircle className="text-red-600" />}
          label="Total Pending"
          value={`₹${statistics.totalPending.toLocaleString("en-IN")}`}
          bg="bg-red-50"
        />
      </div>

      {/* ===================== COLLECTION PROGRESS ===================== */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            Fee Collection Progress
          </h3>
          <span className="text-3xl font-bold text-purple-600">
            {collectionPercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-6 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(collectionPercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* ===================== PAID / UNPAID ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClickableCard
          title="Paid Students"
          count={statistics.paymentStatus.paid}
          icon={<FaCheckCircle />}
          color="green"
          onClick={() => loadStudentList("paid")}
        />

        <ClickableCard
          title="Unpaid Students"
          count={statistics.paymentStatus.unpaid }
          icon={<FaExclamationCircle />}
          color="red"
          onClick={() => loadStudentList("unpaid")}
        />
      </div>

      {/* ===================== STUDENT LIST ===================== */}
      {selectedList && (
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-lg font-bold mb-4">
            {selectedList === "paid" ? "Paid Students" : "Unpaid Students"}
          </h3>

          {studentsLoading && (
            <p className="text-center text-slate-500">Loading students...</p>
          )}

          {!studentsLoading && studentList.length === 0 && (
            <p className="text-center text-slate-500">No students found</p>
          )}

          {!studentsLoading && studentList.length > 0 && (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {studentList.map((student) => (
                <li
                  key={student._id}
                  className="flex justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-slate-500">
                      {student.className}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{student.feeDetails.paidAmount} / ₹
                      {student.feeDetails.totalFee}
                    </p>
                    <p className="text-sm text-slate-500">
                      {student.feeDetails.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

const StatCard = ({ icon, label, value, bg = "bg-white" }) => (
  <div className={`p-6 rounded-2xl shadow border ${bg}`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <p className="text-sm text-slate-600">{label}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const ClickableCard = ({ title, count, icon, color, onClick }) => {
  const styles = COLOR_MAP[color];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-6 shadow border transition ${styles.bg}`}
    >
      <div className={`flex items-center gap-3 mb-2 ${styles.text}`}>
        {icon}
        <p className="text-sm">{title}</p>
      </div>
      <p className={`text-3xl font-bold ${styles.value}`}>{count}</p>
    </div>
  );
};
