import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import {
  FaCheckCircle,
  FaTrash,
  FaRupeeSign
} from "react-icons/fa";

export default function PayrollList() {
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);

  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // 🔹 Fetch Payroll List
  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(API_ENDPOINTS.ADMIN.PAYROLL.LIST, {
        params: filters
      });
      console.log("Payroll API response:", data);

      setPayrolls(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch payroll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  },[filters.month, filters.year]);

  // 🔹 Mark Paid
  const markAsPaid = async (id) => {
    try {
      await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.MARK_PAID(id));
      toast.success("Salary marked as PAID");
      fetchPayrolls();
    } catch (error) {
      toast.error(error.message || "Failed to mark paid");
    }
  };

  const generatePayroll = async () => {
  try {
    await api.post(API_ENDPOINTS.ADMIN.PAYROLL.GENERATE, filters);
    toast.success("Payroll generated");
    fetchPayrolls();
  } catch (e) {
    toast.error(e.message || "Failed to generate payroll");
  }
};

  // 🔹 Delete Draft
  const deleteDraft = async (id) => {
    if (!window.confirm("Delete this draft payroll?")) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN.PAYROLL.DELETE_DRAFT(id));
      toast.success("Draft payroll deleted");
      fetchPayrolls();
    } catch (error) {
      toast.error(error.message || "Failed to delete payroll");
    }
  };

  return (
    <div className="space-y-6">

      <button
  onClick={generatePayroll}
  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold"
>
  Generate Payroll
</button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">
          Monthly Payroll
        </h2>

        <div className="flex gap-3">
          <select
            value={filters.month}
            onChange={(e) =>
              setFilters({ ...filters, month: e.target.value })
            }
            className="border rounded-xl px-4 py-2 font-semibold"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={filters.year}
            onChange={(e) =>
              setFilters({ ...filters, year: e.target.value })
            }
            className="border rounded-xl px-4 py-2 font-semibold w-28"
          />

          <button
            onClick={fetchPayrolls}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold"
          >
            Load
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-bold">
            <tr>
              <th className="p-4 text-left">Teacher</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="p-6 text-center">
                  Loading payroll...
                </td>
              </tr>
            )}

            {!loading && payrolls.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-400">
                  No payroll found
                </td>
              </tr>
            )}

            {payrolls.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-4">
                  <p className="font-bold">{p.teacherId?.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.teacherId?.email}
                  </p>
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

                <td className="text-center space-x-2">
                  {p.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => markAsPaid(p._id)}
                        className="text-emerald-600 hover:text-emerald-800"
                        title="Mark Paid"
                      >
                        <FaCheckCircle />
                      </button>

                      <button
                        onClick={() => deleteDraft(p._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Draft"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}

                  {p.status === "PAID" && (
                    <FaRupeeSign className="inline text-slate-400" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
