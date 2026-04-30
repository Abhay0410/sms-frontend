import React from "react";
import { useForm } from "react-hook-form";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { FaTimes, FaExchangeAlt } from "react-icons/fa";

export default function UpdateStatusModal({ isOpen, onClose, enquiryId, currentStatus, currentPriority, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      status: currentStatus || "NEW",
      priority: currentPriority || "WARM",
    }
  });

  const onSubmit = async (data) => {
    try {
      await api.patch(API_ENDPOINTS.ADMIN.ENQUIRY.UPDATE_STATUS(enquiryId), data);
      onSuccess("Status updated successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update status", error);
      alert(error?.message || "Failed to update status.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-2 text-slate-800">
            <FaExchangeAlt className="text-indigo-600" size={16} />
            <h2 className="text-lg font-bold">Update Pipeline State</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 inline-block uppercase tracking-wider">Pipeline Status</label>
            <select {...register("status")} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 font-medium">
              <option value="NEW">New</option>
              <option value="PENDING">Pending</option>
              <option value="FOLLOWED_UP">Followed Up</option>
              <option value="VISITED">Visited</option>
              <option value="ADMITTED" disabled>Admitted (Use Convert)</option>
              <option value="CLOSED_LOST" disabled>Closed Lost (Use Close)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 inline-block uppercase tracking-wider">Lead Priority</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['HOT', 'WARM', 'COLD'].map(p => (
                <label key={p} className="cursor-pointer relative">
                  <input type="radio" value={p} {...register("priority")} className="peer sr-only" />
                  <div className={`text-center py-2 text-xs font-bold rounded-xl border border-slate-200 transition-all
                    peer-checked:border-transparent peer-checked:shadow-sm
                    ${p === 'HOT' ? 'peer-checked:bg-red-100 peer-checked:text-red-700 hover:bg-red-50' : 
                      p === 'WARM' ? 'peer-checked:bg-orange-100 peer-checked:text-orange-700 hover:bg-orange-50' : 
                      'peer-checked:bg-blue-100 peer-checked:text-blue-700 hover:bg-blue-50'}
                  `}>
                    {p}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}