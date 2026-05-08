import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaLock, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const ExpenseCategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.EXPENSE.CATEGORIES);
      setCategories(res.data?.data || res.data || []);
    } catch (error) {
      if (error?.response?.status !== 404) {
        toast.error('Failed to fetch categories');
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post(API_ENDPOINTS.ADMIN.EXPENSE.CATEGORIES, newCategory);
      toast.success('Category added successfully');
      setIsAdding(false);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add category');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-black tracking-tight">Master Categories</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md text-sm font-bold"
        >
          <FaPlus /> Add Custom Category
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCategory} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end animate-fade-in">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input required type="text" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="e.g., Infrastructure Setup" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="Optional description..." />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-bold shadow-sm transition-all">Save</button>
          <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-bold shadow-sm transition-all">Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-indigo-600 text-2xl" /></div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.description || '-'}</td>
                  <td className="px-6 py-4">
                    {category.isSystemGenerated ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1.5 w-max">
                        <FaLock className="text-[10px]" /> Core System
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Custom</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {category.isSystemGenerated ? (
                      <button disabled className="text-gray-300 cursor-not-allowed" title="System categories cannot be deleted"><FaTrash /></button>
                    ) : (
                      <button className="text-red-500 hover:text-red-700 transition-colors"><FaTrash /></button>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ExpenseCategoriesTab;