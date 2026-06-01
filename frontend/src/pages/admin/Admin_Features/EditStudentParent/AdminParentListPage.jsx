import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { FaUserFriends } from "react-icons/fa";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

export default function AdminParentListPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchParents = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await api.get(
        `${API_ENDPOINTS.ADMIN.PARENT.ALL}?${params.toString()}`
      );

      console.log("Parents API Response:", res.data);

      // ✅ FIXED
      const payload = res?.data || {};

      const list = payload?.parents || [];

      const totalCount =
        payload?.pagination?.total || 0;

      setParents(list);
      setTotal(totalCount);

    } catch (e) {
      console.error("Fetch parents error:", e);

      toast.error(
        e?.response?.data?.message ||
        e.message ||
        "Failed to load parents"
      );

      setParents([]);
      setTotal(0);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [page, search]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const onReset = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const totalPages =
    total > 0 ? Math.ceil(total / limit) : 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600 font-medium">
          Loading parents...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
    <div className="    mb-6">
  <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
    <FaUserFriends className="text-indigo-500 text-4xl rounded-xl  bg-slate-50 border-indigo-500" />
    Parents
  </h1>

  <p className="text-sm text-slate-500 font-semibold mt-1">
    Manage parent profiles from admin dashboard
  </p>
</div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow p-4 mb-5">
          <form
            onSubmit={onSearch}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) =>
                setSearchInput(e.target.value)
              }
              placeholder="Search parent name, ID, email..."
              className="flex-1 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
            >
              Reset
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">

            <table className="min-w-full text-left">

              <thead className="bg-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Parent
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Parent ID
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Relation
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Phone
                  </th>

                  <th className="px-4 py-3 text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {parents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No parents found
                    </td>
                  </tr>
                ) : (

                  parents.map((p) => (

                    <tr
                      key={p._id}
                      className="border-b hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">

                        <div className="flex items-center gap-3">

                          {/* <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                            {(p.name || "P")
                              .charAt(0)
                              .toUpperCase()}
                          </div> */}
                          <div className="h-10 w-10 rounded-full overflow-hidden border">
                            <img
                              src={
                                p.profilePicture
                                  ? p.profilePicture.startsWith("http")
                                    ? p.profilePicture
                                    : `${API_URL}/uploads/${p.schoolId}/parents/${p.profilePicture}`
                                  : "/assets/default-parent-avatar.png"
                              }
                              alt={p.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/assets/default-parent-avatar.png";
                              }}
                            />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {p.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {p.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {p.parentID || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {p.relation || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {p.phone || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            console.log("CLICKED PARENT:", p);
                            navigate(`${p._id}`)
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50">

            <p className="text-sm text-slate-600">
              Page {page} of {totalPages} • Total {total} parents
            </p>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white border disabled:opacity-50"
              >
                Next
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}