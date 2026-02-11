

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../../../services/api";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaSave, FaEye, FaCalendarAlt } from "react-icons/fa";

export default function SalarySetup() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const navigate = useNavigate();

  // ================= FETCH DATA =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const [teacherRes, payrollRes] = await Promise.all([
        api.get(API_ENDPOINTS.ADMIN.TEACHER.LIST),
        api.get(API_ENDPOINTS.ADMIN.PAYROLL.LIST, {
          params: { month, year },
        }),
      ]);

      const payrolls = payrollRes.data || [];

      const mapped = (teacherRes.data || []).map((t) => {
        const payroll = payrolls.find(
          (p) => p.teacherId?._id === t._id || p.teacherId === t._id
        );

        const basic = t.salary?.basic || 0;
        const allowances = t.salary?.allowances || 0;
        const pf = Math.round(basic * 0.1);
        const unpaid = payroll?.unpaidLeaveDeduction || 0;
        const tax = payroll?.taxDeduction || 0;

        const totalDeductions = pf + unpaid + tax;
        const netSalary = basic + allowances - totalDeductions;

        return {
          ...t,
          payrollId: payroll?._id,
          status: payroll?.status || "DRAFT",
          salary: {
            basic,
            allowances,
            pf,
            unpaid,
            tax,
            totalDeductions,
            netSalary,
          },
        };
      });

      setTeachers(mapped);
    } catch (err) {
      toast.error(err+"Failed to load salary data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  // ================= HANDLE CHANGE =================
  const handleChange = (id, field, value) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t._id !== id) return t;
        if (t.status === "PAID") return t;

        const salary = { ...t.salary, [field]: value };
        salary.pf = Math.round(salary.basic * 0.1);
        salary.totalDeductions = salary.pf + salary.unpaid + salary.tax;
        salary.netSalary = salary.basic + salary.allowances - salary.totalDeductions;

        return { ...t, salary };
      })
    );
  };

  // ================= SAVE =================
  const savePayroll = async (teacher) => {
    try {
      if (teacher.status === "PAID") {
        toast.error("Paid payroll cannot be edited");
        return;
      }

      await api.patch(API_ENDPOINTS.ADMIN.PAYROLL.SALARY_UPDATE(teacher._id), {
        salary: {
          basic: teacher.salary.basic,
          allowances: teacher.salary.allowances,
        },
      });

      if (!teacher.payrollId) {
        toast.error("Generate payroll first");
        return;
      }

      await api.patch(
        API_ENDPOINTS.ADMIN.PAYROLL.UPDATE_PAYROLL(teacher.payrollId),
        {
          unpaidLeaveDeduction: teacher.salary.unpaid,
          taxDeduction: teacher.salary.tax,
        }
      );

      toast.success("Salary updated successfully");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  // ================= GENERATE PAYROLL =================
  const generatePayroll = async () => {
    try {
      await api.post(API_ENDPOINTS.ADMIN.PAYROLL.GENERATE, { month, year });
      toast.success("Payroll generated successfully");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payroll already generated");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl">
            <FaMoneyBillWave />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Staff Salary Setup</h2>
            <p className="text-slate-500">Configure & review monthly salaries</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
          <FaCalendarAlt className="text-slate-400" />
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={generatePayroll}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700"
          >
            Generate Payroll
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-4 text-left">Teacher</th>
              <th>Basic</th>
              <th>Allowances</th>
              <th>PF</th>
              <th>Leave</th>
              <th>Tax</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="p-6 text-center">Loading...</td></tr>
            ) : (
              teachers.map((t) => (
                <tr key={t._id} className="border-t hover:bg-slate-50">
                  <td className="p-4 font-semibold">{t.name}</td>
                  <td><input type="number" value={t.salary.basic} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "basic", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24" /></td>
                  <td><input type="number" value={t.salary.allowances} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "allowances", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-24" /></td>
                  <td>₹{t.salary.pf}</td>
                  <td><input type="number" value={t.salary.unpaid} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "unpaid", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20" /></td>
                  <td><input type="number" value={t.salary.tax} disabled={t.status === "PAID"}
                    onChange={(e) => handleChange(t._id, "tax", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-20" /></td>
                  <td className="font-bold text-emerald-600">₹{t.salary.netSalary}</td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="flex gap-2 p-2">
                    <button onClick={() => savePayroll(t)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded flex items-center gap-1">
                      <FaSave /> Save
                    </button>
                    <button onClick={() => navigate(`/admin/teacher-payroll-history/${t._id}`)}
                      className="border px-3 py-1 rounded flex items-center gap-1">
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
