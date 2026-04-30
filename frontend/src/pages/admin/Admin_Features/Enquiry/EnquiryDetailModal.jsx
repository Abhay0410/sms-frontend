import React, { useState, useEffect } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { format } from "date-fns";
import {
  FaTimes,
  FaUserGraduate,
  FaUserTie,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHistory,
  FaInfoCircle,
} from "react-icons/fa";

export default function EnquiryDetailModal({ isOpen, onClose, enquiryId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && enquiryId) {
      fetchEnquiryDetails();
    }
  }, [isOpen, enquiryId]);

  const fetchEnquiryDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.ENQUIRY.GET_BY_ID(enquiryId));
      setData(response?.data || response);
    } catch (error) {
      console.error("Failed to fetch enquiry details", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const enquiry = data?.enquiry || data || {};
  const followUps = data?.followUps || enquiry?.followUps || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Enquiry 360° View</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Stats */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs uppercase tracking-wide">
                    Status: {enquiry.status?.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 font-bold rounded-lg text-xs uppercase tracking-wide">
                    Priority: {enquiry.priority}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs uppercase tracking-wide">
                    Source: {enquiry.source?.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Details */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-4">
                      <FaUserGraduate size={18} />
                      <h3 className="font-bold text-slate-800">Student Info</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-slate-500 block text-xs font-semibold">Name</span> <span className="font-medium text-slate-800">{enquiry.studentName}</span></p>
                      <p><span className="text-slate-500 block text-xs font-semibold">Target Class</span> <span className="font-medium text-slate-800">{(typeof enquiry.targetClass === 'object' ? enquiry.targetClass?.className : (typeof enquiry.targetClass === 'string' && /^[0-9a-fA-F]{24}$/.test(enquiry.targetClass) ? "N/A" : (enquiry.targetClass || "N/A")))?.replace(/^Class\s/i, '')}</span></p>
                      <p><span className="text-slate-500 block text-xs font-semibold">Age / Gender</span> <span className="font-medium text-slate-800">{enquiry.age || 'N/A'} / {enquiry.gender || 'N/A'}</span></p>
                      <p><span className="text-slate-500 block text-xs font-semibold">Previous School</span> <span className="font-medium text-slate-800">{enquiry.previousSchool || 'None'}</span></p>
                    </div>
                  </div>

                  {/* Parent Details */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-4">
                      <FaUserTie size={18} />
                      <h3 className="font-bold text-slate-800">Parent Info</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-slate-500 block text-xs font-semibold">Name</span> <span className="font-medium text-slate-800">{enquiry.parentName}</span></p>
                      <p className="flex items-center gap-2"><FaPhoneAlt className="text-slate-400" size={12}/><span className="font-medium text-slate-800">{enquiry.primaryPhone}</span></p>
                      {enquiry.secondaryPhone && <p className="flex items-center gap-2"><FaPhoneAlt className="text-slate-400" size={12}/><span className="font-medium text-slate-800">{enquiry.secondaryPhone}</span></p>}
                      {enquiry.email && <p><span className="text-slate-500 block text-xs font-semibold">Email</span> <span className="font-medium text-slate-800">{enquiry.email}</span></p>}
                      {enquiry.occupation && <p><span className="text-slate-500 block text-xs font-semibold">Occupation</span> <span className="font-medium text-slate-800">{enquiry.occupation}</span></p>}
                    </div>
                  </div>
                </div>

                {enquiry.address && (
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-3">
                    <FaMapMarkerAlt className="text-slate-400 shrink-0 mt-1" />
                    <div>
                      <span className="text-slate-500 block text-xs font-semibold mb-1">Address</span>
                      <p className="text-sm font-medium text-slate-800">{enquiry.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Timeline */}
              <div className="border-l border-slate-100 pl-8 relative">
                <div className="flex items-center gap-2 text-indigo-600 mb-6">
                  <FaHistory size={18} />
                  <h3 className="font-bold text-slate-800">Follow-up History</h3>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {followUps.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No follow-ups logged yet.</p>
                  ) : (
                    followUps.map((log, index) => (
                      <div key={index} className="relative flex items-start gap-4">
                        <div className="absolute left-0 w-5 h-5 bg-indigo-100 border-2 border-white rounded-full flex items-center justify-center -translate-x-[2px] z-10">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        </div>
                        <div className="ml-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {log.outcome?.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                              {format(new Date(log.followUpDate || log.createdAt), "dd MMM yyyy, hh:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{log.conversationNotes}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}