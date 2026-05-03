import React from "react";
import { useForm } from "react-hook-form";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { FaTimes, FaPhoneAlt, FaRegCalendarAlt } from "react-icons/fa";

export default function LogFollowUpModal({ isOpen, onClose, enquiryId, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      outcome: "INTERESTED"
    }
  });

  const onSubmit = async (data) => {
    try {
      await api.post(API_ENDPOINTS.ADMIN.ENQUIRY.ADD_FOLLOW_UP(enquiryId), data);
      reset();
      onSuccess("Follow-up logged successfully");
      onClose();
    } catch (error) {
      console.error("Failed to log follow-up", error);
      alert(error?.message || "Failed to log follow-up.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-700 rounded-t-2xl">
          <div className="flex items-center gap-2 text-orange-700">
            <FaPhoneAlt size={16} />
            <h2 className="text-lg  text-white font-bold">Log Interaction</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 inline-block uppercase tracking-wider">Interaction Outcome *</label>
            <select {...register("outcome", { required: "Outcome is required" })} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50">
              <option value="BUSY">Busy / No Answer</option>
              <option value="CALL_LATER">Call Later</option>
              <option value="INTERESTED">Interested</option>
              <option value="NOT_INTERESTED">Not Interested</option>
              <option value="VISIT_SCHEDULED">Visit Scheduled</option>
            </select>
            {errors.outcome && <p className="text-xs text-red-500 mt-1">{errors.outcome.message}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1 uppercase tracking-wider">
              <FaRegCalendarAlt /> Next Action Date
            </label>
            <input type="date" {...register("nextActionDate")} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50" />
            <p className="text-[10px] text-slate-400 mt-1">Leave blank if no further action is required.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 inline-block uppercase tracking-wider">Conversation Notes *</label>
            <textarea 
              {...register("conversationNotes", { required: "Notes are required" })} 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 min-h-[100px]"
              placeholder="Summarize the discussion..."
            />
            {errors.conversationNotes && <p className="text-xs text-red-500 mt-1">{errors.conversationNotes.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {isSubmitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              Save Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}