import React, { useEffect, useState, useCallback } from "react";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { toast } from "react-toastify";
import {
  FaMoneyBillWave,
  FaSave,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";

export default function PayrollManager() {
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  const [params, setParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  /* ================= FETCH ================= */
  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.ADMIN.PAYROLL.LIST, { params });
      setPayrolls(res.data || []);
    } catch (err) {
      toast.error(err+"Failed to fetch payrolls");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  /* ================= ACTIONS ================= */
  const generatePayroll = async () => {
    try {
      setLoading(true);
      await api.post(API_ENDPOINTS.ADMIN.PAYROLL.GENERATE, params);
      toast.success("Payroll generated");
      fetchPayrolls();
    } catch {
      toast.error("Payroll generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id, field, value) => {
    setPayrolls((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, [field]: Number(value) } : p
      )
    );
  };

  const savePayroll = async (p) => {
    try {
      await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.UPDATE_PAYROLL(p._id), {
        unpaidLeaveDeduction: p.unpaidLeaveDeduction,
        taxDeduction: p.taxDeduction,
      });
      toast.success("Payroll updated");
      fetchPayrolls();
    } catch {
      toast.error("Update failed");
    }
  };

  const markPaid = async (id) => {
    try {
      await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.MARK_PAID(id));
      toast.success("Marked as PAID");
      fetchPayrolls();
    } catch {
      toast.error("Failed");
    }
  };

  const deleteDraft = async (id) => {
    try {
      await api.delete(API_ENDPOINTS.ADMIN.PAYROLL.DELETE_DRAFT(id));
      toast.success("Draft deleted");
      fetchPayrolls();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-3xl shadow flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">
              Payroll Manager
            </h2>
            <p className="text-slate-500 text-sm">
              Generate & manage monthly salaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
          <select
            value={params.month}
            onChange={(e) =>
              setParams({ ...params, month: Number(e.target.value) })
            }
            className="bg-transparent outline-none font-semibold"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en", { month: "long" })}
              </option>
            ))}
          </select>

          <button
            onClick={generatePayroll}
            disabled={loading}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Run Payroll"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {[
                "Teacher",
                "Basic",
                "Allowances",
                "Pension",
                "Leave",
                "Tax",
                "Net",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="p-4 text-left font-bold text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {payrolls.map((p) => (
              <tr
                key={p._id}
                className={`border-t hover:bg-slate-50 transition ${
                  p.status === "PAID" && "opacity-70"
                }`}
              >
                <td className="p-4 font-semibold">
                  {p.teacherId?.name}
                </td>
                <td>₹{p.baseSalary}</td>
                <td>₹{p.allowances}</td>
                <td>₹{p.pensionContribution}</td>

                <td>
                  <input
                    type="number"
                    value={p.unpaidLeaveDeduction}
                    disabled={p.status === "PAID"}
                    onChange={(e) =>
                      handleChange(
                        p._id,
                        "unpaidLeaveDeduction",
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-2 w-24 disabled:bg-gray-100"
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={p.taxDeduction}
                    disabled={p.status === "PAID"}
                    onChange={(e) =>
                      handleChange(p._id, "taxDeduction", e.target.value)
                    }
                    className="border rounded-lg px-2 w-24 disabled:bg-gray-100"
                  />
                </td>

                <td className="font-extrabold text-emerald-700">
                  ₹{p.netSalary}
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.status === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="flex gap-2 py-2">
                  {p.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => savePayroll(p)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:scale-110 transition"
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={() => markPaid(p._id)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:scale-110 transition"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => deleteDraft(p._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:scale-110 transition"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payrolls.length === 0 && (
          <p className="p-6 text-center text-slate-400">
            No payroll records found
          </p>
        )}
      </div>
    </div>
  );
}
