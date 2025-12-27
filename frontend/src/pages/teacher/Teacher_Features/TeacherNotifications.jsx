// src/pages/teacher/Teacher_Features/TeacherNotifications.jsx
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import BackButton from "../../../components/BackButton"
export default function TeacherNotifications() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const resp = await api.get("/api/teacher/notifications");
      setItems(resp.notifications || []);
    } catch (e) {
      toast.error(e.message || "Failed to load");
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/teacher/notifications/${id}/read`);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to mark read");
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <BackButton to="/teacher/teacher-dashboard" />
      <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
      <div className="mt-4 space-y-3">
        {items.map((n) => (
          <div key={n.id} className="rounded border bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && (
                <button onClick={() => markRead(n.id)} className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700">
                  Mark read
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-700">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
