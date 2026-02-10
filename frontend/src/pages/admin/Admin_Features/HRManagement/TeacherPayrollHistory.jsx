import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { toast } from "react-toastify";
import { FaRupeeSign } from "react-icons/fa";
import BackButton from "../../../../components/BackButton";

export default function TeacherPayrollHistory() {
  const { teacherId } = useParams();
  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        API_ENDPOINTS.ADMIN.PAYROLL.TEACHER_HISTORY(teacherId),
      );
      console.log("Teacher ID:", teacherId);
console.log("Payrolls:", res.data);

      setPayrolls(res.data || []);
    } catch (error) {
     toast.error(
  error?.response?.data?.message || "Failed to load payroll history"
);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <BackButton />
      <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
        Teacher Payroll History
      </h2>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Month</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && payrolls.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-slate-400">
                  No payroll records found
                </td>
              </tr>
            )}

            {payrolls.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-4 font-bold">
                  {new Date(p.year, p.month - 1).toLocaleString("en", {
                    month: "long",
                    year: "numeric"
                  })}
                </td>
                <td>₹{p.baseSalary}</td>
                <td>₹{p.allowances}</td>
                <td>₹{p.totalDeductions}</td>
                <td className="font-black text-emerald-600">
                  ₹{p.netSalary}
                </td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
