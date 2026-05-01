import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const ManualExpenseModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    description: ''
  });

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.EXPENSE.CATEGORIES);
      setCategories(res.data?.data || res.data || []);
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error('Failed to load expense categories');
      }
      setCategories([]);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // "source: 'MANUAL'" ensures this is flagged as an ad-hoc expense.
      await api.post(API_ENDPOINTS.ADMIN.EXPENSE.BASE, { ...formData, source: 'MANUAL' });
      toast.success('Manual expense recorded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up border ">
        <div className="flex justify-between items-center p-6  bg-slate-800">
          <h3 className="text-xl font-bold text-white tracking-tight">Log Manual Expense</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
            <select required name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input type="number" required step="0.01" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" required name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select required name="paymentMode" value={formData.paymentMode} onChange={handleChange} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
              <option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="UPI">UPI</option><option value="CHEQUE">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea rows="3" name="description" value={formData.description} onChange={handleChange} placeholder="What was this expense for?" className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-white"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-bold transition-all shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold transition-all shadow-md flex items-center gap-2">{loading && <FaSpinner className="animate-spin" />} Record Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ManualExpenseModal;