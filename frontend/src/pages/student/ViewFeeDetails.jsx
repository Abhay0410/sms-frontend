// pages/student/ViewFeeDetails.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import {
  FaDollarSign,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileDownload,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHistory
} from "react-icons/fa";

export default function ViewFeeDetails() {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeDetails();
  }, []);

  const loadFeeDetails = async () => {
    try {
      setLoading(true);
      // This endpoint returns the full FeePayment document including the 'payments' array
      const resp = await api.get(API_ENDPOINTS.STUDENT.FEE.STATUS);
      console.log("📥 Fee Data Response:", resp); // Debugging

      const data = resp?.data?.data || resp?.data || resp;
      setFeeData(data);
      
    } catch (error) {
      console.error("Failed to load fee details:", error);
      toast.error(error.message || "Failed to load fee details");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (feePaymentId, paymentId) => {
    try {
      const url = API_ENDPOINTS.STUDENT.FEE.DOWNLOAD_RECEIPT(
        feePaymentId,
        paymentId
      );

      const response = await api.get(url, {
        responseType: "blob",
        timeout: 45000,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `Fee_Receipt_${paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
      toast.success("Receipt downloaded");
    } catch (error) {
      console.error("Receipt download failed:", error);
      toast.error(error?.message || "Failed to download receipt");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
      case "PAID":
        return "bg-green-100 text-green-800 border-green-300";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "OVERDUE":
      case "PENDING":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fee details...</p>
        </div>
      </div>
    );
  }

  // ✅ 1. Extract Student Info safely
  const student = feeData
    ? {
        name: feeData.studentName,
        studentID: feeData.studentID,
        className: feeData.className,
        section: feeData.section,
        academicYear: feeData.academicYear,
      }
    : null;

  // ✅ 2. Extract Fee Summary safely
  const feeDetails = feeData
    ? {
        totalFee: feeData.totalAmount,
        paidAmount: feeData.paidAmount,
        pendingAmount: feeData.pendingAmount,
        paymentStatus: feeData.status,
      }
    : null;

  // ✅ 3. Extract Fee Breakdown safely
  const feeStructure = feeData?.feeStructure || [];

  // ✅ 4. Extract Payment History DIRECTLY from feeData (Fixing your issue)
  // The 'payments' array is already inside the response you shared
  const paymentHistory = feeData?.payments || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/student/student-dashboard" />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Details</h1>
          <p className="mt-2 text-gray-600">View your fee structure and payment history</p>
        </div>

        {/* Student Info Card */}
        {student && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                <p className="text-blue-100 mb-4">{student.studentID}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm backdrop-blur-sm">
                  <FaCheckCircle className="mr-2" />
                  Class {student.className} • Section {student.section}
                </div>
              </div>
              <div className="md:text-right flex flex-col justify-center">
                <p className="text-blue-100 text-sm">Academic Year</p>
                <p className="text-xl font-bold">{student.academicYear}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {feeDetails && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Fee */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaMoneyBillWave className="text-blue-600 h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-600">Total Fee</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{feeDetails.totalFee?.toLocaleString("en-IN") || 0}
              </p>
            </div>

            {/* Paid Amount */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaCheckCircle className="text-green-600 h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ₹{feeDetails.paidAmount?.toLocaleString("en-IN") || 0}
              </p>
            </div>

            {/* Pending Amount */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <FaExclamationCircle className="text-red-600 h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ₹{feeDetails.pendingAmount?.toLocaleString("en-IN") || 0}
              </p>
            </div>

            {/* Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <FaCalendarAlt className="text-gray-600 h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-gray-600">Status</p>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(feeDetails.paymentStatus)}`}>
                {feeDetails.paymentStatus?.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Fee Breakdown Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaDollarSign className="text-gray-500" />
                  Fee Breakdown
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {feeStructure.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-gray-700 font-medium">{item.feeName}</span>
                      <span className="text-gray-900 font-bold">₹{item.amount?.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaHistory className="text-gray-500" />
                  Payment History
                </h3>
              </div>
              
              <div className="p-0">
                {paymentHistory.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {paymentHistory.map((payment) => (
                      <div key={payment._id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{payment.receiptNumber}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString("en-IN", {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                          <span className="text-green-600 font-bold">
                            ₹{payment.amount?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                            {payment.paymentMode}
                          </span>
                          
                          <button
                            onClick={() => downloadReceipt(feeData._id, payment._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <FaFileDownload /> Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p>No payments recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
