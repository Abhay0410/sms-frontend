// components/admin/fee/SetClassFees.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const FREQUENCY_OPTIONS = [
  "YEARLY",
  "ONE_TIME",
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
];

export default function SetClassFees({ academicYear }) {

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Class-level fee settings
  const [settingsForm, setSettingsForm] = useState({
    paymentSchedule: "YEARLY",
    dueDate: "",
    lateFeeAmount: 0,
    lateFeeApplicableAfter: "",
  });

  // Per-head structure array for selected class
  const [feeRows, setFeeRows] = useState([]);

  // ----------------- Load classes -----------------
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);

      const resp = await api.get(API_ENDPOINTS.ADMIN.FEE.CLASS_FEES, {
        params: { academicYear },
      });

      const classesData =
        resp.data?.data?.classes || resp.data?.classes || resp.classes || [];

      setClasses(classesData);
    } catch (error) {
      console.error("❌ Failed to load classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // ----------------- Helpers -----------------
  const handleSettingsChange = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFeeRow = () => {
    setFeeRows((prev) => [
      ...prev,
      {
        headId: "",
        headName: "",
        amount: 0,
        frequency: "YEARLY",
        dueMonth: "",
        lateFee: 0,
      },
    ]);
  };

  const updateFeeRow = (index, field, value) => {
    setFeeRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]:
                field === "amount" || field === "lateFee"
                  ? Number(value || 0)
                  : value,
            }
          : row
      )
    );
  };

  const removeFeeRow = (index) => {
    setFeeRows((prev) => prev.filter((_, i) => i !== index));
  };

  const getClassTotalFee = (classData) => {
    if (!classData.feeStructure || !Array.isArray(classData.feeStructure))
      return 0;
    // classData.feeStructure already in new format (amount, frequency)
    return classData.feeStructure.reduce(
      (sum, item) => sum + (item.annualAmount || item.amount || 0),
      0
    );
  };

  const calculateFormTotal = () => {
    return feeRows.reduce((sum, row) => sum + (row.amount || 0), 0);
  };

  // ----------------- Edit clicked -----------------
  const handleEdit = (classData) => {
    setSelectedClass(classData);

    // Map backend feeStructure to editable rows
    const rows =
      (classData.feeStructure || []).map((f) => ({
        headId: f.head?._id || f.head || "",
        headName: f.headName || f.head?.name || "",
        amount: f.amount || 0,
        frequency: f.frequency || "YEARLY",
        dueMonth: f.dueMonth || "",
        lateFee: f.lateFee || 0,
      })) || [];

    setFeeRows(
      rows.length
        ? rows
        : [
            {
              headId: "",
              headName: "",
              amount: 0,
              frequency: "YEARLY",
              dueMonth: "",
              lateFee: 0,
            },
          ]
    );

    setSettingsForm({
      paymentSchedule: classData.feeSettings?.paymentSchedule || "YEARLY",
      dueDate: classData.feeSettings?.dueDate
        ? new Date(classData.feeSettings.dueDate).toISOString().split("T")[0]
        : "",
      lateFeeAmount: classData.feeSettings?.lateFeeAmount || 0,
      lateFeeApplicableAfter: classData.feeSettings?.lateFeeApplicableAfter
        ? new Date(classData.feeSettings.lateFeeApplicableAfter)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setShowModal(true);
  };

  // ----------------- Submit -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    // Basic validation
    const activeRows = feeRows.filter(
      (r) => (r.headName || "").trim() && r.amount > 0
    );
    if (!activeRows.length) {
      toast.error("Add at least one fee head with amount > 0");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        className: selectedClass.className,
        academicYear: selectedClass.academicYear,
        feeStructure: activeRows.map((r) => ({
          head: r.headId || undefined, // if you later bind with real FeeHead ids
          headName: r.headName,
          amount: r.amount,
          frequency: r.frequency,
          dueMonth: r.dueMonth || null,
          lateFee: r.lateFee || 0,
        })),
        paymentSchedule: settingsForm.paymentSchedule,
        dueDate: settingsForm.dueDate || null,
        lateFeeAmount: Number(settingsForm.lateFeeAmount || 0),
        lateFeeApplicableAfter: settingsForm.lateFeeApplicableAfter || null,
      };

      const resp = await api.put(
        API_ENDPOINTS.ADMIN.FEE.SET_CLASS_FEE,
        payload
      );
      console.log("✅ Class fee structure saved:", resp?.data);

      toast.success("Fee structure saved successfully");
      setShowModal(false);
      await loadClasses();
    } catch (error) {
      console.error("❌ Error saving fee structure:", error);
      const msg =
        error.response?.data?.message || "Failed to save fee structure";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ----------------- Render -----------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Classes Table */}
      <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            Class Fee Structures
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Academic Year: {academicYear}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Total Classes: {classes.length}
          </p>
        </div>

        {classes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Class
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-slate-700">
                    Total Fee
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Schedule
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Due Date
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const totalFee = getClassTotalFee(cls);
                  const hasFeeStructure =
                    cls.feeStructure && cls.feeStructure.length > 0;
                  return (
                    <tr
                      key={cls._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <span className="font-semibold text-slate-900">
                          {cls.className}
                        </span>
                        {!hasFeeStructure && (
                          <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                            Not Set
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`font-bold ${
                            hasFeeStructure
                              ? "text-purple-700"
                              : "text-slate-400"
                          }`}
                        >
                          ₹{totalFee.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600">
                          {cls.feeSettings?.paymentSchedule || "Not Set"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600">
                          {cls.feeSettings?.dueDate
                            ? new Date(
                                cls.feeSettings.dueDate
                              ).toLocaleDateString("en-IN")
                            : "Not Set"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition text-sm"
                        >
                          <FaEdit />
                          {hasFeeStructure ? "Edit" : "Set Fees"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-600">
              No classes found for {academicYear}
            </p>
            <button
              onClick={loadClasses}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Retry Loading Classes
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-6 border-b border-slate-200 z-10 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Set Fee Structure - {selectedClass.className}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Academic Year: {selectedClass.academicYear}
                </p>
              </div>
              <button
                className="text-slate-500 hover:text-slate-800"
                onClick={() => !saving && setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Fee rows */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-bold text-slate-900">
                    Fee Heads
                  </h4>
                  <button
                    type="button"
                    onClick={addFeeRow}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <FaPlus /> Add Fee Head
                  </button>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
                    <div className="col-span-3">Head Name</div>
                    <div className="col-span-2 text-right">Amount (₹)</div>
                    <div className="col-span-2">Frequency</div>
                    <div className="col-span-2">Due Month (opt)</div>
                    <div className="col-span-2 text-right">Late Fee (opt)</div>
                    <div className="col-span-1 text-center">Remove</div>
                  </div>

                  {feeRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 px-4 py-2 border-t border-slate-100 items-center"
                    >
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={row.headName}
                          onChange={(e) =>
                            updateFeeRow(idx, "headName", e.target.value)
                          }
                          placeholder="e.g. Tuition Fee"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={row.amount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            updateFeeRow(idx, "amount", value);
                          }}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-right focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={row.frequency}
                          onChange={(e) =>
                            updateFeeRow(idx, "frequency", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        >
                          {FREQUENCY_OPTIONS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={row.dueMonth || ""}
                          onChange={(e) =>
                            updateFeeRow(
                              idx,
                              "dueMonth",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="e.g. APR"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={row.lateFee}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            updateFeeRow(idx, "lateFee", value);
                          }}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-right focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeFeeRow(idx)}
                          className="text-rose-500 hover:text-rose-700"
                          disabled={feeRows.length === 1}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment settings */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-lg font-bold text-slate-900 mb-3">
                  Payment Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Payment Schedule
                    </label>
                    <select
                      value={settingsForm.paymentSchedule}
                      onChange={(e) =>
                        handleSettingsChange("paymentSchedule", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="HALF_YEARLY">Half Yearly</option>
                      <option value="YEARLY">Yearly</option>
                      <option value="ONE_TIME">One Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Overall Due Date
                    </label>
                    <input
                      type="date"
                      value={settingsForm.dueDate}
                      onChange={(e) =>
                        handleSettingsChange("dueDate", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Late Fee Amount (per overdue rule)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={settingsForm.lateFeeAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        handleSettingsChange("lateFeeAmount", value);
                      }}
                      placeholder="0"
                      className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm text-right focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Late Fee Applicable After
                    </label>
                    <input
                      type="date"
                      value={settingsForm.lateFeeApplicableAfter}
                      onChange={(e) =>
                        handleSettingsChange(
                          "lateFeeApplicableAfter",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Total summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">
                    Total of entered heads
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    This is the sum of all fee head amounts (not
                    frequency-adjusted).
                  </p>
                </div>
                <p className="text-3xl font-bold text-purple-700">
                  ₹{calculateFormTotal().toLocaleString("en-IN")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Fee Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
