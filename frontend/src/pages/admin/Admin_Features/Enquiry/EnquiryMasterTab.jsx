import React, { useState, useEffect, useMemo } from "react";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { format } from "date-fns";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaPhoneAlt,
  FaExchangeAlt,
  FaTrophy,
  FaBan,
  FaExclamationCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import EnquiryDetailModal from "./EnquiryDetailModal";
import LogFollowUpModal from "./LogFollowUpModal";
import UpdateStatusModal from "./UpdateStatusModal";
import ClosureModal from "./ClosureModal";

export default function EnquiryMasterTab() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  
  // Modal State Control
  const [modalState, setModalState] = useState({ type: null, enquiry: null, mode: null });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.ENQUIRY.LIST);
      // Standardize response array
      const data = response?.data || response || [];
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch enquiries", err);
      setError("Failed to load enquiries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = (message) => {
    toast.success(message);
    fetchEnquiries(); // Refresh table data after a successful action
  };

  const closeModal = () => setModalState({ type: null, enquiry: null, mode: null });

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const matchesSearch =
        enquiry.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        enquiry.parentName?.toLowerCase().includes(search.toLowerCase()) ||
        enquiry.primaryPhone?.includes(search);
      const matchesStatus =
        statusFilter === "ALL" || enquiry.status === statusFilter;
      const matchesPriority =
        priorityFilter === "ALL" || enquiry.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [enquiries, search, statusFilter, priorityFilter]);

  const getPriorityBadge = (priority) => {
    const styles = {
      HOT: "bg-red-100 text-red-700 border-red-200",
      WARM: "bg-orange-100 text-orange-700 border-orange-200",
      COLD: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return (
      <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${styles[priority] || "bg-slate-100 text-slate-700"}`}>
        {priority || "N/A"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      NEW: "bg-blue-50 text-blue-600",
      PENDING: "bg-yellow-50 text-yellow-600",
      FOLLOWED_UP: "bg-indigo-50 text-indigo-600",
      VISITED: "bg-purple-50 text-purple-600",
      ADMITTED: "bg-green-50 text-green-600",
      CLOSED_LOST: "bg-slate-100 text-slate-500",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${styles[status] || "bg-slate-100 text-slate-700"}`}>
        {status?.replace("_", " ") || "UNKNOWN"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-red-100">
        <FaExclamationCircle size={36} className="mb-3 text-red-400" />
        <p className="font-semibold">{error}</p>
        <button onClick={fetchEnquiries} className="mt-4 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors">
          Retry Data Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, parent, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <FaFilter className="text-slate-400 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 w-full md:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="PENDING">Pending</option>
            <option value="FOLLOWED_UP">Followed Up</option>
            <option value="VISITED">Visited</option>
            <option value="ADMITTED">Admitted</option>
            <option value="CLOSED_LOST">Closed Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 w-full md:w-auto"
          >
            <option value="ALL">All Priorities</option>
            <option value="HOT">Hot</option>
            <option value="WARM">Warm</option>
            <option value="COLD">Cold</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-700 border-b border-slate-200 text-white text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Student</th>
                <th className="p-4 font-bold">Parent & Contact</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Priority</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Next Action</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No enquiries found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 text-sm">{enq.studentName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{format(new Date(enq.enquiryDate || enq.createdAt), "dd MMM yyyy")}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm text-slate-700">{enq.parentName}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <FaPhoneAlt size={10} className="text-slate-400" /> {enq.primaryPhone}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {(typeof enq.targetClass === 'object' ? enq.targetClass?.className : (typeof enq.targetClass === 'string' && /^[0-9a-fA-F]{24}$/.test(enq.targetClass) ? "-" : (enq.targetClass || "-")))?.replace(/^Class\s/i, '')}
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(enq.priority)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(enq.status)}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {enq.nextActionDate ? format(new Date(enq.nextActionDate), "dd MMM yyyy") : <span className="text-slate-400 italic">Not set</span>}
                    </td>
                    <td className="p-4 text-center space-x-1 flex items-center justify-center">
                      <button onClick={() => setModalState({ type: 'DETAIL', enquiry: enq })} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                        <FaEye size={16} />
                      </button>
                      <button onClick={() => setModalState({ type: 'FOLLOW_UP', enquiry: enq })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Log Follow-up">
                        <FaPhoneAlt size={14} />
                      </button>
                      <button onClick={() => setModalState({ type: 'STATUS', enquiry: enq })} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Update Status">
                        <FaExchangeAlt size={14} />
                      </button>
                      {enq.status !== 'ADMITTED' && enq.status !== 'CLOSED_LOST' && (
                        <>
                          <button onClick={() => setModalState({ type: 'CLOSE', enquiry: enq, mode: 'WIN' })} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Convert to Student">
                            <FaTrophy size={14} />
                          </button>
                          <button onClick={() => setModalState({ type: 'CLOSE', enquiry: enq, mode: 'LOSS' })} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Close as Lost">
                            <FaBan size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRM Modals */}
      <EnquiryDetailModal
        isOpen={modalState.type === 'DETAIL'}
        onClose={closeModal}
        enquiryId={modalState.enquiry?._id}
      />
      <LogFollowUpModal
        isOpen={modalState.type === 'FOLLOW_UP'}
        onClose={closeModal}
        enquiryId={modalState.enquiry?._id}
        onSuccess={handleModalSuccess}
      />
      <UpdateStatusModal
        isOpen={modalState.type === 'STATUS'}
        onClose={closeModal}
        enquiryId={modalState.enquiry?._id}
        currentStatus={modalState.enquiry?.status}
        currentPriority={modalState.enquiry?.priority}
        onSuccess={handleModalSuccess}
      />
      <ClosureModal
        isOpen={modalState.type === 'CLOSE'}
        onClose={closeModal}
        enquiryId={modalState.enquiry?._id}
        mode={modalState.mode}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}