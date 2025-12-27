import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import {
  FaFileDownload,
  FaFilter,
  FaEye,
  FaSearch,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";

export default function PaymentHistory({ academicYear }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    className: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [filterLoading, setFilterLoading] = useState(false);

  const loadPayments = useCallback(
  async (applyFilters = false) => {
    try {
      setLoading(true);
      if (applyFilters) setFilterLoading(true);

      const response = await api.get(API_ENDPOINTS.ADMIN.FEE.ALL, {
        params: {
          academicYear,
          status: filters.status || undefined,
          className: filters.className || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
        timeout: 15000,
      });

      console.log("Payment API Response:", response);

      // yahan se flat array nikalo
      let apiData = [];
      if (Array.isArray(response?.data?.data?.payments)) {
        apiData = response.data.data.payments;
      } else if (Array.isArray(response?.data?.payments)) {
        apiData = response.data.payments;
      } else if (Array.isArray(response?.payments)) {
        apiData = response.payments;
      }

      if (!Array.isArray(apiData) || apiData.length === 0) {
        setPayments([]);
        return;
      }

      // yahan har item already ek payment hai
      const paymentsData = apiData.map((p, idx) => ({
        _id: p._id || `payment-${idx}`,
        feePaymentId: p.feePaymentId,
        receiptNumber: p.receiptNumber || `RCP${idx + 1}`,
        studentName: p.student?.name || p.studentName || "Unknown",
        student: {
          name: p.student?.name || p.studentName || "Unknown",
          studentID: p.student?.studentID || p.studentID || "N/A",
        },
        className: p.className || "N/A",
        section: p.section || "",
        amountPaid: Number(p.amountPaid ?? p.amount ?? 0),
        paymentMethod: p.paymentMethod || p.paymentMode || "CASH",
        paymentDate: p.paymentDate || new Date().toISOString(),
        status: p.status || "PAID",
        remarks: p.remarks || "",
      }));

      setPayments(paymentsData);
    } catch (error) {
      console.error("❌ Error in loadPayments:", error);
      toast.error("Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  },
  [academicYear, filters]
);

  const handleApplyFilters = useCallback(() => {
    loadPayments(true);
  }, [loadPayments]);

  const updateFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      className: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  const filteredPayments = useMemo(() => {
    const q = filters.search.toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (payment) =>
        payment.student?.name?.toLowerCase().includes(q) ||
        payment.student?.studentID?.toLowerCase().includes(q) ||
        payment.receiptNumber?.toLowerCase().includes(q) ||
        payment.className?.toLowerCase().includes(q)
    );
  }, [payments, filters.search]);

  useEffect(() => {
    loadPayments();
  }, [academicYear, loadPayments]);

  const previewReceipt = (paymentId) => {
    try {
      const baseUrl =
        import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";
      const receiptUrl = `${baseUrl}/api/admin/fees/receipt/${paymentId}`;
      window.open(receiptUrl, "_blank");
      toast.success("Opening receipt preview...");
    } catch {
      toast.error("Failed to preview receipt");
    }
  };

  const downloadReceipt = useCallback(async (payment) => {
    try {
      const response = await api.get(
        API_ENDPOINTS.ADMIN.FEE.DOWNLOAD_RECEIPT(payment._id),
        {
          responseType: "blob",
          timeout: 45000,
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payment.studentName.replace(
        /\s+/g,
        ""
      )}_${payment.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success(`✅ ${payment.receiptNumber} downloaded`);
    } catch (error) {
      console.error("❌ Download failed:", error);
      toast.error("Download failed - Check console");
    }
  }, []);

  const downloadAllReceipts = async () => {
    try {
      toast.info("Generating bulk download...");
      const baseUrl =
        import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:5000";

      filteredPayments.forEach((payment) => {
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = `${baseUrl}/api/admin/fees/receipt/${payment._id}/download`;
          link.download = `receipt-${payment.receiptNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, Math.random() * 1000);
      });

      toast.success(`Started download of ${filteredPayments.length} receipts`);
    } catch {
      toast.error("Bulk download failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600" />
        <span className="sr-only">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment History</h2>
          <p className="text-slate-600">
            {filteredPayments.length} payments found
          </p>
        </div>
        {filteredPayments.length > 0 && (
          <button
            onClick={downloadAllReceipts}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-all font-medium shadow-lg"
          >
            <FaDownload />
            Download All Receipts
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <FaFilter className="text-purple-600" />
          <h4 className="text-lg font-bold text-slate-900">Filters & Search</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search student, receipt, ID..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          <input
            type="text"
            placeholder="Class Name"
            value={filters.className}
            onChange={(e) => updateFilter("className", e.target.value)}
            className="rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              className="rounded-xl border-2 border-slate-200 p-3 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleApplyFilters}
            disabled={filterLoading}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {filterLoading ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" />
                Applying Filters...
              </>
            ) : (
              "Apply Filters"
            )}
          </button>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Table */}
      {!loading && filteredPayments.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-lg border border-slate-100 p-12 text-center">
          <div className="text-slate-400 mb-4">
            <FaFileDownload className="mx-auto h-16 w-16" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No payments found
          </h3>
          <p className="text-slate-600">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">
              Payment History ({filteredPayments.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Receipt No
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Student
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Class
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Method
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {payment.receiptNumber || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {payment.student?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payment.student?.studentID}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-700 font-medium">
                        {payment.className}{" "}
                        {payment.section && `- ${payment.section}`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-green-700 text-lg">
                        ₹
                        {Number(payment.amountPaid || 0).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-700 font-medium">
                        {payment.paymentDate
                          ? new Date(
                              payment.paymentDate
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          payment.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "PARTIALLY_PAID"
                            ? "bg-yellow-100 text-yellow-800"
                            : payment.status === "PENDING"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => previewReceipt(payment._id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                          title="Preview Receipt"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => downloadReceipt(payment)}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all"
                          title="Download Receipt"
                        >
                          <FaFileDownload className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
