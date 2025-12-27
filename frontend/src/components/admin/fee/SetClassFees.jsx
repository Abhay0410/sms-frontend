// components/admin/fee/SetClassFees.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";
import { FaSave, FaPlus, FaTrash, FaCopy } from "react-icons/fa";

export default function SetClassFees({ academicYear }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingStructure, setExistingStructure] = useState(null);

  // Fee structure form
  const [feeStructure, setFeeStructure] = useState({
    className: "",
    academicYear: academicYear,
    totalAmount: 0,
    components: [
      { name: "Tuition Fee", amount: 0, mandatory: true },
      { name: "Admission Fee", amount: 0, mandatory: true },
      { name: "Books & Stationery", amount: 0, mandatory: false },
      { name: "Uniform Fee", amount: 0, mandatory: false },
      { name: "Transport Fee", amount: 0, mandatory: false },
      { name: "Lab Fee", amount: 0, mandatory: false },
      { name: "Sports Fee", amount: 0, mandatory: false },
      { name: "Library Fee", amount: 0, mandatory: false },
    ],
    dueDate: new Date(new Date().getFullYear(), 3, 30).toISOString().split('T')[0], // April 30
    lateFeeAmount: 100,
    lateFeeApplicableAfterDays: 30,
    installments: [],
    isActive: true,
  });

  // Load classes
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await api.get(
        `${API_ENDPOINTS.ADMIN.CLASS.LIST}?academicYear=${academicYear}`
      );
      setClasses(resp || []);
    } catch {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Load existing fee structure when class is selected
  const loadExistingStructure = async (classId) => {
    try {
      const resp = await api.get(
        `${API_ENDPOINTS.ADMIN.FEE.STRUCTURE}?classId=${classId}&academicYear=${academicYear}`
      );
      
      if (resp && resp.length > 0) {
        const structure = resp[0];
        setExistingStructure(structure);
        setFeeStructure({
          ...structure,
          dueDate: structure.dueDate?.split('T')[0] || feeStructure.dueDate,
        });
        toast.info("Loaded existing fee structure");
      } else {
        setExistingStructure(null);
        // Reset to default structure
        setFeeStructure({
          ...feeStructure,
          className: selectedClass.className,
          classId: classId,
        });
      }
    } catch (error) {
      console.error("Error loading fee structure:", error);
      setExistingStructure(null);
    }
  };

  // Handle class selection
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setFeeStructure({
      ...feeStructure,
      className: cls.className,
      classId: cls._id,
    });
    loadExistingStructure(cls._id);
  };

  // Update component amount
  const updateComponent = (index, field, value) => {
    const updated = [...feeStructure.components];
    updated[index] = { ...updated[index], [field]: value };
    setFeeStructure({ ...feeStructure, components: updated });
    
    // Recalculate total
    const total = updated.reduce((sum, comp) => sum + (parseFloat(comp.amount) || 0), 0);
    setFeeStructure(prev => ({ ...prev, totalAmount: total }));
  };

  // Add new component
  const addComponent = () => {
    setFeeStructure({
      ...feeStructure,
      components: [
        ...feeStructure.components,
        { name: "", amount: 0, mandatory: false },
      ],
    });
  };

  // Remove component
  const removeComponent = (index) => {
    const updated = feeStructure.components.filter((_, i) => i !== index);
    setFeeStructure({ ...feeStructure, components: updated });
    
    const total = updated.reduce((sum, comp) => sum + (parseFloat(comp.amount) || 0), 0);
    setFeeStructure(prev => ({ ...prev, totalAmount: total }));
  };

  // Add installment
  const addInstallment = () => {
    setFeeStructure({
      ...feeStructure,
      installments: [
        ...feeStructure.installments,
        {
          name: `Installment ${feeStructure.installments.length + 1}`,
          amount: 0,
          dueDate: "",
        },
      ],
    });
  };

  // Update installment
  const updateInstallment = (index, field, value) => {
    const updated = [...feeStructure.installments];
    updated[index] = { ...updated[index], [field]: value };
    setFeeStructure({ ...feeStructure, installments: updated });
  };

  // Remove installment
  const removeInstallment = (index) => {
    const updated = feeStructure.installments.filter((_, i) => i !== index);
    setFeeStructure({ ...feeStructure, installments: updated });
  };

  // Copy from another class
  const copyFromClass = async (sourceClassId) => {
    try {
      const resp = await api.get(
        `${API_ENDPOINTS.ADMIN.FEE.STRUCTURE}?classId=${sourceClassId}&academicYear=${academicYear}`
      );
      
      if (resp && resp.length > 0) {
        const structure = resp[0];
        setFeeStructure({
          ...structure,
          _id: undefined, // Remove ID to create new
          className: selectedClass.className,
          classId: selectedClass._id,
        });
        toast.success("Fee structure copied successfully");
      }
    } catch {
      toast.error("Failed to copy fee structure");
    }
  };

  // Save fee structure
  const handleSave = async () => {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }

    if (feeStructure.totalAmount <= 0) {
      toast.error("Total fee amount must be greater than 0");
      return;
    }

    // Validate installments if any
    if (feeStructure.installments.length > 0) {
      const installmentTotal = feeStructure.installments.reduce(
        (sum, inst) => sum + (parseFloat(inst.amount) || 0),
        0
      );
      
      if (installmentTotal !== feeStructure.totalAmount) {
        toast.error("Installment total must equal total fee amount");
        return;
      }
    }

    try {
      setSaving(true);
      
      const payload = {
        ...feeStructure,
        classId: selectedClass._id,
        className: selectedClass.className,
        academicYear: academicYear,
      };

      if (existingStructure) {
        // Update existing
        await api.put(
          API_ENDPOINTS.ADMIN.FEE.UPDATE_STRUCTURE(existingStructure._id),
          payload
        );
        toast.success("Fee structure updated successfully");
      } else {
        // Create new
        await api.post(API_ENDPOINTS.ADMIN.FEE.STRUCTURE, payload);
        toast.success("Fee structure created successfully");
      }

      loadExistingStructure(selectedClass._id);
    } catch (error) {
      toast.error(error.message || "Failed to save fee structure");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Select Class</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => handleClassSelect(cls)}
              className={`p-4 rounded-xl border-2 font-semibold transition ${
                selectedClass?._id === cls._id
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-slate-200 hover:border-purple-300"
              }`}
            >
              {cls.className}
            </button>
          ))}
        </div>

        {/* Copy from another class */}
        {selectedClass && classes.length > 1 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3">
              <FaCopy className="text-blue-600" />
              <select
                onChange={(e) => e.target.value && copyFromClass(e.target.value)}
                className="flex-1 rounded-lg border-2 border-blue-300 p-2 focus:border-blue-500 focus:outline-none"
                defaultValue=""
              >
                <option value="">Copy fee structure from another class...</option>
                {classes
                  .filter((c) => c._id !== selectedClass._id)
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.className}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Fee Structure Form */}
      {selectedClass && (
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Fee Structure - {selectedClass.className}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {existingStructure ? "Edit existing structure" : "Create new structure"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-3xl font-bold text-purple-700">
                ₹{feeStructure.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Fee Components */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">Fee Components</h4>
              <button
                onClick={addComponent}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition text-sm font-semibold"
              >
                <FaPlus /> Add Component
              </button>
            </div>

            <div className="grid gap-4">
              {feeStructure.components.map((component, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-center p-4 bg-slate-50 rounded-xl"
                >
                  <input
                    type="text"
                    value={component.name}
                    onChange={(e) => updateComponent(index, "name", e.target.value)}
                    placeholder="Component name"
                    className="col-span-5 rounded-lg border-2 border-slate-200 p-2 focus:border-purple-500 focus:outline-none"
                  />
                  
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input
                      type="number"
                      value={component.amount}
                      onChange={(e) => updateComponent(index, "amount", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full rounded-lg border-2 border-slate-200 pl-8 pr-2 py-2 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <label className="col-span-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={component.mandatory}
                      onChange={(e) => updateComponent(index, "mandatory", e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-slate-700">Mandatory</span>
                  </label>

                  <button
                    onClick={() => removeComponent(index)}
                    className="col-span-1 text-red-600 hover:text-red-800 transition"
                    title="Remove"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 bg-slate-50 rounded-xl">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={feeStructure.dueDate}
                onChange={(e) => setFeeStructure({ ...feeStructure, dueDate: e.target.value })}
                className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Late Fee Amount (₹)
              </label>
              <input
                type="number"
                value={feeStructure.lateFeeAmount}
                onChange={(e) => setFeeStructure({ ...feeStructure, lateFeeAmount: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Late Fee After (Days)
              </label>
              <input
                type="number"
                value={feeStructure.lateFeeApplicableAfterDays}
                onChange={(e) => setFeeStructure({ ...feeStructure, lateFeeApplicableAfterDays: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Installments (Optional) */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">Installments (Optional)</h4>
                <p className="text-sm text-slate-600">Break down the total fee into installments</p>
              </div>
              <button
                onClick={addInstallment}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
              >
                <FaPlus /> Add Installment
              </button>
            </div>

            {feeStructure.installments.length > 0 && (
              <div className="grid gap-4">
                {feeStructure.installments.map((installment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center p-4 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    <input
                      type="text"
                      value={installment.name}
                      onChange={(e) => updateInstallment(index, "name", e.target.value)}
                      placeholder="Installment name"
                      className="col-span-5 rounded-lg border-2 border-blue-200 p-2 focus:border-blue-500 focus:outline-none"
                    />
                    
                    <div className="col-span-3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input
                        type="number"
                        value={installment.amount}
                        onChange={(e) => updateInstallment(index, "amount", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full rounded-lg border-2 border-blue-200 pl-8 pr-2 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <input
                      type="date"
                      value={installment.dueDate?.split('T')[0] || ''}
                      onChange={(e) => updateInstallment(index, "dueDate", e.target.value)}
                      className="col-span-3 rounded-lg border-2 border-blue-200 p-2 focus:border-blue-500 focus:outline-none"
                    />

                    <button
                      onClick={() => removeInstallment(index)}
                      className="col-span-1 text-red-600 hover:text-red-800 transition"
                      title="Remove"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Installment Total:</strong> ₹
                    {feeStructure.installments
                      .reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0)
                      .toLocaleString("en-IN")}
                    {" "}
                    {feeStructure.installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0) !== feeStructure.totalAmount && (
                      <span className="text-red-600 font-bold">
                        ⚠️ Must equal total: ₹{feeStructure.totalAmount.toLocaleString("en-IN")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50"
            >
              <FaSave />
              {saving ? "Saving..." : existingStructure ? "Update Fee Structure" : "Create Fee Structure"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
