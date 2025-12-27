import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { FaSearch, FaRupeeSign } from "react-icons/fa";

export default function RecordPayment({ academicYear }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

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

  // --------- Load students with fee data ----------
  const loadStudents = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const response = await api.get(
          API_ENDPOINTS.ADMIN.FEE.STUDENTS_WITH_FEES,
          {
            params: {
              academicYear,
              search: searchTerm,
              page,
              limit: 50,
            },
          }
        );

        let studentsData = [];
        let paginationData = {};

        if (response.students !== undefined) {
          studentsData = response.students;
          paginationData = response.pagination || {};
        } else if (response.data?.students !== undefined) {
          studentsData = response.data.students;
          paginationData = response.data.pagination || {};
        } else if (response.data?.success && response.data.data?.students) {
          studentsData = response.data.data.students;
          paginationData = response.data.data.pagination || {};
        } else {
          setStudents([]);
          return;
        }

        const finalPagination = {
          current: paginationData.current || page,
          pages: paginationData.pages || 1,
          total: paginationData.total || studentsData.length,
        };

        setStudents(studentsData);
        setPagination(finalPagination);
      } catch (error) {
        console.error("❌ Failed to load students:", error);
        toast.error("Failed to load students");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    },
    [academicYear, searchTerm]
  );

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      loadStudents(1);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [loadStudents]);

  // --------- Helpers ----------
  const updateFormField = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const getSafeFeeNumbers = (feeDetails = {}) => {
    const total = Number(feeDetails.totalAmount || feeDetails.totalFee || 0);
    const paid = Number(feeDetails.paidAmount || 0);
    let pending = Number(
      typeof feeDetails.balancePending === "number"
        ? feeDetails.balancePending
        : feeDetails.pendingAmount
    );
    if (isNaN(pending)) pending = total - paid;
    if (pending < 0) pending = 0;
    return { total, paid, pending };
  };

  const getStatusBadge = (student) => {
    const fd = student.feeDetails;
    if (!fd) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          No Fee Set
        </span>
      );
    }

    const { total, paid, pending } = getSafeFeeNumbers(fd);
    const status = fd.status;
    const classHasFeeStructure = fd.classHasFeeStructure;

    if (status === "NOT_SET" && !classHasFeeStructure) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          No Fee Set
        </span>
      );
    }
    if (status === "ERROR") {
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
          Error
        </span>
      );
    }

    const epsilon = 0.01;
    const isPaid = pending <= epsilon && paid >= total - epsilon;

    if (isPaid || status === "PAID") {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          Paid
        </span>
      );
    }
    if (status === "PARTIALLY_PAID") {
      return (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
          Partial
        </span>
      );
    }
    if (status === "OVERDUE") {
      return (
        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
          Overdue
        </span>
      );
    }
    if (classHasFeeStructure && !fd.feePaymentId) {
      return (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          Class Fee Set
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
        Pending
      </span>
    );
  };

  const canMakePayment = (student) => {
    if (!student.feeDetails) return false;
    const fd = student.feeDetails;
    const { total, pending } = getSafeFeeNumbers(fd);
    if (fd.status === "NOT_SET" && !fd.classHasFeeStructure) return false;
    return pending > 0 || (fd.classHasFeeStructure && (pending > 0 || total > 0));
  };

  const getPaymentButtonText = (student) => {
    if (!student.feeDetails) return "No Fee Set";
    const fd = student.feeDetails;
    const { pending } = getSafeFeeNumbers(fd);
    if (fd.classHasFeeStructure && !fd.feePaymentId) return "Create & Pay";
    if (pending > 0) return "Record Payment";
    return "No Pending Fee";
  };

  // --------- Open modal ----------
  const handleRecordPayment = (student) => {
    setSelectedStudent(student);
    const { pending } = getSafeFeeNumbers(student.feeDetails || {});
    setPaymentForm({
      amountPaid: pending || "",
      paymentMethod: "CASH",
      transactionId: "",
      chequeNumber: "",
      bankName: "",
      upiId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      remarks: `Payment for ${student.name} - ${student.className}`,
    });
    setShowModal(true);
  };

  // --------- Submit payment ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("No student selected");
      return;
    }

    const amount = parseFloat(paymentForm.amountPaid);
    if (amount <= 0 || isNaN(amount)) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    const fd = selectedStudent.feeDetails;
    if (
      !fd ||
      (fd.status === "NOT_SET" && !fd.classHasFeeStructure)
    ) {
      toast.error("Fee structure not set for this student. Please set class fees first.");
      return;
    }

    const { total, pending } = getSafeFeeNumbers(fd);
    const maxAmount = pending || total;
    if (amount > maxAmount) {
      toast.error(`Amount (₹${amount}) exceeds pending fee (₹${maxAmount})`);
      return;
    }

    try {
      setSaving(true);

      const paymentData = {
        studentId: selectedStudent._id,
        amountPaid: amount,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId || undefined,
        chequeNumber: paymentForm.chequeNumber || undefined,
        bankName: paymentForm.bankName || undefined,
        upiId: paymentForm.upiId || undefined,
        paymentDate: paymentForm.paymentDate,
        remarks:
          paymentForm.remarks ||
          `Payment recorded for ${selectedStudent.name}`,
        academicYear,
      };

      if (fd.feePaymentId) {
        paymentData.feePaymentId = fd.feePaymentId;
      }

      const response = await api.post(
        API_ENDPOINTS.ADMIN.FEE.RECORD_PAYMENT,
        paymentData
      );

      toast.success(
        `Payment of ₹${amount} recorded successfully for ${selectedStudent.name}`
      );
      if (response.data?.receiptNumber) {
        toast.info(`Receipt Number: ${response.data.receiptNumber}`);
      }

      setShowModal(false);
      await loadStudents(pagination.current);
    } catch (error) {
      console.error("❌ Payment recording error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to record payment";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // --------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  const renderAmount = (value, className = "") => (
    <span className={`text-sm ${className}`}>
      ₹{Number(value || 0).toLocaleString("en-IN")}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Record Payment</h3>
          <p className="text-sm text-slate-600 mt-1">
            Academic Year:{" "}
            <span className="font-semibold text-purple-600">
              {academicYear}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            View pending fees and record payments with automatic installment allocation.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">
            Found:{" "}
            <span className="font-semibold">{pagination.total} students</span>
          </p>
          <p className="text-xs text-slate-500">
            Page {pagination.current} of {pagination.pages}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, ID, or class..."
            className="w-full rounded-xl border-2 border-slate-200 pl-12 pr-4 py-4 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            Select Student to Record Payment
          </h3>
        </div>
        {students.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Student
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-700">
                      Class
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-slate-700">
                      Total Fee
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-slate-700">
                      Paid
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-slate-700">
                      Pending
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const fd = student.feeDetails || {};
                    const { total, paid, pending } = getSafeFeeNumbers(fd);
                    const canPay = canMakePayment(student);

                    return (
                      <tr
                        key={student._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.studentID}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-slate-700">
                            {student.className} - {student.section}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {renderAmount(total, "text-slate-700")}
                        </td>
                        <td className="p-4 text-right">
                          {renderAmount(paid, "font-bold text-green-700")}
                        </td>
                        <td className="p-4 text-right">
                          {renderAmount(
                            pending,
                            `font-bold ${
                              pending > 0 ? "text-red-700" : "text-green-700"
                            }`
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {getStatusBadge(student)}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleRecordPayment(student)}
                            disabled={!canPay}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                              canPay
                                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                                : "bg-slate-200 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            {getPaymentButtonText(student)}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => loadStudents(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() => loadStudents(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="px-4 py-2 bg-slate-100 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="text-slate-400 text-6xl mb-4">🎓</div>
            <p className="text-slate-600 text-lg">
              {searchTerm
                ? "No students found matching your search"
                : "No students found"}
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Academic Year: {academicYear}
            </p>
            <button
              onClick={() => loadStudents(1)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">
                Record Payment
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Student:</span>{" "}
                  {selectedStudent.name} ({selectedStudent.studentID})
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Class:</span>{" "}
                  {selectedStudent.className} - {selectedStudent.section}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm font-semibold text-green-700">
                    Paid: ₹
                    {getSafeFeeNumbers(
                      selectedStudent.feeDetails
                    ).paid.toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm font-semibold text-red-700">
                    Pending: ₹
                    {getSafeFeeNumbers(
                      selectedStudent.feeDetails
                    ).pending.toLocaleString("en-IN")}
                  </p>
                </div>
                {selectedStudent.feeDetails?.classHasFeeStructure &&
                  !selectedStudent.feeDetails.feePaymentId && (
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Class has fee structure. A fee record will be created
                      automatically on first payment.
                    </p>
                  )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Amount <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={getSafeFeeNumbers(
                        selectedStudent.feeDetails
                      ).pending}
                      value={paymentForm.amountPaid}
                      onChange={(e) =>
                        updateFormField("amountPaid", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-slate-200 pl-10 pr-4 py-3 focus:border-purple-500 focus:outline-none"
                      required
                      placeholder="Enter amount"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum: ₹
                    {getSafeFeeNumbers(
                      selectedStudent.feeDetails
                    ).pending.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Method <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      updateFormField("paymentMethod", e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
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
                    Payment Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      updateFormField("paymentDate", e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Conditional fields */}
                {paymentForm.paymentMethod === "UPI" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={paymentForm.upiId}
                      onChange={(e) =>
                        updateFormField("upiId", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
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
                          updateFormField("chequeNumber", e.target.value)
                        }
                        className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
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
                          updateFormField("bankName", e.target.value)
                        }
                        className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
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
                        updateFormField("transactionId", e.target.value)
                      }
                      className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
                      placeholder="Transaction ID / Reference number"
                    />
                  </div>
                )}

                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={paymentForm.remarks}
                    onChange={(e) =>
                      updateFormField("remarks", e.target.value)
                    }
                    className="w-full rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-blue-700 transition shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Recording Payment...
                    </span>
                  ) : (
                    getPaymentButtonText(selectedStudent)
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
