// src/pages/parent/ViewChildFee.jsx
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api, { API_ENDPOINTS } from "../../services/api";
import BackButton from "../../components/BackButton";
import OptimizedImage from "../../components/OptimizedImage";
import {
  FaDollarSign,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileDownload,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaChild,
  FaPaperPlane,
} from "react-icons/fa";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

export default function ViewChildFee() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "CASH",
    transactionId: "",
    chequeNumber: "",
    bankName: "",
    upiId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const loadChildren = useCallback(async () => {
    try {
      const resp = await api.get(API_ENDPOINTS.PARENT.AUTH.PROFILE);
      console.log("👪 Parent PROFILE raw resp (ViewChildFee):", resp);

      const parent = resp?.data?.parent || resp?.parent || {};
      setSchoolId(parent.schoolId);
      const childrenData = Array.isArray(parent.children)
        ? parent.children
        : [];

      setChildren(childrenData);

      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Load children error:", error);
      toast.error(error.message || "Failed to load children");
      setChildren([]);
      setSelectedChild(null);
      setLoading(false);
    }
  }, []);

  const loadChildFee = useCallback(async () => {
    if (!selectedChild) return;

    try {
      setLoading(true);
      const resp = await api.get(
        API_ENDPOINTS.PARENT.FEE.CHILD_STATUS(selectedChild._id),
      );
      console.log("👶 Child fee raw resp:", resp);

      // Axios interceptor: resp = { success, message, data: {...} }
      const data = resp?.data || resp;
      setFeeData(data || null);
    } catch (error) {
      console.error("Child fee load error:", error);
      toast.error(error.message || "Failed to load fee details");
      setFeeData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  // Payment history directly from feeData.payments
  const loadPaymentHistory = useCallback(() => {
    if (!feeData) return;

    const fp = feeData;
    const allPayments = [];

    (fp.payments || []).forEach((p) => {
      allPayments.push({
        _id: p._id,
        receiptNumber: p.receiptNumber,
        paymentDate: p.paymentDate,
        amountPaid: p.amount,
        paymentMethod: p.paymentMode,
        status: p.status || fp.status,
        feePaymentId: fp._id,
      });
    });

    setPayments(allPayments);
  }, [feeData]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (selectedChild) {
      loadChildFee();
    }
  }, [selectedChild, loadChildFee]);

  useEffect(() => {
    if (feeData) {
      loadPaymentHistory();
    }
  }, [feeData, loadPaymentHistory]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const feeDetails = feeData
      ? {
          totalFee: feeData.totalAmount,
          paidAmount: feeData.paidAmount,
          pendingAmount: feeData.pendingAmount,
          paymentStatus: feeData.status,
        }
      : null;

    if (!paymentForm.amountPaid || parseFloat(paymentForm.amountPaid) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (
      feeDetails &&
      parseFloat(paymentForm.amountPaid) > feeDetails.pendingAmount
    ) {
      toast.error("Amount cannot exceed pending fee");
      return;
    }

    try {
      const payload = {
        childId: selectedChild._id,
        amountPaid: parseFloat(paymentForm.amountPaid),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        chequeNumber: paymentForm.chequeNumber,
        bankName: paymentForm.bankName,
        upiId: paymentForm.upiId,
        paymentDate: paymentForm.paymentDate,
        remarks: paymentForm.remarks,
      };

      await api.post(API_ENDPOINTS.PARENT.FEE.SUBMIT_PAYMENT, payload);

      toast.success("Payment submitted successfully! Awaiting admin approval.");

      // Reset form
      setPaymentForm({
        amountPaid: "",
        paymentMethod: "CASH",
        transactionId: "",
        chequeNumber: "",
        bankName: "",
        upiId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        remarks: "",
      });

      setShowPaymentModal(false);
      loadChildFee();
    } catch (error) {
      toast.error(error.message || "Failed to submit payment");
    }
  };

  const downloadReceipt = async (feePaymentId, paymentId) => {
    try {
      const url = API_ENDPOINTS.PARENT.FEE.DOWNLOAD_RECEIPT(
        feePaymentId,
        paymentId,
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
      console.error("Parent receipt download failed:", error);
      toast.error(error?.message || "Failed to download receipt");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading && children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <BackButton to="/parent/parent-dashboard" />
          <div className="mt-12 text-center py-16 rounded-2xl bg-white shadow-lg border border-slate-100">
            <FaChild className="h-20 w-20 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900">
              No Children Found
            </h3>
            <p className="mt-3 text-slate-600">
              No student records are linked to your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  const childInfo = selectedChild;
  const feeDetails = feeData
    ? {
        totalFee: feeData.totalAmount,
        paidAmount: feeData.paidAmount,
        pendingAmount: feeData.pendingAmount,
        paymentStatus: feeData.status,
      }
    : null;
  const feeStructure = feeData?.feeStructure || null;

  const childPhotoUrl = childInfo?.profilePicture
    ? childInfo.profilePicture.startsWith("http")
      ? childInfo.profilePicture
      : `${API_URL}/uploads/${schoolId}/students/${childInfo.profilePicture}?t=${Date.now()}`
    : `https://ui-avatars.com/api/?name=${childInfo?.name}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton to="/parent/parent-dashboard" />

        {/* Header */}
        <div className="mt-6">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Child&apos;s Fee Details
          </h2>
          <p className="mt-2 text-slate-600 flex items-center gap-2">
            <FaDollarSign className="text-green-600" />
            View and manage your child&apos;s fee payments
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {children.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedChild(c)}
                className={`flex-shrink-0 rounded-xl px-6 py-3 font-semibold transition-all ${
                  selectedChild?._id === c._id
                    ? "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg scale-105"
                    : "bg-white text-slate-700 border-2 border-slate-200 hover:border-green-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Child Info Card */}
        {childInfo && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={childPhotoUrl}
                  alt={childInfo.name}
                  className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-xl"
                  width={80}
                  height={80}
                />

                <div>
                  <h3 className="text-2xl font-bold">{childInfo.name}</h3>
                  <p className="text-green-100 font-medium">
                    {childInfo.studentID}
                  </p>
                  <p className="text-green-100">
                    Class {childInfo.className} - Section {childInfo.section}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100">Academic Year</p>
                <p className="text-2xl font-bold">{childInfo.academicYear}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fee Summary Cards */}
        {feeDetails && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <FaMoneyBillWave className="h-8 w-8 text-green-600" />
                <p className="text-sm text-slate-600">Total Fee</p>
              </div>
              <p className="text-3xl font-bold text-slate-900">
                ₹{feeDetails.totalFee?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-6 shadow-lg border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
                <p className="text-sm text-green-700">Paid Amount</p>
              </div>
              <p className="text-3xl font-bold text-green-900">
                ₹{feeDetails.paidAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-6 shadow-lg border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <FaExclamationCircle className="h-8 w-8 text-red-600" />
                <p className="text-sm text-red-700">Pending Amount</p>
              </div>
              <p className="text-3xl font-bold text-red-900">
                ₹{feeDetails.pendingAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-6 shadow-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <FaCalendarAlt className="h-8 w-8 text-blue-600" />
                <p className="text-sm text-blue-700">Payment Status</p>
              </div>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(
                  feeDetails.paymentStatus,
                )}`}
              >
                {feeDetails.paymentStatus?.replace("_", " ")}
              </span>
            </div>
          </div>
        )}

        {/* Make Payment Button */}
        {feeDetails && feeDetails.pendingAmount > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full md:w-auto rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4 text-white font-semibold hover:from-green-700 hover:to-teal-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              <FaPaperPlane />
              Submit Payment
            </button>
          </div>
        )}

        {/* Fee Breakdown */}
        {feeStructure && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Fee Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.isArray(feeStructure)
                ? feeStructure.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <p className="text-sm text-slate-600">
                        {item.feeName || "Fee"}
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        ₹{item.amount?.toLocaleString("en-IN") || 0}
                      </p>
                    </div>
                  ))
                : Object.entries(feeStructure)
                    .filter(
                      ([key, value]) =>
                        typeof value === "number" &&
                        ![
                          "totalFee",
                          "paymentSchedule",
                          "dueDate",
                          "lateFeeAmount",
                          "lateFeeApplicableAfter",
                        ].includes(key),
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <p className="text-sm text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          ₹{value?.toLocaleString("en-IN") || 0}
                        </p>
                      </div>
                    ))}
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="mt-8 rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">
              Payment History
            </h3>
          </div>

          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Receipt No
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Date
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Method
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-slate-700">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <span className="font-mono text-sm font-semibold text-slate-900">
                          {payment.receiptNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-700">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm font-bold text-green-700">
                          ₹{payment.amountPaid?.toLocaleString("en-IN") || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-700">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            payment.status === "PAID" ||
                            payment.status === "APPROVED" ||
                            payment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "PENDING" ||
                                payment.status === "PARTIAL"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status || "PAID"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {(payment.status === "PAID" ||
                          payment.status === "APPROVED" ||
                          payment.status === "COMPLETED" ||
                          payment.status === "PARTIAL" ||
                          !payment.status) && (
                          <button
                            onClick={() =>
                              downloadReceipt(payment.feePaymentId, payment._id)
                            }
                            className="text-green-600 hover:text-green-800 transition"
                          >
                            <FaFileDownload className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FaMoneyBillWave className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-semibold text-slate-600">
                No payment history
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Payments will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">
                Submit Payment
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Pending Amount: ₹
                {feeDetails?.pendingAmount?.toLocaleString("en-IN")}
              </p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amountPaid}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amountPaid: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    required
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Card</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Conditional Fields */}
                {paymentForm.paymentMethod === "UPI" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={paymentForm.upiId}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          upiId: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                      placeholder="example@upi"
                    />
                  </div>
                )}

                {paymentForm.paymentMethod === "CHEQUE" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Cheque Number
                      </label>
                      <input
                        type="text"
                        value={paymentForm.chequeNumber}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            chequeNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                        placeholder="Cheque number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={paymentForm.bankName}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            bankName: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                        placeholder="Bank name"
                      />
                    </div>
                  </>
                )}

                {(paymentForm.paymentMethod === "BANK_TRANSFER" ||
                  paymentForm.paymentMethod === "ONLINE" ||
                  paymentForm.paymentMethod === "CARD") && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={paymentForm.transactionId}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          transactionId: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                      placeholder="Transaction ID / Reference number"
                    />
                  </div>
                )}

                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={paymentForm.remarks}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        remarks: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-green-500 focus:outline-none"
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 font-semibold text-white hover:from-green-700 hover:to-teal-700 transition shadow-lg"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
