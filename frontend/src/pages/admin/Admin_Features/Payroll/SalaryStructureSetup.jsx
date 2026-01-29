import { useState, useEffect, useMemo } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { toast } from "react-toastify";
import { FaUserTie, FaCalculator, FaShieldAlt, FaSave, FaInfoCircle } from "react-icons/fa";

export default function SalaryStructureSetup() {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [monthlyGross, setMonthlyGross] = useState("");
  const [taxRegime] = useState("NEW"); // Fixed: Removed unused setter
  const [limitPF, setLimitPF] = useState(true);

  // Load Staff on mount
  useEffect(() => {
    const loadStaff = async () => {
      setLoading(true);
      try {
        // Fetching combined staff list (Teachers + Admins)
        const resp = await api.get(API_ENDPOINTS.ADMIN.STAFF.LIST);
        setStaffList(resp.data || []);
      } catch  {
        toast.error("Failed to load staff list");
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  // 1. Dropdown select handle karne ka naya function
  const handleStaffChange = async (staffId) => {
    setSelectedStaff(staffId);
    setMonthlyGross(""); // Reset pehle

    if (!staffId) return;

    try {
      // ✅ Check if structure exists for this employee
      const resp = await api.get(API_ENDPOINTS.ADMIN.PAYROLL.GET_STRUCTURE(staffId));
      
      if (resp.data) {
        // ✅ Agar data mila, toh input fill kar do
        setMonthlyGross(resp.data.grossSalary);
        toast.info(`Existing structure loaded for ${resp.data.employeeName || 'staff'}`);
      }
    } catch  {
      // 404 error means no setup yet, which is fine
      console.log("No existing structure found for this staff.");
    }
  };

  // 🧮 2026 Indian Payroll Logic Engine
  const calculation = useMemo(() => {
    const gross = parseFloat(monthlyGross) || 0;
    
    // 1. Basic Salary (50% of Gross - 2026 Guidelines)
    const basic = gross * 0.50;
    
    // 2. Allowances
    const da = basic * 0.10; // Assuming 10% DA
    const hra = basic * 0.20; // Assuming 20% HRA
    const special = Math.max(0, gross - (basic + da + hra));

    // 3. EPF Calculation (12% of Basic + DA)
    let pfBasis = basic + da;
    if (limitPF && pfBasis > 15000) pfBasis = 15000; 
    const epfEmployee = pfBasis * 0.12;
    const epfEmployer = pfBasis * 0.12;

    // 4. Gratuity Provision (Monthly liability: Basic+DA / 26 * 15 / 12)
    const gratuity = (basic + da) / 26 * 15 / 12;

    // 5. Net Payable (Rough estimation before TDS)
    const pt = 200; // Professional Tax Standard
    const netPay = gross - (epfEmployee + pt);

    return { basic, da, hra, special, epfEmployee, epfEmployer, gratuity, netPay, pt };
  }, [monthlyGross, limitPF]);

  const handleSaveStructure = async () => {
    if (!selectedStaff) return toast.warning("Please select a staff member");
    if (!monthlyGross) return toast.warning("Please enter gross amount");

    // Find the selected person in the list to get their type (admin/teacher)
    const selectedPerson = staffList.find(s => s._id === selectedStaff);

    setSaving(true);
    try {
      const payload = {
        employeeId: selectedStaff, // ✅ CHANGED from teacherId to employeeId
        monthlyGross: parseFloat(monthlyGross),
        taxRegime,
        limitPF,
        employeeType: selectedPerson?.employeeType || 'teacher', // ✅ Dynamic type
        isTemplate: true 
      };
      
      await api.post(API_ENDPOINTS.ADMIN.PAYROLL.SETUP_STRUCTURE, payload);
      toast.success("Salary structure initialized successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save structure");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-16 w-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-100">
          <FaCalculator size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Salary Structuring</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <FaShieldAlt className="text-emerald-500" /> Compliance Year: 2026 • Indian Wage Code Policy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">1. Target Selection</h3>
            
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
              <div className="relative">
                <FaUserTie className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <select 
                  value={selectedStaff}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  disabled={loading} // Fixed: Using loading state
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">{loading ? "Loading Staff..." : "Choose Staff Member..."}</option>
                  {staffList.map(person => (
                    <option key={person._id} value={person._id}>
                      {person.name} ({person.displayID || person.teacherID || person.adminID}) — {person.role?.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Gross (₹)</label>
              <input 
                type="number"
                value={monthlyGross}
                onChange={(e) => setMonthlyGross(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full p-5 bg-slate-50 rounded-2xl border-none font-black text-2xl text-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-slate-500">2. Statutory Settings</h3>
            <div className="space-y-4">
               <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-bold">Limit PF to Statutory Ceiling (₹15,000)</span>
                  <input 
                    type="checkbox" 
                    checked={limitPF}
                    onChange={(e) => setLimitPF(e.target.checked)}
                    className="h-6 w-6 rounded-lg accent-indigo-500" 
                  />
               </label>
               <div className="p-4 bg-slate-800 rounded-2xl flex gap-3 items-start">
                  <FaInfoCircle className="text-indigo-400 mt-1" />
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    If enabled, PF is calculated on a max basis of ₹15,000 even if Basic+DA is higher. This is standard school policy.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview Table */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">3. Pro-forma Salary Slip</h3>
              <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black">ESTIMATE</span>
            </div>

            <div className="p-8">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-50">
                  <tr className="py-4 flex justify-between font-bold">
                    <td className="text-slate-500">Basic Salary (50%)</td>
                    <td className="text-slate-900">₹{calculation.basic.toLocaleString()}</td>
                  </tr>
                  <tr className="py-4 flex justify-between font-bold">
                    <td className="text-slate-500">Dearness Allowance (DA)</td>
                    <td className="text-slate-900">₹{calculation.da.toLocaleString()}</td>
                  </tr>
                  <tr className="py-4 flex justify-between font-bold">
                    <td className="text-slate-500">House Rent Allowance (HRA)</td>
                    <td className="text-slate-900">₹{calculation.hra.toLocaleString()}</td>
                  </tr>
                  <tr className="py-4 flex justify-between font-bold">
                    <td className="text-slate-500">Special Allowance (Balancing)</td>
                    <td className="text-slate-900">₹{calculation.special.toLocaleString()}</td>
                  </tr>
                  <tr className="py-6 flex justify-between font-black text-indigo-600 bg-indigo-50/30 px-4 -mx-4">
                    <td>GROSS EARNINGS</td>
                    <td>₹{parseFloat(monthlyGross || 0).toLocaleString()}</td>
                  </tr>
                  <tr className="py-4 flex justify-between font-bold text-rose-500">
                    <td className="flex items-center gap-2">EPF Employee Share (12%)</td>
                    <td>- ₹{calculation.epfEmployee.toLocaleString()}</td>
                  </tr>
                  <tr className="py-4 flex justify-between font-bold text-rose-500">
                    <td>Professional Tax (PT)</td>
                    <td>- ₹{calculation.pt}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Take Home Pay</p>
                  <p className="text-2xl font-black text-white">₹{calculation.netPay.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl text-center border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Admin Liability (Gratuity)</p>
                  <p className="text-2xl font-black text-emerald-700">₹{Math.round(calculation.gratuity).toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={handleSaveStructure}
                disabled={saving || !selectedStaff}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? "Processing..." : monthlyGross ? <><FaSave /> Update Salary Structure</> : <><FaSave /> Initialize Salary Structure</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
