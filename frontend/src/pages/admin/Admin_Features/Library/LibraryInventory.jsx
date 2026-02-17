import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../../../../services/api";
import { API_ENDPOINTS } from "../../../../constants/apiEndpoints";
import { 
  FaPlus, FaSearch, FaFilter, FaBook, FaTrash, 
  FaEdit, FaSpinner, FaTimes, FaBarcode, FaCheck,
  FaEye, FaClone, FaPrint, FaDownload, FaCalendar,
  FaTag, FaLocationArrow, FaUser, FaChartBar, FaHistory
} from "react-icons/fa";

export default function LibraryInventory() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState({ 
    search: "", 
    category: "", 
    status: "",
    subject: "" 
  });
  const [formData, setFormData] = useState({
    title: "", 
    author: "", 
    serialCode: "", 
    category: "ACADEMIC",
    subject: "", 
    rackNumber: "", 
    price: "",
    isbn: "",
    publisher: "",
    edition: "",
    year: new Date().getFullYear(),
    pages: "",
    description: ""
  });

  // Fetch Inventory
  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.LIBRARY.ALL_BOOKS, { params: filters });
      setBooks(res.data?.data || res.data || []);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  // Handle Add Book
  const handleAddBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(API_ENDPOINTS.ADMIN.LIBRARY.ADD_BOOK, formData);
      toast.success("Book added successfully!");
      setShowAddModal(false);
      setFormData({
        title: "", author: "", serialCode: "", category: "ACADEMIC",
        subject: "", rackNumber: "", price: "", isbn: "",
        publisher: "", edition: "", year: new Date().getFullYear(),
        pages: "", description: ""
      });
      loadInventory();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error adding book");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book from inventory?")) return;
    try {
      await api.delete(API_ENDPOINTS.ADMIN.LIBRARY.DELETE_BOOK(id));
      toast.success("Book removed from inventory");
      loadInventory();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
      case 'ISSUED': return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
      case 'LOST': return 'bg-gradient-to-r from-rose-500 to-red-600 text-white';
      case 'DAMAGED': return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      case 'RESERVED': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'ACADEMIC': return 'bg-gradient-to-r from-indigo-500 to-purple-500';
      case 'FICTION': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'REFERENCE': return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'SCIENCE': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600';
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: books.length,
      available: books.filter(b => b.status === 'AVAILABLE').length,
      issued: books.filter(b => b.status === 'ISSUED').length,
      categories: [...new Set(books.map(b => b.category))].length
    };
  }, [books]);

  // Pagination
  const totalPages = Math.ceil(books.length / itemsPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Library Inventory
          </h1>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <FaBook className="text-orange-500" />
            Manage book catalog, track copies, and monitor availability
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Books</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
                <FaCheck className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-slate-900">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl">
                <FaUser className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Issued</p>
                <p className="text-2xl font-bold text-slate-900">{stats.issued}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <FaTag className="text-white text-xl" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold text-slate-900">{stats.categories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, author, ISBN, or serial code..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3">
                <select
                  className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="">All Categories</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="FICTION">Fiction</option>
                  <option value="REFERENCE">Reference</option>
                  <option value="SCIENCE">Science</option>
                  <option value="HISTORY">History</option>
                  <option value="OTHERS">Others</option>
                </select>

                <select
                  className="bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ISSUED">Issued</option>
                  <option value="LOST">Lost</option>
                  <option value="DAMAGED">Damaged</option>
                  <option value="RESERVED">Reserved</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                  <FaPlus /> Add Book
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  <th className="p-6 font-bold uppercase tracking-wider">Book Details</th>
                  <th className="p-6 text-center font-bold uppercase tracking-wider">Category</th>
                  <th className="p-6 text-center font-bold uppercase tracking-wider">Serial Code</th>
                  <th className="p-6 text-center font-bold uppercase tracking-wider">Location</th>
                  <th className="p-6 text-center font-bold uppercase tracking-wider">Status</th>
                  <th className="p-6 text-center font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading inventory...</p>
                        <p className="text-sm text-slate-400 mt-1">Fetching book records</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBooks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <FaBook className="text-5xl text-slate-200 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-700 mb-2">No books found</h3>
                      <p className="text-slate-500">Try adjusting your search or filters</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Add your first book
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-16 rounded-lg flex items-center justify-center ${getCategoryStyle(book.category)} text-white font-bold text-xs`}>
                            {book.category?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                              {book.title}
                            </p>
                            <p className="text-sm text-slate-600 mb-1">{book.author}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {book.isbn && (
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                  ISBN: {book.isbn}
                                </span>
                              )}
                              {book.subject && (
                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                                  {book.subject}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-sm font-medium text-slate-700">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg border border-slate-200">
                          <FaBarcode className="text-orange-500" />
                          <span className="font-mono font-bold">{book.serialCode}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-800">{book.rackNumber || 'N/A'}</span>
                          {book.rackNumber && (
                            <FaLocationArrow className="text-slate-400 text-xs" />
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-2 rounded-lg text-xs font-bold ${getStatusStyle(book.status)}`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewBook(book)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="p-2.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-all"
                            title="Edit Book"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(book._id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all"
                            title="Delete Book"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && books.length > 0 && (
            <div className="border-t border-slate-100 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500 font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, books.length)} of {books.length} books
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === i + 1
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-orange-50 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FaChartBar className="text-orange-500" /> Status Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Available</p>
                <p className="text-xs text-slate-500">Ready to issue</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Issued</p>
                <p className="text-xs text-slate-500">Currently with student</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-red-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Lost</p>
                <p className="text-xs text-slate-500">Cannot be located</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Damaged</p>
                <p className="text-xs text-slate-500">Needs repair</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600"></div>
              <div>
                <p className="text-sm font-medium text-slate-700">Reserved</p>
                <p className="text-xs text-slate-500">On hold</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl my-8">
            <div className="p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Add New Book to Library</h3>
                  <p className="text-orange-100 mt-1">Enter book details below</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                >
                  <FaTimes className="text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddBook} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Book Title *
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter book title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Author *
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ISBN
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.isbn}
                    onChange={e => setFormData({...formData, isbn: e.target.value})}
                    placeholder="ISBN number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Serial Code *
                  </label>
                  <div className="relative">
                    <input
                      required
                      className="w-full px-4 py-3 border-2 border-orange-200 bg-orange-50 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      value={formData.serialCode}
                      onChange={e => setFormData({...formData, serialCode: e.target.value})}
                      placeholder="Library serial code"
                    />
                    <FaBarcode className="absolute right-3 top-3.5 text-orange-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="FICTION">Fiction</option>
                    <option value="REFERENCE">Reference</option>
                    <option value="SCIENCE">Science</option>
                    <option value="HISTORY">History</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g. Mathematics, Physics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rack Number
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.rackNumber}
                    onChange={e => setFormData({...formData, rackNumber: e.target.value})}
                    placeholder="e.g. R-12, Shelf-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="Book price"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" /> Saving Book...
                    </span>
                  ) : (
                    "Add to Library"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">Book Details</h3>
                  <p className="text-slate-300 text-sm">{selectedBook.title}</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Author</p>
                  <p className="font-semibold text-slate-800">{selectedBook.author}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Category</p>
                  <p className="font-semibold text-slate-800">{selectedBook.category}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Serial Code</p>
                  <p className="font-semibold text-slate-800 font-mono">{selectedBook.serialCode}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusStyle(selectedBook.status)}`}>
                    {selectedBook.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}