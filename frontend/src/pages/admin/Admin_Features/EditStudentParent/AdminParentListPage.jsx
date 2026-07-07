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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
    </div>
  </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl mb-6">

          <div className="flex items-center gap-2 sm:gap-4">

            <div className="bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
              <FaUserFriends className="text-3xl sm:text-4xl" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-3xl font-bold">
                Parents
              </h1>

              <p className="text-slate-300 font-medium mt-1 sm:text-base">
                Manage Parent Records
              </p>
            </div>

          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-3xl shadow-lg p-5 mb-7">

          <form
            onSubmit={onSearch}
            className="flex flex-col lg:flex-row gap-3"
          >

            <div className="flex-1 relative">

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search parent name, email or ID..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm md:text-base focus:ring-2 focus:ring-slate-500 outline-none"
              />

              <svg
                className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-5-5"></path>
                <circle cx="11" cy="11" r="7"></circle>
              </svg>

            </div>

            <button
              type="submit"
              className="w-full lg:w-auto bg-indigo-600 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onReset}
              className="w-full lg:w-auto bg-slate-200 hover:bg-slate-300 px-6 py-3 rounded-xl font-semibold"
            >
              Reset
            </button>

          </form>

        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">

            <table className="min-w-[750px] w-full">

              <thead className="bg-slate-800 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-white">
                    Parent
                  </th>

                  <th className="px-6 py-4 text-left text-white">Parent ID</th>
                  <th className="px-6 py-4 text-left text-white">Relation</th>
                  <th className="px-6 py-4 text-left text-white">Phone</th>
                  <th className="px-6 py-4 text-center text-white">Action</th>
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

                  parents.map((p, index) => (

                    <tr
                      key={p._id}
                      className={`border-b hover:bg-slate-50 transition ${index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
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
                              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-4 border-slate-200"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/assets/default-parent-avatar.png";
                              }}
                            />
                          </div>

                          <div>
                            <h3 className="font-semibold  uppercase text-sm md:text-base text-slate-800">
                              {p.name}
                            </h3>

                            <p className="text-xs md:text-sm text-slate-500 break-all">
                              {p.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {p.parentID || "-"}
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {p.relation || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-medium">
                        {p.phone || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`${p._id}`)}
                          className="bg-slate-800 hover:bg-slate-900 text-white px-3 md:px-5 py-2 rounded-xl text-sm font-semibold transition"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50 border-t px-4 md:px-6 py-4 flex flex-col gap-4 md:flex-row justify-between items-center">

            <p className="text-center md:text-left text-sm text-slate-600 font-medium">
              Showing Page <span className="font-bold">{page}</span> of{" "}
              <span className="font-bold">{totalPages}</span> • {total} Parents
            </p>

            <div className="flex w-full md:w-auto justify-center gap-3">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl border bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-40"
              >
                Next →
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}