import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { 
  FaEdit, 
  FaPlus, 
  FaTrash, 
  FaCalculator, 
  FaCalendarAlt, 
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { motion,AnimatePresence } from "framer-motion";

const FREQUENCY_OPTIONS = [
  { value: "MONTHLY", label: "Monthly (12 Installments)" },
  { value: "QUARTERLY", label: "Quarterly (4 Installments)" },
  { value: "HALF_YEARLY", label: "Half-Yearly (2 Installments)" },
  { value: "YEARLY", label: "Yearly (1 Installment)" },
  { value: "ONE_TIME", label: "One-Time Payment" },
];

export default function SetClassFees() {
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

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    paymentSchedule: "YEARLY",
    dueDate: "",
    lateFeeAmount: 0,
  });

  const [feeRows, setFeeRows] = useState([]);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await api.get(API_ENDPOINTS.ADMIN.FEE.CLASS_FEES, {
        params: { academicYear },
      });
      const classesData = resp.data?.data?.classes || resp.data?.classes || [];
      setClasses(classesData);
    } catch {
      toast.error("Failed to load class structures");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    if (academicYear) {
      loadClasses();
    }
  }, [academicYear, loadClasses]);

  // Calculate real yearly total based on frequency
  const annualTotal = useMemo(() => {
    return feeRows.reduce((sum, row) => {
      let multiplier = 1;
      if (row.frequency === "MONTHLY") multiplier = 12;
      else if (row.frequency === "QUARTERLY") multiplier = 4;
      else if (row.frequency === "HALF_YEARLY") multiplier = 2;
      return sum + (Number(row.amount) || 0) * multiplier;
    }, 0);
  }, [feeRows]);

  const addFeeRow = () => {
    setFeeRows([...feeRows, { headName: "", amount: 0, frequency: "MONTHLY", lateFee: 0 }]);
  };

  const updateFeeRow = (index, field, value) => {
    const updated = [...feeRows];
    updated[index][field] = field === "amount" || field === "lateFee" ? Number(value || 0) : value;
    setFeeRows(updated);
  };

  const removeFeeRow = (index) => {
    setFeeRows(feeRows.filter((_, i) => i !== index));
  };

  const handleEdit = (classData) => {
    setSelectedClass(classData);
    const rows = (classData.feeStructure || []).map((f) => ({
      headId: f.head?._id || f.head || "",
      headName: f.headName || "",
      amount: f.amount || 0,
      frequency: f.frequency || "MONTHLY",
      lateFee: f.lateFee || 0,
    }));

    setFeeRows(rows.length ? rows : [{ headName: "", amount: 0, frequency: "MONTHLY", lateFee: 0 }]);
    setSettingsForm({
      paymentSchedule: classData.feeSettings?.paymentSchedule || "MONTHLY",
      dueDate: classData.feeSettings?.dueDate ? new Date(classData.feeSettings.dueDate).toISOString().split("T")[0] : "",
      lateFeeAmount: classData.feeSettings?.lateFeeAmount || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeRows = feeRows.filter((r) => r.headName.trim() && r.amount > 0);
    if (!activeRows.length) return toast.error("Please add at least one fee head");

    try {
      setSaving(true);
      await api.put(API_ENDPOINTS.ADMIN.FEE.SET_CLASS_FEE, {
        className: selectedClass.className,
        academicYear,
        feeStructure: activeRows,
        ...settingsForm
      });
      toast.success(`Fee structure synced for ${selectedClass.className}`);
      setShowModal(false);
      loadClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between">
              <div className="h-14 w-14 rounded-2xl bg-slate-200" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>
            <div className="h-8 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-200 rounded" />
            <div className="pt-6 border-t border-slate-100 flex justify-between">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-6 w-24 bg-slate-200 rounded" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-[2.5rem] border border-indigo-100 shadow-sm"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Class Fee Management</h2>
          <p className="text-slate-600 font-medium mt-1">Configure automated installments for all students</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-purple-200 shadow-sm">
          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Active Session</p>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-transparent border-none text-lg font-black text-slate-800 focus:ring-0 cursor-pointer outline-none p-0 w-full"
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const hasFee = cls.feeStructure?.length > 0;
          const feePercentage = hasFee ? 100 : 0;
          
          return (
            <motion.div 
              key={cls._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${hasFee ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-br from-rose-100 to-amber-100 text-rose-500'}`}>
                  <FaLayerGroup size={24} />
                </div>
                {hasFee ? (
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <FaCheckCircle className="text-emerald-500" /> Configured
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                    Setup Required
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{cls.className}</h3>
              <p className="text-slate-500 text-xs font-medium mt-1 mb-6">{cls.sections?.length || 0} sections assigned</p>
              
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Fee Setup</span>
                  <span>{feePercentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${hasFee ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${feePercentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Annual Total</p>
                  <p className="text-xl font-black text-slate-900">₹{(cls.feeSettings?.totalAnnualFee || 0).toLocaleString()}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(cls)}
                  className="h-12 w-12 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-500 rounded-2xl flex items-center justify-center hover:from-indigo-100 hover:to-purple-100 transition-all shadow-md"
                  aria-label={`Edit ${cls.className} fees`}
                >
                  <FaEdit size={18} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Fee Setup: {selectedClass.className}</h3>
                  <p className="text-indigo-200 text-sm mt-1 font-medium">
                    Applying to all sections & students
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Dynamic Fee Heads */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                      Fee Structure Breakdown
                    </h4>
                    <motion.button 
                      type="button" 
                      onClick={addFeeRow}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FaPlus /> Add Fee Item
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {feeRows.map((row, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-12 gap-4 p-6 bg-slate-50 rounded-2xl items-center border border-slate-200 hover:border-indigo-300 transition-all"
                      >
                        <div className="col-span-5">
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Fee Label</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={row.headName} 
                              onChange={(e) => updateFeeRow(idx, "headName", e.target.value)} 
                              className="w-full bg-white rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none px-4 py-3 font-medium text-slate-800" 
                              placeholder="Tuition Fee" 
                              required 
                            />
                            {!row.headName.trim() && (
                              <span className="absolute right-3 top-3.5 text-xs text-rose-500 font-bold">*</span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Amount (₹)</label>
                          <input 
                            type="number" 
                            value={row.amount} 
                            onChange={(e) => updateFeeRow(idx, "amount", e.target.value)} 
                            className="w-full bg-white rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none px-4 py-3 font-medium text-slate-800" 
                            required 
                            min="0"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Frequency</label>
                          <select 
                            value={row.frequency} 
                            onChange={(e) => updateFeeRow(idx, "frequency", e.target.value)} 
                            className="w-full bg-white rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none py-3 px-4 font-medium text-slate-800"
                          >
                            {FREQUENCY_OPTIONS.map(opt => 
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            )}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Late Fee</label>
                          <input 
                            type="number" 
                            value={row.lateFee} 
                            onChange={(e) => updateFeeRow(idx, "lateFee", e.target.value)} 
                            className="w-full bg-white rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none px-4 py-3 font-medium text-slate-800" 
                            min="0"
                          />
                        </div>
                        <div className="col-span-1 text-right pt-5">
                          <button 
                            type="button" 
                            onClick={() => removeFeeRow(idx)}
                            className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
                            aria-label="Remove fee row"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Dynamic Calculator Banner */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white flex items-center justify-between shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl text-indigo-300">
                      <FaCalculator />
                    </div>
                    <div>
                      <p className="text-indigo-300 text-sm font-bold uppercase tracking-wider">Total Annual Commitment</p>
                      <p className="text-slate-400 text-xs mt-1">Calculated based on selected intervals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-4xl font-black tracking-tight">₹{annualTotal.toLocaleString()}</h2>
                  </div>
                </motion.div>

                {/* Master Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <FaCalendarAlt className="text-indigo-500" /> Default Due Date
                    </label>
                    <input 
                      type="date" 
                      value={settingsForm.dueDate} 
                      onChange={(e) => setSettingsForm({...settingsForm, dueDate: e.target.value})} 
                      className="w-full p-3 bg-white rounded-lg border border-slate-300 font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" 
                    />
                    <p className="text-xs text-slate-500">Sets deadline for all generated installments</p>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4">
                    <FaExclamationCircle className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-amber-800 font-bold text-sm">Adjustment Policy</p>
                      <p className="text-amber-700 text-sm mt-2 leading-relaxed">
                        Publishing will generate payment roadmap for all sections. Existing unpaid balances will be recalculated.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="flex-1 py-4 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                  >
                    {saving ? (
                      <>
                        <FiRefreshCw className="animate-spin" /> Syncing...
                      </>
                    ) : (
                      "Publish & Sync Structure"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}