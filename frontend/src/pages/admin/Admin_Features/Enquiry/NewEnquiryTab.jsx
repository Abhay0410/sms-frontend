import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaUserGraduate,
  FaUserTie,
  FaInfoCircle,
  FaSave,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

export default function NewEnquiryTab() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      source: "WALK_IN",
      priority: "WARM",
      gender: "Male",
    },
  });

  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    setMessage(null);
    try {
      await api.post(API_ENDPOINTS.ADMIN.ENQUIRY.CREATE, data);
      setMessage({ type: "success", text: "Enquiry successfully captured!" });
      reset();

      // Auto-hide success message
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message || "Failed to create enquiry. Please try again.",
      });
    }
  };

  // Tailwind helper classes for form elements
  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white";
  const labelClass =
    "text-xs font-bold text-slate-500 mb-1 inline-block uppercase tracking-wider";
  const errorClass = "text-xs text-red-500 mt-1 font-medium";

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-6 border-b  border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">Capture New Enquiry</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter prospect details to log intent and add them to the admissions pipeline.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <FaCheckCircle size={18} />
          ) : (
            <FaExclamationCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- STUDENT DETAILS SECTION --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <FaUserGraduate size={18} />
            <h3 className="text-lg font-semibold text-slate-700">Student Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Student Name <span className="text-red-500">*</span></label>
              <input {...register("studentName", { required: "Required" })} className={inputClass} placeholder="e.g. John Doe" />
              {errors.studentName && <p className={errorClass}>{errors.studentName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" {...register("age")} className={inputClass} placeholder="e.g. 5" />
            </div>
            <div>
              <label className={labelClass}>Target Class <span className="text-red-500">*</span></label>
              <select {...register("targetClass", { required: "Required" })} className={inputClass}>
                <option value="">Select Class</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
              {errors.targetClass && <p className={errorClass}>{errors.targetClass.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select {...register("gender")} className={inputClass}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Previous School</label>
              <input {...register("previousSchool")} className={inputClass} placeholder="If any" />
            </div>
          </div>
        </section>

        {/* --- PARENT/GUARDIAN DETAILS SECTION --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <FaUserTie size={18} />
            <h3 className="text-lg font-semibold text-slate-700">Parent / Guardian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Parent Name <span className="text-red-500">*</span></label>
              <input {...register("parentName", { required: "Required" })} className={inputClass} placeholder="e.g. Richard Doe" />
              {errors.parentName && <p className={errorClass}>{errors.parentName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Primary Phone <span className="text-red-500">*</span></label>
              <input {...register("primaryPhone", { required: "Required", pattern: { value: /^[0-9]{10}$/, message: "Must be a 10-digit number" } })} className={inputClass} placeholder="10-digit mobile" />
              {errors.primaryPhone && <p className={errorClass}>{errors.primaryPhone.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Secondary Phone</label>
              <input {...register("secondaryPhone")} className={inputClass} placeholder="Alternate number" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...register("email", { pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })} className={inputClass} placeholder="parent@example.com" />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Occupation</label>
              <input {...register("occupation")} className={inputClass} placeholder="e.g. Business, Engineer" />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Address</label>
              <input {...register("address")} className={inputClass} placeholder="Full residential address" />
            </div>
          </div>
        </section>

        {/* --- METADATA SECTION --- */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <FaInfoCircle size={18} />
            <h3 className="text-lg font-semibold text-slate-700">Pipeline Metadata</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div>
              <label className={labelClass}>Source <span className="text-red-500">*</span></label>
              <select {...register("source", { required: "Required" })} className={inputClass}>
                <option value="WALK_IN">Walk In</option>
                <option value="WEBSITE">Website</option>
                <option value="FACEBOOK">Facebook / Social Media</option>
                <option value="REFERRAL">Referral</option>
                <option value="NEWSPAPER">Newspaper</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.source && <p className={errorClass}>{errors.source.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Priority <span className="text-red-500">*</span></label>
              <select {...register("priority", { required: "Required" })} className={inputClass}>
                <option value="HOT">Hot (Highly Interested, Immediate)</option>
                <option value="WARM">Warm (Interested, Needs Follow-up)</option>
                <option value="COLD">Cold (Exploring, Future)</option>
              </select>
              {errors.priority && <p className={errorClass}>{errors.priority.message}</p>}
            </div>
          </div>
        </section>

        {/* --- SUBMIT BUTTON --- */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FaSave size={18} />
            )}
            {isSubmitting ? "Saving..." : "Save Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}