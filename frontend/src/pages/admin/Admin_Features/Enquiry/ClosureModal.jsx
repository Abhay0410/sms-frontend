import React from "react";
import { useForm } from "react-hook-form";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { FaTimes, FaTrophy, FaBan } from "react-icons/fa";

export default function ClosureModal({ isOpen, onClose, enquiryId, mode, onSuccess }) {
  // mode expects "WIN" (Convert) or "LOSS" (Close)
  const isWin = mode === "WIN";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (isWin) {
        await api.post(API_ENDPOINTS.ADMIN.ENQUIRY.CONVERT_TO_STUDENT(enquiryId));
        onSuccess("Lead successfully converted to a Registered Student!");
      } else {
        await api.post(API_ENDPOINTS.ADMIN.ENQUIRY.CLOSE(enquiryId), { closeReason: data.closeReason });
        onSuccess("Lead has been closed.");
      }
      onClose();
    } catch (error) {
      console.error("Closure action failed", error);
      alert(error?.message || "Failed to process lead closure.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className={`flex justify-between items-center px-6 py-4 border-b border-slate-100 rounded-t-2xl ${isWin ? 'bg-green-50/80' : 'bg-red-50/80'}`}>
          <div className={`flex items-center gap-2 ${isWin ? 'text-green-700' : 'text-red-700'}`}>
            {isWin ? <FaTrophy size={18} /> : <FaBan size={18} />}
            <h2 className="text-lg font-bold">
              {isWin ? "Convert to Student" : "Close as Lost"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {isWin ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 text-sm">
              <p className="font-semibold mb-1">🎉 Admission Successful!</p>
              <p>Continuing will lock this lead and automatically generate live Student and Parent profiles in the master database.</p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-sm mb-2">
                <p>This action will mark the lead as <span className="font-bold">CLOSED_LOST</span> and remove it from the active pipeline.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 inline-block uppercase tracking-wider">Reason for Closure *</label>
                <select {...register("closeReason", { required: "Reason is required" })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-slate-50">
                  <option value="">Select a reason</option>
                  <option value="Chose another school">Chose another school</option>
                  <option value="Fees too high">Fees too high</option>
                  <option value="Distance/Transport issues">Distance/Transport issues</option>
                  <option value="Unresponsive">Unresponsive / Cannot reach</option>
                  <option value="Other">Other</option>
                </select>
                {errors.closeReason && <p className="text-xs text-red-500 mt-1">{errors.closeReason.message}</p>}
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 ${
              isWin ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
              {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {isWin ? "Confirm Conversion" : "Confirm Closure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}