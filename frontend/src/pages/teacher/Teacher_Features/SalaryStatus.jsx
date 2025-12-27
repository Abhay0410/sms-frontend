// src/pages/teacher/Teacher_Features/SalaryStatus.jsx
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import BackButton from "../../../components/BackButton"

export default function SalaryStatus() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get("/api/teacher/salary/status");
        setData(resp || null);
      } catch (e) {
        toast.error(e.message || "Failed to load");
      }
    })();
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <BackButton to="/teacher/teacher-dashboard" />
      <h2 className="text-xl font-semibold text-gray-900">Salary Status</h2>
      <div className="mt-4 rounded border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-700">Month: {data.month}</p>
        <p className="text-sm text-gray-700">Status: {data.status}</p>
        <p className="text-sm text-gray-700">Amount: ₹{data.amount}</p>
      </div>
    </div>
  );
}
